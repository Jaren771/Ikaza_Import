"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/features/auth/actions/auth.actions";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!email) {
    return (
      <div className="text-center fade-in max-w-md mx-auto w-full">
        <h1 className="font-headline text-2xl font-bold mb-4 text-destructive">Acceso denegado</h1>
        <p className="text-muted-foreground mb-8">Debes solicitar el código desde el inicio de sesión.</p>
        <Link href="/login" className="btn-ikaza-primary px-6 py-2" style={{ backgroundColor: "#006065", color: "white", borderRadius: "8px", textDecoration: "none" }}>
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.length !== 6) {
      toast.error("El código debe tener 6 dígitos.");
      return;
    }
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction({ email, token, password });
      
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message || "Contraseña actualizada exitosamente");
      router.push(result.data?.redirectTo || "/login");
      router.refresh();
    });
  };

  return (
    <div className="fade-in max-w-md mx-auto w-full">
      <div className="mb-8 text-center">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "#f4f6f6", color: "#006065" }}>
          <KeyRound className="h-8 w-8" />
        </div>
        <h1 className="font-headline text-3xl font-bold">Ingresa tu código</h1>
        <p className="text-muted-foreground mt-3">
          Enviamos un código de 6 dígitos a <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="token" className="text-sm font-medium">Código de seguridad</label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="123456"
            maxLength={6}
            className="w-full rounded-xl border bg-white px-4 py-3 text-center text-xl tracking-[0.5em] font-bold outline-none focus:ring-2 focus:ring-ring/20"
            style={{ borderColor: "#bdc9c9", letterSpacing: "8px" }}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">Contraseña nueva</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 caracteres"
              minLength={8}
              className="w-full rounded-xl border bg-white pl-10 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              style={{ borderColor: "#bdc9c9" }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || password.length < 8 || token.length !== 6}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: "#006065" }}
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Guardando...
            </>
          ) : (
            "Actualizar contraseña"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
