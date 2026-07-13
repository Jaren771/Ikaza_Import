import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, Headphones, RefreshCw, Star, CheckCircle2, Home, ChefHat, Monitor, Palette, Shirt, Sparkles, Gamepad2, Gift, Flower2, Droplets, Paintbrush } from "lucide-react";
import { getFeaturedProductsAction, getCategoriesAction, getProductsAction } from "@/features/products/actions/product.actions";
import { getBanners } from "@/app/admin/banners/actions";
import { ProductCard } from "@/components/catalog/ProductCard";
import { OfferCarousel } from "@/components/home/OfferCarousel";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { SecondaryCarousel } from "@/components/home/SecondaryCarousel";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — Productos Importados de Calidad`,
  description: SITE_CONFIG.description,
};

// Revalidar cada 1 hora (ISR)
export const revalidate = 3600;

// =============================================================================
// Página de Inicio — ikaZa Import  (Opción C — Máximo impacto visual)
// =============================================================================

// Mapa de gradientes por categoría slug
const CATEGORY_GRADIENTS: Record<string, string> = {
  hogar:                      "category-card-hogar",
  cocina:                     "category-card-cocina",
  tecnologia:                 "category-card-tech",
  decoracion:                 "category-card-deco",
  vestimenta:                 "category-card-vestimenta",
  "belleza-y-cuidado-personal": "category-card-belleza",
  "juguetes-y-juegos":         "category-card-juguetes",
  "regalos-y-celebraciones":   "category-card-regalos",
  jardin:                     "category-card-jardin",
  bano:                       "category-card-bano",
  "arte-y-manualidades":       "category-card-arte",
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  hogar: Home,
  cocina: ChefHat,
  tecnologia: Monitor,
  decoracion: Palette,
  vestimenta: Shirt,
  "belleza-y-cuidado-personal": Sparkles,
  "juguetes-y-juegos": Gamepad2,
  "regalos-y-celebraciones": Gift,
  jardin: Flower2,
  bano: Droplets,
  "arte-y-manualidades": Paintbrush,
};

// Colores oscuros para el círculo detrás del icono (buen contraste con fondo claro)
const CATEGORY_CIRCLE_COLORS: Record<string, string> = {
  hogar:                      "#0f766e",
  cocina:                     "#c2410c",
  tecnologia:                 "#1d4ed8",
  decoracion:                 "#be185d",
  vestimenta:                 "#7c3aed",
  "belleza-y-cuidado-personal": "#9d174d",
  "juguetes-y-juegos":         "#a16207",
  "regalos-y-celebraciones":   "#b91c1c",
  jardin:                     "#15803d",
  bano:                       "#0e7490",
  "arte-y-manualidades":       "#4338ca",
};

function getCategoryGradient(slug: string): string {
  return CATEGORY_GRADIENTS[slug] ?? "category-card-default";
}

// Pétalos flotantes — posicionados con CSS inline (CSS puro, sin JS)
const PETALS = [
  { color: "#ffb3c6", size: 10, left: "8%",  delay: "0s",   duration: "12s" },
  { color: "#99f1f7", size: 8,  left: "18%", delay: "2s",   duration: "14s" },
  { color: "#feb562", size: 12, left: "30%", delay: "4s",   duration: "10s" },
  { color: "#ffb3c6", size: 9,  left: "45%", delay: "1s",   duration: "16s" },
  { color: "#c7fbff", size: 7,  left: "60%", delay: "3s",   duration: "11s" },
  { color: "#feb562", size: 11, left: "72%", delay: "5.5s", duration: "13s" },
  { color: "#ffb3c6", size: 8,  left: "85%", delay: "0.5s", duration: "15s" },
  { color: "#99f1f7", size: 10, left: "93%", delay: "3.5s", duration: "12s" },
];

export default async function HomePage() {
  const [featuredProducts, categories, allProductsResult, bannersResult] = await Promise.all([
    getFeaturedProductsAction(8),
    getCategoriesAction(),
    getProductsAction({ limit: 100, sortBy: "newest" }),
    getBanners(),
  ]);

  const allProducts =
    allProductsResult && "data" in allProductsResult && allProductsResult.data
      ? [...allProductsResult.data.products].sort(() => Math.random() - 0.5)
      : [];

  const activeBanners = bannersResult?.success && Array.isArray(bannersResult.data)
    ? bannersResult.data.filter((b: any) => b.isActive && b.position === "home_hero")
    : [];

  const activeSecondaryBanners = bannersResult?.success && Array.isArray(bannersResult.data)
    ? bannersResult.data.filter((b: any) => b.isActive && b.position === "home_secondary")
    : [];

  return (
    <div className="fade-in">

      {/* =========================================================
          HERO SECTION — Carrusel dinámico fluido (10 seg)
          ========================================================= */}
      <HeroCarousel banners={activeBanners} />

      {/* =========================================================
          FEATURES — Beneficios premium
          ========================================================= */}
      <section className="border-b" style={{ backgroundColor: "#efeded" }}>
        <div className="ikaza-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border">
            {[
              { icon: Truck,       title: "Envío Rápido",   desc: "A todo el Perú",      accent: "#006065" },
              { icon: ShieldCheck, title: "Compra Segura",  desc: "Pagos certificados",  accent: "#0d7a80" },
              { icon: RefreshCw,   title: "Devoluciones",   desc: "30 días gratis",      accent: "#885200" },
              { icon: Headphones,  title: "Soporte 24/7",   desc: "Siempre disponible",  accent: "#006065" },
            ].map((feature) => (
              <div key={feature.title} className="feature-item flex items-center gap-3 px-6 py-5 rounded-sm">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${feature.accent}22 0%, ${feature.accent}44 100%)`,
                    border: `1.5px solid ${feature.accent}33`,
                  }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: feature.accent }} />
                </div>
                <div>
                  <p className="font-headline text-sm font-bold" style={{ color: "#1b1c1c" }}>{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORÍAS — Cards con gradientes premium
          ========================================================= */}
      <section className="py-16" id="categorias">
        <div className="ikaza-container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-1" style={{ color: "#885200" }}>
                ✦ Navega por
              </p>
              <h2 className="font-headline text-2xl md:text-3xl font-bold">
                Explorar Categorías
              </h2>
              <p className="text-muted-foreground mt-1">
                Encuentra exactamente lo que buscas
              </p>
            </div>
            <Link
              href="/catalog"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
              style={{ color: "#006065" }}
            >
              Ver todo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(categories.length > 0 ? categories : DEFAULT_CATEGORIES).slice(0, 11).map((cat: any) => {
              const slug = cat.slug ?? cat.name.toLowerCase();
              const gradientClass = getCategoryGradient(slug);
              const IconComponent = CATEGORY_ICONS[slug] as React.ComponentType<{ className?: string }> | undefined;
              const circleColor = CATEGORY_CIRCLE_COLORS[slug];
              return (
                <Link
                  key={slug}
                  href={`/catalog?category=${slug}`}
                  className={`category-card-item group relative overflow-hidden rounded-2xl p-5 flex flex-col items-center justify-center gap-3 min-h-[170px] ${gradientClass}`}
                >
                  {/* Círculo oscuro satinado que resalta el icono claro */}
                  <div
                    className="relative w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md"
                    style={{ backgroundColor: circleColor }}
                  >
                    {IconComponent ? (
                      <IconComponent className="w-8 h-8 text-white drop-shadow-sm" />
                    ) : (
                      <span className="text-3xl">{"emoji" in cat ? cat.emoji : "📦"}</span>
                    )}
                  </div>
                  <span className="relative text-sm font-bold text-gray-800 text-center leading-tight">{cat.name}</span>
                  {"_count" in cat && (
                    <span className="relative text-xs font-medium text-gray-500 bg-white/60 px-2.5 py-0.5 rounded-full">
                      {(cat as { _count?: { products: number } })._count?.products ?? 0} productos
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Wave entre secciones */}
      <div className="wave-divider -mb-px" style={{ backgroundColor: "#fbf9f8" }}>
        <svg viewBox="0 0 1440 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0L48 5.3C96 10.7 192 21.3 288 24C384 26.7 480 21.3 576 16C672 10.7 768 5.3 864 5.3C960 5.3 1056 10.7 1152 16C1248 21.3 1344 26.7 1392 29.3L1440 32V32H0V0Z"
            fill="#f5f3f3" />
        </svg>
      </div>

      {/* =========================================================
          PRODUCTOS DESTACADOS
          ========================================================= */}
      <section className="py-16" style={{ backgroundColor: "#f5f3f3" }} id="destacados">
        <div className="ikaza-container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-1" style={{ color: "#885200" }}>
                ✦ Selección
              </p>
              <h2 className="font-headline text-2xl md:text-3xl font-bold">
                Productos Destacados
              </h2>
              <p className="text-muted-foreground mt-1">
                Los más elegidos por nuestros clientes
              </p>
            </div>
            <Link
              href="/catalog?isFeatured=true"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
              style={{ color: "#006065" }}
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Próximamente productos destacados</p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          BANNER DE OFERTA — Dinámico desde BD
          ========================================================= */}
      <section className="py-16" id="banner-oferta">
        <div className="ikaza-container">
          <SecondaryCarousel banners={activeSecondaryBanners} products={allProducts} />
        </div>
      </section>

      {/* =========================================================
          TESTIMONIALES — Con decoración premium
          ========================================================= */}
      <section className="py-16 border-t" id="testimonios">
        <div className="ikaza-container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "#885200" }}>
              ✦ Opiniones reales
            </p>
            <h2 className="font-headline text-2xl md:text-3xl font-bold">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="testimonial-card rounded-2xl border bg-white p-6"
                style={{ borderLeft: "3px solid #006065" }}
              >
                {/* Estrellas */}
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-current" style={{ color: "#feb562" }} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed relative z-10">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                      style={{ background: "linear-gradient(135deg, #006065, #0d7a80)" }}
                    >
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.location}</p>
                    </div>
                  </div>
                  {/* Badge verificado */}
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ backgroundColor: "#fff4e0", color: "#885200" }}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Verificado
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

