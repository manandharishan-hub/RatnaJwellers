import Link from "next/link";
import { redirect } from "next/navigation";
import { Gem, Package, UserRound } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { UserDashboardClientSummary } from "@/components/dashboard/UserDashboardClientSummary";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/serverAuth";
import { formatOrderStatus, trackingStepIndex, trackingSteps } from "@/lib/orderStatus";
import { centsToCurrency } from "@/lib/utils";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/Product";

export const dynamic = "force-dynamic";

async function getDashboardData(userId: string) {
  try {
    await connectDB();
    const [orders, latestProducts] = await Promise.all([
      OrderModel.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean(),
      ProductModel.find({ isPublished: true }).sort({ createdAt: -1 }).limit(6).lean(),
    ]);
    return { orders, latestProducts, isOffline: false };
  } catch {
    return { orders: [], latestProducts: [], isOffline: true };
  }
}

export default async function UserDashboardPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");
  if (user.role === "admin") redirect("/admin/dashboard");

  const { orders, latestProducts, isOffline } = await getDashboardData(user.id);

  return (
    <div className="min-h-screen bg-[#F8F6F2] px-5 py-6 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <DashboardSidebar />
        <section>
        <div className="rounded-lg bg-[#0A1628] p-6 text-white md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#D8B35A]">User dashboard</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-serif text-4xl font-semibold">Welcome, {user.name || "jewellery lover"}.</h1>
              <p className="mt-2 max-w-2xl text-slate-300">View your Ratna orders, profile, cart, wishlist, and latest jewellery recommendations.</p>
            </div>
            <Link href="/shop" className="inline-flex items-center justify-center rounded-full bg-[#D8B35A] px-5 py-3 text-sm font-semibold text-[#0A1628] transition hover:bg-[#F1D17A]">
              Browse jewellery
            </Link>
          </div>
        </div>

        {isOffline && (
          <div className="mt-5 rounded-lg border border-[#D8B35A]/50 bg-[#FFF8E6] px-4 py-3 text-sm text-[#6F5217]">
            MongoDB is not reachable. Orders and recommendations will appear when the database connection is available.
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Link href="/account/profile" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#D8B35A] hover:bg-[#FBFAF7]">
            <UserRound className="text-[#9A7627]" size={22} />
            <p className="mt-3 font-semibold text-[#0A1628]">Profile summary</p>
            <p className="mt-1 break-words text-sm text-slate-600">{user.email || "Manage account"}</p>
          </Link>
          <Link href="/account/orders" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#D8B35A] hover:bg-[#FBFAF7]">
            <Package className="text-[#9A7627]" size={22} />
            <p className="mt-3 font-semibold text-[#0A1628]">My orders</p>
            <p className="mt-1 text-sm text-slate-600">{orders.length} recent {orders.length === 1 ? "order" : "orders"}</p>
          </Link>
          <UserDashboardClientSummary />
        </div>

        <div className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-7">
          {[
            { href: "/shop", label: "Continue shopping" },
            { href: "/cart", label: "View cart" },
            { href: "/account/orders", label: "My orders" },
            { href: "#order-tracking", label: "Track order" },
            { href: "/account/profile", label: "Edit profile" },
            { href: "/account/addresses", label: "Saved addresses" },
            { href: "/account/payment-methods", label: "Payment methods" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-[#0A1628] transition hover:border-[#D8B35A] hover:bg-[#FBFAF7]">
              {item.label}
            </Link>
          ))}
        </div>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div id="order-tracking" className="rounded-lg border border-slate-200 bg-white shadow-sm xl:col-span-2">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-sm font-semibold uppercase text-[#9A7627]">Order tracking</p>
              <h2 className="text-xl font-semibold text-[#0A1628]">Track your product status</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {orders.slice(0, 3).map((order: any) => {
                const activeStep = trackingStepIndex(order.status);
                return (
                  <Link key={`tracking-${order._id.toString()}`} href={`/account/orders/${order._id.toString()}`} className="block px-5 py-5 transition hover:bg-[#FBFAF7]">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-[#0A1628]">{order.orderNumber}</p>
                        <p className="text-sm text-slate-600">{formatOrderStatus(order.status)}{order.trackingNumber ? ` · Tracking: ${order.trackingNumber}` : ""}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#0A1628]">{centsToCurrency(order.total)}</p>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-4">
                      {trackingSteps.map((step, index) => (
                        <div key={step} className={`rounded-full px-3 py-2 text-center text-xs font-semibold ${activeStep >= index ? "bg-[#0A1628] text-white" : "bg-slate-100 text-slate-500"}`}>
                          {formatOrderStatus(step)}
                        </div>
                      ))}
                    </div>
                  </Link>
                );
              })}
              {orders.length === 0 && <div className="px-5 py-10 text-center text-slate-500">No orders to track yet.</div>}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-sm font-semibold uppercase text-[#9A7627]">My orders</p>
              <h2 className="text-xl font-semibold text-[#0A1628]">Recent purchases</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {orders.map((order: any) => (
                <Link key={order._id.toString()} href={`/account/orders/${order._id.toString()}`} className="grid gap-2 px-5 py-4 transition hover:bg-[#FBFAF7] sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-semibold text-[#0A1628]">{order.orderNumber}</p>
                    <p className="text-sm capitalize text-slate-600">{formatOrderStatus(order.status)} · {order.paymentStatus}</p>
                  </div>
                  <p className="font-semibold text-[#0A1628]">{centsToCurrency(order.total)}</p>
                </Link>
              ))}
              {orders.length === 0 && <div className="px-5 py-10 text-center text-slate-500">No orders yet. Start with the latest jewellery collection.</div>}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-sm font-semibold uppercase text-[#9A7627]">Recommended</p>
              <h2 className="text-xl font-semibold text-[#0A1628]">Latest jewellery</h2>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {latestProducts.map((product: any) => (
                <Link key={product._id.toString()} href={`/product/${product.slug}`} className="rounded-lg border border-slate-200 p-4 transition hover:border-[#D8B35A] hover:bg-[#FBFAF7]">
                  <Gem className="text-[#9A7627]" size={20} />
                  <p className="mt-3 font-semibold text-[#0A1628]">{product.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{product.material} · {product.gemstone}</p>
                  <p className="mt-2 text-sm font-semibold text-[#0A1628]">{centsToCurrency(product.price)}</p>
                </Link>
              ))}
              {latestProducts.length === 0 && <div className="col-span-full px-5 py-10 text-center text-slate-500">No jewellery products available yet.</div>}
            </div>
          </div>
        </section>
        </section>
      </div>
    </div>
  );
}

