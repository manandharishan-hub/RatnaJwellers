import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/serverAuth";
import CategoryModel from "@/models/Category";

export const dynamic = "force-dynamic";

async function requireAdminPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/admin/login");
  if (user.role !== "admin") redirect("/dashboard");
}

export default async function AdminCategoriesPage() {
  await requireAdminPage();
  let categories: any[] = [];
  let isOffline = false;

  try {
    await connectDB();
    categories = await CategoryModel.find().populate("parent", "name").sort({ name: 1 }).lean();
  } catch {
    isOffline = true;
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] px-5 py-8 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9A7627]">Admin</p>
          <h1 className="font-serif text-4xl font-semibold text-[#0A1628]">Category management</h1>
          <p className="mt-2 text-slate-600">View jewellery categories used for rings, necklaces, bracelets, earrings, bangles, and collections.</p>
        </div>
        {isOffline && <div className="mb-5 rounded-lg border border-[#D8B35A]/50 bg-[#FFF8E6] px-4 py-3 text-sm text-[#6F5217]">MongoDB is not reachable.</div>}
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Parent</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {categories.map((category) => (
                <tr key={category._id.toString()}>
                  <td className="px-5 py-4 font-semibold text-[#0A1628]">{category.name}</td>
                  <td className="px-5 py-4 text-slate-600">{category.slug}</td>
                  <td className="px-5 py-4 text-slate-600">{category.parent?.name || "Top level"}</td>
                  <td className="px-5 py-4 text-slate-600">{category.isActive ? "Active" : "Inactive"}</td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-500">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
