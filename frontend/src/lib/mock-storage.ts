/**
 * Centralized Mock Storage & Persistence Engine for JANANI AGRO PRODUCTS
 * Enables 100% full dynamic functionality, CRUD operations, and data persistence
 * on static/serverless live hosting (Hostinger Shared Hosting, etc.) without requiring
 * an active Node.js server.
 */

import { products as catalogProducts, categories as catalogCategories, pantryImage, productsImage, storyImage } from "./catalog";

// Storage Keys
export const STORAGE_KEYS = {
  PRODUCTS: "janani_admin_products",
  CATEGORIES: "janani_admin_categories",
  ORDERS: "janani_admin_orders",
  CUSTOMERS: "janani_admin_customers",
  COUPONS: "janani_admin_coupons",
  CMS: "janani_admin_cms",
  SETTINGS: "janani_admin_settings",
  STAFF: "janani_admin_staff",
  ROLES: "janani_admin_roles",
  PAYMENTS: "janani_admin_payments",
  SETTLEMENTS: "janani_admin_settlements",
  FAILED_PAYMENTS: "janani_admin_failed_payments",
  REVIEWS: "janani_admin_reviews",
  BACKUPS: "janani_admin_backups",
  AUDIT_LOGS: "janani_admin_audit_logs",
  LOGIN_SESSIONS: "janani_admin_login_sessions",
  INQUIRIES: "janani_admin_inquiries",
  SUBSCRIBERS: "janani_admin_subscribers",
  USERS: "janani_registered_users",
  CART: "janani_cart",
  WISHLIST: "janani_wishlist"
};

// Safe localStorage accessor
export function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`[mock-storage] Error reading ${key}, using fallback:`, e);
    return fallback;
  }
}

export function setStored<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[mock-storage] Error saving ${key}:`, e);
  }
}

// ==========================================
// 1. DEFAULT SEED DATA
// ==========================================

export const DEFAULT_PRODUCTS = catalogProducts.map((p, idx) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  category: p.category,
  brand: p.brand,
  price: p.price,
  oldPrice: p.oldPrice,
  stock: p.stockCount || 50,
  sku: `JAN-${p.category.substring(0, 3).toUpperCase()}-${String(p.id).padStart(3, "0")}`,
  unit: p.unit,
  rating: p.rating,
  reviewsCount: p.reviews,
  status: "Active",
  active: true,
  featured: idx < 6,
  trending: idx % 3 === 0,
  isNewArrival: idx % 4 === 0,
  image: p.image,
  description: p.description,
  origin: p.origin,
  certification: "Certified Organic & NPOP Verified",
  variants: p.variants,
  createdAt: "2026-08-15"
}));

export const DEFAULT_CATEGORIES = catalogCategories.map((c, idx) => ({
  id: `cat-${c.id}`,
  name: c.name,
  slug: c.slug,
  parentId: null,
  level: "root" as const,
  description: c.description || `Pure, unadulterated ${c.name.toLowerCase()} sourced from verified heritage organic farms.`,
  icon: idx % 2 === 0 ? "Droplet" : "Wheat",
  image: idx % 2 === 0 ? pantryImage : productsImage,
  bannerImage: storyImage,
  featured: true,
  trending: idx < 4,
  active: true,
  orderIndex: idx + 1,
  productsCount: c.count || 4,
  deletedAt: null,
  seo: {
    metaTitle: `${c.name} — 100% Pure Organic | Janani Agro`,
    metaDescription: `Shop certified unpolished ${c.name.toLowerCase()} direct from Indian organic farms.`,
    metaKeywords: `organic, ${c.name.toLowerCase()}, farm fresh, pure, janani agro`,
    canonicalUrl: `https://jananiagro.com/categories/${c.slug}`,
    ogImage: "/assets/janani-pantry.jpg"
  },
  createdAt: "2026-08-01"
}));

