"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/hooks/store/cartStore";
import { useWishlistStore } from "@/hooks/store/wishlistStore";

export function AccountStateSync() {
  const { data: session, status } = useSession();
  const setCartItems = useCartStore((state) => state.setItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const setWishlistItems = useWishlistStore((state) => state.setItems);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  useEffect(() => {
    let isCurrent = true;

    async function syncAccountState() {
      if (status === "loading") return;
      const role = (session?.user as { role?: string } | undefined)?.role;

      if (status === "unauthenticated" || role === "admin") {
        clearCart();
        clearWishlist();
        window.localStorage.removeItem("ratna-cart");
        window.localStorage.removeItem("ratna-wishlist");
        return;
      }

      const guestCartItems = useCartStore.getState().items;
      const syncKey = session?.user?.email ? `ratna-cart-merged-${session.user.email}` : "";
      if (guestCartItems.length > 0) {
        const alreadyMerged = syncKey ? window.sessionStorage.getItem(syncKey) === "true" : true;
        if (!alreadyMerged) {
          await Promise.all(
            guestCartItems.map((item) =>
              fetch("/api/account/cart", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item),
              }).catch(() => null)
            )
          );
          window.sessionStorage.setItem(syncKey, "true");
        }
      }

      const [cartResponse, wishlistResponse] = await Promise.all([
        fetch("/api/account/cart").then((response) => response.json()).catch(() => null),
        fetch("/api/account/wishlist").then((response) => response.json()).catch(() => null),
      ]);

      if (!isCurrent) return;
      if (Array.isArray(cartResponse?.items)) setCartItems(cartResponse.items);
      if (Array.isArray(wishlistResponse?.items)) setWishlistItems(wishlistResponse.items);
    }

    syncAccountState();

    return () => {
      isCurrent = false;
    };
  }, [clearCart, clearWishlist, session?.user, setCartItems, setWishlistItems, status]);

  return null;
}
