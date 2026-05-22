import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";
import { Badge } from "@/components/ui/badge";
import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import ReviewModel from "@/models/Review";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProductData(slug: string) {
  try {
    await connectDB();
    const product = await ProductModel.findOne({ slug, isPublished: true }).lean();
    if (!product) {
      return { product: null, reviews: [], isDemo: false };
    }

    const reviews = await ReviewModel.find({ product: product._id, isApproved: true }).sort({ createdAt: -1 }).limit(5).lean();
    return { product, reviews, isDemo: false };
  } catch {
    return { product: null, reviews: [], isDemo: true };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  await connection();
  const { slug } = await params;
  const { product, reviews, isDemo } = await getProductData(slug);

  if (!product) {
    return (
      <div className="px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">{isDemo ? "Database unavailable" : "Product not found"}</h1>
        <p className="mt-4 text-slate-600">{isDemo ? "Start MongoDB or update MONGODB_URI to render this product from Mongoose." : "The product you&apos;re looking for is unavailable or has been removed."}</p>
        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Back to shop</Link>
      </div>
    );
  }

  const productImages = (product.images ?? []).map((image) => ({
    url: image.url,
    isPrimary: Boolean(image.isPrimary),
  }));
  const primaryImage = productImages.find((image) => image.isPrimary)?.url ?? productImages[0]?.url ?? "/favicon.ico";

  return (
    <div className="space-y-10 px-6 py-10 md:px-10 lg:px-16">
      <div className="flex flex-col gap-3 text-sm text-slate-600">
        <Link href="/shop" className="underline decoration-[#C9A84C]/40">Shop</Link>
        <span>{product.name}</span>
      </div>
      <div className="grid gap-10 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-8">
          <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <div className="relative h-[520px] overflow-hidden rounded-lg bg-slate-100">
              <Image src={primaryImage} alt={product.name} fill sizes="(min-width: 1280px) 60vw, 100vw" loading="eager" unoptimized className="object-cover" />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {productImages.slice(0, 3).map((image) => (
                <div key={image.url} className="relative h-40 overflow-hidden rounded-lg bg-slate-100">
                  <Image src={image.url} alt={product.name} fill sizes="(min-width: 640px) 33vw, 100vw" unoptimized className="object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="gold">{product.material}</Badge>
              <Badge variant="light">{product.gemstone}</Badge>
              <Badge variant="light">{product.occasion}</Badge>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-[#0A1628]">Product details</h2>
              <p className="leading-7 text-slate-600">{product.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Care</p>
                <p className="mt-3 text-slate-700">{product.careInstructions}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Shipping</p>
                <p className="mt-3 text-slate-700">Free express shipping, gift wrapping available, and easy returns.</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[#0A1628]">Reviews</h3>
            {reviews.length === 0 ? (
              <p className="mt-4 text-slate-600">No reviews yet. Be the first to share your experience.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {reviews.map((review) => (
                  <div key={review._id.toString()} className="rounded-lg bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                      <span>{review.userName}</span>
                      <span>{review.rating} / 5</span>
                    </div>
                    <h4 className="mt-3 font-semibold text-[#0A1628]">{review.title}</h4>
                    <p className="mt-2 text-slate-600">{review.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <ProductDetailClient id={product._id.toString()} name={product.name} price={product.price} images={productImages} sku={product.sku} material={product.material} gemstone={product.gemstone} weight={product.weight} occasion={product.occasion} />
      </div>
    </div>
  );
}
