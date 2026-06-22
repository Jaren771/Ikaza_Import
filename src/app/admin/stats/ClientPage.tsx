"use client";
import { TrendingUp, Users, ShoppingCart, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsClientPage({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Estadísticas y Reportes</h1>
          <p className="text-muted-foreground mt-1">Métricas clave de rendimiento de la tienda.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ {data.totalRevenue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Históricos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.usersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <Package className="h-4 w-4 text-[#006065]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.productsCount}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader><CardTitle>Reporte de Tendencias</CardTitle></CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center border-t bg-muted/10 text-muted-foreground">
          <div className="text-center">
            <TrendingUp className="h-10 w-10 mx-auto opacity-20 mb-4" />
            <p>Los gráficos avanzados se desbloquearán automáticamente cuando se acumulen ventas suficientes durante el mes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
