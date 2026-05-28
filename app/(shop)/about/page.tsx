export default function AboutPage() {
  return (
    <div className="space-y-10 px-6 py-16 md:px-10 lg:px-16">
      <div className="max-w-4xl space-y-6">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">About us</p>
        <h1 className="text-4xl font-semibold text-[#0A1628]">A legacy of elegance, crafted for modern celebrations.</h1>
        <p className="text-lg leading-8 text-slate-600">
          Ratna Jewels blends artisanal craftsmanship with premium gemstones and exceptional service. Each gallery piece is designed for bridal moments, anniversary gifts, and everyday indulgence.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#0A1628]">Sustainably sourced</h2>
          <p className="mt-4 text-slate-600">We work with certified gemstone suppliers and ethical metal refiners to ensure every piece is responsibly produced and beautifully finished.</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#0A1628]">Tailored customer service</h2>
          <p className="mt-4 text-slate-600">From personal styling to gift packaging, our concierge team is available to ensure your shopping journey is seamless and memorable.</p>
        </div>
      </div>
    </div>
  );
}
