"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { centsToCurrency } from "@/lib/utils";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const orderId = params.id;

  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadOrder() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new Error(errorBody?.message || "Unable to load order.");
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err?.message || "Unable to load order.");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [status, orderId]);

  if (status === "loading") {
    return (
      <div className="px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Loading order…</h1>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Please sign in to view this order.</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Loading order details…</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-24 text-center text-red-600">
        <h1 className="text-3xl font-semibold text-[#0A1628]">{error}</h1>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Order not found</h1>
      </div>
    );
  }

  return (
    <div className="px-6 py-16 md:px-10 lg:px-16">
      <div className="max-w-4xl space-y-6 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Order #{order.orderNumber}</h1>
        <p className="text-slate-600">Status: {order.status}</p>
        <p className="text-slate-600">Total: {centsToCurrency(order.total)}</p>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div key={item.product.toString()} className="flex flex-col gap-3 rounded-3xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[#0A1628]">{item.name}</p>
                <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                {item.variant && <p className="text-sm text-slate-600">Variant: {item.variant}</p>}
              </div>
              <p className="text-slate-900">{centsToCurrency(item.price)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
