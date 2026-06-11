import type { IPaymentProvider } from "./IPaymentProvider";
import {
  MercadoPagoProvider,
  CulqiProvider,
  IzipayProvider,
  PayPalProvider,
} from "./providers/PaymentProviders";

// =============================================================================
// PaymentService — Orquestador de Pagos (Patrón Strategy)
// Selecciona el proveedor correcto en tiempo de ejecución basado en
// el providerId. Para añadir un nuevo proveedor, solo registrar aquí.
// 
// PRINCIPIOS SOLID APLICADOS:
// - Open/Closed Principle (OCP): Abierto para añadir nuevos proveedores (extensión)
//   registrándolos en el constructor sin tener que modificar la lógica de negocio 
//   o el flujo de checkout existente (cerrado a la modificación).
// - Liskov Substitution Principle (LSP): Maneja todos los proveedores de forma 
//   intercambiable a través de la firma común.
// - Dependency Inversion Principle (DIP): El orquestador depende del contrato
//   abstruso IPaymentProvider en lugar de acoplarse a un proveedor de pago concreto.
// =============================================================================

export class PaymentService {
  private providers: Map<string, IPaymentProvider>;

  constructor() {
    this.providers = new Map<string, IPaymentProvider>([
      ["MERCADOPAGO", new MercadoPagoProvider()],
      ["CULQI", new CulqiProvider()],
      ["IZIPAY", new IzipayProvider()],
      ["PAYPAL", new PayPalProvider()],
    ]);
  }

  /**
   * Obtiene un proveedor por ID
   */
  getProvider(providerId: string): IPaymentProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Proveedor de pago no disponible: ${providerId}`);
    }
    return provider;
  }

  /**
   * Lista todos los proveedores disponibles
   */
  getAvailableProviders(): { id: string; name: string }[] {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.providerId,
      name: p.name,
    }));
  }

  /**
   * Delega la creación de intención de pago al proveedor correcto
   */
  async createPaymentIntent(
    providerId: string,
    params: {
      orderId: string;
      amount: number;
      currency: string;
      description: string;
      customerEmail: string;
      customerName: string;
      returnUrl: string;
    }
  ) {
    const provider = this.getProvider(providerId);
    return provider.createPaymentIntent(params);
  }

  /**
   * Procesa un webhook de pago y retorna datos normalizados
   */
  async processWebhook(providerId: string, payload: unknown, signature?: string) {
    const provider = this.getProvider(providerId);
    return provider.processWebhook(payload, signature);
  }
}

// Singleton para reutilizar en toda la aplicación
export const paymentService = new PaymentService();
