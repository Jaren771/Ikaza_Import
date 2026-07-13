/**
 * Validación de Cloudflare Turnstile Server-Side
 */

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.warn("⚠️ TURNSTILE_SECRET_KEY no está configurado. Aceptando validación por defecto.");
    return true; // Fallback para dev si no hay token
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      body: formData,
      method: "POST",
    });

    const outcome = await result.json();
    return outcome.success;
  } catch (error) {
    console.error("Error verificando Turnstile:", error);
    return false;
  }
}
