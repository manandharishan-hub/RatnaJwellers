import mongoose, { Document, Model } from "mongoose";

export interface ReviewDoc extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpful: mongoose.Types.ObjectId[];
  notHelpful: mongoose.Types.ObjectId[];
  isReported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema<ReviewDoc>(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notHelpful: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isReported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ReviewModel = (mongoose.models.Review as Model<ReviewDoc>) || mongoose.model<ReviewDoc>("Review", reviewSchema, "reviews");
export default ReviewModel;
