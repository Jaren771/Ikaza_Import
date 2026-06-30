import type { IPaymentProvider } from "./IPaymentProvider";
import {
  CulqiProvider,
  IzipayProvider,
  PayPalProvider,
} from "./providers/PaymentProviders";

// =============================================================================
// PaymentService — Orquestador de Pagos (Patrón Strategy)
// Selecciona el proveedor correcto en tiempo de ejecución basado en
// el providerId. Para añadir un nuevo proveedor, solo registrar aquí.
// =============================================================================

export class PaymentService {
  // [SOLID - DIP (Dependency Inversion Principle)]: Depende de la interfaz IPaymentProvider y no de detalles de bajo nivel.
  // [SOLID - LSP (Liskov Substitution Principle)]: Maneja los proveedores polimórficamente; cualquier proveedor sustituye a la base de manera transparente.
  private providers: Map<string, IPaymentProvider>;

  constructor() {
    // [SOLID - OCP (Open/Closed Principle)]: Abierto a la extensión sumando elementos a este mapa, pero cerrado a la modificación de las llamadas del cliente.
    this.providers = new Map<string, IPaymentProvider>([
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
