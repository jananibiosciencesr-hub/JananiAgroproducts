import React, { useState, useEffect } from "react";
import {
  Ticket,
  Tag,
  Percent,
  Truck,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Calendar,
  Users,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Trash2,
  Edit3,
  Eye,
  Download,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  ChevronRight,
  Layers,
  FileSpreadsheet,
  Gift,
  HelpCircle,
  DollarSign
} from "lucide-react";
import {
  getAdminCoupons,
  getAdminCouponById,
  createAdminCoupon,
  updateAdminCoupon,
  toggleAdminCoupon,
  deleteAdminCoupon,
  generateBulkCoupons,
  getCouponUsageHistory,
  getCouponAnalytics,
  AdminCoupon,
  CouponUsageRecord,
  CouponStats,
  CouponAnalyticsData,
  BulkCouponPayload
} from "@/lib/api";

export function CouponsManagement() {
  const [activeTab, setActiveTab] = useState<"all" | "generator" | "history" | "analytics">("all");

  // Data State
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [stats, setStats] = useState<CouponStats>({
    activeCoupons: 0,
    totalRedemptions: 0,
    totalDiscountDisbursed: 0,
    totalInfluencedRevenue: 0,
    avgOrderWithPromo: 0,
    topCoupon: "N/A"
  });
  const [usageHistory, setUsageHistory] = useState<CouponUsageRecord[]>([]);
  const [analyticsData, setAnalyticsData] = useState<CouponAnalyticsData>({
    topCoupons: [],
    categoryBreakdown: []
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Usage History Filters
  const [historySearch, setHistorySearch] = useState("");
  const [historyCodeFilter, setHistoryCodeFilter] = useState("all");

  // Copy Feedback State
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [bulkCopied, setBulkCopied] = useState(false);

  // Modals & Drawers State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<AdminCoupon | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<AdminCoupon | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCouponDetails, setSelectedCouponDetails] = useState<AdminCoupon | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Bulk Generator State
  const [bulkPrefix, setBulkPrefix] = useState("AGRO-FEST");
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkType, setBulkType] = useState<"percentage" | "flat" | "free_shipping">("percentage");
  const [bulkDiscount, setBulkDiscount] = useState(15);
  const [bulkMinCart, setBulkMinCart] = useState(999);
  const [bulkMaxDiscount, setBulkMaxDiscount] = useState(500);
  const [bulkExpiry, setBulkExpiry] = useState("2026-12-31");
  const [bulkMaxUses, setBulkMaxUses] = useState(1);
  const [bulkFirstOrder, setBulkFirstOrder] = useState(false);
  const [bulkTier, setBulkTier] = useState("All");
  const [bulkGeneratedCoupons, setBulkGeneratedCoupons] = useState<AdminCoupon[]>([]);

  // Create / Edit Form State
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<"percentage" | "flat" | "free_shipping">("percentage");
  const [formDiscount, setFormDiscount] = useState<number>(10);
  const [formMinCart, setFormMinCart] = useState<number>(499);
  const [formMaxDiscount, setFormMaxDiscount] = useState<number>(500);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0] || "");
  const [formExpiryDate, setFormExpiryDate] = useState("2026-12-31");
  const [formMaxUses, setFormMaxUses] = useState<number>(500);
  const [formPerUserLimit, setFormPerUserLimit] = useState<number>(1);
  const [formFirstOrderOnly, setFormFirstOrderOnly] = useState(false);
  const [formFreeShipping, setFormFreeShipping] = useState(false);
  const [formCategorySpecific, setFormCategorySpecific] = useState<string>("");
  const [formUserSpecificTier, setFormUserSpecificTier] = useState<string>("All");
  const [formActive, setFormActive] = useState(true);

  // Load Data
  const loadCouponsData = async () => {
    setLoading(true);
    try {
      const res = await getAdminCoupons({
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        sortBy: sortBy || undefined
      });
      setCoupons(res.data || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryData = async () => {
    try {
      const history = await getCouponUsageHistory({
        couponCode: historyCodeFilter !== "all" ? historyCodeFilter : undefined,
        search: historySearch || undefined
      });
      setUsageHistory(history || []);
    } catch (err) {
      console.error("Failed to load usage history:", err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analytics = await getCouponAnalytics();
      if (analytics) {
        setAnalyticsData(analytics);
      }
    } catch (err) {
      console.error("Failed to load coupon analytics:", err);
    }
  };

  useEffect(() => {
    loadCouponsData();
  }, [searchQuery, statusFilter, typeFilter, sortBy]);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistoryData();
    } else if (activeTab === "analytics") {
      loadAnalytics();
    }
  }, [activeTab, historyCodeFilter, historySearch]);

  const showNotification = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      setBulkCopied(true);
      setTimeout(() => setBulkCopied(false), 2000);
    }
    showNotification("success", `Copied "${text}" to clipboard!`);
  };

  // Toggle Status
  const handleToggleStatus = async (coupon: AdminCoupon) => {
    try {
      const res = await toggleAdminCoupon(coupon.id);
      if (res && res.success) {
        setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, active: !c.active } : c));
        showNotification("success", `Coupon '${coupon.code}' is now ${!coupon.active ? 'Active' : 'Paused'}`);
      }
    } catch (err) {
      showNotification("error", "Failed to update coupon status");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon: AdminCoupon) => {
    setEditCoupon(coupon);
    setFormCode(coupon.code);
    setFormTitle(coupon.title);
    setFormDescription(coupon.description || "");
    setFormType(coupon.type);
    setFormDiscount(coupon.discount);
    setFormMinCart(coupon.minCart);
    setFormMaxDiscount(coupon.maxDiscount);
    setFormStartDate(coupon.startDate ? coupon.startDate.split("T")[0] || "" : new Date().toISOString().split("T")[0] || "");
    setFormExpiryDate(coupon.expiryDate ? coupon.expiryDate.split("T")[0] || "" : "2026-12-31");
    setFormMaxUses(coupon.maxUses);
    setFormPerUserLimit(coupon.perUserLimit || 1);
    setFormFirstOrderOnly(coupon.isFirstOrderOnly || false);
    setFormFreeShipping(coupon.isFreeShipping || false);
    setFormCategorySpecific(coupon.categorySpecific?.join(", ") || "");
    setFormUserSpecificTier(coupon.userSpecificTier || "All");
    setFormActive(coupon.active);
    setCreateModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditCoupon(null);
    setFormCode("");
    setFormTitle("");
    setFormDescription("");
    setFormType("percentage");
    setFormDiscount(15);
    setFormMinCart(999);
    setFormMaxDiscount(500);
    setFormStartDate(new Date().toISOString().split("T")[0] || "");
    setFormExpiryDate("2026-12-31");
    setFormMaxUses(500);
    setFormPerUserLimit(1);
    setFormFirstOrderOnly(false);
    setFormFreeShipping(false);
    setFormCategorySpecific("");
    setFormUserSpecificTier("All");
    setFormActive(true);
    setCreateModalOpen(true);
  };

  // Save Coupon (Create or Update)
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      showNotification("error", "Coupon code is required");
      return;
    }

    setActionLoading(true);
    try {
      const validStartDate = formStartDate || new Date().toISOString().split("T")[0] || "";
      const validExpiryDate = formExpiryDate || "2026-12-31";
      const payload: Partial<AdminCoupon> = {
        code: formCode.trim().toUpperCase(),
        title: formTitle.trim() || `${formCode.trim().toUpperCase()} Promo`,
        description: formDescription.trim(),
        type: formFreeShipping ? "free_shipping" : formType,
        discount: formFreeShipping ? 0 : Number(formDiscount),
        minCart: Number(formMinCart),
        maxDiscount: Number(formMaxDiscount),
        startDate: new Date(validStartDate).toISOString(),
        expiryDate: new Date(`${validExpiryDate}T23:59:59.000Z`).toISOString(),
        maxUses: Number(formMaxUses),
        perUserLimit: Number(formPerUserLimit),
        isFirstOrderOnly: Boolean(formFirstOrderOnly),
        isFreeShipping: Boolean(formFreeShipping) || formType === "free_shipping",
        categorySpecific: formCategorySpecific ? formCategorySpecific.split(",").map(s => s.trim()).filter(Boolean) : [],
        userSpecificTier: formUserSpecificTier,
        active: Boolean(formActive)
      };

      if (editCoupon) {
        const res = await updateAdminCoupon(editCoupon.id, payload);
        if (res && res.success) {
          showNotification("success", `Coupon '${payload.code}' updated successfully!`);
          setCreateModalOpen(false);
          loadCouponsData();
        } else {
          showNotification("error", (res as any)?.message || "Failed to update coupon");
        }
      } else {
        const res = await createAdminCoupon(payload);
        if (res && res.success) {
          showNotification("success", `Coupon '${payload.code}' created successfully!`);
          setCreateModalOpen(false);
          loadCouponsData();
        } else {
          showNotification("error", (res as any)?.message || "Failed to create coupon");
        }
      }
    } catch (err: any) {
      showNotification("error", err?.message || "An unexpected error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;
    setActionLoading(true);
    try {
      const res = await deleteAdminCoupon(couponToDelete.id);
      if (res && res.success) {
        showNotification("success", `Coupon '${couponToDelete.code}' deleted successfully`);
        setDeleteModalOpen(false);
        setCouponToDelete(null);
        loadCouponsData();
      } else {
        showNotification("error", (res as any)?.message || "Failed to delete coupon");
      }
    } catch (err) {
      showNotification("error", "Error deleting coupon");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Details / Usage Drawer
  const handleOpenDetails = async (coupon: AdminCoupon) => {
    setSelectedCouponDetails(coupon);
    setDrawerOpen(true);
    try {
      const full = await getAdminCouponById(coupon.id);
      if (full) {
        setSelectedCouponDetails(full);
      }
    } catch (err) {
      console.error("Failed to load coupon details:", err);
    }
  };

  // Handle Bulk Generate
  const handleGenerateBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload: BulkCouponPayload = {
        prefix: bulkPrefix.trim().toUpperCase(),
        count: Number(bulkCount),
        type: bulkType,
        discount: Number(bulkDiscount),
        minCart: Number(bulkMinCart),
        maxDiscount: Number(bulkMaxDiscount),
        expiryDate: new Date(`${bulkExpiry}T23:59:59.000Z`).toISOString(),
        maxUsesPerCoupon: Number(bulkMaxUses),
        isFirstOrderOnly: Boolean(bulkFirstOrder),
        userSpecificTier: bulkTier
      };

      const res = await generateBulkCoupons(payload);
      if (res && res.success) {
        setBulkGeneratedCoupons(res.data || []);
        showNotification("success", `Successfully generated ${res.count} unique promotional vouchers!`);
        loadCouponsData();
      } else {
        showNotification("error", (res as any)?.message || "Failed to generate bulk vouchers");
      }
    } catch (err: any) {
      showNotification("error", err?.message || "Bulk generation failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV
  const exportCouponsCsv = () => {
    if (coupons.length === 0) return;
    const headers = ["ID", "Code", "Title", "Type", "Discount", "Min Cart (₹)", "Max Discount (₹)", "Uses", "Max Uses", "Status", "Expiry Date", "Tier Target"];
    const rows = coupons.map(c => [
      c.id,
      `"${c.code}"`,
      `"${c.title}"`,
      c.type,
      c.type === "percentage" ? `${c.discount}%` : `₹${c.discount}`,
      c.minCart,
      c.maxDiscount,
      c.uses,
      c.maxUses,
      c.active ? "Active" : "Paused",
      c.expiryDate ? c.expiryDate.split("T")[0] : "N/A",
      c.userSpecificTier || "All"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Janani_Agro_Coupons_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("success", "Coupons catalog exported to CSV");
  };

  const exportUsageLedgerCsv = () => {
    if (usageHistory.length === 0) return;
    const headers = ["Audit ID", "Coupon Code", "Order ID", "Customer Name", "Customer Email", "Cart Total (₹)", "Discount Saved (₹)", "Final Paid (₹)", "Applied Date", "Order Status"];
    const rows = usageHistory.map(u => [
      u.id,
      `"${u.couponCode}"`,
      u.orderId,
      `"${u.customerName}"`,
      u.customerEmail,
      u.orderTotal,
      u.discountAmount,
      u.finalPaid,
      `"${u.appliedAt}"`,
      u.orderStatus
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Janani_Coupon_Usage_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("success", "Coupon usage audit history exported to CSV");
  };

  const getStatusBadge = (coupon: AdminCoupon) => {
    const isExpired = new Date(coupon.expiryDate) < new Date();
    const isDepleted = coupon.uses >= coupon.maxUses;

    if (!coupon.active) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Paused
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60">
          <XCircle className="w-3 h-3 text-rose-500" />
          Expired
        </span>
      );
    }
    if (isDepleted) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          <AlertCircle className="w-3 h-3 text-slate-500" />
          Depleted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all transform animate-in slide-in-from-bottom-5 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-900/95 text-emerald-100 border-emerald-700 shadow-emerald-950/50 backdrop-blur-md"
              : "bg-rose-900/95 text-rose-100 border-rose-700 shadow-rose-950/50 backdrop-blur-md"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Top Header & Master Action Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/80 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Ticket className="w-3.5 h-3.5 text-primary" />
            <span>Growth & Loyalty Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Coupons & Promotions Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Architect custom discount vouchers, first-order welcome treats, automated free shipping thresholds & high-volume bulk campaigns.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={exportCouponsCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-muted/70 hover:bg-muted text-foreground border border-border/60 transition-colors shadow-sm"
            title="Download CSV database of all vouchers"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setActiveTab("generator")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/40 dark:border-amber-700/50 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Bulk Generator</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* 6 High-Impact KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1 */}
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Codes</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Ticket className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {stats.activeCoupons}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{coupons.length} Total Registered</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Redemptions</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {stats.totalRedemptions.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% this month</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Discounts Given</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{Math.round(stats.totalDiscountDisbursed).toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Customer savings total
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Influenced GMV</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{Math.round(stats.totalInfluencedRevenue).toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
            ~8.9x ROI on discounts
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Promo AOV</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{stats.avgOrderWithPromo.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-1">
            +38% vs regular basket
          </div>
        </div>

        {/* Metric 6 */}
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Top Voucher</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Tag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight font-mono">
            {stats.topCoupon}
          </div>
          <div className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
            512 Orders Converted
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center justify-between border-b border-border/80 pb-px">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "all"
                ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>All Coupons & Vouchers</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-mono">
              {coupons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("generator")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "generator"
                ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Bulk Campaign Generator</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/10 text-amber-600 border border-amber-300/40">
              High Scale
            </span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "history"
                ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Usage History & Audit Ledger</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-mono">
              {usageHistory.length > 0 ? usageHistory.length : "Live"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "analytics"
                ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Performance & ROI Analytics</span>
          </button>
        </div>

        {activeTab === "all" && (
          <div className="hidden sm:flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Grid Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "table" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Compact Table
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL COUPONS & VOUCHERS */}
      {/* ========================================================================= */}
      {activeTab === "all" && (
        <div className="space-y-4">
          {/* Filtering Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 bg-card p-4 rounded-xl border border-border/70 shadow-sm">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search coupon code, campaign name or ID..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active & Running</option>
                <option value="paused">Paused / Disabled</option>
                <option value="expired">Expired Codes</option>
                <option value="depleted">Fully Depleted</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                <option value="all">All Discount Types</option>
                <option value="percentage">Percentage Off (%)</option>
                <option value="flat">Flat Cash Off (₹)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="uses_desc">Highest Redemptions</option>
                <option value="discount_desc">Highest Discount</option>
                <option value="alphabetical">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="p-12 text-center bg-card rounded-2xl border border-border/70">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">Syncing promotional vouchers...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && coupons.length === 0 && (
            <div className="p-12 text-center bg-card rounded-2xl border border-border/70 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Ticket className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No promotional coupons found</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                  Try adjusting your search query or filter tags, or launch a fresh discount voucher for your store.
                </p>
              </div>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Coupon</span>
              </button>
            </div>
          )}

          {/* Grid Cards View */}
          {!loading && coupons.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {coupons.map(coupon => {
                const usagePercent = Math.min(100, Math.round(((coupon.uses || 0) / (coupon.maxUses || 1)) * 100));
                const isExpired = new Date(coupon.expiryDate) < new Date();

                return (
                  <div
                    key={coupon.id}
                    className={`relative bg-card rounded-2xl border transition-all duration-200 hover:shadow-md overflow-hidden flex flex-col justify-between ${
                      !coupon.active
                        ? "border-dashed border-amber-300 dark:border-amber-800/60 opacity-80"
                        : isExpired
                        ? "border-rose-200 dark:border-rose-900/40 opacity-70"
                        : "border-border/80 hover:border-primary/50"
                    }`}
                  >
                    {/* Top Notch Decorative Band */}
                    <div className="p-5 space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        {/* Discount Value Badge */}
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base shadow-sm ${
                              coupon.type === "free_shipping" || coupon.isFreeShipping
                                ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                                : coupon.type === "flat"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {coupon.type === "free_shipping" || coupon.isFreeShipping ? (
                              <Truck className="w-6 h-6" />
                            ) : coupon.type === "flat" ? (
                              `₹${coupon.discount}`
                            ) : (
                              `${coupon.discount}%`
                            )}
                          </div>

                          <div>
                            <div className="text-base font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">
                              {coupon.title}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {coupon.description || `Min cart: ₹${coupon.minCart}`}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>{getStatusBadge(coupon)}</div>
                      </div>

                      {/* Ticket Code Bar with 1-Click Copy */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/60 border border-border/60">
                        <div className="flex items-center gap-2 font-mono font-bold text-sm tracking-wider text-slate-900 dark:text-white">
                          <Tag className="w-4 h-4 text-primary" />
                          <span>{coupon.code}</span>
                        </div>

                        <button
                          onClick={() => copyToClipboard(coupon.code, coupon.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-background hover:bg-muted border border-border/80 transition-colors shadow-2xs text-muted-foreground hover:text-foreground"
                          title="Click to copy promo code"
                        >
                          {copiedCode === coupon.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Usage Meter */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-muted-foreground">Redemption Progress</span>
                          <span className="text-slate-900 dark:text-white font-mono">
                            {coupon.uses} / {coupon.maxUses} uses ({usagePercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all rounded-full ${
                              usagePercent >= 90
                                ? "bg-rose-500"
                                : usagePercent >= 50
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Conditions Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border/50">
                          Min: ₹{coupon.minCart}
                        </span>

                        {coupon.type === "percentage" && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border/50">
                            Max Cap: ₹{coupon.maxDiscount}
                          </span>
                        )}

                        {coupon.isFirstOrderOnly && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            1st Order Only
                          </span>
                        )}

                        {coupon.userSpecificTier && coupon.userSpecificTier !== "All" && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {coupon.userSpecificTier} Tier
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border/50 ml-auto flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span>Exp: {coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "None"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-3 bg-muted/30 border-t border-border/70 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            coupon.active
                              ? "bg-amber-100/70 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900"
                              : "bg-emerald-100/70 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900"
                          }`}
                        >
                          {coupon.active ? "Pause" : "Activate"}
                        </button>

                        <button
                          onClick={() => handleOpenDetails(coupon)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card hover:bg-muted text-foreground border border-border transition-colors"
                          title="Inspect coupon order history"
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(coupon)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card hover:bg-muted text-foreground border border-border transition-colors"
                          title="Edit coupon properties"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>

                        <button
                          onClick={() => {
                            setCouponToDelete(coupon);
                            setDeleteModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/40 border border-border hover:border-rose-200 transition-colors"
                          title="Delete coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Compact Table View */}
          {!loading && coupons.length > 0 && viewMode === "table" && (
            <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 text-xs uppercase tracking-wider font-semibold text-muted-foreground border-b border-border/80">
                    <tr>
                      <th className="px-5 py-3.5">Promo Code</th>
                      <th className="px-4 py-3.5">Title & Description</th>
                      <th className="px-4 py-3.5">Discount Offer</th>
                      <th className="px-4 py-3.5">Min Order & Cap</th>
                      <th className="px-4 py-3.5">Redemptions</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Expiry Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {coupons.map(coupon => (
                      <tr key={coupon.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-white bg-muted px-2.5 py-1 rounded-lg border border-border/60">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => copyToClipboard(coupon.code, coupon.id)}
                              className="text-muted-foreground hover:text-foreground"
                              title="Copy code"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 dark:text-white">{coupon.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{coupon.description}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {coupon.type === "free_shipping" || coupon.isFreeShipping
                              ? "Free Shipping"
                              : coupon.type === "flat"
                              ? `₹${coupon.discount} FLAT`
                              : `${coupon.discount}% OFF`}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          <div>Min: ₹{coupon.minCart}</div>
                          {coupon.type === "percentage" && <div>Max Cap: ₹{coupon.maxDiscount}</div>}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {coupon.uses} / {coupon.maxUses}
                          </div>
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.round((coupon.uses / coupon.maxUses) * 100))}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-3.5">{getStatusBadge(coupon)}</td>

                        <td className="px-4 py-3.5 text-xs text-muted-foreground font-mono">
                          {coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "No Expiry"}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDetails(coupon)}
                              className="p-1.5 rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                              title="View usage log"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(coupon)}
                              className="p-1.5 rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                              title="Edit coupon"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(coupon)}
                              className="px-2 py-1 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 text-foreground"
                            >
                              {coupon.active ? "Pause" : "Resume"}
                            </button>
                            <button
                              onClick={() => {
                                setCouponToDelete(coupon);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-card hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/40 border border-border"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BULK CAMPAIGN GENERATOR */}
      {/* ========================================================================= */}
      {activeTab === "generator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generator Form */}
          <div className="lg:col-span-1 bg-card p-6 rounded-2xl border border-border/80 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>High-Throughput Generator</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Bulk Promo Creator</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Instantly batch-mint up to 500 unique single-use or campaign coupon vouchers for influencer marketing, SMS drops, or offline pamphlets.
              </p>
            </div>

            <form onSubmit={handleGenerateBulk} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  Code Prefix (e.g. DIWALI, INFLUENCER)
                </label>
                <input
                  type="text"
                  value={bulkPrefix}
                  onChange={e => setBulkPrefix(e.target.value)}
                  required
                  placeholder="JANANI-AGRO"
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                    Quantity (5 - 500)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={bulkCount}
                    onChange={e => setBulkCount(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={bulkType}
                    onChange={e => setBulkType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Value (₹)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
              </div>

              {bulkType !== "free_shipping" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      Discount Value ({bulkType === "percentage" ? "%" : "₹"})
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={bulkDiscount}
                      onChange={e => setBulkDiscount(Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={bulkMaxDiscount}
                      onChange={e => setBulkMaxDiscount(Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bulkMinCart}
                    onChange={e => setBulkMinCart(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                    Uses Allowed Per Code
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={bulkMaxUses}
                    onChange={e => setBulkMaxUses(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={bulkExpiry}
                    onChange={e => setBulkExpiry(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                    Eligible Tier
                  </label>
                  <select
                    value={bulkTier}
                    onChange={e => setBulkTier(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="All">All Customers</option>
                    <option value="Silver">Silver Tier Only</option>
                    <option value="Gold">Gold Tier Only</option>
                    <option value="Platinum">Platinum VIP Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bulkFirstOrder"
                  checked={bulkFirstOrder}
                  onChange={e => setBulkFirstOrder(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="bulkFirstOrder" className="text-xs font-medium text-foreground cursor-pointer">
                  Restrict to 1st-Time Customer Orders Only
                </label>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Minting Promotional Codes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Batch Generate {bulkCount} Coupons</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated Vouchers Ledger Preview */}
          <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Generated Vouchers Batch ({bulkGeneratedCoupons.length})
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Newly minted unique codes registered to the Janani Agro checkout system.
                  </p>
                </div>

                {bulkGeneratedCoupons.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const codesStr = bulkGeneratedCoupons.map(c => c.code).join(", ");
                        copyToClipboard(codesStr);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border"
                    >
                      {bulkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{bulkCopied ? "Copied All!" : "Copy All Codes"}</span>
                    </button>

                    <button
                      onClick={() => {
                        const headers = ["Code", "Discount", "Type", "Min Cart", "Max Cap", "Expiry Date"];
                        const rows = bulkGeneratedCoupons.map(c => [
                          c.code,
                          c.type === "percentage" ? `${c.discount}%` : `₹${c.discount}`,
                          c.type,
                          c.minCart,
                          c.maxDiscount,
                          c.expiryDate ? c.expiryDate.split("T")[0] : ""
                        ]);
                        const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                        const link = document.createElement("a");
                        link.href = encodeURI(csv);
                        link.download = `Bulk_Coupons_${bulkPrefix}_${new Date().toISOString().split("T")[0]}.csv`;
                        link.click();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Batch CSV</span>
                    </button>
                  </div>
                )}
              </div>

              {bulkGeneratedCoupons.length === 0 ? (
                <div className="p-12 text-center rounded-xl bg-muted/20 border border-dashed border-border/80 space-y-3">
                  <Layers className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No batch generated in this active session yet. Configure the parameters on the left and click "Batch Generate".
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto rounded-xl border border-border/70 divide-y divide-border/60">
                  {bulkGeneratedCoupons.map((c, i) => (
                    <div key={c.id || i} className="p-3 bg-card hover:bg-muted/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-muted-foreground w-6 text-right">#{i + 1}</span>
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white bg-muted px-2.5 py-1 rounded border border-border/60">
                          {c.code}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {c.type === "free_shipping" ? "Free Shipping" : c.type === "flat" ? `₹${c.discount} Flat` : `${c.discount}% Off`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground font-mono">Exp: {c.expiryDate ? c.expiryDate.split("T")[0] : ""}</span>
                        <button
                          onClick={() => copyToClipboard(c.code, c.id)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Copy Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campaign Tips Banner */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-start gap-3 mt-4">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Pro Tip for High Redemption Rate:</span> Single-use unique codes with a 48-hour expiration date yield a 3.4x higher conversion rate in SMS / WhatsApp broadcasts compared to generic multi-use codes.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: USAGE HISTORY & AUDIT LEDGER */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-card p-4 rounded-xl border border-border/70 shadow-sm">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                placeholder="Search audit trail by Order ID, Customer Name, Email or Coupon Code..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={historyCodeFilter}
                onChange={e => setHistoryCodeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">All Promo Codes</option>
                {coupons.map(c => (
                  <option key={c.id} value={c.code}>
                    {c.code} ({c.title})
                  </option>
                ))}
              </select>

              <button
                onClick={exportUsageLedgerCsv}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border flex-shrink-0 flex items-center gap-1.5"
                title="Export Usage Ledger CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Usage Table */}
          <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wider font-semibold text-muted-foreground border-b border-border/80">
                  <tr>
                    <th className="px-5 py-3.5">Audit ID</th>
                    <th className="px-4 py-3.5">Coupon Applied</th>
                    <th className="px-4 py-3.5">Order ID</th>
                    <th className="px-4 py-3.5">Customer</th>
                    <th className="px-4 py-3.5">Gross Basket</th>
                    <th className="px-4 py-3.5">Discount Saved</th>
                    <th className="px-4 py-3.5">Final Paid</th>
                    <th className="px-4 py-3.5">Redemption Time</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {usageHistory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground text-sm">
                        No coupon redemption history found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    usageHistory.map(item => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                          {item.id}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">
                            {item.couponCode}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                          {item.orderId}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 dark:text-white">{item.customerName}</div>
                          <div className="text-xs text-muted-foreground">{item.customerEmail}</div>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs">
                          ₹{item.orderTotal.toLocaleString("en-IN")}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                          -₹{item.discountAmount.toLocaleString("en-IN")}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{item.finalPaid.toLocaleString("en-IN")}
                        </td>

                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          {item.appliedAt}
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {item.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PERFORMANCE & ROI ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 5 Leaderboard */}
          <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Converting Promo Campaigns</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Leaderboard ranked by gross revenue influence and customer checkout conversion.
                </p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="divide-y divide-border/60">
              {analyticsData.topCoupons.map((item, idx) => (
                <div key={item.code} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-bold text-xs font-mono text-muted-foreground">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {item.code}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                          {item.conversionRate} Conv.
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.redemptions} redemptions · ₹{item.totalDiscounts.toLocaleString("en-IN")} total discounts
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                      ₹{item.revenueGenerated.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-muted-foreground">Influenced Sales</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Redemption Share & Insights */}
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Category Redemption Breakdown</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Share of coupon-backed purchases by product department.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {analyticsData.categoryBreakdown.map(cat => (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-foreground">{cat.category}</span>
                      <span className="text-muted-foreground font-mono">{cat.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Optimization Guidance */}
            <div className="bg-gradient-to-br from-emerald-900/10 via-card to-card p-5 rounded-2xl border border-emerald-500/20 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI Promo Recommendation</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cart sizes with <strong>Cold Pressed Oils</strong> and <strong>A2 Desi Ghee</strong> show a 42% higher repeat purchase rate when paired with a <code className="text-foreground font-mono">FREESHIP</code> coupon on orders above ₹799.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT COUPON (WITH LIVE DYNAMIC TICKET PREVIEW) */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-4xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-border/80 flex items-center justify-between bg-muted/40">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{editCoupon ? "Update Campaign Voucher" : "Architect Promo Campaign"}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {editCoupon ? `Editing Coupon: ${editCoupon.code}` : "Create New Promotional Coupon"}
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Two Columns (Form on Left, Live Preview on Right) */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Form Controls (7 Columns on desktop) */}
              <form id="couponForm" onSubmit={handleSaveCoupon} className="md:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      value={formCode}
                      onChange={e => setFormCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                      required
                      placeholder="e.g. HARVEST20"
                      className="w-full px-3.5 py-2 text-sm font-mono uppercase font-bold rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      Campaign Title *
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      required
                      placeholder="e.g. 20% Festive Harvest"
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                    Customer Description
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Short description displayed on cart page & banner..."
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      Discount Type
                    </label>
                    <select
                      value={formFreeShipping ? "free_shipping" : formType}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === "free_shipping") {
                          setFormFreeShipping(true);
                          setFormType("free_shipping");
                        } else {
                          setFormFreeShipping(false);
                          setFormType(val as any);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Off (₹)</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>

                  {!formFreeShipping && (
                    <div>
                      <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                        Discount Value ({formType === "percentage" ? "%" : "₹"})
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formDiscount}
                        onChange={e => setFormDiscount(Number(e.target.value))}
                        required
                        className="w-full px-3.5 py-2 text-sm font-bold rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      Min Basket (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formMinCart}
                      onChange={e => setFormMinCart(Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                {formType === "percentage" && !formFreeShipping && (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      Maximum Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formMaxDiscount}
                      onChange={e => setFormMaxDiscount(Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={e => setFormStartDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      Expiration Date
                    </label>
                    <input
                      type="date"
                      value={formExpiryDate}
                      onChange={e => setFormExpiryDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      Total Usage Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formMaxUses}
                      onChange={e => setFormMaxUses(Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      Limit Per Customer
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formPerUserLimit}
                      onChange={e => setFormPerUserLimit(Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      Target Customer Tier
                    </label>
                    <select
                      value={formUserSpecificTier}
                      onChange={e => setFormUserSpecificTier(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="All">All Customer Tiers</option>
                      <option value="Silver">Silver Tier</option>
                      <option value="Gold">Gold Tier</option>
                      <option value="Platinum">Platinum VIP Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      Category Targeting
                    </label>
                    <input
                      type="text"
                      value={formCategorySpecific}
                      onChange={e => setFormCategorySpecific(e.target.value)}
                      placeholder="e.g. Cold Pressed Oils, Spices (or leave empty)"
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="formFirstOrderOnly"
                      checked={formFirstOrderOnly}
                      onChange={e => setFormFirstOrderOnly(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <label htmlFor="formFirstOrderOnly" className="text-xs font-medium text-foreground cursor-pointer">
                      First Order Only
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="formActive"
                      checked={formActive}
                      onChange={e => setFormActive(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <label htmlFor="formActive" className="text-xs font-medium text-foreground cursor-pointer">
                      Active Status Immediately
                    </label>
                  </div>
                </div>
              </form>

              {/* Real-time Dynamic Ticket Preview (5 Columns on desktop) */}
              <div className="md:col-span-5 bg-muted/40 p-5 rounded-xl border border-border/80 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    <span>Live Checkout Preview</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* Interactive Styled Card */}
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden space-y-4">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-medium uppercase tracking-widest text-emerald-200">
                          JANANI AGRO DISCOUNT
                        </div>
                        <div className="text-3xl font-black mt-1">
                          {formFreeShipping
                            ? "FREE SHIPPING"
                            : formType === "flat"
                            ? `₹${formDiscount || 0} OFF`
                            : `${formDiscount || 0}% OFF`}
                        </div>
                      </div>
                      <Ticket className="w-8 h-8 text-emerald-300/80" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white leading-tight">
                        {formTitle || "Promo Voucher Title"}
                      </div>
                      <div className="text-xs text-emerald-100/90 line-clamp-2">
                        {formDescription || "Apply at checkout to redeem savings on your organic order."}
                      </div>
                    </div>

                    {/* Dashed Cutout Divider */}
                    <div className="border-t border-dashed border-white/30 pt-3 flex items-center justify-between text-xs font-mono">
                      <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg font-bold tracking-widest text-sm uppercase">
                        {formCode || "CODE-PREVIEW"}
                      </div>
                      <div className="text-right text-[11px] text-emerald-200">
                        <div>Min Cart: ₹{formMinCart}</div>
                        <div>Exp: {formExpiryDate}</div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Details Table */}
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground bg-card p-3.5 rounded-xl border border-border/70">
                    <div className="flex justify-between">
                      <span>Max Discount Cap:</span>
                      <span className="font-semibold text-foreground">
                        {formType === "percentage" ? `₹${formMaxDiscount}` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Eligibility:</span>
                      <span className="font-semibold text-foreground">
                        {formFirstOrderOnly ? "First Order Only" : "All Customers"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tier Target:</span>
                      <span className="font-semibold text-foreground">{formUserSpecificTier} Tier</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Usage Allocation:</span>
                      <span className="font-semibold text-foreground">{formMaxUses} Redemptions</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
                    Instant validation active. Once saved, this coupon will be immediately recognized across customer checkouts.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border/80 bg-muted/40 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors border border-border"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="couponForm"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{editCoupon ? "Update Coupon" : "Launch Coupon"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: COUPON USAGE DETAILS & AUDIT LOG */}
      {/* ========================================================================= */}
      {drawerOpen && selectedCouponDetails && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-xl h-full shadow-2xl border-l border-border flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-border/80 bg-muted/30 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Coupon Inspector</span>
                </div>
                <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {selectedCouponDetails.code}
                </h3>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Top Details Card */}
              <div className="bg-muted/40 p-5 rounded-2xl border border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Status</span>
                  {getStatusBadge(selectedCouponDetails)}
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedCouponDetails.title}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedCouponDetails.description || "No public description entered."}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground">Discount Value: </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedCouponDetails.type === "free_shipping"
                        ? "Free Shipping"
                        : selectedCouponDetails.type === "flat"
                        ? `₹${selectedCouponDetails.discount} Flat`
                        : `${selectedCouponDetails.discount}% Off`}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Min Order: </span>
                    <span className="font-bold text-foreground">₹{selectedCouponDetails.minCart}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Discount: </span>
                    <span className="font-bold text-foreground">₹{selectedCouponDetails.maxDiscount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target Tier: </span>
                    <span className="font-bold text-foreground">{selectedCouponDetails.userSpecificTier || "All"}</span>
                  </div>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lifetime Redemptions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card p-4 rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground">Times Redeemed</div>
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                      {selectedCouponDetails.uses} / {selectedCouponDetails.maxUses}
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground">Per-User Cap</div>
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                      {selectedCouponDetails.perUserLimit || 1} use/customer
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Order Redemptions Ledger
                </h4>
                {selectedCouponDetails.usageHistory && selectedCouponDetails.usageHistory.length > 0 ? (
                  <div className="divide-y divide-border/60 rounded-xl border border-border/80 overflow-hidden bg-card">
                    {selectedCouponDetails.usageHistory.map(u => (
                      <div key={u.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-muted/30">
                        <div>
                          <div className="font-bold font-mono text-slate-900 dark:text-white">{u.orderId}</div>
                          <div className="text-muted-foreground">{u.customerName} ({u.customerEmail})</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{u.appliedAt}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            -₹{u.discountAmount}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            Total: ₹{u.finalPaid}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-xl bg-muted/20 border border-dashed border-border text-xs text-muted-foreground">
                    No individual order audits recorded yet for this voucher code.
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-between">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  handleOpenEdit(selectedCouponDetails);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground shadow"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Coupon</span>
              </button>

              <button
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-muted hover:bg-muted/80 text-foreground"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteModalOpen && couponToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Coupon '{couponToDelete.code}'?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to permanently revoke this coupon? Customers will no longer be able to apply it during checkout.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCoupon}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow transition-all disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Yes, Delete Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
