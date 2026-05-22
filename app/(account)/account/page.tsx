"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-slate-600">Loading your account…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Please sign in to view your account.</h1>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white hover:bg-slate-900">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">My account</p>
          <h1 className="text-3xl font-semibold text-[#0A1628]">Welcome back, {session.user?.name ?? "valued member"}</h1>
        </div>
        <Button type="button" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/account/profile", label: "Profile" },
          { href: "/account/orders", label: "Orders" },
          { href: "/account/addresses", label: "Addresses" },
          { href: "/wishlist", label: "Wishlist" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-slate-700 transition hover:border-[#C9A84C] hover:bg-[#F7F1D1]">
            <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">{item.label}</p>
            <p className="mt-4 text-xl font-semibold text-[#0A1628]">Go to {item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
