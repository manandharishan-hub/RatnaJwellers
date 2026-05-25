import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { firstZodMessage, jsonError } from "@/lib/apiErrors";
import { serializeCartProduct } from "@/lib/dto";
import { connectDB } from "@/lib/mongodb";
import { requireUser } from "@/lib/serverAuth";
import { cartMutationSchema } from "@/lib/validation";
import ProductModel from "@/models/Product";
import UserModel from "@/models/User";

async function getCartItems(userId: string) {
  const profile = await UserModel.findById(userId).select("cart").lean();
  const cart = profile?.cart ?? [];
  const ids = cart.map((item: any) => item.product);
  const products = await ProductModel.find({ _id: { $in: ids }, isPublished: true }).lean();
  const byId = new Map(products.map((product) => [product._id.toString(), product]));

  return cart
    .map((item: any) => {
      const product = byId.get(item.product.toString());
      if (!product) return null;
      return serializeCartProduct(product, item.quantity, item.variant ?? "");
    })
    .filter(Boolean);
}

function getAvailableStock(product: any, variant: string) {
  const selectedVariant = variant ? product.variants?.find((entry: any) => entry.size === variant) : product.variants?.[0];
  return selectedVariant?.stock ?? product.totalStock ?? 0;
}

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  await connectDB();
  return NextResponse.json({ items: await getCartItems(user!.id!) });
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = cartMutationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid cart data."), 400);
  }
  if (!mongoose.Types.ObjectId.isValid(parsed.data.productId)) return jsonError("Invalid product id.", 400);

  await connectDB();
  const product = await ProductModel.findOne({ _id: parsed.data.productId, isPublished: true }).lean();
  if (!product) return jsonError("Product not found.", 404);

  const variant = parsed.data.variant || "";
  const availableStock = getAvailableStock(product, variant);

  const profile = await UserModel.findById(user!.id).select("cart");
  if (!profile) return jsonError("User not found.", 404);

  const cart = profile.cart as any[];
  const existing = cart.find((item) => item.product.toString() === parsed.data.productId && (item.variant ?? "") === variant);
  const nextQuantity = (existing?.quantity ?? 0) + parsed.data.quantity;
  if (availableStock < nextQuantity) return jsonError(`${product.name} does not have enough stock.`, 409);

  if (existing) {
    existing.quantity = nextQuantity;
  } else {
    cart.push({ product: parsed.data.productId, quantity: parsed.data.quantity, variant });
  }
  await profile.save();

  return NextResponse.json({ items: await getCartItems(user!.id!) });
}

export async function PATCH(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = cartMutationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid cart data."), 400);
  }
  if (!mongoose.Types.ObjectId.isValid(parsed.data.productId)) return jsonError("Invalid product id.", 400);

  await connectDB();
  const product = await ProductModel.findOne({ _id: parsed.data.productId, isPublished: true }).lean();
  if (!product) return jsonError("Product not found.", 404);

  const profile = await UserModel.findById(user!.id).select("cart");
  if (!profile) return jsonError("User not found.", 404);

  const variant = parsed.data.variant || "";
  const availableStock = getAvailableStock(product, variant);
  if (availableStock < parsed.data.quantity) return jsonError(`${product.name} does not have enough stock.`, 409);

  const cart = profile.cart as any[];
  const item = cart.find((entry) => entry.product.toString() === parsed.data.productId && (entry.variant ?? "") === variant);
  if (!item) return jsonError("Cart item not found.", 404);
  item.quantity = parsed.data.quantity;
  await profile.save();

  return NextResponse.json({ items: await getCartItems(user!.id!) });
}

export async function DELETE(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const data = await request.json().catch(() => ({}));

  await connectDB();
  const profile = await UserModel.findById(user!.id).select("cart");
  if (!profile) return jsonError("User not found.", 404);

  if (!data?.productId) {
    profile.cart = [];
  } else {
    const variant = data.variant || "";
    profile.cart = (profile.cart as any[]).filter((entry) => entry.product.toString() !== data.productId || (entry.variant ?? "") !== variant);
  }
  await profile.save();

  return NextResponse.json({ items: await getCartItems(user!.id!) });
}
