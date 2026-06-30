import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { AddressForm } from "../AddressForm";

interface NewAddressPageProps {
  searchParams: Promise<{
    returnTo?: string;
  }>;
}

export const metadata = { title: "Agregar Dirección - ikaZa Import" };

function safeReturnTo(value?: string) {
  return value?.startsWith("/") ? value : undefined;
}

export default async function NewAddressPage({ searchParams }: NewAddressPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile/addresses/new");
  }

  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <Button asChild variant="outline" className="h-10 w-10 rounded-full p-0">
          <Link href={returnTo ?? "/profile/addresses"} aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-3xl font-bold">Agregar Dirección</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Guarda los datos que se usarán para el envío.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva dirección</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressForm returnTo={returnTo} />
        </CardContent>
      </Card>
    </div>
  );
}
