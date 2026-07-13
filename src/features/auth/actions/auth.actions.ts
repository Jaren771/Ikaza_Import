"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/features/auth/validators/auth.schema";
import type { LoginInput, RegisterInput } from "@/features/auth/validators/auth.schema";
import { z } from "zod";
import type { ActionResult } from "@/types";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email";

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

  // 1. Verificación Cloudflare Turnstile (Prevención Bot)
  const isHuman = await verifyTurnstileToken(validation.data.turnstileToken);
  if (!isHuman) {
    return { success: false, error: "Verificación de seguridad fallida. Intenta nuevamente." };
  }

  // 2. Patrón 7: Prevención de Fuerza Bruta (Account Lockout)
  const user = await prisma.user.findUnique({ where: { email: validation.data.email } });
  
  if (user) {
    if (user.status === "PENDING_VERIFICATION") {
      // Generar nuevo OTP y reenviar
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
      
      await prisma.verificationToken.deleteMany({
        where: { identifier: user.email },
      });
      await prisma.verificationToken.create({
        data: { identifier: user.email, token: otpCode, expires },
      });
      
      await sendVerificationEmail(user.email, otpCode);
      
      return { 
        success: true, 
        data: { redirectTo: `/verify-email?email=${encodeURIComponent(user.email)}` },
        message: "Tu cuenta no está verificada. Hemos enviado un nuevo código a tu correo." 
      };
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      // BYPASS DE EMERGENCIA: Si es el Súper Admin usando las credenciales exactas del .env.local, le permitimos pasar (anti-bloqueo por ataques externos)
      const superEmail = process.env.SUPERADMIN_EMAIL;
      const superPass = process.env.SUPERADMIN_PASSWORD;
      const isSuperAdminBypass = superEmail && superPass && validation.data.email === superEmail && validation.data.password === superPass;

      if (!isSuperAdminBypass) {
        const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
        return { success: false, error: `Demasiados intentos fallidos. Intenta de nuevo en ${minutesLeft} minutos.` };
      }
    }
  }

  try {
    await signIn("credentials", {
      email: validation.data.email,
      password: validation.data.password,
      redirect: false,
    });

    // Login exitoso: Resetear contador de fallos
    if (user && user.failedLoginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockoutUntil: null },
      });
    }

    return { success: true, data: { redirectTo: "/" } };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        // Incrementar fallos
        if (user) {
          const newFailures = user.failedLoginAttempts + 1;
          const isLocked = newFailures >= 5;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: newFailures,
              lockoutUntil: isLocked ? new Date(Date.now() + 15 * 60 * 1000) : null, // 15 minutos
            },
          });
          if (isLocked) {
             return { success: false, error: "Cuenta bloqueada temporalmente por seguridad. Intenta en 15 minutos." };
          }
        }
        return { success: false, error: "Email o contraseña incorrectos" };
      }
      return { success: false, error: "Error de autenticación" };
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

  // 1. Verificación Cloudflare Turnstile (Prevención Bot)
  const isHuman = await verifyTurnstileToken(validation.data.turnstileToken);
  if (!isHuman) {
    return { success: false, error: "Verificación de seguridad fallida. Intenta nuevamente." };
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

    // Generar OTP de 6 dígitos
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Crear usuario en estado PENDING_VERIFICATION
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "CUSTOMER",
        status: "PENDING_VERIFICATION", // Cambiado de ACTIVE a PENDING_VERIFICATION
        // Crear carrito y wishlist automáticamente
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });

    // Guardar token
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email,
          token: otpCode,
        },
      },
      update: { token: otpCode, expires },
      create: { identifier: email, token: otpCode, expires },
    });

    // Enviar correo (SMTP)
    await sendVerificationEmail(email, otpCode);

    return { success: true, data: { email }, message: "Código enviado a tu correo" };
  } catch (error) {
    console.error("[registerAction]", error);
    return { success: false, error: "Error al crear la cuenta" };
  }
}

/**
 * Validar el código de verificación del correo (OTP)
 */
const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function verifyEmailAction(
  data: z.infer<typeof verifySchema>
): Promise<ActionResult<{ redirectTo: string }>> {
  const validation = verifySchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: "Datos inválidos" };
  }

  const { email, code } = validation.data;

  try {
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: { identifier: email, token: code },
    });

    if (!tokenRecord) {
      return { success: false, error: "Código inválido o incorrecto" };
    }

    if (tokenRecord.expires < new Date()) {
      return { success: false, error: "El código ha expirado" };
    }

    // Activar usuario y recuperar su nombre
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });

    // Enviar correo de bienvenida ahora que ya está verificado
    await sendWelcomeEmail(email, updatedUser.name || "Importador");

    // Borrar token usado
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return { success: true, data: { redirectTo: "/login" }, message: "Cuenta activada con éxito" };
  } catch (error) {
    console.error("[verifyEmailAction]", error);
    return { success: false, error: "Error validando el código" };
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

    // Generar código OTP de 6 dígitos
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await prisma.passwordResetToken.upsert({
      where: { token },
      create: { email, token, expires },
      update: { email, expires },
    });

    // TODO: Enviar email con Resend
    // await emailService.sendPasswordReset(email, token);
    await sendPasswordResetEmail(email, token);

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

/**
 * Restablecer contraseña con token
 */
const resetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
  token: z.string().min(6, "Código requerido").max(6),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export async function resetPasswordAction(
  data: z.infer<typeof resetPasswordSchema>
): Promise<ActionResult<{ redirectTo: string }>> {
  const validation = resetPasswordSchema.safeParse(data);
  
  if (!validation.success) {
    return { success: false, error: "Datos inválidos" };
  }

  const { email, token, password } = validation.data;

  try {
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.email !== email || resetRecord.expires < new Date()) {
      return { success: false, error: "El código es inválido o ha expirado" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Actualizar contraseña y eliminar token
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetRecord.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { token },
      }),
    ]);

    return { 
      success: true, 
      data: { redirectTo: "/login" }, 
      message: "Contraseña actualizada exitosamente" 
    };
  } catch (error) {
    console.error("[resetPasswordAction]", error);
    return { success: false, error: "Error al restablecer contraseña" };
  }
}
