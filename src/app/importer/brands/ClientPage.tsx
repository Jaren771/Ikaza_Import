"use client";

import { useState } from "react";
import { Shield, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createBrand, updateBrand, deleteBrand } from "./actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function BrandsClientPage({ initialBrands }: { initialBrands: any[] }) {
  const [brands, setBrands] = useState(initialBrands);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenDialog = (brand?: any) => {
    if (brand) {
      setEditingBrand(brand);
    } else {
      setEditingBrand(null);
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      let result;
      if (editingBrand) {
        result = await updateBrand(editingBrand.id, formData);
      } else {
        result = await createBrand(formData);
      }

      if (result.success) {
        toast.success(editingBrand ? "Marca actualizada" : "Marca creada");
        setIsOpen(false);
        window.location.reload(); 
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta marca?")) return;
    
    setIsDeleting(id);
    try {
      const result = await deleteBrand(id);
      if (result.success) {
        toast.success("Marca eliminada");
        setBrands(brands.filter((c: any) => c.id !== id));
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al eliminar la marca");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Marcas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las marcas de los productos que importas.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#006065] hover:bg-[#004f53] text-white">
          <Plus className="mr-2 h-4 w-4" /> Nueva Marca
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">Listado de Marcas</CardTitle>
            <Badge variant="secondary" className="bg-[#c7fbff] text-[#006065] hover:bg-[#7dd4db]">
              {brands.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {brands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mb-4 opacity-20" />
              <p>No hay marcas registradas.</p>
              <Button variant="link" onClick={() => handleOpenDialog()}>Crea tu primera marca</Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-center">Productos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">
                        <div>
                          {brand.name}
                          {brand.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{brand.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell><code className="px-2 py-1 bg-muted rounded-md text-xs">{brand.slug}</code></TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{brand._count?.products || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(brand)}>
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(brand.id)}
                            disabled={isDeleting === brand.id}
                          >
                            {isDeleting === brand.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingBrand ? "Editar Marca" : "Nueva Marca"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" defaultValue={editingBrand?.name} required placeholder="Ej. Samsung" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug (URL amigable)</Label>
                <Input id="slug" name="slug" defaultValue={editingBrand?.slug} placeholder="ej-samsung" />
                <p className="text-xs text-muted-foreground">Dejar en blanco para generar automáticamente.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" name="description" defaultValue={editingBrand?.description} placeholder="Breve descripción..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isLoading} className="bg-[#006065] hover:bg-[#004f53] text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingBrand ? "Guardar Cambios" : "Crear Marca"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
