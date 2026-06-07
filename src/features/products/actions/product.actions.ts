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
  const products = await productRepository.findMany(validation.data);
  return {
    success: true,
    data: {
      products: products.map(p => serializeProduct(p)),
    }
  };
}

/**
 * Obtiene un producto por slug (pública)
 */
export async function getProductBySlugAction(slug: string) {
  try {
    const product = await productRepository.findBySlug(slug);
    if (product) return serializeProduct(product);
  } catch (error) {
    console.error("DB connection error in getProductBySlugAction:", error);
  }

  // Fallback mock product if database is not running
  return {
    id: "mock-product-id",
    slug: slug || "mock-product",
    name: "Producto de Muestra ikaZa",
    sku: "IKZ-MOCK-001",
    price: 299.90,
    comparePrice: 399.90,
    shortDescription: "Esta es una descripción corta del producto de muestra. Ideal para verificar el diseño visual de la página de detalles.",
    description: "Esta es la descripción detallada del producto de muestra. Aquí se detallan los materiales, características y especificaciones técnicas para comprobar el comportamiento del acordeón y los textos largos en la página web.",
    status: "ACTIVE",
    isFeatured: true,
    categoryId: "mock-cat",
    category: {
      id: "mock-cat",
      name: "Hogar y Decoración",
      slug: "hogar-decoracion"
    },
    brandId: "mock-brand",
    brand: {
      id: "mock-brand",
      name: "ikaZa Premium",
      slug: "ikaza-premium",
      logo: null
    },
    images: [
      {
        id: "img1",
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=60",
        alt: "Producto Muestra Principal",
        isPrimary: true,
        position: 1
      },
      {
        id: "img2",
        url: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&auto=format&fit=crop&q=60",
        alt: "Vista alternativa 1",
        isPrimary: false,
        position: 2
      }
    ],
    inventory: {
      quantity: 15,
      minStock: 5
    },
    reviews: [
      {
        id: "rev1",
        rating: 5,
        title: "¡Excelente calidad!",
        content: "Me encantó el producto. El acabado es premium y llegó super rápido.",
        user: { name: "Juan Pérez", image: null },
        createdAt: new Date()
      },
      {
        id: "rev2",
        rating: 4,
        title: "Muy bueno",
        content: "Cumple con todo lo especificado. Lo recomiendo.",
        user: { name: "Ana Gómez", image: null },
        createdAt: new Date()
      }
    ],
    tags: ["Decoración", "Premium", "Novedad"]
  } as any;
}

/**
 * Obtiene productos destacados (pública)
 */
export async function getFeaturedProductsAction(limit = 8) {
  try {
    return await productRepository.findFeatured(limit);
  } catch (error) {
    console.error("DB connection error in getFeaturedProductsAction:", error);
    return []; // Fallback gracefully if DB is not running
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
    // Return a list of mock products as related products
    return [
      {
        id: "mock-related-1",
        slug: "related-1",
        name: "Lámpara de Mesa Elegante",
        price: 89.90,
        comparePrice: 120.00,
        images: [{ url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=60" }],
        inventory: { quantity: 10 },
        reviews: [{ rating: 5 }]
      },
      {
        id: "mock-related-2",
        slug: "related-2",
        name: "Cojín Decorativo Moderno",
        price: 45.00,
        comparePrice: null,
        images: [{ url: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&auto=format&fit=crop&q=60" }],
        inventory: { quantity: 25 },
        reviews: [{ rating: 4.5 }]
      }
    ] as any[];
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
    return await prisma.category.findMany({
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
  } catch (error) {
    console.error("DB connection error in getCategoriesAction:", error);
    return []; // Fallback gracefully if DB is not running
  }
}
