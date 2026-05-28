import Link from "next/link";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { requireAdminPage } from "@/lib/adminGuard";
import { centsToCurrency } from "@/lib/utils";
import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Search, Edit2, Archive } from "lucide-react";

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
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Product Management</h1>
          <p className="admin-muted">View, add, edit, and manage your jewelry products.</p>
        </div>
        <Link href="/admin/products/new" className="lux-button-primary">
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="surface-panel flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search products by name or SKU..." className="lux-input pl-10" />
        </div>
        <button className="lux-button-secondary rounded-lg px-4 py-2">Filter</button>
        <button className="lux-button-secondary rounded-lg px-4 py-2">Sort</button>
      </div>

      <div className="admin-surface">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No products found</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id.toString()}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-950">{product.name}</p>
                        <p className="text-xs text-slate-500">SKU: {product.sku || "-"}</p>
                      </div>
                    </td>
                    <td>{(product.category as any)?.name || "-"}</td>
                    <td className="font-medium text-slate-950">{centsToCurrency(product.price)}</td>
                    <td>
                      <span className={`status-pill ${
                        product.totalStock > 10 ? "bg-green-100 text-green-800" :
                        product.totalStock > 0 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {product.totalStock} units
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${product.isPublished ? "bg-[#EAF3FF] text-[#1D4E89]" : "bg-slate-100 text-slate-700"}`}>
                        {product.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link href={`/admin/products/${product._id.toString()}/edit`} className="rounded p-1.5 text-[#0A1628] transition-colors hover:bg-[#F7F1D1]" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button className="rounded p-1.5 text-[#9A7627] transition-colors hover:bg-[#F7F1D1]" title="Archive">
                          <Archive className="h-4 w-4" />
                        </button>
                        <DeleteProductButton productId={product._id.toString()} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-slate-600">Total Products</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{products.length}</p>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-slate-600">Published</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{products.filter((product) => product.isPublished).length}</p>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-slate-600">Drafts</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{products.filter((product) => !product.isPublished).length}</p>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-slate-600">Low Stock</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{products.filter((product) => product.totalStock <= 5).length}</p>
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
