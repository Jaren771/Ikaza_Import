"use client";

import { useTransition } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { addToCartAction } from "@/features/orders/actions/cart.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  disabled?: boolean;
}

export function AddToCartButton({ productId, productName, disabled }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = () => {
    startTransition(async () => {
      const result = await addToCartAction(productId, 1);
      if (result.success) {
        toast.success("Añadido al carrito", {
          description: productName,
          action: {
            label: "Ver carrito",
            onClick: () => (window.location.href = "/cart"),
          },
        });
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isPending || disabled}
      id="product-add-to-cart-btn"
      className={cn(
        "btn-ikaza-cart flex-1 flex items-center justify-center gap-2 py-2.5",
        (isPending || disabled) && "opacity-50 cursor-not-allowed"
      )}
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <ShoppingCart className="h-5 w-5" />
      )}
      {isPending ? "Añadiendo..." : disabled ? "Sin stock" : "Añadir al carrito"}
    </button>
  );
}
