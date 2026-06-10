import { auth } from "@/lib/auth.edge";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// =============================================================================
// Middleware — Protección de Rutas con RBAC
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

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  const isImporterRoute = IMPORTER_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
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
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
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
