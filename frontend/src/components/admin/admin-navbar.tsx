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
  ExternalLink
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { type AdminTab } from "./admin-sidebar";

interface AdminNavbarProps {
  onOpenMobileSidebar: () => void;
  onOpenSearchModal: () => void;
  onNavigateTab: (tab: AdminTab) => void;
}

export function AdminNavbar({
  onOpenMobileSidebar,
  onOpenSearchModal,
  onNavigateTab,
}: AdminNavbarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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

  const notifications = [
    { id: 1, title: "New Order #ORD-94812", desc: "₹4,040 via PhonePe UPI (2 items)", time: "2 min ago", icon: ShoppingBag, color: "text-emerald-500 bg-emerald-500/10", tab: "orders" as AdminTab },
    { id: 2, title: "Critical Low Stock Alert", desc: "A2 Vedic Gir Cow Ghee is 0 in stock", time: "18 min ago", icon: AlertTriangle, color: "text-rose-500 bg-rose-500/10", tab: "inventory" as AdminTab },
    { id: 3, title: "New Dealership Application", desc: "Apex Agro Traders (Hyderabad, 10L+ tier)", time: "1 hour ago", icon: UserCheck, color: "text-blue-500 bg-blue-500/10", tab: "customers" as AdminTab },
    { id: 4, title: "Product Review Pending", desc: "Divya Nair rated Wild Forest Honey ★★★★★", time: "3 hours ago", icon: CheckCircle2, color: "text-amber-500 bg-amber-500/10", tab: "reviews" as AdminTab },
  ];

  const messages = [
    { id: 1, sender: "Dr. Meenakshi Rao", email: "dr.m.rao@aiims.edu", subject: "Bulk Inquiry: 50kg Organic Black Wheat", time: "25 min ago" },
    { id: 2, sender: "Kunal Singhania", email: "kunal.singh@gmail.com", subject: "Replacement request for damaged outer seal", time: "2 hours ago" },
    { id: 3, sender: "Mahaveer Spices Hub", email: "sales@mahaveerspices.in", subject: "Wholesale Basmati Rice dealership quotation", time: "Yesterday" }
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
            title="Inquiries & Messages"
          >
            <MessageSquare className="size-4.5" />
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow">
              3
            </span>
          </button>

          {messagesOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-border bg-card p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Customer Inquiries</h3>
                  <p className="text-[11px] text-muted-foreground">3 unread commercial messages</p>
                </div>
                <button
                  onClick={() => {
                    setMessagesOpen(false);
                    onNavigateTab("customers");
                  }}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setMessagesOpen(false);
                      onNavigateTab("customers");
                    }}
                    className="flex flex-col p-3 rounded-2xl bg-muted/40 hover:bg-emerald-500/10 cursor-pointer transition-colors border border-border/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground truncate">{m.sender}</span>
                      <span className="text-[10px] text-muted-foreground">{m.time}</span>
                    </div>
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5 line-clamp-1">{m.subject}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{m.email}</p>
                  </div>
                ))}
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
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow animate-pulse">
              4
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-border bg-card p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                  <p className="text-[11px] text-muted-foreground">4 real-time store updates</p>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                {notifications.map((n) => {
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
              DS
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-foreground leading-tight">Doddi Sai Rama</span>
              <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">Super Admin</span>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-border bg-card p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="p-3 border-b border-border">
                <p className="text-xs font-bold text-foreground">Doddi Sai Rama</p>
                <p className="text-[11px] text-muted-foreground">admin@jananiagro.com</p>
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
                <Link
                  to="/login"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/10 transition-colors"
                >
                  Logout Session
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
