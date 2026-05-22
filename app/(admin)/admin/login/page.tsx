"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Redirecting</p>
        <h1 className="mt-4 text-3xl font-semibold text-[#0A1628]">Admin login moved</h1>
        <p className="mt-4 text-slate-600">Please sign in via the shared login page.</p>
      </div>
    </div>
  );
}
