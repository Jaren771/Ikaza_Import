"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calculateDiscount, toNumber } from "@/lib/utils";

interface CarouselProduct {
  id: string;
  slug: string;
  name: string;
  price: number | unknown;
  comparePrice?: number | unknown | null;
  images?: { url: string; alt?: string | null }[];
  category?: { name: string; slug: string } | null;
}

interface OfferCarouselProps {
  products: CarouselProduct[];
  interval?: number;
}

export function OfferCarousel({ products, interval = 3000 }: OfferCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (products.length === 0 || isFading) return;
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex(((index % products.length) + products.length) % products.length);
        setIsFading(false);
      }, 200);
    },
    [products.length, isFading],
  );

  const goNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  useEffect(() => {
    if (isPaused || products.length <= 1) return;
    const timer = setInterval(goNext, interval);
    return () => clearInterval(timer);
  }, [isPaused, products.length, interval, goNext]);

  if (products.length === 0) return null;

  const product = products[currentIndex];
  const price = toNumber(product.price);
  const comparePrice = product.comparePrice ? toNumber(product.comparePrice) : null;
  const discount = comparePrice ? calculateDiscount(price, comparePrice) : 0;
  const primaryImage = product.images?.[0];

  return (
    <div
      className="relative w-full max-w-[460px] flex flex-col items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Category badge at the top */}
      {product.category && (
        <div className="pb-4">
          <span
            className="inline-block rounded-full px-5 py-1.5 text-sm font-semibold tracking-wide shadow-lg"
            style={{
              background: "linear-gradient(135deg, #006065, #0d7a80)",
              color: "#fff",
              boxShadow: "0 4px 15px rgba(0,96,101,0.3)",
            }}
          >
            {product.category.name}
          </span>
        </div>
      )}

      {/* Product Card */}
      <div className="relative w-full flex items-center justify-center">
        <Link
          href={`/products/${product.slug}`}
          className={`group block relative w-[360px] h-[360px] rounded-2xl overflow-hidden shadow-2xl bg-white transition-all duration-200 ease-in-out ${
            isFading ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
          style={{
            border: "2px solid rgba(255,255,255,0.25)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)",
          }}
        >
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              width={360}
              height={360}
              className="block object-contain w-full h-full bg-white transition-transform duration-500 group-hover:scale-105"
              quality={95}
              priority
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-white">
              <span className="text-muted-foreground">Sin imagen</span>
            </div>
          )}

          {discount > 0 && (
            <div
              className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow z-10"
              style={{ background: "#006065", backdropFilter: "blur(4px)" }}
            >
              -{discount}%
            </div>
          )}
        </Link>

        {/* Navigation arrows */}
        {products.length > 1 && (
          <>
            <button
              onClick={goPrev}
              disabled={isFading}
              className={`absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl z-20 ${
                isFading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{ background: "rgba(0,96,101,0.85)" }}
              aria-label="Producto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              disabled={isFading}
              className={`absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl z-20 ${
                isFading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{ background: "rgba(0,96,101,0.85)" }}
              aria-label="Producto siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
