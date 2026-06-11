import type { IPaymentProvider } from "../IPaymentProvider";
import type { PaymentIntent, PaymentWebhookPayload } from "@/types";

// =============================================================================
// MercadoPago Provider (Stub — listo para integración real)
// =============================================================================

// [SOLID - SRP (Single Responsibility Principle)]: Tiene la única responsabilidad de integrar la pasarela de pagos de MercadoPago.
// [SOLID - LSP (Liskov Substitution Principle)]: Implementa IPaymentProvider para que pueda reemplazar a la abstracción base de manera transparente.
export class MercadoPagoProvider implements IPaymentProvider {
  readonly providerId = "MERCADOPAGO";
  readonly name = "MercadoPago";

  async createPaymentIntent(params: {
    orderId: string;
    amount: number;
    currency: string;
    description: string;
    customerEmail: string;
    customerName: string;
    returnUrl: string;
  }): Promise<PaymentIntent> {
    // TODO: Integrar con SDK oficial de MercadoPago
    // const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
    // const preference = new Preference(mp);
    // const response = await preference.create({ body: { items: [...], back_urls: {...} } });

    return {
      provider: this.providerId,
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      paymentUrl: `https://www.mercadopago.com.pe/checkout/v1/redirect?pref_id=PENDING_${params.orderId}`,
    };
  }

  async verifyPayment(providerPaymentId: string) {
    // TODO: Verificar con API de MercadoPago
    return { status: "PENDING" as const, metadata: { providerPaymentId } };
  }

  async processWebhook(payload: unknown): Promise<PaymentWebhookPayload> {
    const p = payload as Record<string, unknown>;
    const data = (p.data as Record<string, unknown>) ?? {};
    return {
      provider: this.providerId,
      event: String(p.type ?? "payment"),
      paymentId: String(data.id ?? ""),
      status: "PENDING",
      raw: payload,
    };
  }

  async refund(params: { providerPaymentId: string; amount?: number }) {
    // TODO: Implementar reembolso
    return { success: false };
  }
}

// =============================================================================
// Culqi Provider (Stub — listo para integración real)
// =============================================================================

export class CulqiProvider implements IPaymentProvider {
  readonly providerId = "CULQI";
  readonly name = "Culqi";

  async createPaymentIntent(params: {
    orderId: string;
    amount: number;
    currency: string;
    description: string;
    customerEmail: string;
    customerName: string;
    returnUrl: string;
  }): Promise<PaymentIntent> {
    // TODO: Integrar con API de Culqi
    // const response = await fetch('https://api.culqi.com/v2/orders', { ... });
    return {
      provider: this.providerId,
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      clientSecret: `culqi_test_${params.orderId}`,
    };
  }

  async verifyPayment(providerPaymentId: string) {
    return { status: "PENDING" as const };
  }

  async processWebhook(payload: unknown): Promise<PaymentWebhookPayload> {
    const p = payload as Record<string, unknown>;
    const data = (p.data as Record<string, unknown>) ?? {};
    return {
      provider: this.providerId,
      event: String(p.event ?? "charge"),
      paymentId: String(data.id ?? ""),
      status: "PENDING",
      raw: payload,
    };
  }

  async refund(params: { providerPaymentId: string; amount?: number }) {
    return { success: false };
  }
}

// =============================================================================
// Izipay Provider (Stub — listo para integración real)
// =============================================================================

export class IzipayProvider implements IPaymentProvider {
  readonly providerId = "IZIPAY";
  readonly name = "Izipay";

  async createPaymentIntent(params: {
    orderId: string;
    amount: number;
    currency: string;
    description: string;
    customerEmail: string;
    customerName: string;
    returnUrl: string;
  }): Promise<PaymentIntent> {
    return {
      provider: this.providerId,
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      clientSecret: `izipay_${params.orderId}`,
    };
  }

  async verifyPayment(providerPaymentId: string) {
    return { status: "PENDING" as const };
  }

  async processWebhook(payload: unknown): Promise<PaymentWebhookPayload> {
    return {
      provider: this.providerId,
      event: "payment",
      paymentId: "",
      status: "PENDING",
      raw: payload,
    };
  }

  async refund(params: { providerPaymentId: string; amount?: number }) {
    return { success: false };
  }
}

// =============================================================================
// PayPal Provider (Stub — listo para integración real)
// =============================================================================

export class PayPalProvider implements IPaymentProvider {
  readonly providerId = "PAYPAL";
  readonly name = "PayPal";

  async createPaymentIntent(params: {
    orderId: string;
    amount: number;
    currency: string;
    description: string;
    customerEmail: string;
    customerName: string;
    returnUrl: string;
  }): Promise<PaymentIntent> {
    return {
      provider: this.providerId,
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      paymentUrl: `https://www.paypal.com/checkoutnow?token=PENDING_${params.orderId}`,
    };
  }

  async verifyPayment(providerPaymentId: string) {
    return { status: "PENDING" as const };
  }

  async processWebhook(payload: unknown): Promise<PaymentWebhookPayload> {
    const p = payload as Record<string, unknown>;
    const resource = (p.resource as Record<string, unknown>) ?? {};
    return {
      provider: this.providerId,
      event: String(p.event_type ?? "payment"),
      paymentId: String(resource.id ?? ""),
      status: "PENDING",
      raw: payload,
    };
  }

  async refund(params: { providerPaymentId: string; amount?: number }) {
    return { success: false };
  }
}