export const DEFAULT_ORDERS = [
  {
    id: "ORD-94812",
    number: "JAP-94812",
    date: "2026-09-15 10:45 AM",
    orderStatus: "Delivered",
    status: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "UPI (PhonePe)",
    paymentGatewayId: "pay_NL8820491823",
    customer: {
      id: "CUST-001",
      name: "Ramesh Patel",
      email: "ramesh.patel@gmail.com",
      phone: "+91 98251 22345",
      tier: "Progressive Farmer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80"
    },
    shippingAddress: {
      name: "Ramesh Patel",
      street: "Farm Plot 42, Lodhika-Shapar Road, Near Kisan Seva Kendra",
      city: "Rajkot",
      state: "Gujarat",
      pincode: "360024",
      country: "India",
      phone: "+91 98251 22345"
    },
    items: [
      { id: 1, title: "Harit (1 L) — Trichoderma Viride Liquid Biofungicide", name: "Harit (1 L) — Trichoderma Viride Liquid Biofungicide", price: 450, qty: 2, quantity: 2, image: "/products/harit.jpg", subtotal: 900 },
      { id: 2, title: "Bhumi Shakti (1 L) — Humic & Fulvic Soil Conditioner", name: "Bhumi Shakti (1 L) — Humic & Fulvic Soil Conditioner", price: 380, qty: 2, quantity: 2, image: "/products/bhumi-shakti.jpg", subtotal: 760 },
      { id: 3, title: "Neem Oil 1000 PPM (1 L) — Botanical Pest Shield", name: "Neem Oil 1000 PPM (1 L) — Botanical Pest Shield", price: 680, qty: 1, quantity: 1, image: "/products/neem-oil.jpg", subtotal: 680 }
    ],
    subtotal: 2340,
    discount: 150,
    couponCode: "KISAN20",
    deliveryFee: 0,
    shippingFee: 0,
    total: 2190,
    warehouse: "Lodhika GIDC Central Facility, Rajkot",
    courier: "Delhivery Air Express",
    trackingId: "DEL-884910291",
    awb: "DEL-884910291",
    timeline: [
      { status: "Order Confirmed & Paid via Razorpay", title: "Order Confirmed", time: "2026-09-15 10:45 AM", done: true },
      { status: "Quality Inspected & Nitrogen Sealed", title: "Packed", time: "2026-09-15 02:30 PM", done: true },
      { status: "Dispatched via Delhivery Express", title: "Dispatched", time: "2026-09-16 08:00 AM", done: true },
      { status: "Delivered to Customer Doorstep", title: "Delivered", time: "2026-09-17 01:15 PM", done: true }
    ]
  },
  {
    id: "ORD-94811",
    number: "JAP-94811",
    date: "2026-09-16 03:20 PM",
    orderStatus: "Shipped",
    status: "Shipped",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card (HDFC)",
    paymentGatewayId: "pay_NL7739182301",
    customer: {
      id: "CUST-002",
      name: "Suresh Reddy",
      email: "suresh.reddy@gmail.com",
      phone: "+91 94401 89123",
      tier: "Chilli Farm Specialist",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"
    },
    shippingAddress: {
      name: "Suresh Reddy",
      street: "Plot 18, Amaravathi Agricultural Zone, Main Road",
      city: "Guntur",
      state: "Andhra Pradesh",
      pincode: "522002",
      country: "India",
      phone: "+91 94401 89123"
    },
    items: [
      { id: 6, title: "Dharani (1 L) — Root Growth Promoter & Biofertilizer", name: "Dharani (1 L) — Root Growth Promoter & Biofertilizer", price: 390, qty: 3, quantity: 3, image: "/products/dharani.jpg", subtotal: 1170 },
      { id: 4, title: "Pushkal (1 L) — Micronutrients & Seaweed Bio-Stimulant", name: "Pushkal (1 L) — Micronutrients & Seaweed Bio-Stimulant", price: 520, qty: 2, quantity: 2, image: "/products/pushkal.jpg", subtotal: 1040 }
    ],
    subtotal: 2210,
    discount: 100,
    deliveryFee: 0,
    total: 2110,
    warehouse: "Rajkot Central Formulation Facility",
    courier: "Delhivery Air Express",
    trackingId: "DEL-8492048194",
    awb: "DEL-8492048194",
    timeline: [
      { status: "Order Placed & Verified", title: "Order Confirmed", time: "2026-09-16 03:20 PM", done: true },
      { status: "Dispatched from Sorting Facility", title: "Dispatched", time: "2026-09-17 09:30 AM", done: true },
      { status: "Out for Delivery to Farm Hub", title: "In Transit", time: "Expected 18 Sep", done: false }
    ]
  },
  {
    id: "ORD-94810",
    number: "JAP-94810",
    date: "2026-09-17 11:10 AM",
    orderStatus: "Processing",
    status: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "UPI (Google Pay)",
    paymentGatewayId: "pay_NL6655221190",
    customer: {
      id: "CUST-003",
      name: "Balram Choudhary",
      email: "balram.agro@outlook.com",
      phone: "+91 98410 44231",
      tier: "Cotton & Soybean Grower",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80"
    },
    shippingAddress: {
      name: "Balram Choudhary",
      street: "14/2, Krishi Mandi Road, Opp. APMC Yard",
      city: "Ujjain",
      state: "Madhya Pradesh",
      pincode: "456001",
      country: "India",
      phone: "+91 98410 44231"
    },
    items: [
      { id: 7, title: "Balavan (1 L) — Botanical Crop Shield & Biofungicide", name: "Balavan (1 L) — Botanical Crop Shield & Biofungicide", price: 480, qty: 2, quantity: 2, image: "/products/balavan.jpg", subtotal: 960 },
      { id: 5, title: "Annada (1 L) — Organic Crop Booster Formulation", name: "Annada (1 L) — Organic Crop Booster Formulation", price: 575, qty: 1, quantity: 1, image: "/products/annada.jpg", subtotal: 575 }
    ],
    subtotal: 1535,
    discount: 50,
    deliveryFee: 0,
    total: 1485,
    warehouse: "Lodhika GIDC Central Facility, Rajkot",
    courier: "Delhivery Surface Logistics",
    trackingId: "SFX-MP-99201",
    awb: "SFX-MP-99201",
    timeline: [
      { status: "Order Confirmed & Paid", title: "Order Confirmed", time: "2026-09-17 11:10 AM", done: true },
      { status: "Nitrogen Flushing & Packaging", title: "Processing", time: "In Progress", done: true }
    ]
  },
  {
    id: "ORD-94809",
    number: "JAP-94809",
    date: "2026-09-17 01:45 PM",
    orderStatus: "Pending",
    status: "Pending",
    paymentStatus: "Pending (COD)",
    paymentMethod: "Cash on Delivery",
    paymentGatewayId: "cod_pending",
    customer: {
      id: "CUST-004",
      name: "Venkatesh Rao",
      email: "venkatesh.farm@gmail.com",
      phone: "+91 98251 10928",
      tier: "Paddy Farmer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80"
    },
    shippingAddress: {
      name: "Venkatesh Rao",
      street: "H.No 4-92, Rythu Bharosa Road, Kazipet",
      city: "Warangal",
      state: "Telangana",
      pincode: "506003",
      country: "India",
      phone: "+91 98251 10928"
    },
    items: [
      { id: 1, title: "Harit (5 L Can) — Trichoderma Viride Liquid Biofungicide", name: "Harit (5 L Can) — Trichoderma Viride Liquid Biofungicide", price: 2000, qty: 1, quantity: 1, image: "/products/harit.jpg", subtotal: 2000 }
    ],
    subtotal: 2000,
    discount: 0,
    deliveryFee: 0,
    total: 2000,
    warehouse: "Lodhika GIDC Central Facility, Rajkot",
    courier: "Delhivery Surface Logistics",
    trackingId: "",
    awb: "",
    timeline: [
      { status: "COD Order Placed — Pending Logistics Dispatch", title: "Pending", time: "2026-09-17 01:45 PM", done: true }
    ]
  }
];

