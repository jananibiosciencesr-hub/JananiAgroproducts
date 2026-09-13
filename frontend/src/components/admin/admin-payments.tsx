import React, { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  Download,
  Send,
  Printer,
  ChevronRight,
  Eye,
  EyeOff,
  Zap,
  Building2,
  Smartphone,
  Wallet,
  Receipt,
  Check,
  X,
  MessageSquare,
  Mail,
  Info
} from "lucide-react";
import {
  getPaymentTransactions,
  getPaymentTransactionById,
  processPaymentRefund,
  getGatewayConfig,
  updateGatewayConfig,
  testGatewayConnection,
  getSettlementReports,
  getFailedPaymentRetries,
  sendPaymentRetryLink,
  convertFailedToCod,
  PaymentTransaction,
  SettlementReport,
  FailedPaymentRetry,
  PaymentStats
} from "@/lib/api";

interface RazorpayConfig {
  keyId?: string;
  keySecret?: string;
  webhookSecret?: string;
  instantUpi?: boolean;
  instantSettlement?: boolean;
  status?: string;
  lastTested?: string;
}

interface StripeConfig {
  publishableKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  multiCurrency?: boolean;
  status?: string;
  lastTested?: string;
}

interface UpiDirectConfig {
  vpa?: string;
  merchantName?: string;
  qrCodeDisplay?: boolean;
  autoUtrVerification?: boolean;
  status?: string;
}

interface CodRulesConfig {
  maxOrderLimit?: number;
  extraFee?: number;
  requireOtpVerification?: boolean;
  disableForHighRto?: boolean;
  status?: string;
}

interface GatewayConfigState {
  razorpay?: RazorpayConfig;
  stripe?: StripeConfig;
  upiDirect?: UpiDirectConfig;
  codRules?: CodRulesConfig;
  [key: string]: any;
}

