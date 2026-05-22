import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { requireAuthApi } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const token = await requireAuthApi(request);
  if (token instanceof NextResponse) return token;

  await connectDB();
  const user = await UserModel.findById(token.id).select("-password").lean();
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  const token = await requireAuthApi(request);
  if (token instanceof NextResponse) return token;

  const data = await request.json();
  const updates: Record<string, any> = {};
  if (typeof data.name === "string") updates.name = data.name;
  if (Array.isArray(data.addresses)) {
    updates.addresses = data.addresses.map((address: any) => ({
      label: String(address.label || ""),
      street: String(address.street || ""),
      city: String(address.city || ""),
      state: String(address.state || ""),
      zip: String(address.zip || ""),
      country: String(address.country || ""),
      isDefault: Boolean(address.isDefault),
    }));
  }

  await connectDB();
  const user = await UserModel.findByIdAndUpdate(token.id, updates, { new: true }).select("-password").lean();
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user });
}
