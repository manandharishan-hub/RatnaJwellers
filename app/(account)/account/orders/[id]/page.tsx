import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/serverAuth";
import OrderModel from "@/models/Order";
import { centsToCurrency } from "@/lib/utils";
import { formatOrderStatus, trackingStepIndex, trackingSteps } from "@/lib/orderStatus";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getOrder(id: string) {
  await connectDB();
  return OrderModel.findById(id).lean();
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await getCurrentUser();
  if (!user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    notFound();
  }
  if (order.user?.toString() !== user.id) {
    notFound();
  }

  return (
    <div className="px-6 py-16 md:px-10 lg:px-16">
      <div className="max-w-4xl space-y-6 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Order #{order.orderNumber}</h1>
        <p className="text-slate-600">Status: {formatOrderStatus(order.status)}</p>
        {order.trackingNumber && <p className="text-slate-600">Tracking: {order.trackingNumber}</p>}
        <div className="grid gap-2 sm:grid-cols-4">
          {trackingSteps.map((step, index) => (
            <div key={step} className={`rounded-full px-3 py-2 text-center text-xs font-semibold ${trackingStepIndex(order.status) >= index ? "bg-[#0A1628] text-white" : "bg-slate-100 text-slate-500"}`}>
              {formatOrderStatus(step)}
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.product.toString()} className="flex justify-between rounded-3xl border border-slate-200 p-4">
              <div>
                <p className="font-semibold text-[#0A1628]">{item.name}</p>
                <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
              </div>
              <p className="text-slate-900">{centsToCurrency(item.price)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
