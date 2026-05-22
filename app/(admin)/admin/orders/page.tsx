import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";
import { connectDB } from "@/lib/mongodb";
import { centsToCurrency } from "@/lib/utils";
import OrderModel from "@/models/Order";

async function getOrders() {
  try {
    await connectDB();
    return OrderModel.find().sort({ createdAt: -1 }).limit(100).lean();
  } catch {
    return [];
  }
}

export default async function AdminOrdersPage() {
  await requireAdminPage();
  const orders = await getOrders();

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Manage orders</h1>
        <p className="mt-2 text-slate-600">View customer orders and update fulfillment status.</p>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order) => (
              <tr key={order._id.toString()}>
                <td className="px-6 py-4 font-semibold text-[#0A1628]">{order.orderNumber}</td>
                <td className="px-6 py-4 text-slate-600">{order.customerEmail}</td>
                <td className="px-6 py-4 text-slate-600">{order.status}</td>
                <td className="px-6 py-4 text-slate-600">{order.paymentStatus}</td>
                <td className="px-6 py-4 text-slate-900">{centsToCurrency(order.total)}</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/orders/${order._id.toString()}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-[#0A1628]">View</Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-600">No orders found, or MongoDB is currently offline.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
