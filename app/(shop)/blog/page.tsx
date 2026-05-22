import Link from "next/link";

const posts = [
  { slug: "jewelry-trends-2026", title: "Jewelry trends for 2026", excerpt: "Discover the shapes, metals, and gemstones that are defining luxury styling this year." },
  { slug: "gift-guide-wedding-season", title: "Wedding season gift guide", excerpt: "Choose the perfect heirloom gift for brides, grooms, and wedding parties." },
];

export default function BlogPage() {
  return (
    <div className="space-y-10 px-6 py-16 md:px-10 lg:px-16">
      <div className="max-w-4xl space-y-6">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Style stories</p>
        <h1 className="text-4xl font-semibold text-[#0A1628]">Inspiration, styling tips, and jewelry news.</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-[#C9A84C]">Blog</p>
            <h2 className="mt-3 text-2xl font-semibold text-[#0A1628]">{post.title}</h2>
            <p className="mt-4 text-slate-600">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
