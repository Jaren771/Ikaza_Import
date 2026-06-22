"use client";
import { useState } from "react";
import { ShoppingCart, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateOrderStatus, deleteOrder } from "./actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function OrdersClientPage({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const handleOpenDialog = (item: any) => {
    setEditingItem(item);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await updateOrderStatus(editingItem.id, formData);
    if (result.success) {
      toast.success("Pedido actualizado");
      setIsOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar pedido?")) return;
    const result = await deleteOrder(id);
    if (result.success) {
      toast.success("Pedido eliminado");
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground mt-1">Gestión de órdenes de compra.</p>
        </div>
      </div>
      <Card className="border-border">
        <CardHeader className="pb-3"><CardTitle className="text-lg font-medium">Listado de Pedidos</CardTitle></CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
              <p>No hay pedidos registrados.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.id.slice(-8).toUpperCase()}</code></TableCell>
                      <TableCell>{item.user?.name || item.user?.email || "Cliente Invitado"}</TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-medium">S/ {Number(item.totalAmount).toFixed(2)}</TableCell>
                      <TableCell className="text-center"><Badge variant="outline">{item.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
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
        <DialogContent aria-describedby={undefined}>
          <form onSubmit={handleSubmit}>
            <DialogHeader><DialogTitle>Actualizar Estado del Pedido</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nuevo Estado</Label>
                <select name="status" defaultValue={editingItem?.status} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="PENDING">Pendiente</option>
                  <option value="PROCESSING">Procesando</option>
                  <option value="SHIPPED">Enviado</option>
                  <option value="DELIVERED">Entregado</option>
                  <option value="CANCELLED">Cancelado</option>
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
