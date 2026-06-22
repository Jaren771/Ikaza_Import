"use client";
import { useState } from "react";
import { Boxes, PackagePlus, AlertTriangle, List, Image as ImageIcon, Settings2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adjustInventory, getInventoryMovements, updateMinStock } from "./actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function InventoryClientPage({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isMovementsOpen, setIsMovementsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenAdjust = (item: any) => {
    setSelectedItem(item);
    setIsAdjustOpen(true);
  };

  const handleOpenSettings = (item: any) => {
    setSelectedItem(item);
    setIsSettingsOpen(true);
  };

  const handleOpenMovements = async (item: any) => {
    setSelectedItem(item);
    setIsMovementsOpen(true);
    setMovements([]);
    setIsLoading(true);
    const result = await getInventoryMovements(item.id);
    if (result.success) {
      setMovements(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleAdjustSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await adjustInventory(selectedItem.id, formData);
    if (result.success) {
      toast.success("Inventario ajustado correctamente");
      setIsAdjustOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateMinStock(selectedItem.id, formData);
    if (result.success) {
      toast.success("Stock mínimo actualizado");
      setIsSettingsOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const getStockStatus = (item: any) => {
    if (item.quantity === 0) return <Badge variant="destructive">Agotado</Badge>;
    if (item.quantity <= item.minStock) return <Badge variant="destructive" className="bg-orange-500">Stock Bajo</Badge>;
    return <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">Normal</Badge>;
  };

  const translateMovementType = (type: string) => {
    const types: Record<string, string> = {
      IN: "Entrada", OUT: "Salida", ADJUSTMENT: "Ajuste", RETURNED: "Devolución"
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground mt-1">Control de stock y movimientos de productos.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos Únicos</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
            <PackagePlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.reduce((acc, curr) => acc + curr.quantity, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{data.filter(i => i.quantity <= i.minStock).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3"><CardTitle className="text-lg font-medium">Listado de Inventario</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]"></TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Stock Actual</TableHead>
                  <TableHead className="text-center">Min. Stock</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center overflow-hidden border">
                        {item.product.images?.[0]?.url ? (
                          <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={item.product.name}>
                      {item.product.name}
                    </TableCell>
                    <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.product.sku}</code></TableCell>
                    <TableCell className="text-center text-lg font-semibold">{item.quantity}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{item.minStock}</TableCell>
                    <TableCell className="text-center">{getStockStatus(item)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenAdjust(item)} className="h-8">
                          <PackagePlus className="mr-1 h-3.5 w-3.5" /> Ajustar
                        </Button>
                        <Button variant="ghost" size="icon" title="Movimientos" onClick={() => handleOpenMovements(item)} className="h-8 w-8">
                          <List className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Configurar Alertas" onClick={() => handleOpenSettings(item)} className="h-8 w-8">
                          <Settings2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Ajustar Stock */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent aria-describedby={undefined}>
          <form onSubmit={handleAdjustSubmit}>
            <DialogHeader>
              <DialogTitle>Ajustar Inventario</DialogTitle>
              <DialogDescription>Producto: {selectedItem?.product?.name}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tipo de Movimiento</Label>
                <select name="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="IN">Entrada (Sumar)</option>
                  <option value="OUT">Salida (Restar)</option>
                  <option value="RETURNED">Devolución (Sumar)</option>
                  <option value="ADJUSTMENT">Ajuste de Pérdida/Merma (Restar)</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Cantidad</Label>
                <Input name="quantity" type="number" min="1" required placeholder="Ej. 10" />
              </div>
              <div className="grid gap-2">
                <Label>Motivo (Opcional)</Label>
                <Input name="reason" placeholder="Ej. Compra a proveedor, Inventario físico..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isLoading} className="bg-[#006065] hover:bg-[#004f53] text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Registrar Movimiento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Historial Movimientos */}
      <Dialog open={isMovementsOpen} onOpenChange={setIsMovementsOpen}>
        <DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Historial de Movimientos</DialogTitle>
            <DialogDescription>Producto: {selectedItem?.product?.name}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : movements.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No hay movimientos registrados.</p>
            ) : (
              <div className="space-y-4">
                {movements.map((mov) => (
                  <div key={mov.id} className="flex justify-between items-start border-b pb-3 last:border-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={mov.type === 'IN' || mov.type === 'RETURNED' ? 'default' : 'secondary'}
                               className={mov.type === 'IN' || mov.type === 'RETURNED' ? 'bg-green-600' : 'bg-orange-500 text-white'}>
                          {translateMovementType(mov.type)}
                        </Badge>
                        <span className="text-sm font-medium">
                          {mov.type === 'IN' || mov.type === 'RETURNED' ? '+' : '-'}{mov.quantity} uds
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(mov.createdAt).toLocaleString()} por {mov.createdBy || 'Sistema'}
                      </p>
                      {mov.reason && <p className="text-xs mt-1">Motivo: {mov.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal: Configurar Alerta */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
          <form onSubmit={handleSettingsSubmit}>
            <DialogHeader>
              <DialogTitle>Configurar Alerta de Stock</DialogTitle>
              <DialogDescription>Define cuándo el sistema debe avisar de stock bajo para {selectedItem?.product?.name}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Stock Mínimo (Alerta)</Label>
                <Input name="minStock" type="number" min="0" defaultValue={selectedItem?.minStock} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isLoading} className="bg-[#006065] hover:bg-[#004f53] text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
