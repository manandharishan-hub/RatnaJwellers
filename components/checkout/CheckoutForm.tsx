"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { checkoutSchema } from "@/lib/validation";
import { useCartStore } from "@/hooks/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { centsToCurrency } from "@/lib/utils";

type CheckoutValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export default function CheckoutForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const cartItems = useCartStore((state) => state.items);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = 500;
  const total = subtotal + shippingCost;
  const [status, setStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({ resolver: zodResolver(checkoutSchema) });

  async function onSubmit(values: CheckoutValues) {
    if (!stripe || !elements) {
      setErrorMessage("Unable to initialize payment.");
      return;
    }

    setStatus("Creating payment intent...");
    const intentResponse = await fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total, currency: "usd" }),
    });
    const intentData = await intentResponse.json();
    if (!intentResponse.ok) {
      setErrorMessage(intentData.message || "Unable to create payment intent.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage("Payment form not ready.");
      return;
    }

    setStatus("Processing card details...");
    const result = await stripe.confirmCardPayment(intentData.clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${values.firstName} ${values.lastName}`,
          email: values.email,
          phone: values.phone,
        },
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message || "Payment could not be completed.");
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: { ...values },
          billingAddress: { ...values },
          items: cartItems,
          subtotal,
          tax: Math.round(total * 0.08),
          shippingCost,
          discount: 0,
          total: total + Math.round(total * 0.08),
          paymentMethod: "Stripe",
          paymentStatus: "paid",
          stripePaymentId: result.paymentIntent.id,
          status: "processing",
        }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        setErrorMessage(orderData.message || "Order creation failed.");
        return;
      }
      router.push(`/order-confirmation/${orderData.orderId}`);
    } else {
      setErrorMessage("Payment did not complete. Please try again.");
    }
  }

  return (
    <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" {...register("phone")} />
            {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="street">Street address</Label>
            <Input id="street" {...register("street")} />
            {errors.street && <p className="mt-2 text-sm text-red-600">{errors.street.message}</p>}
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
            {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city.message}</p>}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} />
            {errors.state && <p className="mt-2 text-sm text-red-600">{errors.state.message}</p>}
          </div>
          <div>
            <Label htmlFor="zip">ZIP</Label>
            <Input id="zip" {...register("zip")} />
            {errors.zip && <p className="mt-2 text-sm text-red-600">{errors.zip.message}</p>}
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} />
            {errors.country && <p className="mt-2 text-sm text-red-600">{errors.country.message}</p>}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <p className="mb-4 text-sm font-semibold text-[#0A1628]">Payment details</p>
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <CardElement options={{ style: { base: { fontSize: "16px", color: "#0A1628", '::placeholder': { color: '#94a3b8' } }, invalid: { color: '#f43f5e' } } }} />
          </div>
        </div>
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
          <div className="flex justify-between">Subtotal<span>{centsToCurrency(subtotal)}</span></div>
          <div className="flex justify-between">Shipping<span>{centsToCurrency(shippingCost)}</span></div>
          <div className="flex justify-between font-semibold text-[#0A1628]">Total<span>{centsToCurrency(total)}</span></div>
        </div>
        <Button type="submit" disabled={isSubmitting || !stripe} className="w-full">{isSubmitting ? "Processing order…" : "Place order"}</Button>
      </form>
    </div>
  );
}
