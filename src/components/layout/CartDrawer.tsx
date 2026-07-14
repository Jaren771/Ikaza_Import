"use client";

import { useCart } from "@/store/cart";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { updateProductQuantityAction, removeProductFromCartAction } from "@/features/orders/actions/cart.actions";

export function CartDrawer() {
  const { state, dispatch } = useCart();
  const router = useRouter();

  const handleClose = () => {
    dispatch({ type: "TOGGLE_CART", payload: false });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      dispatch({ type: "REMOVE_ITEM", payload: { id } });
      removeProductFromCartAction(id).catch(console.error);
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
      updateProductQuantityAction(id, quantity).catch(console.error);
    }
  };

  const handleRemove = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id } });
    removeProductFromCartAction(id).catch(console.error);
  };

  const handleCheckout = () => {
    handleClose();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-background p-6 shadow-xl sm:max-w-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-headline font-bold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" /> Mi Carrito ({state.itemCount})
              </h2>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 -mx-6 px-6">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                  <p className="text-muted-foreground">Tu carrito está vacío</p>
                  <Button onClick={handleClose} variant="outline" className="mt-4 text-[#006065] border-[#006065]">
                    Seguir comprando
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b pb-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                        <img 
                          src={item.image?.startsWith('http') || item.image?.startsWith('/') ? item.image : `/${item.image || 'logo_ikasa_sin_fondo.webp'}`} 
                          alt={item.name} 
                          onError={(e) => { e.currentTarget.src = "/logo_ikasa_sin_fondo.webp"; }}
                          className="h-full w-full object-cover object-center" 
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-gray-100">
                          <h3 className="line-clamp-2"><Link href={`/products/${item.slug}`}>{item.name}</Link></h3>
                          <p className="ml-4 whitespace-nowrap text-[#006065] font-bold">S/ {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm mt-2">
                          <div className="flex items-center border rounded-md overflow-hidden">
                            <button
                              type="button"
                              className="px-2 py-1 hover:bg-muted text-gray-500"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3 text-xs font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              className="px-2 py-1 hover:bg-muted text-gray-500"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            className="font-medium text-red-500 hover:text-red-600 text-xs flex items-center"
                            onClick={() => handleRemove(item.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {state.items.length > 0 && (
              <div className="border-t pt-4 mt-auto">
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white mb-4">
                  <p>Subtotal</p>
                  <p className="text-xl text-[#006065]">S/ {state.total.toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground mb-4">
                  El envío y los impuestos se calcularán en el pago.
                </p>
                <div className="mt-6 space-y-3">
                  <Button
                    className="w-full bg-[#006065] hover:bg-[#004f53] text-white py-6 text-lg font-bold shadow-[0_4px_14px_0_rgba(0,96,101,0.39)] hover:shadow-[0_6px_20px_rgba(0,96,101,0.23)] hover:-translate-y-0.5 transition-all duration-200"
                    onClick={handleCheckout}
                  >
                    Procesar Compra Seguro
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
