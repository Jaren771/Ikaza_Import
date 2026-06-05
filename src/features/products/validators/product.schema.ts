import { z } from "zod";

// =============================================================================
// ikaZa Import — Validadores de Productos
// =============================================================================

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre es muy largo"),
  slug: z
    .string()
    .min(2, "El slug es requerido")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().optional(),
  shortDescription: z.string().max(300, "Máximo 300 caracteres").optional(),
  sku: z.string().min(1, "El SKU es requerido"),
  barcode: z.string().optional(),
  price: z
    .number()
    .positive("El precio debe ser mayor a 0")
    .multipleOf(0.01, "Máximo 2 decimales"),
  comparePrice: z
    .number()
    .positive()
    .multipleOf(0.01)
    .optional()
    .nullable(),
  costPrice: z
    .number()
    .positive()
    .multipleOf(0.01)
    .optional()
    .nullable(),
  weight: z.number().positive().optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  subcategoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

export const updateProductSchema = productSchema.partial().extend({
  id: z.string().min(1, "ID requerido"),
});

export const productFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  status: z.string().optional(),
  isFeatured: z.boolean().optional(),
  inStock: z.boolean().optional(),
  sortBy: z
    .enum(["price_asc", "price_desc", "newest", "popular", "name"])
    .optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(12),
});

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
