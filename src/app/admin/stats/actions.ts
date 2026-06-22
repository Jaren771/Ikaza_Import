"use server";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    const orders = await prisma.order.findMany({
      select: { total: true, status: true, createdAt: true }
    });
    
    const usersCount = await prisma.user.count();
    const productsCount = await prisma.product.count({ where: { status: "ACTIVE" } });
    
    const totalRevenue = orders.filter(o => o.status !== "CANCELLED").reduce((acc, curr) => acc + Number(curr.total), 0);
    const totalOrders = orders.length;

    return {
      success: true, 
      data: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders,
        usersCount,
        productsCount
      }
    };
  } catch (error) {
    return { success: false, error: "Error al cargar métricas" };
  }
}
