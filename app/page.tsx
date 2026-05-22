import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import CategoryModel from "@/models/Category";

async function getFeaturedProducts() {
  await connectDB();
  return ProductModel.find({ isPublished: true, isFeatured: true }).sort({ createdAt: -1 }).limit(6).lean();
}

async function getNewArrivals() {
  await connectDB();
  return ProductModel.find({ isPublished: true, isNewArrival: true }).sort({ createdAt: -1 }).limit(6).lean();
}

async function getCategories() {
  await connectDB();
  return CategoryModel.find({ isActive: true }).sort({ name: 1 }).limit(4).lean();
}

export default async function HomePage() {
  const [featured, arrivals, categories] = await Promise.all([getFeaturedProducts(), getNewArrivals(), getCategories()]);

  return (
    <div className="space-y-20 px-6 py-8 md:px-10 lg:px-16">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex rounded-full bg-[#C9A84C]/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#846320]">
            Curated luxury jewelry
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#0A1628] sm:text-5xl">
            Discover heirloom-quality jewelry designed for every celebration.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Ratna Jewels blends timeless craftsmanship, premium gemstones, and modern service for a seamless luxury shopping experience.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/shop" className="inline-flex items-center justify-center rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
              Shop new arrivals
            </Link>
            <Link href="/about" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#C9A84C] hover:text-[#C9A84C]">
              Learn our story
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0A1628] p-6 text-white shadow-xl shadow-slate-900/10 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,168,76,0.25),_transparent_40%)]" />
          <div className="relative space-y-4">
            <p className="text-sm uppercase tracking-[0.28em] text-[#F7E8B1]">Luxury essentials</p>
            <h2 className="text-3xl font-semibold leading-tight">Custom bridal collections, everyday elegance, and gemstone guides.</h2>
            <ul className="space-y-3 text-sm text-slate-100/85">
              <li>• Hand-selected gemstones with certified sourcing</li>
              <li>• Secure checkout, express shipping, and free returns</li>
              <li>• Personal styling advice with every order</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#C9A84C]">Featured categories</p>
            <h2 className="text-2xl font-semibold text-[#0A1628]">Browse our finest collections</h2>
          </div>
          <Link href="/shop" className="text-sm font-medium text-[#0A1628] underline decoration-[#C9A84C]/40">View all categories</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <a key={category._id.toString()} href={`/shop/${category.slug}`} className="group overflow-hidden rounded-[2rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="h-56 overflow-hidden bg-slate-100">
                <img src={category.image || "/favicon.ico"} alt={category.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              </div>
              <div className="space-y-2 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[#C9A84C]">Category</p>
                <h3 className="text-xl font-semibold text-[#0A1628]">{category.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{category.description || "Timeless pieces for every occasion."}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#C9A84C]">New arrivals</p>
            <h2 className="text-2xl font-semibold text-[#0A1628]">Discover the latest edits</h2>
          </div>
          <Link href="/shop" className="text-sm font-medium text-[#0A1628] underline decoration-[#C9A84C]/40">See all new arrivals</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {arrivals.length > 0 ? arrivals.map((product) => <ProductCard key={product._id.toString()} product={product as any} />) : <p className="text-slate-600">No new arrivals available yet.</p>}
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#C9A84C]">Best sellers</p>
            <h2 className="text-2xl font-semibold text-[#0A1628]">Loved by our customers</h2>
          </div>
          <Link href="/shop" className="text-sm font-medium text-[#0A1628] underline decoration-[#C9A84C]/40">Explore best sellers</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.length > 0 ? featured.map((product) => <ProductCard key={product._id.toString()} product={product as any} />) : <p className="text-slate-600">No featured products available yet.</p>}
        </div>
      </section>
    </div>
  );
}
