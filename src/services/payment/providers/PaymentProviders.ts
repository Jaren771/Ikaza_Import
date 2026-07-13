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

  private get secretKey() {
    const key = process.env.CULQI_SECRET_KEY;
    if (!key) console.warn("Falta CULQI_SECRET_KEY en las variables de entorno");
    return key || "sk_test_mock";
  }

  async createPaymentIntent(params: {
    orderId: string;
    amount: number;
    currency: string;
    description: string;
    customerEmail: string;
    customerName: string;
    returnUrl: string;
  }): Promise<PaymentIntent> {
    
    // Convertir a céntimos (ej. 10.50 PEN -> 1050)
    const amountInCents = Math.round(params.amount * 100);

    try {
      // Boilerplate para crear Orden en Culqi (Pago Efectivo / Tarjetas / Cuotas)
      const response = await fetch('https://api.culqi.com/v2/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`,
        },
        body: JSON.stringify({
          amount: amountInCents,
          currency_code: params.currency,
          description: params.description,
          order_number: params.orderId,
          client_details: {
            first_name: params.customerName.split(" ")[0] || "Cliente",
            last_name: params.customerName.split(" ").slice(1).join(" ") || "Ikaza",
            email: params.customerEmail,
            phone_number: "999999999"
          },
          expiration_date: Math.floor(Date.now() / 1000) + 86400, // +24 horas
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Culqi API Error:", errorData);
        throw new Error("Error al generar la orden en Culqi");
      }

      const data = await response.json();
      
      return {
        provider: this.providerId,
        orderId: params.orderId,
        amount: params.amount,
        currency: params.currency,
        clientSecret: data.id, // ID de la Orden de Culqi para el Checkout v4
      };
    } catch (error) {
      console.error("[CulqiProvider.createPaymentIntent]", error);
      // Fallback a modo simulación si falla
      return {
        provider: this.providerId,
        orderId: params.orderId,
        amount: params.amount,
        currency: params.currency,
        clientSecret: `culqi_mock_order_${params.orderId}`,
      };
    }
  }

  async verifyPayment(providerPaymentId: string) {
    try {
      const response = await fetch(`https://api.culqi.com/v2/charges/${providerPaymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });
      
      if (!response.ok) return { status: "FAILED" as const };
      
      const charge = await response.json();
      return { 
        status: charge.outcome?.type === 'venta_exitosa' ? "PAID" as const : "FAILED" as const,
        metadata: charge
      };
    } catch (error) {
      return { status: "PENDING" as const };
    }
  }

  async processWebhook(payload: unknown): Promise<PaymentWebhookPayload> {
    const p = payload as Record<string, unknown>;
    const data = (p.data as Record<string, unknown>) ?? {};
    
    // Determinar si es charge.creation.succeeded o order.status.changed
    const isSuccess = p.type === "charge.creation.succeeded";
    
    return {
      provider: this.providerId,
      event: String(p.type ?? "charge"),
      paymentId: String(data.id ?? ""),
      status: isSuccess ? "PAID" : "PENDING",
      raw: payload,
    };
  }

  async refund(params: { providerPaymentId: string; amount?: number }) {
    try {
      const response = await fetch('https://api.culqi.com/v2/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`,
        },
        body: JSON.stringify({
          charge_id: params.providerPaymentId,
          amount: params.amount ? Math.round(params.amount * 100) : undefined,
          reason: "solicitud_comprador"
        }),
      });
      
      return { success: response.ok };
    } catch (error) {
      return { success: false };
    }
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
