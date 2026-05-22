"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/hooks/store/cartStore";
import { useWishlistStore } from "@/hooks/store/wishlistStore";
import { centsToCurrency } from "@/lib/utils";

export function UserDashboardClientSummary() {
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <Link href="/cart" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#D8B35A] hover:bg-[#FBFAF7]">
        <ShoppingBag className="text-[#9A7627]" size={22} />
        <p className="mt-3 font-semibold text-[#0A1628]">Cart summary</p>
        <p className="mt-1 text-sm text-slate-600">
          {cartCount} {cartCount === 1 ? "item" : "items"} · {centsToCurrency(cartTotal)}
        </p>
      </Link>
      <Link href="/account/wishlist" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#D8B35A] hover:bg-[#FBFAF7]">
        <Heart className="text-[#9A7627]" size={22} />
        <p className="mt-3 font-semibold text-[#0A1628]">Wishlist summary</p>
        <p className="mt-1 text-sm text-slate-600">
          {wishlistItems.length} saved {wishlistItems.length === 1 ? "piece" : "pieces"}
        </p>
      </Link>
    </>
  );
}
