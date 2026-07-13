"use client";

import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";

interface CartIconButtonProps {
  count?: number; // Opcional, para compatibilidad hacia atrás si es necesario
}

export function CartIconButton({ count: initialCount }: CartIconButtonProps) {
  const { state, dispatch } = useCart();
  const displayCount = state.itemCount > 0 ? state.itemCount : (initialCount || 0);

  return (
    <button
      onClick={() => dispatch({ type: "TOGGLE_CART" })}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={`Carrito de compras con ${displayCount} items`}
      id="cart-icon-button"
    >
      <ShoppingCart className="h-5 w-5" />
      {displayCount > 0 && (
        <span
          className={cn(
            "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white transition-transform",
            displayCount > 0 && "scale-100",
          )}
          style={{ backgroundColor: "#885200" }}
        >
          {displayCount > 99 ? "99+" : displayCount}
        </span>
      )}
    </button>
  );
}
