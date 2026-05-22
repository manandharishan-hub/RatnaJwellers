import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import Link from "next/link";

async function getProducts() {
  await connectDB();
  return ProductModel.find().populate("category", "name").sort({ createdAt: -1 }).lean();
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0A1628]">Manage products</h1>
          <p className="text-slate-600">Create, edit, and monitor inventory for your collections.</p>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 inline-flex">Add product</Link>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {products.map((product) => (
              <tr key={product._id.toString()}>
                <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                <td className="px-6 py-4">{(product.category as any)?.name ?? "Uncategorized"}</td>
                <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4">{product.totalStock}</td>
                <td className="px-6 py-4">{product.isPublished ? "Published" : "Draft"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
