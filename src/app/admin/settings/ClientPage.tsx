"use client";
import { useState } from "react";
import { Settings, Save, Store, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function SettingsClientPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simular guardado de configuración (Al no haber tabla en BD para esto aún)
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Configuración general guardada exitosamente.");
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground mt-1">Ajustes globales de la tienda y preferencias del sistema.</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="bg-[#006065] hover:bg-[#004f53] text-white">
          <Save className="mr-2 h-4 w-4" /> {isLoading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="store">Datos de la Tienda</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Preferencias Generales</CardTitle>
              <CardDescription>Configuración básica del panel administrativo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Moneda Principal</Label>
                <select className="flex h-10 w-full md:w-1/3 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="PEN">Soles (PEN)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Idioma del Panel</Label>
                <select className="flex h-10 w-full md:w-1/3 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" /> Información de la Tienda</CardTitle>
              <CardDescription>Datos públicos que verán tus clientes en facturas y correos.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Nombre de la Tienda</Label>
                    <Input defaultValue="ikaZa Import" />
                  </div>
                  <div className="grid gap-2">
                    <Label>RUC / Razón Social</Label>
                    <Input placeholder="Ej. 20123456789" />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Dirección Física</Label>
                    <Input placeholder="Av. Principal 123, Lima, Perú" />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label className="flex items-center gap-2"><Mail className="h-4 w-4" /> Correo de Soporte al Cliente</Label>
                    <Input type="email" defaultValue="soporte@ikaza.pe" />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Alertas del Sistema</CardTitle>
              <CardDescription>Controla qué avisos quieres recibir en el panel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="stock" defaultChecked className="h-4 w-4 rounded border-gray-300" />
                <Label htmlFor="stock">Alerta de stock bajo en inventario</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="orders" defaultChecked className="h-4 w-4 rounded border-gray-300" />
                <Label htmlFor="orders">Notificar cuando ingresa un nuevo pedido web</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="users" className="h-4 w-4 rounded border-gray-300" />
                <Label htmlFor="users">Avisar cuando se registre un nuevo usuario</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
