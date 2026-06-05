"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paymentService } from "@/services/payment/PaymentService";
import type { ActionResult } from "@/types";
import { redirect } from "next/navigation";

export async function processCheckoutAction(data: {
  addressId: string;
  paymentMethod: string;
}): Promise<ActionResult<{ paymentUrl?: string; orderId: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autenticado" };
  }

  try {
    // 1. Obtener carrito
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Carrito vacío" };
    }

    // 2. Calcular totales
    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const shipping = subtotal >= 150 ? 0 : 15;
    const total = subtotal + shipping;

    // 3. Obtener dirección
    const address = await prisma.address.findUnique({
      where: { id: data.addressId },
    });

    if (!address || address.userId !== session.user.id) {
      return { success: false, error: "Dirección inválida" };
    }

    // 4. Crear orden
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        addressId: address.id,
        subtotal,
        shipping,
        tax: 0,
        total,
        status: "PENDING",
        paymentStatus: "PENDING",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            productName: item.product.name,
          })),
        },
      },
    });

    // 5. Vaciar carrito
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // 6. Integración de pago
    // Por ahora simulamos si es transferencia o generamos el intent si es pasarela
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

  } catch (error) {
    console.error("[processCheckoutAction]", error);
    return { success: false, error: "Error procesando el pedido" };
  }
}
