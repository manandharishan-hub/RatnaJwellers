"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, ImagePlus, PowerOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type CategoryValue = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  parent: string | { _id: string; name: string } | null;
  isActive: boolean;
};

type CategoryFormValue = Omit<CategoryValue, "_id" | "parent"> & {
  _id?: string;
  parent: string | null;
};

const emptyCategory: CategoryFormValue = {
  name: "",
  slug: "",
  image: "",
  description: "",
  parent: null,
  isActive: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parentId(category: CategoryValue) {
  if (!category.parent) return null;
  return typeof category.parent === "string" ? category.parent : category.parent._id;
}

function parentName(category: CategoryValue) {
  if (!category.parent) return "Top level";
  return typeof category.parent === "string" ? "Parent category" : category.parent.name;
}

export function CategoryManager({ initialCategories }: { initialCategories: CategoryValue[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState<CategoryFormValue>(emptyCategory);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isEditing = Boolean(form._id);
  const parentOptions = useMemo(() => categories.filter((category) => category._id !== form._id), [categories, form._id]);

  function resetForm() {
    setForm(emptyCategory);
    setError("");
    setMessage("");
  }

  async function uploadCategoryImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError("");
    setMessage("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "categories");
      const response = await fetch("/api/admin/uploads", { method: "POST", body: uploadData });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Image upload failed.");
        return;
      }

      setForm((current) => ({ ...current, image: data.url }));
      setMessage("Category image uploaded.");
    } catch {
      setError("Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/admin/categories", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, parent: form.parent || null }),
    });
    const data = await response.json().catch(() => ({}));
    setIsSaving(false);

    if (!response.ok) {
      setError(data.message || "Unable to save category.");
      return;
    }

    setCategories((current) => {
      if (isEditing) return current.map((category) => (category._id === data._id ? data : category));
      return [...current, data].sort((a, b) => a.name.localeCompare(b.name));
    });
    setMessage(isEditing ? "Category updated." : "Category created.");
    setForm(emptyCategory);
    router.refresh();
  }

  async function deactivateCategory(id: string) {
    setError("");
    const response = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.message || "Unable to deactivate category.");
      return;
    }
    setCategories((current) => current.map((category) => (category._id === data._id ? data : category)));
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submitCategory} className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9A7627]">{isEditing ? "Edit category" : "New category"}</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#0A1628]">{isEditing ? form.name : "Create category"}</h2>
        </div>
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
          <Input id="slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} required />
        </div>
        <div>
          <Label htmlFor="parent">Parent</Label>
          <select
            id="parent"
            value={form.parent ?? ""}
            onChange={(event) => setForm((current) => ({ ...current, parent: event.target.value || null }))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm"
          >
            <option value="">Top level</option>
            {parentOptions.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <Label htmlFor="image">Image URL</Label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#0A1628] transition hover:border-[#D8B35A] hover:text-[#9A7627]">
              <ImagePlus size={14} />
              {isUploading ? "Uploading..." : "Upload Image"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadCategoryImage} disabled={isUploading} />
            </label>
          </div>
          {form.image && (
            <div className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <div className="relative aspect-[16/9]">
                <Image src={form.image} alt={form.name || "Category preview"} fill sizes="340px" unoptimized className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, image: "" }))}
                className="flex w-full items-center justify-center gap-2 border-t border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:text-red-600"
              >
                <X size={14} />
                Remove image
              </button>
            </div>
          )}
          <Input id="image" value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} placeholder="Paste image link or upload a file" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
        </div>
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
          Active
        </label>
        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={isSaving || isUploading}>{isSaving ? "Saving..." : "Save category"}</Button>
          {isEditing && <button type="button" onClick={resetForm} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#0A1628]">Cancel edit</button>}
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3">Parent</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {categories.map((category) => (
              <tr key={category._id}>
                <td className="px-5 py-4 font-semibold text-[#0A1628]">{category.name}</td>
                <td className="px-5 py-4 text-slate-600">{category.slug}</td>
                <td className="px-5 py-4 text-slate-600">{parentName(category)}</td>
                <td className="px-5 py-4 text-slate-600">{category.isActive ? "Active" : "Inactive"}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...category, parent: parentId(category) })}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-[#0A1628]"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    {category.isActive && (
                      <button
                        type="button"
                        onClick={() => deactivateCategory(category._id)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                      >
                        <PowerOff size={14} />
                        Disable
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
