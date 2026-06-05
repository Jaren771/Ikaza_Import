import Link from "next/link";
import { ShoppingCart, Heart, User, Search, Menu, Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { MobileMenu } from "./MobileMenu";
import { CartIconButton } from "../cart/CartIconButton";
import { UserMenu } from "../shared/UserMenu";
import { SearchBar } from "../catalog/SearchBar";

// =============================================================================
// Header — Componente Server (los datos se cargan en servidor)
// Estructura basada en wireframe Stitch: Logo | Search | Actions
// =============================================================================

async function getCartItemCount(userId: string) {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { _count: { select: { items: true } } },
    });
    return cart?._count.items ?? 0;
  } catch (error) {
    console.error("DB connection error in getCartItemCount:", error);
    return 0; // Fallback gracefully
  }
}

export async function Header() {
  const session = await auth();
  const cartCount = session?.user?.id
    ? await getCartItemCount(session.user.id)
    : 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="ikaza-container">
        {/* Top bar */}
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #006065, #0d7a80)" }}>
              <Package className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-headline text-xl font-bold" style={{ color: "#006065" }}>
                ikaZa
              </span>
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                Import
              </span>
            </div>
          </Link>

          {/* Search Bar — centro */}
          <div className="flex-1 max-w-xl mx-auto">
            <SearchBar />
          </div>

          {/* Acciones — derecha */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Lista de deseos"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Carrito */}
            <CartIconButton count={cartCount} />

            {/* Usuario */}
            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#006065" }}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:block">Ingresar</span>
              </Link>
            )}

            {/* Mobile menu */}
            <MobileMenu isLoggedIn={!!session?.user} />
          </div>
        </div>

        {/* Navigation bar — categorías */}
        <nav className="hidden md:flex items-center gap-6 py-2 border-t border-border/50 overflow-x-auto">
          <Link
            href="/catalog"
            className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Todo el Catálogo
          </Link>
          <Link
            href="/catalog?category=hogar"
            className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Hogar
          </Link>
          <Link
            href="/catalog?category=cocina"
            className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Cocina
          </Link>
          <Link
            href="/catalog?category=tecnologia"
            className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Tecnología
          </Link>
          <Link
            href="/catalog?category=decoracion"
            className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Decoración
          </Link>
          <Link
            href="/catalog?category=jardin"
            className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Jardín
          </Link>
          <Link
            href="/catalog?isFeatured=true"
            className="whitespace-nowrap text-sm font-semibold transition-colors"
            style={{ color: "#885200" }}
          >
            ✦ Ofertas
          </Link>
        </nav>
      </div>
    </header>
  );
}
