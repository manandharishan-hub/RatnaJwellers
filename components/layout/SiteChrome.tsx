"use client";

import { usePathname } from "next/navigation";
import { AdminShortcut } from "@/components/layout/AdminShortcut";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PreviousPageButton } from "@/components/layout/PreviousPageButton";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith("/admin");
  const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"].some((route) => pathname?.startsWith(route));

  if (isAdminArea || isAuthPage) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <PreviousPageButton />
      <main>{children}</main>
      <AdminShortcut />
      <Footer />
    </>
  );
}
