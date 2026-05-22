import { connectDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

async function getOrders() {
  await connectDB();
  return OrderModel.find().sort({ createdAt: -1 }).limit(50).lean();
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0A1628]">Orders</h1>
          <p className="text-slate-600">Track and review recent store orders and fulfillment progress.</p>
        </div>
        <div className="rounded-full bg-[#F7F1D1] px-4 py-2 text-sm font-semibold text-[#0A1628]">
          {orders.length} recent orders
        </div>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Order #</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {orders.map((order) => (
              <tr key={order._id.toString()}>
                <td className="px-6 py-4 font-medium text-slate-900">{order.orderNumber}</td>
                <td className="px-6 py-4">{order.status}</td>
                <td className="px-6 py-4">{order.paymentStatus}</td>
                <td className="px-6 py-4">${(order.total / 100).toFixed(2)}</td>
                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
