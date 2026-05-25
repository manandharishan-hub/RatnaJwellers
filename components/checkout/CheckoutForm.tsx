"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck, WalletCards } from "lucide-react";
import { useSession } from "next-auth/react";
import { checkoutSchema } from "@/lib/validation";
import { useCartStore } from "@/hooks/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { centsToCurrency } from "@/lib/utils";

const checkoutFormSchema = checkoutSchema.extend({
  billingFirstName: z.string().optional(),
  billingLastName: z.string().optional(),
  billingPhone: z.string().optional(),
  billingStreet: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZip: z.string().optional(),
  billingCountry: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutFormSchema>;

type EsewaInitiateResponse = {
  action: string;
  transactionUuid: string;
  fields: Record<string, string>;
};

function submitEsewaForm(action: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutForm() {
  const { status: authStatus } = useSession();
  const cartItems = useCartStore((state) => state.items);
  const appliedCoupon = useCartStore((state) => state.coupon);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = 500;
  const tax = Math.round(subtotal * 0.08);
  const discount = Math.min(appliedCoupon?.discount ?? 0, subtotal);
  const total = subtotal > 0 ? subtotal + shippingCost + tax - discount : 0;
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({ resolver: zodResolver(checkoutFormSchema) });

  function getBillingAddress(values: CheckoutValues) {
    if (useShippingAsBilling) {
      return { ...values };
    }

    const billingAddress = {
      firstName: values.billingFirstName?.trim() ?? "",
      lastName: values.billingLastName?.trim() ?? "",
      phone: values.billingPhone?.trim() ?? "",
      street: values.billingStreet?.trim() ?? "",
      city: values.billingCity?.trim() ?? "",
      state: values.billingState?.trim() ?? "",
      zip: values.billingZip?.trim() ?? "",
      country: values.billingCountry?.trim() ?? "",
    };

    if (Object.values(billingAddress).some((value) => !value)) {
      setErrorMessage("Enter complete billing details or use the shipping address as billing.");
      return null;
    }

    return billingAddress;
  }

  async function onSubmit(values: CheckoutValues) {
    setErrorMessage("");
    setStatus("");

    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    setStatus("Preparing secure eSewa payment...");
    const billingAddress = getBillingAddress(values);
    if (!billingAddress) return;

    const checkoutPayload = {
      shippingAddress: { ...values },
      billingAddress,
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        variant: item.variant,
      })),
      paymentMethod: "esewa",
      couponCode: appliedCoupon?.code ?? "",
    };

    const esewaResponse = await fetch("/api/payments/esewa/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutPayload),
    });
    const esewaData = await esewaResponse.json().catch(() => ({})) as Partial<EsewaInitiateResponse> & { message?: string };
    if (!esewaResponse.ok || !esewaData.action || !esewaData.fields || !esewaData.transactionUuid) {
      setStatus("");
      setErrorMessage(esewaData.message || "Unable to start eSewa payment.");
      return;
    }

    window.localStorage.setItem(
      "ratna-esewa-checkout",
      JSON.stringify({ ...checkoutPayload, transactionUuid: esewaData.transactionUuid })
    );
    submitEsewaForm(esewaData.action, esewaData.fields);
  }

  return (
    <div className="space-y-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <section className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 md:grid-cols-3">
        <div className={authStatus === "unauthenticated" ? "rounded-lg border border-[#D8B35A] bg-white p-4" : "rounded-lg border border-slate-200 bg-white p-4"}>
          <p className="font-semibold text-[#0A1628]">Guest checkout</p>
          <p className="mt-1">Continue with email and shipping details.</p>
        </div>
        <Link href="/login?callbackUrl=/checkout" className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-[#D8B35A]">
          <p className="font-semibold text-[#0A1628]">Login</p>
          <p className="mt-1">Use saved account details.</p>
        </Link>
        <Link href="/register?callbackUrl=/checkout" className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-[#D8B35A]">
          <p className="font-semibold text-[#0A1628]">Register</p>
          <p className="mt-1">Create an account before payment.</p>
        </Link>
      </section>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        <section className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9A7627]">Shipping details</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#0A1628]">Delivery information</h2>
          </div>
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
        </section>

        <section className="space-y-5 rounded-lg border border-[#D8B35A]/50 bg-[#FBFAF7] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A1628] text-[#D8B35A]">
              <WalletCards size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9A7627]">eSewa payment</p>
              <h2 className="mt-1 text-2xl font-semibold text-[#0A1628]">Pay securely with eSewa</h2>
              <p className="mt-1 text-sm text-slate-600">You will be redirected to eSewa to complete payment. Ratna never collects wallet credentials.</p>
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[#0A1628]">
            <input type="checkbox" checked={useShippingAsBilling} onChange={(event) => setUseShippingAsBilling(event.target.checked)} />
            Billing address same as shipping
          </label>
          {!useShippingAsBilling && (
            <div className="grid gap-4 rounded-lg border border-[#D8B35A]/50 bg-white p-4 md:grid-cols-2">
              <div>
                <Label htmlFor="billingFirstName">Billing first name</Label>
                <Input id="billingFirstName" {...register("billingFirstName")} />
              </div>
              <div>
                <Label htmlFor="billingLastName">Billing last name</Label>
                <Input id="billingLastName" {...register("billingLastName")} />
              </div>
              <div>
                <Label htmlFor="billingPhone">Billing phone</Label>
                <Input id="billingPhone" type="tel" {...register("billingPhone")} />
              </div>
              <div>
                <Label htmlFor="billingStreet">Billing street address</Label>
                <Input id="billingStreet" {...register("billingStreet")} />
              </div>
              <div>
                <Label htmlFor="billingCity">Billing city</Label>
                <Input id="billingCity" {...register("billingCity")} />
              </div>
              <div>
                <Label htmlFor="billingState">Billing state</Label>
                <Input id="billingState" {...register("billingState")} />
              </div>
              <div>
                <Label htmlFor="billingZip">Billing ZIP</Label>
                <Input id="billingZip" {...register("billingZip")} />
              </div>
              <div>
                <Label htmlFor="billingCountry">Billing country</Label>
                <Input id="billingCountry" {...register("billingCountry")} />
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
          <div className="flex justify-between">Subtotal<span>{centsToCurrency(subtotal)}</span></div>
          <div className="flex justify-between">Shipping<span>{centsToCurrency(shippingCost)}</span></div>
          <div className="flex justify-between">Tax<span>{centsToCurrency(tax)}</span></div>
          {discount > 0 && <div className="flex justify-between text-emerald-700">Coupon ({appliedCoupon?.code})<span>-{centsToCurrency(discount)}</span></div>}
          <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold text-[#0A1628]">Total<span>{centsToCurrency(total)}</span></div>
        </section>

        {status && <p className="flex items-center gap-2 text-sm text-[#0A1628]"><ShieldCheck size={16} />{status}</p>}
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Redirecting to eSewa..." : "Pay with eSewa"}
        </Button>
      </form>
    </div>
  );
}
