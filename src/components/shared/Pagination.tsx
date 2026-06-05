"use client";

import Link from "next/link";
import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string | undefined>;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
}: PaginationProps) {
  const buildPageUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, val]) => {
        if (val && key !== "page") params.set(key, val);
      });
      params.set("page", String(page));
      return `${baseUrl}?${params.toString()}`;
    },
    [baseUrl, searchParams]
  );

  // Genera rangos de páginas con ellipsis
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    const range = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) pages.push(1, "...");
    else pages.push(1);

    pages.push(...range);

    if (currentPage + delta < totalPages - 1) pages.push("...", totalPages);
    else if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1">
      {/* Anterior */}
      <Link
        href={buildPageUrl(currentPage - 1)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors",
          currentPage <= 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-muted"
        )}
        aria-label="Página anterior"
        aria-disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {/* Números */}
      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildPageUrl(page)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
              currentPage === page
                ? "text-white"
                : "border hover:bg-muted"
            )}
            style={currentPage === page ? { backgroundColor: "#006065" } : {}}
            aria-label={`Página ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Link>
        )
      )}

      {/* Siguiente */}
      <Link
        href={buildPageUrl(currentPage + 1)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors",
          currentPage >= totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-muted"
        )}
        aria-label="Página siguiente"
        aria-disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
