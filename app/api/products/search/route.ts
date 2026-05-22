import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { serializeProduct } from "@/lib/dto";
import ProductModel from "@/models/Product";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParam = url.searchParams.get("q") || "";
  await connectDB();
  const products = await ProductModel.find({
    isPublished: true,
    $or: [
      { name: { $regex: queryParam, $options: "i" } },
      { description: { $regex: queryParam, $options: "i" } },
      { material: { $regex: queryParam, $options: "i" } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return NextResponse.json(products.map(serializeProduct));
}
