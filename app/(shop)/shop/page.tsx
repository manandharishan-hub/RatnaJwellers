import Link from "next/link";
import { connection } from "next/server";
import { ProductCard } from "@/components/shop/ProductCard";
import { connectDB } from "@/lib/mongodb";
import CategoryModel from "@/models/Category";
import ProductModel from "@/models/Product";

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    material?: string;
    gemstone?: string;
    occasion?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    inStockOnly?: string;
  }>;
}

async function getShopData(searchParams: Awaited<ShopPageProps["searchParams"]>) {
  try {
    await connectDB();
    const query: Record<string, unknown> = { isPublished: true };

    if (searchParams.search) {
      query.name = { $regex: searchParams.search, $options: "i" };
    }

    if (searchParams.category) {
      const category = await CategoryModel.findOne({ slug: searchParams.category });
      if (category) {
        query.category = category._id;
      }
    }
    if (searchParams.material) query.material = searchParams.material;
    if (searchParams.gemstone) query.gemstone = searchParams.gemstone;
    if (searchParams.occasion) query.occasion = searchParams.occasion;
    if (searchParams.inStockOnly === "true") query.totalStock = { $gt: 0 };
    const minPrice = Number(searchParams.minPrice || 0) * 100;
    const maxPrice = Number(searchParams.maxPrice || 0) * 100;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) (query.price as Record<string, number>).$gte = minPrice;
      if (maxPrice) (query.price as Record<string, number>).$lte = maxPrice;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      popular: { isBestSeller: -1, createdAt: -1 },
      rating: { averageRating: -1, reviewCount: -1 },
    };

    const [products, categories] = await Promise.all([
      ProductModel.find(query).sort(sortMap[searchParams.sort ?? "newest"] ?? sortMap.newest).limit(24).lean(),
      CategoryModel.find({ isActive: true }).sort({ name: 1 }).lean(),
    ]);

    return { products, categories, isDemo: false };
  } catch {
    return { products: [], categories: [], isDemo: true };
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  await connection();
  const resolvedSearchParams = await searchParams;
  const { products, categories, isDemo } = await getShopData(resolvedSearchParams);
  const selectedSort = resolvedSearchParams.sort ?? "newest";

  return (
    <div className="page-shell">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Luxury Jewelry</p>
          <h1 className="mt-3 page-title">Shop elegant designer pieces</h1>
          {isDemo && <p className="mt-3 max-w-2xl text-sm text-slate-600">MongoDB is unavailable. Start MongoDB or update MONGODB_URI to render live products.</p>}
        </div>
        <form className="flex w-full max-w-md items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm md:w-auto">
          <input name="search" type="search" placeholder="Search jewelry, rings, necklaces..." defaultValue={resolvedSearchParams.search ?? ""} className="w-full bg-transparent text-sm text-slate-700 outline-none" />
          <button type="submit" className="lux-button-primary px-4 py-2">Search</button>
        </form>
      </div>

      <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
        <aside className="surface-panel h-fit space-y-6">
          <h2 className="text-lg font-semibold text-[#0A1628]">Filters</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Categories</p>
            <div className="space-y-2">
              <Link href="/shop" className="block rounded-lg border border-slate-200 px-4 py-3 transition hover:border-[#C9A84C] hover:bg-[#FBFAF7]">
                All jewelry
              </Link>
              {categories.map((category) => (
                <Link key={category._id.toString()} href={`/shop/${category.slug}`} className="block rounded-lg border border-slate-200 px-4 py-3 transition hover:border-[#C9A84C] hover:bg-[#FBFAF7]">
                  {category.name}
                </Link>
              ))}
              {categories.length === 0 && <p className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-slate-500">No categories from database yet.</p>}
            </div>
          </div>
          <form className="space-y-4 border-t border-slate-200 pt-5 text-sm">
            <input type="hidden" name="search" value={resolvedSearchParams.search ?? ""} />
            <div>
              <label htmlFor="category" className="font-medium text-slate-900">Category</label>
              <select id="category" name="category" defaultValue={resolvedSearchParams.category ?? ""} className="mt-2 lux-input">
                <option value="">Any category</option>
                {categories.map((category) => (
                  <option key={category._id.toString()} value={category.slug}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="material" className="font-medium text-slate-900">Material</label>
              <select id="material" name="material" defaultValue={resolvedSearchParams.material ?? ""} className="mt-2 lux-input">
                <option value="">Any material</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
            <div>
              <label htmlFor="gemstone" className="font-medium text-slate-900">Gemstone</label>
              <select id="gemstone" name="gemstone" defaultValue={resolvedSearchParams.gemstone ?? ""} className="mt-2 lux-input">
                <option value="">Any gemstone</option>
                <option value="Diamond">Diamond</option>
                <option value="Ruby">Ruby</option>
                <option value="Pearl">Pearl</option>
                <option value="Emerald">Emerald</option>
                <option value="None">None</option>
              </select>
            </div>
            <div>
              <label htmlFor="occasion" className="font-medium text-slate-900">Occasion</label>
              <select id="occasion" name="occasion" defaultValue={resolvedSearchParams.occasion ?? ""} className="mt-2 lux-input">
                <option value="">Any occasion</option>
                <option value="Everyday">Everyday</option>
                <option value="Bridal">Bridal</option>
                <option value="Gift">Gift</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="minPrice" className="font-medium text-slate-900">Min price (NPR)</label>
                <input id="minPrice" name="minPrice" type="number" min="0" placeholder="1000" defaultValue={resolvedSearchParams.minPrice ?? ""} className="mt-2 lux-input" />
              </div>
              <div>
                <label htmlFor="maxPrice" className="font-medium text-slate-900">Max price (NPR)</label>
                <input id="maxPrice" name="maxPrice" type="number" min="0" placeholder="50000" defaultValue={resolvedSearchParams.maxPrice ?? ""} className="mt-2 lux-input" />
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-900">
              <input type="checkbox" name="inStockOnly" value="true" defaultChecked={resolvedSearchParams.inStockOnly === "true"} />
              In stock only
            </label>
            <button type="submit" className="lux-button-primary w-full py-2.5">Apply filters</button>
          </form>
        </aside>

        <section className="space-y-6">
          <div className="surface-panel flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-slate-500">Showing {products.length} products</p>
              <h2 className="text-xl font-semibold text-[#0A1628]">Here are the latest curated styles.</h2>
            </div>
            <form>
              {Object.entries(resolvedSearchParams).map(([key, value]) => key !== "sort" && value ? <input key={key} type="hidden" name={key} value={value} /> : null)}
              <select name="sort" defaultValue={selectedSort} className="lux-input w-auto min-w-40" onChange={undefined}>
                <option value="newest">Sort: newest</option>
                <option value="priceAsc">Price: low to high</option>
                <option value="priceDesc">Price: high to low</option>
                <option value="popular">Popular</option>
                <option value="rating">Top rated</option>
              </select>
              <button type="submit" className="lux-button-secondary ml-2 px-4 py-2">Sort</button>
            </form>
          </div>
          {products.length === 0 ? (
            <div className="empty-state">
              {isDemo ? "Database is unavailable, so live products cannot be rendered." : "No products match your search yet."}
            </div>
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
