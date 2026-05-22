import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";

async function getInventory() {
  await connectDB();
  return ProductModel.find().sort({ totalStock: 1 }).lean();
}

export default async function AdminInventoryPage() {
  const products = await getInventory();

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0A1628]">Inventory</h1>
          <p className="text-slate-600">Monitor stock levels and available variants across your catalog.</p>
        </div>
        <div className="rounded-full bg-[#F7F1D1] px-4 py-2 text-sm font-semibold text-[#0A1628]">
          {products.length} products tracked
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Variants</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {products.map((product) => (
              <tr key={product._id.toString()}>
                <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                <td className="px-6 py-4">{product.totalStock}</td>
                <td className="px-6 py-4">{product.variants?.length ?? 0}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                  {product.totalStock === 0 ? "Out of stock" : product.totalStock < 10 ? "Low stock" : "In stock"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
