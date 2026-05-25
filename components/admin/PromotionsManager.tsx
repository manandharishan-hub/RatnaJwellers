"use client";

import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { centsToCurrency } from "@/lib/utils";

type Coupon = {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxUsage: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
};

const emptyForm = {
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: 10,
  minOrderAmount: 0,
  maxUsage: 0,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  isActive: true,
};

function toNprInputValue(amount: number) {
  return amount ? String(amount / 100) : "";
}

function fromNprInputValue(value: string) {
  return Math.round(Number(value || 0) * 100);
}

function formatDiscount(coupon: Coupon) {
  return coupon.type === "percentage" ? `${coupon.value}% off` : `${centsToCurrency(coupon.value)} off`;
}

export function PromotionsManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function createCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const response = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.message || "Unable to create promotion.");
      return;
    }
    setCoupons((current) => [data, ...current]);
    setForm(emptyForm);
    setFormOpen(false);
    setMessage("Coupon saved successfully.");
  }

  async function toggleCoupon(id: string, isActive: boolean) {
    setMessage("");
    setError("");
    const response = await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.message || "Unable to update coupon.");
      return;
    }
    setCoupons((current) => current.map((coupon) => (coupon._id === id ? data : coupon)));
    setMessage(isActive ? "Coupon turned on." : "Coupon turned off.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600 mt-2">Create discount codes customers can use at checkout.</p>
        </div>
        <button type="button" onClick={() => setFormOpen((value) => !value)} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add coupon
        </button>
      </div>

      {formOpen && (
        <form onSubmit={createCoupon} className="grid gap-5 rounded-lg border border-gray-200 bg-white p-6 shadow md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">Coupon name</span>
            <input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} placeholder="Example: DASHAIN10" className="w-full rounded-lg border border-gray-300 px-4 py-3" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">Discount type</span>
            <select
              value={form.type}
              onChange={(event) => {
                const type = event.target.value as "percentage" | "fixed";
                setForm((current) => ({ ...current, type, value: type === "percentage" ? 10 : 10000 }));
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            >
              <option value="percentage">Percentage discount</option>
              <option value="fixed">Fixed NPR discount</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{form.type === "percentage" ? "Discount percentage" : "Discount amount (NPR)"}</span>
            <input
              type="number"
              min={form.type === "percentage" ? "1" : "0.01"}
              max={form.type === "percentage" ? "100" : undefined}
              step={form.type === "percentage" ? "1" : "0.01"}
              value={form.type === "percentage" ? form.value : toNprInputValue(form.value)}
              onChange={(event) => setForm((current) => ({ ...current, value: form.type === "percentage" ? Number(event.target.value) : fromNprInputValue(event.target.value) }))}
              placeholder={form.type === "percentage" ? "10" : "500"}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">Minimum order (NPR)</span>
            <input type="number" min="0" step="0.01" value={toNprInputValue(form.minOrderAmount)} onChange={(event) => setForm((current) => ({ ...current, minOrderAmount: fromNprInputValue(event.target.value) }))} placeholder="Leave empty for no minimum" className="w-full rounded-lg border border-gray-300 px-4 py-3" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">How many times can it be used?</span>
            <input type="number" min="0" value={form.maxUsage || ""} onChange={(event) => setForm((current) => ({ ...current, maxUsage: Number(event.target.value || 0) }))} placeholder="Leave empty for unlimited" className="w-full rounded-lg border border-gray-300 px-4 py-3" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">Expiry date</span>
            <input type="date" value={form.expiresAt} onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-4 py-3" required />
          </label>
          <button className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white md:col-span-3">Save coupon</button>
        </form>
      )}

      {message && <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><p className="text-gray-600 text-sm font-medium">Coupons turned on</p><p className="text-2xl font-bold text-gray-900 mt-2">{coupons.filter((coupon) => coupon.isActive).length}</p></div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><p className="text-gray-600 text-sm font-medium">Expired coupons</p><p className="text-2xl font-bold text-gray-900 mt-2">{coupons.filter((coupon) => new Date(coupon.expiresAt) < new Date()).length}</p></div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><p className="text-gray-600 text-sm font-medium">Total coupons</p><p className="text-2xl font-bold text-gray-900 mt-2">{coupons.length}</p></div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="px-6 py-3 text-left">Coupon name</th><th className="px-6 py-3 text-left">Customer gets</th><th className="px-6 py-3 text-left">Ends on</th><th className="px-6 py-3 text-left">Used</th><th className="px-6 py-3 text-left">Status</th><th className="px-6 py-3 text-left">Action</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td className="px-6 py-4 font-semibold">{coupon.code}</td>
                <td className="px-6 py-4">{formatDiscount(coupon)}</td>
                <td className="px-6 py-4">{new Date(coupon.expiresAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">{coupon.usedCount}/{coupon.maxUsage || "Unlimited"}</td>
                <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${coupon.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{coupon.isActive ? "On" : "Off"}</span></td>
                <td className="px-6 py-4">
                  <button type="button" onClick={() => toggleCoupon(coupon._id, !coupon.isActive)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${coupon.isActive ? "border-red-100 text-red-600 hover:bg-red-50" : "border-green-100 text-green-700 hover:bg-green-50"}`}>
                    <Trash2 className="h-4 w-4" />
                    {coupon.isActive ? "Turn off" : "Turn on"}
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">No coupons yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
