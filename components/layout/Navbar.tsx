"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Heart, LayoutDashboard, LogOut, Menu, Search, ShoppingBag, User, UserPlus, X } from "lucide-react";
import { useCartStore } from "@/hooks/store/cartStore";
import { useWishlistStore } from "@/hooks/store/wishlistStore";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const displayedCartCount = isAuthenticated ? cartCount : 0;
  const displayedWishlistCount = isAuthenticated ? wishlistCount : 0;
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const dashboardHref = userRole === "admin" ? "/admin/dashboard" : "/dashboard";

  useEffect(() => {
    if (status !== "unauthenticated") return;

    clearCart();
    clearWishlist();
    window.localStorage.removeItem("ratna_cart");
  }, [clearCart, clearWishlist, status]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Ratna Jewels home" className="inline-flex flex-col items-center gap-1" onClick={() => setIsOpen(false)}>
          <Image src="/logo.png" alt="" width={80} height={30} loading="eager" className="h-[18px] w-auto object-contain" />
          <span className="font-serif text-xl font-semibold leading-none text-[#0A1628]">Ratna Jewels</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-[#C9A84C]">
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link href={dashboardHref} className="transition hover:text-[#C9A84C]">
              Dashboard
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/shop" aria-label="Search jewellery" className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#C9A84C] hover:text-[#C9A84C] sm:inline-flex">
            <Search size={18} />
          </Link>
          {isAuthenticated && (
            <Link href={dashboardHref} aria-label="Dashboard" className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#C9A84C] hover:text-[#C9A84C] sm:inline-flex">
              <LayoutDashboard size={18} />
            </Link>
          )}
          <Link href="/wishlist" aria-label={`Wishlist with ${displayedWishlistCount} items`} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#C9A84C] hover:text-[#C9A84C]">
            <Heart size={18} />
            {displayedWishlistCount > 0 && <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C9A84C] px-1 text-xs font-semibold text-[#0A1628]">{displayedWishlistCount}</span>}
          </Link>
          <Link href="/cart" aria-label={`Cart with ${displayedCartCount} items`} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#C9A84C] hover:text-[#C9A84C]">
            <ShoppingBag size={18} />
            {displayedCartCount > 0 && <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C9A84C] px-1 text-xs font-semibold text-[#0A1628]">{displayedCartCount}</span>}
          </Link>
          {isAuthenticated ? (
            <button type="button" onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sign out" className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#0A1628] text-white transition hover:bg-slate-900 md:inline-flex">
              <LogOut size={18} />
            </button>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" aria-label="Sign in" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1628] text-white transition hover:bg-slate-900">
                <User size={18} />
              </Link>
              <Link href="/register" aria-label="Register" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#C9A84C] hover:text-[#C9A84C]">
                <UserPlus size={18} />
              </Link>
            </div>
          )}
          <button type="button" aria-label={isOpen ? "Close menu" : "Open menu"} aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1628] text-white md:hidden">
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-sm md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2 text-sm text-slate-700">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-3 transition hover:bg-[#F8F6F2] hover:text-[#C9A84C]">
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link href={dashboardHref} onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-3 font-medium text-[#0A1628] transition hover:bg-[#F8F6F2]">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <button type="button" onClick={() => { setIsOpen(false); signOut({ callbackUrl: "/" }); }} className="flex items-center gap-2 rounded-lg px-3 py-3 text-left font-medium text-[#0A1628] transition hover:bg-[#F8F6F2]">
                  <LogOut size={16} />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-3 font-medium text-[#0A1628] transition hover:bg-[#F8F6F2]">
                  Login
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-3 font-medium text-[#0A1628] transition hover:bg-[#F8F6F2]">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
