import type { ProductDoc } from "@/models/Product";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductWishlistButton } from "@/components/shop/ProductWishlistButton";
import { centsToCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: ProductDoc & { _id: string };
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find((image) => image.isPrimary)?.url ?? product.images?.[0]?.url ?? "/favicon.ico";
  const isOutOfStock = (product.totalStock ?? 0) <= 0;

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#D8B35A] hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden bg-slate-100">
        <div className="relative aspect-[4/5] w-full">
          <Image src={primaryImage} alt={product.name} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" unoptimized className="object-cover transition duration-300 group-hover:scale-105" />
        </div>
        {product.isNewArrival && <Badge className="absolute left-4 top-4">New</Badge>}
        {product.isBestSeller && <Badge className="absolute right-4 top-4">Best seller</Badge>}
        {isOutOfStock && <Badge className="absolute bottom-4 left-4 bg-red-600 text-white">Out of stock</Badge>}
      </Link>
      <div className="space-y-3 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-h-12 text-base font-semibold leading-6 text-slate-950">{product.name}</h3>
          <ProductWishlistButton productId={product._id.toString()} name={product.name} image={primaryImage} price={product.price} />
        </div>
        <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-[#0A1628]">{centsToCurrency(product.price)}</p>
            {product.comparePrice > product.price && (
              <p className="text-sm text-slate-500 line-through">{centsToCurrency(product.comparePrice)}</p>
            )}
          </div>
          <Link href={`/product/${product.slug}`} className="lux-button-primary px-4 py-2">
            <ShoppingBag size={16} />
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
