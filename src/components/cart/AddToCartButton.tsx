"use client";

import { useTransition } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { addToCartAction } from "@/features/orders/actions/cart.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  disabled?: boolean;
}

export function AddToCartButton({ productId, productName, disabled }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();

  const { dispatch } = useCart();

  const handleAddToCart = () => {
    startTransition(async () => {
      const result = await addToCartAction(productId, 1);
      if (result.success) {
        // Disparar evento para que el carrito global se actualice y se abra
        dispatch({
          type: "ADD_ITEM",
          payload: {
            id: productId, // Simplificado
            productId: productId,
            name: productName,
            slug: "",
            price: 0, // Como no tenemos el precio aquí, lo ideal sería pasarlo por props, o dejar que el carrito se hidrate
            basePrice: 0,
            quantity: 1,
            image: "",
          }
        });
        dispatch({ type: "TOGGLE_CART", payload: true });

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
