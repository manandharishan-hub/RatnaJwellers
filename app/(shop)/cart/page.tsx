"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/hooks/store/cartStore";
import { CartItem } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import { centsToCurrency } from "@/lib/utils";

export default function CartPage() {
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const setItems = useCartStore((state) => state.setItems);
  const [loading, setLoading] = useState(false);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadCart() {
      setLoading(true);
      try {
        const res = await fetch("/api/user/cart", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.cart)) {
          setItems(data.cart);
        }
      } catch {
        // Ignore failures, keep local cart state.
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [status, setItems]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: items }),
      }).catch(() => {
        // best effort sync
      });
    }
  }, [items, status]);

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Your cart</h1>
        <p className="mt-2 text-slate-600">Review your selections before proceeding to checkout.</p>
      </div>
      {loading ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-16 text-center text-slate-600">Loading cart…</div>
      ) : items.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-16 text-center text-slate-600">
          <h2 className="text-2xl font-semibold text-[#0A1628]">Your cart is empty</h2>
          <p className="mt-3">Browse our collection to add a stunning piece to your wardrobe.</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Continue shopping</Link>
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[1.5fr_0.7fr]">
          <div className="space-y-6">
            {items.map((item) => (
              <CartItem key={item.productId} item={item} onUpdate={updateItem} onRemove={removeItem} />
            ))}
          </div>
          <aside className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#0A1628]">Order summary</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="flex justify-between"><span>Subtotal</span><span>{centsToCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>Estimated shipping</span><span>{centsToCurrency(500)}</span></div>
              <div className="flex justify-between text-[#0A1628]"><span className="font-semibold">Total</span><span className="font-semibold">{centsToCurrency(subtotal + 500)}</span></div>
            </div>
            <Link href="/checkout" className="mt-6 block text-center">
              <Button className="w-full">Proceed to checkout</Button>
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
