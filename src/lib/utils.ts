import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combina clases de Tailwind sin conflictos
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatea precios en formato Perú (PEN) o dólar
export function formatPrice(
  amount: number | string,
  currency: string = "PEN",
  locale: string = "es-PE"
): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

// Genera un slug a partir de un texto
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Trunca texto con ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

// Calcula el porcentaje de descuento
export function calculateDiscount(
  price: number,
  comparePrice: number
): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

// Convierte Decimal de Prisma a número
export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return 0;
}

// Formatea fechas en español
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(dateObj);
}

// Formatea fecha corta
export function formatDateShort(date: Date | string): string {
  return formatDate(date, { year: "numeric", month: "short", day: "numeric" });
}

// Genera número de orden único
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `IKZ-${timestamp}-${random}`;
}

// Valida un email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Formatea números grandes
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-PE").format(num);
}

// Obtiene las iniciales de un nombre
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
