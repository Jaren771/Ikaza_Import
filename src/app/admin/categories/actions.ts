"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { products: true, subcategories: true }
        }
      }
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Error al cargar categorías" };
  }
}

export async function createCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const description = formData.get("description") as string;
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

    if (!name) return { success: false, error: "El nombre es obligatorio" };

    const newCategory = await prisma.category.create({
      data: { name, slug, description, sortOrder },
    });

    revalidatePath("/admin/categories");
    return { success: true, data: newCategory };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Error al crear la categoría. Verifica que el slug sea único." };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

    if (!name) return { success: false, error: "El nombre es obligatorio" };

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, slug, description, sortOrder },
    });

    revalidatePath("/admin/categories");
    return { success: true, data: updatedCategory };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "Error al actualizar la categoría." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Error al eliminar. Asegúrate de que no tenga productos asociados." };
  }
}
