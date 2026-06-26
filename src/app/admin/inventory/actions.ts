"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sanitizeValue } from "@/lib/validation-utils";
import { MovementType } from "@prisma/client";

export async function getInventory() {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: {
          select: { name: true, sku: true, status: true, images: { where: { isPrimary: true }, take: 1 } }
        }
      },
      orderBy: { product: { name: "asc" } }
    });
    return { success: true, data: inventory };
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return { success: false, error: "Error al cargar el inventario" };
  }
}

export async function getInventoryMovements(inventoryId: string) {
  try {
    const movements = await prisma.inventoryMovement.findMany({
      where: { inventoryId },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    return { success: true, data: movements };
  } catch (error) {
    return { success: false, error: "Error al cargar movimientos" };
  }
}

export async function adjustInventory(inventoryId: string, formData: FormData) {
  try {
    const type = formData.get("type") as MovementType;
    const quantity = parseInt(formData.get("quantity") as string);
    const reason = sanitizeValue(formData.get("reason") as string);
    
    if (isNaN(quantity) || quantity <= 0) {
      return { success: false, error: "La cantidad debe ser mayor a 0" };
    }

    // Ejecutar en transacción para asegurar integridad
    await prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findUnique({ where: { id: inventoryId } });
      if (!inv) throw new Error("Inventario no encontrado");

      let newQuantity = inv.quantity;
      if (type === "IN" || type === "RETURNED") newQuantity += quantity;
      else if (type === "OUT" || type === "ADJUSTMENT") newQuantity -= quantity;

      if (newQuantity < 0) throw new Error("El stock no puede ser negativo");

      await tx.inventory.update({
        where: { id: inventoryId },
        data: { quantity: newQuantity }
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryId,
          type,
          quantity,
          reason,
          createdBy: "Admin" // TODO: Obtener del usuario en sesión
        }
      });
    });

    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error: any) {
    console.error("Error adjusting inventory:", error);
    return { success: false, error: error.message || "Error al ajustar inventario" };
  }
}

export async function updateMinStock(inventoryId: string, formData: FormData) {
  try {
    const minStock = parseInt(formData.get("minStock") as string);
    if (isNaN(minStock) || minStock < 0) return { success: false, error: "Valor inválido" };

    await prisma.inventory.update({
      where: { id: inventoryId },
      data: { minStock }
    });
    
    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar stock mínimo" };
  }
}
