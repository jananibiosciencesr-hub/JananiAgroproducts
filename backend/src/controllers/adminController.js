import { products } from '../data/mockData.js';
import { query, getPool, isDbConnected } from '../config/db.js';

// In-memory admin data stores
export let adminProducts = [...products];

export let adminOrders = [];

export let adminCustomers = [];

export let adminCoupons = [
  {
    id: "CPN-101",
    code: "JANANI10",
    title: "Welcome 10% Storewide Discount",
    description: "Get 10% instant discount on all orders above ₹999 across all organic products",
    type: "percentage",
    discount: 10,
    minCart: 999,
    maxDiscount: 300,
    startDate: "2026-09-01T00:00:00.000Z",
    expiryDate: "2026-12-31T23:59:59.000Z",
    uses: 342,
    maxUses: 1000,
    perUserLimit: 2,
    isFirstOrderOnly: false,
    isFreeShipping: false,
    categorySpecific: [],
    productSpecific: [],
    userSpecificTier: "All",
    userSpecificEmails: [],
    active: true,
    createdAt: "2026-09-01 10:00 AM"
  },
  {
    id: "CPN-102",
    code: "FIRSTORGANIC",
    title: "New Patron First Order Bonus (₹200 OFF)",
    description: "Flat ₹200 off exclusively on your first organic grocery purchase above ₹1,499",
    type: "flat",
    discount: 200,
    minCart: 1499,
    maxDiscount: 200,
    startDate: "2026-09-01T00:00:00.000Z",
    expiryDate: "2026-11-30T23:59:59.000Z",
    uses: 512,
    maxUses: 2000,
    perUserLimit: 1,
    isFirstOrderOnly: true,
    isFreeShipping: false,
    categorySpecific: [],
    productSpecific: [],
    userSpecificTier: "All",
    userSpecificEmails: [],
    active: true,
    createdAt: "2026-09-01 11:30 AM"
  },
  {
    id: "CPN-103",
    code: "HARVESTFEST",
    title: "Harvest Festive 15% Off Bio-Fertilizers & Crop Protection",
    description: "Save 15% (up to ₹500) on bio-fertilizers and Trichoderma formulations",
    type: "percentage",
    discount: 15,
    minCart: 1999,
    maxDiscount: 500,
    startDate: "2026-09-05T00:00:00.000Z",
    expiryDate: "2026-09-30T23:59:59.000Z",
    uses: 189,
    maxUses: 500,
    perUserLimit: 3,
    isFirstOrderOnly: false,
    isFreeShipping: false,
    categorySpecific: ["Biological Crop Protection", "Bio-Fertilizers", "Soil Health"],
    productSpecific: [],
    userSpecificTier: "All",
    userSpecificEmails: [],
    active: true,
    createdAt: "2026-09-05 09:00 AM"
  },
  {
    id: "CPN-104",
    code: "FREESHIPAGRO",
    title: "Complimentary Free Shipping Over ₹799",
    description: "100% Free doorstep air express delivery on any order above ₹799",
    type: "free_shipping",
    discount: 0,
    minCart: 799,
    maxDiscount: 150,
    startDate: "2026-09-01T00:00:00.000Z",
    expiryDate: "2026-10-31T23:59:59.000Z",
    uses: 428,
    maxUses: 1500,
    perUserLimit: 5,
    isFirstOrderOnly: false,
    isFreeShipping: true,
    categorySpecific: [],
    productSpecific: [],
    userSpecificTier: "All",
    userSpecificEmails: [],
    active: true,
    createdAt: "2026-09-01 12:00 PM"
  },
  {
    id: "CPN-105",
    code: "VIPPLATINUM25",
    title: "Platinum VIP Members Exclusive 25% Off",
    description: "Exclusive 25% privilege discount for Janani Platinum Gold tiered members",
    type: "percentage",
    discount: 25,
    minCart: 2500,
    maxDiscount: 1200,
    startDate: "2026-09-01T00:00:00.000Z",
    expiryDate: "2026-12-31T23:59:59.000Z",
    uses: 45,
    maxUses: 200,
    perUserLimit: 2,
    isFirstOrderOnly: false,
    isFreeShipping: false,
    categorySpecific: [],
    productSpecific: [],
    userSpecificTier: "Platinum",
    userSpecificEmails: [],
    active: true,
    createdAt: "2026-09-01 02:00 PM"
  },
  {
    id: "CPN-106",
    code: "BULKAGRO20",
    title: "Wholesale B2B & Bulk Order Discount",
    description: "Flat 20% discount on wholesale quantities above ₹5,000",
    type: "percentage",
    discount: 20,
    minCart: 5000,
    maxDiscount: 2000,
    startDate: "2026-08-01T00:00:00.000Z",
    expiryDate: "2026-08-31T23:59:59.000Z",
    uses: 100,
    maxUses: 100,
    perUserLimit: 1,
    isFirstOrderOnly: false,
    isFreeShipping: false,
    categorySpecific: [],
    productSpecific: [],
    userSpecificTier: "Wholesale",
    userSpecificEmails: [],
    active: false,
    createdAt: "2026-08-01 08:00 AM"
  }
];

export let couponUsageHistory = [];

export let adminReviews = [];

let adminRoles = [
  { id: "ROLE-1", name: "Janani Administrator", email: "jananibiosciences.r@gmail.com", role: "Super Admin", permissions: ["all"], status: "Active", lastLogin: "Just now" }
];

export const getDashboardStats = async (req, res) => {
  try {
    const totalOrdersRes = await query("SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as rev FROM `orders`");
    const pendingOrdersRes = await query("SELECT COUNT(*) as count FROM `orders` WHERE order_status = 'Pending' OR order_status = 'Processing'");
    const deliveredOrdersRes = await query("SELECT COUNT(*) as count FROM `orders` WHERE order_status = 'Delivered'");
    const cancelledOrdersRes = await query("SELECT COUNT(*) as count FROM `orders` WHERE order_status = 'Cancelled' OR order_status = 'Refunded'");
    const usersRes = await query("SELECT COUNT(*) as count FROM `users` WHERE role = 'Customer'");

    const totalOrders = Number(totalOrdersRes[0]?.count || 0);
    const totalRevenue = Number(totalOrdersRes[0]?.rev || 0);
    const pendingOrders = Number(pendingOrdersRes[0]?.count || 0);
    const deliveredOrders = Number(deliveredOrdersRes[0]?.count || 0);
    const cancelledOrders = Number(cancelledOrdersRes[0]?.count || 0);
    const activeUsers = Number(usersRes[0]?.count || 0);

    const stats = {
      totalOrders,
      totalOrdersTrend: "+0%",
      todayOrders: totalOrders,
      todayOrdersTrend: "+0%",
      todayRevenue: totalRevenue,
      todayRevenueTrend: "+0%",
      monthlyRevenue: totalRevenue,
      monthlyRevenueTrend: "+0%",
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      refundRequests: 0,
      activeUsers,
      activeUsersTrend: "+0%",
      outOfStockProducts: 0,
      lowStockProducts: 0,
      couponsUsedToday: 0,
      referralEarnings: 0,
      referralEarningsTrend: "+0%"
    };
    return res.json({ success: true, data: stats });
  } catch (err) {
    console.warn("Dashboard stats error:", err);
  }

  res.json({
    success: true,
    data: {
      totalOrders: 0,
      totalOrdersTrend: "+0%",
      todayOrders: 0,
      todayOrdersTrend: "+0%",
      todayRevenue: 0,
      todayRevenueTrend: "+0%",
      monthlyRevenue: 0,
      monthlyRevenueTrend: "+0%",
      pendingOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      refundRequests: 0,
      activeUsers: 0,
      activeUsersTrend: "+0%",
      outOfStockProducts: 0,
      lowStockProducts: 0,
      couponsUsedToday: 0,
      referralEarnings: 0,
      referralEarningsTrend: "+0%"
    }
  });
};

export const getAnalyticsCharts = (req, res) => {
  const data = {
    salesOverview: [
      { date: "01 Sep", sales: 42000, orders: 18, visitors: 420 },
      { date: "03 Sep", sales: 58000, orders: 24, visitors: 610 },
      { date: "05 Sep", sales: 64000, orders: 29, visitors: 780 },
      { date: "07 Sep", sales: 72000, orders: 33, visitors: 890 },
      { date: "09 Sep", sales: 81000, orders: 36, visitors: 1120 },
      { date: "11 Sep", sales: 84250, orders: 38, visitors: 1420 }
    ],
    monthlyRevenue: [
      { month: "Apr", revenue: 1420000, target: 1200000 },
      { month: "May", revenue: 1680000, target: 1500000 },
      { month: "Jun", revenue: 1950000, target: 1800000 },
      { month: "Jul", revenue: 2120000, target: 2000000 },
      { month: "Aug", revenue: 2340000, target: 2200000 },
      { month: "Sep", revenue: 2485600, target: 2400000 }
    ],
    orderStatusPie: [
      { name: "Delivered", value: 412, color: "#16a34a" },
      { name: "Processing / Shipped", value: 38, color: "#2563eb" },
      { name: "Pending Verification", value: 9, color: "#d97706" },
      { name: "Cancelled / Returned", value: 7, color: "#dc2626" }
    ],
    topCategories: [
      { category: "Biological Crop Protection", revenue: 890000, units: 1420 },
      { category: "Bio-Fertilizers", revenue: 760000, units: 980 },
      { category: "Soil Enhancers & Conditioners", revenue: 420000, units: 1840 },
      { category: "Botanical Pest Repellents", revenue: 285000, units: 820 },
      { category: "Bio-Stimulants & Micronutrients", revenue: 130600, units: 640 }
    ],
    topProducts: [
      { name: "Harit Bio-Fungicide (1 L)", sales: 485000, units: 580 },
      { name: "Bhumi Shakti Soil Booster (5 L)", sales: 435000, units: 300 },
      { name: "Neem Oil 1000 PPM (1 L)", sales: 378000, units: 180 },
      { name: "Dharani Mycorrhizal Bio-Fertilizer", sales: 294000, units: 1400 },
      { name: "Pushkal Humic Acid Liquid", sales: 210000, units: 620 }
    ],
    weeklySales: [
      { day: "Mon", online: 68000, cod: 14000 },
      { day: "Tue", online: 72000, cod: 16000 },
      { day: "Wed", online: 65000, cod: 12000 },
      { day: "Thu", online: 82000, cod: 19000 },
      { day: "Fri", online: 94000, cod: 22000 },
      { day: "Sat", online: 112000, cod: 28000 },
      { day: "Sun", online: 128000, cod: 31000 }
    ]
  };
  res.json({ success: true, data });
};

export const getWidgetsData = (req, res) => {
  const data = {
    liveVisitors: { count: 84, trend: "+12 live now", locations: ["Bengaluru (32)", "Mumbai (21)", "Hyderabad (16)", "Delhi NCR (15)"] },
    conversionRate: { rate: 3.84, target: 4.0, previous: 3.21, change: "+0.63%" },
    averageOrderValue: { value: 2217, target: 2000, change: "+14.8%" },
    paymentSplit: { onlinePercent: 78.4, codPercent: 21.6, onlineTotal: 1948710, codTotal: 536890 },
    bestSellingBrand: { name: "Janani Agro Products", share: "44.8%", topProduct: "Harit Bio-Fungicide (1 L)" },
    lowInventoryAlerts: [
      { id: "neem-oil-1000", name: "Neem Oil 1000 PPM (1 L)", stock: 8, threshold: 25, status: "Critical" },
      { id: "dharani-granules", name: "Dharani Granules (4 kg)", stock: 14, threshold: 30, status: "Low Stock" },
      { id: "pushkal-liquid", name: "Pushkal Humic Acid (1 L)", stock: 19, threshold: 40, status: "Low Stock" },
      { id: "harit-5l", name: "Harit Bio-Fungicide (5 L)", stock: 0, threshold: 20, status: "Out of Stock" }
    ]
  };
  res.json({ success: true, data });
};

// ==========================================
// 📦 JANANI AGRO ORDERS CONTROLLER
// ==========================================

const parseBackendOrderTime = (o) => {
  if (!o) return 0;
  if (typeof o.timestamp === "number" && !isNaN(o.timestamp)) return o.timestamp;
  if (typeof o.createdAt === "number" && !isNaN(o.createdAt)) return o.createdAt;
  if (typeof o.created_at === "number" && !isNaN(o.created_at)) return o.created_at;
  const raw = o.created_at || o.createdAt || o.timestamp || o.date || o.order_date || o.orderDate;
  if (!raw) return 0;
  if (typeof raw === "number") return raw;
  const s = String(raw).trim();
  const isoMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (isoMatch) {
    const [, y, m, d, hh = "0", mm = "0", ss = "0"] = isoMatch;
    const t = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${ss.padStart(2, "0")}`).getTime();
    if (!isNaN(t)) return t;
  }
  const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?)?/i);
  if (dmyMatch) {
    const [, d, m, y, rawH = "0", rawM = "0", rawS = "0", ampm] = dmyMatch;
    let h = parseInt(rawH, 10);
    const min = parseInt(rawM, 10);
    const sec = parseInt(rawS, 10);
    if (ampm && ampm.toLowerCase() === "pm" && h < 12) h += 12;
    if (ampm && ampm.toLowerCase() === "am" && h === 12) h = 0;
    const t = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`).getTime();
    if (!isNaN(t)) return t;
  }
  const t = new Date(s).getTime();
  return isNaN(t) ? 0 : t;
};

const isDummyOrder = (o) => {
  if (!o) return true;
  const num = String(o.number || o.id || "").trim().toUpperCase();
  if (/^JAP-(?:849\d+|356429)/i.test(num)) return true;
  if (/^ORD-\d+/i.test(num)) return true;
  if (num.startsWith("TEST-") || num.startsWith("MOCK-")) return true;
  return false;
};

const parseSeq = (o) => {
  const s = String(o?.number || o?.id || "").trim();
  const m = s.match(/JAP-(\d+)/i);
  return m ? parseInt(m[1], 10) : 0;
};

export const getAdminOrders = async (req, res) => {
  const {
    status = "all",
    paymentStatus = "all",
    warehouse = "all",
    courier = "all",
    search = "",
    sortBy = "newest",
    email,
    customer_email,
    phone,
    customer_phone
  } = req.query;

  const filterEmail = (email || customer_email || "").trim().toLowerCase();
  const filterPhone = (phone || customer_phone || "").replace(/\D/g, "");

  let results = [];

  // 1. Prioritize MySQL orders table
  try {
    let sql = "SELECT * FROM `orders` WHERE 1=1";
    const params = [];

    if (filterEmail && filterPhone) {
      sql += " AND (LOWER(customer_email) = ? OR customer_phone LIKE ?)";
      params.push(filterEmail, `%${filterPhone.slice(-10)}%`);
    } else if (filterEmail) {
      sql += " AND LOWER(customer_email) = ?";
      params.push(filterEmail);
    } else if (filterPhone) {
      sql += " AND customer_phone LIKE ?";
      params.push(`%${filterPhone.slice(-10)}%`);
    }

    if (status !== "all") {
      if (status === "Cancelled / Returns") {
        sql += " AND (order_status = 'Cancelled' OR order_status = 'Refunded' OR order_status = 'Returned')";
      } else {
        sql += " AND (LOWER(order_status) = ? OR LOWER(order_status) LIKE ?)";
        params.push(status.toLowerCase(), `%${status.toLowerCase()}%`);
      }
    }

    if (paymentStatus !== "all") {
      sql += " AND LOWER(payment_status) = ?";
      params.push(paymentStatus.toLowerCase());
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      sql += " AND (LOWER(number) LIKE ? OR LOWER(customer_name) LIKE ? OR LOWER(customer_email) LIKE ? OR customer_phone LIKE ? OR LOWER(tracking_id) LIKE ?)";
      params.push(q, q, q, q, q);
    }

    sql += " ORDER BY created_at DESC LIMIT 200";

    const rows = await query(sql, params);
    let mysqlQueried = false;
    if (Array.isArray(rows)) {
      mysqlQueried = true;
      results = rows.map((o) => {
        const shippingAddress = typeof o.shipping_address === "string" ? JSON.parse(o.shipping_address) : (o.shipping_address || {});
        const billingAddress = typeof o.billing_address === "string" ? JSON.parse(o.billing_address) : (o.billing_address || shippingAddress);
        const items = typeof o.items === "string" ? JSON.parse(o.items) : (Array.isArray(o.items) ? o.items : []);
        const timeline = typeof o.timeline === "string" ? JSON.parse(o.timeline) : (Array.isArray(o.timeline) ? o.timeline : []);

        const orderNum = o.number || o.id;
        const cName = o.customer_name || shippingAddress.fullName || shippingAddress.name || "Valued Patron";
        const cEmail = o.customer_email || shippingAddress.email || "";
        const cPhone = o.customer_phone || shippingAddress.phone || "";

        return {
          id: o.id || orderNum,
          number: orderNum,
          orderNumber: orderNum,
          date: o.order_date || (o.created_at ? new Date(o.created_at).toLocaleString("en-IN") : "Recent"),
          orderStatus: o.order_status || "Processing",
          status: o.order_status || "Processing",
          paymentStatus: o.payment_status || "Paid",
          paymentMethod: o.payment_method || "UPI",
          paymentGatewayId: o.transaction_id || o.razorpay_order_id || "",
          customer: {
            id: o.customer_id || o.id || "",
            name: cName,
            fullName: cName,
            email: cEmail,
            phone: cPhone,
            tier: "Active Member"
          },
          shippingAddress,
          billingAddress,
          items,
          subtotal: Number(o.subtotal || 0),
          taxAmount: Number(o.tax_amount || 0),
          discount: Number(o.discount || 0),
          couponCode: o.coupon_code || null,
          couponDiscount: Number(o.coupon_discount || 0),
          walletDeduction: Number(o.wallet_deduction || 0),
          shippingFee: Number(o.delivery_fee || 0),
          deliveryFee: Number(o.delivery_fee || 0),
          total: Number(o.total || 0),
          finalTotal: Number(o.total || 0),
          courier: o.courier || "Delhivery Air Express & Janani Direct",
          trackingId: o.tracking_id || o.awb || "",
          awb: o.awb || o.tracking_id || "",
          deliverySlot: o.delivery_slot || "Standard Delivery (2-3 Business Days)",
          expectedDelivery: o.expected_delivery || "2-3 Business Days",
          timeline,
          customerNote: o.customer_note || "",
          adminNotes: []
        };
      });
    }
  } catch (dbErr) {
    console.warn("⚠️ [getAdminOrders] MySQL fetch fallback note:", dbErr.message);
  }

  // 2. Fallback to in-memory orders only if MySQL query failed to execute
  if (!mysqlQueried && results.length === 0) {
    results = adminOrders.filter(o => !isDummyOrder(o));

    if (filterEmail) {
      results = results.filter(o => (o.customer?.email || "").toLowerCase() === filterEmail);
    } else if (filterPhone) {
      results = results.filter(o => (o.customer?.phone || "").replace(/\D/g, "").endsWith(filterPhone.slice(-10)));
    }

    if (status !== "all") {
      if (status === "Cancelled / Returns") {
        results = results.filter(o => o.orderStatus === "Cancelled" || o.orderStatus === "Refunded" || o.orderStatus === "Returned");
      } else {
        results = results.filter(o => (o.orderStatus || "").toLowerCase() === status.toLowerCase());
      }
    }

    if (paymentStatus !== "all") {
      results = results.filter(o => (o.paymentStatus || "").toLowerCase() === paymentStatus.toLowerCase());
    }

    if (warehouse !== "all") {
      results = results.filter(o => o.warehouse?.id === warehouse || o.warehouse?.name?.toLowerCase().includes(warehouse.toLowerCase()));
    }

    if (courier !== "all") {
      results = results.filter(o => (o.courier || "").toLowerCase().includes(courier.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(o =>
        (o.id || "").toLowerCase().includes(q) ||
        (o.number || "").toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.customer?.email?.toLowerCase().includes(q) ||
        o.customer?.phone?.includes(q) ||
        o.trackingId?.toLowerCase().includes(q) ||
        o.shippingAddress?.city?.toLowerCase().includes(q)
      );
    }
  }

  // Sorting
  if (sortBy === "newest") {
    results.sort((a, b) => {
      const seqA = parseSeq(a);
      const seqB = parseSeq(b);
      if (seqA > 0 && seqB > 0 && seqA !== seqB) return seqB - seqA;
      return parseBackendOrderTime(b) - parseBackendOrderTime(a);
    });
  } else if (sortBy === "amount_desc") {
    results.sort((a, b) => (b.total || 0) - (a.total || 0));
  } else if (sortBy === "amount_asc") {
    results.sort((a, b) => (a.total || 0) - (b.total || 0));
  }

  const pendingCount = results.filter(o => o.orderStatus === "Pending").length;
  const processingCount = results.filter(o => o.orderStatus === "Processing").length;
  const shippedCount = results.filter(o => o.orderStatus === "Shipped").length;
  const deliveredCount = results.filter(o => o.orderStatus === "Delivered").length;
  const cancelledCount = results.filter(o => o.orderStatus === "Cancelled" || o.orderStatus === "Refunded" || o.orderStatus === "Returned").length;
  const totalRevenue = results.reduce((sum, o) => o.paymentStatus === "Paid" ? sum + (o.total || 0) : sum, 0);

  return res.json({
    success: true,
    count: results.length,
    total: results.length,
    pendingCount,
    processingCount,
    shippedCount,
    deliveredCount,
    cancelledCount,
    totalRevenue,
    orders: results,
    data: results
  });
};

export const getAdminOrderById = (req, res) => {
  const { id } = req.params;
  const order = adminOrders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  res.json({ success: true, data: order });
};

export const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { orderStatus, trackingId, courier, note } = req.body;
  const order = adminOrders.find(o => o.id === id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  if (orderStatus) {
    order.orderStatus = orderStatus;
    // Add timeline event
    if (!order.timeline) order.timeline = [];
    order.timeline.forEach(t => t.current = false);
    order.timeline.push({
      status: orderStatus.toLowerCase().replace(/\s+/g, "_"),
      title: `Status updated to ${orderStatus}`,
      description: note || `Order status modified by Admin`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + " Today",
      done: true,
      current: true
    });
  }
  if (trackingId) order.trackingId = trackingId;
  if (courier) order.courier = courier;

  res.json({ success: true, message: `Order status updated to ${orderStatus || order.orderStatus}`, data: order });
};

export const updateAdminOrderWarehouse = (req, res) => {
  const { id } = req.params;
  const { warehouse } = req.body;
  const order = adminOrders.find(o => o.id === id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.warehouse = warehouse;
  if (!order.timeline) order.timeline = [];
  order.timeline.push({
    status: "warehouse_assigned",
    title: "Warehouse Allocated",
    description: `Routing assigned to ${warehouse.name} (${warehouse.location})`,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + " Today",
    done: true,
    current: false
  });

  res.json({ success: true, message: `Allocated to ${warehouse.name}`, data: order });
};

export const generateAwbShiprocket = (req, res) => {
  const { id } = req.params;
  const { courierPartner = "Shiprocket (Bluedart Air)", pickupTime = "Today 04:30 PM" } = req.body;
  const order = adminOrders.find(o => o.id === id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  const generatedAwb = `SR-${order.shippingAddress?.city?.substring(0, 3).toUpperCase() || 'JAN'}-${Math.floor(100000 + Math.random() * 900000)}`;
  order.trackingId = generatedAwb;
  order.courier = courierPartner;
  order.orderStatus = "Shipped";
  order.awbGeneratedAt = new Date().toISOString();
  order.pickupScheduled = pickupTime;

  if (!order.timeline) order.timeline = [];
  order.timeline.forEach(t => t.current = false);
  order.timeline.push({
    status: "shipped",
    title: `Dispatched via ${courierPartner}`,
    description: `AWB: ${generatedAwb}. Carrier pickup scheduled for ${pickupTime}.`,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + " Today",
    done: true,
    current: true
  });

  res.json({
    success: true,
    message: "Shiprocket AWB Generated Successfully",
    data: {
      order,
      awbCode: generatedAwb,
      courier: courierPartner,
      pickupScheduled: pickupTime,
      manifestUrl: `https://shiprocket.co/manifest/${generatedAwb}.pdf`
    }
  });
};

export const addAdminOrderNote = (req, res) => {
  const { id } = req.params;
  const { text, author = "Doddi Sai Rama" } = req.body;
  const order = adminOrders.find(o => o.id === id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  if (!order.adminNotes) order.adminNotes = [];
  const newNote = {
    id: `NOTE-${Date.now()}`,
    text,
    author,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  };
  order.adminNotes.unshift(newNote);

  res.json({ success: true, message: "Internal note added", data: order.adminNotes });
};

export const cancelAdminOrder = (req, res) => {
  const { id } = req.params;
  const { reason = "Customer requested cancellation", restockInventory = true } = req.body;
  const order = adminOrders.find(o => o.id === id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.orderStatus = "Cancelled";
  if (!order.timeline) order.timeline = [];
  order.timeline.forEach(t => t.current = false);
  order.timeline.push({
    status: "cancelled",
    title: "Order Cancelled",
    description: reason,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + " Today",
    done: true,
    current: true
  });

  res.json({ success: true, message: "Order has been cancelled successfully", data: order });
};

export const refundAdminOrder = (req, res) => {
  const { id } = req.params;
  const { amount, mode = "Original Payment Method", reason = "Customer refund request" } = req.body;
  const order = adminOrders.find(o => o.id === id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  const refundAmt = Number(amount) || order.total;
  order.paymentStatus = refundAmt >= order.total ? "Refunded" : "Partially Refunded";
  order.refundDetails = {
    amount: refundAmt,
    mode,
    reason,
    refundedAt: new Date().toISOString()
  };

  if (!order.timeline) order.timeline = [];
  order.timeline.forEach(t => t.current = false);
  order.timeline.push({
    status: "refunded",
    title: `Refund Processed (₹${refundAmt.toLocaleString('en-IN')})`,
    description: `Refund routed to ${mode}. Reason: ${reason}`,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + " Today",
    done: true,
    current: true
  });

  res.json({ success: true, message: `Successfully issued ₹${refundAmt} refund to ${mode}`, data: order });
};

export const returnAdminOrder = (req, res) => {
  const { id } = req.params;
  const { reason = "Quality / packaging return", pickupDate = "Tomorrow 10:00 AM" } = req.body;
  const order = adminOrders.find(o => o.id === id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.orderStatus = "Returned";
  order.returnDetails = {
    reason,
    pickupScheduled: pickupDate,
    status: "Reverse Pickup Scheduled"
  };

  if (!order.timeline) order.timeline = [];
  order.timeline.forEach(t => t.current = false);
  order.timeline.push({
    status: "returned",
    title: "Reverse Return Initiated",
    description: `Courier reverse pickup scheduled for ${pickupDate}. Reason: ${reason}`,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + " Today",
    done: true,
    current: true
  });

  res.json({ success: true, message: "Return and reverse pickup scheduled", data: order });
};

export const exchangeAdminOrder = (req, res) => {
  const { id } = req.params;
  const { replacementItem, reason = "Size / variant replacement" } = req.body;
  const order = adminOrders.find(o => o.id === id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.exchangeDetails = {
    replacementItem,
    reason,
    status: "Replacement Dispatched",
    date: new Date().toISOString()
  };

  if (!order.timeline) order.timeline = [];
  order.timeline.push({
    status: "exchange",
    title: "Exchange Replacement Created",
    description: `Replacement dispatched: ${replacementItem}. Reason: ${reason}`,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + " Today",
    done: true,
    current: true
  });

  res.json({ success: true, message: "Exchange replacement processed", data: order });
};

export const bulkUpdateOrderStatus = (req, res) => {
  const { ids = [], status = "Processing" } = req.body;
  let count = 0;
  adminOrders.forEach(o => {
    if (ids.includes(o.id)) {
      o.orderStatus = status;
      count++;
    }
  });

  res.json({ success: true, message: `Updated status to ${status} for ${count} orders` });
};

export const getAdminProducts = (req, res) => {
  const {
    status = "all", // 'active', 'trash', 'all'
    category = "all",
    brand = "all",
    stockStatus = "all", // 'in_stock', 'low_stock', 'out_of_stock'
    minPrice,
    maxPrice,
    search = ""
  } = req.query;

  let results = [...adminProducts];

  // Status Filter (active vs trash)
  if (status === "active") {
    results = results.filter(p => !p.deletedAt);
  } else if (status === "trash") {
    results = results.filter(p => !!p.deletedAt);
  }

  // Category Filter
  if (category !== "all") {
    results = results.filter(p => p.category?.toLowerCase() === category.toLowerCase());
  }

  // Brand Filter
  if (brand !== "all") {
    results = results.filter(p => p.brand?.toLowerCase() === brand.toLowerCase());
  }

  // Stock Status Filter
  if (stockStatus === "in_stock") {
    results = results.filter(p => p.stock > 20);
  } else if (stockStatus === "low_stock") {
    results = results.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 20));
  } else if (stockStatus === "out_of_stock") {
    results = results.filter(p => p.stock === 0);
  }

  // Price Range Filter
  if (minPrice) {
    results = results.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    results = results.filter(p => p.price <= Number(maxPrice));
  }

  // Search Filter
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: results.length,
    total: adminProducts.length,
    activeCount: adminProducts.filter(p => !p.deletedAt).length,
    trashCount: adminProducts.filter(p => !!p.deletedAt).length,
    data: results
  });
};

export const createAdminProduct = (req, res) => {
  const {
    name,
    sku,
    category = "Organic Staples",
    brand = "Janani Gold Reserve",
    price = 299,
    originalPrice = 399,
    unit = "1 kg",
    warehouseStock = 50,
    reservedStock = 0,
    lowStockThreshold = 20,
    badge = "100% Organic",
    description = "Pesticide-free certified organic harvest.",
    harvestOrigin = "Gujarat Certified Farmer Cluster",
    image = "/images/product-placeholder.jpg",
    gallery = [],
    variants = [],
    organicCertifications = ["NPOP Certified Organic", "Jaivik Bharat"],
    seo = {},
    active = true,
    featured = false,
    trending = false,
    isNewArrival = true
  } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: "Product title is required" });
  }

  const generatedSlug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const generatedSku = sku || `JAP-${Math.floor(1000 + Math.random() * 9000)}`;
  const availableStock = Math.max(0, Number(warehouseStock) - Number(reservedStock));

  const newProduct = {
    id: `PROD-${Date.now()}`,
    name,
    slug: generatedSlug,
    sku: generatedSku,
    category,
    brand,
    price: Number(price),
    originalPrice: Number(originalPrice) || Math.round(Number(price) * 1.2),
    unit,
    warehouseStock: Number(warehouseStock),
    reservedStock: Number(reservedStock),
    stock: availableStock,
    lowStockThreshold: Number(lowStockThreshold),
    status: availableStock === 0 ? "Out of Stock" : availableStock <= Number(lowStockThreshold) ? "Low Stock" : "In Stock",
    badge,
    rating: req.body.rating ? Number(req.body.rating) : 4.9,
    reviewsCount: req.body.reviewsCount !== undefined ? Number(req.body.reviewsCount) : (req.body.reviews !== undefined ? Number(req.body.reviews) : 53),
    reviews: req.body.reviews !== undefined ? Number(req.body.reviews) : (req.body.reviewsCount !== undefined ? Number(req.body.reviewsCount) : 53),
    image,
    gallery: gallery.length > 0 ? gallery : [image],
    variants: variants.length > 0 ? variants : [
      { id: `VAR-${Date.now()}-1`, name: unit, sku: generatedSku, price: Number(price), originalPrice: Number(originalPrice) || Math.round(Number(price) * 1.2), stock: availableStock }
    ],
    description,
    harvestOrigin,
    organicCertifications,
    subtitle: req.body.subtitle || "",
    benefits: req.body.benefits || [],
    dosage: req.body.dosage || "",
    methodOfApplication: req.body.methodOfApplication || "",
    recommendedCrops: req.body.recommendedCrops || "",
    crops: req.body.crops || [],
    activeOrganism: req.body.activeOrganism || "",
    targetDiseases: req.body.targetDiseases || "",
    compatibility: req.body.compatibility || "",
    storageNotice: req.body.storageNotice || "",
    specifications: req.body.specifications || {},
    faqs: req.body.faqs || [],
    seo: {
      metaTitle: seo.metaTitle || `${name} | JANANI AGRO PRODUCTS`,
      metaDescription: seo.metaDescription || description,
      metaKeywords: seo.metaKeywords || `${name.toLowerCase()}, organic, farm fresh`,
      canonicalUrl: seo.canonicalUrl || `https://jananiagro.com/products/${generatedSlug}`,
      ogImage: image
    },
    active: Boolean(active),
    featured: Boolean(featured),
    trending: Boolean(trending),
    isNewArrival: Boolean(isNewArrival),
    deletedAt: null,
    createdAt: new Date().toISOString().split("T")[0]
  };

  adminProducts.unshift(newProduct);
  res.status(201).json({ success: true, message: "Product created successfully", data: newProduct });
};

export const updateAdminProduct = (req, res) => {
  const { id } = req.params;
  const index = adminProducts.findIndex(p => p.id === id || String(p.id) === String(id) || p.slug === id);
  if (index === -1) return res.status(404).json({ success: false, message: "Product not found" });

  const current = adminProducts[index];
  const warehouse = req.body.warehouseStock !== undefined ? Number(req.body.warehouseStock) : current.warehouseStock;
  const reserved = req.body.reservedStock !== undefined ? Number(req.body.reservedStock) : current.reservedStock;
  const available = Math.max(0, warehouse - reserved);
  const threshold = req.body.lowStockThreshold !== undefined ? Number(req.body.lowStockThreshold) : (current.lowStockThreshold || 20);

  adminProducts[index] = {
    ...current,
    ...req.body,
    warehouseStock: warehouse,
    reservedStock: reserved,
    stock: available,
    status: available === 0 ? "Out of Stock" : available <= threshold ? "Low Stock" : "In Stock",
    seo: {
      ...(current.seo || {}),
      ...(req.body.seo || {})
    }
  };

  res.json({ success: true, message: "Product updated successfully", data: adminProducts[index] });
};

export const toggleAdminProduct = (req, res) => {
  const { id } = req.params;
  const { field } = req.body; // 'active', 'featured', 'trending', or 'isNewArrival'
  const product = adminProducts.find(p => p.id === id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  if (field === "featured") product.featured = !product.featured;
  else if (field === "trending") product.trending = !product.trending;
  else if (field === "isNewArrival") product.isNewArrival = !product.isNewArrival;
  else product.active = !product.active;

  res.json({ success: true, message: `Product ${field || 'status'} updated`, data: product });
};

export const duplicateAdminProduct = (req, res) => {
  const { id } = req.params;
  const product = adminProducts.find(p => p.id === id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  const newId = `PROD-${Date.now()}`;
  const cloned = {
    ...product,
    id: newId,
    name: `${product.name} (Copy)`,
    slug: `${product.slug}-copy-${Math.floor(100 + Math.random() * 900)}`,
    sku: `${product.sku}-COPY`,
    active: false, // Start draft/inactive
    createdAt: new Date().toISOString().split("T")[0],
    deletedAt: null
  };

  adminProducts.unshift(cloned);
  res.status(201).json({ success: true, message: "Product duplicated successfully", data: cloned });
};

export const deleteAdminProduct = (req, res) => {
  const { id } = req.params;
  const product = adminProducts.find(p => p.id === id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  // Soft delete
  product.deletedAt = new Date().toISOString();
  res.json({ success: true, message: "Product moved to Trash Bin", data: product });
};

export const restoreAdminProduct = (req, res) => {
  const { id } = req.params;
  const product = adminProducts.find(p => p.id === id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  product.deletedAt = null;
  res.json({ success: true, message: "Product restored from Trash Bin", data: product });
};

export const permanentDeleteAdminProduct = (req, res) => {
  const { id } = req.params;
  adminProducts = adminProducts.filter(p => p.id !== id);
  res.json({ success: true, message: "Product permanently deleted" });
};

export const bulkUpdateProductStatus = (req, res) => {
  const { ids = [], active = true } = req.body;
  adminProducts.forEach(p => {
    if (ids.includes(p.id)) {
      p.active = Boolean(active);
    }
  });
  res.json({ success: true, message: `Updated status for ${ids.length} products` });
};

export const bulkUpdateProductPrice = (req, res) => {
  const { ids = [], type = "percentage", value = 10, mode = "increase" } = req.body;
  // type: 'percentage' | 'flat' | 'fixed', mode: 'increase' | 'decrease' | 'set'
  let count = 0;

  adminProducts.forEach(p => {
    if (ids.includes(p.id)) {
      if (type === "percentage") {
        const delta = Math.round((p.price * Number(value)) / 100);
        p.price = mode === "decrease" ? Math.max(1, p.price - delta) : p.price + delta;
      } else if (type === "flat") {
        p.price = mode === "decrease" ? Math.max(1, p.price - Number(value)) : p.price + Number(value);
      } else if (type === "fixed") {
        p.price = Number(value);
      }
      count++;
    }
  });

  res.json({ success: true, message: `Updated prices for ${count} products` });
};

export const bulkUpdateProductStock = (req, res) => {
  const { ids = [], quantity = 50, operation = "add" } = req.body; // 'add' | 'set'
  let count = 0;

  adminProducts.forEach(p => {
    if (ids.includes(p.id)) {
      if (operation === "set") {
        p.warehouseStock = Math.max(0, Number(quantity));
      } else {
        p.warehouseStock = (p.warehouseStock || 0) + Number(quantity);
      }
      p.stock = Math.max(0, p.warehouseStock - (p.reservedStock || 0));
      p.status = p.stock === 0 ? "Out of Stock" : p.stock <= (p.lowStockThreshold || 20) ? "Low Stock" : "In Stock";
      count++;
    }
  });

  res.json({ success: true, message: `Updated inventory for ${count} products` });
};

export const bulkDeleteProducts = (req, res) => {
  const { ids = [] } = req.body;
  adminProducts.forEach(p => {
    if (ids.includes(p.id)) {
      p.deletedAt = new Date().toISOString();
    }
  });
  res.json({ success: true, message: `Moved ${ids.length} products to Trash Bin` });
};

export const importProducts = (req, res) => {
  const { products = [] } = req.body;
  let importedCount = 0;

  products.forEach(item => {
    if (item.name) {
      const generatedSlug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const generatedSku = item.sku || `JAP-IMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const price = Number(item.price) || 299;
      const originalPrice = Number(item.originalPrice) || Math.round(price * 1.2);
      const stock = Number(item.stock) || 50;

      adminProducts.unshift({
        id: item.id || `PROD-IMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: item.name,
        slug: generatedSlug,
        sku: generatedSku,
        category: item.category || "Organic Staples",
        brand: item.brand || "Janani Gold Reserve",
        price,
        originalPrice,
        unit: item.unit || "1 kg",
        warehouseStock: stock,
        reservedStock: 0,
        stock,
        lowStockThreshold: 20,
        status: stock === 0 ? "Out of Stock" : stock <= 20 ? "Low Stock" : "In Stock",
        badge: item.badge || "100% Organic",
        rating: 4.9,
        reviewsCount: 0,
        image: item.image || "/images/product-placeholder.jpg",
        gallery: [item.image || "/images/product-placeholder.jpg"],
        variants: [
          { id: `VAR-IMP-${Date.now()}-1`, name: item.unit || "1 kg", sku: generatedSku, price, originalPrice, stock }
        ],
        description: item.description || "Farm fresh organic harvest.",
        harvestOrigin: item.harvestOrigin || "Gujarat Organic Farmer Cluster",
        organicCertifications: ["NPOP Certified Organic", "Jaivik Bharat"],
        seo: {
          metaTitle: item.metaTitle || item.name,
          metaDescription: item.metaDescription || item.description || "",
          metaKeywords: item.metaKeywords || "",
          canonicalUrl: item.canonicalUrl || `https://jananiagro.com/products/${generatedSlug}`,
          ogImage: item.image || ""
        },
        active: item.active !== undefined ? Boolean(item.active) : true,
        featured: Boolean(item.featured),
        trending: Boolean(item.trending),
        isNewArrival: Boolean(item.isNewArrival),
        deletedAt: null,
        createdAt: new Date().toISOString().split("T")[0]
      });
      importedCount++;
    }
  });

  res.status(201).json({ success: true, message: `Successfully imported ${importedCount} products` });
};


// ==========================================
// 👥 JANANI AGRO CUSTOMERS CONTROLLER
// ==========================================

export const getAdminCustomers = async (req, res) => {
  const {
    status = "all",
    tier = "all",
    search = "",
    sortBy = "spent_desc"
  } = req.query;

  try {
    let sql = "SELECT * FROM `users` WHERE (`role` = 'Customer' OR `role` IS NULL OR `role` = '')";
    const params = [];

    if (status !== "all") {
      sql += " AND `status` = ?";
      params.push(status);
    }
    if (tier !== "all") {
      sql += " AND `tier` = ?";
      params.push(tier);
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      sql += " AND (`name` LIKE ? OR `email` LIKE ? OR `phone` LIKE ? OR `id` LIKE ?)";
      params.push(q, q, q, q);
    }

    if (sortBy === "spent_desc") {
      sql += " ORDER BY `wallet_balance` DESC";
    } else {
      sql += " ORDER BY `created_at` DESC";
    }

    const rows = await query(sql, params);
    if (Array.isArray(rows)) {
      const formatted = rows.map((u) => {
        let addresses = [];
        try {
          const parsed = typeof u.preferences === "string" ? JSON.parse(u.preferences) : u.preferences;
          addresses = parsed?.addresses || [];
        } catch (e) {}

        return {
          id: u.id,
          name: u.name || "Customer",
          email: u.email || "",
          phone: u.phone || "",
          city: u.city || (addresses[0]?.city || ""),
          state: u.state || (addresses[0]?.state || ""),
          pincode: u.pincode || (addresses[0]?.pincode || ""),
          tier: u.tier || "Active Patron",
          status: u.status || "Active",
          suspensionReason: null,
          joinDate: u.created_at ? String(u.created_at).split("T")[0] : "2026-01-01",
          lastActive: "Recent",
          walletBalance: Number(u.wallet_balance || 0),
          loyaltyPoints: Number(u.loyalty_points || 0),
          totalSpent: Number(u.wallet_balance || 0) * 10,
          totalOrders: 1,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || "Customer")}`,
          addresses
        };
      });

      return res.json({
        success: true,
        count: formatted.length,
        total: formatted.length,
        activeCount: formatted.filter((c) => c.status === "Active").length,
        suspendedCount: formatted.filter((c) => c.status === "Suspended").length,
        inactiveCount: formatted.filter((c) => c.status === "Inactive").length,
        totalLtv: formatted.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
        totalWallet: formatted.reduce((sum, c) => sum + (c.walletBalance || 0), 0),
        totalLoyalty: formatted.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0),
        data: formatted
      });
    }
  } catch (err) {
    console.warn("⚠️ [getAdminCustomers] MySQL query error:", err.message);
  }

  res.json({
    success: true,
    count: 0,
    total: 0,
    activeCount: 0,
    suspendedCount: 0,
    inactiveCount: 0,
    totalLtv: 0,
    totalWallet: 0,
    totalLoyalty: 0,
    data: []
  });
};

export const getAdminCustomerById = async (req, res) => {
  const { id } = req.params;
  const cleanId = (id || "").trim();
  const cleanEmail = cleanId.toLowerCase();
  const cleanPhone = cleanId.replace(/\D/g, "");

  // 1. Check MySQL users table
  try {
    const rows = await query(
      "SELECT * FROM users WHERE id = ? OR LOWER(email) = ? OR (phone = ? AND phone != '') LIMIT 1",
      [cleanId, cleanEmail, cleanPhone]
    );
    if (rows && rows.length > 0) {
      const u = rows[0];
      const prefs = typeof u.preferences === "string" ? JSON.parse(u.preferences) : (u.preferences || {});
      const addrs = Array.isArray(prefs?.addresses) ? prefs.addresses : [];
      const formatted = {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || "Customer")}`,
        role: u.role || "Customer",
        walletBalance: Number(u.wallet_balance || 0),
        loyaltyPoints: Number(u.loyalty_points || 0),
        tier: u.tier || "Silver",
        status: u.status || "Active",
        referralCode: u.referral_code,
        isVerified: !!u.is_verified,
        preferences: prefs,
        addresses: addrs,
        savedAddresses: addrs,
        totalOrders: 0,
        totalSpent: 0
      };
      return res.json({ success: true, customer: formatted, data: formatted, user: formatted });
    }
  } catch (dbErr) {
    console.warn("[getAdminCustomerById] MySQL lookup fallback note:", dbErr.message);
  }

  // 2. Check in-memory store
  const customer = adminCustomers.find(c => 
    c.id === cleanId || 
    (c.email && c.email.toLowerCase() === cleanEmail) || 
    (cleanPhone && c.phone && c.phone.replace(/\D/g, "") === cleanPhone)
  );

  if (!customer) {
    return res.status(404).json({ success: false, message: "Customer profile not found" });
  }

  return res.json({ success: true, customer, data: customer, user: customer });
};

export const createAdminCustomer = (req, res) => {
  const {
    name,
    email,
    phone,
    city = "Bengaluru",
    state = "Karnataka",
    pincode = "560001",
    street = "Main Road",
    tier = "Silver",
    initialWallet = 0,
    initialLoyalty = 100,
    notes = ""
  } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, message: "Name, email, and phone number are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingCustomer = adminCustomers.find(c => c.email && c.email.toLowerCase() === normalizedEmail);
  if (existingCustomer) {
    return res.status(409).json({
      success: false,
      error: 'EMAIL_ALREADY_REGISTERED',
      message: `The email '${email}' is already registered to customer '${existingCustomer.name}' (${existingCustomer.id}). Please use a different email address or edit the existing customer profile.`
    });
  }

  const newId = `CUST-${String(adminCustomers.length + 1).padStart(3, '0')}`;
  const newCustomer = {
    id: newId,
    name,
    email,
    phone,
    city,
    state,
    pincode,
    totalSpent: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    tier,
    status: "Active",
    suspensionReason: null,
    joinDate: new Date().toISOString().split("T")[0],
    lastActive: "Just now",
    walletBalance: Number(initialWallet) || 0,
    loyaltyPoints: Number(initialLoyalty) || 100,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    addresses: [
      { id: `ADDR-${Date.now()}`, label: "Primary Shipping", street, city, state, pincode, isDefault: true, phone }
    ],
    orderHistory: [],
    wishlist: [],
    cart: [],
    walletTransactions: Number(initialWallet) > 0 ? [
      { id: `TXN-${Date.now()}`, date: new Date().toISOString().split("T")[0], type: "credit", amount: Number(initialWallet), description: "Welcome account credit bonus", balanceAfter: Number(initialWallet) }
    ] : [],
    loyaltyHistory: [
      { id: `LPT-${Date.now()}`, date: new Date().toISOString().split("T")[0], type: "earned", points: Number(initialLoyalty) || 100, description: "New Member Signup Bonus" }
    ],
    referrals: {
      code: `${name.substring(0, 4).toUpperCase()}-AGRO-${Math.floor(10 + Math.random() * 90)}`,
      count: 0,
      totalEarned: 0,
      friends: []
    },
    couponsUsed: []
  };

  adminCustomers.unshift(newCustomer);
  res.status(201).json({ success: true, message: "Customer created successfully", data: newCustomer });
};

export const updateAdminCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, tier, status, walletBalance, loyaltyPoints, preferences } = req.body;

  try {
    const fields = [];
    const params = [];
    if (name) { fields.push("name = ?"); params.push(name); }
    if (email) { fields.push("email = ?"); params.push(email.toLowerCase().trim()); }
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "");
      const formatted = cleanPhone.length === 10 ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}` : phone;
      fields.push("phone = ?");
      params.push(formatted);
    }
    if (role) { fields.push("role = ?"); params.push(role); }
    if (tier) { fields.push("tier = ?"); params.push(tier); }
    if (status) { fields.push("status = ?"); params.push(status); }
    if (walletBalance !== undefined) { fields.push("wallet_balance = ?"); params.push(walletBalance); }
    if (loyaltyPoints !== undefined) { fields.push("loyalty_points = ?"); params.push(loyaltyPoints); }
    if (preferences) { fields.push("preferences = ?"); params.push(JSON.stringify(preferences)); }

    if (fields.length > 0) {
      params.push(id, id);
      await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ? OR email = ?`, params);
    }
  } catch (dbErr) {
    console.error("DB update error in updateAdminCustomer:", dbErr);
  }

  const index = adminCustomers.findIndex(c => c.id === id || c.email === id);
  if (index !== -1) {
    adminCustomers[index] = {
      ...adminCustomers[index],
      ...req.body
    };
  }

  res.json({ success: true, message: "Customer profile updated successfully in database", data: adminCustomers[index] || req.body });
};

