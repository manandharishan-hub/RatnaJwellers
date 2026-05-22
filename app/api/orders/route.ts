import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser, isAdmin } from "@/lib/serverAuth";
import { buildOrderNumber } from "@/lib/utils";
import { jsonError, firstZodMessage } from "@/lib/apiErrors";
import { serializeOrder } from "@/lib/dto";
import { orderCreateSchema } from "@/lib/validation";
import { decreaseStockForOrder, priceOrderItems } from "@/lib/orderPricing";
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
  const user = await getCurrentUser();
  const data = await request.json();
  const parsed = orderCreateSchema.safeParse(data);
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid order data."), 400);
  }

  const { shippingAddress, billingAddress, items, paymentMethod, paymentStatus, stripePaymentId, transactionId, cardLast4, status } = parsed.data;
  if (!shippingAddress.email && !user?.email) {
    return jsonError("Customer email is required to create an order.", 400);
  }

  await connectDB();
  let pricedOrder;
  try {
    pricedOrder = await priceOrderItems(items);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to price order.";
    return jsonError(message, 400);
  }

  if (paymentMethod === "debit_card" && paymentStatus === "paid") {
    if (!transactionId || !cardLast4) {
      return jsonError("Safe debit card payment details are required.", 400);
    }
  }

  if (paymentMethod === "esewa") {
    return jsonError("Use the eSewa payment verification endpoint to create eSewa orders.", 400);
  }

  if ((paymentMethod === "Stripe" || paymentMethod === "stripe") && paymentStatus === "paid") {
    if (!stripePaymentId) return jsonError("Stripe payment id is required for paid orders.", 400);
    try {
      const { stripe } = await import("@/lib/stripe");
      const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId);
      if (paymentIntent.status !== "succeeded" || paymentIntent.amount < pricedOrder.total) {
        return jsonError("Payment could not be verified.", 402);
      }
    } catch {
      return jsonError("Payment could not be verified.", 402);
    }
  }

  const order = await OrderModel.create({
    user: user?.id ?? null,
    customerEmail: user?.email ?? shippingAddress.email!,
    orderNumber: buildOrderNumber(),
    items: pricedOrder.orderItems,
    shippingAddress,
    billingAddress,
    paymentMethod,
    paymentStatus,
    stripePaymentId,
    transactionId,
    cardLast4,
    shippingMethod: "Standard",
    shippingCost: pricedOrder.shippingCost,
    subtotal: pricedOrder.subtotal,
    tax: pricedOrder.tax,
    discount: pricedOrder.discount,
    total: pricedOrder.total,
    couponCode: "",
    status,
    statusHistory: [{ status: status || "pending", timestamp: new Date(), note: "Order created" }],
  });

  if (order.paymentStatus === "paid") {
    try {
      await decreaseStockForOrder(pricedOrder.orderItems);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update stock.";
      return jsonError(message, 409);
    }
  }

  return NextResponse.json({ orderId: order._id.toString(), order: serializeOrder(order.toObject()) }, { status: 201 });
}
