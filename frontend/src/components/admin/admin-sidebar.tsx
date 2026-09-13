import React from "react";
import {
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
  CreditCard,
  TicketPercent,
  Share2,
  Truck,
  Star,
  RotateCcw,
  Image as ImageIcon,
  Megaphone,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export type AdminTab =
  | "dashboard"
  | "categories"
  | "products"
  | "orders"
  | "customers"
  | "inventory"
  | "payments"
  | "coupons"
  | "referrals"
  | "shipping"
  | "reviews"
  | "returns"
  | "cms"
  | "marketing"
  | "reports"
  | "settings"
  | "roles";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  badgeCounts?: {
    orders?: number;
    inventory?: number;
    returns?: number;
    reviews?: number;
  };
}

const menuItems: Array<{
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  badgeKey?: "orders" | "inventory" | "returns" | "reviews";
  badgeColor?: string;
  group?: string;
}> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Core" },
  { id: "categories", label: "Categories", icon: FolderTree, group: "Catalog" },
  { id: "products", label: "Products", icon: Package, group: "Catalog" },
  { id: "orders", label: "Orders", icon: ShoppingBag, badgeKey: "orders", badgeColor: "bg-emerald-500", group: "Sales" },
  { id: "customers", label: "Customers", icon: Users, group: "Sales" },
  { id: "inventory", label: "Inventory", icon: Warehouse, badgeKey: "inventory", badgeColor: "bg-amber-500", group: "Operations" },
  { id: "payments", label: "Payments", icon: CreditCard, group: "Operations" },
  { id: "coupons", label: "Coupons", icon: TicketPercent, group: "Marketing" },
  { id: "referrals", label: "Refer & Earn", icon: Share2, group: "Marketing" },
  { id: "shipping", label: "Shipping (Shiprocket)", icon: Truck, group: "Operations" },
  { id: "reviews", label: "Reviews", icon: Star, badgeKey: "reviews", badgeColor: "bg-blue-500", group: "Customer" },
  { id: "returns", label: "Returns & Refunds", icon: RotateCcw, badgeKey: "returns", badgeColor: "bg-rose-500", group: "Customer" },
  { id: "cms", label: "Banners & CMS", icon: ImageIcon, group: "Storefront" },
  { id: "marketing", label: "Marketing", icon: Megaphone, group: "Marketing" },
  { id: "reports", label: "Reports", icon: BarChart3, group: "Analytics" },
  { id: "settings", label: "Settings", icon: Settings, group: "System" },
  { id: "roles", label: "Admins & Roles", icon: ShieldCheck, group: "System" },
];

export function AdminSidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  badgeCounts = { orders: 9, inventory: 4, returns: 3, reviews: 1 },
}: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-all duration-300 shadow-2xl lg:shadow-none ${
          collapsed ? "w-20" : "w-72"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-4 border-b border-border/80">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-950 text-white shadow-md shadow-emerald-900/20">
              <Leaf className="size-6 text-amber-300" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-display text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  JANANI AGRO <Sparkles className="size-3.5 text-amber-500 fill-amber-500" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Seller Admin Pro
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex size-8 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shadow-sm"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        {/* Store Live Pill */}
        {!collapsed && (
          <div className="mx-4 mt-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Live Storefront</span>
            </div>
            <Link
              to="/"
              target="_blank"
              className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Visit <ExternalLink className="size-3" />
            </Link>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-muted-foreground/20">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : undefined;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`group relative flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-700/25 font-bold"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`size-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-amber-300" : "text-muted-foreground group-hover:text-foreground"}`} />

                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!collapsed && badgeCount && badgeCount > 0 && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm ${
                      item.badgeColor || "bg-emerald-600"
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}

                {/* Minified Tooltip Badge */}
                {collapsed && badgeCount && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow">
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-border/80 bg-background/50">
          <div className={`flex items-center gap-3 rounded-2xl p-2 bg-card border border-border/60 ${collapsed ? "justify-center" : ""}`}>
            <div className="relative size-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shadow-md shrink-0">
              DS
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-card" />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">Doddi Sai Rama</p>
                <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 truncate">Super Admin</p>
              </div>
            )}

            {!collapsed && (
              <Link
                to="/login"
                className="size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                title="Logout"
              >
                <LogOut className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
