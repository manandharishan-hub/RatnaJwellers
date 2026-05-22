import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { firstZodMessage, jsonError } from "@/lib/apiErrors";
import { serializeCategory } from "@/lib/dto";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/serverAuth";
import { categorySchema } from "@/lib/validation";
import CategoryModel from "@/models/Category";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectDB();
  const categories = await CategoryModel.find().populate("parent", "name").sort({ name: 1 }).lean();
  return NextResponse.json({ items: categories.map(serializeCategory) });
}

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = categorySchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid category data."), 400);
  }

  await connectDB();
  if (parsed.data.parent && !mongoose.Types.ObjectId.isValid(parsed.data.parent)) {
    return jsonError("Choose a valid parent category.", 400);
  }
  const duplicate = await CategoryModel.findOne({ slug: parsed.data.slug }).lean();
  if (duplicate) return jsonError("A category with this slug already exists.", 409);

  const category = await CategoryModel.create({ ...parsed.data, parent: parsed.data.parent || null });
  return NextResponse.json(serializeCategory(category.toObject()), { status: 201 });
}

export async function PUT(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const id = body?._id;
  if (!mongoose.Types.ObjectId.isValid(id)) return jsonError("Invalid category id.", 400);

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid category data."), 400);
  }

  await connectDB();
  if (parsed.data.parent && (!mongoose.Types.ObjectId.isValid(parsed.data.parent) || parsed.data.parent === id)) {
    return jsonError("Choose a valid parent category.", 400);
  }
  const duplicate = await CategoryModel.findOne({ _id: { $ne: id }, slug: parsed.data.slug }).lean();
  if (duplicate) return jsonError("A category with this slug already exists.", 409);

  const category = await CategoryModel.findByIdAndUpdate(id, { ...parsed.data, parent: parsed.data.parent || null }, { new: true }).lean();
  if (!category) return jsonError("Category not found.", 404);
  return NextResponse.json(serializeCategory(category));
}

export async function DELETE(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await request.json();
  if (!mongoose.Types.ObjectId.isValid(id)) return jsonError("Invalid category id.", 400);

  await connectDB();
  const category = await CategoryModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
  if (!category) return jsonError("Category not found.", 404);
  return NextResponse.json(serializeCategory(category));
}
