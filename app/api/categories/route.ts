import { NextResponse } from "next/server";
import { serializeCategory } from "@/lib/dto";
import { connectDB } from "@/lib/mongodb";
import CategoryModel from "@/models/Category";

export async function GET() {
  await connectDB();
  const categories = await CategoryModel.find({ isActive: true }).sort({ name: 1 }).lean();
  return NextResponse.json({ items: categories.map(serializeCategory) });
}
