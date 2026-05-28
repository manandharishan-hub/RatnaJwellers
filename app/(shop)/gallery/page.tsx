import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Gem, Sparkles } from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import { defaultGalleryItems } from "@/lib/galleryDefaults";
import GalleryImageModel from "@/models/GalleryImage";

async function getGalleryItems() {
  try {
    await connectDB();
    const count = await GalleryImageModel.countDocuments();
    if (count === 0) {
      await GalleryImageModel.insertMany(defaultGalleryItems);
    }
    const items = await GalleryImageModel.find({ isPublished: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    return items.map((item) => ({
      imageUrl: item.imageUrl,
      title: item.title,
      caption: item.caption,
      partnerLabel: item.partnerLabel,
    }));
  } catch {
    return defaultGalleryItems;
  }
}

export default async function GalleryPage() {
  const galleryImages = await getGalleryItems();

  return (
    <main className="bg-[#F8F6F2]">
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-16">
        <div className="border-b border-[#D8B35A]/35 pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow flex items-center gap-2">
                <Camera size={16} />
                Ratna Gallery
              </p>
              <h1 className="mt-3 page-title">A clean showcase of Ratna Jewels moments</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Curated styling, campaign visuals, and pageant-ready jewelry details presented with a calm, premium gallery experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="lux-button-primary">
                Shop jewelry
                <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="lux-button-secondary">
                Branding inquiry
              </Link>
            </div>
          </div>
        </div>

        {galleryImages.length === 0 ? (
          <div className="empty-state mt-10">No gallery photos are published yet.</div>
        ) : (
          <div className="mt-10 bg-[#FFFDF7] px-4 py-10 shadow-[0_18px_60px_rgba(10,22,40,0.08)] sm:px-6 lg:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B18A2E]">Curated Moments</p>
              <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#1C2E5A] md:text-5xl">Our Gallery Collection</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Ratna Jewels visuals arranged like a luxury collection page, with complete image visibility and refined editorial spacing.
              </p>
            </div>

            <div className="mt-10 grid gap-7 md:grid-cols-2">
              {galleryImages.map((item, index) => (
                <figure key={`${item.imageUrl}-${item.title}`} className="group bg-white shadow-[0_16px_45px_rgba(10,22,40,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(10,22,40,0.16)]">
                  <div className="relative aspect-[4/5] bg-[#F5EFE4] p-4">
                    <div className="pointer-events-none absolute inset-4 border border-white/70" />
                    <div className="pointer-events-none absolute inset-x-8 top-7 h-px bg-[#D8B35A]/45" />
                    <div className="pointer-events-none absolute inset-x-8 bottom-7 h-px bg-[#D8B35A]/45" />
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(min-width: 768px) 44vw, 100vw"
                      priority={index === 0}
                      unoptimized
                      className="object-contain p-7 drop-shadow-[0_18px_24px_rgba(10,22,40,0.16)] transition duration-300 group-hover:scale-[1.015]"
                    />
                  </div>
                  <figcaption className="border-t border-[#E7D6B0] bg-white px-6 py-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <span className="h-px w-10 bg-[#D8B35A]/60" />
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7627]">{item.partnerLabel}</p>
                      <span className="h-px w-10 bg-[#D8B35A]/60" />
                    </div>
                    <h3 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#1C2E5A]">{item.title}</h3>
                    {item.caption && <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">{item.caption}</p>}
                    <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9A7627]">
                      <span>Discover</span>
                      <span className="inline-flex size-7 items-center justify-center rounded-full border border-[#D8B35A]/50 bg-[#FBFAF7]">
                        <Gem size={15} />
                      </span>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10 lg:px-16">
        <div className="flex flex-col gap-5 border-t border-[#D8B35A]/35 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Ratna Jewels" width={120} height={44} className="h-11 w-auto object-contain" />
            <div>
              <p className="eyebrow">Ratna Jewels</p>
              <h2 className="text-xl font-semibold text-[#0A1628]">Official luxury jewelry branding showcase</h2>
            </div>
          </div>
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D8B35A]/60 bg-white px-4 py-2 text-sm font-semibold text-[#0A1628]">
            <Sparkles size={16} className="text-[#9A7627]" />
            Mr/Ms Supranational x Ratna Jewels
          </p>
        </div>
      </section>
    </main>
  );
}
