"use server";

import { prisma } from "@/lib/prisma";
import { calculateDiscount, toNumber } from "@/lib/utils";
import type { CartItem } from "@/store/cart";

export async function validateCartItems(items: CartItem[]): Promise<{ validItems: CartItem[], hasChanges: boolean }> {
  if (!items || items.length === 0) return { validItems: [], hasChanges: false };

  const productIds = items.map(item => item.productId || item.id);
  
  const dbProducts = await prisma.product.findMany({
    where: { 
      id: { in: productIds },
      status: "ACTIVE",
    },
    select: {
      id: true,
      price: true,
      comparePrice: true,
      name: true,
      slug: true,
      images: {
        where: { isPrimary: true },
        take: 1
      },
      inventory: {
        select: {
          quantity: true
        }
      }
    }
  });

  let hasChanges = false;
  const validItems: CartItem[] = [];

  for (const item of items) {
    const dbProduct = dbProducts.find(p => p.id === (item.productId || item.id));

    // 1. Si no existe o no está activo, se descarta (tiene cambios)
    if (!dbProduct) {
      hasChanges = true;
      continue;
    }

    // 2. Comprobar stock (si es 0, descartar; si es menor a la cantidad pedida, reducir cantidad)
    const availableStock = dbProduct.inventory?.quantity || 0;
    if (availableStock <= 0) {
      hasChanges = true;
      continue;
    }

    let finalQuantity = item.quantity;
    if (item.quantity > availableStock) {
      finalQuantity = availableStock;
      hasChanges = true;
    }

    // 3. Verificar precio base y precio con descuento
    const dbPrice = toNumber(dbProduct.price);
    const dbComparePrice = dbProduct.comparePrice ? toNumber(dbProduct.comparePrice) : null;
    const finalPrice = dbPrice; // En el carrito el 'price' es lo que el cliente paga
    
    // Si el precio base o el precio actual han cambiado
    if (item.price !== finalPrice || item.basePrice !== dbPrice) {
      hasChanges = true;
    }

    // Validar nombre y slug por si cambiaron en BD
    if (item.name !== dbProduct.name || item.slug !== dbProduct.slug) {
      hasChanges = true;
    }

    validItems.push({
      ...item,
      id: item.id,
      productId: item.productId || item.id,
      name: dbProduct.name,
      slug: dbProduct.slug,
      price: finalPrice,
      basePrice: dbPrice,
      quantity: finalQuantity,
      image: dbProduct.images?.[0]?.url || item.image,
    });
  }

  return { validItems, hasChanges };
}
