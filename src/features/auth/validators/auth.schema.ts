import { z } from "zod";
import { safeString } from "@/lib/validation-utils";

const emailSchema = z
  .string()
  .min(1, "El email es requerido")
  .max(100, "El email es demasiado largo")
  .email("Ingresa un correo electrónico válido (ej: usuario@dominio.com)")
  .transform((v) => v.trim().toLowerCase());

const phoneSchema = z
  .string()
  .regex(/^[0-9]{9}$/, "El teléfono debe tener exactamente 9 números")
  .max(9)
  .optional()
  .or(z.literal(""));

// =============================================================================
// ikaZa Import — Validadores de Autenticación
// =============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: safeString({ min: 8, max: 32, label: "La contraseña" }),
});

export const registerSchema = z
  .object({
    name: safeString({ min: 2, max: 100, label: "El nombre" }),
    email: emailSchema,
    password: safeString({ min: 8, max: 32, label: "La contraseña" }).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Debe contener mayúsculas, minúsculas y números"
    ),
    confirmPassword: safeString({ min: 1, max: 32, label: "Confirma tu contraseña" }),
    phone: phoneSchema,
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, "Debes aceptar los términos"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Debe contener mayúsculas, minúsculas y números"
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    token: z.string().min(1, "Token requerido"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
