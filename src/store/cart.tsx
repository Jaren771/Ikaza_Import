"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { validateCartItems } from "@/app/(store)/cart/actions";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  basePrice: number; // Precio sin descuentos, esencial para Patrón 4 de BOGO
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean; // Estado de la UI del carrito (Drawer)
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART"; payload?: boolean }
  | { type: "HYDRATE_CART"; payload: CartItem[] }
  | { type: "UPDATE_CART"; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  isOpen: false,
  total: 0,
  itemCount: 0,
};

// Recalcular totales garantizando la inmutabilidad
const calculateTotals = (items: CartItem[]) => {
  return items.reduce(
    (acc, item) => {
      acc.total += item.price * item.quantity;
      acc.itemCount += item.quantity;
      return acc;
    },
    { total: 0, itemCount: 0 }
  );
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[] = [];

  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingItemIndex > -1) {
        newItems = [...state.items];
        newItems[existingItemIndex].quantity += action.payload.quantity;
      } else {
        newItems = [...state.items, action.payload];
      }
      break;
    }
    case "REMOVE_ITEM":
      newItems = state.items.filter((item) => item.id !== action.payload.id);
      break;
    case "UPDATE_QUANTITY":
      newItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
      break;
    case "CLEAR_CART":
      newItems = [];
      break;
    case "TOGGLE_CART":
      return { ...state, isOpen: action.payload !== undefined ? action.payload : !state.isOpen };
    case "HYDRATE_CART":
      newItems = action.payload;
      break;
    case "UPDATE_CART":
      newItems = action.payload;
      break;
    default:
      return state;
  }

  const { total, itemCount } = calculateTotals(newItems);
  
  // Guardar en localStorage como Snapshot persistente (Patrón 3 modificado)
  if (typeof window !== "undefined" && action.type !== "HYDRATE_CART") {
    localStorage.setItem("ikaza_cart_snapshot", JSON.stringify(newItems));
  }

  return { ...state, items: newItems, total, itemCount };
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Hidratar y Validar desde el localStorage al cargar
  useEffect(() => {
    const hydrateAndValidate = async () => {
      try {
        const savedCart = localStorage.getItem("ikaza_cart_snapshot");
        if (savedCart) {
          const parsedCart: CartItem[] = JSON.parse(savedCart);
          // 1. Mostrar inicialmente lo que hay en localStorage para no dejar la UI en blanco
          dispatch({ type: "HYDRATE_CART", payload: parsedCart });
          
          if (parsedCart.length > 0) {
            // 2. Validar silenciosamente contra la base de datos
            const { validItems, hasChanges } = await validateCartItems(parsedCart);
            
            // 3. Si hubo cambios (stock agotado, producto eliminado, precios distintos), actualizamos el carrito
            if (hasChanges) {
              dispatch({ type: "UPDATE_CART", payload: validItems });
              if (validItems.length < parsedCart.length) {
                toast.info("Algunos productos de tu carrito ya no están disponibles y fueron removidos.");
              } else {
                toast.info("Se han actualizado las cantidades o precios de tu carrito según el stock actual.");
              }
            }
          }
        }
      } catch (error) {
        console.error("Error hydrating cart", error);
      }
    };
    
    hydrateAndValidate();
  }, []);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
