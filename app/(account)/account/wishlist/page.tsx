"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/hooks/store/wishlistStore";
import { Button } from "@/components/ui/button";

export default function AccountWishlistPage() {
  const { data: session, status } = useSession();
  const localItems = useWishlistStore((state) => state.items);
  const setItems = useWishlistStore((state) => state.setItems);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadWishlist() {
      setLoading(true);
      try {
        const res = await fetch("/api/user/wishlist", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Unable to load wishlist.");
        }
        const data = await res.json();
        if (Array.isArray(data.wishlist)) {
          const items = data.wishlist.map((product: any) => ({
            productId: product._id,
            name: product.name,
            image: product.images?.[0]?.url ?? "",
            price: product.price,
          }));
          setItems(items);
        }
      } catch {
        setError("Unable to load wishlist.");
      } finally {
        setLoading(false);
      }
    }

    loadWishlist();
  }, [status, setItems]);

  async function handleRemove(productId: string) {
    const response = await fetch(`/api/user/wishlist/${productId}`, { method: "DELETE" });
    if (response.ok) {
      removeItem(productId);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Loading wishlist…</h1>
      </div>
    );
  }

  const items = localItems;

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Wishlist</p>
        <h1 className="text-3xl font-semibold text-[#0A1628]">Saved items</h1>
      </div>
      {error && <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>}
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
                <Button onClick={() => handleRemove(item.productId)} className="rounded-full bg-red-50 text-red-700 hover:bg-red-100">Remove</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
