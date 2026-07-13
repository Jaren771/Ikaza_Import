"use client";

import { useState, useEffect } from "react";
import { processCheckoutAction } from "@/features/orders/actions/checkout.actions";
import { queryDocumentAction } from "@/features/orders/actions/sunat.actions";
import { formatPrice, toNumber } from "@/lib/utils";
import { ShieldCheck, Loader2, Store, Truck, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Script from "next/script";
import Image from "next/image";

interface CheckoutFormProps {
  addresses: { id: string; alias: string | null; street: string; city: string; state?: string | null }[];
  cartTotal: number;
  subtotal: number;
  cartItemsWeight: number; // calculated in page.tsx
  cartItems: any[]; // items for the summary
}

export function CheckoutForm({ addresses, cartTotal, subtotal, cartItemsWeight, cartItems }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");

  const paymentMethod = "CULQI"; // Forzamos CULQI
  
  const [docType, setDocType] = useState<"DNI" | "RUC">("DNI");
  const [docNumber, setDocNumber] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");

  const { state: cartState, dispatch } = useCart();

  // Cálculo dinámico de envío (igual al backend)
  let calculatedShipping = 0;
  if (shippingMethod === "DELIVERY" && shippingState) {
    const isLocal = shippingState.toLowerCase() === "lima" || shippingCity.toLowerCase() === "lima";
    const baseRate = isLocal ? 10 : 20;
    const extraWeightRate = cartItemsWeight > 2 ? (cartItemsWeight - 2) * 3 : 0;
    calculatedShipping = baseRate + extraWeightRate;
    if (subtotal >= 150 && isLocal) {
      calculatedShipping = 0;
    }
  }
  const finalTotal = subtotal + calculatedShipping;

  useEffect(() => {
    window.culqi = () => {
      if (window.Culqi.token) {
        const token = window.Culqi.token.id;
        processCheckout(token);
      } else if (window.Culqi.error) {
        toast.error(window.Culqi.error.user_message);
        setIsPending(false);
      }
    };
  }, [shippingMethod, shippingStreet, shippingCity, shippingState, docType, docNumber, billingName, billingEmail]);

  const processCheckout = (paymentToken?: string) => {
    const cartSnapshot = JSON.parse(JSON.stringify(cartState.items)).map((item: any) => ({
      productId: item.productId ?? item.id,
      price: item.price,
      quantity: item.quantity,
    }));
    try { sessionStorage.setItem("ikaza_cart_snapshot", JSON.stringify(cartSnapshot)); } catch {}

    const submitAction = async () => {
      const result = await processCheckoutAction({
        shippingMethod,
        shippingStreet,
        shippingCity,
        shippingState,
        paymentMethod,
        paymentToken,
        receiptType: docType === "DNI" ? "BOLETA" : "FACTURA",
        documentNumber: docNumber,
        customerName: billingName,
        customerEmail: billingEmail,
        snapshot: cartSnapshot,
      });

      setIsPending(false);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (result.data?.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      } else if (result.data?.orderId) {
        dispatch({ type: "CLEAR_CART" });
        localStorage.removeItem("ikaza_cart_snapshot");
        sessionStorage.removeItem("ikaza_cart_snapshot");
        router.push(`/checkout/success?orderId=${result.data.orderId}`);
      }
    };

    submitAction();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shippingMethod === "DELIVERY" && (!shippingStreet || !shippingCity || !shippingState)) {
      toast.error("Completa tu dirección de envío");
      return;
    }
    if (!billingName || !docNumber || !billingEmail) {
      toast.error("Completa todos los datos de facturación");
      return;
    }

    if (!window.Culqi) {
      toast.error("Conectando con la pasarela de pagos segura... Por favor, intenta de nuevo en 2 segundos.");
      setIsPending(false);
      return;
    }

    try {
      window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || "pk_test_mock";
      window.Culqi.settings({
        title: "ikaZa Import",
        currency: "PEN",
        amount: Math.round(finalTotal * 100),
      });
      window.Culqi.options({
        lang: "auto",
        installments: false,
        paymentMethods: {
          tarjeta: true,
          yape: true,
          billetera: true,
          bancaMovil: true,
          agente: true,
          cuotealo: false,
        }
      });
      window.Culqi.open();
    } catch (err) {
      console.error(err);
      toast.error("Hubo un error al abrir la pasarela de pagos.");
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LADO IZQUIERDO: FORMULARIO */}
        <div className="lg:col-span-7">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Método de entrega */}
            <section>
              <h2 className="font-headline text-lg font-semibold mb-4">1. Método de Entrega</h2>
              <div className="flex gap-4 mb-6">
                <label className={`flex-1 relative flex cursor-pointer rounded-xl border p-4 transition-all items-center gap-3 ${shippingMethod === "DELIVERY" ? "border-[#006065] bg-teal-50/30 ring-1 ring-[#006065]" : "hover:border-[#006065]"}`}>
                  <input type="radio" name="shippingMethod" value="DELIVERY" checked={shippingMethod === "DELIVERY"} onChange={() => setShippingMethod("DELIVERY")} className="sr-only" />
                  <Truck className={`h-6 w-6 ${shippingMethod === "DELIVERY" ? "text-[#006065]" : "text-muted-foreground"}`} />
                  <span className="font-semibold text-sm">Envío a Domicilio</span>
                </label>
                <label className={`flex-1 relative flex cursor-pointer rounded-xl border p-4 transition-all items-center gap-3 ${shippingMethod === "PICKUP" ? "border-[#006065] bg-teal-50/30 ring-1 ring-[#006065]" : "hover:border-[#006065]"}`}>
                  <input type="radio" name="shippingMethod" value="PICKUP" checked={shippingMethod === "PICKUP"} onChange={() => setShippingMethod("PICKUP")} className="sr-only" />
                  <Store className={`h-6 w-6 ${shippingMethod === "PICKUP" ? "text-[#006065]" : "text-muted-foreground"}`} />
                  <span className="font-semibold text-sm">Recojo en Tienda</span>
                </label>
              </div>

              {shippingMethod === "DELIVERY" ? (
                <div className="rounded-xl border p-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Región / Provincia</Label>
                    <Input 
                      placeholder="Ej. Lima, Arequipa..." 
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Ciudad / Distrito</Label>
                    <Input 
                      placeholder="Ej. Miraflores, San Isidro..." 
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Dirección exacta</Label>
                    <Input 
                      placeholder="Av., Calle, Nro., Dpto." 
                      value={shippingStreet}
                      onChange={(e) => setShippingStreet(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 flex gap-4 items-start">
                  <Store className="h-6 w-6 text-[#006065] mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-[#006065]">Recojo en nuestro local central</p>
                    <p className="text-sm text-muted-foreground mt-1">Av. San Martín 123, Miraflores, Lima.</p>
                    <p className="text-xs text-teal-800 mt-2 font-medium bg-white px-2 py-1 rounded inline-block">Costo de envío: S/ 0.00</p>
                  </div>
                </div>
              )}
            </section>

            {/* Datos para Comprobante */}
            <section>
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

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Número de Documento</Label>
                  <Input 
                    placeholder={`Número de ${docType}`} 
                    value={docNumber} 
                    onChange={(e) => setDocNumber(e.target.value.replace(/\D/g, ''))}
                    maxLength={docType === "DNI" ? 8 : 11}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Razón Social / Nombres y Apellidos</Label>
                  <Input 
                    value={billingName}
                    onChange={(e) => setBillingName(e.target.value.toUpperCase())}
                    placeholder={docType === "DNI" ? "Nombres completos" : "Razón social"}
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Correo electrónico (envío de comprobante)</Label>
                  <Input 
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* LADO DERECHO: RESUMEN DEL PEDIDO */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border bg-white p-6 sticky top-24">
            <h2 className="font-headline text-lg font-semibold mb-4">Resumen de tu pedido</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {cartItems?.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-16 shrink-0 rounded border bg-muted overflow-hidden">
                    {item.product?.images?.[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs">📦</div>
                    )}
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gray-500 text-[10px] text-white flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{item.product?.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatPrice(toNumber(item.price))} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                      {formatPrice(toNumber(item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>{calculatedShipping === 0 ? "Gratis" : formatPrice(calculatedShipping)}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6 flex justify-between items-center">
              <span className="font-semibold text-lg">Total a Pagar</span>
              <span className="font-headline text-2xl font-bold" style={{ color: "#006065" }}>
                {formatPrice(finalTotal)}
              </span>
            </div>

            {/* BOTÓN DE PAGO MOVIDO AL RESUMEN */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isPending}
              className="btn-ikaza-cart w-full py-4 text-base flex justify-center items-center gap-2"
            >
              {isPending ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Procesando...</>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Pagar {formatPrice(finalTotal)}
                </>
              )}
            </button>
            <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Pagos procesados de forma segura por Culqi
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
