"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Edit2, ImagePlus, Plus, Save, Trash2, X } from "lucide-react";

type GalleryItem = {
  _id: string;
  title: string;
  caption: string;
  partnerLabel: string;
  imageUrl: string;
  sortOrder: number;
  isPublished: boolean;
};

type GalleryForm = {
  id?: string;
  title: string;
  caption: string;
  partnerLabel: string;
  imageUrl: string;
  sortOrder: number;
  isPublished: boolean;
};

const blankForm: GalleryForm = {
  title: "",
  caption: "",
  partnerLabel: "Mr/Ms Supranational",
  imageUrl: "",
  sortOrder: 0,
  isPublished: true,
};

export function GalleryManager({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState<GalleryForm>(blankForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const stats = useMemo(
    () => ({
      total: items.length,
      published: items.filter((item) => item.isPublished).length,
      supranational: items.filter((item) => item.partnerLabel.toLowerCase().includes("supranational")).length,
    }),
    [items]
  );

  function resetForm() {
    setForm(blankForm);
    setIsFormOpen(false);
  }

  function editItem(item: GalleryItem) {
    setForm({
      id: item._id,
      title: item.title,
      caption: item.caption ?? "",
      partnerLabel: item.partnerLabel || "Mr/Ms Supranational",
      imageUrl: item.imageUrl,
      sortOrder: item.sortOrder ?? 0,
      isPublished: item.isPublished,
    });
    setIsFormOpen(true);
    setMessage("");
  }

  async function refreshItems() {
    const response = await fetch("/api/admin/gallery", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setItems(data.items ?? []);
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setMessage("");
    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("folder", "gallery");

    try {
      const response = await fetch("/api/admin/uploads", { method: "POST", body: uploadData });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Image upload failed.");
        return;
      }
      setForm((current) => ({ ...current, imageUrl: data.url }));
      setMessage("Gallery image uploaded.");
    } catch {
      setMessage("Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/gallery", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.message || "Could not save gallery item.");
        return;
      }
      await refreshItems();
      resetForm();
      setMessage("Gallery item saved.");
    } catch {
      setMessage("Could not save gallery item.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteItem(item: GalleryItem) {
    if (!window.confirm(`Delete "${item.title}" from the gallery?`)) return;

    setMessage("");
    const response = await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item._id }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.message || "Could not delete gallery item.");
      return;
    }
    setItems((current) => current.filter((currentItem) => currentItem._id !== item._id));
    setMessage("Gallery item deleted.");
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Gallery Management</h1>
          <p className="admin-muted">Add, edit, delete, and publish Ratna gallery photos for the public gallery page.</p>
        </div>
        <button type="button" onClick={() => { setForm(blankForm); setIsFormOpen(true); }} className="lux-button-primary">
          <Plus className="h-4 w-4" />
          Add Gallery Photo
        </button>
      </div>

      {message && <p className="rounded-lg border border-[#D8B35A]/40 bg-[#FBFAF7] px-4 py-3 text-sm font-semibold text-[#0A1628]">{message}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-slate-600">Total Photos</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{stats.total}</p>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-slate-600">Published</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{stats.published}</p>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-slate-600">Supranational Branding</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{stats.supranational}</p>
        </div>
      </div>

      {isFormOpen && (
        <form onSubmit={saveItem} className="surface-panel grid gap-5 lg:grid-cols-[280px_1fr]">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-slate-100">
              {form.imageUrl ? (
                <Image src={form.imageUrl} alt={form.title || "Gallery preview"} fill sizes="280px" unoptimized className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <ImagePlus size={34} />
                </div>
              )}
            </div>
            <label className="lux-button-secondary mt-4 w-full cursor-pointer">
              <ImagePlus className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Photo"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadImage} disabled={isUploading} />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Title
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-2 lux-input" required />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Partner / Branding Label
              <input value={form.partnerLabel} onChange={(event) => setForm((current) => ({ ...current, partnerLabel: event.target.value }))} className="mt-2 lux-input" />
            </label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">
              Image URL
              <input value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} className="mt-2 lux-input" required />
            </label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">
              Caption
              <textarea value={form.caption} onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))} rows={4} className="mt-2 lux-input" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Sort Order
              <input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} className="mt-2 lux-input" />
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.isPublished} onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.checked }))} />
              Publish on public gallery
            </label>
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button type="submit" disabled={isSaving || isUploading} className="lux-button-primary disabled:cursor-not-allowed disabled:opacity-60">
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Photo"}
              </button>
              <button type="button" onClick={resetForm} className="lux-button-secondary">
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item._id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-slate-100">
              <Image src={item.imageUrl} alt={item.title} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw" unoptimized className="object-cover" />
              <span className={`status-pill absolute left-4 top-4 ${item.isPublished ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>
                {item.isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7627]">{item.partnerLabel}</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">{item.title}</h2>
              </div>
              <p className="line-clamp-2 text-sm leading-6 text-slate-600">{item.caption || "No caption added."}</p>
              <p className="text-xs font-semibold text-slate-500">Sort order: {item.sortOrder}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => editItem(item)} className="lux-button-secondary px-4 py-2">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button type="button" onClick={() => deleteItem(item)} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {items.length === 0 && (
        <div className="empty-state">
          No gallery photos yet. Add the first Ratna branding photo to publish the gallery.
        </div>
      )}
    </div>
  );
}
