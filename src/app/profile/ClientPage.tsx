"use client";
import { useState } from "react";
import { User, Package, MapPin, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";

export default function ProfileClientPage({ initialData }: { initialData: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    
    if (result.success) {
      toast.success("Perfil actualizado correctamente");
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Mi Cuenta</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar de Navegación del Perfil */}
        <div className="md:col-span-1 space-y-2">
          <Button variant="secondary" className="w-full justify-start font-medium bg-[#006065]/10 text-[#006065]">
            <User className="mr-2 h-4 w-4" /> Datos Personales
          </Button>
          <Link href="/wishlist">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Heart className="mr-2 h-4 w-4" /> Lista de Deseos
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <Package className="mr-2 h-4 w-4" /> Mis Pedidos
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" /> Mis Direcciones
          </Button>
        </div>

        {/* Contenido Principal */}
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre Completo</label>
                    <Input name="name" defaultValue={initialData?.name} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Correo Electrónico</label>
                    <Input type="email" defaultValue={initialData?.email} className="text-muted-foreground" readOnly />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="bg-[#006065] hover:bg-[#004f53] text-white">
                  {isLoading ? "Actualizando..." : "Actualizar Datos"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
