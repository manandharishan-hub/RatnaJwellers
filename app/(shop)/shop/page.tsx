import { ProductCard } from "@/components/shop/ProductCard";
import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import CategoryModel from "@/models/Category";

interface ShopPageProps {
  searchParams: { search?: string; category?: string } | Promise<{ search?: string; category?: string }>;
}

async function getProducts(searchParams: { search?: string; category?: string }) {
  await connectDB();
  const query: Record<string, any> = { isPublished: true };
  if (searchParams.search) {
    query.name = { $regex: searchParams.search, $options: "i" };
  }
  if (searchParams.category) {
    const category = await CategoryModel.findOne({ slug: searchParams.category });
    if (category) {
      query.category = category._id;
    }
  }
  return ProductModel.find(query).sort({ createdAt: -1 }).limit(24).lean();
}

async function getCategories() {
  await connectDB();
  return CategoryModel.find({ isActive: true }).sort({ name: 1 }).lean();
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const unwrappedSearchParams = await searchParams;
  const [products, categories] = await Promise.all([getProducts(unwrappedSearchParams), getCategories()]);

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#C9A84C]">Luxury Jewelry</p>
          <h1 className="mt-3 text-4xl font-semibold text-[#0A1628]">Shop elegant designer pieces</h1>
        </div>
        <form className="flex w-full max-w-md items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm md:w-auto">
          <input type="search" name="search" placeholder="Search jewelry, rings, necklaces..." className="w-full bg-transparent text-sm text-slate-700 outline-none" />
          <button type="submit" className="rounded-full bg-[#0A1628] px-4 py-2 text-sm font-semibold text-white">Search</button>
        </form>
      </div>

      <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0A1628]">Filters</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Categories</p>
            <div className="space-y-2">
              {categories.map((category) => (
                <a key={category._id.toString()} href={`/shop/${category.slug}`} className="block rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-[#C9A84C] hover:bg-[#F7F1D1]">
                  {category.name}
                </a>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm text-slate-500">Showing {products.length} products</p>
              <h2 className="text-xl font-semibold text-[#0A1628]">Here are the latest curated styles.</h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <select className="rounded-full border border-slate-200 bg-white px-4 py-2">
                <option>Sort: newest</option>
                <option>Price: low to high</option>
                <option>Price: high to low</option>
              </select>
            </div>
          </div>
          {products.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">No products match your search yet.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product._id.toString()} product={product as any} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
