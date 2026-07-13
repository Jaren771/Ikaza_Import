"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

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
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "No autorizado" };
    }
    
    const role = formData.get("role") as any;
    const status = formData.get("status") as any;

    // Obtener el usuario actual y el objetivo
    const currentUserRole = session.user.role;
    const targetUser = await prisma.user.findUnique({ where: { id } });

    if (!targetUser) return { success: false, error: "Usuario no encontrado" };

    // =========================================================================
    // REGLAS DEL SUPER_ADMIN
    // =========================================================================
    // 1. Proteger la cuenta del súper admin actual
    if (targetUser.email === process.env.SUPERADMIN_EMAIL) {
      return { success: false, error: "No se puede modificar la cuenta del Súper Administrador." };
    }

    // 2. Solo un SUPER_ADMIN puede dar el rol de SUPER_ADMIN a otro
    if (role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN") {
      return { success: false, error: "Solo un Súper Admin puede asignar este rol." };
    }

    await prisma.user.update({ where: { id }, data: { role, status } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar usuario" };
  }
}

/**
 * Elimina un usuario — Acción exclusiva de SUPER_ADMIN
 */
export async function deleteUserAction(id: string) {
  try {
    const session = await auth();
    
    // Doble validación estricta de seguridad
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Acción no permitida. Requiere privilegios de Súper Administrador." };
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return { success: false, error: "Usuario no encontrado" };

    if (targetUser.email === process.env.SUPERADMIN_EMAIL) {
      return { success: false, error: "No se puede eliminar la cuenta principal del Súper Administrador." };
    }

    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    
    return { success: true, message: "Usuario eliminado exitosamente" };
  } catch (error) {
    console.error("[deleteUserAction]", error);
    return { success: false, error: "Error interno al eliminar la cuenta" };
  }
}

/**
 * Crea un nuevo administrador — Acción exclusiva de SUPER_ADMIN
 */
export async function createAdminAction(formData: FormData) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Acción no permitida. Solo el Súper Admin puede crear cuentas." };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !name) {
      return { success: false, error: "Todos los campos son obligatorios" };
    }

    // Verificar si el correo ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "El correo electrónico ya está registrado." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: new Date(),
        // Se crean carrito y wishlist por si acaso (para mantener integridad con NextAuth events)
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "Administrador creado exitosamente" };
  } catch (error) {
    console.error("[createAdminAction]", error);
    return { success: false, error: "Error al crear el usuario" };
  }
}
