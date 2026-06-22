"use server";
import { prisma } from "@/lib/prisma";

export async function getReportsData() {
  try {
    // Reporte de Ventas Recientes (Últimos 10 pedidos completados)
    const recentSales = await prisma.order.findMany({
      where: { status: { notIn: ["CANCELLED", "REFUNDED", "PENDING"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: true }
    });

    // Reporte de Productos con Stock Bajo
    const lowStockProducts = await prisma.inventory.findMany({
      where: { quantity: { lte: 10 } },
      include: { product: true },
      take: 10,
      orderBy: { quantity: "asc" }
    });

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify({ recentSales, lowStockProducts }))
    };
  } catch (error) {
    return { success: false, error: "Error al cargar reportes" };
  }
}