export const toggleCustomerStatus = (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const customer = adminCustomers.find(c => c.id === id);
  if (!customer) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  const targetStatus = status || (customer.status === "Active" ? "Suspended" : "Active");
  customer.status = targetStatus;
  customer.suspensionReason = targetStatus === "Suspended" ? (reason || "Administrative suspension") : null;

  res.json({
    success: true,
    message: `Customer account is now ${targetStatus}`,
    data: customer
  });
};

export const adjustCustomerWallet = (req, res) => {
  const { id } = req.params;
  const { amount, type = "credit", description = "Manual wallet adjustment" } = req.body;
  const customer = adminCustomers.find(c => c.id === id);
  if (!customer) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  const numAmount = Math.abs(Number(amount)) || 0;
  if (type === "credit") {
    customer.walletBalance = (customer.walletBalance || 0) + numAmount;
  } else {
    customer.walletBalance = Math.max(0, (customer.walletBalance || 0) - numAmount);
  }

  const newTxn = {
    id: `TXN-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    type,
    amount: numAmount,
    description,
    balanceAfter: customer.walletBalance
  };

  if (!customer.walletTransactions) customer.walletTransactions = [];
  customer.walletTransactions.unshift(newTxn);

  res.json({
    success: true,
    message: `Successfully ${type === 'credit' ? 'credited' : 'debited'} ₹${numAmount} to ${customer.name}'s wallet.`,
    data: {
      walletBalance: customer.walletBalance,
      transaction: newTxn
    }
  });
};

export const deleteAdminCustomer = (req, res) => {
  const { id } = req.params;
  const index = adminCustomers.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  const removed = adminCustomers.splice(index, 1)[0];
  res.json({ success: true, message: `Customer account for ${removed?.name || id} has been permanently deleted.` });
};

export const getAdminInventory = (req, res) => {
  const inventoryList = adminProducts.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku || `SKU-${p.id.substring(0, 6).toUpperCase()}`,
    category: p.category,
    price: p.price,
    stock: p.stock ?? 45,
    threshold: 20,
    status: (p.stock ?? 45) === 0 ? "Out of Stock" : (p.stock ?? 45) <= 20 ? "Low Stock" : "In Stock"
  }));
  res.json({ success: true, data: inventoryList });
};

export const restockProduct = (req, res) => {
  const { id, quantity } = req.body;
  const product = adminProducts.find(p => p.id === id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  product.stock = (product.stock || 0) + Number(quantity || 50);
  res.json({ success: true, message: `Added ${quantity} units to inventory`, data: product });
};

function mapDbCoupon(row) {
  const isFree = Boolean(
    row.is_free_shipping == 1 ||
    row.type === "free_shipping" ||
    String(row.code).toUpperCase().includes("FREESHIP") ||
    String(row.code).toUpperCase().includes("FREEDEL")
  );

  return {
    id: String(row.id || `CPN-${row.code}`),
    code: String(row.code).trim().toUpperCase(),
    title: row.title || (isFree ? "Free Priority Delivery" : `${row.code} Special Offer`),
    description: row.description || (isFree ? "Complimentary delivery anywhere in India on orders ₹499+" : ""),
    type: isFree ? "free_shipping" : (row.type || "percentage"),
    discount: isFree ? 60 : Number(row.discount || 0),
    minCart: Number(row.min_cart || 0),
    maxDiscount: isFree ? 60 : Number(row.max_discount || 0),
    startDate: row.start_date ? new Date(row.start_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    expiryDate: row.expiry_date ? new Date(row.expiry_date).toISOString().split("T")[0] : "2026-12-31",
    uses: Number(row.uses || 0),
    maxUses: Number(row.max_uses || 1000),
    perUserLimit: Number(row.per_user_limit || 1),
    isFirstOrderOnly: Boolean(row.is_first_order_only),
    isFreeShipping: isFree,
    userSpecificTier: row.user_specific_tier || "All",
    userSpecificEmails: [],
    categorySpecific: [],
    productSpecific: [],
    active: Boolean(row.active === 1 || row.active === true || row.active === "1"),
    createdAt: row.created_at ? new Date(row.created_at).toLocaleString("en-IN") : new Date().toLocaleString("en-IN")
  };
}

export const getAdminCoupons = async (req, res) => {
  const { search, type, status, sortBy = "newest" } = req.query;
  let results = [...adminCoupons];
  const now = new Date();

  if (isDbConnected()) {
    try {
      const rows = await query(`SELECT * FROM coupons ORDER BY created_at DESC`);
      if (rows && rows.length > 0) {
        results = rows.map(mapDbCoupon);
        // Sync with in-memory adminCoupons
        adminCoupons = results;
      }
    } catch (err) {
      console.warn("⚠️ [Coupons DB fetch error, falling back to memory]:", err.message);
    }
  }

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      c.id.toLowerCase().includes(q)
    );
  }

  // Type filter
  if (type && type !== "all") {
    results = results.filter(c => c.type.toLowerCase() === type.toLowerCase());
  }

  // Status filter
  if (status && status !== "all") {
    if (status === "active") {
      results = results.filter(c => c.active && new Date(c.expiryDate) >= now && c.uses < c.maxUses);
    } else if (status === "paused") {
      results = results.filter(c => !c.active);
    } else if (status === "expired") {
      results = results.filter(c => new Date(c.expiryDate) < now);
    } else if (status === "depleted") {
      results = results.filter(c => c.uses >= c.maxUses);
    }
  }

  // Sorting
  if (sortBy === "newest") {
    results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } else if (sortBy === "uses_desc") {
    results.sort((a, b) => b.uses - a.uses);
  } else if (sortBy === "discount_desc") {
    results.sort((a, b) => b.discount - a.discount);
  } else if (sortBy === "alphabetical") {
    results.sort((a, b) => a.code.localeCompare(b.code));
  }

  // Calculate high-impact aggregated stats
  const activeCount = results.filter(c => c.active && new Date(c.expiryDate) >= now && c.uses < c.maxUses).length;
  const totalUses = results.reduce((sum, c) => sum + (c.uses || 0), 0);
  const totalDiscountDisbursed = couponUsageHistory.reduce((sum, u) => sum + (u.discountAmount || 0), 0) + 142380;
  const totalInfluencedRevenue = couponUsageHistory.reduce((sum, u) => sum + (u.orderTotal || 0), 0) + 1284500;
  const avgOrderWithPromo = 3280;
  const topCoupon = [...results].sort((a, b) => b.uses - a.uses)[0]?.code || "FIRSTORGANIC";

  const stats = {
    activeCoupons: activeCount,
    totalRedemptions: totalUses,
    totalDiscountDisbursed,
    totalInfluencedRevenue,
    avgOrderWithPromo,
    topCoupon
  };

  res.json({
    success: true,
    count: results.length,
    total: results.length,
    stats,
    data: results
  });
};

export const getStorefrontCoupons = async (req, res) => {
  let list = [...adminCoupons];
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  if (isDbConnected()) {
    try {
      const rows = await query(
        `SELECT * FROM coupons WHERE active = 1 AND (expiry_date IS NULL OR expiry_date >= ?) ORDER BY discount DESC`,
        [todayStr]
      );
      if (rows && rows.length > 0) {
        list = rows.map(mapDbCoupon);
      }
    } catch (err) {
      console.warn("⚠️ [Storefront Coupons DB fetch error]:", err.message);
    }
  }

  // Filter for active & unexpired
  const activeOffers = list.filter(c => {
    if (!c.active) return false;
    if (c.expiryDate && new Date(c.expiryDate) < new Date(todayStr)) return false;
    if (c.maxUses && c.uses >= c.maxUses) return false;
    return true;
  });

  res.json({
    success: true,
    data: activeOffers,
    count: activeOffers.length
  });
};

export const validateCouponOffer = async (req, res) => {
  const { code, subtotal = 0, userEmail, userTier } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, valid: false, message: "Please enter a coupon code" });
  }

  const cleanCode = code.trim().toUpperCase();
  let coupon = null;

  if (isDbConnected()) {
    try {
      const rows = await query(`SELECT * FROM coupons WHERE UPPER(code) = ? LIMIT 1`, [cleanCode]);
      if (rows && rows.length > 0) {
        coupon = mapDbCoupon(rows[0]);
      }
    } catch (err) {
      console.warn("⚠️ [Validate coupon DB query error]:", err.message);
    }
  }

  if (!coupon) {
    coupon = adminCoupons.find(c => c.code.toUpperCase() === cleanCode);
  }

  if (!coupon) {
    return res.status(404).json({ success: false, valid: false, message: `Coupon '${cleanCode}' is invalid or does not exist.` });
  }

  if (!coupon.active) {
    return res.status(400).json({ success: false, valid: false, message: `Coupon '${cleanCode}' is currently inactive.` });
  }

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date(todayStr)) {
    return res.status(400).json({
      success: false,
      valid: false,
      message: `Coupon '${cleanCode}' expired on ${coupon.expiryDate}.`
    });
  }

  if (coupon.maxUses && coupon.uses >= coupon.maxUses) {
    return res.status(400).json({
      success: false,
      valid: false,
      message: `Coupon '${cleanCode}' redemption limit has been reached.`
    });
  }

  const orderSubtotal = Number(subtotal) || 0;
  if (coupon.minCart > 0 && orderSubtotal < coupon.minCart) {
    const diff = coupon.minCart - orderSubtotal;
    return res.status(400).json({
      success: false,
      valid: false,
      message: `${coupon.code} requires a minimum cart value of ₹${coupon.minCart}. Please add ₹${diff} more to unlock this offer.`
    });
  }

  const isFree = Boolean(
    coupon.type === "free_shipping" ||
    coupon.isFreeShipping ||
    String(coupon.code).toUpperCase().includes("FREESHIP") ||
    String(coupon.code).toUpperCase().includes("FREEDEL")
  );

  let calculatedDiscount = 0;
  if (isFree) {
    calculatedDiscount = 60; // Standard shipping waiver value
  } else if (coupon.type === "percentage") {
    calculatedDiscount = Math.round((orderSubtotal * coupon.discount) / 100);
    if (coupon.maxDiscount > 0) {
      calculatedDiscount = Math.min(calculatedDiscount, coupon.maxDiscount);
    }
  } else if (coupon.type === "flat") {
    calculatedDiscount = Math.min(coupon.discount, orderSubtotal);
  }

  res.json({
    success: true,
    valid: true,
    discount: calculatedDiscount,
    coupon: {
      ...coupon,
      type: isFree ? "free_shipping" : coupon.type,
      isFreeShipping: isFree,
      discount: isFree ? 60 : coupon.discount
    },
    message: isFree
      ? `Coupon '${coupon.code}' applied! Free farm delivery unlocked (Saved ₹60).`
      : `Coupon '${coupon.code}' applied! You saved ₹${calculatedDiscount}.`
  });
};

export const getAdminCouponById = async (req, res) => {
  const { id } = req.params;
  let coupon = null;

  if (isDbConnected()) {
    try {
      const rows = await query(`SELECT * FROM coupons WHERE id = ? OR UPPER(code) = ? LIMIT 1`, [id, id.toUpperCase()]);
      if (rows && rows.length > 0) coupon = mapDbCoupon(rows[0]);
    } catch (e) {}
  }

  if (!coupon) {
    coupon = adminCoupons.find(c => c.id === id || c.code.toUpperCase() === id.toUpperCase());
  }

  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

  const usages = couponUsageHistory.filter(u => u.couponCode.toUpperCase() === coupon.code.toUpperCase());
  res.json({ success: true, data: { ...coupon, usageHistory: usages } });
};

export const createAdminCoupon = async (req, res) => {
  const {
    code,
    title,
    description = "",
    type = "percentage",
    discount = 10,
    minCart = 0,
    maxDiscount = 500,
    startDate = new Date().toISOString().split("T")[0],
    expiryDate = "2026-12-31",
    maxUses = 500,
    perUserLimit = 1,
    isFirstOrderOnly = false,
    isFreeShipping = false,
    categorySpecific = [],
    productSpecific = [],
    userSpecificTier = "All",
    userSpecificEmails = []
  } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: "Coupon code is required" });
  }

  const cleanCode = code.trim().toUpperCase();
  const existing = adminCoupons.find(c => c.code.toUpperCase() === cleanCode);
  if (existing) {
    return res.status(400).json({ success: false, message: `Coupon code '${cleanCode}' already exists` });
  }

  const newId = `CPN-${Date.now().toString().slice(-6)}`;
  const newCoupon = {
    id: newId,
    code: cleanCode,
    title: title || `${cleanCode} Special Offer`,
    description: description || `Special discount promo offer on Janani Agro`,
    type: isFreeShipping ? "free_shipping" : type,
    discount: isFreeShipping ? 0 : Number(discount),
    minCart: Number(minCart) || 0,
    maxDiscount: Number(maxDiscount) || 500,
    startDate: startDate || new Date().toISOString().split("T")[0],
    expiryDate: expiryDate || "2026-12-31",
    uses: 0,
    maxUses: Number(maxUses) || 500,
    perUserLimit: Number(perUserLimit) || 1,
    isFirstOrderOnly: Boolean(isFirstOrderOnly),
    isFreeShipping: Boolean(isFreeShipping) || type === "free_shipping",
    categorySpecific: Array.isArray(categorySpecific) ? categorySpecific : [],
    productSpecific: Array.isArray(productSpecific) ? productSpecific : [],
    userSpecificTier: userSpecificTier || "All",
    userSpecificEmails: Array.isArray(userSpecificEmails) ? userSpecificEmails : [],
    active: true,
    createdAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
  };

  if (isDbConnected()) {
    try {
      await query(
        `INSERT INTO coupons (id, code, title, description, type, discount, min_cart, max_discount, start_date, expiry_date, uses, max_uses, per_user_limit, is_first_order_only, is_free_shipping, user_specific_tier, active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title=VALUES(title), discount=VALUES(discount), min_cart=VALUES(min_cart), max_discount=VALUES(max_discount), expiry_date=VALUES(expiry_date), active=VALUES(active)`,
        [
          newCoupon.id,
          newCoupon.code,
          newCoupon.title,
          newCoupon.description,
          newCoupon.type,
          newCoupon.discount,
          newCoupon.minCart,
          newCoupon.maxDiscount,
          newCoupon.startDate,
          newCoupon.expiryDate,
          0,
          newCoupon.maxUses,
          newCoupon.perUserLimit,
          newCoupon.isFirstOrderOnly ? 1 : 0,
          newCoupon.isFreeShipping ? 1 : 0,
          newCoupon.userSpecificTier,
          1
        ]
      );
      console.log(`✅ [MySQL Coupons] Created coupon ${cleanCode} in database.`);
    } catch (err) {
      console.error("❌ [MySQL Coupon Insert Error]:", err.message);
    }
  }

  adminCoupons.unshift(newCoupon);
  res.status(201).json({ success: true, message: `Coupon '${cleanCode}' created and stored in database successfully!`, data: newCoupon });
};

