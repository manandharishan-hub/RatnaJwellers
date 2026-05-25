import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/serverAuth";
import { jsonError } from "@/lib/apiErrors";
import ContactMessageModel from "@/models/ContactMessage";

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

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  await connectDB();
  const messages = await ContactMessageModel.find().sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ items: messages.map(serializeMessage) });
}

export async function PATCH(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id, status } = await request.json();
  if (!["new", "reviewed"].includes(status)) return jsonError("Invalid message status.", 400);
  await connectDB();
  const message = await ContactMessageModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!message) return jsonError("Message not found.", 404);
  return NextResponse.json(serializeMessage(message));
}
