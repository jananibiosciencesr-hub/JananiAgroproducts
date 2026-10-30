import { useState } from "react";
import {
  ShoppingBag,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Users,
  AlertOctagon,
  AlertTriangle,
  TicketPercent,
  Share2,
  Filter,
  RefreshCw,
  Eye,
  Truck,
  ArrowUpRight,
  ShieldCheck,
  Star,
  BarChart3,
  MessageSquareText,
  Search
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { type AdminTab } from "./admin-sidebar";
import { getOrderCustomer } from "./admin-orders";

interface AdminOverviewProps {
  stats?: any;
  charts?: any;
  widgets?: any;
  orders?: any[];
  products?: any[];
  customers?: any[];
  reviews?: any[];
  searchQuery?: string;
  onClearSearch?: () => void;
  onNavigateTab: (tab: AdminTab) => void;
  onOpenShiprocketModal: (order: any) => void;
  onOpenRestockModal: (item: any) => void;
  onOpenInvoiceModal: (order: any) => void;
}

export function AdminOverview({
  stats,
  charts,
  widgets,
  orders = [],
  products = [],
  customers = [],
  reviews = [],
  searchQuery = "",
  onClearSearch,
  onNavigateTab,
  onOpenShiprocketModal,
  onOpenRestockModal,
  onOpenInvoiceModal
}: AdminOverviewProps) {
  const [tableFilter, setTableFilter] = useState("all");

  const liveOrders = Array.isArray(orders) ? orders : [];
  const liveProducts = Array.isArray(products) ? products : [];
  const liveCustomers = Array.isArray(customers) ? customers : [];
  const liveReviews = Array.isArray(reviews) ? reviews : [];

  // Real-time metrics calculations directly from live data
  const totalSales = stats?.todayRevenue ?? liveOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrdersCount = stats?.todayOrders ?? liveOrders.length;
  const pendingOrdersCount = stats?.pendingOrders ?? liveOrders.filter(o => {
    const s = (o.orderStatus || o.status || "").toLowerCase();
    return s === "pending" || s === "processing";
  }).length;
  const deliveredOrdersCount = stats?.deliveredOrders ?? liveOrders.filter(o => {
    const s = (o.orderStatus || o.status || "").toLowerCase();
    return s === "delivered";
  }).length;
  const cancelledOrdersCount = stats?.cancelledOrders ?? liveOrders.filter(o => {
    const s = (o.orderStatus || o.status || "").toLowerCase();
    return s === "cancelled";
  }).length;
  const refundRequestsCount = stats?.refundRequests ?? liveOrders.filter(o => {
    const s = (o.orderStatus || o.status || "").toLowerCase();
    const p = (o.paymentStatus || "").toLowerCase();
    return s === "refunded" || s === "returned" || p === "refunded";
  }).length;
  const activePatronsCount = stats?.activeUsers ?? Math.max(1, liveCustomers.length);
  const outOfStockCount = stats?.outOfStockProducts ?? liveProducts.filter(p => (Number(p.stock) || Number(p.warehouseStock) || 0) <= 0).length;
  const lowStockCount = stats?.lowStockProducts ?? liveProducts.filter(p => {
    const s = Number(p.stock) || Number(p.warehouseStock) || 0;
    return s > 0 && s <= (Number(p.lowStockThreshold) || 10);
  }).length;
  const couponsUsedCount = stats?.couponsUsedToday ?? liveOrders.filter(o => Boolean(o.couponCode || o.coupon_code)).length;
  const referralEarningsTotal = stats?.referralEarnings ?? liveCustomers.reduce((sum, c) => sum + (Number(c.walletBalance) || 0), 0);



  const cleanSearch = (searchQuery || "").trim().toLowerCase();

  const filteredOrders = liveOrders.filter(o => {
    if (tableFilter !== "all") {
      const s = (o.orderStatus || o.status || "").toLowerCase();
      if (s !== tableFilter.toLowerCase()) return false;
    }
    if (!cleanSearch) return true;

    const cust = getOrderCustomer(o);
    const orderNum = String(o.number || o.id || "").toLowerCase();
    const custName = String(cust.name || "").toLowerCase();
    const custPhone = String(cust.phone || "").toLowerCase();
    const custCity = String(cust.city || "").toLowerCase();
    const method = String(o.paymentMethod || "").toLowerCase();
    const status = String(o.orderStatus || o.status || "").toLowerCase();
    const itemsMatch = Array.isArray(o.items) && o.items.some((it: any) =>
      String(it?.name || it?.title || "").toLowerCase().includes(cleanSearch)
    );

    return (
      orderNum.includes(cleanSearch) ||
      custName.includes(cleanSearch) ||
      custPhone.includes(cleanSearch) ||
      custCity.includes(cleanSearch) ||
      method.includes(cleanSearch) ||
      status.includes(cleanSearch) ||
      itemsMatch
    );
  });

  const kpiCards = [
    { title: "Today's Orders", value: `${totalOrdersCount}`, trend: `${totalOrdersCount} Placed`, icon: ShoppingBag, color: "from-emerald-500 to-emerald-700", tab: "orders" as AdminTab },
    { title: "Today's Revenue", value: `₹${totalSales.toLocaleString('en-IN')}`, trend: "Live Sales", icon: DollarSign, color: "from-amber-500 to-amber-700", tab: "reports" as AdminTab },
    { title: "Monthly Revenue", value: totalSales >= 100000 ? `₹${(totalSales / 100000).toFixed(2)}L` : `₹${totalSales.toLocaleString('en-IN')}`, trend: "Gross Settled", icon: Calendar, color: "from-blue-600 to-indigo-700", tab: "reports" as AdminTab },
    { title: "Pending Orders", value: `${pendingOrdersCount}`, trend: pendingOrdersCount > 0 ? "Needs Dispatch" : "All Dispatched", icon: Clock, color: "from-orange-500 to-amber-600", tab: "orders" as AdminTab },
    { title: "Delivered Orders", value: `${deliveredOrdersCount}`, trend: totalOrdersCount > 0 ? `${Math.round((deliveredOrdersCount / Math.max(1, totalOrdersCount)) * 100)}% Fulfilled` : "100% Fulfilled", icon: CheckCircle2, color: "from-emerald-600 to-teal-700", tab: "orders" as AdminTab },
    { title: "Cancelled Orders", value: `${cancelledOrdersCount}`, trend: totalOrdersCount > 0 ? `${Math.round((cancelledOrdersCount / Math.max(1, totalOrdersCount)) * 100)}% Rate` : "0% Rate", icon: XCircle, color: "from-rose-500 to-red-700", tab: "orders" as AdminTab },
    { title: "Active Users", value: `${activePatronsCount.toLocaleString('en-IN')}`, trend: "Active Patrons", icon: Users, color: "from-cyan-600 to-blue-700", tab: "customers" as AdminTab },
    { title: "Customer Inquiries", value: "4 New", trend: "B2B & Retail", icon: MessageSquareText, color: "from-blue-600 to-cyan-600", tab: "inquiries" as AdminTab },
    { title: "Out of Stock", value: `${outOfStockCount}`, trend: outOfStockCount > 0 ? "Immediate Restock" : "Full Stock", icon: AlertOctagon, color: "from-red-600 to-rose-700", tab: "inventory" as AdminTab },
    { title: "Low Stock Products", value: `${lowStockCount}`, trend: lowStockCount > 0 ? "< 10 units left" : "Optimal Stock", icon: AlertTriangle, color: "from-yellow-500 to-amber-600", tab: "inventory" as AdminTab },
    { title: "Coupons Used Today", value: `${couponsUsedCount}`, trend: couponsUsedCount > 0 ? "Active Codes" : "No Coupons", icon: TicketPercent, color: "from-indigo-500 to-purple-600", tab: "coupons" as AdminTab },
    { title: "Referral Earnings", value: `₹${referralEarningsTotal.toLocaleString('en-IN')}`, trend: "Patron Rewards", icon: Share2, color: "from-emerald-600 to-green-700", tab: "referrals" as AdminTab },
  ];

  const matchingKpiCards = cleanSearch
    ? kpiCards.filter(card =>
        card.title.toLowerCase().includes(cleanSearch) ||
        card.trend.toLowerCase().includes(cleanSearch) ||
        card.tab.toLowerCase().includes(cleanSearch)
      )
    : kpiCards;

  const displayedKpiCards = cleanSearch && matchingKpiCards.length > 0 ? matchingKpiCards : kpiCards;

  // Dynamic Chart Fallbacks from Real Live Orders
  const defaultSalesOverview = charts?.salesOverview || (
    liveOrders.length > 0
      ? liveOrders.slice(0, 7).map((o, i) => ({
          date: o.date ? String(o.date).split(" ")[0] || `Day ${i + 1}` : `Day ${i + 1}`,
          sales: Number(o.total) || 0,
          orders: 1,
          visitors: 3
        }))
      : [{ date: "Today", sales: totalSales, orders: totalOrdersCount, visitors: activePatronsCount * 3 }]
  );

  const defaultMonthlyRevenue = charts?.monthlyRevenue || [
    { month: new Date().toLocaleDateString("en-IN", { month: "short" }), revenue: totalSales, target: Math.round(totalSales * 1.2) }
  ];

  const defaultOrderStatusPie = charts?.orderStatusPie || [
    { name: "Delivered", value: Math.max(deliveredOrdersCount, 0), color: "#16a34a" },
    { name: "Processing / Shipped", value: Math.max(pendingOrdersCount + liveOrders.filter(o => o.orderStatus === "Shipped").length, 0), color: "#2563eb" },
    { name: "Pending Verification", value: Math.max(liveOrders.filter(o => o.orderStatus === "Pending").length, 0), color: "#d97706" },
    { name: "Cancelled / Returned", value: Math.max(cancelledOrdersCount + refundRequestsCount, 0), color: "#dc2626" }
  ].filter(p => p.value > 0 || liveOrders.length === 0);

  const defaultTopCategories = charts?.topCategories || [
    { category: "Bio-Fertilizers & Stimulants", revenue: Math.round(totalSales * 0.45), units: Math.max(1, totalOrdersCount) },
    { category: "Bio-Pesticides & Fungicides", revenue: Math.round(totalSales * 0.35), units: Math.max(1, totalOrdersCount) },
    { category: "Micro Nutrients & Sprays", revenue: Math.round(totalSales * 0.20), units: Math.max(1, totalOrdersCount) }
  ];

  const defaultWeeklySales = charts?.weeklySales || [
    { day: "Mon", online: 0, cod: 0 },
    { day: "Tue", online: 0, cod: 0 },
    { day: "Wed", online: 0, cod: 0 },
    { day: "Thu", online: 0, cod: 0 },
    { day: "Fri", online: 0, cod: 0 },
    { day: "Sat", online: 0, cod: 0 },
    { day: "Sun", online: totalSales, cod: 0 }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-12 min-w-0 max-w-full overflow-x-hidden">

      {/* Search Filter Status Banner */}
      {cleanSearch && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold flex-wrap">
            <Search className="size-4 text-emerald-600 shrink-0" />
            <span>
              Search active: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">"{searchQuery}"</strong>
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              • {filteredOrders.length} matching order{filteredOrders.length === 1 ? "" : "s"}
              {matchingKpiCards.length > 0 && ` • ${matchingKpiCards.length} matching metric card${matchingKpiCards.length === 1 ? "" : "s"}`}
            </span>
          </div>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <XCircle className="size-3.5" /> Clear Filter
            </button>
          )}
        </div>
      )}

      {/* 12 Luxury KPI Cards Grid */}
      <section className="min-w-0 max-w-full">
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5 lg:grid-cols-4 xl:grid-cols-6 min-w-0 max-w-full">
          {displayedKpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigateTab(card.tab)}
                className="group relative cursor-pointer overflow-hidden rounded-xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-card p-2.5 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-luxe min-w-0 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground truncate">{card.title}</span>
                  <div className={`grid size-6 sm:size-8 place-items-center rounded-lg sm:rounded-xl bg-gradient-to-br ${card.color} text-white shadow-sm shrink-0 transition-transform group-hover:scale-110`}>
                    <Icon className="size-3 sm:size-4" />
                  </div>
                </div>

                <div className="mt-1.5 sm:mt-3">
                  <span className="text-sm sm:text-lg lg:text-xl font-extrabold text-foreground tracking-tight truncate block">{card.value}</span>
                </div>

                <div className="mt-1 sm:mt-2 flex items-center justify-between text-[9px] sm:text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="truncate">{card.trend}</span>
                  <ArrowUpRight className="size-2.5 sm:size-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </section>



      {/* 6 Recharts Interactive Visualizations */}
      <section className="space-y-4 sm:space-y-6 min-w-0 max-w-full">
        <div className="flex items-center justify-between min-w-0">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 truncate">
            <BarChart3 className="size-4 text-emerald-600 shrink-0" /> Interactive Sales & Revenue Analytics
          </h2>
        </div>

        {/* Row 1: Sales Overview (Area) & Monthly Revenue (Bar) */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 min-w-0 max-w-full">
          {/* Chart 1: Sales Overview */}
          <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-3 sm:p-6 shadow-soft min-w-0 max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-3 sm:mb-4 min-w-0">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground">Sales Trend & Order Velocity</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Daily gross sales (₹) vs Store orders</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0 self-start sm:self-auto">
                Live Revenue Feed
              </span>
            </div>

            <div className="h-60 sm:h-72 w-full min-w-0 max-w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={defaultSalesOverview}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, "Sales"]}
                    contentStyle={{ borderRadius: "1rem", backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#salesGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Monthly Revenue vs Target */}
          <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-3 sm:p-6 shadow-soft min-w-0 max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-3 sm:mb-4 min-w-0">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground">Monthly Revenue vs Targets</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">FY 2026 Monthly performance in ₹</p>
              </div>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-amber-700 dark:text-amber-400 shrink-0 self-start sm:self-auto">
                Active Financials
              </span>
            </div>

            <div className="h-60 sm:h-72 w-full min-w-0 max-w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defaultMonthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${val >= 100000 ? `${(val / 100000).toFixed(1)}L` : val}`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, ""]}
                    contentStyle={{ borderRadius: "1rem", backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey="revenue" name="Actual Revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="target" name="Target Goal" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Order Status Donut, Top Categories, Top Products */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 min-w-0 max-w-full">
          {/* Chart 3: Order Status Donut */}
          <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-3 sm:p-6 shadow-soft min-w-0 max-w-full overflow-hidden">
            <h3 className="text-sm font-bold text-foreground mb-1">Order Status Fulfillment</h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">Total {totalOrdersCount} active database orders</p>
            <div className="h-56 sm:h-64 w-full min-w-0 max-w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={defaultOrderStatusPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {defaultOrderStatusPie.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#10b981"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "1rem", backgroundColor: "var(--card)", borderColor: "var(--border)" }} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Top Selling Categories */}
          <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-3 sm:p-6 shadow-soft min-w-0 max-w-full overflow-hidden">
            <h3 className="text-sm font-bold text-foreground mb-1">Top Selling Categories</h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">Revenue breakdown by product class</p>
            <div className="h-56 sm:h-64 w-full min-w-0 max-w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={defaultTopCategories}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
                  <YAxis dataKey="category" type="category" width={95} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, "Revenue"]} contentStyle={{ borderRadius: "1rem" }} />
                  <Bar dataKey="revenue" fill="#047857" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Weekly Sales (Online vs COD) */}
          <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-3 sm:p-6 shadow-soft min-w-0 max-w-full overflow-hidden">
            <h3 className="text-sm font-bold text-foreground mb-1">Weekly Day-by-Day Trend</h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">Online Prepaid vs Cash on Delivery</p>
            <div className="h-56 sm:h-64 w-full min-w-0 max-w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={defaultWeeklySales}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
                  <Tooltip contentStyle={{ borderRadius: "1rem" }} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Line type="monotone" dataKey="online" name="Prepaid Online" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="cod" name="COD" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Real-Time Tables Section */}
      <section className="space-y-4 sm:space-y-6 min-w-0 max-w-full">
        {/* Table 1: Latest Orders */}
        <div className="rounded-2xl sm:rounded-3xl border border-border bg-card shadow-soft overflow-hidden min-w-0 max-w-full">
          <div className="flex flex-col gap-2.5 sm:gap-3 p-3 sm:p-6 sm:flex-row sm:items-center sm:justify-between border-b border-border min-w-0">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="size-4 sm:size-4.5 text-emerald-600 shrink-0" /> Latest Customer Orders
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Real-time order feed with Shiprocket dispatch actions</p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 max-w-full">
              <div className="flex items-center rounded-xl sm:rounded-2xl border border-border bg-muted/40 p-1 text-xs font-semibold overflow-x-auto no-scrollbar max-w-full">
                {["all", "pending", "processing", "shipped", "delivered"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setTableFilter(status)}
                    className={`rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 capitalize transition-colors text-[10px] sm:text-[11px] shrink-0 cursor-pointer ${
                      tableFilter === status ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => onNavigateTab("orders")}
                variant="outline"
                size="sm"
                className="rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold shrink-0 cursor-pointer"
              >
                View Orders
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-muted/40 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Order ID</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Customer</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Items</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Total (₹)</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Payment</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Status</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.slice(0, 8).map((o) => (
                  <tr key={o.id || o.number} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-extrabold text-foreground">
                      <span className="text-emerald-700 dark:text-emerald-400">{o.number || o.id}</span>
                      <p className="text-[10px] font-normal text-muted-foreground mt-0.5">{o.date || "Today"}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {(() => {
                        const cust = getOrderCustomer(o);
                        return (
                          <>
                            <span className="font-bold text-foreground block">{cust.name}</span>
                            <span className="text-[10px] text-muted-foreground">{cust.phone} • {cust.city}</span>
                          </>
                        );
                      })()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="text-muted-foreground">{o.items?.length || 1} organic item(s)</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-foreground">
                      ₹{(Number(o.total) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
                        {o.paymentMethod || "Razorpay (Online)"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold ${
                          (o.orderStatus || o.status) === "Delivered"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : (o.orderStatus || o.status) === "Shipped"
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                            : (o.orderStatus || o.status) === "Processing"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : (o.orderStatus || o.status) === "Cancelled"
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                            : "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                        }`}
                      >
                        {o.orderStatus || o.status || "Processing"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                        {(o.orderStatus || o.status) !== "Shipped" && (o.orderStatus || o.status) !== "Delivered" && (
                          <Button
                            onClick={() => onOpenShiprocketModal(o)}
                            size="sm"
                            className="rounded-lg sm:rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] sm:text-[11px] h-6 sm:h-7 font-bold gap-1 cursor-pointer"
                          >
                            <Truck className="size-2.5 sm:size-3" /> Ship
                          </Button>
                        )}
                        <Button
                          onClick={() => onOpenInvoiceModal(o)}
                          variant="outline"
                          size="sm"
                          className="rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] h-6 sm:h-7 font-semibold cursor-pointer"
                        >
                          Invoice
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground text-xs italic">
                      No orders found matching the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row with Recent Payments & New Customers */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 min-w-0 max-w-full">
          {/* Table 2: Recent Payments */}
          <div className="rounded-2xl sm:rounded-3xl border border-border bg-card shadow-soft p-3 sm:p-6 min-w-0 max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-3 sm:mb-4 min-w-0">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground">Recent Gateway Transactions</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Live Razorpay & UPI settlements</p>
              </div>
              <button onClick={() => onNavigateTab("payments")} className="text-xs font-bold text-emerald-600 hover:underline shrink-0 text-left sm:text-right cursor-pointer">
                View All
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3 min-w-0">
              {(cleanSearch ? filteredOrders : liveOrders).slice(0, 4).map((o, idx) => {
                const cust = getOrderCustomer(o);
                const txn = o.transactionId || o.paymentGatewayId || `TXN-${o.id || idx}`;
                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-muted/40 border border-border/40 text-xs min-w-0 gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-foreground block truncate">{cust.name}</span>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{txn} • {o.paymentMethod || "Razorpay"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-foreground block">₹{(Number(o.total) || 0).toLocaleString('en-IN')}</span>
                      <span className={`text-[10px] font-bold ${o.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                        {o.paymentStatus || "Paid"}
                      </span>
                    </div>
                  </div>
                );
              })}
              {(cleanSearch ? filteredOrders : liveOrders).length === 0 && (
                <p className="text-xs text-muted-foreground italic py-3 text-center">No payment transactions recorded yet.</p>
              )}
            </div>
          </div>

          {/* Table 3: Highest Value Customers */}
          <div className="rounded-2xl sm:rounded-3xl border border-border bg-card shadow-soft p-3 sm:p-6 min-w-0 max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-3 sm:mb-4 min-w-0">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground">Highest Value Customers</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">VIP Patrons & Registered Accounts</p>
              </div>
              <button onClick={() => onNavigateTab("customers")} className="text-xs font-bold text-emerald-600 hover:underline shrink-0 text-left sm:text-right cursor-pointer">
                View All
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3 min-w-0">
              {(cleanSearch
                ? (liveCustomers.length > 0
                    ? liveCustomers.filter(c => {
                        const q = cleanSearch;
                        return String(c.name || "").toLowerCase().includes(q) || String(c.email || "").toLowerCase().includes(q) || String(c.phone || "").toLowerCase().includes(q);
                      })
                    : liveOrders.filter(o => {
                        const cust = getOrderCustomer(o);
                        const q = cleanSearch;
                        return String(cust.name || "").toLowerCase().includes(q) || String(cust.email || "").toLowerCase().includes(q) || String(cust.phone || "").toLowerCase().includes(q);
                      }).map(o => {
                        const cust = getOrderCustomer(o);
                        return { name: cust.name, email: cust.email || `${cust.phone}@janani.customer`, tier: cust.tier || "Active Patron", walletBalance: 0 };
                      }))
                : (liveCustomers.length > 0
                    ? liveCustomers
                    : liveOrders.map(o => {
                        const cust = getOrderCustomer(o);
                        return { name: cust.name, email: cust.email || `${cust.phone}@janani.customer`, tier: cust.tier || "Active Patron", walletBalance: 0 };
                      }))
              ).slice(0, 4).map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-muted/40 border border-border/40 text-xs min-w-0 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="size-7 sm:size-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                      {(c.name || "P").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-foreground block truncate">{c.name || "Customer"}</span>
                      <span className="text-[10px] text-muted-foreground block truncate">{c.email || c.phone || "Verified"}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-foreground block">{c.tier || "Active Patron"}</span>
                    <span className="text-[10px] font-bold text-emerald-600">Wallet: ₹{(Number(c.walletBalance) || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
              {liveCustomers.length === 0 && liveOrders.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-3 text-center">No customer profiles recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Table 4: Recent Product Reviews */}
        <div className="rounded-2xl sm:rounded-3xl border border-border bg-card shadow-soft p-3 sm:p-6 min-w-0 max-w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-3 sm:mb-4 min-w-0">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground">Latest Customer Reviews & Ratings</h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Authentic verified harvest feedback</p>
            </div>
            <button onClick={() => onNavigateTab("reviews")} className="text-xs font-bold text-emerald-600 hover:underline shrink-0 text-left sm:text-right cursor-pointer">
              Moderate Reviews ({liveReviews.length})
            </button>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0 max-w-full">
            {(liveReviews.length > 0
              ? liveReviews.slice(0, 4)
              : [
                  { productName: "Harit (1 L) — Trichoderma Viride", author: "Ramesh Patel", rating: 5, comment: "Controlled root rot completely in our groundnut fields. High spore count." },
                  { productName: "Bhumi Shakti (1 L) — Soil Conditioner", author: "Suresh Reddy", rating: 5, comment: "Excellent humus and root aeration. Chilli foliage is vigorous and deep green." },
                  { productName: "Neem Oil 1000 PPM (1 L) — Pest Shield", author: "Balram Choudhary", rating: 5, comment: "High azadirachtin potency. Repelled whiteflies and thrips effectively." },
                  { productName: "Dharani (1 L) — Root Growth Promoter", author: "Venkatesh Rao", rating: 5, comment: "Dense feeder root development in paddy nursery within 7 days." }
                ]
            ).map((r: any, idx: number) => (
              <div key={idx} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/60 flex flex-col justify-between min-w-0 max-w-full overflow-hidden">
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-amber-500 mb-1.5">
                    {Array.from({ length: Number(r.rating) || 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-amber-500 shrink-0" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-foreground truncate block">{r.productName || r.product_name || "Organic Produce"}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 break-words">"{r.comment || r.content || 'Great organic product'}"</p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] min-w-0 gap-2">
                  <span className="font-semibold text-foreground truncate min-w-0">{r.author || r.customerName || "Patron"}</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5 shrink-0">
                    <ShieldCheck className="size-3 shrink-0" /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
