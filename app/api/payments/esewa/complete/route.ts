import { NextResponse } from "next/server";
import { jsonError, firstZodMessage } from "@/lib/apiErrors";
import { buildOrderNumber, centsToCurrency } from "@/lib/utils";
import { centsToEsewaAmount, decodeEsewaResponse, getEsewaConfig, verifyEsewaResponseSignature } from "@/lib/esewa";
import { connectDB } from "@/lib/mongodb";
import { decreaseStockForOrder, priceOrderItems } from "@/lib/orderPricing";
import { getCurrentUser } from "@/lib/serverAuth";
import { serializeOrder } from "@/lib/dto";
import { orderCreateSchema } from "@/lib/validation";
import OrderModel from "@/models/Order";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const body = await request.json();
  const checkout = body?.checkout;
  const data = typeof body?.data === "string" ? body.data : "";

  if (!data) {
    return jsonError("Missing eSewa response data.", 400);
  }

  let esewaPayload;
  try {
    esewaPayload = decodeEsewaResponse(data);
  } catch {
    return jsonError("Invalid eSewa response data.", 400);
  }

  const config = getEsewaConfig();
  if (!verifyEsewaResponseSignature(esewaPayload, config.secretKey)) {
    return jsonError("eSewa payment signature could not be verified.", 400);
  }
  if (esewaPayload.status !== "COMPLETE") {
    return jsonError("eSewa payment is not complete.", 402);
  }
  if (esewaPayload.product_code !== config.productCode) {
    return jsonError("Invalid eSewa product code.", 400);
  }

  const parsed = orderCreateSchema.safeParse({
    ...checkout,
    paymentMethod: "esewa",
    paymentStatus: "paid",
    status: "processing",
    transactionId: esewaPayload.transaction_code || esewaPayload.transaction_uuid || "",
    cardLast4: "",
  });

  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid checkout data."), 400);
  }
  if (!parsed.data.shippingAddress.email && !user?.email) {
    return jsonError("Customer email is required to create an order.", 400);
  }
  if (checkout?.transactionUuid !== esewaPayload.transaction_uuid) {
    return jsonError("eSewa transaction does not match this checkout.", 400);
  }

  await connectDB();
  let pricedOrder;
  try {
    pricedOrder = await priceOrderItems(parsed.data.items);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to price order.";
    return jsonError(message, 400);
  }

  const expectedTotalAmount = centsToEsewaAmount(pricedOrder.total);
  if (Number(esewaPayload.total_amount) !== Number(expectedTotalAmount)) {
    return jsonError(`eSewa amount does not match order total ${centsToCurrency(pricedOrder.total)}.`, 400);
  }

  const transactionId = esewaPayload.transaction_code || esewaPayload.transaction_uuid || parsed.data.transactionId;
  const existingOrder = await OrderModel.findOne({ paymentMethod: "esewa", transactionId }).lean();
  if (existingOrder) {
    return NextResponse.json({ orderId: existingOrder._id.toString(), order: serializeOrder(existingOrder) });
  }

  const order = await OrderModel.create({
    user: user?.id ?? null,
    customerEmail: user?.email ?? parsed.data.shippingAddress.email!,
    orderNumber: buildOrderNumber(),
    items: pricedOrder.orderItems,
    shippingAddress: parsed.data.shippingAddress,
    billingAddress: parsed.data.billingAddress,
    paymentMethod: "esewa",
    paymentStatus: "paid",
    stripePaymentId: "",
    transactionId,
    cardLast4: "",
    shippingMethod: "Standard",
    shippingCost: pricedOrder.shippingCost,
    subtotal: pricedOrder.subtotal,
    tax: pricedOrder.tax,
    discount: pricedOrder.discount,
    total: pricedOrder.total,
    couponCode: "",
    status: "processing",
    statusHistory: [{ status: "processing", timestamp: new Date(), note: "Order created after verified eSewa payment" }],
  });

  try {
    await decreaseStockForOrder(pricedOrder.orderItems);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update stock.";
    return jsonError(message, 409);
  }

  return NextResponse.json({ orderId: order._id.toString(), order: serializeOrder(order.toObject()) }, { status: 201 });
}
