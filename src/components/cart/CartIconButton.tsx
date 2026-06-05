"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartIconButtonProps {
  count: number;
}

export function CartIconButton({ count }: CartIconButtonProps) {
  return (
    <Link
      href="/cart"
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={`Carrito de compras con ${count} items`}
      id="cart-icon-button"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span
          className={cn(
            "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white transition-transform",
            count > 0 && "scale-100",
          )}
          style={{ backgroundColor: "#885200" }}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
