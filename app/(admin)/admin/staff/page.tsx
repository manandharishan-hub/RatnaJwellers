import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Edit2, Trash2, Shield } from "lucide-react";

export default function StaffPage() {
  const staff = [
    { id: 1, name: "Admin User", email: "admin@ratna.com", role: "Super Admin", status: "active" },
    { id: 2, name: "John Manager", email: "john@ratna.com", role: "Manager", status: "active" },
    { id: 3, name: "Jane Editor", email: "jane@ratna.com", role: "Editor", status: "active" },
    { id: 4, name: "Mike Support", email: "mike@ratna.com", role: "Support", status: "inactive" },
  ];

  const roles = [
    { name: "Super Admin", permissions: ["All Access"] },
    { name: "Manager", permissions: ["Orders", "Products", "Customers"] },
    { name: "Editor", permissions: ["Content", "CMS"] },
    { name: "Support", permissions: ["Customer Support"] },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between md:flex-row md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff / Roles Management</h1>
            <p className="text-gray-600 mt-2">Manage staff members, assign roles, and control permissions.</p>
          </div>
          <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            <button className="px-4 py-2 border-b-2 border-blue-600 font-medium text-blue-600">Staff Members</button>
            <button className="px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900">Roles & Permissions</button>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{member.name}</td>
                    <td className="px-6 py-4 text-gray-600">{member.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        <Shield className="w-3 h-3" />
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        member.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-blue-100 rounded transition-colors">
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-1 hover:bg-red-100 rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roles Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Roles & Permissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <div key={role.name} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">{role.name}</h3>
                <ul className="space-y-2">
                  {role.permissions.map((perm) => (
                    <li key={perm} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
