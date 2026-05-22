import { connectDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

interface OrderPageProps {
  params: { id: string };
}

async function getOrder(id: string) {
  await connectDB();
  return OrderModel.findOne({ _id: id }).lean();
}

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const order = await getOrder(params.id);
  if (!order) {
    return (
      <div className="px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Order not found</h1>
        <p className="mt-3 text-slate-600">Please contact customer support if you need help with your purchase.</p>
      </div>
    );
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
          <div className="flex justify-between"><span>Total</span><strong>${(order.total / 100).toFixed(2)}</strong></div>
        </div>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.product.toString()} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4">
              <div>
                <p className="font-semibold text-[#0A1628]">{item.name}</p>
                <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
              </div>
              <p className="font-semibold text-[#0A1628]">${(item.price / 100).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
