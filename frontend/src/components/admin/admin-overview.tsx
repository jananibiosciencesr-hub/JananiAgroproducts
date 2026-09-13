import { useState } from "react";
import {
  TrendingUp,
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
  Download,
  Filter,
  RefreshCw,
  Eye,
  Truck,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Layers,
  Sparkles,
  BarChart3
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

interface AdminOverviewProps {
  stats: any;
  charts: any;
  widgets: any;
  orders: any[];
  onNavigateTab: (tab: AdminTab) => void;
  onOpenShiprocketModal: (order: any) => void;
  onOpenRestockModal: (item: any) => void;
  onOpenInvoiceModal: (order: any) => void;
}

export function AdminOverview({
  stats,
  charts,
  widgets,
  orders,
  onNavigateTab,
  onOpenShiprocketModal,
  onOpenRestockModal,
  onOpenInvoiceModal
}: AdminOverviewProps) {
  const [timeRange, setTimeRange] = useState("today");
  const [tableFilter, setTableFilter] = useState("all");

  const exportOrdersCSV = () => {
    const headers = ["Order ID", "Customer Name", "Phone", "Total (INR)", "Payment Method", "Order Status", "Date"];
    const rows = orders.map(o => [
      o.id,
      `"${o.customer?.name || ''}"`,
      `"${o.customer?.phone || ''}"`,
      o.total,
      `"${o.paymentMethod || ''}"`,
      `"${o.orderStatus || ''}"`,
      `"${o.date || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Janani_Agro_Orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => {
    if (tableFilter === "all") return true;
    return o.orderStatus?.toLowerCase() === tableFilter.toLowerCase();
  });

  const kpiCards = [
    { title: "Today's Orders", value: `${stats?.todayOrders ?? 38}`, trend: stats?.todayOrdersTrend || "+14.2%", icon: ShoppingBag, color: "from-emerald-500 to-emerald-700", tab: "orders" as AdminTab },
    { title: "Today's Revenue", value: `₹${(stats?.todayRevenue ?? 84250).toLocaleString('en-IN')}`, trend: stats?.todayRevenueTrend || "+18.6%", icon: DollarSign, color: "from-amber-500 to-amber-700", tab: "reports" as AdminTab },
    { title: "Monthly Revenue", value: `₹${((stats?.monthlyRevenue ?? 2485600) / 100000).toFixed(2)}L`, trend: stats?.monthlyRevenueTrend || "+24.5%", icon: Calendar, color: "from-blue-600 to-indigo-700", tab: "reports" as AdminTab },
    { title: "Pending Orders", value: `${stats?.pendingOrders ?? 9}`, trend: "Needs Dispatch", icon: Clock, color: "from-orange-500 to-amber-600", tab: "orders" as AdminTab },
    { title: "Delivered Orders", value: `${stats?.deliveredOrders ?? 412}`, trend: "98.4% On Time", icon: CheckCircle2, color: "from-emerald-600 to-teal-700", tab: "orders" as AdminTab },
    { title: "Cancelled Orders", value: `${stats?.cancelledOrders ?? 4}`, trend: "0.8% Rate", icon: XCircle, color: "from-rose-500 to-red-700", tab: "orders" as AdminTab },
    { title: "Refund Requests", value: `${stats?.refundRequests ?? 3}`, trend: "Action Required", icon: RotateCcw, color: "from-purple-500 to-pink-600", tab: "returns" as AdminTab },
    { title: "Active Users", value: `${(stats?.activeUsers ?? 1420).toLocaleString('en-IN')}`, trend: stats?.activeUsersTrend || "+8.9%", icon: Users, color: "from-cyan-600 to-blue-700", tab: "customers" as AdminTab },
    { title: "Out of Stock", value: `${stats?.outOfStockProducts ?? 1}`, trend: "Immediate Restock", icon: AlertOctagon, color: "from-red-600 to-rose-700", tab: "inventory" as AdminTab },
    { title: "Low Stock Products", value: `${stats?.lowStockProducts ?? 4}`, trend: "< 20 units left", icon: AlertTriangle, color: "from-yellow-500 to-amber-600", tab: "inventory" as AdminTab },
    { title: "Coupons Used Today", value: `${stats?.couponsUsedToday ?? 47}`, trend: "JANANI10 Top", icon: TicketPercent, color: "from-indigo-500 to-purple-600", tab: "coupons" as AdminTab },
    { title: "Referral Earnings", value: `₹${(stats?.referralEarnings ?? 38500).toLocaleString('en-IN')}`, trend: stats?.referralEarningsTrend || "+31.2%", icon: Share2, color: "from-emerald-600 to-green-700", tab: "referrals" as AdminTab },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-border/80 bg-gradient-to-r from-emerald-900/90 via-emerald-950 to-background p-6 sm:p-8 text-white shadow-luxe relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Sparkles className="size-64 text-amber-300" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 mb-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping"></span> Live Analytics Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">E-Commerce Command Center</h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-xl">
            Real-time multi-channel overview for Janani Agro Products. Track revenues, fulfill Shiprocket shipments, and monitor organic inventory.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-2xl border border-white/20 bg-black/40 px-4 py-2.5 text-xs font-semibold text-white outline-none focus:border-amber-400 backdrop-blur-md"
          >
            <option value="today" className="bg-card text-foreground">Today (Live)</option>
            <option value="7d" className="bg-card text-foreground">Last 7 Days</option>
            <option value="30d" className="bg-card text-foreground">Last 30 Days</option>
            <option value="ytd" className="bg-card text-foreground">Year to Date (2026)</option>
          </select>

          <Button
            onClick={exportOrdersCSV}
            className="rounded-2xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs gap-2 shadow-lg shadow-amber-500/20"
          >
            <Download className="size-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* 12 Luxury KPI Cards Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Layers className="size-4 text-emerald-600" /> Core Performance Metrics
          </h2>
          <span className="text-xs font-medium text-muted-foreground">Updated: Today 12:45 PM</span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {kpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigateTab(card.tab)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/80 bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-luxe"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground truncate">{card.title}</span>
                  <div className={`grid size-8 place-items-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-sm transition-transform group-hover:scale-110`}>
                    <Icon className="size-4" />
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">{card.value}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="truncate">{card.trend}</span>
                  <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6 Live Business Widgets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <TrendingUp className="size-4 text-emerald-600" /> Live Storefront Intelligence
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Widget 1: Live Visitors */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Active Visitors</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-foreground">{widgets?.liveVisitors?.count ?? 84}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                    </span>
                    Browsing Now
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Top Regional Activity:</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(widgets?.liveVisitors?.locations || ["Bengaluru (32)", "Mumbai (21)", "Hyderabad (16)", "Delhi NCR (15)"]).map((loc: string, i: number) => (
                  <span key={i} className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 2: Conversion Rate */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Store Conversion Rate</p>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{widgets?.conversionRate?.change || "+0.63%"}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-foreground">{widgets?.conversionRate?.rate || 3.84}%</span>
                <span className="text-xs text-muted-foreground font-medium">Target: {widgets?.conversionRate?.target || 4.0}%</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-amber-500 h-2 rounded-full" style={{ width: `${((widgets?.conversionRate?.rate || 3.84) / 4.0) * 100}%` }}></div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Benchmark above organic D2C industry average (2.4%)</p>
            </div>
          </div>

          {/* Widget 3: Average Order Value */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Average Order Value (AOV)</p>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{widgets?.averageOrderValue?.change || "+14.8%"}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-foreground">₹{(widgets?.averageOrderValue?.value || 2217).toLocaleString('en-IN')}</span>
                <span className="text-xs text-muted-foreground font-medium">vs ₹2,000 baseline</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Free shipping threshold</span>
              <span className="font-bold text-foreground">₹799+ orders</span>
            </div>
          </div>

          {/* Widget 4: COD vs Online Payment Split */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Mode Split</p>
              <div className="mt-2 flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">Prepaid Online: {widgets?.paymentSplit?.onlinePercent || 78.4}%</span>
                <span className="text-amber-600 dark:text-amber-400">COD: {widgets?.paymentSplit?.codPercent || 21.6}%</span>
              </div>
              <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-muted">
                <div className="bg-emerald-600" style={{ width: `${widgets?.paymentSplit?.onlinePercent || 78.4}%` }} title="Online UPI / Cards"></div>
                <div className="bg-amber-500" style={{ width: `${widgets?.paymentSplit?.codPercent || 21.6}%` }} title="Cash on Delivery"></div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Online: ₹{((widgets?.paymentSplit?.onlineTotal || 1948710) / 100000).toFixed(2)}L</span>
              <span>COD: ₹{((widgets?.paymentSplit?.codTotal || 536890) / 100000).toFixed(2)}L</span>
            </div>
          </div>

          {/* Widget 5: Best Selling Segment */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Best Performing Segment</p>
              <h3 className="mt-1 text-base font-bold text-foreground">{widgets?.bestSellingBrand?.name || "Janani Gold Heritage Reserve"}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Top product: {widgets?.bestSellingBrand?.topProduct || "Wood Pressed Groundnut Oil"}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Revenue contribution</span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {widgets?.bestSellingBrand?.share || "44.8%"} of Total
              </span>
            </div>
          </div>

          {/* Widget 6: Low Inventory Urgent Callout */}
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-5 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5" /> Inventory Critical Alerts
                </p>
                <button onClick={() => onNavigateTab("inventory")} className="text-[11px] font-bold text-rose-600 hover:underline">
                  View All
                </button>
              </div>
              <div className="mt-2 space-y-1.5">
                {(widgets?.lowInventoryAlerts || []).slice(0, 2).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs rounded-xl bg-card p-2 border border-border/60">
                    <span className="font-semibold text-foreground truncate max-w-[160px]">{item.name}</span>
                    <button
                      onClick={() => onOpenRestockModal(item)}
                      className="rounded-lg bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-rose-700 shadow-sm"
                    >
                      Restock ({item.stock})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Recharts Interactive Visualizations */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <BarChart3 className="size-4 text-emerald-600" /> Interactive Sales & Revenue Analytics
          </h2>
        </div>

        {/* Row 1: Sales Overview (Area) & Monthly Revenue (Bar) */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chart 1: Sales Overview */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Sales Trend & Traffic Velocity</h3>
                <p className="text-xs text-muted-foreground">Daily gross sales (₹) vs Store visitors</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                +18.6% Growth
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.salesOverview || []}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} />
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
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Monthly Revenue vs Targets</h3>
                <p className="text-xs text-muted-foreground">FY 2026 Monthly performance in Lakhs (₹)</p>
              </div>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                Target Exceeded
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${(Number(val) / 100000).toFixed(2)} Lakhs`, ""]}
                    contentStyle={{ borderRadius: "1rem", backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Actual Revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="target" name="Target Goal" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Order Status Donut, Top Categories, Top Products */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart 3: Order Status Donut */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h3 className="text-sm font-bold text-foreground mb-1">Order Status Fulfillment</h3>
            <p className="text-xs text-muted-foreground mb-4">Total 466 orders this month</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.orderStatusPie || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(charts?.orderStatusPie || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#10b981"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "1rem", backgroundColor: "var(--card)", borderColor: "var(--border)" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Top Selling Categories */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h3 className="text-sm font-bold text-foreground mb-1">Top Selling Categories</h3>
            <p className="text-xs text-muted-foreground mb-4">Revenue breakdown by product class</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={charts?.topCategories || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <YAxis dataKey="category" type="category" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, "Revenue"]} contentStyle={{ borderRadius: "1rem" }} />
                  <Bar dataKey="revenue" fill="#047857" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Weekly Sales (Online vs COD) */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h3 className="text-sm font-bold text-foreground mb-1">Weekly Day-by-Day Trend</h3>
            <p className="text-xs text-muted-foreground mb-4">Online Prepaid vs Cash on Delivery</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts?.weeklySales || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: "1rem" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="online" name="Prepaid Online" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="cod" name="COD" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Recent Tables Section */}
      <section className="space-y-6">
        {/* Table 1: Latest Orders */}
        <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between border-b border-border">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="size-4.5 text-emerald-600" /> Latest Customer Orders
              </h3>
              <p className="text-xs text-muted-foreground">Real-time order feed with Shiprocket dispatch actions</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-2xl border border-border bg-muted/40 p-1 text-xs font-semibold">
                {["all", "pending", "processing", "shipped", "delivered"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setTableFilter(status)}
                    className={`rounded-xl px-3 py-1 capitalize transition-colors ${
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
                className="rounded-2xl text-xs font-bold"
              >
                View Full Orders Manager
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total (₹)</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-foreground">
                      <span className="text-emerald-700 dark:text-emerald-400">{o.id}</span>
                      <p className="text-[10px] font-normal text-muted-foreground mt-0.5">{o.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-foreground block">{o.customer?.name}</span>
                      <span className="text-[10px] text-muted-foreground">{o.customer?.city}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-muted-foreground">{o.items?.length || 1} organic products</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      ₹{(o.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          o.orderStatus === "Delivered"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : o.orderStatus === "Shipped"
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                            : o.orderStatus === "Processing"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : o.orderStatus === "Cancelled"
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                            : "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {o.orderStatus !== "Shipped" && o.orderStatus !== "Delivered" && (
                          <Button
                            onClick={() => onOpenShiprocketModal(o)}
                            size="sm"
                            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] h-7 font-bold gap-1"
                          >
                            <Truck className="size-3" /> Ship
                          </Button>
                        )}
                        <Button
                          onClick={() => onOpenInvoiceModal(o)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-[11px] h-7 font-semibold"
                        >
                          Invoice
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row with Recent Payments & New Customers */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Table 2: Recent Payments */}
          <div className="rounded-3xl border border-border bg-card shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Recent Gateway Transactions</h3>
                <p className="text-xs text-muted-foreground">UPI, Razorpay, NetBanking & COD</p>
              </div>
              <button onClick={() => onNavigateTab("payments")} className="text-xs font-bold text-emerald-600 hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {[
                { ref: "TXN-88192301", name: "Ananya Sharma", amount: 4040, method: "UPI (PhonePe)", status: "Success", time: "10:45 AM" },
                { ref: "TXN-88192300", name: "Rajesh Kulkarni", amount: 1179, method: "HDFC Credit Card", status: "Success", time: "09:30 AM" },
                { ref: "TXN-88192299", name: "Sunita Iyer", amount: 1450, method: "Cash on Delivery", status: "Pending", time: "08:15 AM" },
                { ref: "TXN-88192298", name: "Vikram Malhotra", amount: 3140, method: "ICICI NetBanking", status: "Success", time: "Yesterday" },
              ].map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/40 text-xs">
                  <div>
                    <span className="font-bold text-foreground">{t.name}</span>
                    <p className="text-[10px] text-muted-foreground font-mono">{t.ref} • {t.method}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-foreground block">₹{t.amount.toLocaleString('en-IN')}</span>
                    <span className={`text-[10px] font-bold ${t.status === "Success" ? "text-emerald-600" : "text-amber-600"}`}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table 3: New Customers */}
          <div className="rounded-3xl border border-border bg-card shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Highest Value Customers</h3>
                <p className="text-xs text-muted-foreground">VIP Patrons & Repeat Orders</p>
              </div>
              <button onClick={() => onNavigateTab("customers")} className="text-xs font-bold text-emerald-600 hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {[
                { name: "Vikram Malhotra", email: "v.malhotra@techcorp.in", spent: "₹52,100", orders: 21, tier: "VIP Patron" },
                { name: "Ananya Sharma", email: "ananya.s@gmail.com", spent: "₹38,450", orders: 14, tier: "Platinum Gold" },
                { name: "Dr. Meenakshi Rao", email: "dr.m.rao@aiims.edu", spent: "₹26,800", orders: 11, tier: "Gold Member" },
                { name: "Rajesh Kulkarni", email: "rajesh.k@rediffmail.com", spent: "₹18,900", orders: 7, tier: "Gold Member" }
              ].map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/40 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground">{c.email}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-foreground block">{c.spent}</span>
                    <span className="text-[10px] font-bold text-emerald-600">{c.tier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table 4: Recent Product Reviews */}
        <div className="rounded-3xl border border-border bg-card shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Latest Customer Reviews & Ratings</h3>
              <p className="text-xs text-muted-foreground">Authentic verified harvest feedback</p>
            </div>
            <button onClick={() => onNavigateTab("reviews")} className="text-xs font-bold text-emerald-600 hover:underline">
              Moderate Reviews
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { product: "Royal Aged Basmati Rice", author: "Pooja Hegde", rating: 5, comment: "Extraordinary aroma and pristine elongation. Best organic basmati we have tasted." },
              { product: "A2 Vedic Gir Cow Ghee", author: "Narayanan S.", rating: 5, comment: "Authentic bilona aroma and golden grainy texture. Truly traditional." },
              { product: "Cold Pressed Groundnut Oil", author: "Arun Verma", rating: 4, comment: "Pure unrefined quality. Great smoking point for traditional cooking." },
              { product: "Wild Forest Raw Honey", author: "Divya Nair", rating: 5, comment: "Unfiltered with natural pollen notes. Genuine raw honey without sugar." }
            ].map((r, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-1.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-foreground truncate">{r.product}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">"{r.comment}"</p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-foreground">{r.author}</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <ShieldCheck className="size-3" /> Verified
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
