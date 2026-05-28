import Link from "next/link";
import { connection } from "next/server";
import { ProductCard } from "@/components/shop/ProductCard";
import { connectDB } from "@/lib/mongodb";
import CategoryModel from "@/models/Category";
import ProductModel from "@/models/Product";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

async function getCategoryData(slug: string) {
  try {
    await connectDB();
    const category = await CategoryModel.findOne({ slug }).lean();
    if (!category) {
      return { category: null, products: [], isDemo: false };
    }

    const products = await ProductModel.find({ category: category._id, isPublished: true }).sort({ createdAt: -1 }).lean();
    return { category, products, isDemo: false };
  } catch {
    return { category: null, products: [], isDemo: true };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  await connection();
  const { category: slug } = await params;
  const { category, products, isDemo } = await getCategoryData(slug);

  if (!category) {
    return (
      <div className="px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">{isDemo ? "Database unavailable" : "Category not found"}</h1>
        <p className="mt-3 text-slate-600">{isDemo ? "Start MongoDB or update MONGODB_URI to render this category from Mongoose." : "Please choose a different gallery category."}</p>
        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">{category.name}</p>
        <h1 className="mt-3 text-4xl font-semibold text-[#0A1628]">{category.description || `${category.name} gallery`}</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-16 text-center text-slate-600">No products available in this category yet.</div>
        ) : (
          products.map((product) => <ProductCard key={product._id.toString()} product={product as any} />)
        )}
      </div>
    </div>
  );
}
