"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Package, Search } from "lucide-react";

type ProductItem = {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  careInstructions: string;
  price: number;
  comparePrice: number;
  costPrice: number;
  images: { url: string; isPrimary: boolean }[];
  category: string;
  subCategory: string | null;
  tags: string[];
  material: string;
  gemstone: string;
  weight: string;
  occasion: string;
  variants: { size: string; stock: number }[];
  totalStock: number;
  isPublished: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
};

function stockStatus(stock: number) {
  if (stock <= 0) return "out";
  if (stock <= 5) return "low";
  return "good";
}

export function InventoryManager({ initialProducts }: { initialProducts: ProductItem[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [stock, setStock] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !query || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query);
      const matchesLow = !lowOnly || product.totalStock <= 5;
      return matchesSearch && matchesLow;
    });
  }, [products, search, lowOnly]);

  async function saveStock(product: ProductItem) {
    setMessage("");
    setError("");
    const nextVariants = product.variants.length > 0
      ? product.variants.map((variant, index) => (index === 0 ? { ...variant, stock } : { ...variant, stock: 0 }))
      : [{ size: "Standard", stock }];
    const payload = { ...product, variants: nextVariants, totalStock: stock };
    const response = await fetch(`/api/products/${product._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.message || "Unable to update stock.");
      return;
    }
    setProducts((current) => current.map((item) => (item._id === product._id ? data : item)));
    setEditingId("");
    setMessage("Stock updated.");
  }

  const goodCount = products.filter((item) => stockStatus(item.totalStock) === "good").length;
  const lowCount = products.filter((item) => stockStatus(item.totalStock) === "low").length;
  const outCount = products.filter((item) => stockStatus(item.totalStock) === "out").length;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product name or SKU..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="button" onClick={() => setLowOnly((value) => !value)} className={`px-4 py-2 border rounded-lg transition-colors text-sm ${lowOnly ? "border-yellow-300 bg-yellow-50 text-yellow-800" : "border-gray-300 hover:bg-gray-50"}`}>
          {lowOnly ? "Showing Low Stock" : "Show Low Stock"}
        </button>
      </div>

      {message && <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><div className="flex items-center gap-4"><div className="p-3 bg-green-100 rounded-lg"><Package className="w-6 h-6 text-green-600" /></div><div><p className="text-gray-600 text-sm font-medium">Good Stock</p><p className="text-2xl font-bold text-gray-900 mt-2">{goodCount}</p></div></div></div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><div className="flex items-center gap-4"><div className="p-3 bg-yellow-100 rounded-lg"><AlertTriangle className="w-6 h-6 text-yellow-600" /></div><div><p className="text-gray-600 text-sm font-medium">Low Stock</p><p className="text-2xl font-bold text-gray-900 mt-2">{lowCount}</p></div></div></div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><div className="flex items-center gap-4"><div className="p-3 bg-red-100 rounded-lg"><AlertTriangle className="w-6 h-6 text-red-600" /></div><div><p className="text-gray-600 text-sm font-medium">Out of Stock</p><p className="text-2xl font-bold text-gray-900 mt-2">{outCount}</p></div></div></div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr><th className="px-6 py-3 text-left font-semibold text-gray-700">Product</th><th className="px-6 py-3 text-left font-semibold text-gray-700">SKU</th><th className="px-6 py-3 text-left font-semibold text-gray-700">Current Stock</th><th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th><th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((item) => {
                const status = stockStatus(item.totalStock);
                return (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs"><span className="inline-block bg-gray-50 rounded px-2 py-1">{item.sku}</span></td>
                    <td className="px-6 py-4 font-medium text-gray-900">{editingId === item._id ? <input type="number" min="0" value={stock} onChange={(event) => setStock(Number(event.target.value))} className="w-24 rounded border border-gray-300 px-3 py-2" /> : item.totalStock}</td>
                    <td className="px-6 py-4"><span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status === "good" ? "bg-green-100 text-green-800" : status === "low" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{status === "good" ? "Good" : status === "low" ? "Low Stock" : "Out of Stock"}</span></td>
                    <td className="px-6 py-4">
                      {editingId === item._id ? (
                        <div className="flex gap-2"><button type="button" onClick={() => saveStock(item)} className="rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Save</button><button type="button" onClick={() => setEditingId("")} className="rounded border border-gray-300 px-3 py-2 text-xs font-semibold">Cancel</button></div>
                      ) : (
                        <button type="button" onClick={() => { setEditingId(item._id); setStock(item.totalStock); }} className="rounded border border-gray-300 px-3 py-2 text-xs font-semibold hover:bg-gray-50">Update Stock</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No inventory items found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
