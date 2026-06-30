import Link from "next/link";
import type { ElementType } from "react";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Container, MapPin, Ship } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getImportShipment } from "@/app/importer/actions";
import { formatDateShort, formatPrice } from "@/lib/utils";

interface ImportShipmentDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusLabel: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  IN_TRANSIT: "En tránsito",
  CUSTOMS: "Aduanas",
  RECEIVED: "Recibido",
  CANCELLED: "Cancelado",
};

export async function generateMetadata({ params }: ImportShipmentDetailPageProps) {
  const { id } = await params;
  return { title: `Embarque ${id} - ikaZa Import` };
}

export default async function ImportShipmentDetailPage({ params }: ImportShipmentDetailPageProps) {
  const { id } = await params;
  const result = await getImportShipment(id);

  if (!result.success) {
    if (result.error === "No autorizado" || result.error === "Debes iniciar sesión") {
      redirect("/login");
    }
    notFound();
  }

  const shipment = result.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" className="h-10 w-10 rounded-full p-0">
            <Link href="/importer" aria-label="Volver a importaciones">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-headline text-2xl font-bold">{shipment.orderNumber}</h1>
              <Badge>{statusLabel[shipment.status] ?? shipment.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{shipment.supplier.name}</p>
          </div>
        </div>
        <Button asChild className="bg-[#006065] text-white hover:bg-[#004f53]">
          <Link href="/importer/shipments/new">Nuevo Embarque</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={Container} label="Contenedor" value={shipment.containerId ?? "Pendiente"} />
        <InfoCard icon={Ship} label="Nave" value={shipment.vessel ?? "Pendiente"} />
        <InfoCard
          icon={MapPin}
          label="Ruta"
          value={`${shipment.origin ?? "Origen pendiente"} → ${shipment.destination ?? "Destino pendiente"}`}
        />
        <InfoCard
          icon={CalendarDays}
          label="Llegada estimada"
          value={shipment.estimatedArrival ? formatDateShort(shipment.estimatedArrival) : "Sin fecha"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalle logístico</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Proveedor" value={shipment.supplier.name} />
            <Detail label="País proveedor" value={shipment.supplier.country ?? "No registrado"} />
            <Detail label="Origen" value={shipment.origin ?? "No registrado"} />
            <Detail label="Destino" value={shipment.destination ?? "No registrado"} />
            <Detail label="Contenedor" value={shipment.containerId ?? "No registrado"} />
            <Detail label="Nave" value={shipment.vessel ?? "No registrada"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Costos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Cost label="Total" value={shipment.totalCost} currency={shipment.currency} strong />
            <Cost label="Flete" value={shipment.shippingCost} currency={shipment.currency} />
            <Cost label="Aduanas" value={shipment.customsCost} currency={shipment.currency} />
            <Cost label="Otros" value={shipment.otherCosts} currency={shipment.currency} />
            {shipment.exchangeRate && (
              <div className="flex justify-between border-t pt-3">
                <span className="text-muted-foreground">Tipo de cambio</span>
                <span className="font-medium">{shipment.exchangeRate}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos del embarque</CardTitle>
        </CardHeader>
        <CardContent>
          {shipment.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este embarque aún no tiene productos asociados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2 font-medium">Producto</th>
                    <th className="py-2 font-medium">Cantidad</th>
                    <th className="py-2 font-medium">Costo unitario</th>
                    <th className="py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {shipment.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                      </td>
                      <td className="py-3">{item.quantity}</td>
                      <td className="py-3">{formatPrice(item.unitCost, shipment.currency)}</td>
                      <td className="py-3 text-right">{formatPrice(item.totalCost, shipment.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-[#006065]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate font-medium">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Cost({
  label,
  value,
  currency,
  strong,
}: {
  label: string;
  value: number | null;
  currency: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-bold text-[#006065]" : "font-medium"}>
        {value === null ? "-" : formatPrice(value, currency)}
      </span>
    </div>
  );
}
