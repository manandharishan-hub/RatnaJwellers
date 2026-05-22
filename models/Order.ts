import mongoose, { Document, Model } from "mongoose";

export interface OrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

export interface OrderStatusHistory {
  status: string;
  timestamp: Date;
  note?: string;
}

export interface OrderDoc extends Document {
  user?: mongoose.Types.ObjectId | null;
  customerEmail: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  paymentMethod: string;
  paymentStatus: string;
  stripePaymentId: string;
  transactionId: string;
  cardLast4: string;
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: string;
  trackingNumber?: string;
  statusHistory: OrderStatusHistory[];
  notes?: string;
}

const itemSchema = new mongoose.Schema<OrderItem>({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  variant: { type: String, default: "" },
});

const addressSchema = new mongoose.Schema<OrderAddress>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
});

const statusSchema = new mongoose.Schema<OrderStatusHistory>({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema<OrderDoc>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: null },
    customerEmail: { type: String, required: true, trim: true },
    orderNumber: { type: String, required: true, unique: true },
    items: { type: [itemSchema], required: true },
    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema, required: true },
    paymentMethod: { type: String, required: true, default: "debit_card" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    stripePaymentId: { type: String, default: "" },
    transactionId: { type: String, default: "" },
    cardLast4: { type: String, default: "" },
    shippingMethod: { type: String, default: "Standard" },
    shippingCost: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, required: true },
    total: { type: Number, required: true },
    couponCode: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    trackingNumber: { type: String, default: "" },
    statusHistory: { type: [statusSchema], default: [] },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });

const OrderModel = (mongoose.models.Order as Model<OrderDoc>) || mongoose.model<OrderDoc>("Order", orderSchema, "orders");
export default OrderModel;
