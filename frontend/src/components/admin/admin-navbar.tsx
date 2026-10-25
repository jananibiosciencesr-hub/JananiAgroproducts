import { useState, useEffect, useRef } from "react";
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
  Plus,
  X,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { type AdminTab } from "./admin-sidebar";
import { getAdminInquiries, type AdminInquiry } from "@/lib/api";

export const SEARCHABLE_NAV_MODULES: Array<{
  id: AdminTab;
  title: string;
  desc: string;
  keywords: string[];
  icon: any;
}> = [
  { id: "dashboard", title: "Dashboard Overview", desc: "Live sales metrics & KPI performance", keywords: ["dashboard", "home", "metrics", "kpi", "sales", "overview", "analytics"], icon: ShoppingBag },
  { id: "orders", title: "Orders Manager", desc: "All customer orders, dispatch & invoices", keywords: ["orders", "sales", "dispatch", "invoices", "order", "ord"], icon: ShoppingBag },
  { id: "products", title: "Products Catalog", desc: "Manage catalog, stock & pricing", keywords: ["products", "items", "catalog", "sku", "harit", "biofertilizer", "humic"], icon: Package },
  { id: "categories", title: "Categories & Hierarchy", desc: "Bio-fertilizer, pesticide & stimulant classifications", keywords: ["categories", "category", "hierarchy", "slugs"], icon: Package },
  { id: "customers", title: "Customers & Patrons", desc: "Patron profiles, wallets & addresses", keywords: ["customers", "patrons", "users", "profiles", "wallets"], icon: UserCheck },
  { id: "inquiries", title: "Customer Inquiries", desc: "B2B, dealership & contact requests", keywords: ["inquiries", "inquiry", "messages", "dealership", "contact", "support"], icon: MessageSquare },
  { id: "inventory", title: "Inventory & Restock", desc: "Warehouse stock levels & alerts", keywords: ["inventory", "stock", "restock", "warehouse", "threshold", "units"], icon: AlertTriangle },
  { id: "payments", title: "Payments & Settlements", desc: "Razorpay, UPI & transaction records", keywords: ["payments", "transactions", "razorpay", "upi", "settlements", "gateway"], icon: CheckCircle2 },
  { id: "coupons", title: "Coupons & Discounts", desc: "Promo codes & cart percentage offers", keywords: ["coupons", "discounts", "offers", "promo", "voucher"], icon: Sparkles },
  { id: "shipping", title: "Shipping & Logistics", desc: "Shiprocket AWBs & courier dispatches", keywords: ["shipping", "shiprocket", "courier", "awb", "bluedart", "delhivery"], icon: ExternalLink },
  { id: "reviews", title: "Customer Reviews", desc: "Testimonials & organic harvest ratings", keywords: ["reviews", "review", "ratings", "feedback", "testimonials", "stars"], icon: Sparkles },
  { id: "returns", title: "Returns & Refunds", desc: "Return requests, replacements & refunds", keywords: ["returns", "return", "refunds", "refund", "replacement"], icon: AlertTriangle },
  { id: "reports", title: "Reports & Financials", desc: "Sales trends, revenue velocity & GST", keywords: ["reports", "report", "revenue", "analytics", "gst", "financial", "velocity", "today revenue", "monthly revenue"], icon: TrendingUp },
  { id: "referrals", title: "Referrals & Rewards", desc: "Patron affiliate earnings & commissions", keywords: ["referrals", "referral", "rewards", "affiliate", "commissions", "patron rewards"], icon: Sparkles },
  { id: "cms", title: "Banners & CMS", desc: "Storefront banners & notices", keywords: ["cms", "banners", "hero", "announcements", "media"], icon: Package },
  { id: "settings", title: "Store Settings", desc: "Store branding & business configuration", keywords: ["settings", "branding", "logo", "business"], icon: Sparkles },
];

interface AdminNavbarProps {
  onOpenMobileSidebar: () => void;
  onOpenSearchModal: () => void;
  onNavigateTab: (tab: AdminTab) => void;
  onLogout?: () => void;
  adminUser?: any;
  inquiries?: AdminInquiry[];
  orders?: any[];
  inventory?: any[];
  products?: any[];
  activeTab?: AdminTab;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onAddAction?: () => void;
}

