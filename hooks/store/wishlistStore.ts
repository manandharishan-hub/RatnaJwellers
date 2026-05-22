import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WishlistItem } from "@/types";

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  setItems: (items: WishlistItem[]) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        if (get().items.some((entry) => entry.productId === item.productId)) {
          return;
        }
        set({ items: [...get().items, item] });
      },
      removeItem: (productId) => set({ items: get().items.filter((entry) => entry.productId !== productId) }),
      setItems: (items) => set({ items }),
      clearWishlist: () => set({ items: [] }),
    }),
    { name: "ratna-wishlist" }
  )
);
