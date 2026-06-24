"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/features/auth/validators/auth.schema";
import { registerAction, loginWithGoogleAction } from "@/features/auth/actions/auth.actions";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

// =============================================================================
// Página de Registro — Basado en wireframe "Registro - ikaZa Import"
// =============================================================================

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [registered, setRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false },
  });

  const onSubmit = (data: RegisterInput) => {
    startTransition(async () => {
      const result = await registerAction(data);

      if (!result.success) {
        toast.error(result.error);
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof RegisterInput, { message: messages[0] });
          });
        }
        return;
      }

      setRegistered(true);
      toast.success("¡Cuenta creada exitosamente!");
    });
  };

  if (registered) {
    return (
      <div className="text-center fade-in">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16" style={{ color: "#006065" }} />
        </div>
        <h1 className="font-headline text-2xl font-bold mb-2">¡Cuenta creada!</h1>
        <p className="text-muted-foreground mb-6">
          Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión.
        </p>
        <Link
          href="/login"
          className="btn-ikaza-primary px-8 py-3"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">Crear cuenta</h1>
        <p className="text-muted-foreground mt-2">
          Únete a miles de clientes satisfechos
        </p>
      </div>

      {/* Google OAuth */}
      <button
        onClick={() => { setIsGooglePending(true); loginWithGoogleAction(); }}
        disabled={isGooglePending || isPending}
        id="google-register-btn"
        className="w-full flex items-center justify-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-medium transition-all hover:bg-muted disabled:opacity-50 mb-5"
      >
        {isGooglePending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        Registrarse con Google
      </button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 text-muted-foreground" style={{ backgroundColor: "#fbf9f8" }}>
            o con tu email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
        {/* Nombre */}
        <div className="space-y-1.5">
          <label htmlFor="reg-name" className="text-sm font-medium">Nombre completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="Tu nombre"
              {...register("name")}
              className="w-full rounded-xl border bg-white pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              style={{ borderColor: errors.name ? "#ba1a1a" : "#bdc9c9" }}
            />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="text-sm font-medium">Correo electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              {...register("email")}
              className="w-full rounded-xl border bg-white pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              style={{ borderColor: errors.email ? "#ba1a1a" : "#bdc9c9" }}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {/* Teléfono (opcional) */}
        <div className="space-y-1.5">
          <label htmlFor="reg-phone" className="text-sm font-medium">
            Teléfono <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+51 999 999 999"
              {...register("phone")}
              className="w-full rounded-xl border bg-white pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              style={{ borderColor: "#bdc9c9" }}
            />
          </div>
        </div>

        {/* Contraseña */}
        <div className="space-y-1.5">
          <label htmlFor="reg-password" className="text-sm font-medium">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              {...register("password")}
              className="w-full rounded-xl border bg-white pl-10 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              style={{ borderColor: errors.password ? "#ba1a1a" : "#bdc9c9" }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {/* Confirmar contraseña */}
        <div className="space-y-1.5">
          <label htmlFor="reg-confirm" className="text-sm font-medium">Confirmar contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="reg-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              {...register("confirmPassword")}
              className="w-full rounded-xl border bg-white pl-10 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              style={{ borderColor: errors.confirmPassword ? "#ba1a1a" : "#bdc9c9" }}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        {/* Términos */}
        <div className="flex items-start gap-2">
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="terms"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5"
              />
            )}
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
            Acepto los{" "}
            <Link href="/terms" className="font-medium hover:underline" style={{ color: "#006065" }}>
              Términos de Servicio
            </Link>{" "}
            y la{" "}
            <Link href="/privacy" className="font-medium hover:underline" style={{ color: "#006065" }}>
              Política de Privacidad
            </Link>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
        )}

        <button
          type="submit"
          id="register-submit-btn"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: "#006065" }}
        >
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Creando cuenta...</>
          ) : "Crear Cuenta"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold hover:underline" style={{ color: "#006065" }}>
          Iniciar Sesión
        </Link>
      </p>
    </div>
  );
}
