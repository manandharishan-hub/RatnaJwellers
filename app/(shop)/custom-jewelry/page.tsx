import Link from "next/link";
import { Gem, Mail, Ruler, Sparkles } from "lucide-react";

export default function CustomJewelryPage() {
  return (
    <div className="bg-[#F8F6F2] px-6 py-12 md:px-10 lg:px-16">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-lg bg-[#0A1628] p-8 text-white md:p-10">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#D8B35A]">
            <Sparkles size={17} />
            Custom Jewelry
          </p>
          <h1 className="mt-4 font-serif text-5xl font-semibold">Create a piece around your story.</h1>
          <p className="mt-4 max-w-2xl leading-8 text-slate-300">
            Share your preferred metal, gemstone, size, occasion, and budget. The Ratna team will guide the design, quote, and production timeline.
          </p>
          <Link href="/contact" className="mt-8 inline-flex rounded-full bg-[#D8B35A] px-6 py-3 text-sm font-semibold text-[#0A1628] transition hover:bg-[#F1D17A]">
            Start a custom request
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: Gem, title: "Choose materials", body: "Gold, silver, platinum, diamonds, rubies, pearls, emeralds, or a clean minimal finish." },
            { icon: Ruler, title: "Confirm size", body: "Send ring size, chain length, bracelet fit, or reference measurements before production." },
            { icon: Mail, title: "Review quote", body: "Receive design notes, estimated timeline, and payment steps before your order is made." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <Icon className="text-[#9A7627]" size={24} />
                <h2 className="mt-4 text-xl font-semibold text-[#0A1628]">{item.title}</h2>
                <p className="mt-2 leading-7 text-slate-600">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
