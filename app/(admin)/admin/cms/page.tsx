"use client";

import { FormEvent, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Edit2, Trash2, Eye, X } from "lucide-react";

type CmsStatus = "published" | "draft";

type CmsPageItem = {
  id: number;
  title: string;
  slug: string;
  status: CmsStatus;
  updated: string;
  content: string;
};

const initialPages: CmsPageItem[] = [
  { id: 1, title: "About Us", slug: "about", status: "published", updated: "2024-05-15", content: "Ratna Jewels creates refined jewelry gallery pieces for memorable occasions and everyday elegance." },
  { id: 2, title: "Contact Us", slug: "contact", status: "published", updated: "2024-05-10", content: "Customers can reach Ratna Jewels for product questions, custom orders, and support." },
  { id: 3, title: "Privacy Policy", slug: "privacy-policy", status: "published", updated: "2024-04-20", content: "This page explains how customer information is collected, protected, and used." },
  { id: 4, title: "Terms & Conditions", slug: "terms", status: "draft", updated: "2024-05-01", content: "Draft terms for purchases, returns, payments, and website use." },
];

function blankPage(): CmsPageItem {
  return {
    id: Date.now(),
    title: "",
    slug: "",
    status: "draft",
    updated: new Date().toISOString().slice(0, 10),
    content: "",
  };
}

function formatSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CMSPage() {
  const [pages, setPages] = useState<CmsPageItem[]>(initialPages);
  const [viewingPage, setViewingPage] = useState<CmsPageItem | null>(null);
  const [editingPage, setEditingPage] = useState<CmsPageItem | null>(null);
  const [message, setMessage] = useState("");

  const stats = useMemo(
    () => ({
      total: pages.length,
      published: pages.filter((page) => page.status === "published").length,
      drafts: pages.filter((page) => page.status === "draft").length,
    }),
    [pages]
  );

  function savePage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingPage) return;

    const pageToSave = {
      ...editingPage,
      slug: formatSlug(editingPage.slug || editingPage.title),
      updated: new Date().toISOString().slice(0, 10),
    };

    if (!pageToSave.title.trim() || !pageToSave.slug) {
      setMessage("Add a page title and slug before saving.");
      return;
    }

    setPages((current) => {
      const exists = current.some((page) => page.id === pageToSave.id);
      if (exists) return current.map((page) => (page.id === pageToSave.id ? pageToSave : page));
      return [pageToSave, ...current];
    });
    setEditingPage(null);
    setMessage("CMS page saved.");
  }

  function deletePage(page: CmsPageItem) {
    if (!window.confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    setPages((current) => current.filter((item) => item.id !== page.id));
    if (viewingPage?.id === page.id) setViewingPage(null);
    if (editingPage?.id === page.id) setEditingPage(null);
    setMessage("CMS page deleted.");
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-title">CMS / Content Management</h1>
            <p className="admin-muted">Create and manage website pages, blog posts, and content.</p>
          </div>
          <button type="button" onClick={() => setEditingPage(blankPage())} className="lux-button-primary">
            <Plus className="h-4 w-4" />
            New Page
          </button>
        </div>

        {message && <p className="rounded-lg border border-[#D8B35A]/40 bg-[#FBFAF7] px-4 py-3 text-sm font-semibold text-[#0A1628]">{message}</p>}

        <div className="admin-surface">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Page Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td className="font-medium text-slate-950">{page.title}</td>
                    <td className="font-mono text-xs"><span className="inline-block rounded bg-slate-50 px-2 py-1">/{page.slug}</span></td>
                    <td>
                      <span className={`status-pill ${page.status === "published" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>
                        {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                      </span>
                    </td>
                    <td>{page.updated}</td>
                    <td>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setViewingPage(page)} aria-label={`View ${page.title}`} title="View" className="rounded p-1 text-[#0A1628] transition-colors hover:bg-[#F7F1D1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D8B35A]">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setEditingPage(page)} aria-label={`Edit ${page.title}`} title="Edit" className="rounded p-1 text-[#0A1628] transition-colors hover:bg-[#F7F1D1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D8B35A]">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => deletePage(page)} aria-label={`Delete ${page.title}`} title="Delete" className="rounded p-1 transition-colors hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="surface-card p-6">
            <p className="text-sm font-medium text-slate-600">Total Pages</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{stats.total}</p>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm font-medium text-slate-600">Published</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{stats.published}</p>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm font-medium text-slate-600">Drafts</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{stats.drafts}</p>
          </div>
        </div>
      </div>

      {viewingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="cms-view-title" className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 id="cms-view-title" className="text-xl font-semibold text-gray-900">{viewingPage.title}</h2>
                <p className="mt-1 text-sm text-gray-500">/{viewingPage.slug} · {viewingPage.status}</p>
              </div>
              <button type="button" onClick={() => setViewingPage(null)} aria-label="Close page preview" className="rounded p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <p className="text-sm font-semibold text-gray-500">Last updated: {viewingPage.updated}</p>
              <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 leading-7 text-gray-700">{viewingPage.content}</p>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button type="button" onClick={() => setEditingPage(viewingPage)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Edit</button>
              <button type="button" onClick={() => setViewingPage(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={savePage} role="dialog" aria-modal="true" aria-labelledby="cms-edit-title" className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
              <h2 id="cms-edit-title" className="text-xl font-semibold text-gray-900">{pages.some((page) => page.id === editingPage.id) ? "Edit CMS page" : "New CMS page"}</h2>
              <button type="button" onClick={() => setEditingPage(null)} aria-label="Close editor" className="rounded p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 px-6 py-5">
              <label className="text-sm font-semibold text-gray-700">Title<input value={editingPage.title} onChange={(event) => setEditingPage((page) => page ? { ...page, title: event.target.value, slug: page.slug || formatSlug(event.target.value) } : page)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" required /></label>
              <label className="text-sm font-semibold text-gray-700">Slug<input value={editingPage.slug} onChange={(event) => setEditingPage((page) => page ? { ...page, slug: formatSlug(event.target.value) } : page)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm" placeholder="about-us" required /></label>
              <label className="text-sm font-semibold text-gray-700">Status<select value={editingPage.status} onChange={(event) => setEditingPage((page) => page ? { ...page, status: event.target.value as CmsStatus } : page)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"><option value="published">Published</option><option value="draft">Draft</option></select></label>
              <label className="text-sm font-semibold text-gray-700">Content<textarea value={editingPage.content} onChange={(event) => setEditingPage((page) => page ? { ...page, content: event.target.value } : page)} rows={7} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" required /></label>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button type="button" onClick={() => setEditingPage(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save page</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
