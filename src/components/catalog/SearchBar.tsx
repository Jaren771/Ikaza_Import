"use client";

import { useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

// =============================================================================
// SearchBar — Barra de búsqueda pill-shape (Stitch wireframe)
// Actualiza URL params sin recargar la página
// =============================================================================

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";
  const [isPending, startTransition] = useTransition();

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
      params.set("page", "1");
    } else {
      params.delete("search");
    }

    startTransition(() => {
      // Si estamos en una ruta de detalle, redirigir al catálogo
      const targetPath = pathname.startsWith("/products") ? "/catalog" : pathname;
      router.push(`${targetPath}?${params.toString()}`);
    });
  }, 300);

  const handleClear = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  return (
    <div className="search-bar w-full">
      <input
        id="search-input"
        type="search"
        defaultValue={currentSearch}
        placeholder="Buscar productos, marcas..."
        onChange={(e) => handleSearch(e.target.value)}
        className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        aria-label="Buscar productos"
      />
      {currentSearch && (
        <button
          onClick={handleClear}
          className="px-2 text-muted-foreground hover:text-foreground"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <button
        className="flex h-9 w-10 items-center justify-center rounded-full m-0.5 transition-colors"
        style={{ backgroundColor: "#006065" }}
        aria-label="Buscar"
        onClick={() => {
          const input = document.getElementById("search-input") as HTMLInputElement;
          handleSearch(input?.value ?? "");
        }}
      >
        <Search className="h-4 w-4 text-white" />
      </button>
    </div>
  );
}
