"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createImportShipment } from "@/app/importer/actions";

interface SupplierOption {
  id: string;
  name: string;
  country: string | null;
}

interface ImportShipmentFormProps {
  suppliers: SupplierOption[];
}

export function ImportShipmentForm({ suppliers }: ImportShipmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createImportShipment(formData);

      if (result.success) {
        toast.success(result.message ?? "Embarque creado");
        router.push(`/importer/shipments/${result.data.id}`);
        router.refresh();
        return;
      }

      setError(result.error);
      toast.error(result.error);
    });
  };

  if (suppliers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-white p-8 text-center">
        <h2 className="font-headline text-lg font-semibold">No hay proveedores activos</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Registra al menos un proveedor antes de crear embarques.
        </p>
        <Button asChild className="mt-5 bg-[#006065] text-white hover:bg-[#004f53]">
          <Link href="/importer/suppliers">Ir a proveedores</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="supplierId">Proveedor</Label>
          <select
            id="supplierId"
            name="supplierId"
            required
            className="h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-[#006065] focus:ring-1 focus:ring-[#006065]"
          >
            <option value="">Seleccionar proveedor</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
                {supplier.country ? ` - ${supplier.country}` : ""}
              </option>
            ))}
          </select>
        </div>
        <Field label="Número de embarque" name="orderNumber" placeholder="Autogenerado si se deja vacío" />
        <Field label="Costo total" name="totalCost" type="number" step="0.01" min="0" required />
        <div className="space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <select
            id="currency"
            name="currency"
            defaultValue="USD"
            className="h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-[#006065] focus:ring-1 focus:ring-[#006065]"
          >
            <option value="USD">USD</option>
            <option value="PEN">PEN</option>
          </select>
        </div>
        <Field label="Tipo de cambio" name="exchangeRate" type="number" step="0.0001" min="0" />
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            name="status"
            defaultValue="DRAFT"
            className="h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-[#006065] focus:ring-1 focus:ring-[#006065]"
          >
            <option value="DRAFT">Borrador</option>
            <option value="SENT">Enviado</option>
            <option value="IN_TRANSIT">En tránsito</option>
            <option value="CUSTOMS">Aduanas</option>
            <option value="RECEIVED">Recibido</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Contenedor" name="containerId" placeholder="CMAU1234567" />
        <Field label="Nave" name="vessel" placeholder="MSC ISABELLA" />
        <Field label="Origen" name="origin" placeholder="Guangzhou, CN" />
        <Field label="Destino" name="destination" defaultValue="Callao, PE" />
        <Field label="Llegada estimada" name="estimatedArrival" type="date" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Field label="Flete" name="shippingCost" type="number" step="0.01" min="0" />
        <Field label="Aduanas" name="customsCost" type="number" step="0.01" min="0" />
        <Field label="Otros costos" name="otherCosts" type="number" step="0.01" min="0" />
      </section>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#006065] focus:ring-1 focus:ring-[#006065]"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <Link href="/importer">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={isPending} className="bg-[#006065] text-white hover:bg-[#004f53]">
          <Save className="h-4 w-4" />
          {isPending ? "Guardando..." : "Guardar embarque"}
        </Button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  step?: string;
  min?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

function Field({ label, name, type = "text", step, min, required, placeholder, defaultValue }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        step={step}
        min={min}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </div>
  );
}
