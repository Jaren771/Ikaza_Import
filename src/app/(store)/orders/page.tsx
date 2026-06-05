import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatPrice, formatDateShort } from "@/lib/utils";
import { Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Pedidos — ikaZa Import",
};

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/orders");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
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

  return (
    <div className="ikaza-container py-8 fade-in min-h-[60vh]">
      <h1 className="font-headline text-3xl font-bold mb-8">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center bg-white">
          <div className="flex justify-center mb-4">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Aún no tienes pedidos</h2>
          <p className="text-muted-foreground mb-6">
            Tus compras aparecerán aquí una vez que realices tu primer pedido.
          </p>
          <Link href="/catalog" className="btn-ikaza-primary">
            Empezar a comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border bg-white overflow-hidden shadow-sm">
              <div className="bg-muted/50 p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-0.5">Pedido realizado</p>
                    <p className="font-medium">{formatDateShort(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Total</p>
                    <p className="font-medium">{formatPrice(Number(order.total))}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Nº de pedido</p>
                    <p className="font-mono">{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                    order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                    order.status === "SHIPPED" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {order.status === "PENDING" ? "Pendiente" :
                     order.status === "PROCESSING" ? "En Proceso" :
                     order.status === "SHIPPED" ? "Enviado" :
                     order.status === "DELIVERED" ? "Entregado" :
                     order.status === "CANCELLED" ? "Cancelado" : order.status}
                  </span>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm font-semibold text-[#006065] hover:underline"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
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
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm font-medium hover:underline text-[#006065]"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-sm text-muted-foreground">Cant: {item.quantity}</p>
                    </div>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="hidden sm:flex items-center gap-1 text-sm rounded-full border px-4 py-1.5 hover:bg-muted transition-colors"
                    >
                      Volver a comprar
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
