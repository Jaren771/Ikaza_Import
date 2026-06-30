"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn, formatPrice } from "@/lib/utils";
import { X } from "lucide-react";

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  subcategories?: { id: string; name: string; slug: string }[];
}

export interface CatalogPriceBounds {
  min: number;
  max: number;
}

interface ProductFiltersPanelProps {
  categories: CatalogCategory[];
  currentFilters: {
    minPrice?: number;
    maxPrice?: number;
    categoryId?: string;
    inStock?: boolean;
    isFeatured?: boolean;
  };
  priceBounds: CatalogPriceBounds;
  sticky?: boolean;
}

export function ProductFiltersPanel({
  categories,
  currentFilters,
  priceBounds,
  sticky = true,
}: ProductFiltersPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const priceMin = Math.max(0, Math.floor(priceBounds.min));
  const priceMax = useMemo(() => {
    const rounded = Math.ceil(Math.max(priceBounds.max, priceMin + 1) / 10) * 10;
    return Math.max(rounded, 10);
  }, [priceBounds.max, priceMin]);
  const priceStep = priceMax <= 150 ? 5 : priceMax <= 500 ? 10 : 50;
  const selectedPriceRange: [number, number] = [
    currentFilters.minPrice ?? priceMin,
    currentFilters.maxPrice ?? priceMax,
  ];

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    if ("category" in updates) {
      params.delete("subcategory");
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const updateFilter = (key: string, value: string | null) => {
    updateFilters({ [key]: value });
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    ["search", "sortBy", "view"].forEach((key) => {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    });
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  };

  const hasActiveFilters =
    searchParams.has("category") ||
    searchParams.has("subcategory") ||
    searchParams.has("minPrice") ||
    searchParams.has("maxPrice") ||
    searchParams.has("inStock") ||
    searchParams.has("isFeatured");

  return (
    <div className={cn("rounded-lg border bg-white p-4 space-y-5", sticky && "sticky top-20")}>
      <div className="flex items-center justify-between">
        <h2 className="font-headline font-semibold">Filtros</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            type="button"
          >
            <X className="h-3 w-3" />
            Limpiar todo
          </button>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3">Categorías</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter("category", null)}
            className={cn(
              "w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors",
              !searchParams.has("category")
                ? "font-semibold text-white"
                : "text-muted-foreground hover:bg-muted"
            )}
            style={!searchParams.has("category") ? { backgroundColor: "#006065" } : {}}
            type="button"
          >
            Todas
          </button>

          {categories.map((category) => (
            <div key={category.id}>
              <button
                onClick={() => updateFilter("category", category.slug)}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors",
                  searchParams.get("category") === category.slug
                    ? "font-semibold text-white"
                    : "text-foreground hover:bg-muted"
                )}
                style={
                  searchParams.get("category") === category.slug
                    ? { backgroundColor: "#006065" }
                    : {}
                }
                type="button"
              >
                {category.name}
              </button>

              {searchParams.get("category") === category.slug &&
                category.subcategories?.map((subcategory) => {
                  const isActive = searchParams.get("subcategory") === subcategory.slug;

                  return (
                    <button
                      key={subcategory.id}
                      onClick={() => updateFilter("subcategory", subcategory.slug)}
                      className={cn(
                        "w-full text-left pl-6 pr-2 py-1.5 text-sm transition-colors rounded-lg my-0.5",
                        isActive
                          ? "font-semibold text-white bg-[#006065]/90"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      type="button"
                    >
                      {subcategory.name}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3">Precio</h3>
        <div className="px-1">
          <PriceRangeControl
            key={`${priceMin}-${priceMax}-${selectedPriceRange[0]}-${selectedPriceRange[1]}`}
            initialRange={selectedPriceRange}
            max={priceMax}
            min={priceMin}
            onCommit={(min, max) =>
              updateFilters({
                minPrice: min > priceMin ? String(min) : null,
                maxPrice: max < priceMax ? String(max) : null,
              })
            }
            step={priceStep}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3">Disponibilidad</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="in-stock"
              checked={searchParams.get("inStock") === "true"}
              onCheckedChange={(checked) =>
                updateFilter("inStock", checked ? "true" : null)
              }
            />
            <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
              Solo en stock
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="featured"
              checked={searchParams.get("isFeatured") === "true"}
              onCheckedChange={(checked) =>
                updateFilter("isFeatured", checked ? "true" : null)
              }
            />
            <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
              Solo ofertas
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceRangeControl({
  initialRange,
  max,
  min,
  onCommit,
  step,
}: {
  initialRange: [number, number];
  max: number;
  min: number;
  onCommit: (min: number, max: number) => void;
  step: number;
}) {
  const [priceRange, setPriceRange] = useState<[number, number]>(initialRange);

  return (
    <>
      <Slider
        min={min}
        max={max}
        step={step}
        value={priceRange}
        onValueChange={(value) => setPriceRange(value as [number, number])}
        onValueCommit={(value) => {
          const [nextMin, nextMax] = value as [number, number];
          onCommit(nextMin, nextMax);
        }}
        className="mb-3"
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{formatPrice(priceRange[0])}</span>
        <span>{formatPrice(priceRange[1])}</span>
      </div>
    </>
  );
}
