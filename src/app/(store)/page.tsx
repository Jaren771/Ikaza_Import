import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, Headphones, RefreshCw, Star } from "lucide-react";
import { getFeaturedProductsAction, getCategoriesAction } from "@/features/products/actions/product.actions";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — Productos Importados de Calidad`,
  description: SITE_CONFIG.description,
};

// Revalidar cada 1 hora (ISR)
export const revalidate = 3600;

// =============================================================================
// Página de Inicio — ikaZa Import
// Basado en el wireframe "Inicio - ikaZa Import" de Stitch
// ============================================================================= 

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProductsAction(8),
    getCategoriesAction(),
  ]);

  return (
    <div className="fade-in">
      {/* =========================================================
          HERO SECTION
          ========================================================= */}
      <section
        className="hero-gradient relative overflow-hidden"
        aria-label="Banner principal"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(125, 212, 219, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(254, 181, 98, 0.2) 0%, transparent 50%)"
          }} />
        </div>

        <div className="ikaza-container relative py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="slide-up">
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
                style={{ backgroundColor: "rgba(125, 212, 219, 0.2)", color: "#7dd4db" }}>
                <Star className="h-4 w-4 fill-current" />
                Los mejores productos importados
              </span>

              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Calidad de
                <span style={{ color: "#feb562" }}> Importación</span>
                <br />
                al Mejor Precio
              </h1>

              <p className="text-lg leading-relaxed mb-8" style={{ color: "#c7fbff" }}>
                Descubre miles de productos importados: hogar, cocina, tecnología 
                y más. Envío rápido a todo el Perú.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ backgroundColor: "#885200" }}
                  id="hero-cta-primary"
                >
                  Ver Catálogo
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/catalog?isFeatured=true"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 px-8 py-3.5 text-base font-semibold transition-all hover:opacity-90"
                  style={{ borderColor: "#7dd4db", color: "#7dd4db" }}
                  id="hero-cta-secondary"
                >
                  Ver Ofertas
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-10 pt-8 border-t" style={{ borderColor: "rgba(125, 212, 219, 0.2)" }}>
                {[
                  { value: "+5,000", label: "Productos" },
                  { value: "+200", label: "Marcas" },
                  { value: "+10,000", label: "Clientes" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-headline text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm" style={{ color: "#7dd4db" }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image placeholder */}
            <div className="hidden md:flex items-center justify-center">
              <div className="glass-card p-8 rounded-2xl">
                <div className="w-64 h-64 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(125, 212, 219, 0.1)" }}>
                  <div className="text-center">
                    <div className="text-7xl mb-4">🏠</div>
                    <p className="font-headline text-sm font-semibold text-white">Hogar & Cocina</p>
                    <p className="text-xs mt-1" style={{ color: "#7dd4db" }}>Colección 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURES — Beneficios
          ========================================================= */}
      <section className="border-b" style={{ backgroundColor: "#efeded" }}>
        <div className="ikaza-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border">
            {[
              { icon: Truck, title: "Envío Rápido", desc: "A todo el Perú" },
              { icon: ShieldCheck, title: "Compra Segura", desc: "Pagos certificados" },
              { icon: RefreshCw, title: "Devoluciones", desc: "30 días gratis" },
              { icon: Headphones, title: "Soporte 24/7", desc: "Siempre disponible" },
            ].map((feature) => (
              <div key={feature.title} className="flex items-center gap-3 px-6 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#c7fbff" }}>
                  <feature.icon className="h-5 w-5" style={{ color: "#006065" }} />
                </div>
                <div>
                  <p className="font-headline text-sm font-semibold">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORÍAS
          ========================================================= */}
      <section className="py-14" id="categorias">
        <div className="ikaza-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-headline text-2xl md:text-3xl font-bold">
                Explorar Categorías
              </h2>
              <p className="text-muted-foreground mt-1">
                Encuentra exactamente lo que buscas
              </p>
            </div>
            <Link
              href="/catalog"
              className="hidden sm:flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
              style={{ color: "#006065" }}
            >
              Ver todo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(categories.length > 0 ? categories : DEFAULT_CATEGORIES).slice(0, 6).map((cat) => (
              <Link
                key={cat.slug ?? cat.name}
                href={`/catalog?category=${cat.slug ?? cat.name.toLowerCase()}`}
                className="group flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center transition-all duration-200 hover:border-current hover:shadow-md"
                style={{ "--hover-color": "#006065" } as React.CSSProperties}
              >
                <div className="text-3xl mb-1">
                  {cat.emoji ?? "📦"}
                </div>
                <p className="text-sm font-medium">{cat.name}</p>
                {"_count" in cat && (
                  <p className="text-xs text-muted-foreground">
                    {(cat as { _count?: { products: number } })._count?.products ?? 0} productos
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          PRODUCTOS DESTACADOS
          ========================================================= */}
      <section className="py-14" style={{ backgroundColor: "#f5f3f3" }} id="destacados">
        <div className="ikaza-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-headline text-2xl md:text-3xl font-bold">
                Productos Destacados
              </h2>
              <p className="text-muted-foreground mt-1">
                Los más elegidos por nuestros clientes
              </p>
            </div>
            <Link
              href="/catalog?isFeatured=true"
              className="hidden sm:flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
              style={{ color: "#006065" }}
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
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
          BANNER DE OFERTA
          ========================================================= */}
      <section className="py-14" id="banner-oferta">
        <div className="ikaza-container">
          <div
            className="relative overflow-hidden rounded-2xl p-8 md:p-12"
            style={{ background: "linear-gradient(135deg, #885200, #feb562)" }}
          >
            <div className="relative z-10">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-2">
                Oferta especial
              </p>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mb-4">
                Hasta 50% de descuento
                <br />
                en artículos seleccionados
              </h2>
              <p className="text-white/80 mb-6 max-w-md">
                Aprovecha nuestras ofertas exclusivas en productos de hogar y cocina. 
                ¡Solo por tiempo limitado!
              </p>
              <Link
                href="/catalog?isFeatured=true"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-base font-semibold transition-all hover:opacity-90"
                style={{ color: "#885200" }}
                id="offer-banner-cta"
              >
                Aprovechar Oferta
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            {/* Decorative elements */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
              <div className="text-8xl opacity-30">🎁</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TESTIMONIALES
          ========================================================= */}
      <section className="py-14 border-t" id="testimonios">
        <div className="ikaza-container">
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-center mb-10">
            Lo que dicen nuestros clientes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-xl border bg-white p-6">
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-current" style={{ color: "#feb562" }} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: "#006065" }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
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
  { name: "Hogar", slug: "hogar", emoji: "🏠" },
  { name: "Cocina", slug: "cocina", emoji: "🍳" },
  { name: "Tecnología", slug: "tecnologia", emoji: "💻" },
  { name: "Decoración", slug: "decoracion", emoji: "🎨" },
  { name: "Jardín", slug: "jardin", emoji: "🌿" },
  { name: "Baño", slug: "bano", emoji: "🚿" },
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
