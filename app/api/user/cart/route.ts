import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { requireAuthApi } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const token = await requireAuthApi(request);
  if (token instanceof NextResponse) return token;

  await connectDB();
  const user = await UserModel.findById(token.id).select("cart").lean();
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ cart: user.cart ?? [] });
}

export async function PUT(request: Request) {
  const token = await requireAuthApi(request);
  if (token instanceof NextResponse) return token;

  const data = await request.json();
  if (!Array.isArray(data.cart)) {
    return NextResponse.json({ message: "Cart must be an array." }, { status: 400 });
  }

  await connectDB();
  const user = await UserModel.findByIdAndUpdate(token.id, { cart: data.cart }, { new: true }).select("cart").lean();
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ cart: user.cart ?? [] });
}
