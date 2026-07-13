"use client";

import { useState, useTransition } from "react";
import { processCheckoutAction } from "@/features/orders/actions/checkout.actions";
import { queryDocumentAction } from "@/features/orders/actions/sunat.actions";
import { formatPrice } from "@/lib/utils";
import { CreditCard, Banknote, ShieldCheck, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CheckoutFormProps {
  addresses: { id: string; alias: string | null; street: string; city: string }[];
  cartTotal: number;
}

export function CheckoutForm({ addresses, cartTotal }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState("MERCADOPAGO");
  
  // Facturación Electrónica (SUNAT)
  const [docType, setDocType] = useState<"DNI" | "RUC">("DNI");
  const [docNumber, setDocNumber] = useState("");
  const [billingName, setBillingName] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);

  const { state: cartState, dispatch } = useCart(); // Acceder al snapshot L1

  const handleQueryDocument = async () => {
    if (!docNumber) return toast.error("Ingresa un número de documento");
    if (docType === "DNI" && docNumber.length !== 8) return toast.error("El DNI debe tener 8 dígitos");
    if (docType === "RUC" && docNumber.length !== 11) return toast.error("El RUC debe tener 11 dígitos");

    setIsQuerying(true);
    const result = await queryDocumentAction(docType, docNumber);
    setIsQuerying(false);

    if (result.success) {
      setBillingName(result.data?.name || "");
      toast.success("Datos obtenidos correctamente de SUNAT/RENIEC");
    } else {
      setBillingName("");
      toast.error(result.error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      toast.error("Selecciona una dirección de envío");
      return;
    }

    // Patrón 3 (AGENTS.md): Tomar snapshot profundo del carrito EN ESTE MOMENTO EXACTO.
    // Una copia profunda evita que cambios reactivos posteriores alteren los datos enviados.
    const cartSnapshot = JSON.parse(JSON.stringify(cartState.items)).map((item: any) => ({
      productId: item.productId ?? item.id,
      price: item.price,
      quantity: item.quantity,
    }));
    // Guardamos en sessionStorage como respaldo (Patrón 3)
    try { sessionStorage.setItem("ikaza_cart_snapshot", JSON.stringify(cartSnapshot)); } catch {}

    startTransition(async () => {
      const result = await processCheckoutAction({
        addressId: selectedAddress,
        paymentMethod,
        snapshot: cartSnapshot, // Patrón 3: Snapshot congelado — no el estado reactivo actual
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (result.data?.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      } else if (result.data?.orderId) {
        // Limpiamos el carrito local
        dispatch({ type: "CLEAR_CART" });
        localStorage.removeItem("ikaza_cart_snapshot");
        sessionStorage.removeItem("ikaza_cart_snapshot");
        router.push(`/checkout/success?orderId=${result.data.orderId}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Dirección de envío */}
      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">1. Dirección de Envío</h2>
        {addresses.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <p className="text-muted-foreground mb-4">No tienes direcciones guardadas</p>
            <a href="/profile/addresses/new" className="text-sm font-semibold text-[#006065] hover:underline">
              + Añadir nueva dirección
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`relative flex cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedAddress === addr.id ? "border-[#006065] bg-teal-50/30 ring-1 ring-[#006065]" : "hover:border-[#006065]"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddress === addr.id}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="sr-only"
                />
                <div>
                  <p className="font-semibold">{addr.alias ?? "Dirección"}</p>
                  <p className="text-sm text-muted-foreground mt-1">{addr.street}</p>
                  <p className="text-sm text-muted-foreground">{addr.city}</p>
                </div>
                {selectedAddress === addr.id && (
                  <div className="absolute top-4 right-4 text-[#006065]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                )}
              </label>
            ))}
          </div>
        )}
      </section>

      {/* 2. Facturación Electrónica */}
      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">2. Datos de Facturación</h2>
        <div className="rounded-xl border p-4 space-y-4">
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="docType" checked={docType === "DNI"} onChange={() => { setDocType("DNI"); setDocNumber(""); setBillingName(""); }} className="text-[#006065] focus:ring-[#006065]" />
              <span className="text-sm font-medium">Boleta (DNI)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="docType" checked={docType === "RUC"} onChange={() => { setDocType("RUC"); setDocNumber(""); setBillingName(""); }} className="text-[#006065] focus:ring-[#006065]" />
              <span className="text-sm font-medium">Factura (RUC)</span>
            </label>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="sr-only">Número de Documento</Label>
              <Input 
                placeholder={`Número de ${docType}`} 
                value={docNumber} 
                onChange={(e) => setDocNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={docType === "DNI" ? 8 : 11}
              />
            </div>
            <button 
              type="button" 
              onClick={handleQueryDocument}
              disabled={isQuerying}
              className="px-4 py-2 bg-[#006065] hover:bg-[#004f53] text-white rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isQuerying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span>Buscar</span>
            </button>
          </div>

          {billingName && (
            <div className="bg-teal-50/50 p-3 rounded-md border border-teal-100">
              <Label className="text-xs text-muted-foreground">Razón Social / Nombres</Label>
              <p className="font-medium text-sm mt-0.5">{billingName}</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Método de pago */}
      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">3. Método de Pago</h2>
        <div className="space-y-3">
          {[
            { id: "MERCADOPAGO", name: "MercadoPago", desc: "Tarjetas y dinero en cuenta", icon: CreditCard },
            { id: "CULQI", name: "Culqi", desc: "Tarjetas de crédito o débito", icon: CreditCard },
            { id: "TRANSFER", name: "Transferencia / Yape", desc: "Pago manual", icon: Banknote },
          ].map((method) => (
            <label
              key={method.id}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                paymentMethod === method.id ? "border-[#006065] bg-teal-50/30 ring-1 ring-[#006065]" : "hover:border-[#006065]"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-[#006065] focus:ring-[#006065]"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <method.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">{method.name}</p>
                  <p className="text-xs text-muted-foreground">{method.desc}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending || !selectedAddress}
        className="btn-ikaza-cart w-full py-4 text-base"
      >
        {isPending ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando pago...</>
        ) : (
          `Pagar ${formatPrice(cartTotal)}`
        )}
      </button>
    </form>
  );
}
