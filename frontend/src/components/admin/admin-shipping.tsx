import { useState, useEffect, useRef } from "react";
import {
  Truck,
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Eye,
  FileText,
  Package,
  Calendar,
  MapPin,
  Building2,
  CreditCard,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Send,
  Printer,
  Copy,
  ExternalLink,
  Check,
  X,
  TrendingUp,
  DollarSign,
  Layers,
  ArrowUpRight,
  Calculator,
  Sliders,
  Sparkles,
  Barcode,
  Navigation
} from "lucide-react";
import { toast } from "sonner";
import {
  getShippingConfig,
  updateShippingConfig,
  testShiprocketConnection,
  getPickupLocations,
  createPickupLocation,
  updatePickupLocation,
  deletePickupLocation,
  getShipments,
  getShipmentByAwb,
  cancelShipment,
  calculateShippingRates,
  getCourierRecommendations,
  schedulePickup,
  getNdrList,
  handleNdrAction,
  generateManifest,
  type ShipmentQueryParams
} from "@/lib/api";

// -------------------------------------------------------------
// Helper Badges & Status Color Utilities
// -------------------------------------------------------------

function getShipmentStatusBadge(status: string) {
  switch (status) {
    case "Delivered":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
    case "Out for Delivery":
      return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    case "In Transit":
      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
    case "Ready for Pickup":
    case "Pickup Scheduled":
      return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800";
    case "NDR / Action Required":
    case "Action Required":
      return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
    case "Cancelled":
    case "RTO Initiated":
      return "bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

// -------------------------------------------------------------
// Main Shipping Management Component
// -------------------------------------------------------------

export function ShippingManagement() {
  // Main Tab State
  const [mainTab, setMainTab] = useState<"shipments" | "pickup_hubs" | "ndr" | "calculator" | "manifest" | "settings">("shipments");

  // Shipments Data State
  const [shipments, setShipments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeShipments: 0,
    inTransit: 0,
    outForDelivery: 0,
    ndrExceptions: 0,
    delivered: 0,
    totalShippingSpend: 0
  });
  const [loadingShipments, setLoadingShipments] = useState(true);

  // Shipments Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [courierFilter, setCourierFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Pickup Hubs State
  const [pickupHubs, setPickupHubs] = useState<any[]>([]);
  const [loadingHubs, setLoadingHubs] = useState(false);

  // NDR Data State
  const [ndrRecords, setNdrRecords] = useState<any[]>([]);
  const [loadingNdr, setLoadingNdr] = useState(false);

  // API Config State
  const [config, setConfig] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionData, setConnectionData] = useState<any>(null);

  // Rate Calculator State
  const [originPincode, setOriginPincode] = useState("560100");
  const [destPincode, setDestPincode] = useState("110001");
  const [calcWeight, setCalcWeight] = useState("2.0");
  const [pkgLength, setPkgLength] = useState("25");
  const [pkgWidth, setPkgWidth] = useState("18");
  const [pkgHeight, setPkgHeight] = useState("12");
  const [paymentMode, setPaymentMode] = useState<"prepaid" | "cod">("prepaid");
  const [orderValue, setOrderValue] = useState("2500");
  const [rateResults, setRateResults] = useState<any>(null);
  const [calculatingRate, setCalculatingRate] = useState(false);

  // Modals & Drawers
  const [trackingShipment, setTrackingShipment] = useState<any | null>(null);
  const [selectedShipmentForLabel, setSelectedShipmentForLabel] = useState<any | null>(null);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<any | null>(null);
  const [selectedHubForEdit, setSelectedHubForEdit] = useState<any | null>(null);
  const [isAddHubModalOpen, setIsAddHubModalOpen] = useState(false);
  const [selectedNdrForAction, setSelectedNdrForAction] = useState<any | null>(null);
  const [generatedManifestData, setGeneratedManifestData] = useState<any | null>(null);

  // Load Shipments
  const loadShipmentsData = async () => {
    try {
      setLoadingShipments(true);
      const res = await getShipments({
        status: statusFilter,
        courier: courierFilter,
        search: search.trim() ? search : undefined,
        sortBy
      });
      if (res?.data) {
        setShipments(res.data);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Shiprocket shipments");
    } finally {
      setLoadingShipments(false);
    }
  };

  // Load Pickup Hubs
  const loadHubsData = async () => {
    try {
      setLoadingHubs(true);
      const hubs = await getPickupLocations();
      setPickupHubs(hubs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHubs(false);
    }
  };

  // Load NDR
  const loadNdrData = async () => {
    try {
      setLoadingNdr(true);
      const data = await getNdrList();
      setNdrRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNdr(false);
    }
  };

  // Load Config
  const loadConfigData = async () => {
    try {
      const data = await getShippingConfig();
      if (data) {
        setConfig(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadShipmentsData();
    loadHubsData();
    loadNdrData();
    loadConfigData();
  }, []);

  useEffect(() => {
    loadShipmentsData();
  }, [statusFilter, courierFilter, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadShipmentsData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle Test Connection
  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      const res = await testShiprocketConnection();
      if (res?.success) {
        setConnectionData(res.data);
        toast.success(res.message);
        loadConfigData();
      }
    } catch (err) {
      toast.error("Shiprocket API Connection Failed");
    } finally {
      setTestingConnection(false);
    }
  };

  // Handle Rate Calculation
  const handleCalculateRate = async () => {
    try {
      setCalculatingRate(true);
      const res = await calculateShippingRates({
        originPincode,
        destinationPincode: destPincode,
        weight: parseFloat(calcWeight) || 1,
        length: parseFloat(pkgLength) || 20,
        width: parseFloat(pkgWidth) || 15,
        height: parseFloat(pkgHeight) || 10,
        paymentType: paymentMode,
        orderAmount: parseFloat(orderValue) || 1000
      });
      if (res?.success) {
        setRateResults(res.data);
        toast.success("Shipping rates calculated successfully!");
      }
    } catch (err) {
      toast.error("Failed to calculate shipping rates");
    } finally {
      setCalculatingRate(false);
    }
  };

  // Handle Generate Manifest
  const handleGenerateManifest = async () => {
    try {
      const res = await generateManifest();
      if (res?.success) {
        setGeneratedManifestData(res.data);
        toast.success("Courier Handover Manifest generated!");
      }
    } catch (err) {
      toast.error("Failed to generate manifest");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Truck className="h-7 w-7 text-primary" />
              <span>Shiprocket Shipping Management</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {config?.status === "Connected" ? "Shiprocket Live Connected" : "API Active"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Multi-carrier dispatch hub (Bluedart, Delhivery, Ekart, Shadowfax, Xpressbees), NDR exception desk, and live tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors shadow-sm disabled:opacity-50"
            title="Test Shiprocket API Connection"
          >
            <ShieldCheck className={`h-4 w-4 ${testingConnection ? "animate-spin text-primary" : "text-emerald-600"}`} />
            <span>{testingConnection ? "Verifying..." : "Test Connection"}</span>
          </button>

          <button
            onClick={() => setIsPickupModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
          >
            <Calendar className="h-4 w-4" />
            <span>Schedule Pickup</span>
          </button>

          <button
            onClick={handleGenerateManifest}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
          >
            <FileText className="h-4 w-4" />
            <span>Handover Manifest</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Shipments</span>
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1.5">
            {stats.totalShipments}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">All dispatches logged</p>
        </div>

        <div className="bg-card border border-blue-200 dark:border-blue-900/60 rounded-xl p-3.5 shadow-sm bg-gradient-to-br from-blue-500/5 to-transparent">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider">In Transit</span>
            <Truck className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1.5">
            {stats.inTransit}
          </div>
          <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">Air & Surface en route</p>
        </div>

        <div className="bg-card border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 shadow-sm bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Out for Delivery</span>
            <Navigation className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1.5">
            {stats.outForDelivery}
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Live courier delivery run</p>
        </div>

        <div className="bg-card border border-rose-200 dark:border-rose-900/60 rounded-xl p-3.5 shadow-sm bg-gradient-to-br from-rose-500/5 to-transparent">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">NDR Exceptions</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1.5">
            {stats.ndrExceptions}
          </div>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">Delivery action required</p>
        </div>

        <div className="bg-card border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3.5 shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1.5">
            {stats.delivered}
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">99.4% On-Time SLA</p>
        </div>

        <div className="bg-card border border-emerald-300/80 dark:border-emerald-700/60 rounded-xl p-3.5 shadow-sm bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between text-primary">
            <span className="text-xs font-semibold uppercase tracking-wider">Shipping Spend</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1.5">
            ₹{stats.totalShippingSpend.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Carrier billing total</p>
        </div>
      </div>

      {/* 3. Navigation Main Tabs */}
      <div className="border-b border-border bg-card rounded-xl p-1.5 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          {[
            { id: "shipments", label: "Shipments & Live Tracking", icon: Truck, count: stats.totalShipments },
            { id: "pickup_hubs", label: "Pickup Locations (Hubs)", icon: Building2, count: pickupHubs.length },
            { id: "ndr", label: "NDR Exception Desk", icon: AlertTriangle, count: stats.ndrExceptions, badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" },
            { id: "calculator", label: "Rate Calculator & Couriers", icon: Calculator },
            { id: "manifest", label: "Manifest & Handover", icon: FileText },
            { id: "settings", label: "API Configuration", icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id as any)}
                className={`px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : tab.badgeColor || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. TAB 1: SHIPMENTS & LIVE TRACKING */}
      {mainTab === "shipments" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin border-b border-border/60">
              {[
                { id: "all", label: "All Shipments" },
                { id: "Ready for Pickup", label: "Ready for Pickup" },
                { id: "In Transit", label: "In Transit" },
                { id: "Out for Delivery", label: "Out for Delivery" },
                { id: "NDR / Action Required", label: "NDR Exceptions" },
                { id: "Delivered", label: "Delivered" },
                { id: "Cancelled", label: "Cancelled / RTO" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === tab.id
                      ? "bg-muted text-foreground border border-border shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search & Selectors */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by Shiprocket AWB, Order ID, Customer Name or City..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
                <select
                  value={courierFilter}
                  onChange={(e) => setCourierFilter(e.target.value)}
                  className="px-3 py-2 bg-background border border-input rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">Courier: All Partners</option>
                  <option value="Bluedart">Bluedart Air</option>
                  <option value="Delhivery">Delhivery Surface</option>
                  <option value="Ekart">Ekart Logistics</option>
                  <option value="Shadowfax">Shadowfax Local</option>
                  <option value="Xpressbees">Xpressbees Surface</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-background border border-input rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="newest">Newest First</option>
                  <option value="weight_desc">Heaviest Package</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shipments Table */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3.5 px-4">Shiprocket AWB & Order</th>
                    <th className="py-3.5 px-4">Courier Partner</th>
                    <th className="py-3.5 px-4">Destination & Customer</th>
                    <th className="py-3.5 px-4">Package & Items</th>
                    <th className="py-3.5 px-4">Pickup Hub</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingShipments ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
                        <p className="text-xs text-muted-foreground mt-2">Loading live Shiprocket shipments...</p>
                      </td>
                    </tr>
                  ) : shipments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
                        <p className="text-sm font-semibold text-foreground">No shipments matching filters</p>
                      </td>
                    </tr>
                  ) : (
                    shipments.map((shp) => (
                      <tr key={shp.id} className="hover:bg-muted/40 transition-colors">
                        {/* AWB & Order */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-blue-600 dark:text-blue-400 font-mono">
                                {shp.awbCode}
                              </span>
                              <button
                                onClick={() => copyToClipboard(shp.awbCode, "AWB Code")}
                                className="p-0.5 text-muted-foreground hover:text-foreground"
                                title="Copy AWB"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-xs text-foreground font-semibold mt-0.5">
                              Order #{shp.orderId}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {shp.createdAt}
                            </span>
                          </div>
                        </td>

                        {/* Courier Partner */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-500/20">
                              <Truck className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="font-bold text-xs text-foreground">{shp.courier}</p>
                              <p className="text-[11px] text-muted-foreground font-medium">
                                ETD: {shp.etd || "2-3 Days"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Customer & City */}
                        <td className="py-3.5 px-4">
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-foreground truncate max-w-[140px]">
                              {shp.customer?.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                              {shp.customer?.city}, {shp.customer?.state}
                            </p>
                            <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                              PIN: {shp.customer?.pincode}
                            </span>
                          </div>
                        </td>

                        {/* Package & Weight */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-xs text-foreground">
                              {shp.packageWeight}
                            </span>
                            <span className="text-[11px] text-muted-foreground block">
                              {shp.itemsCount} items ({shp.dimensions})
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              {shp.paymentType}
                            </span>
                          </div>
                        </td>

                        {/* Pickup Hub */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-xs text-foreground">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[130px]" title={shp.pickupLocation}>
                              {shp.pickupLocation}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getShipmentStatusBadge(shp.status)}`}>
                            {shp.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setTrackingShipment(shp)}
                              className="p-1.5 rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors"
                              title="Track Live Shipment"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </button>

                            <button
                              onClick={() => setSelectedShipmentForLabel(shp)}
                              className="p-1.5 rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors"
                              title="Print 4x6 Thermal Label"
                            >
                              <Printer className="h-4 w-4 text-indigo-600" />
                            </button>

                            {shp.status !== "Cancelled" && shp.status !== "Delivered" && (
                              <button
                                onClick={() => setIsCancelModalOpen(shp)}
                                className="p-1.5 rounded-lg border border-input bg-card hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 transition-colors"
                                title="Cancel Shipment & Void AWB"
                              >
                                <X className="h-4 w-4" />
                              </button>
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

      {/* 5. TAB 2: PICKUP LOCATIONS (HUBS CRUD) */}
      {mainTab === "pickup_hubs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground">Registered Dispatch Hubs</h3>
              <p className="text-xs text-muted-foreground">Manage warehouse locations where Shiprocket couriers arrive for daily parcel pickups.</p>
            </div>
            <button
              onClick={() => {
                setSelectedHubForEdit(null);
                setIsAddHubModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Pickup Hub</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pickupHubs.map((hub) => (
              <div
                key={hub.id}
                className={`p-5 rounded-2xl border bg-card shadow-sm space-y-3 transition-all ${
                  hub.isDefault ? "border-primary ring-1 ring-primary/20" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base border border-primary/20">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{hub.name}</h4>
                        {hub.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Primary Hub
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">Hub Code: {hub.hubCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedHubForEdit(hub);
                        setIsAddHubModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Edit Hub"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {!hub.isDefault && (
                      <button
                        onClick={async () => {
                          if (confirm(`Remove pickup hub ${hub.name}?`)) {
                            await deletePickupLocation(hub.id);
                            toast.success("Hub deleted");
                            loadHubsData();
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete Hub"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs space-y-1 text-muted-foreground border-y border-border/60 py-2.5">
                  <p className="text-foreground font-medium flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{hub.address}, {hub.city} — {hub.pincode}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span>Contact: <strong>{hub.contactPerson}</strong> ({hub.phone})</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>Operating Hours: {hub.operatingHours}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground font-medium">
                    Total Dispatches: <strong className="text-foreground">{hub.totalDispatches} parcels</strong>
                  </span>
                  {!hub.isDefault && (
                    <button
                      onClick={async () => {
                        await updatePickupLocation(hub.id, { isDefault: true });
                        toast.success(`Set ${hub.name} as Primary Hub`);
                        loadHubsData();
                      }}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 3: NDR EXCEPTION DESK */}
      {mainTab === "ndr" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-sm text-rose-900 dark:text-rose-300">Non-Delivery Report (NDR) Live Console</h4>
              <p className="text-rose-700/80 dark:text-rose-400">
                Action required on failed doorstep delivery attempts. Couriers hold packages for 48 hours before auto-initiating Return-to-Origin (RTO).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ndrRecords.map((ndr) => (
              <div key={ndr.id} className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                        {ndr.awbCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        Attempt #{ndr.attemptCount} Failed
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Order #{ndr.orderId} • {ndr.courier}</p>
                  </div>
                  <span className="text-xs font-bold text-foreground">₹{ndr.orderValue} ({ndr.paymentMode})</span>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5">
                  <p className="text-muted-foreground">
                    Patron: <strong className="text-foreground">{ndr.customerName}</strong> ({ndr.customerPhone})
                  </p>
                  <p className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Reason: {ndr.reason}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">Last Attempted: {ndr.lastAttemptDate}</p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedNdrForAction({ ...ndr, actionType: "reattempt" })}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm text-center"
                  >
                    Re-attempt Delivery
                  </button>
                  <button
                    onClick={() => setSelectedNdrForAction({ ...ndr, actionType: "update_info" })}
                    className="py-2 px-3 rounded-lg text-xs font-bold bg-card border border-input hover:bg-muted text-foreground transition-colors"
                  >
                    Update Phone/Address
                  </button>
                  <button
                    onClick={() => setSelectedNdrForAction({ ...ndr, actionType: "rto" })}
                    className="py-2 px-3 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                  >
                    RTO
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 4: RATE CALCULATOR & COURIER COMPARISON */}
      {mainTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Card */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Freight Rate Estimator
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Origin Pincode</label>
                  <input
                    type="text"
                    value={originPincode}
                    onChange={(e) => setOriginPincode(e.target.value)}
                    className="w-full p-2 bg-background border border-input rounded-lg font-mono text-foreground font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Dest Pincode</label>
                  <input
                    type="text"
                    value={destPincode}
                    onChange={(e) => setDestPincode(e.target.value)}
                    className="w-full p-2 bg-background border border-input rounded-lg font-mono text-foreground font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Dead Weight (KG)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded-lg font-bold text-foreground"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Dimensions (L x W x H in CM)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={pkgLength}
                    onChange={(e) => setPkgLength(e.target.value)}
                    placeholder="L"
                    className="p-2 bg-background border border-input rounded-lg text-center font-mono"
                  />
                  <input
                    type="number"
                    value={pkgWidth}
                    onChange={(e) => setPkgWidth(e.target.value)}
                    placeholder="W"
                    className="p-2 bg-background border border-input rounded-lg text-center font-mono"
                  />
                  <input
                    type="number"
                    value={pkgHeight}
                    onChange={(e) => setPkgHeight(e.target.value)}
                    placeholder="H"
                    className="p-2 bg-background border border-input rounded-lg text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMode("prepaid")}
                    className={`py-2 rounded-lg border font-bold text-center ${
                      paymentMode === "prepaid" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    Prepaid
                  </button>
                  <button
                    onClick={() => setPaymentMode("cod")}
                    className={`py-2 rounded-lg border font-bold text-center ${
                      paymentMode === "cod" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    Cash on Delivery
                  </button>
                </div>
              </div>

              <button
                onClick={handleCalculateRate}
                disabled={calculatingRate}
                className="w-full py-2.5 rounded-lg font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                <span>{calculatingRate ? "Computing Rates..." : "Compare Courier Rates"}</span>
              </button>
            </div>
          </div>

          {/* Results Comparison */}
          <div className="lg:col-span-2 space-y-4">
            {rateResults ? (
              <div className="space-y-4">
                {/* Weight summary pill */}
                <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between text-xs flex-wrap gap-2">
                  <div>
                    <span className="text-muted-foreground">Volumetric Weight: </span>
                    <strong className="text-foreground">{rateResults.volumetricWeight}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chargeable Weight: </span>
                    <strong className="text-primary font-black">{rateResults.chargeableWeight}</strong>
                  </div>
                  <div className="text-emerald-600 font-semibold">
                    Route: {rateResults.originPincode} ➔ {rateResults.destinationPincode}
                  </div>
                </div>

                {/* Courier Cards List */}
                <div className="space-y-3">
                  {rateResults.availableCouriers?.map((c: any, idx: number) => (
                    <div
                      key={c.id}
                      className={`p-4 rounded-xl border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        idx === 0 ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20" : "border-border"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-foreground">{c.name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                            {c.badge}
                          </span>
                          <span className="text-amber-500 font-bold text-xs">★ {c.rating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Estimated Delivery: <strong className="text-foreground">{c.etdDays}</strong> • Pickup: {c.pickupService}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Base: ₹{c.baseRate} | COD Fee: ₹{c.codCharge} | Fuel & GST: ₹{c.fuelSurcharge + c.gst}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xl font-black text-foreground">₹{c.totalRate}</span>
                        <p className="text-[10px] text-muted-foreground">All Inclusive Rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[250px] rounded-2xl border border-dashed border-border flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <Calculator className="h-8 w-8 mb-2 text-muted-foreground/60" />
                <p className="font-bold text-sm text-foreground">Instant Courier Comparison</p>
                <p className="text-xs max-w-sm mt-1">
                  Enter delivery pincodes and package dimensions to calculate real-time freight charges and SLA rankings.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. TAB 5: MANIFEST & HANDOVER */}
      {mainTab === "manifest" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span>Courier Handover Manifest Dispatch</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generate the official handover sheet required by logistics drivers during warehouse parcel collection.
              </p>
            </div>
            <button
              onClick={handleGenerateManifest}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Printer className="h-4 w-4" />
              <span>Generate & Print Manifest</span>
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-3">
            <Barcode className="h-12 w-12 text-muted-foreground mx-auto" />
            <h4 className="font-bold text-sm text-foreground">Ready for Handover ({shipments.length} Parcels)</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Click the button above to generate a barcoded manifest containing all manifested Shiprocket parcels for driver verification.
            </p>
          </div>
        </div>
      )}

      {/* 9. TAB 6: API CONFIGURATION */}
      {mainTab === "settings" && config && (
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                <span>Shiprocket API Credentials & Rules</span>
              </h3>
              <p className="text-xs text-muted-foreground">Manage your automated API tokens, webhooks, and default routing rules.</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {config.status}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">Environment Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-lg border cursor-pointer font-bold text-center ${
                    config.environment === "live" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="env_mode"
                    checked={config.environment === "live"}
                    onChange={() => setConfig({ ...config, environment: "live" })}
                    className="hidden"
                  />
                  <span>Live Production</span>
                </label>
                <label
                  className={`p-3 rounded-lg border cursor-pointer font-bold text-center ${
                    config.environment === "sandbox" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="env_mode"
                    checked={config.environment === "sandbox"}
                    onChange={() => setConfig({ ...config, environment: "sandbox" })}
                    className="hidden"
                  />
                  <span>Sandbox Testing</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">API Email</label>
                <input
                  type="email"
                  value={config.apiEmail}
                  onChange={(e) => setConfig({ ...config, apiEmail: e.target.value })}
                  className="w-full p-2.5 bg-background border border-input rounded-lg font-semibold text-foreground"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">API Token / Secret Key</label>
                <input
                  type="password"
                  value={config.apiToken}
                  onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
                  className="w-full p-2.5 bg-background border border-input rounded-lg font-mono text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">Webhook Secret Key</label>
              <input
                type="text"
                value={config.webhookSecret}
                onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
                className="w-full p-2.5 bg-background border border-input rounded-lg font-mono text-foreground"
              />
            </div>

            <div className="pt-2 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoManifestOnAwb}
                  onChange={(e) => setConfig({ ...config, autoManifestOnAwb: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-semibold text-foreground">Automatically create courier manifest upon AWB assignment</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.whatsappUpdates}
                  onChange={(e) => setConfig({ ...config, whatsappUpdates: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-semibold text-foreground">Send real-time WhatsApp live tracking alerts to patrons</span>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={async () => {
                  await updateShippingConfig(config);
                  toast.success("Shiprocket configuration saved successfully!");
                }}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODALS & DRAWERS ---------------- */}

      {/* 1. Track Shipment Drawer */}
      {trackingShipment && (
        <TrackShipmentDrawer
          shipment={trackingShipment}
          onClose={() => setTrackingShipment(null)}
        />
      )}

      {/* 2. Printable 4x6 Thermal Label */}
      {selectedShipmentForLabel && (
        <PrintableThermalLabelModal
          shipment={selectedShipmentForLabel}
          onClose={() => setSelectedShipmentForLabel(null)}
        />
      )}

      {/* 3. Schedule Pickup Modal */}
      {isPickupModalOpen && (
        <SchedulePickupModal
          hubs={pickupHubs}
          onClose={() => setIsPickupModalOpen(false)}
          onSuccess={() => {
            setIsPickupModalOpen(false);
            loadShipmentsData();
          }}
        />
      )}

      {/* 4. Add/Edit Hub Modal */}
      {isAddHubModalOpen && (
        <AddEditPickupHubModal
          hub={selectedHubForEdit}
          onClose={() => setIsAddHubModalOpen(false)}
          onSuccess={() => {
            setIsAddHubModalOpen(false);
            loadHubsData();
          }}
        />
      )}

      {/* 5. Cancel Shipment Modal */}
      {isCancelModalOpen && (
        <CancelShipmentModal
          shipment={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(null)}
          onSuccess={() => {
            setIsCancelModalOpen(null);
            loadShipmentsData();
          }}
        />
      )}

      {/* 6. Resolve NDR Modal */}
      {selectedNdrForAction && (
        <ResolveNdrModal
          ndr={selectedNdrForAction}
          onClose={() => setSelectedNdrForAction(null)}
          onSuccess={() => {
            setSelectedNdrForAction(null);
            loadNdrData();
            loadShipmentsData();
          }}
        />
      )}

      {/* 7. Printable Manifest Modal */}
      {generatedManifestData && (
        <PrintableManifestModal
          manifest={generatedManifestData}
          onClose={() => setGeneratedManifestData(null)}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Interactive Modal Components
// -------------------------------------------------------------

function TrackShipmentDrawer({
  shipment,
  onClose
}: {
  shipment: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl p-6 overflow-y-auto space-y-6 text-foreground animate-in slide-in-from-right">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <span>Live Shipment Tracking</span>
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">AWB: {shipment.awbCode}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Courier & Patron Card */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-foreground">{shipment.courier}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getShipmentStatusBadge(shipment.status)}`}>
              {shipment.status}
            </span>
          </div>
          <p className="text-muted-foreground">Order: #{shipment.orderId} • {shipment.packageWeight}</p>
          <p className="text-muted-foreground">Deliver to: <strong className="text-foreground">{shipment.customer?.name}</strong>, {shipment.customer?.city}</p>
        </div>

        {/* Timeline Pipeline */}
        <div className="space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Shipment Scans & Checkpoints</h4>
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-border">
            {shipment.trackingTimeline?.map((evt: any, i: number) => (
              <div key={i} className="relative flex items-start gap-3 pl-1 text-xs">
                <div className="h-5 w-5 rounded-full bg-card border-2 border-primary text-primary flex items-center justify-center shrink-0 z-10">
                  <Check className="h-3 w-3" />
                </div>
                <div className="bg-muted/40 p-3 rounded-lg border border-border flex-1">
                  <div className="flex justify-between items-center flex-wrap gap-1 font-bold text-foreground">
                    <span>{evt.status || evt.title}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">{evt.time}</span>
                  </div>
                  {evt.location && <p className="text-[11px] text-primary/80 mt-0.5">{evt.location}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground">
            Close Tracking
          </button>
        </div>
      </div>
    </div>
  );
}

function PrintableThermalLabelModal({
  shipment,
  onClose
}: {
  shipment: any;
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
            Shiprocket 4x6 Thermal Courier Label
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Label</span>
            </button>
            <button onClick={onClose} className="p-1 rounded text-neutral-500 hover:text-neutral-900">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 text-xs font-sans text-neutral-900 border-4 border-dashed border-neutral-300 m-4 rounded">
          <div className="flex justify-between items-center border-b-2 border-neutral-900 pb-2">
            <span className="font-black text-base tracking-tight text-blue-900">SHIPROCKET</span>
            <span className="font-black text-sm uppercase px-2 py-0.5 bg-neutral-900 text-white rounded">
              {shipment.paymentType.includes("COD") ? "COD ₹" + shipment.orderAmount : "PREPAID"}
            </span>
          </div>

          <div className="text-center py-2 border-b-2 border-neutral-900 space-y-1">
            <p className="font-bold text-sm uppercase">{shipment.courier}</p>
            <div className="h-12 bg-neutral-900 text-white flex items-center justify-center font-mono text-xs tracking-widest px-2">
              ||| | ||||| || |||||||| |||| | ||| |||||||
            </div>
            <p className="font-mono font-bold text-xs tracking-wider">{shipment.awbCode}</p>
          </div>

          <div className="border-b-2 border-neutral-900 pb-3 space-y-1">
            <p className="font-bold text-[10px] uppercase text-neutral-500">SHIP TO / DELIVER TO:</p>
            <p className="font-black text-sm text-neutral-900">{shipment.customer?.name}</p>
            <p className="text-xs text-neutral-800">{shipment.customer?.address}</p>
            <p className="text-xs font-bold text-neutral-900">
              {shipment.customer?.city}, {shipment.customer?.state} — PIN: {shipment.customer?.pincode}
            </p>
            <p className="text-xs font-bold text-neutral-900">TEL: {shipment.customer?.phone}</p>
          </div>

          <div className="border-b-2 border-neutral-900 pb-2 text-[10px] text-neutral-600">
            <p className="font-bold uppercase text-neutral-800">RETURN IF UNDELIVERED TO:</p>
            <p className="font-bold text-neutral-900">{shipment.pickupLocation}</p>
            <p>Plot 44, Food Processing Zone, KIADB, Bengaluru, KA - 560100</p>
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold text-neutral-800 pt-1">
            <span>Order #{shipment.orderId}</span>
            <span>Weight: {shipment.packageWeight}</span>
            <span>Items: {shipment.itemsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchedulePickupModal({
  hubs,
  onClose,
  onSuccess
}: {
  hubs: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [hubId, setHubId] = useState(hubs[0]?.id || "HUB-BLR-01");
  const [pickupDate, setPickupDate] = useState("2026-09-12");
  const [timeSlot, setTimeSlot] = useState("02:00 PM - 06:00 PM");
  const [packages, setPackages] = useState(8);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await schedulePickup({
        pickupLocationId: hubId,
        pickupDate,
        timeSlot,
        expectedPackagesCount: packages
      });
      if (res?.success) {
        toast.success(res.message);
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to schedule pickup");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Schedule Courier Pickup
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-muted-foreground block mb-1">Pickup Facility (Hub)</label>
            <select
              value={hubId}
              onChange={(e) => setHubId(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-lg font-semibold text-foreground"
            >
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">Pickup Date</label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full p-2 bg-background border border-input rounded-lg text-foreground font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-muted-foreground block mb-1">Expected Parcels</label>
              <input
                type="number"
                value={packages}
                onChange={(e) => setPackages(Number(e.target.value))}
                className="w-full p-2 bg-background border border-input rounded-lg text-foreground font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-muted-foreground block mb-1">Time Slot Window</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-lg font-semibold text-foreground"
            >
              <option value="10:00 AM - 01:00 PM">Morning (10:00 AM - 01:00 PM)</option>
              <option value="02:00 PM - 06:00 PM">Afternoon / Evening (02:00 PM - 06:00 PM)</option>
            </select>
          </div>
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
            {submitting ? "Booking..." : "Confirm Pickup Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddEditPickupHubModal({
  hub,
  onClose,
  onSuccess
}: {
  hub?: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(hub?.name || "");
  const [contactPerson, setContactPerson] = useState(hub?.contactPerson || "");
  const [phone, setPhone] = useState(hub?.phone || "+91 ");
  const [address, setAddress] = useState(hub?.address || "");
  const [city, setCity] = useState(hub?.city || "Bengaluru");
  const [state, setState] = useState(hub?.state || "Karnataka");
  const [pincode, setPincode] = useState(hub?.pincode || "560100");
  const [isDefault, setIsDefault] = useState(Boolean(hub?.isDefault));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim() || !pincode.trim()) {
      toast.error("Please fill required fields (Name, Address, Pincode)");
      return;
    }
    try {
      setSubmitting(true);
      if (hub) {
        await updatePickupLocation(hub.id, { name, contactPerson, phone, address, city, state, pincode, isDefault });
        toast.success("Pickup Hub updated!");
      } else {
        await createPickupLocation({ name, contactPerson, phone, address, city, state, pincode, isDefault });
        toast.success("New Pickup Hub registered!");
      }
      onSuccess();
    } catch (err) {
      toast.error("Failed to save hub");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span>{hub ? "Edit Pickup Hub" : "Add New Pickup Location"}</span>
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-muted-foreground block mb-1">Facility Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hyderabad Agro-Logistics Depot"
              className="w-full p-2 bg-background border border-input rounded-lg font-semibold text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">Contact Supervisor</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full p-2 bg-background border border-input rounded-lg text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-muted-foreground block mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 bg-background border border-input rounded-lg text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-muted-foreground block mb-1">Complete Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 bg-background border border-input rounded-lg text-foreground"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 bg-background border border-input rounded-lg text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-muted-foreground block mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2 bg-background border border-input rounded-lg text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-muted-foreground block mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full p-2 bg-background border border-input rounded-lg font-mono text-foreground font-bold"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
            />
            <span className="font-semibold text-foreground">Set as Default Primary Dispatch Hub</span>
          </label>
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
            {submitting ? "Saving..." : "Save Pickup Hub"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelShipmentModal({
  shipment,
  onClose,
  onSuccess
}: {
  shipment: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("Customer requested cancellation before courier pickup");
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async () => {
    try {
      setSubmitting(true);
      const res = await cancelShipment(shipment.awbCode, reason);
      if (res?.success) {
        toast.success(`Shipment ${shipment.awbCode} cancelled and voided.`);
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to cancel shipment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-base flex items-center gap-2 text-rose-600">
            <AlertCircle className="h-5 w-5" />
            Void AWB & Cancel Shipment
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          This will void AWB <strong>{shipment.awbCode}</strong> with {shipment.courier} and cancel courier driver dispatch.
        </p>

        <div>
          <label className="font-bold text-muted-foreground block mb-1 text-xs">Cancellation Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 bg-background border border-input rounded-lg text-sm text-foreground"
          />
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
            {submitting ? "Voiding..." : "Confirm Void AWB"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResolveNdrModal({
  ndr,
  onClose,
  onSuccess
}: {
  ndr: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [action, setAction] = useState<"reattempt" | "update_info" | "rto">(ndr.actionType || "reattempt");
  const [reattemptDate, setReattemptDate] = useState("Tomorrow 10:00 AM");
  const [updatedPhone, setUpdatedPhone] = useState(ndr.customerPhone || "");
  const [updatedAddress, setUpdatedAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await handleNdrAction(ndr.id, {
        action,
        note,
        reattemptDate,
        updatedPhone,
        updatedAddress
      });
      if (res?.success) {
        toast.success(res.message);
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to record NDR action");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-base flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Resolve NDR: {ndr.awbCode}
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-muted-foreground block mb-1">Resolution Strategy</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setAction("reattempt")}
                className={`p-2 rounded-lg border font-bold text-center ${
                  action === "reattempt" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                }`}
              >
                Re-attempt
              </button>
              <button
                onClick={() => setAction("update_info")}
                className={`p-2 rounded-lg border font-bold text-center ${
                  action === "update_info" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                }`}
              >
                Edit Details
              </button>
              <button
                onClick={() => setAction("rto")}
                className={`p-2 rounded-lg border font-bold text-center ${
                  action === "rto" ? "bg-rose-600 text-white border-rose-600" : "border-border text-muted-foreground"
                }`}
              >
                Trigger RTO
              </button>
            </div>
          </div>

          {action === "reattempt" && (
            <div>
              <label className="font-bold text-muted-foreground block mb-1">Preferred Re-attempt Timing</label>
              <input
                type="text"
                value={reattemptDate}
                onChange={(e) => setReattemptDate(e.target.value)}
                className="w-full p-2 bg-background border border-input rounded-lg text-foreground font-semibold"
              />
            </div>
          )}

          {action === "update_info" && (
            <div className="space-y-2">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Updated Alternate Phone</label>
                <input
                  type="text"
                  value={updatedPhone}
                  onChange={(e) => setUpdatedPhone(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Updated Landmark / Address</label>
                <input
                  type="text"
                  value={updatedAddress}
                  onChange={(e) => setUpdatedAddress(e.target.value)}
                  placeholder="e.g. Near Big Banyan Tree, House 14"
                  className="w-full p-2 bg-background border border-input rounded-lg text-foreground"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-muted-foreground block mb-1">Internal Note for Courier Driver</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Spoke to customer, available after 2 PM"
              className="w-full p-2 bg-background border border-input rounded-lg text-foreground"
            />
          </div>
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
            {submitting ? "Syncing..." : "Submit to Shiprocket"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PrintableManifestModal({
  manifest,
  onClose
}: {
  manifest: any;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-white text-neutral-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-3 bg-neutral-100 border-b border-neutral-300 flex items-center justify-between no-print">
          <span className="text-sm font-bold text-neutral-800 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            Official Courier Handover Manifest Sheet
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Manifest</span>
            </button>
            <button onClick={onClose} className="p-1 rounded text-neutral-500 hover:text-neutral-900">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto space-y-4 text-xs font-sans text-neutral-900">
          <div className="flex justify-between items-start border-b-2 border-neutral-900 pb-3">
            <div>
              <h2 className="text-lg font-black tracking-tight text-neutral-900">SHIPROCKET COURIER HANDOVER MANIFEST</h2>
              <p className="text-neutral-600">Origin Facility: {manifest.pickupHub}</p>
              <p className="text-neutral-600">{manifest.hubAddress}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-sm text-neutral-900">{manifest.manifestId}</p>
              <p className="text-neutral-500">Date: {manifest.generatedAt}</p>
              <p className="font-bold text-indigo-900">{manifest.totalParcels} Total Parcels ({manifest.totalWeight})</p>
            </div>
          </div>

          <table className="w-full text-left border border-neutral-300">
            <thead>
              <tr className="bg-neutral-200 text-neutral-800 font-bold uppercase text-[10px]">
                <th className="py-2 px-2 w-8">#</th>
                <th className="py-2 px-3">AWB Barcode Number</th>
                <th className="py-2 px-2.5">Order ID</th>
                <th className="py-2 px-3">Carrier Partner</th>
                <th className="py-2 px-3">Destination City</th>
                <th className="py-2 px-2 text-center">Weight</th>
                <th className="py-2 px-2 text-center">Scan Verify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {manifest.shipments?.map((s: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-2 px-2 text-neutral-600">{idx + 1}</td>
                  <td className="py-2 px-3 font-mono font-bold text-neutral-900">{s.awbCode}</td>
                  <td className="py-2 px-2.5 font-semibold text-neutral-800">{s.orderId}</td>
                  <td className="py-2 px-3 text-neutral-700">{s.courier}</td>
                  <td className="py-2 px-3 text-neutral-700">{s.customer?.city || "India"}</td>
                  <td className="py-2 px-2 text-center font-bold text-neutral-800">{s.packageWeight}</td>
                  <td className="py-2 px-2 text-center">
                    <div className="h-4 w-4 border border-neutral-400 rounded mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-neutral-800 pt-6 grid grid-cols-2 gap-8 text-[11px]">
            <div className="space-y-1">
              <p className="font-bold text-neutral-900">Janani Agro Warehouse Dispatcher:</p>
              <div className="h-10 border-b border-neutral-400 w-48"></div>
              <p className="text-neutral-500">Name & Signature</p>
            </div>

            <div className="text-right space-y-1">
              <p className="font-bold text-neutral-900">Courier Pickup Executive:</p>
              <div className="h-10 border-b border-neutral-400 w-48 inline-block"></div>
              <p className="text-neutral-500">Signature & Driver Contact</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
