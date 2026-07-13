"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Suspense } from "react";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || code.length !== 6) {
      toast.error("Por favor, ingresa el correo y el código de 6 dígitos.");
      return;
    }

    startTransition(async () => {
      // Iniciar sesión directamente con el código OTP
      const result = await signIn("credentials", {
        email,
        otpCode: code,
        redirect: false, // Evitar recarga automática para manejar el toast
      });

      if (result?.error) {
        toast.error("El código es inválido o ha expirado.");
        return;
      }

      toast.success("¡Cuenta activada y sesión iniciada!");
      router.push("/");
      router.refresh();
    });
  };

  return (
    <div className="fade-in max-w-md mx-auto w-full">
      <div className="mb-8 text-center">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "#f4f6f6", color: "#006065" }}>
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="font-headline text-3xl font-bold">Verifica tu correo</h1>
        <p className="text-muted-foreground mt-3">
          Hemos enviado un código de 6 dígitos a <br />
          <strong className="text-foreground">{email || "tu correo"}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">Correo electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-xl border bg-white pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              style={{ borderColor: "#bdc9c9" }}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="code" className="text-sm font-medium">Código de verificación</label>
          <input
            id="code"
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="000000"
            className="w-full rounded-xl border bg-white px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:ring-2 focus:ring-ring/20"
            style={{ borderColor: "#006065", color: "#006065" }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isPending || code.length !== 6 || !email}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: "#006065" }}
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Verificando...
            </>
          ) : (
            "Activar mi cuenta"
          )}
        </button>
      </form>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
