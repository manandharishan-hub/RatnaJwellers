import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="bg-[#0A1628] text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10 px-6 py-16 text-sm">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <Link href="/" aria-label="Ratna Jewels home" className="mb-4 inline-flex">
              <Image src="/logo.png" alt="Ratna Jewels" width={156} height={58} className="h-11 w-auto object-contain" />
            </Link>
            <p className="max-w-sm leading-7 text-slate-300">
              Timeless jewelry with a refined luxury experience, secure checkout, and personal care advice for every selection.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Shop</h4>
            <ul className="space-y-2 text-slate-300">
              <li><Link href="/shop">All Jewelry</Link></li>
              <li><Link href="/shop?category=Rings">Rings</Link></li>
              <li><Link href="/shop?category=Necklaces">Necklaces</Link></li>
              <li><Link href="/shop?category=Bracelets">Bracelets</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Customer</h4>
            <ul className="space-y-2 text-slate-300">
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Contact</h4>
            <p className="text-slate-300">support@ratnajewels.com</p>
            <p className="text-slate-300">+1 (555) 987-6543</p>
            <div className="mt-4 flex gap-3 text-slate-200">
              <a href="https://facebook.com" aria-label="Facebook" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A84C] text-[#0A1628] transition hover:bg-[#F7E8B1]">
                <FaFacebookF size={15} />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A84C] text-[#0A1628] transition hover:bg-[#F7E8B1]">
                <FaInstagram size={17} />
              </a>
              <a href="https://x.com" aria-label="Twitter" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A84C] text-[#0A1628] transition hover:bg-[#F7E8B1]">
                <FaXTwitter size={15} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700/60 pt-6 text-center text-slate-500">Copyright {new Date().getFullYear()} Ratna Jewels. All rights reserved.</div>
      </div>
    </footer>
  );
}
