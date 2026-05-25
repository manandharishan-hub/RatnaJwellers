import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/serverAuth";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/Product";
import ReviewModel from "@/models/Review";
import ContactMessageModel from "@/models/ContactMessage";

function formatTime(value?: Date | string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectDB();

  const [
    pendingOrders,
    recentOrders,
    pendingReviews,
    reportedReviews,
    recentReviews,
    newContactMessages,
    recentContactMessages,
    lowStockCount,
    lowStockProducts,
  ] = await Promise.all([
    OrderModel.countDocuments({ status: { $in: ["pending", "processing"] } }),
    OrderModel.find({ status: { $in: ["pending", "processing"] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber customerEmail total status createdAt")
      .lean(),
    ReviewModel.countDocuments({ isApproved: false }),
    ReviewModel.countDocuments({ isReported: true }),
    ReviewModel.find({ $or: [{ isApproved: false }, { isReported: true }] })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("userName title rating isApproved isReported createdAt")
      .lean(),
    ContactMessageModel.countDocuments({ status: "new" }),
    ContactMessageModel.find({ status: "new" }).sort({ createdAt: -1 }).limit(5).lean(),
    ProductModel.countDocuments({ totalStock: { $lte: 5 } }),
    ProductModel.find({ totalStock: { $lte: 5 } })
      .sort({ totalStock: 1 })
      .limit(3)
      .select("name totalStock createdAt")
      .lean(),
  ]);

  const orderItems = recentOrders.map((order: any) => ({
    id: order._id.toString(),
    type: "order",
    title: `Order ${order.orderNumber}`,
    description: `${order.customerEmail} has a ${order.status} order.`,
    href: `/admin/orders/${order._id.toString()}`,
    createdAt: formatTime(order.createdAt),
  }));

  const reviewItems = recentReviews.map((review: any) => ({
    id: review._id.toString(),
    type: "review",
    title: review.isReported ? "Reported review" : "Review awaiting approval",
    description: `${review.userName}: ${review.title || `${review.rating} star review`}`,
    href: "/admin/reviews",
    createdAt: formatTime(review.createdAt),
  }));

  const contactItems = recentContactMessages.map((message: any) => ({
    id: message._id.toString(),
    type: "message",
    title: "New contact message",
    description: `${message.name}: ${message.message}`,
    href: "/admin/reviews",
    createdAt: formatTime(message.createdAt),
  }));

  const stockItems = lowStockProducts.map((product: any) => ({
    id: product._id.toString(),
    type: "stock",
    title: "Low stock alert",
    description: `${product.name} has ${product.totalStock} units left.`,
    href: "/admin/inventory",
    createdAt: formatTime(product.createdAt),
  }));

  return NextResponse.json({
    counts: {
      notifications: pendingOrders + pendingReviews + reportedReviews + newContactMessages + lowStockCount,
      messages: pendingReviews + reportedReviews + newContactMessages,
      pendingOrders,
      pendingReviews,
      reportedReviews,
      lowStock: lowStockCount,
    },
    notifications: [...orderItems, ...reviewItems, ...contactItems, ...stockItems].slice(0, 8),
    messages: [...contactItems, ...reviewItems],
  });
}
