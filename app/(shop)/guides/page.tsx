import Link from "next/link";

const guides = [
  { slug: "diamond-buying-guide", title: "How to choose the perfect diamond", excerpt: "Master the 4Cs and discover stunning settings for engagement rings." },
  { slug: "ring-sizing-essentials", title: "Ring sizing essentials", excerpt: "Find the right fit with expert advice on measuring and resizing." },
  { slug: "gemstone-care-tips", title: "Gemstone care tips", excerpt: "Protect your investment with simple cleaning and storage routines." },
];

export default function GuidesPage() {
  return (
    <div className="space-y-10 px-6 py-16 md:px-10 lg:px-16">
      <div className="max-w-4xl space-y-6">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Jewelry guides</p>
        <h1 className="text-4xl font-semibold text-[#0A1628]">Expert advice for choosing, caring, and styling jewelry.</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {guides.map((guide) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-[#C9A84C]">Guide</p>
            <h2 className="mt-3 text-xl font-semibold text-[#0A1628]">{guide.title}</h2>
            <p className="mt-4 text-slate-600">{guide.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