export const DEFAULT_CUSTOMERS = [
  {
    id: "CUST-KAMESWARI",
    name: "Kameswari Pachipulusu",
    email: "kameswarip98@gmail.com",
    phone: "+91 98480 22338",
    tier: "Silver Member",
    status: "Active",
    ordersCount: 1,
    totalSpent: 930,
    walletBalance: 250,
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    joinedDate: "2026-10-13",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Kameswari%20Pachipulusu"
  },
  {
    id: "CUST-001",
    name: "Ananya Sharma",
    email: "ananya.s@gmail.com",
    phone: "+91 98451 22345",
    tier: "Platinum Gold",
    status: "Active",
    ordersCount: 14,
    totalSpent: 28450,
    walletBalance: 850,
    city: "Bengaluru",
    state: "Karnataka",
    joinedDate: "2025-11-12",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80"
  },
  {
    id: "CUST-002",
    name: "Suresh Patwardhan",
    email: "suresh.p@yahoo.co.in",
    phone: "+91 94220 89123",
    tier: "Silver Patron",
    status: "Active",
    ordersCount: 6,
    totalSpent: 9800,
    walletBalance: 150,
    city: "Pune",
    state: "Maharashtra",
    joinedDate: "2026-01-20",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"
  },
  {
    id: "CUST-003",
    name: "Kavitha Ranganathan",
    email: "kavitha.r@outlook.com",
    phone: "+91 98410 44231",
    tier: "Gold Harvest Member",
    status: "Active",
    ordersCount: 9,
    totalSpent: 16420,
    walletBalance: 420,
    city: "Chennai",
    state: "Tamil Nadu",
    joinedDate: "2025-12-04",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80"
  },
  {
    id: "CUST-004",
    name: "Rameshwar Patel",
    email: "ramesh.patel@gmail.com",
    phone: "+91 98251 10928",
    tier: "New Harvest Patron",
    status: "Active",
    ordersCount: 2,
    totalSpent: 1696,
    walletBalance: 50,
    city: "Rajkot",
    state: "Gujarat",
    joinedDate: "2026-09-01",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80"
  }
];

