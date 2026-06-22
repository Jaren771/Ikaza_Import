"use client";
import { useState } from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { removeFromWishlist } from "./actions";

export default function WishlistClientPage({ initialData }: { initialData: any }) {
  const [items, setItems] = useState(initialData?.items || []);
  const router = useRouter();

  const handleRemove = async (itemId: string) => {
    const result = await removeFromWishlist(itemId);
    if (result.success) {
      setItems((prev: any) => prev.filter((item: any) => item.id !== itemId));
      toast.success("Producto eliminado de tu lista");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="outline" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </Button>
        <Heart className="h-8 w-8 text-[#006065]" />
        <h1 className="text-3xl font-bold font-headline">Mi Lista de Deseos</h1>
      </div>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-muted/20">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h2 className="text-xl font-medium mb-2">Tu lista está vacía</h2>
            <p className="text-muted-foreground mb-6">Guarda aquí los productos que más te gustan para comprarlos después.</p>
            <Link href="/catalog"><Button className="bg-[#006065] hover:bg-[#004f53] text-white">Explorar Catálogo</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item: any) => {
              const product = item.product;
              const inStock = product.inventory?.quantity > 0;
              const image = product.images?.[0]?.url || "https://via.placeholder.com/150";

              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0 flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-32 w-32 bg-muted flex-shrink-0">
                      <img src={image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 p-4 flex flex-col sm:flex-row justify-between items-center w-full">
                      <div className="text-center sm:text-left mb-4 sm:mb-0">
                        <Link href={`/products/${product.slug}`} className="hover:underline">
                          <h3 className="font-bold text-lg">{product.name}</h3>
                        </Link>
                        <p className="font-bold text-[#006065] text-xl mt-1">S/ {Number(product.price).toFixed(2)}</p>
                        {inStock ? (
                          <p className="text-sm text-green-600 mt-1 font-medium">En stock</p>
                        ) : (
                          <p className="text-sm text-red-500 mt-1 font-medium">Agotado temporalmente</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <Button disabled={!inStock} className="bg-[#006065] hover:bg-[#004f53] text-white">
                          <ShoppingBag className="mr-2 h-4 w-4" /> Añadir al carrito
                        </Button>
                        <Button variant="outline" onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
