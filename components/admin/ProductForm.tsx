"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProductImageValue = {
  url: string;
  isPrimary: boolean;
};

type ProductVariantValue = {
  size: string;
  stock: number;
};

export type ProductFormValue = {
  _id?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  careInstructions: string;
  price: number;
  comparePrice: number;
  costPrice: number;
  images: ProductImageValue[];
  category: string;
  subCategory?: string | null;
  tags: string[];
  material: string;
  gemstone: string;
  weight: string;
  occasion: string;
  variants: ProductVariantValue[];
  totalStock: number;
  isPublished: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
};

type CategoryOption = {
  _id: string;
  name: string;
};

interface ProductFormProps {
  mode: "create" | "edit";
  product?: ProductFormValue;
  categories: CategoryOption[];
}

const emptyProduct: ProductFormValue = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  careInstructions: "Handle with care and store in dry place.",
  price: 0,
  comparePrice: 0,
  costPrice: 0,
  images: [],
  category: "",
  subCategory: null,
  tags: [],
  material: "Gold",
  gemstone: "Diamond",
  weight: "0.00g",
  occasion: "Everyday",
  variants: [{ size: "Standard", stock: 0 }],
  totalStock: 0,
  isPublished: true,
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({ mode, product, categories }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValue>({ ...emptyProduct, ...product });
  const [tagText, setTagText] = useState((product?.tags ?? []).join(", "));
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalStock = useMemo(() => form.variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0), [form.variants]);

  function updateField<K extends keyof ProductFormValue>(key: K, value: ProductFormValue[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addImage(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    setForm((current) => ({
      ...current,
      images: [...current.images, { url: trimmed, isPrimary: current.images.length === 0 }],
    }));
    setImageUrl("");
  }

  function removeImage(index: number) {
    setForm((current) => {
      const images = current.images.filter((_, imageIndex) => imageIndex !== index);
      if (images.length > 0 && !images.some((image) => image.isPrimary)) {
        images[0] = { ...images[0], isPrimary: true };
      }
      return { ...current, images };
    });
  }

  function setPrimaryImage(index: number) {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => ({ ...image, isPrimary: imageIndex === index })),
    }));
  }

  async function uploadImage(file: File | null) {
    if (!file) return;
    setIsUploading(true);
    setError("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const response = await fetch("/api/admin/uploads", { method: "POST", body: uploadData });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Image upload failed.");
        return;
      }

      addImage(data.url);
    } catch {
      setError("Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  function updateVariant(index: number, key: keyof ProductVariantValue, value: string | number) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [key]: value } : variant
      ),
    }));
  }

  function addVariant() {
    setForm((current) => ({ ...current, variants: [...current.variants, { size: "", stock: 0 }] }));
  }

  function removeVariant(index: number) {
    setForm((current) => ({ ...current, variants: current.variants.filter((_, variantIndex) => variantIndex !== index) }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    const payload = {
      ...form,
      tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean),
      totalStock,
      subCategory: form.subCategory || null,
    };
    const endpoint = mode === "create" ? "/api/products" : `/api/products/${form._id}`;
    const response = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    setIsSaving(false);

    if (!response.ok) {
      setError(data.message || data.error || "Unable to save product.");
      return;
    }

    setMessage("Product saved.");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(event) => {
              const name = event.target.value;
              setForm((current) => ({ ...current, name, slug: current.slug || slugify(name) }));
            }}
            required
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={form.slug} onChange={(event) => updateField("slug", slugify(event.target.value))} required />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" value={form.sku} onChange={(event) => updateField("sku", event.target.value)} required />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            required
            disabled={categories.length === 0}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">{categories.length === 0 ? "Create a category first" : "Choose category"}</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={form.description} onChange={(event) => updateField("description", event.target.value)} required />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <Label htmlFor="price">Price in cents</Label>
          <Input id="price" type="number" min="1" value={form.price} onChange={(event) => updateField("price", Number(event.target.value))} required />
        </div>
        <div>
          <Label htmlFor="comparePrice">Compare price in cents</Label>
          <Input id="comparePrice" type="number" min="0" value={form.comparePrice} onChange={(event) => updateField("comparePrice", Number(event.target.value))} />
        </div>
        <div>
          <Label htmlFor="costPrice">Cost price in cents</Label>
          <Input id="costPrice" type="number" min="0" value={form.costPrice} onChange={(event) => updateField("costPrice", Number(event.target.value))} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <div>
          <Label htmlFor="material">Material</Label>
          <Input id="material" value={form.material} onChange={(event) => updateField("material", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="gemstone">Gemstone</Label>
          <Input id="gemstone" value={form.gemstone} onChange={(event) => updateField("gemstone", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="weight">Weight</Label>
          <Input id="weight" value={form.weight} onChange={(event) => updateField("weight", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="occasion">Occasion</Label>
          <Input id="occasion" value={form.occasion} onChange={(event) => updateField("occasion", event.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="careInstructions">Care instructions</Label>
        <Textarea id="careInstructions" value={form.careInstructions} onChange={(event) => updateField("careInstructions", event.target.value)} />
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input id="tags" value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="bridal, gold, everyday" />
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#0A1628]">Images</h2>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0A1628] px-4 py-2 text-sm font-semibold text-white">
            <ImagePlus size={16} />
            {isUploading ? "Uploading..." : "Upload"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => uploadImage(event.target.files?.[0] ?? null)} />
          </label>
        </div>
        <div className="flex gap-3">
          <Input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Paste image URL" />
          <button type="button" onClick={() => addImage(imageUrl)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-[#0A1628]">Add URL</button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {form.images.map((image, index) => (
            <div key={`${image.url}-${index}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="relative h-36 w-full bg-slate-100">
                <Image src={image.url || "/favicon.ico"} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" unoptimized className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-2 p-3 text-sm">
                <button type="button" onClick={() => setPrimaryImage(index)} className="font-semibold text-[#0A1628]">
                  {image.isPrimary ? "Primary" : "Make primary"}
                </button>
                <button type="button" onClick={() => removeImage(index)} className="text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#0A1628]">Variants and stock</h2>
          <button type="button" onClick={addVariant} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">
            <Plus size={16} /> Variant
          </button>
        </div>
        {form.variants.map((variant, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
            <Input value={variant.size} onChange={(event) => updateVariant(index, "size", event.target.value)} placeholder="Size" required />
            <Input type="number" min="0" value={variant.stock} onChange={(event) => updateVariant(index, "stock", Number(event.target.value))} placeholder="Stock" />
            <button type="button" onClick={() => removeVariant(index)} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Remove</button>
          </div>
        ))}
        <p className="text-sm text-slate-600">Total stock: {totalStock}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["isPublished", "Published"],
          ["isFeatured", "Featured"],
          ["isNewArrival", "New arrival"],
          ["isBestSeller", "Best seller"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(form[key as keyof ProductFormValue])}
              onChange={(event) => updateField(key as keyof ProductFormValue, event.target.checked as never)}
            />
            {label}
          </label>
        ))}
      </div>

      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={isSaving || isUploading || categories.length === 0}>{isSaving ? "Saving..." : "Save product"}</Button>
        <button type="button" onClick={() => router.push("/admin/products")} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[#0A1628]">Cancel</button>
      </div>
    </form>
  );
}
