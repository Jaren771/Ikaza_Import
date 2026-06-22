"use client";
import { useState } from "react";
import { Image, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createBanner, deleteBanner } from "./actions";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function BannersClientPage({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await createBanner(formData);
    if (result.success) {
      toast.success("Banner creado");
      setIsOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar banner?")) return;
    const result = await deleteBanner(id);
    if (result.success) {
      toast.success("Eliminado");
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Banners</h1>
          <p className="text-muted-foreground mt-1">Gestión visual del sitio web.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-[#006065] hover:bg-[#004f53] text-white">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Banner
        </Button>
      </div>
      <Card className="border-border">
        <CardHeader className="pb-3"><CardTitle className="text-lg font-medium">Listado</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Vista</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Posición</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="h-10 w-16 rounded overflow-hidden bg-muted">
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{item.title}</TableCell>
                    <TableCell>{item.position}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={item.isActive ? "default" : "secondary"}>{item.isActive ? "Activo" : "Inactivo"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent aria-describedby={undefined}>
          <form onSubmit={handleSubmit}>
            <DialogHeader><DialogTitle>Nuevo Banner</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Título (Solo uso interno)</Label>
                <Input name="title" required />
              </div>
              <div className="grid gap-2">
                <Label>URL de Imagen</Label>
                <Input name="image" type="url" required placeholder="https://..." />
              </div>
              <div className="grid gap-2">
                <Label>Enlace de redirección (Opcional)</Label>
                <Input name="link" placeholder="/catalog/promociones" />
              </div>
              <div className="grid gap-2">
                <Label>Posición</Label>
                <select name="position" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="home_hero">Slider Principal (Home)</option>
                  <option value="home_secondary">Banners Secundarios (Home)</option>
                  <option value="catalog_top">Catálogo Superior</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#006065] hover:bg-[#004f53] text-white">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
