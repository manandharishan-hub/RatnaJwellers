import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";

export async function GET() {
  await connectDB();
  const products = await ProductModel.find({}).sort({ createdAt: -1 }).limit(12).lean();
  return NextResponse.json(products);
}
