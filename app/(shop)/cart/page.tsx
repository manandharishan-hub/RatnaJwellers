"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, CreditCard, Gem, ShoppingBag, Truck } from "lucide-react";
import { CartItem } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/store/cartStore";
import { centsToCurrency } from "@/lib/utils";

const shipping = 500;

export default function CartPage() {
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const items = useCartStore((state) => state.items);
  const appliedCoupon = useCartStore((state) => state.coupon);
  const setCoupon = useCartStore((state) => state.setCoupon);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const enteredCouponCode = couponCode.trim().toUpperCase();
  const activeCoupon = enteredCouponCode && appliedCoupon?.code === enteredCouponCode ? appliedCoupon : null;
  const discount = Math.min(activeCoupon?.discount ?? 0, subtotal);
  const total = subtotal > 0 ? subtotal + shipping - discount : 0;

  useEffect(() => {
    if (!couponCode.trim() && appliedCoupon) {
      setCoupon(null);
    }
  }, [appliedCoupon, couponCode, setCoupon]);

  return (
    <div className="bg-[#F8F6F2]">
      <section className="page-shell">
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
          <div className="empty-state mt-8 grid gap-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0A1628] text-white">
              <Gem size={28} />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-semibold text-[#0A1628]">Your cart is empty</h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                Browse rings, necklaces, bracelets, and gifts to begin building your order.
              </p>
            </div>
            <Link href="/shop" className="lux-button-primary mx-auto">
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

            <aside className="surface-panel h-fit">
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
                <form
                  className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setCouponMessage("");
                    const trimmedCode = couponCode.trim();
                    if (!trimmedCode) {
                      setCoupon(null);
                      setCouponMessage("Enter a coupon code first.");
                      return;
                    }
                    fetch("/api/coupons/validate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ code: trimmedCode, subtotal }),
                    })
                      .then(async (response) => {
                        const data = await response.json().catch(() => ({}));
                        if (!response.ok) throw new Error(data.message || "Coupon code is not valid.");
                        setCoupon(data);
                        setCouponMessage("Coupon applied.");
                      })
                      .catch((error) => {
                        setCoupon(null);
                        setCouponMessage(error instanceof Error ? error.message : "Coupon code is not valid.");
                      });
                  }}
                >
                  <label htmlFor="coupon" className="font-medium text-[#0A1628]">Apply coupon</label>
                  <div className="flex gap-2">
                    <input
                      id="coupon"
                      value={couponCode}
                      onChange={(event) => {
                        const value = event.target.value;
                        setCouponCode(value);
                        if (!value.trim()) {
                          setCoupon(null);
                          setCouponMessage("");
                        } else if (appliedCoupon && value.trim().toUpperCase() !== appliedCoupon.code) {
                          setCoupon(null);
                          setCouponMessage("");
                        }
                      }}
                      placeholder="Enter coupon code"
                      className="lux-input min-w-0 flex-1 rounded-full py-2"
                    />
                    <button type="submit" className="lux-button-primary px-4 py-2">Apply</button>
                  </div>
                  {couponMessage && <p className={`text-xs font-semibold ${activeCoupon ? "text-emerald-700" : "text-red-600"}`}>{couponMessage}</p>}
                  {activeCoupon && <p className="text-xs font-semibold text-emerald-700">Coupon applied: {activeCoupon.code}</p>}
                </form>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-semibold text-emerald-700">-{centsToCurrency(discount)}</span>
                  </div>
                )}
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