export const DEFAULT_COUPONS = [
  {
    id: "CPN-01",
    code: "JANANI10",
    title: "10% Off Storewide",
    description: "Save 10% on your entire basket of agricultural bio-formulations",
    type: "percentage",
    discount: 10,
    minCart: 499,
    maxDiscount: 300,
    active: true,
    totalRedemptions: 142,
    influencingRevenue: 248900,
    expiry: "2026-12-31",
    expiryDate: "31 Dec 2026",
    isFreeShipping: false,
  },
  {
    id: "CPN-02",
    code: "HARVEST15",
    title: "15% Harvest Fest Savings",
    description: "15% off orders above ₹999 on bio-fertilizers, humic stimulants and crop boosters",
    type: "percentage",
    discount: 15,
    minCart: 999,
    maxDiscount: 500,
    active: true,
    totalRedemptions: 89,
    influencingRevenue: 178200,
    expiry: "2026-12-31",
    expiryDate: "31 Dec 2026",
    isFreeShipping: false,
  },
  {
    id: "CPN-03",
    code: "FREESHIP",
    title: "Free Priority Delivery",
    description: "Complimentary farm delivery anywhere in India on orders ₹499+",
    type: "free_shipping",
    discount: 60,
    minCart: 499,
    maxDiscount: 60,
    active: true,
    totalRedemptions: 215,
    influencingRevenue: 194000,
    expiry: "2026-12-31",
    expiryDate: "31 Dec 2026",
    isFreeShipping: true,
  },
  {
    id: "CPN-04",
    code: "KISAN20",
    title: "Flat 20% Kisan Agri Saver",
    description: "Special savings on Trichoderma Viride (Harit) and Bhumi Shakti 5L packs",
    type: "percentage",
    discount: 20,
    minCart: 1450,
    maxDiscount: 400,
    active: true,
    totalRedemptions: 54,
    influencingRevenue: 98500,
    expiry: "2026-12-31",
    expiryDate: "31 Dec 2026",
    isFreeShipping: false,
  },
  {
    id: "CPN-05",
    code: "AGRO100",
    title: "₹100 Bio-Input Saver",
    description: "Instant ₹100 off on liquid bio-fertilizers, bio-fungicides and micronutrients",
    type: "flat",
    discount: 100,
    minCart: 750,
    maxDiscount: 100,
    active: true,
    totalRedemptions: 112,
    influencingRevenue: 145000,
    expiry: "2026-12-31",
    expiryDate: "31 Dec 2026",
    isFreeShipping: false,
  },
  {
    id: "CPN-06",
    code: "FARMDIRECT",
    title: "₹150 Bulk Farm Reward",
    description: "Special ₹150 privilege discount for seasonal farm cultivation orders",
    type: "flat",
    discount: 150,
    minCart: 1200,
    maxDiscount: 150,
    active: true,
    totalRedemptions: 67,
    influencingRevenue: 132000,
    expiry: "2026-12-31",
    expiryDate: "31 Dec 2026",
    isFreeShipping: false,
  },
  {
    id: "CPN-07",
    code: "WELCOME150",
    title: "₹150 New Farmer Welcome",
    description: "First time choosing Janani Agro biological formulations? Enjoy ₹150 off right away",
    type: "flat",
    discount: 150,
    minCart: 600,
    maxDiscount: 150,
    active: true,
    totalRedemptions: 245,
    influencingRevenue: 289000,
    expiry: "2026-12-31",
    expiryDate: "31 Dec 2026",
    isFreeShipping: false,
  },
];

export const DEFAULT_SETTINGS = {
  store: {
    storeName: "JANANI AGRO PRODUCTS",
    legalBusinessName: "JANANI AGRO PRODUCTS PRIVATE LIMITED",
    storeTagline: "Certified Bio-Fertilizers, Bio-Pesticides & Crop Protection Direct from Lodhika Facility",
    supportEmail: "care@jananiagro.com",
    ordersEmail: "orders@jananiagro.com",
    supportPhone: "+91 93114 16225",
    tollFreeNumber: "1800 200 4810",
    storeAddress: "SUB PLOTS NO.2/1/B, REVENUE SURVEY NO.160 TAL., LODHIKA GIDC",
    city: "Rajkot",
    state: "Gujarat",
    pincode: "360024",
    country: "India",
    fssaiLicenseNo: "10722026000412",
    cinNumber: "U01112GJ2024PTC149810",
    gstin: "29AABCI9928P1Z8",
    defaultCurrency: "INR (₹)",
    defaultTimezone: "Asia/Kolkata (IST)",
    weightUnit: "kg / g / L",
    dimensionsUnit: "cm",
    orderIdPrefix: "JAP-",
    orderIdPadding: 6,
    maintenanceMode: false,
    operatingHours: "Monday – Saturday, 9:00 AM – 7:00 PM IST"
  },
  branding: {
    logoLightUrl: "/favicon.svg",
    logoDarkUrl: "/favicon.svg",
    faviconUrl: "/favicon.svg",
    adminBrandAccent: "#16a34a",
    brandPrimaryColor: "#15803d",
    brandSecondaryColor: "#d97706",
    emailHeaderBannerUrl: "/assets/janani-hero.jpg",
    invoiceWatermarkText: "JANANI AGRO PRODUCTS — 100% PURE & CERTIFIED ORGANIC",
    customerAppBanner: "/assets/janani-pantry.jpg"
  },
  seo: {
    metaTitle: "JANANI AGRO PRODUCTS — Biological Crop Protection, Bio-Fertilizers & Stimulants",
    metaDescription: "Direct from Lodhika GIDC facility. Trichoderma viride, humic and fulvic soil conditioners, botanical pest deterrents and micronutrients for sustainable farming.",
    metaKeywords: "bio fertilizers, bio pesticides, trichoderma viride, humic acid, neem oil, biostimulants, micronutrients, janani agro",
    canonicalBaseUrl: "https://jananiagro.com",
    ogImageUrl: "/assets/janani-hero.jpg",
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterHandle: "@JananiAgro",
    googleSiteVerificationId: "goog-janani-agro-verify-991",
    bingSiteVerificationId: "ms-janani-agro-991",
    robotsIndex: true,
    robotsFollow: true,
    schemaMarkupEnabled: true
  },
  paymentGateways: {
    razorpay: {
      enabled: true,
      mode: "live" as const,
      keyId: "rzp_live_948102948102",
      keySecret: "••••••••••••••••••••",
      webhookSecret: "••••••••••••••••••••",
      autoCapture: true,
      supportedMethods: ["upi", "card", "netbanking", "wallet"]
    },
    phonepe: {
      enabled: true,
      mode: "live" as const,
      merchantId: "JANANIAGROONLINE",
      saltKey: "••••••••••••••••",
      saltIndex: "1",
      env: "PRODUCTION",
      webhookUrl: "https://jananiagro.com/api/payment/webhook/phonepe"
    },
    cashfree: {
      enabled: false,
      mode: "test" as const,
      appId: "TEST_CF_9921",
      secretKey: "••••••••••••",
      webhookUrl: "https://jananiagro.com/api/payment/webhook/cashfree"
    },
    cod: {
      enabled: true,
      minOrderAmount: 299,
      maxOrderAmount: 10000,
      verificationRequired: true,
      extraFee: 50,
      otpPreVerification: true,
      restrictedPincodesCount: 42
    }
  },
  shiprocket: {
    enabled: true,
    email: "logistics@jananiagro.com",
    apiKey: "sr_live_9920194812",
    apiSecret: "••••••••••••••••",
    tokenExpiry: "2026-12-31",
    defaultWarehouse: "Lodhika GIDC Gujarat Primary Hub",
    autoManifestOrders: true,
    weightBufferPercentage: 5,
    preferredCouriers: ["Bluedart Air", "Delhivery Surface", "DTDC Express"],
    smartRoutingStrategy: "fastest",
    rtoRiskThresholdScore: 75,
    liveTrackingWebhookUrl: "https://jananiagro.com/api/shipping/webhook"
  },
  gst: {
    gstin: "29AABCI9928P1Z8",
    legalBusinessName: "JANANI AGRO PRODUCTS PRIVATE LIMITED",
    stateJurisdiction: "Gujarat (24)",
    filingFrequency: "Monthly (GSTR-1 / GSTR-3B)",
    eWayBillThreshold: 50000,
    eInvoiceThreshold: 50000000,
    defaultHsnGrains: "10063010",
    defaultHsnOils: "15089091",
    defaultHsnGhee: "04059020",
    defaultHsnSpices: "09103030",
    taxRateGrains: 0,
    taxRateOils: 5,
    taxRateGhee: 12,
    taxRateSpices: 5,
    compositionScheme: false,
    lutArnForExports: "AD290826001928K"
  },
  deliveryCharges: {
    freeShippingThreshold: 799,
    standardFlatRate: 60,
    expressFlatRate: 120,
    remoteAreaSurcharge: 150,
    codHandlingFee: 50
  },
  referralRules: {
    enabled: true,
    referrerBonus: 100,
    refereeDiscount: 150,
    minOrderAmount: 499
  },
  couponRules: {
    allowMultipleCoupons: false,
    maxCouponDiscountPerOrder: 500
  },
  smtp: {
    host: "smtp.titan.email",
    port: 465,
    secure: true,
    authEmail: "care@jananiagro.com",
    senderName: "Janani Agro Customer Care"
  },
  sms: {
    provider: "Fast2SMS / Gupshup DLT",
    senderId: "JANANI",
    enabled: true
  },
  security: {
    twoFactorEnforcedForAdmin: true,
    sessionTimeoutMinutes: 120,
    maxLoginAttempts: 5,
    ipWhitelist: []
  }
};

