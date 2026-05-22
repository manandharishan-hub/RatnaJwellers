"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { BookOpen, Box, LayoutDashboard, ShieldCheck, ShoppingBag, Users, Zap } from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, visibleFor: ["admin", "superadmin"] },
  { href: "/admin/products", label: "Products", icon: Box, visibleFor: ["admin", "superadmin"] },
  { href: "/admin/categories", label: "Categories", icon: BookOpen, visibleFor: ["admin", "superadmin"] },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, visibleFor: ["admin", "superadmin"] },
  { href: "/admin/customers", label: "Customers", icon: Users, visibleFor: ["admin", "superadmin"] },
  { href: "/admin/reviews", label: "Reviews", icon: ShieldCheck, visibleFor: ["admin", "superadmin"] },
  { href: "/admin/coupons", label: "Coupons", icon: Zap, visibleFor: ["admin", "superadmin"] },
  { href: "/admin/inventory", label: "Inventory", icon: Box, visibleFor: ["admin", "superadmin"] },
  { href: "/admin/users", label: "Admin Users", icon: Users, visibleFor: ["superadmin"] },
  { href: "/admin/audit-log", label: "Audit Log", icon: ShieldCheck, visibleFor: ["superadmin"] },
  { href: "/admin/settings", label: "Settings", icon: LayoutDashboard, visibleFor: ["admin", "superadmin"] },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role ?? "customer";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F1D1] text-xl font-semibold text-[#0A1628]">
              {session?.user?.name?.split(" ").map((segment) => segment[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0A1628]">{session?.user?.name ?? "Admin"}</p>
              <p className="text-sm text-slate-500">{session?.user?.email}</p>
            </div>
          </div>

          <nav className="space-y-2 text-sm text-slate-700">
            {links
              .filter((link) => link.visibleFor.includes(role as string))
              .map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#C9A84C] hover:bg-[#F7F1D1]"
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
          </nav>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
