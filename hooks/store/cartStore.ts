import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((entry) => entry.productId === item.productId && entry.variant === item.variant);
        if (existing) {
          set({
            items: get().items.map((entry) =>
              entry.productId === item.productId && entry.variant === item.variant
                ? { ...entry, quantity: entry.quantity + item.quantity }
                : entry
            ),
          });
          return;
        }
        set({ items: [...get().items, item] });
      },
      updateItem: (productId, quantity) => {
        set({
          items: get().items.map((entry) =>
            entry.productId === productId ? { ...entry, quantity: Math.max(1, quantity) } : entry
          ),
        });
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((entry) => entry.productId !== productId) });
      },
      clearCart: () => set({ items: [] }),
      subtotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    { name: "ratna-cart" }
  )
);
