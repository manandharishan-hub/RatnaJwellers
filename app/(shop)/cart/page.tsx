"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BadgeCheck, CreditCard, Gem, ShoppingBag, Truck } from "lucide-react";
import { CartItem } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/store/cartStore";
import { centsToCurrency } from "@/lib/utils";

const shipping = 500;

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const total = subtotal > 0 ? subtotal + shipping : 0;

  return (
    <div className="bg-[#F8F6F2] px-6 py-10 md:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 rounded-lg bg-[#0A1628] p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase text-[#D8B35A]">
              <ShoppingBag size={17} />
              Shopping cart
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold">Review your jewelry selection.</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Confirm quantities, check your order total, and continue to secure checkout when everything feels right.
            </p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 px-5 py-4">
            <p className="text-sm text-slate-300">Items</p>
            <p className="mt-1 text-3xl font-semibold">{itemCount}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-8 grid gap-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0A1628] text-white">
              <Gem size={28} />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-semibold text-[#0A1628]">Your cart is empty</h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                Browse rings, necklaces, bracelets, and gifts to begin building your order.
              </p>
            </div>
            <Link href="/shop" className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
              Continue shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 xl:grid-cols-[1.45fr_0.75fr]">
            <div className="space-y-5">
              {items.map((item) => (
                <CartItem key={`${item.productId}-${item.variant ?? "standard"}`} item={item} onUpdate={updateItem} onRemove={removeItem} />
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-semibold text-[#0A1628]">Order summary</h2>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#0A1628]">{centsToCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated shipping</span>
                  <span className="font-semibold text-[#0A1628]">{centsToCurrency(shipping)}</span>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-base text-[#0A1628]">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">{centsToCurrency(total)}</span>
                  </div>
                </div>
              </div>
              <Link href="/checkout" className="mt-6 block">
                <Button className="w-full gap-2">
                  Proceed to checkout
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <div className="mt-6 grid gap-3 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <CreditCard size={16} className="text-[#9A7627]" />
                  Secure payment
                </p>
                <p className="flex items-center gap-2">
                  <Truck size={16} className="text-[#9A7627]" />
                  Tracked delivery
                </p>
                <p className="flex items-center gap-2">
                  <BadgeCheck size={16} className="text-[#9A7627]" />
                  Quality checked before dispatch
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
