import { z } from "zod";

// =============================================================================
// ikaZa Import — Validadores de Pedidos y Checkout
// =============================================================================

export const addressSchema = z.object({
  firstName: z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  company: z.string().optional(),
  phone: z.string().optional(),
  street: z.string().min(5, "Dirección requerida"),
  number: z.string().optional(),
  district: z.string().optional(),
  city: z.string().min(2, "Ciudad requerida"),
  state: z.string().min(2, "Departamento requerido"),
  country: z.string().default("PE"),
  postalCode: z.string().optional(),
  alias: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  addressId: z.string().optional(),
  newAddress: addressSchema.optional(),
  shippingMethod: z.string().default("standard"),
  paymentProvider: z.enum(["MERCADOPAGO", "CULQI", "IZIPAY", "PAYPAL", "MANUAL"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
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
