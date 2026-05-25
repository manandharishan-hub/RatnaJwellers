import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/serverAuth";
import { jsonError } from "@/lib/apiErrors";
import CouponModel from "@/models/Coupon";

const couponSchema = z.object({
  code: z.string().min(2).transform((value) => value.trim().toUpperCase()),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().min(1),
  minOrderAmount: z.coerce.number().min(0).default(0),
  maxUsage: z.coerce.number().int().min(0).default(0),
  expiresAt: z.string().min(1),
  isActive: z.boolean().default(true),
});

function serializeCoupon(coupon: any) {
  return {
    _id: coupon._id.toString(),
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minOrderAmount: coupon.minOrderAmount,
    maxUsage: coupon.maxUsage,
    usedCount: coupon.usedCount,
    expiresAt: coupon.expiresAt,
    isActive: coupon.isActive,
    createdAt: coupon.createdAt,
  };
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  await connectDB();
  const coupons = await CouponModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ items: coupons.map(serializeCoupon) });
}

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  const parsed = couponSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid coupon data.", 400);

  await connectDB();
  const duplicate = await CouponModel.findOne({ code: parsed.data.code }).lean();
  if (duplicate) return jsonError("A coupon with this code already exists.", 409);
  const coupon = await CouponModel.create({ ...parsed.data, expiresAt: new Date(parsed.data.expiresAt) });
  return NextResponse.json(serializeCoupon(coupon.toObject()), { status: 201 });
}

export async function PATCH(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id, isActive } = await request.json();
  if (!id || typeof isActive !== "boolean") return jsonError("Choose whether the coupon should be on or off.", 400);

  await connectDB();
  const coupon = await CouponModel.findByIdAndUpdate(id, { isActive }, { new: true }).lean();
  if (!coupon) return jsonError("Coupon not found.", 404);
  return NextResponse.json(serializeCoupon(coupon));
}

export async function DELETE(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await request.json();
  await connectDB();
  const coupon = await CouponModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
  if (!coupon) return jsonError("Coupon not found.", 404);
  return NextResponse.json(serializeCoupon(coupon));
}
