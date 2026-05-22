export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-10 px-6 py-16 md:px-10 lg:px-16">
      <div className="max-w-4xl space-y-6">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Privacy policy</p>
        <h1 className="text-4xl font-semibold text-[#0A1628]">Your data is handled with care and security.</h1>
      </div>
      <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm text-slate-600">
        <p>Ratna Jewels uses your information to fulfill orders, communicate promotions, and improve your shopping experience. We do not sell your personal data.</p>
        <p>Payment information is securely processed by Stripe. Account credentials are protected by industry-standard hashing and encryption.</p>
      </div>
    </div>
  );
}