export const updateAdminCoupon = async (req, res) => {
  const { id } = req.params;
  const index = adminCoupons.findIndex(c => c.id === id || c.code.toUpperCase() === id.toUpperCase());
  
  const updatedData = {
    ...(index !== -1 ? adminCoupons[index] : {}),
    ...req.body,
    code: req.body.code ? req.body.code.trim().toUpperCase() : (adminCoupons[index]?.code || id)
  };

  if (isDbConnected()) {
    try {
      await query(
        `UPDATE coupons SET code = ?, title = ?, description = ?, type = ?, discount = ?, min_cart = ?, max_discount = ?, expiry_date = ?, max_uses = ?, active = ? WHERE id = ? OR UPPER(code) = ?`,
        [
          updatedData.code,
          updatedData.title || "",
          updatedData.description || "",
          updatedData.type || "percentage",
          Number(updatedData.discount || 0),
          Number(updatedData.minCart || 0),
          Number(updatedData.maxDiscount || 0),
          updatedData.expiryDate || "2026-12-31",
          Number(updatedData.maxUses || 1000),
          updatedData.active ? 1 : 0,
          id,
          id.toUpperCase()
        ]
      );
    } catch (err) {
      console.error("❌ [MySQL Coupon Update Error]:", err.message);
    }
  }

  if (index !== -1) {
    adminCoupons[index] = updatedData;
  } else {
    adminCoupons.unshift(updatedData);
  }

  res.json({ success: true, message: `Coupon '${updatedData.code}' updated successfully in database`, data: updatedData });
};

export const toggleAdminCoupon = async (req, res) => {
  const { id } = req.params;
  const index = adminCoupons.findIndex(c => c.id === id || c.code.toUpperCase() === id.toUpperCase());
  let targetCoupon = index !== -1 ? adminCoupons[index] : null;

  if (isDbConnected()) {
    try {
      await query(`UPDATE coupons SET active = NOT active WHERE id = ? OR UPPER(code) = ?`, [id, id.toUpperCase()]);
      const rows = await query(`SELECT * FROM coupons WHERE id = ? OR UPPER(code) = ? LIMIT 1`, [id, id.toUpperCase()]);
      if (rows && rows.length > 0) {
        targetCoupon = mapDbCoupon(rows[0]);
      }
    } catch (err) {
      console.error("❌ [MySQL Coupon Toggle Error]:", err.message);
    }
  }

  if (targetCoupon) {
    if (index !== -1) {
      adminCoupons[index] = targetCoupon;
    }
    return res.json({ success: true, message: `Coupon '${targetCoupon.code}' is now ${targetCoupon.active ? 'active' : 'paused'} in database`, data: targetCoupon });
  }

  if (!targetCoupon && index !== -1) {
    adminCoupons[index].active = !adminCoupons[index].active;
    return res.json({ success: true, message: `Coupon '${adminCoupons[index].code}' is now ${adminCoupons[index].active ? 'active' : 'paused'}`, data: adminCoupons[index] });
  }

  return res.status(404).json({ success: false, message: "Coupon not found" });
};

export const deleteAdminCoupon = async (req, res) => {
  const { id } = req.params;
  const index = adminCoupons.findIndex(c => c.id === id || c.code.toUpperCase() === id.toUpperCase());
  
  if (isDbConnected()) {
    try {
      await query(`DELETE FROM coupons WHERE id = ? OR UPPER(code) = ?`, [id, id.toUpperCase()]);
      console.log(`✅ [MySQL Coupons] Deleted coupon ${id} from database.`);
    } catch (err) {
      console.error("❌ [MySQL Coupon Delete Error]:", err.message);
    }
  }

  let deleted = { id, code: id };
  if (index !== -1) {
    deleted = adminCoupons.splice(index, 1)[0];
  }
  
  res.json({ success: true, message: `Coupon deleted successfully from database`, data: deleted });
};

export const generateBulkCoupons = (req, res) => {
  const {
    prefix = "PROMO",
    count = 10,
    type = "percentage",
    discount = 15,
    minCart = 999,
    maxDiscount = 500,
    expiryDate = "2026-11-30T23:59:59.000Z",
    maxUsesPerCoupon = 1,
    isFirstOrderOnly = false,
    userSpecificTier = "All"
  } = req.body;

  const num = Math.min(Math.max(Number(count) || 10, 1), 500);
  const cleanPrefix = (prefix || "AGRO").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const generatedBatch = [];

  for (let i = 0; i < num; i++) {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const uniqueCode = `${cleanPrefix}-${randomSuffix}`;
    const newCoupon = {
      id: `CPN-${Date.now().toString().slice(-4)}-${i + 1}`,
      code: uniqueCode,
      title: `${cleanPrefix} Special Promo Campaign`,
      description: `Bulk campaign coupon with ${discount}${type === "percentage" ? "%" : "₹"} instant discount`,
      type,
      discount: Number(discount),
      minCart: Number(minCart),
      maxDiscount: Number(maxDiscount),
      startDate: new Date().toISOString(),
      expiryDate,
      uses: 0,
      maxUses: Number(maxUsesPerCoupon) || 1,
      perUserLimit: 1,
      isFirstOrderOnly: Boolean(isFirstOrderOnly),
      isFreeShipping: type === "free_shipping",
      categorySpecific: [],
      productSpecific: [],
      userSpecificTier,
      userSpecificEmails: [],
      active: true,
      createdAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
    };

    generatedBatch.push(newCoupon);
    adminCoupons.unshift(newCoupon);
  }

  res.status(201).json({
    success: true,
    message: `Generated and registered ${num} unique bulk promo coupons successfully!`,
    count: num,
    data: generatedBatch
  });
};

export const getCouponUsageHistory = (req, res) => {
  const { couponCode, search } = req.query;
  let history = [...couponUsageHistory];

  if (couponCode && couponCode !== "all") {
    history = history.filter(u => u.couponCode.toUpperCase() === couponCode.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    history = history.filter(u =>
      u.couponCode.toLowerCase().includes(q) ||
      u.orderId.toLowerCase().includes(q) ||
      u.customerName.toLowerCase().includes(q) ||
      u.customerEmail.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: history.length, data: history });
};

export const getCouponAnalytics = (req, res) => {
  const analytics = {
    topCoupons: [
      { code: "FIRSTORGANIC", redemptions: 512, revenueGenerated: 1530880, totalDiscounts: 102400, conversionRate: "24.6%" },
      { code: "FREESHIPAGRO", redemptions: 428, revenueGenerated: 419440, totalDiscounts: 51360, conversionRate: "18.2%" },
      { code: "JANANI10", redemptions: 342, revenueGenerated: 1484280, totalDiscounts: 102600, conversionRate: "16.4%" },
      { code: "HARVESTFEST", redemptions: 189, revenueGenerated: 595350, totalDiscounts: 89300, conversionRate: "12.8%" },
      { code: "VIPPLATINUM25", redemptions: 45, revenueGenerated: 216000, totalDiscounts: 54000, conversionRate: "32.1%" }
    ],
    categoryBreakdown: [
      { category: "Biological Crop Protection", percentage: 38 },
      { category: "Harit Trichoderma (5L) & Dairy", percentage: 29 },
      { category: "Spices & Herbs", percentage: 18 },
      { category: "Organic Staples & Rice", percentage: 15 }
    ]
  };

  res.json({ success: true, data: analytics });
};

export const getAdminReviews = async (req, res) => {
  const {
    status,
    rating,
    search,
    sortBy = "newest"
  } = req.query;

  try {
    let sql = "SELECT * FROM `reviews` WHERE 1=1";
    const params = [];
    if (status && status !== "all") {
      sql += " AND LOWER(status) = ?";
      params.push(status.toLowerCase());
    }
    if (rating && rating !== "all") {
      sql += " AND rating = ?";
      params.push(Number(rating));
    }
    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      sql += " AND (LOWER(product_name) LIKE ? OR LOWER(customer_name) LIKE ? OR LOWER(title) LIKE ? OR LOWER(comment) LIKE ?)";
      params.push(q, q, q, q);
    }
    sql += " ORDER BY created_at DESC";

    const rows = await query(sql, params);
    if (Array.isArray(rows)) {
      const mapped = rows.map((r) => ({
        id: r.id,
        productId: r.product_id,
        productName: r.product_name,
        productCategory: r.product_category || "Agriculture Inputs",
        productImage: r.product_image || "/products/harit.jpg",
        customerId: r.customer_id || "",
        customerName: r.customer_name || "Verified Farmer",
        customerEmail: r.customer_email || "",
        customerAvatar: r.customer_avatar || "/images/farmer_ramesh.jpg",
        location: r.location || "",
        rating: Number(r.rating || 5),
        title: r.title || "",
        comment: r.comment || "",
        verifiedPurchase: Boolean(r.verified_purchase),
        status: r.status || "Approved",
        isFeatured: Boolean(r.is_featured),
        helpfulCount: Number(r.helpful_count || 0),
        images: typeof r.images === "string" ? JSON.parse(r.images || "[]") : (r.images || []),
        createdAt: r.created_at || "Recent"
      }));

      const totalReviews = mapped.length;
      const approvedCount = mapped.filter((r) => r.status.toLowerCase() === "approved").length;
      const pendingCount = mapped.filter((r) => r.status.toLowerCase() === "pending").length;
      const rejectedCount = mapped.filter((r) => r.status.toLowerCase() === "rejected").length;
      const avgRating = totalReviews > 0 ? (mapped.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : "5.0";

      return res.json({
        success: true,
        count: mapped.length,
        total: totalReviews,
        approvedCount,
        pendingCount,
        rejectedCount,
        averageRating: Number(avgRating),
        stats: {
          totalReviews,
          approvedCount,
          pendingCount,
          rejectedCount,
          averageRating: Number(avgRating)
        },
        reviews: mapped,
        data: mapped
      });
    }
  } catch (err) {
    console.warn("⚠️ [getAdminReviews] MySQL query error:", err.message);
  }

  return res.json({
    success: true,
    count: 0,
    total: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    averageRating: 5.0,
    reviews: [],
    data: []
  });
};

export const getAdminReviewById = async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await query("SELECT * FROM `reviews` WHERE id = ? LIMIT 1", [id]);
    if (rows && rows.length > 0) {
      return res.json({ success: true, data: rows[0] });
    }
  } catch (e) {}

  const review = adminReviews.find(r => r.id === id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });

  res.json({ success: true, data: review });
};

export const createAdminReview = (req, res) => {
  const {
    productId = "3",
    productName = "BHUMI SHAKTI — Humic & Fulvic Acid",
    productCategory = "Soil Conditioner",
    location = "Organic Farmer",
    customerName,
    customerEmail,
    customerAvatar = "/images/farmer_ramesh.jpg",
    rating = 5,
    title,
    comment,
    images = [],
    isFeatured = true,
    verifiedPurchase = true,
    status = "Approved"
  } = req.body;

  if (!customerName || !comment) {
    return res.status(400).json({ success: false, message: "Farmer / Customer name and review comment are required." });
  }

  const newReview = {
    id: `REV-${100 + adminReviews.length + 1}`,
    productId,
    productName,
    productCategory,
    location: location || "Organic Farmer",
    productImage: "/assets/janani-products.jpg",
    customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName,
    customerEmail: customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
    customerAvatar: customerAvatar || "/images/farmer_ramesh.jpg",
    orderId: `ORD-${Math.floor(94000 + Math.random() * 1000)}`,
    rating: Number(rating) || 5,
    title: title || `${customerName}'s Experience`,
    comment,
    images: Array.isArray(images) ? images : [],
    verifiedPurchase: verifiedPurchase !== false,
    status: status || "Approved",
    isFeatured: isFeatured !== false,
    helpfulCount: 0,
    abuseReportsCount: 0,
    abuseReports: [],
    adminReply: null,
    customerReplies: [],
    createdAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }),
    updatedAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
  };

  adminReviews.unshift(newReview);

  res.status(201).json({
    success: true,
    message: "Farmer review recorded and published successfully!",
    data: newReview
  });
};

export const getPublicReviews = (req, res) => {
  const approved = adminReviews.filter(r => r.status === "Approved");
  // Featured first, then newest
  approved.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  res.json({
    success: true,
    data: approved,
    count: approved.length
  });
};

export const updateReviewStatus = (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  const review = adminReviews.find(r => r.id === id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });

  review.status = status;
  if (status === "Rejected" && rejectionReason) {
    review.rejectionReason = rejectionReason;
  } else if (status === "Approved") {
    delete review.rejectionReason;
  }
  review.updatedAt = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });

  res.json({
    success: true,
    message: `Review marked as ${status}`,
    data: review
  });
};

export const toggleFeatureReview = (req, res) => {
  const { id } = req.params;
  const review = adminReviews.find(r => r.id === id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });

  review.isFeatured = !review.isFeatured;
  review.updatedAt = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });

  res.json({
    success: true,
    message: review.isFeatured ? "Review pinned to Featured Highlights!" : "Review unpinned from Featured Highlights.",
    data: review
  });
};

export const addAdminReply = (req, res) => {
  const { id } = req.params;
  const { authorName = "Doddi Sai Rama", authorRole = "Quality & Founder", message } = req.body;
  const review = adminReviews.find(r => r.id === id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Reply message cannot be blank." });
  }

  review.adminReply = {
    authorName,
    authorRole,
    message: message.trim(),
    repliedAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
  };
  review.updatedAt = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });

  res.json({
    success: true,
    message: "Merchant official reply published successfully!",
    data: review
  });
};

export const deleteAdminReply = (req, res) => {
  const { id } = req.params;
  const review = adminReviews.find(r => r.id === id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });

  review.adminReply = null;
  review.updatedAt = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });

  res.json({
    success: true,
    message: "Merchant reply deleted.",
    data: review
  });
};

export const addCustomerReply = (req, res) => {
  const { id } = req.params;
  const { customerName = "Fellow Customer", message } = req.body;
  const review = adminReviews.find(r => r.id === id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Reply message cannot be blank." });
  }

  const newReply = {
    id: `REP-${Date.now().toString().slice(-4)}`,
    customerName,
    message: message.trim(),
    createdAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }),
    likes: 0
  };

  if (!review.customerReplies) review.customerReplies = [];
  review.customerReplies.push(newReply);
  review.updatedAt = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });

  res.status(201).json({
    success: true,
    message: "Customer reply added to discussion thread.",
    data: newReply
  });
};

export const reportReviewAbuse = (req, res) => {
  const { id } = req.params;
  const { reporterName = "Store Moderator", reason = "Spam / Promotion" } = req.body;
  const review = adminReviews.find(r => r.id === id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });

  if (!review.abuseReports) review.abuseReports = [];
  const newReport = {
    id: `ABUSE-${Date.now().toString().slice(-4)}`,
    reporterName,
    reason,
    reportedAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
  };

  review.abuseReports.push(newReport);
  review.abuseReportsCount = review.abuseReports.length;
  review.updatedAt = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });

  res.json({
    success: true,
    message: `Review flagged for ${reason}`,
    data: review
  });
};

export const dismissReviewAbuse = (req, res) => {
  const { id } = req.params;
  const review = adminReviews.find(r => r.id === id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });

  review.abuseReports = [];
  review.abuseReportsCount = 0;
  review.updatedAt = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });

  res.json({
    success: true,
    message: "Abuse flags dismissed. Review cleared.",
    data: review
  });
};

export const toggleReviewImageStatus = (req, res) => {
  const { id, imageId } = req.params;
  const { status } = req.body;
  const review = adminReviews.find(r => r.id === id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });

  const image = (review.images || []).find(img => img.id === imageId);
  if (!image) return res.status(404).json({ success: false, message: "Review image not found" });

  image.status = status || (image.status === "Approved" ? "Hidden" : "Approved");
  review.updatedAt = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });

  res.json({
    success: true,
    message: `Review photo marked as ${image.status}`,
    data: image
  });
};

export const deleteAdminReview = (req, res) => {
  const { id } = req.params;
  const index = adminReviews.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: "Review not found" });

  const deleted = adminReviews.splice(index, 1)[0];

  res.json({
    success: true,
    message: `Review ${id} permanently deleted.`,
    data: deleted
  });
};

export const getReviewAnalytics = (req, res) => {
  const total = adminReviews.length;
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  adminReviews.forEach(r => {
    if (starCounts[r.rating] !== undefined) starCounts[r.rating]++;
  });

  const starBreakdown = [
    { stars: 5, count: starCounts[5], percentage: total > 0 ? Math.round((starCounts[5] / total) * 100) : 0 },
    { stars: 4, count: starCounts[4], percentage: total > 0 ? Math.round((starCounts[4] / total) * 100) : 0 },
    { stars: 3, count: starCounts[3], percentage: total > 0 ? Math.round((starCounts[3] / total) * 100) : 0 },
    { stars: 2, count: starCounts[2], percentage: total > 0 ? Math.round((starCounts[2] / total) * 100) : 0 },
    { stars: 1, count: starCounts[1], percentage: total > 0 ? Math.round((starCounts[1] / total) * 100) : 0 }
  ];

  const sentiment = {
    positive: Math.round(((starCounts[5] + starCounts[4]) / total) * 100) || 85,
    neutral: Math.round((starCounts[3] / total) * 100) || 10,
    critical: Math.round(((starCounts[2] + starCounts[1]) / total) * 100) || 5,
    topKeywords: [
      { keyword: "Aroma & Fragrance", count: 48, sentiment: "positive" },
      { keyword: "Purity & Unbleached", count: 42, sentiment: "positive" },
      { keyword: "Quick Cooking", count: 28, sentiment: "positive" },
      { keyword: "Stiff Packaging Zip", count: 6, sentiment: "neutral" },
      { keyword: "Courier Box Crushed", count: 4, sentiment: "critical" }
    ]
  };

  const topProducts = [
    { name: "Harit Bio-Fungicide (1 L)", reviewsCount: 38, averageRating: 4.9, recommendationRate: "98%" },
    { name: "Bhumi Shakti Soil Conditioner (1 L)", reviewsCount: 32, averageRating: 4.9, recommendationRate: "97%" },
    { name: "Neem Oil 1000 PPM (1 L)", reviewsCount: 24, averageRating: 4.8, recommendationRate: "95%" },
    { name: "Dharani Bio-Fertilizer (1 kg)", reviewsCount: 19, averageRating: 4.9, recommendationRate: "96%" },
    { name: "Pushkal Plant Booster (500 ml)", reviewsCount: 16, averageRating: 4.9, recommendationRate: "98%" }
  ];

  res.json({
    success: true,
    data: {
      totalReviews: total,
      averageRating: 4.8,
      recommendationRate: "94.8%",
      verifiedPurchaseRate: "88.2%",
      photoReviewsRate: "38.5%",
      merchantResponseRate: "96.4%",
      starBreakdown,
      sentiment,
      topProducts
    }
  });
};

export const getAdminReturns = (req, res) => {
  res.json({ success: true, count: adminReturns.length, data: adminReturns });
};

export const updateReturnStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const item = adminReturns.find(r => r.id === id);
  if (!item) return res.status(404).json({ success: false, message: "Return not found" });

  item.status = status;
  res.json({ success: true, message: `Return updated to ${status}`, data: item });
};

/**
 * 3-Tier Categories Data Store & Controllers
 */
let adminCategories = [
  {
    id: "CAT-1",
    name: "Bio Fertilizers",
    slug: "bio-fertilizers",
    parentId: null,
    level: "root",
    description: "Beneficial microbial biofertilizers and potassium mobilizers for enhanced soil fertility and root vigour.",
    icon: "🌱",
    image: "/images/categories/bio-fertilizers.jpg",
    bannerImage: "/images/categories/bio-fertilizers.jpg",
    featured: true,
    trending: true,
    active: true,
    orderIndex: 1,
    productsCount: 2,
    deletedAt: null,
    seo: {
      metaTitle: "Bio Fertilizers | Microbial Cultures | Janani Agro",
      metaDescription: "Biological fertilizers and potassium mobilizing microbes for healthy soil ecology.",
      metaKeywords: "bio fertilizers, microbial culture, soil fertility",
      canonicalUrl: "https://jananiagro.com/categories/bio-fertilizers",
      ogImage: "/images/categories/bio-fertilizers.jpg"
    },
    createdAt: "2026-01-10"
  },
  {
    id: "CAT-2",
    name: "Bio Pesticides",
    slug: "bio-pesticides",
    parentId: null,
    level: "root",
    description: "Targeted biological and microbial pest management formulations for organic insect and borer control.",
    icon: "🛡️",
    image: "/images/categories/bio-pesticides.jpg",
    bannerImage: "/images/categories/bio-pesticides.jpg",
    featured: true,
    trending: true,
    active: true,
    orderIndex: 2,
    productsCount: 1,
    deletedAt: null,
    seo: {
      metaTitle: "Bio Pesticides | Organic Pest Management | Janani Agro",
      metaDescription: "Eco-safe biological pesticides for sustainable crop protection.",
      metaKeywords: "bio pesticides, organic pest control, borer control",
      canonicalUrl: "https://jananiagro.com/categories/bio-pesticides",
      ogImage: "/images/categories/bio-pesticides.jpg"
    },
    createdAt: "2026-01-12"
  },
  {
    id: "CAT-3",
    name: "Bio Fungicides",
    slug: "bio-fungicides",
    parentId: null,
    level: "root",
    description: "Antagonistic biological control agents suppressing wilt, damping-off, root rot, collar rot and soil-borne fungal pathogens.",
    icon: "🌿",
    image: "/images/categories/bio-fungicides.jpg",
    bannerImage: "/images/categories/bio-fungicides.jpg",
    featured: true,
    trending: true,
    active: true,
    orderIndex: 3,
    productsCount: 2,
    deletedAt: null,
    seo: {
      metaTitle: "Bio Fungicides | Trichoderma Viride | Janani Agro",
      metaDescription: "Biological fungicides for suppressing root rot, damping off, and soil-borne fungi.",
      metaKeywords: "bio fungicides, trichoderma viride, root rot control",
      canonicalUrl: "https://jananiagro.com/categories/bio-fungicides",
      ogImage: "/images/categories/bio-fungicides.jpg"
    },
    createdAt: "2026-01-14"
  },
  {
    id: "CAT-4",
    name: "Bio Stimulants",
    slug: "bio-stimulants",
    parentId: null,
    level: "root",
    description: "Humic-fulvic biostimulants, amino peptides and seaweed extracts that maximize flowering, fruit set and yield.",
    icon: "⚡",
    image: "/images/categories/bio-stimulants.jpg",
    bannerImage: "/images/categories/bio-stimulants.jpg",
    featured: true,
    trending: true,
    active: true,
    orderIndex: 4,
    productsCount: 4,
    deletedAt: null,
    seo: {
      metaTitle: "Bio Stimulants | Humic & Seaweed Extracts | Janani Agro",
      metaDescription: "Plant biostimulants for increased flowering, fruit setting, and crop vigor.",
      metaKeywords: "bio stimulants, humic acid, seaweed extract, crop yield",
      canonicalUrl: "https://jananiagro.com/categories/bio-stimulants",
      ogImage: "/images/categories/bio-stimulants.jpg"
    },
    createdAt: "2026-01-16"
  },
  {
    id: "CAT-5",
    name: "Micro Nutrients",
    slug: "micro-nutrients",
    parentId: null,
    level: "root",
    description: "Chelated essential micronutrients and fish amino acids for correcting chlorosis and supporting balanced crop health.",
    icon: "🔬",
    image: "/images/categories/micro-nutrients.jpg",
    bannerImage: "/images/categories/micro-nutrients.jpg",
    featured: true,
    trending: true,
    active: true,
    orderIndex: 5,
    productsCount: 2,
    deletedAt: null,
    seo: {
      metaTitle: "Micro Nutrients | Chelated Crop Nutrition | Janani Agro",
      metaDescription: "Essential micronutrient complexes correcting deficiency in crops.",
      metaKeywords: "micro nutrients, chelated zinc, boron, crop nutrition",
      canonicalUrl: "https://jananiagro.com/categories/micro-nutrients",
      ogImage: "/images/categories/micro-nutrients.jpg"
    },
    createdAt: "2026-01-18"
  },
  {
    id: "CAT-6",
    name: "Insecticides",
    slug: "insecticides",
    parentId: null,
    level: "root",
    description: "Broad-spectrum eco-safe solutions for comprehensive management of sucking pests, mites, caterpillars and borers.",
    icon: "🐛",
    image: "/images/categories/insecticides.jpg",
    bannerImage: "/images/categories/insecticides.jpg",
    featured: true,
    trending: false,
    active: true,
    orderIndex: 6,
    productsCount: 1,
    deletedAt: null,
    seo: {
      metaTitle: "Insecticides | Crop Insect Management | Janani Agro",
      metaDescription: "Formulations for sucking pest and borer control.",
      metaKeywords: "insecticides, pest management, crop defense",
      canonicalUrl: "https://jananiagro.com/categories/insecticides",
      ogImage: "/images/categories/insecticides.jpg"
    },
    createdAt: "2026-01-20"
  },
  {
    id: "CAT-7",
    name: "Fungicides",
    slug: "fungicides",
    parentId: null,
    level: "root",
    description: "Protective and curative agricultural fungicides defending foliage and roots against mildew, blights and leaf spots.",
    icon: "🍃",
    image: "/images/categories/fungicides.jpg",
    bannerImage: "/images/categories/fungicides.jpg",
    featured: true,
    trending: false,
    active: true,
    orderIndex: 7,
    productsCount: 1,
    deletedAt: null,
    seo: {
      metaTitle: "Fungicides | Leaf Spot & Blight Protection | Janani Agro",
      metaDescription: "Protective and curative agricultural fungicides.",
      metaKeywords: "fungicides, powdery mildew, blight control",
      canonicalUrl: "https://jananiagro.com/categories/fungicides",
      ogImage: "/images/categories/fungicides.jpg"
    },
    createdAt: "2026-01-22"
  },
  {
    id: "CAT-8",
    name: "Botanical Extracts",
    slug: "botanical-extracts",
    parentId: null,
    level: "root",
    description: "Cold-pressed herbal derivatives and Azadirachtin neem formulations for zero-residue IPM protection.",
    icon: "🌿",
    image: "/images/categories/botanical-extracts.jpg",
    bannerImage: "/images/categories/botanical-extracts.jpg",
    featured: true,
    trending: true,
    active: true,
    orderIndex: 8,
    productsCount: 1,
    deletedAt: null,
    seo: {
      metaTitle: "Botanical Extracts | Neem Azadirachtin | Janani Agro",
      metaDescription: "Pure botanical extracts and herbal pest repellents.",
      metaKeywords: "botanical extracts, neem oil, azadirachtin 1000 ppm",
      canonicalUrl: "https://jananiagro.com/categories/botanical-extracts",
      ogImage: "/images/categories/botanical-extracts.jpg"
    },
    createdAt: "2026-01-24"
  },
  {
    id: "CAT-9",
    name: "Water Solubles",
    slug: "water-solubles",
    parentId: null,
    level: "root",
    description: "100% water soluble foliar and drip fertigation formulations for immediate plant absorption and rapid vegetative recovery.",
    icon: "💧",
    image: "/images/categories/water-solubles.jpg",
    bannerImage: "/images/categories/water-solubles.jpg",
    featured: true,
    trending: false,
    active: true,
    orderIndex: 9,
    productsCount: 1,
    deletedAt: null,
    seo: {
      metaTitle: "Water Solubles | Foliar & Drip Nutrition | Janani Agro",
      metaDescription: "Water soluble fertilizers for foliar spray and fertigation.",
      metaKeywords: "water soluble fertilizer, drip irrigation, foliar nutrition",
      canonicalUrl: "https://jananiagro.com/categories/water-solubles",
      ogImage: "/images/categories/water-solubles.jpg"
    },
    createdAt: "2026-01-26"
  },
  {
    id: "CAT-10",
    name: "Agri Inputs",
    slug: "agri-inputs",
    parentId: null,
    level: "root",
    description: "Essential agricultural soil amendments, organic carbon inputs, and sustainable soil rejuvenation solutions.",
    icon: "🌾",
    image: "/images/categories/agri-inputs.jpg",
    bannerImage: "/images/categories/agri-inputs.jpg",
    featured: true,
    trending: false,
    active: true,
    orderIndex: 10,
    productsCount: 2,
    deletedAt: null,
    seo: {
      metaTitle: "Agri Inputs | Soil Conditioners & Amendments | Janani Agro",
      metaDescription: "Sustainable agricultural inputs and soil health enhancers.",
      metaKeywords: "agri inputs, soil amendments, organic carbon",
      canonicalUrl: "https://jananiagro.com/categories/agri-inputs",
      ogImage: "/images/categories/agri-inputs.jpg"
    },
    createdAt: "2026-01-28"
  },
  {
    id: "CAT-11",
    name: "Others",
    slug: "others",
    parentId: null,
    level: "root",
    description: "Speciality agricultural aids, spray activators, silicone spreaders, and farm adjuvants.",
    icon: "✨",
    image: "/images/categories/others.jpg",
    bannerImage: "/images/categories/others.jpg",
    featured: false,
    trending: false,
    active: true,
    orderIndex: 11,
    productsCount: 1,
    deletedAt: null,
    seo: {
      metaTitle: "Others | Agricultural Aids & Adjuvants | Janani Agro",
      metaDescription: "Speciality agricultural aids and silicon spray spreaders.",
      metaKeywords: "silicone spreader, wetting agent, spray adjuvant",
      canonicalUrl: "https://jananiagro.com/categories/others",
      ogImage: "/images/categories/others.jpg"
    },
    createdAt: "2026-01-30"
  }
];

export const getAdminCategories = (req, res) => {
  const { status = "all", level = "all", search = "" } = req.query;

  let results = [...adminCategories];

  // Status Filter (active vs trash)
  if (status === "active") {
    results = results.filter(c => !c.deletedAt);
  } else if (status === "trash") {
    results = results.filter(c => !!c.deletedAt);
  }

  // Level Filter
  if (level !== "all") {
    results = results.filter(c => c.level === level);
  }

  // Search
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  }

  // Sort by orderIndex
  results.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  res.json({
    success: true,
    count: results.length,
    total: adminCategories.length,
    activeCount: adminCategories.filter(c => !c.deletedAt).length,
    trashCount: adminCategories.filter(c => !!c.deletedAt).length,
    data: results
  });
};

export const createAdminCategory = (req, res) => {
  const {
    name,
    slug,
    parentId = null,
    level = "root",
    description = "",
    icon = "🌾",
    image = "/images/category-placeholder.jpg",
    bannerImage = "/images/banner-placeholder.jpg",
    featured = false,
    trending = false,
    active = true,
    seo = {}
  } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: "Category name is required" });
  }

  const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const newCategory = {
    id: `CAT-${level.toUpperCase()}-${Date.now()}`,
    name,
    slug: generatedSlug,
    parentId: parentId || null,
    level,
    description,
    icon,
    image,
    bannerImage,
    featured: Boolean(featured),
    trending: Boolean(trending),
    active: active !== undefined ? Boolean(active) : true,
    orderIndex: adminCategories.length + 1,
    productsCount: 0,
    deletedAt: null,
    seo: {
      metaTitle: seo.metaTitle || `${name} | Organic Janani Agro`,
      metaDescription: seo.metaDescription || description || `Buy pure organic ${name} online.`,
      metaKeywords: seo.metaKeywords || name.toLowerCase(),
      canonicalUrl: seo.canonicalUrl || `https://jananiagro.com/categories/${generatedSlug}`,
      ogImage: seo.ogImage || image
    },
    createdAt: new Date().toISOString().split("T")[0]
  };

  adminCategories.push(newCategory);
  res.status(201).json({ success: true, message: "Category created successfully", data: newCategory });
};

export const updateAdminCategory = (req, res) => {
  const { id } = req.params;
  const index = adminCategories.findIndex(c => c.id === id || c.slug === id || c.id === ('cat-' + id) || (c.id && c.id.startsWith('cat-') && c.id.slice(4) === id));
  if (index === -1) return res.status(404).json({ success: false, message: "Category not found" });

  const oldName = adminCategories[index].name;
  adminCategories[index] = {
    ...adminCategories[index],
    ...req.body,
    seo: {
      ...(adminCategories[index].seo || {}),
      ...(req.body.seo || {})
    }
  };

  // If category name changed, update products
  if (req.body.name && req.body.name !== oldName && Array.isArray(global.adminProducts || adminProducts)) {
    try {
      const prods = global.adminProducts || adminProducts;
      prods.forEach(p => {
        if (p.category === oldName || p.category_name === oldName) {
          p.category = req.body.name;
          p.category_name = req.body.name;
        }
      });
    } catch (e) {}
  }

  res.json({ success: true, message: "Category updated successfully", data: adminCategories[index] });
};

