"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/features/orders/validators/order.schema";
import type { ActionResult } from "@/types";
import type { Prisma } from "@prisma/client";

export type UserAddressWithOrderCount = Prisma.AddressGetPayload<{
  include: {
    _count: { select: { orders: true } };
  };
}>;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value.length > 0 ? value : undefined;
}

function revalidateAddressSurfaces() {
  revalidatePath("/profile");
  revalidatePath("/profile/addresses");
  revalidatePath("/checkout");
}

function buildAddressPayload(formData: FormData) {
  return {
    alias: readOptionalString(formData, "alias"),
    firstName: readString(formData, "firstName"),
    lastName: readString(formData, "lastName"),
    company: readOptionalString(formData, "company"),
    phone: readOptionalString(formData, "phone"),
    street: readString(formData, "street"),
    number: readOptionalString(formData, "number"),
    district: readOptionalString(formData, "district"),
    city: readString(formData, "city"),
    state: readString(formData, "state"),
    country: readOptionalString(formData, "country") ?? "PE",
    postalCode: readOptionalString(formData, "postalCode"),
    isDefault: formData.get("isDefault") === "on" || formData.get("isDefault") === "true",
  };
}

export async function getUserAddresses(): Promise<ActionResult<UserAddressWithOrderCount[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Debes iniciar sesión" };
  }

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { orders: true } },
      },
    });

    return { success: true, data: addresses };
  } catch (error) {
    console.error("[getUserAddresses]", error);
    return { success: false, error: "Error al cargar direcciones" };
  }
}

export async function createAddress(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Debes iniciar sesión" };
  }

  const validation = addressSchema.safeParse(buildAddressPayload(formData));
  if (!validation.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const addressCount = await prisma.address.count({
      where: { userId: session.user.id },
    });
    const shouldBeDefault = validation.data.isDefault || addressCount === 0;

    const address = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId: session.user.id },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          ...validation.data,
          isDefault: shouldBeDefault,
          userId: session.user.id,
        },
      });
    });

    revalidateAddressSurfaces();
    return { success: true, data: { id: address.id }, message: "Dirección guardada" };
  } catch (error) {
    console.error("[createAddress]", error);
    return { success: false, error: "Error al guardar la dirección" };
  }
}

export async function setDefaultAddress(addressId: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Debes iniciar sesión" };
  }

  try {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
      select: { id: true },
    });

    if (!address) {
      return { success: false, error: "Dirección no encontrada" };
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    revalidateAddressSurfaces();
    return { success: true, data: null, message: "Dirección predeterminada actualizada" };
  } catch (error) {
    console.error("[setDefaultAddress]", error);
    return { success: false, error: "Error al actualizar la dirección" };
  }
}

export async function deleteAddress(addressId: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Debes iniciar sesión" };
  }

  try {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
      include: { _count: { select: { orders: true } } },
    });

    if (!address) {
      return { success: false, error: "Dirección no encontrada" };
    }

    if (address._count.orders > 0) {
      return {
        success: false,
        error: "No se puede eliminar una dirección usada en pedidos",
      };
    }

    await prisma.address.delete({ where: { id: addressId } });

    if (address.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });

      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    revalidateAddressSurfaces();
    return { success: true, data: null, message: "Dirección eliminada" };
  } catch (error) {
    console.error("[deleteAddress]", error);
    return { success: false, error: "Error al eliminar la dirección" };
  }
}
