"use client";

import { useState } from "react";
import { Tag, Plus, Edit, Trash2, Loader2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createCategory, updateCategory, deleteCategory } from "./actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function CategoriesClientPage({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category);
    } else {
      setEditingCategory(null);
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, formData);
      } else {
        result = await createCategory(formData);
      }

      if (result.success) {
        toast.success(editingCategory ? "Categoría actualizada" : "Categoría creada");
        setIsOpen(false);
        // Refresh would be handled by Server Action revalidatePath, 
        // but we can optimistic update or wait for refresh
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
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;
    
    setIsDeleting(id);
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success("Categoría eliminada");
        setCategories(categories.filter((c: any) => c.id !== id));
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al eliminar la categoría");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona la organización y agrupación de tus productos.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#006065] hover:bg-[#004f53] text-white">
          <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">Listado de Categorías</CardTitle>
            <Badge variant="secondary" className="bg-[#c7fbff] text-[#006065] hover:bg-[#7dd4db]">
              {categories.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Tag className="h-12 w-12 mb-4 opacity-20" />
              <p>No hay categorías registradas.</p>
              <Button variant="link" onClick={() => handleOpenDialog()}>Crea tu primera categoría</Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Orden</TableHead>
                    <TableHead className="text-center">Productos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div>
                          {category.name}
                          {category.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{category.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell><code className="px-2 py-1 bg-muted rounded-md text-xs">{category.slug}</code></TableCell>
                      <TableCell>{category.sortOrder}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{category._count?.products || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(category)}>
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(category.id)}
                            disabled={isDeleting === category.id}
                          >
                            {isDeleting === category.id ? (
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
              <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" defaultValue={editingCategory?.name} required placeholder="Ej. Electrodomésticos" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug (URL amigable)</Label>
                <Input id="slug" name="slug" defaultValue={editingCategory?.slug} placeholder="ej-electrodomesticos" />
                <p className="text-xs text-muted-foreground">Dejar en blanco para generar automáticamente.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" name="description" defaultValue={editingCategory?.description} placeholder="Breve descripción..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Orden de visualización</Label>
                <Input id="sortOrder" name="sortOrder" type="number" defaultValue={editingCategory?.sortOrder || 0} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isLoading} className="bg-[#006065] hover:bg-[#004f53] text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
