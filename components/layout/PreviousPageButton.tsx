"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const hiddenRoutes = new Set(["/"]);

export function PreviousPageButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname || hiddenRoutes.has(pathname)) return null;

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <div className="px-6 pt-5 md:px-10 lg:px-16">
      <button
        type="button"
        onClick={goBack}
        aria-label="Go to previous page"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0A1628] shadow-sm transition hover:border-[#C9A84C] hover:text-[#8A6A1F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F6F2]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </button>
    </div>
  );
}
