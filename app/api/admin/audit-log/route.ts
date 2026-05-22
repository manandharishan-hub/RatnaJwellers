import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import AuditLogModel from "@/models/AuditLog";

export async function GET(request: Request) {
  const token = await requireSuperAdminApi(request);
  if (token instanceof NextResponse) {
    return token;
  }

  await connectDB();
  const url = new URL(request.url);
  const filter: Record<string, unknown> = {};
  const admin = url.searchParams.get("admin");
  const action = url.searchParams.get("action");
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");

  if (admin) {
    filter.adminEmail = admin;
  }
  if (action) {
    filter.action = { $regex: action, $options: "i" };
  }
  if (start || end) {
    filter.createdAt = {} as Record<string, unknown>;
    if (start) {
      (filter.createdAt as any).$gte = new Date(start);
    }
    if (end) {
      (filter.createdAt as any).$lte = new Date(end);
    }
  }

  const logs = await AuditLogModel.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json({ logs });
}
