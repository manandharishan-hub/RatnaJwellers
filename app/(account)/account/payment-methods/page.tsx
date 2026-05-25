import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, WalletCards } from "lucide-react";
import { getCurrentUser } from "@/lib/serverAuth";

export default async function PaymentMethodsPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-[#F8F6F2] px-5 py-10 md:px-8">
      <section className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#9A7627]">
          <WalletCards size={17} />
          Payment methods
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-[#0A1628]">Saved payment methods</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Ratna currently completes payment through eSewa during checkout. Wallet credentials are never stored in this account.
        </p>

        <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A1628] text-[#D8B35A]">
            <CreditCard size={22} />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-[#0A1628]">No saved cards</h2>
          <p className="mt-2 text-slate-600">Use secure eSewa payment each time you place an order.</p>
        </div>

        <Link href="/dashboard" className="mt-8 inline-flex rounded-full bg-[#0A1628] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
          Back to dashboard
        </Link>
      </section>
    </div>
  );
}
