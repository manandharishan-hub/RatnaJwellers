import mongoose, { Document, Model } from "mongoose";

export interface CouponDoc extends Document {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxUsage: number;
  usedCount: number;
  expiresAt: Date;
  isActive: boolean;
}

const couponSchema = new mongoose.Schema<CouponDoc>(
  {
    code: { type: String, required: true, trim: true, unique: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxUsage: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CouponModel = (mongoose.models.Coupon as Model<CouponDoc>) || mongoose.model<CouponDoc>("Coupon", couponSchema, "coupons");
export default CouponModel;
