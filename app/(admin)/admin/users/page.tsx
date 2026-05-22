import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/serverAuth";
import UserModel from "@/models/User";

export const dynamic = "force-dynamic";

async function requireAdminPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/admin/login");
  if (user.role !== "admin") redirect("/dashboard");
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
    <div className="min-h-screen bg-slate-50 px-5 py-8 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase text-[#0F766E]">Admin</p>
          <h1 className="text-3xl font-semibold text-[#0A1628]">User management</h1>
          <p className="mt-2 text-slate-600">View registered Ratna Jeweler&apos;s users and their access roles.</p>
        </div>
        {isOffline && <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">MongoDB is not reachable.</div>}
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Verified</th>
                <th className="px-5 py-3">Blocked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user._id.toString()}>
                  <td className="px-5 py-4 font-semibold text-[#0A1628]">{user.name}</td>
                  <td className="px-5 py-4 text-slate-600">{user.email}</td>
                  <td className="px-5 py-4 capitalize text-slate-600">{user.role === "customer" ? "user" : user.role}</td>
                  <td className="px-5 py-4 text-slate-600">{user.isVerified ? "Yes" : "No"}</td>
                  <td className="px-5 py-4 text-slate-600">{user.isBlocked ? "Yes" : "No"}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
