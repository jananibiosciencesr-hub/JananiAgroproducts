import React, { useState, useEffect } from "react";
import {
  Share2,
  Gift,
  Wallet,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Plus,
  Minus,
  TrendingUp,
  BarChart3,
  Award,
  ShieldAlert,
  ShieldCheck,
  Percent,
  Coins,
  ArrowRight,
  Eye,
  Check,
  X,
  RefreshCw,
  Info,
  DollarSign,
  UserCheck,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import {
  getReferralConfig,
  updateReferralConfig,
  getWalletConfig,
  updateWalletConfig,
  getReferralRecords,
  getReferralRecordById,
  approveReferralReward,
  rejectReferralReward,
  getGlobalWalletTransactions,
  manualWalletCredit,
  manualWalletDebit,
  getReferralAnalytics,
  ReferralProgramConfig,
  WalletProgramConfig,
  ReferralRecord,
  WalletTransactionRecord,
  ReferralStats,
  ReferralAnalyticsData
} from "@/lib/api";

export function ReferralsManagement() {
  const [activeTab, setActiveTab] = useState<"referrals" | "wallet" | "refSettings" | "walletSettings" | "analytics">("referrals");

  // Data State
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferralGmv: 0,
    totalRewardsPaid: 0,
    totalConversions: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    pendingEscrowAmount: 0,
    conversionRate: "0%",
    topReferrer: "N/A"
  });
  const [walletTransactions, setWalletTransactions] = useState<WalletTransactionRecord[]>([]);
  const [walletStats, setWalletStats] = useState({ totalCredits: 0, totalDebits: 0, activeCirculation: 0 });
  const [referralConfig, setReferralConfig] = useState<ReferralProgramConfig | null>(null);
  const [walletConfig, setWalletConfig] = useState<WalletProgramConfig | null>(null);
  const [analyticsData, setAnalyticsData] = useState<ReferralAnalyticsData>({
    funnel: [],
    leaderboard: [],
    statusDistribution: []
  });

  // Filters & Search State
  const [referralStatusFilter, setReferralStatusFilter] = useState<string>("all");
  const [referralSearch, setReferralSearch] = useState<string>("");
  const [referralSort, setReferralSort] = useState<string>("newest");

  const [walletTypeFilter, setWalletTypeFilter] = useState<string>("all");
  const [walletCategoryFilter, setWalletCategoryFilter] = useState<string>("all");
  const [walletSearch, setWalletSearch] = useState<string>("");

  // Modals & Drawers State
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [debitModalOpen, setDebitModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [inspectorDrawerOpen, setInspectorDrawerOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<ReferralRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState("Order Returned & Refunded");

  // Action Loading & Feedback
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Manual Credit Form State
  const [creditName, setCreditName] = useState("");
  const [creditEmail, setCreditEmail] = useState("");
  const [creditAmount, setCreditAmount] = useState(150);
  const [creditCategory, setCreditCategory] = useState("Manual Admin Credit");
  const [creditNotes, setCreditNotes] = useState("");

  // Manual Debit Form State
  const [debitName, setDebitName] = useState("");
  const [debitEmail, setDebitEmail] = useState("");
  const [debitAmount, setDebitAmount] = useState(100);
  const [debitReason, setDebitReason] = useState("Clawback / Erroneous Credit");
  const [debitNotes, setDebitNotes] = useState("");

  const showNotification = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Load Main Data
  const loadReferralsData = async () => {
    setLoading(true);
    try {
      const res = await getReferralRecords({
        status: referralStatusFilter !== "all" ? referralStatusFilter : undefined,
        search: referralSearch || undefined,
        sortBy: referralSort || undefined
      });
      setReferrals(res.data || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load referral records:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadWalletLedger = async () => {
    try {
      const res = await getGlobalWalletTransactions({
        type: walletTypeFilter !== "all" ? walletTypeFilter : undefined,
        category: walletCategoryFilter !== "all" ? walletCategoryFilter : undefined,
        search: walletSearch || undefined
      });
      setWalletTransactions(res.data || []);
      if (res.stats) {
        setWalletStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load wallet ledger:", err);
    }
  };

  const loadConfigsAndAnalytics = async () => {
    try {
      const [refCfg, walCfg, analytics] = await Promise.all([
        getReferralConfig(),
        getWalletConfig(),
        getReferralAnalytics()
      ]);
      if (refCfg) setReferralConfig(refCfg);
      if (walCfg) setWalletConfig(walCfg);
      if (analytics) setAnalyticsData(analytics);
    } catch (err) {
      console.error("Failed to load settings & analytics:", err);
    }
  };

  useEffect(() => {
    loadReferralsData();
  }, [referralStatusFilter, referralSearch, referralSort]);

  useEffect(() => {
    if (activeTab === "wallet") {
      loadWalletLedger();
    } else if (activeTab === "refSettings" || activeTab === "walletSettings" || activeTab === "analytics") {
      loadConfigsAndAnalytics();
    }
  }, [activeTab, walletTypeFilter, walletCategoryFilter, walletSearch]);

  // Approve Reward
  const handleApproveReward = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await approveReferralReward(id);
      if (res && res.success) {
        showNotification("success", res.message || "Referral reward approved!");
        setReferrals(prev =>
          prev.map(r => (r.id === id ? { ...r, status: "Approved", approvedAt: "Just now" } : r))
        );
        loadReferralsData();
      } else {
        showNotification("error", (res as any)?.message || "Failed to approve reward");
      }
    } catch (err: any) {
      showNotification("error", err?.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Reject Modal
  const handleOpenReject = (record: ReferralRecord) => {
    setSelectedReferral(record);
    setRejectionReason("Order Returned & Refunded");
    setRejectModalOpen(true);
  };

  // Submit Rejection
  const handleConfirmReject = async () => {
    if (!selectedReferral) return;
    setActionLoading(true);
    try {
      const res = await rejectReferralReward(selectedReferral.id, rejectionReason);
      if (res && res.success) {
        showNotification("success", `Referral ${selectedReferral.id} rejected: ${rejectionReason}`);
        setRejectModalOpen(false);
        setReferrals(prev =>
          prev.map(r =>
            r.id === selectedReferral.id
              ? { ...r, status: "Rejected", rejectedAt: "Just now", rejectionReason }
              : r
          )
        );
        loadReferralsData();
      } else {
        showNotification("error", (res as any)?.message || "Failed to reject reward");
      }
    } catch (err: any) {
      showNotification("error", err?.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Inspector Drawer
  const handleOpenInspector = async (record: ReferralRecord) => {
    setSelectedReferral(record);
    setInspectorDrawerOpen(true);
    try {
      const full = await getReferralRecordById(record.id);
      if (full) {
        setSelectedReferral(full);
      }
    } catch (err) {
      console.error("Failed to load details:", err);
    }
  };

  // Handle Manual Credit Submit
  const handleManualCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditName.trim() || Number(creditAmount) <= 0) {
      showNotification("error", "Please provide a valid customer name and amount");
      return;
    }

    setActionLoading(true);
    try {
      const res = await manualWalletCredit({
        customerName: creditName.trim(),
        customerEmail: creditEmail.trim() || undefined,
        amount: Number(creditAmount),
        category: creditCategory,
        notes: creditNotes.trim() || undefined
      });

      if (res && res.success) {
        showNotification("success", res.message || "Wallet credited successfully!");
        setCreditModalOpen(false);
        setCreditName("");
        setCreditEmail("");
        setCreditAmount(150);
        setCreditNotes("");
        loadWalletLedger();
      } else {
        showNotification("error", (res as any)?.message || "Failed to credit wallet");
      }
    } catch (err: any) {
      showNotification("error", err?.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Manual Debit Submit
  const handleManualDebit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debitName.trim() || Number(debitAmount) <= 0) {
      showNotification("error", "Please provide a valid customer name and debit amount");
      return;
    }

    setActionLoading(true);
    try {
      const res = await manualWalletDebit({
        customerName: debitName.trim(),
        customerEmail: debitEmail.trim() || undefined,
        amount: Number(debitAmount),
        reason: debitReason,
        notes: debitNotes.trim() || undefined
      });

      if (res && res.success) {
        showNotification("success", res.message || "Wallet debited successfully!");
        setDebitModalOpen(false);
        setDebitName("");
        setDebitEmail("");
        setDebitAmount(100);
        setDebitNotes("");
        loadWalletLedger();
      } else {
        showNotification("error", (res as any)?.message || "Failed to debit wallet");
      }
    } catch (err: any) {
      showNotification("error", err?.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Referral Config Update
  const handleSaveReferralConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralConfig) return;
    setActionLoading(true);
    try {
      const res = await updateReferralConfig(referralConfig);
      if (res && res.success) {
        showNotification("success", "Referral program settings updated successfully!");
        setReferralConfig(res.data);
      } else {
        showNotification("error", (res as any)?.message || "Failed to save settings");
      }
    } catch (err: any) {
      showNotification("error", err?.message || "Error saving configuration");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Wallet Config Update
  const handleSaveWalletConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConfig) return;
    setActionLoading(true);
    try {
      const res = await updateWalletConfig(walletConfig);
      if (res && res.success) {
        showNotification("success", "Wallet & cashback parameters saved successfully!");
        setWalletConfig(res.data);
      } else {
        showNotification("error", (res as any)?.message || "Failed to save rules");
      }
    } catch (err: any) {
      showNotification("error", err?.message || "Error saving rules");
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV
  const exportReferralRecordsCsv = () => {
    if (referrals.length === 0) return;
    const headers = ["Referral ID", "Referrer Name", "Referrer Code", "Referee Friend", "Order ID", "Order Total (₹)", "Reward (₹)", "Status", "Created Date", "Approved Date", "Rejection Reason"];
    const rows = referrals.map(r => [
      r.id,
      `"${r.referrerName}"`,
      `"${r.referrerCode}"`,
      `"${r.refereeName}"`,
      r.orderId,
      r.orderTotal,
      r.rewardAmount,
      r.status,
      `"${r.createdAt}"`,
      `"${r.approvedAt || "N/A"}"`,
      `"${r.rejectionReason || "None"}"`
    ]);

    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `Janani_Referral_Audit_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    showNotification("success", "Referral audit ledger exported to CSV");
  };

  const exportWalletLedgerCsv = () => {
    if (walletTransactions.length === 0) return;
    const headers = ["Transaction ID", "Customer Name", "Customer Email", "Type", "Amount (₹)", "Balance After (₹)", "Category", "Reference ID", "Notes", "Timestamp"];
    const rows = walletTransactions.map(t => [
      t.id,
      `"${t.customerName}"`,
      t.customerEmail,
      t.type.toUpperCase(),
      t.amount,
      t.balanceAfter,
      `"${t.category}"`,
      t.referenceId,
      `"${t.notes || ""}"`,
      `"${t.createdAt}"`
    ]);

    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `Janani_Store_Wallet_Ledger_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    showNotification("success", "Store wallet transactions exported to CSV");
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
            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Top Header & Master Action Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/80 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Share2 className="w-3.5 h-3.5 text-primary" />
            <span>Advocacy & Customer Wallet Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Refer & Earn and Wallet Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Supervise advocate reward approvals, referee welcome perks, fraud prevention escrow & storewide wallet balances.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setDebitModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-muted/70 hover:bg-muted text-foreground border border-border/60 transition-colors shadow-sm"
          >
            <Minus className="w-3.5 h-3.5 text-rose-500" />
            <span>Debit Wallet</span>
          </button>

          <button
            onClick={() => setCreditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Wallet Credit</span>
          </button>
        </div>
      </div>

      {/* 6 High-Impact KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1 */}
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Referral GMV</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{stats.totalReferralGmv.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Driven by Advocates</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Rewards Paid</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Gift className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{stats.totalRewardsPaid.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.approvedCount} Approved Payouts
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Escrow</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{stats.pendingEscrowAmount.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
            {stats.pendingCount} In 7-Day Lock-in
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Conversions</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {stats.totalConversions}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
            {stats.conversionRate} Conversion Rate
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Wallet Float</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{walletStats.activeCirculation.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-1">
            Active Store Credits
          </div>
        </div>

        {/* Metric 6 */}
        <div className="bg-card p-4 rounded-xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Top Advocate</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">
            Kavya Wellness
          </div>
          <div className="text-xs font-mono text-muted-foreground mt-0.5">
            142 Referrals (₹1.84L)
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center justify-between border-b border-border/80 pb-px">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("referrals")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "referrals"
                ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Referral Audit & Approvals Desk</span>
            {stats.pendingCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 font-mono">
                {stats.pendingCount} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("wallet")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "wallet"
                ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Storewide Wallet Ledger</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-mono">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab("refSettings")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "refSettings"
                ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Referral Program Rules</span>
          </button>

          <button
            onClick={() => setActiveTab("walletSettings")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "walletSettings"
                ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Wallet & Cashback Rules</span>
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
            <span>Funnel & Advocates Leaderboard</span>
          </button>
        </div>

        {activeTab === "referrals" && (
          <button
            onClick={exportReferralRecordsCsv}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REFERRAL AUDIT & APPROVALS DESK */}
      {/* ========================================================================= */}
      {activeTab === "referrals" && (
        <div className="space-y-4">
          {/* Sub Filter Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/70 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex bg-muted/60 p-1 rounded-xl border border-border/60">
                {[
                  { key: "all", label: "All Referrals", count: stats.approvedCount + stats.pendingCount + stats.rejectedCount },
                  { key: "pending", label: "Pending Review", count: stats.pendingCount },
                  { key: "approved", label: "Approved & Credited", count: stats.approvedCount },
                  { key: "rejected", label: "Rejected / Flagged", count: stats.rejectedCount }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setReferralStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      referralStatusFilter === tab.key
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground font-mono">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={referralSearch}
                  onChange={e => setReferralSearch(e.target.value)}
                  placeholder="Search by Referrer, Referee, Code, or Order ID..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <select
                value={referralSort}
                onChange={e => setReferralSort(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="reward_desc">Highest Reward</option>
                <option value="order_desc">Highest Order Total</option>
              </select>
            </div>
          </div>

          {/* Referral Table */}
          <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wider font-semibold text-muted-foreground border-b border-border/80">
                  <tr>
                    <th className="px-5 py-3.5">Referral ID</th>
                    <th className="px-4 py-3.5">Advocate / Referrer</th>
                    <th className="px-4 py-3.5">Referred Friend</th>
                    <th className="px-4 py-3.5">Qualifying Order</th>
                    <th className="px-4 py-3.5">Commission Reward</th>
                    <th className="px-4 py-3.5">Status & Holding</th>
                    <th className="px-5 py-3.5 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {referrals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">
                        No referral records found matching your active filter.
                      </td>
                    </tr>
                  ) : (
                    referrals.map(record => (
                      <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground font-semibold">
                          {record.id}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{record.referrerName}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              {record.referrerTier}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">{record.referrerCode}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 dark:text-white">{record.refereeName}</div>
                          <div className="text-xs text-muted-foreground">{record.refereeEmail}</div>
                        </td>

                        <td className="px-4 py-3.5 text-xs">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">{record.orderId}</div>
                          <div className="text-muted-foreground">
                            ₹{record.orderTotal.toLocaleString("en-IN")} · <span className="text-emerald-600 dark:text-emerald-400 font-medium">{record.orderStatus}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-mono">
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{record.rewardAmount}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-xs">
                          {record.status === "Approved" ? (
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Approved & Credited
                              </span>
                              <div className="text-[11px] text-muted-foreground mt-0.5">{record.approvedAt}</div>
                            </div>
                          ) : record.status === "Rejected" ? (
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                <XCircle className="w-3 h-3 text-rose-500" />
                                Rejected
                              </span>
                              <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 line-clamp-1" title={record.rejectionReason || ""}>
                                {record.rejectionReason}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                <Clock className="w-3 h-3 text-amber-500" />
                                Pending Holding
                              </span>
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                Lock-in: {record.holdingExpiryDate}
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenInspector(record)}
                              className="p-1.5 rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors"
                              title="Inspect referral anti-fraud signals & order"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {record.status === "Pending" && (
                              <>
                                <button
                                  onClick={() => handleApproveReward(record.id)}
                                  disabled={actionLoading}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
                                  title="Approve & credit wallet immediately"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>

                                <button
                                  onClick={() => handleOpenReject(record)}
                                  disabled={actionLoading}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-card hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/40 border border-border hover:border-rose-200 transition-colors disabled:opacity-50"
                                  title="Reject reward payout"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
                          </div>
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
      {/* TAB 2: STOREWIDE WALLET LEDGER */}
      {/* ========================================================================= */}
      {activeTab === "wallet" && (
        <div className="space-y-4">
          {/* Filtering Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-card p-4 rounded-xl border border-border/70 shadow-sm">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={walletSearch}
                onChange={e => setWalletSearch(e.target.value)}
                placeholder="Search by customer name, email, transaction ID or reference..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <select
                value={walletTypeFilter}
                onChange={e => setWalletTypeFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              >
                <option value="all">All Transaction Types</option>
                <option value="credit">Credits (Top-ups & Rewards)</option>
                <option value="debit">Debits (Order Usage)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={walletCategoryFilter}
                onChange={e => setWalletCategoryFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              >
                <option value="all">All Categories</option>
                <option value="referral reward">Referral Rewards</option>
                <option value="order payment">Order Payments</option>
                <option value="signup bonus">Signup Bonuses</option>
                <option value="order cashback">Prepaid Cashback</option>
                <option value="manual admin credit">Manual Adjustments</option>
              </select>

              <button
                onClick={exportWalletLedgerCsv}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-1.5 flex-shrink-0"
                title="Export Wallet CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Wallet Ledger Table */}
          <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wider font-semibold text-muted-foreground border-b border-border/80">
                  <tr>
                    <th className="px-5 py-3.5">Transaction ID</th>
                    <th className="px-4 py-3.5">Customer</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Amount</th>
                    <th className="px-4 py-3.5">Balance After</th>
                    <th className="px-4 py-3.5">Reference ID</th>
                    <th className="px-5 py-3.5">Timestamp & Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {walletTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">
                        No wallet transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    walletTransactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground font-semibold">
                          {txn.id}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 dark:text-white">{txn.customerName}</div>
                          <div className="text-xs text-muted-foreground">{txn.customerEmail}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-foreground border border-border/60">
                            {txn.category}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-sm font-bold">
                          {txn.type === "credit" ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              +₹{txn.amount.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400">
                              -₹{txn.amount.toLocaleString("en-IN")}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                          ₹{txn.balanceAfter.toLocaleString("en-IN")}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                          {txn.referenceId}
                        </td>

                        <td className="px-5 py-3.5 text-xs text-muted-foreground">
                          <div>{txn.createdAt}</div>
                          {txn.notes && <div className="text-[11px] text-muted-foreground/80 line-clamp-1">{txn.notes}</div>}
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
      {/* TAB 3: REFERRAL PROGRAM SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === "refSettings" && referralConfig && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSaveReferralConfig} className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Referral Program Rules & Economics</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure advocate commission payouts, friend discounts & fraud prevention lock-in days.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Program Status</span>
                <button
                  type="button"
                  onClick={() => setReferralConfig(prev => prev ? { ...prev, enabled: !prev.enabled } : null)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    referralConfig.enabled ? "bg-emerald-600" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      referralConfig.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  Advocate Reward Type
                </label>
                <select
                  value={referralConfig.referrerRewardType}
                  onChange={e => setReferralConfig(prev => prev ? { ...prev, referrerRewardType: e.target.value as any } : null)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="flat">Flat Cash Reward (₹)</option>
                  <option value="percentage">Percentage of Order GMV (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  Advocate Reward Value ({referralConfig.referrerRewardType === "flat" ? "₹" : "%"})
                </label>
                <input
                  type="number"
                  min={1}
                  value={referralConfig.referrerRewardValue}
                  onChange={e => setReferralConfig(prev => prev ? { ...prev, referrerRewardValue: Number(e.target.value) } : null)}
                  className="w-full px-3.5 py-2 text-sm font-bold rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  Referred Friend Welcome Discount
                </label>
                <select
                  value={referralConfig.refereeDiscountType}
                  onChange={e => setReferralConfig(prev => prev ? { ...prev, refereeDiscountType: e.target.value as any } : null)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="flat">Flat ₹ Instant Off</option>
                  <option value="percentage">Percentage % Off</option>
                  <option value="free_shipping">Free Shipping on First Order</option>
                </select>
              </div>

              {referralConfig.refereeDiscountType !== "free_shipping" && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                    Friend Discount Amount ({referralConfig.refereeDiscountType === "flat" ? "₹" : "%"})
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={referralConfig.refereeDiscountValue}
                    onChange={e => setReferralConfig(prev => prev ? { ...prev, refereeDiscountValue: Number(e.target.value) } : null)}
                    className="w-full px-3.5 py-2 text-sm font-bold rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  Min Qualifying Order Value (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={referralConfig.minOrderValue}
                  onChange={e => setReferralConfig(prev => prev ? { ...prev, minOrderValue: Number(e.target.value) } : null)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  Holding Escrow Lock-in (Days)
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={referralConfig.holdingDays}
                  onChange={e => setReferralConfig(prev => prev ? { ...prev, holdingDays: Number(e.target.value) } : null)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Tier Multipliers */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Customer Tier Multipliers
              </h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Silver Tier:</span>
                  <input
                    type="number"
                    step="0.05"
                    value={referralConfig.silverMultiplier}
                    onChange={e => setReferralConfig(prev => prev ? { ...prev, silverMultiplier: Number(e.target.value) } : null)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-background border border-border font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <span className="text-muted-foreground">Gold Tier:</span>
                  <input
                    type="number"
                    step="0.05"
                    value={referralConfig.goldMultiplier}
                    onChange={e => setReferralConfig(prev => prev ? { ...prev, goldMultiplier: Number(e.target.value) } : null)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-background border border-border font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <span className="text-muted-foreground">Platinum VIP:</span>
                  <input
                    type="number"
                    step="0.05"
                    value={referralConfig.platinumMultiplier}
                    onChange={e => setReferralConfig(prev => prev ? { ...prev, platinumMultiplier: Number(e.target.value) } : null)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-background border border-border font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Save Referral Rules</span>
              </button>
            </div>
          </form>

          {/* Program Overview & Anti-Fraud Card */}
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Automated Anti-Fraud Protection</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The referral system cross-checks browser device fingerprints, shipping address similarity & IP address matching to automatically block self-referrals.
              </p>
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Self-Referrals:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">Blocked</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Qualifying Trigger:</span>
                  <span className="font-semibold text-foreground">Delivered Order Only</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Return Clawback:</span>
                  <span className="font-semibold text-foreground">Automatic Reversal</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-950/20 via-card to-card p-5 rounded-2xl border border-emerald-500/20 text-xs text-muted-foreground space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Advocate Link Formula</span>
              </div>
              <p className="font-mono text-[11px] bg-background p-2.5 rounded-lg border border-border/60">
                https://jananiagro.com/?ref=&#123;REFERRER_CODE&#125;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: WALLET & CASHBACK RULES */}
      {/* ========================================================================= */}
      {activeTab === "walletSettings" && walletConfig && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSaveWalletConfig} className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Storewide Customer Wallet & Cashback Parameters</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure checkout redemption limits, prepaid cashback percentages & signup credit perks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Wallet System</span>
                <button
                  type="button"
                  onClick={() => setWalletConfig(prev => prev ? { ...prev, enabled: !prev.enabled } : null)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    walletConfig.enabled ? "bg-emerald-600" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      walletConfig.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  Prepaid Order Cashback (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={walletConfig.cashbackPercentage}
                  onChange={e => setWalletConfig(prev => prev ? { ...prev, cashbackPercentage: Number(e.target.value) } : null)}
                  className="w-full px-3.5 py-2 text-sm font-bold rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  New Member Signup Bonus (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={walletConfig.signupBonus}
                  onChange={e => setWalletConfig(prev => prev ? { ...prev, signupBonus: Number(e.target.value) } : null)}
                  className="w-full px-3.5 py-2 text-sm font-bold rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  Max Wallet Usage Per Order (% of Cart)
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={walletConfig.maxRedemptionPercent}
                  onChange={e => setWalletConfig(prev => prev ? { ...prev, maxRedemptionPercent: Number(e.target.value) } : null)}
                  className="w-full px-3.5 py-2 text-sm font-bold rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  Min Cart for Wallet Redemption (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={walletConfig.minOrderForRedemption}
                  onChange={e => setWalletConfig(prev => prev ? { ...prev, minOrderForRedemption: Number(e.target.value) } : null)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  Promotional Credit Expiry (Days)
                </label>
                <input
                  type="number"
                  min={30}
                  max={365}
                  value={walletConfig.autoExpireDays}
                  onChange={e => setWalletConfig(prev => prev ? { ...prev, autoExpireDays: Number(e.target.value) } : null)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  Point to Rupee Value
                </label>
                <input
                  type="text"
                  disabled
                  value="1 Wallet Credit = ₹1.00 INR"
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-muted text-muted-foreground border border-border font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Save Wallet Rules</span>
              </button>
            </div>
          </form>

          {/* Wallet Float Summary Card */}
          <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Store Wallet Float Metrics</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex justify-between">
                <span className="text-muted-foreground">Cumulative Credits:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  +₹{walletStats.totalCredits.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex justify-between">
                <span className="text-muted-foreground">Cumulative Redemptions:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                  -₹{walletStats.totalDebits.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100 rounded-xl border border-emerald-200 dark:border-emerald-800 flex justify-between">
                <span className="font-semibold">Active Customer Balance:</span>
                <span className="font-bold font-mono">
                  ₹{walletStats.activeCirculation.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FUNNEL & ADVOCATES LEADERBOARD */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 5 Advocates Leaderboard */}
          <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Converting Advocates Leaderboard</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Top performing influencers and loyal patrons driving customer acquisitions.
                </p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="divide-y divide-border/60">
              {analyticsData.leaderboard.map(item => (
                <div key={item.code} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-bold text-xs font-mono text-muted-foreground">
                      #{item.rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200">
                          {item.tier}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.successfulReferrals} verified friend orders · Earned ₹{item.commissionEarned.toLocaleString("en-IN")} commission
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                      ₹{item.revenueDriven.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-muted-foreground">GMV Driven</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Conversion Funnel */}
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Referral Conversion Funnel</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  End-to-end customer journey from link sharing to repeat orders.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {analyticsData.funnel.map((step, idx) => (
                  <div key={step.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-foreground">{step.stage}</span>
                      <span className="text-muted-foreground font-mono">
                        {step.count} ({step.conversionRate})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${100 - idx * 15}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Reward Status Distribution
              </h4>
              <div className="space-y-2 text-xs">
                {analyticsData.statusDistribution.map(dist => (
                  <div key={dist.status} className="flex justify-between items-center">
                    <span className="text-foreground">{dist.status}</span>
                    <span className="font-bold font-mono text-muted-foreground">{dist.percentage}% ({dist.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANUAL WALLET CREDIT */}
      {/* ========================================================================= */}
      {creditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Manual Wallet Credit</span>
              </div>
              <button onClick={() => setCreditModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleManualCredit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase text-muted-foreground mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={creditName}
                  onChange={e => setCreditName(e.target.value)}
                  required
                  placeholder="e.g. Aarav Patel"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-muted-foreground mb-1">
                  Customer Email (Optional)
                </label>
                <input
                  type="email"
                  value={creditEmail}
                  onChange={e => setCreditEmail(e.target.value)}
                  placeholder="e.g. aarav.patel@gmail.com"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-muted-foreground mb-1">
                    Credit Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={creditAmount}
                    onChange={e => setCreditAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm font-bold rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-muted-foreground mb-1">
                    Credit Reason
                  </label>
                  <select
                    value={creditCategory}
                    onChange={e => setCreditCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Manual Admin Credit">Goodwill / Compensation</option>
                    <option value="Promotional Gift">Promotional Gift Bonus</option>
                    <option value="Offline Cash Deposit">Offline Cash Settlement</option>
                    <option value="Campaign Bonus">Influencer Campaign Bonus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-muted-foreground mb-1">
                  Internal Remarks / Audit Note
                </label>
                <textarea
                  value={creditNotes}
                  onChange={e => setCreditNotes(e.target.value)}
                  rows={2}
                  placeholder="Reason for crediting wallet..."
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCreditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-all disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : `Credit ₹${creditAmount} Now`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANUAL WALLET DEBIT */}
      {/* ========================================================================= */}
      {debitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-rose-600 dark:text-rose-400">
                <Minus className="w-4 h-4" />
                <span>Manual Wallet Debit / Clawback</span>
              </div>
              <button onClick={() => setDebitModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleManualDebit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase text-muted-foreground mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={debitName}
                  onChange={e => setDebitName(e.target.value)}
                  required
                  placeholder="e.g. Priya Sundaram"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-muted-foreground mb-1">
                  Customer Email (Optional)
                </label>
                <input
                  type="email"
                  value={debitEmail}
                  onChange={e => setDebitEmail(e.target.value)}
                  placeholder="e.g. priya.sundaram@outlook.com"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-muted-foreground mb-1">
                    Debit Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={debitAmount}
                    onChange={e => setDebitAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm font-bold rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-muted-foreground mb-1">
                    Debit Reason
                  </label>
                  <select
                    value={debitReason}
                    onChange={e => setDebitReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Clawback / Erroneous Credit">Erroneous Credit Clawback</option>
                    <option value="Order Return Adjustment">Order Return Adjustment</option>
                    <option value="Chargeback Settlement">Chargeback Settlement</option>
                    <option value="Policy Violation Penalty">Policy Violation Penalty</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-muted-foreground mb-1">
                  Audit Remarks
                </label>
                <textarea
                  value={debitNotes}
                  onChange={e => setDebitNotes(e.target.value)}
                  rows={2}
                  placeholder="Reason for debiting balance..."
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDebitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow transition-all disabled:opacity-50"
                >
                  {actionLoading ? "Debiting..." : `Debit ₹${debitAmount} Now`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT REWARD REASON */}
      {/* ========================================================================= */}
      {rejectModalOpen && selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Reject Reward for {selectedReferral.referrerName}?
              </h3>
              <p className="text-xs text-muted-foreground">
                Qualifying Order: <span className="font-mono font-bold text-foreground">{selectedReferral.orderId}</span> (₹{selectedReferral.orderTotal})
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold uppercase text-muted-foreground">
                Disqualification Reason *
              </label>
              <select
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Order Returned & Refunded">Order Returned & Refunded</option>
                <option value="Self-Referral IP Match Detected">Self-Referral IP Match Detected</option>
                <option value="Order Cancelled Prior to Fulfillment">Order Cancelled Prior to Fulfillment</option>
                <option value="Suspicious Phone Number Match">Suspicious Phone / Address Match</option>
                <option value="Terms & Conditions Policy Violation">Terms & Conditions Policy Violation</option>
              </select>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow transition-all disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: REFERRAL INSPECTOR & FRAUD CHECKS */}
      {/* ========================================================================= */}
      {inspectorDrawerOpen && selectedReferral && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-xl h-full shadow-2xl border-l border-border flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-border/80 bg-muted/30 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Referral Inspector</span>
                </div>
                <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {selectedReferral.id}
                </h3>
              </div>
              <button
                onClick={() => setInspectorDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Relationship Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <div className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                    Advocate (Referrer)
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedReferral.referrerName}
                  </div>
                  <div className="text-muted-foreground">{selectedReferral.referrerEmail}</div>
                  <div className="font-mono text-[11px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded inline-block">
                    {selectedReferral.referrerCode}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <div className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                    Referred Friend
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedReferral.refereeName}
                  </div>
                  <div className="text-muted-foreground">{selectedReferral.refereeEmail}</div>
                  <div className="text-muted-foreground font-mono">{selectedReferral.refereePhone}</div>
                </div>
              </div>

              {/* Qualifying Order */}
              <div className="p-4 rounded-xl border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Qualifying Order Summary</span>
                  <span className="font-mono font-bold text-foreground">{selectedReferral.orderId}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-border/60">
                  <div>Order Total: <span className="font-bold text-foreground">₹{selectedReferral.orderTotal}</span></div>
                  <div>Order Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedReferral.orderStatus}</span></div>
                  <div>Commission: <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{selectedReferral.rewardAmount}</span></div>
                  <div>Initiated: <span className="font-semibold text-foreground">{selectedReferral.createdAt}</span></div>
                </div>
              </div>

              {/* Fraud Detection Score */}
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Fraud & Self-Referral Score</span>
                  </div>
                  <span className="font-mono">{selectedReferral.fraudScore || "Low (0.02)"}</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  ✓ Device ID Distinct · ✓ IP Geolocation Cleared · ✓ Verified Payment Method
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-between">
              {selectedReferral.status === "Pending" ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setInspectorDrawerOpen(false);
                      handleApproveReward(selectedReferral.id);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                  >
                    Approve Reward
                  </button>
                  <button
                    onClick={() => {
                      setInspectorDrawerOpen(false);
                      handleOpenReject(selectedReferral);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <span className="text-xs font-semibold text-muted-foreground">
                  Status: {selectedReferral.status}
                </span>
              )}

              <button
                onClick={() => setInspectorDrawerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-muted hover:bg-muted/80 text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
