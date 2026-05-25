import CouponModel from "@/models/Coupon";
import { centsToCurrency } from "@/lib/utils";

export type CouponValidationResult = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  discount: number;
};

export async function validateCouponCode(code: string, subtotal: number): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) throw new Error("Enter a coupon code.");

  const coupon = await CouponModel.findOne({ code: normalizedCode }).lean();
  if (!coupon) throw new Error("Coupon code was not found.");
  if (!coupon.isActive) throw new Error("This coupon is turned off by admin.");
  if (new Date(coupon.expiresAt).getTime() < Date.now()) throw new Error("Coupon code has expired.");
  if (coupon.minOrderAmount > subtotal) throw new Error(`Minimum order for this coupon is ${centsToCurrency(coupon.minOrderAmount)}.`);
  if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) throw new Error("Coupon usage limit has been reached.");

  const rawDiscount = coupon.type === "percentage" ? Math.round(subtotal * (coupon.value / 100)) : coupon.value;
  const discount = Math.max(0, Math.min(subtotal, rawDiscount));
  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
  };
}

export async function markCouponUsed(code?: string) {
  if (!code) return;
  await CouponModel.updateOne({ code: code.trim().toUpperCase(), isActive: true }, { $inc: { usedCount: 1 } });
}
