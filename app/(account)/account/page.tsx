"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ArrowRight, Heart, MapPin, Package, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/store/cartStore";
import { useWishlistStore } from "@/hooks/store/wishlistStore";
import { centsToCurrency } from "@/lib/utils";

export default function AccountDashboardPage() {
  const { data: session, status } = useSession();
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (status === "loading") {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-slate-600">Loading your account...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-[#F8F6F2] px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0A1628] text-white">
            <UserRound size={28} />
          </div>
          <h1 className="mt-6 font-serif text-4xl font-semibold text-[#0A1628]">Sign in to view your dashboard.</h1>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
            Access your order history, saved items, profile, addresses, and checkout details from one place.
          </p>
          <Link href="/login" className="mt-7 inline-flex rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const accountLinks = [
    { href: "/account/profile", label: "Profile", text: "Manage your name, email, and account details.", icon: UserRound },
    { href: "/account/orders", label: "Orders", text: "Track purchases and view order history.", icon: Package },
    { href: "/account/addresses", label: "Addresses", text: "Keep shipping information ready for checkout.", icon: MapPin },
    { href: "/account/wishlist", label: "Wishlist", text: "Return to saved jewelry pieces.", icon: Heart },
  ];

  return (
    <div className="bg-[#F8F6F2] px-6 py-10 md:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 rounded-lg bg-[#0A1628] p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-[#D8B35A]">My account</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold">Welcome, {session.user?.name || "jewelry lover"}.</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Your dashboard brings orders, saved pieces, cart activity, and profile settings into a simple workspace.
            </p>
          </div>
          <Button onClick={() => signOut({ callbackUrl: "/" })} className="bg-white text-[#0A1628] hover:bg-slate-100">
            Sign out
          </Button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase text-slate-500">Cart items</p>
            <p className="mt-5 text-3xl font-semibold text-[#0A1628]">{cartCount}</p>
            <p className="mt-2 text-sm text-slate-600">{centsToCurrency(cartTotal)} currently in cart</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase text-slate-500">Saved pieces</p>
            <p className="mt-5 text-3xl font-semibold text-[#0A1628]">{wishlistItems.length}</p>
            <p className="mt-2 text-sm text-slate-600">Ready to compare or add to cart</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase text-slate-500">Account email</p>
            <p className="mt-5 break-words text-lg font-semibold text-[#0A1628]">{session.user?.email}</p>
            <p className="mt-2 text-sm text-slate-600">Used for order updates</p>
          </article>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="grid gap-5 md:grid-cols-2">
            {accountLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#D8B35A] hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A1628] text-white">
                    <Icon size={21} />
                  </div>
                  <h2 className="mt-5 font-serif text-2xl font-semibold text-[#0A1628]">{item.label}</h2>
                  <p className="mt-2 leading-7 text-slate-600">{item.text}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#9A7627]">
                    Open
                    <ArrowRight size={16} />
                  </span>
                </Link>
              );
            })}
          </section>

          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D8B35A] text-[#0A1628]">
                <ShoppingBag size={21} />
              </div>
              <div>
                <p className="font-semibold text-[#0A1628]">Ready to checkout?</p>
                <p className="text-sm text-slate-600">Review your cart before payment.</p>
              </div>
            </div>
            <Link href="/cart" className="mt-6 flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#D8B35A] hover:bg-[#FBFAF7]">
              View cart
              <ArrowRight size={16} />
            </Link>
            <Link href="/shop" className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#D8B35A] hover:bg-[#FBFAF7]">
              Continue shopping
              <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
