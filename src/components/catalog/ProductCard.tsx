"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { formatPrice, calculateDiscount, toNumber } from "@/lib/utils";
import { addToCartAction } from "@/features/orders/actions/cart.actions";
import { toggleWishlistAction } from "@/features/orders/actions/cart.actions";
import { toast } from "sonner";
import type { ProductWithRelations } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductWithRelations;
  inWishlist?: boolean;
}

// =============================================================================
// ProductCard — Tarjeta de producto para catálogo
// Basado en el wireframe "Catálogo - ikaZa Import"
// =============================================================================

export function ProductCard({ product, inWishlist = false }: ProductCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isInWishlist, setIsInWishlist] = useState(inWishlist);
  const [showQuickView, setShowQuickView] = useState(false);

  const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const price = toNumber(product.price);
  const comparePrice = product.comparePrice ? toNumber(product.comparePrice) : null;
  const discount = comparePrice ? calculateDiscount(price, comparePrice) : 0;
  const isOutOfStock = product.inventory && product.inventory.quantity <= 0;

  const handleAddToCart = () => {
    startTransition(async () => {
      const result = await addToCartAction(product.id, 1);
      if (result.success) {
        toast.success("Producto añadido al carrito", {
          description: product.name,
          action: { label: "Ver carrito", onClick: () => (window.location.href = "/cart") },
        });
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleToggleWishlist = () => {
    startTransition(async () => {
      const result = await toggleWishlistAction(product.id);
      if (result.success) {
        setIsInWishlist(result.data?.inWishlist ?? false);
        toast.success(result.data?.inWishlist ? "Añadido a favoritos" : "Eliminado de favoritos");
      } else {
        toast.error(result.error ?? "Debes iniciar sesión");
      }
    });
  };

  return (
    <article
      className="product-card group flex flex-col overflow-hidden"
      onMouseEnter={() => setShowQuickView(true)}
      onMouseLeave={() => setShowQuickView(false)}
    >
      {/* Imagen */}
      <div className="relative overflow-hidden bg-muted aspect-square">
        <Link href={`/products/${product.slug}`} tabIndex={-1}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="discount-badge">-{discount}%</span>
          )}
          {product.isFeatured && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: "#006065", color: "white" }}>
              Destacado
            </span>
          )}
          {isOutOfStock && (
            <span className="inline-flex items-center rounded-full bg-gray-900/80 px-2 py-0.5 text-xs font-semibold text-white">
              Sin stock
            </span>
          )}
        </div>

        {/* Acciones hover */}
        <div className={cn(
          "absolute top-2 right-2 flex flex-col gap-1 transition-all duration-200",
          showQuickView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        )}>
          <button
            onClick={handleToggleWishlist}
            disabled={isPending}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-colors",
              isInWishlist ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            )}
            aria-label={isInWishlist ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <Heart className="h-4 w-4" fill={isInWishlist ? "currentColor" : "none"} />
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Ver detalle"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-3">
        {/* Categoría en lugar de Marca */}
        {product.category && (
          <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: "#885200" }}>
            {product.category.name}
          </p>
        )}

        {/* Nombre */}
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-foreground line-clamp-2 hover:underline transition-colors flex-1 mb-2"
        >
          {product.name}
        </Link>

        {/* Rating */}
        {product.reviewCount && product.reviewCount > 0 ? (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-3 w-3"
                  fill={star <= Math.round(product.avgRating ?? 0) ? "#feb562" : "none"}
                  stroke={star <= Math.round(product.avgRating ?? 0) ? "#feb562" : "#bdc9c9"}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        ) : null}

        {/* Precio */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="price-display">{formatPrice(price)}</span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs line-through text-muted-foreground">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>

        {/* Botón CTA */}
        <button
          onClick={handleAddToCart}
          disabled={isPending || !!isOutOfStock}
          className={cn(
            "btn-ikaza-cart text-sm py-2",
            (isPending || isOutOfStock) && "opacity-50 cursor-not-allowed"
          )}
          aria-label={`Añadir ${product.name} al carrito`}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isPending ? "Añadiendo..." : isOutOfStock ? "Sin stock" : "Añadir al carrito"}
        </button>
      </div>
    </article>
  );
}