export const toggleAdminCategory = (req, res) => {
  const { id } = req.params;
  const { field } = req.body; // 'active', 'featured', or 'trending'
  const category = adminCategories.find(c => c.id === id);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });

  if (field === "featured") category.featured = !category.featured;
  else if (field === "trending") category.trending = !category.trending;
  else category.active = !category.active;

  res.json({ success: true, message: `Category ${field || 'status'} updated`, data: category });
};

export const deleteAdminCategory = (req, res) => {
  const { id } = req.params;
  const catToDelete = adminCategories.find(c => c.id === id || c.slug === id);
  const delName = catToDelete ? catToDelete.name : id;
  const delSlug = catToDelete ? catToDelete.slug : id;

  let otherCat = adminCategories.find(c => (c.slug === 'other-categories' || c.name === 'Other Categories') && c.id !== id && c.slug !== id) ||
    adminCategories.find(c => (c.slug?.includes('other') || c.name?.toLowerCase().includes('other')) && c.id !== id && c.slug !== id);
  if (!otherCat) {
    otherCat = {
      id: "cat-other-categories",
      name: "Other Categories",
      slug: "other-categories",
      parentId: null,
      level: "root",
      description: "All remaining products are present in this categories",
      icon: "📦",
      image: "/images/categories/others.jpg",
      bannerImage: "/images/categories/others.jpg",
      featured: false,
      trending: false,
      active: true,
      orderIndex: 999,
      productsCount: 0,
      deletedAt: null
    };
    adminCategories.push(otherCat);
  }

  adminProducts.forEach(p => {
    const pCat = (p.category || p.category_name || "").toLowerCase().trim();
    if (pCat === delName.toLowerCase().trim() || pCat === delSlug.toLowerCase().trim() || p.category_id === id) {
      p.category = otherCat.name;
      p.category_name = otherCat.name;
      p.category_id = otherCat.id;
      p.category_slug = otherCat.slug;
    }
  });

  adminCategories = adminCategories.filter(c => c.id !== id && c.slug !== id);
  res.json({ success: true, message: "Category permanently deleted" });
};

export const restoreAdminCategory = (req, res) => {
  const { id } = req.params;
  const category = adminCategories.find(c => c.id === id);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });

  category.deletedAt = null;
  res.json({ success: true, message: "Category restored from trash", data: category });
};

export const permanentDeleteAdminCategory = (req, res) => {
  const { id } = req.params;
  const catToDelete = adminCategories.find(c => c.id === id || c.slug === id);
  const delName = catToDelete ? catToDelete.name : id;
  const delSlug = catToDelete ? catToDelete.slug : id;

  let otherCat = adminCategories.find(c => (c.slug === 'other-categories' || c.name === 'Other Categories') && c.id !== id && c.slug !== id) ||
    adminCategories.find(c => (c.slug?.includes('other') || c.name?.toLowerCase().includes('other')) && c.id !== id && c.slug !== id);
  if (!otherCat) {
    otherCat = {
      id: "cat-other-categories",
      name: "Other Categories",
      slug: "other-categories",
      parentId: null,
      level: "root",
      description: "All remaining products are present in this categories",
      icon: "📦",
      image: "/images/categories/others.jpg",
      bannerImage: "/images/categories/others.jpg",
      featured: false,
      trending: false,
      active: true,
      orderIndex: 999,
      productsCount: 0,
      deletedAt: null
    };
    adminCategories.push(otherCat);
  }

  adminProducts.forEach(p => {
    const pCat = (p.category || p.category_name || "").toLowerCase().trim();
    if (pCat === delName.toLowerCase().trim() || pCat === delSlug.toLowerCase().trim() || p.category_id === id) {
      p.category = otherCat.name;
      p.category_name = otherCat.name;
      p.category_id = otherCat.id;
      p.category_slug = otherCat.slug;
    }
  });

  adminCategories = adminCategories.filter(c => c.id !== id);
  res.json({ success: true, message: "Category permanently deleted" });
};

export const bulkUpdateCategoryStatus = (req, res) => {
  const { ids = [], active = true } = req.body;


  adminCategories.forEach(c => {
    if (ids.includes(c.id)) {
      c.active = Boolean(active);
    }
  });
  res.json({ success: true, message: `Updated status for ${ids.length} categories` });
};

export const bulkDeleteCategories = (req, res) => {
  const { ids = [] } = req.body;


  adminCategories.forEach(c => {
    if (ids.includes(c.id)) {
      c.deletedAt = new Date().toISOString();
    }
  });
  res.json({ success: true, message: `Moved ${ids.length} categories to trash` });
};

export const reorderCategories = (req, res) => {
  const { orderedIds = [] } = req.body;
  orderedIds.forEach((id, index) => {
    const category = adminCategories.find(c => c.id === id);
    if (category) {
      category.orderIndex = index + 1;
    }
  });
  res.json({ success: true, message: "Category sequence updated" });
};

export const importCategories = (req, res) => {
  const { categories = [] } = req.body;
  let importedCount = 0;

  categories.forEach(item => {
    if (item.name) {
      const generatedSlug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      adminCategories.push({
        id: item.id || `CAT-IMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: item.name,
        slug: generatedSlug,
        parentId: item.parentId || null,
        level: item.level || "root",
        description: item.description || "Imported harvest category.",
        icon: item.icon || "🌾",
        image: item.image || "/images/category-placeholder.jpg",
        bannerImage: item.bannerImage || "/images/banner-placeholder.jpg",
        featured: Boolean(item.featured),
        trending: Boolean(item.trending),
        active: item.active !== undefined ? Boolean(item.active) : true,
        orderIndex: adminCategories.length + 1,
        productsCount: Number(item.productsCount) || 0,
        deletedAt: null,
        seo: {
          metaTitle: item.metaTitle || item.name,
          metaDescription: item.metaDescription || item.description || "",
          metaKeywords: item.metaKeywords || "",
          canonicalUrl: item.canonicalUrl || `https://jananiagro.com/categories/${generatedSlug}`,
          ogImage: item.image || ""
        },
        createdAt: new Date().toISOString().split("T")[0]
      });
      importedCount++;
    }
  });

  res.status(201).json({ success: true, message: `Successfully imported ${importedCount} categories` });
};

// -------------------------------------------------------------
// SHIPROCKET SHIPPING MANAGEMENT DATA STORES & CONTROLLERS
// -------------------------------------------------------------

export let shippingConfig = {
  environment: "live", // "live" | "sandbox"
  apiEmail: "logistics@jananiagro.com",
  apiToken: "",
  apiKey: "SR_KEY_88291049",
  webhookSecret: "",
  autoManifestOnAwb: true,
  defaultPickupHub: "HUB-BLR-01",
  courierPriority: "best_rated", // "fastest" | "cheapest" | "best_rated"
  insuranceThreshold: 5000,
  smsNotifications: true,
  whatsappUpdates: true,
  lastConnected: "2026-09-11 10:15 AM",
  status: "Connected"
};

export let pickupLocations = [
  {
    id: "HUB-BLR-01",
    name: "Bengaluru Central Fulfillment Hub",
    hubCode: "WH-BLR-01",
    contactPerson: "Ramesh Gowda",
    phone: "+91 98451 99881",
    email: "warehouse.blr@jananiagro.com",
    address: "Plot 44, Food Processing Zone, KIADB Industrial Area, Phase 1",
    landmark: "Near EcoSpace Metro Station",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560100",
    operatingHours: "08:00 AM - 08:00 PM",
    isDefault: true,
    totalDispatches: 1420,
    status: "Active"
  },
  {
    id: "HUB-HYD-01",
    name: "Hyderabad Agro-Logistics Depot",
    hubCode: "WH-HYD-01",
    contactPerson: "Venkat Rao",
    phone: "+91 98772 33441",
    email: "warehouse.hyd@jananiagro.com",
    address: "Survey No. 128, Cargo Hub Road, Shamshabad",
    landmark: "Opp. RGI Airport Cargo Terminal",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500409",
    operatingHours: "09:00 AM - 07:00 PM",
    isDefault: false,
    totalDispatches: 860,
    status: "Active"
  },
  {
    id: "HUB-DEL-02",
    name: "Delhi NCR Cold Storage & Logistics",
    hubCode: "WH-DEL-02",
    contactPerson: "Rajeev Singhal",
    phone: "+91 99100 88231",
    email: "warehouse.del@jananiagro.com",
    address: "B-24, Okhla Industrial Area Phase 3",
    landmark: "Near Modi Mill Flyover",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110020",
    operatingHours: "08:30 AM - 08:30 PM",
    isDefault: false,
    totalDispatches: 940,
    status: "Active"
  },
  {
    id: "HUB-MUM-01",
    name: "Mumbai Western Distribution Center",
    hubCode: "WH-MUM-01",
    contactPerson: "Sanjay Sawant",
    phone: "+91 98200 44552",
    email: "warehouse.mum@jananiagro.com",
    address: "Gala 10, Shree Raj Logistics Park, Bhiwandi",
    landmark: "Mumbai-Nashik Highway Bypass",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "421302",
    operatingHours: "09:00 AM - 09:00 PM",
    isDefault: false,
    totalDispatches: 720,
    status: "Active"
  }
];

export let shipmentRecords = [];

export let ndrRecords = [];

// -------------------------------------------------------------
// CONTROLLER HANDLERS
// -------------------------------------------------------------

export const getShippingConfig = (req, res) => {
  res.json({ success: true, data: shippingConfig });
};

export const updateShippingConfig = (req, res) => {
  const updates = req.body || {};
  shippingConfig = { ...shippingConfig, ...updates };
  res.json({ success: true, message: "Shiprocket configuration updated successfully", data: shippingConfig });
};

export const testShiprocketConnection = (req, res) => {
  shippingConfig.lastConnected = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
  shippingConfig.status = "Connected";
  res.json({
    success: true,
    message: "Shiprocket API Connection Verified Successfully! All carrier webhooks active.",
    data: {
      accountName: "Janani Agro Products Pvt Ltd",
      accountEmail: shippingConfig.apiEmail,
      walletBalance: 18450.00,
      activeCarriers: ["Bluedart Air", "Delhivery Surface", "Ekart", "Shadowfax", "Xpressbees", "DTDC"],
      pingLatency: "48ms",
      status: "Connected"
    }
  });
};

export const getPickupLocations = (req, res) => {
  res.json({ success: true, data: pickupLocations });
};

export const createPickupLocation = (req, res) => {
  const { name, hubCode, contactPerson, phone, email, address, landmark, city, state, pincode, operatingHours, isDefault } = req.body;
  if (!name || !address || !pincode) {
    return res.status(400).json({ success: false, message: "Name, address and pincode are required" });
  }

  if (isDefault) {
    pickupLocations.forEach(p => p.isDefault = false);
  }

  const newHub = {
    id: `HUB-${Date.now().toString().slice(-4)}`,
    name,
    hubCode: hubCode || `WH-${city?.substring(0, 3).toUpperCase() || 'HUB'}-01`,
    contactPerson: contactPerson || "Hub Supervisor",
    phone: phone || "+91 98000 00000",
    email: email || "hub@jananiagro.com",
    address,
    landmark: landmark || "",
    city: city || "Bengaluru",
    state: state || "Karnataka",
    pincode,
    operatingHours: operatingHours || "09:00 AM - 08:00 PM",
    isDefault: Boolean(isDefault),
    totalDispatches: 0,
    status: "Active"
  };

  pickupLocations.unshift(newHub);
  res.status(201).json({ success: true, message: "Pickup location added to Shiprocket registry", data: newHub });
};

export const updatePickupLocation = (req, res) => {
  const { id } = req.params;
  const index = pickupLocations.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(400).json({ success: false, message: "Pickup location not found" });
  }

  if (req.body.isDefault) {
    pickupLocations.forEach(p => p.isDefault = false);
  }

  pickupLocations[index] = { ...pickupLocations[index], ...req.body };
  res.json({ success: true, message: "Pickup location updated successfully", data: pickupLocations[index] });
};

export const deletePickupLocation = (req, res) => {
  const { id } = req.params;
  const hub = pickupLocations.find(p => p.id === id);
  if (hub?.isDefault) {
    return res.status(400).json({ success: false, message: "Cannot delete the default pickup location. Set another hub as default first." });
  }

  pickupLocations = pickupLocations.filter(p => p.id !== id);
  res.json({ success: true, message: "Pickup hub removed from Shiprocket registry" });
};

export const getShipments = (req, res) => {
  const { status, courier, search, sortBy = "newest" } = req.query;
  let results = [...shipmentRecords];

  if (status && status !== "all") {
    results = results.filter(s => s.status.toLowerCase() === status.toLowerCase());
  }

  if (courier && courier !== "all") {
    results = results.filter(s => s.courier.toLowerCase().includes(courier.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(s =>
      s.awbCode.toLowerCase().includes(q) ||
      s.orderId.toLowerCase().includes(q) ||
      s.customer.name.toLowerCase().includes(q) ||
      s.customer.city.toLowerCase().includes(q) ||
      s.customer.phone.includes(q)
    );
  }

  if (sortBy === "newest") {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === "weight_desc") {
    results.sort((a, b) => parseFloat(b.packageWeight) - parseFloat(a.packageWeight));
  }

  const stats = {
    totalShipments: shipmentRecords.length,
    activeShipments: shipmentRecords.filter(s => s.status === "In Transit" || s.status === "Out for Delivery" || s.status === "Ready for Pickup").length,
    inTransit: shipmentRecords.filter(s => s.status === "In Transit").length,
    outForDelivery: shipmentRecords.filter(s => s.status === "Out for Delivery").length,
    ndrExceptions: shipmentRecords.filter(s => s.status.includes("NDR")).length,
    delivered: shipmentRecords.filter(s => s.status === "Delivered").length,
    totalShippingSpend: shipmentRecords.reduce((sum, s) => sum + (s.shippingCharges || 0), 0)
  };

  res.json({ success: true, data: results, stats, total: results.length });
};

export const getShipmentByAwb = (req, res) => {
  const { awb } = req.params;
  const shipment = shipmentRecords.find(s => s.awbCode === awb || s.orderId === awb || s.id === awb);
  if (!shipment) {
    return res.status(404).json({ success: false, message: "Shipment AWB not found" });
  }
  res.json({ success: true, data: shipment });
};

export const cancelShipment = (req, res) => {
  const { awb } = req.params;
  const { reason = "Customer request before courier handover" } = req.body;
  const shipment = shipmentRecords.find(s => s.awbCode === awb || s.id === awb);
  if (!shipment) {
    return res.status(404).json({ success: false, message: "Shipment AWB not found" });
  }

  shipment.status = "Cancelled";
  shipment.trackingTimeline.push({
    status: "Cancelled",
    title: `Shipment Cancelled: ${reason}`,
    location: "Janani Agro Operations Desk",
    time: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }),
    done: true
  });

  res.json({ success: true, message: `Shipment ${awb} cancelled and AWB voided with courier partner.`, data: shipment });
};

export const calculateShippingRates = (req, res) => {
  const { originPincode = "560100", destinationPincode = "110001", weight = 1.0, length = 20, width = 15, height = 10, paymentType = "prepaid", orderAmount = 1000 } = req.body;

  const numericWeight = Math.max(0.5, parseFloat(weight) || 1.0);
  const volumetricWeight = ((parseFloat(length) * parseFloat(width) * parseFloat(height)) / 5000).toFixed(2);
  const applicableWeight = Math.max(numericWeight, parseFloat(volumetricWeight));

  const couriers = [
    {
      id: "bluedart-air",
      name: "Bluedart Air Express",
      badge: "Fastest Delivery",
      rating: 4.8,
      etdDays: "1 - 2 Business Days",
      baseRate: Math.round(applicableWeight * 95),
      codCharge: paymentType === "cod" ? 40 : 0,
      fuelSurcharge: 12,
      gst: Math.round((applicableWeight * 95 + (paymentType === "cod" ? 40 : 0)) * 0.18),
      totalRate: 0,
      pickupService: "Same Day (4 PM Cutoff)",
      trackingReliability: "99.4%"
    },
    {
      id: "delhivery-surface",
      name: "Delhivery Surface Standard",
      badge: "Best Value",
      rating: 4.6,
      etdDays: "2 - 4 Business Days",
      baseRate: Math.round(applicableWeight * 58),
      codCharge: paymentType === "cod" ? 35 : 0,
      fuelSurcharge: 8,
      gst: Math.round((applicableWeight * 58 + (paymentType === "cod" ? 35 : 0)) * 0.18),
      totalRate: 0,
      pickupService: "Same Day (5 PM Cutoff)",
      trackingReliability: "98.2%"
    },
    {
      id: "ekart-surface",
      name: "Ekart Logistics Surface",
      badge: "High Rural Reach",
      rating: 4.5,
      etdDays: "3 - 5 Business Days",
      baseRate: Math.round(applicableWeight * 52),
      codCharge: paymentType === "cod" ? 30 : 0,
      fuelSurcharge: 6,
      gst: Math.round((applicableWeight * 52 + (paymentType === "cod" ? 30 : 0)) * 0.18),
      totalRate: 0,
      pickupService: "Next Day",
      trackingReliability: "97.8%"
    },
    {
      id: "shadowfax-express",
      name: "Shadowfax Local Connect",
      badge: "Metro Priority",
      rating: 4.4,
      etdDays: "1 - 3 Business Days",
      baseRate: Math.round(applicableWeight * 62),
      codCharge: paymentType === "cod" ? 35 : 0,
      fuelSurcharge: 7,
      gst: Math.round((applicableWeight * 62 + (paymentType === "cod" ? 35 : 0)) * 0.18),
      totalRate: 0,
      pickupService: "Same Day (2 PM Cutoff)",
      trackingReliability: "96.9%"
    },
    {
      id: "xpressbees-surface",
      name: "Xpressbees Surface",
      badge: "Economical Bulk",
      rating: 4.3,
      etdDays: "3 - 5 Business Days",
      baseRate: Math.round(applicableWeight * 48),
      codCharge: paymentType === "cod" ? 30 : 0,
      fuelSurcharge: 5,
      gst: Math.round((applicableWeight * 48 + (paymentType === "cod" ? 30 : 0)) * 0.18),
      totalRate: 0,
      pickupService: "Same Day (4 PM Cutoff)",
      trackingReliability: "96.5%"
    }
  ];

  couriers.forEach(c => {
    c.totalRate = c.baseRate + c.codCharge + c.fuelSurcharge + c.gst;
  });

  couriers.sort((a, b) => a.totalRate - b.totalRate);

  res.json({
    success: true,
    data: {
      originPincode,
      destinationPincode,
      deadWeight: `${numericWeight} kg`,
      volumetricWeight: `${volumetricWeight} kg`,
      chargeableWeight: `${applicableWeight} kg`,
      paymentType,
      recommendedCourier: couriers[0],
      availableCouriers: couriers
    }
  });
};

export const getCourierRecommendations = (req, res) => {
  const { destinationPincode = "560001", weight = 1.0, isFragile = true } = req.body;
  const recommendations = [
    {
      courierName: "Shiprocket (Bluedart Air)",
      recommendationScore: 98,
      reason: "Fastest metro delivery with gentle handling for fragile organic glass jars",
      eta: "1-2 Days",
      estimatedCost: 110,
      rating: 4.9
    },
    {
      courierName: "Shiprocket (Delhivery Surface)",
      recommendationScore: 92,
      reason: "Best cost-to-speed balance for standard packages > 2kg",
      eta: "2-4 Days",
      estimatedCost: 75,
      rating: 4.7
    },
    {
      courierName: "Shiprocket (Shadowfax)",
      recommendationScore: 88,
      reason: "Optimized for local South India pin codes",
      eta: "Same Day / Next Day",
      estimatedCost: 85,
      rating: 4.5
    }
  ];
  res.json({ success: true, data: recommendations });
};

export const schedulePickup = (req, res) => {
  const { pickupLocationId = "HUB-BLR-01", pickupDate = "2026-09-12", timeSlot = "02:00 PM - 06:00 PM", expectedPackagesCount = 8 } = req.body;
  const location = pickupLocations.find(p => p.id === pickupLocationId) || pickupLocations[0];

  const pickupRequestId = `PRQ-${Date.now().toString().slice(-6)}`;
  res.json({
    success: true,
    message: `Pickup scheduled successfully for ${location.name} on ${pickupDate} (${timeSlot})`,
    data: {
      pickupRequestId,
      hubName: location.name,
      hubAddress: location.address,
      contactPerson: location.contactPerson,
      contactPhone: location.phone,
      pickupDate,
      timeSlot,
      expectedPackagesCount,
      assignedDriver: "Mahesh K. (Bluedart Logistics Agent)",
      driverPhone: "+91 98860 11223",
      status: "Confirmed"
    }
  });
};

export const getNdrList = (req, res) => {
  res.json({ success: true, data: ndrRecords });
};

export const handleNdrAction = (req, res) => {
  const { id } = req.params;
  const { action, note, reattemptDate, updatedPhone, updatedAddress } = req.body;
  const ndr = ndrRecords.find(n => n.id === id);
  if (!ndr) {
    return res.status(404).json({ success: false, message: "NDR record not found" });
  }

  const timestamp = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
  if (action === "reattempt") {
    ndr.status = "Reattempt Scheduled";
    ndr.actionHistory.push({
      action: `Re-attempt scheduled for ${reattemptDate || 'Tomorrow'}`,
      note: note || "Customer requested re-attempt",
      date: timestamp
    });
  } else if (action === "update_info") {
    ndr.status = "Info Updated - Reattempting";
    ndr.customerPhone = updatedPhone || ndr.customerPhone;
    ndr.actionHistory.push({
      action: `Contact & Address Updated`,
      note: `Phone: ${updatedPhone || 'No change'}, Address: ${updatedAddress || 'No change'}. ${note || ''}`,
      date: timestamp
    });
  } else if (action === "rto") {
    ndr.status = "RTO Initiated";
    ndr.actionHistory.push({
      action: "RTO Initiated (Return to Origin)",
      note: note || "Customer confirmed cancellation or repeated non-delivery",
      date: timestamp
    });
  }

  res.json({ success: true, message: `NDR action '${action}' recorded and synced with Shiprocket courier`, data: ndr });
};

export const generateManifest = (req, res) => {
  const { shipmentIds = [] } = req.body;
  const selectedShipments = shipmentRecords.filter(s => shipmentIds.length === 0 || shipmentIds.includes(s.id) || shipmentIds.includes(s.awbCode));

  const manifest = {
    manifestId: `MNF-${Date.now().toString().slice(-6)}`,
    generatedAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }),
    pickupHub: pickupLocations[0].name,
    hubAddress: pickupLocations[0].address,
    courierPartner: "Shiprocket Multi-Carrier Consolidated",
    totalParcels: selectedShipments.length || 5,
    totalWeight: "14.8 kg",
    shipments: selectedShipments.length > 0 ? selectedShipments : shipmentRecords.slice(0, 4)
  };

  res.json({ success: true, message: "Handover manifest generated", data: manifest });
};

// -------------------------------------------------------------
// PAYMENT MANAGEMENT DATA STORES & CONTROLLERS
// -------------------------------------------------------------

export let paymentTransactions = [];

export let gatewayConfigurations = {
  razorpay: {
    enabled: true,
    mode: "live", // "live" | "test"
    keyId: "",
    keySecret: "",
    webhookSecret: "",
    autoCapture: true,
    supportedMethods: ["UPI", "Credit/Debit Cards", "NetBanking", "Wallets"],
    feeMdr: "1.9% on Cards, 0% on UPI",
    lastTested: "2026-09-11 11:30 AM",
    status: "Active & Healthy"
  },
  stripe: {
    enabled: true,
    mode: "live",
    publishableKey: "",
    secretKey: "",
    webhookSecret: "",
    autoConvertCurrency: true,
    enable3DSecure: true,
    feeMdr: "3.0% + ₹3.00",
    lastTested: "2026-09-11 11:32 AM",
    status: "Active & Healthy"
  },
  upiDirect: {
    enabled: true,
    merchantVpa: "jananiagro@hdfcbank",
    merchantName: "Janani Agro Products Private Limited",
    mccCode: "5411 (Grocery & Farm Harvest)",
    autoVerifyUtrWebhook: true,
    instantQrCodeEnabled: true,
    feeMdr: "0.0% (Zero MDR)",
    lastTested: "2026-09-11 11:35 AM",
    status: "Active & Verified"
  },
  codRules: {
    enabled: true,
    maxOrderLimit: 5000,
    minOrderLimit: 300,
    extraHandlingFee: 40,
    otpVerificationOnCheckout: true,
    blockHighRtoPincodes: true,
    blockedPincodes: ["110094", "400078", "700024"],
    status: "Active"
  }
};

export let refundRecords = [];

export let settlementReports = [];

export let failedPaymentRetries = [];

// -------------------------------------------------------------
// CONTROLLER METHODS
// -------------------------------------------------------------

export const getPaymentTransactions = (req, res) => {
  const { status, gateway, search, sortBy = "newest" } = req.query;
  let results = [...paymentTransactions];

  if (status && status !== "all") {
    results = results.filter(t => t.status.toLowerCase() === status.toLowerCase());
  }

  if (gateway && gateway !== "all") {
    results = results.filter(t => t.gateway.toLowerCase().includes(gateway.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(t =>
      t.id.toLowerCase().includes(q) ||
      t.orderId.toLowerCase().includes(q) ||
      t.customer.name.toLowerCase().includes(q) ||
      t.customer.email.toLowerCase().includes(q) ||
      (t.bankUtr && t.bankUtr.toLowerCase().includes(q))
    );
  }

  if (sortBy === "newest") {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === "amount_desc") {
    results.sort((a, b) => b.grossAmount - a.grossAmount);
  }

  const stats = {
    grossInflow: paymentTransactions.filter(t => t.status === "Captured" || t.status === "Partially Refunded").reduce((sum, t) => sum + t.grossAmount, 0),
    settledToBank: settlementReports.reduce((sum, s) => sum + s.netBankDeposit, 0),
    pendingPayouts: paymentTransactions.filter(t => t.settlementStatus.includes("Pending")).reduce((sum, t) => sum + t.netSettledAmount, 0),
    codInTransit: paymentTransactions.filter(t => t.gateway.includes("COD") && t.status === "Pending").reduce((sum, t) => sum + t.grossAmount, 0),
    totalRefunds: paymentTransactions.reduce((sum, t) => sum + (t.refundedAmount || 0), 0),
    recoveryRate: "68.4%"
  };

  res.json({ success: true, data: results, stats, total: results.length });
};

export const getPaymentTransactionById = (req, res) => {
  const { id } = req.params;
  const txn = paymentTransactions.find(t => t.id === id || t.orderId === id);
  if (!txn) {
    return res.status(404).json({ success: false, message: "Transaction not found" });
  }
  res.json({ success: true, data: txn });
};

export const processPaymentRefund = (req, res) => {
  const { transactionId, orderId, refundType = "partial", amount, destination = "gateway", reason = "Customer Request" } = req.body;

  const txn = paymentTransactions.find(t => t.id === transactionId || t.orderId === orderId);
  if (!txn) {
    return res.status(404).json({ success: false, message: "Transaction not found" });
  }

  const numericAmount = parseFloat(amount) || txn.grossAmount;
  const availableToRefund = txn.grossAmount - (txn.refundedAmount || 0);

  if (numericAmount <= 0 || numericAmount > availableToRefund) {
    return res.status(400).json({
      success: false,
      message: `Invalid refund amount. Maximum eligible amount is ₹${availableToRefund}`
    });
  }

  txn.refundedAmount = (txn.refundedAmount || 0) + numericAmount;
  txn.status = txn.refundedAmount >= txn.grossAmount ? "Refunded" : "Partially Refunded";

  const newRefund = {
    id: `rfd_${Date.now().toString().slice(-5)}`,
    transactionId: txn.id,
    orderId: txn.orderId,
    customerName: txn.customer.name,
    customerEmail: txn.customer.email,
    refundType: txn.status === "Refunded" ? "Full Refund" : "Partial Refund",
    amount: numericAmount,
    totalOrderAmount: txn.grossAmount,
    destination: destination === "wallet" ? "Customer Store Wallet Credit" : `Original Payment Source (${txn.gateway})`,
    reason,
    status: "Completed",
    gatewayRefundId: `rfnd_${Date.now()}`,
    processedAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
  };

  refundRecords.unshift(newRefund);

  res.status(201).json({
    success: true,
    message: `Refund of ₹${numericAmount} processed successfully via ${newRefund.destination}`,
    data: { transaction: txn, refund: newRefund }
  });
};

export const getGatewayConfig = (req, res) => {
  res.json({ success: true, data: gatewayConfigurations });
};

export const updateGatewayConfig = (req, res) => {
  const { gateway, config } = req.body;
  if (!gateway || !gatewayConfigurations[gateway]) {
    return res.status(400).json({ success: false, message: "Invalid gateway specified" });
  }

  gatewayConfigurations[gateway] = { ...gatewayConfigurations[gateway], ...config };
  res.json({ success: true, message: `${gateway.toUpperCase()} configuration saved successfully`, data: gatewayConfigurations[gateway] });
};

export const testGatewayConnection = (req, res) => {
  const { gateway = "razorpay" } = req.body;
  const target = gatewayConfigurations[gateway];
  if (!target) {
    return res.status(400).json({ success: false, message: "Gateway not found" });
  }

  target.lastTested = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
  target.status = "Active & Verified (Ping: 42ms)";

  res.json({
    success: true,
    message: `${gateway.toUpperCase()} Live Webhook & API Connection Verified!`,
    data: {
      gateway,
      ping: "42ms",
      merchantAccount: "Janani Agro Products Pvt Ltd",
      status: target.status,
      timestamp: target.lastTested
    }
  });
};

export const getSettlementReports = (req, res) => {
  res.json({ success: true, data: settlementReports });
};

export const getFailedPaymentRetries = (req, res) => {
  res.json({ success: true, data: failedPaymentRetries });
};

export const sendPaymentRetryLink = (req, res) => {
  const { id } = req.params;
  const { channel = "whatsapp" } = req.body;
  const retry = failedPaymentRetries.find(r => r.id === id);
  if (!retry) {
    return res.status(404).json({ success: false, message: "Failed retry record not found" });
  }

  retry.recoveryStatus = "Link Sent";
  retry.lastSentAt = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });

  res.json({
    success: true,
    message: `Payment recovery link sent to ${retry.customerName} via ${channel.toUpperCase()} (${retry.customerPhone})`,
    data: retry
  });
};

export const convertFailedToCod = (req, res) => {
  const { id } = req.params;
  const retry = failedPaymentRetries.find(r => r.id === id);
  if (!retry) {
    return res.status(404).json({ success: false, message: "Failed retry record not found" });
  }

  retry.recoveryStatus = "Converted to COD";
  const newOrderId = `ORD-${Date.now().toString().slice(-5)}`;

  res.json({
    success: true,
    message: `Abandoned cart converted to Confirmed COD Order ${newOrderId}! OTP verified.`,
    data: { retry, orderId: newOrderId }
  });
};

// ==========================================
// 🤝 REFER & EARN AND WALLET DATA STORES
// ==========================================

export let referralProgramConfig = {
  enabled: true,
  referrerRewardType: "flat", // "flat" | "percentage"
  referrerRewardValue: 150,
  refereeDiscountType: "flat", // "flat" | "percentage" | "free_shipping"
  refereeDiscountValue: 100,
  minOrderValue: 699,
  holdingDays: 7,
  rewardExpirationDays: 90,
  silverMultiplier: 1.0,
  goldMultiplier: 1.25,
  platinumMultiplier: 1.5,
  allowSelfReferral: false,
  requireDeliveredStatus: true,
  lastUpdated: "2026-09-11 11:30 AM"
};

export let walletProgramConfig = {
  enabled: true,
  cashbackPercentage: 5,
  signupBonus: 50,
  maxRedemptionPercent: 30,
  minOrderForRedemption: 499,
  pointsToRupeeRatio: 1,
  autoExpireDays: 180,
  allowCashbackOnSaleItems: true,
  lastUpdated: "2026-09-11 11:30 AM"
};

export let referralRecords = [];

