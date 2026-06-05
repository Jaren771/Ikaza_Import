import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCartAction } from "@/features/orders/actions/cart.actions";
import { CartContent } from "@/components/cart/CartContent";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrito de Compras",
};

// =============================================================================
// Página de Carrito
// Basado en wireframe "Carrito de Compras - ikaZa Import"
// =============================================================================

export default async function CartPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/cart");
  }

  const cart = await getCartAction();

  return (
    <div className="ikaza-container py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/catalog"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Seguir comprando
        </Link>
      </div>

      <h1 className="font-headline text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
        <ShoppingCart className="h-7 w-7" style={{ color: "#006065" }} />
        Carrito de Compras
        {cart && cart.items.length > 0 && (
          <span className="text-lg font-normal text-muted-foreground">
            ({cart.items.length} {cart.items.length === 1 ? "artículo" : "artículos"})
          </span>
        )}
      </h1>

      {!cart || cart.items.length === 0 ? (
        /* Carrito vacío */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full mb-4"
            style={{ backgroundColor: "#efeded" }}>
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="font-headline text-xl font-semibold mb-2">Tu carrito está vacío</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Explora nuestro catálogo y añade los productos que te gusten
          </p>
          <Link
            href="/catalog"
            className="btn-ikaza-primary px-8 py-3"
            id="empty-cart-cta"
          >
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <CartContent cart={cart} />
      )}
    </div>
  );
}
