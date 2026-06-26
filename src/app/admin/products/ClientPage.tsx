"use client";

import { useState, useCallback } from "react";
import { Package, Plus, Trash2, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createProduct, deleteProduct, getProducts } from "./actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const LIMIT = 20;

export default function ProductsClientPage({ data }: { data: any }) {
  const [products, setProducts] = useState(data.products || []);
  const [totalCount, setTotalCount] = useState(data.totalCount || 0);
  const [totalPages, setTotalPages] = useState(data.totalPages || 0);
  const [categories] = useState(data.categories || []);
  const [brands] = useState(data.brands || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPage = useCallback(async (page: number) => {
    setIsPageLoading(true);
    try {
      const result = await getProducts(page, LIMIT);
      if (result.success && result.data) {
        setProducts(result.data.products);
        setTotalCount(result.data.totalCount);
        setTotalPages(result.data.totalPages);
        setCurrentPage(page);
      }
    } catch {
      toast.error("Error al cargar productos");
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await createProduct(formData);
      if (result.success) {
        toast.success("Producto creado con éxito");
        setIsOpen(false);
        fetchPage(1);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    setIsDeleting(id);
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        toast.success("Producto eliminado");
        const targetPage = products.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        fetchPage(targetPage);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Error al eliminar el producto");
    } finally {
      setIsDeleting(null);
    }
  };

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * LIMIT + 1;
  const endItem = Math.min(currentPage * LIMIT, totalCount);

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el catálogo de productos, inventario y precios.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-[#006065] hover:bg-[#004f53] text-white">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">Listado de Productos</CardTitle>
            <Badge variant="secondary" className="bg-[#c7fbff] text-[#006065] hover:bg-[#7dd4db]">
              {totalCount} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Package className="h-12 w-12 mb-4 opacity-20" />
              <p>No hay productos registrados.</p>
              <Button variant="link" onClick={() => setIsOpen(true)}>Añade tu primer producto</Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Imagen</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
                            {product.images && product.images.length > 0 ? (
                              <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="max-w-[200px] truncate" title={product.name}>
                            {product.name}
                          </div>
                          {product.brand && <p className="text-xs text-muted-foreground">{product.brand.name}</p>}
                        </TableCell>
                        <TableCell><code className="px-1.5 py-0.5 bg-muted rounded text-xs">{product.sku}</code></TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">{product.category?.name || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          S/ {Number(product.price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={product.inventory?.quantity <= 5 ? "text-red-600 font-bold" : ""}>
                            {product.inventory?.quantity || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}
                                 className={product.status === "ACTIVE" ? "bg-green-600 hover:bg-green-700" : ""}>
                            {product.status === "ACTIVE" ? "Activo" : "Borrador"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            disabled={isDeleting === product.id}
                          >
                            {isDeleting === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {startItem}–{endItem} de {totalCount} productos
                </p>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fetchPage(currentPage - 1)}
                    disabled={currentPage <= 1 || isPageLoading}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">...</span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => fetchPage(page)}
                        disabled={isPageLoading}
                        className={`h-8 w-8 text-xs ${currentPage === page ? "bg-[#006065] hover:bg-[#004f53]" : ""}`}
                      >
                        {page}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fetchPage(currentPage + 1)}
                    disabled={currentPage >= totalPages || isPageLoading}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Producto</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="name">Nombre del Producto</Label>
                  <Input id="name" name="name" required placeholder="Ej. Smart TV 55 Pulgadas" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU (Código único)</Label>
                  <Input id="sku" name="sku" required placeholder="Ej. TV-SAM-55" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="price">Precio de Venta (S/)</Label>
                  <Input id="price" name="price" type="number" step="0.01" required placeholder="0.00" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="categoryId">Categoría</Label>
                  <select id="categoryId" name="categoryId" required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Seleccione...</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="brandId">Marca (Opcional)</Label>
                  <select id="brandId" name="brandId" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Ninguna</option>
                    {brands.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock Inicial</Label>
                  <Input id="stock" name="stock" type="number" defaultValue={0} min={0} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Estado</Label>
                  <select id="status" name="status" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="ACTIVE">Activo (Visible)</option>
                    <option value="DRAFT">Borrador (Oculto)</option>
                  </select>
                </div>

                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="description">Breve Descripción</Label>
                  <Input id="description" name="description" placeholder="Resumen del producto..." />
                </div>

                <div className="grid gap-2 col-span-2 p-4 border rounded-md bg-muted/30">
                  <Label htmlFor="imageUrl">URL de la Imagen (Temporal)</Label>
                  <p className="text-xs text-muted-foreground mb-1">
                    * La subida a Cloudinary se implementará en una fase posterior. Por ahora, pega un enlace público de una imagen.
                  </p>
                  <Input id="imageUrl" name="imageUrl" placeholder="https://ejemplo.com/imagen.jpg" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isLoading} className="bg-[#006065] hover:bg-[#004f53] text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Producto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
