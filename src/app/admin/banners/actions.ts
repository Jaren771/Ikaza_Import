"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sanitizeValue } from "@/lib/validation-utils";

export async function getBanners() {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
    return { success: true, data: JSON.parse(JSON.stringify(banners)) };
  } catch (error) {
    return { success: false, error: "Error al cargar banners" };
  }
}

export async function createBanner(formData: FormData) {
  try {
    const title = sanitizeValue(formData.get("title") as string);
    const image = formData.get("image") as string;
    const link = formData.get("link") as string;
    const position = formData.get("position") as string;
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
    
    await prisma.banner.create({
      data: { title, image, link, position, sortOrder }
    });
    revalidatePath("/admin/banners");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al crear banner" };
  }
}

export async function deleteBanner(id: string) {
  try {
    await prisma.banner.delete({ where: { id } });
    revalidatePath("/admin/banners");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar" };
  }
}