export function PaymentsManagement() {
  const [activeTab, setActiveTab] = useState<"transactions" | "gateways" | "refunds" | "settlements" | "recovery">("transactions");
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    grossInflow: 0,
    settledToBank: 0,
    pendingPayouts: 0,
    codInTransit: 0,
    totalRefunds: 0,
    recoveryRate: "0%"
  });
  const [settlements, setSettlements] = useState<SettlementReport[]>([]);
  const [failedRetries, setFailedRetries] = useState<FailedPaymentRetry[]>([]);
  const [gatewayConfigs, setGatewayConfigs] = useState<GatewayConfigState>({});
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Drawers & Modals
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransaction | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [selectedRecovery, setSelectedRecovery] = useState<FailedPaymentRetry | null>(null);

  // Refund Form State
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundDestination, setRefundDestination] = useState<"gateway" | "wallet">("gateway");
  const [refundReason, setRefundReason] = useState("Customer requested cancellation");
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  // Gateway Testing State
  const [testingGateway, setTestingGateway] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<{ rzp?: boolean; stripe?: boolean }>({});

  // Toast / Feedback
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Transactions & Global Data
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await getPaymentTransactions({
        status: statusFilter,
        gateway: gatewayFilter,
        search: searchQuery || undefined,
        sortBy
      });
      setTransactions(res.data || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error("Failed to load transactions", err);
      showToast("Error loading payment ledger", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load Gateway Configs
  const loadGatewayConfigData = async () => {
    try {
      const data = await getGatewayConfig();
      if (data) setGatewayConfigs(data);
    } catch (err) {
      console.error("Failed to load gateway config", err);
    }
  };

  // Load Settlements
  const loadSettlements = async () => {
    try {
      const data = await getSettlementReports();
      setSettlements(data);
    } catch (err) {
      console.error("Failed to load settlements", err);
    }
  };

  // Load Failed Retries
  const loadFailedRetries = async () => {
    try {
      const data = await getFailedPaymentRetries();
      setFailedRetries(data);
    } catch (err) {
      console.error("Failed to load failed retries", err);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [statusFilter, gatewayFilter, sortBy]);

  useEffect(() => {
    loadGatewayConfigData();
    loadSettlements();
    loadFailedRetries();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTransactions();
  };

  // Open Refund Modal for a Transaction
  const handleOpenRefund = (txn: PaymentTransaction) => {
    setSelectedTxn(txn);
    const eligibleAmount = txn.grossAmount - (txn.refundedAmount || 0);
    setRefundAmount(eligibleAmount);
    setRefundType(txn.refundedAmount > 0 ? "partial" : "full");
    setRefundModalOpen(true);
  };

  // Submit Refund
  const handleProcessRefund = async () => {
    if (!selectedTxn) return;
    try {
      setRefundSubmitting(true);
      const res = await processPaymentRefund({
        transactionId: selectedTxn.id,
        orderId: selectedTxn.orderId,
        refundType,
        amount: refundAmount,
        destination: refundDestination,
        reason: refundReason
      });

      if (res && res.success) {
        showToast(res.message || "Refund processed successfully!", "success");
        setRefundModalOpen(false);
        await loadTransactions();
        if (selectedTxn) {
          const updated = await getPaymentTransactionById(selectedTxn.id);
          if (updated) setSelectedTxn(updated);
        }
      } else {
        showToast(res ? res.message : "Failed to process refund", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Refund processing failed", "error");
    } finally {
      setRefundSubmitting(false);
    }
  };

  // Test Gateway Connection
  const handleTestGateway = async (gatewayKey: string) => {
    try {
      setTestingGateway(gatewayKey);
      const res = await testGatewayConnection(gatewayKey);
      if (res && res.success) {
        showToast(res.message, "success");
        await loadGatewayConfigData();
      } else {
        showToast(res ? res.message : "Gateway connection test failed", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Connection test failed", "error");
    } finally {
      setTestingGateway(null);
    }
  };

  // Save Gateway Config Changes
  const handleSaveGateway = async (gatewayKey: string, partialConfig: any) => {
    try {
      const updated = { ...((gatewayConfigs as any)[gatewayKey] || {}), ...partialConfig };
      const res = await updateGatewayConfig(gatewayKey, updated);
      if (res && res.success) {
        setGatewayConfigs(prev => ({ ...prev, [gatewayKey]: res.data }));
        showToast(`${gatewayKey.toUpperCase()} settings saved successfully!`, "success");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to update gateway settings", "error");
    }
  };

  // Send Recovery Link
  const handleSendRecovery = async (channel: "whatsapp" | "sms" | "email") => {
    if (!selectedRecovery) return;
    try {
      const res = await sendPaymentRetryLink(selectedRecovery.id, channel);
      if (res && res.success) {
        showToast(res.message, "success");
        setRecoveryModalOpen(false);
        await loadFailedRetries();
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to dispatch recovery link", "error");
    }
  };

  // Convert to COD
  const handleConvertToCod = async (retryId: string) => {
    try {
      const res = await convertFailedToCod(retryId);
      if (res && res.success) {
        showToast(res.message, "success");
        await loadFailedRetries();
        await loadTransactions();
      }
    } catch (err: any) {
      showToast(err?.message || "Conversion failed", "error");
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ["Transaction ID", "Order ID", "Customer", "Gateway", "Method", "Gross Amount", "Gateway Fee", "Net Settled", "Status", "Bank UTR", "Date"];
    const rows = transactions.map(t => [
      t.id,
      t.orderId,
      `"${t.customer.name}"`,
      t.gateway,
      t.method,
      t.grossAmount,
      t.gatewayFee,
      t.netSettledAmount,
      t.status,
      t.bankUtr || "N/A",
      `"${t.createdAt}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Janani_Agro_Payment_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Payment ledger exported as CSV!", "success");
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium backdrop-blur-md transition-all duration-300 ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/30"
              : toastMessage.type === "error"
              ? "bg-rose-950/90 text-rose-200 border-rose-500/30"
              : "bg-amber-950/90 text-amber-200 border-amber-500/30"
          }`}
        >
          {toastMessage.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toastMessage.type === "error" && <XCircle className="w-5 h-5 text-rose-400" />}
          {toastMessage.type === "info" && <Info className="w-5 h-5 text-amber-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-800/40 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 mb-3 tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Multi-Gateway Merchant Terminal (Shopify & Razorpay Standard)
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl flex items-center gap-3">
              Payment Management & Ledger
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-medium border border-emerald-500/30">
                INR (₹) / Multi-Currency
              </span>
            </h1>
            <p className="mt-2 text-sm text-emerald-100/70 max-w-2xl leading-relaxed">
              Unified payment ledger, instant gateway routing (Razorpay, Stripe, Direct UPI, COD), automated partial & full refund processing, settlement reconciliation & abandoned checkout recovery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-sm font-medium border border-slate-700/60 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export Ledger CSV
            </button>
            <button
              onClick={() => {
                loadTransactions();
                loadGatewayConfigData();
                loadSettlements();
                loadFailedRetries();
                showToast("Payment ledger and gateway statuses refreshed", "info");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Sync Ledger
            </button>
          </div>
        </div>
      </div>

      {/* 6 High-Impact KPI Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Gross Inflow */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Inflow</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{stats.grossInflow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-400/90 mt-1 font-medium flex items-center gap-1">
            <Check className="w-3 h-3" /> Captured Inflows
          </p>
        </div>

        {/* Settled to Bank */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-teal-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Settled to Bank</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{stats.settledToBank.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-teal-400/90 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Credited to HDFC
          </p>
        </div>

        {/* Pending Payouts */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Payouts</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{stats.pendingPayouts.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-amber-400/90 mt-1 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> T+1 Payout Pipeline
          </p>
        </div>

        {/* COD In Transit */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">COD In Transit</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{stats.codInTransit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-blue-400/90 mt-1 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Courier Remittance
          </p>
        </div>

        {/* Total Refunds */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Refunds</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{stats.totalRefunds.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-purple-400/90 mt-1 font-medium flex items-center gap-1">
            <Check className="w-3 h-3" /> Reconciled
          </p>
        </div>

        {/* Recovery Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Recovery Rate</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {stats.recoveryRate}
          </div>
          <p className="text-[11px] text-indigo-400/90 mt-1 font-medium flex items-center gap-1">
            <Zap className="w-3 h-3" /> WhatsApp / SMS Links
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "transactions", label: "All Transactions Ledger", icon: Receipt, count: transactions.length },
          { id: "gateways", label: "Gateway Integrations & API Keys", icon: CreditCard },
          { id: "refunds", label: "Refund Management", icon: ArrowDownLeft },
          { id: "settlements", label: "Settlement & Bank Payouts", icon: Building2, count: settlements.length },
          { id: "recovery", label: "Failed Payment Recovery", icon: Zap, count: failedRetries.filter(r => r.recoveryStatus !== "Recovered").length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-md font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
              {tab.label}
              {typeof tab.count === "number" && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL TRANSACTIONS LEDGER */}
      {/* ========================================================================= */}
      {activeTab === "transactions" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Transaction ID, Order #, Customer Name, Email, or Bank UTR..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
              />
            </form>

            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              {[
                { id: "all", label: "All Status" },
                { id: "captured", label: "Captured" },
                { id: "pending", label: "Pending" },
                { id: "refunded", label: "Refunded" },
                { id: "partially refunded", label: "Partial Refund" },
                { id: "failed", label: "Failed" }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? "bg-emerald-600 text-white font-semibold shadow-sm"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Gateway Filter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={gatewayFilter}
                onChange={e => setGatewayFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500/60"
              >
                <option value="all">All Payment Gateways</option>
                <option value="razorpay">Razorpay (Cards/UPI)</option>
                <option value="stripe">Stripe (USD/Intl)</option>
                <option value="upi direct">UPI Direct (0% MDR)</option>
                <option value="cod">Cash on Delivery (COD)</option>
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500/60"
              >
                <option value="newest">Latest First</option>
                <option value="amount_desc">Highest Gross (₹)</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-16 text-center">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400">Fetching encrypted payment transactions from gateway ledger...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-16 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No payment transactions found</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Try clearing your search query or switching your status & gateway filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setGatewayFilter("all");
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800 tracking-wider">
                    <tr>
                      <th className="px-5 py-4">Transaction ID & Date</th>
                      <th className="px-5 py-4">Order & Customer</th>
                      <th className="px-5 py-4">Gateway & Method</th>
                      <th className="px-5 py-4 text-right">Gross Amount</th>
                      <th className="px-5 py-4 text-right">Fee / MDR</th>
                      <th className="px-5 py-4 text-right">Net Settled</th>
                      <th className="px-5 py-4 text-center">Status</th>
                      <th className="px-5 py-4">Bank Settlement / UTR</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {transactions.map(txn => {
                      const isCaptured = txn.status === "Captured";
                      const isPending = txn.status === "Pending";
                      const isFailed = txn.status === "Failed";
                      const isRefunded = txn.status === "Refunded";
                      const isPartialRefund = txn.status === "Partially Refunded";

                      return (
                        <tr
                          key={txn.id}
                          className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                          onClick={() => {
                            setSelectedTxn(txn);
                            setDrawerOpen(true);
                          }}
                        >
                          {/* Transaction ID & Date */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-emerald-400 transition-colors">
                              {txn.id}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{txn.createdAt}</div>
                          </td>

                          {/* Order & Customer */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={txn.customer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(txn.customer.name)}`}
                                alt={txn.customer.name}
                                className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800"
                              />
                              <div>
                                <div className="font-semibold text-white text-xs leading-none">{txn.customer.name}</div>
                                <div className="text-[11px] text-emerald-400/90 font-mono mt-0.5">{txn.orderId}</div>
                                <div className="text-[10px] text-slate-500">{txn.customer.phone}</div>
                              </div>
                            </div>
                          </td>

                          {/* Gateway & Method */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                              {txn.gateway.includes("Razorpay") && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                              {txn.gateway.includes("Stripe") && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                              {txn.gateway.includes("UPI") && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                              {txn.gateway.includes("COD") && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                              {txn.gateway}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{txn.method}</div>
                          </td>

                          {/* Gross Amount */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="font-bold text-white text-sm">
                              ₹{txn.grossAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </div>
                            {txn.refundedAmount > 0 && (
                              <div className="text-[10px] text-rose-400 font-semibold mt-0.5">
                                -₹{txn.refundedAmount.toLocaleString("en-IN")} Refunded
                              </div>
                            )}
                          </td>

                          {/* Fee / MDR */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="text-xs font-mono text-slate-400">
                              ₹{txn.gatewayFee.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-500">GST: ₹{txn.gstOnFee.toFixed(2)}</div>
                          </td>

                          {/* Net Settled */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="font-bold text-emerald-400 font-mono text-sm">
                              ₹{txn.netSettledAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                isCaptured
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : isPending
                                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                  : isFailed
                                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                  : isRefunded
                                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                                  : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                              }`}
                            >
                              {isCaptured && <CheckCircle2 className="w-3 h-3" />}
                              {isPending && <Clock className="w-3 h-3" />}
                              {isFailed && <XCircle className="w-3 h-3" />}
                              {isRefunded && <ArrowDownLeft className="w-3 h-3" />}
                              {isPartialRefund && <ArrowDownLeft className="w-3 h-3" />}
                              {txn.status}
                            </span>
                          </td>

                          {/* Bank Settlement / UTR */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            {txn.bankUtr ? (
                              <div>
                                <div className="font-mono text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-teal-400" />
                                  {txn.bankUtr}
                                </div>
                                <div className="text-[10px] text-teal-400 font-medium">{txn.settlementStatus}</div>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500 italic flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {txn.settlementStatus}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                title="View 360° Transaction Details"
                                onClick={() => {
                                  setSelectedTxn(txn);
                                  setDrawerOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                title="Print Official Payment Receipt"
                                onClick={() => {
                                  setSelectedTxn(txn);
                                  setReceiptModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {(isCaptured || isPartialRefund) && txn.grossAmount > txn.refundedAmount && (
                                <button
                                  title="Issue Full / Partial Refund"
                                  onClick={() => handleOpenRefund(txn)}
                                  className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
                                >
                                  Refund
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GATEWAY INTEGRATIONS & API KEYS */}
      {/* ========================================================================= */}
      {activeTab === "gateways" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. RAZORPAY */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Razorpay Gateway
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        Default India
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">UPI Apps, Credit/Debit Cards, NetBanking & Wallets</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Key ID</label>
                  <input
                    type="text"
                    value={gatewayConfigs.razorpay?.keyId || ""}
                    onChange={e => setGatewayConfigs(p => ({ ...p, razorpay: { ...(p.razorpay || {}), keyId: e.target.value } }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Key Secret</label>
                    <button
                      type="button"
                      onClick={() => setShowSecrets(p => ({ ...p, rzp: !p.rzp }))}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {showSecrets.rzp ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showSecrets.rzp ? "Mask" : "Reveal"}
                    </button>
                  </div>
                  <input
                    type={showSecrets.rzp ? "text" : "password"}
                    value={gatewayConfigs.razorpay?.keySecret || ""}
                    onChange={e => setGatewayConfigs(p => ({ ...p, razorpay: { ...(p.razorpay || {}), keySecret: e.target.value } }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Webhook Secret</label>
                  <input
                    type="text"
                    value={gatewayConfigs.razorpay?.webhookSecret || ""}
                    onChange={e => setGatewayConfigs(p => ({ ...p, razorpay: { ...(p.razorpay || {}), webhookSecret: e.target.value } }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Feature Toggles */}
                <div className="pt-2 grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gatewayConfigs.razorpay?.instantUpi ?? true}
                      onChange={e => setGatewayConfigs(p => ({ ...p, razorpay: { ...(p.razorpay || {}), instantUpi: e.target.checked } }))}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span className="text-xs text-slate-300 font-medium">Instant UPI Intent</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gatewayConfigs.razorpay?.instantSettlement ?? true}
                      onChange={e => setGatewayConfigs(p => ({ ...p, razorpay: { ...(p.razorpay || {}), instantSettlement: e.target.checked } }))}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span className="text-xs text-slate-300 font-medium">Instant Payouts</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => handleTestGateway("razorpay")}
                disabled={testingGateway === "razorpay"}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                {testingGateway === "razorpay" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-yellow-400" />}
                Test Webhook Ping
              </button>

              <button
                type="button"
                onClick={() => handleSaveGateway("razorpay", gatewayConfigs.razorpay)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Save Razorpay
              </button>
            </div>
          </div>

          {/* 2. STRIPE INTERNATIONAL */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Stripe Payments
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                        Global / USD / EUR
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">International Visa, Mastercard, Amex, Apple Pay & Google Pay</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Publishable Key</label>
                  <input
                    type="text"
                    value={gatewayConfigs.stripe?.publishableKey || ""}
                    onChange={e => setGatewayConfigs(p => ({ ...p, stripe: { ...(p.stripe || {}), publishableKey: e.target.value } }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Secret Key</label>
                    <button
                      type="button"
                      onClick={() => setShowSecrets(p => ({ ...p, stripe: !p.stripe }))}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {showSecrets.stripe ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showSecrets.stripe ? "Mask" : "Reveal"}
                    </button>
                  </div>
                  <input
                    type={showSecrets.stripe ? "text" : "password"}
                    value={gatewayConfigs.stripe?.secretKey || ""}
                    onChange={e => setGatewayConfigs(p => ({ ...p, stripe: { ...(p.stripe || {}), secretKey: e.target.value } }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Webhook Secret</label>
                  <input
                    type="text"
                    value={gatewayConfigs.stripe?.webhookSecret || ""}
                    onChange={e => setGatewayConfigs(p => ({ ...p, stripe: { ...(p.stripe || {}), webhookSecret: e.target.value } }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gatewayConfigs.stripe?.multiCurrency ?? true}
                      onChange={e => setGatewayConfigs(p => ({ ...p, stripe: { ...(p.stripe || {}), multiCurrency: e.target.checked } }))}
                      className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500/20"
                    />
                    <span className="text-xs text-slate-300 font-medium">Automatic Currency Conversion (135+ Currencies)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => handleTestGateway("stripe")}
                disabled={testingGateway === "stripe"}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                {testingGateway === "stripe" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-yellow-400" />}
                Test Webhook Ping
              </button>

              <button
                type="button"
                onClick={() => handleSaveGateway("stripe", gatewayConfigs.stripe)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Save Stripe
              </button>
            </div>
          </div>

          {/* 3. DIRECT MERCHANT UPI (0% MDR) */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Direct Merchant UPI
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        0% MDR Fee
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Direct account-to-account settlement via GPay / PhonePe / Paytm</p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Instant Credit
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Merchant VPA / UPI ID</label>
                  <input
                    type="text"
                    value={gatewayConfigs.upiDirect?.vpa || "jananiagro@hdfcbank"}
                    onChange={e => setGatewayConfigs(p => ({ ...p, upiDirect: { ...(p.upiDirect || {}), vpa: e.target.value } }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Merchant Display Name</label>
                  <input
                    type="text"
                    value={gatewayConfigs.upiDirect?.merchantName || "Janani Agro Products Pvt Ltd"}
                    onChange={e => setGatewayConfigs(p => ({ ...p, upiDirect: { ...(p.upiDirect || {}), merchantName: e.target.value } }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gatewayConfigs.upiDirect?.qrCodeDisplay ?? true}
                      onChange={e => setGatewayConfigs(p => ({ ...p, upiDirect: { ...(p.upiDirect || {}), qrCodeDisplay: e.target.checked } }))}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span className="text-xs text-slate-300 font-medium">Show Dynamic QR Code</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gatewayConfigs.upiDirect?.autoUtrVerification ?? true}
                      onChange={e => setGatewayConfigs(p => ({ ...p, upiDirect: { ...(p.upiDirect || {}), autoUtrVerification: e.target.checked } }))}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span className="text-xs text-slate-300 font-medium">Auto-UTR Verification</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => handleTestGateway("upiDirect")}
                disabled={testingGateway === "upiDirect"}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                {testingGateway === "upiDirect" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-yellow-400" />}
                Verify VPA Health
              </button>

              <button
                type="button"
                onClick={() => handleSaveGateway("upiDirect", gatewayConfigs.upiDirect)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Save UPI Direct
              </button>
            </div>
          </div>

          {/* 4. CASH ON DELIVERY (COD) RULES */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-600/10 border border-amber-500/20 text-amber-400">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Cash on Delivery (COD) Rules
                    </h3>
                    <p className="text-xs text-slate-400">Shiprocket remittance & RTO prevention guardrails</p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  Risk Guard Active
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Max Order COD Limit (₹)</label>
                    <input
                      type="number"
                      value={gatewayConfigs.codRules?.maxOrderLimit ?? 10000}
                      onChange={e => setGatewayConfigs(p => ({ ...p, codRules: { ...(p.codRules || {}), maxOrderLimit: Number(e.target.value) } }))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">COD Extra Handling Fee (₹)</label>
                    <input
                      type="number"
                      value={gatewayConfigs.codRules?.extraFee ?? 50}
                      onChange={e => setGatewayConfigs(p => ({ ...p, codRules: { ...(p.codRules || {}), extraFee: Number(e.target.value) } }))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-2.5">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gatewayConfigs.codRules?.requireOtpVerification ?? true}
                      onChange={e => setGatewayConfigs(p => ({ ...p, codRules: { ...(p.codRules || {}), requireOtpVerification: e.target.checked } }))}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20"
                    />
                    <span className="text-xs text-slate-300 font-medium">Require WhatsApp / SMS OTP confirmation before dispatch</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gatewayConfigs.codRules?.disableForHighRto ?? true}
                      onChange={e => setGatewayConfigs(p => ({ ...p, codRules: { ...(p.codRules || {}), disableForHighRto: e.target.checked } }))}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20"
                    />
                    <span className="text-xs text-slate-300 font-medium">Auto-block COD for customers with 2+ previous RTOs</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-end border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => handleSaveGateway("codRules", gatewayConfigs.codRules)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Save COD Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REFUND MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "refunds" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Processed Returns & Refund Ledger</h3>
              <p className="text-xs text-muted-foreground">Full and partial refund disbursements to original payment source or store wallet.</p>
            </div>

            <button
              onClick={() => {
                const captured = transactions.find(t => t.status === "Captured" || t.status === "Partially Refunded");
                if (captured) handleOpenRefund(captured);
                else showToast("No eligible captured transactions found for refund", "info");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Issue New Refund
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Refund ID & Date</th>
                    <th className="px-5 py-4">Order & Transaction</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4 text-right">Refund Amount</th>
                    <th className="px-5 py-4">Refund Destination</th>
                    <th className="px-5 py-4">Reason / Notes</th>
                    <th className="px-5 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {/* Filter transactions with refunded amount or show recent refunds */}
                  {transactions.filter(t => t.refundedAmount > 0).map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs">
                        <div className="font-bold text-purple-400">rfd_{t.id.slice(-6)}</div>
                        <div className="text-[11px] text-slate-500">{t.createdAt}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-xs">{t.orderId}</div>
                        <div className="text-[11px] font-mono text-slate-400">{t.id}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white text-xs">{t.customer.name}</div>
                        <div className="text-[11px] text-slate-400">{t.customer.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/20">
                          {t.refundedAmount >= t.grossAmount ? "Full Refund" : "Partial Refund"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-rose-400 text-sm">
                        ₹{t.refundedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-300">
                        Original Payment Source ({t.gateway})
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 max-w-xs truncate">
                        Customer item modification / cancellation
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Settled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SETTLEMENT & BANK PAYOUTS */}
      {/* ========================================================================= */}
      {activeTab === "settlements" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Gateway Rolling Settlement Batches</h3>
              <p className="text-xs text-muted-foreground">T+1 and T+2 automated bank transfers from payment gateway acquiring banks.</p>
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-500" />
              Primary Escrow: <span className="font-semibold text-foreground">HDFC Bank Current A/C (****2211)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {settlements.map(s => (
              <div key={s.batchId} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-400">{s.batchId}</span>
                  <span className="text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {s.status}
                  </span>
                </div>

                <div>
                  <div className="text-xs text-slate-400">{s.gateway}</div>
                  <div className="text-xl font-black text-white mt-1">
                    ₹{s.netBankDeposit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Gross: ₹{s.grossVolume.toLocaleString("en-IN")} • Fee: ₹{s.gatewayDeductions.toFixed(2)}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Txn Count:</span>
                    <span className="font-mono font-bold text-slate-200">{s.transactionsCount} Orders</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Bank UTR:</span>
                    <span className="font-mono text-teal-300 font-medium">{s.bankUtr}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Settled Date:</span>
                    <span className="text-slate-300">{s.settlementDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FAILED PAYMENT RECOVERY */}
      {/* ========================================================================= */}
      {activeTab === "recovery" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                Dropped Checkout Recovery Queue
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                  {failedRetries.length} Drops Detected
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Recover revenue from failed UPI sessions, card 3DS drops, or bank timeouts with 1-click WhatsApp payment links or Convert-to-COD.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {failedRetries.map(retry => {
              const isPending = retry.recoveryStatus === "Pending Link Send";
              const isSent = retry.recoveryStatus === "Link Sent";
              const isRecovered = retry.recoveryStatus === "Recovered";
              const isCod = retry.recoveryStatus === "Converted to COD";

              return (
                <div
                  key={retry.id}
                  className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-slate-400 font-bold">{retry.id}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{retry.customerName}</h4>
                      <p className="text-xs text-emerald-400 font-mono">{retry.customerPhone}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black text-white">₹{retry.cartAmount.toLocaleString("en-IN")}</div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                          isRecovered
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : isSent
                            ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                            : isCod
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {retry.recoveryStatus}
                      </span>
                    </div>
                  </div>

                  {/* Failure reason */}
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs">
                    <div className="font-semibold text-rose-300 flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Failure: {retry.failureReason}
                    </div>
                    <div className="font-mono text-[11px] text-rose-400/80">Code: {retry.errorCode}</div>
                  </div>

                  {/* Cart items */}
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-slate-400">Cart Contents: </span>
                    {retry.cartItems}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleConvertToCod(retry.id)}
                      disabled={isRecovered || isCod}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      Convert to COD
                    </button>

                    <button
                      onClick={() => {
                        setSelectedRecovery(retry);
                        setRecoveryModalOpen(true);
                      }}
                      disabled={isRecovered}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 disabled:opacity-40 transition-all hover:scale-105 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Recovery Link
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 360° TRANSACTION DETAIL DRAWER */}
      {/* ========================================================================= */}
      {drawerOpen && selectedTxn && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto shadow-2xl space-y-6 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  360° Transaction Inspector
                </div>
                <h2 className="text-xl font-black text-white mt-0.5">{selectedTxn.id}</h2>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Header Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Gross Amount</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedTxn.status === "Captured"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  }`}
                >
                  {selectedTxn.status}
                </span>
              </div>

              <div className="text-3xl font-black text-white">
                ₹{selectedTxn.grossAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>

              {/* Mathematical MDR Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Order Total:</span>
                  <span className="font-mono font-semibold text-white">₹{selectedTxn.grossAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Gateway Fee (MDR):</span>
                  <span className="font-mono text-rose-400">-₹{selectedTxn.gatewayFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>GST on MDR (18%):</span>
                  <span className="font-mono text-rose-400">-₹{selectedTxn.gstOnFee.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-emerald-400 text-sm">
                  <span>Net Bank Deposit:</span>
                  <span className="font-mono">₹{selectedTxn.netSettledAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Customer & Order Details */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer & Order Link</h4>
              <div className="flex items-center gap-3">
                <img
                  src={selectedTxn.customer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedTxn.customer.name)}`}
                  alt={selectedTxn.customer.name}
                  className="w-10 h-10 rounded-full border border-slate-700"
                />
                <div>
                  <div className="font-bold text-white text-sm">{selectedTxn.customer.name}</div>
                  <div className="text-xs text-slate-400">{selectedTxn.customer.email} • {selectedTxn.customer.phone}</div>
                  <div className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">Order ID: {selectedTxn.orderId}</div>
                </div>
              </div>
            </div>

            {/* Gateway & Bank Details */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Gateway & Bank Rails</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Acquiring Gateway:</span>
                  <p className="font-semibold text-white">{selectedTxn.gateway}</p>
                </div>
                <div>
                  <span className="text-slate-500">Payment Instrument:</span>
                  <p className="font-semibold text-white">{selectedTxn.method}</p>
                </div>
                <div>
                  <span className="text-slate-500">Bank Reference UTR:</span>
                  <p className="font-mono font-bold text-teal-300">{selectedTxn.bankUtr || "Pending Settlement"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Settlement Status:</span>
                  <p className="font-semibold text-emerald-400">{selectedTxn.settlementStatus}</p>
                </div>
              </div>
            </div>

            {/* JSON Metadata Payload */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Webhook Raw Metadata</h4>
              <pre className="text-[11px] font-mono text-slate-300 p-3 rounded-xl bg-slate-900 overflow-x-auto">
                {JSON.stringify(selectedTxn.paymentMetadata || {}, null, 2)}
              </pre>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setReceiptModalOpen(true);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>

              {selectedTxn.grossAmount > (selectedTxn.refundedAmount || 0) && (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    handleOpenRefund(selectedTxn);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Issue Refund
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ISSUE FULL / PARTIAL REFUND MODAL */}
      {/* ========================================================================= */}
      {refundModalOpen && selectedTxn && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Process Refund</h3>
                  <p className="text-xs text-slate-400">Txn: {selectedTxn.id} • Order: {selectedTxn.orderId}</p>
                </div>
              </div>

              <button
                onClick={() => setRefundModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Eligible Balance Indicator */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-between">
              <div>
                <div className="text-xs text-purple-300 font-medium">Eligible for Refund</div>
                <div className="text-2xl font-black text-white mt-0.5">
                  ₹{(selectedTxn.grossAmount - (selectedTxn.refundedAmount || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right text-xs text-purple-300/80">
                <div>Gross: ₹{selectedTxn.grossAmount.toFixed(2)}</div>
                {selectedTxn.refundedAmount > 0 && <div>Already Refunded: ₹{selectedTxn.refundedAmount.toFixed(2)}</div>}
              </div>
            </div>

            {/* Refund Type Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRefundType("full");
                  setRefundAmount(selectedTxn.grossAmount - (selectedTxn.refundedAmount || 0));
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  refundType === "full"
                    ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Full Refund (100%)
              </button>

              <button
                type="button"
                onClick={() => setRefundType("partial")}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  refundType === "partial"
                    ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Partial Custom Amount
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Refund Amount (₹)
              </label>
              <input
                type="number"
                value={refundAmount}
                disabled={refundType === "full"}
                max={selectedTxn.grossAmount - (selectedTxn.refundedAmount || 0)}
                min={1}
                onChange={e => setRefundAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold font-mono text-white focus:outline-none focus:border-purple-500 disabled:opacity-75"
              />
            </div>

            {/* Destination Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Refund Destination
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRefundDestination("gateway")}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    refundDestination === "gateway"
                      ? "bg-purple-600/20 border-purple-500 text-purple-300"
                      : "bg-slate-950/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="font-bold">Original Gateway</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{selectedTxn.gateway} (5-7 Days)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRefundDestination("wallet")}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    refundDestination === "wallet"
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                      : "bg-slate-950/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="font-bold text-emerald-300">Janani Store Wallet</div>
                  <div className="text-[10px] text-emerald-400/80 mt-0.5">Instant credit + 5% Bonus</div>
                </button>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Refund Reason</label>
              <select
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="Customer requested cancellation">Customer requested cancellation</option>
                <option value="Item out of stock / Partial delivery">Item out of stock / Partial delivery</option>
                <option value="Damaged or defective item received">Damaged or defective item received</option>
                <option value="Shipping delay compensation">Shipping delay compensation</option>
                <option value="Duplicate payment captured">Duplicate payment captured</option>
              </select>
            </div>

            {/* Submit / Cancel */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProcessRefund}
                disabled={refundSubmitting || refundAmount <= 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-900/40 disabled:opacity-50 cursor-pointer"
              >
                {refundSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                Confirm & Execute Refund (₹{refundAmount.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE PAYMENT RECEIPT MODAL */}
      {/* ========================================================================= */}
      {receiptModalOpen && selectedTxn && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white text-slate-900 p-8 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm">
                  JA
                </div>
                <div>
                  <h3 className="font-black text-lg text-emerald-950 tracking-tight">JANANI AGRO PRODUCTS</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Official Payment Voucher</p>
                </div>
              </div>

              <button
                onClick={() => setReceiptModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Billed To:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedTxn.customer.name}</p>
                  <p className="text-slate-600">{selectedTxn.customer.phone}</p>
                  <p className="text-slate-600">{selectedTxn.customer.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-medium">Receipt Details:</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedTxn.id}</p>
                  <p className="text-slate-600">Order: {selectedTxn.orderId}</p>
                  <p className="text-slate-600">{selectedTxn.createdAt}</p>
                </div>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Payment Gateway:</span>
                  <span className="font-semibold text-slate-900">{selectedTxn.gateway}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-slate-900">{selectedTxn.method}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Bank Reference UTR:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTxn.bankUtr || "UTR-VERIFIED-ONLINE"}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Payment Status:</span>
                  <span className="font-bold text-emerald-700 uppercase">{selectedTxn.status}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">Total Paid:</span>
                <span className="font-mono font-black text-xl text-emerald-800">
                  ₹{selectedTxn.grossAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-[11px] text-slate-400">GSTIN: 29AABCI9928P1Z8</span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEND RECOVERY LINK MODAL */}
      {/* ========================================================================= */}
      {recoveryModalOpen && selectedRecovery && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Send Payment Recovery Link</h3>
                  <p className="text-xs text-slate-400">{selectedRecovery.customerName} (₹{selectedRecovery.cartAmount})</p>
                </div>
              </div>

              <button
                onClick={() => setRecoveryModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Choose the preferred communication channel to dispatch an encrypted 1-click checkout recovery link:
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleSendRecovery("whatsapp")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/50 text-emerald-200 text-xs font-semibold transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Send via WhatsApp ({selectedRecovery.customerPhone})</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleSendRecovery("sms")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-blue-950/40 hover:bg-blue-900/40 border border-blue-800/50 text-blue-200 text-xs font-semibold transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Send via High-Priority SMS</span>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleSendRecovery("email")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Send via Email ({selectedRecovery.customerEmail})</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsManagement;