function getSearchPlaceholder(tab?: AdminTab): string {
  switch (tab) {
    case "categories":
      return "Search categories by name, slug, SEO tags...";
    case "products":
      return "Search products by name, SKU, brand, tags...";
    case "orders":
      return "Search orders by ID, customer, phone, status...";
    case "customers":
      return "Search patrons by name, phone, email, city...";
    case "coupons":
      return "Search coupons by promo code, discount...";
    case "inventory":
      return "Search inventory by product, SKU, batch...";
    case "inquiries":
      return "Search customer inquiries by name, phone...";
    case "reviews":
      return "Search reviews by customer name, product...";
    case "returns":
      return "Search returns by order ID, customer...";
    case "payments":
      return "Search payments by transaction ID, method...";
    default:
      return "Search orders, SKU, products... (⌘K)";
  }
}

function getAddConfig(tab?: AdminTab): { label: string; shortLabel: string } | null {
  switch (tab) {
    case "categories":
      return { label: "Add Category", shortLabel: "Category" };
    case "products":
      return { label: "Add Product", shortLabel: "Product" };
    case "coupons":
      return { label: "Add Coupon", shortLabel: "Coupon" };
    case "reviews":
      return { label: "Add Review", shortLabel: "Review" };
    default:
      return null;
  }
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
  inventory = [],
  products = [],
  activeTab = "dashboard",
  searchTerm = "",
  onSearchChange,
  onAddAction,
}: AdminNavbarProps) {
  const addConfig = getAddConfig(activeTab);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [liveInquiries, setLiveInquiries] = useState<AdminInquiry[]>(inquiries);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cleanTerm = (searchTerm || "").trim().toLowerCase();

  const matchingNavs = cleanTerm
    ? SEARCHABLE_NAV_MODULES.filter((m) =>
        m.title.toLowerCase().includes(cleanTerm) ||
        m.desc.toLowerCase().includes(cleanTerm) ||
        m.keywords.some((k) => k.toLowerCase().includes(cleanTerm)) ||
        m.id.toLowerCase().includes(cleanTerm)
      )
    : [];

  const matchingOrders = cleanTerm
    ? orders
        .filter((o) => {
          const id = String(o?.number || o?.id || "").toLowerCase();
          const cust = String(o?.customer?.name || "").toLowerCase();
          const phone = String(o?.customer?.phone || "").toLowerCase();
          const city = String(o?.customer?.city || "").toLowerCase();
          const status = String(o?.orderStatus || o?.status || "").toLowerCase();
          return id.includes(cleanTerm) || cust.includes(cleanTerm) || phone.includes(cleanTerm) || city.includes(cleanTerm) || status.includes(cleanTerm);
        })
        .slice(0, 4)
    : [];

  const matchingProducts = cleanTerm
    ? products
        .filter((p) => {
          const name = String(p?.name || "").toLowerCase();
          const sku = String(p?.sku || "").toLowerCase();
          const cat = String(p?.category || "").toLowerCase();
          return name.includes(cleanTerm) || sku.includes(cleanTerm) || cat.includes(cleanTerm);
        })
        .slice(0, 4)
    : [];

  const matchingInquiries = cleanTerm
    ? liveInquiries
        .filter((i) => {
          const name = String(i?.name || "").toLowerCase();
          const phone = String(i?.phone || "").toLowerCase();
          const msg = String(i?.message || i?.service || "").toLowerCase();
          return name.includes(cleanTerm) || phone.includes(cleanTerm) || msg.includes(cleanTerm);
        })
        .slice(0, 3)
    : [];

  const totalQuickMatches = matchingNavs.length + matchingOrders.length + matchingProducts.length + matchingInquiries.length;

  // Scroll detection for sticky header elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            desc: `${inventory.find((i) => (i?.stock ?? 45) < 20)?.name || "Harit Biofungicide (1L)"} has low stock units`,
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
    <header className={`sticky top-0 z-40 flex h-16 sm:h-20 w-full max-w-full items-center justify-between border-b backdrop-blur-xl transition-all duration-200 px-3 sm:px-4 lg:px-8 ${
      isScrolled ? "bg-card/95 border-border shadow-sm" : "bg-card/85 border-border/70"
    }`}>
      {/* Left Area: Mobile Menu, Dynamic Search & Contextual Add */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-2xl min-w-0 mr-2">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden flex size-9 sm:size-10 items-center justify-center rounded-xl sm:rounded-2xl border border-border bg-background text-foreground hover:bg-accent shrink-0 cursor-pointer"
          aria-label="Open Sidebar Menu"
        >
          <Menu className="size-5" />
        </button>

        {/* Dynamic Contextual Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md min-w-0">
          <div className="relative flex items-center w-full rounded-xl sm:rounded-2xl border border-border/80 bg-background/80 shadow-sm transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:bg-background hover:border-emerald-500/40">
            <Search className="absolute left-3 sm:left-3.5 size-4 text-muted-foreground pointer-events-none shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                onSearchChange?.(e.target.value);
                setIsSearchFocused(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsSearchFocused(false);
                }
              }}
              placeholder={getSearchPlaceholder(activeTab)}
              className="w-full bg-transparent py-2 sm:py-2.5 pl-9 sm:pl-10 pr-16 sm:pr-20 text-xs text-foreground placeholder:text-muted-foreground outline-none font-medium truncate"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange?.("");
                    setIsSearchFocused(false);
                  }}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={onOpenSearchModal}
                className="hidden md:flex items-center gap-1 rounded-lg border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Global Command Palette (⌘K)"
              >
                <Command className="size-2.5" /> K
              </button>
            </div>
          </div>

          {/* Live Autocomplete Results Dropdown */}
          {cleanTerm.length > 0 && isSearchFocused && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl p-2.5 max-h-[75vh] overflow-y-auto animate-in fade-in zoom-in-95 space-y-2">
              <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60">
                <span>Matching Shortcuts ({totalQuickMatches})</span>
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange?.("");
                    setIsSearchFocused(false);
                  }}
                  className="hover:text-foreground text-[10px] normal-case font-medium text-emerald-600 hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>

              {/* 1. Quick Navigation Tabs & Sections */}
              {matchingNavs.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground px-2.5 py-1 uppercase tracking-wider">
                    Admin Sections
                  </p>
                  <div className="space-y-0.5">
                    {matchingNavs.slice(0, 5).map((nav) => {
                      const Icon = nav.icon;
                      return (
                        <button
                          key={nav.id}
                          type="button"
                          onClick={() => {
                            onNavigateTab(nav.id);
                            setIsSearchFocused(false);
                          }}
                          className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-7 rounded-lg bg-muted group-hover:bg-emerald-500/20 text-muted-foreground group-hover:text-emerald-600 flex items-center justify-center shrink-0">
                              <Icon className="size-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300 truncate">
                                {nav.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">{nav.desc}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-emerald-600 flex items-center gap-1 shrink-0 ml-2">
                            Open <ArrowRight className="size-3" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Matching Orders */}
              {matchingOrders.length > 0 && (
                <div className="pt-1 border-t border-border/40">
                  <p className="text-[10px] font-bold text-muted-foreground px-2.5 py-1 uppercase tracking-wider">
                    Orders
                  </p>
                  <div className="space-y-0.5">
                    {matchingOrders.map((o) => (
                      <button
                        key={o.id || o.number}
                        type="button"
                        onClick={() => {
                          onNavigateTab("orders");
                          onSearchChange?.(o.number || o.id);
                          setIsSearchFocused(false);
                        }}
                        className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-muted/80 transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ShoppingBag className="size-4 text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                              #{o.number || o.id} • {o.customer?.name || "Patron"}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {o.orderStatus || "Processing"} • ₹{(Number(o.total) || 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 shrink-0 ml-2">View</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Matching Products */}
              {matchingProducts.length > 0 && (
                <div className="pt-1 border-t border-border/40">
                  <p className="text-[10px] font-bold text-muted-foreground px-2.5 py-1 uppercase tracking-wider">
                    Products
                  </p>
                  <div className="space-y-0.5">
                    {matchingProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onNavigateTab("products");
                          onSearchChange?.(p.name);
                          setIsSearchFocused(false);
                        }}
                        className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-muted/80 transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Package className="size-4 text-amber-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {p.category || "General"} • ₹{(Number(p.price) || 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 shrink-0 ml-2">Edit</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Matching Inquiries */}
              {matchingInquiries.length > 0 && (
                <div className="pt-1 border-t border-border/40">
                  <p className="text-[10px] font-bold text-muted-foreground px-2.5 py-1 uppercase tracking-wider">
                    Inquiries
                  </p>
                  <div className="space-y-0.5">
                    {matchingInquiries.map((i) => (
                      <button
                        key={i.id}
                        type="button"
                        onClick={() => {
                          onNavigateTab("inquiries");
                          onSearchChange?.(i.name || i.phone);
                          setIsSearchFocused(false);
                        }}
                        className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-muted/80 transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MessageSquare className="size-4 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{i.name || "Patron Inquiry"}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{i.phone || i.message || i.service}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 shrink-0 ml-2">Reply</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Zero Direct Results Notice */}
              {totalQuickMatches === 0 && (
                <div className="py-4 px-3 text-center text-xs text-muted-foreground italic">
                  No quick shortcuts matched "{searchTerm}". Current view is filtering automatically.
                </div>
              )}

              {/* Live Filter Indicator Footer */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground px-2">
                <span>Active view: <strong className="text-foreground capitalize">{activeTab}</strong> (live filtered)</span>
                <span className="text-[9px] text-muted-foreground">Press Esc to close</span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Contextual Add Action Button */}
        {addConfig && onAddAction && (
          <button
            type="button"
            onClick={onAddAction}
            className="flex items-center gap-1.5 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-3 sm:px-4 py-2 sm:py-2.5 shadow-md shadow-emerald-700/20 transition-all shrink-0 cursor-pointer"
            title={addConfig.label}
          >
            <Plus className="size-3.5 sm:size-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{addConfig.label}</span>
            <span className="sm:hidden">{addConfig.shortLabel}</span>
          </button>
        )}
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

        {/* Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          className="flex size-9 sm:size-10 items-center justify-center rounded-xl sm:rounded-2xl border border-border/80 bg-background/70 text-muted-foreground hover:bg-accent hover:text-foreground transition-all shadow-sm cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === "light" ? <Moon className="size-4 text-amber-600" /> : <Sun className="size-4 text-amber-400" />}
        </button>

        {/* Messages Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setMessagesOpen(!messagesOpen);
              setNotificationsOpen(false);
              setProfileOpen(false);
            }}
            className="relative flex size-9 sm:size-10 items-center justify-center rounded-xl sm:rounded-2xl border border-border/80 bg-background/70 text-muted-foreground hover:bg-accent hover:text-foreground transition-all shadow-sm cursor-pointer"
            title="Customer Inquiries & Messages"
          >
            <MessageSquare className="size-4 sm:size-4.5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow">
                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
              </span>
            )}
          </button>

          {messagesOpen && (
            <div className="absolute right-0 mt-3 w-72 sm:w-96 rounded-2xl sm:rounded-3xl border border-border bg-card p-3 sm:p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
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
                      className="flex flex-col p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-muted/40 hover:bg-emerald-500/10 cursor-pointer transition-colors border border-border/40"
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
                        <span className="truncate max-w-[140px] sm:max-w-[170px]">{m.email}</span>
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
            className="relative flex size-9 sm:size-10 items-center justify-center rounded-xl sm:rounded-2xl border border-border/80 bg-background/70 text-muted-foreground hover:bg-accent hover:text-foreground transition-all shadow-sm cursor-pointer"
            title="Notifications"
          >
            <Bell className="size-4 sm:size-4.5" />
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
              {dynamicNotifications.length}
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-72 sm:w-96 rounded-2xl sm:rounded-3xl border border-border bg-card p-3 sm:p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
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
                      className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-muted/40 hover:bg-accent cursor-pointer transition-colors border border-border/40"
                    >
                      <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl shrink-0 ${n.color}`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
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
            className="flex items-center gap-1.5 sm:gap-2.5 rounded-xl sm:rounded-2xl border border-border/80 bg-background/80 p-1 sm:p-1.5 sm:pr-3 hover:bg-accent transition-all shadow-sm cursor-pointer"
          >
            <div className="size-7 sm:size-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 text-white font-bold text-xs flex items-center justify-center shadow">
              {(currentAdmin.name || "Admin").substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-foreground leading-tight">{currentAdmin.name || "Janani Admin"}</span>
              <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">{currentAdmin.role || "Super Admin"}</span>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-2xl sm:rounded-3xl border border-border bg-card p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="p-3 border-b border-border">
                <p className="text-xs font-bold text-foreground">{currentAdmin.name || "Janani Admin"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{currentAdmin.email || "jananibiosciences.r@gmail.com"}</p>
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
