import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/Product";
import { getAuthToken, isAdminRole } from "@/lib/adminAuth";

async function restoreStock(order: any) {
  for (const item of order.items) {
    const product = await ProductModel.findById(item.product);
    if (!product) continue;
    if (item.variant) {
      const variant = product.variants?.find((variant) => variant.size === item.variant);
      if (variant) {
        variant.stock += item.quantity;
      }
    }
    product.totalStock += item.quantity;
    await product.save();
  }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const token = await getAuthToken(request);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const order = await OrderModel.findById((await params).id).lean();
  if (!order) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  if (!isAdminRole(token.role) && order.user?.toString() !== token.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const token = await getAuthToken(request);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const order = await OrderModel.findById((await params).id);
  if (!order) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  if (!isAdminRole(token.role) && order.user?.toString() !== token.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const update = await request.json();
  const allowed = ["status", "trackingNumber", "notes", "paymentStatus"] as const;
  let statusChanged = false;

  for (const key of allowed) {
    const newValue = (update as any)[key];
    const currentValue = (order as any)[key];

    if (newValue !== undefined && newValue !== currentValue) {
      if (key === "status") {
        statusChanged = true;
        order.statusHistory.push({ status: newValue, timestamp: new Date(), note: "Status updated" });
      }
      (order as any)[key] = newValue;
    }
  }

  if (statusChanged && order.status === "cancelled" && order.paymentStatus === "paid") {
    await restoreStock(order);
  }

  await order.save();
  return NextResponse.json(order);
}
