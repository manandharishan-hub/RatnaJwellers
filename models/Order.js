import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  variant: { type: String, default: "" },
});

const addressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
});

const statusSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: null },
    customerEmail: { type: String, required: true, trim: true },
    orderNumber: { type: String, required: true, unique: true },
    items: { type: [itemSchema], required: true },
    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema, required: true },
    paymentMethod: { type: String, required: true, enum: ["esewa"], default: "esewa" },
    paymentStatus: { type: String, enum: ["pending", "paid", "completed", "failed"], default: "pending" },
    transactionId: { type: String, default: "" },
    shippingMethod: { type: String, default: "Standard" },
    shippingCost: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, required: true },
    total: { type: Number, required: true },
    totalAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "processing", "packed", "out-for-delivery", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    trackingNumber: { type: String, default: "" },
    statusHistory: { type: [statusSchema], default: [] },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1 });

const OrderModel = mongoose.models.Order || mongoose.model("Order", orderSchema, "orders");
export default OrderModel;
