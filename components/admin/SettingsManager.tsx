"use client";

import { FormEvent, useState } from "react";
import { Bell, Globe, Lock, Mail, Save } from "lucide-react";

const defaultSettings = {
  storeName: "Ratna Jewels",
  storeEmail: "info@ratna.com",
  phone: "+977-1-1234567",
  address: "Kathmandu, Nepal",
  currency: "NPR",
  shippingMethod: "Standard Shipping",
  shippingCost: "150",
  notifyOrders: true,
  notifyReviews: true,
};

type AdminSettings = typeof defaultSettings;

export function SettingsManager() {
  const [settings, setSettings] = useState<AdminSettings>(() => {
    if (typeof window === "undefined") return defaultSettings;
    const saved = window.localStorage.getItem("ratna-admin-settings");
    return saved ? { ...defaultSettings, ...JSON.parse(saved), currency: "NPR" } : defaultSettings;
  });
  const [activeTab, setActiveTab] = useState("General Settings");
  const [message, setMessage] = useState("");

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem("ratna-admin-settings", JSON.stringify(settings));
    setMessage("Settings saved.");
  }

  const tabs = [
    { icon: Globe, label: "General Settings" },
    { icon: Mail, label: "Email Settings" },
    { icon: Lock, label: "Security" },
    { icon: Bell, label: "Notifications" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 h-fit">
        <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
        <nav className="space-y-2">
          {tabs.map((item) => (
            <button key={item.label} type="button" onClick={() => setActiveTab(item.label)} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${activeTab === item.label ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100 text-gray-600"}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {message && <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
        <form onSubmit={saveSettings} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">{activeTab}</h2>

          {activeTab === "General Settings" && (
            <>
              <label className="block text-sm font-medium text-gray-700">Store Name<input value={settings.storeName} onChange={(event) => setSettings((current) => ({ ...current, storeName: event.target.value }))} className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg" /></label>
              <label className="block text-sm font-medium text-gray-700">Store Email<input type="email" value={settings.storeEmail} onChange={(event) => setSettings((current) => ({ ...current, storeEmail: event.target.value }))} className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg" /></label>
              <label className="block text-sm font-medium text-gray-700">Phone Number<input value={settings.phone} onChange={(event) => setSettings((current) => ({ ...current, phone: event.target.value }))} className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg" /></label>
              <label className="block text-sm font-medium text-gray-700">Address<input value={settings.address} onChange={(event) => setSettings((current) => ({ ...current, address: event.target.value }))} className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg" /></label>
            </>
          )}

          {activeTab === "Email Settings" && (
            <>
              <label className="block text-sm font-medium text-gray-700">Sender Email<input type="email" value={settings.storeEmail} onChange={(event) => setSettings((current) => ({ ...current, storeEmail: event.target.value }))} className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg" /></label>
              <p className="text-sm text-gray-500">Order and contact emails will use this address in the admin settings display.</p>
            </>
          )}

          {activeTab === "Security" && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Admin routes are protected by role-based login. Use Staff / Roles Management for staff access planning.
            </div>
          )}

          {activeTab === "Notifications" && (
            <>
              <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm font-medium"><input type="checkbox" checked={settings.notifyOrders} onChange={(event) => setSettings((current) => ({ ...current, notifyOrders: event.target.checked }))} />Notify admin when a new order is placed</label>
              <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm font-medium"><input type="checkbox" checked={settings.notifyReviews} onChange={(event) => setSettings((current) => ({ ...current, notifyReviews: event.target.checked }))} />Notify admin when a review needs attention</label>
            </>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm font-medium text-gray-700">Currency<select value={settings.currency} onChange={() => setSettings((current) => ({ ...current, currency: "NPR" }))} className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"><option>NPR</option></select></label>
            <label className="block text-sm font-medium text-gray-700">Shipping Method<select value={settings.shippingMethod} onChange={(event) => setSettings((current) => ({ ...current, shippingMethod: event.target.value }))} className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"><option>Standard Shipping</option><option>Express Shipping</option><option>Overnight Shipping</option></select></label>
            <label className="block text-sm font-medium text-gray-700">Shipping Cost<input type="number" value={settings.shippingCost} onChange={(event) => setSettings((current) => ({ ...current, shippingCost: event.target.value }))} className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg" /></label>
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
