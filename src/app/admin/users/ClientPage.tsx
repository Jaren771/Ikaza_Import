"use client";
import { useState } from "react";
import { Shield, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateUserRole, deleteUserAction, createAdminAction } from "./actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function UsersClientPage({ initialData, currentUserRole }: { initialData: any[], currentUserRole: string }) {
  const [data, setData] = useState(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const handleOpenDialog = (item: any) => {
    setEditingItem(item);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await updateUserRole(editingItem.id, formData);
    if (result.success) {
      toast.success("Usuario actualizado");
      setIsOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción es irreversible.")) return;
    
    const result = await deleteUserAction(id);
    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await createAdminAction(formData);
    if (result.success) {
      toast.success(result.message);
      setIsCreateOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground mt-1">Gestión de roles y accesos.</p>
        </div>
        {currentUserRole === "SUPER_ADMIN" && (
          <Button onClick={() => setIsCreateOpen(true)} className="bg-[#006065] hover:bg-[#004f53] text-white">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Administrador
          </Button>
        )}
      </div>
      <Card className="border-border">
        <CardHeader className="pb-3"><CardTitle className="text-lg font-medium">Listado de Usuarios</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name || 'Sin Nombre'}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell><Badge variant="outline">{item.role}</Badge></TableCell>
                    <TableCell className="text-center"><Badge variant={item.status === 'ACTIVE' ? 'default' : 'destructive'}>{item.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}><Shield className="h-4 w-4 text-blue-600" /></Button>
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
            <DialogHeader><DialogTitle>Actualizar Permisos</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Rol del Usuario</Label>
                <select name="role" defaultValue={editingItem?.role} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="CUSTOMER">Cliente</option>
                  <option value="MANAGER">Gestor</option>
                  <option value="ADMIN">Administrador</option>
                  {currentUserRole === "SUPER_ADMIN" && (
                    <option value="SUPER_ADMIN">Súper Admin</option>
                  )}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Estado de la Cuenta</Label>
                <select name="status" defaultValue={editingItem?.status} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="BANNED">Suspendido</option>
                </select>
              </div>
            </div>
            <DialogFooter className="flex sm:justify-between w-full mt-4">
              {currentUserRole === "SUPER_ADMIN" ? (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => handleDeleteUser(editingItem.id)}
                >
                  Eliminar Cuenta
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-[#006065] hover:bg-[#004f53] text-white">Guardar</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Crear Administrador */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent aria-describedby={undefined}>
          <form onSubmit={handleCreateAdmin}>
            <DialogHeader><DialogTitle>Crear Nuevo Administrador</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required placeholder="Ej. Juan Pérez" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" name="email" type="email" required placeholder="admin@ikaza.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" required minLength={6} placeholder="••••••••" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#006065] hover:bg-[#004f53] text-white">Crear Administrador</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
