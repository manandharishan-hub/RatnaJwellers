import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/serverAuth";
import { connectDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";
import { centsToCurrency } from "@/lib/utils";
import { formatOrderStatus } from "@/lib/orderStatus";

async function getOrders(userId: string) {
  await connectDB();
  return OrderModel.find({ user: userId }).sort({ createdAt: -1 }).lean();
}

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();
  if (!user?.id) {
    redirect("/login");
  }
  const orders = await getOrders(user.id);

  return (
    <div className="page-shell space-y-8">
      <div>
        <p className="eyebrow">My orders</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#0A1628]">Order history</h1>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state text-slate-600">
          <p className="text-lg font-semibold text-[#0A1628]">No orders yet.</p>
          <p className="mt-3">Once you place an order, you&apos;ll see the full order timeline here.</p>
          <Link href="/shop" className="lux-button-primary mt-6">Browse products</Link>
        </div>
      ) : (
        <div className="admin-surface">
          <div className="overflow-x-auto">
          <table className="min-w-[720px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Order</th>
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
                  <td className="px-6 py-4 text-slate-600">{formatOrderStatus(order.status)}</td>
                  <td className="px-6 py-4 text-slate-600">{order.paymentStatus}</td>
                  <td className="px-6 py-4 text-slate-900">{centsToCurrency(order.total)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/account/orders/${order._id.toString()}`} className="lux-button-secondary px-4 py-2">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
