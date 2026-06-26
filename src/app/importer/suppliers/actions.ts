"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sanitizeValue } from "@/lib/validation-utils";

export async function getSuppliers() {
  try {
    const data = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error al cargar proveedores" };
  }
}

export async function createSupplier(formData: FormData) {
  try {
    const name = sanitizeValue(formData.get("name") as string);
    const email = sanitizeValue(formData.get("email") as string);
    const phone = sanitizeValue(formData.get("phone") as string);
    const country = sanitizeValue(formData.get("country") as string);
    
    await prisma.supplier.create({
      data: { name, email, phone, country }
    });
    revalidatePath("/importer/suppliers");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al crear" };
  }
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({ where: { id } });
    revalidatePath("/importer/suppliers");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar" };
  }
}
