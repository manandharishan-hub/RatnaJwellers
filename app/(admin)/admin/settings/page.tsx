import { AdminLayout } from "@/components/admin/AdminLayout";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { requireAdminPage } from "@/lib/adminGuard";

export default async function SettingsPage() {
  await requireAdminPage();
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage store settings, security, notifications, and preferences.</p>
        </div>
        <SettingsManager />
      </div>
    </AdminLayout>
  );
}
