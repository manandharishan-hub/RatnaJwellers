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
    { label: "Total Sales", value: centsToCurrency(stats.totalRevenue), icon: TrendingUp, color: "from-green-500 to-emerald-500" },
    { label: "Total Orders", value: stats.totalOrders.toString(), icon: ReceiptText, color: "from-blue-500 to-cyan-500" },
    { label: "Active Customers", value: stats.totalUsers.toString(), icon: Users, color: "from-purple-500 to-pink-500" },
    { label: "Products", value: stats.totalProducts.toString(), icon: Gem, color: "from-yellow-500 to-orange-500" },
    { label: "Pending Orders", value: stats.pendingOrders.toString(), icon: Clock, color: "from-orange-500 to-red-500" },
    { label: "Low Stock Alerts", value: stats.lowStockCount.toString(), icon: AlertCircle, color: "from-red-500 to-pink-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here is your store performance.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PackagePlus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`bg-linear-to-br ${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-500">Latest checkout activity</p>
            </div>
            <Link href="/admin/orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Order ID</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentOrders.map((order: any) => (
                  <tr key={order._id.toString()} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{order.customerEmail}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "delivered" ? "bg-green-100 text-green-800" :
                        order.status === "shipped" ? "bg-blue-100 text-blue-800" :
                        order.status === "processing" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{centsToCurrency(order.total)}</td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
            <p className="text-sm text-gray-500">Products below 5 units</p>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {stats.lowStockProducts.map((product: any) => (
              <div key={product._id.toString()} className="p-6 hover:bg-gray-50 transition-colors">
                <p className="font-medium text-gray-900">{product.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">{product.material}</p>
                  <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                    {product.totalStock} left
                  </span>
                </div>
              </div>
            ))}
            {stats.lowStockProducts.length === 0 && (
              <div className="p-6 text-center text-gray-500">No low stock items</div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Deliveries */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/orders?status=pending" className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
            <Clock className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">Pending Orders</p>
            <p className="text-sm text-gray-500">{stats.pendingOrders} orders waiting</p>
          </Link>
          <Link href="/admin/products" className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors">
            <Gem className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">All Products</p>
            <p className="text-sm text-gray-500">{stats.totalProducts} in catalog</p>
          </Link>
          <Link href="/admin/users" className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors">
            <Users className="w-6 h-6 text-purple-600 mb-2" />
            <p className="font-medium text-gray-900">Customers</p>
            <p className="text-sm text-gray-500">{stats.totalUsers} registered</p>
          </Link>
          <Link href="/admin/analytics" className="p-4 border border-gray-200 rounded-lg hover:bg-orange-50 transition-colors">
            <BarChart3 className="w-6 h-6 text-orange-600 mb-2" />
            <p className="font-medium text-gray-900">Analytics</p>
            <p className="text-sm text-gray-500">View reports</p>
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