// Datos fallback para cuando no hay categorías en BD
const DEFAULT_CATEGORIES = [
  { name: "Hogar",       slug: "hogar",                    emoji: "🏠" },
  { name: "Cocina",      slug: "cocina",                    emoji: "🍳" },
  { name: "Tecnología",  slug: "tecnologia",                emoji: "💻" },
  { name: "Decoración",  slug: "decoracion",                emoji: "🎨" },
  { name: "Vestimenta",  slug: "vestimenta",                emoji: "👕" },
  { name: "Belleza",     slug: "belleza-y-cuidado-personal", emoji: "🧴" },
  { name: "Juguetes",    slug: "juguetes-y-juegos",         emoji: "🎲" },
  { name: "Regalos",     slug: "regalos-y-celebraciones",    emoji: "🎁" },
  { name: "Arte",        slug: "arte-y-manualidades",       emoji: "🖌️" },
  { name: "Jardín",      slug: "jardin",                    emoji: "🌿" },
  { name: "Baño",        slug: "bano",                      emoji: "🚿" },
];

const TESTIMONIALS = [
  {
    name: "María García",
    location: "Lima, Perú",
    text: "Excelente calidad de productos y envío rapidísimo. Los artículos de cocina que compré superaron mis expectativas.",
  },
  {
    name: "Carlos Mendoza",
    location: "Arequipa, Perú",
    text: "Muy buena experiencia de compra. El proceso fue sencillo y el soporte al cliente muy atento.",
  },
  {
    name: "Ana Torres",
    location: "Trujillo, Perú",
    text: "Los precios son increíbles para la calidad que ofrecen. Definitivamente seguiré comprando aquí.",
  },
];
