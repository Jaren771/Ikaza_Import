"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getWishlist() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Debes iniciar sesión para ver tu lista de deseos." };
    }

    const wishlist = await prisma.wishlist.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 }, inventory: true }
            }
          }
        }
      }
    });

    return { success: true, data: JSON.parse(JSON.stringify(wishlist)) };
  } catch (error) {
    return { success: false, error: "Error al cargar tu lista de deseos." };
  }
}

export async function removeFromWishlist(itemId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "No autorizado" };

    await prisma.wishlistItem.delete({
      where: { id: itemId }
    });

    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar el producto." };
  }
}
