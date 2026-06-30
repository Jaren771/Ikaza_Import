import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MapPin, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserAddresses } from "./actions";
import { AddressActions } from "./AddressActions";

export const metadata = { title: "Mis Direcciones - ikaZa Import" };

export default async function AddressesPage() {
  const result = await getUserAddresses();

  if (!result.success) {
    redirect("/login?callbackUrl=/profile/addresses");
  }

  const addresses = result.data;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" className="h-10 w-10 rounded-full p-0">
            <Link href="/profile" aria-label="Volver a mi cuenta">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-headline text-3xl font-bold">Mis Direcciones</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {addresses.length} {addresses.length === 1 ? "dirección guardada" : "direcciones guardadas"}
            </p>
          </div>
        </div>
        <Button asChild className="bg-[#006065] text-white hover:bg-[#004f53]">
          <Link href="/profile/addresses/new">
            <Plus className="h-4 w-4" />
            Agregar dirección
          </Link>
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="font-headline text-xl font-semibold">No tienes direcciones guardadas</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Agrega una dirección para usarla en el checkout y acelerar tus compras.
            </p>
            <Button asChild className="mt-6 bg-[#006065] text-white hover:bg-[#004f53]">
              <Link href="/profile/addresses/new">Agregar dirección</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg">
                    {address.alias ?? `${address.firstName} ${address.lastName}`}
                  </CardTitle>
                  {address.isDefault && <Badge>Predeterminada</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {address.firstName} {address.lastName}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-foreground">
                    {address.street}
                    {address.number ? ` ${address.number}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {[address.district, address.city, address.state].filter(Boolean).join(", ")}
                  </p>
                  {address.phone && <p className="text-muted-foreground">{address.phone}</p>}
                </div>

                {address._count.orders > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Usada en {address._count.orders} pedido{address._count.orders === 1 ? "" : "s"}.
                  </p>
                )}

                <AddressActions
                  addressId={address.id}
                  isDefault={address.isDefault}
                  orderCount={address._count.orders}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
