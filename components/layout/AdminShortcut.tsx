"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShieldCheck } from "lucide-react";

export function AdminShortcut() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const href = role === "admin" ? "/admin/dashboard" : "/admin/login";

  return (
    <Link
      href={href}
      aria-label="Admin"
      title="Admin"
      className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#C9A84C]/60 bg-[#0A1628] text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:border-[#C9A84C] hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2"
    >
      <ShieldCheck size={20} />
      <span className="sr-only">Admin</span>
    </Link>
  );
}