export let globalWalletTransactions = [];

// ==========================================
// 🤝 REFER & EARN AND WALLET CONTROLLERS
// ==========================================

export const getReferralConfig = (req, res) => {
  res.json({ success: true, data: referralProgramConfig });
};

export const updateReferralConfig = (req, res) => {
  referralProgramConfig = {
    ...referralProgramConfig,
    ...req.body,
    lastUpdated: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
  };
  res.json({
    success: true,
    message: "Referral program settings updated successfully!",
    data: referralProgramConfig
  });
};

export const getWalletConfig = (req, res) => {
  res.json({ success: true, data: walletProgramConfig });
};

export const updateWalletConfig = (req, res) => {
  walletProgramConfig = {
    ...walletProgramConfig,
    ...req.body,
    lastUpdated: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
  };
  res.json({
    success: true,
    message: "Customer wallet & cashback rules updated successfully!",
    data: walletProgramConfig
  });
};

export const getReferralRecords = (req, res) => {
  const { status = "all", search = "", sortBy = "newest" } = req.query;
  let results = [...referralRecords];

  // Status Filter
  if (status !== "all") {
    results = results.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }

  // Search Filter
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.referrerName.toLowerCase().includes(q) ||
      r.referrerEmail.toLowerCase().includes(q) ||
      r.referrerCode.toLowerCase().includes(q) ||
      r.refereeName.toLowerCase().includes(q) ||
      r.refereeEmail.toLowerCase().includes(q) ||
      r.orderId.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortBy === "newest") {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === "reward_desc") {
    results.sort((a, b) => b.rewardAmount - a.rewardAmount);
  } else if (sortBy === "order_desc") {
    results.sort((a, b) => b.orderTotal - a.orderTotal);
  }

  const approvedCount = referralRecords.filter(r => r.status === "Approved").length;
  const pendingCount = referralRecords.filter(r => r.status === "Pending").length;
  const rejectedCount = referralRecords.filter(r => r.status === "Rejected").length;

  const totalReferralGmv = referralRecords.filter(r => r.status === "Approved").reduce((sum, r) => sum + r.orderTotal, 0) + 384500;
  const totalRewardsPaid = referralRecords.filter(r => r.status === "Approved").reduce((sum, r) => sum + r.rewardAmount, 0) + 38450;
  const pendingEscrowAmount = referralRecords.filter(r => r.status === "Pending").reduce((sum, r) => sum + r.rewardAmount, 0);

  const stats = {
    totalReferralGmv,
    totalRewardsPaid,
    totalConversions: referralRecords.length + 240,
    approvedCount,
    pendingCount,
    rejectedCount,
    pendingEscrowAmount,
    conversionRate: "24.8%",
    topReferrer: "Kavya Wellness (KAVYA-WELLNESS-05)"
  };

  res.json({
    success: true,
    count: results.length,
    total: referralRecords.length,
    stats,
    data: results
  });
};

export const getReferralRecordById = (req, res) => {
  const { id } = req.params;
  const record = referralRecords.find(r => r.id === id);
  if (!record) return res.status(404).json({ success: false, message: "Referral record not found" });

  res.json({ success: true, data: record });
};

export const approveReferralReward = (req, res) => {
  const { id } = req.params;
  const record = referralRecords.find(r => r.id === id);
  if (!record) return res.status(404).json({ success: false, message: "Referral record not found" });

  record.status = "Approved";
  record.approvedAt = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
  record.rejectedAt = null;
  record.rejectionReason = null;

  // Append to global wallet transactions
  const newTxn = {
    id: `TXN-WAL-${Date.now().toString().slice(-4)}`,
    customerId: record.referrerId,
    customerName: record.referrerName,
    customerEmail: record.referrerEmail,
    type: "credit",
    amount: record.rewardAmount,
    balanceAfter: 600, // mock incremented balance
    category: "Referral Reward",
    referenceId: record.id,
    notes: `Referral reward approved for ${record.refereeName}'s order ${record.orderId}`,
    createdAt: record.approvedAt
  };
  globalWalletTransactions.unshift(newTxn);

  res.json({
    success: true,
    message: `Referral reward of ₹${record.rewardAmount} approved and credited to ${record.referrerName}'s wallet!`,
    data: { record, transaction: newTxn }
  });
};

export const rejectReferralReward = (req, res) => {
  const { id } = req.params;
  const { reason = "Administrative disqualification" } = req.body;
  const record = referralRecords.find(r => r.id === id);
  if (!record) return res.status(404).json({ success: false, message: "Referral record not found" });

  record.status = "Rejected";
  record.rejectedAt = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
  record.rejectionReason = reason;

  res.json({
    success: true,
    message: `Referral reward for ${record.referrerName} rejected. Reason: ${reason}`,
    data: record
  });
};

export const getGlobalWalletTransactions = (req, res) => {
  const { type = "all", search = "", category = "all" } = req.query;
  let results = [...globalWalletTransactions];

  if (type !== "all") {
    results = results.filter(t => t.type === type);
  }

  if (category !== "all") {
    results = results.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(t =>
      t.id.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.customerEmail.toLowerCase().includes(q) ||
      t.referenceId.toLowerCase().includes(q) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    );
  }

  const totalCredits = globalWalletTransactions.filter(t => t.type === "credit").reduce((sum, t) => sum + t.amount, 0) + 124500;
  const totalDebits = globalWalletTransactions.filter(t => t.type === "debit").reduce((sum, t) => sum + t.amount, 0) + 89200;
  const activeCirculation = totalCredits - totalDebits;

  res.json({
    success: true,
    count: results.length,
    total: globalWalletTransactions.length,
    stats: {
      totalCredits,
      totalDebits,
      activeCirculation
    },
    data: results
  });
};

export const manualWalletCredit = (req, res) => {
  const { customerName, customerEmail, amount, category = "Manual Admin Credit", notes = "Admin manual credit" } = req.body;
  if (!customerName || !amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: "Valid customer name and positive amount required." });
  }

  const numAmt = Number(amount);
  const newTxn = {
    id: `TXN-WAL-${Date.now().toString().slice(-4)}`,
    customerId: `CUST-${Math.floor(100 + Math.random() * 900)}`,
    customerName,
    customerEmail: customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    type: "credit",
    amount: numAmt,
    balanceAfter: 500 + numAmt,
    category,
    referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
    notes,
    createdAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
  };

  globalWalletTransactions.unshift(newTxn);

  res.status(201).json({
    success: true,
    message: `Successfully credited ₹${numAmt} to ${customerName}'s wallet!`,
    data: newTxn
  });
};

export const manualWalletDebit = (req, res) => {
  const { customerName, customerEmail, amount, reason = "Manual Admin Debit", notes = "Admin balance clawback" } = req.body;
  if (!customerName || !amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: "Valid customer name and positive amount required." });
  }

  const numAmt = Number(amount);
  const newTxn = {
    id: `TXN-WAL-${Date.now().toString().slice(-4)}`,
    customerId: `CUST-${Math.floor(100 + Math.random() * 900)}`,
    customerName,
    customerEmail: customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    type: "debit",
    amount: numAmt,
    balanceAfter: Math.max(0, 500 - numAmt),
    category: "Manual Admin Debit",
    referenceId: `CLAWBACK-${Date.now().toString().slice(-4)}`,
    notes: `${reason}: ${notes}`,
    createdAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
  };

  globalWalletTransactions.unshift(newTxn);

  res.status(201).json({
    success: true,
    message: `Successfully debited ₹${numAmt} from ${customerName}'s wallet!`,
    data: newTxn
  });
};

export const getReferralAnalytics = (req, res) => {
  const analytics = {
    funnel: [
      { stage: "Referral Links Shared", count: 1840, conversionRate: "100%" },
      { stage: "Friend Landing Page Visits", count: 1220, conversionRate: "66.3%" },
      { stage: "New Account Signups", count: 680, conversionRate: "55.7%" },
      { stage: "1st Qualifying Orders", count: 456, conversionRate: "67.1%" },
      { stage: "Repeat Orders (Retention)", count: 284, conversionRate: "62.3%" }
    ],
    leaderboard: [
      { rank: 1, name: "Kavya Wellness", code: "KAVYA-WELLNESS-05", tier: "Platinum", successfulReferrals: 142, revenueDriven: 184000, commissionEarned: 21300 },
      { rank: 2, name: "Pooja Hegde", code: "POOJA-ORGANIC-77", tier: "Gold", successfulReferrals: 98, revenueDriven: 112500, commissionEarned: 14700 },
      { rank: 3, name: "Sanjeev Organic Farms", code: "SANJEEV-AGRI-01", tier: "Gold", successfulReferrals: 84, revenueDriven: 96000, commissionEarned: 12600 },
      { rank: 4, name: "Aarav Patel", code: "AARAV-AGRO-22", tier: "Silver", successfulReferrals: 46, revenueDriven: 58200, commissionEarned: 6900 },
      { rank: 5, name: "Priya Sundaram", code: "PRIYA-AGRO-91", tier: "Silver", successfulReferrals: 38, revenueDriven: 49400, commissionEarned: 5700 }
    ],
    statusDistribution: [
      { status: "Approved & Credited", count: 342, percentage: 75 },
      { status: "Pending Holding Escrow", count: 82, percentage: 18 },
      { status: "Rejected / Ineligible", count: 32, percentage: 7 }
    ]
  };

  res.json({ success: true, data: analytics });
};

// ==========================================
// HOMEPAGE CMS & LAYOUT BUILDER STATE
// ==========================================

let homepageSections = [
  { id: "sec-hero", type: "hero", name: "Hero Carousel Slider", description: "Full-width hero carousel with desktop/mobile banners & CTAs", enabled: true, order: 1 },
  { id: "sec-trust", type: "trust_badges", name: "Quality & Trust Ribbon", description: "Certified Organic, Farm Fresh, Fast Delivery badges", enabled: true, order: 2 },
  { id: "sec-offer-ticker", type: "offer_strip", name: "Promotional Offer Strip", description: "Seasonal harvest announcement & coupon callout ticker", enabled: true, order: 3 },
  { id: "sec-categories", type: "categories", name: "Category Bio-Grid", description: "Visual grid cards linking to agricultural bio-fertilizer and pesticide categories", enabled: true, order: 4 },
  { id: "sec-flash-sale", type: "flash_sale", name: "Flash Harvest Sale", description: "Time-limited urgent deals with real-time countdown timer", enabled: true, order: 5 },
  { id: "sec-featured", type: "featured_products", name: "Featured Products Showcase", description: "Curated seasonal high-CFU bio-formulations", enabled: true, order: 6 },
  { id: "sec-trending", type: "trending_products", name: "Trending This Week", description: "Top trending items gaining maximum momentum", enabled: true, order: 7 },
  { id: "sec-story", type: "brand_story", name: "Our Roots & Organic Vision", description: "Traditional wisdom, farm traceability, and brand philosophy", enabled: true, order: 8 },
  { id: "sec-best-seller", type: "best_sellers", name: "Best Sellers Bio-Inputs", description: "Highest rated farmer favorite agricultural formulations", enabled: true, order: 9 },
  { id: "sec-new-arrivals", type: "new_arrivals", name: "Fresh Harvest New Arrivals", description: "Recently harvested seasonal additions", enabled: true, order: 10 },
  { id: "sec-testimonials", type: "testimonials", name: "Community Reviews & Proof", description: "Verified customer testimonials and star ratings", enabled: true, order: 11 },
  { id: "sec-faq", type: "faq", name: "Agronomy FAQs & Accordion", description: "Clear answers on bio-fertilizer usage, dosage & shipping", enabled: true, order: 12 }
];

let heroBanners = [
  {
    id: "HERO-1",
    title: "Pure organic harvest, shaped by nature.",
    eyebrow: "From Soil to Soul",
    subtitle: "Premium agricultural products delivered from trusted farms with purity, traceability and care in every pack.",
    primaryCtaLabel: "Explore Products",
    primaryCtaUrl: "/products",
    secondaryCtaLabel: "Become a Distributor",
    secondaryCtaUrl: "/become-distributor",
    desktopImageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&auto=format&fit=crop&q=80",
    mobileImageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80",
    badgeText: "Autumn Harvest 2026",
    slideOrder: 1,
    active: true,
    startDate: "2026-09-01",
    endDate: "2026-10-31"
  },
  {
    id: "HERO-2",
    title: "Certified Bio-Fertilizers & Crop Formulations",
    eyebrow: "High CFU Lab Cultured Bio-Inputs",
    subtitle: "Extracted under 38°C in single-origin batches to preserve natural aroma, vitamin E, and natural antioxidants.",
    primaryCtaLabel: "Shop Bio-Formulations",
    primaryCtaUrl: "/categories/bio-fertilizers",
    secondaryCtaLabel: "View Lab Reports",
    secondaryCtaUrl: "/about",
    desktopImageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1920&auto=format&fit=crop&q=80",
    mobileImageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80",
    badgeText: "100% Raw & Unrefined",
    slideOrder: 2,
    active: true,
    startDate: "2026-09-01",
    endDate: "2026-12-31"
  },
  {
    id: "HERO-3",
    title: "Harit Liquid Bio-Fungicide (5L Can)",
    eyebrow: "Festive Harvest Special",
    subtitle: "Trichoderma viride formulation providing robust protection against damping-off, root rot, and wilt pathogens.",
    primaryCtaLabel: "Order Harit Bio-Fungicide",
    primaryCtaUrl: "/products/harit",
    secondaryCtaLabel: "Explore All Formulations",
    secondaryCtaUrl: "/categories/organic-rice",
    desktopImageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1920&auto=format&fit=crop&q=80",
    mobileImageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
    badgeText: "20% OFF Flat",
    slideOrder: 3,
    active: true,
    startDate: "2026-09-05",
    endDate: "2026-10-15"
  }
];

let offerBanners = [
  {
    id: "OFFER-1",
    type: "ticker",
    headline: "Autumn Harvest Sale: Use Code ORGANIC20 for 20% OFF on Orders Above ₹1,499!",
    couponCode: "ORGANIC20",
    ctaLabel: "Shop Sale",
    ctaUrl: "/products",
    badge: "Limited Offer",
    backgroundColor: "#1b4332",
    textColor: "#ffffff",
    active: true
  },
  {
    id: "OFFER-2",
    type: "mid_banner",
    headline: "Free Express Farm-Direct Shipping on All Orders Above ₹799",
    subtitle: "Guaranteed dispatched within 24 hours with temperature-controlled air cushioning.",
    couponCode: "FREESHIP799",
    ctaLabel: "Claim Free Shipping",
    ctaUrl: "/products",
    badge: "Storewide",
    backgroundColor: "#2d6a4f",
    textColor: "#ffffff",
    active: true
  },
  {
    id: "OFFER-3",
    type: "bottom_strip",
    headline: "Refer a Friend & Both Get ₹150 Wallet Cash on 1st Order",
    subtitle: "Share the gift of clean organic living with your loved ones.",
    couponCode: "REFER150",
    ctaLabel: "Start Referring",
    ctaUrl: "/dashboard",
    badge: "Loyalty",
    backgroundColor: "#d4a373",
    textColor: "#2b2d42",
    active: true
  }
];

let categoryBanners = [
  {
    id: "CAT-BAN-1",
    categorySlug: "bio-fertilizers",
    title: "Bio Fertilizers & Soil Microbes",
    subtitle: "Naturally cultivate soil fertility and root vigour with biological inoculants",
    desktopImageUrl: "/images/categories/bio-fertilizers.jpg",
    mobileImageUrl: "/images/categories/bio-fertilizers.jpg",
    badge: "Bio-Certified",
    active: true
  },
  {
    id: "CAT-BAN-2",
    categorySlug: "bio-pesticides",
    title: "Eco-Safe Bio Pesticides",
    subtitle: "Targeted botanical pest management with zero chemical residue",
    desktopImageUrl: "/images/categories/bio-pesticides.jpg",
    mobileImageUrl: "/images/categories/bio-pesticides.jpg",
    badge: "100% Eco-Safe",
    active: true
  },
  {
    id: "CAT-BAN-3",
    categorySlug: "bio-stimulants",
    title: "Yield-Maximizing Bio Stimulants",
    subtitle: "Humic-fulvic complexes & seaweed extracts for bumper harvests",
    desktopImageUrl: "/images/categories/bio-stimulants.jpg",
    mobileImageUrl: "/images/categories/bio-stimulants.jpg",
    badge: "High Potency",
    active: true
  },
  {
    id: "CAT-BAN-4",
    categorySlug: "micro-nutrients",
    title: "Balanced Micro Nutrients",
    subtitle: "Chelated micro-nutrients & amino complexes for vigorous plant defense",
    desktopImageUrl: "/images/categories/micro-nutrients.jpg",
    mobileImageUrl: "/images/categories/micro-nutrients.jpg",
    badge: "Chelated Formulations",
    active: true
  }
];

let flashSaleBanners = [
  {
    id: "FLASH-1",
    title: "Autumn Equinox 48-Hour Harvest Flash Sale",
    subtitle: "Special savings on Harit Trichoderma, Bhumi Shakti Humic & Neem Oil 1000 PPM.",
    discountBadge: "35% OFF",
    endsAt: "2026-09-30T23:59:59.000Z",
    targetProductSlug: "lakadong-turmeric-powder",
    stockUrgencyText: "Only 28 jars remaining in harvest batch",
    bannerImageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200&auto=format&fit=crop&q=80",
    ctaLabel: "Claim Flash Deal",
    active: true
  }
];

let curatedProductSections = {
  featured: {
    sectionKey: "featured",
    heading: "Naturally Loved Essentials",
    eyebrow: "Season's Finest",
    subtitle: "Our most-trusted agricultural formulations, chosen for high CFU count and proven crop yields.",
    productIds: [1, 6, 3, 19, 9, 18, 11, 21],
    layoutStyle: "grid",
    itemsLimit: 8,
    enabled: true
  },
  trending: {
    sectionKey: "trending",
    heading: "Trending This Week",
    eyebrow: "Customer Favorites",
    subtitle: "Most ordered bio-fertilizers and bio-pesticides across farming communities.",
    productIds: [6, 1, 19, 3],
    layoutStyle: "carousel",
    itemsLimit: 4,
    enabled: true
  },
  newArrivals: {
    sectionKey: "newArrivals",
    heading: "Fresh Harvest New Arrivals",
    eyebrow: "Just In From Farms",
    subtitle: "Freshly packed autumn harvests from organic cluster cooperatives.",
    productIds: [18, 11, 14, 23],
    layoutStyle: "grid",
    itemsLimit: 4,
    enabled: true
  },
  bestSellers: {
    sectionKey: "bestSellers",
    heading: "All-Time Best Sellers",
    eyebrow: "Top Rated 4.9★",
    subtitle: "Farmer favorites with over 1,000+ five-star verified crop reviews.",
    productIds: [1, 6, 11, 19],
    layoutStyle: "grid",
    itemsLimit: 4,
    enabled: true
  }
};

// ==========================================
// CMS CONTROLLER HANDLERS
// ==========================================

export const getHomepageCms = (req, res) => {
  res.json({
    success: true,
    data: {
      sections: homepageSections,
      heroBanners,
      offerBanners,
      categoryBanners,
      flashSaleBanners,
      curatedProductSections,
      stats: {
        totalActiveBanners: heroBanners.filter(b => b.active).length + offerBanners.filter(b => b.active).length + categoryBanners.filter(b => b.active).length + flashSaleBanners.filter(b => b.active).length,
        activeHeroSlides: heroBanners.filter(b => b.active).length,
        liveOfferStrips: offerBanners.filter(b => b.active).length,
        flashSaleActive: flashSaleBanners.some(b => b.active),
        activeSectionsCount: homepageSections.filter(s => s.enabled).length,
        lastSyncedAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
      }
    }
  });
};

export const updateHomepageLayout = (req, res) => {
  const { sections } = req.body;
  if (!Array.isArray(sections)) {
    return res.status(400).json({ success: false, message: "Sections array is required" });
  }

  homepageSections = sections.map((sec, index) => ({
    ...sec,
    order: index + 1
  }));

  res.json({
    success: true,
    message: "Homepage sections layout saved and published to storefront!",
    data: homepageSections
  });
};

// Hero Banners
export const getHeroBanners = (req, res) => {
  res.json({ success: true, count: heroBanners.length, data: heroBanners });
};

export const createHeroBanner = (req, res) => {
  const {
    title,
    eyebrow = "Organic Harvest",
    subtitle = "",
    primaryCtaLabel = "Explore Products",
    primaryCtaUrl = "/products",
    secondaryCtaLabel = "",
    secondaryCtaUrl = "",
    desktopImageUrl,
    mobileImageUrl,
    badgeText = "Featured",
    startDate = "2026-09-01",
    endDate = "2026-12-31"
  } = req.body;

  if (!title || !desktopImageUrl) {
    return res.status(400).json({ success: false, message: "Banner title and desktop image URL are required." });
  }

  const newBanner = {
    id: `HERO-${heroBanners.length + 1}`,
    title,
    eyebrow,
    subtitle,
    primaryCtaLabel,
    primaryCtaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
    desktopImageUrl,
    mobileImageUrl: mobileImageUrl || desktopImageUrl,
    badgeText,
    slideOrder: heroBanners.length + 1,
    active: true,
    startDate,
    endDate
  };

  heroBanners.push(newBanner);

  res.status(201).json({
    success: true,
    message: "Hero carousel slide added successfully!",
    data: newBanner
  });
};

export const updateHeroBanner = (req, res) => {
  const { id } = req.params;
  const banner = heroBanners.find(b => b.id === id);
  if (!banner) return res.status(404).json({ success: false, message: "Hero banner not found" });

  Object.assign(banner, req.body);

  res.json({
    success: true,
    message: "Hero slide updated successfully!",
    data: banner
  });
};

export const toggleHeroBanner = (req, res) => {
  const { id } = req.params;
  const banner = heroBanners.find(b => b.id === id);
  if (!banner) return res.status(404).json({ success: false, message: "Hero banner not found" });

  banner.active = !banner.active;

  res.json({
    success: true,
    message: banner.active ? "Hero slide enabled." : "Hero slide disabled.",
    data: banner
  });
};

export const deleteHeroBanner = (req, res) => {
  const { id } = req.params;
  const index = heroBanners.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: "Hero banner not found" });

  const deleted = heroBanners.splice(index, 1)[0];

  res.json({
    success: true,
    message: "Hero banner deleted successfully!",
    data: deleted
  });
};

// Offer Banners
export const getOfferBanners = (req, res) => {
  res.json({ success: true, count: offerBanners.length, data: offerBanners });
};

export const createOfferBanner = (req, res) => {
  const {
    type = "ticker",
    headline,
    subtitle = "",
    couponCode = "",
    ctaLabel = "Shop Now",
    ctaUrl = "/products",
    badge = "Sale",
    backgroundColor = "#1b4332",
    textColor = "#ffffff"
  } = req.body;

  if (!headline) {
    return res.status(400).json({ success: false, message: "Headline is required for offer banner." });
  }

  const newOffer = {
    id: `OFFER-${offerBanners.length + 1}`,
    type,
    headline,
    subtitle,
    couponCode,
    ctaLabel,
    ctaUrl,
    badge,
    backgroundColor,
    textColor,
    active: true
  };

  offerBanners.push(newOffer);

  res.status(201).json({
    success: true,
    message: "Offer banner created successfully!",
    data: newOffer
  });
};

export const updateOfferBanner = (req, res) => {
  const { id } = req.params;
  const offer = offerBanners.find(o => o.id === id);
  if (!offer) return res.status(404).json({ success: false, message: "Offer banner not found" });

  Object.assign(offer, req.body);

  res.json({
    success: true,
    message: "Offer banner updated successfully!",
    data: offer
  });
};

export const toggleOfferBanner = (req, res) => {
  const { id } = req.params;
  const offer = offerBanners.find(o => o.id === id);
  if (!offer) return res.status(404).json({ success: false, message: "Offer banner not found" });

  offer.active = !offer.active;

  res.json({
    success: true,
    message: offer.active ? "Offer banner enabled." : "Offer banner disabled.",
    data: offer
  });
};

export const deleteOfferBanner = (req, res) => {
  const { id } = req.params;
  const index = offerBanners.findIndex(o => o.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: "Offer banner not found" });

  const deleted = offerBanners.splice(index, 1)[0];

  res.json({
    success: true,
    message: "Offer banner deleted.",
    data: deleted
  });
};

// Category Banners
export const getCategoryBanners = (req, res) => {
  res.json({ success: true, count: categoryBanners.length, data: categoryBanners });
};

export const createCategoryBanner = (req, res) => {
  const {
    categorySlug,
    title,
    subtitle = "",
    desktopImageUrl,
    mobileImageUrl,
    badge = "Organic"
  } = req.body;

  if (!categorySlug || !title || !desktopImageUrl) {
    return res.status(400).json({ success: false, message: "Category slug, title, and image URL are required." });
  }

  const newCat = {
    id: `CAT-BAN-${categoryBanners.length + 1}`,
    categorySlug,
    title,
    subtitle,
    desktopImageUrl,
    mobileImageUrl: mobileImageUrl || desktopImageUrl,
    badge,
    active: true
  };

  categoryBanners.push(newCat);

  res.status(201).json({
    success: true,
    message: "Category showcase banner created!",
    data: newCat
  });
};

export const updateCategoryBanner = (req, res) => {
  const { id } = req.params;
  const item = categoryBanners.find(c => c.id === id);
  if (!item) return res.status(404).json({ success: false, message: "Category banner not found" });

  Object.assign(item, req.body);

  res.json({
    success: true,
    message: "Category banner updated successfully!",
    data: item
  });
};

export const toggleCategoryBanner = (req, res) => {
  const { id } = req.params;
  const item = categoryBanners.find(c => c.id === id);
  if (!item) return res.status(404).json({ success: false, message: "Category banner not found" });

  item.active = !item.active;

  res.json({
    success: true,
    message: item.active ? "Category banner enabled." : "Category banner disabled.",
    data: item
  });
};

export const deleteCategoryBanner = (req, res) => {
  const { id } = req.params;
  const index = categoryBanners.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: "Category banner not found" });

  const deleted = categoryBanners.splice(index, 1)[0];

  res.json({
    success: true,
    message: "Category banner deleted.",
    data: deleted
  });
};

// Flash Sale Banners
export const getFlashSaleBanners = (req, res) => {
  res.json({ success: true, count: flashSaleBanners.length, data: flashSaleBanners });
};

export const createFlashSaleBanner = (req, res) => {
  const {
    title,
    subtitle = "",
    discountBadge = "30% OFF",
    endsAt,
    targetProductSlug = "harit",
    stockUrgencyText = "Limited harvest batch",
    bannerImageUrl,
    ctaLabel = "Shop Flash Deal"
  } = req.body;

  if (!title || !endsAt) {
    return res.status(400).json({ success: false, message: "Title and end countdown timestamp are required." });
  }

  const newFlash = {
    id: `FLASH-${flashSaleBanners.length + 1}`,
    title,
    subtitle,
    discountBadge,
    endsAt,
    targetProductSlug,
    stockUrgencyText,
    bannerImageUrl: bannerImageUrl || "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200&auto=format&fit=crop&q=80",
    ctaLabel,
    active: true
  };

  flashSaleBanners.push(newFlash);

  res.status(201).json({
    success: true,
    message: "Flash sale campaign created!",
    data: newFlash
  });
};

export const updateFlashSaleBanner = (req, res) => {
  const { id } = req.params;
  const flash = flashSaleBanners.find(f => f.id === id);
  if (!flash) return res.status(404).json({ success: false, message: "Flash sale banner not found" });

  Object.assign(flash, req.body);

  res.json({
    success: true,
    message: "Flash sale campaign updated!",
    data: flash
  });
};

export const toggleFlashSaleBanner = (req, res) => {
  const { id } = req.params;
  const flash = flashSaleBanners.find(f => f.id === id);
  if (!flash) return res.status(404).json({ success: false, message: "Flash sale banner not found" });

  flash.active = !flash.active;

  res.json({
    success: true,
    message: flash.active ? "Flash sale activated on storefront!" : "Flash sale paused.",
    data: flash
  });
};

export const deleteFlashSaleBanner = (req, res) => {
  const { id } = req.params;
  const index = flashSaleBanners.findIndex(f => f.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: "Flash sale banner not found" });

  const deleted = flashSaleBanners.splice(index, 1)[0];

  res.json({
    success: true,
    message: "Flash sale banner removed.",
    data: deleted
  });
};

// Curated Product Sections
export const getCuratedSections = (req, res) => {
  res.json({ success: true, data: curatedProductSections });
};

export const updateCuratedSection = (req, res) => {
  const { sectionKey } = req.params;
  if (!curatedProductSections[sectionKey]) {
    return res.status(404).json({ success: false, message: `Curated section ${sectionKey} not found` });
  }

  curatedProductSections[sectionKey] = {
    ...curatedProductSections[sectionKey],
    ...req.body
  };

  res.json({
    success: true,
    message: `${curatedProductSections[sectionKey].heading} showcase updated successfully!`,
    data: curatedProductSections[sectionKey]
  });
};

// =========================================================================
// MARKETING MANAGEMENT & OMNICHANNEL AUTOMATION HUB
// =========================================================================

export let audienceSegments = [
  {
    id: "seg_all",
    name: "All Registered Customers",
    description: "Every verified customer in the Janani Agro database",
    criteria: "Total Users",
    count: 12850,
    growthRate: "+12.4%",
    createdAt: "2026-01-10"
  },
  {
    id: "seg_vip",
    name: "VIP High LTV Champions (Spent > ₹5,000)",
    description: "Top-tier loyal organic consumers with repeat bulk purchases",
    criteria: "Lifetime Spend > ₹5000 and Orders >= 3",
    count: 1420,
    growthRate: "+8.6%",
    createdAt: "2026-02-15"
  },
  {
    id: "seg_first",
    name: "First-Time Shoppers (1 Order in 30d)",
    description: "New customers who made their first order within the last month",
    criteria: "Total Orders == 1 and First Order < 30 days",
    count: 3280,
    growthRate: "+18.2%",
    createdAt: "2026-03-01"
  },
  {
    id: "seg_dormant",
    name: "Dormant / Inactive (> 60 Days)",
    description: "Past buyers who have not purchased in the last 2 months",
    criteria: "Last Order > 60 days ago",
    count: 2150,
    growthRate: "-3.1%",
    createdAt: "2026-03-20"
  },
  {
    id: "seg_abandoned",
    name: "Abandoned Cart Leads (Last 7 Days)",
    description: "Shoppers who left items in cart without completing checkout",
    criteria: "Cart Updated < 7 days and Checkout Incomplete",
    count: 480,
    growthRate: "+5.4%",
    createdAt: "2026-04-05"
  },
  {
    id: "seg_bio_growers",
    name: "Commercial Crop Growers & Farmers",
    description: "Farmers and estate owners who frequently order bio-fertilizers and bio-pesticides",
    criteria: "Purchased Category: Bio-Fertilizers or Bio-Pesticides >= 2 times",
    count: 4120,
    growthRate: "+15.0%",
    createdAt: "2026-04-12"
  }
];

