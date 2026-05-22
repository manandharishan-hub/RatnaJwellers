import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser, isAdmin, requireAdmin } from "@/lib/serverAuth";
import { productSchema } from "@/lib/validation";
import { firstZodMessage, jsonError } from "@/lib/apiErrors";
import { serializeAdminProduct, serializeProduct } from "@/lib/dto";
import CategoryModel from "@/models/Category";
import ProductModel from "@/models/Product";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const user = await getCurrentUser();
  await connectDB();
  const lookup = mongoose.Types.ObjectId.isValid(params.id) ? { _id: params.id } : { slug: params.id };
  const product = await ProductModel.findOne(isAdmin(user) ? lookup : { ...lookup, isPublished: true }).lean();
  if (!product) return jsonError("Product not found.", 404);
  return NextResponse.json(isAdmin(user) ? serializeAdminProduct(product) : serializeProduct(product));
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const params = await context.params;
  const data = await request.json();
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid product data."), 400);
  }

  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(params.id)) return jsonError("Invalid product id.", 400);
  if (!mongoose.Types.ObjectId.isValid(parsed.data.category)) {
    return jsonError("Choose a valid active category.", 400);
  }
  if (parsed.data.subCategory && !mongoose.Types.ObjectId.isValid(parsed.data.subCategory)) {
    return jsonError("Choose a valid subcategory.", 400);
  }
  const categoryExists = await CategoryModel.exists({ _id: parsed.data.category, isActive: true });
  if (!categoryExists) return jsonError("Choose a valid active category.", 400);

  const duplicate = await ProductModel.findOne({
    _id: { $ne: params.id },
    $or: [{ slug: parsed.data.slug }, { sku: parsed.data.sku }],
  }).lean();
  if (duplicate) return jsonError("A product with this slug or SKU already exists.", 409);

  const product = await ProductModel.findByIdAndUpdate(
    params.id,
    {
      ...parsed.data,
      subCategory: parsed.data.subCategory || null,
      totalStock: parsed.data.variants.reduce((sum, variant) => sum + variant.stock, 0),
    },
    { new: true }
  ).lean();
  if (!product) return jsonError("Product not found.", 404);
  return NextResponse.json(serializeAdminProduct(product));
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const params = await context.params;
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(params.id)) return jsonError("Invalid product id.", 400);
  const product = await ProductModel.findByIdAndDelete(params.id).lean();
  if (!product) return jsonError("Product not found.", 404);
  return NextResponse.json({ message: "Product deleted" });
}
