import { AdminLayout } from "@/components/admin/AdminLayout";
import { InventoryManager } from "@/components/admin/InventoryManager";
import { requireAdminPage } from "@/lib/adminGuard";
import { connectDB } from "@/lib/mongodb";
import { serializeAdminProduct } from "@/lib/dto";
import ProductModel from "@/models/Product";

export const dynamic = "force-dynamic";

async function getProducts() {
  try {
    await connectDB();
    const products = await ProductModel.find().sort({ totalStock: 1, name: 1 }).lean();
    return products.map(serializeAdminProduct);
  } catch {
    return [];
  }
}

export default async function InventoryManagementPage() {
  await requireAdminPage();
  const products = await getProducts();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Monitor stock levels, update product stock, and find low-stock items.</p>
        </div>
        <InventoryManager initialProducts={products as any[]} />
      </div>
    </AdminLayout>
  );
}
