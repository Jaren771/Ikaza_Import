"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, Tag, ArrowRight, Loader2 } from "lucide-react";
import { updateCartItemAction, removeFromCartAction, clearCartAction } from "@/features/orders/actions/cart.actions";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images?: { url: string; alt?: string | null; isPrimary: boolean }[];
    inventory?: { quantity: number } | null;
  };
}

interface Cart {
  items: CartItem[];
}

interface CartContentProps {
  cart: Cart;
}

// =============================================================================
// CartContent — Componente cliente del carrito
// Maneja updates optimistas de cantidad y eliminación de items
// =============================================================================

export function CartContent({ cart }: CartContentProps) {
  const [isPending, startTransition] = useTransition();
  const [couponCode, setCouponCode] = useState("");

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal >= 150 ? 0 : 15;
  const total = subtotal + shipping;

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    startTransition(async () => {
      const result = await updateCartItemAction(itemId, newQty);
      if (!result.success) toast.error(result.error);
    });
  };

  const handleRemove = (itemId: string, productName: string) => {
    startTransition(async () => {
      const result = await removeFromCartAction(itemId);
      if (result.success) {
        toast.success(`${productName} eliminado del carrito`);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleClearCart = () => {
    startTransition(async () => {
      const result = await clearCartAction();
      if (result.success) toast.success("Carrito vaciado");
      else toast.error(result.error);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Items del carrito */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header tabla */}
        <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-medium uppercase tracking-wider text-muted-foreground px-4">
          <div className="col-span-6">Producto</div>
          <div className="col-span-2 text-center">Precio</div>
          <div className="col-span-2 text-center">Cantidad</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        <Separator />

        {cart.items.map((item) => {
          const itemPrice = item.price;
          const itemTotal = itemPrice * item.quantity;
          const primaryImage = item.product.images?.find((img) => img.isPrimary) ?? item.product.images?.[0];
          const maxStock = item.product.inventory?.quantity ?? 99;

          return (
            <div key={item.id} className="rounded-xl border bg-white p-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Producto */}
                <div className="col-span-6 flex items-center gap-3">
                  <Link href={`/products/${item.product.slug}`} className="shrink-0">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border bg-muted">
                      {primaryImage ? (
                        <Image
                          src={primaryImage.url}
                          alt={primaryImage.alt ?? item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                          📦
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-medium hover:underline line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => handleRemove(item.id, item.product.name)}
                      disabled={isPending}
                      className="flex items-center gap-1 mt-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Precio unitario */}
                <div className="col-span-2 text-center">
                  <span className="text-sm font-medium">{formatPrice(itemPrice)}</span>
                </div>

                {/* Cantidad */}
                <div className="col-span-2 flex items-center justify-center">
                  <div className="flex items-center rounded-lg border">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={isPending || item.quantity <= 1}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                      aria-label="Reducir cantidad"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={isPending || item.quantity >= maxStock}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Total item */}
                <div className="col-span-2 text-right">
                  <span className="font-semibold" style={{ color: "#006065" }}>
                    {formatPrice(itemTotal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Vaciar carrito */}
        <div className="flex justify-end">
          <button
            onClick={handleClearCart}
            disabled={isPending}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Vaciar carrito
          </button>
        </div>
      </div>

      {/* Resumen del pedido */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border bg-white p-5 sticky top-20">
          <h2 className="font-headline text-lg font-semibold mb-4">Resumen del Pedido</h2>

          {/* Cupón */}
          <div className="mb-4">
            <label htmlFor="coupon" className="text-sm font-medium mb-1.5 block">
              Código de descuento
            </label>
            <div className="flex gap-2">
              <input
                id="coupon"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="IKAZA20"
                className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                style={{ borderColor: "#bdc9c9" }}
              />
              <button
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: "#885200" }}
              >
                <Tag className="h-4 w-4" />
                Aplicar
              </button>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Totales */}
          <div className="space-y-2.5 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                {shipping === 0 ? "Gratis" : formatPrice(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted-foreground">
                Envío gratis en pedidos mayores a S/ 150
              </p>
            )}
          </div>

          <Separator className="mb-4" />

          <div className="flex justify-between mb-5">
            <span className="font-semibold">Total</span>
            <span className="font-headline text-xl font-bold" style={{ color: "#006065" }}>
              {formatPrice(total)}
            </span>
          </div>

          {/* CTA Checkout */}
          <Link
            href="/checkout"
            id="proceed-to-checkout-btn"
            className="btn-ikaza-cart flex items-center justify-center gap-2 w-full py-3"
          >
            Proceder al Pago
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Métodos de pago */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Pago seguro con</span>
            {["Visa", "MC", "PayPal"].map((m) => (
              <span key={m} className="rounded px-1.5 py-0.5 text-xs border text-muted-foreground">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
