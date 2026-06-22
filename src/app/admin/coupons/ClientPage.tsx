"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createCoupon, deleteCoupon } from "./actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function CouponsClientPage({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await createCoupon(formData);
    if (result.success) {
      toast.success("Cupón creado");
      setIsOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar cupón?")) return;
    const result = await deleteCoupon(id);
    if (result.success) {
      toast.success("Cupón eliminado");
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Cupones</h1>
          <p className="text-muted-foreground mt-1">Gestión de códigos promocionales.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-[#006065] hover:bg-[#004f53] text-white">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Cupón
        </Button>
      </div>
      <Card className="border-border">
        <CardHeader className="pb-3"><CardTitle className="text-lg font-medium">Listado</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead className="text-center">Usos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-bold">{item.code}</TableCell>
                    <TableCell><Badge variant="outline">{item.discountType}</Badge></TableCell>
                    <TableCell>{item.discountType === 'PERCENTAGE' ? item.discountValue + '%' : 'S/ ' + item.discountValue}</TableCell>
                    <TableCell className="text-center">{item.timesUsed} / {item.maxUses || '∞'}</TableCell>
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
            <DialogHeader><DialogTitle>Nuevo Cupón</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Código (ej. VERANO20)</Label>
                <Input name="code" required className="uppercase" />
              </div>
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <select name="discountType" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="PERCENTAGE">Porcentaje (%)</option>
                  <option value="FIXED_AMOUNT">Monto Fijo (S/)</option>
                  <option value="FREE_SHIPPING">Envío Gratis</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Descuento</Label>
                <Input name="discountValue" type="number" step="0.01" required />
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
