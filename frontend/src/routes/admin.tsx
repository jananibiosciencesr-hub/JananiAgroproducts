import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  RefreshCw,
  KeyRound,
  Leaf,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import {
  AdminSidebar,
  type AdminTab
} from "@/components/admin/admin-sidebar";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AdminOverview } from "@/components/admin/admin-overview";
import { CategoriesManagement } from "@/components/admin/admin-categories";
import { ProductsManagement } from "@/components/admin/admin-products";
import { CustomersManagement } from "@/components/admin/admin-customers";
import { OrdersManagement } from "@/components/admin/admin-orders";
import { ShippingManagement } from "@/components/admin/admin-shipping";
import { PaymentsManagement } from "@/components/admin/admin-payments";
import { CouponsManagement } from "@/components/admin/admin-coupons";
import { ReferralsManagement } from "@/components/admin/admin-referrals";
import { ReviewsManagement } from "@/components/admin/admin-reviews";
import { CmsManagement } from "@/components/admin/admin-cms";
import { MarketingManagement } from "@/components/admin/admin-marketing";
import { ReportsManagement } from "@/components/admin/admin-reports";
import { SettingsManagement } from "@/components/admin/admin-settings";
import {
  OrdersView,
  InventoryView,
  CouponsView,
  ShippingView,
  ReturnsView,
  PaymentsView,
  CmsView,
  MarketingView,
  ReportsView,
  SettingsView,
  RolesView
} from "@/components/admin/admin-views";
import {
  AddProductModal,
  AddCouponModal,
  ShiprocketModal,
  RestockModal,
  InvoiceModal,
  GlobalSearchModal
} from "@/components/admin/admin-modals";
import {
  getAdminStats,
  getAdminCharts,
  getAdminWidgets,
  getAdminOrders,
  updateAdminOrderStatus,
  generateShiprocketAwb,
  getAdminProducts,
  createAdminProduct,
  deleteAdminProduct,
  getAdminCustomers,
  getAdminInventory,
  restockAdminInventory,
  getAdminCoupons,
  createAdminCoupon,
  toggleAdminCoupon,
  getAdminReviews,
  updateAdminReviewStatus,
  getAdminReturns,
  updateAdminReturnStatus,
  getAdminRoles,
  getAdminSettings,
  getCategories,
  sendAuthOtp,
  verifyAuthOtp
} from "@/lib/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Seller Admin Command Center — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Production E-Commerce Admin Dashboard with analytics, inventory, Shiprocket logistics and orders management." },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const adminSession = localStorage.getItem("janani_admin_session");
      if (adminSession === "true") return true;
      const authUser = localStorage.getItem("janani_auth_user");
      if (authUser) {
        try {
          const u = JSON.parse(authUser);
          if (
            u.role === "Super Admin" ||
            u.role === "Admin" ||
            (u.email && u.email.toLowerCase() === "jananibiosciences.r@gmail.com")
          ) {
            return true;
          }
        } catch (e) {}
      }
    }
    return false;
  });

  // Admin Login Portal Form State
  const [adminEmail, setAdminEmail] = useState("jananibiosciences.r@gmail.com");
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [receivedAdminOtp, setReceivedAdminOtp] = useState("123456");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Tab & UI Layout State
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Live Data States
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [widgets, setWidgets] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<any>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any>(null);
  const [selectedItemForRestock, setSelectedItemForRestock] = useState<any>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Countdown timer for OTP Resend
  useEffect(() => {
    let interval: any = null;
    if (isOtpStep && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, resendTimer]);

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      const cleaned = val.replace(/\D/g, "").slice(0, 6);
      if (cleaned) {
        const nextDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = cleaned[i] || "";
        }
        setOtpDigits(nextDigits);
        const nextFocus = Math.min(cleaned.length, 5);
        otpRefs.current[nextFocus]?.focus();
      }
      return;
    }

    const char = val.replace(/\D/g, "");
    const next = [...otpDigits];
    next[index] = char;
    setOtpDigits(next);
    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleAutoFillAdminOtp = (codeToFill?: string) => {
    const code = (codeToFill || receivedAdminOtp || "123456").trim().slice(0, 6);
    const digits = code.split("");
    while (digits.length < 6) digits.push("");
    setOtpDigits(digits);
    toast.success(`Admin verification code ${code} auto-filled!`);
    setTimeout(() => {
      otpRefs.current[5]?.focus();
    }, 100);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminEmail.trim()) {
      toast.error("Please enter your administrator email address.");
      return;
    }
    try {
      setSendingOtp(true);
      const res = await sendAuthOtp({ email: adminEmail.trim(), purpose: "admin_login" });
      if (res.success) {
        const otpCode = res.demoOtpCode || res.otp || "";
        setReceivedAdminOtp(otpCode);
        toast.success(res.message || `Admin verification code dispatched to ${adminEmail.trim()}. Please check your Gmail inbox!`, { duration: 6000 });
        setIsOtpStep(true);
        setResendTimer(60);
        setCanResend(false);
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } else {
        toast.error(res.message || "Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error sending OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    await handleSendOtp();
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpDigits.join("").trim();
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }
    try {
      setVerifyingOtp(true);
      const res = await verifyAuthOtp({ email: adminEmail.trim(), otp: code });
      if (res.success && res.user) {
        localStorage.setItem("janani_admin_session", "true");
        localStorage.setItem("janani_auth_token", res.token);
        localStorage.setItem("janani_auth_user", JSON.stringify(res.user));
        setIsAuthenticated(true);
        toast.success(res.message || "Welcome Super Admin! Access granted.");
        loadData();
      } else {
        toast.error(res.message || "Invalid or expired OTP code.");
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed. Please check the code.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("janani_admin_session");
    localStorage.removeItem("janani_auth_token");
    setIsAuthenticated(false);
    setIsOtpStep(false);
    setOtpDigits(["", "", "", "", "", ""]);
    toast.info("Logged out of Admin Command Center");
  };

  // Load all initial data from backend API
  const loadData = async () => {
    try {
      setLoading(true);
      const [
        statsData,
        chartsData,
        widgetsData,
        ordersData,
        productsData,
        categoriesData,
        customersData,
        inventoryData,
        couponsData,
        reviewsData,
        returnsData,
        rolesData,
        settingsData
      ] = await Promise.all([
        getAdminStats(),
        getAdminCharts(),
        getAdminWidgets(),
        getAdminOrders(),
        getAdminProducts(),
        getCategories(),
        getAdminCustomers(),
        getAdminInventory(),
        getAdminCoupons(),
        getAdminReviews(),
        getAdminReturns(),
        getAdminRoles(),
        getAdminSettings()
      ]);

      setStats(statsData);
      setCharts(chartsData);
      setWidgets(widgetsData);
      setOrders(ordersData.data || (Array.isArray(ordersData) ? ordersData : []));
      setProducts(productsData.data || (Array.isArray(productsData) ? productsData : []));
      setCategories(categoriesData);
      setCustomers(customersData.data || (Array.isArray(customersData) ? customersData : []));
      setInventory(inventoryData);
      setCoupons(couponsData.data || []);
      setReviews(reviewsData.data || (Array.isArray(reviewsData) ? reviewsData : []));
      setReturns(returnsData);
      setRoles(rolesData);
      setSettings(settingsData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Handlers with Optimistic Updates & Toasts
  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, orderStatus: newStatus } : o))
    );
    await updateAdminOrderStatus(id, { orderStatus: newStatus });
    toast.success(`Order ${id} updated to ${newStatus}`);
  };

  const handleGenerateShiprocketAwb = async (orderId: string, courierPartner: string) => {
    const res = await generateShiprocketAwb(orderId, courierPartner);
    if (res?.success) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, orderStatus: "Shipped", trackingId: res.data.awbCode, courier: res.data.courier }
            : o
        )
      );
      toast.success(`Shiprocket AWB ${res.data.awbCode} generated for ${orderId}`);
    }
  };

  const handleAddProduct = async (productData: any) => {
    const res = await createAdminProduct(productData);
    if (res?.success && res.data) {
      setProducts((prev) => [res.data, ...prev]);
      toast.success(`Product "${productData.name}" created successfully`);
    }
  };

  const handleDeleteProduct = async (id: any) => {
    await deleteAdminProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Product removed from store");
  };

  const handleRestock = async (id: any, qty: number) => {
    await restockAdminInventory(id, qty);
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: (item.stock || 0) + qty } : item))
    );
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: (item.stock || 0) + qty } : item))
    );
    toast.success(`Added ${qty} units to inventory`);
  };

  const handleAddCoupon = async (couponData: any) => {
    const res = await createAdminCoupon(couponData);
    if (res?.success && res.data) {
      setCoupons((prev) => [res.data, ...prev]);
      toast.success(`Coupon ${couponData.code} created`);
    }
  };

  const handleToggleCoupon = async (id: string) => {
    const res = await toggleAdminCoupon(id);
    if (res?.success && res.data) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: res.data.active } : c))
      );
      toast.success(`Coupon status updated`);
    }
  };

  const handleUpdateReview = async (id: string, status: string) => {
    await updateAdminReviewStatus(id, status);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    toast.success(`Review status set to ${status}`);
  };

  const handleUpdateReturn = async (id: string, status: string) => {
    await updateAdminReturnStatus(id, status);
    setReturns((prev) =>
      prev.map((ret) => (ret.id === id ? { ...ret, status } : ret))
    );
    toast.success(`Return request updated to ${status}`);
  };

  const handleExportCSV = () => {
    const headers = ["Order ID", "Customer", "Amount", "Status", "Date"];
    const rows = orders.map((o) => [o.id, `"${o.customer?.name}"`, o.total, o.orderStatus, `"${o.date}"`]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Janani_Agro_Report_${Date.now()}.csv`;
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#06140b] text-white flex flex-col justify-between relative overflow-hidden font-sans">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-0 w-[550px] h-[450px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

        {/* Top Navbar */}
        <header className="relative z-10 border-b border-emerald-500/10 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-black/20">
          <a href="/" className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
              <Leaf className="size-5 text-amber-300" />
            </div>
            <div>
              <div className="font-display font-bold text-base tracking-wide text-white flex items-center gap-1.5">
                JANANI AGRO <Sparkles className="size-3.5 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
                Store Administrator Portal
              </span>
            </div>
          </a>
          <a
            href="/"
            className="text-xs font-semibold text-emerald-300/80 hover:text-emerald-300 flex items-center gap-1.5 transition"
          >
            <span>Back to Storefront</span>
            <ExternalLink className="size-3.5" />
          </a>
        </header>

        {/* Center Card */}
        <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/25 bg-[#0b1b11]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
            {/* Security Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-[11px] font-bold text-amber-300 mb-4">
              <ShieldAlert className="size-3.5" />
              RESTRICTED ADMIN ACCESS · 2FA REQUIRED
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Admin Command Center
            </h1>
            <p className="mt-1.5 text-xs text-emerald-100/70 leading-relaxed">
              Sign in with your registered administrator Gmail to receive a real-time 6-digit OTP code dispatched via Google SMTP.
            </p>

            {!isOtpStep ? (
              /* STEP 1: ADMIN EMAIL INPUT */
              <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-emerald-200/90 flex items-center justify-between">
                    <span>Admin Gmail Address</span>
                    <span className="text-[10px] text-amber-400/90 font-mono font-semibold">Real Google SMTP</span>
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-emerald-500/30 bg-black/40 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20">
                    <Mail className="ml-3.5 size-4 text-emerald-400/70 shrink-0" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="jananibiosciences.r@gmail.com"
                      className="h-12 w-full rounded-r-2xl bg-transparent px-3 text-xs sm:text-sm text-white placeholder:text-muted-foreground outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Fast One-Click Super Admin Select */}
                <button
                  type="button"
                  onClick={() => setAdminEmail("jananibiosciences.r@gmail.com")}
                  className="w-full text-left p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/15 transition text-[11px] flex items-center justify-between text-emerald-200 group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-white block">Root Admin Account</span>
                      <span className="text-emerald-300/80 font-mono text-[10px]">jananibiosciences.r@gmail.com</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 uppercase tracking-wide shrink-0">
                    Pre-set
                  </span>
                </button>

                <button
                  type="submit"
                  disabled={sendingOtp || !adminEmail.trim()}
                  className="w-full h-12 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer mt-3"
                >
                  {sendingOtp ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Sending Real OTP via Gmail...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit OTP Code</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: 6-DIGIT OTP VERIFICATION */
              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
                <div className="p-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/60 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="text-[11px] text-emerald-400/70 block">OTP Dispatched to:</span>
                    <span className="font-semibold text-white truncate block font-mono">{adminEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpStep(false);
                      setOtpDigits(["", "", "", "", "", ""]);
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:underline shrink-0"
                  >
                    Change Email
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-emerald-200/90">
                      Enter 6-Digit Verification Code
                    </label>
                    <span className="text-[11px] text-emerald-400/80">
                      Sent to {adminEmail}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="size-11 sm:size-12 rounded-xl border border-emerald-500/40 bg-black/50 text-center font-mono text-lg font-bold text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                      />
                    ))}
                  </div>
                </div>

                {/* Secure Security Info */}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-200/80">
                  <ShieldCheck className="size-4 text-amber-400 shrink-0" />
                  <span>
                    A secure 6-digit authentication token has been dispatched to <strong className="text-white">{adminEmail}</strong>. Please check your Gmail.
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-emerald-200/60">Check Spam or Inbox</span>
                  <button
                    type="button"
                    disabled={!canResend || sendingOtp}
                    onClick={handleResendOtp}
                    className="font-semibold text-amber-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                  >
                    {canResend ? "Resend OTP Code" : `Resend in ${resendTimer}s`}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={verifyingOtp || otpDigits.join("").length !== 6}
                  className="w-full h-12 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {verifyingOtp ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="size-4" />
                      <span>Verify & Enter Command Center</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Security Badges Footer */}
            <div className="mt-6 border-t border-emerald-500/15 pt-4 flex items-center justify-between text-[10px] text-emerald-400/60 font-mono">
              <span className="flex items-center gap-1">
                <Lock className="size-3" /> SSL TLS 1.3
              </span>
              <span>Google SMTP 2FA</span>
              <span>Hostinger Production</span>
            </div>
          </div>
        </main>

        {/* Bottom Footer */}
        <footer className="relative z-10 py-4 text-center text-[11px] text-emerald-400/40 border-t border-emerald-500/10">
          © 2026 JANANI AGRO PRODUCTS · Internal Administrator Command Center
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/20 text-foreground font-sans antialiased">
      {/* Collapsible Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={handleLogout}
        badgeCounts={{
          orders: orders.filter((o) => o.orderStatus === "Pending" || o.orderStatus === "Processing").length || 9,
          inventory: inventory.filter((i) => (i.stock ?? 45) < 20).length || 4,
          returns: returns.filter((r) => r.status === "Under Review").length || 3,
          reviews: reviews.filter((r) => r.status === "Pending").length || 1,
        }}
      />

      {/* Main Content Area */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        {/* Top Navbar */}
        <AdminNavbar
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          onNavigateTab={setActiveTab}
          onLogout={handleLogout}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <AdminOverview
              stats={stats}
              charts={charts}
              widgets={widgets}
              orders={orders}
              onNavigateTab={setActiveTab}
              onOpenShiprocketModal={setSelectedOrderForShipping}
              onOpenRestockModal={setSelectedItemForRestock}
              onOpenInvoiceModal={setSelectedOrderForInvoice}
            />
          )}

          {activeTab === "categories" && <CategoriesManagement />}

          {activeTab === "products" && <ProductsManagement />}

          {activeTab === "orders" && <OrdersManagement />}

          {activeTab === "customers" && <CustomersManagement />}

          {activeTab === "inventory" && (
            <InventoryView
              inventory={inventory}
              onOpenRestockModal={setSelectedItemForRestock}
            />
          )}

          {activeTab === "payments" && <PaymentsManagement />}

          {activeTab === "coupons" && <CouponsManagement />}

          {activeTab === "referrals" && <ReferralsManagement />}

          {activeTab === "shipping" && <ShippingManagement />}

          {activeTab === "reviews" && <ReviewsManagement />}

          {activeTab === "returns" && (
            <ReturnsView
              returns={returns}
              onUpdateReturn={handleUpdateReturn}
            />
          )}

          {activeTab === "cms" && <CmsManagement />}

          {activeTab === "marketing" && <MarketingManagement />}

          {activeTab === "reports" && <ReportsManagement />}

          {activeTab === "settings" && <SettingsManagement defaultTab="store_branding" />}

          {activeTab === "roles" && <SettingsManagement defaultTab="roles_permissions" />}
        </main>
      </div>

      {/* Interactive Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSubmit={handleAddProduct}
      />

      <AddCouponModal
        isOpen={isAddCouponOpen}
        onClose={() => setIsAddCouponOpen(false)}
        onSubmit={handleAddCoupon}
      />

      <ShiprocketModal
        order={selectedOrderForShipping}
        isOpen={!!selectedOrderForShipping}
        onClose={() => setSelectedOrderForShipping(null)}
        onGenerateAwb={handleGenerateShiprocketAwb}
      />

      <RestockModal
        item={selectedItemForRestock}
        isOpen={!!selectedItemForRestock}
        onClose={() => setSelectedItemForRestock(null)}
        onRestock={handleRestock}
      />

      <InvoiceModal
        order={selectedOrderForInvoice}
        isOpen={!!selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
      />

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigateTab={setActiveTab}
      />
    </div>
  );
}
