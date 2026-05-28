"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Menu,
  X,
  ArrowLeft,
  Home,
  Package,
  Grid3x3,
  Box,
  ShoppingCart,
  Users,
  Star,
  Tag,
  CreditCard,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Mail,
  Search,
  ChevronDown,
  ChevronRight,
  Images,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type ActivityItem = {
  id: string;
  type: "order" | "review" | "stock" | "message";
  title: string;
  description: string;
  href: string;
  createdAt: string;
};

type AdminActivity = {
  counts: {
    notifications: number;
    messages: number;
    pendingOrders: number;
    pendingReviews: number;
    reportedReviews: number;
    lowStock: number;
  };
  notifications: ActivityItem[];
  messages: ActivityItem[];
};

const emptyActivity: AdminActivity = {
  counts: {
    notifications: 0,
    messages: 0,
    pendingOrders: 0,
    pendingReviews: 0,
    reportedReviews: 0,
    lowStock: 0,
  },
  notifications: [],
  messages: [],
};

const adminNotificationsReadKey = "ratna-admin-notifications-read";
const adminMessagesReadKey = "ratna-admin-messages-read";

function formatActivityTime(createdAt: string) {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function badgeText(count: number) {
  return count > 99 ? "99+" : count.toString();
}

function notificationSignature(items: ActivityItem[]) {
  return items.map((item) => `${item.type}:${item.id}:${item.createdAt}`).join("|");
}

function ActivityDropdown({
  title,
  emptyText,
  items,
  footerHref,
  footerLabel,
  onClose,
}: {
  title: string;
  emptyText: string;
  items: ActivityItem[];
  footerHref: string;
  footerLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-12 z-30 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">{emptyText}</p>
        ) : (
          items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.href}
              onClick={onClose}
              className="block border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">{item.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase text-gray-500">
                  {item.type}
                </span>
              </div>
              {item.createdAt && (
                <p className="mt-2 text-xs text-gray-400">{formatActivityTime(item.createdAt)}</p>
              )}
            </Link>
          ))
        )}
      </div>
      <Link
        href={footerHref}
        onClick={onClose}
        className="block bg-gray-50 px-4 py-3 text-center text-sm font-semibold text-blue-600 hover:bg-blue-50"
      >
        {footerLabel}
      </Link>
    </div>
  );
}

interface MenuItemConfig {
  href?: string;
  label: string;
  icon?: React.ReactNode;
  submenu?: MenuItemConfig[];
}

