import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/serverAuth";
import { connectDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";
import { centsToCurrency } from "@/lib/utils";

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
    <div className="space-y-8 px-6 py-10 md:px-10 lg:px-16">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">My orders</p>
        <h1 className="text-3xl font-semibold text-[#0A1628]">Order history</h1>
      </div>
      {orders.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm text-slate-600">
          <p className="text-lg font-semibold text-[#0A1628]">No orders yet.</p>
          <p className="mt-3">Once you place an order, you&apos;ll see the full order timeline here.</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Browse products</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
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
                  <td className="px-6 py-4 text-slate-600">{order.status}</td>
                  <td className="px-6 py-4 text-slate-600">{order.paymentStatus}</td>
                  <td className="px-6 py-4 text-slate-900">{centsToCurrency(order.total)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/account/orders/${order._id.toString()}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-[#0A1628]">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
