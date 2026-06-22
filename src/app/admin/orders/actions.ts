"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true }
    });
    // Serializar para Decimal
    const safeOrders = JSON.parse(JSON.stringify(orders));
    return { success: true, data: safeOrders };
  } catch (error) {
    return { success: false, error: "Error al cargar pedidos" };
  }
}

export async function updateOrderStatus(id: string, formData: FormData) {
  try {
    const status = formData.get("status") as any;
    await prisma.order.update({ where: { id }, data: { status } });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar pedido" };
  }
}

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar pedido" };
  }
}