export const DEFAULT_STAFF = [
  {
    id: "STAFF-001",
    name: "Doddi Sai Rama",
    email: "admin@jananiagro.com",
    phone: "+91 93114 16225",
    roleId: "role_super_admin",
    roleName: "Super Administrator",
    department: "Executive Leadership",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
    status: "Active" as const,
    twoFactorEnabled: true,
    lastLogin: "Today, 10:15 AM",
    lastLoginIp: "103.112.45.19",
    lastLoginLocation: "Bengaluru, India",
    assignedWarehouses: ["All Warehouses"],
    createdAt: "2025-10-01"
  },
  {
    id: "STAFF-002",
    name: "Suresh Patwardhan",
    email: "operations@jananiagro.com",
    phone: "+91 98451 90213",
    roleId: "role_warehouse_manager",
    roleName: "Logistics & Fulfillment Lead",
    department: "Warehousing & Supply Chain",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    status: "Active" as const,
    twoFactorEnabled: true,
    lastLogin: "Yesterday, 04:30 PM",
    lastLoginIp: "115.99.12.84",
    lastLoginLocation: "Rajkot, Gujarat",
    assignedWarehouses: ["Lodhika GIDC Gujarat Primary Hub"],
    createdAt: "2026-01-15"
  },
  {
    id: "STAFF-003",
    name: "Kavitha Ranganathan",
    email: "support@jananiagro.com",
    phone: "+91 98410 44231",
    roleId: "role_customer_support",
    roleName: "Customer Delight Specialist",
    department: "Patron Care & Returns",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
    status: "Active" as const,
    twoFactorEnabled: false,
    lastLogin: "Today, 09:40 AM",
    lastLoginIp: "106.51.78.201",
    lastLoginLocation: "Chennai, India",
    assignedWarehouses: ["Remote Hub"],
    createdAt: "2026-03-10"
  }
];

