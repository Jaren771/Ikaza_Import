"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CatalogCategory,
  CatalogPriceBounds,
  ProductFiltersPanel,
} from "@/components/catalog/ProductFiltersPanel";
import { SlidersHorizontal } from "lucide-react";

interface MobileFiltersSheetProps {
  categories: CatalogCategory[];
  currentFilters: {
    minPrice?: number;
    maxPrice?: number;
    categoryId?: string;
    inStock?: boolean;
    isFeatured?: boolean;
  };
  hasActiveFilters: boolean;
  priceBounds: CatalogPriceBounds;
}

export function MobileFiltersSheet({
  categories,
  currentFilters,
  hasActiveFilters,
  priceBounds,
}: MobileFiltersSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="lg:hidden flex items-center gap-2 mb-4 rounded-lg border bg-white px-4 py-2 text-sm font-medium"
          type="button"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span
              className="ml-1 rounded-full px-1.5 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: "#006065" }}
            >
              !
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[90vw] overflow-y-auto p-0 sm:max-w-sm">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Ajusta el catálogo visible.</SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <ProductFiltersPanel
            categories={categories}
            currentFilters={currentFilters}
            priceBounds={priceBounds}
            sticky={false}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
