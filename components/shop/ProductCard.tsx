import type { ProductDoc } from "@/models/Product";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWishlistStore } from "@/hooks/store/wishlistStore";

interface ProductCardProps {
  product: ProductDoc & { _id: string };
}

export function ProductCard({ product }: ProductCardProps) {
  const addWishlist = useWishlistStore((state) => state.addItem);

  const primaryImage = product.images?.find((image) => image.isPrimary)?.url ?? product.images?.[0]?.url ?? "/favicon.ico";

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden bg-slate-100">
        <img src={primaryImage} alt={product.name} className="h-72 w-full object-cover transition duration-300 group-hover:scale-105" />
        {product.isNewArrival && <Badge className="absolute left-4 top-4">New</Badge>}
        {product.isBestSeller && <Badge className="absolute right-4 top-4">Best seller</Badge>}
      </Link>
      <div className="space-y-3 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
          <button
            type="button"
            onClick={() => addWishlist({ productId: product._id, name: product.name, image: primaryImage, price: product.price })}
            className="rounded-full bg-slate-100 p-2 text-slate-700 transition hover:bg-[#C9A84C]/10 hover:text-[#0A1628]"
          >
            <Heart size={16} />
          </button>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-[#0A1628]">${(product.price / 100).toFixed(2)}</p>
            {product.comparePrice > product.price && (
              <p className="text-sm text-slate-500 line-through">${(product.comparePrice / 100).toFixed(2)}</p>
            )}
          </div>
          <Link href={`/product/${product.slug}`} className="inline-flex items-center gap-2 rounded-full bg-[#0A1628] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#111827]/90">
            <ShoppingBag size={16} />
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
