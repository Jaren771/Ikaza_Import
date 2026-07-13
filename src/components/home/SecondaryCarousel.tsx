"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { OfferCarousel } from "./OfferCarousel";
import { cn } from "@/lib/utils";

interface SecondaryCarouselProps {
  banners: any[];
  products: any[];
}

export function SecondaryCarousel({ banners, products }: SecondaryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeBanners = banners || [];

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    
    // Cambiar cada 10 segundos
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex];

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-2xl"
      style={{ background: "linear-gradient(135deg, #5c3700 0%, #885200 45%, #c97a00 80%, #feb562 100%)" }}
    >
      {/* ── Si el banner tiene una imagen de fondo, la mostramos ── */}
      {activeBanners.map((banner, index) => (
        banner.image && (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentIndex ? "opacity-30 z-0" : "opacity-0 -z-10" // Opacity 30% para que se vea el gradiente marrón
            )}
          >
            <Image
              src={banner.image}
              alt={banner.title || "Oferta"}
              fill
              quality={90}
              className="object-cover object-center"
            />
          </div>
        )
      ))}

      {/* Patrón de puntos decorativo */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Resplandor izquierdo */}
      <div
        className="absolute left-0 top-0 h-full w-1/2 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-0">
        {/* — Lado izquierdo: texto y CTA — */}
        <div key={currentIndex} className="flex-1 p-8 md:p-12 lg:p-14 animate-in fade-in slide-in-from-left-4 duration-700">
          {currentBanner.badge && (
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-5"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}
            >
              {currentBanner.badge}
            </span>
          )}
          
          <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight break-words hyphens-auto">
            {currentBanner.title ? (
              // Si el título contiene un '-', estilizamos la primera parte
              currentBanner.title.includes("-") ? (
                <>
                  <span className="float-badge inline-block" style={{ color: "#ffd080" }}>
                    {currentBanner.title.split("-")[0]}
                  </span>
                  <br />
                  {currentBanner.title.split("-").slice(1).join("-")}
                </>
              ) : (
                currentBanner.title
              )
            ) : (
              <>
                Hasta <span className="float-badge inline-block" style={{ color: "#ffd080" }}>50% OFF</span>
                <br />
                en artículos seleccionados
              </>
            )}
          </h2>
          
          <p className="text-white/80 max-w-sm text-base leading-relaxed mb-8 drop-shadow-sm">
            {currentBanner.subtitle || "Aprovecha nuestras ofertas exclusivas en productos de hogar y cocina. ¡Solo por tiempo limitado!"}
          </p>
          
          <Link
            href={currentBanner.link || "/catalog?isFeatured=true"}
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-lg"
            style={{ color: "#885200" }}
          >
            Aprovechar Oferta
            <ArrowRight className="h-5 w-5" />
          </Link>

          {/* Indicadores (Puntos del Carrusel Secundario) */}
          {activeBanners.length > 1 && (
            <div className="flex gap-2 mt-10">
              {activeBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === currentIndex ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                  )}
                  aria-label={`Ir a la oferta ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* — Lado derecho: carrusel de productos (se mantiene igual, no rota con el banner) — */}
        <div className="hidden md:flex shrink-0 items-end justify-center self-stretch w-[460px] pb-5">
          {products.length > 0 ? (
            <OfferCarousel products={products} interval={3000} />
          ) : (
            <div className="m-4 rounded-2xl overflow-hidden shadow-2xl bg-white/10 p-8 text-white/60 text-center">
              Próximamente ofertas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
