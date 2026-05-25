import { connectDB } from "@/lib/mongodb";
import { requireAdminPage } from "@/lib/adminGuard";
import CategoryModel from "@/models/Category";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { serializeCategory } from "@/lib/dto";

export const dynamic = "force-dynamic";

function CategoriesContent({ categories, isOffline }: { categories: any[]; isOffline: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-2">Organize and manage product categories (Rings, Necklaces, Earrings, etc.).</p>
        </div>
      </div>
      {isOffline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          MongoDB is not reachable. Categories data is unavailable.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Categories</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{categories.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Active Categories</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {categories.filter(c => c.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Inactive Categories</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {categories.filter(c => !c.isActive).length}
          </p>
        </div>
      </div>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}

export default async function AdminCategoriesPage() {
  await requireAdminPage();
  let categories: any[] = [];
  let isOffline = false;

  try {
    await connectDB();
    const docs = await CategoryModel.find().populate("parent", "name").sort({ name: 1 }).lean();
    categories = docs.map(serializeCategory);
  } catch {
    isOffline = true;
  }

  return (
    <AdminLayout>
      <CategoriesContent categories={categories} isOffline={isOffline} />
    </AdminLayout>
  );
}