const menuItems: MenuItemConfig[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    label: "Product Management",
    icon: <Package className="w-5 h-5" />,
    submenu: [
      { href: "/admin/products", label: "Product List" },
      { href: "/admin/products/new", label: "Add Product" },
      { href: "/admin/products?status=archived", label: "Archived Products" },
    ],
  },
  {
    href: "/admin/categories",
    label: "Category Management",
    icon: <Grid3x3 className="w-5 h-5" />,
  },
  {
    href: "/admin/inventory",
    label: "Inventory Management",
    icon: <Box className="w-5 h-5" />,
  },
  {
    href: "/admin/orders",
    label: "Order Management",
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    href: "/admin/users",
    label: "Customer Management",
    icon: <Users className="w-5 h-5" />,
  },
  {
    href: "/admin/reviews",
    label: "Reviews & Ratings",
    icon: <Star className="w-5 h-5" />,
  },
  {
    href: "/admin/promotions",
    label: "Promotions & Coupons",
    icon: <Tag className="w-5 h-5" />,
  },
  {
    href: "/admin/payments",
    label: "Payments & Transactions",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    href: "/admin/shipping",
    label: "Shipping & Delivery",
    icon: <Truck className="w-5 h-5" />,
  },
  {
    href: "/admin/analytics",
    label: "Analytics & Reports",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    href: "/admin/cms",
    label: "CMS / Content Management",
    icon: <Grid3x3 className="w-5 h-5" />,
  },
  {
    href: "/admin/gallery",
    label: "Gallery Management",
    icon: <Images className="w-5 h-5" />,
  },
  {
    href: "/admin/staff",
    label: "Staff / Roles Management",
    icon: <Users className="w-5 h-5" />,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [activity, setActivity] = useState<AdminActivity>(emptyActivity);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const showBackButton = pathname !== "/admin/dashboard";

  useEffect(() => {
    let isMounted = true;

    async function loadActivity() {
      try {
        const response = await fetch("/api/admin/activity", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as AdminActivity;
        const readSignature = window.localStorage.getItem(adminNotificationsReadKey);
        const nextSignature = notificationSignature(data.notifications);
        const messagesReadSignature = window.localStorage.getItem(adminMessagesReadKey);
        const nextMessagesSignature = notificationSignature(data.messages);
        if (isMounted) {
          setActivity(data);
          setUnreadNotifications(readSignature === nextSignature ? 0 : data.counts.notifications);
          setUnreadMessages(messagesReadSignature === nextMessagesSignature ? 0 : data.counts.messages);
        }
      } catch {
        if (isMounted) {
          setActivity(emptyActivity);
          setUnreadNotifications(0);
          setUnreadMessages(0);
        }
      }
    }

    loadActivity();
    const intervalId = window.setInterval(loadActivity, 30000);
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const isMenuActive = (menuItem: MenuItemConfig): boolean => {
    if (menuItem.href) {
      return pathname.startsWith(menuItem.href);
    }
    if (menuItem.submenu) {
      return menuItem.submenu.some((sub) => pathname.startsWith(sub.href || ""));
    }
    return false;
  };

  const closeTopMenus = () => {
    setNotificationsOpen(false);
    setMessagesOpen(false);
    setProfileOpen(false);
  };

  const markNotificationsRead = (items: ActivityItem[]) => {
    window.localStorage.setItem(adminNotificationsReadKey, notificationSignature(items));
    setUnreadNotifications(0);
  };

  const markMessagesRead = (items: ActivityItem[]) => {
    window.localStorage.setItem(adminMessagesReadKey, notificationSignature(items));
    setUnreadMessages(0);
  };

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-[88px]"
        } flex h-screen shrink-0 flex-col border-r border-white/10 bg-[#071123] text-white shadow-2xl shadow-slate-950/20 transition-all duration-300`}
      >
        {/* Logo */}
        <div className="border-b border-white/10 p-4">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 rounded-2xl px-2 py-2 font-bold text-lg transition hover:bg-white/5 ${
              sidebarOpen ? "justify-start" : "justify-center"
            }`}
          >
            {sidebarOpen ? (
              <>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
                  <Image src="/logo.png" alt="" width={36} height={36} className="h-8 w-8 object-contain" />
                </span>
                <span className="leading-tight">
                  RATNA
                  <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Admin</span>
                </span>
              </>
            ) : (
              <Image src="/logo.png" alt="RATNA Admin" width={40} height={40} className="h-10 w-10 object-contain" />
            )}
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {menuItems.map((item) => {
            const isActive = isMenuActive(item);
            const isExpanded = expandedMenus.includes(item.label);
            const itemBaseClass = `group relative flex w-full items-center rounded-2xl transition-all ${
              sidebarOpen ? "gap-3 px-3 py-3" : "justify-center px-0 py-3"
            }`;
            const itemStateClass = isActive
              ? "bg-blue-600 text-white shadow-lg shadow-blue-950/25"
              : "text-slate-300 hover:bg-white/8 hover:text-white";

            return (
              <div key={item.label}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      title={!sidebarOpen ? item.label : undefined}
                      className={`${itemBaseClass} ${itemStateClass}`}
                    >
                      <span className={sidebarOpen ? "shrink-0" : "flex h-7 w-7 items-center justify-center"}>
                        {item.icon}
                      </span>
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left text-sm font-medium">
                            {item.label}
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </>
                      )}
                      {!sidebarOpen && (
                        <span className="pointer-events-none absolute left-[76px] z-40 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition group-hover:opacity-100">
                          {item.label}
                        </span>
                      )}
                    </button>
                    {sidebarOpen && isExpanded && (
                      <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href || "#"}
                            className={`block rounded-xl px-3 py-2 text-sm transition-colors ${
                              pathname === sub.href?.split("?")[0]
                                ? "bg-blue-700 text-white"
                                : "text-slate-400 hover:bg-white/8 hover:text-white"
                            }`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href || "#"}
                    title={!sidebarOpen ? item.label : undefined}
                    className={`${itemBaseClass} ${itemStateClass}`}
                  >
                    <span className={sidebarOpen ? "shrink-0" : "flex h-7 w-7 items-center justify-center"}>
                      {item.icon}
                    </span>
                    {sidebarOpen && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                    {!sidebarOpen && (
                      <span className="pointer-events-none absolute left-[76px] z-40 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition group-hover:opacity-100">
                        {item.label}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={!sidebarOpen ? "Logout" : undefined}
            className={`group relative flex w-full items-center rounded-2xl text-slate-300 transition-colors hover:bg-red-600 hover:text-white ${
              sidebarOpen ? "gap-3 px-3 py-3" : "justify-center px-0 py-3"
            }`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            {!sidebarOpen && (
              <span className="pointer-events-none absolute left-[76px] z-40 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition group-hover:opacity-100">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Collapse admin sidebar" : "Expand admin sidebar"}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {showBackButton && (
              <button
                type="button"
                onClick={goBack}
                aria-label="Go to previous admin page"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((open) => {
                    const nextOpen = !open;
                    if (nextOpen) markNotificationsRead(activity.notifications);
                    return nextOpen;
                  });
                  setMessagesOpen(false);
                  setProfileOpen(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="Admin notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {badgeText(unreadNotifications)}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <ActivityDropdown
                  title="Store notifications"
                  emptyText="No pending orders, reviews, or stock alerts right now."
                  items={activity.notifications}
                  footerHref="/admin/dashboard"
                  footerLabel="View dashboard"
                  onClose={closeTopMenus}
                />
              )}
            </div>

            {/* Messages */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMessagesOpen((open) => {
                    const nextOpen = !open;
                    if (nextOpen) markMessagesRead(activity.messages);
                    return nextOpen;
                  });
                  setNotificationsOpen(false);
                  setProfileOpen(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="Admin messages"
                aria-expanded={messagesOpen}
              >
                <Mail className="w-5 h-5 text-gray-600" />
                {unreadMessages > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                    {badgeText(unreadMessages)}
                  </span>
                )}
              </button>
              {messagesOpen && (
                <ActivityDropdown
                  title="Customer feedback"
                  emptyText="No pending customer review messages right now."
                  items={activity.messages}
                  footerHref="/admin/reviews"
                  footerLabel="Manage reviews"
                  onClose={closeTopMenus}
                />
              )}
            </div>

            {/* Admin Profile */}
            <div className="relative pl-4 border-l border-gray-200">
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-gray-100"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {session?.user?.name?.[0] || "A"}
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-14 z-20 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  <Link
                    href="/admin/settings"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setProfileOpen(false)}
                  >
                    Admin Settings
                  </Link>
                  <Link
                    href="/admin/staff"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setProfileOpen(false)}
                  >
                    Staff & Roles
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
