import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import ReviewModel from "@/models/Review";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";
import { Badge } from "@/components/ui/badge";

interface ProductPageProps {
  params: { slug: string };
}

async function getProduct(slug: string) {
  await connectDB();
  return ProductModel.findOne({ slug, isPublished: true }).lean();
}

async function getReviews(productId: string) {
  await connectDB();
  return ReviewModel.find({ product: productId, isApproved: true }).sort({ createdAt: -1 }).limit(5).lean();
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    return (
      <div className="px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Product not found</h1>
        <p className="mt-4 text-slate-600">The product you&apos;re looking for is unavailable or has been removed.</p>
      </div>
    );
  }

  const reviews = await getReviews(product._id.toString());
  const primaryImage = product.images?.find((image) => image.isPrimary)?.url ?? product.images?.[0]?.url ?? "/favicon.ico";

  return (
    <div className="space-y-10 px-6 py-10 md:px-10 lg:px-16">
      <div className="flex flex-col gap-3 text-sm text-slate-600">
        <a href="/shop" className="underline decoration-[#C9A84C]/40">Shop</a>
        <span>{product.name}</span>
      </div>
      <div className="grid gap-10 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-8">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="overflow-hidden rounded-[2rem] bg-slate-100">
              <img src={primaryImage} alt={product.name} className="h-[520px] w-full object-cover" />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {product.images.slice(0, 3).map((image) => (
                <div key={image.url} className="overflow-hidden rounded-3xl bg-slate-100">
                  <img src={image.url} alt={product.name} className="h-40 w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="gold">{product.material}</Badge>
              <Badge variant="light">{product.gemstone}</Badge>
              <Badge variant="light">{product.occasion}</Badge>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-[#0A1628]">Product details</h2>
              <p className="text-slate-600 leading-7">{product.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Care</p>
                <p className="mt-3 text-slate-700">{product.careInstructions}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Shipping</p>
                <p className="mt-3 text-slate-700">Free express shipping, gift wrapping available, and easy returns.</p>
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[#0A1628]">Reviews</h3>
            {reviews.length === 0 ? (
              <p className="mt-4 text-slate-600">No reviews yet. Be the first to share your experience.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {reviews.map((review) => (
                  <div key={review._id.toString()} className="rounded-3xl bg-slate-50 p-5">
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
        <ProductDetailClient id={product._id.toString()} name={product.name} price={product.price} images={product.images} sku={product.sku} material={product.material} gemstone={product.gemstone} weight={product.weight} occasion={product.occasion} />
      </div>
    </div>
  );
}
