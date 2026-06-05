import type { PaymentIntent, PaymentWebhookPayload } from "@/types";

// =============================================================================
// IPaymentProvider — Interfaz de Pasarela de Pago (Principio de Inversión)
// Todos los proveedores deben implementar esta interfaz.
// Esto permite añadir/cambiar proveedores sin modificar el checkout.
// =============================================================================

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
