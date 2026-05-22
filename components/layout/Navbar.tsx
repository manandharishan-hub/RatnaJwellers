"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ShoppingBag, Heart, Menu } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/hooks/store/cartStore";
import { useWishlistStore } from "@/hooks/store/wishlistStore";

export function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const items = useCartStore((state) => state.items);
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const totalCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const userRole = (session?.user as any)?.role as string | undefined;

  const accountLink = isAuthenticated
    ? userRole === "admin" || userRole === "superadmin"
      ? { href: "/dashboard", label: "Dashboard" }
      : { href: "/account/profile", label: "My Account" }
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="text-lg font-semibold uppercase tracking-[0.35em] text-[#0A1628]">
          Ratna Jewels
        </Link>
        <nav className="hidden items-center gap-6 md:flex text-sm text-slate-700">
          <Link href="/shop" className="transition hover:text-[#C9A84C]">Shop</Link>
          <Link href="/guides" className="transition hover:text-[#C9A84C]">Guides</Link>
          <Link href="/about" className="transition hover:text-[#C9A84C]">About</Link>
          <Link href="/contact" className="transition hover:text-[#C9A84C]">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/wishlist" className="group inline-flex items-center gap-1 text-slate-600 transition hover:text-[#C9A84C]">
            <Heart size={18} />
            <span className="text-xs">{wishlistCount}</span>
          </Link>
          <Link href="/cart" className="group inline-flex items-center gap-1 text-slate-600 transition hover:text-[#C9A84C]">
            <ShoppingBag size={18} />
            <span className="text-xs">{totalCount}</span>
          </Link>
          {isAuthenticated && accountLink ? (
            <>
              <Link href={accountLink.href} className="hidden rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#C9A84C] hover:text-[#0A1628] md:inline-flex">
                {accountLink.label}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#C9A84C] hover:text-[#0A1628] md:inline-flex"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="hidden rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#C9A84C] hover:text-[#0A1628] md:inline-flex">
              Sign in
            </Link>
          )}
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1628] text-white md:hidden">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
