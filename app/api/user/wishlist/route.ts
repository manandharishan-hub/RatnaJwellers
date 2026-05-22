import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import ProductModel from "@/models/Product";
import { requireAuthApi } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const token = await requireAuthApi(request);
  if (token instanceof NextResponse) return token;

  await connectDB();
  const user = await UserModel.findById(token.id).populate({ path: "wishlist", select: "name slug price images" }).lean();
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ wishlist: user.wishlist ?? [] });
}

export async function POST(request: Request) {
  const token = await requireAuthApi(request);
  if (token instanceof NextResponse) return token;

  const data = await request.json();
  const productId = String(data.productId || "");
  if (!productId) {
    return NextResponse.json({ message: "Product ID is required." }, { status: 400 });
  }

  await connectDB();
  const product = await ProductModel.findById(productId).lean();
  if (!product) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  const user = await UserModel.findById(token.id);
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  if (user.wishlist.some((item) => item.toString() === productId)) {
    return NextResponse.json({ message: "Product is already in your wishlist." }, { status: 200 });
  }

  user.wishlist.push(product._id);
  await user.save();
  return NextResponse.json({ message: "Product added to wishlist." }, { status: 200 });
}
