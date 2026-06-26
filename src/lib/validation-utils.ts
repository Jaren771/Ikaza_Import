import { z } from "zod";

const MALICIOUS_PATTERN =
  /[<>&]/;

export const MALICIOUS_CHARS_MSG =
  "Caracteres no permitidos (<, >, &)";

export function containsMaliciousChars(value: string): boolean {
  return MALICIOUS_PATTERN.test(value);
}

export function safeString(options?: {
  min?: number;
  max?: number;
  required?: boolean;
  label?: string;
}) {
  const label = options?.label || "Este campo";
  let schema = z.string();

  if (options?.required !== false) {
    schema = schema.min(1, `${label} es requerido`);
  }

  if (options?.min !== undefined) {
    schema = schema.min(options.min, `${label} debe tener al menos ${options.min} caracteres`);
  }

  if (options?.max !== undefined) {
    schema = schema.max(options.max, `${label} es muy largo`);
  }

  return schema.refine(
    (val) => !val || !containsMaliciousChars(val),
    MALICIOUS_CHARS_MSG
  );
}

export function safeStringOptional(options?: { max?: number }) {
  let schema = z.string().optional();

  if (options?.max !== undefined) {
    schema = schema.refine(
      (val) => !val || val.length <= options.max!,
      `Máximo ${options.max} caracteres`
    );
  }

  return schema.refine(
    (val) => !val || !containsMaliciousChars(val),
    MALICIOUS_CHARS_MSG
  );
}

export function sanitizeValue(value: string): string {
  return value
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/&(?!lt;|gt;|quot;|#x27;)/g, "&amp;");
}

export function sanitizeFormData(
  formData: FormData,
  fields: string[]
): FormData {
  const sanitized = new FormData();
  for (const [key, value] of formData.entries()) {
    if (fields.includes(key) && typeof value === "string") {
      sanitized.append(key, sanitizeValue(value));
    } else {
      sanitized.append(key, value);
    }
  }
  return sanitized;
}