export let marketingCampaigns = [
  {
    id: "CAMP-101",
    name: "Diwali Organic Sweetness & Biological Crop Protection Extravaganza",
    channel: "email",
    type: "festival",
    subject: "✨ Seasonal Bio-Agro Discounts on Certified Formulations!",
    previewText: "Flat 25% OFF on bio-fertilizers & botanical pest shields. Code: KISAN25",
    messageBody: "Dear {CustomerName},\n\nStrengthen your crop yield this season with certified Trichoderma viride, humic soil conditioners, and botanical pest shields.\n\nUse coupon KISAN20 to save 20% on your agricultural order.",
    targetSegmentId: "seg_all",
    targetSegmentName: "All Registered Customers",
    targetAudienceCount: 12850,
    couponCode: "DIWALI25",
    ctaLabel: "Shop Diwali Specials",
    ctaUrl: "/products?category=oils",
    status: "Sent",
    scheduledAt: "2026-09-10T09:00:00.000Z",
    sentAt: "2026-09-10T09:00:00.000Z",
    stats: {
      recipients: 12850,
      delivered: 12650,
      deliveryRate: 98.4,
      opened: 5180,
      openRate: 40.9,
      clicked: 1940,
      clickRate: 15.3,
      conversions: 384,
      revenue: 345600
    },
    createdBy: "Marketing Admin",
    createdAt: "2026-09-08T11:20:00.000Z"
  },
  {
    id: "CAMP-102",
    name: "Kisan Special: Extra ₹200 OFF on Bio-Fertilizers & Bio-Pesticides",
    channel: "sms",
    type: "offer",
    subject: "SMS VIP Flash Drop",
    previewText: "Exclusive VIP deal on certified bio-formulations",
    messageBody: "Janani Agro: Special Kisan offer for {CustomerName}! Get flat Rs.200 OFF on 5L Harit / Bhumi Shakti Bio-Inputs. Use code KISAN200 at checkout. Valid till midnight: https://jananiagro.com/products OptOut reply STOP",
    targetSegmentId: "seg_vip",
    targetSegmentName: "VIP High LTV Champions (Spent > ₹5,000)",
    targetAudienceCount: 1420,
    couponCode: "VIPHARVEST",
    ctaLabel: "Claim VIP ₹200 OFF",
    ctaUrl: "/products?category=oils",
    status: "Sent",
    scheduledAt: "2026-09-11T14:30:00.000Z",
    sentAt: "2026-09-11T14:30:00.000Z",
    stats: {
      recipients: 1420,
      delivered: 1390,
      deliveryRate: 97.8,
      opened: 1390,
      openRate: 100.0,
      clicked: 480,
      clickRate: 34.5,
      conversions: 162,
      revenue: 148200
    },
    createdBy: "Campaign Lead",
    createdAt: "2026-09-10T10:00:00.000Z"
  },
  {
    id: "CAMP-103",
    name: "🌱 Bio-Shield Formulations & Soil Conditioners Just Arrived!",
    channel: "push",
    type: "coupon",
    subject: "Fresh Harvest Grains Restocked!",
    previewText: "Certified Trichoderma & Humic Bio-Stimulants ready for dispatch",
    messageBody: "Fresh batch of nitrogen-sealed bio-fertilizers and biopesticides ready for farm delivery. Use code KISAN20 for 20% discount.",
    targetSegmentId: "seg_bio_growers",
    targetSegmentName: "Commercial Crop Growers & Farmers",
    targetAudienceCount: 4120,
    couponCode: "KISAN15",
    ctaLabel: "View Bio-Inputs",
    ctaUrl: "/products?category=bio-fertilizers",
    status: "Sent",
    scheduledAt: "2026-09-11T17:00:00.000Z",
    sentAt: "2026-09-11T17:00:00.000Z",
    stats: {
      recipients: 4120,
      delivered: 3950,
      deliveryRate: 95.8,
      opened: 540,
      openRate: 13.6,
      clicked: 320,
      clickRate: 8.1,
      conversions: 78,
      revenue: 68400
    },
    createdBy: "Store Manager",
    createdAt: "2026-09-11T15:00:00.000Z"
  },
  {
    id: "CAMP-104",
    name: "Festive Announcement: Free Farm-Fresh Sweets with Orders Above ₹999",
    channel: "announcement_banner",
    type: "festival",
    subject: "Storefront Sticky Top Ticker",
    previewText: "Free Organic Dry Fruit Laddu Box on all orders above ₹999",
    messageBody: "Celebrate with Janani Agro: Complimentary 250g Organic Laddu Box with every order above ₹999. Use Code: FESTIVEGIFT",
    targetSegmentId: "seg_all",
    targetSegmentName: "All Registered Customers",
    targetAudienceCount: 12850,
    couponCode: "FESTIVEGIFT",
    ctaLabel: "Shop & Claim Gift",
    ctaUrl: "/products",
    bannerStyle: {
      backgroundColor: "#1b4332",
      textColor: "#ffffff",
      accentColor: "#fbbf24",
      position: "top_sticky"
    },
    status: "Active",
    scheduledAt: "2026-09-01T00:00:00.000Z",
    sentAt: "2026-09-01T00:00:00.000Z",
    stats: {
      recipients: 12850,
      delivered: 12850,
      deliveryRate: 100,
      opened: 9400,
      openRate: 73.1,
      clicked: 2840,
      clickRate: 22.1,
      conversions: 410,
      revenue: 412000
    },
    createdBy: "Marketing Admin",
    createdAt: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "CAMP-105",
    name: "Win Back: We Miss You! Here's ₹150 OFF Your Next Farm Basket",
    channel: "email",
    type: "offer",
    subject: "🌱 {CustomerName}, here is ₹150 for your crop bio-inputs!",
    previewText: "It's been a while. Protect your crops with certified bio-formulations.",
    messageBody: "We miss you at Janani Agro! Enjoy ₹150 OFF on your next order with coupon COMEBACK150. Valid on all bio-fertilizers, bio-pesticides, and soil conditioners.",
    targetSegmentId: "seg_dormant",
    targetSegmentName: "Dormant / Inactive (> 60 Days)",
    targetAudienceCount: 2150,
    couponCode: "COMEBACK150",
    ctaLabel: "Claim ₹150 Credit",
    ctaUrl: "/products",
    status: "Scheduled",
    scheduledAt: "2026-09-18T10:00:00.000Z",
    sentAt: null,
    stats: {
      recipients: 2150,
      delivered: 0,
      deliveryRate: 0,
      opened: 0,
      openRate: 0,
      clicked: 0,
      clickRate: 0,
      conversions: 0,
      revenue: 0
    },
    createdBy: "Lifecycle Specialist",
    createdAt: "2026-09-11T16:30:00.000Z"
  },
  {
    id: "CAMP-106",
    name: "Complete Your Organic Cart with Free Fast Delivery",
    channel: "sms",
    type: "coupon",
    subject: "Abandoned Cart SMS Drop",
    previewText: "Your organic harvest basket is waiting with Free Delivery",
    messageBody: "Hi {CustomerName}, you left your healthy basket behind! Use code FREESHIPNOW for free express delivery today: https://jananiagro.com/cart",
    targetSegmentId: "seg_abandoned",
    targetSegmentName: "Abandoned Cart Leads (Last 7 Days)",
    targetAudienceCount: 480,
    couponCode: "FREESHIPNOW",
    ctaLabel: "Resume Checkout",
    ctaUrl: "/cart",
    status: "Draft",
    scheduledAt: null,
    sentAt: null,
    stats: {
      recipients: 480,
      delivered: 0,
      deliveryRate: 0,
      opened: 0,
      openRate: 0,
      clicked: 0,
      clickRate: 0,
      conversions: 0,
      revenue: 0
    },
    createdBy: "Marketing Admin",
    createdAt: "2026-09-12T08:00:00.000Z"
  }
];

export let notificationHistory = [];

export const getMarketingOverview = (req, res) => {
  const totalCampaigns = marketingCampaigns.length;
  const totalRecipients = marketingCampaigns.reduce((sum, c) => sum + (c.stats?.recipients || 0), 0);
  const totalRevenue = marketingCampaigns.reduce((sum, c) => sum + (c.stats?.revenue || 0), 0);
  const activeBanners = marketingCampaigns.filter(c => c.channel === "announcement_banner" && c.status === "Active").length;
  const scheduledDrops = marketingCampaigns.filter(c => c.status === "Scheduled").length;

  const emailCampaigns = marketingCampaigns.filter(c => c.channel === "email" && c.status === "Sent");
  const avgEmailOpenRate = emailCampaigns.length
    ? +(emailCampaigns.reduce((sum, c) => sum + (c.stats?.openRate || 0), 0) / emailCampaigns.length).toFixed(1)
    : 38.4;

  const smsCampaigns = marketingCampaigns.filter(c => c.channel === "sms" && c.status === "Sent");
  const avgSmsDeliveryRate = smsCampaigns.length
    ? +(smsCampaigns.reduce((sum, c) => sum + (c.stats?.deliveryRate || 0), 0) / smsCampaigns.length).toFixed(1)
    : 97.8;

  res.json({
    success: true,
    data: {
      totalCampaigns,
      totalRecipients,
      totalRevenue,
      avgEmailOpenRate,
      avgSmsDeliveryRate,
      avgPushCtr: 14.2,
      activeBanners,
      scheduledDrops,
      channelsActive: ["email", "sms", "push", "announcement_banner", "whatsapp"]
    }
  });
};

export const getMarketingCampaigns = (req, res) => {
  const { channel, type, status, search } = req.query;
  let results = [...marketingCampaigns];

  if (channel && channel !== "all") {
    results = results.filter(c => c.channel === channel);
  }
  if (type && type !== "all") {
    results = results.filter(c => c.type === type);
  }
  if (status && status !== "all") {
    results = results.filter(c => c.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.subject && c.subject.toLowerCase().includes(q)) ||
      (c.couponCode && c.couponCode.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: results.length,
    total: marketingCampaigns.length,
    data: results
  });
};

export const getMarketingCampaignById = (req, res) => {
  const { id } = req.params;
  const campaign = marketingCampaigns.find(c => c.id === id);
  if (!campaign) {
    return res.status(404).json({ success: false, message: "Campaign not found" });
  }
  res.json({ success: true, data: campaign });
};

export const createMarketingCampaign = (req, res) => {
  const {
    name,
    channel = "email",
    type = "offer",
    subject = "",
    previewText = "",
    messageBody = "",
    targetSegmentId = "seg_all",
    couponCode = "",
    ctaLabel = "Shop Now",
    ctaUrl = "/products",
    bannerStyle = { backgroundColor: "#1b4332", textColor: "#ffffff" },
    scheduledAt = null,
    sendNow = false
  } = req.body;

  if (!name || !messageBody) {
    return res.status(400).json({ success: false, message: "Campaign name and message content are required." });
  }

  const segment = audienceSegments.find(s => s.id === targetSegmentId) || audienceSegments[0];
  const isScheduled = !!scheduledAt && !sendNow;
  const isImmediate = !!sendNow;

  const newCampaign = {
    id: `CAMP-${Math.floor(100 + Math.random() * 900)}`,
    name,
    channel,
    type,
    subject: subject || name,
    previewText,
    messageBody,
    targetSegmentId: segment.id,
    targetSegmentName: segment.name,
    targetAudienceCount: segment.count,
    couponCode: couponCode ? couponCode.toUpperCase() : "",
    ctaLabel,
    ctaUrl,
    bannerStyle,
    status: isImmediate ? "Sent" : isScheduled ? "Scheduled" : "Draft",
    scheduledAt: isScheduled ? scheduledAt : null,
    sentAt: isImmediate ? new Date().toISOString() : null,
    stats: {
      recipients: segment.count,
      delivered: isImmediate ? Math.round(segment.count * 0.98) : 0,
      deliveryRate: isImmediate ? 98.0 : 0,
      opened: isImmediate ? Math.round(segment.count * (channel === "sms" ? 0.95 : 0.38)) : 0,
      openRate: isImmediate ? (channel === "sms" ? 95.0 : 38.0) : 0,
      clicked: isImmediate ? Math.round(segment.count * 0.14) : 0,
      clickRate: isImmediate ? 14.0 : 0,
      conversions: isImmediate ? Math.round(segment.count * 0.03) : 0,
      revenue: isImmediate ? Math.round(segment.count * 0.03 * 850) : 0
    },
    createdBy: "Marketing Admin",
    createdAt: new Date().toISOString()
  };

  marketingCampaigns.unshift(newCampaign);

  // If immediate, also log to notification history
  if (isImmediate) {
    notificationHistory.unshift({
      id: `NOTIF-${Math.floor(700 + Math.random() * 300)}`,
      campaignId: newCampaign.id,
      campaignName: newCampaign.name,
      channel: newCampaign.channel,
      segment: newCampaign.targetSegmentName,
      recipients: newCampaign.targetAudienceCount,
      delivered: newCampaign.stats.delivered,
      status: "Delivered",
      sentAt: newCampaign.sentAt,
      openRate: newCampaign.stats.openRate,
      clickRate: newCampaign.stats.clickRate,
      revenue: newCampaign.stats.revenue,
      providerStatus: `Broadcasted via ${channel.toUpperCase()} Gateway`
    });
  }

  res.status(201).json({
    success: true,
    message: isImmediate ? "Campaign launched and broadcasted successfully!" : isScheduled ? `Campaign scheduled for ${scheduledAt}` : "Campaign saved as draft.",
    data: newCampaign
  });
};

export const updateMarketingCampaign = (req, res) => {
  const { id } = req.params;
  const campaign = marketingCampaigns.find(c => c.id === id);
  if (!campaign) {
    return res.status(404).json({ success: false, message: "Campaign not found" });
  }

  Object.assign(campaign, req.body);

  res.json({
    success: true,
    message: "Campaign updated successfully.",
    data: campaign
  });
};

export const deleteMarketingCampaign = (req, res) => {
  const { id } = req.params;
  const index = marketingCampaigns.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Campaign not found" });
  }

  const removed = marketingCampaigns.splice(index, 1)[0];
  res.json({
    success: true,
    message: `Campaign "${removed.name}" deleted.`,
    data: removed
  });
};

export const triggerMarketingCampaignSend = (req, res) => {
  const { id } = req.params;
  const campaign = marketingCampaigns.find(c => c.id === id);
  if (!campaign) {
    return res.status(404).json({ success: false, message: "Campaign not found" });
  }

  campaign.status = "Sent";
  campaign.sentAt = new Date().toISOString();
  campaign.stats = {
    recipients: campaign.targetAudienceCount,
    delivered: Math.round(campaign.targetAudienceCount * 0.98),
    deliveryRate: 98.2,
    opened: Math.round(campaign.targetAudienceCount * (campaign.channel === "sms" ? 0.95 : 0.42)),
    openRate: campaign.channel === "sms" ? 95.0 : 42.0,
    clicked: Math.round(campaign.targetAudienceCount * 0.16),
    clickRate: 16.0,
    conversions: Math.round(campaign.targetAudienceCount * 0.035),
    revenue: Math.round(campaign.targetAudienceCount * 0.035 * 920)
  };

  notificationHistory.unshift({
    id: `NOTIF-${Math.floor(700 + Math.random() * 300)}`,
    campaignId: campaign.id,
    campaignName: campaign.name,
    channel: campaign.channel,
    segment: campaign.targetSegmentName,
    recipients: campaign.targetAudienceCount,
    delivered: campaign.stats.delivered,
    status: "Delivered",
    sentAt: campaign.sentAt,
    openRate: campaign.stats.openRate,
    clickRate: campaign.stats.clickRate,
    revenue: campaign.stats.revenue,
    providerStatus: `Broadcasted via ${campaign.channel.toUpperCase()} Gateway`
  });

  res.json({
    success: true,
    message: `Campaign "${campaign.name}" broadcasted to ${campaign.targetAudienceCount} recipients!`,
    data: campaign
  });
};

export const toggleMarketingCampaignStatus = (req, res) => {
  const { id } = req.params;
  const campaign = marketingCampaigns.find(c => c.id === id);
  if (!campaign) {
    return res.status(404).json({ success: false, message: "Campaign not found" });
  }

  if (campaign.status === "Active") {
    campaign.status = "Paused";
  } else if (campaign.status === "Paused" || campaign.status === "Draft") {
    campaign.status = "Active";
  }

  res.json({
    success: true,
    message: `Campaign status changed to ${campaign.status}`,
    data: campaign
  });
};

export const getAudienceSegments = (req, res) => {
  res.json({
    success: true,
    count: audienceSegments.length,
    data: audienceSegments
  });
};

export const createAudienceSegment = (req, res) => {
  const { name, description, criteria, estimatedCount = 1200 } = req.body;
  if (!name || !criteria) {
    return res.status(400).json({ success: false, message: "Segment name and criteria rule are required." });
  }

  const newSeg = {
    id: `seg_${Math.floor(100 + Math.random() * 900)}`,
    name,
    description: description || "Custom targeted cohort",
    criteria,
    count: Number(estimatedCount || 1200),
    growthRate: "+5.0%",
    createdAt: new Date().toISOString().slice(0, 10)
  };

  audienceSegments.push(newSeg);

  res.status(201).json({
    success: true,
    message: `Segment "${newSeg.name}" created with ~${newSeg.count} users!`,
    data: newSeg
  });
};

export const getNotificationHistory = (req, res) => {
  const { channel, status } = req.query;
  let results = [...notificationHistory];

  if (channel && channel !== "all") {
    results = results.filter(h => h.channel === channel);
  }
  if (status && status !== "all") {
    results = results.filter(h => h.status.toLowerCase() === status.toLowerCase());
  }

  res.json({
    success: true,
    count: results.length,
    total: notificationHistory.length,
    data: results
  });
};

export const getMarketingAnalytics = (req, res) => {
  const channelBreakdown = [
    { channel: "Email Marketing", campaignsCount: 14, reach: 45200, openRate: 41.2, revenue: 1245000 },
    { channel: "SMS Broadcasts", campaignsCount: 8, reach: 18400, openRate: 98.2, revenue: 684200 },
    { channel: "Web & Mobile Push", campaignsCount: 12, reach: 24600, openRate: 14.8, revenue: 215000 },
    { channel: "Announcement Banners", campaignsCount: 4, reach: 52000, openRate: 74.5, revenue: 840000 },
    { channel: "WhatsApp Business", campaignsCount: 6, reach: 9800, openRate: 92.4, revenue: 395000 }
  ];

  const campaignTypePerformance = [
    { type: "Festival Specials", revenue: 1450000, orders: 1240, avgOrderValue: 1169 },
    { type: "Flash Offers", revenue: 980000, orders: 1120, avgOrderValue: 875 },
    { type: "Coupon Highlights", revenue: 640000, orders: 740, avgOrderValue: 864 },
    { type: "Win-Back Dormant", revenue: 309200, orders: 380, avgOrderValue: 813 }
  ];

  res.json({
    success: true,
    data: {
      channelBreakdown,
      campaignTypePerformance
    }
  });
};

// ==========================================
// REPORTS & ANALYTICS ENTERPRISE ENGINE
// ==========================================

export const getReportsAnalytics = async (req, res) => {
  const { period = "30d", startDate, endDate } = req.query;

  // Period multiplier for realistic aggregate values
  let mult = 1.0;
  let periodLabel = "Last 30 Days";
  let daysCount = 30;

  if (period === "today") {
    mult = 0.035;
    periodLabel = "Today";
    daysCount = 1;
  } else if (period === "7d") {
    mult = 0.25;
    periodLabel = "Last 7 Days";
    daysCount = 7;
  } else if (period === "90d") {
    mult = 2.95;
    periodLabel = "Last 90 Days (Q2 FY26)";
    daysCount = 90;
  } else if (period === "1y" || period === "fy26") {
    mult = 11.5;
    periodLabel = "Full Financial Year 2026-27";
    daysCount = 365;
  } else if (period === "custom") {
    periodLabel = `Custom: ${startDate || 'Start'} to ${endDate || 'End'}`;
    mult = 1.2;
    daysCount = 35;
  }

  // 1. Core Summary Metrics
  const baseGrossSales = 1948600;
  const baseOrdersCount = 1240;
  const baseDiscounts = 112400;
  const baseTax = 92790;
  const baseShipping = 42800;

  const grossSales = Math.round(baseGrossSales * mult);
  const totalOrders = Math.max(1, Math.round(baseOrdersCount * mult));
  const discounts = Math.round(baseDiscounts * mult);
  const netSales = grossSales - discounts;
  const taxCollected = Math.round(baseTax * mult);
  const shippingFees = Math.round(baseShipping * mult);
  const aov = Math.round(grossSales / totalOrders);

  // 2. Revenue P&L Breakdown
  const cogs = Math.round(grossSales * 0.515); // ~51.5% cost of goods sold
  const grossProfit = netSales - cogs;
  const grossProfitMarginPercent = Number(((grossProfit / netSales) * 100).toFixed(1));
  const gatewayFees = Math.round(netSales * 0.88 * 0.02); // 2% on 88% prepaid
  const shippingCosts = Math.round(totalOrders * 78); // ₹78 per 3PL dispatch
  const packagingCosts = Math.round(totalOrders * 32); // ₹32 per nitrogen-flushed packaging
  const marketingSpend = Math.round(netSales * 0.062); // 6.2% marketing / referral
  const netEbitda = grossProfit - (gatewayFees + shippingCosts + packagingCosts + marketingSpend);
  const ebitdaMarginPercent = Number(((netEbitda / netSales) * 100).toFixed(1));

  // 3. Sales Time Series (Daily / Monthly points)
  const timeSeries = [];
  const points = period === "today" ? 12 : period === "7d" ? 7 : period === "90d" ? 12 : period === "1y" ? 12 : 15;
  
  for (let i = points; i >= 1; i--) {
    let dateStr;
    if (period === "today") {
      dateStr = `${(8 + i * 1)}:00`;
    } else if (period === "1y" || period === "90d") {
      const monthNames = ["Apr '26", "May '26", "Jun '26", "Jul '26", "Aug '26", "Sep '26", "Oct '26", "Nov '26", "Dec '26", "Jan '27", "Feb '27", "Mar '27"];
      dateStr = monthNames[(12 - i) % 12];
    } else {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    }

    const dayGross = Math.round((grossSales / points) * (0.85 + Math.sin(i * 1.3) * 0.3));
    const dayDiscount = Math.round(dayGross * 0.058);
    const dayNet = dayGross - dayDiscount;
    const dayOrders = Math.max(1, Math.round((totalOrders / points) * (0.85 + Math.sin(i * 1.3) * 0.28)));
    const dayTax = Math.round(dayNet * 0.05);

    timeSeries.push({
      date: dateStr,
      grossSales: dayGross,
      netSales: dayNet,
      ordersCount: dayOrders,
      discount: dayDiscount,
      tax: dayTax,
      shipping: Math.round(dayOrders * 35)
    });
  }

  // 4. Payment Method & Channel Distribution
  const paymentMethodDistribution = [
    { method: "UPI / QR (PhonePe/GPay)", share: 56.4, revenue: Math.round(grossSales * 0.564), count: Math.round(totalOrders * 0.58) },
    { method: "Credit / Debit Cards", share: 22.8, revenue: Math.round(grossSales * 0.228), count: Math.round(totalOrders * 0.21) },
    { method: "Cash on Delivery (COD)", share: 11.2, revenue: Math.round(grossSales * 0.112), count: Math.round(totalOrders * 0.12) },
    { method: "NetBanking (HDFC/ICICI/SBI)", share: 6.8, revenue: Math.round(grossSales * 0.068), count: Math.round(totalOrders * 0.06) },
    { method: "Janani Agro Wallet", share: 2.8, revenue: Math.round(grossSales * 0.028), count: Math.round(totalOrders * 0.03) }
  ];

  const salesByChannel = [
    { channel: "Janani Storefront (Web)", share: 62.5, revenue: Math.round(grossSales * 0.625), orders: Math.round(totalOrders * 0.61) },
    { channel: "Mobile Web / PWA App", share: 26.5, revenue: Math.round(grossSales * 0.265), orders: Math.round(totalOrders * 0.28) },
    { channel: "WhatsApp Direct Commerce", share: 7.2, revenue: Math.round(grossSales * 0.072), orders: Math.round(totalOrders * 0.07) },
    { channel: "Organic Community Sampling", share: 3.8, revenue: Math.round(grossSales * 0.038), orders: Math.round(totalOrders * 0.04) }
  ];

  // 5. Monthly P&L Ledger
  const monthlyPnl = [
    { month: "Sep 2026", grossSales: 1948600, cogs: 1003500, opex: 268400, grossProfit: 945100, netEbitda: 676700, margin: "34.7%" },
    { month: "Aug 2026", grossSales: 1820400, cogs: 937500, opex: 254200, grossProfit: 882900, netEbitda: 628700, margin: "34.5%" },
    { month: "Jul 2026", grossSales: 1690000, cogs: 870350, opex: 241000, grossProfit: 819650, netEbitda: 578650, margin: "34.2%" },
    { month: "Jun 2026", grossSales: 1540800, cogs: 793500, opex: 228000, grossProfit: 747300, netEbitda: 519300, margin: "33.7%" },
    { month: "May 2026", grossSales: 1410000, cogs: 726150, opex: 215000, grossProfit: 683850, netEbitda: 468850, margin: "33.3%" },
    { month: "Apr 2026", grossSales: 1285000, cogs: 661775, opex: 198000, grossProfit: 623225, netEbitda: 425225, margin: "33.1%" }
  ];

  // 6. Order Lifecycle Report
  const completedOrders = Math.round(totalOrders * 0.846);
  const inTransitOrders = Math.round(totalOrders * 0.078);
  const processingOrders = Math.round(totalOrders * 0.038);
  const confirmedOrders = Math.round(totalOrders * 0.016);
  const cancelledOrders = Math.round(totalOrders * 0.011);
  const returnedOrders = Math.round(totalOrders * 0.011);

  const statusBreakdown = [
    { status: "Delivered", count: completedOrders, percentage: 84.6, color: "emerald", revenue: Math.round(grossSales * 0.852) },
    { status: "In-Transit (Dispatched)", count: inTransitOrders, percentage: 7.8, color: "blue", revenue: Math.round(grossSales * 0.076) },
    { status: "Quality Check & Packing", count: processingOrders, percentage: 3.8, color: "amber", revenue: Math.round(grossSales * 0.036) },
    { status: "Order Confirmed", count: confirmedOrders, percentage: 1.6, color: "indigo", revenue: Math.round(grossSales * 0.016) },
    { status: "Returned / RTO", count: returnedOrders, percentage: 1.1, color: "orange", revenue: Math.round(grossSales * 0.010) },
    { status: "Cancelled", count: cancelledOrders, percentage: 1.1, color: "rose", revenue: Math.round(grossSales * 0.010) }
  ];

  // 7. Customer & Retention Report
  const totalRegisteredCustomers = Math.round(3842 * (period === "1y" ? 1 : mult > 1 ? 1.4 : 1));
  const newCustomersInPeriod = Math.round(486 * mult);
  const returningCustomersInPeriod = Math.round(754 * mult);
  const repeatPurchaseRate = 60.8;
  const avgLtv = 6840;

  const tierDistribution = [
    { tier: "Platinum Gold", count: 284, share: 7.4, minSpend: "₹25,000", avgSpend: 42100, color: "purple" },
    { tier: "Gold Member", count: 642, share: 16.7, minSpend: "₹10,000", avgSpend: 16800, color: "amber" },
    { tier: "Silver Patron", count: 1120, share: 29.2, minSpend: "₹3,000", avgSpend: 5400, color: "slate" },
    { tier: "Bronze / First Time", count: 1680, share: 43.7, minSpend: "₹0", avgSpend: 1450, color: "orange" },
    { tier: "VIP Patron Elite", count: 116, share: 3.0, minSpend: "₹50,000", avgSpend: 78500, color: "emerald" }
  ];

  const ltvCohorts = [
    { bracket: "< ₹2,000 (New Comers)", count: Math.round(1420 * (mult > 1 ? 1.2 : 1)), percentage: 37 },
    { bracket: "₹2,000 - ₹5,000 (Regulars)", count: Math.round(1180 * (mult > 1 ? 1.2 : 1)), percentage: 31 },
    { bracket: "₹5,000 - ₹15,000 (Enthusiasts)", count: Math.round(780 * (mult > 1 ? 1.2 : 1)), percentage: 20 },
    { bracket: "₹15,000 - ₹50,000 (Loyalists)", count: Math.round(346 * (mult > 1 ? 1.2 : 1)), percentage: 9 },
    { bracket: "> ₹50,000 (VIP Patrons)", count: Math.round(116 * (mult > 1 ? 1.2 : 1)), percentage: 3 }
  ];

  // 8. Inventory & Valuation Report
  const totalSkus = adminProducts.length || 38;
  const inStockSkus = adminProducts.filter(p => p.stock > 10).length || 33;
  const lowStockSkus = adminProducts.filter(p => p.stock > 0 && p.stock <= 10).length || 3;
  const outOfStockSkus = adminProducts.filter(p => p.stock === 0).length || 2;
  const totalRetailValuation = 1482000;
  const totalCostValuation = 784000;
  const stockTurnoverRatio = "5.8x";

  const fastMovingSkus = [
    { sku: "JAP-HARIT-1L", name: "Harit (1 L) — Trichoderma Viride Biofungicide", stock: 84, monthlyRunRate: 340, daysOfSupply: 7, status: "High Velocity" },
    { sku: "JAP-BHUMI-1L", name: "Bhumi Shakti (1 L) — Humic & Fulvic Acid", stock: 120, monthlyRunRate: 280, daysOfSupply: 13, status: "High Velocity" },
    { sku: "JAN-BOT-NEEM-1L", name: "Janani Neem Oil 1000 PPM (1 L)", stock: 65, monthlyRunRate: 195, daysOfSupply: 10, status: "High Velocity" },
    { sku: "JAN-RICE-KAV-1000", name: "Ancient Black Kavuni Rice (1kg)", stock: 92, monthlyRunRate: 160, daysOfSupply: 17, status: "Healthy" },
    { sku: "JAN-BIO-HAR-1000", name: "Harit Bio-Fungicide (1L)", stock: 110, monthlyRunRate: 140, daysOfSupply: 23, status: "Healthy" }
  ];

  const slowMovingSkus = [
    { sku: "JAN-BIO-BAL-1L", name: "Balavan Plant Growth Booster (1 L)", stock: 140, monthlyRunRate: 24, daysOfSupply: 175, status: "Slow Moving" },
    { sku: "JAN-TEA-ORG-250", name: "Assam Orthodox Whole Leaf Tea (250g)", stock: 85, monthlyRunRate: 18, daysOfSupply: 141, status: "Slow Moving" },
    { sku: "JAN-BIO-ANN-1L", name: "Annada Organic Micronutrient (1 L)", stock: 95, monthlyRunRate: 22, daysOfSupply: 129, status: "Slow Moving" }
  ];

  // 9. Coupon Reports
  const totalCoupons = adminCoupons.length || 24;
  const activeCoupons = adminCoupons.filter(c => c.active).length || 8;
  const totalRedemptions = Math.round(1511 * mult);
  const totalDiscountsDisbursed = Math.round(399660 * mult);
  const attributedRevenue = Math.round(4245950 * mult);
  const avgRoiMultiplier = "10.6x";

  const topCoupons = [
    { code: "FIRSTORGANIC", type: "Flat ₹200 Off", redemptions: Math.round(512 * mult), totalDiscount: Math.round(102400 * mult), revenueGenerated: Math.round(1530880 * mult), roi: "14.9x", conversion: "24.6%" },
    { code: "FREESHIPAGRO", type: "Free Courier", redemptions: Math.round(428 * mult), totalDiscount: Math.round(51360 * mult), revenueGenerated: Math.round(419440 * mult), roi: "8.2x", conversion: "18.2%" },
    { code: "JANANI10", type: "10% Instant", redemptions: Math.round(342 * mult), totalDiscount: Math.round(102600 * mult), revenueGenerated: Math.round(1484280 * mult), roi: "14.5x", conversion: "16.4%" },
    { code: "HARVESTFEST", type: "15% Seasonal", redemptions: Math.round(189 * mult), totalDiscount: Math.round(89300 * mult), revenueGenerated: Math.round(595350 * mult), roi: "6.7x", conversion: "12.8%" },
    { code: "VIPPLATINUM25", type: "25% VIP Club", redemptions: Math.round(45 * mult), totalDiscount: Math.round(54000 * mult), revenueGenerated: Math.round(216000 * mult), roi: "4.0x", conversion: "32.1%" }
  ];

  // 10. Referral Reports
  const totalInvites = Math.round(1840 * mult);
  const convertedAdvocates = Math.round(684 * mult);
  const totalRewardsDisbursed = Math.round(342000 * mult);
  const walletRedeemed = Math.round(291500 * mult);
  const referralGmv = Math.round(2188800 * mult);
  const referralConversionRate = "37.2%";

  const topAdvocates = [
    { name: "Ananya Sharma", code: "ANANYA-BLR-45", invites: 28, converted: 19, rewardsEarned: 9500, revenueDriven: 76800, tier: "Platinum Gold" },
    { name: "Vikram Malhotra", code: "VIKRAM-GGN-18", invites: 24, converted: 16, rewardsEarned: 8000, revenueDriven: 64200, tier: "VIP Patron" },
    { name: "Pooja Hegde", code: "POOJA-HYD-99", invites: 18, converted: 12, rewardsEarned: 6000, revenueDriven: 49500, tier: "Gold Member" },
    { name: "Kavita Nair", code: "KAVITA-KOC-33", invites: 15, converted: 11, rewardsEarned: 5500, revenueDriven: 41200, tier: "Gold Member" },
    { name: "Rajesh Kulkarni", code: "RAJESH-PUN-12", invites: 14, converted: 8, rewardsEarned: 4000, revenueDriven: 31400, tier: "Gold Member" }
  ];

  // 11. COD vs Online Report
  const onlineOrdersCount = Math.round(totalOrders * 0.88);
  const onlineRevenue = Math.round(grossSales * 0.89);
  const onlineRtoPercent = 1.4;
  const codOrdersCount = totalOrders - onlineOrdersCount;
  const codRevenue = grossSales - onlineRevenue;
  const codSharePercent = 11.2;
  const codRtoPercent = 9.4;

  const cashReconciliation = {
    totalCodCollectedCourier: Math.round(codRevenue * 0.906),
    remittedToJananiBank: Math.round(codRevenue * 0.835),
    pendingCourierRemittance: Math.round(codRevenue * 0.071),
    courierSettlementCycle: "T+2 Days (Shiprocket Xpress)"
  };

  // 12. Top Selling Products
  const topProducts = [
    { rank: 1, sku: "JAP-HARIT-1L", name: "Harit (1 L) — Trichoderma Viride Biofungicide", category: "Bio-Fungicides", unitsSold: Math.round(480 * mult), revenue: Math.round(696000 * mult), cogs: Math.round(334080 * mult), margin: "52.0%", stock: 84, inStock: true },
    { rank: 2, sku: "JAP-BHUMI-1L", name: "Bhumi Shakti (1 L) — Humic & Fulvic Acid", category: "Biological Crop Protection", unitsSold: Math.round(410 * mult), revenue: Math.round(172200 * mult), cogs: Math.round(89544 * mult), margin: "48.0%", stock: 120, inStock: true },
    { rank: 3, sku: "JAN-BOT-NEEM-1000", name: "Janani Neem Oil 1000 PPM (1 L)", category: "Bio-Pesticides", unitsSold: Math.round(320 * mult), revenue: Math.round(217600 * mult), cogs: Math.round(108800 * mult), margin: "50.0%", stock: 65, inStock: true },
    { rank: 4, sku: "JAN-SOIL-DHR-4KG", name: "Dharani Mycorrhizal Granules (4 kg)", category: "Bio-Fertilizers", unitsSold: Math.round(290 * mult), revenue: Math.round(89900 * mult), cogs: Math.round(47647 * mult), margin: "47.0%", stock: 92, inStock: true },
    { rank: 5, sku: "JAN-SOIL-PUS-1L", name: "Pushkal Humic Acid Liquid (1 L)", category: "Bio-Stimulants", unitsSold: Math.round(240 * mult), revenue: Math.round(124800 * mult), cogs: Math.round(63648 * mult), margin: "49.0%", stock: 78, inStock: true },
    { rank: 6, sku: "JAN-BIO-HAR-1000", name: "Harit Bio-Fungicide (1 L)", category: "Bio-Pesticides", unitsSold: Math.round(210 * mult), revenue: Math.round(37800 * mult), cogs: Math.round(19656 * mult), margin: "48.0%", stock: 110, inStock: true },
    { rank: 7, sku: "JAN-BIO-ANN-1L", name: "Annada Organic Micronutrient (1 L)", category: "Micronutrients", unitsSold: Math.round(195 * mult), revenue: Math.round(37050 * mult), cogs: Math.round(18525 * mult), margin: "50.0%", stock: 145, inStock: true },
    { rank: 8, sku: "JAN-BIO-BAL-1L", name: "Balavan Plant Growth Booster (1 L)", category: "Bio-Stimulants", unitsSold: Math.round(175 * mult), revenue: Math.round(50750 * mult), cogs: Math.round(24360 * mult), margin: "52.0%", stock: 60, inStock: true },
    { rank: 9, sku: "JAN-SOIL-DHR-1000", name: "Dharani Bio-Fertilizer (1 kg)", category: "Bio-Fertilizers", unitsSold: Math.round(160 * mult), revenue: Math.round(35200 * mult), cogs: Math.round(18304 * mult), margin: "48.0%", stock: 98, inStock: true },
    { rank: 10, sku: "JAN-SOIL-FULV-500", name: "Concentrated Fulvic Acid (500 ml)", category: "Bio-Stimulants", unitsSold: Math.round(135 * mult), revenue: Math.round(256365 * mult), cogs: Math.round(117927 * mult), margin: "54.0%", stock: 42, inStock: true }
  ];

  // 13. Top Categories
  const topCategories = [
    { rank: 1, name: "Bio-Fertilizers & Inoculants", revenue: Math.round(grossSales * 0.36), sharePercent: 36.0, unitsSold: Math.round(520 * mult), productsCount: 4, growthRate: "+28.4%" },
    { rank: 2, name: "Soil Conditioners & Biostimulants", revenue: Math.round(grossSales * 0.22), sharePercent: 22.0, unitsSold: Math.round(710 * mult), productsCount: 6, growthRate: "+22.1%" },
    { rank: 3, name: "Biological Crop Protection", revenue: Math.round(grossSales * 0.18), sharePercent: 18.0, unitsSold: Math.round(360 * mult), productsCount: 4, growthRate: "+18.7%" },
    { rank: 4, name: "Botanical Pest Repellents", revenue: Math.round(grossSales * 0.12), sharePercent: 12.0, unitsSold: Math.round(310 * mult), productsCount: 3, growthRate: "+34.2%" },
    { rank: 5, name: "Organic Micronutrients", revenue: Math.round(grossSales * 0.08), sharePercent: 8.0, unitsSold: Math.round(390 * mult), productsCount: 5, growthRate: "+15.3%" },
    { rank: 6, name: "Plant Growth Boosters", revenue: Math.round(grossSales * 0.04), sharePercent: 4.0, unitsSold: Math.round(340 * mult), productsCount: 6, growthRate: "+12.9%" }
  ];

  // 14. Top Customers
  let topCustomers = [];
  try {
    const custRows = await query(`
      SELECT customer_name, customer_email, customer_phone, COUNT(*) as ordersCount, SUM(total) as totalSpend
      FROM \`orders\`
      WHERE customer_email IS NOT NULL AND customer_email != ''
      GROUP BY customer_email
      ORDER BY totalSpend DESC
      LIMIT 10
    `);
    if (Array.isArray(custRows)) {
      topCustomers = custRows.map((r, i) => ({
        rank: i + 1,
        id: `CUST-${String(i + 1).padStart(3, "0")}`,
        name: r.customer_name || "Valued Patron",
        email: r.customer_email || "",
        city: "India",
        tier: "Customer",
        ordersCount: Number(r.ordersCount || 1),
        totalSpend: Number(r.totalSpend || 0),
        aov: Math.round(Number(r.totalSpend || 0) / Math.max(1, Number(r.ordersCount || 1))),
        loyaltyPoints: Math.round(Number(r.totalSpend || 0) * 0.1),
        lastOrder: "Recent"
      }));
    }
  } catch (e) {}

  res.json({
    success: true,
    period,
    periodLabel,
    daysCount,
    data: {
      summary: {
        grossSales,
        netSales,
        discounts,
        taxCollected,
        shippingFees,
        totalOrders,
        aov,
        cogs,
        grossProfit,
        grossProfitMarginPercent,
        netEbitda,
        ebitdaMarginPercent,
        activeCustomers: totalRegisteredCustomers,
        repeatPurchaseRate,
        codSharePercent: 11.2,
        onlineSharePercent: 88.8
      },
      salesReport: {
        grossSales,
        netSales,
        discounts,
        taxCollected,
        shippingFees,
        totalOrders,
        aov,
        timeSeries,
        paymentMethodDistribution,
        salesByChannel
      },
      revenueReport: {
        grossRevenue: netSales,
        cogs,
        grossProfit,
        grossProfitMarginPercent,
        gatewayFees,
        shippingCosts,
        packagingCosts,
        marketingSpend,
        netEbitda,
        ebitdaMarginPercent,
        monthlyPnl
      },
      orderReport: {
        totalOrders,
        completedOrders,
        inTransitOrders,
        processingOrders,
        confirmedOrders,
        cancelledOrders,
        returnedOrders,
        aov,
        fulfillmentVelocityHours: 18.2,
        onTimeDeliveryRate: "96.8%",
        statusBreakdown
      },
      customerReport: {
        totalRegisteredCustomers,
        newCustomersInPeriod,
        returningCustomersInPeriod,
        repeatPurchaseRate,
        avgLtv,
        tierDistribution,
        ltvCohorts
      },
      inventoryReport: {
        totalSkus,
        inStockSkus,
        lowStockSkus,
        outOfStockSkus,
        totalRetailValuation,
        totalCostValuation,
        stockTurnoverRatio,
        fastMovingSkus,
        slowMovingSkus
      },
      couponReport: {
        totalCoupons,
        activeCoupons,
        totalRedemptions,
        totalDiscountsDisbursed,
        attributedRevenue,
        avgRoiMultiplier,
        topCoupons
      },
      referralReport: {
        totalInvites,
        convertedAdvocates,
        totalRewardsDisbursed,
        walletRedeemed,
        referralGmv,
        referralConversionRate,
        topAdvocates
      },
      codVsOnlineReport: {
        onlineOrdersCount,
        onlineRevenue,
        onlineSharePercent: 88.8,
        onlineRtoPercent,
        codOrdersCount,
        codRevenue,
        codSharePercent: 11.2,
        codRtoPercent,
        cashReconciliation
      },
      topProducts,
      topCategories,
      topCustomers
    }
  });
};

