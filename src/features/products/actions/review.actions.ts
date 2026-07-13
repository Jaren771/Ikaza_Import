"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";
import { l1Cache } from "@/lib/cache";
import { z } from "zod";

// =============================================================================
// Server Actions — Reviews / Reseñas (Patrón 9: Anti-XSS Almacenado)
// =============================================================================

// Constantes de límite (Patrón 9 exacto de AGENTS.md)
const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 1000;

/**
 * Elimina etiquetas HTML para prevenir XSS almacenado (Patrón 9 AGENTS.md)
 */
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

const reviewSchema = z.object({
  productId: z.string().cuid("ID de producto inválido"),
  rating: z.number().min(1).max(5),
  title: z.string().max(MAX_TITLE_LENGTH).optional(),
  content: z.string().max(MAX_CONTENT_LENGTH).optional(),
});

/**
 * Crea una reseña — Solo usuarios autenticados (Patrón 9)
 */
export async function createReviewAction(
  data: z.infer<typeof reviewSchema>
): Promise<ActionResult<{ id: string }>> {
  // Solo usuarios autenticados pueden publicar comentarios (protege contra bots de spam)
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Debes iniciar sesión para dejar una reseña" };
  }

  const validation = reviewSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { productId, rating, title, content } = validation.data;

  // Sanitizar: eliminar HTML y limitar caracteres (Patrón 9 exacto)
  const ratingValue = Math.min(5, Math.max(1, Math.round(Number(rating))));
  const cleanTitle = title ? stripHtml(title).slice(0, MAX_TITLE_LENGTH) : undefined;
  const cleanContent = content ? stripHtml(content).slice(0, MAX_CONTENT_LENGTH) : undefined;

  try {
    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId, status: "ACTIVE" },
      select: { id: true, name: true },
    });

    if (!product) {
      return { success: false, error: "Producto no encontrado" };
    }

    // Verificar si el usuario ya dejó una reseña para este producto
    const existing = await prisma.review.findFirst({
      where: { productId, userId: session.user.id },
    });

    if (existing) {
      return { success: false, error: "Ya dejaste una reseña para este producto" };
    }

    // Verificar que el usuario compró el producto (evita reseñas falsas)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: { in: ["DELIVERED", "SHIPPED"] },
        },
      },
    });

    if (!hasPurchased) {
      return { success: false, error: "Solo puedes reseñar productos que hayas comprado y recibido" };
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating: ratingValue,
        title: cleanTitle,
        content: cleanContent,
        isApproved: false, // Pendiente de aprobación del admin
      },
    });

    // Invalidar caché del producto para que la nueva reseña aparezca (Patrón 12)
    l1Cache.clear();

    return { success: true, data: { id: review.id }, message: "¡Gracias por tu reseña!" };
  } catch (error) {
    console.error("[createReviewAction]", error);
    return { success: false, error: "Error al guardar la reseña" };
  }
}

/**
 * Obtiene reseñas de un producto (pública)
 */
export async function getProductReviewsAction(productId: string) {
  return l1Cache.wrap(`reviews_${productId}`, async () => {
    try {
      return await prisma.review.findMany({
        where: { productId, isApproved: true },
        include: {
          user: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    } catch (error) {
      console.error("[getProductReviewsAction]", error);
      return [];
    }
  });
}
