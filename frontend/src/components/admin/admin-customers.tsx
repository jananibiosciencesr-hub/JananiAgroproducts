import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Eye,
  CreditCard,
  Ban,
  CheckCircle2,
  Trash2,
  ShoppingBag,
  Heart,
  ShoppingCart,
  MapPin,
  Wallet,
  Gift,
  Ticket,
  Award,
  ArrowUpRight,
  ArrowDownLeft,
  Phone,
  Mail,
  Calendar,
  Clock,
  ShieldAlert,
  ChevronRight,
  X,
  ExternalLink,
  Sparkles,
  TrendingUp,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminCustomers,
  getAdminCustomerById,
  createAdminCustomer,
  updateAdminCustomer,
  toggleCustomerStatus,
  adjustCustomerWallet,
  deleteAdminCustomer,
  type CustomerQueryParams
} from "@/lib/api";

export function CustomersManagement() {
  // Data States
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    activeCount: 0,
    suspendedCount: 0,
    inactiveCount: 0,
    totalLtv: 0,
    totalWallet: 0,
    totalLoyalty: 0,
  });

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [sortBy, setSortBy] = useState("spent_desc");

  // Drawers & Modals
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"overview" | "orders" | "wishlist" | "cart" | "addresses" | "wallet" | "referrals">("overview");

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletTargetCustomer, setWalletTargetCustomer] = useState<any | null>(null);

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendTargetCustomer, setSuspendTargetCustomer] = useState<any | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetCustomer, setDeleteTargetCustomer] = useState<any | null>(null);

  // Load Customers
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await getAdminCustomers({
        status: statusFilter,
        tier: tierFilter,
        search,
        sortBy,
      });

      if (res) {
        setCustomers(res.data || []);
        setStats({
          total: res.total || 0,
          activeCount: res.activeCount || 0,
          suspendedCount: res.suspendedCount || 0,
          inactiveCount: res.inactiveCount || 0,
          totalLtv: res.totalLtv || 0,
          totalWallet: res.totalWallet || 0,
          totalLoyalty: res.totalLoyalty || 0,
        });

        // If drawer is open, refresh selected customer data
        if (selectedCustomerId) {
          const updated = res.data.find((c: any) => c.id === selectedCustomerId);
          if (updated) setSelectedCustomer(updated);
        }
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
      toast.error("Failed to fetch customers list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [statusFilter, tierFilter, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Open 360 Drawer
  const handleOpenProfile = async (customer: any) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomer(customer);
    setIsDrawerOpen(true);
    setActiveDrawerTab("overview");

    try {
      const full = await getAdminCustomerById(customer.id);
      if (full) setSelectedCustomer(full);
    } catch (e) {
      console.error("Failed to load detailed customer:", e);
    }
  };

  // Status Toggle
  const handleToggleStatus = async (customer: any) => {
    if (customer.status === "Active") {
      setSuspendTargetCustomer(customer);
      setSuspensionReason("");
      setIsSuspendModalOpen(true);
    } else {
      try {
        const res = await toggleCustomerStatus(customer.id, "Active");
        if (res?.success) {
          toast.success(`${customer.name}'s account is now Active`);
          loadCustomers();
        }
      } catch (err) {
        toast.error("Failed to activate user");
      }
    }
  };

  const confirmSuspension = async () => {
    if (!suspendTargetCustomer) return;
    try {
      const res = await toggleCustomerStatus(suspendTargetCustomer.id, "Suspended", suspensionReason || "Administrative hold");
      if (res?.success) {
        toast.warning(`${suspendTargetCustomer.name}'s account has been Suspended`);
        setIsSuspendModalOpen(false);
        setSuspendTargetCustomer(null);
        loadCustomers();
      }
    } catch (err) {
      toast.error("Failed to suspend user");
    }
  };

  // Delete Customer
  const confirmDelete = async () => {
    if (!deleteTargetCustomer) return;
    try {
      const res = await deleteAdminCustomer(deleteTargetCustomer.id);
      if (res?.success) {
        toast.success(res.message || "Customer deleted");
        setIsDeleteModalOpen(false);
        if (selectedCustomerId === deleteTargetCustomer.id) {
          setIsDrawerOpen(false);
        }
        setDeleteTargetCustomer(null);
        loadCustomers();
      }
    } catch (err) {
      toast.error("Failed to delete customer");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (customers.length === 0) {
      toast.error("No customer records to export");
      return;
    }

    const headers = ["Customer ID", "Full Name", "Email", "Phone", "City", "State", "Tier", "Status", "Total Spent (INR)", "Orders Count", "Avg Order Value (INR)", "Wallet Balance (INR)", "Loyalty Points", "Join Date"];
    const rows = customers.map(c => [
      c.id,
      `"${c.name}"`,
      c.email,
      `"${c.phone}"`,
      `"${c.city || ''}"`,
      `"${c.state || ''}"`,
      c.tier,
      c.status,
      c.totalSpent || 0,
      c.totalOrders || 0,
      c.avgOrderValue || 0,
      c.walletBalance || 0,
      c.loyaltyPoints || 0,
      c.joinDate
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `janani_customers_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${customers.length} customer records to CSV`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
              <Users className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Customer Database</h1>
              <p className="text-xs text-muted-foreground">360° patron profiles, order timelines, wallet credits, loyalty points & CRM</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all shadow-xs"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition-all"
          >
            <Plus className="size-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Patrons</span>
            <Users className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{stats.total}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{stats.activeCount} Active accounts</span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lifetime LTV</span>
            <DollarSign className="size-4 text-teal-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">₹{stats.totalLtv.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-muted-foreground">Across total orders</span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Wallet Balance</span>
            <Wallet className="size-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">₹{stats.totalWallet.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Store credits in reserve</span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Loyalty Points</span>
            <Award className="size-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{stats.totalLoyalty.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-purple-600 font-semibold">🪙 Reward coins issued</span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Suspended</span>
            <ShieldAlert className="size-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{stats.suspendedCount}</p>
          <span className="text-[10px] text-rose-500 font-semibold">{stats.inactiveCount} Inactive accounts</span>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          {[
            { id: "all", label: "All Patrons", count: stats.total },
            { id: "Active", label: "Active", count: stats.activeCount },
            { id: "Suspended", label: "Suspended", count: stats.suspendedCount },
            { id: "Inactive", label: "Inactive", count: stats.inactiveCount }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === t.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{t.label}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                statusFilter === t.id ? "bg-white/20 text-white" : "bg-border text-muted-foreground"
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, email, city..."
              className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs outline-none focus:border-emerald-600 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus:border-emerald-600"
          >
            <option value="all">All Tiers</option>
            <option value="VIP Patron">👑 VIP Patron</option>
            <option value="Platinum Gold">⭐ Platinum Gold</option>
            <option value="Gold Member">🥇 Gold Member</option>
            <option value="Silver">🥈 Silver</option>
            <option value="Bronze">🥉 Bronze</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus:border-emerald-600"
          >
            <option value="spent_desc">Sort: Highest LTV (Spent)</option>
            <option value="orders_desc">Sort: Most Orders</option>
            <option value="wallet_desc">Sort: Highest Wallet</option>
            <option value="newest">Sort: Newest Joined</option>
          </select>
        </div>
      </div>

      {/* 4. Customers Table */}
      <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3.5 pl-6 pr-3">Patron Details</th>
                <th className="px-3 py-3.5">Location</th>
                <th className="px-3 py-3.5">Tier & Rewards</th>
                <th className="px-3 py-3.5">Wallet Balance</th>
                <th className="px-3 py-3.5">Lifetime Spend</th>
                <th className="px-3 py-3.5">Account Status</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="inline-flex items-center gap-2 text-xs font-medium">
                      <div className="size-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                      <span>Loading customer directory...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                      <Users className="size-6" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">No customers found</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Try adjusting your search criteria or filter tags.
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const isVip = c.tier === "VIP Patron";
                  const isPlatinum = c.tier === "Platinum Gold";
                  const isGold = c.tier === "Gold Member";

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => handleOpenProfile(c)}
                    >
                      {/* Patron Info */}
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}`}
                            alt={c.name}
                            className="size-11 rounded-2xl object-cover ring-2 ring-border/80 shadow-xs group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground hover:text-emerald-600 transition-colors">
                                {c.name}
                              </span>
                              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
                                {c.id}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Mail className="size-3 text-muted-foreground/80" /> {c.email}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="size-3 text-muted-foreground/80" /> {c.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-3 py-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground text-xs">{c.city || "India"}</p>
                            <p className="text-[10px] text-muted-foreground">{c.state || "Karnataka"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Tier & Loyalty */}
                      <td className="px-3 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold shadow-xs ${
                              isVip
                                ? "bg-gradient-to-r from-purple-900 to-indigo-900 text-purple-200 border border-purple-500/30"
                                : isPlatinum
                                ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white"
                                : isGold
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isVip && "👑"} {isPlatinum && "⭐"} {isGold && "🥇"} {c.tier || "Silver"}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-foreground">
                            <span className="text-amber-500">🪙</span>
                            <span>{(c.loyaltyPoints || 0).toLocaleString()} pts</span>
                          </div>
                        </div>
                      </td>

                      {/* Wallet Balance */}
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2">
                          <div className="rounded-xl bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                            ₹{(c.walletBalance || 0).toLocaleString('en-IN')}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setWalletTargetCustomer(c);
                              setIsWalletModalOpen(true);
                            }}
                            title="Adjust wallet balance"
                            className="size-7 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:border-emerald-600 transition-colors shadow-2xs"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Spend & Orders */}
                      <td className="px-3 py-4">
                        <div>
                          <p className="font-extrabold text-foreground text-sm">
                            ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {c.totalOrders || 0} orders • avg ₹{(c.avgOrderValue || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </td>

                      {/* Account Status */}
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            c.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                              : c.status === "Suspended"
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              c.status === "Active" ? "bg-emerald-500" : c.status === "Suspended" ? "bg-rose-500" : "bg-muted-foreground"
                            }`}
                          />
                          <span>{c.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-3 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenProfile(c)}
                            title="View 360° Profile"
                            className="size-8 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:border-emerald-600 transition-colors shadow-2xs"
                          >
                            <Eye className="size-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(c)}
                            title={c.status === "Active" ? "Suspend user" : "Activate user"}
                            className={`size-8 rounded-xl border border-border bg-card flex items-center justify-center transition-colors shadow-2xs ${
                              c.status === "Active"
                                ? "text-muted-foreground hover:text-rose-600 hover:border-rose-500"
                                : "text-emerald-600 border-emerald-500/40 hover:bg-emerald-50"
                            }`}
                          >
                            {c.status === "Active" ? <Ban className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                          </button>

                          <button
                            onClick={() => {
                              setDeleteTargetCustomer(c);
                              setIsDeleteModalOpen(true);
                            }}
                            title="Delete customer record"
                            className="size-8 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:border-rose-500 transition-colors shadow-2xs"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Customer Profile 360° Drawer */}
      {isDrawerOpen && selectedCustomer && (
        <CustomerProfileDrawer
          customer={selectedCustomer}
          activeTab={activeDrawerTab}
          setActiveTab={setActiveDrawerTab}
          onClose={() => setIsDrawerOpen(false)}
          onOpenWalletModal={() => {
            setWalletTargetCustomer(selectedCustomer);
            setIsWalletModalOpen(true);
          }}
          onToggleStatus={() => handleToggleStatus(selectedCustomer)}
          onDeleteCustomer={() => {
            setDeleteTargetCustomer(selectedCustomer);
            setIsDeleteModalOpen(true);
          }}
          onRefresh={loadCustomers}
        />
      )}

      {/* 6. Add Customer Modal */}
      {isAddCustomerOpen && (
        <AddCustomerModal
          isOpen={isAddCustomerOpen}
          onClose={() => setIsAddCustomerOpen(false)}
          onSuccess={() => {
            setIsAddCustomerOpen(false);
            loadCustomers();
          }}
        />
      )}

      {/* 7. Wallet Adjustment Modal */}
      {isWalletModalOpen && walletTargetCustomer && (
        <WalletAdjustmentModal
          customer={walletTargetCustomer}
          isOpen={isWalletModalOpen}
          onClose={() => {
            setIsWalletModalOpen(false);
            setWalletTargetCustomer(null);
          }}
          onSuccess={() => {
            setIsWalletModalOpen(false);
            setWalletTargetCustomer(null);
            loadCustomers();
          }}
        />
      )}

      {/* 8. Suspend Customer Confirmation Modal */}
      {isSuspendModalOpen && suspendTargetCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="size-11 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <Ban className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Suspend Customer Account</h3>
                <p className="text-xs text-muted-foreground">{suspendTargetCustomer.name} ({suspendTargetCustomer.email})</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Suspending this patron will immediately block checkout access, disable coupon redemptions, and freeze their wallet balance.
            </p>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Reason for Suspension</label>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="e.g. Suspected return fraud, payment chargeback dispute, policy violation..."
                rows={3}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsSuspendModalOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={confirmSuspension}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Delete Customer Confirmation Modal */}
      {isDeleteModalOpen && deleteTargetCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="size-11 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Delete Customer Account</h3>
                <p className="text-xs text-muted-foreground">{deleteTargetCustomer.name}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete this customer record? All associated profile data, saved addresses, and reward logs will be purged.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 🌟 360° CUSTOMER PROFILE DRAWER
// ==========================================

function CustomerProfileDrawer({
  customer,
  activeTab,
  setActiveTab,
  onClose,
  onOpenWalletModal,
  onToggleStatus,
  onDeleteCustomer,
  onRefresh
}: {
  customer: any;
  activeTab: "overview" | "orders" | "wishlist" | "cart" | "addresses" | "wallet" | "referrals";
  setActiveTab: (t: any) => void;
  onClose: () => void;
  onOpenWalletModal: () => void;
  onToggleStatus: () => void;
  onDeleteCustomer: () => void;
  onRefresh: () => void;
}) {
  const isVip = customer.tier === "VIP Patron";
  const isPlatinum = customer.tier === "Platinum Gold";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-border bg-muted/20 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <img
              src={customer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customer.name)}`}
              alt={customer.name}
              className="size-16 rounded-3xl object-cover ring-4 ring-background shadow-md"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black text-foreground">{customer.name}</h2>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground font-bold">
                  {customer.id}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    customer.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${customer.status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                  {customer.status}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="size-3.5 text-muted-foreground/80" /> {customer.email}</span>
                <span className="flex items-center gap-1"><Phone className="size-3.5 text-muted-foreground/80" /> {customer.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="size-3.5 text-emerald-600" /> {customer.city}, {customer.state}</span>
              </div>

              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
                  isVip
                    ? "bg-purple-900 text-purple-200 border border-purple-500/30"
                    : isPlatinum
                    ? "bg-amber-600 text-white"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                }`}>
                  {isVip ? "👑 VIP Patron" : isPlatinum ? "⭐ Platinum Gold" : "🥇 Gold Member"}
                </span>

                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 text-[11px] font-extrabold">
                  <Wallet className="size-3 text-emerald-600" /> ₹{(customer.walletBalance || 0).toLocaleString('en-IN')}
                </span>

                <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 px-2.5 py-0.5 text-[11px] font-extrabold">
                  🪙 {(customer.loyaltyPoints || 0).toLocaleString()} Points
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="size-8 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Drawer Tabs Bar */}
        <div className="flex border-b border-border bg-muted/10 px-6 gap-2 overflow-x-auto text-xs font-bold no-scrollbar">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "orders", label: `Orders (${customer.orderHistory?.length || 0})`, icon: ShoppingBag },
            { id: "wishlist", label: `Wishlist (${customer.wishlist?.length || 0})`, icon: Heart },
            { id: "cart", label: `Cart (${customer.cart?.length || 0})`, icon: ShoppingCart },
            { id: "addresses", label: `Addresses (${customer.addresses?.length || 0})`, icon: MapPin },
            { id: "wallet", label: "Wallet & Ledger", icon: Wallet },
            { id: "referrals", label: "Referrals & Coupons", icon: Gift }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3.5 px-3 border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Suspension Banner */}
              {customer.status === "Suspended" && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-400 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="size-4" />
                    <span>This Customer Account is Suspended</span>
                  </div>
                  <p className="text-[11px] leading-relaxed pl-6">
                    Reason: {customer.suspensionReason || "Administrative hold"}. The patron cannot place new orders or redeem store credits.
                  </p>
                </div>
              )}

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Total Spent</span>
                  <p className="mt-1 text-xl font-black text-foreground">₹{(customer.totalSpent || 0).toLocaleString('en-IN')}</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">Lifetime LTV</span>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Orders Count</span>
                  <p className="mt-1 text-xl font-black text-foreground">{customer.totalOrders || 0}</p>
                  <span className="text-[10px] text-muted-foreground">Completed</span>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Average Order</span>
                  <p className="mt-1 text-xl font-black text-foreground">₹{(customer.avgOrderValue || 0).toLocaleString('en-IN')}</p>
                  <span className="text-[10px] text-teal-600 font-semibold">AOV</span>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Patron Since</span>
                  <p className="mt-1 text-sm font-black text-foreground">{customer.joinDate || "2025"}</p>
                  <span className="text-[10px] text-muted-foreground">Last active: {customer.lastActive || "Recently"}</span>
                </div>
              </div>

              {/* Loyalty Progression Tier */}
              <div className="rounded-3xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-purple-600" />
                    <h3 className="text-xs font-bold text-foreground">Loyalty Rewards Status ({customer.tier})</h3>
                  </div>
                  <span className="text-xs font-extrabold text-purple-600">{(customer.loyaltyPoints || 0).toLocaleString()} Coins Available</span>
                </div>

                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full w-[75%]" />
                </div>

                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Silver (0 pts)</span>
                  <span>Gold Member (1,000 pts)</span>
                  <span>Platinum (2,500 pts)</span>
                  <span className="font-bold text-purple-600">VIP Patron (5,000 pts)</span>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="rounded-3xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-xs font-bold text-foreground">Administrative Controls</h3>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={onOpenWalletModal}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted"
                  >
                    <Wallet className="size-3.5 text-emerald-600" />
                    <span>Add Wallet Credit / Debit</span>
                  </button>

                  <button
                    onClick={onToggleStatus}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold ${
                      customer.status === "Active"
                        ? "border-rose-500/40 text-rose-600 hover:bg-rose-50"
                        : "border-emerald-500/40 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {customer.status === "Active" ? <Ban className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                    <span>{customer.status === "Active" ? "Suspend Patron" : "Reactivate Account"}</span>
                  </button>

                  <button
                    onClick={onDeleteCustomer}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === "orders" && (
            <div className="space-y-3.5 animate-in fade-in">
              {(!customer.orderHistory || customer.orderHistory.length === 0) ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  <ShoppingBag className="size-8 mx-auto text-muted-foreground/60 mb-2" />
                  <p>No orders recorded for this customer yet.</p>
                </div>
              ) : (
                customer.orderHistory.map((ord: any) => (
                  <div key={ord.id} className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground text-xs">{ord.id}</span>
                        <span className="text-[10px] text-muted-foreground">• {ord.date}</span>
                      </div>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        ord.orderStatus === "Delivered"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : ord.orderStatus === "Shipped"
                          ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                          : ord.orderStatus === "Cancelled"
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </div>

                    <p className="text-xs text-foreground font-medium">{ord.itemsSummary || `${ord.itemsCount || 1} organic items`}</p>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                        <span>💳 {ord.paymentMethod}</span>
                        <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-bold">{ord.paymentStatus}</span>
                      </div>
                      <div className="font-black text-foreground">
                        ₹{(ord.total || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === "wishlist" && (
            <div className="space-y-3 animate-in fade-in">
              {(!customer.wishlist || customer.wishlist.length === 0) ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  <Heart className="size-8 mx-auto text-muted-foreground/60 mb-2" />
                  <p>Customer has not saved any products to wishlist.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customer.wishlist.map((item: any) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3 shadow-xs">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80"}
                        alt={item.name}
                        className="size-14 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground text-xs truncate">{item.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{item.unit || "1 unit"}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-extrabold text-foreground text-xs">₹{item.price}</span>
                          {item.originalPrice && (
                            <span className="text-[10px] text-muted-foreground line-through">₹{item.originalPrice}</span>
                          )}
                          <span className="rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[9px] px-1.5 font-bold">
                            In Stock
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACTIVE CART */}
          {activeTab === "cart" && (
            <div className="space-y-4 animate-in fade-in">
              {(!customer.cart || customer.cart.length === 0) ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  <ShoppingCart className="size-8 mx-auto text-muted-foreground/60 mb-2" />
                  <p>Shopping cart is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                    <h4 className="text-xs font-bold text-foreground">Items Currently in Cart</h4>
                    {customer.cart.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={c.image} alt={c.name} className="size-10 rounded-xl object-cover" />
                          <div>
                            <p className="font-bold text-foreground">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground">Qty: {c.qty} • {c.unit}</p>
                          </div>
                        </div>
                        <div className="font-black text-foreground">
                          ₹{(c.price * c.qty).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => toast.success(`Sent cart recovery WhatsApp notification to ${customer.phone}`)}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                  >
                    💬 Send Abandoned Cart Reminder (WhatsApp & SMS)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ADDRESS BOOK */}
          {activeTab === "addresses" && (
            <div className="space-y-3 animate-in fade-in">
              {(!customer.addresses || customer.addresses.length === 0) ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  <MapPin className="size-8 mx-auto text-muted-foreground/60 mb-2" />
                  <p>No saved addresses.</p>
                </div>
              ) : (
                customer.addresses.map((addr: any) => (
                  <div key={addr.id} className="rounded-2xl border border-border bg-card p-4 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">{addr.label || "Delivery Address"}</span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[9px] px-2 py-0.5 font-bold">
                          Default Shipping
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground font-medium">{addr.street}</p>
                    <p className="text-xs text-muted-foreground">{addr.city}, {addr.state} — {addr.pincode}</p>
                    <p className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1">
                      <Phone className="size-3 text-muted-foreground/80" /> {addr.phone || customer.phone}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: WALLET & LEDGER */}
          {activeTab === "wallet" && (
            <div className="space-y-4 animate-in fade-in">
              {/* Wallet Card */}
              <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/80 to-teal-950/80 p-5 text-white shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">Live Janani Wallet</span>
                  <p className="text-3xl font-black mt-1">₹{(customer.walletBalance || 0).toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-emerald-200/80 mt-1">Available store credit for organic pantry orders</p>
                </div>

                <button
                  onClick={onOpenWalletModal}
                  className="rounded-xl bg-white text-emerald-950 font-bold text-xs px-4 py-2.5 hover:bg-emerald-50 shadow-md transition-all"
                >
                  Adjust Balance
                </button>
              </div>

              {/* Transactions Ledger */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <h4 className="text-xs font-bold text-foreground">Transaction Audit Ledger</h4>
                {(!customer.walletTransactions || customer.walletTransactions.length === 0) ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No wallet activity recorded yet.</p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {customer.walletTransactions.map((tx: any) => (
                      <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className={`size-8 rounded-xl flex items-center justify-center ${
                            tx.type === "credit" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                          }`}>
                            {tx.type === "credit" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{tx.description}</p>
                            <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`font-black text-xs ${tx.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                            {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Bal: ₹{tx.balanceAfter}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: REFERRALS & COUPONS */}
          {activeTab === "referrals" && (
            <div className="space-y-4 animate-in fade-in">
              {/* Referral Banner */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="size-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-foreground">Referral Program Code</h4>
                  </div>
                  <span className="font-mono text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                    {customer.referrals?.code || "JANANI-REF-01"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-border/40">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Total Friends Joined</span>
                    <p className="text-base font-extrabold text-foreground mt-0.5">{customer.referrals?.count || 0} friends</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Referral Wallet Earned</span>
                    <p className="text-base font-extrabold text-emerald-600 mt-0.5">₹{(customer.referrals?.totalEarned || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Coupon Redemption History */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Ticket className="size-4 text-purple-600" />
                  <h4 className="text-xs font-bold text-foreground">Coupons Redeemed</h4>
                </div>

                {(!customer.couponsUsed || customer.couponsUsed.length === 0) ? (
                  <p className="text-xs text-muted-foreground py-3 text-center">No coupons redeemed yet.</p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {customer.couponsUsed.map((cpn: any, idx: number) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-foreground font-mono bg-purple-500/10 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
                            {cpn.code}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-2">Order {cpn.orderId} • {cpn.date}</span>
                        </div>
                        <span className="font-extrabold text-emerald-600">Saved ₹{cpn.discount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ==========================================
// ➕ ADD CUSTOMER MODAL
// ==========================================

function AddCustomerModal({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    street: "12/A Green Park",
    tier: "Silver",
    initialWallet: 0,
    initialLoyalty: 100,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in Name, Email and Phone");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createAdminCustomer(formData);
      if (res?.success) {
        toast.success(`Customer ${formData.name} created successfully!`);
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Add New Customer</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-foreground">Full Name *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Radhika Sharma"
              className="h-9 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground">Email Address *</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="radhika@gmail.com"
                className="h-9 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-foreground">Phone Number *</label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98451 12345"
                className="h-9 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-foreground">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-foreground">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground">Street Address</label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="h-9 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/60">
            <div className="space-y-1">
              <label className="font-bold text-foreground">Membership Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="h-9 w-full rounded-xl border border-border bg-background px-2 text-xs font-medium outline-none focus:border-emerald-600"
              >
                <option value="Silver">Silver</option>
                <option value="Gold Member">Gold Member</option>
                <option value="Platinum Gold">Platinum Gold</option>
                <option value="VIP Patron">VIP Patron</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-foreground">Welcome Wallet (₹)</label>
              <input
                type="number"
                value={formData.initialWallet}
                onChange={(e) => setFormData({ ...formData, initialWallet: Number(e.target.value) })}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-foreground">Welcome Points</label>
              <input
                type="number"
                value={formData.initialLoyalty}
                onChange={(e) => setFormData({ ...formData, initialLoyalty: Number(e.target.value) })}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 💳 WALLET ADJUSTMENT MODAL
// ==========================================

function WalletAdjustmentModal({
  customer,
  isOpen,
  onClose,
  onSuccess
}: {
  customer: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState<number>(500);
  const [description, setDescription] = useState("Festival Cashback Loyalty Bonus");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setSubmitting(true);
      const res = await adjustCustomerWallet(customer.id, {
        amount,
        type,
        description: description || "Administrative wallet adjustment"
      });

      if (res?.success) {
        toast.success(res.message || "Wallet balance adjusted");
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to adjust wallet");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Wallet className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Adjust Wallet Balance</h3>
              <p className="text-xs text-muted-foreground">{customer.name} (Current: ₹{customer.walletBalance || 0})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Credit vs Debit Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted/60 border border-border">
            <button
              type="button"
              onClick={() => setType("credit")}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === "credit"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowDownLeft className="size-3.5" />
              <span>Credit (+ Add Funds)</span>
            </button>
            <button
              type="button"
              onClick={() => setType("debit")}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === "debit"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowUpRight className="size-3.5" />
              <span>Debit (- Deduct Funds)</span>
            </button>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground">Amount (₹) *</label>
            <input
              required
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="e.g. 500"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-extrabold outline-none focus:border-emerald-600"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground">Reason / Transaction Note</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Promotional refund credit, order adjustment..."
              className="h-9 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-emerald-600"
            />
          </div>

          <div className="p-3 rounded-xl bg-muted/40 text-muted-foreground text-[11px] flex justify-between">
            <span>Resulting Wallet Balance:</span>
            <span className="font-black text-foreground">
              ₹{type === "credit" ? ((customer.walletBalance || 0) + Number(amount)).toLocaleString('en-IN') : Math.max(0, (customer.walletBalance || 0) - Number(amount)).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Confirm Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
