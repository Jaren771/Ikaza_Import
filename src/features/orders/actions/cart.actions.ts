"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

// =============================================================================
// Server Actions — Carrito de Compras
// =============================================================================

/**
 * Serializa un producto para enviarlo al cliente (convierte Decimals a números)
 */
export function serializeProduct(product: any): any {
  if (!product) return null;

  // Campos numéricos que pueden ser Decimal
  const numericFields = ["price", "comparePrice", "costPrice", "weight", "width", "height", "depth"];

  return numericFields.reduce(
    (acc: any, field: string) => {
      if (field in product) {
        acc[field] = product[field] ? toNumber(product[field]) : null;
      }
      return acc;
    },
    { ...product }
  );
}

/**
 * Serializa el carrito para enviarlo al cliente (convierte Decimals a números)
 */
export function serializeCart(cart: any) {
  if (!cart) return null;

  return {
    ...cart,
    items: cart.items.map((item: any) => ({
      ...item,
      price: toNumber(item.price),
      product: serializeProduct(item.product),
    })),
  };
}

/**
 * Obtiene el carrito del usuario autenticado
 */
export async function getCartAction() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              inventory: { select: { quantity: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return serializeCart(cart);
}

/**
 * Añade un producto al carrito
 */
export async function addToCartAction(
  productId: string,
  quantity: number = 1
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Debes iniciar sesión" };
  }

  try {
    // Verificar que el producto existe y tiene stock
    const product = await prisma.product.findUnique({
      where: { id: productId, status: "ACTIVE" },
      include: { inventory: true },
    });

    if (!product) {
      return { success: false, error: "Producto no disponible" };
    }

    const availableStock = (product.inventory?.quantity ?? 0) - (product.inventory?.reservedQuantity ?? 0);

    if (availableStock < quantity) {
      return { success: false, error: `Solo hay ${availableStock} unidades disponibles` };
    }

    // Obtener o crear carrito
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: session.user.id } });
    }

    // Verificar si ya está en el carrito
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > availableStock) {
        return { success: false, error: "Stock insuficiente" };
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          price: product.price,
        },
      });
    }

    revalidatePath("/cart");
    return { success: true, data: null, message: "Producto añadido al carrito" };
  } catch (error) {
    console.error("[addToCartAction]", error);
    return { success: false, error: "Error al añadir al carrito" };
  }
}

/**
 * Actualiza la cantidad de un item del carrito
 */
export async function updateCartItemAction(
  itemId: string,
  quantity: number
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  try {
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    revalidatePath("/cart");
    return { success: true, data: null };
  } catch (error) {
    console.error("[updateCartItemAction]", error);
    return { success: false, error: "Error al actualizar el carrito" };
  }
}

/**
 * Elimina un item del carrito
 */
export async function removeFromCartAction(
  itemId: string
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  try {
    await prisma.cartItem.delete({ where: { id: itemId } });
    revalidatePath("/cart");
    return { success: true, data: null };
  } catch (error) {
    console.error("[removeFromCartAction]", error);
    return { success: false, error: "Error al eliminar del carrito" };
  }
}

/**
 * Vacía el carrito completo
 */
export async function clearCartAction(): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    revalidatePath("/cart");
    return { success: true, data: null };
  } catch (error) {
    console.error("[clearCartAction]", error);
    return { success: false, error: "Error al vaciar el carrito" };
  }
}

/**
 * Añade/quita un producto de la lista de deseos
 */
export async function toggleWishlistAction(
  productId: string
): Promise<ActionResult<{ inWishlist: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Debes iniciar sesión" };
  }

  try {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: session.user.id },
      });
    }

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: { wishlistId: wishlist.id, productId },
      },
    });

    if (existingItem) {
      await prisma.wishlistItem.delete({ where: { id: existingItem.id } });
      revalidatePath("/wishlist");
      return { success: true, data: { inWishlist: false } };
    } else {
      await prisma.wishlistItem.create({
        data: { wishlistId: wishlist.id, productId },
      });
      revalidatePath("/wishlist");
      return { success: true, data: { inWishlist: true } };
    }
  } catch (error) {
    console.error("[toggleWishlistAction]", error);
    return { success: false, error: "Error al actualizar la lista de deseos" };
  }
}
