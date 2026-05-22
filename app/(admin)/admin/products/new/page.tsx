"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewProductPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      description: "",
      price: 0,
      comparePrice: 0,
      costPrice: 0,
      material: "Gold",
      gemstone: "Diamond",
      weight: "0.00g",
      occasion: "Everyday",
      totalStock: 0,
      isPublished: true,
    },
  });

  async function onSubmit(values: any) {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage(error.message || "Failed to create product");
        return;
      }

      setMessage("Product created successfully!");
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (error) {
      setMessage((error as any).message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/products" className="text-[#C9A84C] hover:text-[#0A1628]">← Back to products</Link>
        <div>
          <h1 className="text-3xl font-semibold text-[#0A1628]">Add new product</h1>
          <p className="text-slate-600">Fill in the details below to create a new product.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm space-y-8 max-w-4xl">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold text-[#0A1628] mb-6">Basic Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Product name *</Label>
              <Input id="name" placeholder="e.g., Gold Diamond Ring" {...register("name", { required: true })} />
            </div>
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" placeholder="e.g., GDR-001" {...register("sku", { required: true })} />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="slug">URL slug *</Label>
            <Input id="slug" placeholder="e.g., gold-diamond-ring" {...register("slug", { required: true })} />
          </div>
          <div className="mt-4">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              placeholder="Product description"
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              rows={4}
              {...register("description", { required: true })}
            />
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h2 className="text-xl font-semibold text-[#0A1628] mb-6">Pricing</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="price">Selling price ($) *</Label>
              <Input id="price" type="number" step="0.01" {...register("price", { required: true })} />
            </div>
            <div>
              <Label htmlFor="comparePrice">Compare price ($)</Label>
              <Input id="comparePrice" type="number" step="0.01" {...register("comparePrice")} />
            </div>
            <div>
              <Label htmlFor="costPrice">Cost price ($)</Label>
              <Input id="costPrice" type="number" step="0.01" {...register("costPrice")} />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div>
          <h2 className="text-xl font-semibold text-[#0A1628] mb-6">Inventory</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="totalStock">Stock quantity</Label>
              <Input id="totalStock" type="number" {...register("totalStock")} />
            </div>
            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input id="weight" placeholder="e.g., 5.50g" {...register("weight")} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <h2 className="text-xl font-semibold text-[#0A1628] mb-6">Product Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="material">Material</Label>
              <select id="material" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" {...register("material")}>
                <option>Gold</option>
                <option>Silver</option>
                <option>Platinum</option>
              </select>
            </div>
            <div>
              <Label htmlFor="gemstone">Gemstone</Label>
              <select id="gemstone" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" {...register("gemstone")}>
                <option>Diamond</option>
                <option>Ruby</option>
                <option>Sapphire</option>
                <option>Emerald</option>
              </select>
            </div>
            <div>
              <Label htmlFor="occasion">Occasion</Label>
              <select id="occasion" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" {...register("occasion")}>
                <option>Everyday</option>
                <option>Bridal</option>
                <option>Anniversary</option>
                <option>Special occasion</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-4">
          <input type="checkbox" id="isPublished" defaultChecked {...register("isPublished")} />
          <Label htmlFor="isPublished" className="mb-0">Publish this product</Label>
        </div>

        {/* Messages */}
        {message && (
          <div className={`rounded-lg p-4 text-sm ${message.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? "Creating..." : "Create product"}
          </Button>
          <Link href="/admin/products" className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#C9A84C]">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
