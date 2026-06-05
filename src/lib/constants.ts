// =============================================================================
// ikaZa Import — Constantes del Sistema
// =============================================================================

export const SITE_CONFIG = {
  name: "ikaZa Import",
  description:
    "Plataforma líder de productos importados. Hogar, cocina, tecnología y más con los mejores precios.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  logo: "/logo.svg",
  email: "info@ikaza.pe",
  phone: "+51 1 234 5678",
  address: "Av. República de Panamá 123, Lima, Perú",
  social: {
    facebook: "https://facebook.com/ikazaimport",
    instagram: "https://instagram.com/ikazaimport",
    tiktok: "https://tiktok.com/@ikazaimport",
    youtube: "https://youtube.com/@ikazaimport",
  },
} as const;

// Roles y permisos
export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CUSTOMER: "CUSTOMER",
} as const;

// Rutas protegidas por rol
export const PROTECTED_ROUTES = {
  admin: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
  importer: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  customer: [USER_ROLES.CUSTOMER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
} as const;

// Paginación por defecto
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  ADMIN_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Estados de pedidos en español
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PROCESSING: "En proceso",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
  RETURNED: "Devuelto",
};

// Colores de estado de pedidos
export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
  RETURNED: "bg-orange-100 text-orange-800",
};

// Estados de pago en español
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  AUTHORIZED: "Autorizado",
  PAID: "Pagado",
  FAILED: "Fallido",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
  PARTIALLY_REFUNDED: "Parcialmente reembolsado",
};

// Estados de productos en español
export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  OUT_OF_STOCK: "Sin stock",
  DISCONTINUED: "Descontinuado",
};

// Monedas disponibles
export const CURRENCIES = [
  { code: "PEN", name: "Sol Peruano", symbol: "S/" },
  { code: "USD", name: "Dólar Americano", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
] as const;

// Proveedores de pago
export const PAYMENT_PROVIDERS = [
  {
    id: "MERCADOPAGO",
    name: "MercadoPago",
    logo: "/payment/mercadopago.svg",
    enabled: false,
  },
  {
    id: "CULQI",
    name: "Culqi",
    logo: "/payment/culqi.svg",
    enabled: false,
  },
  {
    id: "IZIPAY",
    name: "Izipay",
    logo: "/payment/izipay.svg",
    enabled: false,
  },
  {
    id: "PAYPAL",
    name: "PayPal",
    logo: "/payment/paypal.svg",
    enabled: false,
  },
] as const;

// Opciones de sorting para catálogo
export const SORT_OPTIONS = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Precio: Menor a mayor" },
  { value: "price_desc", label: "Precio: Mayor a menor" },
  { value: "popular", label: "Más populares" },
  { value: "name", label: "Nombre A-Z" },
] as const;

// Límite de stock bajo para alertas
export const LOW_STOCK_THRESHOLD = 5;

// Tiempo de expiración del carrito de sesión (30 días)
export const CART_SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000;
