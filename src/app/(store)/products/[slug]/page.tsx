import { notFound } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import { Star, ShoppingCart, Heart, Share2, Shield, Truck, RefreshCw, Package } from "lucide-react";
import { getProductBySlugAction, getRelatedProductsAction } from "@/features/products/actions/product.actions";
import { ProductCard } from "@/components/catalog/ProductCard";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatPrice, calculateDiscount, toNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  position: number;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugAction(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  return {
    title: product.metaTitle ?? `${product.name} | ikaZa Import`,
    description: product.metaDescription ?? product.shortDescription ?? product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? "",
      images: product.images?.map((img: ProductImage) => ({ url: img.url, alt: img.alt ?? product.name })),
    },
  };
}

// =============================================================================
// Página de Detalle de Producto
// Basado en wireframe "Detalle de Producto - ikaZa Import"
// =============================================================================

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlugAction(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProductsAction(
    product.id,
    product.categoryId ?? null
  );

  const primaryImage = product.images?.find((img: ProductImage) => img.isPrimary) ?? product.images?.[0];
  const price = toNumber(product.price);
  const comparePrice = product.comparePrice ? toNumber(product.comparePrice) : null;
  const discount = comparePrice ? calculateDiscount(price, comparePrice) : 0;
  const isOutOfStock = product.inventory && product.inventory.quantity <= 0;

  const reviews = (product.reviews ?? []) as Array<{
    id: string;
    rating: number;
    title?: string | null;
    content?: string | null;
    user?: { name?: string | null; image?: string | null };
    createdAt: Date;
  }>;

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="ikaza-container py-6 fade-in">
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li><a href="/" className="hover:text-foreground">Inicio</a></li>
          <li>/</li>
          <li><a href="/catalog" className="hover:text-foreground">Catálogo</a></li>
          {product.category && (
            <>
              <li>/</li>
              <li>
                <a href={`/catalog?category=${product.category.slug}`} className="hover:text-foreground">
                  {product.category.name}
                </a>
              </li>
            </>
          )}
          <li>/</li>
          <li className="text-foreground font-medium truncate max-w-48">{product.name}</li>
        </ol>
      </nav>

      {/* Producto Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Galería de imágenes */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-xl overflow-hidden border bg-white">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt ?? product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Package className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}

            {/* Badges sobre imagen */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discount > 0 && (
                <span className="discount-badge text-sm px-3 py-1">-{discount}%</span>
              )}
              {product.isFeatured && (
                <Badge style={{ backgroundColor: "#006065" }}>Destacado</Badge>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img: ProductImage) => (
                <div
                  key={img.id}
                  className="relative h-16 w-16 shrink-0 rounded-lg border-2 overflow-hidden cursor-pointer transition-colors"
                  style={{ borderColor: img.isPrimary ? "#006065" : "#e4e2e2" }}
                >
                  <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info del producto */}
        <div className="flex flex-col">
          {/* Marca */}
          {product.brand && (
            <a
              href={`/catalog?brand=${product.brand.slug}`}
              className="text-sm font-semibold uppercase tracking-wider mb-2 hover:underline"
              style={{ color: "#885200" }}
            >
              {product.brand.name}
            </a>
          )}

          <h1 className="font-headline text-2xl md:text-3xl font-bold mb-3">
            {product.name}
          </h1>

          {/* SKU */}
          <p className="text-xs text-muted-foreground mb-3">SKU: {product.sku}</p>

          {/* Rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4"
                    fill={star <= Math.round(avgRating) ? "#feb562" : "none"}
                    stroke={star <= Math.round(avgRating) ? "#feb562" : "#bdc9c9"}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} ({reviews.length} reseña{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {/* Precio */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-headline text-3xl font-bold" style={{ color: "#006065" }}>
              {formatPrice(price)}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-lg line-through text-muted-foreground">
                {formatPrice(comparePrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-sm font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                Ahorras {formatPrice(comparePrice! - price)}
              </span>
            )}
          </div>

          {/* Descripción corta */}
          {product.shortDescription && (
            <p className="text-muted-foreground mb-5 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          <Separator className="mb-5" />

          {/* Stock */}
          <div className="mb-5">
            {isOutOfStock ? (
              <div className="stock-badge-out">
                Sin stock disponible
              </div>
            ) : (
              <div className="stock-badge-in">
                ✓ En stock ({product.inventory?.quantity ?? 0} disponibles)
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              disabled={!!isOutOfStock}
            />
            <button
              className="flex items-center justify-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
              aria-label="Añadir a lista de deseos"
              id="product-wishlist-btn"
            >
              <Heart className="h-4 w-4" />
              Favoritos
            </button>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border transition-colors hover:bg-muted shrink-0"
              aria-label="Compartir producto"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Garantías */}
          <div className="rounded-xl border bg-muted/50 p-4 space-y-2.5">
            {[
              { icon: Truck, text: "Envío gratuito en pedidos +S/ 150" },
              { icon: Shield, text: "Garantía de 12 meses" },
              { icon: RefreshCw, text: "Devoluciones gratuitas en 30 días" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm">
                <item.icon className="h-4 w-4 shrink-0" style={{ color: "#006065" }} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Descripción y Reseñas */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList>
          <TabsTrigger value="description">Descripción</TabsTrigger>
          <TabsTrigger value="reviews">
            Reseñas ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="shipping">Envío y Devoluciones</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <div className="prose prose-sm max-w-none">
            {product.description ? (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            ) : (
              <p className="text-muted-foreground">Sin descripción disponible.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-xl border bg-white p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: "#006065" }}>
                      {review.user?.name?.[0] ?? "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{review.user?.name ?? "Usuario"}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="h-3 w-3"
                            fill={s <= review.rating ? "#feb562" : "none"}
                            stroke={s <= review.rating ? "#feb562" : "#bdc9c9"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.title && <p className="font-medium mb-1">{review.title}</p>}
                  {review.content && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">
              Aún no hay reseñas para este producto. ¡Sé el primero!
            </p>
          )}
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Envío estándar</h3>
              <p>3-5 días hábiles a Lima Metropolitana. 7-10 días hábiles a provincias.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Envío express</h3>
              <p>24-48 horas en Lima Metropolitana (sujeto a disponibilidad).</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Devoluciones</h3>
              <p>Aceptamos devoluciones dentro de los 30 días de recibido el producto, en perfectas condiciones y con empaque original.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Productos relacionados */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="font-headline text-xl font-bold mb-6">Productos Relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
