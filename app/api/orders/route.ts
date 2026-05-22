import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/Product";
import CouponModel from "@/models/Coupon";
import UserModel from "@/models/User";
import { buildOrderNumber } from "@/lib/utils";
import { getAuthToken, isAdminRole } from "@/lib/adminAuth";

const TAX_RATE = 0.08;
const DEFAULT_SHIPPING = 500;

function validateAddress(address: any) {
  return address && typeof address === "object" && typeof address.firstName === "string" && typeof address.lastName === "string" && typeof address.street === "string" && typeof address.city === "string" && typeof address.state === "string" && typeof address.zip === "string" && typeof address.country === "string" && typeof address.phone === "string";
}

function calculateCouponDiscount(coupon: any, subtotal: number) {
  if (!coupon) return 0;
  if (coupon.type === "fixed") {
    return Math.min(coupon.value, subtotal);
  }
  return Math.round((subtotal * coupon.value) / 100);
}

export async function GET(request: Request) {
  const token = await getAuthToken(request);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const url = new URL(request.url);
  const query: Record<string, any> = {};
  const userOnly = url.searchParams.get("mine") !== "false";

  if (!isAdminRole(token.role) || userOnly) {
    query.user = token.id;
  }

  if (isAdminRole(token.role) && url.searchParams.get("userId")) {
    query.user = url.searchParams.get("userId");
  }

  const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const data = await request.json();
  const { shippingAddress, billingAddress, items, shippingMethod, couponCode = "", paymentMethod = "Stripe", paymentStatus = "pending", stripePaymentId = "" } = data;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ message: "Cart items are required to create an order." }, { status: 400 });
  }

  if (!validateAddress(shippingAddress) || !validateAddress(billingAddress)) {
    return NextResponse.json({ message: "Valid shipping and billing addresses are required." }, { status: 400 });
  }

  await connectDB();
  const token = await getAuthToken(request);
  const userId = token?.id ?? null;
  const productIds = items.map((item: any) => item.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } });

  const preparedItems = [] as any[];
  let subtotal = 0;

  for (const item of items) {
    const product = products.find((product) => product._id.toString() === item.productId);
    if (!product) {
      return NextResponse.json({ message: `Product ${item.productId} not found.` }, { status: 404 });
    }
    const quantity = Number(item.quantity) || 0;
    if (quantity < 1) {
      return NextResponse.json({ message: "Each cart item must have a quantity of at least 1." }, { status: 400 });
    }

    const requestedVariant = item.variant?.toString() ?? "";
    const variant = requestedVariant ? product.variants?.find((variant) => variant.size === requestedVariant) : null;
    if (variant && quantity > variant.stock) {
      return NextResponse.json({ message: `Not enough stock for ${product.name} (${requestedVariant}).` }, { status: 400 });
    }
    if (quantity > product.totalStock) {
      return NextResponse.json({ message: `Not enough stock for ${product.name}.` }, { status: 400 });
    }

    const image = product.images?.find((image) => image.isPrimary)?.url || product.images?.[0]?.url || "";
    preparedItems.push({
      product: product._id,
      name: product.name,
      image,
      price: product.price,
      quantity,
      variant: requestedVariant || "",
    });
    subtotal += product.price * quantity;
  }

  const shippingCost = Number(data.shippingCost ?? DEFAULT_SHIPPING);
  const tax = Math.round(subtotal * TAX_RATE);
  const coupon = couponCode ? await CouponModel.findOne({ code: couponCode.toUpperCase() }) : null;
  let discount = 0;
  if (coupon) {
    if (!coupon.isActive || coupon.expiresAt < new Date()) {
      return NextResponse.json({ message: "Coupon code is expired or inactive." }, { status: 400 });
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return NextResponse.json({ message: `Coupon requires a minimum order of ${coupon.minOrderAmount}.` }, { status: 400 });
    }
    if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) {
      return NextResponse.json({ message: "Coupon usage limit has been reached." }, { status: 400 });
    }
    discount = calculateCouponDiscount(coupon, subtotal);
  }

  const total = Math.max(0, subtotal + shippingCost + tax - discount);
  const orderStatus = paymentStatus === "paid" ? "processing" : "pending";

  const order = await OrderModel.create({
    user: userId,
    orderNumber: buildOrderNumber(),
    items: preparedItems,
    shippingAddress,
    billingAddress,
    paymentMethod,
    paymentStatus,
    stripePaymentId,
    shippingMethod: shippingMethod || "Standard",
    shippingCost,
    subtotal,
    tax,
    discount,
    total,
    couponCode: couponCode.toUpperCase(),
    status: orderStatus,
    statusHistory: [{ status: orderStatus, timestamp: new Date(), note: "Order created." }],
  });

  for (const item of items) {
    const product = products.find((product) => product._id.toString() === item.productId);
    if (!product) continue;

    const quantity = Number(item.quantity) || 0;
    const requestedVariant = item.variant?.toString() ?? "";
    const variant = requestedVariant ? product.variants?.find((variant) => variant.size === requestedVariant) : null;

    if (variant) {
      variant.stock = Math.max(0, variant.stock - quantity);
    }
    product.totalStock = Math.max(0, product.totalStock - quantity);
    await product.save();
  }

  if (coupon) {
    coupon.usedCount += 1;
    if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) {
      coupon.isActive = false;
    }
    await coupon.save();
  }

  if (userId) {
    await UserModel.findByIdAndUpdate(userId, { cart: [] });
  }

  return NextResponse.json({ orderId: order._id.toString() }, { status: 201 });
}
