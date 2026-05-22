import { ProductCard } from "@/components/shop/ProductCard";
import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import CategoryModel from "@/models/Category";

interface CategoryPageProps {
  params: { category: string };
}

async function getCategory(slug: string) {
  await connectDB();
  return CategoryModel.findOne({ slug }).lean();
}

async function getProducts(categoryId: string) {
  await connectDB();
  return ProductModel.find({ category: categoryId, isPublished: true }).sort({ createdAt: -1 }).lean();
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategory(params.category);
  if (!category) {
    return (
      <div className="px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Category not found</h1>
        <p className="mt-3 text-slate-600">Please choose a different collection.</p>
      </div>
    );
  }

  const products = await getProducts(category._id.toString());

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">{category.name}</p>
        <h1 className="mt-3 text-4xl font-semibold text-[#0A1628]">{category.description || `${category.name} collection`}</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-16 text-center text-slate-600">No products available in this category yet.</div>
        ) : (
          products.map((product) => <ProductCard key={product._id.toString()} product={product as any} />)
        )}
      </div>
    </div>
  );
}
