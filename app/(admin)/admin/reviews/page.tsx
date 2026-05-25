import { AdminLayout } from "@/components/admin/AdminLayout";
import { ReviewsAndMessagesManager } from "@/components/admin/ReviewsAndMessagesManager";
import { requireAdminPage } from "@/lib/adminGuard";
import { connectDB } from "@/lib/mongodb";
import ContactMessageModel from "@/models/ContactMessage";
import ReviewModel from "@/models/Review";

export const dynamic = "force-dynamic";

function serializeReview(review: any) {
  return {
    _id: review._id.toString(),
    productName: review.product?.name || "Product review",
    rating: review.rating,
    title: review.title,
    body: review.body,
    userName: review.userName,
    isApproved: review.isApproved,
    isReported: review.isReported,
  };
}

function serializeMessage(message: any) {
  return {
    _id: message._id.toString(),
    name: message.name,
    email: message.email,
    message: message.message,
    status: message.status,
    createdAt: message.createdAt?.toISOString?.() ?? message.createdAt,
  };
}

async function getFeedback() {
  try {
    await connectDB();
    const [reviews, messages] = await Promise.all([
      ReviewModel.find().populate("product", "name").sort({ createdAt: -1 }).limit(100).lean(),
      ContactMessageModel.find().sort({ createdAt: -1 }).limit(100).lean(),
    ]);
    return { reviews: reviews.map(serializeReview), messages: messages.map(serializeMessage) };
  } catch {
    return { reviews: [], messages: [] };
  }
}

export default async function ReviewsPage() {
  await requireAdminPage();
  const { reviews, messages } = await getFeedback();
  return (
    <AdminLayout>
      <ReviewsAndMessagesManager initialReviews={reviews} initialMessages={messages as any[]} />
    </AdminLayout>
  );
}