export const DEFAULT_ROLES = [
  {
    id: "role_super_admin",
    name: "Super Administrator",
    slug: "super_admin",
    description: "Complete unrestricted access across store settings, finances, refunds, roles and audit logs.",
    isSystem: true,
    color: "#16a34a",
    staffCount: 1,
    permissions: ["all"],
    createdAt: "2025-10-01"
  },
  {
    id: "role_warehouse_manager",
    name: "Warehouse & Logistics Manager",
    slug: "warehouse_manager",
    description: "Full management of order dispatch, Shiprocket AWB, pickup manifests, and inventory restock.",
    isSystem: true,
    color: "#2563eb",
    staffCount: 1,
    permissions: ["orders.view", "orders.edit", "orders.shiprocket", "inventory.view", "inventory.restock"],
    createdAt: "2026-01-15"
  },
  {
    id: "role_customer_support",
    name: "Customer Delight Lead",
    slug: "customer_support",
    description: "Assisting customers with order inquiries, return reviews, replacement approvals and feedback.",
    isSystem: true,
    color: "#d97706",
    staffCount: 1,
    permissions: ["orders.view", "customers.view", "reviews.manage", "returns.manage"],
    createdAt: "2026-03-10"
  }
];

export const DEFAULT_CMS = {
  sections: [
    { id: "sec_hero", name: "Hero Carousel Banners", type: "hero_slider", enabled: true, active: true, order: 1, description: "Full-width responsive carousel with dual desktop/mobile banners & primary CTAs." },
    { id: "sec_trust", name: "Trust Badges & Value Strip", type: "trust_badges", enabled: true, active: true, order: 2, description: "100% Organic, Direct Farmer Sourced, Chemical Free, Fast Delivery badges." },
    { id: "sec_promo_strip", name: "Promotional Announcement Strip", type: "offer_strip", enabled: true, active: true, order: 3, description: "Highlight seasonal coupons & sitewide free shipping thresholds." },
    { id: "sec_categories", name: "Shop by Category Cards", type: "category_grid", enabled: true, active: true, order: 4, description: "Curated category cards for Bio-Fertilizers, Bio-Pesticides, Stimulants & Nutrients." },
    { id: "sec_flash_sale", name: "Urgent Flash Sale Ticker", type: "flash_sale", enabled: true, active: true, order: 5, description: "Time-limited urgent deal box with live countdown timer & stock scarcity meter." },
    { id: "sec_featured", name: "Featured Organic Essentials", type: "product_showcase_featured", enabled: true, active: true, order: 6, description: "Hand-picked organic staple products curated by admin." },
    { id: "sec_trending", name: "Trending This Harvest Week", type: "product_showcase_trending", enabled: true, active: true, order: 7, description: "High velocity organic best-sellers and newly in-demand items." },
    { id: "sec_brand_story", name: "Janani Agro Farm Story", type: "brand_story", enabled: true, active: true, order: 8, description: "Heritage mission, ethical farmer partnerships, and purity guarantee video/story." },
    { id: "sec_best_sellers", name: "Customer Top Favorites", type: "product_showcase_bestsellers", enabled: true, active: true, order: 9, description: "Top-rated 5-star items loved by over 50,000+ happy households." },
    { id: "sec_new_arrivals", name: "Fresh Harvest Arrivals", type: "product_showcase_new", enabled: true, active: true, order: 10, description: "Newly harvested bio fertilizers, micro nutrients and crop protection." },
    { id: "sec_testimonials", name: "Customer Reviews & UGC Showcase", type: "testimonials", enabled: true, active: true, order: 11, description: "Verified customer photo reviews and field performance feedback." },
    { id: "sec_faq", name: "Frequently Asked Questions", type: "faq", enabled: true, active: true, order: 12, description: "Organic certifications, application dosages, and crop compatibility FAQs." }
  ],
  heroBanners: [
    {
      id: "slide-1",
      eyebrow: "Biological Crop Protection & Soil Health",
      title: "Sustainable Agriculture & Organic Formulations",
      subtitle: "Trichoderma viride bio-fungicides, humic biostimulants, and cold-pressed botanical pest deterrents for zero-residue agriculture.",
      primaryCtaLabel: "Explore Formulations",
      primaryCtaUrl: "/products",
      secondaryCtaLabel: "Official Dosage Guide",
      secondaryCtaUrl: "/products/harit",
      desktopImageUrl: "/products/harit.jpg",
      mobileImageUrl: "/products/harit.jpg",
      badgeText: "Certified Bio-Fungicides",
      slideOrder: 1,
      active: true
    },
    {
      id: "slide-2",
      eyebrow: "Rhizosphere Rejuvenation & Root Care",
      title: "Bhumi Shakti Humic & Fulvic Biostimulant",
      subtitle: "Enriches soil microbiology, unlocks micro-nutrients, and establishes thriving feeder roots across paddy, cotton, and vegetables.",
      primaryCtaLabel: "Shop Bhumi Shakti",
      primaryCtaUrl: "/products/bhumi-shakti",
      secondaryCtaLabel: "Crop Guidance",
      secondaryCtaUrl: "/products",
      desktopImageUrl: "/products/bhumi-shakti.jpg",
      mobileImageUrl: "/products/bhumi-shakti.jpg",
      badgeText: "Living Soil Rejuvenator",
      slideOrder: 2,
      active: true
    },
    {
      id: "slide-3",
      eyebrow: "Botanical Integrated Pest Management",
      title: "Neem Oil 1000 PPM Azadirachtin Extract",
      subtitle: "Standardized biological insect growth regulator repelling aphids, caterpillars, whiteflies, and mites with zero chemical residues.",
      primaryCtaLabel: "Order Neem Oil",
      primaryCtaUrl: "/products/neem-oil-1000-ppm",
      secondaryCtaLabel: "Contact Agricultural Agronomist",
      secondaryCtaUrl: "/contact",
      desktopImageUrl: "/products/neem-oil.jpg",
      mobileImageUrl: "/products/neem-oil.jpg",
      badgeText: "Botanical IPM Shield",
      slideOrder: 3,
      active: true
    }
  ],
  offerBanners: [
    {
      id: "offer-1",
      title: "Biological Crop Shield Combo",
      subtitle: "Save flat 20% on Harit Trichoderma + 5L Bhumi Shakti Soil Booster",
      badge: "Limited Seasonal Batch",
      ctaText: "Claim Bundle Offer",
      ctaUrl: "/products",
      imageUrl: "/products/harit.jpg",
      active: true,
      order: 1
    },
    {
      id: "offer-2",
      title: "Complimentary Free Shipping",
      subtitle: "No delivery charges on all retail orders above ₹799",
      badge: "All India Fast Courier",
      ctaText: "Shop Free Shipping",
      ctaUrl: "/products",
      imageUrl: "/assets/janani-products.jpg",
      active: true,
      order: 2
    }
  ],
  categoryBanners: [],
  flashSaleBanners: [],
  curatedProductSections: {
    featured: { heading: "Featured Collection", productIds: [1, 2, 3, 6, 7, 9], maxDisplayCount: 8, layout: "grid", active: true },
    trending: { heading: "Trending This Week", productIds: [1, 6, 3, 10], maxDisplayCount: 8, layout: "grid", active: true },
    newArrivals: { heading: "Fresh Harvest Arrivals", productIds: [11, 12, 13, 14], maxDisplayCount: 8, layout: "grid", active: true },
    bestSellers: { heading: "Customer Top Favorites", productIds: [1, 6, 7, 3], maxDisplayCount: 8, layout: "grid", active: true }
  }
};

