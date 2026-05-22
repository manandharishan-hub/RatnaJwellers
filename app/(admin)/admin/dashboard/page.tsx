import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Boxes, Gem, PackagePlus, ReceiptText, TrendingUp, Users } from "lucide-react";
import { requireAdminPage } from "@/lib/adminGuard";
import { connectDB } from "@/lib/mongodb";
import { centsToCurrency } from "@/lib/utils";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/Product";
import UserModel from "@/models/User";

export const dynamic = "force-dynamic";

async function getAdminStats() {
  try {
    await connectDB();
    const [revenueAgg, totalUsers, totalProducts, totalOrders, pendingOrders, recentOrders, lowStockProducts, lowStockCount] = await Promise.all([
      OrderModel.aggregate([
        { $match: { paymentStatus: "paid" } },
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

const adminLinks = [
  { href: "/admin/products", label: "Product management", icon: Gem },
  { href: "/admin/orders", label: "Order management", icon: ReceiptText },
  { href: "/admin/users", label: "User management", icon: Users },
];

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const stats = await getAdminStats();
  const statCards = [
    { label: "Total users", value: stats.totalUsers.toString(), icon: Users },
    { label: "Jewellery products", value: stats.totalProducts.toString(), icon: Gem },
    { label: "Total orders", value: stats.totalOrders.toString(), icon: ReceiptText },
    { label: "Revenue", value: centsToCurrency(stats.totalRevenue), icon: TrendingUp },
    { label: "Pending orders", value: stats.pendingOrders.toString(), icon: PackagePlus },
    { label: "Low-stock products", value: stats.lowStockCount.toString(), icon: Boxes },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F2]">
      <div className="grid lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-slate-200 bg-white px-5 py-5 lg:min-h-screen lg:border-b-0 lg:border-r">
          <Link href="/admin/dashboard" aria-label="Ratna admin dashboard" className="inline-flex items-center gap-3">
            <Image src="/logo.png" alt="Ratna Jewels" width={112} height={42} className="h-8 w-auto object-contain" />
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0A1628]">Admin</span>
          </Link>
          <nav className="mt-8 grid gap-2">
            {adminLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#FBFAF7] hover:text-[#9A7627]">
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="px-5 py-6 md:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9A7627]">Admin dashboard</p>
              <h1 className="mt-2 font-serif text-4xl font-semibold text-[#0A1628]">Jewellery store overview</h1>
              <p className="mt-2 text-slate-600">Live users, jewellery products, orders, stock, and sales from MongoDB.</p>
            </div>
            <Link href="/admin/products/new" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0A1628] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
              <PackagePlus size={17} />
              Add jewellery
            </Link>
          </header>

          {stats.isOffline && (
            <div className="mt-5 rounded-lg border border-[#D8B35A]/50 bg-[#FFF8E6] px-4 py-3 text-sm text-[#6F5217]">
              MongoDB is not reachable. Statistics will populate automatically when the database connection is available.
            </div>
          )}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1628] text-[#D8B35A]">
                      <Icon size={19} />
                    </span>
                  </div>
                  <p className="mt-5 text-3xl font-semibold text-[#0A1628]">{card.value}</p>
                </article>
              );
            })}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold uppercase text-[#9A7627]">Recent orders</p>
                  <h2 className="text-xl font-semibold text-[#0A1628]">Latest checkout activity</h2>
                </div>
                <Link href="/admin/orders" className="hidden items-center gap-2 text-sm font-semibold text-[#0A1628] sm:inline-flex">
                  Manage
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {stats.recentOrders.map((order: any) => (
                      <tr key={order._id.toString()}>
                        <td className="px-5 py-4 font-semibold text-[#0A1628]">{order.orderNumber}</td>
                        <td className="px-5 py-4 text-slate-600">{order.customerEmail}</td>
                        <td className="px-5 py-4 capitalize text-slate-600">{order.status}</td>
                        <td className="px-5 py-4 text-slate-600">{centsToCurrency(order.total)}</td>
                      </tr>
                    ))}
                    {stats.recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-slate-500">No orders available yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-sm font-semibold uppercase text-[#9A7627]">Inventory</p>
                <h2 className="text-xl font-semibold text-[#0A1628]">Low-stock jewellery</h2>
              </div>
              <div className="divide-y divide-slate-200">
                {stats.lowStockProducts.map((product: any) => (
                  <div key={product._id.toString()} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="font-semibold text-[#0A1628]">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.material} · {product.gemstone}</p>
                    </div>
                    <span className="rounded-full bg-[#FFF8E6] px-3 py-1 text-sm font-semibold text-[#6F5217]">{product.totalStock} left</span>
                  </div>
                ))}
                {stats.lowStockProducts.length === 0 && <div className="px-5 py-10 text-center text-slate-500">No low-stock items.</div>}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase text-[#9A7627]">Management</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {adminLinks.map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#D8B35A] hover:bg-[#FBFAF7]">
                  {item.label}
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
