import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser, isAdmin, requireUser } from "@/lib/serverAuth";
import { jsonError, firstZodMessage } from "@/lib/apiErrors";
import { serializeOrder } from "@/lib/dto";
import { orderCreateSchema } from "@/lib/validation";
import OrderModel from "@/models/Order";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  await connectDB();
  const query = isAdmin(user) ? {} : { user: user.id };
  const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders.map(serializeOrder));
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const data = await request.json();
  const parsed = orderCreateSchema.safeParse(data);
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid order data."), 400);
  }

  const { shippingAddress } = parsed.data;
  if (!shippingAddress.email && !user?.email) {
    return jsonError("Customer email is required to create an order.", 400);
  }

  return jsonError("Use the eSewa payment verification endpoint to create orders.", 400);
}
