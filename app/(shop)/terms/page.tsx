export default function TermsPage() {
  return (
    <div className="space-y-10 px-6 py-16 md:px-10 lg:px-16">
      <div className="max-w-4xl space-y-6">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Terms & conditions</p>
        <h1 className="text-4xl font-semibold text-[#0A1628]">The terms that govern purchases on Ratna Jewels.</h1>
      </div>
      <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm text-slate-600">
        <p>By purchasing with Ratna Jewels, you agree to our payment, shipping, and return terms. All sales are subject to verification and quality review.</p>
        <p>Customers are responsible for providing accurate shipping information. Orders cannot be modified once shipped.</p>
      </div>
    </div>
  );
}
