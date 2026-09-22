import { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Package,
  Truck,
  RotateCcw,
  RefreshCw,
  Ban,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  X,
  Printer,
  Copy,
  ExternalLink,
  MapPin,
  Calendar,
  Building2,
  CreditCard,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Send,
  Plus,
  Trash2,
  Share2,
  TrendingUp,
  DollarSign,
  Layers,
  ArrowUpRight,
  Check,
  Percent,
  Barcode
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  assignOrderWarehouse,
  generateShiprocketAwb,
  addOrderAdminNote,
  cancelAdminOrder,
  refundAdminOrder,
  returnAdminOrder,
  exchangeAdminOrder,
  bulkUpdateAdminOrderStatus,
  type OrderQueryParams
} from "@/lib/api";

// -------------------------------------------------------------
// Safe Data Extraction Utilities
// -------------------------------------------------------------

function getWarehouseName(warehouse: any): string {
  if (!warehouse) return "Bengaluru Central Hub";
  if (typeof warehouse === "string") return warehouse;
  return warehouse.name || warehouse.id || "Warehouse Hub";
}

function getItemTitle(item: any): string {
  if (!item) return "Janani Agro Product";
  return item.name || item.title || "Item";
}

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case "Delivered":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
    case "Shipped":
      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
    case "Processing":
      return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800";
    case "Pending":
      return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    case "Cancelled":
      return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
    case "Returned":
      return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800";
    case "Exchanged":
      return "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function PaymentBadge({ status }: { status: string }) {
  if (status === "Paid") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Paid
      </span>
    );
  }
  if (status === "Refunded") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
        <RotateCcw className="h-2.5 w-2.5" />
        Refunded
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
      <Clock className="h-2.5 w-2.5" />
      {status || "Pending"}
    </span>
  );
}

// -------------------------------------------------------------
// Orders Management Main Component
// -------------------------------------------------------------

