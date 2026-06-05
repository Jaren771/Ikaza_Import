"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories?: { id: string; name: string; slug: string }[];
}

interface ProductFiltersPanelProps {
  categories: Category[];
  currentFilters: {
    minPrice?: number;
    maxPrice?: number;
    categoryId?: string;
    inStock?: boolean;
    isFeatured?: boolean;
  };
}

// =============================================================================
// Panel de Filtros — Sidebar del catálogo
// Slider de precio, categorías, disponibilidad
// ============================================================================= 

export function ProductFiltersPanel({ categories, currentFilters }: ProductFiltersPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState<[number, number]>([
    currentFilters.minPrice ?? 0,
    currentFilters.maxPrice ?? 5000,
  ]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = searchParams.has("category") ||
    searchParams.has("minPrice") ||
    searchParams.has("maxPrice") ||
    searchParams.has("inStock") ||
    searchParams.has("isFeatured");

  return (
    <div className="rounded-xl border bg-white p-4 space-y-5 sticky top-20">
      {/* Header filtros */}
      <div className="flex items-center justify-between">
        <h2 className="font-headline font-semibold">Filtros</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-3 w-3" />
            Limpiar todo
          </button>
        )}
      </div>

      <Separator />

      {/* Categorías */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Categorías</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter("category", null)}
            className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
              !searchParams.has("category")
                ? "font-semibold text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
            style={!searchParams.has("category") ? { backgroundColor: "#006065" } : {}}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => updateFilter("category", cat.slug)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  searchParams.get("category") === cat.slug
                    ? "font-semibold text-white"
                    : "text-foreground hover:bg-muted"
                }`}
                style={
                  searchParams.get("category") === cat.slug
                    ? { backgroundColor: "#006065" }
                    : {}
                }
              >
                {cat.name}
              </button>
              {/* Subcategorías */}
              {searchParams.get("category") === cat.slug && cat.subcategories?.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => updateFilter("subcategory", sub.slug)}
                  className="w-full text-left pl-6 pr-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {sub.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Precio */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Precio</h3>
        <div className="px-1">
          <Slider
            min={0}
            max={5000}
            step={50}
            value={priceRange}
            onValueChange={(val) => setPriceRange(val as [number, number])}
            onValueCommit={(val) => {
              const [min, max] = val as [number, number];
              updateFilter("minPrice", min > 0 ? String(min) : null);
              updateFilter("maxPrice", max < 5000 ? String(max) : null);
            }}
            className="mb-3"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Disponibilidad */}
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
