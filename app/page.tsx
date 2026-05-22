import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Gem, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";

const collections = [
  {
    name: "Bridal",
    description: "Ceremony-ready rings, sets, and keepsakes with refined detailing.",
    href: "/shop",
    image: "/luxury-bg.png",
  },
  {
    name: "Everyday Gold",
    description: "Lightweight pieces made for daily wear, layering, and gifting.",
    href: "/shop",
    image: "/panther-bg.png",
  },
  {
    name: "Gemstone Edit",
    description: "Color-rich designs selected for clarity, tone, and character.",
    href: "/shop",
    image: "/uploads/1776176961212_e27832e7caf095f6a639c2e50db40b05.jpg",
  },
];

const fallbackFeaturedProducts = [
  { name: "Aurora Diamond Ring", price: "$1,240", tag: "New arrival" },
  { name: "Celeste Pearl Necklace", price: "$680", tag: "Best seller" },
  { name: "Noor Gold Bracelet", price: "$420", tag: "Gift pick" },
  { name: "Saira Emerald Drops", price: "$890", tag: "Limited" },
];

const services = [
  { title: "Certified Quality", icon: ShieldCheck, text: "Carefully checked stones, settings, and finishes before every delivery." },
  { title: "Personal Styling", icon: Sparkles, text: "Guidance for bridal sets, occasion wear, gifts, and everyday layering." },
  { title: "Secure Delivery", icon: Truck, text: "Protected checkout, careful packaging, and tracked shipping." },
];

async function getFeaturedProducts() {
  try {
    await connectDB();
    return ProductModel.find({
      isPublished: true,
      $or: [{ isFeatured: true }, { isNewArrival: true }, { isBestSeller: true }],
    }).sort({ isFeatured: -1, isBestSeller: -1, createdAt: -1 }).limit(4).lean();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  await connection();
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="bg-[#F8F6F2] text-[#0A1628]">
      <section className="relative min-h-[calc(100vh-73px)] overflow-hidden">
        <Image
          src="/luxury-bg.png"
          alt="Luxury jewelry displayed on a warm studio surface"
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#07111F]/65" />
        <div className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-6 py-20 sm:px-8 lg:px-10">
          <div className="max-w-3xl text-white">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <Gem size={16} />
              Fine jewelry crafted for meaningful moments
            </p>
            <h1 className="font-serif text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
              Ratna Jewels
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100 sm:text-xl">
              Discover polished gold, luminous stones, and modern heirloom pieces in a calm, elegant shopping experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D8B35A] px-6 py-3 text-sm font-semibold text-[#07111F] transition hover:bg-[#F1D17A]">
                Shop collection
                <ArrowRight size={17} />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-white/45 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Book consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-[#9A7627]">Collections</p>
            <h2 className="mt-3 font-serif text-4xl font-semibold text-[#0A1628]">Simple ways to find your signature piece.</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 lg:ml-auto">
            Browse by occasion, material, and mood. Each edit is designed to make choosing jewelry feel effortless and personal.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {collections.map((collection) => (
            <Link key={collection.name} href={collection.href} className="group overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src={collection.image} alt={`${collection.name} jewelry collection`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-2xl font-semibold">{collection.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{collection.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-[#9A7627]">Featured</p>
              <h2 className="mt-3 font-serif text-4xl font-semibold">Loved pieces this season.</h2>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A1628]">
              View all jewelry
              <ArrowRight size={16} />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id.toString()} product={product as any} />
              ))}
            </div>
          ) : (
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {fallbackFeaturedProducts.map((product) => (
              <article key={product.name} className="rounded-lg border border-slate-200 bg-[#FBFAF7] p-5">
                <p className="text-xs font-semibold uppercase text-[#9A7627]">{product.tag}</p>
                <h3 className="mt-8 min-h-16 font-serif text-2xl font-semibold leading-tight">{product.name}</h3>
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-lg font-semibold">{product.price}</p>
                  <Link href="/shop" aria-label={`View ${product.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1628] text-white transition hover:bg-[#24344A]">
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_1fr] lg:px-10">
        <div className="relative min-h-[420px] overflow-hidden rounded-lg">
          <Image src="/panther-bg.png" alt="Statement jewelry campaign image" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase text-[#9A7627]">Experience</p>
          <h2 className="mt-3 font-serif text-4xl font-semibold">A refined service from selection to delivery.</h2>
          <div className="mt-8 grid gap-5">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A1628] text-white">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{service.title}</h3>
                    <p className="mt-1 leading-7 text-slate-600">{service.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1628] px-6 py-16 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase text-[#D8B35A]">Visit Ratna</p>
          <h2 className="mt-4 font-serif text-4xl font-semibold">Find jewelry that feels personal from the first glance.</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
            Explore the store, save favorite pieces, or speak with our team for custom bridal and gifting recommendations.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/shop" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D8B35A] px-6 py-3 text-sm font-semibold text-[#07111F] transition hover:bg-[#F1D17A]">
              Start shopping
              <ArrowRight size={17} />
            </Link>
            <Link href="/about" className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Our story
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
