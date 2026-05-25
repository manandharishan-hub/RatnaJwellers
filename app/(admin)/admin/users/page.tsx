import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/serverAuth";
import UserModel from "@/models/User";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Search, UserX, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

async function requireAdminPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/admin/login");
  if (user.role !== "admin") redirect("/dashboard");
}

function CustomersContent({ users, isOffline }: { users: any[], isOffline: boolean }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 mt-2">View registered customers, manage access, and monitor user accounts.</p>
      </div>

      {/* Offline Alert */}
      {isOffline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          MongoDB is not reachable. Customer data is unavailable.
        </div>
      )}

      {/* Search */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search customers by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
          Filter
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Role</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Verified</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No customers found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id.toString()} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        Customer
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isVerified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.isVerified ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            Verified
                          </>
                        ) : (
                          "Unverified"
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {user.isBlocked ? (
                          <>
                            <UserX className="w-3 h-3" />
                            Blocked
                          </>
                        ) : (
                          "Active"
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Verified</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {users.filter(u => u.isVerified).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Unverified</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {users.filter(u => !u.isVerified).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Blocked</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {users.filter(u => u.isBlocked).length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function AdminUsersPage() {
  await requireAdminPage();
  let users: any[] = [];
  let isOffline = false;
  try {
    await connectDB();
    users = await UserModel.find().select("name email role isVerified isBlocked createdAt").sort({ createdAt: -1 }).limit(100).lean();
  } catch {
    isOffline = true;
  }

  return (
    <AdminLayout>
      <CustomersContent users={users} isOffline={isOffline} />
    </AdminLayout>
  );
}
