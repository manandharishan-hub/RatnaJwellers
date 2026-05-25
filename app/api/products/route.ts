import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/serverAuth";
import { productSchema } from "@/lib/validation";
import { firstZodMessage, jsonError } from "@/lib/apiErrors";
import { serializeAdminProduct, serializeProduct } from "@/lib/dto";
import CategoryModel from "@/models/Category";
import ProductModel from "@/models/Product";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category");
  const material = url.searchParams.getAll("material");
  const gemstone = url.searchParams.getAll("gemstone");
  const occasion = url.searchParams.getAll("occasion");
  const minPrice = Number(url.searchParams.get("minPrice") || 0) * 100;
  const maxPrice = Number(url.searchParams.get("maxPrice") || 0) * 100;
  const inStockOnly = url.searchParams.get("inStockOnly") === "true";
  const sort = url.searchParams.get("sort") || "newest";
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(60, Math.max(1, Number(url.searchParams.get("limit") || 24)));
  const query: Record<string, any> = { isPublished: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }
  await connectDB();

  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const categoryDoc = await CategoryModel.findOne({ slug: category, isActive: true }).select("_id").lean();
      if (!categoryDoc) return NextResponse.json({ products: [], total: 0, page, limit });
      query.category = categoryDoc._id;
    }
  }
  if (material.length) query.material = { $in: material };
  if (gemstone.length) query.gemstone = { $in: gemstone };
  if (occasion.length) query.occasion = { $in: occasion };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }
  if (inStockOnly) query.totalStock = { $gt: 0 };

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    popular: { isBestSeller: -1, createdAt: -1 },
    rating: { averageRating: -1, reviewCount: -1 },
  };
  const [products, total] = await Promise.all([
    ProductModel.find(query).sort(sortMap[sort] ?? sortMap.newest).skip((page - 1) * limit).limit(limit).lean(),
    ProductModel.countDocuments(query),
  ]);
  return NextResponse.json({ products: products.map(serializeProduct), total, page, limit });
}

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const data = await request.json();
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid product data."), 400);
  }

  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(parsed.data.category)) {
    return jsonError("Choose a valid active category.", 400);
  }
  if (parsed.data.subCategory && !mongoose.Types.ObjectId.isValid(parsed.data.subCategory)) {
    return jsonError("Choose a valid subcategory.", 400);
  }
  const categoryExists = await CategoryModel.exists({ _id: parsed.data.category, isActive: true });
  if (!categoryExists) return jsonError("Choose a valid active category.", 400);

  const duplicate = await ProductModel.findOne({ $or: [{ slug: parsed.data.slug }, { sku: parsed.data.sku }] }).lean();
  if (duplicate) return jsonError("A product with this slug or SKU already exists.", 409);

  const product = await ProductModel.create({
    ...parsed.data,
    subCategory: parsed.data.subCategory || null,
    totalStock: parsed.data.variants.reduce((sum, variant) => sum + variant.stock, 0),
  });
  return NextResponse.json(serializeAdminProduct(product.toObject()), { status: 201 });
}
