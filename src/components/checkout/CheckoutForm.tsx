"use client";

import { useState, useTransition } from "react";
import { processCheckoutAction } from "@/features/orders/actions/checkout.actions";
import { formatPrice } from "@/lib/utils";
import { CreditCard, Banknote, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
  addresses: { id: string; alias: string | null; street: string; city: string }[];
  cartTotal: number;
}

export function CheckoutForm({ addresses, cartTotal }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState("MERCADOPAGO");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      toast.error("Selecciona una dirección de envío");
      return;
    }

    startTransition(async () => {
      const result = await processCheckoutAction({
        addressId: selectedAddress,
        paymentMethod,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (result.data?.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      } else if (result.data?.orderId) {
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

      {/* 2. Método de pago */}
      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">2. Método de Pago</h2>
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
