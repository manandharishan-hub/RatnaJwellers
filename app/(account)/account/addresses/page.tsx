"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AddressFormValues = {
  _id?: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

const emptyAddress: AddressFormValues = {
  label: "Home",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "Nepal",
  isDefault: false,
};

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<AddressFormValues[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<AddressFormValues>({ defaultValues: emptyAddress });

  async function loadAddresses() {
    const response = await fetch("/api/account/addresses");
    const data = await response.json().catch(() => ({}));
    if (response.ok) setAddresses(data.items ?? []);
  }

  useEffect(() => {
    let isCurrent = true;

    fetch("/api/account/addresses")
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (isCurrent && ok) setAddresses(data.items ?? []);
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, []);

  async function onSubmit(values: AddressFormValues) {
    setMessage("");
    setError("");
    const response = await fetch("/api/account/addresses", {
      method: values._id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.message || "Unable to save address.");
      return;
    }

    setAddresses(data.items ?? []);
    reset(emptyAddress);
    setMessage("Address saved.");
  }

  async function deleteAddress(addressId: string) {
    setMessage("");
    setError("");
    const response = await fetch("/api/account/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.message || "Unable to remove address.");
      return;
    }

    setAddresses(data.items ?? []);
    setMessage("Address removed.");
  }

  function editAddress(address: AddressFormValues) {
    setMessage("");
    setError("");
    reset(address);
  }

  return (
    <div className="space-y-8 px-6 py-10 md:px-10 lg:px-16">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Addresses</p>
        <h1 className="text-3xl font-semibold text-[#0A1628]">Manage your saved addresses</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <input type="hidden" {...register("_id")} />
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
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register("isDefault")} />
            Set as default shipping address
          </label>
          {message && <p className="text-sm text-[#0A1628]">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save address"}</Button>
            <Button type="button" className="border border-slate-300 bg-white text-[#0A1628] hover:border-[#C9A84C]" onClick={() => reset(emptyAddress)}>New address</Button>
          </div>
        </form>

        <section className="space-y-4">
          {addresses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">No saved addresses yet.</div>
          ) : (
            addresses.map((address) => (
              <article key={address._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#0A1628]">{address.label}{address.isDefault ? " - Default" : ""}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{address.street}, {address.city}, {address.state} {address.zip}, {address.country}</p>
                  </div>
                  <button type="button" aria-label={`Remove ${address.label} address`} onClick={() => address._id && deleteAddress(address._id)} className="rounded-full border border-red-200 bg-red-50 p-2 text-red-700 transition hover:bg-red-100">
                    <Trash2 size={16} />
                  </button>
                </div>
                <Button type="button" className="mt-4 border border-slate-300 bg-white text-[#0A1628] hover:border-[#C9A84C]" onClick={() => editAddress(address)}>
                  Edit
                </Button>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
