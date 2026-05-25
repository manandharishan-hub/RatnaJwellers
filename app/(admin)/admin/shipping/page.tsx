import { AdminLayout } from "@/components/admin/AdminLayout";
import { ShippingManager } from "@/components/admin/ShippingManager";
import { requireAdminPage } from "@/lib/adminGuard";
import { connectDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

export const dynamic = "force-dynamic";

function serializeOrder(order: any) {
  return {
    _id: order._id.toString(),
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerName: `${order.shippingAddress?.firstName ?? ""} ${order.shippingAddress?.lastName ?? ""}`.trim(),
    status: order.status,
    trackingNumber: order.trackingNumber || "",
    shippingMethod: order.shippingMethod || "Standard",
    updatedAt: order.updatedAt?.toISOString?.() ?? order.updatedAt,
  };
}

async function getOrders() {
  try {
    await connectDB();
    const orders = await OrderModel.find().sort({ createdAt: -1 }).limit(100).lean();
    return orders.map(serializeOrder);
  } catch {
    return [];
  }
}

export default async function ShippingPage() {
  await requireAdminPage();
  const orders = await getOrders();
  return (
    <AdminLayout>
      <ShippingManager initialOrders={orders} />
    </AdminLayout>
  );
}
