import { AdminLayout } from "@/components/admin/AdminLayout";
import { PromotionsManager } from "@/components/admin/PromotionsManager";
import { requireAdminPage } from "@/lib/adminGuard";
import { connectDB } from "@/lib/mongodb";
import CouponModel from "@/models/Coupon";

export const dynamic = "force-dynamic";

function serializeCoupon(coupon: any) {
  return {
    _id: coupon._id.toString(),
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minOrderAmount: coupon.minOrderAmount,
    maxUsage: coupon.maxUsage,
    usedCount: coupon.usedCount,
    expiresAt: coupon.expiresAt?.toISOString?.() ?? coupon.expiresAt,
    isActive: coupon.isActive,
  };
}

async function getCoupons() {
  try {
    await connectDB();
    const coupons = await CouponModel.find().sort({ createdAt: -1 }).lean();
    return coupons.map(serializeCoupon);
  } catch {
    return [];
  }
}

export default async function PromotionsPage() {
  await requireAdminPage();
  const coupons = await getCoupons();
  return (
    <AdminLayout>
      <PromotionsManager initialCoupons={coupons as any[]} />
    </AdminLayout>
  );
}
