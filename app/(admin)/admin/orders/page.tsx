import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";
import { connectDB } from "@/lib/mongodb";
import { centsToCurrency } from "@/lib/utils";
import OrderModel from "@/models/Order";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Search, Eye } from "lucide-react";

async function getOrders() {
  try {
    await connectDB();
    return OrderModel.find().sort({ createdAt: -1 }).limit(100).lean();
  } catch {
    return [];
  }
}

function orderStatusClass(status: string) {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-[#EAF3FF] text-[#1D4E89]";
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "pending":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function paymentStatusClass(status: string) {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function OrdersContent({ orders }: { orders: any[] }) {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Order Management</h1>
          <p className="admin-muted">View, manage, and update order statuses and tracking information.</p>
        </div>
      </div>

      <div className="surface-panel flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by order ID or customer email..." className="lux-input pl-10" />
        </div>
        <button className="lux-button-secondary rounded-lg px-4 py-2">Filter</button>
      </div>

      <div className="admin-surface">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No orders found</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id.toString()}>
                    <td className="font-medium text-slate-950">{order.orderNumber}</td>
                    <td>{order.customerEmail}</td>
                    <td>
                      <span className={`status-pill ${orderStatusClass(order.status)}`}>{titleCase(order.status)}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${paymentStatusClass(order.paymentStatus)}`}>{titleCase(order.paymentStatus)}</span>
                    </td>
                    <td className="font-medium text-slate-950">{centsToCurrency(order.total)}</td>
                    <td>
                      <Link href={`/admin/orders/${order._id.toString()}`} className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-[#0A1628] transition-colors hover:border-[#D8B35A] hover:bg-[#FBFAF7]">
                        <Eye className="h-3 w-3" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-slate-600">Total Orders</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{orders.length}</p>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-slate-600">Pending</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{orders.filter((order) => order.status === "pending").length}</p>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-slate-600">Processing</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{orders.filter((order) => order.status === "processing").length}</p>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-slate-600">Delivered</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{orders.filter((order) => order.status === "delivered").length}</p>
        </div>
      </div>
    </div>
  );
}

export default async function AdminOrdersPage() {
  await requireAdminPage();
  const orders = await getOrders();

  return (
    <AdminLayout>
      <OrdersContent orders={orders} />
    </AdminLayout>
  );
}
