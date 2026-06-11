import type { PaymentIntent, PaymentWebhookPayload } from "@/types";

// =============================================================================
// IPaymentProvider — Interfaz de Pasarela de Pago (Principio de Inversión)
// Todos los proveedores deben implementar esta interfaz.
// Esto permite añadir/cambiar proveedores sin modificar el checkout.
// =============================================================================

// [SOLID - ISP (Interface Segregation Principle)]: Interfaz pequeña y cohesiva enfocada únicamente en pagos (no se mezclan otras responsabilidades).
// [SOLID - DIP (Dependency Inversion Principle)]: Abstracción de la que dependen los módulos de alto nivel en lugar de depender de clases concretas (bajo nivel).
// [SOLID - LSP (Liskov Substitution Principle)]: Define el contrato uniforme que permite que cualquier implementación sea sustituible sin romper la aplicación.
export interface IPaymentProvider {
  readonly providerId: string;
  readonly name: string;

  /**
   * Crea una intención de pago y retorna los datos para redirigir al usuario
   */
  createPaymentIntent(params: {
    orderId: string;
    amount: number;
    currency: string;
    description: string;
    customerEmail: string;
    customerName: string;
    returnUrl: string;
  }): Promise<PaymentIntent>;

  /**
   * Verifica el estado de un pago por su ID externo
   */
  verifyPayment(providerPaymentId: string): Promise<{
    status: "PAID" | "PENDING" | "FAILED" | "CANCELLED";
    amount?: number;
    metadata?: Record<string, unknown>;
  }>;

  /**
   * Procesa el webhook del proveedor y normaliza la respuesta
   */
  processWebhook(
    payload: unknown,
    signature?: string
  ): Promise<PaymentWebhookPayload>;

  /**
   * Emite un reembolso
   */
  refund(params: {
    providerPaymentId: string;
    amount?: number; // undefined = reembolso total
    reason?: string;
  }): Promise<{ success: boolean; refundId?: string }>;
}
