"use client";

import { useState } from "react";
import { Mail, Star } from "lucide-react";

type ReviewItem = {
  _id: string;
  productName: string;
  rating: number;
  title: string;
  body: string;
  userName: string;
  isApproved: boolean;
  isReported: boolean;
};

type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: "new" | "reviewed";
  createdAt: string;
};

export function ReviewsAndMessagesManager({
  initialReviews,
  initialMessages,
}: {
  initialReviews: ReviewItem[];
  initialMessages: ContactMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const pendingReviews = initialReviews.filter((review) => !review.isApproved).length;
  const approvedReviews = initialReviews.filter((review) => review.isApproved).length;
  const newMessages = messages.filter((message) => message.status === "new").length;
  const averageRating = initialReviews.length
    ? (initialReviews.reduce((sum, review) => sum + review.rating, 0) / initialReviews.length).toFixed(1)
    : "0.0";

  async function markMessageReviewed(id: string) {
    const response = await fetch("/api/admin/contact-messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "reviewed" }),
    });
    const data = await response.json().catch(() => null);
    if (response.ok && data) {
      setMessages((current) => current.map((message) => (message._id === id ? data : message)));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h1>
        <p className="text-gray-600 mt-2">Manage product reviews and customer contact messages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><p className="text-gray-600 text-sm font-medium">Total Reviews</p><p className="text-2xl font-bold text-gray-900 mt-2">{initialReviews.length}</p></div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><p className="text-gray-600 text-sm font-medium">Approved</p><p className="text-2xl font-bold text-gray-900 mt-2">{approvedReviews}</p></div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><p className="text-gray-600 text-sm font-medium">Pending</p><p className="text-2xl font-bold text-gray-900 mt-2">{pendingReviews}</p></div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><p className="text-gray-600 text-sm font-medium">New Messages</p><p className="text-2xl font-bold text-gray-900 mt-2">{newMessages}</p></div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Customer Messages</h2>
          <p className="text-sm text-gray-500">Messages submitted through the contact form.</p>
        </div>
        <div className="divide-y divide-gray-200">
          {messages.map((message) => (
            <div key={message._id} className="p-6 hover:bg-gray-50">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-gray-900"><Mail className="h-4 w-4 text-blue-600" />{message.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{message.email}</p>
                  <p className="mt-3 text-sm leading-6 text-gray-700">{message.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${message.status === "new" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}>{message.status}</span>
                  {message.status === "new" && <button type="button" onClick={() => markMessageReviewed(message._id)} className="rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Mark reviewed</button>}
                </div>
              </div>
            </div>
          ))}
          {messages.length === 0 && <div className="px-6 py-10 text-center text-gray-500">No customer messages yet.</div>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Product Reviews</h2>
          <p className="text-sm text-gray-500">Average rating: {averageRating}</p>
        </div>
        <div className="divide-y divide-gray-200">
          {initialReviews.map((review) => (
            <div key={review._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{review.productName}</h3>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, index) => <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}
                    </div>
                  </div>
                  <p className="mt-2 font-medium text-gray-800">{review.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{review.body}</p>
                  <p className="mt-2 text-xs text-gray-500">By {review.userName}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${review.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{review.isApproved ? "approved" : "pending"}</span>
              </div>
            </div>
          ))}
          {initialReviews.length === 0 && <div className="px-6 py-10 text-center text-gray-500">No product reviews yet.</div>}
        </div>
      </div>
    </div>
  );
}
