import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import { requireAdminApi } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category");
  const query: Record<string, any> = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (category) {
    query.category = category;
  }

  await connectDB();
  const products = await ProductModel.find(query).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const token = await requireAdminApi(request);
  if (token instanceof NextResponse) {
    return token;
  }

  const data = await request.json();
  await connectDB();
  const product = await ProductModel.create(data);
  return NextResponse.json(product, { status: 201 });
}
