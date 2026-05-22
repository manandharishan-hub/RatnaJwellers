import { NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/stripe";

export async function POST(request: Request) {
  const data = await request.json();
  const amount = Number(data.amount ?? 0);
  if (!amount || amount < 100) {
    return NextResponse.json({ message: "Invalid amount for payment." }, { status: 400 });
  }

  const paymentIntent = await createPaymentIntent(amount, data.orderId ? { orderId: data.orderId } : {});

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