export const DEFAULT_PAYMENTS = {
  transactions: [
    {
      id: "TXN-94812",
      orderId: "ORD-94812",
      customer: { name: "Ananya Sharma", email: "ananya.s@gmail.com", phone: "+91 98451 22345", avatar: "" },
      amount: 3477,
      currency: "INR",
      paymentMethod: "UPI (PhonePe)",
      gateway: "PhonePe PG",
      gatewayTxnId: "T2609159981023",
      bankUtr: "UTR609154910283",
      status: "Captured" as const,
      timestamp: "2026-09-15 10:45 AM",
      settlementStatus: "Settled to HDFC",
      fee: 0,
      tax: 0,
      net: 3477
    },
    {
      id: "TXN-94811",
      orderId: "ORD-94811",
      customer: { name: "Suresh Patwardhan", email: "suresh.p@yahoo.co.in", phone: "+91 94220 89123", avatar: "" },
      amount: 1305,
      currency: "INR",
      paymentMethod: "Credit Card (HDFC)",
      gateway: "Razorpay",
      gatewayTxnId: "pay_NL7739182301",
      bankUtr: "UTR609168819203",
      status: "Captured" as const,
      timestamp: "2026-09-16 03:20 PM",
      settlementStatus: "Settled to HDFC",
      fee: 26.10,
      tax: 4.70,
      net: 1274.20
    },
    {
      id: "TXN-94810",
      orderId: "ORD-94810",
      customer: { name: "Kavitha Ranganathan", email: "kavitha.r@outlook.com", phone: "+91 98410 44231", avatar: "" },
      amount: 1044,
      currency: "INR",
      paymentMethod: "UPI (Google Pay)",
      gateway: "Razorpay UPI Direct",
      gatewayTxnId: "pay_NL6655221190",
      bankUtr: "UTR609172291045",
      status: "Captured" as const,
      timestamp: "2026-09-17 11:10 AM",
      settlementStatus: "Pending Payout (T+1)",
      fee: 0,
      tax: 0,
      net: 1044
    },
    {
      id: "TXN-94809",
      orderId: "ORD-94809",
      customer: { name: "Rameshwar Patel", email: "ramesh.patel@gmail.com", phone: "+91 98251 10928", avatar: "" },
      amount: 848,
      currency: "INR",
      paymentMethod: "Cash on Delivery",
      gateway: "COD Courier Escrow",
      gatewayTxnId: "COD-DEL-99102",
      bankUtr: "Pending Courier Remittance",
      status: "Pending" as const,
      timestamp: "2026-09-17 01:45 PM",
      settlementStatus: "COD In Transit",
      fee: 50,
      tax: 0,
      net: 798
    }
  ],
  stats: {
    grossInflow: 6674,
    settledToBank: 4751.20,
    pendingPayouts: 1044,
    codInTransit: 848,
    totalRefunds: 0,
    recoveryRate: "78.4%"
  }
};

