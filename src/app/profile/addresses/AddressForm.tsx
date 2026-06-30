"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAddress } from "./actions";

interface AddressFormProps {
  returnTo?: string;
}

export function AddressForm({ returnTo }: AddressFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createAddress(formData);

      if (result.success) {
        toast.success(result.message ?? "Dirección guardada");
        router.push(returnTo ?? "/profile/addresses");
        router.refresh();
        return;
      }

      setFieldErrors(result.fieldErrors ?? {});
      toast.error(result.error);
    });
  };

  const errorFor = (field: string) => fieldErrors[field]?.[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Alias" name="alias" placeholder="Casa, oficina" error={errorFor("alias")} />
        <Field label="Teléfono" name="phone" placeholder="999 999 999" error={errorFor("phone")} />
        <Field label="Nombre" name="firstName" required error={errorFor("firstName")} />
        <Field label="Apellido" name="lastName" required error={errorFor("lastName")} />
        <Field label="Empresa" name="company" error={errorFor("company")} />
        <Field label="DNI/RUC o referencia" name="postalCode" error={errorFor("postalCode")} />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_140px]">
        <Field label="Dirección" name="street" required error={errorFor("street")} />
        <Field label="Número" name="number" error={errorFor("number")} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Distrito" name="district" error={errorFor("district")} />
        <Field label="Ciudad" name="city" required defaultValue="Lima" error={errorFor("city")} />
        <Field label="Departamento" name="state" required defaultValue="Lima" error={errorFor("state")} />
      </div>

      <input type="hidden" name="country" value="PE" />

      <div className="flex items-center gap-2">
        <Checkbox id="isDefault" name="isDefault" />
        <Label htmlFor="isDefault" className="cursor-pointer text-sm font-normal">
          Usar como dirección predeterminada
        </Label>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(returnTo ?? "/profile/addresses")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} className="bg-[#006065] text-white hover:bg-[#004f53]">
          <Save className="h-4 w-4" />
          {isPending ? "Guardando..." : "Guardar dirección"}
        </Button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
}

function Field({ label, name, required, placeholder, defaultValue, error }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
