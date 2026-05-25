"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/hooks/store/cartStore";
import { useWishlistStore } from "@/hooks/store/wishlistStore";
import { useRequireAuthAction } from "@/hooks/useRequireAuthAction";
import { centsToCurrency } from "@/lib/utils";

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
  totalStock: number;
  variants: { size: string; stock: number }[];
}

export function ProductDetailClient({ id, name, price, images, sku, material, gemstone, weight, occasion, totalStock, variants }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(variants[0]?.size ?? "");
  const replaceItem = useCartStore((state) => state.replaceItem);
  const addWishlist = useWishlistStore((state) => state.addItem);
  const { isCheckingAuth, requireAuth } = useRequireAuthAction();
  const primary = images?.find((image) => image.isPrimary)?.url ?? images?.[0]?.url ?? "/favicon.ico";
  const isOutOfStock = totalStock <= 0;

  return (
    <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="relative h-[420px] overflow-hidden rounded-[2rem] bg-slate-100">
            <Image src={primary} alt={name} fill sizes="(min-width: 768px) 60vw, 100vw" unoptimized className="object-cover" />
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            {images.slice(0, 4).map((image) => (
              <div key={image.url} className="relative h-24 overflow-hidden rounded-3xl bg-slate-100">
                <Image src={image.url} alt={name} fill sizes="160px" unoptimized className="object-cover" />
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
            <p className="text-3xl font-semibold text-[#0A1628]">{centsToCurrency(price)}</p>
            <p className={isOutOfStock ? "text-sm font-semibold text-red-600" : "text-sm font-semibold text-emerald-700"}>
              {isOutOfStock ? "Out of stock" : `${totalStock} available`}
            </p>
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
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Shipping</span>
              <span>Tracked delivery</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Returns</span>
              <span>Easy returns</span>
            </div>
          </div>
          {variants.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#0A1628]">Size options</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button
                    key={variant.size}
                    type="button"
                    disabled={variant.stock <= 0}
                    onClick={() => setSelectedSize(variant.size)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${selectedSize === variant.size ? "border-[#0A1628] bg-[#0A1628] text-white" : "border-slate-300 text-[#0A1628] hover:border-[#C9A84C]"}`}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button type="button" disabled={isOutOfStock} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="rounded-full border border-slate-300 px-4 py-3 text-xl text-slate-700 disabled:cursor-not-allowed disabled:opacity-60">-</button>
            <span className="min-w-[3rem] text-center text-xl font-semibold">{quantity}</span>
            <button type="button" disabled={isOutOfStock || quantity >= totalStock} onClick={() => setQuantity(quantity + 1)} className="rounded-full border border-slate-300 px-4 py-3 text-xl text-slate-700 disabled:cursor-not-allowed disabled:opacity-60">+</button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="flex-1"
              disabled={isOutOfStock}
              onClick={() => {
                replaceItem({ productId: id, name, image: primary, price, quantity, variant: selectedSize });
              }}
            >
              {isOutOfStock ? "Out of stock" : "Add to cart"}
            </Button>
            <button
              type="button"
              disabled={isCheckingAuth}
              onClick={() => {
                if (!requireAuth()) return;
                addWishlist({ productId: id, name, image: primary, price });
              }}
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#C9A84C] hover:text-[#C9A84C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add to wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
