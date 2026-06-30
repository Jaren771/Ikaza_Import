import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getImportShipmentFormOptions } from "@/app/importer/actions";
import { ImportShipmentForm } from "../ImportShipmentForm";

export const metadata = { title: "Nuevo Embarque - ikaZa Import" };

export default async function NewImportShipmentPage() {
  const result = await getImportShipmentFormOptions();

  if (!result.success) {
    redirect("/login?callbackUrl=/importer/shipments/new");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" className="h-10 w-10 rounded-full p-0">
          <Link href="/importer" aria-label="Volver a importaciones">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-2xl font-bold">Nuevo Embarque</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registra el seguimiento y costos del embarque internacional.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del embarque</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportShipmentForm suppliers={result.data.suppliers} />
        </CardContent>
      </Card>
    </div>
  );
}
