import { connectDB } from "@/lib/mongodb";
import CouponModel from "@/models/Coupon";

async function getCoupons() {
  await connectDB();
  return CouponModel.find().sort({ createdAt: -1 }).lean();
}

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0A1628]">Coupons</h1>
          <p className="text-slate-600">Create and manage discount campaigns for customers.</p>
        </div>
        <div className="rounded-full bg-[#F7F1D1] px-4 py-2 text-sm font-semibold text-[#0A1628]">
          {coupons.length} coupons
        </div>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Expires</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {coupons.map((coupon) => (
              <tr key={coupon._id.toString()}>
                <td className="px-6 py-4 font-medium text-slate-900">{coupon.code}</td>
                <td className="px-6 py-4">{coupon.type}</td>
                <td className="px-6 py-4">{coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}</td>
                <td className="px-6 py-4">{new Date(coupon.expiresAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">{coupon.isActive ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
