import { AdminLayout } from "@/components/admin/AdminLayout";
import { CreditCard, CheckCircle, XCircle, Eye } from "lucide-react";

export default function PaymentsPage() {
  const transactions = [
    { id: 1, orderId: "ORD-001", amount: "Rs. 45,000", method: "eSewa", status: "success", date: "2024-05-20" },
    { id: 2, orderId: "ORD-002", amount: "Rs. 32,500", method: "Credit Card", status: "success", date: "2024-05-19" },
    { id: 3, orderId: "ORD-003", amount: "Rs. 78,900", method: "Bank Transfer", status: "pending", date: "2024-05-18" },
    { id: 4, orderId: "ORD-004", amount: "Rs. 25,000", method: "Cash on Delivery", status: "failed", date: "2024-05-17" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments & Transactions</h1>
          <p className="text-gray-600 mt-2">Monitor payment transactions, verify payments, and handle refunds.</p>
        </div>

        {/* Transaction Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{transactions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <p className="text-gray-600 text-sm font-medium">Successful</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {transactions.filter(t => t.status === "success").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <p className="text-gray-600 text-sm font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">
              {transactions.filter(t => t.status === "pending").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <p className="text-gray-600 text-sm font-medium">Failed</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {transactions.filter(t => t.status === "failed").length}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Order ID</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Method</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((trans) => (
                  <tr key={trans.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{trans.orderId}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{trans.amount}</td>
                    <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      {trans.method}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        trans.status === "success" ? "bg-green-100 text-green-800" :
                        trans.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {trans.status === "success" ? <CheckCircle className="w-3 h-3" /> : trans.status === "pending" ? "⏳" : <XCircle className="w-3 h-3" />}
                        {trans.status.charAt(0).toUpperCase() + trans.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{trans.date}</td>
                    <td className="px-6 py-4">
                      <button className="inline-flex items-center gap-1 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors text-xs font-medium">
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
