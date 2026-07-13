"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function HeroCarousel({ banners }: { banners: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Si no hay banners en la base de datos, mostramos el default
  const defaultBanner = {
    id: "default",
    image: "/Fondo_IkasaImport.webp",
    title: "Calidad de-Importación",
    subtitle: "Descubre miles de productos importados: hogar, cocina, tecnología y más. Envío rápido a todo el Perú.",
    link: "/catalog"
  };

  const activeBanners = banners && banners.length > 0 ? banners : [defaultBanner];

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    
    // Cambiar cada 10 segundos
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [activeBanners.length]);

  return (
    <section
      className="relative overflow-hidden bg-[#002022]"
      aria-label="Banner principal"
      style={{ minHeight: "520px" }}
    >
      {/* ── Imágenes de fondo del Carrusel (con transición fluida) ── */}
      {activeBanners.map((banner, index) => (
        <div 
          key={banner.id} 
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === currentIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
          )}
        >
          <Image
            src={banner.image || "/Fondo_IkasaImport.webp"}
            alt={banner.title || "Banner"}
            fill
            priority={index === 0}
            quality={95}
            className="object-cover object-center"
          />
        </div>
      ))}

      {/* ── Overlay izquierda: teal oscuro opaco para legibilidad del texto ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(100deg, rgba(0,32,34,0.92) 0%, rgba(0,96,101,0.82) 38%, rgba(0,96,101,0.45) 62%, rgba(0,96,101,0.05) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Vignette sutil inferior para transición suave ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{
          background: "linear-gradient(to top, rgba(0,32,34,0.6) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Pétalos flotantes (CSS puro) ── */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {PETALS.map((p, i) => (
          <span
            key={i}
            className="hero-petal"
            style={{
              width: p.size,
              height: p.size,
              left: p.left,
              top: "-20px",
              backgroundColor: p.color,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* ── Contenido ── */}
      <div className="ikaza-container relative z-20 py-20 md:py-28 lg:py-32">
        <div className="max-w-xl slide-up">
          {/* Badge flotante */}
          <span
            className="float-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            style={{ backgroundColor: "rgba(125, 212, 219, 0.2)", color: "#7dd4db", backdropFilter: "blur(6px)", border: "1px solid rgba(125,212,219,0.3)" }}
          >
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-current" />
            Los mejores productos importados
          </span>

          {/* Textos del banner actual con key para forzar re-animación */}
          <div key={currentIndex} className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full overflow-hidden">
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg break-words hyphens-auto">
              {activeBanners[currentIndex].title ? (
                // Si el título viene de la BD y contiene un guion (-), coloreamos la segunda parte.
                activeBanners[currentIndex].title.includes("-") ? (
                  <>
                    {activeBanners[currentIndex].title.split("-")[0]}
                    <span style={{ color: "#feb562" }}> {activeBanners[currentIndex].title.split("-").slice(1).join("-")}</span>
                    <br />
                    al Mejor Precio
                  </>
                ) : (
                  <>
                    {activeBanners[currentIndex].title}
                    <br />
                    al Mejor Precio
                  </>
                )
              ) : (
                // Fallback de seguridad
                <>
                  Calidad de
                  <span style={{ color: "#feb562" }}> Importación</span>
                  <br />
                  al Mejor Precio
                </>
              )}
            </h1>

            <p className="text-lg leading-relaxed mb-8 drop-shadow" style={{ color: "#c7fbff" }}>
              {activeBanners[currentIndex].subtitle || "Descubre miles de productos importados: hogar, cocina, tecnología y más. Envío rápido a todo el Perú."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={activeBanners[currentIndex].link || "/catalog"}
                className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ backgroundColor: "#885200", boxShadow: "0 4px 20px rgba(136,82,0,0.5)" }}
              >
                Ver Catálogo
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/catalog?isFeatured=true"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 px-8 py-3.5 text-base font-semibold transition-all hover:bg-white/10"
                style={{ borderColor: "#7dd4db", color: "#7dd4db" }}
              >
                Ver Ofertas
              </Link>
            </div>
          </div>

          {/* Indicadores (Puntos del Carrusel) */}
          {activeBanners.length > 1 && (
            <div className="flex gap-2 mt-8">
              {activeBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === currentIndex ? "w-8 bg-[#feb562]" : "w-2 bg-white/30 hover:bg-white/50"
                  )}
                  aria-label={`Ir a la diapositiva ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          <div
            className="flex gap-8 mt-10 pt-8 border-t"
            style={{ borderColor: "rgba(125, 212, 219, 0.25)" }}
          >
            {[
              { value: "+5,000",  label: "Productos" },
              { value: "+200",    label: "Marcas"    },
              { value: "+10,000", label: "Clientes"  },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-headline text-2xl font-bold text-white drop-shadow">{stat.value}</p>
                <p className="text-sm" style={{ color: "#7dd4db" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave inferior */}
      <div className="wave-divider absolute bottom-0 left-0 right-0 z-20" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", display: "block" }}>
          <path d="M0 48L60 40C120 32 240 16 360 12C480 8 600 16 720 22C840 28 960 32 1080 28C1200 24 1320 12 1380 6L1440 0V48H0Z"
            fill="#efeded" />
        </svg>
      </div>
    </section>
  );
}
