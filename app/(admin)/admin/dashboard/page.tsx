import { connectDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";
import UserModel from "@/models/User";
import ProductModel from "@/models/Product";

type DashboardOrder = {
  _id: any;
  orderNumber: string;
  status: string;
  totalAmount: number;
};

async function getDashboardStats() {
  await connectDB();
  const totalRevenueAgg = await OrderModel.aggregate([
    { $match: { paymentStatus: "Paid" } },
    { $group: { _id: null, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
  ]);
  const totalRevenue = totalRevenueAgg?.[0]?.revenue ?? 0;
  const totalOrders = totalRevenueAgg?.[0]?.orders ?? 0;
  const totalCustomers = await UserModel.countDocuments({});
  const totalProducts = await ProductModel.countDocuments();
  const recentOrders = await OrderModel.find().sort({ createdAt: -1 }).limit(5).lean() as unknown as DashboardOrder[];
  return { totalRevenue, totalOrders, totalCustomers, totalProducts, recentOrders };
}

export default async function AdminDashboardPage() {
  const { totalRevenue, totalOrders, totalCustomers, totalProducts, recentOrders } = await getDashboardStats();

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Admin dashboard</h1>
        <p className="mt-2 text-slate-600">Overview of store performance and recent orders.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Revenue", value: `$${(totalRevenue / 100).toFixed(2)}` },
          { label: "Orders", value: `${totalOrders}` },
          { label: "Customers", value: `${totalCustomers}` },
          { label: "Products", value: `${totalProducts}` },
        ].map((card) => (
          <div key={card.label} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-[#C9A84C]">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold text-[#0A1628]">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-[#0A1628]">Recent orders</h2>
        <div className="mt-6 space-y-4">
          {recentOrders.map((order) => (
            <div key={order._id.toString()} className="flex flex-col gap-3 rounded-3xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[#0A1628]">{order.orderNumber}</p>
                <p className="text-sm text-slate-600">{order.status}</p>
              </div>
              <p className="text-sm text-slate-700">${(order.totalAmount / 100).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
