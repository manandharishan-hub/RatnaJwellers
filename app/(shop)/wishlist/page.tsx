"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/hooks/store/wishlistStore";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const localItems = useWishlistStore((state) => state.items);
  const setItems = useWishlistStore((state) => state.setItems);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch("/api/user/wishlist", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => {
        if (Array.isArray(data.wishlist)) {
          const items = data.wishlist.map((product: any) => ({
            productId: product._id,
            name: product.name,
            image: product.images?.[0]?.url ?? "",
            price: product.price,
          }));
          setItems(items);
        }
      })
      .catch(() => setError("Unable to load wishlist."))
      .finally(() => setLoading(false));
  }, [status, setItems]);

  if (status === "loading" || loading) {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Loading wishlist…</h1>
      </div>
    );
  }

  if (localItems.length === 0) {
    return (
      <div className="px-6 py-10 md:px-10 lg:px-16">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0A1628]">Your wishlist</h1>
          <p className="mt-2 text-slate-600">Save favorites and move them to your cart when you&apos;re ready.</p>
        </div>
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-16 text-center text-slate-600">
          <h2 className="text-2xl font-semibold text-[#0A1628]">No items saved yet</h2>
          <p className="mt-3">Browse our collections and add pieces to your wishlist for later.</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Start shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Your wishlist</h1>
        <p className="mt-2 text-slate-600">Save favorites and move them to your cart when you&apos;re ready.</p>
      </div>
      {error && <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>}
      <div className="space-y-6">
        {localItems.map((item) => (
          <div key={item.productId} className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-3xl bg-slate-100">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
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
    </div>
  );
}