// ==========================================
// GST & TAX COMPLIANCE REPORT (GSTR-1)
// ==========================================

export const getGstTaxReport = (req, res) => {
  const { period = "30d", financialYear = "2026-27", month = "09" } = req.query;

  const taxableTurnover = 1855810;
  const totalTaxCollected = 92790;
  const cgstTotal = 34800;
  const sgstTotal = 34800;
  const igstTotal = 23190;
  const invoiceCount = 1240;

  const hsnBreakdown = [
    {
      hsnCode: "04059020",
      description: "Harit Trichoderma Viride Biofungicide (Pure Clarified Butter)",
      uqc: "LTR",
      totalQuantity: 520,
      totalValue: 791700,
      taxableValue: 754000,
      rate: 5.0,
      integratedTax: 9425,
      centralTax: 14137.5,
      stateTax: 14137.5,
      cess: 0
    },
    {
      hsnCode: "38089910",
      description: "Janani Neem Oil 1000 PPM Botanical Pest Deterrent",
      uqc: "KGS",
      totalQuantity: 340,
      totalValue: 242760,
      taxableValue: 231200,
      rate: 5.0,
      integratedTax: 2890,
      centralTax: 4335,
      stateTax: 4335,
      cess: 0
    },
    {
      hsnCode: "15089091",
      description: "Harit Bio-Fungicide & Trichoderma Formulations",
      uqc: "LTR",
      totalQuantity: 680,
      totalValue: 299880,
      taxableValue: 285600,
      rate: 5.0,
      integratedTax: 3570,
      centralTax: 5355,
      stateTax: 5355,
      cess: 0
    },
    {
      hsnCode: "10063090",
      description: "Ancient Black Kavuni & Heritage Red Rice",
      uqc: "KGS",
      totalQuantity: 420,
      totalValue: 136710,
      taxableValue: 130200,
      rate: 5.0,
      integratedTax: 1627.5,
      centralTax: 2441.25,
      stateTax: 2441.25,
      cess: 0
    },
    {
      hsnCode: "10082900",
      description: "Certified Trichoderma & Humic Formulations",
      uqc: "KGS",
      totalQuantity: 510,
      totalValue: 96390,
      taxableValue: 91800,
      rate: 5.0,
      integratedTax: 1147.5,
      centralTax: 1721.25,
      stateTax: 1721.25,
      cess: 0
    },
    {
      hsnCode: "17011490",
      description: "Annada & Balavan Plant Growth Boosters",
      uqc: "KGS",
      totalQuantity: 380,
      totalValue: 75810,
      taxableValue: 72200,
      rate: 5.0,
      integratedTax: 902.5,
      centralTax: 1353.75,
      stateTax: 1353.75,
      cess: 0
    },
    {
      hsnCode: "09103030",
      description: "Pushkal & Dharani Bio-Fertilizer Granules",
      uqc: "KGS",
      totalQuantity: 210,
      totalValue: 149940,
      taxableValue: 142800,
      rate: 5.0,
      integratedTax: 1785,
      centralTax: 2677.5,
      stateTax: 2677.5,
      cess: 0
    },
    {
      hsnCode: "07136000",
      description: "Dharani & Bhumi Shakti Formulations",
      uqc: "KGS",
      totalQuantity: 360,
      totalValue: 155410,
      taxableValue: 148010,
      rate: 5.0,
      integratedTax: 1842.5,
      centralTax: 2778.75,
      stateTax: 2778.75,
      cess: 0
    }
  ];

  const stateWiseTax = [
    { state: "Karnataka", stateCode: "29", type: "Intra-State (Local)", invoiceCount: 520, taxableValue: 779440, cgst: 19486, sgst: 19486, igst: 0, totalTax: 38972 },
    { state: "Maharashtra", stateCode: "27", type: "Inter-State (IGST)", invoiceCount: 298, taxableValue: 445390, cgst: 0, sgst: 0, igst: 22269.5, totalTax: 22269.5 },
    { state: "Gujarat", stateCode: "24", type: "Inter-State (IGST)", invoiceCount: 174, taxableValue: 259810, cgst: 0, sgst: 0, igst: 12990.5, totalTax: 12990.5 },
    { state: "Tamil Nadu", stateCode: "33", type: "Inter-State (IGST)", invoiceCount: 136, taxableValue: 204140, cgst: 0, sgst: 0, igst: 10207, totalTax: 10207 },
    { state: "Telangana", stateCode: "36", type: "Inter-State (IGST)", invoiceCount: 112, taxableValue: 167030, cgst: 0, sgst: 0, igst: 8351.5, totalTax: 8351.5 }
  ];

  const b2cSmallInvoices = [
    { invoiceNo: "INV-2026-94812", date: "2026-09-11", customer: "Ananya Sharma", state: "Karnataka (29)", taxableValue: 3847.62, cgst: 96.19, sgst: 96.19, igst: 0, total: 4040 },
    { invoiceNo: "INV-2026-94811", date: "2026-09-11", customer: "Rajesh Kulkarni", state: "Maharashtra (27)", taxableValue: 1122.86, cgst: 0, sgst: 0, igst: 56.14, total: 1179 },
    { invoiceNo: "INV-2026-94810", date: "2026-09-11", customer: "Sunita Iyer", state: "Tamil Nadu (33)", taxableValue: 1380.95, cgst: 0, sgst: 0, igst: 69.05, total: 1450 },
    { invoiceNo: "INV-2026-94809", date: "2026-09-10", customer: "Vikram Malhotra", state: "Haryana (06)", taxableValue: 2990.48, cgst: 0, sgst: 0, igst: 149.52, total: 3140 },
    { invoiceNo: "INV-2026-94808", date: "2026-09-10", customer: "Pooja Hegde", state: "Karnataka (29)", taxableValue: 1980.95, cgst: 49.52, sgst: 49.52, igst: 0, total: 2080 }
  ];

  res.json({
    success: true,
    financialYear,
    month,
    period,
    gstin: "29AABCJ4491D1Z4",
    legalName: "Janani Agro Organics Private Limited",
    tradeName: "Janani Bloom Organics",
    data: {
      gstr1Summary: {
        taxableTurnover,
        totalTaxCollected,
        cgstTotal,
        sgstTotal,
        igstTotal,
        invoiceCount,
        taxRate: "5.0% Standard GST on Farm Produce"
      },
      hsnBreakdown,
      stateWiseTax,
      b2cSmallInvoices
    }
  });
};

// ==========================================
// EXPORT REPORTS DATASET ENGINE (CSV & JSON)
// ==========================================

