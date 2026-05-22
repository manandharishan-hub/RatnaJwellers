import Link from "next/link";
import { XCircle } from "lucide-react";

export default function EsewaFailurePage() {
  return (
    <div className="min-h-screen bg-[#F8F6F2] px-5 py-16">
      <section className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <XCircle size={26} />
        </div>
        <h1 className="mt-5 text-3xl font-semibold text-[#0A1628]">eSewa payment was not completed</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your order has not been created. You can return to checkout and try again.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/checkout" className="inline-flex items-center justify-center rounded-full bg-[#0A1628] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
            Back to checkout
          </Link>
          <Link href="/shop" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#D8B35A]">
            Continue shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
