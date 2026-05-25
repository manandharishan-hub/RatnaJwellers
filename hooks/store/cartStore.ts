import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppliedCoupon, CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  setItems: (items: CartItem[]) => void;
  replaceItem: (item: CartItem) => void;
  setCoupon: (coupon: AppliedCoupon | null) => void;
  addItem: (item: CartItem) => void;
  updateItem: (productId: string, quantity: number, variant?: string) => void;
  removeItem: (productId: string, variant?: string) => void;
  clearCart: () => void;
  subtotal: () => number;
}

async function syncCart(method: "POST" | "PATCH" | "DELETE", body?: unknown) {
  try {
    const response = await fetch("/api/account/cart", {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : JSON.stringify({}),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      setItems: (items) => set({ items }),
      replaceItem: (item) => {
        const existing = get().items.find((entry) => entry.productId === item.productId && entry.variant === item.variant);
        if (existing) {
          set({
            items: get().items.map((entry) =>
              entry.productId === item.productId && entry.variant === item.variant ? { ...entry, quantity: item.quantity } : entry
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
        void syncCart("PATCH", item);
      },
      setCoupon: (coupon) => set({ coupon }),
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
        } else {
          set({ items: [...get().items, item] });
        }
        void syncCart("POST", item);
      },
      updateItem: (productId, quantity, variant) => {
        const nextQuantity = Math.max(1, quantity);
        set({
          items: get().items.map((entry) =>
            entry.productId === productId && (variant === undefined || entry.variant === variant) ? { ...entry, quantity: nextQuantity } : entry
          ),
        });
        void syncCart("PATCH", { productId, quantity: nextQuantity, variant });
      },
      removeItem: (productId, variant) => {
        set({ items: get().items.filter((entry) => entry.productId !== productId || (variant !== undefined && entry.variant !== variant)) });
        void syncCart("DELETE", { productId, variant });
      },
      clearCart: () => {
        set({ items: [], coupon: null });
        void syncCart("DELETE");
      },
      subtotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: "ratna-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
