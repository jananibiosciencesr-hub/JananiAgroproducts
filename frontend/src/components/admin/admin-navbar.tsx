import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  MessageSquare,
  Moon,
  Sun,
  Menu,
  Sparkles,
  Command,
  Package,
  ShoppingBag,
  AlertTriangle,
  Mail,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Database
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { type AdminTab } from "./admin-sidebar";
import { getAdminInquiries, type AdminInquiry } from "@/lib/api";

interface AdminNavbarProps {
  onOpenMobileSidebar: () => void;
  onOpenSearchModal: () => void;
  onNavigateTab: (tab: AdminTab) => void;
  onLogout?: () => void;
  adminUser?: any;
  inquiries?: AdminInquiry[];
  orders?: any[];
  inventory?: any[];
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Recent";
  try {
    const cleaned = dateStr.replace(" ", "T");
    const d = new Date(cleaned);
    if (isNaN(d.getTime())) return dateStr;
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800) return "Yesterday";
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

export function AdminNavbar({
  onOpenMobileSidebar,
  onOpenSearchModal,
  onNavigateTab,
  onLogout,
  adminUser,
  inquiries = [],
  orders = [],
  inventory = []
}: AdminNavbarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [liveInquiries, setLiveInquiries] = useState<AdminInquiry[]>(inquiries);

  // Sync when prop updates
  useEffect(() => {
    if (Array.isArray(inquiries) && inquiries.length > 0) {
      setLiveInquiries(inquiries);
    }
  }, [inquiries]);

  // Periodic polling for live inquiries from MySQL backend
  useEffect(() => {
    let mounted = true;
    const fetchLatestInquiries = async () => {
      try {
        const inqs = await getAdminInquiries();
        if (mounted && Array.isArray(inqs)) {
          setLiveInquiries(inqs);
        }
      } catch (e) {}
    };

    fetchLatestInquiries();
    const interval = setInterval(fetchLatestInquiries, 25000); // 25s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Dynamic admin details (strictly separated from storefront customer session)
  const currentAdmin = (() => {
    if (adminUser && typeof adminUser === "object" && adminUser.role !== "Customer") return adminUser;
    try {
      if (typeof window !== "undefined") {
        const adminStored = localStorage.getItem("janani_admin_user");
        if (adminStored) {
          const parsed = JSON.parse(adminStored);
          if (parsed && typeof parsed === "object" && parsed.role !== "Customer") return parsed;
        }
      }
    } catch (e) {}
    return { name: "Janani Admin (Root)", email: "jananibiosciences.r@gmail.com", role: "Super Admin" };
  })();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const unreadInquiries = liveInquiries.filter(
    (i) => (i?.status || "").toLowerCase() === "new"
  );
  const unreadMessagesCount = unreadInquiries.length;

  const dynamicNotifications = [
    ...(unreadInquiries.length > 0
      ? [
          {
            id: `inq-alert-${unreadInquiries[0]?.id || "top"}`,
            title: `New Inquiry: ${unreadInquiries[0]?.name || "Customer Lead"}`,
            desc: unreadInquiries[0]?.message || unreadInquiries[0]?.service || "New customer inquiry received",
            time: formatRelativeTime(unreadInquiries[0]?.createdAt || unreadInquiries[0]?.created_at),
            icon: MessageSquare,
            color: "text-blue-500 bg-blue-500/10",
            tab: "inquiries" as AdminTab,
          },
        ]
      : []),
    ...(orders.some((o) => o?.orderStatus === "Pending" || o?.orderStatus === "Processing")
      ? [
          {
            id: "order-alert-1",
            title: `New Order #${orders.find((o) => o?.orderStatus === "Pending" || o?.orderStatus === "Processing")?.orderNumber || "ORD-94812"}`,
            desc: `₹${(orders.find((o) => o?.orderStatus === "Pending" || o?.orderStatus === "Processing")?.totalAmount || 4040).toLocaleString("en-IN")} via UPI`,
            time: "Recent",
            icon: ShoppingBag,
            color: "text-emerald-500 bg-emerald-500/10",
            tab: "orders" as AdminTab,
          },
        ]
      : [
          {
            id: "order-default-1",
            title: "Storefront Orders Active",
            desc: "Ready to fulfill orders and generate Shiprocket AWBs",
            time: "Live",
            icon: ShoppingBag,
            color: "text-emerald-500 bg-emerald-500/10",
            tab: "orders" as AdminTab,
          },
        ]),
    ...(inventory.some((i) => (i?.stock ?? 45) < 20)
      ? [
          {
            id: "inv-alert-1",
            title: "Critical Low Stock Alert",
            desc: `${inventory.find((i) => (i?.stock ?? 45) < 20)?.name || "Gir Cow Ghee"} has low stock units`,
            time: "Today",
            icon: AlertTriangle,
            color: "text-rose-500 bg-rose-500/10",
            tab: "inventory" as AdminTab,
          },
        ]
      : []),
    {
      id: "sys-ready",
      title: "MySQL Database Connected",
      desc: "Live inquiries, orders, products & inventory active",
      time: "Live",
      icon: CheckCircle2,
      color: "text-emerald-500 bg-emerald-500/10",
      tab: "dashboard" as AdminTab,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-border/70 bg-card/85 px-4 lg:px-8 backdrop-blur-xl">
      {/* Left Area: Mobile Menu & Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-2xl">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden flex size-10 items-center justify-center rounded-2xl border border-border bg-background text-foreground hover:bg-accent"
        >
          <Menu className="size-5" />
        </button>

        {/* Global Instant Search Bar */}
        <div
          onClick={onOpenSearchModal}
          className="group relative flex w-full max-w-md cursor-pointer items-center gap-3 rounded-2xl border border-border/80 bg-background/80 px-4 py-2.5 text-xs text-muted-foreground shadow-sm transition-all hover:border-emerald-500/50 hover:bg-background hover:shadow-md"
        >
          <Search className="size-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
          <span className="truncate flex-1">Search products, SKU, orders, customers (e.g. Basmati, ORD-94812)...</span>
          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-foreground">
            <Command className="size-3" /> K
          </div>
        </div>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Database Auto-Sync & Status */}
        <button
          onClick={async () => {
            const toastId = toast.loading("Checking & auto-migrating MySQL tables and columns...");
            try {
              const res = await fetch("/db_init.php");
              if (res.ok) {
                const data = await res.json();
                toast.success(data.message || "MySQL tables & columns synchronized!", { id: toastId });
                // Also refresh live inquiries
                getAdminInquiries().then(inqs => setLiveInquiries(inqs)).catch(() => {});
              } else {
                toast.error("Database sync returned status " + res.status, { id: toastId });
              }
            } catch (e: any) {
              toast.error("Database sync failed: " + e.message, { id: toastId });
            }
          }}
          className="hidden sm:flex items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm cursor-pointer"
          title="Auto-create and sync MySQL database schema and columns"
        >
          <Database className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Sync DB</span>
        </button>

        {/* Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          className="flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-background/70 text-muted-foreground hover:bg-accent hover:text-foreground transition-all shadow-sm"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === "light" ? <Moon className="size-4.5 text-amber-600" /> : <Sun className="size-4.5 text-amber-400" />}
        </button>

        {/* Messages Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setMessagesOpen(!messagesOpen);
              setNotificationsOpen(false);
              setProfileOpen(false);
            }}
            className="relative flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-background/70 text-muted-foreground hover:bg-accent hover:text-foreground transition-all shadow-sm"
            title="Customer Inquiries & Messages"
          >
            <MessageSquare className="size-4.5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow">
                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
              </span>
            )}
          </button>

          {messagesOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-border bg-card p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Customer Inquiries</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {unreadMessagesCount > 0
                      ? `${unreadMessagesCount} unread customer inquiry${unreadMessagesCount === 1 ? "" : "s"}`
                      : "All customer inquiries up to date"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMessagesOpen(false);
                    onNavigateTab("inquiries");
                  }}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {liveInquiries.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No inquiries received yet.
                  </div>
                ) : (
                  liveInquiries.slice(0, 8).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setMessagesOpen(false);
                        onNavigateTab("inquiries");
                      }}
                      className="flex flex-col p-3 rounded-2xl bg-muted/40 hover:bg-emerald-500/10 cursor-pointer transition-colors border border-border/40"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-foreground truncate">{m.name}</span>
                          {m.status === "New" && (
                            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              NEW
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-1">
                          {formatRelativeTime(m.createdAt || m.created_at)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5 line-clamp-1">
                        {m.service || m.subject || "General Inquiry"}
                        {m.businessName || m.business_name ? ` · ${m.businessName || m.business_name}` : ""}
                      </p>
                      {m.message && (
                        <p className="text-[11px] text-foreground/80 mt-0.5 line-clamp-1 italic">
                          "{m.message}"
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                        <span className="truncate max-w-[170px]">{m.email}</span>
                        {m.phone && <span className="font-mono">{m.phone}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setMessagesOpen(false);
              setProfileOpen(false);
            }}
            className="relative flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-background/70 text-muted-foreground hover:bg-accent hover:text-foreground transition-all shadow-sm"
            title="Notifications"
          >
            <Bell className="size-4.5" />
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
              {dynamicNotifications.length}
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-border bg-card p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                  <p className="text-[11px] text-muted-foreground">{dynamicNotifications.length} live store updates</p>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Close
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-80 overflow-y-auto no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {dynamicNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        setNotificationsOpen(false);
                        onNavigateTab(n.tab);
                      }}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-accent cursor-pointer transition-colors border border-border/40"
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${n.color}`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                          <span className="text-[10px] text-muted-foreground">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{n.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
              setMessagesOpen(false);
            }}
            className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-background/80 p-1.5 pr-3 hover:bg-accent transition-all shadow-sm"
          >
            <div className="size-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 text-white font-bold text-xs flex items-center justify-center shadow">
              {(currentAdmin.name || "Admin").substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-foreground leading-tight">{currentAdmin.name || "Janani Admin"}</span>
              <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">{currentAdmin.role || "Super Admin"}</span>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-border bg-card p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="p-3 border-b border-border">
                <p className="text-xs font-bold text-foreground">{currentAdmin.name || "Janani Admin"}</p>
                <p className="text-[11px] text-muted-foreground">{currentAdmin.email || "jananibiosciences.r@gmail.com"}</p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="size-3" /> Full Root Access
                </div>
              </div>

              <div className="py-2 space-y-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigateTab("settings");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                >
                  Store Settings & API Keys
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigateTab("roles");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                >
                  Manage Staff & Permissions
                </button>
                <Link
                  to="/"
                  target="_blank"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                >
                  <span>Customer Storefront</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              </div>

              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    if (onLogout) {
                      onLogout();
                    } else {
                      localStorage.removeItem("janani_admin_session");
                      localStorage.removeItem("janani_admin_user");
                      localStorage.removeItem("janani_admin_token");
                      window.location.reload();
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/10 transition-colors"
                >
                  Logout Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
