"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-slate-500">Loading your dashboard…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-slate-600">You need to sign in to access your dashboard.</p>
        <Link href="/login" className="inline-flex mt-6 rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white hover:bg-slate-900">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Member dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-[#0A1628]">Welcome back, {session.user?.name ?? "valued member"}</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Manage your orders, wishlist, and account settings from one place.
            </p>
          </div>
          <Button type="button" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </Button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-[#F8F7F2] p-6">
            <h2 className="text-xl font-semibold text-[#0A1628]">Account details</h2>
            <p className="mt-3 text-slate-600">Email: <strong>{session.user?.email}</strong></p>
            <p className="mt-2 text-slate-600">Role: <strong>{(session.user as any)?.role ?? "Member"}</strong></p>
            <Link href="/account/profile" className="mt-6 inline-flex rounded-full bg-[#0A1628] px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900">
              View profile
            </Link>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-[#F8F7F2] p-6">
            <h2 className="text-xl font-semibold text-[#0A1628]">Quick access</h2>
            <div className="mt-4 space-y-3 text-slate-600">
              <Link href="/account/orders" className="block rounded-2xl border border-slate-300 bg-white px-5 py-4 hover:border-[#C9A84C]">View your orders</Link>
              <Link href="/account/wishlist" className="block rounded-2xl border border-slate-300 bg-white px-5 py-4 hover:border-[#C9A84C]">Open wishlist</Link>
              <Link href="/account/addresses" className="block rounded-2xl border border-slate-300 bg-white px-5 py-4 hover:border-[#C9A84C]">Manage addresses</Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
