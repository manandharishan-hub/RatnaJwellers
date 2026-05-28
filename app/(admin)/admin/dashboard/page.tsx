import Link from "next/link";
import { ArrowRight, Gem, PackagePlus, ReceiptText, TrendingUp, Users, AlertCircle, Clock, BarChart3 } from "lucide-react";
import { requireAdminPage } from "@/lib/adminGuard";
import { connectDB } from "@/lib/mongodb";
import { centsToCurrency } from "@/lib/utils";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/Product";
import UserModel from "@/models/User";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const dynamic = "force-dynamic";

async function getAdminStats() {
  try {
    await connectDB();
    const [revenueAgg, totalUsers, totalProducts, totalOrders, pendingOrders, recentOrders, lowStockProducts, lowStockCount] = await Promise.all([
      OrderModel.aggregate([
        { $match: { paymentStatus: { $in: ["paid", "completed"] } } },
        { $group: { _id: null, revenue: { $sum: "$total" } } },
      ]),
      UserModel.countDocuments({ role: { $ne: "admin" } }),
      ProductModel.countDocuments(),
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ status: { $in: ["pending", "processing"] } }),
      OrderModel.find().sort({ createdAt: -1 }).limit(6).lean(),
      ProductModel.find({ totalStock: { $lte: 5 } }).populate("category", "name").sort({ totalStock: 1 }).limit(6).lean(),
      ProductModel.countDocuments({ totalStock: { $lte: 5 } }),
    ]);

    return {
      isOffline: false,
      totalRevenue: revenueAgg?.[0]?.revenue ?? 0,
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      recentOrders,
      lowStockProducts,
      lowStockCount,
    };
  } catch {
    return {
      isOffline: true,
      totalRevenue: 0,
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      recentOrders: [],
      lowStockProducts: [],
      lowStockCount: 0,
    };
  }
}

function DashboardContent({ stats }: { stats: Awaited<ReturnType<typeof getAdminStats>> }) {
  const statCards = [
    { label: "Total Sales", value: centsToCurrency(stats.totalRevenue), icon: TrendingUp },
    { label: "Total Orders", value: stats.totalOrders.toString(), icon: ReceiptText },
    { label: "Active Customers", value: stats.totalUsers.toString(), icon: Users },
    { label: "Products", value: stats.totalProducts.toString(), icon: Gem },
    { label: "Pending Orders", value: stats.pendingOrders.toString(), icon: Clock },
    { label: "Low Stock Alerts", value: stats.lowStockCount.toString(), icon: AlertCircle },
  ];

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Dashboard Overview</h1>
          <p className="admin-muted">Welcome back! Here is your store performance.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="lux-button-primary"
        >
          <PackagePlus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="surface-card p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{card.value}</p>
                </div>
                <div className="rounded-lg bg-[#0A1628] p-3 text-[#D8B35A]">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="admin-surface lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Recent Orders</h2>
              <p className="text-sm text-slate-500">Latest checkout activity</p>
            </div>
            <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-[#0A1628] hover:text-[#9A7627]">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: any) => (
                  <tr key={order._id.toString()} className="hover:bg-gray-50">
                    <td className="font-medium text-slate-950">{order.orderNumber}</td>
                    <td>{order.customerEmail}</td>
                    <td>
                      <span className={`status-pill ${
                        order.status === "delivered" ? "bg-green-100 text-green-800" :
                        order.status === "shipped" ? "bg-blue-100 text-blue-800" :
                        order.status === "processing" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="font-medium text-slate-950">{centsToCurrency(order.total)}</td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500">No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="admin-surface">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-950">Low Stock Alerts</h2>
            <p className="text-sm text-slate-500">Products below 5 units</p>
          </div>
          <div className="max-h-96 divide-y divide-slate-200 overflow-y-auto">
            {stats.lowStockProducts.map((product: any) => (
              <div key={product._id.toString()} className="p-6 transition-colors hover:bg-[#FBFAF7]">
                <p className="font-medium text-slate-950">{product.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-slate-500">{product.material}</p>
                  <span className="status-pill bg-red-100 text-red-800">
                    {product.totalStock} left
                  </span>
                </div>
              </div>
            ))}
            {stats.lowStockProducts.length === 0 && (
              <div className="p-6 text-center text-slate-500">No low stock items</div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Deliveries */}
      <div className="surface-panel">
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/orders?status=pending" className="interactive-card">
            <Clock className="mb-2 h-6 w-6 text-[#9A7627]" />
            <p className="font-medium text-slate-950">Pending Orders</p>
            <p className="text-sm text-slate-500">{stats.pendingOrders} orders waiting</p>
          </Link>
          <Link href="/admin/products" className="interactive-card">
            <Gem className="mb-2 h-6 w-6 text-[#9A7627]" />
            <p className="font-medium text-slate-950">All Products</p>
            <p className="text-sm text-slate-500">{stats.totalProducts} in catalog</p>
          </Link>
          <Link href="/admin/users" className="interactive-card">
            <Users className="mb-2 h-6 w-6 text-[#9A7627]" />
            <p className="font-medium text-slate-950">Customers</p>
            <p className="text-sm text-slate-500">{stats.totalUsers} registered</p>
          </Link>
          <Link href="/admin/analytics" className="interactive-card">
            <BarChart3 className="mb-2 h-6 w-6 text-[#9A7627]" />
            <p className="font-medium text-slate-950">Analytics</p>
            <p className="text-sm text-slate-500">View reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const stats = await getAdminStats();

  return (
    <AdminLayout>
      <DashboardContent stats={stats} />
    </AdminLayout>
  );
}
