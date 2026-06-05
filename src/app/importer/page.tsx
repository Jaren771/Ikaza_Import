import { prisma } from "@/lib/prisma";
import { Truck, Ship, Anchor, MapPin, Search, Plus, Filter, FileText } from "lucide-react";
import { formatPrice, formatDateShort } from "@/lib/utils";

// =============================================================================
// Dashboard Importadora — Gestión de embarques
// =============================================================================

export default async function ImporterDashboardPage() {
  // En un entorno real, tendríamos una tabla de Import/Shipment.
  // Por ahora mostramos un panel de control con mock data estructurada.
  const activeShipments = [
    {
      id: "SHP-2026-041",
      supplier: "Guangzhou Trading Co.",
      containerId: "CMAU1234567",
      status: "IN_TRANSIT",
      origin: "Guangzhou, CN",
      destination: "Callao, PE",
      eta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // +15 días
      value: 45000,
      itemsCount: 1250,
      vessel: "MSC ISABELLA",
    },
    {
      id: "SHP-2026-042",
      supplier: "Shenzhen Tech Innovators",
      containerId: "TGHU8901234",
      status: "AT_PORT",
      origin: "Shenzhen, CN",
      destination: "Callao, PE",
      eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 días
      value: 82000,
      itemsCount: 850,
      vessel: "EVER GIVEN",
    },
    {
      id: "SHP-2026-045",
      supplier: "HomeStyle Furnishings",
      containerId: "Pending",
      status: "PRODUCTION",
      origin: "Ningbo, CN",
      destination: "Callao, PE",
      eta: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // +45 días
      value: 28500,
      itemsCount: 2100,
      vessel: "TBD",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold">Gestión de Importaciones</h1>
          <p className="text-muted-foreground mt-1">Control y seguimiento de embarques internacionales</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "#006065" }}>
          <Plus className="h-4 w-4" />
          Nuevo Embarque
        </button>
      </div>

      {/* KPIs Logísticos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "En Tránsito", value: "4", icon: Ship, color: "#2563eb" },
          { label: "En Puerto (Callao)", value: "2", icon: Anchor, color: "#d97706" },
          { label: "En Producción", value: "7", icon: Truck, color: "#006065" },
          { label: "Valor en Tránsito", value: "$127,000", icon: FileText, color: "#059669" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border bg-white p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
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

      {/* Tabla de Embarques Activos */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-headline font-semibold">Embarques Activos</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar contenedor, B/L..." 
                className="w-full sm:w-64 rounded-lg border pl-9 pr-4 py-2 text-sm outline-none focus:border-[#006065] focus:ring-1 focus:ring-[#006065]"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
              <Filter className="h-4 w-4" /> Filtros
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">ID / Contenedor</th>
                <th className="px-4 py-3 font-medium">Proveedor</th>
                <th className="px-4 py-3 font-medium">Ruta</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">ETA (Llegada)</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#006065]">{shipment.id}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{shipment.containerId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{shipment.supplier}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{shipment.itemsCount} unidades | ${shipment.value.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium">{shipment.origin.split(",")[0]}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{shipment.destination.split(",")[0]}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Ship className="h-3 w-3" />
                      {shipment.vessel}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      shipment.status === "AT_PORT" ? "bg-orange-100 text-orange-700" :
                      shipment.status === "IN_TRANSIT" ? "bg-blue-100 text-blue-700" :
                      "bg-teal-100 text-teal-800"
                    }`}>
                      {shipment.status === "AT_PORT" && <Anchor className="h-3 w-3" />}
                      {shipment.status === "IN_TRANSIT" && <Ship className="h-3 w-3" />}
                      {shipment.status === "PRODUCTION" && <Package className="h-3 w-3" />}
                      {shipment.status === "AT_PORT" ? "En Puerto" :
                       shipment.status === "IN_TRANSIT" ? "En Tránsito" : "En Producción"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatDateShort(shipment.eta)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[#006065] font-medium text-sm hover:underline">Ver detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Icono reutilizable para la tabla
function ArrowRight(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
function Package(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
