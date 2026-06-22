"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getBrands() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    return { success: true, data: brands };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return { success: false, error: "Error al cargar marcas" };
  }
}

export async function createBrand(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const description = formData.get("description") as string;

    if (!name) return { success: false, error: "El nombre es obligatorio" };

    const newBrand = await prisma.brand.create({
      data: { name, slug, description },
    });

    revalidatePath("/importer/brands");
    return { success: true, data: newBrand };
  } catch (error) {
    console.error("Error creating brand:", error);
    return { success: false, error: "Error al crear la marca. Verifica que el slug sea único." };
  }
}

export async function updateBrand(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;

    if (!name) return { success: false, error: "El nombre es obligatorio" };

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: { name, slug, description },
    });

    revalidatePath("/importer/brands");
    return { success: true, data: updatedBrand };
  } catch (error) {
    console.error("Error updating brand:", error);
    return { success: false, error: "Error al actualizar la marca." };
  }
}

export async function deleteBrand(id: string) {
  try {
    await prisma.brand.delete({ where: { id } });
    revalidatePath("/importer/brands");
    return { success: true };
  } catch (error) {
    console.error("Error deleting brand:", error);
    return { success: false, error: "Error al eliminar. Asegúrate de que no tenga productos asociados." };
  }
}
