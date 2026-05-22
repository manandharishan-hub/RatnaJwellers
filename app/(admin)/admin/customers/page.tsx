import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";

async function getCustomers() {
  await connectDB();
  return UserModel.find({ role: "customer" }).sort({ createdAt: -1 }).lean();
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0A1628]">Customers</h1>
          <p className="text-slate-600">View customer accounts and monitor membership status.</p>
        </div>
        <div className="rounded-full bg-[#F7F1D1] px-4 py-2 text-sm font-semibold text-[#0A1628]">
          {customers.length} customers
        </div>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Verified</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {customers.map((customer) => (
              <tr key={customer._id.toString()}>
                <td className="px-6 py-4 font-medium text-slate-900">{customer.name}</td>
                <td className="px-6 py-4">{customer.email}</td>
                <td className="px-6 py-4">{customer.isVerified ? "Yes" : "No"}</td>
                <td className="px-6 py-4">{customer.isBlocked ? "Blocked" : "Active"}</td>
                <td className="px-6 py-4">{new Date(customer.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
