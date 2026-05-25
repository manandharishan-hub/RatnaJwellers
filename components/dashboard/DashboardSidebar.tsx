"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Gem, Heart, MapPin, Menu, Package, Sparkles, Star, WandSparkles, X } from "lucide-react";

const sidebarGroups = [
  {
    title: "Shop",
    links: [
      { href: "/shop?sort=newest", label: "New Arrivals", icon: Sparkles },
      { href: "/shop?sort=popular", label: "Best Sellers", icon: Star },
      { href: "/custom-jewelry", label: "Custom Jewelry", icon: WandSparkles },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/account/orders", label: "Orders", icon: Package },
      { href: "/wishlist", label: "Wishlist", icon: Heart },
      { href: "/account/addresses", label: "Addresses", icon: MapPin },
    ],
  },
];

function isActiveLink(pathname: string, href: string) {
  const cleanHref = href.split("?")[0];
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-[0_18px_50px_rgba(10,22,40,0.08)]">
      <div className="rounded-xl border border-[#D8B35A]/30 bg-[#FBFAF7] p-4">
        <div className="mb-3 h-1 w-10 rounded-full bg-[#D8B35A]" />
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A1628] text-[#D8B35A]">
            <Gem size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7627]">Ratna Jewels</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">Quick access to your jewellery orders and curated collections.</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 space-y-7">
        {sidebarGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7627]">{group.title}</p>
            <div className="space-y-1.5">
              {group.links.map((link) => {
                const Icon = link.icon;
                const active = isActiveLink(pathname, link.href);

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={onNavigate}
                    className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold leading-6 transition-all duration-200 ${
                      active
                        ? "bg-[#0A1628] text-white shadow-sm"
                        : "text-[#0A1628] hover:-translate-y-0.5 hover:bg-[#FBFAF7] hover:text-[#9A7627]"
                    }`}
                  >
                    <span className={`absolute left-0 top-3 h-6 w-1 rounded-r-full transition-all duration-200 ${active ? "bg-[#D8B35A]" : "bg-transparent group-hover:bg-[#D8B35A]"}`} />
                    <Icon size={17} className={active ? "text-[#D8B35A]" : "text-slate-500 transition group-hover:text-[#9A7627]"} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#0A1628] shadow-sm transition hover:border-[#D8B35A] hover:text-[#9A7627] lg:hidden"
      >
        <Menu size={17} />
        Dashboard menu
      </button>

      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <SidebarContent />
        </div>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button type="button" aria-label="Close dashboard menu" onClick={() => setIsOpen(false)} className="absolute inset-0 bg-[#0A1628]/40 backdrop-blur-sm" />
          <div className="absolute left-0 top-0 h-full w-[min(88vw,320px)] overflow-y-auto bg-[#F8F6F2] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9A7627]">Menu</p>
              <button type="button" onClick={() => setIsOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0A1628] shadow-sm">
                <X size={18} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
