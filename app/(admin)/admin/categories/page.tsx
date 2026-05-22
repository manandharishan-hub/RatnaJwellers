import { connectDB } from "@/lib/mongodb";
import CategoryModel from "@/models/Category";

async function getCategories() {
  await connectDB();
  return CategoryModel.find().populate("parent", "name").sort({ name: 1 }).lean();
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0A1628]">Categories</h1>
          <p className="text-slate-600">Manage category labels and storefront navigation groups.</p>
        </div>
        <div className="rounded-full bg-[#F7F1D1] px-4 py-2 text-sm font-semibold text-[#0A1628]">
          {categories.length} categories
        </div>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Parent</th>
              <th className="px-6 py-4">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {categories.map((category) => (
              <tr key={category._id.toString()}>
                <td className="px-6 py-4 font-medium text-slate-900">{category.name}</td>
                <td className="px-6 py-4">{category.slug}</td>
                <td className="px-6 py-4">{(category.parent as any)?.name ?? "—"}</td>
                <td className="px-6 py-4">{category.isActive ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
