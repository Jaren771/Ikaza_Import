import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { formatPrice, toNumber } from "@/lib/utils";
import { serializeCart } from "@/features/orders/actions/cart.actions";
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
  const cartRaw = await prisma.cart.findUnique({
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

  if (!cartRaw || cartRaw.items.length === 0) {
    redirect("/cart");
  }

  // Serializar carrito para evitar Decimal
  const cart = await serializeCart(cartRaw);
  if (!cart) redirect("/cart");

  // 2. Obtener direcciones del usuario
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: "desc" },
  });

  // 3. Totales y Peso
  const subtotal = cart.items.reduce((sum, item) => sum + toNumber(item.price) * item.quantity, 0);
  
  let cartItemsWeight = 0;
  for (const item of cart.items) {
    const realW = Number(item.product.weight || 0);
    const w = Number(item.product.width || 0);
    const h = Number(item.product.height || 0);
    const d = Number(item.product.depth || 0);
    const volW = (w * h * d) / 5000;
    const maxW = Math.max(realW, volW) || 1;
    cartItemsWeight += maxW * item.quantity;
  }

  const shipping = subtotal >= 150 ? 0 : 15; // Estimación base visual
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
        <div className="lg:col-span-12">
          <CheckoutForm 
            addresses={addresses} 
            cartTotal={total} 
            subtotal={subtotal} 
            cartItemsWeight={cartItemsWeight}
            cartItems={cart.items} 
          />
        </div>
      </div>
    </div>
  );
}
