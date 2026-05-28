"use client";

import CheckoutForm from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="page-shell">
      <div className="mb-8">
        <p className="eyebrow">Secure payment</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#0A1628]">Checkout</h1>
        <p className="mt-2 text-slate-600">Complete your purchase with secure eSewa payment and fast delivery.</p>
      </div>
      <CheckoutForm />
    </div>
  );
}
