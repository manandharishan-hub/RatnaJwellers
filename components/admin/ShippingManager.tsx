"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Eye, Plus, Truck } from "lucide-react";

type Order = {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  status: string;
  trackingNumber?: string;
  shippingMethod?: string;
  updatedAt?: string;
};

export function ShippingManager({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [formOpen, setFormOpen] = useState(false);
  const [orderId, setOrderId] = useState(initialOrders.find((order) => !order.trackingNumber)?._id || initialOrders[0]?._id || "");
  const [courier, setCourier] = useState("Standard Courier");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipmentStatus, setShipmentStatus] = useState("packed");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function createShipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const selected = orders.find((order) => order._id === orderId);
    if (!selected) {
      setError("Choose an order.");
      return;
    }
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: shipmentStatus,
        trackingNumber,
        note: `Shipment created with ${courier}.`,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.message || "Unable to create shipment.");
      return;
    }
    setOrders((current) => current.map((order) => (order._id === orderId ? { ...order, status: data.status, trackingNumber: data.trackingNumber, shippingMethod: courier } : order)));
    setTrackingNumber("");
    setFormOpen(false);
    setMessage("Shipment created.");
  }

  const delivered = orders.filter((order) => order.status === "delivered").length;
  const inTransit = orders.filter((order) => ["packed", "shipped", "out-for-delivery"].includes(order.status)).length;
  const processing = orders.filter((order) => ["pending", "processing"].includes(order.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipping & Delivery</h1>
          <p className="text-gray-600 mt-2">Create shipments, assign couriers, and update tracking numbers.</p>
        </div>
        <button type="button" onClick={() => setFormOpen((value) => !value)} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Create Shipment
        </button>
      </div>

      {formOpen && (
        <form onSubmit={createShipment} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow md:grid-cols-3">
          <select value={orderId} onChange={(event) => setOrderId(event.target.value)} className="rounded-lg border border-gray-300 px-4 py-2" required>
            <option value="">Choose order</option>
            {orders.map((order) => <option key={order._id} value={order._id}>{order.orderNumber} - {order.customerName || order.customerEmail}</option>)}
          </select>
          <input value={courier} onChange={(event) => setCourier(event.target.value)} placeholder="Courier" className="rounded-lg border border-gray-300 px-4 py-2" required />
          <input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Tracking number" className="rounded-lg border border-gray-300 px-4 py-2" required />
          <select value={shipmentStatus} onChange={(event) => setShipmentStatus(event.target.value)} className="rounded-lg border border-gray-300 px-4 py-2 md:col-span-3">
            <option value="packed">Packed</option>
            <option value="out-for-delivery">Out for Delivery</option>
          </select>
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white md:col-span-3">Save Shipment</button>
        </form>
      )}

      {message && <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><p className="text-gray-600 text-sm font-medium">Total Shipments</p><p className="text-2xl font-bold text-gray-900 mt-2">{orders.filter((order) => order.trackingNumber).length}</p></div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><p className="text-gray-600 text-sm font-medium">Delivered</p><p className="text-2xl font-bold text-green-600 mt-2">{delivered}</p></div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><p className="text-gray-600 text-sm font-medium">In Transit</p><p className="text-2xl font-bold text-blue-600 mt-2">{inTransit}</p></div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6"><p className="text-gray-600 text-sm font-medium">Needs Shipment</p><p className="text-2xl font-bold text-yellow-600 mt-2">{processing}</p></div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="px-6 py-3 text-left">Order ID</th><th className="px-6 py-3 text-left">Customer</th><th className="px-6 py-3 text-left">Tracking ID</th><th className="px-6 py-3 text-left">Courier</th><th className="px-6 py-3 text-left">Status</th><th className="px-6 py-3 text-left">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 font-medium text-gray-900">{order.orderNumber}</td>
                <td className="px-6 py-4 text-gray-600">{order.customerName || order.customerEmail}</td>
                <td className="px-6 py-4 text-gray-600 font-mono text-xs">{order.trackingNumber || "Not assigned"}</td>
                <td className="px-6 py-4 text-gray-600"><span className="inline-flex items-center gap-2"><Truck className="w-4 h-4 text-gray-400" />{order.shippingMethod || "Standard"}</span></td>
                <td className="px-6 py-4"><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">{order.status}</span></td>
                <td className="px-6 py-4"><Link href={`/admin/orders/${order._id}`} className="inline-flex items-center gap-2 rounded border border-gray-300 px-3 py-2 text-xs font-semibold"><Eye className="h-3 w-3" />View</Link></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">No orders found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
