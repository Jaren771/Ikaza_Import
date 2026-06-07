"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productRepository } from "@/features/products/repositories/product.repository";
import { productSchema, productFilterSchema } from "@/features/products/validators/product.schema";
import { serializeProduct } from "@/features/orders/actions/cart.actions";
import { toNumber } from "@/lib/utils";
import type { ActionResult, ProductFilters } from "@/types";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils";
import { filterMockProducts, getMockCategories, MOCK_PRODUCTS } from "@/lib/mock-products";

// =============================================================================
// Server Actions — Productos
// =============================================================================

/**
 * Obtiene lista de productos con filtros (pública)
 */
export async function getProductsAction(filters: ProductFilters) {
  const validation = productFilterSchema.safeParse(filters);
  if (!validation.success) {
    return { success: false, error: "Filtros inválidos" };
  }

  let dbProducts: any[] = [];
  let dbMeta: any = null;

  try {
    const result = await productRepository.findMany(validation.data);
    if (result.data.length > 0) {
      dbProducts = result.data;
      dbMeta = result.meta;
    }
  } catch (error) {
    console.error("DB connection error in getProductsAction:", error);
  }

  if (dbProducts.length > 0) {
    return {
      success: true,
      data: {
        products: await Promise.all(dbProducts.map(p => serializeProduct(p))),
        meta: dbMeta,
      }
    };
  }

  const { data, meta } = filterMockProducts(validation.data);
  return { success: true, data: { products: data, meta } };
}

/**
 * Obtiene un producto por slug (pública)
 */
export async function getProductBySlugAction(slug: string) {
  try {
    const product = await productRepository.findBySlug(slug);
    if (product) return await serializeProduct(product);
  } catch (error) {
    console.error("DB connection error in getProductBySlugAction:", error);
  }

  const mock = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (mock) return mock;

  return MOCK_PRODUCTS[0] as any;
}

/**
 * Obtiene productos destacados (pública)
 */
export async function getFeaturedProductsAction(limit = 8) {
  try {
    return await productRepository.findFeatured(limit);
  } catch (error) {
    console.error("DB connection error in getFeaturedProductsAction:", error);
    return MOCK_PRODUCTS.filter((p) => p.isFeatured).slice(0, limit);
  }
}

/**
 * Obtiene productos relacionados (pública)
 */
export async function getRelatedProductsAction(
  productId: string,
  categoryId: string | null
) {
  try {
    return await productRepository.findRelated(productId, categoryId);
  } catch (error) {
    console.error("DB connection error in getRelatedProductsAction:", error);
    const related = MOCK_PRODUCTS.filter(
      (p) => p.id !== productId && (!categoryId || p.categoryId === categoryId)
    ).slice(0, 4);
    return related as any[];
  }
}

/**
 * Crea un nuevo producto (solo ADMIN)
 */
export async function createProductAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();

  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role!)) {
    return { success: false, error: "No autorizado" };
  }

  const validation = productSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { price, comparePrice, costPrice, weight, ...rest } = validation.data;

    const product = await prisma.product.create({
      data: {
        ...rest,
        slug: rest.slug || generateSlug(rest.name),
        price,
        comparePrice: comparePrice ?? null,
        costPrice: costPrice ?? null,
        weight: weight ?? null,
        // Crear inventario inicial
        inventory: {
          create: {
            quantity: 0,
            minStock: 5,
          },
        },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/catalog");

    return { success: true, data: { id: product.id }, message: "Producto creado" };
  } catch (error) {
    console.error("[createProductAction]", error);
    return { success: false, error: "Error al crear el producto" };
  }
}

/**
 * Actualiza un producto (solo ADMIN)
 */
export async function updateProductAction(
  id: string,
  data: unknown
): Promise<ActionResult<null>> {
  const session = await auth();

  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role!)) {
    return { success: false, error: "No autorizado" };
  }

  const validation = productSchema.partial().safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: validation.data,
    });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${validation.data.slug ?? id}`);

    return { success: true, data: null, message: "Producto actualizado" };
  } catch (error) {
    console.error("[updateProductAction]", error);
    return { success: false, error: "Error al actualizar el producto" };
  }
}

/**
 * Elimina un producto (soft delete)
 */
export async function deleteProductAction(
  id: string
): Promise<ActionResult<null>> {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "No autorizado" };
  }

  try {
    await productRepository.softDelete(id);
    revalidatePath("/admin/products");
    return { success: true, data: null, message: "Producto eliminado" };
  } catch (error) {
    console.error("[deleteProductAction]", error);
    return { success: false, error: "Error al eliminar el producto" };
  }
}

/**
 * Obtiene categorías activas (pública)
 */
export async function getCategoriesAction() {
  try {
    const cats = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        _count: { select: { products: true } },
      },
    });
    if (cats.length > 0) return cats;
  } catch (error) {
    console.error("DB connection error in getCategoriesAction:", error);
  }
  return getMockCategories() as any;
}
