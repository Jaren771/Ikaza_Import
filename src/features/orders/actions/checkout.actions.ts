"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paymentService } from "@/services/payment/PaymentService";
import type { ActionResult } from "@/types";
import { redirect } from "next/navigation";
import { waitUntil } from "@vercel/functions";
import { sendVerificationEmail, sendOrderReceiptEmail } from "@/lib/email";

import { SunatService } from "@/services/sunat/SunatService";

export async function processCheckoutAction(data: {
  shippingMethod: "DELIVERY" | "PICKUP";
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  paymentMethod: string;
  paymentToken?: string; // Token de Culqi
  receiptType: "BOLETA" | "FACTURA";
  documentNumber: string;
  customerName: string;
  customerEmail: string;
  snapshot?: any[]; // Snapshot del frontend (Patrón 3)
}): Promise<ActionResult<{ paymentUrl?: string; orderId: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autenticado" };
  }

  // Validaciones básicas
  if (data.shippingMethod === "DELIVERY") {
    if (!data.shippingStreet || !data.shippingCity || !data.shippingState) {
      return { success: false, error: "Por favor complete todos los campos de su dirección de envío" };
    }
  }
  if (!data.documentNumber || !data.customerName || !data.customerEmail) {
    return { success: false, error: "Datos de facturación incompletos" };
  }

  try {
    // === INICIO DE TRANSACCIÓN ACID (Patrón 2) CON PREVENCIÓN DE ROLLBACK SILENCIOSO (Patrón 6) ===
    let transactionResult: { order: any; total: number } | null = null;
    let retries = 3;

    while (retries > 0 && !transactionResult) {
      try {
        transactionResult = await prisma.$transaction(async (tx) => {
          // 1. Obtener dirección si es Delivery
          let address = null;
          if (data.shippingMethod === "DELIVERY") {
            // Creamos la dirección al vuelo para este usuario
            address = await tx.address.create({
              data: {
                userId: session.user.id,
                firstName: data.customerName,
                lastName: "",
                street: data.shippingStreet!,
                city: data.shippingCity!,
                state: data.shippingState!,
                country: "Perú",
                isDefault: false,
              }
            });
          }

          // 2. Obtener el carrito REAL de la Base de Datos
          const cart = await tx.cart.findUnique({
            where: { userId: session.user.id },
            include: {
              items: { include: { product: true } },
            },
          });

          if (!cart || cart.items.length === 0) {
            throw new Error("El carrito de compras está vacío.");
          }

          // 3. Validar Snapshot y Patrón 4 (BOGO)
          let subtotal = 0;
          const isBogoActive = cart.appliedCouponCode?.toUpperCase() === "2X1"; // O lógica dinámica

          for (const item of cart.items) {
            const inventory = await tx.inventory.findUnique({
              where: { productId: item.productId },
            });

            const availableStock = (inventory?.quantity ?? 0) - (inventory?.reservedQuantity ?? 0);
            if (availableStock < item.quantity) {
              throw new Error(`Stock insuficiente para el producto: ${item.product.name}`);
            }

            // PATRÓN 4: Lógica de Cupones BOGO (Anular rebaja)
            // Si el BOGO está activo, cobramos el precio base original, no el precio rebajado
            const realPrice = isBogoActive && item.basePrice 
              ? Number(item.basePrice) 
              : Number(item.product.price);
            
            // Anti-Tampering (Validación de precio snapshot)
            if (data.snapshot) {
              const snapshotItem = data.snapshot.find((s: any) => s.productId === item.productId);
              if (snapshotItem && snapshotItem.price !== realPrice) {
                 throw new Error(`El precio de ${item.product.name} ha cambiado. Por favor actualiza tu carrito.`);
              }
            }

            subtotal += realPrice * item.quantity;

            // 4. Actualizar inventario (Reservar stock)
            await tx.inventory.update({
              where: { productId: item.productId },
              data: { reservedQuantity: { increment: item.quantity } },
            });
          }

          // Aplicar descuento BOGO (matemáticamente)
          if (isBogoActive) {
            // Ejemplo básico: Descontar 50% del subtotal si es 2x1
            subtotal = subtotal / 2;
          }

          // ==========================================
          // CÁLCULO DINÁMICO DE ENVÍO
          // ==========================================
          let shipping = 0;
          if (data.shippingMethod === "DELIVERY" && address) {
            let totalWeight = 0;
            
            for (const item of cart.items) {
              // Calcular peso real vs volumétrico (ancho x alto x largo / 5000)
              const realW = Number(item.product.weight || 0);
              const w = Number(item.product.width || 0);
              const h = Number(item.product.height || 0);
              const d = Number(item.product.depth || 0);
              const volW = (w * h * d) / 5000;
              const maxW = Math.max(realW, volW) || 1; // Mínimo 1kg por item si no hay datos
              
              totalWeight += maxW * item.quantity;
            }

            // Lógica de distancia base (Local vs Nacional)
            const isLocal = address.state?.toLowerCase() === "lima" || address.city?.toLowerCase() === "lima";
            const baseRate = isLocal ? 10 : 20; // 10 soles local, 20 nacional
            const extraWeightRate = totalWeight > 2 ? (totalWeight - 2) * 3 : 0; // 3 soles por kg extra después de 2kg

            shipping = baseRate + extraWeightRate;
            
            // Envío gratis si el subtotal supera 150 (opcional, lo dejamos si es local)
            if (subtotal >= 150 && isLocal) {
              shipping = 0;
            }
          }

          const total = subtotal + shipping;

          // 5. Crear la Orden (Transaction bound)
          const order = await tx.order.create({
            data: {
              userId: session.user.id,
              addressId: address?.id,
              shippingMethod: data.shippingMethod,
              receiptType: data.receiptType,
              documentNumber: data.documentNumber,
              customerName: data.customerName,
              customerEmail: data.customerEmail,
              subtotal,
              shippingAmount: shipping,
              taxAmount: 0,
              total,
              status: "PENDING",
              paymentStatus: "PENDING",
              items: {
                create: cart.items.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice: isBogoActive && item.basePrice ? Number(item.basePrice) : Number(item.product.price),
                  totalPrice: (isBogoActive && item.basePrice ? Number(item.basePrice) : Number(item.product.price)) * item.quantity,
                  productName: item.product.name,
                  productSku: item.product.sku,
                })),
              },
            },
            include: { items: true },
          });

          // 6. Vaciar carrito de la DB y limpiar cupón
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
          await tx.cart.update({ where: { id: cart.id }, data: { appliedCouponCode: null } });

          return { order, total };
        }, {
          maxWait: 5000,
          timeout: 10000, 
        });
      } catch (txError: any) {
        retries -= 1;
        if (retries === 0 || txError.message.includes("inválida") || txError.message.includes("Stock") || txError.message.includes("precio")) {
          throw txError; // Errores de negocio no se reintentan, solo bloqueos de DB
        }
        // Esperar 150ms progresivo antes del reintento (Patrón 6)
        await new Promise((resolve) => setTimeout(resolve, 150 * (3 - retries)));
      }
    }

    if (!transactionResult) {
      throw new Error("El sistema está experimentado alta demanda. Intenta de nuevo.");
    }

    const { order, total } = transactionResult;

    // 7. Integración de pago y SUNAT
    
    if (data.paymentMethod === "TRANSFER") {
      // PATRÓN 5: Ejecución Background
      waitUntil(
        sendOrderReceiptEmail(data.customerEmail, order.id, total, order.items)
      );
      return { success: true, data: { orderId: order.id } };
    }

    if (data.paymentMethod === "CULQI" && data.paymentToken) {
      // Crear cargo en Culqi
      const chargeResult = await paymentService.createCulqiCharge(total, data.paymentToken, data.customerEmail);
      
      if (!chargeResult.success) {
        await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
        return { success: false, error: chargeResult.error };
      }

      // Actualizar a pagado
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" } });

      // Generar Comprobante en SUNAT en Background
      waitUntil(
        SunatService.generateDocument(order).then(async (docResult) => {
          let pdfUrl = undefined;
          if (docResult.success && docResult.pdf) {
            pdfUrl = docResult.pdf;
          }
          // Enviar email con el PDF (si se generó)
          await sendOrderReceiptEmail(data.customerEmail, order.id, total, order.items, pdfUrl);
        }).catch(async (e) => {
          console.error("Error generando comprobante Sunat", e);
          // Si falla SUNAT, enviamos el correo normal de todas formas
          await sendOrderReceiptEmail(data.customerEmail, order.id, total, order.items);
        })
      );

      return { success: true, data: { orderId: order.id } };
    }

    // MercadoPago u otros (flujo con redirección)
    const intent = await paymentService.createPaymentIntent(data.paymentMethod, {
      orderId: order.id,
      amount: total,
      currency: "PEN",
      description: `Pedido ikaZa Import #${order.id}`,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
    });

    return { 
      success: true, 
      data: { 
        orderId: order.id, 
        paymentUrl: intent.paymentUrl ?? `/checkout/payment?orderId=${order.id}&secret=${intent.clientSecret}` 
      } 
    };

  } catch (error: any) {
    console.error("[processCheckoutAction]", error);
    // El rollback de BD ocurre automáticamente si throw Error dentro de prisma.$transaction
    return { success: false, error: error.message || "Error procesando el pedido" };
  }
}
