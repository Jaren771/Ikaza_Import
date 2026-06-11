import { BaseRepository } from "@/repositories/base/BaseRepository";
import type { ProductFilters, ProductWithRelations, PaginatedResponse } from "@/types";
import { Prisma } from "@prisma/client";

// =============================================================================
// Product Repository — Acceso a datos de productos
// 
// PRINCIPIOS SOLID APLICADOS:
// - Single Responsibility Principle (SRP): Esta clase se encarga exclusivamente de 
//   interactuar con la base de datos para realizar operaciones sobre los productos.
// - Liskov Substitution Principle (LSP): Hereda de BaseRepository y utiliza sus métodos
//   auxiliares (como getOffset y buildPaginationMeta) respetando su firma y semántica.
// =============================================================================

/**
 * Convierte todos los campos Decimal de un producto a number
 * Necesario para serializar productos de Server Components a Client Components
 */
function serializeProduct(product: any): any {
  return {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weight: product.weight ? Number(product.weight) : null,
    width: product.width ? Number(product.width) : null,
    height: product.height ? Number(product.height) : null,
    depth: product.depth ? Number(product.depth) : null,
  };
}

export class ProductRepository extends BaseRepository {
  /**
   * Obtiene productos con filtros, paginación y relaciones
   */
  async findMany(filters: ProductFilters): Promise<PaginatedResponse<ProductWithRelations>> {
    const {
      search,
      categoryId,
      subcategoryId,
      brandId,
      minPrice,
      maxPrice,
      status = "ACTIVE",
      isFeatured,
      inStock,
      sortBy = "newest",
      page = 1,
      limit = 12,
    } = filters;

    // Construir cláusula WHERE dinámicamente
    const where: Prisma.ProductWhereInput = {
      status: status as Prisma.EnumProductStatusFilter,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
          { tags: { has: search } },
        ],
      }),
      ...(categoryId && {
        category: { OR: [{ id: categoryId }, { slug: categoryId }] }
      }),
      ...(subcategoryId && {
        subcategory: { OR: [{ id: subcategoryId }, { slug: subcategoryId }] }
      }),
      ...(brandId && { brandId }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(inStock && {
        inventory: { quantity: { gt: 0 } },
      }),
    };

    // Mapear sortBy a orderBy de Prisma
    const orderBy = this.buildOrderBy(sortBy);

    const offset = this.getOffset(page, limit);

    const [data, total] = await Promise.all([
      this.db.product.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          subcategory: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true, logo: true } },
          images: {
            orderBy: { position: "asc" },
            select: { id: true, url: true, alt: true, isPrimary: true, position: true },
          },
          inventory: {
            select: { quantity: true, reservedQuantity: true },
          },
          reviews: { select: { rating: true } },
        },
      }),
      this.db.product.count({ where }),
    ]);

    // Calcular rating promedio
    const enriched = data.map((product) => ({
      ...serializeProduct(product),
      avgRating:
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0,
      reviewCount: product.reviews.length,
    }));

    return {
      data: enriched as unknown as ProductWithRelations[],
      meta: this.buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Obtiene un producto por su slug con todas las relaciones
   */
  async findBySlug(slug: string): Promise<ProductWithRelations | null> {
    const product = await this.db.product.findUnique({
      where: { slug, status: "ACTIVE" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        images: { orderBy: { position: "asc" } },
        inventory: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        variants: { where: { isActive: true } },
      },
    });

    if (!product) return null;

    return serializeProduct(product) as unknown as ProductWithRelations;
  }

  /**
   * Obtiene productos relacionados por categoría
   */
  async findRelated(
    productId: string,
    categoryId: string | null,
    limit: number = 8
  ): Promise<ProductWithRelations[]> {
    const products = await this.db.product.findMany({
      where: {
        status: "ACTIVE",
        id: { not: productId },
        ...(categoryId && { categoryId }),
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        inventory: { select: { quantity: true } },
        reviews: { select: { rating: true } },
      },
    });

    return products.map(serializeProduct) as unknown as ProductWithRelations[];
  }

  /**
   * Obtiene productos destacados para la página de inicio
   */
  async findFeatured(limit: number = 8): Promise<ProductWithRelations[]> {
    const products = await this.db.product.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        brand: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1 },
        inventory: { select: { quantity: true } },
        reviews: { select: { rating: true } },
      },
    });

    return products.map(serializeProduct) as unknown as ProductWithRelations[];
  }

  /**
   * Obtiene un producto por ID (para admin)
   */
  async findById(id: string) {
    const product = await this.db.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        brand: true,
        supplier: true,
        images: { orderBy: { position: "asc" } },
        inventory: true,
        variants: true,
        reviews: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });
    
    return product ? serializeProduct(product) : null;
  }

  /**
   * Crea un nuevo producto
   */
  async create(data: Prisma.ProductCreateInput) {
    return this.db.product.create({ data });
  }

  /**
   * Actualiza un producto
   */
  async update(id: string, data: Prisma.ProductUpdateInput) {
    return this.db.product.update({ where: { id }, data });
  }

  /**
   * Elimina un producto (soft delete - cambia status a DISCONTINUED)
   */
  async softDelete(id: string) {
    return this.db.product.update({
      where: { id },
      data: { status: "DISCONTINUED" },
    });
  }

  /**
   * Construye el orderBy para Prisma basado en sortBy
   */
  private buildOrderBy(
    sortBy: string
  ): Prisma.ProductOrderByWithRelationInput {
    switch (sortBy) {
      case "price_asc":
        return { price: "asc" };
      case "price_desc":
        return { price: "desc" };
      case "name":
        return { name: "asc" };
      case "popular":
        return { orderItems: { _count: "desc" } };
      case "newest":
      default:
        return { createdAt: "desc" };
    }
  }
}

// Singleton para reutilizar en Server Actions
export const productRepository = new ProductRepository();
