"use client";

import Image from "next/image";
import { useWishlistStore } from "@/hooks/store/wishlistStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccountWishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Wishlist</p>
        <h1 className="text-3xl font-semibold text-[#0A1628]">Saved items</h1>
      </div>
      {items.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-16 text-center text-slate-600">
          <h2 className="text-2xl font-semibold text-[#0A1628]">No saved items yet</h2>
          <p className="mt-3">Save your favorite pieces to your wishlist for later.</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Shop jewelry</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.productId} className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-3xl bg-slate-100">
                  <Image src={item.image || "/favicon.ico"} alt={item.name} fill sizes="96px" unoptimized className="object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0A1628]">{item.name}</h3>
                  <p className="text-sm text-slate-600">${(item.price / 100).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href={`/product/${item.productId}`} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#C9A84C]">View</Link>
                <Button onClick={() => removeItem(item.productId)} className="rounded-full bg-red-50 text-red-700 hover:bg-red-100">Remove</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
