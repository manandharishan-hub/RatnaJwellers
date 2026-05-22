import bcrypt from "bcryptjs";
import mongoose, { Document, Model } from "mongoose";
import { CartItem } from "@/types";

export interface Address {
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface UserDoc extends Document {
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin" | "superadmin";
  avatar: { url: string; publicId?: string };
  isVerified: boolean;
  isBlocked: boolean;
  addresses: Address[];
  wishlist: mongoose.Types.ObjectId[];
  cart: CartItem[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const addressSchema = new mongoose.Schema<Address>({
  label: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zip: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["customer", "admin", "superadmin"], default: "customer" },
    avatar: {
      url: { type: String, trim: true, default: "" },
      publicId: { type: String, trim: true, default: "" },
    },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    addresses: { type: [addressSchema], default: [] },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: {
      type: [
        {
          productId: { type: String, required: true },
          name: { type: String, required: true },
          image: { type: String, required: true },
          price: { type: Number, required: true },
          quantity: { type: Number, required: true, default: 1 },
          variant: { type: String, default: "" },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

const UserModel = (mongoose.models.User as Model<UserDoc>) || mongoose.model<UserDoc>("User", userSchema, "users");
export default UserModel;
