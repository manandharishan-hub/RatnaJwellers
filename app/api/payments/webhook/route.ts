import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ message: "Stripe webhook secret is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ message: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ message: `Webhook signature verification failed: ${error}` }, { status: 400 });
  }

  await connectDB();

  try {
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as any;
      const order = await OrderModel.findOne({ stripePaymentId: intent.id });
      if (order) {
        order.paymentStatus = "paid";
        if (order.status === "pending") {
          order.status = "processing";
        }
        order.statusHistory.push({ status: "processing", timestamp: new Date(), note: "Payment succeeded." });
        await order.save();
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as any;
      const order = await OrderModel.findOne({ stripePaymentId: intent.id });
      if (order) {
        order.paymentStatus = "failed";
        order.status = "cancelled";
        order.statusHistory.push({ status: "cancelled", timestamp: new Date(), note: "Payment failed." });
        await order.save();
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as any;
      const order = await OrderModel.findOne({ stripePaymentId: charge.payment_intent });
      if (order) {
        order.paymentStatus = "refunded";
        order.status = "refunded";
        order.statusHistory.push({ status: "refunded", timestamp: new Date(), note: "Charge refunded." });
        await order.save();
      }
    }
  } catch (error) {
    return NextResponse.json({ message: `Failed to process webhook event: ${error}` }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
