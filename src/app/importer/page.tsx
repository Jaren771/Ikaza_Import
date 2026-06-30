import Link from "next/link";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Anchor, ArrowRight, FileText, MapPin, Package, Plus, Ship, Truck } from "lucide-react";
import { getImporterDashboardData } from "@/app/importer/actions";
import { formatDateShort, formatPrice } from "@/lib/utils";

const statusMeta: Record<
  string,
  { label: string; className: string; icon: LucideIcon }
> = {
  DRAFT: { label: "Borrador", className: "bg-slate-100 text-slate-700", icon: Package },
  SENT: { label: "Enviado", className: "bg-teal-100 text-teal-800", icon: Truck },
  IN_TRANSIT: { label: "En tránsito", className: "bg-blue-100 text-blue-700", icon: Ship },
  CUSTOMS: { label: "Aduanas", className: "bg-orange-100 text-orange-700", icon: Anchor },
  RECEIVED: { label: "Recibido", className: "bg-green-100 text-green-700", icon: Package },
  CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-700", icon: Package },
};

export default async function ImporterDashboardPage() {
  const result = await getImporterDashboardData();

  if (!result.success) {
    if (result.error === "No autorizado") redirect("/unauthorized");
    redirect("/login?callbackUrl=/importer");
  }

  const { shipments, stats } = result.data;

  const kpis = [
    { label: "En tránsito", value: String(stats.inTransit), icon: Ship, color: "#2563eb" },
    { label: "En aduanas", value: String(stats.customs), icon: Anchor, color: "#d97706" },
    { label: "Preparación", value: String(stats.preparation), icon: Truck, color: "#006065" },
    {
      label: "Valor activo",
      value: formatPrice(stats.activeValue, "USD", "en-US"),
      icon: FileText,
      color: "#059669",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold">Gestión de Importaciones</h1>
          <p className="text-muted-foreground mt-1">
            Control y seguimiento de embarques internacionales
          </p>
        </div>
        <Link
          href="/importer/shipments/new"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "#006065" }}
        >
          <Plus className="h-4 w-4" />
          Nuevo Embarque
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border bg-white p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <kpi.icon className="h-6 w-6" style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                <p className="font-headline text-2xl font-bold">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b p-4">
          <h2 className="font-headline font-semibold">Embarques Activos</h2>
        </div>

        {shipments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Ship className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-headline text-lg font-semibold">No hay embarques registrados</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Crea el primer embarque para empezar el seguimiento.
            </p>
            <Link href="/importer/shipments/new" className="btn-ikaza-primary mt-6">
              Nuevo Embarque
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">ID / Contenedor</th>
                  <th className="px-4 py-3 font-medium">Proveedor</th>
                  <th className="px-4 py-3 font-medium">Ruta</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">ETA</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {shipments.map((shipment) => {
                  const meta = statusMeta[shipment.status] ?? statusMeta.DRAFT;
                  const StatusIcon = meta.icon;
                  const itemCount = shipment.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <tr key={shipment.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#006065]">{shipment.orderNumber}</p>
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {shipment.containerId ?? "Sin contenedor"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{shipment.supplier.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {itemCount} unidades | {formatPrice(shipment.totalCost, shipment.currency)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium">
                            {(shipment.origin ?? "Origen").split(",")[0]}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">
                            {(shipment.destination ?? "Destino").split(",")[0]}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Ship className="h-3 w-3" />
                          {shipment.vessel ?? "Nave pendiente"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {shipment.estimatedArrival
                              ? formatDateShort(shipment.estimatedArrival)
                              : "Sin fecha"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/importer/shipments/${shipment.id}`}
                          className="text-sm font-medium text-[#006065] hover:underline"
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
