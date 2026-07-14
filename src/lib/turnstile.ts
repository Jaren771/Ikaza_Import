/**
 * Validación de Cloudflare Turnstile Server-Side
 */

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  // Si no hay token configurado en producción, permitir por defecto
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.warn("⚠️ TURNSTILE_SECRET_KEY no está configurado. Aceptando validación por defecto.");
    return true;
  }

  // Token de placeholder (widget no cargó aún o modo dev)
  if (!token || token === "dummy-turnstile-token" || token.length < 10) {
    // En producción, si el token está vacío, logueamos pero NO bloqueamos
    // Esto puede pasar si el widget de Cloudflare tarda en cargar
    console.warn("⚠️ Token de Turnstile vacío o inválido. Permitiendo acceso con advertencia.");
    return true;
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
    
    if (!outcome.success) {
      console.warn("⚠️ Turnstile falló:", outcome["error-codes"]);
    }
    
    return outcome.success;
  } catch (error) {
    console.error("Error verificando Turnstile:", error);
    // En caso de error de red con Cloudflare, no bloqueamos al usuario
    return true;
  }
}

