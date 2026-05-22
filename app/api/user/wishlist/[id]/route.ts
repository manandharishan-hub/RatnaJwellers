import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { requireAuthApi } from "@/lib/adminAuth";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = await requireAuthApi(request);
  if (token instanceof NextResponse) return token;

  const params = await context.params;
  const productId = (await params).id;
  if (!productId) {
    return NextResponse.json({ message: "Product ID is required." }, { status: 400 });
  }

  await connectDB();
  const user = await UserModel.findById(token.id);
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  user.wishlist = user.wishlist.filter((item) => item.toString() !== productId);
  await user.save();
  return NextResponse.json({ message: "Product removed from wishlist." }, { status: 200 });
}
