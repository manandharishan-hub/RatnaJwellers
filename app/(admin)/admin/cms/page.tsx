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
  { id: 1, title: "About Us", slug: "about", status: "published", updated: "2024-05-15", content: "Ratna Jewels creates refined jewelry collections for memorable occasions and everyday elegance." },
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
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CMS / Content Management</h1>
            <p className="mt-2 text-gray-600">Create and manage website pages, blog posts, and content.</p>
          </div>
          <button type="button" onClick={() => setEditingPage(blankPage())} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            New Page
          </button>
        </div>

        {message && <p className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{message}</p>}

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Page Title</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Slug</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Last Updated</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pages.map((page) => (
                  <tr key={page.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{page.title}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600"><span className="inline-block rounded bg-gray-50 px-2 py-1">/{page.slug}</span></td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${page.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{page.updated}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setViewingPage(page)} aria-label={`View ${page.title}`} title="View" className="rounded p-1 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </button>
                        <button type="button" onClick={() => setEditingPage(page)} aria-label={`Edit ${page.title}`} title="Edit" className="rounded p-1 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                          <Edit2 className="h-4 w-4 text-blue-600" />
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
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-600">Total Pages</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-600">Published</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stats.published}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-600">Drafts</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stats.drafts}</p>
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
