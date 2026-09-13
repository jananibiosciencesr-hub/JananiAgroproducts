import React, { useState, useEffect } from "react";
import {
  Store,
  Palette,
  Globe,
  CreditCard,
  Truck,
  Receipt,
  Gift,
  Ticket,
  Mail,
  MessageSquare,
  ShieldCheck,
  Users,
  UserCheck,
  Activity,
  History,
  Lock,
  Database,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Upload,
  Search,
  Filter,
  ArrowUpDown,
  Send,
  Sliders,
  Sparkles,
  Check,
  X,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  KeyRound,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Info
} from "lucide-react";
import { toast } from "sonner";
import {
  type AdminSettingsData,
  type StoreSettings,
  type BrandingSettings,
  type SeoSettings,
  type PaymentGatewaysSettings,
  type ShiprocketSettings,
  type GstSettings,
  type DeliveryChargesSettings,
  type ReferralRulesSettings,
  type CouponRulesSettings,
  type SmtpSettings,
  type SmsSettings,
  type SecuritySettings,
  type AdminRole,
  type AdminStaffUser,
  type ActivityAuditLog,
  type LoginSession,
  type SystemBackup,
  getAdminSettings,
  updateStoreSettings,
  updateBrandingSettings,
  updateSeoSettings,
  updatePaymentSettings,
  updateShippingSettings,
  updateGstSettings,
  updateDeliveryFeeSettings,
  updateReferralRulesSettings,
  updateCouponRulesSettings,
  updateSmtpSettings,
  testSmtpConnection,
  updateSmsSettings,
  testSmsConnection,
  getAdminRoles,
  createAdminRole,
  updateAdminRole,
  deleteAdminRole,
  getAdminStaffList,
  createAdminStaff,
  updateAdminStaff,
  toggleAdminStaffStatus,
  deleteAdminStaff,
  getActivityLogs,
  clearActivityLogs,
  getLoginHistory,
  terminateLoginSession,
  updateSecuritySettings,
  getSystemBackups,
  createSystemBackup,
  restoreSystemBackup,
  getBackupDownloadUrl
} from "@/lib/api";

export type SettingsSubTab =
  | "store_branding"
  | "seo"
  | "gateways"
  | "logistics_tax"
  | "delivery"
  | "growth_rewards"
  | "comms_smtp_sms"
  | "roles_permissions"
  | "staff_users"
  | "audit_security_backup";

interface SettingsManagementProps {
  defaultTab?: SettingsSubTab;
}

