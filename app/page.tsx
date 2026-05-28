import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem, Search, Sparkles, Star } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { connectDB } from "@/lib/mongodb";
import CategoryModel from "@/models/Category";
import ProductModel from "@/models/Product";

async function getHomeData() {
  try {
    await connectDB();
    const [categories, newArrivals, bestSellers] = await Promise.all([
      CategoryModel.find({ isActive: true }).sort({ name: 1 }).limit(4).lean(),
      ProductModel.find({ isPublished: true, isNewArrival: true }).sort({ createdAt: -1 }).limit(3).lean(),
      ProductModel.find({ isPublished: true, isBestSeller: true }).sort({ createdAt: -1 }).limit(3).lean(),
    ]);

    const fallbackProducts = newArrivals.length || bestSellers.length
      ? []
      : await ProductModel.find({ isPublished: true }).sort({ createdAt: -1 }).limit(3).lean();

    return {
      categories,
      newArrivals: newArrivals.length ? newArrivals : fallbackProducts,
      bestSellers: bestSellers.length ? bestSellers : fallbackProducts,
      isOffline: false,
    };
  } catch {
    return { categories: [], newArrivals: [], bestSellers: [], isOffline: true };
  }
}

export default async function HomePage() {
  const { categories, newArrivals, bestSellers, isOffline } = await getHomeData();
  const heroProduct = newArrivals[0] ?? bestSellers[0];
  const heroImage = heroProduct?.images?.find((image) => image.isPrimary)?.url ?? heroProduct?.images?.[0]?.url ?? "/logo.png";

  return (
    <main className="bg-[#F8F6F2]">
      <section className="relative min-h-[78vh] overflow-hidden bg-[#0A1628] text-white">
        <Image src={heroImage} alt="" fill priority unoptimized className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-[#0A1628]/55" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:px-10 lg:px-16">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#D8B35A]">
            <Sparkles size={17} />
            Ratna Jewels
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-tight md:text-6xl">
            Jewelry made for moments worth remembering.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
            Browse curated rings, necklaces, bracelets, new arrivals, and best sellers with secure checkout and order tracking.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="inline-flex items-center gap-2 rounded-full bg-[#D8B35A] px-6 py-3 text-sm font-semibold text-[#0A1628] transition hover:bg-[#F1D17A]">
              Browse gallery
              <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="inline-flex rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#D8B35A] hover:text-[#D8B35A]">
              Login / Register
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9A7627]">Start shopping</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-[#0A1628]">Choose how you want to explore.</h2>
          {isOffline && <p className="mt-3 text-sm text-slate-600">MongoDB is not reachable, so live gallery products will appear after the database reconnects.</p>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/shop" className="interactive-card">
            <Gem className="text-[#9A7627]" size={22} />
            <p className="mt-3 font-semibold text-[#0A1628]">Browse category / gallery</p>
          </Link>
          <Link href="/shop?sort=newest" className="interactive-card">
            <Sparkles className="text-[#9A7627]" size={22} />
            <p className="mt-3 font-semibold text-[#0A1628]">View new arrivals</p>
          </Link>
          <Link href="/shop?sort=popular" className="interactive-card">
            <Star className="text-[#9A7627]" size={22} />
            <p className="mt-3 font-semibold text-[#0A1628]">Shop best sellers</p>
          </Link>
          <form action="/shop" className="surface-card flex items-center gap-3">
            <Search className="shrink-0 text-[#9A7627]" size={20} />
            <input name="search" type="search" placeholder="Search jewelry" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </form>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-10 md:px-10 lg:px-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link key={category._id.toString()} href={`/shop/${category.slug}`} className="rounded-lg bg-[#0A1628] p-5 text-white transition hover:-translate-y-0.5 hover:bg-slate-900">
                <p className="font-serif text-2xl font-semibold">{category.name}</p>
                <p className="mt-2 text-sm text-slate-300">{category.description || "Explore the gallery"}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pb-12 md:px-10 lg:px-16">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9A7627]">New arrivals</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#0A1628]">Fresh from the gallery</h2>
          </div>
          <Link href="/shop?sort=newest" className="text-sm font-semibold text-[#0A1628] underline decoration-[#D8B35A]/60">View all</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {newArrivals.length === 0 ? (
            <div className="empty-state md:col-span-2 xl:col-span-3">New arrivals will appear here after products are added.</div>
          ) : (
            newArrivals.map((product) => <ProductCard key={product._id.toString()} product={product as any} />)
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10 lg:px-16">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9A7627]">Best sellers</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#0A1628]">Most loved pieces</h2>
          </div>
          <Link href="/shop?sort=popular" className="text-sm font-semibold text-[#0A1628] underline decoration-[#D8B35A]/60">View all</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {bestSellers.length === 0 ? (
            <div className="empty-state md:col-span-2 xl:col-span-3">Best sellers will appear here after products are marked as popular.</div>
          ) : (
            bestSellers.map((product) => <ProductCard key={product._id.toString()} product={product as any} />)
          )}
        </div>
      </section>
    </main>
  );
}
