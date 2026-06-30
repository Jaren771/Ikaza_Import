"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Grid2X2, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";

export type CatalogSort = "price_asc" | "price_desc" | "newest" | "popular" | "name";
export type CatalogView = "grid" | "list";

interface CatalogControlsProps {
  sortBy: CatalogSort;
  view: CatalogView;
}

const sortOptions: { value: CatalogSort; label: string }[] = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Precio: Menor a mayor" },
  { value: "price_desc", label: "Precio: Mayor a menor" },
  { value: "popular", label: "Más populares" },
  { value: "name", label: "Nombre A-Z" },
];

export function CatalogControls({ sortBy, view }: CatalogControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="Ordenar por"
        className="rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        value={sortBy}
        onChange={(event) =>
          updateParam("sortBy", event.target.value === "newest" ? null : event.target.value)
        }
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="hidden sm:flex items-center gap-1 rounded-lg border bg-white p-1">
        <button
          aria-label="Vista cuadrícula"
          className={cn(
            "rounded p-1.5 transition-colors",
            view === "grid" ? "bg-[#006065] text-white" : "text-muted-foreground hover:bg-muted"
          )}
          onClick={() => updateParam("view", null)}
          title="Vista cuadrícula"
          type="button"
        >
          <Grid2X2 className="h-4 w-4" />
        </button>
        <button
          aria-label="Vista lista"
          className={cn(
            "rounded p-1.5 transition-colors",
            view === "list" ? "bg-[#006065] text-white" : "text-muted-foreground hover:bg-muted"
          )}
          onClick={() => updateParam("view", "list")}
          title="Vista lista"
          type="button"
        >
          <LayoutList className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
