import { prisma } from "@/lib/prisma";
import type { PaginationMeta } from "@/types";

// =============================================================================
// Repository Base — Patrón Repository (SOLID - Dependency Inversion)
// Abstrae el acceso a datos permitiendo cambiar el ORM sin modificar
// la lógica de negocio.
// =============================================================================

export abstract class BaseRepository {
  protected readonly db = prisma;

  /**
   * Construye los metadatos de paginación estándar
   */
  protected buildPaginationMeta(
    total: number,
    page: number,
    limit: number
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Calcula el offset para paginación basada en página y límite
   */
  protected getOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
