"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/store/cartStore";
import { useWishlistStore } from "@/hooks/store/wishlistStore";
import { useRequireAuthAction } from "@/hooks/useRequireAuthAction";
import { centsToCurrency } from "@/lib/utils";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const addItem = useCartStore((state) => state.addItem);
  const { isCheckingAuth, requireAuth } = useRequireAuthAction();

  return (
    <div className="bg-[#F8F6F2] px-6 py-10 md:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase text-[#9A7627]">
              <Heart size={17} />
              Wishlist
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold text-[#0A1628]">Saved pieces for later.</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Keep your favorite jewelry in one place, compare styles, and move selected pieces into your cart when you are ready.
            </p>
          </div>
          <div className="rounded-lg bg-[#0A1628] px-5 py-4 text-white">
            <p className="text-sm text-slate-300">Saved</p>
            <p className="mt-1 text-3xl font-semibold">{items.length}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm md:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0A1628] text-white">
              <Heart size={28} />
            </div>
            <h2 className="mt-6 font-serif text-3xl font-semibold text-[#0A1628]">No items saved yet</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
              Add pieces from the shop to create a shortlist for gifts, bridal looks, or your next everyday favorite.
            </p>
            <Link href="/shop" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
              Start shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {items.map((item) => (
              <article key={item.productId} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[128px_1fr]">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                  <Image src={item.image || "/favicon.ico"} alt={item.name} fill sizes="128px" unoptimized className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-col justify-between gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#9A7627]">Saved item</p>
                    <h2 className="mt-2 font-serif text-2xl font-semibold text-[#0A1628]">{item.name}</h2>
                    <p className="mt-2 text-lg font-semibold text-[#0A1628]">{centsToCurrency(item.price)}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      disabled={isCheckingAuth}
                      onClick={() => {
                        if (!requireAuth()) return;
                        addItem({ productId: item.productId, name: item.name, image: item.image, price: item.price, quantity: 1 });
                      }}
                      className="gap-2"
                    >
                      <ShoppingBag size={16} />
                      Add to cart
                    </Button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
