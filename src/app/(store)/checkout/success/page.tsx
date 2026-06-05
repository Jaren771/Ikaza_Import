import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CheckCircle2, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const session = await auth();
  const { orderId } = await searchParams;

  if (!session?.user?.id || !orderId) {
    redirect("/");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId, userId: session.user.id },
  });

  if (!order) {
    redirect("/");
  }

  return (
    <div className="ikaza-container py-16 flex justify-center fade-in">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <h1 className="font-headline text-3xl font-bold mb-2">¡Pedido Confirmado!</h1>
        <p className="text-muted-foreground mb-8">
          Gracias por tu compra. Hemos enviado la confirmación a <strong>{session.user.email}</strong>.
        </p>

        <div className="rounded-xl border bg-white p-6 text-left mb-8 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Número de pedido</p>
          <p className="font-mono text-lg font-semibold mb-4">#{order.id.slice(-8).toUpperCase()}</p>
          
          <div className="border-t pt-4 flex justify-between items-center">
            <span className="text-sm font-medium">Total Pagado</span>
            <span className="font-headline text-xl font-bold" style={{ color: "#006065" }}>
              {formatPrice(Number(order.total))}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/orders"
            className="btn-ikaza-primary w-full py-3"
          >
            Ver mis pedidos
          </Link>
          <Link
            href="/catalog"
            className="flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted w-full"
          >
            Seguir comprando
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
