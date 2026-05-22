import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";

async function getAdminUsers() {
  await connectDB();
  return UserModel.find({ role: { $in: ["admin", "superadmin"] } }).sort({ createdAt: -1 }).lean();
}

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0A1628]">Admin users</h1>
          <p className="text-slate-600">Manage administrator accounts and review access status.</p>
        </div>
        <button className="rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Add admin</button>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {users.map((user) => (
              <tr key={user._id.toString()}>
                <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">{user.isBlocked ? "Deactivated" : "Active"}</td>
                <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