export function OrdersManagement() {
  // Orders Data State
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    grossRevenue: 0
  });

  // Filters
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [courierFilter, setCourierFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  // Selection
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // 360° Order Detail Drawer
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"overview" | "timeline" | "logistics" | "documents" | "lifecycle">("overview");

  // Modals
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);
  const [packingSlipOrder, setPackingSlipOrder] = useState<any | null>(null);
  const [shippingLabelOrder, setShippingLabelOrder] = useState<any | null>(null);

  const [warehouseModalOrder, setWarehouseModalOrder] = useState<any | null>(null);
  const [shiprocketModalOrder, setShiprocketModalOrder] = useState<any | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<any | null>(null);
  const [refundModalOrder, setRefundModalOrder] = useState<any | null>(null);
  const [returnModalOrder, setReturnModalOrder] = useState<any | null>(null);
  const [exchangeModalOrder, setExchangeModalOrder] = useState<any | null>(null);
  const [noteModalOrder, setNoteModalOrder] = useState<any | null>(null);
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);

  // Load Orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getAdminOrders({
        status: activeTab !== "all" ? activeTab : undefined,
        paymentStatus: paymentFilter !== "all" ? paymentFilter : undefined,
        warehouse: warehouseFilter !== "all" ? warehouseFilter : undefined,
        courier: courierFilter !== "all" ? courierFilter : undefined,
        search: search.trim() ? search : undefined,
        sortBy: sortBy as any
      });

      if (res && res.data) {
        setOrders(res.data);
        if (res.stats) {
          setStats(res.stats);
        } else {
          const list = res.data;
          setStats({
            total: res.total || list.length,
            pending: res.pendingCount ?? list.filter((o: any) => o.orderStatus === "Pending").length,
            processing: res.processingCount ?? list.filter((o: any) => o.orderStatus === "Processing").length,
            shipped: res.shippedCount ?? list.filter((o: any) => o.orderStatus === "Shipped").length,
            delivered: res.deliveredCount ?? list.filter((o: any) => o.orderStatus === "Delivered").length,
            cancelled: res.cancelledCount ?? list.filter((o: any) => o.orderStatus === "Cancelled").length,
            returned: list.filter((o: any) => o.orderStatus === "Returned" || o.orderStatus === "Refunded").length,
            grossRevenue: res.totalRevenue ?? list.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
          });
        }
      } else if (Array.isArray(res)) {
        setOrders(res);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error("Failed to fetch orders from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab, paymentFilter, warehouseFilter, courierFilter, sortBy]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Open 360° Drawer
  const handleOpenDrawer = async (order: any) => {
    setSelectedOrderId(order.id);
    setSelectedOrder(order);
    setIsDrawerOpen(true);
    setDrawerTab("overview");

    try {
      const full = await getAdminOrderById(order.id);
      if (full) {
        setSelectedOrder(full);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Quick Status Update
  const handleQuickStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await updateAdminOrderStatus(orderId, { orderStatus: newStatus });
      if (res?.success) {
        toast.success(`Order ${orderId} updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({
            ...prev,
            orderStatus: newStatus,
            timeline: res.data?.timeline || prev.timeline
          }));
        }
        loadOrders();
      }
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  // Select all toggle
  const handleSelectAll = () => {
    if (selectedOrderIds.length === orders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map((o) => o.id));
    }
  };

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const exportData = orders.filter((o) =>
      selectedOrderIds.length > 0 ? selectedOrderIds.includes(o.id) : true
    );

    if (exportData.length === 0) {
      toast.error("No orders available to export");
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Shipping City",
      "Shipping State",
      "Pincode",
      "Total Amount (INR)",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Warehouse",
      "Courier Partner",
      "Shiprocket AWB",
      "Items Count"
    ];

    const rows = exportData.map((o) => [
      `"${o.id}"`,
      `"${o.date}"`,
      `"${o.customer?.name || ""}"`,
      `"${o.customer?.email || ""}"`,
      `"${o.customer?.phone || ""}"`,
      `"${o.shippingAddress?.city || ""}"`,
      `"${o.shippingAddress?.state || ""}"`,
      `"${o.shippingAddress?.pincode || ""}"`,
      o.total || 0,
      `"${o.paymentMethod || ""}"`,
      `"${o.paymentStatus || ""}"`,
      `"${o.orderStatus || ""}"`,
      `"${getWarehouseName(o.warehouse)}"`,
      `"${o.courier || ""}"`,
      `"${o.trackingId || ""}"`,
      o.items?.length || 0
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Janani_Agro_Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${exportData.length} orders to CSV`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Orders Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Live Fulfillment
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track customer orders, generate GST tax invoices, dispatch with Shiprocket logistics, and manage returns & refunds.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadOrders}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
            title="Refresh order directory"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Export Orders ({selectedOrderIds.length > 0 ? selectedOrderIds.length : "All"})</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1.5">
            {stats.total || orders.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Lifetime orders placed</p>
        </div>

        <div className="bg-card border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 shadow-sm bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1.5">
            {stats.pending}
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping inline-block"></span>
            Needs warehouse dispatch
          </p>
        </div>

        <div className="bg-card border border-blue-200 dark:border-blue-900/60 rounded-xl p-3.5 shadow-sm bg-gradient-to-br from-blue-500/5 to-transparent">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider">In Transit / Shipped</span>
            <Truck className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1.5">
            {stats.shipped}
          </div>
          <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">Shiprocket tracking active</p>
        </div>

        <div className="bg-card border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3.5 shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1.5">
            {stats.delivered}
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">99.2% success rate</p>
        </div>

        <div className="bg-card border border-rose-200 dark:border-rose-900/60 rounded-xl p-3.5 shadow-sm bg-gradient-to-br from-rose-500/5 to-transparent">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cancelled / Returns</span>
            <Ban className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1.5">
            {stats.cancelled + stats.returned}
          </div>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
            {stats.cancelled} Can. / {stats.returned} Ret.
          </p>
        </div>

        <div className="bg-card border border-emerald-300/80 dark:border-emerald-700/60 rounded-xl p-3.5 shadow-sm bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between text-primary">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1.5">
            ₹{stats.grossRevenue.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">All active orders</p>
        </div>
      </div>

      {/* 3. Filter Navigation Tabs & Toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin border-b border-border/60">
          {[
            { id: "all", label: "All Orders", count: stats.total },
            { id: "Pending", label: "Pending Fulfillment", count: stats.pending, badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
            { id: "Processing", label: "Processing & Packed", count: stats.processing, badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300" },
            { id: "Shipped", label: "Shipped (In Transit)", count: stats.shipped, badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" },
            { id: "Delivered", label: "Delivered", count: stats.delivered, badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
            { id: "Cancelled", label: "Cancelled", count: stats.cancelled, badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" },
            { id: "Returned", label: "Returns / Reverse", count: stats.returned, badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : tab.badgeColor || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Secondary Filter Dropdowns */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, Phone, Email or Shiprocket AWB..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/60 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-input rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
            >
              <option value="all">Payment: All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending / COD</option>
              <option value="Refunded">Refunded</option>
            </select>

            {/* Warehouse Filter */}
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-input rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
            >
              <option value="all">Warehouse: All Hubs</option>
              <option value="WH-BLR-01">Bengaluru Central Hub</option>
              <option value="WH-HYD-01">Hyderabad Agro-Logistics</option>
              <option value="WH-DEL-02">Delhi NCR Hub</option>
              <option value="WH-MUM-01">Mumbai Western Hub</option>
            </select>

            {/* Courier Filter */}
            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-input rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
            >
              <option value="all">Courier: All</option>
              <option value="Shiprocket (Bluedart Air)">Bluedart Air</option>
              <option value="Shiprocket (Delhivery Surface)">Delhivery Express</option>
              <option value="Shiprocket (Ekart Logistics)">Ekart</option>
              <option value="Shadowfax">Shadowfax</option>
              <option value="XpressBees">XpressBees</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-background border border-input rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Value</option>
              <option value="amount_asc">Lowest Value</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Floating Bar */}
        {selectedOrderIds.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-foreground">
                {selectedOrderIds.length} orders selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBulkStatusModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                Update Status
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-background border border-input text-foreground hover:bg-muted transition-colors shadow-sm"
              >
                Export Selected
              </button>
              <button
                onClick={() => setSelectedOrderIds([])}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
                title="Deselect all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Orders Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                    onChange={handleSelectAll}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Order Details</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Financials</th>
                <th className="py-3.5 px-4">Logistics & Hub</th>
                <th className="py-3.5 px-4 text-center">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium text-muted-foreground">
                        Loading Janani Agro orders...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <p className="text-base font-semibold text-foreground">No orders found</p>
                      <p className="text-xs text-muted-foreground text-center">
                        Try adjusting your search criteria, warehouse filters, or status tab.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isSelected = selectedOrderIds.includes(order.id);
                  const itemCount = order.items?.length || 0;
                  const warehouseDisplay = getWarehouseName(order.warehouse);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-muted/40 transition-colors group ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOrder(order.id)}
                          className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                        />
                      </td>

                      {/* Order Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleOpenDrawer(order)}
                            className="text-left font-bold text-sm text-primary hover:underline flex items-center gap-1.5"
                          >
                            <span>{order.id}</span>
                          </button>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {order.date}
                          </span>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-muted-foreground/80 bg-muted px-1.5 py-0.5 rounded w-fit">
                            Direct Web
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                            {order.customer?.name?.charAt(0) || "C"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate max-w-[140px]">
                              {order.customer?.name || "Customer"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                              {order.customer?.email || ""}
                            </p>
                            <p className="text-[11px] text-muted-foreground/80">
                              {order.shippingAddress?.city || "India"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden shrink-0">
                            {order.items?.slice(0, 3).map((item: any, idx: number) => (
                              <img
                                key={idx}
                                src={item.image || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100&auto=format&fit=crop&q=80"}
                                alt={getItemTitle(item)}
                                className="inline-block h-8 w-8 rounded-lg ring-2 ring-background object-cover bg-muted"
                                title={`${getItemTitle(item)} (x${item.qty || 1})`}
                              />
                            ))}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                              {order.items?.[0] ? getItemTitle(order.items[0]) : "Item"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {itemCount > 1 ? `+${itemCount - 1} more (${itemCount} total)` : `Qty: ${order.items?.[0]?.qty || 1}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">
                            ₹{order.total?.toLocaleString("en-IN")}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <PaymentBadge status={order.paymentStatus} />
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                              {order.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Logistics & Hub */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-xs text-foreground font-medium">
                            <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[120px]" title={warehouseDisplay}>
                              {warehouseDisplay}
                            </span>
                          </div>
                          {order.trackingId ? (
                            <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                              <Truck className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[110px]" title={order.trackingId}>
                                {order.trackingId}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShiprocketModalOrder(order)}
                              className="text-[11px] text-primary hover:underline flex items-center gap-1"
                            >
                              <Plus className="h-2.5 w-2.5" />
                              <span>Assign AWB</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Fulfillment Status Dropdown */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 ${getStatusBadgeStyle(
                            order.orderStatus
                          )}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Returned">Returned</option>
                          <option value="Exchanged">Exchanged</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDrawer(order)}
                            className="p-1.5 rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors"
                            title="View 360° Order Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setInvoiceOrder(order)}
                            className="p-1.5 rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors"
                            title="Print GST Tax Invoice"
                          >
                            <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </button>

                          <button
                            onClick={() => setPackingSlipOrder(order)}
                            className="p-1.5 rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors"
                            title="Print Warehouse Packing Slip"
                          >
                            <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </button>

                          <button
                            onClick={() => setShippingLabelOrder(order)}
                            className="p-1.5 rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors"
                            title="Print Shiprocket Shipping Label"
                          >
                            <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </button>

                          <OrderRowActionMenu
                            order={order}
                            onAssignWarehouse={() => setWarehouseModalOrder(order)}
                            onAssignShiprocket={() => setShiprocketModalOrder(order)}
                            onCancel={() => setCancelModalOrder(order)}
                            onRefund={() => setRefundModalOrder(order)}
                            onReturn={() => setReturnModalOrder(order)}
                            onExchange={() => setExchangeModalOrder(order)}
                            onAddNote={() => setNoteModalOrder(order)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <span>
            Showing <strong className="text-foreground">{orders.length}</strong> orders (Filtered from total {stats.total || orders.length})
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Delivered / Paid
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span> In Transit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span> Pending Dispatch
            </span>
          </div>
        </div>
      </div>

      {/* 5. 360° Order Detail Drawer */}
      <OrderDetailDrawer
        isOpen={isDrawerOpen}
        order={selectedOrder}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={drawerTab}
        setActiveTab={setDrawerTab}
        onUpdateStatus={handleQuickStatusChange}
        onOpenInvoice={() => setInvoiceOrder(selectedOrder)}
        onOpenPackingSlip={() => setPackingSlipOrder(selectedOrder)}
        onOpenShippingLabel={() => setShippingLabelOrder(selectedOrder)}
        onOpenWarehouseModal={() => setWarehouseModalOrder(selectedOrder)}
        onOpenShiprocketModal={() => setShiprocketModalOrder(selectedOrder)}
        onOpenCancelModal={() => setCancelModalOrder(selectedOrder)}
        onOpenRefundModal={() => setRefundModalOrder(selectedOrder)}
        onOpenReturnModal={() => setReturnModalOrder(selectedOrder)}
        onOpenExchangeModal={() => setExchangeModalOrder(selectedOrder)}
        onOpenNoteModal={() => setNoteModalOrder(selectedOrder)}
      />

      {/* 6. Printable GST Tax Invoice Modal */}
      {invoiceOrder && (
        <PrintableTaxInvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}

      {/* 7. Printable Warehouse Packing Slip Modal */}
      {packingSlipOrder && (
        <PrintablePackingSlipModal
          order={packingSlipOrder}
          onClose={() => setPackingSlipOrder(null)}
        />
      )}

      {/* 8. Printable Shiprocket Shipping Label Modal */}
      {shippingLabelOrder && (
        <PrintableShippingLabelModal
          order={shippingLabelOrder}
          onClose={() => setShippingLabelOrder(null)}
        />
      )}

      {/* 9. Assign Warehouse Hub Modal */}
      {warehouseModalOrder && (
        <AssignWarehouseModal
          order={warehouseModalOrder}
          onClose={() => setWarehouseModalOrder(null)}
          onSuccess={(newWarehouse) => {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === warehouseModalOrder.id ? { ...o, warehouse: newWarehouse } : o
              )
            );
            if (selectedOrder && selectedOrder.id === warehouseModalOrder.id) {
              setSelectedOrder((prev: any) => ({ ...prev, warehouse: newWarehouse }));
            }
            setWarehouseModalOrder(null);
            loadOrders();
          }}
        />
      )}

      {/* 10. Shiprocket AWB Generator Modal */}
      {shiprocketModalOrder && (
        <GenerateShiprocketModal
          order={shiprocketModalOrder}
          onClose={() => setShiprocketModalOrder(null)}
          onSuccess={(resData) => {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === shiprocketModalOrder.id
                  ? {
                      ...o,
                      orderStatus: "Shipped",
                      courier: resData.courier,
                      trackingId: resData.awbCode
                    }
                  : o
              )
            );
            if (selectedOrder && selectedOrder.id === shiprocketModalOrder.id) {
              setSelectedOrder((prev: any) => ({
                ...prev,
                orderStatus: "Shipped",
                courier: resData.courier,
                trackingId: resData.awbCode
              }));
            }
            setShiprocketModalOrder(null);
            loadOrders();
          }}
        />
      )}

      {/* 11. Cancel Order Modal */}
      {cancelModalOrder && (
        <CancelOrderModal
          order={cancelModalOrder}
          onClose={() => setCancelModalOrder(null)}
          onSuccess={() => {
            setCancelModalOrder(null);
            loadOrders();
          }}
        />
      )}

      {/* 12. Refund Order Modal */}
      {refundModalOrder && (
        <RefundOrderModal
          order={refundModalOrder}
          onClose={() => setRefundModalOrder(null)}
          onSuccess={() => {
            setRefundModalOrder(null);
            loadOrders();
          }}
        />
      )}

      {/* 13. Return Order Modal */}
      {returnModalOrder && (
        <ReturnOrderModal
          order={returnModalOrder}
          onClose={() => setReturnModalOrder(null)}
          onSuccess={() => {
            setReturnModalOrder(null);
            loadOrders();
          }}
        />
      )}

      {/* 14. Exchange Order Modal */}
      {exchangeModalOrder && (
        <ExchangeOrderModal
          order={exchangeModalOrder}
          onClose={() => setExchangeModalOrder(null)}
          onSuccess={() => {
            setExchangeModalOrder(null);
            loadOrders();
          }}
        />
      )}

      {/* 15. Add Admin Note Modal */}
      {noteModalOrder && (
        <AddAdminNoteModal
          order={noteModalOrder}
          onClose={() => setNoteModalOrder(null)}
          onSuccess={(noteText) => {
            if (selectedOrder && selectedOrder.id === noteModalOrder.id) {
              setSelectedOrder((prev: any) => ({
                ...prev,
                adminNotes: [...(prev.adminNotes || []), noteText]
              }));
            }
            setNoteModalOrder(null);
            loadOrders();
          }}
        />
      )}

      {/* 16. Bulk Status Update Modal */}
      {isBulkStatusModalOpen && (
        <BulkStatusModal
          selectedIds={selectedOrderIds}
          onClose={() => setIsBulkStatusModalOpen(false)}
          onSuccess={() => {
            setSelectedOrderIds([]);
            setIsBulkStatusModalOpen(false);
            loadOrders();
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Row Action Dropdown Menu
// -------------------------------------------------------------

function OrderRowActionMenu({
  order,
  onAssignWarehouse,
  onAssignShiprocket,
  onCancel,
  onRefund,
  onReturn,
  onExchange,
  onAddNote
}: {
  order: any;
  onAssignWarehouse: () => void;
  onAssignShiprocket: () => void;
  onCancel: () => void;
  onRefund: () => void;
  onReturn: () => void;
  onExchange: () => void;
  onAddNote: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-52 rounded-xl bg-card border border-border shadow-xl z-50 py-1.5 divide-y divide-border text-xs animate-in fade-in zoom-in-95">
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onAssignWarehouse();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-muted flex items-center gap-2 text-foreground font-medium"
            >
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>Assign Warehouse Hub</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onAssignShiprocket();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-muted flex items-center gap-2 text-foreground font-medium"
            >
              <Truck className="h-3.5 w-3.5 text-blue-600" />
              <span>Shiprocket Logistics</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onAddNote();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-muted flex items-center gap-2 text-foreground font-medium"
            >
              <Send className="h-3.5 w-3.5 text-amber-600" />
              <span>Add Internal Note</span>
            </button>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onRefund();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-muted flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Process Refund</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onReturn();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-muted flex items-center gap-2 text-foreground font-medium"
            >
              <RotateCcw className="h-3.5 w-3.5 text-orange-500" />
              <span>Schedule Return Pickup</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onExchange();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-muted flex items-center gap-2 text-teal-600 dark:text-teal-400 font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Exchange / Replacement</span>
            </button>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onCancel();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium"
            >
              <Ban className="h-3.5 w-3.5" />
              <span>Cancel Order</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 360° Order Detail Drawer Component
// -------------------------------------------------------------

function OrderDetailDrawer({
  isOpen,
  order,
  onClose,
  activeTab,
  setActiveTab,
  onUpdateStatus,
  onOpenInvoice,
  onOpenPackingSlip,
  onOpenShippingLabel,
  onOpenWarehouseModal,
  onOpenShiprocketModal,
  onOpenCancelModal,
  onOpenRefundModal,
  onOpenReturnModal,
  onOpenExchangeModal,
  onOpenNoteModal
}: {
  isOpen: boolean;
  order: any;
  onClose: () => void;
  activeTab: "overview" | "timeline" | "logistics" | "documents" | "lifecycle";
  setActiveTab: (tab: "overview" | "timeline" | "logistics" | "documents" | "lifecycle") => void;
  onUpdateStatus: (id: string, st: string) => void;
  onOpenInvoice: () => void;
  onOpenPackingSlip: () => void;
  onOpenShippingLabel: () => void;
  onOpenWarehouseModal: () => void;
  onOpenShiprocketModal: () => void;
  onOpenCancelModal: () => void;
  onOpenRefundModal: () => void;
  onOpenReturnModal: () => void;
  onOpenExchangeModal: () => void;
  onOpenNoteModal: () => void;
}) {
  if (!isOpen || !order) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const warehouseName = getWarehouseName(order.warehouse);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                  <span>Order {order.id}</span>
                  <button
                    onClick={() => copyToClipboard(order.id, "Order ID")}
                    className="p-1 text-muted-foreground hover:text-foreground rounded"
                    title="Copy Order ID"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </h2>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Placed on {order.date} • Direct Consumer Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-border bg-card overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Items", icon: ShoppingBag },
            { id: "timeline", label: "Timeline & Tracking", icon: Clock },
            { id: "logistics", label: "Warehouse & Shiprocket", icon: Truck },
            { id: "documents", label: "Print Documents", icon: FileText },
            { id: "lifecycle", label: "Cancel / Refund / Return", icon: RotateCcw }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW & ITEMS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Customer & Address Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Details */}
                <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User className="h-4 w-4 text-primary" />
                      Customer Profile
                    </span>
                    <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      Verified Patron
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <p className="font-bold text-foreground text-base">{order.customer?.name}</p>
                    <p className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {order.customer?.email}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {order.customer?.phone}
                    </p>
                  </div>
                </div>

                {/* Shipping & Billing Address */}
                <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      Delivery Address
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}`,
                          "Address"
                        )
                      }
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p className="font-semibold text-foreground">
                      {order.shippingAddress?.street || "Green Valley Estate, Plot 14"}
                    </p>
                    <p>
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} —{" "}
                      <strong className="text-foreground">{order.shippingAddress?.pincode}</strong>
                    </p>
                    <p className="text-[11px] text-muted-foreground/80">India</p>
                  </div>
                </div>
              </div>

              {/* Ordered Products Table */}
              <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <span>Line Items ({order.items?.length || 0})</span>
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    HSN & GST Registered Goods
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase">
                        <th className="py-2.5 px-4">Item Details</th>
                        <th className="py-2.5 px-3">HSN Code</th>
                        <th className="py-2.5 px-3 text-center">Tax Rate</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {order.items?.map((item: any, idx: number) => {
                        const lineTotal = (item.price || 0) * (item.qty || 1);
                        const title = getItemTitle(item);
                        return (
                          <tr key={idx} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100&auto=format&fit=crop&q=80"}
                                  alt={title}
                                  className="h-10 w-10 rounded-lg object-cover border border-border bg-muted shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-foreground text-xs">{title}</p>
                                  <p className="text-[11px] text-muted-foreground font-mono">
                                    SKU: {item.sku || "JA-SKU-992"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono text-muted-foreground">
                              {item.hsnCode || "091099"}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="px-2 py-0.5 rounded bg-muted font-semibold text-muted-foreground">
                                {item.taxRate || 5}% GST
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-foreground">
                              {item.qty}
                            </td>
                            <td className="py-3 px-3 text-right font-medium text-muted-foreground">
                              ₹{item.price?.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-foreground">
                              ₹{lineTotal.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mathematical Calculation Summary */}
                <div className="p-4 bg-muted/10 border-t border-border flex justify-end">
                  <div className="w-full max-w-xs space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Items Subtotal</span>
                      <span className="font-medium text-foreground">
                        ₹{(order.subtotal || order.total * 0.95).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>CGST (2.5%)</span>
                      <span className="font-medium text-foreground">
                        ₹{((order.taxAmount ? order.taxAmount / 2 : order.total * 0.025)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>SGST (2.5%)</span>
                      <span className="font-medium text-foreground">
                        ₹{((order.taxAmount ? order.taxAmount / 2 : order.total * 0.025)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping & Handling</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {((order.shippingFee ?? order.deliveryFee ?? 0) > 0) ? `₹${order.shippingFee || order.deliveryFee}` : "FREE"}
                      </span>
                    </div>
                    {(order.couponCode || (order.couponDiscount && order.couponDiscount > 0) || (order.discount && order.discount > 0)) && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>🏷️ Coupon ({order.couponCode || "Applied"})</span>
                        <span>-₹{(order.couponDiscount || order.discount || 0).toFixed(2)}</span>
                      </div>
                    )}
                    {(order.walletDeduction && order.walletDeduction > 0) && (
                      <div className="flex justify-between text-amber-600 font-medium">
                        <span>🪙 Farm Wallet Deduction</span>
                        <span>-₹{(order.walletDeduction).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex justify-between text-sm font-bold text-foreground">
                      <span>Total Amount Paid</span>
                      <span className="text-primary text-base">₹{order.total?.toLocaleString("en-IN")}</span>
                    </div>
                    {order.transactionId && (
                      <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                        <span>Razorpay Txn ID:</span>
                        <span className="font-mono text-foreground font-semibold">{order.transactionId}</span>
                      </div>
                    )}
                    {order.deliverySlot && (
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Preferred Slot:</span>
                        <span className="text-foreground font-medium">{order.deliverySlot}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Internal Notes & Special Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="h-4 w-4 text-indigo-500" />
                    Customer Delivery Instructions
                  </h4>
                  <p className="text-xs text-foreground bg-muted/30 p-3 rounded-lg border border-border italic">
                    "{order.customerNote || order.notes || "Please handle with care. Fragile glass spice jars inside package."}"
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Internal Admin Notes
                    </h4>
                    <button
                      onClick={onOpenNoteModal}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Note</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {order.adminNotes && order.adminNotes.length > 0 ? (
                      order.adminNotes.map((note: string, i: number) => (
                        <div key={i} className="text-xs bg-muted/40 p-2 rounded border border-border text-foreground">
                          {note}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No internal notes logged yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE & LIVE PIPELINE TRACKING */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      Live Shipment Pipeline
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Tracking Shiprocket AWB: <strong className="text-foreground">{order.trackingId || "Pending Generation"}</strong>
                    </p>
                  </div>
                  <button
                    onClick={onOpenShiprocketModal}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Sync Courier Status
                  </button>
                </div>

                {/* Vertical Timeline */}
                <div className="mt-6 space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
                  {order.timeline && order.timeline.length > 0 ? (
                    order.timeline.map((event: any, idx: number) => (
                      <div key={idx} className="relative flex items-start gap-4 pl-1">
                        <div className="h-7 w-7 rounded-full bg-card border-2 border-primary text-primary flex items-center justify-center shrink-0 z-10 shadow-sm">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 bg-muted/30 p-3.5 rounded-xl border border-border">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="font-bold text-xs sm:text-sm text-foreground">
                              {event.status || event.title}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium">
                              {event.time || event.date}
                            </span>
                          </div>
                          {(event.note || event.description) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.note || event.description}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-[11px] text-primary/80 font-medium mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-muted-foreground">
                      No live events logged. Assign warehouse or generate Shiprocket AWB to initiate pipeline tracking.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WAREHOUSE & SHIPROCKET LOGISTICS */}
          {activeTab === "logistics" && (
            <div className="space-y-6">
              {/* Warehouse Assignment Card */}
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Fulfillment Warehouse Hub</h4>
                      <p className="text-xs text-muted-foreground">Assigned distribution center for picking & packing</p>
                    </div>
                  </div>
                  <button
                    onClick={onOpenWarehouseModal}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-input transition-colors"
                  >
                    Reassign Hub
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Hub Identifier</span>
                    <p className="font-bold text-sm text-foreground">{warehouseName}</p>
                    <p className="text-xs text-muted-foreground">Electronics City Phase 1, Bengaluru, Karnataka</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Dispatch Window</span>
                    <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Same-Day Priority Packing</p>
                    <p className="text-xs text-muted-foreground">Cutoff: 4:00 PM IST</p>
                  </div>
                </div>
              </div>

              {/* Courier Partner & AWB Generator Card */}
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Shiprocket Courier Partner</h4>
                      <p className="text-xs text-muted-foreground">Automated multi-carrier surface & air routing</p>
                    </div>
                  </div>
                  <button
                    onClick={onOpenShiprocketModal}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>{order.trackingId ? "Re-generate AWB" : "Generate Shiprocket AWB"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Courier Name</span>
                    <p className="font-bold text-sm text-foreground">{order.courier || "Shiprocket (Bluedart Air)"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Shiprocket AWB</span>
                    <p className="font-bold text-sm text-blue-600 dark:text-blue-400 font-mono">
                      {order.trackingId || "AWB-NOT-GENERATED"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Estimated Transit</span>
                    <p className="font-bold text-sm text-emerald-600">2 - 3 Business Days</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRINT DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Generate and print standardized commerce documents conforming to Indian GST Tax laws and warehouse fulfillment guidelines.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Tax Invoice */}
                <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">GST Tax Invoice</h4>
                    <p className="text-xs text-muted-foreground">
                      Full Rule 46 compliant tax invoice with GSTIN, HSN rates, CGST+SGST breakdown.
                    </p>
                  </div>
                  <button
                    onClick={onOpenInvoice}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Invoice</span>
                  </button>
                </div>

                {/* 2. Packing Slip */}
                <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                      <Package className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">Warehouse Packing Slip</h4>
                    <p className="text-xs text-muted-foreground">
                      Order picker sheet with bin racks, SKU item checklist, and pack verification.
                    </p>
                  </div>
                  <button
                    onClick={onOpenPackingSlip}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Packing Slip</span>
                  </button>
                </div>

                {/* 3. Shipping Label */}
                <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                      <Truck className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">Shiprocket Shipping Label</h4>
                    <p className="text-xs text-muted-foreground">
                      Standard 4x6 / A4 thermal courier barcode label with routing codes and return address.
                    </p>
                  </div>
                  <button
                    onClick={onOpenShippingLabel}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Shipping Label</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: POST-PURCHASE LIFECYCLE */}
          {activeTab === "lifecycle" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  Post-Purchase Order Operations
                </h4>
                <p className="text-xs text-muted-foreground">
                  Execute customer satisfaction workflows with automated stock adjustments and payment gateway reconciliation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cancel */}
                  <div className="p-4 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase">
                      <Ban className="h-4 w-4" />
                      Order Cancellation
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cancel this order, automatically restock reserved inventory, and notify buyer.
                    </p>
                    <button
                      onClick={onOpenCancelModal}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                    >
                      Cancel Order & Restock
                    </button>
                  </div>

                  {/* Refund */}
                  <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase">
                      <DollarSign className="h-4 w-4" />
                      Payment Refund
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Issue full or partial refund to original payment source (UPI/Razorpay) or Customer Wallet.
                    </p>
                    <button
                      onClick={onOpenRefundModal}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    >
                      Issue Refund
                    </button>
                  </div>

                  {/* Return */}
                  <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase">
                      <RotateCcw className="h-4 w-4" />
                      Reverse Pickup / Return
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Schedule reverse courier pickup from customer doorstep back to Janani Agro hub.
                    </p>
                    <button
                      onClick={onOpenReturnModal}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                    >
                      Schedule Return Pickup
                    </button>
                  </div>

                  {/* Exchange */}
                  <div className="p-4 rounded-lg border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase">
                      <RefreshCw className="h-4 w-4" />
                      Item Exchange
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Initiate replacement order for damaged or incorrect item variant.
                    </p>
                    <button
                      onClick={onOpenExchangeModal}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                    >
                      Create Replacement Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Quick Status:</span>
            <select
              value={order.orderStatus}
              onChange={(e) => onUpdateStatus(order.id, e.target.value)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-input bg-background text-foreground"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
              <option value="Exchanged">Exchanged</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenInvoice}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-input bg-card hover:bg-muted text-foreground flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-600" />
              <span>Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Printable GST Tax Invoice Modal (Rule 46 Compliant)
// -------------------------------------------------------------

function PrintableTaxInvoiceModal({
  order,
  onClose
}: {
  order: any;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  const subtotal = order.subtotal || order.total * 0.95;
  const tax = order.taxAmount || order.total * 0.05;
  const cgst = tax / 2;
  const sgst = tax / 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-white text-neutral-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Control Bar */}
        <div className="px-6 py-3 bg-neutral-100 border-b border-neutral-300 flex items-center justify-between no-print">
          <span className="text-sm font-bold text-neutral-800 flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            Official GST Tax Invoice Preview
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-500 hover:text-neutral-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-neutral-900 font-sans text-xs" id="printable-tax-invoice">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-4">
            <div>
              <h1 className="text-xl font-black text-emerald-900 tracking-tight">JANANI AGRO PRODUCTS PVT LTD</h1>
              <p className="text-[11px] text-neutral-600 mt-0.5">Pure Natural Spices, Organic Oils & Heritage Millets</p>
              <p className="text-[11px] text-neutral-600">Plot No. 44, Food Processing Zone, KIADB Industrial Area,</p>
              <p className="text-[11px] text-neutral-600">Bengaluru, Karnataka - 560100, India</p>
              <p className="text-[11px] font-semibold text-neutral-800 mt-1">GSTIN: 29AAACJ1234F1Z5 • CIN: U01111KA2020PTC123456</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-black text-xs uppercase tracking-widest rounded border border-emerald-300">
                TAX INVOICE
              </span>
              <p className="font-bold text-sm text-neutral-900 mt-2 font-mono">Invoice #{order.id.replace("ORD", "INV-2026")}</p>
              <p className="text-neutral-600">Date: {order.date}</p>
              <p className="text-neutral-600">Place of Supply: {order.shippingAddress?.state || "Karnataka"} (29)</p>
            </div>
          </div>

          {/* Bill To & Ship To Details */}
          <div className="grid grid-cols-2 gap-6 bg-neutral-50 p-4 rounded border border-neutral-200">
            <div>
              <p className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider">Billed To / Buyer:</p>
              <p className="font-bold text-sm text-neutral-900 mt-1">{order.customer?.name}</p>
              <p className="text-neutral-600">{order.shippingAddress?.street}</p>
              <p className="text-neutral-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p className="text-neutral-600">Phone: {order.customer?.phone} • Email: {order.customer?.email}</p>
            </div>
            <div>
              <p className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider">Shipped To / Consignee:</p>
              <p className="font-bold text-sm text-neutral-900 mt-1">{order.customer?.name}</p>
              <p className="text-neutral-600">{order.shippingAddress?.street}</p>
              <p className="text-neutral-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p className="text-neutral-600">Courier: {order.courier || "Shiprocket Air"} • AWB: {order.trackingId || "N/A"}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left border border-neutral-300">
            <thead>
              <tr className="bg-neutral-200/80 font-bold text-neutral-800 text-[11px] uppercase border-b border-neutral-300">
                <th className="py-2 px-2.5 w-8">#</th>
                <th className="py-2 px-3">Item Description</th>
                <th className="py-2 px-2.5 text-center">HSN</th>
                <th className="py-2 px-2 text-center">Qty</th>
                <th className="py-2 px-2.5 text-right">Rate (₹)</th>
                <th className="py-2 px-2.5 text-right">Taxable (₹)</th>
                <th className="py-2 px-2 text-center">GST%</th>
                <th className="py-2 px-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items?.map((item: any, i: number) => {
                const lineTotal = (item.price || 0) * (item.qty || 1);
                const title = getItemTitle(item);
                return (
                  <tr key={i}>
                    <td className="py-2 px-2.5 text-neutral-600">{i + 1}</td>
                    <td className="py-2 px-3 font-semibold text-neutral-900">{title}</td>
                    <td className="py-2 px-2.5 text-center text-neutral-600 font-mono">{item.hsnCode || "091099"}</td>
                    <td className="py-2 px-2 text-center font-bold text-neutral-900">{item.qty || 1}</td>
                    <td className="py-2 px-2.5 text-right text-neutral-700">₹{item.price}</td>
                    <td className="py-2 px-2.5 text-right text-neutral-700">₹{lineTotal}</td>
                    <td className="py-2 px-2 text-center text-neutral-600">{item.taxRate || 5}%</td>
                    <td className="py-2 px-3 text-right font-bold text-neutral-900">₹{lineTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Calculation Summary */}
          <div className="flex justify-between items-start pt-2">
            <div className="max-w-xs space-y-1 text-[11px] text-neutral-600">
              <p className="font-bold text-neutral-800">Bank Details for NEFT/RTGS:</p>
              <p>Account Name: Janani Agro Products Pvt Ltd</p>
              <p>Bank: HDFC Bank Ltd • A/C No: 50200088992211</p>
              <p>IFSC: HDFC0001234 • Branch: Koramangala 5th Block</p>
              <p className="pt-2 text-[10px] italic">
                This is a computer-generated tax invoice. No physical signature is required under GST Rule 46.
              </p>
            </div>

            <div className="w-64 space-y-1.5 text-right">
              <div className="flex justify-between text-neutral-600">
                <span>Taxable Amount:</span>
                <span className="font-semibold text-neutral-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>CGST (2.5%):</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>SGST (2.5%):</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping Fee:</span>
                <span className="font-semibold text-emerald-700">₹0.00</span>
              </div>
              <div className="border-t-2 border-neutral-800 pt-1.5 flex justify-between font-black text-sm text-neutral-900">
                <span>Total Amount (INR):</span>
                <span className="text-emerald-900 text-base">₹{order.total?.toLocaleString("en-IN")}.00</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="flex justify-between items-end border-t border-neutral-300 pt-6">
            <div className="text-[10px] text-neutral-500">
              <p>Thank you for choosing Janani Agro Natural Products!</p>
              <p>For support: support@jananiagro.com | +91 98765 43210</p>
            </div>
            <div className="text-right">
              <div className="h-10 w-28 border-b border-neutral-400 mb-1 inline-block"></div>
              <p className="font-bold text-neutral-800 text-[11px]">Authorized Signatory</p>
              <p className="text-[10px] text-neutral-500">Janani Agro Products Pvt Ltd</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Printable Warehouse Packing Slip Modal
// -------------------------------------------------------------

function PrintablePackingSlipModal({
  order,
  onClose
}: {
  order: any;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  const warehouseName = getWarehouseName(order.warehouse);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white text-neutral-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-3 bg-neutral-100 border-b border-neutral-300 flex items-center justify-between no-print">
          <span className="text-sm font-bold text-neutral-800 flex items-center gap-2">
            <Package className="h-4 w-4 text-indigo-600" />
            Warehouse Picking & Packing Slip
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Packing Slip</span>
            </button>
            <button onClick={onClose} className="p-1 rounded text-neutral-500 hover:text-neutral-900">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans text-neutral-900">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h2 className="text-base font-black text-neutral-900">WAREHOUSE PICK LIST & PACKING SLIP</h2>
              <p className="text-neutral-600">Hub: {warehouseName}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-sm text-neutral-900">{order.id}</p>
              <p className="text-neutral-500">Pick Wave #9948 • {order.date}</p>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 border rounded text-[11px] grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-neutral-800">Destination Consignee:</p>
              <p className="font-semibold text-neutral-900">{order.customer?.name}</p>
              <p className="text-neutral-600">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
              <p className="text-neutral-600">{order.shippingAddress?.state} - <strong>{order.shippingAddress?.pincode}</strong></p>
            </div>
            <div>
              <p className="font-bold text-neutral-800">Logistics Routing:</p>
              <p>Courier: <strong>{order.courier || "Shiprocket Bluedart"}</strong></p>
              <p>AWB: <strong className="font-mono">{order.trackingId || "PENDING"}</strong></p>
              <p>Payment: <span className="font-bold text-emerald-800">{order.paymentStatus} ({order.paymentMethod})</span></p>
            </div>
          </div>

          <table className="w-full text-left border border-neutral-300">
            <thead>
              <tr className="bg-neutral-200 text-neutral-800 font-bold uppercase text-[10px]">
                <th className="py-2 px-2 w-8 text-center">Check</th>
                <th className="py-2 px-3">SKU / Item</th>
                <th className="py-2 px-2 text-center">Rack / Bin</th>
                <th className="py-2 px-2 text-center">Pick Qty</th>
                <th className="py-2 px-2 text-center">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items?.map((item: any, i: number) => {
                const title = getItemTitle(item);
                return (
                  <tr key={i}>
                    <td className="py-2 px-2 text-center">
                      <div className="h-4 w-4 border border-neutral-400 rounded mx-auto"></div>
                    </td>
                    <td className="py-2 px-3">
                      <p className="font-bold text-neutral-900">{title}</p>
                      <p className="font-mono text-[10px] text-neutral-500">SKU: {item.sku || "JA-SKU-001"}</p>
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-indigo-900">
                      A-04-R2
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-sm text-neutral-900">
                      {item.qty || 1}
                    </td>
                    <td className="py-2 px-2 text-center text-neutral-600">500g</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="border-t pt-4 grid grid-cols-2 gap-6 text-[11px]">
            <div>
              <p className="font-bold text-neutral-800">Special Packing Notes:</p>
              <p className="text-neutral-600 italic">"Use eco-friendly corrugated box + bubble wrap for glass jars."</p>
            </div>
            <div className="text-right space-y-2">
              <p>Picked By: ____________________</p>
              <p>Packed & Verified By: ____________________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Printable Shiprocket Shipping Label Modal (4x6 / A4 Standard)
// -------------------------------------------------------------

function PrintableShippingLabelModal({
  order,
  onClose
}: {
  order: any;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white text-neutral-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-3 bg-neutral-100 border-b border-neutral-300 flex items-center justify-between no-print">
          <span className="text-sm font-bold text-neutral-800 flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-600" />
            Shiprocket 4x6 Courier Label
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Label</span>
            </button>
            <button onClick={onClose} className="p-1 rounded text-neutral-500 hover:text-neutral-900">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 4x6 Shipping Label Content */}
        <div className="p-6 overflow-y-auto space-y-3 text-xs font-sans text-neutral-900 border-4 border-dashed border-neutral-300 m-4 rounded">
          {/* Top Carrier Bar */}
          <div className="flex justify-between items-center border-b-2 border-neutral-900 pb-2">
            <span className="font-black text-base tracking-tight text-blue-900">SHIPROCKET</span>
            <span className="font-black text-sm uppercase px-2 py-0.5 bg-neutral-900 text-white rounded">
              {order.paymentStatus === "Paid" ? "PREPAID" : "COD ₹" + order.total}
            </span>
          </div>

          {/* Courier & Barcode */}
          <div className="text-center py-2 border-b-2 border-neutral-900 space-y-1">
            <p className="font-bold text-sm">{order.courier || "BLUEDART AIR EXPRESS"}</p>
            <div className="h-12 bg-neutral-900 text-white flex items-center justify-center font-mono text-xs tracking-widest px-2">
              ||| | ||||| || |||||||| |||| | ||| |||||||
            </div>
            <p className="font-mono font-bold text-xs tracking-wider">{order.trackingId || "AWB-883921094"}</p>
          </div>

          {/* Delivery Address */}
          <div className="border-b-2 border-neutral-900 pb-3 space-y-1">
            <p className="font-bold text-[10px] uppercase text-neutral-500">SHIP TO / DELIVER TO:</p>
            <p className="font-black text-sm text-neutral-900">{order.customer?.name}</p>
            <p className="text-xs text-neutral-800">{order.shippingAddress?.street}</p>
            <p className="text-xs font-bold text-neutral-900">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} — PIN: {order.shippingAddress?.pincode}
            </p>
            <p className="text-xs font-bold text-neutral-900">TEL: {order.customer?.phone}</p>
          </div>

          {/* Return Address */}
          <div className="border-b-2 border-neutral-900 pb-2 text-[10px] text-neutral-600">
            <p className="font-bold uppercase text-neutral-800">RETURN IF UNDELIVERED TO:</p>
            <p className="font-bold text-neutral-900">Janani Agro Fulfillment Warehouse (WH-BLR-01)</p>
            <p>Plot 44, Food Processing Zone, KIADB, Bengaluru, KA - 560100</p>
          </div>

          {/* Item details */}
          <div className="flex justify-between items-center text-[10px] font-bold text-neutral-800 pt-1">
            <span>Order #{order.id}</span>
            <span>Weight: 1.25 KG</span>
            <span>Items: {order.items?.length || 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Interactive Workflow Modals
// -------------------------------------------------------------

function AssignWarehouseModal({
  order,
  onClose,
  onSuccess
}: {
  order: any;
  onClose: () => void;
  onSuccess: (newWarehouse: string) => void;
}) {
  const [selectedHub, setSelectedHub] = useState(getWarehouseName(order.warehouse));
  const [submitting, setSubmitting] = useState(false);

  const hubs = [
    { id: "Bengaluru Central Hub (WH-BLR-01)", address: "KIADB Industrial Zone, Bengaluru, KA", stock: "High Capacity" },
    { id: "Hyderabad Agro-Logistics (WH-HYD-01)", address: "Shamshabad Cargo Hub, Hyderabad, TS", stock: "Normal" },
    { id: "Delhi NCR Hub (WH-DEL-02)", address: "Okhla Phase 3, New Delhi, DL", stock: "High Capacity" },
    { id: "Mumbai Western Hub (WH-MUM-01)", address: "Bhiwandi Logistics Park, Mumbai, MH", stock: "Normal" }
  ];

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await assignOrderWarehouse(order.id, selectedHub);
      if (res?.success) {
        toast.success(`Warehouse updated to ${selectedHub}`);
        onSuccess(selectedHub);
      }
    } catch (err) {
      toast.error("Failed to assign warehouse");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Assign Fulfillment Warehouse
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Select the distribution center for dispatching order <strong className="text-foreground">{order.id}</strong>.
        </p>

        <div className="space-y-2">
          {hubs.map((hub) => (
            <label
              key={hub.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                selectedHub === hub.id
                  ? "border-primary bg-primary/5 text-foreground shadow-sm"
                  : "border-border hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <input
                type="radio"
                name="warehouse_hub"
                checked={selectedHub === hub.id}
                onChange={() => setSelectedHub(hub.id)}
                className="mt-1 text-primary focus:ring-primary"
              />
              <div className="text-xs flex-1">
                <p className="font-bold text-foreground">{hub.id}</p>
                <p className="text-muted-foreground mt-0.5">{hub.address}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {hub.stock}
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-input hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? "Assigning..." : "Confirm Warehouse Hub"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GenerateShiprocketModal({
  order,
  onClose,
  onSuccess
}: {
  order: any;
  onClose: () => void;
  onSuccess: (resData: any) => void;
}) {
  const [courier, setCourier] = useState(order.courier || "Shiprocket - Bluedart Air");
  const [weight, setWeight] = useState("1.25");
  const [submitting, setSubmitting] = useState(false);

  const couriers = [
    { name: "Shiprocket - Bluedart Air", eta: "1-2 Days", rate: "₹95" },
    { name: "Shiprocket - Delhivery Express", eta: "2-3 Days", rate: "₹78" },
    { name: "Shiprocket - Ekart Logistics", eta: "2-4 Days", rate: "₹65" },
    { name: "Shadowfax Local Express", eta: "Same Day", rate: "₹120" },
    { name: "XpressBees Surface", eta: "3-5 Days", rate: "₹55" }
  ];

  const handleGenerate = async () => {
    try {
      setSubmitting(true);
      const res = await generateShiprocketAwb(order.id, courier);
      if (res?.success) {
        toast.success(`Generated Shiprocket AWB: ${res.data.awbCode}`);
        onSuccess(res.data);
      }
    } catch (err) {
      toast.error("Failed to generate Shiprocket AWB");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Shiprocket AWB Generator
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-muted-foreground block mb-1">Select Courier Partner</label>
            <div className="space-y-1.5">
              {couriers.map((c) => (
                <label
                  key={c.name}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer ${
                    courier === c.name ? "border-primary bg-primary/5 text-foreground" : "border-border hover:bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="courier_choice"
                      checked={courier === c.name}
                      onChange={() => setCourier(c.name)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="font-bold text-foreground">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{c.eta}</span>
                    <span className="font-bold text-foreground">{c.rate}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-muted-foreground block mb-1">Package Weight (KG)</label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg border border-input hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Truck className="h-3.5 w-3.5" />
            <span>{submitting ? "Generating AWB..." : "Generate AWB & Manifest"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelOrderModal({
  order,
  onClose,
  onSuccess
}: {
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("Customer requested cancellation");
  const [restock, setRestock] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async () => {
    try {
      setSubmitting(true);
      const res = await cancelAdminOrder(order.id, reason, restock);
      if (res?.success) {
        toast.success(`Order ${order.id} cancelled successfully`);
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to cancel order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-base flex items-center gap-2 text-rose-600">
            <Ban className="h-5 w-5" />
            Cancel Order {order.id}
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          This will mark the order as <strong>Cancelled</strong> and update the customer tracking page.
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-muted-foreground block mb-1">Reason for Cancellation</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            >
              <option value="Customer requested cancellation">Customer requested cancellation</option>
              <option value="Item Out of Stock">Item Out of Stock</option>
              <option value="Delivery area non-serviceable">Delivery area non-serviceable</option>
              <option value="Suspected fraudulent transaction">Suspected fraudulent transaction</option>
              <option value="Duplicate order placed">Duplicate order placed</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={restock}
              onChange={(e) => setRestock(e.target.checked)}
              className="rounded border-input text-rose-600 focus:ring-rose-500 h-4 w-4"
            />
            <span className="font-semibold text-foreground">Automatically restock reserved warehouse units</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg border border-input hover:bg-muted">
            Go Back
          </button>
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? "Cancelling..." : "Confirm Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RefundOrderModal({
  order,
  onClose,
  onSuccess
}: {
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState(order.total?.toString() || "0");
  const [refundMode, setRefundMode] = useState<"BANK_UPI" | "WALLET_CREDIT">("BANK_UPI");
  const [reason, setReason] = useState("Customer Return / Dislike");
  const [submitting, setSubmitting] = useState(false);

  const handleRefund = async () => {
    try {
      setSubmitting(true);
      const res = await refundAdminOrder(order.id, parseFloat(amount), refundMode, reason);
      if (res?.success) {
        toast.success(`Refund of ₹${amount} initiated via ${refundMode === "BANK_UPI" ? "Bank UPI" : "Wallet"}`);
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to process refund");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-base flex items-center gap-2 text-purple-600">
            <DollarSign className="h-5 w-5" />
            Issue Payment Refund
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-muted-foreground block mb-1">Refund Amount (INR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-lg text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
            <span className="text-[11px] text-muted-foreground">Original Order Total: ₹{order.total}</span>
          </div>

          <div>
            <label className="font-bold text-muted-foreground block mb-1">Refund Destination</label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`p-2.5 rounded-lg border cursor-pointer text-center ${
                  refundMode === "BANK_UPI" ? "border-purple-600 bg-purple-500/10 font-bold text-foreground" : "border-border text-muted-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="refund_dest"
                  checked={refundMode === "BANK_UPI"}
                  onChange={() => setRefundMode("BANK_UPI")}
                  className="hidden"
                />
                <span>Original UPI / Card</span>
              </label>

              <label
                className={`p-2.5 rounded-lg border cursor-pointer text-center ${
                  refundMode === "WALLET_CREDIT" ? "border-purple-600 bg-purple-500/10 font-bold text-foreground" : "border-border text-muted-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="refund_dest"
                  checked={refundMode === "WALLET_CREDIT"}
                  onChange={() => setRefundMode("WALLET_CREDIT")}
                  className="hidden"
                />
                <span>Customer Wallet (Instant)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="font-bold text-muted-foreground block mb-1">Reason for Refund</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg border border-input hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={handleRefund}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Authorize Refund"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReturnOrderModal({
  order,
  onClose,
  onSuccess
}: {
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("Damaged product received in transit");
  const [reverseCourier, setReverseCourier] = useState("Shiprocket Reverse - Delhivery");
  const [submitting, setSubmitting] = useState(false);

  const handleReturn = async () => {
    try {
      setSubmitting(true);
      const res = await returnAdminOrder(order.id, reason, reverseCourier);
      if (res?.success) {
        toast.success(`Reverse pickup scheduled: ${res.data.reverseAwb}`);
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to schedule return pickup");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-base flex items-center gap-2 text-amber-600">
            <RotateCcw className="h-5 w-5" />
            Schedule Reverse Pickup / Return
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-muted-foreground block mb-1">Return Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="Damaged product received in transit">Damaged product received in transit</option>
              <option value="Wrong spice package delivered">Wrong spice package delivered</option>
              <option value="Quality defect / Seal broken">Quality defect / Seal broken</option>
              <option value="Expired batch received">Expired batch received</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-muted-foreground block mb-1">Reverse Logistics Courier</label>
            <select
              value={reverseCourier}
              onChange={(e) => setReverseCourier(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="Shiprocket Reverse - Delhivery">Shiprocket Reverse - Delhivery</option>
              <option value="Shiprocket Reverse - Bluedart">Shiprocket Reverse - Bluedart</option>
              <option value="Shadowfax Doorstep Pickup">Shadowfax Doorstep Pickup</option>
            </select>
          </div>

          <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-muted-foreground">
            Pickup Address: <strong>{order.shippingAddress?.street}, {order.shippingAddress?.city} ({order.shippingAddress?.pincode})</strong>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg border border-input hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={handleReturn}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? "Scheduling..." : "Schedule Reverse Pickup"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExchangeOrderModal({
  order,
  onClose,
  onSuccess
}: {
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("Damaged item replacement requested");
  const [replacementSku, setReplacementSku] = useState(order.items?.[0]?.sku || "JA-SKU-991");
  const [submitting, setSubmitting] = useState(false);

  const handleExchange = async () => {
    try {
      setSubmitting(true);
      const res = await exchangeAdminOrder(order.id, reason, replacementSku);
      if (res?.success) {
        toast.success(`Exchange replacement created: ${res.data.replacementOrderId}`);
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to create exchange order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-base flex items-center gap-2 text-teal-600">
            <RefreshCw className="h-5 w-5" />
            Create Replacement / Exchange Order
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-muted-foreground block mb-1">Exchange Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>

          <div>
            <label className="font-bold text-muted-foreground block mb-1">Replacement Product SKU</label>
            <input
              type="text"
              value={replacementSku}
              onChange={(e) => setReplacementSku(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg border border-input hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={handleExchange}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Replacement Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddAdminNoteModal({
  order,
  onClose,
  onSuccess
}: {
  order: any;
  onClose: () => void;
  onSuccess: (noteText: string) => void;
}) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!note.trim()) {
      toast.error("Please enter a note");
      return;
    }
    try {
      setSubmitting(true);
      const res = await addOrderAdminNote(order.id, note.trim());
      if (res?.success) {
        toast.success("Admin note appended");
        onSuccess(note.trim());
      }
    } catch (err) {
      toast.error("Failed to add admin note");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Send className="h-5 w-5 text-amber-500" />
            Add Internal Admin Note
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Internal private notes are visible only to Janani Agro operations and warehouse staff.
        </p>

        <div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Buyer called requesting urgent dispatch for festival..."
            className="w-full p-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg border border-input hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Internal Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkStatusModal({
  selectedIds,
  onClose,
  onSuccess
}: {
  selectedIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [newStatus, setNewStatus] = useState("Processing");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await bulkUpdateAdminOrderStatus(selectedIds, newStatus);
      if (res?.success) {
        toast.success(`Updated ${selectedIds.length} orders to ${newStatus}`);
        onSuccess();
      }
    } catch (err) {
      toast.error("Bulk status update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-base flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            Bulk Update {selectedIds.length} Orders
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Select the new fulfillment status to apply across all {selectedIds.length} selected orders.
        </p>

        <div>
          <label className="font-bold text-muted-foreground block mb-1 text-xs">New Status</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full p-2.5 bg-background border border-input rounded-lg text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing (Packed & Ready)</option>
            <option value="Shipped">Shipped (In Transit)</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg border border-input hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Updating..." : `Update ${selectedIds.length} Orders`}
          </button>
        </div>
      </div>
    </div>
  );
}