export function SettingsManagement({ defaultTab = "store_branding" }: SettingsManagementProps) {
  const [activeTab, setActiveTab] = useState<SettingsSubTab>(defaultTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Core Data States
  const [settings, setSettings] = useState<AdminSettingsData | null>(null);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [staff, setStaff] = useState<AdminStaffUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityAuditLog[]>([]);
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>([]);
  const [backups, setBackups] = useState<SystemBackup[]>([]);
  const [storageHealth, setStorageHealth] = useState<any>(null);

  // Diagnostic Test States
  const [testEmailAddress, setTestEmailAddress] = useState("sairama@jananiagro.com");
  const [testPhoneNumber, setTestPhoneNumber] = useState("+91 98451 22345");
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isTestingSms, setIsTestingSms] = useState(false);
  const [smtpDiagnosticResult, setSmtpDiagnosticResult] = useState<any>(null);
  const [smsDiagnosticResult, setSmsDiagnosticResult] = useState<any>(null);

  // Filter & Search States
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logSeverityFilter, setLogSeverityFilter] = useState("all");
  const [logModuleFilter, setLogModuleFilter] = useState("all");
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [staffRoleFilter, setStaffRoleFilter] = useState("all");

  // Modal / Drawer States
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminStaffUser | null>(null);
  const [staffFormData, setStaffFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roleId: "",
    department: "Operations",
    assignedWarehouses: ["WH-GIDC-01"],
    notes: ""
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [roleFormData, setRoleFormData] = useState<{
    name: string;
    description: string;
    color: string;
    permissions: string[];
  }>({
    name: "",
    description: "",
    color: "#10b981",
    permissions: []
  });

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupNote, setBackupNote] = useState("");
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Permission Matrix Definition
  const permissionCategories = [
    {
      category: "Catalog & Products",
      perms: [
        { key: "products.view", label: "View Products Catalog" },
        { key: "products.create", label: "Create New Products" },
        { key: "products.edit", label: "Edit Pricing & Variants" },
        { key: "products.delete", label: "Delete / Trash Products" }
      ]
    },
    {
      category: "Orders & Logistics",
      perms: [
        { key: "orders.view", label: "View Customer Orders" },
        { key: "orders.edit", label: "Update Order Lifecycle" },
        { key: "orders.shiprocket", label: "Generate Shiprocket AWB" },
        { key: "orders.cancel_refund", label: "Process Refunds & Cancellations" }
      ]
    },
    {
      category: "Customers & Wallet",
      perms: [
        { key: "customers.view", label: "View Customer Database" },
        { key: "customers.edit", label: "Edit Customer Profiles" },
        { key: "customers.wallet_manage", label: "Adjust Wallet & Loyalty" }
      ]
    },
    {
      category: "Inventory & Warehouses",
      perms: [
        { key: "inventory.view", label: "View Stock Levels" },
        { key: "inventory.restock", label: "Restock & Reallocate Bins" }
      ]
    },
    {
      category: "Marketing & Growth",
      perms: [
        { key: "coupons.view", label: "View Active Coupons" },
        { key: "coupons.manage", label: "Generate & Edit Promo Codes" },
        { key: "marketing.view", label: "View Marketing Campaigns" },
        { key: "marketing.campaigns", label: "Dispatch Omnichannel Campaigns" },
        { key: "cms.view", label: "View Storefront CMS" },
        { key: "cms.edit", label: "Edit Banners & Layout Builder" }
      ]
    },
    {
      category: "Financials & Administration",
      perms: [
        { key: "reports.view", label: "View Analytics & P&L" },
        { key: "reports.export", label: "Export CSV / Financial Ledgers" },
        { key: "reports.gst", label: "Access GSTR-1 & Tax Filings" },
        { key: "settings.view", label: "View System Settings" },
        { key: "settings.edit", label: "Modify Store & API Config" },
        { key: "roles.manage", label: "Manage Roles & Permissions" },
        { key: "staff.manage", label: "Invite & Manage Staff" },
        { key: "audit.view", label: "Inspect Activity Audit Logs" },
        { key: "security.manage", label: "Configure 2FA & IP Whitelists" },
        { key: "backups.manage", label: "Generate & Restore DB Backups" }
      ]
    }
  ];

  // Load all initial data
  const loadMasterData = async () => {
    try {
      setLoading(true);
      const [
        settingsRes,
        rolesRes,
        staffRes,
        logsRes,
        sessionsRes,
        backupsRes
      ] = await Promise.all([
        getAdminSettings(),
        getAdminRoles(),
        getAdminStaffList(),
        getActivityLogs({ limit: 50 }),
        getLoginHistory(),
        getSystemBackups()
      ]);

      if (settingsRes) setSettings(settingsRes);
      if (rolesRes) setRoles(rolesRes);
      if (staffRes) setStaff(staffRes);
      if (logsRes && logsRes.logs) setActivityLogs(logsRes.logs);
      if (sessionsRes && sessionsRes.sessions) setLoginSessions(sessionsRes.sessions);
      if (backupsRes && backupsRes.backups) {
        setBackups(backupsRes.backups);
        setStorageHealth(backupsRes.systemStorageHealth);
      }
    } catch (err) {
      console.error("Failed to load settings data:", err);
      toast.error("Failed to load system settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  // Save Handlers for each sub-section
  const handleSaveStoreAndBranding = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await Promise.all([
        updateStoreSettings(settings.store),
        updateBrandingSettings(settings.branding)
      ]);
      toast.success("Store Profile, Legal Information & Branding saved successfully!");
    } catch (err) {
      toast.error("Failed to save store settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSeo = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await updateSeoSettings(settings.seo);
      toast.success("SEO Metadata, OpenGraph & Social Cards updated!");
    } catch (err) {
      toast.error("Failed to save SEO settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGateways = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await updatePaymentSettings(settings.paymentGateways);
      toast.success("Payment Gateway configurations and COD rules saved!");
    } catch (err) {
      toast.error("Failed to save payment settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLogisticsAndTax = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await Promise.all([
        updateShippingSettings(settings.shiprocket),
        updateGstSettings(settings.gst)
      ]);
      toast.success("Shiprocket API parameters & GST compliance settings saved!");
    } catch (err) {
      toast.error("Failed to save logistics and GST settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDeliveryCharges = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await updateDeliveryFeeSettings(settings.deliveryCharges);
      toast.success("Delivery fee tiers, express shipping & remote surcharges updated!");
    } catch (err) {
      toast.error("Failed to save delivery fee settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGrowthRules = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await Promise.all([
        updateReferralRulesSettings(settings.referralRules),
        updateCouponRulesSettings(settings.couponRules)
      ]);
      toast.success("Referral cashbacks & Coupon engine rules updated!");
    } catch (err) {
      toast.error("Failed to save growth rules.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveComms = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await Promise.all([
        updateSmtpSettings(settings.smtp),
        updateSmsSettings(settings.sms)
      ]);
      toast.success("SMTP relay & Fast2SMS DLT credentials updated!");
    } catch (err) {
      toast.error("Failed to save communications settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!testEmailAddress) {
      toast.error("Please provide a valid test recipient email.");
      return;
    }
    try {
      setIsTestingSmtp(true);
      const res = await testSmtpConnection(testEmailAddress);
      if (res?.success) {
        setSmtpDiagnosticResult(res.diagnostic);
        toast.success(res.message);
      }
    } catch (err) {
      toast.error("SMTP Diagnostic test failed. Please verify credentials.");
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleTestSms = async () => {
    if (!testPhoneNumber) {
      toast.error("Please provide a valid test phone number.");
      return;
    }
    try {
      setIsTestingSms(true);
      const res = await testSmsConnection(testPhoneNumber);
      if (res?.success) {
        setSmsDiagnosticResult(res.diagnostic);
        toast.success(res.message);
      }
    } catch (err) {
      toast.error("SMS Diagnostic test failed. Verify DLT Sender ID.");
    } finally {
      setIsTestingSms(false);
    }
  };

  const handleSaveSecurityPolicies = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await updateSecuritySettings(settings.security);
      toast.success("Security policies, 2FA rules & IP whitelist saved!");
    } catch (err) {
      toast.error("Failed to save security settings.");
    } finally {
      setSaving(false);
    }
  };

  // Staff User CRUD Handlers
  const handleOpenCreateStaffModal = () => {
    setEditingStaff(null);
    setStaffFormData({
      name: "",
      email: "",
      phone: "",
      roleId: roles[0]?.id || "role_store_manager",
      department: "Store Operations",
      assignedWarehouses: ["WH-GIDC-01"],
      notes: ""
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaffModal = (member: AdminStaffUser) => {
    setEditingStaff(member);
    setStaffFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      roleId: member.roleId,
      department: member.department,
      assignedWarehouses: member.assignedWarehouses || ["All Facilities"],
      notes: member.notes || ""
    });
    setIsStaffModalOpen(true);
  };

  const handleSubmitStaffForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormData.name || !staffFormData.email || !staffFormData.roleId) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    try {
      if (editingStaff) {
        const res = await updateAdminStaff(editingStaff.id, staffFormData);
        if (res?.success) {
          setStaff((prev) => prev.map((s) => (s.id === editingStaff.id ? res.staff : s)));
          toast.success(`Staff profile for ${res.staff.name} updated!`);
        }
      } else {
        const res = await createAdminStaff(staffFormData);
        if (res?.success) {
          setStaff((prev) => [res.staff, ...prev]);
          toast.success(`Staff member ${res.staff.name} invited successfully!`);
        }
      }
      setIsStaffModalOpen(false);
    } catch (err) {
      toast.error("Failed to save staff user.");
    }
  };

  const handleToggleStaffStatus = async (id: string) => {
    try {
      const res = await toggleAdminStaffStatus(id);
      if (res?.success) {
        setStaff((prev) => prev.map((s) => (s.id === id ? res.staff : s)));
        toast.success(`Staff account is now ${res.staff.status}`);
      }
    } catch (err) {
      toast.error("Failed to toggle staff status.");
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke and delete access for ${name}?`)) return;
    try {
      const res = await deleteAdminStaff(id);
      if (res?.success) {
        setStaff((prev) => prev.filter((s) => s.id !== id));
        toast.success(`Staff account for ${name} removed.`);
      }
    } catch (err) {
      toast.error("Failed to delete staff user.");
    }
  };

  // Role CRUD Handlers
  const handleOpenCreateRoleModal = () => {
    setEditingRole(null);
    setRoleFormData({
      name: "",
      description: "",
      color: "#10b981",
      permissions: ["products.view", "orders.view", "inventory.view"]
    });
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRoleModal = (role: AdminRole) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: [...role.permissions]
    });
    setIsRoleModalOpen(true);
  };

  const handleTogglePermission = (permKey: string) => {
    setRoleFormData((prev) => {
      const exists = prev.permissions.includes(permKey);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permKey)
          : [...prev.permissions, permKey]
      };
    });
  };

  const handleSubmitRoleForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.name) {
      toast.error("Role name is required.");
      return;
    }

    try {
      if (editingRole) {
        const res = await updateAdminRole(editingRole.id, roleFormData);
        if (res?.success) {
          setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? res.role : r)));
          toast.success(`Role '${res.role.name}' permissions updated!`);
        }
      } else {
        const res = await createAdminRole(roleFormData);
        if (res?.success) {
          setRoles((prev) => [...prev, res.role]);
          toast.success(`Custom role '${res.role.name}' created!`);
        }
      }
      setIsRoleModalOpen(false);
    } catch (err) {
      toast.error("Failed to save role.");
    }
  };

  const handleDeleteRole = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete role '${name}'?`)) return;
    try {
      const res = await deleteAdminRole(id);
      if (res?.success) {
        setRoles((prev) => prev.filter((r) => r.id !== id));
        toast.success(`Role '${name}' deleted.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete role.");
    }
  };

  // Session & Audit Logs Handlers
  const handleTerminateSession = async (id: string, userName: string) => {
    if (!confirm(`Terminate active session for ${userName}? They will be forced to log in again.`)) return;
    try {
      const res = await terminateLoginSession(id);
      if (res?.success) {
        setLoginSessions((prev) => prev.map((s) => (s.id === id ? res.session : s)));
        toast.success(`Session for ${userName} terminated successfully.`);
      }
    } catch (err) {
      toast.error("Failed to terminate session.");
    }
  };

  const handleClearAuditLogs = async () => {
    if (!confirm("Are you sure you want to archive and clear the active audit trail buffer?")) return;
    try {
      const res = await clearActivityLogs();
      if (res?.success) {
        const logsRes = await getActivityLogs({ limit: 50 });
        if (logsRes?.logs) setActivityLogs(logsRes.logs);
        toast.success(res.message);
      }
    } catch (err) {
      toast.error("Failed to clear audit logs.");
    }
  };

  // Backup & Recovery Handlers
  const handleCreateBackup = async () => {
    try {
      setIsBackingUp(true);
      const res = await createSystemBackup("Manual Full Snapshot", backupNote);
      if (res?.success) {
        setBackups((prev) => [res.backup, ...prev]);
        toast.success(`Database snapshot ${res.backup.filename} created successfully!`);
        setIsBackupModalOpen(false);
        setBackupNote("");
      }
    } catch (err) {
      toast.error("Failed to create backup snapshot.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = async (id: string, filename: string) => {
    if (!confirm(`⚠️ CRITICAL: Are you sure you want to restore the entire store database to snapshot state '${filename}'?`)) return;
    try {
      const res = await restoreSystemBackup(id);
      if (res?.success) {
        toast.success(res.message);
      }
    } catch (err) {
      toast.error("Failed to restore backup snapshot.");
    }
  };

  // Filtered Activity Logs
  const filteredActivityLogs = activityLogs.filter((l) => {
    const matchesSearch =
      !logSearchQuery ||
      l.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      l.actor.name.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      l.ipAddress.includes(logSearchQuery) ||
      l.module.toLowerCase().includes(logSearchQuery.toLowerCase());

    const matchesSeverity = logSeverityFilter === "all" || l.severity === logSeverityFilter;
    const matchesModule = logModuleFilter === "all" || l.module.toLowerCase().includes(logModuleFilter.toLowerCase());

    return matchesSearch && matchesSeverity && matchesModule;
  });

  // Filtered Staff
  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      !staffSearchQuery ||
      s.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      s.roleName.toLowerCase().includes(staffSearchQuery.toLowerCase());

    const matchesRole = staffRoleFilter === "all" || s.roleId === staffRoleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Loading Enterprise Settings Command Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-background to-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Enterprise Settings & Governance
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Production v2.4
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Centralized command center for store identity, payment rails, Shiprocket logistics, tax compliance, staff ACLs, and disaster recovery.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadMasterData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-muted/60 hover:bg-muted text-foreground border border-border/80 transition-all active:scale-95"
            title="Reload latest configuration from server"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
          >
            <Database className="w-3.5 h-3.5" />
            Create Backup Snapshot
          </button>
        </div>
      </div>

      {/* Main 10-Tab Navigation Matrix */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/60 scrollbar-none">
        {[
          { id: "store_branding", label: "Store & Branding", icon: Store },
          { id: "seo", label: "SEO & Social", icon: Globe },
          { id: "gateways", label: "Payment Rails", icon: CreditCard },
          { id: "logistics_tax", label: "Shiprocket & GST", icon: Truck },
          { id: "delivery", label: "Delivery Fees", icon: Receipt },
          { id: "growth_rewards", label: "Rewards & Coupons", icon: Gift },
          { id: "comms_smtp_sms", label: "Email & SMS Comms", icon: Mail },
          { id: "roles_permissions", label: "Roles & Permissions", icon: ShieldCheck },
          { id: "staff_users", label: "Admin Staff CRUD", icon: Users },
          { id: "audit_security_backup", label: "Audit, Security & Backup", icon: Lock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsSubTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-muted-foreground"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: STORE & BRANDING SETTINGS */}
      {activeTab === "store_branding" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Store Profile & Legal Entity</h2>
              <p className="text-xs text-muted-foreground">Official business identity, FSSAI license, CIN, phone, and operational timings.</p>
            </div>
            <button
              onClick={handleSaveStoreAndBranding}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving Changes..." : "Save Store & Branding"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Store Information Card */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 pb-2 border-b border-border/60">
                <Store className="w-4 h-4" />
                <h3 className="text-sm font-semibold text-foreground">Store Identity & Legal Details</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Store Trade Name</label>
                  <input
                    type="text"
                    value={settings.store.storeName}
                    onChange={(e) => setSettings({ ...settings, store: { ...settings.store, storeName: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Legal Registered Entity Name</label>
                  <input
                    type="text"
                    value={settings.store.legalBusinessName}
                    onChange={(e) => setSettings({ ...settings, store: { ...settings.store, legalBusinessName: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Store Tagline / Slogan</label>
                  <input
                    type="text"
                    value={settings.store.storeTagline}
                    onChange={(e) => setSettings({ ...settings, store: { ...settings.store, storeTagline: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">FSSAI License No.</label>
                    <input
                      type="text"
                      value={settings.store.fssaiLicenseNo}
                      onChange={(e) => setSettings({ ...settings, store: { ...settings.store, fssaiLicenseNo: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Corporate CIN</label>
                    <input
                      type="text"
                      value={settings.store.cinNumber}
                      onChange={(e) => setSettings({ ...settings, store: { ...settings.store, cinNumber: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Primary Support Email</label>
                    <input
                      type="email"
                      value={settings.store.supportEmail}
                      onChange={(e) => setSettings({ ...settings, store: { ...settings.store, supportEmail: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Customer Support Phone</label>
                    <input
                      type="text"
                      value={settings.store.supportPhone}
                      onChange={(e) => setSettings({ ...settings, store: { ...settings.store, supportPhone: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Registered Warehouse Hub Address</label>
                  <input
                    type="text"
                    value={settings.store.storeAddress}
                    onChange={(e) => setSettings({ ...settings, store: { ...settings.store, storeAddress: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={settings.store.city}
                      onChange={(e) => setSettings({ ...settings, store: { ...settings.store, city: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">State</label>
                    <input
                      type="text"
                      value={settings.store.state}
                      onChange={(e) => setSettings({ ...settings, store: { ...settings.store, state: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={settings.store.pincode}
                      onChange={(e) => setSettings({ ...settings, store: { ...settings.store, pincode: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Assets & Logo Upload Card */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 pb-2 border-b border-border/60">
                <Palette className="w-4 h-4" />
                <h3 className="text-sm font-semibold text-foreground">Brand Assets & Color Tokens</h3>
              </div>

              <div className="space-y-4 text-xs">
                {/* Logo Light / Dark */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 border border-border/60 rounded-xl space-y-2">
                    <span className="font-semibold text-foreground block">Light Mode Logo</span>
                    <div className="h-16 flex items-center justify-center bg-white rounded-lg p-2 border border-border/40">
                      <img
                        src={settings.branding.logoLightUrl}
                        alt="Logo Light"
                        className="max-h-12 object-contain"
                        onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80"; }}
                      />
                    </div>
                    <input
                      type="text"
                      value={settings.branding.logoLightUrl}
                      onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, logoLightUrl: e.target.value } })}
                      className="w-full bg-background border border-border/80 rounded-lg px-2.5 py-1 text-[11px] text-foreground focus:outline-none focus:border-emerald-500"
                      placeholder="Logo URL"
                    />
                  </div>

                  <div className="p-3 bg-muted/30 border border-border/60 rounded-xl space-y-2">
                    <span className="font-semibold text-foreground block">Dark Mode Logo</span>
                    <div className="h-16 flex items-center justify-center bg-zinc-950 rounded-lg p-2 border border-border/40">
                      <img
                        src={settings.branding.logoDarkUrl}
                        alt="Logo Dark"
                        className="max-h-12 object-contain"
                        onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80"; }}
                      />
                    </div>
                    <input
                      type="text"
                      value={settings.branding.logoDarkUrl}
                      onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, logoDarkUrl: e.target.value } })}
                      className="w-full bg-background border border-border/80 rounded-lg px-2.5 py-1 text-[11px] text-foreground focus:outline-none focus:border-emerald-500"
                      placeholder="Logo Dark URL"
                    />
                  </div>
                </div>

                {/* Favicon Preview */}
                <div className="p-3 bg-muted/30 border border-border/60 rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-zinc-900 border border-border rounded-lg overflow-hidden shrink-0">
                    <img
                      src={settings.branding.faviconUrl}
                      alt="Favicon"
                      className="w-7 h-7 object-contain"
                      onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&q=80"; }}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="font-semibold text-foreground block">Favicon Asset URL (32x32 / 64x64 PNG or ICO)</span>
                    <input
                      type="text"
                      value={settings.branding.faviconUrl}
                      onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, faviconUrl: e.target.value } })}
                      className="w-full bg-background border border-border/80 rounded-lg px-2.5 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Color Scheme Picker */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Primary Color</label>
                    <div className="flex items-center gap-2 bg-muted/40 border border-border/80 rounded-xl px-2 py-1.5">
                      <input
                        type="color"
                        value={settings.branding.brandPrimaryColor}
                        onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, brandPrimaryColor: e.target.value } })}
                        className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                      />
                      <span className="font-mono text-[11px] text-foreground uppercase">{settings.branding.brandPrimaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Secondary Accent</label>
                    <div className="flex items-center gap-2 bg-muted/40 border border-border/80 rounded-xl px-2 py-1.5">
                      <input
                        type="color"
                        value={settings.branding.brandSecondaryColor}
                        onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, brandSecondaryColor: e.target.value } })}
                        className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                      />
                      <span className="font-mono text-[11px] text-foreground uppercase">{settings.branding.brandSecondaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Admin Accent</label>
                    <div className="flex items-center gap-2 bg-muted/40 border border-border/80 rounded-xl px-2 py-1.5">
                      <input
                        type="color"
                        value={settings.branding.adminBrandAccent}
                        onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, adminBrandAccent: e.target.value } })}
                        className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                      />
                      <span className="font-mono text-[11px] text-foreground uppercase">{settings.branding.adminBrandAccent}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Watermark Text */}
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Tax Invoice Watermark Text</label>
                  <input
                    type="text"
                    value={settings.branding.invoiceWatermarkText}
                    onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, invoiceWatermarkText: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEO & SOCIAL META SETTINGS */}
      {activeTab === "seo" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">SEO, OpenGraph & Search Console</h2>
              <p className="text-xs text-muted-foreground">Global metadata, canonical URLs, Twitter summary cards, and webmaster verification tokens.</p>
            </div>
            <button
              onClick={handleSaveSeo}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving Changes..." : "Save SEO Metadata"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border/70 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 pb-2 border-b border-border/60">
                <Globe className="w-4 h-4" />
                <h3 className="text-sm font-semibold text-foreground">Global Meta Tags & Canonical Configuration</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-muted-foreground font-medium">Meta Title Tag (Recommended: 50-60 chars)</label>
                    <span className="text-[10px] text-muted-foreground font-mono">{settings.seo.metaTitle.length} chars</span>
                  </div>
                  <input
                    type="text"
                    value={settings.seo.metaTitle}
                    onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaTitle: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-muted-foreground font-medium">Meta Description Tag (Recommended: 150-160 chars)</label>
                    <span className="text-[10px] text-muted-foreground font-mono">{settings.seo.metaDescription.length} chars</span>
                  </div>
                  <textarea
                    rows={3}
                    value={settings.seo.metaDescription}
                    onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaDescription: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Meta Keywords (Comma separated)</label>
                  <input
                    type="text"
                    value={settings.seo.metaKeywords}
                    onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaKeywords: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Canonical Base URL</label>
                    <input
                      type="url"
                      value={settings.seo.canonicalBaseUrl}
                      onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, canonicalBaseUrl: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Twitter Handle</label>
                    <input
                      type="text"
                      value={settings.seo.twitterHandle}
                      onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, twitterHandle: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Google Site Verification ID</label>
                    <input
                      type="text"
                      value={settings.seo.googleSiteVerificationId}
                      onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, googleSiteVerificationId: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Bing Webmaster Verification ID</label>
                    <input
                      type="text"
                      value={settings.seo.bingSiteVerificationId}
                      onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, bingSiteVerificationId: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">OpenGraph OG Image URL</label>
                  <input
                    type="url"
                    value={settings.seo.ogImageUrl}
                    onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, ogImageUrl: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Google Search Live SERP Card */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 pb-2 border-b border-border/60">
                <Search className="w-4 h-4" />
                <h3 className="text-sm font-semibold text-foreground">Google SERP Live Preview</h3>
              </div>

              <div className="p-4 bg-zinc-950 border border-border/60 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <span className="w-4 h-4 rounded-full bg-emerald-600/30 flex items-center justify-center text-[10px] text-emerald-400">J</span>
                  <span className="truncate">{settings.seo.canonicalBaseUrl}</span>
                </div>
                <h4 className="text-sm font-semibold text-blue-400 hover:underline cursor-pointer line-clamp-2">
                  {settings.seo.metaTitle}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {settings.seo.metaDescription}
                </p>
              </div>

              <div className="p-4 bg-muted/20 border border-border/60 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Search Indexing (robots.txt)</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Allowed (index, follow)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">JSON-LD Rich Schema</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Organization & FoodEstablishment
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">XML Sitemap Generation</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> /sitemap.xml (Auto-synced)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT GATEWAY RAILS */}
      {activeTab === "gateways" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Payment Gateways & Cash on Delivery</h2>
              <p className="text-xs text-muted-foreground">Configure Razorpay, PhonePe, Cashfree API keys, Webhook secrets, and COD anti-fraud limits.</p>
            </div>
            <button
              onClick={handleSaveGateways}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving Changes..." : "Save Payment Rails"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Razorpay Gateway */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2 text-blue-400">
                  <CreditCard className="w-4 h-4" />
                  <h3 className="text-sm font-semibold text-foreground">Razorpay Payment Gateway</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${settings.paymentGateways.razorpay.mode === "live" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {settings.paymentGateways.razorpay.mode.toUpperCase()}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentGateways.razorpay.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        paymentGateways: {
                          ...settings.paymentGateways,
                          razorpay: { ...settings.paymentGateways.razorpay, enabled: e.target.checked }
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Razorpay Key ID</label>
                  <input
                    type="text"
                    value={settings.paymentGateways.razorpay.keyId}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        razorpay: { ...settings.paymentGateways.razorpay, keyId: e.target.value }
                      }
                    })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Razorpay Key Secret</label>
                  <input
                    type="password"
                    value={settings.paymentGateways.razorpay.keySecret}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        razorpay: { ...settings.paymentGateways.razorpay, keySecret: e.target.value }
                      }
                    })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Webhook Secret (payment.captured, refund.processed)</label>
                  <input
                    type="text"
                    value={settings.paymentGateways.razorpay.webhookSecret}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        razorpay: { ...settings.paymentGateways.razorpay, webhookSecret: e.target.value }
                      }
                    })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl">
                  <div>
                    <span className="font-semibold text-foreground block">Auto-Capture Payments</span>
                    <span className="text-[11px] text-muted-foreground">Instantly capture authorized transactions</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.paymentGateways.razorpay.autoCapture}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        razorpay: { ...settings.paymentGateways.razorpay, autoCapture: e.target.checked }
                      }
                    })}
                    className="w-4 h-4 text-emerald-600 rounded bg-muted border-border"
                  />
                </div>
              </div>
            </div>

            {/* PhonePe PG */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2 text-purple-400">
                  <CreditCard className="w-4 h-4" />
                  <h3 className="text-sm font-semibold text-foreground">PhonePe PG (UPI & Direct Pay)</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    {settings.paymentGateways.phonepe.env}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentGateways.phonepe.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        paymentGateways: {
                          ...settings.paymentGateways,
                          phonepe: { ...settings.paymentGateways.phonepe, enabled: e.target.checked }
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">PhonePe Merchant ID</label>
                  <input
                    type="text"
                    value={settings.paymentGateways.phonepe.merchantId}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        phonepe: { ...settings.paymentGateways.phonepe, merchantId: e.target.value }
                      }
                    })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-muted-foreground font-medium mb-1">Salt Key</label>
                    <input
                      type="password"
                      value={settings.paymentGateways.phonepe.saltKey}
                      onChange={(e) => setSettings({
                        ...settings,
                        paymentGateways: {
                          ...settings.paymentGateways,
                          phonepe: { ...settings.paymentGateways.phonepe, saltKey: e.target.value }
                        }
                      })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Salt Index</label>
                    <input
                      type="text"
                      value={settings.paymentGateways.phonepe.saltIndex}
                      onChange={(e) => setSettings({
                        ...settings,
                        paymentGateways: {
                          ...settings.paymentGateways,
                          phonepe: { ...settings.paymentGateways.phonepe, saltIndex: e.target.value }
                        }
                      })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">PhonePe Server Webhook Endpoint</label>
                  <input
                    type="url"
                    value={settings.paymentGateways.phonepe.webhookUrl}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        phonepe: { ...settings.paymentGateways.phonepe, webhookUrl: e.target.value }
                      }
                    })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Cash On Delivery (COD) Rules */}
            <div className="lg:col-span-2 bg-card border border-border/70 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2 text-amber-400">
                  <Receipt className="w-4 h-4" />
                  <h3 className="text-sm font-semibold text-foreground">Cash on Delivery (COD) Policy & Risk Controls</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.paymentGateways.cod.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        cod: { ...settings.paymentGateways.cod, enabled: e.target.checked }
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Minimum COD Cart Value (₹)</label>
                  <input
                    type="number"
                    value={settings.paymentGateways.cod.minOrderAmount}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        cod: { ...settings.paymentGateways.cod, minOrderAmount: Number(e.target.value) }
                      }
                    })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Maximum COD Cart Value (₹)</label>
                  <input
                    type="number"
                    value={settings.paymentGateways.cod.maxOrderAmount}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        cod: { ...settings.paymentGateways.cod, maxOrderAmount: Number(e.target.value) }
                      }
                    })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">COD Extra Handling Fee (₹)</label>
                  <input
                    type="number"
                    value={settings.paymentGateways.cod.extraFee}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        cod: { ...settings.paymentGateways.cod, extraFee: Number(e.target.value) }
                      }
                    })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl text-xs">
                <div>
                  <span className="font-semibold text-foreground block">Mandatory OTP Verification on COD Placement</span>
                  <span className="text-[11px] text-muted-foreground">Dispatches an instant 6-digit SMS code before confirming COD checkout</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.paymentGateways.cod.otpPreVerification}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentGateways: {
                      ...settings.paymentGateways,
                      cod: { ...settings.paymentGateways.cod, otpPreVerification: e.target.checked }
                    }
                  })}
                  className="w-4 h-4 text-emerald-600 rounded bg-muted border-border"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SHIPROCKET LOGISTICS & GST TAXATION */}
      {activeTab === "logistics_tax" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Shiprocket Logistics & GST Compliance</h2>
              <p className="text-xs text-muted-foreground">Manage 3PL carrier integration, automated AWB generation, tax rates, and E-Way bill limits.</p>
            </div>
            <button
              onClick={handleSaveLogisticsAndTax}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving Changes..." : "Save Logistics & GST"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shiprocket API */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Truck className="w-4 h-4" />
                  <h3 className="text-sm font-semibold text-foreground">Shiprocket API Integration</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  TOKEN ACTIVE
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Shiprocket Registered Email</label>
                  <input
                    type="email"
                    value={settings.shiprocket.email}
                    onChange={(e) => setSettings({ ...settings, shiprocket: { ...settings.shiprocket, email: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Shiprocket API Key</label>
                  <input
                    type="text"
                    value={settings.shiprocket.apiKey}
                    onChange={(e) => setSettings({ ...settings, shiprocket: { ...settings.shiprocket, apiKey: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Default Dispatch Warehouse</label>
                  <input
                    type="text"
                    value={settings.shiprocket.defaultWarehouse}
                    onChange={(e) => setSettings({ ...settings, shiprocket: { ...settings.shiprocket, defaultWarehouse: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Weight Buffer Safety (%)</label>
                    <input
                      type="number"
                      value={settings.shiprocket.weightBufferPercentage}
                      onChange={(e) => setSettings({ ...settings, shiprocket: { ...settings.shiprocket, weightBufferPercentage: Number(e.target.value) } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Smart Routing SLA</label>
                    <input
                      type="text"
                      value={settings.shiprocket.smartRoutingStrategy}
                      onChange={(e) => setSettings({ ...settings, shiprocket: { ...settings.shiprocket, smartRoutingStrategy: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl">
                  <div>
                    <span className="font-semibold text-foreground block">Auto-Manifest Dispatched Orders</span>
                    <span className="text-[11px] text-muted-foreground">Generates printable courier labels immediately on packing</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.shiprocket.autoManifestOrders}
                    onChange={(e) => setSettings({ ...settings, shiprocket: { ...settings.shiprocket, autoManifestOrders: e.target.checked } })}
                    className="w-4 h-4 text-emerald-600 rounded bg-muted border-border"
                  />
                </div>
              </div>
            </div>

            {/* GST Tax Settings */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2 text-blue-400">
                  <Receipt className="w-4 h-4" />
                  <h3 className="text-sm font-semibold text-foreground">Statutory GST & E-Way Bill Parameters</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">
                  GSTR-1 COMPLIANT
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">GSTIN Identifier</label>
                  <input
                    type="text"
                    value={settings.gst.gstin}
                    onChange={(e) => setSettings({ ...settings, gst: { ...settings.gst, gstin: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Standard Farm Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={settings.gst.standardTaxRate}
                      onChange={(e) => setSettings({ ...settings, gst: { ...settings.gst, standardTaxRate: Number(e.target.value) } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Ayurvedic Wellness Tax (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={settings.gst.ayurvedicTaxRate}
                      onChange={(e) => setSettings({ ...settings, gst: { ...settings.gst, ayurvedicTaxRate: Number(e.target.value) } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">E-Way Bill Generation Threshold (₹)</label>
                  <input
                    type="number"
                    value={settings.gst.eWayBillThreshold}
                    onChange={(e) => setSettings({ ...settings, gst: { ...settings.gst, eWayBillThreshold: Number(e.target.value) } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">State Code</label>
                    <input
                      type="text"
                      value={settings.gst.stateCode}
                      onChange={(e) => setSettings({ ...settings, gst: { ...settings.gst, stateCode: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">LUT ARN (For Export Exemption)</label>
                    <input
                      type="text"
                      value={settings.gst.lutArnNumber}
                      onChange={(e) => setSettings({ ...settings, gst: { ...settings.gst, lutArnNumber: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DELIVERY FEE CHARGES */}
      {activeTab === "delivery" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Delivery Charges & Shipping Rates</h2>
              <p className="text-xs text-muted-foreground">Thresholds for nationwide free delivery, express air surcharges, and remote PIN fees.</p>
            </div>
            <button
              onClick={handleSaveDeliveryCharges}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving Changes..." : "Save Delivery Fees"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border/70 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-muted-foreground font-medium block">Free Delivery Threshold</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-emerald-400">₹</span>
                <input
                  type="number"
                  value={settings.deliveryCharges.freeDeliveryThreshold}
                  onChange={(e) => setSettings({
                    ...settings,
                    deliveryCharges: { ...settings.deliveryCharges, freeDeliveryThreshold: Number(e.target.value) }
                  })}
                  className="w-28 text-2xl font-bold bg-transparent border-b border-border/80 text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Orders above this cart subtotal receive zero shipping fee across India.</p>
            </div>

            <div className="bg-card border border-border/70 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-muted-foreground font-medium block">Standard Shipping Fee</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">₹</span>
                <input
                  type="number"
                  value={settings.deliveryCharges.standardShippingFee}
                  onChange={(e) => setSettings({
                    ...settings,
                    deliveryCharges: { ...settings.deliveryCharges, standardShippingFee: Number(e.target.value) }
                  })}
                  className="w-28 text-2xl font-bold bg-transparent border-b border-border/80 text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Applied to orders below the free delivery cutoff ({settings.deliveryCharges.estimatedStandardDays}).</p>
            </div>

            <div className="bg-card border border-border/70 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-muted-foreground font-medium block">Express Air Courier Surcharge</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-blue-400">₹</span>
                <input
                  type="number"
                  value={settings.deliveryCharges.expressAirShippingFee}
                  onChange={(e) => setSettings({
                    ...settings,
                    deliveryCharges: { ...settings.deliveryCharges, expressAirShippingFee: Number(e.target.value) }
                  })}
                  className="w-28 text-2xl font-bold bg-transparent border-b border-border/80 text-blue-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Priority Bluedart Air expedited dispatch ({settings.deliveryCharges.estimatedExpressDays}).</p>
            </div>

            <div className="bg-card border border-border/70 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-muted-foreground font-medium block">Remote / Rural PIN Surcharge</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-amber-400">₹</span>
                <input
                  type="number"
                  value={settings.deliveryCharges.ruralRemotePinSurcharge}
                  onChange={(e) => setSettings({
                    ...settings,
                    deliveryCharges: { ...settings.deliveryCharges, ruralRemotePinSurcharge: Number(e.target.value) }
                  })}
                  className="w-28 text-2xl font-bold bg-transparent border-b border-border/80 text-amber-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Extra handling cost for Northeast, Island, and ODA pin codes.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REFERRALS & COUPON RULES */}
      {activeTab === "growth_rewards" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Referral Program & Coupon Anti-Fraud Rules</h2>
              <p className="text-xs text-muted-foreground">Define advocate cashbacks, friend discounts, maximum promo discount capping, and stacking rules.</p>
            </div>
            <button
              onClick={handleSaveGrowthRules}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving Changes..." : "Save Growth Rules"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referral Rules */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Gift className="w-4 h-4" />
                  <h3 className="text-sm font-semibold text-foreground">Refer & Earn Program Structure</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.referralRules.programEnabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      referralRules: { ...settings.referralRules, programEnabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Advocate Reward Amount (₹)</label>
                    <input
                      type="number"
                      value={settings.referralRules.advocateRewardAmount}
                      onChange={(e) => setSettings({
                        ...settings,
                        referralRules: { ...settings.referralRules, advocateRewardAmount: Number(e.target.value) }
                      })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Friend Discount Amount (₹)</label>
                    <input
                      type="number"
                      value={settings.referralRules.friendDiscountAmount}
                      onChange={(e) => setSettings({
                        ...settings,
                        referralRules: { ...settings.referralRules, friendDiscountAmount: Number(e.target.value) }
                      })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Friend Min Cart Spend (₹)</label>
                    <input
                      type="number"
                      value={settings.referralRules.friendMinCartValue}
                      onChange={(e) => setSettings({
                        ...settings,
                        referralRules: { ...settings.referralRules, friendMinCartValue: Number(e.target.value) }
                      })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Wallet Credit Expiry (Days)</label>
                    <input
                      type="number"
                      value={settings.referralRules.walletExpiryDays}
                      onChange={(e) => setSettings({
                        ...settings,
                        referralRules: { ...settings.referralRules, walletExpiryDays: Number(e.target.value) }
                      })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl">
                  <div>
                    <span className="font-semibold text-foreground block">Allow Reward Stacking with Store Coupons</span>
                    <span className="text-[11px] text-muted-foreground">Let patrons use wallet credit alongside promotional promo codes</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.referralRules.allowRewardStackingWithCoupons}
                    onChange={(e) => setSettings({
                      ...settings,
                      referralRules: { ...settings.referralRules, allowRewardStackingWithCoupons: e.target.checked }
                    })}
                    className="w-4 h-4 text-emerald-600 rounded bg-muted border-border"
                  />
                </div>
              </div>
            </div>

            {/* Coupon Rules */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 pb-2 border-b border-border/60">
                <Ticket className="w-4 h-4" />
                <h3 className="text-sm font-semibold text-foreground">Coupon Engine Rules & Margin Guard</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Maximum Coupon Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={settings.couponRules.maxCouponDiscountCap}
                    onChange={(e) => setSettings({
                      ...settings,
                      couponRules: { ...settings.couponRules, maxCouponDiscountCap: Number(e.target.value) }
                    })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Welcome Promo Code</label>
                    <input
                      type="text"
                      value={settings.couponRules.firstTimeBuyerWelcomePromoCode}
                      onChange={(e) => setSettings({
                        ...settings,
                        couponRules: { ...settings.couponRules, firstTimeBuyerWelcomePromoCode: e.target.value }
                      })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Welcome Discount (₹)</label>
                    <input
                      type="number"
                      value={settings.couponRules.firstTimeDiscountAmount}
                      onChange={(e) => setSettings({
                        ...settings,
                        couponRules: { ...settings.couponRules, firstTimeDiscountAmount: Number(e.target.value) }
                      })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl">
                  <div>
                    <span className="font-semibold text-foreground block">Auto-Apply Best Coupon in Cart</span>
                    <span className="text-[11px] text-muted-foreground">Calculates highest saving coupon for buyer automatically</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.couponRules.autoApplyBestCouponInCart}
                    onChange={(e) => setSettings({
                      ...settings,
                      couponRules: { ...settings.couponRules, autoApplyBestCouponInCart: e.target.checked }
                    })}
                    className="w-4 h-4 text-emerald-600 rounded bg-muted border-border"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: EMAIL SMTP & SMS COMMS */}
      {activeTab === "comms_smtp_sms" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Email SMTP Relay & Fast2SMS Gateways</h2>
              <p className="text-xs text-muted-foreground">Configure SendGrid/Amazon SES relay, TLS encryption, and Fast2SMS DLT transactional templates.</p>
            </div>
            <button
              onClick={handleSaveComms}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving Changes..." : "Save Communications"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SMTP Settings */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Mail className="w-4 h-4" />
                  <h3 className="text-sm font-semibold text-foreground">SMTP Email Server Relay</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  {settings.smtp.connectionStatus || "Connected"}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-muted-foreground font-medium mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={settings.smtp.host}
                      onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, host: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Port</label>
                    <input
                      type="number"
                      value={settings.smtp.port}
                      onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, port: Number(e.target.value) } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">From Sender Name</label>
                    <input
                      type="text"
                      value={settings.smtp.fromName}
                      onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, fromName: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">From Sender Email</label>
                    <input
                      type="email"
                      value={settings.smtp.fromEmail}
                      onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, fromEmail: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <span className="font-semibold text-foreground block mb-2">Live SMTP Diagnostics</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="Recipient email address"
                      className="flex-1 bg-muted/40 border border-border/80 rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleTestSmtp}
                      disabled={isTestingSmtp}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isTestingSmtp ? "Dispatching..." : "Send Test Email"}
                    </button>
                  </div>
                  {smtpDiagnosticResult && (
                    <div className="mt-2 p-2.5 bg-zinc-950 border border-emerald-500/30 rounded-lg text-[11px] font-mono text-emerald-400">
                      TLS Handshake Verified (Latency: {smtpDiagnosticResult.latencyMs}ms) • Status: {smtpDiagnosticResult.authStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SMS Settings */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2 text-blue-400">
                  <MessageSquare className="w-4 h-4" />
                  <h3 className="text-sm font-semibold text-foreground">SMS Gateway & DLT Header</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  DLT VERIFIED
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">DLT Sender Header ID</label>
                    <input
                      type="text"
                      value={settings.sms.senderId}
                      onChange={(e) => setSettings({ ...settings, sms: { ...settings.sms, senderId: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">DLT Principal Entity ID</label>
                    <input
                      type="text"
                      value={settings.sms.dltEntityId}
                      onChange={(e) => setSettings({ ...settings, sms: { ...settings.sms, dltEntityId: e.target.value } })}
                      className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Fast2SMS API Key</label>
                  <input
                    type="password"
                    value={settings.sms.apiKey}
                    onChange={(e) => setSettings({ ...settings, sms: { ...settings.sms, apiKey: e.target.value } })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 border-t border-border/60">
                  <span className="font-semibold text-foreground block mb-2">Live SMS Diagnostic Ping</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      placeholder="+91 Phone number"
                      className="flex-1 bg-muted/40 border border-border/80 rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleTestSms}
                      disabled={isTestingSms}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isTestingSms ? "Sending..." : "Send Test SMS"}
                    </button>
                  </div>
                  {smsDiagnosticResult && (
                    <div className="mt-2 p-2.5 bg-zinc-950 border border-blue-500/30 rounded-lg text-[11px] font-mono text-blue-400">
                      DLT Header [{smsDiagnosticResult.senderId}] Verified • Balance: {smsDiagnosticResult.creditsRemaining} credits
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: ROLES & PERMISSIONS MANAGEMENT */}
      {activeTab === "roles_permissions" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Role Management & Granular Permission Matrix</h2>
              <p className="text-xs text-muted-foreground">Configure access control levels across catalog, orders, logistics, wallets, audit, and disaster recovery.</p>
            </div>
            <button
              onClick={handleOpenCreateRoleModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Custom Role
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-card border border-border/70 rounded-2xl p-5 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: role.color || "#10b981" }}
                      />
                      <h3 className="text-sm font-bold text-foreground">{role.name}</h3>
                    </div>
                    {role.isSystem && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border/60">
                        System Built-in
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {role.description}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      {role.permissions.length} Permissions
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground font-semibold">
                      {role.staffCount} Assigned Staff
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => handleOpenEditRoleModal(role)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/60 hover:bg-muted text-foreground transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Configure Permissions
                  </button>
                  {!role.isSystem && (
                    <button
                      onClick={() => handleDeleteRole(role.id, role.name)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: ADMIN STAFF USER CRUD */}
      {activeTab === "staff_users" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Admin Staff Accounts & RBAC Authorization</h2>
              <p className="text-xs text-muted-foreground">Manage administrative team members, assign organizational roles, and monitor 2FA enrollment.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={staffSearchQuery}
                  onChange={(e) => setStaffSearchQuery(e.target.value)}
                  className="bg-card border border-border/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500 w-48"
                />
              </div>

              <button
                onClick={handleOpenCreateStaffModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Invite Staff Member
              </button>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-card border border-border/70 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/30 border-b border-border/60 text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-3">Administrator</th>
                    <th className="px-4 py-3">Assigned Role</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">2FA Status</th>
                    <th className="px-4 py-3">Last Active</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/20 transition-all">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover border border-border/80"
                            onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80"; }}
                          />
                          <div>
                            <span className="font-semibold text-foreground block">{member.name}</span>
                            <span className="text-[11px] text-muted-foreground">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {member.roleName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {member.department}
                      </td>
                      <td className="px-4 py-3">
                        {member.twoFactorEnabled ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" /> Enforced
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                        {member.lastLogin}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            member.status === "Active"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStaffStatus(member.id)}
                            className="px-2 py-1 rounded text-[11px] font-medium bg-muted hover:bg-muted/80 text-foreground transition-all"
                          >
                            {member.status === "Active" ? "Suspend" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleOpenEditStaffModal(member)}
                            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            title="Edit Staff User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(member.id, member.name)}
                            className="p-1.5 rounded text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete Account"
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
        </div>
      )}

      {/* TAB 10: AUDIT LOGS, SECURITY & BACKUPS */}
      {activeTab === "audit_security_backup" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Section 1: Security Policies */}
          <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2 text-emerald-400">
                <Lock className="w-4 h-4" />
                <h3 className="text-sm font-semibold text-foreground">System Security & Master Access Policies</h3>
              </div>
              <button
                onClick={handleSaveSecurityPolicies}
                disabled={saving}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                Save Security Rules
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl">
                <div>
                  <span className="font-semibold text-foreground block">Mandatory 2FA Enrollment</span>
                  <span className="text-[11px] text-muted-foreground">Force TOTP Authenticator for all staff</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.mandatoryTwoFactorAuth}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, mandatoryTwoFactorAuth: e.target.checked }
                  })}
                  className="w-4 h-4 text-emerald-600 rounded bg-muted border-border"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Session Idle Timeout (Minutes)</label>
                <input
                  type="number"
                  value={settings.security.sessionIdleTimeoutMinutes}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, sessionIdleTimeoutMinutes: Number(e.target.value) }
                  })}
                  className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Max Failed Login Attempts</label>
                <input
                  type="number"
                  value={settings.security.maxFailedLoginAttempts}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, maxFailedLoginAttempts: Number(e.target.value) }
                  })}
                  className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Active Login Sessions */}
          <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2 text-blue-400">
                <History className="w-4 h-4" />
                <h3 className="text-sm font-semibold text-foreground">Active Administrative Sessions & Devices</h3>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {loginSessions.filter((s) => s.status === "Active").length} Concurrent Active Session(s)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {loginSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-xl border space-y-3 ${
                    session.isCurrent
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : session.status === "Active"
                      ? "bg-card border-border/70"
                      : "bg-muted/10 border-border/40 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {session.deviceType === "Desktop" ? (
                        <Laptop className="w-4 h-4 text-emerald-400" />
                      ) : session.deviceType === "Tablet" ? (
                        <Tablet className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-amber-400" />
                      )}
                      <span className="font-bold text-foreground">{session.userName}</span>
                    </div>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        THIS DEVICE
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-muted-foreground text-[11px]">
                    <div className="flex justify-between">
                      <span>IP Address:</span>
                      <span className="font-mono text-foreground">{session.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="text-foreground">{session.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Browser:</span>
                      <span className="text-foreground truncate max-w-[160px]">{session.browser}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Login Time:</span>
                      <span className="text-foreground">{session.loginTime}</span>
                    </div>
                  </div>

                  {!session.isCurrent && session.status === "Active" && (
                    <button
                      onClick={() => handleTerminateSession(session.id, session.userName)}
                      className="w-full py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all active:scale-95"
                    >
                      Revoke Remote Session
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Activity Audit Ledger */}
          <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2 text-amber-400">
                <Activity className="w-4 h-4" />
                <h3 className="text-sm font-semibold text-foreground">Immutable Activity Audit Ledger</h3>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Search audit trail..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="bg-muted/40 border border-border/80 rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:border-emerald-500 w-44"
                />
                <select
                  value={logSeverityFilter}
                  onChange={(e) => setLogSeverityFilter(e.target.value)}
                  className="bg-muted/40 border border-border/80 rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button
                  onClick={handleClearAuditLogs}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all"
                >
                  Archive Ledger
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredActivityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-muted/20 border border-border/60 rounded-xl flex items-center justify-between gap-4 text-xs hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.severity === "critical"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : log.severity === "high"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {log.severity}
                    </span>
                    <div>
                      <span className="font-semibold text-foreground block">{log.action}</span>
                      <span className="text-[11px] text-muted-foreground">
                        Actor: {log.actor.name} ({log.actor.role}) • Module: {log.module}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-muted-foreground shrink-0 font-mono">
                    <div>{log.timestamp}</div>
                    <div>{log.ipAddress}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Backup & Disaster Recovery */}
          <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2 text-emerald-400">
                <Database className="w-4 h-4" />
                <h3 className="text-sm font-semibold text-foreground">System Snapshots & Disaster Recovery</h3>
              </div>
              {storageHealth && (
                <span className="text-xs text-muted-foreground font-mono">
                  Storage Used: {storageHealth.usedStorage} of {storageHealth.totalCapacity}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="p-4 bg-muted/20 border border-border/60 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground truncate max-w-[200px]" title={backup.filename}>
                      {backup.filename}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      {backup.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-muted-foreground text-[11px]">
                    <div className="flex justify-between">
                      <span>Snapshot Type:</span>
                      <span className="text-foreground">{backup.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size & Records:</span>
                      <span className="text-foreground font-mono">{backup.size} ({backup.recordCount} records)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created On:</span>
                      <span className="text-foreground">{backup.createdDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Integrity SHA:</span>
                      <span className="font-mono text-emerald-400">{backup.checksum}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    <a
                      href={getBackupDownloadUrl(backup.id)}
                      download
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border/60 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download JSON
                    </a>
                    <button
                      onClick={() => handleRestoreBackup(backup.id, backup.filename)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Restore State
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT STAFF USER */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="text-base font-bold text-foreground">
                {editingStaff ? `Edit Administrator: ${editingStaff.name}` : "Invite New Staff Administrator"}
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitStaffForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                  className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={staffFormData.email}
                    onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={staffFormData.phone}
                    onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Assign Role *</label>
                  <select
                    value={staffFormData.roleId}
                    onChange={(e) => setStaffFormData({ ...staffFormData, roleId: e.target.value })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={staffFormData.department}
                    onChange={(e) => setStaffFormData({ ...staffFormData, department: e.target.value })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Administrative Notes / Scope</label>
                <textarea
                  rows={2}
                  value={staffFormData.notes}
                  onChange={(e) => setStaffFormData({ ...staffFormData, notes: e.target.value })}
                  className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95"
                >
                  {editingStaff ? "Update Staff User" : "Send Staff Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURE ROLE PERMISSIONS */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="text-base font-bold text-foreground">
                {editingRole ? `Edit Role: ${editingRole.name}` : "Create Custom Administrative Role"}
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRoleForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-muted-foreground font-medium mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={roleFormData.name}
                    onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Badge Color</label>
                  <div className="flex items-center gap-2 bg-muted/40 border border-border/80 rounded-xl px-2 py-1.5">
                    <input
                      type="color"
                      value={roleFormData.color}
                      onChange={(e) => setRoleFormData({ ...roleFormData, color: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-foreground uppercase">{roleFormData.color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Role Description</label>
                <input
                  type="text"
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Granular Permission Checkboxes */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Granular Permissions Matrix</span>
                  <span className="text-[11px] text-emerald-400 font-semibold font-mono">
                    {roleFormData.permissions.length} selected
                  </span>
                </div>

                <div className="space-y-4">
                  {permissionCategories.map((cat) => (
                    <div key={cat.category} className="p-3.5 bg-muted/20 border border-border/60 rounded-xl space-y-2.5">
                      <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider block">
                        {cat.category}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {cat.perms.map((perm) => {
                          const isChecked = roleFormData.permissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                                  : "bg-muted/10 border-border/40 text-muted-foreground hover:bg-muted/30"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePermission(perm.key)}
                                className="w-3.5 h-3.5 text-emerald-600 rounded bg-muted border-border"
                              />
                              <span className="text-xs">{perm.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95"
                >
                  {editingRole ? "Update Role Matrix" : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE BACKUP SNAPSHOT */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2 text-emerald-400">
                <Database className="w-4 h-4" />
                <h3 className="text-base font-bold text-foreground">Create Full Database Snapshot</h3>
              </div>
              <button onClick={() => setIsBackupModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                This will create a complete immutable JSON export of products catalog, orders ledger, customer profiles, CMS layouts, marketing templates, and system settings.
              </p>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Snapshot Note / Milestone Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Pre-Harvest Sale Deployment Backup"
                  value={backupNote}
                  onChange={(e) => setBackupNote(e.target.value)}
                  className="w-full bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsBackupModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBackup}
                  disabled={isBackingUp}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5" />
                  {isBackingUp ? "Generating..." : "Generate Snapshot"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