export const DEFAULT_AUDIT_LOGS = [
  {
    id: "LOG-101",
    timestamp: "2026-09-17 02:15 PM",
    actor: { id: "STAFF-001", name: "Doddi Sai Rama", email: "admin@jananiagro.com", role: "Super Admin" },
    action: "Updated Store Identity & GSTIN Settings",
    module: "Settings",
    severity: "low" as const,
    ipAddress: "103.112.45.19",
    device: "Chrome / Windows 11"
  },
  {
    id: "LOG-102",
    timestamp: "2026-09-17 11:40 AM",
    actor: { id: "STAFF-002", name: "Suresh Patwardhan", email: "operations@jananiagro.com", role: "Logistics Manager" },
    action: "Generated Shiprocket AWB for ORD-94811",
    module: "Shipping & Orders",
    severity: "low" as const,
    ipAddress: "115.99.12.84",
    device: "Firefox / macOS"
  },
  {
    id: "LOG-103",
    timestamp: "2026-09-16 05:00 PM",
    actor: { id: "STAFF-001", name: "Doddi Sai Rama", email: "admin@jananiagro.com", role: "Super Admin" },
    action: "Published New Seasonal Coupon: HARVEST15",
    module: "Marketing & Coupons",
    severity: "medium" as const,
    ipAddress: "103.112.45.19",
    device: "Chrome / Windows 11"
  }
];

export const DEFAULT_BACKUPS = [
  {
    id: "BAK-20260915",
    filename: "janani_agro_full_snapshot_20260915.json",
    type: "Manual Pre-Deployment Snapshot",
    scope: "Full Storefront + Catalog + ACL + Settings",
    size: "2.4 MB",
    recordCount: 1840,
    status: "Verified Clean",
    createdDate: "2026-09-15 11:00 AM",
    createdBy: "Doddi Sai Rama",
    checksum: "SHA256: 8f9b2d8e41a6...",
    downloadUrl: "#"
  },
  {
    id: "BAK-20260910",
    filename: "janani_agro_weekly_auto_20260910.json",
    type: "Automated Weekly Cold Backup",
    scope: "Full Database State",
    size: "2.2 MB",
    recordCount: 1690,
    status: "Verified Clean",
    createdDate: "2026-09-10 03:00 AM",
    createdBy: "System Cron",
    checksum: "SHA256: 3a1c9e81df4a...",
    downloadUrl: "#"
  }
];

export const DEFAULT_INQUIRIES = [
  {
    id: 1,
    name: "Dr. Meenakshi Rao",
    businessName: "AIIMS Nutrition & Research Lab",
    business_name: "AIIMS Nutrition & Research Lab",
    service: "Bulk Commercial Supply",
    subject: "Bulk Commercial Supply",
    email: "dr.m.rao@aiims.edu",
    phone: "+91 98490 22338",
    quantity: "500 kg Bulk Requirement",
    message: "Requesting certified laboratory COA documents and pricing for bulk monthly supply of Harit Bio Fertilizers and Organic Micronutrients.",
    status: "New",
    createdAt: "2026-10-04 10:30 AM",
    created_at: "2026-10-04 10:30:00",
    priority: "High"
  },
  {
    id: 2,
    name: "Kishore Patel",
    businessName: "Patel Kisan Agro Agency",
    business_name: "Patel Kisan Agro Agency",
    service: "Dealership & Distributorship (Tier 1)",
    subject: "Dealership & Distributorship (Tier 1)",
    email: "kishore.patel@agroagency.in",
    phone: "+91 98250 11982",
    quantity: "₹3,00,000 Initial Stock",
    message: "We operate 3 retail agro input stores in Anand & Vadodara districts. Looking to secure exclusive regional distribution for Janani Bio Pesticides and Botanical Extracts.",
    status: "In Progress",
    createdAt: "2026-10-03 04:15 PM",
    created_at: "2026-10-03 16:15:00",
    priority: "High"
  },
  {
    id: 3,
    name: "Suresh Reddy",
    businessName: "Sri Sai Organic Orchards",
    business_name: "Sri Sai Organic Orchards",
    service: "Crop Solution Advisory",
    subject: "Crop Solution Advisory",
    email: "suresh.reddy@srisaifarms.com",
    phone: "+91 94401 55678",
    quantity: "50 Acres Farm Coverage",
    message: "Experiencing early fungal blight in chilli crop. Need Janani technical agronomist consultation on bio-fungicide dosage schedule.",
    status: "Contacted",
    createdAt: "2026-10-02 11:20 AM",
    created_at: "2026-10-02 11:20:00",
    priority: "Medium"
  },
  {
    id: 4,
    name: "Ananya Deshmukh",
    businessName: "Green Earth Export Consortium",
    business_name: "Green Earth Export Consortium",
    service: "Contract Farming & Private Label",
    subject: "Contract Farming & Private Label",
    email: "ananya@greenearthconsortium.com",
    phone: "+91 97660 33411",
    quantity: "Export Grade FPO",
    message: "Inquiring about certified residue-free bio-stimulants for export table grapes with EU compliance documentation.",
    status: "Resolved",
    createdAt: "2026-09-28 02:40 PM",
    created_at: "2026-09-28 14:40:00",
    priority: "Medium"
  }
];
