import { AdminLayout } from "@/components/admin/AdminLayout";
import { Download, BarChart3, TrendingUp, Users, ShoppingCart } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between md:flex-row md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-2">View sales analytics, customer insights, and performance reports.</p>
          </div>
          <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg shadow text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">Rs. 12,45,000</p>
              </div>
              <TrendingUp className="w-10 h-10 opacity-20" />
            </div>
          </div>
          <div className="bg-linear-to-br from-green-500 to-emerald-500 rounded-lg shadow text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold mt-2">358</p>
              </div>
              <ShoppingCart className="w-10 h-10 opacity-20" />
            </div>
          </div>
          <div className="bg-linear-to-br from-purple-500 to-pink-500 rounded-lg shadow text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Customers</p>
                <p className="text-3xl font-bold mt-2">1,245</p>
              </div>
              <Users className="w-10 h-10 opacity-20" />
            </div>
          </div>
          <div className="bg-linear-to-br from-orange-500 to-red-500 rounded-lg shadow text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Avg Order Value</p>
                <p className="text-3xl font-bold mt-2">Rs. 3,475</p>
              </div>
              <BarChart3 className="w-10 h-10 opacity-20" />
            </div>
          </div>
        </div>

        {/* Report Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Analytics */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Analytics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600">Daily Sales</span>
                <span className="font-semibold text-gray-900">Rs. 45,200</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600">Weekly Sales</span>
                <span className="font-semibold text-gray-900">Rs. 3,16,400</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600">Monthly Sales</span>
                <span className="font-semibold text-gray-900">Rs. 12,45,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="font-semibold text-green-600">3.24%</span>
              </div>
            </div>
          </div>

          {/* Customer Growth */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Growth</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600">New Customers (Today)</span>
                <span className="font-semibold text-gray-900">12</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600">New Customers (Week)</span>
                <span className="font-semibold text-gray-900">84</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600">Returning Customers</span>
                <span className="font-semibold text-gray-900">892</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Growth Rate (Month)</span>
                <span className="font-semibold text-green-600">12.3%</span>
              </div>
            </div>
          </div>

          {/* Product Performance */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Products</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">{item}. Diamond Ring {item}</span>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">245 sales</p>
                    <p className="text-xs text-gray-500">Rs. 1,23,456</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Traffic Sources</h2>
            <div className="space-y-3">
              {[
                { source: "Direct", visitors: "2,345", conversion: "4.2%" },
                { source: "Search", visitors: "5,678", conversion: "2.8%" },
                { source: "Social Media", visitors: "3,456", conversion: "1.5%" },
              ].map((item) => (
                <div key={item.source} className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">{item.source}</span>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.visitors}</p>
                    <p className="text-xs text-gray-500">{item.conversion} conversion</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["PDF", "Excel", "CSV"].map((format) => (
              <button
                key={format}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <Download className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <p className="font-semibold text-gray-900">Export as {format}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
