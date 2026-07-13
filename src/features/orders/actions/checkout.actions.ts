"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paymentService } from "@/services/payment/PaymentService";
import type { ActionResult } from "@/types";
import { redirect } from "next/navigation";
import { waitUntil } from "@vercel/functions";
import { sendVerificationEmail, sendOrderReceiptEmail } from "@/lib/email";

export async function processCheckoutAction(data: {
  addressId: string;
  paymentMethod: string;
  snapshot?: any[]; // Snapshot del frontend (Patrón 3)
}): Promise<ActionResult<{ paymentUrl?: string; orderId: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autenticado" };
  }

  try {
    // === INICIO DE TRANSACCIÓN ACID (Patrón 2) CON PREVENCIÓN DE ROLLBACK SILENCIOSO (Patrón 6) ===
    let transactionResult: { order: any; total: number } | null = null;
    let retries = 3;

    while (retries > 0 && !transactionResult) {
      try {
        transactionResult = await prisma.$transaction(async (tx) => {
          // 1. Obtener dirección
          const address = await tx.address.findUnique({
            where: { id: data.addressId },
          });

          if (!address || address.userId !== session.user.id) {
            throw new Error("Dirección inválida o no pertenece al usuario.");
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

          const shipping = subtotal >= 150 ? 0 : 15;
          const total = subtotal + shipping;

          // 5. Crear la Orden (Transaction bound)
          const order = await tx.order.create({
            data: {
              userId: session.user.id,
              addressId: address.id,
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

    // 7. Integración de pago (Fuera del candado de DB para no bloquear la tabla durante la red)
    
    // PATRÓN 5: Ejecución Background Serverless (Recibo Fantasma)
    waitUntil(
      sendOrderReceiptEmail(session.user.email!, order.id, total, order.items)
    );

    if (data.paymentMethod === "TRANSFER") {
      return { success: true, data: { orderId: order.id } };
    }

    const intent = await paymentService.createPaymentIntent(data.paymentMethod, {
      orderId: order.id,
      amount: total,
      currency: "PEN",
      description: `Pedido ikaZa Import #${order.id}`,
      customerEmail: session.user.email!,
      customerName: session.user.name ?? "Cliente",
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
