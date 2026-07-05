import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItemType = "betterware" | "tienda";

export interface CartItem {
  id: string; // sku para BW, id.toString() para TP
  type: CartItemType;
  title: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  quantity: number;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            const newQuantity = Math.min(
              existingItem.quantity + item.quantity,
              item.maxQuantity
            );
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: newQuantity } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "enhorabuena-cart",
    }
  )
);
