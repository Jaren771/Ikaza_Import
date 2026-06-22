"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        brand: true,
        inventory: true,
        images: {
          where: { isPrimary: true },
          take: 1
        }
      }
    });
    
    // Necesitamos cargar también las categorías y marcas para los selectores del formulario
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
    // Serializar para evitar el error de "Only plain objects can be passed to Client Components" por los Decimal de Prisma
    const safeData = JSON.parse(JSON.stringify({ products, categories, brands }));
    return { success: true, data: safeData };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: "Error al cargar productos" };
  }
}

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const price = parseFloat(formData.get("price") as string);
    const categoryId = formData.get("categoryId") as string;
    const brandId = formData.get("brandId") as string || undefined;
    const status = formData.get("status") as any || "ACTIVE";
    const imageUrl = formData.get("imageUrl") as string;
    const stock = parseInt(formData.get("stock") as string) || 0;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString().substring(8);
    const shortDescription = formData.get("description") as string || name;

    if (!name || !sku || isNaN(price) || !categoryId) {
      return { success: false, error: "Faltan campos obligatorios" };
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        price,
        shortDescription,
        description: shortDescription,
        status,
        categoryId,
        brandId,
        inventory: {
          create: { quantity: stock, minStock: 5 }
        },
        ...(imageUrl ? {
          images: {
            create: [{ url: imageUrl, isPrimary: true, position: 0 }]
          }
        } : {})
      },
    });

    revalidatePath("/admin/products");
    return { success: true, data: product };
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error.code === 'P2002') return { success: false, error: "El SKU o el Slug ya existe." };
    return { success: false, error: "Error al crear el producto." };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Error al eliminar el producto." };
  }
}
