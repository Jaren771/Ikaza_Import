// =============================================================================
// ikaZa Import — Tipos TypeScript Globales
// =============================================================================

// Re-exportaciones de Prisma
export type {
  User,
  Product,
  Category,
  Subcategory,
  Brand,
  Supplier,
  Order,
  OrderItem,
  Payment,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Inventory,
  Coupon,
  Banner,
  Review,
  Address,
  ImportOrder,
  ImportOrderItem,
  AuditLog,
  Notification,
} from "@prisma/client";

export type {
  UserRole,
  UserStatus,
  OrderStatus,
  PaymentStatus,
  PaymentProvider,
  ProductStatus,
  DiscountType,
  MovementType,
  ImportOrderStatus,
  NotificationType,
} from "@prisma/client";

// =============================================================================
// Tipos de UI / Paginación
// =============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// =============================================================================
// Tipos de Server Actions
// =============================================================================

export type ActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// =============================================================================
// Tipos de Filtros y Búsqueda
// =============================================================================

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  isFeatured?: boolean;
  inStock?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular" | "name";
  page?: number;
  limit?: number;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// Tipos de Carrito
// =============================================================================

export interface CartItemWithProduct {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: { url: string; alt?: string | null; isPrimary: boolean }[];
    inventory?: { quantity: number } | null;
  };
}

export interface CartWithItems {
  id: string;
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
}

// =============================================================================
// Tipos de Producto Enriquecido
// =============================================================================

export interface ProductWithRelations {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  sku: string;
  price: number;
  comparePrice?: number | null;
  status: string;
  isFeatured: boolean;
  tags: string[];
  category?: { id: string; name: string; slug: string } | null;
  subcategory?: { id: string; name: string; slug: string } | null;
  brand?: { id: string; name: string; slug: string; logo?: string | null } | null;
  images: { id: string; url: string; alt?: string | null; isPrimary: boolean; position: number }[];
  inventory?: { quantity: number; reservedQuantity: number } | null;
  reviews?: { rating: number }[];
  avgRating?: number;
  reviewCount?: number;
}

// =============================================================================
// Tipos de Sesión / Auth
// =============================================================================

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
}

// =============================================================================
// Tipos de Dashboard / Analytics
// =============================================================================

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image?: string;
  totalSold: number;
  revenue: number;
}

// =============================================================================
// Tipos de Pagos
// =============================================================================

export interface PaymentIntent {
  provider: string;
  orderId: string;
  amount: number;
  currency: string;
  redirectUrl?: string;
  clientSecret?: string;
  paymentUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentWebhookPayload {
  provider: string;
  event: string;
  paymentId: string;
  orderId?: string;
  status: string;
  amount?: number;
  raw: unknown;
}

// =============================================================================
// Tipos de Notificaciones
// =============================================================================

export interface NotificationData {
  orderId?: string;
  productId?: string;
  userId?: string;
  [key: string]: unknown;
}

// =============================================================================
// Navegación
// =============================================================================

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavItem[];
  roles?: string[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
