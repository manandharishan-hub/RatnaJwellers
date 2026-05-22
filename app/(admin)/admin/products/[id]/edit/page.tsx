import { notFound } from "next/navigation";
import { ProductForm, ProductFormValue } from "@/components/admin/ProductForm";
import { requireAdminPage } from "@/lib/adminGuard";
import { connectDB } from "@/lib/mongodb";
import CategoryModel from "@/models/Category";
import ProductModel from "@/models/Product";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

async function getCategories() {
  await connectDB();
  const categories = await CategoryModel.find({ isActive: true }).sort({ name: 1 }).lean();
  return categories.map((category) => ({ _id: category._id.toString(), name: category.name }));
}

async function getProduct(id: string): Promise<ProductFormValue | null> {
  await connectDB();
  const product = await ProductModel.findById(id).lean();
  if (!product) return null;

  return {
    _id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    careInstructions: product.careInstructions,
    price: product.price,
    comparePrice: product.comparePrice,
    costPrice: product.costPrice,
    images: product.images ?? [],
    category: product.category?.toString() ?? "",
    subCategory: product.subCategory?.toString() ?? null,
    tags: product.tags ?? [],
    material: product.material,
    gemstone: product.gemstone,
    weight: product.weight,
    occasion: product.occasion,
    variants: product.variants ?? [],
    totalStock: product.totalStock,
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireAdminPage();
  const { id } = await params;
  const [product, categories] = await Promise.all([getProduct(id), getCategories()]);
  if (!product) notFound();

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Edit product</h1>
        <p className="mt-2 text-slate-600">Update catalog details, images, pricing, and inventory.</p>
      </div>
      <ProductForm mode="edit" product={product} categories={categories} />
    </div>
  );
}
