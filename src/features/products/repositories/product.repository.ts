import { BaseRepository } from "@/repositories/base/BaseRepository";
import type { PaginatedResponse, ProductFilters, ProductWithRelations } from "@/types";
import { Prisma } from "@prisma/client";

function serializeProduct<T extends object>(product: T): T {
  const serialized = { ...product } as Record<string, unknown>;
  const numericFields = [
    "price",
    "comparePrice",
    "costPrice",
    "weight",
    "width",
    "height",
    "depth",
  ] as const;

  numericFields.forEach((field) => {
    if (field in serialized) {
      serialized[field] =
        serialized[field] === null || serialized[field] === undefined
          ? null
          : Number(serialized[field]);
    }
  });

  return serialized as T;
}

function buildProductWhere(filters: ProductFilters): Prisma.ProductWhereInput {
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
  } = filters;

  const priceFilter: Prisma.DecimalFilter<"Product"> = {};
  if (minPrice !== undefined) priceFilter.gte = minPrice;
  if (maxPrice !== undefined) priceFilter.lte = maxPrice;

  return {
    status: status as Prisma.ProductWhereInput["status"],
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ],
    }),
    ...(categoryId && {
      category: { OR: [{ id: categoryId }, { slug: categoryId }] },
    }),
    ...(subcategoryId && {
      subcategory: { OR: [{ id: subcategoryId }, { slug: subcategoryId }] },
    }),
    ...(brandId && { brandId }),
    ...(Object.keys(priceFilter).length > 0 && { price: priceFilter }),
    ...(isFeatured !== undefined && { isFeatured }),
    ...(inStock && {
      inventory: { quantity: { gt: 0 } },
    }),
  };
}

export class ProductRepository extends BaseRepository {
  async findMany(filters: ProductFilters): Promise<PaginatedResponse<ProductWithRelations>> {
    const { sortBy = "newest", page = 1, limit = 12 } = filters;
    const where = buildProductWhere(filters);
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

    const enriched = data.map((product) => ({
      ...serializeProduct(product),
      avgRating:
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          : 0,
      reviewCount: product.reviews.length,
    }));

    return {
      data: enriched as unknown as ProductWithRelations[],
      meta: this.buildPaginationMeta(total, page, limit),
    };
  }

  async getPriceBounds(filters: ProductFilters = {}) {
    const where = buildProductWhere({
      ...filters,
      minPrice: undefined,
      maxPrice: undefined,
    });

    const bounds = await this.db.product.aggregate({
      where,
      _min: { price: true },
      _max: { price: true },
    });

    return {
      min: bounds._min.price ? Number(bounds._min.price) : 0,
      max: bounds._max.price ? Number(bounds._max.price) : 0,
    };
  }

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

  async create(data: Prisma.ProductCreateInput) {
    return this.db.product.create({ data });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return this.db.product.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.db.product.update({
      where: { id },
      data: { status: "DISCONTINUED" },
    });
  }

  private buildOrderBy(sortBy: string): Prisma.ProductOrderByWithRelationInput {
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

export const productRepository = new ProductRepository();
