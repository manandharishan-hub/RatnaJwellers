import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { requireAdminPage } from "@/lib/adminGuard";
import { connectDB } from "@/lib/mongodb";
import { centsToCurrency } from "@/lib/utils";
import OrderModel from "@/models/Order";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getOrder(id: string) {
  await connectDB();
  return OrderModel.findById(id).lean();
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  await requireAdminPage();
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div className="grid gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1fr_360px] lg:px-16">
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Order detail</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#0A1628]">{order.orderNumber}</h1>
          <p className="mt-2 text-slate-600">{order.customerEmail}</p>
        </div>

        <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 text-sm shadow-sm md:grid-cols-2">
          <div className="flex justify-between gap-4"><span className="text-slate-500">Status</span><strong>{order.status}</strong></div>
          <div className="flex justify-between gap-4"><span className="text-slate-500">Payment</span><strong>{order.paymentStatus}</strong></div>
          <div className="flex justify-between gap-4"><span className="text-slate-500">Total</span><strong>{centsToCurrency(order.total)}</strong></div>
          <div className="flex justify-between gap-4"><span className="text-slate-500">Tracking</span><strong>{order.trackingNumber || "Not set"}</strong></div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0A1628]">Items</h2>
          <div className="mt-5 space-y-4">
            {order.items.map((item) => (
              <div key={`${item.product.toString()}-${item.variant}`} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-[#0A1628]">{item.name}</p>
                  <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold text-slate-900">{centsToCurrency(item.price)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0A1628]">Status history</h2>
          <div className="mt-5 space-y-3">
            {order.statusHistory.map((entry, index) => (
              <div key={`${entry.status}-${index}`} className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex justify-between gap-4">
                  <strong className="text-[#0A1628]">{entry.status}</strong>
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                {entry.note && <p className="mt-2 text-slate-600">{entry.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <OrderStatusForm orderId={order._id.toString()} currentStatus={order.status} trackingNumber={order.trackingNumber} />
    </div>
  );
}
