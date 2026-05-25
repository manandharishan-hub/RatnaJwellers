"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statuses = ["pending", "processing", "packed", "out-for-delivery", "delivered", "cancelled", "refunded"];

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: string;
  trackingNumber?: string;
}

export function OrderStatusForm({ orderId, currentStatus, trackingNumber = "" }: OrderStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(trackingNumber);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingNumber: tracking, note }),
    });
    const data = await response.json().catch(() => ({}));
    setIsSaving(false);

    if (!response.ok) {
      setError(data.message || "Unable to update order status.");
      return;
    }

    setMessage("Order status updated.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#0A1628]">Update status</h2>
      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm"
        >
          {statuses.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="tracking">Tracking number</Label>
        <Input id="tracking" value={tracking} onChange={(event) => setTracking(event.target.value)} />
      </div>
      <div>
        <Label htmlFor="note">Status note</Label>
        <Input id="note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note for the history" />
      </div>
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isSaving}>{isSaving ? "Updating..." : "Update order"}</Button>
    </form>
  );
}
