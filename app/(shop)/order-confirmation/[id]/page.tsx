import Link from "next/link";
import { notFound } from "next/navigation";
import { Package, ShoppingBag } from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/serverAuth";
import { centsToCurrency } from "@/lib/utils";
import OrderModel from "@/models/Order";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

async function getOrder(id: string) {
  await connectDB();
  return OrderModel.findOne({ _id: id }).lean();
}

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const user = await getCurrentUser();

  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    notFound();
  }
  if (order.user && order.user.toString() !== user?.id) {
    notFound();
  }

  return (
    <div className="px-6 py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-3xl space-y-8 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Order confirmed</p>
          <h1 className="text-3xl font-semibold text-[#0A1628]">Thank you for your purchase</h1>
          <p className="text-slate-600">Your order number is <span className="font-semibold text-[#0A1628]">{order.orderNumber}</span>.</p>
        </div>
        <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
          <div className="flex justify-between"><span>Order status</span><strong>{order.status}</strong></div>
          <div className="flex justify-between"><span>Payment</span><strong>{order.paymentStatus}</strong></div>
          <div className="flex justify-between"><span>Shipping method</span><strong>{order.shippingMethod}</strong></div>
          <div className="flex justify-between"><span>Total</span><strong>{centsToCurrency(order.total)}</strong></div>
        </div>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={`${item.product.toString()}-${item.variant ?? "standard"}-${index}`} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4">
              <div>
                <p className="font-semibold text-[#0A1628]">{item.name}</p>
                <p className="text-sm text-slate-600">Quantity: {item.quantity}{item.variant ? ` · ${item.variant}` : ""}</p>
              </div>
              <p className="font-semibold text-[#0A1628]">{centsToCurrency(item.price)}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/account/orders" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#D8B35A]">
            <Package size={16} />
            Track order
          </Link>
          <Link href="/shop" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0A1628] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
            <ShoppingBag size={16} />
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
