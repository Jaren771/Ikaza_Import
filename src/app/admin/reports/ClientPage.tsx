"use client";
import { FileText, Download, TrendingDown, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReportsClientPage({ data }: { data: any }) {
  const { recentSales = [], lowStockProducts = [] } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground mt-1">Análisis detallado e informes exportables.</p>
        </div>
        <Button variant="outline" className="bg-white">
          <Download className="mr-2 h-4 w-4" /> Exportar a CSV
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" /> Reporte de Ventas Recientes</CardTitle>
            <CardDescription>Últimos pedidos procesados o entregados exitosamente.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No hay ventas recientes.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSales.map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell className="text-xs text-muted-foreground">{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium text-sm truncate max-w-[120px]">{sale.user?.name || sale.user?.email || "Invitado"}</TableCell>
                        <TableCell className="text-right font-bold text-sm text-green-600">S/ {Number(sale.total).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5 text-orange-500" /> Reporte de Riesgo de Quiebre</CardTitle>
            <CardDescription>Productos con stock crítico (menos de 10 unidades).</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">El inventario está saludable.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Stock Actual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((inv: any) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium text-sm truncate max-w-[200px]">{inv.product?.name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive" className={inv.quantity === 0 ? "bg-red-600" : "bg-orange-500"}>
                            {inv.quantity} uds.
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Informes Generales</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-12">Reporte de Clientes VIP</Button>
            <Button variant="outline" className="justify-start h-12">Reporte de Rentabilidad</Button>
            <Button variant="outline" className="justify-start h-12">Reporte de Descuentos Aplicados</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">* Más informes estarán disponibles a medida que se acumule data en la importadora.</p>
        </CardContent>
      </Card>
    </div>
  );
}
