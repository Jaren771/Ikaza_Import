"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: "Error al cargar usuarios" };
  }
}

export async function updateUserRole(id: string, formData: FormData) {
  try {
    const role = formData.get("role") as any;
    const status = formData.get("status") as any;
    await prisma.user.update({ where: { id }, data: { role, status } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar usuario" };
  }
}
