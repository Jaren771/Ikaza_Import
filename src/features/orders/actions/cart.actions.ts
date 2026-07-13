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
export async function serializeProduct(product: any): Promise<any> {
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
export async function serializeCart(cart: any): Promise<{ items: Array<{ id: string; cartId: string; productId: string; quantity: number; price: number; product: any }> } | null> {
  if (!cart) return null;

  const items = await Promise.all(
    cart.items.map(async (item: any) => ({
      ...item,
      price: toNumber(item.price),
      product: await serializeProduct(item.product),
    }))
  );

  return {
    ...cart,
    items,
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

  return await serializeCart(cart);
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
          basePrice: product.comparePrice ?? product.price, // Patrón 4: Guardar precio original
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
 * Elimina un item del carrito por id de CartItem
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
 * Actualiza la cantidad usando productId (útil para el carrito local)
 */
export async function updateProductQuantityAction(
  productId: string,
  quantity: number
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  try {
    const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
    if (!cart) return { success: false, error: "Carrito no encontrado" };

    const cartItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } }
    });

    if (cartItem) {
      if (quantity <= 0) {
        await prisma.cartItem.delete({ where: { id: cartItem.id } });
      } else {
        await prisma.cartItem.update({
          where: { id: cartItem.id },
          data: { quantity },
        });
      }
      revalidatePath("/cart");
    }
    return { success: true, data: null };
  } catch (error) {
    console.error("[updateProductQuantityAction]", error);
    return { success: false, error: "Error al actualizar" };
  }
}

/**
 * Elimina usando productId (útil para el carrito local)
 */
export async function removeProductFromCartAction(
  productId: string
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  try {
    const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
    if (!cart) return { success: false, error: "Carrito no encontrado" };

    const cartItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } }
    });

    if (cartItem) {
      await prisma.cartItem.delete({ where: { id: cartItem.id } });
      revalidatePath("/cart");
    }
    return { success: true, data: null };
  } catch (error) {
    console.error("[removeProductFromCartAction]", error);
    return { success: false, error: "Error al eliminar" };
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

/**
 * Aplica un código de cupón al carrito
 */
export async function applyCouponAction(
  code: string
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Debes iniciar sesión para usar cupones" };
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      return { success: false, error: "No tienes un carrito activo" };
    }

    if (!code) {
      // Eliminar cupón
      await prisma.cart.update({
        where: { id: cart.id },
        data: { appliedCouponCode: null },
      });
      revalidatePath("/cart");
      return { success: true, data: null, message: "Cupón removido" };
    }

    // Aquí podrías añadir lógica para buscar el cupón en la tabla Coupon si existe
    // Por ahora, lo guardamos directamente para el Checkout (Patrón 4)
    await prisma.cart.update({
      where: { id: cart.id },
      data: { appliedCouponCode: code },
    });

    revalidatePath("/cart");
    return { success: true, data: null, message: "Cupón aplicado exitosamente" };
  } catch (error) {
    console.error("[applyCouponAction]", error);
    return { success: false, error: "Error al aplicar el cupón" };
  }
}
