"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/hooks/store/wishlistStore";
import { useRequireAuthAction } from "@/hooks/useRequireAuthAction";

interface ProductWishlistButtonProps {
  productId: string;
  name: string;
  image: string;
  price: number;
}

export function ProductWishlistButton({ productId, name, image, price }: ProductWishlistButtonProps) {
  const addWishlist = useWishlistStore((state) => state.addItem);
  const { isCheckingAuth, requireAuth } = useRequireAuthAction();

  return (
    <button
      type="button"
      aria-label={`Add ${name} to wishlist`}
      disabled={isCheckingAuth}
      onClick={() => {
        if (!requireAuth()) return;
        addWishlist({ productId, name, image, price });
      }}
      className="rounded-full bg-slate-100 p-2 text-slate-700 transition hover:bg-[#C9A84C]/10 hover:text-[#0A1628] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Heart size={16} />
    </button>
  );
}
