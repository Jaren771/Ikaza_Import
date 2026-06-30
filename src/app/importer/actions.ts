"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

const importerRoles = new Set(["ADMIN", "SUPER_ADMIN", "MANAGER"]);
const importStatuses = ["DRAFT", "SENT", "IN_TRANSIT", "CUSTOMS", "RECEIVED", "CANCELLED"] as const;

type ImportStatus = (typeof importStatuses)[number];

export interface ImportSupplierOption {
  id: string;
  name: string;
  country: string | null;
}

export interface ImportShipmentSummary {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: ImportStatus;
  totalCost: number;
  currency: string;
  exchangeRate: number | null;
  shippingCost: number | null;
  customsCost: number | null;
  otherCosts: number | null;
  containerId: string | null;
  vessel: string | null;
  origin: string | null;
  destination: string | null;
  estimatedArrival: string | null;
  actualArrival: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: ImportSupplierOption;
  items: { id: string; quantity: number }[];
}

export interface ImportShipmentDetail extends ImportShipmentSummary {
  items: {
    id: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    receivedQty: number;
    notes: string | null;
    product: {
      id: string;
      name: string;
      sku: string;
      slug: string;
    };
  }[];
}

interface ImportDashboardData {
  shipments: ImportShipmentSummary[];
  stats: {
    inTransit: number;
    customs: number;
    preparation: number;
    activeValue: number;
  };
}

function canUseImporter(role?: string | null) {
  return role ? importerRoles.has(role) : false;
}

async function requireImporterAccess(): Promise<ActionResult<{ userId: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Debes iniciar sesión" };
  }
  if (!canUseImporter(session.user.role)) {
    return { success: false, error: "No autorizado" };
  }
  return { success: true, data: { userId: session.user.id } };
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value.length > 0 ? value : undefined;
}

function readOptionalNumber(formData: FormData, key: string) {
  const value = readString(formData, key);
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readDate(formData: FormData, key: string) {
  const value = readString(formData, key);
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function generateImportOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `IMP-${timestamp}-${suffix}`;
}

export async function getImporterDashboardData(): Promise<ActionResult<ImportDashboardData>> {
  const access = await requireImporterAccess();
  if (!access.success) return access;

  try {
    const orders = await prisma.importOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        supplier: { select: { id: true, name: true, country: true } },
        items: { select: { id: true, quantity: true } },
      },
    });

    const shipments: ImportShipmentSummary[] = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      supplierId: order.supplierId,
      status: order.status,
      totalCost: Number(order.totalCost),
      currency: order.currency,
      exchangeRate: order.exchangeRate ? Number(order.exchangeRate) : null,
      shippingCost: order.shippingCost ? Number(order.shippingCost) : null,
      customsCost: order.customsCost ? Number(order.customsCost) : null,
      otherCosts: order.otherCosts ? Number(order.otherCosts) : null,
      containerId: order.containerId,
      vessel: order.vessel,
      origin: order.origin,
      destination: order.destination,
      estimatedArrival: order.estimatedArrival?.toISOString() ?? null,
      actualArrival: order.actualArrival?.toISOString() ?? null,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      supplier: order.supplier,
      items: order.items,
    }));

    const stats = {
      inTransit: shipments.filter((shipment) => shipment.status === "IN_TRANSIT").length,
      customs: shipments.filter((shipment) => shipment.status === "CUSTOMS").length,
      preparation: shipments.filter(
        (shipment) => shipment.status === "DRAFT" || shipment.status === "SENT"
      ).length,
      activeValue: shipments
        .filter((shipment) => ["SENT", "IN_TRANSIT", "CUSTOMS"].includes(shipment.status))
        .reduce((total, shipment) => total + shipment.totalCost, 0),
    };

    return { success: true, data: { shipments, stats } };
  } catch (error) {
    console.error("[getImporterDashboardData]", error);
    return { success: false, error: "Error al cargar embarques" };
  }
}

export async function getImportShipment(id: string): Promise<ActionResult<ImportShipmentDetail>> {
  const access = await requireImporterAccess();
  if (!access.success) return access;

  try {
    const order = await prisma.importOrder.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, name: true, country: true } },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, slug: true },
            },
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Embarque no encontrado" };
    }

    return {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        supplierId: order.supplierId,
        status: order.status,
        totalCost: Number(order.totalCost),
        currency: order.currency,
        exchangeRate: order.exchangeRate ? Number(order.exchangeRate) : null,
        shippingCost: order.shippingCost ? Number(order.shippingCost) : null,
        customsCost: order.customsCost ? Number(order.customsCost) : null,
        otherCosts: order.otherCosts ? Number(order.otherCosts) : null,
        containerId: order.containerId,
        vessel: order.vessel,
        origin: order.origin,
        destination: order.destination,
        estimatedArrival: order.estimatedArrival?.toISOString() ?? null,
        actualArrival: order.actualArrival?.toISOString() ?? null,
        notes: order.notes,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        supplier: order.supplier,
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unitCost: Number(item.unitCost),
          totalCost: Number(item.totalCost),
          receivedQty: item.receivedQty,
          notes: item.notes,
          product: item.product,
        })),
      },
    };
  } catch (error) {
    console.error("[getImportShipment]", error);
    return { success: false, error: "Error al cargar el embarque" };
  }
}

export async function getImportShipmentFormOptions(): Promise<
  ActionResult<{ suppliers: ImportSupplierOption[] }>
> {
  const access = await requireImporterAccess();
  if (!access.success) return access;

  try {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, country: true },
    });

    return { success: true, data: { suppliers } };
  } catch (error) {
    console.error("[getImportShipmentFormOptions]", error);
    return { success: false, error: "Error al cargar opciones" };
  }
}

export async function createImportShipment(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const access = await requireImporterAccess();
  if (!access.success) return access;

  const supplierId = readString(formData, "supplierId");
  const totalCost = readOptionalNumber(formData, "totalCost");
  const statusInput = readString(formData, "status") as ImportStatus;
  const status = importStatuses.includes(statusInput) ? statusInput : "DRAFT";

  if (!supplierId) {
    return { success: false, error: "Selecciona un proveedor" };
  }

  if (totalCost === undefined || totalCost < 0) {
    return { success: false, error: "Ingresa un costo total válido" };
  }

  try {
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, isActive: true },
      select: { id: true },
    });

    if (!supplier) {
      return { success: false, error: "Proveedor inválido" };
    }

    const order = await prisma.importOrder.create({
      data: {
        orderNumber: readOptionalString(formData, "orderNumber") ?? generateImportOrderNumber(),
        supplierId,
        status,
        totalCost,
        currency: readOptionalString(formData, "currency") ?? "USD",
        exchangeRate: readOptionalNumber(formData, "exchangeRate"),
        shippingCost: readOptionalNumber(formData, "shippingCost"),
        customsCost: readOptionalNumber(formData, "customsCost"),
        otherCosts: readOptionalNumber(formData, "otherCosts"),
        containerId: readOptionalString(formData, "containerId"),
        vessel: readOptionalString(formData, "vessel"),
        origin: readOptionalString(formData, "origin"),
        destination: readOptionalString(formData, "destination") ?? "Callao, PE",
        estimatedArrival: readDate(formData, "estimatedArrival"),
        notes: readOptionalString(formData, "notes"),
      },
    });

    revalidatePath("/importer");
    return { success: true, data: { id: order.id }, message: "Embarque creado" };
  } catch (error) {
    console.error("[createImportShipment]", error);
    return { success: false, error: "Error al crear el embarque" };
  }
}
