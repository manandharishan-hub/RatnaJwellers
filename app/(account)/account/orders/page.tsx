"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { centsToCurrency } from "@/lib/utils";

export default function AccountOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadOrders() {
      setLoading(true);
      try {
        const res = await fetch("/api/orders?mine=true", { cache: "no-store" });
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new Error(errorBody?.message || "Unable to load orders.");
        }
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch (err: any) {
        setError(err?.message || "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [status]);

  if (status === "loading") {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Loading your orders…</h1>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Please sign in to view your orders.</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-6 py-10 md:px-10 lg:px-16">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">My orders</p>
        <h1 className="text-3xl font-semibold text-[#0A1628]">Order history</h1>
      </div>
      {error ? (
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-10 text-red-700 shadow-sm">{error}</div>
      ) : loading ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm text-slate-600">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-16 text-center text-slate-600">
          <h2 className="text-2xl font-semibold text-[#0A1628]">No orders yet</h2>
          <p className="mt-3">Start shopping and your order history will appear here.</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Browse products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">{order.orderNumber}</p>
                  <h2 className="text-xl font-semibold text-[#0A1628]">Status: {order.status}</h2>
                </div>
                <p className="text-sm text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-slate-600">{order.items.length} item(s)</p>
                <p className="text-lg font-semibold text-[#0A1628]">{centsToCurrency(order.total)}</p>
                <Link href={`/account/orders/${order._id}`} className="rounded-full border border-[#C9A84C] px-5 py-3 text-sm font-semibold text-[#0A1628] transition hover:bg-[#C9A84C]/10">View order</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
