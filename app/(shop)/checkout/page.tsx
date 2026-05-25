"use client";

import CheckoutForm from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Checkout</h1>
        <p className="mt-2 text-slate-600">Complete your purchase with secure eSewa payment and fast delivery.</p>
      </div>
      <CheckoutForm />
    </div>
  );
}
