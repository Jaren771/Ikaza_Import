import { z } from "zod";
import { safeString, safeStringOptional } from "@/lib/validation-utils";

// =============================================================================
// ikaZa Import — Validadores de Pedidos y Checkout
// =============================================================================

export const addressSchema = z.object({
  firstName: safeString({ min: 2, label: "El nombre" }),
  lastName: safeString({ min: 2, label: "El apellido" }),
  company: safeStringOptional(),
  phone: safeStringOptional(),
  street: safeString({ min: 5, label: "La dirección" }),
  number: safeStringOptional(),
  district: safeStringOptional(),
  city: safeString({ min: 2, label: "La ciudad" }),
  state: safeString({ min: 2, label: "El departamento" }),
  country: z.string().default("PE"),
  postalCode: safeStringOptional(),
  alias: safeStringOptional(),
  isDefault: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  addressId: z.string().optional(),
  newAddress: addressSchema.optional(),
  shippingMethod: z.string().default("standard"),
  paymentProvider: z.enum(["CULQI", "IZIPAY", "PAYPAL", "MANUAL"]),
  couponCode: safeStringOptional(),
  notes: safeStringOptional(),
});

export const orderFilterSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
      "RETURNED",
    ])
    .optional(),
  paymentStatus: z
    .enum([
      "PENDING",
      "AUTHORIZED",
      "PAID",
      "FAILED",
      "CANCELLED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
    ])
    .optional(),
  userId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
    "RETURNED",
  ]),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
