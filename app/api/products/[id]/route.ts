import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import { requireAdminApi } from "@/lib/adminAuth";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await connectDB();
  const product = await ProductModel.findById((await params).id).lean();
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = await requireAdminApi(request);
  if (token instanceof NextResponse) {
    return token;
  }

  const params = await context.params;
  const data = await request.json();
  await connectDB();
  const product = await ProductModel.findById((await params).id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  Object.assign(product, data);
  await product.save();
  return NextResponse.json(product);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = await requireAdminApi(request);
  if (token instanceof NextResponse) {
    return token;
  }

  const params = await context.params;
  await connectDB();
  const product = await ProductModel.findByIdAndDelete((await params).id).lean();
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ message: "Product deleted" });
}
