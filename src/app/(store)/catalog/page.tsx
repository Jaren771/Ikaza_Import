import { Suspense } from "react";
import { getProductsAction, getCategoriesAction } from "@/features/products/actions/product.actions";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductFiltersPanel } from "@/components/catalog/ProductFiltersPanel";
import { Pagination } from "@/components/shared/Pagination";
import { ProductGridSkeleton } from "@/components/catalog/ProductGridSkeleton";
import type { Metadata } from "next";
import { SlidersHorizontal, Grid2X2, LayoutList } from "lucide-react";

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
  }>;
}

export const metadata: Metadata = {
  title: "Catálogo de Productos",
  description: "Explora nuestra amplia selección de productos importados de calidad para el hogar, cocina, tecnología y más.",
};

// =============================================================================
// Página de Catálogo — Con filtros dinámicos y paginación
// Basado en el wireframe "Catálogo - ikaZa Import" de Stitch
// =============================================================================

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const filters = {
    search: params.search,
    categoryId: params.category,
    subcategoryId: params.subcategory,
    brandId: params.brand,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    sortBy: params.sortBy as "price_asc" | "price_desc" | "newest" | "popular" | "name" | undefined,
    page: params.page ? parseInt(params.page) : 1,
    limit: 12,
    isFeatured: params.isFeatured === "true" ? true : undefined,
    inStock: params.inStock === "true" ? true : undefined,
  };

  const [products, categories] = await Promise.all([
    getProductsAction(filters),
    getCategoriesAction(),
  ]);

  const hasActiveFilters = !!(
    params.search ||
    params.category ||
    params.brand ||
    params.minPrice ||
    params.maxPrice ||
    params.isFeatured ||
    params.inStock
  );

  return (
    <div className="ikaza-container py-6">
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li><a href="/" className="hover:text-foreground">Inicio</a></li>
          <li>/</li>
          <li className="text-foreground font-medium">Catálogo</li>
          {params.search && (
            <>
              <li>/</li>
              <li className="text-foreground">"{params.search}"</li>
            </>
          )}
        </ol>
      </nav>

      {/* Header del catálogo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline text-2xl font-bold">
            {params.search
              ? `Resultados para "${params.search}"`
              : params.isFeatured === "true"
              ? "Productos en Oferta"
              : "Catálogo de Productos"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.meta.total > 0
              ? `${products.meta.total} productos encontrados`
              : "No se encontraron productos"}
          </p>
        </div>

        {/* Sort + View options */}
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            defaultValue={params.sortBy ?? "newest"}
            aria-label="Ordenar por"
          >
            <option value="newest">Más recientes</option>
            <option value="price_asc">Precio: Menor a mayor</option>
            <option value="price_desc">Precio: Mayor a menor</option>
            <option value="popular">Más populares</option>
            <option value="name">Nombre A-Z</option>
          </select>

          <div className="hidden sm:flex items-center gap-1 rounded-lg border bg-white p-1">
            <button className="rounded p-1.5 text-muted-foreground hover:bg-muted" aria-label="Vista cuadrícula">
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5 text-muted-foreground hover:bg-muted" aria-label="Vista lista">
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filtros sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <ProductFiltersPanel
            categories={categories}
            currentFilters={filters}
          />
        </aside>

        {/* Grid de productos */}
        <div className="flex-1 min-w-0">
          {/* Mobile filters button */}
          <button className="lg:hidden flex items-center gap-2 mb-4 rounded-lg border bg-white px-4 py-2 text-sm font-medium">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 rounded-full px-1.5 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: "#006065" }}>
                !
              </span>
            )}
          </button>

          {/* Products grid */}
          {products.data.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginación */}
              {products.meta.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={products.meta.page}
                    totalPages={products.meta.totalPages}
                    baseUrl="/catalog"
                    searchParams={params}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="font-headline text-xl font-semibold mb-2">
                No encontramos productos
              </h2>
              <p className="text-muted-foreground mb-6">
                Intenta con otros términos de búsqueda o ajusta los filtros
              </p>
              <a
                href="/catalog"
                className="btn-ikaza-primary"
              >
                Ver todos los productos
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
