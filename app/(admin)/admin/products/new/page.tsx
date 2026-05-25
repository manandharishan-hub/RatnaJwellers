import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdminPage } from "@/lib/adminGuard";
import { connectDB } from "@/lib/mongodb";
import CategoryModel from "@/models/Category";

async function getCategories() {
  try {
    await connectDB();
    const categories = await CategoryModel.find({ isActive: true }).sort({ name: 1 }).lean();
    return categories.map((category) => ({ _id: category._id.toString(), name: category.name }));
  } catch {
    return [];
  }
}

export default async function NewProductPage() {
  await requireAdminPage();
  const categories = await getCategories();

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Add product</h1>
        <p className="mt-2 text-slate-600">Add product details, photos, price, and stock.</p>
        {categories.length === 0 && <p className="mt-3 text-sm text-slate-500">Categories are not available right now. Please check the database connection.</p>}
      </div>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
