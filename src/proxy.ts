import { auth } from "@/lib/auth.edge";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";

// =============================================================================
// Middleware — RBAC + Rate Limiting + Payload Check (AGENTS.md Patrones 10 y 11)
// =============================================================================

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  "/profile",
  "/orders",
  "/wishlist",
  "/checkout",
  "/admin",
  "/importer",
];

// Rutas solo para administradores
const ADMIN_ROUTES = ["/admin"];

// Rutas solo para gestores de importación
const IMPORTER_ROUTES = ["/importer"];

// Rutas solo para usuarios NO autenticados
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

// Rutas de autenticación (rate limit estricto: 10 req / 15 min por IP)
const AUTH_RATE_LIMITED = new Set(["/api/auth", "/login", "/register", "/reset-password", "/verify-email"]);

// Rate limiters (Patrón 10 — solo si Redis está disponible)
const authRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "15 m"), prefix: "rl:auth" })
  : null;

const globalRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "1 m"), prefix: "rl:global" })
  : null;

export default auth(async (req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const pathname = nextUrl.pathname;
  const method = req.method;

  // =========================================================================
  // Patrón 11: Validación de Tamaño de Payload (Anti-DoS)
  // =========================================================================
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 2 * 1024 * 1024) {
    return new NextResponse(
      JSON.stringify({ error: "Payload demasiado grande. Máximo 2MB." }),
      { status: 413, headers: { "Content-Type": "application/json" } }
    );
  }

  // =========================================================================
  // Patrón 10: Rate Limiting — SOLO para escrituras (Error Real #4)
  // Los GETs NO tocan Redis; están protegidos por el Escudo L1.
  // =========================================================================
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

  const isAuthEndpoint = AUTH_RATE_LIMITED.has(pathname);

  if (isAuthEndpoint && method === "POST" && authRateLimit) {
    const { success } = await authRateLimit.limit(`auth::${ip}::${pathname}`);
    if (!success) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera 15 minutos." },
        { status: 429 }
      );
    }
  } else if (["POST", "PUT", "DELETE", "PATCH"].includes(method) && globalRateLimit) {
    // Rate limit general solo para mutaciones, nunca para GETs
    const { success } = await globalRateLimit.limit(`global::${ip}::${pathname}`);
    if (!success) {
      return NextResponse.json(
        { error: "Demasiadas peticiones. Intenta más tarde." },
        { status: 429 }
      );
    }
  }
  // Los GET simplemente pasan. El Escudo L1 los protege sin costar comandos de Redis.

  // =========================================================================
  // RBAC — Protección de Rutas
  // =========================================================================
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isImporterRoute = IMPORTER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Redirigir usuarios autenticados fuera de rutas de auth
  if (isAuthRoute && isLoggedIn) {
    const redirectUrl =
      userRole === "SUPER_ADMIN" || userRole === "ADMIN"
        ? "/admin"
        : "/";
    return NextResponse.redirect(new URL(redirectUrl, nextUrl));
  }

  // Redirigir a login si no está autenticado
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Control de acceso admin
  if (isAdminRoute && isLoggedIn) {
    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  // Control de acceso importadora
  if (isImporterRoute && isLoggedIn) {
    if (
      userRole !== "SUPER_ADMIN" &&
      userRole !== "ADMIN" &&
      userRole !== "MANAGER"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Aplica middleware a todas las rutas excepto archivos estáticos y API de Next
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
