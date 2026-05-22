export default function FAQPage() {
  return (
    <div className="space-y-10 px-6 py-16 md:px-10 lg:px-16">
      <div className="max-w-4xl space-y-6">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Frequently asked questions</p>
        <h1 className="text-4xl font-semibold text-[#0A1628]">Answers to our most common shopping questions.</h1>
      </div>
      <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-[#0A1628]">How do I track my order?</h2>
          <p className="mt-3 text-slate-600">Once your order ships, you will receive tracking details via email. You can also view order status in your account dashboard.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#0A1628]">What is your return policy?</h2>
          <p className="mt-3 text-slate-600">We offer free returns within 30 days for most jewelry orders. See our Returns page for details on the process.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#0A1628]">Can I request engraving?</h2>
          <p className="mt-3 text-slate-600">Engraving is available on select pieces. Contact our team to confirm customization options before checkout.</p>
        </div>
      </div>
    </div>
  );
}
