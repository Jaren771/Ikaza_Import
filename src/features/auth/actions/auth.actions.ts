"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/features/auth/validators/auth.schema";
import type { LoginInput, RegisterInput } from "@/features/auth/validators/auth.schema";
import type { ActionResult } from "@/types";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

// =============================================================================
// Server Actions — Autenticación
// =============================================================================

/**
 * Iniciar sesión con credenciales
 */
export async function loginAction(
  data: LoginInput
): Promise<ActionResult<{ redirectTo: string }>> {
  const validation = loginSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await signIn("credentials", {
      email: validation.data.email,
      password: validation.data.password,
      redirect: false,
    });

    return { success: true, data: { redirectTo: "/" } };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Email o contraseña incorrectos" };
        default:
          return { success: false, error: "Error de autenticación" };
      }
    }
    // Si llegó aquí es un redirect exitoso
    return { success: true, data: { redirectTo: "/" } };
  }
}

/**
 * Iniciar sesión con Google
 */
export async function loginWithGoogleAction(): Promise<void> {
  await signIn("google", { redirectTo: "/" });
}

/**
 * Registrar nuevo usuario
 */
export async function registerAction(
  data: RegisterInput
): Promise<ActionResult<{ email: string }>> {
  const validation = registerSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password, phone } = validation.data;

  try {
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return { success: false, error: "Este email ya está registrado" };
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario (el evento createUser de NextAuth creará cart y wishlist)
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "CUSTOMER",
        status: "ACTIVE",
        // Crear carrito y wishlist automáticamente
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });

    return { success: true, data: { email }, message: "Cuenta creada exitosamente" };
  } catch (error) {
    console.error("[registerAction]", error);
    return { success: false, error: "Error al crear la cuenta" };
  }
}

/**
 * Cerrar sesión
 */
export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

/**
 * Solicitar recuperación de contraseña
 */
export async function forgotPasswordAction(
  data: unknown
): Promise<ActionResult<null>> {
  const validation = forgotPasswordSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: "Email inválido" };
  }

  const { email } = validation.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // No revelar si el email existe o no (seguridad)
    if (!user) {
      return {
        success: true,
        data: null,
        message: "Si el email existe, recibirás un correo de recuperación",
      };
    }

    // Generar token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await prisma.passwordResetToken.upsert({
      where: { token },
      create: { email, token, expires },
      update: { expires },
    });

    // TODO: Enviar email con Resend
    // await emailService.sendPasswordReset(email, token);

    return {
      success: true,
      data: null,
      message: "Si el email existe, recibirás un correo de recuperación",
    };
  } catch (error) {
    console.error("[forgotPasswordAction]", error);
    return { success: false, error: "Error al procesar la solicitud" };
  }
}
