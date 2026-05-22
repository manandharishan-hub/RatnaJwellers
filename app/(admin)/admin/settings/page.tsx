"use client";

import { useSession, signOut } from "next-auth/react";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="px-6 py-10 md:px-10 lg:px-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-sm">
          <h1 className="text-3xl font-semibold text-[#0A1628]">Settings</h1>
          <p className="mt-3 text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-sm">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Settings</h1>
        <p className="mt-3 text-slate-600">Update your admin account and portal preferences.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-[#F8F7F2] p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Account</p>
            <p className="mt-4 text-slate-700">Name: <strong>{session?.user?.name}</strong></p>
            <p className="mt-2 text-slate-700">Email: <strong>{session?.user?.email}</strong></p>
            <p className="mt-2 text-slate-700">Role: <strong>{(session?.user as any)?.role ?? "Admin"}</strong></p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-[#F8F7F2] p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-[#C9A84C]">Actions</p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-4 inline-flex rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Sign out
            </button>
            <p className="mt-4 text-slate-600">Account editing will be available soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
