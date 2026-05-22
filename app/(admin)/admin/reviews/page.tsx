import { connectDB } from "@/lib/mongodb";
import ReviewModel from "@/models/Review";

async function getReviews() {
  await connectDB();
  return ReviewModel.find().populate("product", "name").sort({ createdAt: -1 }).lean();
}

export default async function AdminReviewsPage() {
  const reviews = await getReviews();

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0A1628]">Reviews</h1>
          <p className="text-slate-600">Moderate review submissions and inspect product feedback.</p>
        </div>
        <div className="rounded-full bg-[#F7F1D1] px-4 py-2 text-sm font-semibold text-[#0A1628]">
          {reviews.length} reviews
        </div>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Reviewer</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {reviews.map((review) => (
              <tr key={review._id.toString()}>
                <td className="px-6 py-4 font-medium text-slate-900">{(review.product as any)?.name ?? "Unknown"}</td>
                <td className="px-6 py-4">{review.userName}</td>
                <td className="px-6 py-4">{review.rating}/5</td>
                <td className="px-6 py-4">{review.isApproved ? "Approved" : "Pending"}</td>
                <td className="px-6 py-4">{new Date(review.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
