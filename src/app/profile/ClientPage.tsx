"use client";
import { useState } from "react";
import { ArrowLeft, User, Package, MapPin, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  _count?: {
    addresses: number;
    orders: number;
  };
}

export default function ProfileClientPage({ initialData }: { initialData: ProfileData }) {
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
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold font-headline">Mi Cuenta</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar de Navegación del Perfil */}
        <div className="md:col-span-1 space-y-2">
          <Button variant="secondary" className="w-full justify-start font-medium bg-[#006065]/10 text-[#006065]">
            <User className="mr-2 h-4 w-4" /> Datos Personales
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start text-muted-foreground">
            <Link href="/wishlist">
              <Heart className="mr-2 h-4 w-4" /> Lista de Deseos
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start text-muted-foreground">
            <Link href="/orders">
              <Package className="mr-2 h-4 w-4" /> Mis Pedidos
              {initialData?._count?.orders ? (
                <span className="ml-auto text-xs">{initialData._count.orders}</span>
              ) : null}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start text-muted-foreground">
            <Link href="/profile/addresses">
              <MapPin className="mr-2 h-4 w-4" /> Mis Direcciones
              {initialData?._count?.addresses ? (
                <span className="ml-auto text-xs">{initialData._count.addresses}</span>
              ) : null}
            </Link>
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
                    <Input name="name" defaultValue={initialData?.name ?? ""} required />
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
