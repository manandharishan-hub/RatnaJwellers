"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, Heart, LogOut, Mail, Menu, Search, ShoppingBag, User, UserPlus, X } from "lucide-react";
import { useCartStore } from "@/hooks/store/cartStore";
import { useWishlistStore } from "@/hooks/store/wishlistStore";

const accountMessagesReadKey = "ratna-account-messages-read";

const primaryNavLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop", label: "Collections" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const profileLinks = [
  { href: "/account/profile", label: "My Profile" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/orders", label: "Track Order" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account/addresses", label: "Saved Addresses" },
  { href: "/account/payment-methods", label: "Payment Methods" },
  { href: "/account/profile", label: "Settings" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadAccountMessages, setUnreadAccountMessages] = useState(() => {
    if (typeof window === "undefined") return 0;
    return window.localStorage.getItem(accountMessagesReadKey) === "true" ? 0 : 1;
  });
  const profileRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const isAuthResolved = status !== "loading";
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isAuthenticated = status === "authenticated" && Boolean(session?.user) && userRole !== "admin";
  const displayedCartCount = isAuthenticated ? cartCount : 0;
  const displayedWishlistCount = isAuthenticated ? wishlistCount : 0;
  const userName = session?.user?.name?.trim() || "Account";
  const dashboardHref = userRole === "admin" ? "/admin/dashboard" : "/dashboard";
  const logoHref = isAuthenticated ? dashboardHref : "/";

  function markAccountMessagesRead() {
    window.localStorage.setItem(accountMessagesReadKey, "true");
    setUnreadAccountMessages(0);
  }

  useEffect(() => {
    if (status !== "unauthenticated") return;

    clearWishlist();
    window.localStorage.removeItem("ratna-wishlist");
    window.localStorage.removeItem(accountMessagesReadKey);
  }, [clearWishlist, status]);

  useEffect(() => {
    function closeProfileMenu(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-3 sm:px-6 xl:grid-cols-[auto_1fr_auto] xl:items-center">
        <div className="flex items-center justify-between gap-4">
          <Link href={logoHref} aria-label="Ratna Jewels home" className="inline-flex flex-col items-center gap-1" onClick={() => setIsOpen(false)}>
            <Image src="/logo.png" alt="" width={80} height={30} loading="eager" className="h-[18px] w-auto object-contain" />
            <span className="font-serif text-xl font-semibold leading-none text-[#0A1628]">Ratna Jewels</span>
          </Link>
          <button type="button" aria-label={isOpen ? "Close menu" : "Open menu"} aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1628] text-white xl:hidden">
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="hidden items-center justify-center gap-4 text-[13px] font-medium text-slate-700 2xl:gap-5 2xl:text-sm xl:flex">
          {primaryNavLinks.map((link) => (
            <Link key={`${link.href}-${link.label}`} href={link.label === "Home" && isAuthenticated ? dashboardHref : link.href} className="whitespace-nowrap transition hover:text-[#C9A84C]">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-2 2xl:gap-3 xl:flex">
          <form action="/shop" className="flex w-44 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm 2xl:w-56">
            <Search size={17} className="shrink-0 text-slate-500" />
            <input name="search" type="search" placeholder="Search" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </form>

          <Link href="/wishlist" aria-label={`Wishlist with ${displayedWishlistCount} items`} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#C9A84C] hover:text-[#C9A84C]">
            <Heart size={18} />
            {displayedWishlistCount > 0 && <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C9A84C] px-1 text-xs font-semibold text-[#0A1628]">{displayedWishlistCount}</span>}
          </Link>
          <Link href="/cart" aria-label={`Cart with ${displayedCartCount} items`} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#C9A84C] hover:text-[#C9A84C]">
            <ShoppingBag size={18} />
            {displayedCartCount > 0 && <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C9A84C] px-1 text-xs font-semibold text-[#0A1628]">{displayedCartCount}</span>}
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/account/orders" onClick={markAccountMessagesRead} aria-label={unreadAccountMessages > 0 ? `Account messages with ${unreadAccountMessages} unread` : "Account messages"} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#C9A84C] hover:text-[#C9A84C]">
                <Mail size={18} />
                {unreadAccountMessages > 0 && <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">{unreadAccountMessages}</span>}
              </Link>
              <div ref={profileRef} className="relative">
                <button type="button" onClick={() => setIsProfileOpen((value) => !value)} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0A1628] px-4 text-sm font-semibold text-white transition hover:bg-slate-900" aria-haspopup="menu" aria-expanded={isProfileOpen}>
                  <User size={17} />
                  <span className="max-w-28 truncate">{userName}</span>
                  <ChevronDown size={15} />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-lg border border-slate-200 bg-white p-2 text-sm shadow-xl" role="menu">
                    {profileLinks.map((link) => (
                      <Link key={link.label} href={link.href} onClick={() => setIsProfileOpen(false)} className="block rounded-lg px-4 py-3 text-slate-700 transition hover:bg-[#F8F6F2] hover:text-[#0A1628]" role="menuitem">
                        {link.label}
                      </Link>
                    ))}
                <button type="button" onClick={() => { setIsProfileOpen(false); useCartStore.getState().clearCart(); clearWishlist(); signOut({ callbackUrl: "/" }); }} className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left font-semibold text-red-700 transition hover:bg-red-50" role="menuitem">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : isAuthResolved ? (
            <Link href="/login" className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#0A1628] px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900">
              <User size={17} />
              Login / Register
            </Link>
          ) : (
            <div className="h-10 w-36 rounded-full border border-slate-200 bg-white" aria-hidden="true" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-sm xl:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2 text-sm text-slate-700">
            <form action="/shop" className="mb-2 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3">
              <Search size={17} className="text-slate-500" />
              <input name="search" type="search" placeholder="Search jewelry" className="min-w-0 flex-1 bg-transparent outline-none" />
            </form>
            {primaryNavLinks.map((link) => (
              <Link key={`${link.href}-${link.label}`} href={link.label === "Home" && isAuthenticated ? dashboardHref : link.href} onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-3 transition hover:bg-[#F8F6F2] hover:text-[#C9A84C]">
                {link.label}
              </Link>
            ))}
            <Link href="/wishlist" onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-3 transition hover:bg-[#F8F6F2] hover:text-[#C9A84C]">Wishlist</Link>
            <Link href="/cart" onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-3 transition hover:bg-[#F8F6F2] hover:text-[#C9A84C]">Cart</Link>
            {isAuthenticated ? (
              <>
                <Link href="/account/orders" onClick={() => { markAccountMessagesRead(); setIsOpen(false); }} className="flex items-center justify-between gap-2 rounded-lg px-3 py-3 transition hover:bg-[#F8F6F2]">
                  <span className="flex items-center gap-2">
                    <Mail size={16} />
                    Account messages
                  </span>
                  {unreadAccountMessages > 0 && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">{unreadAccountMessages}</span>}
                </Link>
                {profileLinks.map((link) => (
                  <Link key={link.label} href={link.href} onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-3 font-medium text-[#0A1628] transition hover:bg-[#F8F6F2]">
                    {link.label}
                  </Link>
                ))}
                <button type="button" onClick={() => { setIsOpen(false); useCartStore.getState().clearCart(); clearWishlist(); signOut({ callbackUrl: "/" }); }} className="flex items-center gap-2 rounded-lg px-3 py-3 text-left font-medium text-red-700 transition hover:bg-red-50">
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : isAuthResolved ? (
              <div className="grid gap-2 pt-2">
                <Link href="/login" onClick={() => setIsOpen(false)} className="inline-flex items-center gap-2 rounded-lg bg-[#0A1628] px-3 py-3 font-medium text-white">
                  <User size={16} />
                  Login
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-3 font-medium text-[#0A1628]">
                  <UserPlus size={16} />
                  Register
                </Link>
              </div>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}
