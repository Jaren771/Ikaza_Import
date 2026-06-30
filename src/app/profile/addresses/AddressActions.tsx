"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteAddress, setDefaultAddress } from "./actions";

interface AddressActionsProps {
  addressId: string;
  isDefault: boolean;
  orderCount: number;
}

export function AddressActions({ addressId, isDefault, orderCount }: AddressActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const markAsDefault = () => {
    startTransition(async () => {
      const result = await setDefaultAddress(addressId);
      if (result.success) {
        toast.success(result.message ?? "Dirección actualizada");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const removeAddress = () => {
    if (!window.confirm("¿Eliminar esta dirección?")) return;

    startTransition(async () => {
      const result = await deleteAddress(addressId);
      if (result.success) {
        toast.success(result.message ?? "Dirección eliminada");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {!isDefault && (
        <Button
          type="button"
          variant="outline"
          onClick={markAsDefault}
          disabled={isPending}
        >
          <Check className="h-4 w-4" />
          Predeterminada
        </Button>
      )}
      <Button
        type="button"
        variant="destructive"
        onClick={removeAddress}
        disabled={isPending || orderCount > 0}
        title={orderCount > 0 ? "No se puede eliminar una dirección usada en pedidos" : undefined}
      >
        <Trash2 className="h-4 w-4" />
        Eliminar
      </Button>
    </div>
  );
}
