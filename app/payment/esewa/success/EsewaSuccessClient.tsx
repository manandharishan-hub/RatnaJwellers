"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/store/cartStore";

export function EsewaSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Verifying eSewa payment...");
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    async function completePayment() {
      const data = searchParams.get("data");
      const storedCheckout = window.localStorage.getItem("ratna-esewa-checkout");
      if (!data || !storedCheckout) {
        setStatus("");
        setError("Payment details were not found. Please contact support if your eSewa wallet was charged.");
        return;
      }

      const checkout = JSON.parse(storedCheckout);
      const response = await fetch("/api/payments/esewa/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, checkout }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus("");
        setError(result.message || "Unable to verify eSewa payment.");
        return;
      }

      clearCart();
      window.localStorage.removeItem("ratna-esewa-checkout");
      router.replace(`/order-confirmation/${result.orderId}`);
    }

    completePayment().catch(() => {
      setStatus("");
      setError("Unable to verify eSewa payment right now.");
    });
  }, [clearCart, router, searchParams]);

  return (
    <div className="min-h-screen bg-[#F8F6F2] px-5 py-16">
      <section className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0A1628] text-[#D8B35A]">
          <ShieldCheck size={26} />
        </div>
        <h1 className="mt-5 text-3xl font-semibold text-[#0A1628]">eSewa payment</h1>
        {status && <p className="mt-3 text-slate-600">{status}</p>}
        {error && (
          <>
            <p className="mt-3 text-sm leading-6 text-red-600">{error}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button type="button" onClick={() => router.push("/checkout")}>Back to checkout</Button>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-[#0A1628] transition hover:border-[#D8B35A]">
                Contact support
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
