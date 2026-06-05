import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { formatPrice, toNumber } from "@/lib/utils";
import { ShieldCheck, Lock } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout Seguro — ikaZa Import",
};

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  // 1. Obtener carrito
  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  // 2. Obtener direcciones del usuario
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: "desc" },
  });

  // 3. Totales
  const subtotal = cart.items.reduce((sum, item) => sum + toNumber(item.price) * item.quantity, 0);
  const shipping = subtotal >= 150 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <div className="ikaza-container py-8" style={{ backgroundColor: "#fbf9f8" }}>
      <div className="mb-8 border-b pb-4 flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold flex items-center gap-2">
          <Lock className="h-5 w-5" style={{ color: "#006065" }} />
          Pago Seguro
        </h1>
        <div className="flex items-center gap-1 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
          <ShieldCheck className="h-4 w-4" />
          SSL Encriptado 256-bit
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulario de Checkout */}
        <div className="lg:col-span-7">
          <CheckoutForm addresses={addresses} cartTotal={total} />
        </div>

        {/* Resumen del Pedido */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border bg-white p-6 sticky top-24">
            <h2 className="font-headline text-lg font-semibold mb-4">Resumen de tu pedido</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-16 shrink-0 rounded border bg-muted overflow-hidden">
                    {item.product.images[0] ? (
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
                    <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
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
                <span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <span className="font-semibold text-lg">Total a Pagar</span>
              <span className="font-headline text-2xl font-bold" style={{ color: "#006065" }}>
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