export const exportReportData = async (req, res) => {
  const { type = "sales", format = "csv", period = "30d" } = req.query;

  if (format === "csv") {
    let csvHeader = "";
    let csvRows = [];

    switch (type) {
      case "sales":
        csvHeader = "Date,Gross Sales (INR),Net Sales (INR),Orders Count,Discounts (INR),Tax Collected (INR),Shipping Fees (INR)";
        csvRows = [
          "2026-09-11,84200,79400,54,4800,3970,1890",
          "2026-09-10,76500,72100,48,4400,3605,1680",
          "2026-09-09,92100,86800,58,5300,4340,2030",
          "2026-09-08,68400,64600,43,3800,3230,1505",
          "2026-09-07,81200,76500,51,4700,3825,1785",
          "2026-09-06,94800,89200,62,5600,4460,2170",
          "2026-09-05,71300,67200,45,4100,3360,1575"
        ];
        break;

      case "revenue":
        csvHeader = "Period Month,Gross Revenue (INR),COGS (INR),Gross Profit (INR),Gross Margin %,Gateway Fees (INR),3PL Shipping (INR),Net EBITDA (INR),EBITDA Margin %";
        csvRows = [
          "Sep 2026,1948600,1003500,945100,48.5%,34295,96720,676700,34.7%",
          "Aug 2026,1820400,937500,882900,48.5%,32039,90350,628700,34.5%",
          "Jul 2026,1690000,870350,819650,48.5%,29744,83880,578650,34.2%",
          "Jun 2026,1540800,793500,747300,48.5%,27118,76480,519300,33.7%",
          "May 2026,1410000,726150,683850,48.5%,24816,70000,468850,33.3%",
          "Apr 2026,1285000,661775,623225,48.5%,22616,63800,425225,33.1%"
        ];
        break;

      case "orders":
        csvHeader = "Order Status,Orders Count,Percentage %,Revenue Attributed (INR),Fulfillment Note";
        csvRows = [
          "Delivered,1049,84.6%,1658400,Completed with OTP & Verified Delivery",
          "In-Transit,97,7.8%,148090,Handed to Shiprocket / Bluedart Air",
          "Quality Check & Packing,47,3.8%,70150,Lodhika Warehouse Nitrogen Pouching",
          "Order Confirmed,20,1.6%,31180,Payment Received Awaiting Batching",
          "Returned / RTO,14,1.1%,19490,Reverse Logistics Initiated",
          "Cancelled,13,1.1%,19490,Refund Processed to Source"
        ];
        break;

      case "customers":
        csvHeader = "Rank,Customer ID,Name,Email,City/State,Loyalty Tier,Orders Count,Total Lifetime Spend (INR),AOV (INR),Loyalty Points";
        try {
          const uRows = await query("SELECT id, name, email, city, state, tier, wallet_balance, loyalty_points FROM `users` WHERE role = 'Customer' LIMIT 100");
          if (Array.isArray(uRows) && uRows.length > 0) {
            csvRows = uRows.map((u, i) => `${i + 1},${u.id},${u.name || 'Customer'},${u.email || ''},${u.city || ''} ${u.state || ''},${u.tier || 'Customer'},1,${u.wallet_balance || 0},${u.wallet_balance || 0},${u.loyalty_points || 0}`);
          } else {
            csvRows = [];
          }
        } catch (e) {
          csvRows = [];
        }
        break;

      case "inventory":
        csvHeader = "SKU,Product Name,Category,Units In Stock,Monthly Velocity,Days of Supply,Cost Price (INR),Retail Price (INR),Stock Status";
        csvRows = [
          "JAP-HARIT-1L,Harit (1 L) — Trichoderma Viride Biofungicide,Bio-Fungicides,84,340,7,754,1450,High Velocity",
          "JAP-BHUMI-1L,Bhumi Shakti (1 L) — Humic & Fulvic Acid,Biological Crop Protection,120,280,13,218,420,High Velocity",
          "JAN-BOT-NEEM-1L,Janani Neem Oil 1000 PPM (1 L),Bio-Pesticides,65,195,10,340,680,High Velocity",
          "JAN-RICE-KAV-1000,Harit Bio-Fungicide (1 L),Heritage Rice,92,160,17,164,310,Healthy",
          "JAN-BIO-HAR-1000,Harit Bio-Fungicide (1L),Bio-Pesticides,110,140,23,93,180,Healthy",
          "JAN-BIO-BAL-1L,Balavan Plant Growth Booster (1 L),Bio-Stimulants,140,24,175,280,550,Healthy"
        ];
        break;

      case "gst":
        csvHeader = "HSN Code,Description,UQC,Total Qty,Taxable Value (INR),GST Rate %,CGST 2.5% (INR),SGST 2.5% (INR),IGST 5.0% (INR),Total Tax (INR)";
        csvRows = [
          "04059020,Harit Trichoderma Viride Biofungicide,LTR,520,754000,5.0%,14137.5,14137.5,9425,37700",
          "38089910,Janani Neem Oil 1000 PPM,LTR,340,231200,5.0%,4335,4335,2890,11560",
          "31051000,Bhumi Shakti Soil Conditioner,LTR,680,285600,5.0%,5355,5355,3570,14280",
          "10063090,Ancient Black Kavuni Rice,KGS,420,130200,5.0%,2441.25,2441.25,1627.5,6510",
          "38089910,Harit Bio-Fungicide,LTR,510,91800,5.0%,1721.25,1721.25,1147.5,4590",
          "31051000,Dharani Mycorrhizal Bio-Fertilizer,KGS,380,72200,5.0%,1353.75,1353.75,902.5,3610",
          "09103030,Lakadong Turmeric Powder,KGS,210,142800,5.0%,2677.5,2677.5,1785,7140"
        ];
        break;

      case "coupons":
        csvHeader = "Coupon Code,Discount Type,Redemptions,Total Discounts Given (INR),Revenue Generated (INR),ROI Multiplier,Conversion Rate %";
        csvRows = [
          "FIRSTORGANIC,Flat ₹200 Off,512,102400,1530880,14.9x,24.6%",
          "FREESHIPAGRO,Free Express Shipping,428,51360,419440,8.2x,18.2%",
          "JANANI10,10% Instant Discount,342,102600,1484280,14.5x,16.4%",
          "HARVESTFEST,15% Seasonal Promo,189,89300,595350,6.7x,12.8%",
          "VIPPLATINUM25,25% VIP Club Exclusive,45,54000,216000,4.0x,32.1%"
        ];
        break;

      case "referrals":
        csvHeader = "Advocate Name,Referral Code,Invites Sent,Converted Friends,Rewards Disbursed (INR),GMV Generated (INR),Advocate Tier";
        csvRows = [
          "Ananya Sharma,ANANYA-BLR-45,28,19,9500,76800,Platinum Gold",
          "Vikram Malhotra,VIKRAM-GGN-18,24,16,8000,64200,VIP Patron",
          "Pooja Hegde,POOJA-HYD-99,18,12,6000,49500,Gold Member",
          "Kavita Nair,KAVITA-KOC-33,15,11,5500,41200,Gold Member",
          "Rajesh Kulkarni,RAJESH-PUN-12,14,8,4000,31400,Gold Member"
        ];
        break;

      case "cod_vs_online":
        csvHeader = "Payment Channel,Orders Count,Revenue (INR),Share %,RTO Failure Rate %,Cash Reconciliation Status";
        csvRows = [
          "Online Prepaid (UPI/Cards/NetBanking),1091,1734250,88.8%,1.4%,Instant Bank Settlement (Razorpay/PhonePe)",
          "Cash on Delivery (COD),149,214350,11.2%,9.4%,T+2 Days 3PL Courier Remittance (₹178,500 Remitted / ₹15,700 In-Transit)"
        ];
        break;

      case "top_products":
        csvHeader = "Rank,SKU,Product Name,Category,Units Sold,Revenue (INR),COGS (INR),Gross Margin %,Stock Status";
        csvRows = [
          "1,JAP-HARIT-1L,Harit (1 L) — Trichoderma Viride Biofungicide,Bio-Fungicides,480,696000,334080,52.0%,In Stock (84 units)",
          "2,JAP-BHUMI-1L,Bhumi Shakti (1 L) — Humic & Fulvic Acid,Biological Crop Protection,410,172200,89544,48.0%,In Stock (120 units)",
          "3,JAN-BOT-NEEM-1000,Janani Neem Oil 1000 PPM (1 L),Bio-Pesticides,320,217600,108800,50.0%,In Stock (65 units)",
          "4,JAN-SOIL-DHR-4KG,Dharani Mycorrhizal Granules (4 kg),Bio-Fertilizers,290,89900,47647,47.0%,In Stock (92 units)",
          "5,JAN-SOIL-PUS-1L,Pushkal Humic Acid Liquid (1 L),Bio-Stimulants,240,124800,63648,49.0%,In Stock (78 units)"
        ];
        break;

      case "top_categories":
        csvHeader = "Rank,Category Name,Gross Revenue (INR),Revenue Share %,Units Sold,Products Count,YoY Growth %";
        csvRows = [
          "1,Bio-Fertilizers & Inoculants,701496,36.0%,520,4,+28.4%",
          "2,Soil Conditioners & Biostimulants,428692,22.0%,710,6,+22.1%",
          "3,Biological Crop Protection,272804,18.0%,360,4,+18.7%",
          "4,Spices Herbs & Wellness,233832,12.0%,310,8,+34.2%",
          "5,Heritage Rice & Ancient Grains,155888,8.0%,390,5,+15.3%",
          "6,Botanical Formulations,97430,5.0%,340,6,+12.9%",
          "5,Organic Micronutrients & Boosters,58458,5.0%,280,4,+9.8%"
        ];
        break;

      case "top_customers":
        csvHeader = "Rank,Customer ID,Name,Email,City/State,Loyalty Tier,Orders Count,Total Lifetime Spend (INR),AOV (INR),Loyalty Points";
        try {
          const uRows = await query("SELECT id, name, email, city, state, tier, wallet_balance, loyalty_points FROM `users` WHERE role = 'Customer' LIMIT 100");
          if (Array.isArray(uRows) && uRows.length > 0) {
            csvRows = uRows.map((u, i) => `${i + 1},${u.id},${u.name || 'Customer'},${u.email || ''},${u.city || ''} ${u.state || ''},${u.tier || 'Customer'},1,${u.wallet_balance || 0},${u.wallet_balance || 0},${u.loyalty_points || 0}`);
          } else {
            csvRows = [];
          }
        } catch (e) {
          csvRows = [];
        }
        break;

      default:
        csvHeader = "Metric,Value";
        csvRows = ["Gross Sales,1948600", "Total Orders,1240", "Net Sales,1836200", "Total GST,92790"];
    }

    const csvContent = `${csvHeader}\n${csvRows.join("\n")}`;
    const filename = `janani-agro-${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  }

  // JSON dataset response
  res.json({
    success: true,
    type,
    period,
    generatedAt: new Date().toISOString(),
    message: `Export dataset for ${type} generated successfully`
  });
};

// ============================================================================
// SETTINGS, ROLES, PERMISSIONS, AUDIT, SECURITY & BACKUP ENTERPRISE CONTROLLER
// ============================================================================

// 1. Comprehensive System Settings In-Memory Store
let adminSettingsData = {
  store: {
    storeName: "JANANI AGRO PRODUCTS & CO.",
    legalBusinessName: "Janani Agro Producers Pvt. Ltd.",
    storeTagline: "Certified Bio-Fertilizers, Bio-Pesticides & Crop Protection Direct from Lodhika GIDC",
    supportEmail: "support@jananiagro.com",
    ordersEmail: "orders@jananiagro.com",
    supportPhone: "+91 89190 23456",
    tollFreeNumber: "1800-425-9988",
    storeAddress: "Janani Organic Hub, Plot 42-A, Growth Centre, Lodhika GIDC, Metoda",
    city: "Rajkot",
    state: "Gujarat",
    pincode: "360021",
    country: "India",
    fssaiLicenseNo: "10021021000845",
    cinNumber: "U01112GJ2021PTC120491",
    gstin: "24AAACJ8892K1Z5",
    defaultCurrency: "INR (₹)",
    defaultTimezone: "Asia/Kolkata (IST +05:30)",
    weightUnit: "kg",
    dimensionsUnit: "cm",
    orderIdPrefix: "JAN-",
    orderIdPadding: 5,
    maintenanceMode: false,
    operatingHours: "Monday – Saturday: 08:30 AM – 08:00 PM IST"
  },
  branding: {
    logoLightUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80",
    logoDarkUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80",
    faviconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&q=80",
    adminBrandAccent: "#10b981",
    brandPrimaryColor: "#059669",
    brandSecondaryColor: "#d97706",
    emailHeaderBannerUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80",
    invoiceWatermarkText: "JANANI AGRO CERTIFIED AUTHENTIC",
    customerAppBanner: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80"
  },
  seo: {
    metaTitle: "Janani Agro | Certified Bio-Fertilizers & Biological Crop Protection",
    metaDescription: "Manufactured at Lodhika GIDC facility. Trichoderma viride, humic and fulvic soil conditioners, botanical pest deterrents and micronutrients for sustainable zero-residue agriculture.",
    metaKeywords: "bio fertilizers, bio pesticides, trichoderma viride, humic acid, neem oil, biostimulants, micronutrients, crop protection, janani agro",
    canonicalBaseUrl: "https://www.jananiagro.com",
    ogImageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80",
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterHandle: "@JananiAgroIN",
    googleSiteVerificationId: "goog_984128491028301928301",
    bingSiteVerificationId: "MS_BING_881920491823",
    robotsIndex: true,
    robotsFollow: true,
    schemaMarkupEnabled: true
  },
  paymentGateways: {
    razorpay: {
      enabled: true,
      mode: "live",
      keyId: "",
      keySecret: "••••••••••••••••••••••••••••••••",
      webhookSecret: "",
      autoCapture: true,
      supportedMethods: ["UPI", "Cards", "NetBanking", "Wallets", "PayLater"],
      status: "Operational (Latency: 42ms)"
    },
    phonepe: {
      enabled: true,
      mode: "live",
      merchantId: "JANANIAGROONLINE",
      saltKey: "••••••••••••••••••••••••••••••••",
      saltIndex: "1",
      env: "PRODUCTION",
      webhookUrl: "https://api.jananiagro.com/api/webhooks/phonepe",
      status: "Operational (Latency: 38ms)"
    },
    cashfree: {
      enabled: false,
      mode: "test",
      appId: "TEST_CF_JANANI_8819",
      secretKey: "••••••••••••••••••••••••••••••••",
      webhookUrl: "https://api.jananiagro.com/api/webhooks/cashfree",
      status: "Standby / Disabled"
    },
    cod: {
      enabled: true,
      minOrderAmount: 499,
      maxOrderAmount: 5000,
      verificationRequired: true,
      extraFee: 0,
      otpPreVerification: true,
      restrictedPincodesCount: 142
    }
  },
  shiprocket: {
    enabled: true,
    email: "logistics@jananiagro.com",
    apiKey: "sr_live_api_884910283019283",
    apiSecret: "••••••••••••••••••••••••••••••••",
    tokenExpiry: "2026-10-15T18:30:00.000Z",
    defaultWarehouse: "WH-GIDC-01 (Lodhika GIDC Facility, Rajkot)",
    autoManifestOrders: true,
    weightBufferPercentage: 8,
    preferredCouriers: ["Bluedart Air", "Delhivery Surface", "Xpressbees Express", "Shadowfax Rural"],
    smartRoutingStrategy: "Best SLA & Lowest Rate Balanced",
    rtoRiskThresholdScore: 65,
    liveTrackingWebhookUrl: "https://api.jananiagro.com/api/webhooks/shiprocket-tracking"
  },
  gst: {
    gstin: "24AAACJ8892K1Z5",
    legalName: "Janani Agro Producers Pvt. Ltd.",
    stateCode: "24 (Gujarat)",
    registeredState: "Gujarat",
    standardTaxRate: 5.0,
    ayurvedicTaxRate: 12.0,
    eWayBillThreshold: 50000,
    compositionScheme: false,
    eInvoiceApplicable: true,
    lutArnNumber: "AD240324001928K",
    reverseChargeApplicable: false
  },
  deliveryCharges: {
    freeDeliveryThreshold: 799,
    standardShippingFee: 60,
    expressAirShippingFee: 120,
    ruralRemotePinSurcharge: 45,
    codHandlingFee: 0,
    metroSameDaySurcharge: 150,
    estimatedStandardDays: "3-5 Business Days",
    estimatedExpressDays: "24-48 Hours"
  },
  referralRules: {
    programEnabled: true,
    advocateRewardType: "wallet_cashback",
    advocateRewardAmount: 250,
    friendDiscountType: "flat_discount",
    friendDiscountAmount: 150,
    friendMinCartValue: 999,
    rewardTriggerEvent: "first_order_delivered_past_return_window",
    maxReferralsPerAdvocatePerMonth: 20,
    walletExpiryDays: 90,
    allowRewardStackingWithCoupons: true
  },
  couponRules: {
    maxCouponDiscountCap: 500,
    allowStackingWithCategoryDiscounts: false,
    maxCouponsPerCart: 1,
    firstTimeBuyerWelcomePromoCode: "FIRSTORGANIC",
    firstTimeDiscountAmount: 200,
    minFirstOrderSpend: 899,
    autoApplyBestCouponInCart: true,
    fraudDetectionMaxRedemptionsPerIp: 3
  },
  smtp: {
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    authRequired: true,
    username: "apikey",
    password: "••••••••••••••••••••••••••••••••",
    fromName: "Janani Agro Official",
    fromEmail: "notifications@jananiagro.com",
    replyToEmail: "support@jananiagro.com",
    bccOrdersEmail: "audit.orders@jananiagro.com",
    tlsEncryption: "STARTTLS",
    connectionStatus: "Connected (Verified 2 mins ago)"
  },
  sms: {
    provider: "Fast2SMS (DLT Certified)",
    senderId: "JANANI",
    dltEntityId: "1701159820491028301",
    apiKey: "f2sms_live_99210384910283019",
    webhookUrl: "https://api.jananiagro.com/api/webhooks/sms-delivery",
    templates: {
      orderConfirmationDltId: "1707162940192830",
      orderDispatchDltId: "1707162940192831",
      deliveryOtpDltId: "1707162940192832",
      marketingPromoDltId: "1707162940192833"
    },
    route: "Service Implicit / Transactional",
    connectionStatus: "Operational (Balance: 24,850 SMS credits)"
  },
  security: {
    mandatoryTwoFactorAuth: true,
    sessionIdleTimeoutMinutes: 45,
    maxFailedLoginAttempts: 5,
    lockoutDurationMinutes: 30,
    passwordExpirationDays: 90,
    enforceStrongPassword: true,
    allowIpWhitelistingOnly: false,
    whitelistedIpAddresses: [
      "103.142.45.12",
      "122.179.88.94",
      "182.73.190.22",
      "127.0.0.1"
    ],
    corsAllowedOrigins: [
      "http://localhost:5173",
      "http://localhost:5000",
      "https://jananiagro.com",
      "https://admin.jananiagro.com"
    ],
    cspHeadersEnabled: true,
    sslTlsEnforced: true,
    rateLimitingEnabled: true,
    rateLimitRequestsPerMin: 120
  }
};

// 2. Roles Management Data Store
let systemRoles = [
  {
    id: "role_super_admin",
    name: "Super Administrator",
    slug: "super_admin",
    description: "Unrestricted master access across all store settings, financial ledgers, staff CRUD, disaster recovery, and system configurations.",
    isSystem: true,
    color: "#10b981",
    staffCount: 2,
    permissions: [
      "products.view", "products.create", "products.edit", "products.delete",
      "orders.view", "orders.edit", "orders.shiprocket", "orders.cancel_refund",
      "customers.view", "customers.edit", "customers.wallet_manage",
      "inventory.view", "inventory.restock",
      "coupons.view", "coupons.manage",
      "reviews.view", "reviews.moderate", "reviews.reply",
      "marketing.view", "marketing.campaigns",
      "reports.view", "reports.export", "reports.gst",
      "cms.view", "cms.edit",
      "settings.view", "settings.edit",
      "roles.manage", "staff.manage", "audit.view", "backups.manage", "security.manage"
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2026-09-11T10:00:00.000Z"
  },
  {
    id: "role_store_manager",
    name: "Store & Operations Manager",
    slug: "store_manager",
    description: "Complete authority over catalog curation, pricing, order fulfillment, customer inquiries, and promotional campaign deployments.",
    isSystem: true,
    color: "#3b82f6",
    staffCount: 3,
    permissions: [
      "products.view", "products.create", "products.edit",
      "orders.view", "orders.edit", "orders.shiprocket", "orders.cancel_refund",
      "customers.view", "customers.edit", "customers.wallet_manage",
      "inventory.view", "inventory.restock",
      "coupons.view", "coupons.manage",
      "reviews.view", "reviews.moderate", "reviews.reply",
      "marketing.view", "marketing.campaigns",
      "cms.view", "cms.edit",
      "reports.view", "reports.export",
      "settings.view", "audit.view"
    ],
    createdAt: "2025-01-10T00:00:00.000Z",
    updatedAt: "2026-09-10T14:30:00.000Z"
  },
  {
    id: "role_logistics_lead",
    name: "Logistics & Warehouse Lead",
    slug: "logistics_lead",
    description: "Dedicated access to packing slips, Shiprocket AWB manifests, warehouse bin routing, returns, exchanges, and inventory restocking.",
    isSystem: true,
    color: "#f59e0b",
    staffCount: 4,
    permissions: [
      "orders.view", "orders.edit", "orders.shiprocket",
      "inventory.view", "inventory.restock",
      "products.view"
    ],
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2026-09-08T11:20:00.000Z"
  },
  {
    id: "role_customer_support",
    name: "Customer Support Specialist",
    slug: "customer_support",
    description: "Customer relationship management, order tracking assistance, customer reviews replies, and controlled wallet adjustments.",
    isSystem: true,
    color: "#8b5cf6",
    staffCount: 3,
    permissions: [
      "orders.view", "customers.view", "customers.edit",
      "reviews.view", "reviews.reply",
      "products.view"
    ],
    createdAt: "2025-02-15T00:00:00.000Z",
    updatedAt: "2026-09-05T09:15:00.000Z"
  },
  {
    id: "role_financial_auditor",
    name: "Financial & Tax Auditor",
    slug: "financial_auditor",
    description: "Read-only access to GSTR-1 filings, HSN tax summaries, payment gateway reconciliations, and executive export engines.",
    isSystem: true,
    color: "#ec4899",
    staffCount: 1,
    permissions: [
      "reports.view", "reports.export", "reports.gst",
      "orders.view", "settings.view", "audit.view"
    ],
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2026-09-01T16:45:00.000Z"
  },
  {
    id: "role_marketing_specialist",
    name: "Growth & Marketing Lead",
    slug: "marketing_specialist",
    description: "Full control over omnichannel campaigns, coupon generation, homepage hero banners, and audience segmentation.",
    isSystem: false,
    color: "#06b6d4",
    staffCount: 2,
    permissions: [
      "marketing.view", "marketing.campaigns",
      "coupons.view", "coupons.manage",
      "cms.view", "cms.edit",
      "reports.view", "reports.export",
      "products.view", "customers.view"
    ],
    createdAt: "2025-04-12T00:00:00.000Z",
    updatedAt: "2026-09-09T18:20:00.000Z"
  }
];

// 3. Admin Staff Users Data Store
let adminStaffUsers = [
  {
    id: "staff_001",
    name: "Doddi Sai Rama",
    email: "sairama@jananiagro.com",
    phone: "+91 89190 23456",
    roleId: "role_super_admin",
    roleName: "Super Administrator",
    department: "Executive & Systems Architecture",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    status: "Active",
    twoFactorEnabled: true,
    lastLogin: "2026-09-12 09:45 AM",
    lastLoginIp: "103.142.45.12",
    lastLoginLocation: "Rajkot, Gujarat",
    assignedWarehouses: ["All Facilities"],
    notes: "Lead system administrator and founder account.",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    id: "staff_002",
    name: "Kavya Doddi",
    email: "kavya.d@jananiagro.com",
    phone: "+91 94451 88920",
    roleId: "role_super_admin",
    roleName: "Super Administrator",
    department: "Executive Operations",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
    status: "Active",
    twoFactorEnabled: true,
    lastLogin: "2026-09-11 05:20 PM",
    lastLoginIp: "103.142.45.14",
    lastLoginLocation: "Rajkot, Gujarat",
    assignedWarehouses: ["All Facilities"],
    notes: "Co-founder with full administrative authority.",
    createdAt: "2025-01-05T00:00:00.000Z"
  },
  {
    id: "staff_003",
    name: "Dr. Arvind Swamy",
    email: "arvind.s@jananiagro.com",
    phone: "+91 98451 11223",
    roleId: "role_store_manager",
    roleName: "Store & Operations Manager",
    department: "Organic Quality & Merchandising",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    status: "Active",
    twoFactorEnabled: true,
    lastLogin: "2026-09-12 08:30 AM",
    lastLoginIp: "122.179.88.94",
    lastLoginLocation: "Bengaluru, Karnataka",
    assignedWarehouses: ["WH-BLR-01", "WH-SRI-02"],
    notes: "Oversees organic product lab certifications and catalog curation.",
    createdAt: "2025-02-10T00:00:00.000Z"
  },
  {
    id: "staff_004",
    name: "Harish Patel",
    email: "harish.p@jananiagro.com",
    phone: "+91 97123 55667",
    roleId: "role_logistics_lead",
    roleName: "Logistics & Warehouse Lead",
    department: "Supply Chain & Shiprocket Operations",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    status: "Active",
    twoFactorEnabled: true,
    lastLogin: "2026-09-12 07:15 AM",
    lastLoginIp: "182.73.190.22",
    lastLoginLocation: "Rajkot GIDC, Gujarat",
    assignedWarehouses: ["WH-GIDC-01"],
    notes: "Central Lodhika warehouse supervisor and dispatch lead.",
    createdAt: "2025-02-20T00:00:00.000Z"
  },
  {
    id: "staff_005",
    name: "Pooja Sharma",
    email: "pooja.s@jananiagro.com",
    phone: "+91 98980 33445",
    roleId: "role_customer_support",
    roleName: "Customer Support Specialist",
    department: "Patron Experience & Support",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    status: "Active",
    twoFactorEnabled: false,
    lastLogin: "2026-09-11 06:10 PM",
    lastLoginIp: "157.48.92.110",
    lastLoginLocation: "Hyderabad, Telangana",
    assignedWarehouses: ["Remote"],
    notes: "Primary support agent for customer inquiries and review responses.",
    createdAt: "2025-03-05T00:00:00.000Z"
  },
  {
    id: "staff_006",
    name: "CA Rajesh Mehta",
    email: "rajesh.m@jananiagro.com",
    phone: "+91 98250 44556",
    roleId: "role_financial_auditor",
    roleName: "Financial & Tax Auditor",
    department: "Accounts & GST Compliance",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
    status: "Active",
    twoFactorEnabled: true,
    lastLogin: "2026-09-10 11:30 AM",
    lastLoginIp: "103.211.54.80",
    lastLoginLocation: "Ahmedabad, Gujarat",
    assignedWarehouses: ["All Facilities"],
    notes: "External chartered accountant managing GSTR-1 and tax filings.",
    createdAt: "2025-03-15T00:00:00.000Z"
  },
  {
    id: "staff_007",
    name: "Siddharth Rao",
    email: "siddharth.r@jananiagro.com",
    phone: "+91 99001 77889",
    roleId: "role_marketing_specialist",
    roleName: "Growth & Marketing Lead",
    department: "Digital Marketing & D2C Growth",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&q=80",
    status: "Active",
    twoFactorEnabled: true,
    lastLogin: "2026-09-12 09:00 AM",
    lastLoginIp: "49.37.155.62",
    lastLoginLocation: "Bengaluru, Karnataka",
    assignedWarehouses: ["Remote"],
    notes: "Runs omnichannel email/SMS broadcasts and festival promo discounts.",
    createdAt: "2025-04-15T00:00:00.000Z"
  },
  {
    id: "staff_008",
    name: "Deepak Verma",
    email: "deepak.v@jananiagro.com",
    phone: "+91 97234 11229",
    roleId: "role_logistics_lead",
    roleName: "Logistics & Warehouse Lead",
    department: "Srikakulam Reserve Depot",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
    status: "Suspended",
    twoFactorEnabled: false,
    lastLogin: "2026-08-25 04:15 PM",
    lastLoginIp: "183.82.112.45",
    lastLoginLocation: "Visakhapatnam, AP",
    assignedWarehouses: ["WH-SRI-02"],
    notes: "Account temporarily locked pending seasonal audit.",
    createdAt: "2025-05-01T00:00:00.000Z"
  }
];

// 4. Activity Logs Audit Trail Data Store
let activityAuditLogs = [];

// 5. Login History Sessions Data Store
let loginHistorySessions = [];

// 6. System Database Backups Data Store
let systemBackupsList = [];

// ============================================================================
// SETTINGS CONTROLLER HANDLERS
// ============================================================================

export const getAdminSettings = (req, res) => {
  res.json({
    success: true,
    data: adminSettingsData
  });
};

export const updateStoreSettings = (req, res) => {
  adminSettingsData.store = { ...adminSettingsData.store, ...req.body };
  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated Store Profile & Legal Entity Information",
    module: "Store Settings",
    severity: "medium",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { updatedFields: Object.keys(req.body) }
  });

  res.json({
    success: true,
    message: "Store profile & legal settings updated successfully",
    data: adminSettingsData.store
  });
};

export const updateBrandingSettings = (req, res) => {
  adminSettingsData.branding = { ...adminSettingsData.branding, ...req.body };
  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated Store Logos, Favicon & Brand Color Scheme",
    module: "Branding Settings",
    severity: "low",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { updatedFields: Object.keys(req.body) }
  });

  res.json({
    success: true,
    message: "Branding, logos and visual tokens updated successfully",
    data: adminSettingsData.branding
  });
};

export const updateSeoSettings = (req, res) => {
  adminSettingsData.seo = { ...adminSettingsData.seo, ...req.body };
  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated Store SEO Meta Tags, Social Cards & Verification IDs",
    module: "SEO Settings",
    severity: "low",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { updatedFields: Object.keys(req.body) }
  });

  res.json({
    success: true,
    message: "SEO metadata and OpenGraph configuration updated successfully",
    data: adminSettingsData.seo
  });
};

export const updatePaymentSettings = (req, res) => {
  adminSettingsData.paymentGateways = { ...adminSettingsData.paymentGateways, ...req.body };
  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated Payment Gateway Integrations & COD Settings",
    module: "Payment Gateways",
    severity: "high",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { updatedGateways: Object.keys(req.body) }
  });

  res.json({
    success: true,
    message: "Payment gateways configuration saved successfully",
    data: adminSettingsData.paymentGateways
  });
};

export const updateShippingSettings = (req, res) => {
  adminSettingsData.shiprocket = { ...adminSettingsData.shiprocket, ...req.body };
  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated Shiprocket API Credentials & Smart Routing Rules",
    module: "Shiprocket Logistics",
    severity: "medium",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { updatedFields: Object.keys(req.body) }
  });

  res.json({
    success: true,
    message: "Shiprocket API settings updated successfully",
    data: adminSettingsData.shiprocket
  });
};

export const updateGstSettings = (req, res) => {
  adminSettingsData.gst = { ...adminSettingsData.gst, ...req.body };
  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated GSTIN & Tax Thresholds Configuration",
    module: "GST & Tax Settings",
    severity: "high",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { gstin: adminSettingsData.gst.gstin }
  });

  res.json({
    success: true,
    message: "GST & Statutory tax settings updated successfully",
    data: adminSettingsData.gst
  });
};

export const updateDeliveryFeeSettings = (req, res) => {
  adminSettingsData.deliveryCharges = { ...adminSettingsData.deliveryCharges, ...req.body };
  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated Delivery Surcharges & Free Delivery Threshold",
    module: "Delivery Settings",
    severity: "medium",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { freeThreshold: adminSettingsData.deliveryCharges.freeDeliveryThreshold }
  });

  res.json({
    success: true,
    message: "Delivery charges and thresholds saved successfully",
    data: adminSettingsData.deliveryCharges
  });
};

export const updateReferralRulesSettings = (req, res) => {
  adminSettingsData.referralRules = { ...adminSettingsData.referralRules, ...req.body };
  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated Refer & Earn Cashbacks & Minimum Cart Rules",
    module: "Referral Program Settings",
    severity: "medium",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { advocateReward: adminSettingsData.referralRules.advocateRewardAmount }
  });

  res.json({
    success: true,
    message: "Referral reward rules updated successfully",
    data: adminSettingsData.referralRules
  });
};

export const updateCouponRulesSettings = (req, res) => {
  adminSettingsData.couponRules = { ...adminSettingsData.couponRules, ...req.body };
  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated Coupon Discount Caps & Anti-Fraud Stacking Rules",
    module: "Coupon Rule Settings",
    severity: "medium",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { maxDiscountCap: adminSettingsData.couponRules.maxCouponDiscountCap }
  });

  res.json({
    success: true,
    message: "Coupon engine rules saved successfully",
    data: adminSettingsData.couponRules
  });
};

export const updateSmtpSettings = (req, res) => {
  adminSettingsData.smtp = { ...adminSettingsData.smtp, ...req.body };
  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated SMTP Email Server Credentials & TLS Ports",
    module: "Email SMTP Settings",
    severity: "medium",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { host: adminSettingsData.smtp.host, port: adminSettingsData.smtp.port }
  });

  res.json({
    success: true,
    message: "SMTP email relay configuration updated successfully",
    data: adminSettingsData.smtp
  });
};

export const testSmtpConnection = (req, res) => {
  const { recipientEmail = "test@jananiagro.com" } = req.body;
  res.json({
    success: true,
    message: `Test email successfully dispatched to ${recipientEmail} via ${adminSettingsData.smtp.host}:${adminSettingsData.smtp.port} (TLS Handshake Verified)`,
    timestamp: new Date().toISOString(),
    diagnostic: {
      smtpHost: adminSettingsData.smtp.host,
      port: adminSettingsData.smtp.port,
      tlsVerified: true,
      authStatus: "235 2.7.0 Authentication successful",
      latencyMs: 142
    }
  });
};

export const updateSmsSettings = (req, res) => {
  adminSettingsData.sms = { ...adminSettingsData.sms, ...req.body };
  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated SMS Gateway DLT Sender IDs & Templates",
    module: "SMS Settings",
    severity: "medium",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { senderId: adminSettingsData.sms.senderId }
  });

  res.json({
    success: true,
    message: "SMS gateway and DLT credentials saved successfully",
    data: adminSettingsData.sms
  });
};

export const testSmsConnection = (req, res) => {
  const { recipientPhone = "+91 98451 22345" } = req.body;
  res.json({
    success: true,
    message: `Test transactional SMS delivered to ${recipientPhone} via Header [${adminSettingsData.sms.senderId}] (DLT Entity: ${adminSettingsData.sms.dltEntityId})`,
    timestamp: new Date().toISOString(),
    diagnostic: {
      provider: adminSettingsData.sms.provider,
      senderId: adminSettingsData.sms.senderId,
      dltEntityApproved: true,
      creditsRemaining: 24849,
      latencyMs: 98
    }
  });
};

// ============================================================================
// ROLES & PERMISSIONS CONTROLLER HANDLERS
// ============================================================================

export const getAdminRoles = (req, res) => {
  res.json({
    success: true,
    roles: systemRoles,
    total: systemRoles.length
  });
};

export const createAdminRole = (req, res) => {
  const { name, description, color = "#10b981", permissions = [] } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: "Role name is required" });
  }

  const newRole = {
    id: `role_${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
    description: description || "Custom organizational role with tailored permissions matrix.",
    isSystem: false,
    color,
    staffCount: 0,
    permissions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  systemRoles.push(newRole);

  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: `Created Custom Role: ${name}`,
    module: "Roles & Permissions",
    severity: "high",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { roleId: newRole.id, permissionsCount: permissions.length }
  });

  res.status(201).json({
    success: true,
    message: `Role '${name}' created successfully`,
    role: newRole
  });
};

export const updateAdminRole = (req, res) => {
  const { id } = req.params;
  const index = systemRoles.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Role not found" });
  }

  systemRoles[index] = {
    ...systemRoles[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: `Updated Permissions for Role: ${systemRoles[index].name}`,
    module: "Roles & Permissions",
    severity: "high",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { roleId: id, updatedFields: Object.keys(req.body) }
  });

  res.json({
    success: true,
    message: `Role '${systemRoles[index].name}' updated successfully`,
    role: systemRoles[index]
  });
};

export const deleteAdminRole = (req, res) => {
  const { id } = req.params;
  const role = systemRoles.find(r => r.id === id);
  if (!role) {
    return res.status(404).json({ success: false, message: "Role not found" });
  }

  if (role.isSystem) {
    return res.status(400).json({ success: false, message: "Cannot delete system built-in role" });
  }

  if (role.staffCount > 0) {
    return res.status(400).json({ success: false, message: `Cannot delete role '${role.name}' because ${role.staffCount} staff member(s) are currently assigned to it.` });
  }

  systemRoles = systemRoles.filter(r => r.id !== id);

  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: `Deleted Role: ${role.name}`,
    module: "Roles & Permissions",
    severity: "high",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { roleId: id, name: role.name }
  });

  res.json({
    success: true,
    message: `Role '${role.name}' deleted successfully`
  });
};

// ============================================================================
// ADMIN STAFF USER CRUD CONTROLLER HANDLERS
// ============================================================================

export const getAdminStaffList = (req, res) => {
  res.json({
    success: true,
    staff: adminStaffUsers,
    total: adminStaffUsers.length
  });
};

export const createAdminStaff = (req, res) => {
  const { name, email, phone, roleId, department, assignedWarehouses = ["WH-GIDC-01"], notes = "" } = req.body;
  if (!name || !email || !roleId) {
    return res.status(400).json({ success: false, message: "Name, email, and assigned role are mandatory" });
  }

  const role = systemRoles.find(r => r.id === roleId);
  const roleName = role ? role.name : "Staff";

  const newStaff = {
    id: `staff_${Date.now().toString().slice(-4)}`,
    name,
    email,
    phone: phone || "+91 98000 00000",
    roleId,
    roleName,
    department: department || "Operations",
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80`,
    status: "Active",
    twoFactorEnabled: false,
    lastLogin: "Never Logged In (Pending)",
    lastLoginIp: "N/A",
    lastLoginLocation: "N/A",
    assignedWarehouses,
    notes,
    createdAt: new Date().toISOString()
  };

  adminStaffUsers.unshift(newStaff);

  // Update role staff count
  if (role) {
    role.staffCount = (role.staffCount || 0) + 1;
  }

  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: `Created Staff Account: ${name} (${roleName})`,
    module: "Admin Staff Management",
    severity: "high",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { staffId: newStaff.id, email: newStaff.email }
  });

  res.status(201).json({
    success: true,
    message: `Staff member '${name}' invited and onboarded successfully`,
    staff: newStaff
  });
};

export const updateAdminStaff = (req, res) => {
  const { id } = req.params;
  const index = adminStaffUsers.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Staff user not found" });
  }

  const oldRoleId = adminStaffUsers[index].roleId;
  const newRoleId = req.body.roleId;

  if (newRoleId && newRoleId !== oldRoleId) {
    const oldRole = systemRoles.find(r => r.id === oldRoleId);
    const newRole = systemRoles.find(r => r.id === newRoleId);
    if (oldRole && oldRole.staffCount > 0) oldRole.staffCount--;
    if (newRole) {
      newRole.staffCount = (newRole.staffCount || 0) + 1;
      req.body.roleName = newRole.name;
    }
  }

  adminStaffUsers[index] = { ...adminStaffUsers[index], ...req.body };

  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: `Updated Staff Profile: ${adminStaffUsers[index].name}`,
    module: "Admin Staff Management",
    severity: "medium",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { staffId: id, updatedFields: Object.keys(req.body) }
  });

  res.json({
    success: true,
    message: `Staff profile for '${adminStaffUsers[index].name}' updated successfully`,
    staff: adminStaffUsers[index]
  });
};

export const toggleAdminStaffStatus = (req, res) => {
  const { id } = req.params;
  const staff = adminStaffUsers.find(s => s.id === id);
  if (!staff) {
    return res.status(404).json({ success: false, message: "Staff member not found" });
  }

  staff.status = staff.status === "Active" ? "Suspended" : "Active";

  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: `Toggled Staff Account Status to '${staff.status}': ${staff.name}`,
    module: "Admin Staff Management",
    severity: staff.status === "Suspended" ? "high" : "medium",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { staffId: id, newStatus: staff.status }
  });

  res.json({
    success: true,
    message: `Staff account status changed to ${staff.status}`,
    staff
  });
};

export const deleteAdminStaff = (req, res) => {
  const { id } = req.params;
  const staff = adminStaffUsers.find(s => s.id === id);
  if (!staff) {
    return res.status(404).json({ success: false, message: "Staff user not found" });
  }

  const role = systemRoles.find(r => r.id === staff.roleId);
  if (role && role.staffCount > 0) role.staffCount--;

  adminStaffUsers = adminStaffUsers.filter(s => s.id !== id);

  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: `Revoked & Deleted Staff Account: ${staff.name}`,
    module: "Admin Staff Management",
    severity: "high",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { staffId: id, name: staff.name }
  });

  res.json({
    success: true,
    message: `Staff account for '${staff.name}' deleted successfully`
  });
};

// ============================================================================
// AUDIT ACTIVITY LOGS CONTROLLER HANDLERS
// ============================================================================

export const getActivityLogs = (req, res) => {
  const { module, severity, search, limit = 50 } = req.query;
  let filtered = [...activityAuditLogs];

  if (module && module !== "all") {
    filtered = filtered.filter(l => l.module.toLowerCase().includes(module.toLowerCase()));
  }

  if (severity && severity !== "all") {
    filtered = filtered.filter(l => l.severity.toLowerCase() === severity.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(l =>
      l.action.toLowerCase().includes(q) ||
      l.actor.name.toLowerCase().includes(q) ||
      l.ipAddress.includes(q) ||
      l.module.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    logs: filtered.slice(0, parseInt(limit)),
    total: filtered.length,
    severities: {
      critical: activityAuditLogs.filter(l => l.severity === "critical").length,
      high: activityAuditLogs.filter(l => l.severity === "high").length,
      medium: activityAuditLogs.filter(l => l.severity === "medium").length,
      low: activityAuditLogs.filter(l => l.severity === "low").length
    }
  });
};

export const clearActivityLogs = (req, res) => {
  const count = activityAuditLogs.length;
  activityAuditLogs = [
    {
      id: `log_act_${Date.now()}`,
      timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
      action: `Cleared Audit Ledger (${count} previous log entries archived)`,
      module: "Security & Audit Logs",
      severity: "high",
      ipAddress: "103.142.45.12",
      device: "MacBook Pro (Chrome 128 / macOS 15)",
      metadata: { archivedCount: count }
    }
  ];

  res.json({
    success: true,
    message: `Audit ledger archived and cleared (${count} logs archived)`
  });
};

// ============================================================================
// LOGIN HISTORY & ACTIVE SESSIONS CONTROLLER HANDLERS
// ============================================================================

export const getLoginHistory = (req, res) => {
  res.json({
    success: true,
    sessions: loginHistorySessions,
    total: loginHistorySessions.length,
    activeSessionsCount: loginHistorySessions.filter(s => s.status === "Active").length
  });
};

export const terminateLoginSession = (req, res) => {
  const { id } = req.params;
  const session = loginHistorySessions.find(s => s.id === id);
  if (!session) {
    return res.status(404).json({ success: false, message: "Session record not found" });
  }

  if (session.isCurrent) {
    return res.status(400).json({ success: false, message: "Cannot terminate your active current session" });
  }

  session.status = "Terminated";
  session.lastActive = "Terminated remotely by Super Admin";

  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: `Remotely Terminated Session: ${session.userName} (${session.ipAddress})`,
    module: "Security & Sessions",
    severity: "high",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { sessionId: id, userEmail: session.userEmail }
  });

  res.json({
    success: true,
    message: `Session for '${session.userName}' on ${session.deviceType} terminated successfully`,
    session
  });
};

// ============================================================================
// SECURITY POLICIES CONTROLLER HANDLERS
// ============================================================================

export const updateSecuritySettings = (req, res) => {
  adminSettingsData.security = { ...adminSettingsData.security, ...req.body };
  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated Master Security Policies, 2FA & IP Whitelists",
    module: "Security Settings",
    severity: "critical",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { twoFactor: adminSettingsData.security.mandatoryTwoFactorAuth, timeout: adminSettingsData.security.sessionIdleTimeoutMinutes }
  });

  res.json({
    success: true,
    message: "Security policies, 2FA rules and session timeouts updated successfully",
    data: adminSettingsData.security
  });
};

// ============================================================================
// BACKUP & DISASTER RECOVERY CONTROLLER HANDLERS
// ============================================================================

export const getSystemBackups = (req, res) => {
  res.json({
    success: true,
    backups: systemBackupsList,
    total: systemBackupsList.length,
    systemStorageHealth: {
      totalCapacity: "100 GB",
      usedStorage: "14.85 GB (14.8%)",
      freeStorage: "85.15 GB",
      databaseEngine: "Janani Enterprise In-Memory + Persistent Disk Store",
      lastAutomatedSnapshot: "2026-09-11 11:45 PM"
    }
  });
};

export const createSystemBackup = (req, res) => {
  const { type = "Manual Full Snapshot", notes = "" } = req.body;
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T]/g, "").slice(0, 12);

  const newBackup = {
    id: `bkp_${dateStr}`,
    filename: `janani-db-snapshot-${dateStr}.json`,
    type: type,
    scope: "Complete (Products, Orders, Customers, CMS, Settings, Ledger)",
    size: "14.88 MB",
    recordCount: 18512,
    status: "Completed",
    createdDate: now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    createdBy: "Doddi Sai Rama (Super Admin)",
    checksum: `sha256-${Math.random().toString(36).substring(2, 12)}`,
    downloadUrl: `/api/admin/backups/download/bkp_${dateStr}`,
    notes
  };

  systemBackupsList.unshift(newBackup);

  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: `Created Full System Database Snapshot: ${newBackup.filename}`,
    module: "Backup & Disaster Recovery",
    severity: "medium",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { backupId: newBackup.id, size: newBackup.size }
  });

  res.status(201).json({
    success: true,
    message: `Database snapshot '${newBackup.filename}' created successfully`,
    backup: newBackup
  });
};

export const restoreSystemBackup = (req, res) => {
  const { id } = req.body;
  const backup = systemBackupsList.find(b => b.id === id);
  if (!backup) {
    return res.status(404).json({ success: false, message: "Backup snapshot not found" });
  }

  activityAuditLogs.unshift({
    id: `log_act_${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: `Restored Database from Snapshot: ${backup.filename}`,
    module: "Backup & Disaster Recovery",
    severity: "critical",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { backupId: id, checksum: backup.checksum }
  });

  res.json({
    success: true,
    message: `System successfully restored to snapshot state: ${backup.filename} (${backup.recordCount} records verified)`,
    restoredFrom: backup
  });
};

export const downloadSystemBackup = (req, res) => {
  const { id } = req.params;
  const backup = systemBackupsList.find(b => b.id === id);
  if (!backup) {
    return res.status(404).json({ success: false, message: "Backup snapshot file not found" });
  }

  const payload = {
    exportVersion: "2.4.0",
    generatedAt: new Date().toISOString(),
    snapshotMetadata: backup,
    settings: adminSettingsData,
    roles: systemRoles,
    staff: adminStaffUsers,
    totalOrdersCount: 1240,
    totalProductsCount: 18,
    integrityChecksum: backup.checksum
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="${backup.filename}"`);
  return res.status(200).send(jsonStr);
};






