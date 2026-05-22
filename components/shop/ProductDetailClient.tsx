"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/hooks/store/cartStore";
import { useWishlistStore } from "@/hooks/store/wishlistStore";

interface ProductDetailClientProps {
  id: string;
  name: string;
  price: number;
  images: { url: string; isPrimary: boolean }[];
  sku: string;
  material: string;
  gemstone: string;
  weight: string;
  occasion: string;
}

export function ProductDetailClient({ id, name, price, images, sku, material, gemstone, weight, occasion }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const { status } = useSession();
  const addItem = useCartStore((state) => state.addItem);
  const addWishlist = useWishlistStore((state) => state.addItem);
  const primary = images?.find((image) => image.isPrimary)?.url ?? images?.[0]?.url ?? "/favicon.ico";

  async function handleAddWishlist() {
    const item = { productId: id, name, image: primary, price };
    if (status === "authenticated") {
      await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
    }
    addWishlist(item);
  }

  return (
    <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[2rem] bg-slate-100">
            <img src={primary} alt={name} className="h-[420px] w-full object-cover" />
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            {images.slice(0, 4).map((image) => (
              <div key={image.url} className="overflow-hidden rounded-3xl bg-slate-100">
                <img src={image.url} alt={name} className="h-24 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="gold">{material}</Badge>
              <Badge variant="light">{occasion}</Badge>
            </div>
            <h1 className="text-3xl font-semibold text-[#0A1628]">{name}</h1>
            <p className="text-lg text-slate-700">SKU: {sku}</p>
            <p className="text-3xl font-semibold text-[#0A1628]">${(price / 100).toFixed(2)}</p>
          </div>
          <div className="space-y-3 rounded-3xl bg-slate-50 p-6">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Weight</span>
              <span>{weight}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Gemstone</span>
              <span>{gemstone}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="rounded-full border border-slate-300 px-4 py-3 text-xl text-slate-700">−</button>
            <span className="min-w-[3rem] text-center text-xl font-semibold">{quantity}</span>
            <button type="button" onClick={() => setQuantity(quantity + 1)} className="rounded-full border border-slate-300 px-4 py-3 text-xl text-slate-700">+</button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" className="flex-1" onClick={() => addItem({ productId: id, name, image: primary, price, quantity })}>
              Add to cart
            </Button>
            <button type="button" onClick={handleAddWishlist} className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#C9A84C] hover:text-[#C9A84C]">
              Add to wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
