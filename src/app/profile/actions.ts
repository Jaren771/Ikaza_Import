"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sanitizeValue } from "@/lib/validation-utils";
import { auth } from "@/lib/auth";

export async function getUserProfile() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Debes iniciar sesión para ver tu perfil." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            addresses: true,
            orders: true,
          },
        },
      },
    });

    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: "Error al cargar el perfil." };
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "No autorizado" };

    const name = sanitizeValue(formData.get("name") as string);
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name }
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar perfil." };
  }
}
