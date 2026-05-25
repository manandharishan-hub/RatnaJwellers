import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WishlistItem } from "@/types";

interface WishlistState {
  items: WishlistItem[];
  setItems: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
}

async function syncWishlist(method: "POST" | "DELETE", productId?: string) {
  try {
    const response = await fetch("/api/account/wishlist", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),
      addItem: (item) => {
        if (get().items.some((entry) => entry.productId === item.productId)) {
          return;
        }
        set({ items: [...get().items, item] });
        void syncWishlist("POST", item.productId);
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((entry) => entry.productId !== productId) });
        void syncWishlist("DELETE", productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    { name: "ratna-wishlist" }
  )
);
