"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountAddressesPage() {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { label: "Home", street: "", city: "", state: "", zip: "", country: "" } });

  function onSubmit(values: any) {
    setMessage("Address save functionality is not available in demo mode.");
  }

  return (
    <div className="space-y-8 px-6 py-10 md:px-10 lg:px-16">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Addresses</p>
        <h1 className="text-3xl font-semibold text-[#0A1628]">Manage your saved addresses</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="label">Label</Label>
            <Input id="label" {...register("label")} />
          </div>
          <div>
            <Label htmlFor="street">Street</Label>
            <Input id="street" {...register("street")} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} />
          </div>
          <div>
            <Label htmlFor="zip">ZIP</Label>
            <Input id="zip" {...register("zip")} />
          </div>
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register("country")} />
        </div>
        {message && <p className="text-sm text-[#0A1628]">{message}</p>}
        <Button type="submit" disabled={isSubmitting}>Save address</Button>
      </form>
    </div>
  );
}
