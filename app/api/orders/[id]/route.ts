import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser, isAdmin, requireAdmin } from "@/lib/serverAuth";
import { orderStatusSchema } from "@/lib/validation";
import { firstZodMessage, jsonError } from "@/lib/apiErrors";
import { serializeOrder } from "@/lib/dto";
import OrderModel from "@/models/Order";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return jsonError("Authentication required.", 401);
  }

  const params = await context.params;
  await connectDB();
  const order = await OrderModel.findById(params.id).lean();
  if (!order) {
    return jsonError("Order not found.", 404);
  }
  if (!isAdmin(user) && order.user?.toString() !== user.id) {
    return jsonError("Order not found.", 404);
  }
  return NextResponse.json(serializeOrder(order));
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const params = await context.params;
  const data = await request.json();
  const parsed = orderStatusSchema.safeParse(data);
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid order status."), 400);
  }

  await connectDB();
  const order = await OrderModel.findById(params.id);
  if (!order) {
    return jsonError("Order not found.", 404);
  }

  const { status, trackingNumber, note } = parsed.data;
  order.status = status;
  if (typeof trackingNumber === "string") {
    order.trackingNumber = trackingNumber;
  }
  order.statusHistory.push({ status, timestamp: new Date(), note: note ?? "Status updated by admin" });
  await order.save();
  return NextResponse.json(serializeOrder(order.toObject()));
}
