import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import {
  getCatalogPriceBoundsAction,
  getCategoriesAction,
  getProductsAction,
} from "@/features/products/actions/product.actions";
import { CatalogControls, type CatalogSort, type CatalogView } from "@/components/catalog/CatalogControls";
import { MobileFiltersSheet } from "@/components/catalog/MobileFiltersSheet";
import { Pagination } from "@/components/shared/Pagination";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductFiltersPanel } from "@/components/catalog/ProductFiltersPanel";

interface CatalogPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    subcategory?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: string;
    isFeatured?: string;
    inStock?: string;
    view?: string;
  }>;
}

const sortValues: CatalogSort[] = ["price_asc", "price_desc", "newest", "popular", "name"];

export const metadata: Metadata = {
  title: "Catálogo de Productos",
  description:
    "Explora nuestra selección de productos importados de calidad para el hogar, cocina, tecnología y más.",
};

function parsePositiveNumber(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parsePage(value?: string) {
  const parsed = parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function parseSort(value?: string): CatalogSort | undefined {
  return sortValues.includes(value as CatalogSort) ? (value as CatalogSort) : undefined;
}

function parseView(value?: string): CatalogView {
  return value === "list" ? "list" : "grid";
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const sortBy = parseSort(params.sortBy);
  const view = parseView(params.view);

  const filters = {
    search: params.search,
    categoryId: params.category,
    subcategoryId: params.subcategory,
    brandId: params.brand,
    minPrice: parsePositiveNumber(params.minPrice),
    maxPrice: parsePositiveNumber(params.maxPrice),
    sortBy,
    page: parsePage(params.page),
    limit: 12,
    isFeatured: params.isFeatured === "true" ? true : undefined,
    inStock: params.inStock === "true" ? true : undefined,
  };

  const [productsResult, categories, priceBoundsResult] = await Promise.all([
    getProductsAction(filters),
    getCategoriesAction(),
    getCatalogPriceBoundsAction(filters),
  ]);

  const hasActiveFilters = Boolean(
    params.search ||
      params.category ||
      params.subcategory ||
      params.brand ||
      params.minPrice ||
      params.maxPrice ||
      params.isFeatured ||
      params.inStock
  );

  const productsData =
    "data" in productsResult && productsResult.data ? productsResult.data.products : [];
  const productsMeta =
    "data" in productsResult && productsResult.data
      ? productsResult.data.meta
      : { total: 0, page: 1, limit: 12, totalPages: 0 };
  const priceBounds =
    priceBoundsResult.success && priceBoundsResult.data
      ? priceBoundsResult.data
      : { min: 0, max: 100 };

  return (
    <div className="ikaza-container py-6">
      <nav aria-label="Ruta de navegación" className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground">
              Inicio
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium">Catálogo</li>
          {params.search && (
            <>
              <li>/</li>
              <li className="text-foreground">&quot;{params.search}&quot;</li>
            </>
          )}
        </ol>
      </nav>

      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold">
            {params.search
              ? `Resultados para ${params.search}`
              : params.isFeatured === "true"
                ? "Productos en Oferta"
                : "Catálogo de Productos"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {productsMeta.total > 0
              ? `${productsMeta.total} productos encontrados`
              : "No se encontraron productos"}
          </p>
        </div>

        <CatalogControls sortBy={sortBy ?? "newest"} view={view} />
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <ProductFiltersPanel
            categories={categories}
            currentFilters={filters}
            priceBounds={priceBounds}
          />
        </aside>

        <div className="min-w-0 flex-1">
          <MobileFiltersSheet
            categories={categories}
            currentFilters={filters}
            hasActiveFilters={hasActiveFilters}
            priceBounds={priceBounds}
          />

          {productsData.length > 0 ? (
            <>
              <div
                className={
                  view === "list"
                    ? "space-y-4"
                    : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                }
              >
                {productsData.map((product) => (
                  <ProductCard key={product.id} product={product} variant={view} />
                ))}
              </div>

              {productsMeta.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={productsMeta.page}
                    totalPages={productsMeta.totalPages}
                    baseUrl="/catalog"
                    searchParams={params}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
                aria-hidden="true"
              >
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="font-headline text-xl font-semibold mb-2">
                No encontramos productos
              </h2>
              <p className="text-muted-foreground mb-6">
                Intenta con otros términos de búsqueda o ajusta los filtros
              </p>
              <Link href="/catalog" className="btn-ikaza-primary">
                Ver todos los productos
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
