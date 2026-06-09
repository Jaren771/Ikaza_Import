"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";

const CATEGORIES = [
  { id: "cat-hogar", name: "Hogar" },
  { id: "cat-cocina", name: "Cocina" },
  { id: "cat-tecnologia", name: "Tecnología" },
  { id: "cat-decoracion", name: "Decoración" },
  { id: "cat-vestimenta", name: "Vestimenta" },
  { id: "cat-belleza-y-cuidado-personal", name: "Belleza y Cuidado Personal" },
  { id: "cat-juguetes-y-juegos", name: "Juguetes y Juegos" },
  { id: "cat-regalos-y-celebraciones", name: "Regalos y Celebraciones" },
  { id: "cat-jardin", name: "Jardín" },
  { id: "cat-bano", name: "Baño" },
  { id: "cat-arte-y-manualidades", name: "Arte y Manualidades" }
];

const SUBCATEGORIES: Record<string, {id: string, name: string}[]> = {
  "cat-hogar": [
    { id: "sala", name: "Sala" },
    { id: "dormitorio", name: "Dormitorio" },
    { id: "bano", name: "Baño" },
    { id: "limpieza", name: "Limpieza" },
    { id: "organizacion", name: "Organización" }
  ],
  "cat-cocina": [
    { id: "utensilios", name: "Utensilios" },
    { id: "electrodomesticos", name: "Electrodomésticos" },
    { id: "almacenamiento-cocina", name: "Almacenamiento" }
  ],
  "cat-tecnologia": [
    { id: "audio", name: "Audio" },
    { id: "accesorios-tech", name: "Accesorios" },
    { id: "iluminacion", name: "Iluminacion" }
  ],
  "cat-decoracion": [
    { id: "cuadros", name: "Cuadros y Portafotos" },
    { id: "plantas-artificiales", name: "Plantas y Flores" },
    { id: "adornos", name: "Adornos" }
  ],
  "cat-vestimenta": [
    { id: "ropa-mujer", name: "Ropa Mujer" },
    { id: "ropa-hombre", name: "Ropa Hombre" },
    { id: "ropa-infantil", name: "Ropa Infantil" },
    { id: "accesorios-ropa", name: "Accesorios" }
  ],
  "cat-belleza-y-cuidado-personal": [
    { id: "maquillaje", name: "Maquillaje" },
    { id: "accesorios-belleza", name: "Accesorios de Belleza" }
  ],
  "cat-juguetes-y-juegos": [
    { id: "peluches", name: "Peluches" },
    { id: "didacticos", name: "Didácticos y Juegos" },
    { id: "diversion", name: "Diversión" }
  ],
  "cat-regalos-y-celebraciones": [
    { id: "dia-del-padre", name: "Día del Padre" },
    { id: "fiestas", name: "Fiestas" }
  ],
  "cat-arte-y-manualidades": [
    { id: "utiles", name: "Útiles Escolares" },
    { id: "manualidades", name: "Manualidades" }
  ]
};

export default function ImporterToolPage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Guardamos el estado de los productos a transcribir
  const [products, setProducts] = useState<Record<string, { name: string, price: string, categoryId: string, subcategoryId: string | null }>>({});

  useEffect(() => {
    // Cargamos los datos existentes en seed-reales.json
    fetch("/api/importer/load-seed")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.products) {
          const imgList: string[] = [];
          const initialProducts: any = {};
          
          data.products.forEach((p: any) => {
            imgList.push(p.imageFile);
            initialProducts[p.imageFile] = { 
              name: p.name, 
              price: String(p.price), 
              categoryId: p.categoryId,
              subcategoryId: p.subcategoryId || null
            };
          });
          
          setImages(imgList);
          setProducts(initialProducts);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (img: string, field: string, value: string | null) => {
    setProducts(prev => {
      const updated = { ...prev[img], [field]: value };
      
      // Si cambia la categoría principal, limpiar la subcategoría
      if (field === "categoryId") {
        updated.subcategoryId = null;
      }
      
      return { ...prev, [img]: updated };
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    
    // Convertir el estado en un array estructurado
    const finalData = Object.entries(products).map(([imageFile, data]) => ({
      imageFile,
      name: data.name.trim() || `Producto sin nombre (${imageFile})`,
      price: parseFloat(data.price) || 0,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId || null
    }));

    try {
      const res = await fetch("/api/importer/save-seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: finalData }),
      });
      const resData = await res.json();
      
      if (resData.success) {
        toast.success(`Se generó el seed exitosamente con ${resData.count} productos.`);
        toast.info("Recuerda ejecutar 'npm run db:seed' en tu terminal para aplicar los cambios a la web.");
      } else {
        toast.error("Hubo un error al guardar el seed.");
      }
    } catch (error) {
      toast.error("Error de conexión al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10">Cargando catálogo actual...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Editor Visual del Catálogo</h1>
          <p className="text-muted-foreground">Aquí puedes reasignar los productos a diferentes categorías y subcategorías visualmente.</p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving} size="lg">
          {saving ? "Guardando..." : "Guardar Cambios (JSON)"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((img) => {
          const currentCatId = products[img]?.categoryId;
          const availableSubs = SUBCATEGORIES[currentCatId] || [];
          
          return (
            <div key={img} className="border rounded-xl p-4 flex flex-col gap-4 bg-card shadow-sm">
              <div className="relative aspect-square w-full rounded-md overflow-hidden bg-muted">
                <Image 
                  src={`/products/${img}`} 
                  alt={img} 
                  fill 
                  className="object-contain" 
                  unoptimized
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="grid gap-1">
                  <Label>Nombre</Label>
                  <Input 
                    value={products[img]?.name || ""}
                    onChange={(e) => handleChange(img, "name", e.target.value)}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label>Categoría</Label>
                  <Select 
                    value={products[img]?.categoryId} 
                    onValueChange={(val) => handleChange(img, "categoryId", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {availableSubs.length > 0 && (
                  <div className="grid gap-1">
                    <Label>Subcategoría</Label>
                    <Select 
                      value={products[img]?.subcategoryId || "ninguna"} 
                      onValueChange={(val) => handleChange(img, "subcategoryId", val === "ninguna" ? null : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona subcategoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ninguna">Ninguna</SelectItem>
                        {availableSubs.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
