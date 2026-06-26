"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sanitizeValue } from "@/lib/validation-utils";

export async function getCoupons() {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    // Serializar para Decimal
    const safeCoupons = JSON.parse(JSON.stringify(coupons));
    return { success: true, data: safeCoupons };
  } catch (error) {
    return { success: false, error: "Error al cargar cupones" };
  }
}

export async function createCoupon(formData: FormData) {
  try {
    const code = sanitizeValue(formData.get("code") as string);
    const discountType = formData.get("discountType") as any;
    const discountValue = parseFloat(formData.get("discountValue") as string);
    const minOrderAmount = parseFloat(formData.get("minOrderAmount") as string) || null;
    const maxUses = parseInt(formData.get("maxUses") as string) || null;
    
    await prisma.coupon.create({
      data: { code, discountType, discountValue, minOrderAmount, maxUses }
    });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al crear cupón" };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar" };
  }
}
