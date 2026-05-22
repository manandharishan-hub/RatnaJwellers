import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { firstZodMessage, jsonError } from "@/lib/apiErrors";
import { serializeWishlistProduct } from "@/lib/dto";
import { connectDB } from "@/lib/mongodb";
import { requireUser } from "@/lib/serverAuth";
import { wishlistMutationSchema } from "@/lib/validation";
import ProductModel from "@/models/Product";
import UserModel from "@/models/User";

async function getWishlistItems(userId: string) {
  const profile = await UserModel.findById(userId).select("wishlist").lean();
  const ids = profile?.wishlist ?? [];
  const products = await ProductModel.find({ _id: { $in: ids }, isPublished: true }).lean();
  const byId = new Map(products.map((product) => [product._id.toString(), product]));
  return ids.map((id) => byId.get(id.toString())).filter(Boolean).map((product) => serializeWishlistProduct(product!));
}

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  await connectDB();
  return NextResponse.json({ items: await getWishlistItems(user!.id!) });
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = wishlistMutationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid wishlist data."), 400);
  }
  if (!mongoose.Types.ObjectId.isValid(parsed.data.productId)) return jsonError("Invalid product id.", 400);

  await connectDB();
  const productExists = await ProductModel.exists({ _id: parsed.data.productId, isPublished: true });
  if (!productExists) return jsonError("Product not found.", 404);

  await UserModel.findByIdAndUpdate(user!.id, { $addToSet: { wishlist: parsed.data.productId } });
  return NextResponse.json({ items: await getWishlistItems(user!.id!) });
}

export async function DELETE(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = wishlistMutationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid wishlist data."), 400);
  }

  await connectDB();
  await UserModel.findByIdAndUpdate(user!.id, { $pull: { wishlist: parsed.data.productId } });
  return NextResponse.json({ items: await getWishlistItems(user!.id!) });
}
