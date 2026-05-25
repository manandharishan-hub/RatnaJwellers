import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { validateCouponCode } from "@/lib/coupons";
import { jsonError } from "@/lib/apiErrors";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = String(body?.code || "");
  const subtotal = Number(body?.subtotal || 0);
  if (!Number.isFinite(subtotal) || subtotal <= 0) return jsonError("Cart subtotal is required.", 400);

  await connectDB();
  try {
    const coupon = await validateCouponCode(code, subtotal);
    return NextResponse.json(coupon);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Coupon code is not valid.", 400);
  }
}
