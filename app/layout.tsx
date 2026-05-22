import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminShortcut } from "@/components/layout/AdminShortcut";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Ratna Jewels | Luxury Jewelry Store",
  description: "Ratna Jewels is a luxury jewelry ecommerce experience with curated collections, secure checkout, and premium customer support.",
  openGraph: {
    title: "Ratna Jewels",
    description: "Luxury jewelry ecommerce experience with premium designs and secure checkout.",
    url: "https://ratnajewels.com",
    siteName: "Ratna Jewels",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-[#F8F6F2] font-sans text-slate-900 antialiased">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <AdminShortcut />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
