import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { formatPrice, formatDateShort } from "@/lib/utils";
import { Package, MapPin, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Pedido #${id.slice(-8).toUpperCase()} — ikaZa Import`,
    robots: { index: false, follow: false }, // Las órdenes no deben indexarse
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/orders");
  }

  const { id } = await params;

  // =========================================================================
  // Patrón 8 (AGENTS.md): Prevención de IDOR
  // SIEMPRE verificar que userId de la orden coincide con el usuario de la sesión.
  // Retornamos notFound() para no confirmar la existencia del recurso (nunca 403).
  // =========================================================================
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
        },
      },
      address: true,
    },
  });

  // Si la orden no existe O no pertenece al usuario → notFound()
  // Esto evita revelar si el ID existe a usuarios malintencionados
  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente de pago",
    PROCESSING: "En preparación",
    SHIPPED: "En camino",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="ikaza-container py-8 fade-in">
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground">Inicio</Link></li>
          <li>/</li>
          <li><Link href="/orders" className="hover:text-foreground">Mis Pedidos</Link></li>
          <li>/</li>
          <li className="text-foreground font-medium">#{id.slice(-8).toUpperCase()}</li>
        </ol>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-headline text-2xl font-bold">
          Pedido #{id.slice(-8).toUpperCase()}
        </h1>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold w-fit ${statusColors[order.status] ?? "bg-gray-100 text-gray-700"}`}>
          {statusLabels[order.status] ?? order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Productos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-muted/30">
              <p className="text-sm text-muted-foreground">Realizado el {formatDateShort(order.createdAt)}</p>
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center p-4">
                  <div className="relative h-20 w-20 shrink-0 rounded-lg border bg-muted overflow-hidden">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.productName}
                        fill
                        className="object-contain"
                        sizes="80px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-semibold hover:underline"
                      style={{ color: "#006065" }}
                    >
                      {item.productName}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">SKU: {item.productSku}</p>
                    <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">{formatPrice(Number(item.totalPrice))}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(Number(item.unitPrice))} c/u</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen y Dirección */}
        <div className="space-y-4">
          {/* Resumen de costos */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" style={{ color: "#006065" }} />
              Resumen del pedido
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>{Number(order.shippingAmount) === 0 ? "Gratis" : formatPrice(Number(order.shippingAmount))}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Descuento</span>
                  <span>-{formatPrice(Number(order.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t text-base">
                <span>Total</span>
                <span style={{ color: "#006065" }}>{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Dirección */}
          {order.address && (
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" style={{ color: "#006065" }} />
                Dirección de entrega
              </h2>
              <address className="not-italic text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{order.address.firstName} {order.address.lastName}</p>
                {order.address.company && <p className="text-xs">{order.address.company}</p>}
                <p>{order.address.street}{order.address.number ? ` ${order.address.number}` : ""}</p>
                {order.address.district && <p>{order.address.district}</p>}
                <p>{order.address.city}, {order.address.state}</p>
                {order.address.phone && <p>Tel: {order.address.phone}</p>}
              </address>
            </div>
          )}

          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors"
          >
            <Package className="h-4 w-4" />
            Ver todos mis pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}
