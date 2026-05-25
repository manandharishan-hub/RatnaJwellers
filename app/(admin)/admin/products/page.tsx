import Link from "next/link";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { requireAdminPage } from "@/lib/adminGuard";
import { centsToCurrency } from "@/lib/utils";
import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Search, Edit2, Trash2, Archive } from "lucide-react";

async function getProducts() {
  try {
    await connectDB();
    return ProductModel.find().populate("category", "name").sort({ createdAt: -1 }).lean();
  } catch {
    return [];
  }
}

function ProductsContent({ products }: { products: any[] }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between md:flex-row md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-2">View, add, edit, and manage your jewelry products.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Actions Bar */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
          Filter
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
          Sort
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Product Name</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Category</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Price</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Stock</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No products found</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id.toString()} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku || "—"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{(product.category as any)?.name || "—"}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {centsToCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        product.totalStock > 10 ? "bg-green-100 text-green-800" :
                        product.totalStock > 0 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {product.totalStock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isPublished ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {product.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link 
                          href={`/admin/products/${product._id.toString()}/edit`} 
                          className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </Link>
                        <button 
                          className="p-1.5 hover:bg-yellow-100 rounded transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4 text-yellow-600" />
                        </button>
                        <DeleteProductButton 
                          productId={product._id.toString()} 
                          productName={product.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Published</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {products.filter(p => p.isPublished).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Drafts</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {products.filter(p => !p.isPublished).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Low Stock</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {products.filter(p => p.totalStock <= 5).length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function AdminProductsPage() {
  await requireAdminPage();
  const products = await getProducts();

  return (
    <AdminLayout>
      <ProductsContent products={products} />
    </AdminLayout>
  );
}
