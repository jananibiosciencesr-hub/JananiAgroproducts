import { products } from '../data/mockData.js';

// In-memory admin data stores
let adminProducts = [...products];

export let adminOrders = [
  {
    id: "ORD-94812",
    date: "2026-09-11 10:45 AM",
    orderStatus: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "UPI (PhonePe)",
    paymentGatewayId: "pay_NL8820491823",
    customer: { id: "CUST-001", name: "Ananya Sharma", email: "ananya.s@gmail.com", phone: "+91 98451 22345", tier: "Platinum Gold", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80" },
    shippingAddress: {
      name: "Ananya Sharma",
      street: "Flat 402, Green Glen Heights, Bellandur Outer Ring Road",
      landmark: "Opp. EcoSpace Business Park",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560103",
      country: "India",
      phone: "+91 98451 22345"
    },
    billingAddress: {
      name: "Ananya Sharma",
      street: "Flat 402, Green Glen Heights, Bellandur Outer Ring Road",
      landmark: "Opp. EcoSpace Business Park",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560103",
      country: "India",
      phone: "+91 98451 22345"
    },
    items: [
      {
        id: "PROD-001",
        title: "A2 Vedic Bilona Gir Cow Ghee (500ml)",
        sku: "JAN-GHEE-A2-500",
        hsnCode: "04059020",
        taxRate: 5,
        price: 1450,
        mrp: 1800,
        qty: 2,
        unit: "500ml glass jar",
        image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=300&q=80",
        subtotal: 2900
      },
      {
        id: "PROD-003",
        title: "Wild Raw Sundarban Multifloral Honey (500g)",
        sku: "JAN-HNY-SUN-500",
        hsnCode: "04090000",
        taxRate: 5,
        price: 680,
        mrp: 850,
        qty: 1,
        unit: "500g Jar",
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&q=80",
        subtotal: 680
      },
      {
        id: "PROD-002",
        title: "Cold-Pressed Virgin Groundnut Oil (1L)",
        sku: "JAN-OIL-GN-1000",
        hsnCode: "15089091",
        taxRate: 5,
        price: 420,
        mrp: 520,
        qty: 1,
        unit: "1 Litre Tin",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80",
        subtotal: 420
      }
    ],
    subtotal: 4000,
    taxAmount: 200,
    discount: 160,
    couponCode: "JANANI10",
    shippingFee: 0,
    total: 4040,
    warehouse: { id: "WH-BLR-01", name: "Bengaluru South Fulfillment Center", location: "Electronic City Phase 1", state: "Karnataka" },
    courier: "Shiprocket (Bluedart Air)",
    trackingId: "SR-BLR-884910",
    awbGeneratedAt: "2026-09-11 11:15 AM",
    pickupScheduled: "2026-09-11 04:30 PM",
    packageWeight: "3.2 kg",
    packageDimensions: "32 x 22 x 18 cm",
    timeline: [
      { status: "placed", title: "Order Confirmed", description: "Customer paid ₹4,040 via PhonePe UPI", time: "2026-09-11 10:45 AM", done: true, current: false },
      { status: "processing", title: "Quality Check & Packing", description: "Packed in Lodhika certified nitrogen pouch", time: "2026-09-11 11:30 AM", done: true, current: false },
      { status: "shipped", title: "Dispatched via Shiprocket", description: "Handed over to Bluedart Air Courier (AWB: SR-BLR-884910)", time: "2026-09-11 04:45 PM", done: true, current: false },
      { status: "delivered", title: "Delivered to Patron", description: "Received by customer with OTP verification", time: "2026-09-12 02:15 PM", done: true, current: true }
    ],
    customerNote: "Please deliver between 10 AM to 4 PM. If unavailable, leave with reception.",
    adminNotes: [
      { id: "NOTE-1", text: "Special eco-friendly gift wrap included upon request.", author: "Doddi Sai Rama", date: "2026-09-11 11:00 AM" }
    ],
    refundDetails: null,
    returnDetails: null,
    exchangeDetails: null
  },
  {
    id: "ORD-94811",
    date: "2026-09-11 09:30 AM",
    orderStatus: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card (HDFC)",
    paymentGatewayId: "pay_CC9912048912",
    customer: { id: "CUST-002", name: "Rajesh Kulkarni", email: "rajesh.k@rediffmail.com", phone: "+91 97123 44556", tier: "Gold Member", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80" },
    shippingAddress: {
      name: "Rajesh Kulkarni",
      street: "B-12, Mayur Vihar, Kothrud",
      landmark: "Near MIT College",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411038",
      country: "India",
      phone: "+91 97123 44556"
    },
    billingAddress: {
      name: "Rajesh Kulkarni",
      street: "B-12, Mayur Vihar, Kothrud",
      landmark: "Near MIT College",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411038",
      country: "India",
      phone: "+91 97123 44556"
    },
    items: [
      {
        id: "PROD-004",
        title: "Ancient Black Kavuni Heritage Rice (1kg)",
        sku: "JAN-RICE-KAV-1000",
        hsnCode: "10063090",
        taxRate: 5,
        price: 310,
        mrp: 390,
        qty: 3,
        unit: "1kg Eco Pouch",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80",
        subtotal: 930
      },
      {
        id: "PROD-002",
        title: "Cold-Pressed Groundnut Oil (1L)",
        sku: "JAN-OIL-GN-1000",
        hsnCode: "15089091",
        taxRate: 5,
        price: 420,
        mrp: 520,
        qty: 1,
        unit: "1 Litre Tin",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80",
        subtotal: 420
      }
    ],
    subtotal: 1350,
    taxAmount: 67,
    discount: 238,
    couponCode: "HARVESTFEST",
    shippingFee: 0,
    total: 1179,
    warehouse: { id: "WH-GIDC-01", name: "Central Lodhika GIDC Facility", location: "Metoda, Rajkot", state: "Gujarat" },
    courier: "Shiprocket (Delhivery Surface)",
    trackingId: "SR-PUN-992104",
    awbGeneratedAt: "2026-09-11 10:00 AM",
    pickupScheduled: "2026-09-11 05:00 PM",
    packageWeight: "4.5 kg",
    packageDimensions: "30 x 25 x 20 cm",
    timeline: [
      { status: "placed", title: "Order Received", description: "HDFC Credit Card verified ₹1,179", time: "2026-09-11 09:30 AM", done: true, current: false },
      { status: "processing", title: "Allocated to Lodhika Warehouse", description: "Packing slips printed, bin #B4", time: "2026-09-11 10:00 AM", done: true, current: true },
      { status: "shipped", title: "Awaiting Carrier Pickup", description: "Manifest scheduled for Delhivery Surface", time: "Pending", done: false, current: false },
      { status: "delivered", title: "Delivery to Customer", description: "Estimated in 2 days", time: "Pending", done: false, current: false }
    ],
    customerNote: "Please ensure glass jars have extra air bubble cushion.",
    adminNotes: [],
    refundDetails: null,
    returnDetails: null,
    exchangeDetails: null
  },
  {
    id: "ORD-94810",
    date: "2026-09-11 08:15 AM",
    orderStatus: "Pending",
    paymentStatus: "Pending",
    paymentMethod: "Cash on Delivery",
    paymentGatewayId: "cod_94810",
    customer: { id: "CUST-003", name: "Sunita Iyer", email: "sunita.iyer@yahoo.com", phone: "+91 94451 67890", tier: "Silver", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80" },
    shippingAddress: {
      name: "Sunita Iyer",
      street: "4th Cross, RA Puram",
      landmark: "Near Sangeetha Restaurant",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600028",
      country: "India",
      phone: "+91 94451 67890"
    },
    billingAddress: {
      name: "Sunita Iyer",
      street: "4th Cross, RA Puram",
      landmark: "Near Sangeetha Restaurant",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600028",
      country: "India",
      phone: "+91 94451 67890"
    },
    items: [
      {
        id: "PROD-001",
        title: "A2 Vedic Gir Cow Ghee (500ml)",
        sku: "JAN-GHEE-A2-500",
        hsnCode: "04059020",
        taxRate: 5,
        price: 1450,
        mrp: 1800,
        qty: 1,
        unit: "500ml glass jar",
        image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=300&q=80",
        subtotal: 1450
      }
    ],
    subtotal: 1450,
    taxAmount: 72,
    discount: 72,
    couponCode: "",
    shippingFee: 0,
    total: 1450,
    warehouse: { id: "WH-SRI-02", name: "Srikakulam Natural Valley Reserve", location: "Srikakulam Valley", state: "Andhra Pradesh" },
    courier: "Shiprocket (Xpressbees)",
    trackingId: "",
    awbGeneratedAt: null,
    pickupScheduled: null,
    packageWeight: "1.2 kg",
    packageDimensions: "18 x 14 x 14 cm",
    timeline: [
      { status: "placed", title: "COD Order Placed", description: "Verification SMS dispatched to patron", time: "2026-09-11 08:15 AM", done: true, current: true },
      { status: "processing", title: "Pending Admin Confirmation", description: "Verify address before label creation", time: "Pending", done: false, current: false }
    ],
    customerNote: "",
    adminNotes: [],
    refundDetails: null,
    returnDetails: null,
    exchangeDetails: null
  },
  {
    id: "ORD-94809",
    date: "2026-09-10 06:20 PM",
    orderStatus: "Shipped",
    paymentStatus: "Paid",
    paymentMethod: "NetBanking (ICICI)",
    paymentGatewayId: "pay_NB8819204",
    customer: { id: "CUST-004", name: "Vikram Malhotra", email: "v.malhotra@techcorp.in", phone: "+91 99887 66554", tier: "VIP Patron", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80" },
    shippingAddress: {
      name: "Vikram Malhotra",
      street: "Villa 18, Palm Drive, Golf Course Ext Road",
      landmark: "Near Club House",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122002",
      country: "India",
      phone: "+91 99887 66554"
    },
    billingAddress: {
      name: "Vikram Malhotra",
      street: "Villa 18, Palm Drive, Golf Course Ext Road",
      landmark: "Near Club House",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122002",
      country: "India",
      phone: "+91 99887 66554"
    },
    items: [
      {
        id: "PROD-003",
        title: "Wild Raw Sundarban Multifloral Honey (500g)",
        sku: "JAN-HNY-SUN-500",
        hsnCode: "04090000",
        taxRate: 5,
        price: 680,
        mrp: 850,
        qty: 2,
        unit: "500g Jar",
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&q=80",
        subtotal: 1360
      },
      {
        id: "PROD-005",
        title: "Pure Himalayan Shilajit Resin (20g)",
        sku: "JAN-AYUR-SHIL-20",
        hsnCode: "30049011",
        taxRate: 12,
        price: 1899,
        mrp: 2499,
        qty: 1,
        unit: "20g Jar with Spoon",
        image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&q=80",
        subtotal: 1899
      }
    ],
    subtotal: 3259,
    taxAmount: 281,
    discount: 400,
    couponCode: "BULKAGRO",
    shippingFee: 0,
    total: 3140,
    warehouse: { id: "WH-GIDC-01", name: "Central Lodhika GIDC Facility", location: "Metoda, Rajkot", state: "Gujarat" },
    courier: "Shiprocket (Bluedart Air)",
    trackingId: "SR-DEL-441209",
    awbGeneratedAt: "2026-09-10 07:00 PM",
    pickupScheduled: "2026-09-11 11:00 AM",
    packageWeight: "2.1 kg",
    packageDimensions: "24 x 18 x 14 cm",
    timeline: [
      { status: "placed", title: "Order Verified", description: "VIP Patron order via ICICI NetBanking", time: "2026-09-10 06:20 PM", done: true, current: false },
      { status: "processing", title: "Packed & Sealed", description: "Gold seal applied with tamper proof barcode", time: "2026-09-10 07:30 PM", done: true, current: false },
      { status: "shipped", title: "In Transit via Air Express", description: "Departed Delhi Cargo Hub (SR-DEL-441209)", time: "2026-09-11 08:30 AM", done: true, current: true }
    ],
    customerNote: "VIP Priority delivery requested.",
    adminNotes: [],
    refundDetails: null,
    returnDetails: null,
    exchangeDetails: null
  },
  {
    id: "ORD-94807",
    date: "2026-09-10 11:00 AM",
    orderStatus: "Cancelled",
    paymentStatus: "Refunded",
    paymentMethod: "Credit Card (Axis)",
    paymentGatewayId: "pay_AX9920194",
    customer: { id: "CUST-006", name: "Kunal Singhania", email: "kunal.singh@gmail.com", phone: "+91 93310 99887", tier: "Bronze", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80" },
    shippingAddress: {
      name: "Kunal Singhania",
      street: "Ballygunge Circular Road",
      landmark: "Near Ice Skating Rink",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700019",
      country: "India",
      phone: "+91 93310 99887"
    },
    billingAddress: {
      name: "Kunal Singhania",
      street: "Ballygunge Circular Road",
      landmark: "Near Ice Skating Rink",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700019",
      country: "India",
      phone: "+91 93310 99887"
    },
    items: [
      {
        id: "PROD-001",
        title: "A2 Vedic Bilona Gir Cow Ghee (500ml)",
        sku: "JAN-GHEE-A2-500",
        hsnCode: "04059020",
        taxRate: 5,
        price: 1450,
        mrp: 1800,
        qty: 2,
        unit: "500ml glass jar",
        image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=300&q=80",
        subtotal: 2900
      },
      {
        id: "PROD-003",
        title: "Wild Raw Sundarban Multifloral Honey (500g)",
        sku: "JAN-HNY-SUN-500",
        hsnCode: "04090000",
        taxRate: 5,
        price: 680,
        mrp: 850,
        qty: 1,
        unit: "500g Jar",
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&q=80",
        subtotal: 680
      }
    ],
    subtotal: 3580,
    taxAmount: 179,
    discount: 259,
    couponCode: "",
    shippingFee: 0,
    total: 3500,
    warehouse: { id: "WH-GIDC-01", name: "Central Lodhika GIDC Facility", location: "Metoda, Rajkot", state: "Gujarat" },
    courier: "None",
    trackingId: "",
    awbGeneratedAt: null,
    pickupScheduled: null,
    packageWeight: "2.8 kg",
    packageDimensions: "28 x 20 x 16 cm",
    timeline: [
      { status: "placed", title: "Order Placed", description: "Paid ₹3,500 via Axis Bank", time: "2026-09-10 11:00 AM", done: true, current: false },
      { status: "cancelled", title: "Order Cancelled by Customer", description: "Customer changed delivery requirement", time: "2026-09-10 11:45 AM", done: true, current: false },
      { status: "refunded", title: "Refund Issued", description: "Full ₹3,500 refunded to original source", time: "2026-09-10 12:30 PM", done: true, current: true }
    ],
    customerNote: "Please cancel my order as I selected wrong item size.",
    adminNotes: [
      { id: "NOTE-1", text: "Customer initiated cancellation within 1 hour. Full refund processed.", author: "Doddi Sai Rama", date: "2026-09-10 12:30 PM" }
    ],
    refundDetails: {
      amount: 3500,
      mode: "Original Credit Card (Axis)",
      reason: "Customer requested cancellation before dispatch",
      refundedAt: "2026-09-10 12:30 PM"
    },
    returnDetails: null,
    exchangeDetails: null
  }
];

export let adminCustomers = [
  {
    id: "CUST-001",
    name: "Ananya Sharma",
    email: "ananya.s@gmail.com",
    phone: "+91 98451 22345",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    totalSpent: 38450,
    totalOrders: 14,
    avgOrderValue: 2746,
    tier: "Platinum Gold",
    status: "Active",
    suspensionReason: null,
    joinDate: "2025-11-12",
    lastActive: "10 mins ago",
    walletBalance: 1250,
    loyaltyPoints: 3840,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    addresses: [
      { id: "ADDR-101", label: "Home (Default)", street: "Flat 402, Green Glen Heights, Bellandur Outer Ring Road", city: "Bengaluru", state: "Karnataka", pincode: "560103", isDefault: true, phone: "+91 98451 22345" },
      { id: "ADDR-102", label: "Office", street: "Tower B, 7th Floor, EcoWorld Tech Park", city: "Bengaluru", state: "Karnataka", pincode: "560103", isDefault: false, phone: "+91 98451 22345" }
    ],
    orderHistory: [
      { id: "ORD-94812", date: "2026-09-11 10:45 AM", itemsSummary: "Royal Basmati Rice (5kg) x2, Mustard Oil (1L) x1", itemsCount: 3, total: 4040, paymentMethod: "UPI (PhonePe)", paymentStatus: "Paid", orderStatus: "Delivered", trackingId: "SR-BLR-884910" },
      { id: "ORD-94730", date: "2026-08-28 04:15 PM", itemsSummary: "A2 Vedic Gir Cow Ghee (1L) x1, Raw Honey (500g) x1", itemsCount: 2, total: 2620, paymentMethod: "Credit Card (HDFC)", paymentStatus: "Paid", orderStatus: "Delivered", trackingId: "SR-BLR-748921" },
      { id: "ORD-94610", date: "2026-08-10 11:30 AM", itemsSummary: "Cold Pressed Groundnut Oil (5L) x1", itemsCount: 1, total: 1450, paymentMethod: "UPI (Google Pay)", paymentStatus: "Paid", orderStatus: "Delivered", trackingId: "SR-BLR-661209" }
    ],
    wishlist: [
      { id: "kashmiri-saffron-strands", name: "Kashmiri Mongra Saffron Grade A (1g)", price: 549, originalPrice: 699, image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&q=80", inStock: true, unit: "1g Sealed Vial" },
      { id: "black-kavuni-rice", name: "Ancient Black Kavuni Heritage Rice (1kg)", price: 310, originalPrice: 390, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80", inStock: true, unit: "1kg Pouch" }
    ],
    cart: [
      { id: "a2-desi-cow-ghee", name: "A2 Vedic Gir Cow Bilona Ghee", price: 1450, qty: 1, image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=300&q=80", unit: "500ml Jar" },
      { id: "wild-forest-raw-honey", name: "Wild Raw Sundarban Multifloral Honey", price: 680, qty: 2, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&q=80", unit: "500g Jar" }
    ],
    walletTransactions: [
      { id: "TXN-8821", date: "2026-09-01", type: "credit", amount: 500, description: "Referral bonus credited (Kavita Joined)", balanceAfter: 1250 },
      { id: "TXN-8740", date: "2026-08-28", type: "debit", amount: 250, description: "Applied wallet balance on ORD-94730", balanceAfter: 750 },
      { id: "TXN-8612", date: "2026-08-15", type: "credit", amount: 1000, description: "Independence Day Cashback Loyalty Grant", balanceAfter: 1000 }
    ],
    loyaltyHistory: [
      { id: "LPT-101", date: "2026-09-11", type: "earned", points: 404, description: "Earned 10% points on ORD-94812" },
      { id: "LPT-102", date: "2026-08-28", type: "earned", points: 262, description: "Earned 10% points on ORD-94730" }
    ],
    referrals: {
      code: "ANANYA-AGRO-77",
      count: 6,
      totalEarned: 3000,
      friends: [
        { name: "Kavita Rao", date: "2026-09-01", reward: 500, status: "First Order Placed" },
        { name: "Pooja Reddy", date: "2026-08-19", reward: 500, status: "First Order Placed" },
        { name: "Rohan V.", date: "2026-07-22", reward: 500, status: "First Order Placed" }
      ]
    },
    couponsUsed: [
      { code: "JANANI10", discount: 404, orderId: "ORD-94812", date: "2026-09-11" },
      { code: "FIRSTORGANIC", discount: 200, orderId: "ORD-94610", date: "2026-08-10" }
    ]
  },
  {
    id: "CUST-002",
    name: "Rajesh Kulkarni",
    email: "rajesh.k@rediffmail.com",
    phone: "+91 97123 44556",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411038",
    totalSpent: 18900,
    totalOrders: 7,
    avgOrderValue: 2700,
    tier: "Gold Member",
    status: "Active",
    suspensionReason: null,
    joinDate: "2026-01-04",
    lastActive: "1 hour ago",
    walletBalance: 450,
    loyaltyPoints: 1890,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    addresses: [
      { id: "ADDR-201", label: "Home (Default)", street: "B-12, Mayur Vihar, Kothrud", city: "Pune", state: "Maharashtra", pincode: "411038", isDefault: true, phone: "+91 97123 44556" }
    ],
    orderHistory: [
      { id: "ORD-94811", date: "2026-09-11 09:30 AM", itemsSummary: "Unpolished Toor Dal (1kg) x3, Kashmiri Saffron (1g) x1", itemsCount: 4, total: 1179, paymentMethod: "Credit Card (HDFC)", paymentStatus: "Paid", orderStatus: "Processing", trackingId: "SR-PUN-992104" }
    ],
    wishlist: [
      { id: "cold-pressed-groundnut-oil", name: "Cold Pressed Wood Fired Groundnut Oil (5L)", price: 1450, originalPrice: 1800, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80", inStock: true, unit: "5L Canister" }
    ],
    cart: [],
    walletTransactions: [
      { id: "TXN-7901", date: "2026-08-20", type: "credit", amount: 450, description: "Promotional loyalty cashback", balanceAfter: 450 }
    ],
    loyaltyHistory: [
      { id: "LPT-201", date: "2026-09-11", type: "earned", points: 118, description: "Points from ORD-94811" }
    ],
    referrals: {
      code: "RAJESH-PUNE-12",
      count: 2,
      totalEarned: 1000,
      friends: [
        { name: "Sanjay Deshmukh", date: "2026-06-14", reward: 500, status: "First Order Placed" }
      ]
    },
    couponsUsed: [
      { code: "HARVESTFEST", discount: 177, orderId: "ORD-94811", date: "2026-09-11" }
    ]
  },
  {
    id: "CUST-003",
    name: "Sunita Iyer",
    email: "sunita.iyer@yahoo.com",
    phone: "+91 94451 67890",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600028",
    totalSpent: 7450,
    totalOrders: 3,
    avgOrderValue: 2483,
    tier: "Silver",
    status: "Active",
    suspensionReason: null,
    joinDate: "2026-04-18",
    lastActive: "Yesterday",
    walletBalance: 0,
    loyaltyPoints: 745,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
    addresses: [
      { id: "ADDR-301", label: "Home (Default)", street: "4th Cross, RA Puram", city: "Chennai", state: "Tamil Nadu", pincode: "600028", isDefault: true, phone: "+91 94451 67890" }
    ],
    orderHistory: [
      { id: "ORD-94810", date: "2026-09-11 08:15 AM", itemsSummary: "Cold Pressed Groundnut Oil (5L) x1", itemsCount: 1, total: 1450, paymentMethod: "Cash on Delivery", paymentStatus: "Pending", orderStatus: "Pending", trackingId: "" }
    ],
    wishlist: [],
    cart: [
      { id: "black-kavuni-rice", name: "Ancient Black Kavuni Heritage Rice", price: 310, qty: 3, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80", unit: "1kg Bag" }
    ],
    walletTransactions: [],
    loyaltyHistory: [
      { id: "LPT-301", date: "2026-09-11", type: "earned", points: 145, description: "Points from ORD-94810" }
    ],
    referrals: {
      code: "SUNITA-CHN-90",
      count: 0,
      totalEarned: 0,
      friends: []
    },
    couponsUsed: []
  },
  {
    id: "CUST-004",
    name: "Vikram Malhotra",
    email: "v.malhotra@techcorp.in",
    phone: "+91 99887 66554",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
    totalSpent: 52100,
    totalOrders: 21,
    avgOrderValue: 2480,
    tier: "VIP Patron",
    status: "Active",
    suspensionReason: null,
    joinDate: "2025-08-20",
    lastActive: "Just now",
    walletBalance: 3450,
    loyaltyPoints: 5210,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    addresses: [
      { id: "ADDR-401", label: "Villa (Default)", street: "Villa 18, Palm Drive, Golf Course Ext Road", city: "Gurugram", state: "Haryana", pincode: "122002", isDefault: true, phone: "+91 99887 66554" }
    ],
    orderHistory: [
      { id: "ORD-94809", date: "2026-09-10 06:20 PM", itemsSummary: "Wild Forest Raw Multiflora Honey (500g) x2, A2 Vedic Gir Cow Ghee (1L) x1", itemsCount: 3, total: 3140, paymentMethod: "NetBanking (ICICI)", paymentStatus: "Paid", orderStatus: "Shipped", trackingId: "SR-DEL-441209" }
    ],
    wishlist: [
      { id: "pure-himalayan-shilajit-resin", name: "Pure Himalayan Shilajit Resin (Gold Grade)", price: 1899, originalPrice: 2499, image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&q=80", inStock: true, unit: "20g Jar" }
    ],
    cart: [],
    walletTransactions: [
      { id: "TXN-9010", date: "2026-09-05", type: "credit", amount: 2000, description: "VIP Patron Quarterly Wellness Grant", balanceAfter: 3450 }
    ],
    loyaltyHistory: [
      { id: "LPT-401", date: "2026-09-10", type: "earned", points: 314, description: "Points from ORD-94809" }
    ],
    referrals: {
      code: "VIKRAM-VIP-01",
      count: 9,
      totalEarned: 4500,
      friends: [
        { name: "Aditya Roy", date: "2026-08-30", reward: 500, status: "First Order Placed" },
        { name: "Sameer Joshi", date: "2026-08-14", reward: 500, status: "First Order Placed" }
      ]
    },
    couponsUsed: [
      { code: "BULKAGRO", discount: 500, orderId: "ORD-94809", date: "2026-09-10" }
    ]
  },
  {
    id: "CUST-005",
    name: "Dr. Meenakshi Rao",
    email: "dr.m.rao@aiims.edu",
    phone: "+91 98231 11223",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500034",
    totalSpent: 26800,
    totalOrders: 11,
    avgOrderValue: 2436,
    tier: "Gold Member",
    status: "Active",
    suspensionReason: null,
    joinDate: "2025-12-01",
    lastActive: "3 days ago",
    walletBalance: 800,
    loyaltyPoints: 2680,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80",
    addresses: [
      { id: "ADDR-501", label: "Clinic (Default)", street: "Road No 12, Banjara Hills", city: "Hyderabad", state: "Telangana", pincode: "500034", isDefault: true, phone: "+91 98231 11223" }
    ],
    orderHistory: [
      { id: "ORD-94808", date: "2026-09-10 03:10 PM", itemsSummary: "Stone Ground Black Wheat Flour (5kg) x2", itemsCount: 2, total: 960, paymentMethod: "UPI (Google Pay)", paymentStatus: "Paid", orderStatus: "Delivered", trackingId: "SR-HYD-119283" }
    ],
    wishlist: [],
    cart: [],
    walletTransactions: [],
    loyaltyHistory: [
      { id: "LPT-501", date: "2026-09-10", type: "earned", points: 96, description: "Points from ORD-94808" }
    ],
    referrals: {
      code: "MEENAKSHI-HYD-44",
      count: 3,
      totalEarned: 1500,
      friends: []
    },
    couponsUsed: []
  },
  {
    id: "CUST-006",
    name: "Kunal Singhania",
    email: "kunal.singh@gmail.com",
    phone: "+91 93310 99887",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700019",
    totalSpent: 3500,
    totalOrders: 1,
    avgOrderValue: 3500,
    tier: "Bronze",
    status: "Suspended",
    suspensionReason: "Suspected abuse of return policy and failed payment chargebacks.",
    joinDate: "2026-08-15",
    lastActive: "1 week ago",
    walletBalance: 0,
    loyaltyPoints: 350,
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80",
    addresses: [
      { id: "ADDR-601", label: "Residence (Default)", street: "Ballygunge Circular Road", city: "Kolkata", state: "West Bengal", pincode: "700019", isDefault: true, phone: "+91 93310 99887" }
    ],
    orderHistory: [
      { id: "ORD-94807", date: "2026-09-10 11:00 AM", itemsSummary: "Royal Basmati Rice (10kg) x1", itemsCount: 1, total: 3500, paymentMethod: "Credit Card (Axis)", paymentStatus: "Refunded", orderStatus: "Cancelled", trackingId: "" }
    ],
    wishlist: [],
    cart: [],
    walletTransactions: [],
    loyaltyHistory: [],
    referrals: {
      code: "KUNAL-KOL-88",
      count: 0,
      totalEarned: 0,
      friends: []
    },
    couponsUsed: []
  }
];

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
    title: "Harvest Festive 15% Off Cold Pressed Oils & Ghee",
    description: "Save 15% (up to ₹500) on wood-pressed oils and A2 Gir Cow Bilona Ghee",
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
    categorySpecific: ["Cold Pressed Oils", "Desi Ghee & Dairy", "Spices & Herbs"],
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

export let couponUsageHistory = [
  {
    id: "USG-8801",
    couponCode: "JANANI10",
    orderId: "ORD-94812",
    customerName: "Ananya Sharma",
    customerEmail: "ananya.s@gmail.com",
    customerPhone: "+91 98451 22345",
    orderTotal: 4340.00,
    discountAmount: 300.00,
    netPaid: 4040.00,
    usedAt: "2026-09-11 10:45 AM",
    orderStatus: "Delivered"
  },
  {
    id: "USG-8802",
    couponCode: "FIRSTORGANIC",
    orderId: "ORD-94808",
    customerName: "Vikram Patel",
    customerEmail: "vikram.p@gmail.com",
    customerPhone: "+91 98231 44556",
    orderTotal: 2990.00,
    discountAmount: 200.00,
    netPaid: 2790.00,
    usedAt: "2026-09-11 09:12 AM",
    orderStatus: "Shipped"
  },
  {
    id: "USG-8803",
    couponCode: "HARVESTFEST",
    orderId: "ORD-94801",
    customerName: "Rajesh Iyer",
    customerEmail: "rajesh.iyer@tcs.com",
    customerPhone: "+91 97412 88990",
    orderTotal: 3150.00,
    discountAmount: 472.50,
    netPaid: 2677.50,
    usedAt: "2026-09-10 03:20 PM",
    orderStatus: "Delivered"
  },
  {
    id: "USG-8804",
    couponCode: "FREESHIPAGRO",
    orderId: "ORD-94792",
    customerName: "Priya Sundaram",
    customerEmail: "priya.s@wipro.com",
    customerPhone: "+91 98801 33221",
    orderTotal: 980.00,
    discountAmount: 120.00,
    netPaid: 860.00,
    usedAt: "2026-09-10 11:15 AM",
    orderStatus: "Delivered"
  },
  {
    id: "USG-8805",
    couponCode: "VIPPLATINUM25",
    orderId: "ORD-94784",
    customerName: "Sunita Rao",
    customerEmail: "sunita.rao@gmail.com",
    customerPhone: "+91 94480 66778",
    orderTotal: 4800.00,
    discountAmount: 1200.00,
    netPaid: 3600.00,
    usedAt: "2026-09-09 05:45 PM",
    orderStatus: "Delivered"
  },
  {
    id: "USG-8806",
    couponCode: "JANANI10",
    orderId: "ORD-94770",
    customerName: "Karthik Raja",
    customerEmail: "karthik.r@yahoo.com",
    customerPhone: "+91 99001 55443",
    orderTotal: 2150.00,
    discountAmount: 215.00,
    netPaid: 1935.00,
    usedAt: "2026-09-08 02:10 PM",
    orderStatus: "Delivered"
  }
];

let adminReviews = [
  {
    id: "REV-101",
    productId: "PROD-1",
    productName: "Organic Basmati Rice (1 kg)",
    productCategory: "Organic Rice",
    productImage: "/assets/janani-products.jpg",
    customerId: "CUST-1001",
    customerName: "Pooja Hegde",
    customerEmail: "pooja.hegde@gmail.com",
    customerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    orderId: "ORD-94807",
    rating: 5,
    title: "Extraordinary aroma and pristine grain elongation!",
    comment: "Extraordinary aroma and pristine grain elongation. Best organic basmati we have tasted. Fluffs up beautifully without sticking together. Perfect for festive biryanis.",
    images: [
      { id: "IMG-101A", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80", caption: "Cooked long grains for Sunday Biryani", status: "Approved" },
      { id: "IMG-101B", url: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&auto=format&fit=crop&q=80", caption: "Raw rice grain comparison", status: "Approved" }
    ],
    verifiedPurchase: true,
    status: "Approved",
    isFeatured: true,
    helpfulCount: 42,
    abuseReportsCount: 0,
    abuseReports: [],
    adminReply: {
      authorName: "Doddi Sai Rama",
      authorRole: "Head of Quality & Founder",
      message: "Dear Pooja, thank you so much for your heartwarming appreciation! Our Basmati is aged traditionally for 18+ months in Himalayan foothills to achieve this exact length and aroma. Happy cooking!",
      repliedAt: "2026-09-10 04:30 PM"
    },
    customerReplies: [
      { id: "REP-101", customerName: "Rajesh Kannan", message: "Did you soak for 30 mins before boiling?", createdAt: "2026-09-10 06:15 PM", likes: 4 }
    ],
    createdAt: "2026-09-10 11:20 AM",
    updatedAt: "2026-09-10 04:30 PM"
  },
  {
    id: "REV-102",
    productId: "PROD-6",
    productName: "Wood-Pressed Groundnut Oil (1 L)",
    productCategory: "Cold Pressed Oils",
    productImage: "/assets/janani-products.jpg",
    customerId: "CUST-1002",
    customerName: "Narayanan Subramaniam",
    customerEmail: "narayanan.s@outlook.com",
    customerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    orderId: "ORD-94792",
    rating: 5,
    title: "Authentic marachekku aroma, reminiscent of our village!",
    comment: "Authentic bilona and marachekku aroma with golden clarity. Reminds me of traditional oil presses from Tamil Nadu. Low smoke and great flavor for daily South Indian tadka.",
    images: [
      { id: "IMG-102A", url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80", caption: "Golden unrefined oil texture", status: "Approved" }
    ],
    verifiedPurchase: true,
    status: "Approved",
    isFeatured: true,
    helpfulCount: 29,
    abuseReportsCount: 0,
    abuseReports: [],
    adminReply: {
      authorName: "Kavitha Ranganathan",
      authorRole: "Customer Delight Lead",
      message: "Vanakkam Narayanan! We cold-press single-origin native Saurashtra groundnuts in Vaagai wood presses at under 38°C to retain all natural antioxidants. Thank you for your continued trust!",
      repliedAt: "2026-09-09 03:00 PM"
    },
    customerReplies: [],
    createdAt: "2026-09-09 09:45 AM",
    updatedAt: "2026-09-09 03:00 PM"
  },
  {
    id: "REV-103",
    productId: "PROD-3",
    productName: "Lakadong Turmeric Powder (200 g)",
    productCategory: "Spices",
    productImage: "/assets/janani-products.jpg",
    customerId: "CUST-1003",
    customerName: "Arun Verma",
    customerEmail: "arun.verma@gmail.com",
    customerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    orderId: "ORD-94760",
    rating: 4,
    title: "Incredible 7.5% curcumin content & deep golden hue",
    comment: "High curcumin content is clearly visible from the deep orange color and potent fragrance. We use it daily for golden turmeric latte. Minus 1 star only because the resealable zipper on the pouch was slightly stiff to seal.",
    images: [
      { id: "IMG-103A", url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80", caption: "Deep golden color comparison", status: "Approved" }
    ],
    verifiedPurchase: true,
    status: "Approved",
    isFeatured: false,
    helpfulCount: 18,
    abuseReportsCount: 0,
    abuseReports: [],
    adminReply: {
      authorName: "Doddi Sai Rama",
      authorRole: "Founder",
      message: "Thank you Arun for the feedback! We have upgraded to airtight triple-laminate Japanese zip-lock pouches in our new batch starting this week. Reach out to support for a complimentary jar.",
      repliedAt: "2026-09-08 05:15 PM"
    },
    customerReplies: [],
    createdAt: "2026-09-08 02:30 PM",
    updatedAt: "2026-09-08 05:15 PM"
  },
  {
    id: "REV-104",
    productId: "PROD-19",
    productName: "Virgin Coconut Oil (500 ml)",
    productCategory: "Cold Pressed Oils",
    productImage: "/assets/janani-products.jpg",
    customerId: "CUST-1004",
    customerName: "Divya Nair",
    customerEmail: "divya.nair@gmail.com",
    customerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    orderId: "ORD-94715",
    rating: 5,
    title: "Unrefined raw scent with solid snow-white crystal texture",
    comment: "Unfiltered with natural sweet coconut notes. Genuine raw oil without sulphur bleaching. Great for both Kerala curries and hair nourishment.",
    images: [
      { id: "IMG-104A", url: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80", caption: "Glass jar packaging", status: "Approved" }
    ],
    verifiedPurchase: true,
    status: "Pending",
    isFeatured: false,
    helpfulCount: 5,
    abuseReportsCount: 0,
    abuseReports: [],
    adminReply: null,
    customerReplies: [],
    createdAt: "2026-09-11 10:15 AM",
    updatedAt: "2026-09-11 10:15 AM"
  },
  {
    id: "REV-105",
    productId: "PROD-9",
    productName: "Unpolished Toor Dal (500 g)",
    productCategory: "Pulses",
    productImage: "/assets/janani-products.jpg",
    customerId: "CUST-1005",
    customerName: "Meera Krishnan",
    customerEmail: "meera.k@yahoo.in",
    customerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    orderId: "ORD-94680",
    rating: 5,
    title: "Cooks fast and makes rich, creamy sambar!",
    comment: "Zero water polishing or oil coating. Cooks evenly in 3 whistles and creates the thickest, most flavorful sambar. You can taste the purity compared to supermarket brands.",
    images: [],
    verifiedPurchase: true,
    status: "Pending",
    isFeatured: false,
    helpfulCount: 2,
    abuseReportsCount: 0,
    abuseReports: [],
    adminReply: null,
    customerReplies: [],
    createdAt: "2026-09-11 08:30 AM",
    updatedAt: "2026-09-11 08:30 AM"
  },
  {
    id: "REV-106",
    productId: "PROD-18",
    productName: "Black Pepper Whole (150 g)",
    productCategory: "Spices",
    productImage: "/assets/janani-products.jpg",
    customerId: "CUST-1006",
    customerName: "Vikram Malhotra",
    customerEmail: "vikram.m@gmail.com",
    customerAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80",
    orderId: "ORD-94640",
    rating: 5,
    title: "Bold Tellicherry grade peppercorns with intense heat",
    comment: "Big berries, heavy density, and incredible piperine bite when freshly crushed in a pepper mill. Will definitely reorder!",
    images: [
      { id: "IMG-106A", url: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80", caption: "Bold size peppercorns", status: "Approved" }
    ],
    verifiedPurchase: true,
    status: "Approved",
    isFeatured: true,
    helpfulCount: 14,
    abuseReportsCount: 0,
    abuseReports: [],
    adminReply: null,
    customerReplies: [],
    createdAt: "2026-09-06 01:20 PM",
    updatedAt: "2026-09-06 01:20 PM"
  },
  {
    id: "REV-107",
    productId: "PROD-11",
    productName: "Natural Jaggery Powder (500 g)",
    productCategory: "Dry Fruits",
    productImage: "/assets/janani-products.jpg",
    customerId: "CUST-1007",
    customerName: "Ananya Deshmukh",
    customerEmail: "ananya.d@gmail.com",
    customerAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    orderId: "ORD-94590",
    rating: 5,
    title: "Chemical-free unbleached sweetness for chai and desserts",
    comment: "Doesn't curdle milk when added to hot tea! That proves it is 100% free of baking soda and sodium hydrosulphite. Perfect caramel notes.",
    images: [],
    verifiedPurchase: true,
    status: "Approved",
    isFeatured: false,
    helpfulCount: 22,
    abuseReportsCount: 0,
    abuseReports: [],
    adminReply: {
      authorName: "Kavitha Ranganathan",
      authorRole: "Customer Delight Lead",
      message: "Hi Ananya, thank you! Our organic sugarcane juice is clarified using plant extracts (Bhindi mucilage) rather than harmful chemicals. Enjoy your daily chai!",
      repliedAt: "2026-09-05 11:40 AM"
    },
    customerReplies: [],
    createdAt: "2026-09-05 09:10 AM",
    updatedAt: "2026-09-05 11:40 AM"
  },
  {
    id: "REV-108",
    productId: "PROD-21",
    productName: "Almonds Premium (500 g)",
    productCategory: "Dry Fruits",
    productImage: "/assets/janani-products.jpg",
    customerId: "CUST-1008",
    customerName: "Karan Johar B.",
    customerEmail: "karan.j@gmail.com",
    customerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    orderId: "ORD-94510",
    rating: 2,
    title: "Outer carton was squashed during courier transit",
    comment: "Almonds inside were intact and crunchy, but the outer box arrived crushed and tape was loose. BlueDart logistics in Pune needs improvement.",
    images: [
      { id: "IMG-108A", url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80", caption: "Damaged outer shipping carton", status: "Approved" }
    ],
    verifiedPurchase: true,
    status: "Approved",
    isFeatured: false,
    helpfulCount: 8,
    abuseReportsCount: 1,
    abuseReports: [
      { id: "ABUSE-1", reporterName: "Store Auditor", reason: "Irrelevant / Courier Issue", reportedAt: "2026-09-04 02:30 PM" }
    ],
    adminReply: {
      authorName: "Doddi Sai Rama",
      authorRole: "Founder",
      message: "Dear Karan, we sincerely apologize for the transit mishandling. We have escalated this directly to the BlueDart zonal manager and added double air-column cushioning for all fragile parcels.",
      repliedAt: "2026-09-04 04:00 PM"
    },
    customerReplies: [],
    createdAt: "2026-09-04 11:15 AM",
    updatedAt: "2026-09-04 04:00 PM"
  },
  {
    id: "REV-109",
    productId: "PROD-1",
    productName: "Organic Basmati Rice (1 kg)",
    productCategory: "Organic Rice",
    productImage: "/assets/janani-products.jpg",
    customerId: "CUST-9999",
    customerName: "SpamBot 2000",
    customerEmail: "freegiftcards99@fakemail.org",
    customerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    orderId: null,
    rating: 1,
    title: "GET FREE ₹5000 AMAZON VOUCHERS AT HTTP://SPAM-LINK.XYZ",
    comment: "Visit http://free-crypto-giveaway.xyz to claim your instant cash prizes right now! Limited slots available!",
    images: [],
    verifiedPurchase: false,
    status: "Rejected",
    rejectionReason: "Competitor Spam / Promotion & Malicious Links",
    isFeatured: false,
    helpfulCount: 0,
    abuseReportsCount: 3,
    abuseReports: [
      { id: "ABUSE-2", reporterName: "AI Abuse Shield", reason: "Spam / Promotion", reportedAt: "2026-09-03 01:10 PM" },
      { id: "ABUSE-3", reporterName: "Pooja Hegde", reason: "Spam / Promotion", reportedAt: "2026-09-03 01:25 PM" }
    ],
    adminReply: null,
    customerReplies: [],
    createdAt: "2026-09-03 01:00 PM",
    updatedAt: "2026-09-03 01:30 PM"
  },
  {
    id: "REV-110",
    productId: "PROD-7",
    productName: "Cold-Pressed Mustard Oil (1 L)",
    productCategory: "Cold Pressed Oils",
    productImage: "/assets/janani-products.jpg",
    customerId: "CUST-8888",
    customerName: "Anonymous Troller",
    customerEmail: "trolluser@tempmail.com",
    customerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    orderId: null,
    rating: 1,
    title: "Horrible fake products don't buy anything from here!!!",
    comment: "All items are completely adulterated and toxic junk from fake farms. Go buy from Brand XYZ instead which is 100x better!",
    images: [],
    verifiedPurchase: false,
    status: "Rejected",
    rejectionReason: "Fake / Unverified Accusations without purchase proof",
    isFeatured: false,
    helpfulCount: 0,
    abuseReportsCount: 2,
    abuseReports: [
      { id: "ABUSE-4", reporterName: "Automated Fraud Shield", reason: "Fake / Inaccurate", reportedAt: "2026-09-02 04:15 PM" }
    ],
    adminReply: null,
    customerReplies: [],
    createdAt: "2026-09-02 04:00 PM",
    updatedAt: "2026-09-02 04:20 PM"
  }
];

let adminReturns = [
  { id: "RET-501", orderId: "ORD-94807", customer: "Kunal Singhania", product: "Royal Basmati Rice (10kg)", reason: "Ordered duplicate size by mistake", type: "Bank Refund", amount: 3500, status: "Refund Completed", date: "2026-09-10" },
  { id: "RET-502", orderId: "ORD-94750", customer: "Harish Gupta", product: "Cold Pressed Mustard Oil (1L)", reason: "Outer seal damaged in transit", type: "Free Replacement", amount: 340, status: "Replacement Dispatched", date: "2026-09-08" },
  { id: "RET-503", orderId: "ORD-94712", customer: "Shweta Tiwari", product: "Kashmiri Saffron (1g)", reason: "Late delivery request cancelled", type: "Store Credit", amount: 549, status: "Under Review", date: "2026-09-06" }
];

let adminRoles = [
  { id: "ROLE-1", name: "Doddi Sai Rama", email: "admin@jananiagro.com", role: "Super Admin", permissions: ["all"], status: "Active", lastLogin: "Just now" },
  { id: "ROLE-2", name: "Suresh Patwardhan", email: "operations@jananiagro.com", role: "Warehouse & Logistics Manager", permissions: ["orders", "inventory", "shipping"], status: "Active", lastLogin: "2 hours ago" },
  { id: "ROLE-3", name: "Kavitha Ranganathan", email: "support@jananiagro.com", role: "Customer Delight Lead", permissions: ["orders", "reviews", "returns", "inquiries"], status: "Active", lastLogin: "Yesterday" }
];

export const getDashboardStats = (req, res) => {
  const stats = {
    todayOrders: 38,
    todayOrdersTrend: "+14.2%",
    todayRevenue: 84250,
    todayRevenueTrend: "+18.6%",
    monthlyRevenue: 2485600,
    monthlyRevenueTrend: "+24.5%",
    pendingOrders: 9,
    deliveredOrders: 412,
    cancelledOrders: 4,
    refundRequests: 3,
    activeUsers: 1420,
    activeUsersTrend: "+8.9%",
    outOfStockProducts: 1,
    lowStockProducts: 4,
    couponsUsedToday: 47,
    referralEarnings: 38500,
    referralEarningsTrend: "+31.2%"
  };
  res.json({ success: true, data: stats });
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
      { category: "Cold Pressed Oils", revenue: 890000, units: 1420 },
      { category: "Aged Basmati Rice", revenue: 760000, units: 980 },
      { category: "Organic Pulses & Dals", revenue: 420000, units: 1840 },
      { category: "Raw Spices & Herbs", revenue: 285000, units: 820 },
      { category: "Artisanal Sweeteners", revenue: 130600, units: 640 }
    ],
    topProducts: [
      { name: "Royal Aged Basmati Rice (5kg)", sales: 485000, units: 580 },
      { name: "Wood Fired Groundnut Oil (5L)", sales: 435000, units: 300 },
      { name: "A2 Vedic Gir Cow Ghee (1L)", sales: 378000, units: 180 },
      { name: "Unpolished Organic Toor Dal", sales: 294000, units: 1400 },
      { name: "Pure Kachi Ghani Mustard Oil", sales: 210000, units: 620 }
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
    bestSellingBrand: { name: "Janani Gold Heritage Reserve", share: "44.8%", topProduct: "Wood Pressed Groundnut Oil" },
    lowInventoryAlerts: [
      { id: "kashmiri-saffron", name: "Kashmiri Mongra Saffron (1g)", stock: 8, threshold: 25, status: "Critical" },
      { id: "organic-black-wheat", name: "Stone Ground Black Wheat (5kg)", stock: 14, threshold: 30, status: "Low Stock" },
      { id: "wild-honey", name: "Wild Forest Raw Multiflora Honey", stock: 19, threshold: 40, status: "Low Stock" },
      { id: "a2-desi-ghee", name: "A2 Vedic Gir Cow Bilona Ghee (1L)", stock: 0, threshold: 20, status: "Out of Stock" }
    ]
  };
  res.json({ success: true, data });
};

// ==========================================
// 📦 JANANI AGRO ORDERS CONTROLLER
// ==========================================

export const getAdminOrders = (req, res) => {
  const {
    status = "all",
    paymentStatus = "all",
    warehouse = "all",
    courier = "all",
    search = "",
    sortBy = "newest"
  } = req.query;

  let results = [...adminOrders];

  // Status Filter
  if (status !== "all") {
    if (status === "Cancelled / Returns") {
      results = results.filter(o => o.orderStatus === "Cancelled" || o.orderStatus === "Refunded" || o.orderStatus === "Returned");
    } else {
      results = results.filter(o => o.orderStatus.toLowerCase() === status.toLowerCase());
    }
  }

  // Payment Status Filter
  if (paymentStatus !== "all") {
    results = results.filter(o => o.paymentStatus.toLowerCase() === paymentStatus.toLowerCase());
  }

  // Warehouse Filter
  if (warehouse !== "all") {
    results = results.filter(o => o.warehouse?.id === warehouse || o.warehouse?.name.toLowerCase().includes(warehouse.toLowerCase()));
  }

  // Courier Filter
  if (courier !== "all") {
    results = results.filter(o => o.courier?.toLowerCase().includes(courier.toLowerCase()));
  }

  // Search Filter
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q) ||
      o.trackingId?.toLowerCase().includes(q) ||
      o.shippingAddress?.city?.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortBy === "newest") {
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortBy === "amount_desc") {
    results.sort((a, b) => b.total - a.total);
  } else if (sortBy === "amount_asc") {
    results.sort((a, b) => a.total - b.total);
  }

  const pendingCount = adminOrders.filter(o => o.orderStatus === "Pending").length;
  const processingCount = adminOrders.filter(o => o.orderStatus === "Processing").length;
  const shippedCount = adminOrders.filter(o => o.orderStatus === "Shipped").length;
  const deliveredCount = adminOrders.filter(o => o.orderStatus === "Delivered").length;
  const cancelledCount = adminOrders.filter(o => o.orderStatus === "Cancelled" || o.orderStatus === "Refunded" || o.orderStatus === "Returned").length;
  const totalRevenue = adminOrders.reduce((sum, o) => o.paymentStatus === "Paid" ? sum + (o.total || 0) : sum, 0);

  res.json({
    success: true,
    count: results.length,
    total: adminOrders.length,
    pendingCount,
    processingCount,
    shippedCount,
    deliveredCount,
    cancelledCount,
    totalRevenue,
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
    rating: 4.9,
    reviewsCount: 0,
    image,
    gallery: gallery.length > 0 ? gallery : [image],
    variants: variants.length > 0 ? variants : [
      { id: `VAR-${Date.now()}-1`, name: unit, sku: generatedSku, price: Number(price), originalPrice: Number(originalPrice) || Math.round(Number(price) * 1.2), stock: availableStock }
    ],
    description,
    harvestOrigin,
    organicCertifications,
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
  const index = adminProducts.findIndex(p => p.id === id);
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

export const getAdminCustomers = (req, res) => {
  const {
    status = "all",
    tier = "all",
    search = "",
    sortBy = "spent_desc"
  } = req.query;

  let results = [...adminCustomers];

  // Status Filter
  if (status !== "all") {
    results = results.filter(c => c.status.toLowerCase() === status.toLowerCase());
  }

  // Tier Filter
  if (tier !== "all") {
    results = results.filter(c => c.tier.toLowerCase() === tier.toLowerCase());
  }

  // Search
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortBy === "spent_desc") {
    results.sort((a, b) => b.totalSpent - a.totalSpent);
  } else if (sortBy === "orders_desc") {
    results.sort((a, b) => b.totalOrders - a.totalOrders);
  } else if (sortBy === "wallet_desc") {
    results.sort((a, b) => b.walletBalance - a.walletBalance);
  } else if (sortBy === "newest") {
    results.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  }

  const activeCount = adminCustomers.filter(c => c.status === "Active").length;
  const suspendedCount = adminCustomers.filter(c => c.status === "Suspended").length;
  const inactiveCount = adminCustomers.filter(c => c.status === "Inactive").length;
  const totalLtv = adminCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalWallet = adminCustomers.reduce((sum, c) => sum + (c.walletBalance || 0), 0);
  const totalLoyalty = adminCustomers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);

  res.json({
    success: true,
    count: results.length,
    total: adminCustomers.length,
    activeCount,
    suspendedCount,
    inactiveCount,
    totalLtv,
    totalWallet,
    totalLoyalty,
    data: results
  });
};

export const getAdminCustomerById = (req, res) => {
  const { id } = req.params;
  const customer = adminCustomers.find(c => c.id === id);
  if (!customer) {
    return res.status(404).json({ success: false, message: "Customer profile not found" });
  }
  res.json({ success: true, data: customer });
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

export const updateAdminCustomer = (req, res) => {
  const { id } = req.params;
  const index = adminCustomers.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  adminCustomers[index] = {
    ...adminCustomers[index],
    ...req.body
  };

  res.json({ success: true, message: "Customer profile updated successfully", data: adminCustomers[index] });
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

export const getAdminCoupons = (req, res) => {
  const { search, type, status, sortBy = "newest" } = req.query;
  let results = [...adminCoupons];
  const now = new Date();

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
  const activeCount = adminCoupons.filter(c => c.active && new Date(c.expiryDate) >= now && c.uses < c.maxUses).length;
  const totalUses = adminCoupons.reduce((sum, c) => sum + (c.uses || 0), 0);
  const totalDiscountDisbursed = couponUsageHistory.reduce((sum, u) => sum + (u.discountAmount || 0), 0) + 142380;
  const totalInfluencedRevenue = couponUsageHistory.reduce((sum, u) => sum + (u.orderTotal || 0), 0) + 1284500;
  const avgOrderWithPromo = 3280;
  const topCoupon = [...adminCoupons].sort((a, b) => b.uses - a.uses)[0]?.code || "FIRSTORGANIC";

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
    total: adminCoupons.length,
    stats,
    data: results
  });
};

export const getAdminCouponById = (req, res) => {
  const { id } = req.params;
  const coupon = adminCoupons.find(c => c.id === id || c.code.toUpperCase() === id.toUpperCase());
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

  const usages = couponUsageHistory.filter(u => u.couponCode.toUpperCase() === coupon.code.toUpperCase());
  res.json({ success: true, data: { ...coupon, usageHistory: usages } });
};

export const createAdminCoupon = (req, res) => {
  const {
    code,
    title,
    description = "",
    type = "percentage",
    discount = 10,
    minCart = 999,
    maxDiscount = 500,
    startDate = new Date().toISOString(),
    expiryDate = "2026-12-31T23:59:59.000Z",
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

  const newCoupon = {
    id: `CPN-${Date.now().toString().slice(-4)}`,
    code: cleanCode,
    title: title || `${cleanCode} Promo Offer`,
    description: description || `Special discount promo offer on Janani Agro`,
    type: isFreeShipping ? "free_shipping" : type,
    discount: isFreeShipping ? 0 : Number(discount),
    minCart: Number(minCart) || 0,
    maxDiscount: Number(maxDiscount) || 500,
    startDate: startDate || new Date().toISOString(),
    expiryDate: expiryDate || "2026-12-31T23:59:59.000Z",
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

  adminCoupons.unshift(newCoupon);
  res.status(201).json({ success: true, message: `Coupon '${cleanCode}' created successfully!`, data: newCoupon });
};

export const updateAdminCoupon = (req, res) => {
  const { id } = req.params;
  const index = adminCoupons.findIndex(c => c.id === id || c.code.toUpperCase() === id.toUpperCase());
  if (index === -1) return res.status(404).json({ success: false, message: "Coupon not found" });

  adminCoupons[index] = {
    ...adminCoupons[index],
    ...req.body,
    code: req.body.code ? req.body.code.trim().toUpperCase() : adminCoupons[index].code
  };

  res.json({ success: true, message: `Coupon '${adminCoupons[index].code}' updated successfully`, data: adminCoupons[index] });
};

export const toggleAdminCoupon = (req, res) => {
  const { id } = req.params;
  const coupon = adminCoupons.find(c => c.id === id || c.code.toUpperCase() === id.toUpperCase());
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

  coupon.active = !coupon.active;
  res.json({ success: true, message: `Coupon '${coupon.code}' is now ${coupon.active ? 'active' : 'paused'}`, data: coupon });
};

export const deleteAdminCoupon = (req, res) => {
  const { id } = req.params;
  const index = adminCoupons.findIndex(c => c.id === id || c.code.toUpperCase() === id.toUpperCase());
  if (index === -1) return res.status(404).json({ success: false, message: "Coupon not found" });

  const deleted = adminCoupons.splice(index, 1)[0];
  res.json({ success: true, message: `Coupon '${deleted.code}' deleted successfully`, data: deleted });
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
      { category: "Cold Pressed Oils", percentage: 38 },
      { category: "A2 Desi Ghee & Dairy", percentage: 29 },
      { category: "Spices & Herbs", percentage: 18 },
      { category: "Organic Staples & Rice", percentage: 15 }
    ]
  };

  res.json({ success: true, data: analytics });
};

export const getAdminReviews = (req, res) => {
  const {
    status,
    rating,
    verified,
    hasImages,
    hasAbuse,
    search,
    sortBy = "newest"
  } = req.query;

  let filtered = [...adminReviews];

  if (status && status !== "all") {
    if (status === "flagged") {
      filtered = filtered.filter(r => r.abuseReportsCount > 0 || (r.abuseReports && r.abuseReports.length > 0));
    } else {
      filtered = filtered.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }
  }

  if (rating && rating !== "all") {
    filtered = filtered.filter(r => r.rating === Number(rating));
  }

  if (verified === "true") {
    filtered = filtered.filter(r => r.verifiedPurchase === true);
  }

  if (hasImages === "true") {
    filtered = filtered.filter(r => r.images && r.images.length > 0);
  }

  if (hasAbuse === "true") {
    filtered = filtered.filter(r => r.abuseReportsCount > 0);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerEmail.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortBy === "newest") {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === "oldest") {
    filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sortBy === "rating_high") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "rating_low") {
    filtered.sort((a, b) => a.rating - b.rating);
  } else if (sortBy === "helpful") {
    filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
  }

  const totalReviews = adminReviews.length;
  const approvedCount = adminReviews.filter(r => r.status === "Approved").length;
  const pendingCount = adminReviews.filter(r => r.status === "Pending").length;
  const rejectedCount = adminReviews.filter(r => r.status === "Rejected").length;
  const flaggedCount = adminReviews.filter(r => (r.abuseReportsCount || 0) > 0).length;
  const photoReviewsCount = adminReviews.filter(r => r.images && r.images.length > 0).length;
  const totalRatingSum = adminReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(1) : "5.0";

  const stats = {
    totalReviews,
    approvedCount,
    pendingCount,
    rejectedCount,
    flaggedCount,
    photoReviewsCount,
    averageRating: Number(averageRating),
    responseRate: "96.4%",
    recommendationRate: "94.8%"
  };

  res.json({
    success: true,
    count: filtered.length,
    total: totalReviews,
    stats,
    data: filtered
  });
};

export const getAdminReviewById = (req, res) => {
  const { id } = req.params;
  const review = adminReviews.find(r => r.id === id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });

  res.json({ success: true, data: review });
};

export const createAdminReview = (req, res) => {
  const {
    productId = "PROD-1",
    productName = "Organic Basmati Rice (1 kg)",
    productCategory = "Organic Rice",
    customerName,
    customerEmail,
    rating = 5,
    title,
    comment,
    images = [],
    verifiedPurchase = true
  } = req.body;

  if (!customerName || !comment || !title) {
    return res.status(400).json({ success: false, message: "Customer name, title, and review comment are required." });
  }

  const newReview = {
    id: `REV-${100 + adminReviews.length + 1}`,
    productId,
    productName,
    productCategory,
    productImage: "/assets/janani-products.jpg",
    customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName,
    customerEmail: customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    customerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    orderId: `ORD-${Math.floor(94000 + Math.random() * 1000)}`,
    rating: Number(rating),
    title,
    comment,
    images: Array.isArray(images) ? images : [],
    verifiedPurchase: Boolean(verifiedPurchase),
    status: "Approved",
    isFeatured: false,
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
    message: "Customer review recorded successfully!",
    data: newReview
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
    { name: "Organic Basmati Rice (1 kg)", reviewsCount: 38, averageRating: 4.9, recommendationRate: "98%" },
    { name: "Wood-Pressed Groundnut Oil (1 L)", reviewsCount: 32, averageRating: 4.9, recommendationRate: "97%" },
    { name: "Lakadong Turmeric Powder (200 g)", reviewsCount: 24, averageRating: 4.8, recommendationRate: "95%" },
    { name: "Black Pepper Whole (150 g)", reviewsCount: 19, averageRating: 4.9, recommendationRate: "96%" },
    { name: "Natural Jaggery Powder (500 g)", reviewsCount: 16, averageRating: 4.9, recommendationRate: "98%" }
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
  // Root Tier
  {
    id: "CAT-ROOT-1",
    name: "Organic Rice & Grains",
    slug: "organic-rice-grains",
    parentId: null,
    level: "root",
    description: "Pesticide-free heritage grains, naturally aged basmati, and single-origin millets.",
    icon: "🌾",
    image: "/images/cat-rice.jpg",
    bannerImage: "/images/banner-rice.jpg",
    featured: true,
    trending: true,
    active: true,
    orderIndex: 1,
    productsCount: 18,
    deletedAt: null,
    seo: {
      metaTitle: "Buy Organic Rice & Traditional Grains Online | Janani Agro",
      metaDescription: "Explore authentic aged Basmati rice, Black wheat, and nutrient-dense millets direct from organic farmers.",
      metaKeywords: "organic basmati rice, pesticide free rice, black wheat, kodo millet",
      canonicalUrl: "https://jananiagro.com/categories/organic-rice-grains",
      ogImage: "/images/og-rice.jpg"
    },
    createdAt: "2026-01-10"
  },
  {
    id: "CAT-ROOT-2",
    name: "Cold Pressed Oils",
    slug: "cold-pressed-oils",
    parentId: null,
    level: "root",
    description: "Traditional wooden expeller (Kachi Ghani) unrefined and chemical-free edible oils.",
    icon: "🫒",
    image: "/images/cat-oils.jpg",
    bannerImage: "/images/banner-oils.jpg",
    featured: true,
    trending: true,
    active: true,
    orderIndex: 2,
    productsCount: 14,
    deletedAt: null,
    seo: {
      metaTitle: "Wood Pressed & Kachi Ghani Oils | Pure Cold Pressed | Janani Agro",
      metaDescription: "Pure wood-pressed Groundnut, Mustard, Sesame, and Virgin Coconut oils without chemical solvents.",
      metaKeywords: "wood pressed oil, kachi ghani mustard, cold pressed groundnut oil",
      canonicalUrl: "https://jananiagro.com/categories/cold-pressed-oils",
      ogImage: "/images/og-oils.jpg"
    },
    createdAt: "2026-01-12"
  },
  {
    id: "CAT-ROOT-3",
    name: "Organic Pulses & Dals",
    slug: "organic-pulses-dals",
    parentId: null,
    level: "root",
    description: "Unpolished, naturally sun-dried dals with intact nutrient shells.",
    icon: "🥣",
    image: "/images/cat-pulses.jpg",
    bannerImage: "/images/banner-pulses.jpg",
    featured: true,
    trending: false,
    active: true,
    orderIndex: 3,
    productsCount: 16,
    deletedAt: null,
    seo: {
      metaTitle: "Unpolished Organic Pulses & Dals | High Protein Staples",
      metaDescription: "Shop unpolished Toor Dal, Moong, Chana, and Urad Dal. 100% free from mineral oil polish.",
      metaKeywords: "unpolished toor dal, organic moong dal, high protein pulses",
      canonicalUrl: "https://jananiagro.com/categories/organic-pulses-dals",
      ogImage: "/images/og-pulses.jpg"
    },
    createdAt: "2026-01-15"
  },
  {
    id: "CAT-ROOT-4",
    name: "Raw Spices & Herbs",
    slug: "raw-spices-herbs",
    parentId: null,
    level: "root",
    description: "High essential oil content, pesticide-free single-estate aromatic spices.",
    icon: "🌶️",
    image: "/images/cat-spices.jpg",
    bannerImage: "/images/banner-spices.jpg",
    featured: false,
    trending: true,
    active: true,
    orderIndex: 4,
    productsCount: 12,
    deletedAt: null,
    seo: {
      metaTitle: "Single Estate Organic Spices | Lakadong Turmeric & Kashmiri Saffron",
      metaDescription: "Authentic whole and ground spices with guaranteed curcumin and natural essential oils.",
      metaKeywords: "lakadong turmeric, kashmiri saffron, organic cumin seeds",
      canonicalUrl: "https://jananiagro.com/categories/raw-spices-herbs",
      ogImage: "/images/og-spices.jpg"
    },
    createdAt: "2026-01-20"
  },

  // Sub Category Tier (Level 2)
  {
    id: "CAT-SUB-1",
    name: "Basmati Rice Varieties",
    slug: "basmati-rice-varieties",
    parentId: "CAT-ROOT-1",
    level: "sub",
    description: "Long grain aromatic 1121 and Traditional Taraori Basmati aged for peak aroma.",
    icon: "🍚",
    image: "/images/sub-basmati.jpg",
    bannerImage: "/images/banner-sub-basmati.jpg",
    featured: true,
    trending: true,
    active: true,
    orderIndex: 5,
    productsCount: 8,
    deletedAt: null,
    seo: {
      metaTitle: "Aged Basmati Rice Varieties | Royal Long Grain | Janani Agro",
      metaDescription: "Discover naturally aged long-grain basmati rice varieties for biryanis and festive feasts.",
      metaKeywords: "aged basmati rice, 1121 basmati, taraori basmati",
      canonicalUrl: "https://jananiagro.com/categories/basmati-rice-varieties",
      ogImage: "/images/og-sub-basmati.jpg"
    },
    createdAt: "2026-02-01"
  },
  {
    id: "CAT-SUB-2",
    name: "Mustard & Seed Oils",
    slug: "mustard-seed-oils",
    parentId: "CAT-ROOT-2",
    level: "sub",
    description: "Slow crushed wooden expeller oils with pungency and natural antioxidants intact.",
    icon: "🌻",
    image: "/images/sub-mustard.jpg",
    bannerImage: "/images/banner-sub-mustard.jpg",
    featured: true,
    trending: false,
    active: true,
    orderIndex: 6,
    productsCount: 6,
    deletedAt: null,
    seo: {
      metaTitle: "Mustard & Cold Pressed Seed Oils | Janani Agro",
      metaDescription: "Pure Kachi Ghani Mustard and Sesame seed oils processed below 45°C.",
      metaKeywords: "kachi ghani mustard, sesame oil, wood expeller",
      canonicalUrl: "https://jananiagro.com/categories/mustard-seed-oils",
      ogImage: "/images/og-sub-mustard.jpg"
    },
    createdAt: "2026-02-05"
  },

  // Child Category Tier (Level 3)
  {
    id: "CAT-CHILD-1",
    name: "Royal Aged Basmati (24 Months)",
    slug: "royal-aged-basmati-24-months",
    parentId: "CAT-SUB-1",
    level: "child",
    description: "Extra long grain vintage harvest aged in humidity-controlled godowns.",
    icon: "👑",
    image: "/images/child-aged-basmati.jpg",
    bannerImage: "/images/banner-child-aged.jpg",
    featured: true,
    trending: true,
    active: true,
    orderIndex: 7,
    productsCount: 4,
    deletedAt: null,
    seo: {
      metaTitle: "24-Month Aged Royal Basmati Rice | Janani Agro Reserve",
      metaDescription: "Exclusive 2-year vintage aged royal basmati rice with guaranteed elongation and fragrance.",
      metaKeywords: "24 months aged basmati, reserve organic basmati",
      canonicalUrl: "https://jananiagro.com/categories/royal-aged-basmati-24-months",
      ogImage: "/images/og-child-aged.jpg"
    },
    createdAt: "2026-02-10"
  },
  {
    id: "CAT-CHILD-2",
    name: "Kachi Ghani Raw Mustard Oil",
    slug: "kachi-ghani-raw-mustard-oil",
    parentId: "CAT-SUB-2",
    level: "child",
    description: "Single-press organic yellow mustard with high pungency and omega-3 balance.",
    icon: "🟡",
    image: "/images/child-mustard.jpg",
    bannerImage: "/images/banner-child-mustard.jpg",
    featured: false,
    trending: true,
    active: true,
    orderIndex: 8,
    productsCount: 3,
    deletedAt: null,
    seo: {
      metaTitle: "Raw Kachi Ghani Yellow Mustard Oil | Pure Wood Pressed",
      metaDescription: "First-press yellow mustard oil for authentic Indian culinary delicacies.",
      metaKeywords: "yellow mustard oil, kachi ghani raw oil",
      canonicalUrl: "https://jananiagro.com/categories/kachi-ghani-raw-mustard-oil",
      ogImage: "/images/og-child-mustard.jpg"
    },
    createdAt: "2026-02-12"
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
  const index = adminCategories.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: "Category not found" });

  adminCategories[index] = {
    ...adminCategories[index],
    ...req.body,
    seo: {
      ...(adminCategories[index].seo || {}),
      ...(req.body.seo || {})
    }
  };

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
  const category = adminCategories.find(c => c.id === id);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });

  // Soft delete
  category.deletedAt = new Date().toISOString();
  res.json({ success: true, message: "Category moved to trash", data: category });
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

export let shipmentRecords = [
  {
    id: "SHP-882101",
    orderId: "ORD-94812",
    awbCode: "SR-BLR-884910",
    courier: "Shiprocket (Bluedart Air)",
    courierLogo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&q=80",
    pickupLocation: "Bengaluru Central Fulfillment Hub",
    customer: {
      name: "Ananya Sharma",
      phone: "+91 98451 22345",
      email: "ananya.s@gmail.com",
      address: "Flat 402, Green Glen Heights, Bellandur",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560103"
    },
    itemsCount: 4,
    itemsSummary: "A2 Gir Cow Ghee (500ml) x2, Wild Raw Honey (500g) x1, Virgin Groundnut Oil (1L) x1",
    packageWeight: "3.2 kg",
    dimensions: "32 x 22 x 18 cm",
    paymentType: "Prepaid (UPI)",
    orderAmount: 4040,
    shippingCharges: 115,
    status: "Delivered",
    etd: "2026-09-12",
    createdAt: "2026-09-11 10:45 AM",
    pickupDate: "2026-09-11 04:30 PM",
    deliveredAt: "2026-09-12 02:15 PM",
    trackingTimeline: [
      { status: "Manifested", title: "AWB Generated & Manifest Created", location: "Bengaluru Central Hub", time: "2026-09-11 11:15 AM", done: true },
      { status: "Picked Up", title: "Handed over to Bluedart Executive", location: "KIADB Hub, Bengaluru", time: "2026-09-11 04:45 PM", done: true },
      { status: "In Transit", title: "Departed Sorting Facility (Air Hub)", location: "HAL Airport Cargo Complex", time: "2026-09-11 09:20 PM", done: true },
      { status: "Out for Delivery", title: "Out for Doorstep Delivery", location: "Bellandur Delivery Center", time: "2026-09-12 09:00 AM", done: true },
      { status: "Delivered", title: "Delivered to Patron with OTP Verification", location: "Bengaluru, KA", time: "2026-09-12 02:15 PM", done: true }
    ]
  },
  {
    id: "SHP-882102",
    orderId: "ORD-94811",
    awbCode: "SR-HYD-552190",
    courier: "Shiprocket (Delhivery Surface)",
    courierLogo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&q=80",
    pickupLocation: "Bengaluru Central Fulfillment Hub",
    customer: {
      name: "Dr. Vikramaditya Rao",
      phone: "+91 97400 11928",
      email: "vikram.rao@aiims.edu",
      address: "B-12, Green Park Main, Near AIIMS Campus",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110016"
    },
    itemsCount: 5,
    itemsSummary: "Lakadong Turmeric (500g) x2, Kashmiri Saffron (2g) x1, A2 Gir Cow Ghee (1L) x2",
    packageWeight: "4.8 kg",
    dimensions: "38 x 28 x 20 cm",
    paymentType: "Prepaid (Razorpay Card)",
    orderAmount: 7600,
    shippingCharges: 165,
    status: "In Transit",
    etd: "2026-09-13",
    createdAt: "2026-09-11 09:15 AM",
    pickupDate: "2026-09-11 05:00 PM",
    deliveredAt: null,
    trackingTimeline: [
      { status: "Manifested", title: "Shipping Label Created", location: "Bengaluru Central Hub", time: "2026-09-11 10:00 AM", done: true },
      { status: "Picked Up", title: "Picked Up by Delhivery Logistics", location: "Bengaluru Central Hub", time: "2026-09-11 05:15 PM", done: true },
      { status: "In Transit", title: "Departed National Surface Transit Hub", location: "Nagpur Central Logistics Park", time: "2026-09-12 04:30 AM", done: true },
      { status: "Out for Delivery", title: "Awaiting Delhi Mother Hub Arrival", location: "Delhi NCR Cargo Zone", time: "Expected 2026-09-13", done: false },
      { status: "Delivered", title: "Doorstep Handover", location: "New Delhi", time: "Pending", done: false }
    ]
  },
  {
    id: "SHP-882103",
    orderId: "ORD-94810",
    awbCode: "SR-BOM-110294",
    courier: "Shiprocket (Ekart Logistics)",
    courierLogo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&q=80",
    pickupLocation: "Bengaluru Central Fulfillment Hub",
    customer: {
      name: "Sneha Mukherjee",
      phone: "+91 98301 77654",
      email: "sneha.m@kolkata.org",
      address: "14/A Ballygunge Circular Road, Flat 3B",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700019"
    },
    itemsCount: 2,
    itemsSummary: "Organic Black Wheat Atta (5kg) x2",
    packageWeight: "10.4 kg",
    dimensions: "45 x 30 x 25 cm",
    paymentType: "Cash on Delivery (COD)",
    orderAmount: 1450,
    shippingCharges: 210,
    status: "Out for Delivery",
    etd: "2026-09-12",
    createdAt: "2026-09-10 03:30 PM",
    pickupDate: "2026-09-10 06:00 PM",
    deliveredAt: null,
    trackingTimeline: [
      { status: "Manifested", title: "AWB Generated", location: "Bengaluru Central Hub", time: "2026-09-10 03:45 PM", done: true },
      { status: "Picked Up", title: "Package Picked Up", location: "Bengaluru Central Hub", time: "2026-09-10 06:10 PM", done: true },
      { status: "In Transit", title: "Arrived at Kolkata Hub", location: "Dankuni Logistics Center", time: "2026-09-12 05:00 AM", done: true },
      { status: "Out for Delivery", title: "Driver Out with COD Cash Bag (₹1,450)", location: "Ballygunge Delivery Station", time: "2026-09-12 08:30 AM", done: true },
      { status: "Delivered", title: "Delivered & Cash Collected", location: "Kolkata, WB", time: "In Progress", done: false }
    ]
  },
  {
    id: "SHP-882104",
    orderId: "ORD-94808",
    awbCode: "SR-NDR-772911",
    courier: "Shiprocket (Shadowfax Local)",
    courierLogo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&q=80",
    pickupLocation: "Hyderabad Agro-Logistics Depot",
    customer: {
      name: "Arjun Reddy",
      phone: "+91 99890 55432",
      email: "arjun.r@hyderabad.in",
      address: "Plot 88, Jubilee Hills Road No. 36",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500033"
    },
    itemsCount: 3,
    itemsSummary: "Wood Pressed Sesame Oil (1L) x2, Forest Raw Honey (500g) x1",
    packageWeight: "2.8 kg",
    dimensions: "28 x 20 x 16 cm",
    paymentType: "Cash on Delivery (COD)",
    orderAmount: 1850,
    shippingCharges: 85,
    status: "NDR / Action Required",
    etd: "2026-09-11",
    createdAt: "2026-09-10 11:20 AM",
    pickupDate: "2026-09-10 03:00 PM",
    deliveredAt: null,
    trackingTimeline: [
      { status: "Manifested", title: "Label Created", location: "Hyderabad Agro Depot", time: "2026-09-10 11:30 AM", done: true },
      { status: "Picked Up", title: "Dispatched via Shadowfax", location: "Hyderabad Agro Depot", time: "2026-09-10 03:15 PM", done: true },
      { status: "Out for Delivery", title: "Out for Doorstep Delivery", location: "Jubilee Hills Station", time: "2026-09-11 10:30 AM", done: true },
      { status: "NDR", title: "Delivery Failed: Customer Unavailable / Door Locked", location: "Hyderabad, TS", time: "2026-09-11 02:40 PM", done: true }
    ]
  },
  {
    id: "SHP-882105",
    orderId: "ORD-94806",
    awbCode: "SR-MAA-992144",
    courier: "Shiprocket (Xpressbees Surface)",
    courierLogo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&q=80",
    pickupLocation: "Bengaluru Central Fulfillment Hub",
    customer: {
      name: "Pooja Hegde",
      phone: "+91 97411 66522",
      email: "pooja.h@mangalore.edu",
      address: "Kadri Temple Road, Near Circuit House",
      city: "Mangaluru",
      state: "Karnataka",
      pincode: "575002"
    },
    itemsCount: 2,
    itemsSummary: "Cardamom & Clove Pack (250g) x1, A2 Vedic Bilona Ghee (1L) x1",
    packageWeight: "1.9 kg",
    dimensions: "24 x 18 x 14 cm",
    paymentType: "Prepaid (UPI)",
    orderAmount: 2600,
    shippingCharges: 95,
    status: "Ready for Pickup",
    etd: "2026-09-13",
    createdAt: "2026-09-11 01:10 PM",
    pickupDate: "2026-09-11 05:30 PM",
    deliveredAt: null,
    trackingTimeline: [
      { status: "Manifested", title: "AWB Generated & Slotted for Pickup", location: "Bengaluru Central Hub", time: "2026-09-11 01:15 PM", done: true },
      { status: "Pickup Scheduled", title: "Pickup Scheduled for 05:30 PM Slot", location: "Bengaluru Central Hub", time: "2026-09-11 01:20 PM", done: true }
    ]
  }
];

export let ndrRecords = [
  {
    id: "NDR-001",
    shipmentId: "SHP-882104",
    orderId: "ORD-94808",
    awbCode: "SR-NDR-772911",
    courier: "Shadowfax Local",
    customerName: "Arjun Reddy",
    customerPhone: "+91 99890 55432",
    city: "Hyderabad",
    reason: "Customer phone not reachable & premises locked",
    attemptCount: 1,
    lastAttemptDate: "2026-09-11 02:40 PM",
    orderValue: 1850,
    paymentMode: "COD",
    status: "Action Required", // "Action Required" | "Reattempt Scheduled" | "RTO Initiated" | "Resolved"
    actionHistory: []
  },
  {
    id: "NDR-002",
    shipmentId: "SHP-882098",
    orderId: "ORD-94792",
    awbCode: "SR-DEL-338291",
    courier: "Delhivery Surface",
    customerName: "Meenakshi Sundaram",
    customerPhone: "+91 94440 12890",
    city: "Chennai",
    reason: "Customer requested delivery on Sunday instead",
    attemptCount: 2,
    lastAttemptDate: "2026-09-10 04:15 PM",
    orderValue: 3400,
    paymentMode: "Prepaid",
    status: "Reattempt Scheduled",
    actionHistory: [
      { action: "Re-attempt Scheduled", date: "2026-09-11 10:00 AM", note: "Rescheduled for Sunday 10 AM by operations team" }
    ]
  }
];

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

export let paymentTransactions = [
  {
    id: "txn_rzp_9841280",
    orderId: "ORD-94812",
    gateway: "Razorpay",
    paymentMethod: "UPI (PhonePe)",
    customer: {
      name: "Ananya Sharma",
      email: "ananya.s@gmail.com",
      phone: "+91 98451 22345",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80"
    },
    grossAmount: 4040,
    gatewayFee: 0, // 0% UPI
    gstOnFee: 0,
    netSettledAmount: 4040,
    currency: "INR",
    status: "Captured", // "Captured" | "Pending" | "Failed" | "Refunded" | "Partially Refunded"
    bankUtr: "UTR-HDFC-9921448201",
    gatewayRef: "pay_NL8820491823",
    cardLast4: null,
    upiVpa: "ananya@ybl",
    refundedAmount: 0,
    settlementStatus: "Settled",
    settlementBatchId: "SETTL-2026-09-11-01",
    createdAt: "2026-09-11 10:45 AM",
    capturedAt: "2026-09-11 10:45 AM"
  },
  {
    id: "txn_rzp_9841279",
    orderId: "ORD-94811",
    gateway: "Razorpay",
    paymentMethod: "Credit Card (HDFC Visa)",
    customer: {
      name: "Dr. Vikramaditya Rao",
      email: "vikram.rao@aiims.edu",
      phone: "+91 97400 11928",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"
    },
    grossAmount: 7600,
    gatewayFee: 144.40, // 1.9%
    gstOnFee: 26.00,
    netSettledAmount: 7429.60,
    currency: "INR",
    status: "Captured",
    bankUtr: "UTR-ICICI-4412093811",
    gatewayRef: "pay_NL8819448190",
    cardLast4: "4242",
    upiVpa: null,
    refundedAmount: 0,
    settlementStatus: "Settled",
    settlementBatchId: "SETTL-2026-09-11-01",
    createdAt: "2026-09-11 09:15 AM",
    capturedAt: "2026-09-11 09:16 AM"
  },
  {
    id: "txn_cod_9841278",
    orderId: "ORD-94810",
    gateway: "COD (Cash on Delivery)",
    paymentMethod: "Cash on Delivery",
    customer: {
      name: "Sneha Mukherjee",
      email: "sneha.m@kolkata.org",
      phone: "+91 98301 77654",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80"
    },
    grossAmount: 1450,
    gatewayFee: 35.00, // Courier COD collection fee
    gstOnFee: 6.30,
    netSettledAmount: 1408.70,
    currency: "INR",
    status: "Pending", // In transit with courier
    bankUtr: null,
    gatewayRef: "COD-EKART-110294",
    cardLast4: null,
    upiVpa: null,
    refundedAmount: 0,
    settlementStatus: "Pending Courier Remittance",
    settlementBatchId: null,
    createdAt: "2026-09-10 03:30 PM",
    capturedAt: null
  },
  {
    id: "txn_str_9841277",
    orderId: "ORD-94809",
    gateway: "Stripe",
    paymentMethod: "International Card (Mastercard)",
    customer: {
      name: "Rajesh Kothari",
      email: "rajesh.k@gmail.com",
      phone: "+91 99201 44556",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80"
    },
    grossAmount: 3140,
    gatewayFee: 94.20, // 3%
    gstOnFee: 16.95,
    netSettledAmount: 3028.85,
    currency: "INR",
    status: "Partially Refunded",
    bankUtr: "UTR-CITI-8829104419",
    gatewayRef: "ch_3N8819283019",
    cardLast4: "8899",
    upiVpa: null,
    refundedAmount: 850,
    settlementStatus: "Settled",
    settlementBatchId: "SETTL-2026-09-10-02",
    createdAt: "2026-09-10 06:20 PM",
    capturedAt: "2026-09-10 06:21 PM"
  },
  {
    id: "txn_upi_9841276",
    orderId: "ORD-94807",
    gateway: "UPI Direct",
    paymentMethod: "UPI Direct (Google Pay)",
    customer: {
      name: "Pooja Hegde",
      email: "pooja.h@mangalore.edu",
      phone: "+91 97411 66522",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80"
    },
    grossAmount: 2600,
    gatewayFee: 0,
    gstOnFee: 0,
    netSettledAmount: 2600,
    currency: "INR",
    status: "Captured",
    bankUtr: "UTR-SBI-7729104822",
    gatewayRef: "upi_gpay_998129038",
    cardLast4: null,
    upiVpa: "pooja@okhdfcbank",
    refundedAmount: 0,
    settlementStatus: "Settled",
    settlementBatchId: "SETTL-2026-09-10-01",
    createdAt: "2026-09-10 01:10 PM",
    capturedAt: "2026-09-10 01:11 PM"
  },
  {
    id: "txn_rzp_9841275",
    orderId: "ORD-94805",
    gateway: "Razorpay",
    paymentMethod: "Credit Card",
    customer: {
      name: "Siddharth Verma",
      email: "siddharth.v@gmail.com",
      phone: "+91 98110 33445",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80"
    },
    grossAmount: 2200,
    gatewayFee: 41.80,
    gstOnFee: 7.52,
    netSettledAmount: 2150.68,
    currency: "INR",
    status: "Refunded",
    bankUtr: "UTR-HDFC-6638190281",
    gatewayRef: "pay_NL8799120938",
    cardLast4: "1122",
    upiVpa: null,
    refundedAmount: 2200,
    settlementStatus: "Settled",
    settlementBatchId: "SETTL-2026-09-09-01",
    createdAt: "2026-09-09 11:40 AM",
    capturedAt: "2026-09-09 11:41 AM"
  },
  {
    id: "txn_rzp_9841274",
    orderId: "ORD-94804",
    gateway: "Razorpay",
    paymentMethod: "UPI (Paytm)",
    customer: {
      name: "Meera Nair",
      email: "meera.n@kerala.org",
      phone: "+91 94470 55667",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80"
    },
    grossAmount: 1850,
    gatewayFee: 0,
    gstOnFee: 0,
    netSettledAmount: 0,
    currency: "INR",
    status: "Failed",
    bankUtr: null,
    gatewayRef: "pay_NL8788910293",
    cardLast4: null,
    upiVpa: "meera@paytm",
    refundedAmount: 0,
    settlementStatus: "Failed / Dropped",
    settlementBatchId: null,
    createdAt: "2026-09-09 09:15 AM",
    capturedAt: null
  }
];

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

export let refundRecords = [
  {
    id: "rfd_rzp_88410",
    transactionId: "txn_str_9841277",
    orderId: "ORD-94809",
    customerName: "Rajesh Kothari",
    customerEmail: "rajesh.k@gmail.com",
    refundType: "Partial Refund",
    amount: 850,
    totalOrderAmount: 3140,
    destination: "Original Payment Card (Stripe)",
    reason: "Damaged honey jar in transit - Partial credit approved",
    status: "Completed",
    gatewayRefundId: "re_3N8819283019_rfd1",
    processedAt: "2026-09-10 07:45 PM"
  },
  {
    id: "rfd_rzp_88409",
    transactionId: "txn_rzp_9841275",
    orderId: "ORD-94805",
    customerName: "Siddharth Verma",
    customerEmail: "siddharth.v@gmail.com",
    refundType: "Full Refund",
    amount: 2200,
    totalOrderAmount: 2200,
    destination: "Customer Store Wallet Credit (Instant)",
    reason: "Customer requested cancellation before warehouse dispatch",
    status: "Completed",
    gatewayRefundId: "rfnd_NL8799120938_wal",
    processedAt: "2026-09-09 01:20 PM"
  }
];

export let settlementReports = [
  {
    batchId: "SETTL-2026-09-11-01",
    gateway: "Razorpay (UPI / Cards)",
    settlementDate: "2026-09-11",
    transactionsCount: 18,
    grossVolume: 48650.00,
    gatewayDeductions: 412.30,
    netBankDeposit: 48237.70,
    bankAccount: "HDFC Bank (A/C: ****2211)",
    bankUtr: "UTR-HDFC-SETTL-9912048",
    status: "Settled to Bank"
  },
  {
    batchId: "SETTL-2026-09-10-02",
    gateway: "Stripe International",
    settlementDate: "2026-09-10",
    transactionsCount: 4,
    grossVolume: 12450.00,
    gatewayDeductions: 373.50,
    netBankDeposit: 12076.50,
    bankAccount: "HDFC Bank (A/C: ****2211)",
    bankUtr: "UTR-CITI-SETTL-3382910",
    status: "Settled to Bank"
  },
  {
    batchId: "SETTL-2026-09-10-01",
    gateway: "UPI Direct (GPay / PhonePe)",
    settlementDate: "2026-09-10",
    transactionsCount: 22,
    grossVolume: 34800.00,
    gatewayDeductions: 0.00,
    netBankDeposit: 34800.00,
    bankAccount: "HDFC Bank (A/C: ****2211)",
    bankUtr: "UTR-UPI-DIRECT-INSTANT",
    status: "Instant Real-Time Settlement"
  },
  {
    batchId: "SETTL-2026-09-09-01",
    gateway: "Shiprocket COD Remittance",
    settlementDate: "2026-09-09",
    transactionsCount: 12,
    grossVolume: 19800.00,
    gatewayDeductions: 420.00,
    netBankDeposit: 19380.00,
    bankAccount: "HDFC Bank (A/C: ****2211)",
    bankUtr: "UTR-SR-COD-8829104",
    status: "Settled to Bank"
  }
];

export let failedPaymentRetries = [
  {
    id: "REC-9921",
    customerName: "Meera Nair",
    customerEmail: "meera.n@kerala.org",
    customerPhone: "+91 94470 55667",
    cartAmount: 1850,
    cartItems: "Lakadong Turmeric (500g) x1, A2 Vedic Gir Cow Ghee (500ml) x1",
    failureReason: "UPI App session timed out / VPA rejected",
    errorCode: "BAD_REQUEST_PAYMENT_TIMEDOUT",
    failedAt: "2026-09-09 09:15 AM",
    recoveryStatus: "Pending Link Send", // "Pending Link Send" | "Link Sent" | "Recovered" | "Converted to COD"
    retryLink: "https://jananiagro.com/checkout/pay?token=rec_9921_retry",
    lastSentAt: null
  },
  {
    id: "REC-9920",
    customerName: "Gaurav Sen",
    customerEmail: "gaurav.s@gmail.com",
    customerPhone: "+91 98200 77112",
    cartAmount: 3200,
    cartItems: "Stone Ground Black Wheat (5kg) x2, Wild Multiflora Honey (1kg) x1",
    failureReason: "Card issuing bank 3D-Secure OTP verification failed",
    errorCode: "CARD_AUTHENTICATION_FAILED",
    failedAt: "2026-09-08 04:30 PM",
    recoveryStatus: "Recovered",
    retryLink: "https://jananiagro.com/checkout/pay?token=rec_9920_retry",
    lastSentAt: "2026-09-08 04:35 PM"
  }
];

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

export let referralRecords = [
  {
    id: "REF-1001",
    referrerId: "CUST-001",
    referrerName: "Aarav Patel",
    referrerEmail: "aarav.patel@gmail.com",
    referrerCode: "AARAV-AGRO-22",
    referrerTier: "Silver",
    refereeName: "Neha Sharma",
    refereeEmail: "neha.sharma@yahoo.com",
    refereePhone: "+91 98201 11223",
    orderId: "ORD-99214",
    orderTotal: 1850,
    orderStatus: "Delivered",
    rewardAmount: 150,
    status: "Approved",
    createdAt: "2026-09-01 10:30 AM",
    holdingExpiryDate: "2026-09-08 10:30 AM",
    approvedAt: "2026-09-08 04:30 PM",
    rejectedAt: null,
    rejectionReason: null,
    fraudScore: "Low (0.02)"
  },
  {
    id: "REF-1002",
    referrerId: "CUST-002",
    referrerName: "Priya Sundaram",
    referrerEmail: "priya.sundaram@outlook.com",
    referrerCode: "PRIYA-AGRO-91",
    referrerTier: "Silver",
    refereeName: "Rajesh Gupta",
    refereeEmail: "rajesh.gupta@gmail.com",
    refereePhone: "+91 98765 44321",
    orderId: "ORD-99248",
    orderTotal: 2450,
    orderStatus: "Delivered",
    rewardAmount: 150,
    status: "Pending",
    createdAt: "2026-09-07 02:15 PM",
    holdingExpiryDate: "Tomorrow 05:00 PM",
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    fraudScore: "Low (0.05)"
  },
  {
    id: "REF-1003",
    referrerId: "CUST-003",
    referrerName: "Chef Sanjeev Kitchen",
    referrerEmail: "chef.sanjeev@healthykitchen.in",
    referrerCode: "CHEF-SANJEEV-01",
    referrerTier: "Gold",
    refereeName: "Vikram Malhotra",
    refereeEmail: "vikram.m@corporatemail.com",
    refereePhone: "+91 98112 33445",
    orderId: "ORD-99301",
    orderTotal: 4200,
    orderStatus: "Delivered",
    rewardAmount: 225,
    status: "Approved",
    createdAt: "2026-09-02 04:00 PM",
    holdingExpiryDate: "2026-09-09 04:00 PM",
    approvedAt: "2026-09-09 11:15 AM",
    rejectedAt: null,
    rejectionReason: null,
    fraudScore: "Low (0.01)"
  },
  {
    id: "REF-1004",
    referrerId: "CUST-004",
    referrerName: "Kavya Wellness",
    referrerEmail: "kavya@wellnesshub.org",
    referrerCode: "KAVYA-WELLNESS-05",
    referrerTier: "Platinum",
    refereeName: "Ananya Joshi",
    refereeEmail: "ananya.joshi@gmail.com",
    refereePhone: "+91 99001 88776",
    orderId: "ORD-99320",
    orderTotal: 1299,
    orderStatus: "In Transit",
    rewardAmount: 225,
    status: "Pending",
    createdAt: "2026-09-09 11:45 AM",
    holdingExpiryDate: "2026-09-16 11:45 AM",
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    fraudScore: "Low (0.04)"
  },
  {
    id: "REF-1005",
    referrerId: "CUST-005",
    referrerName: "Pooja Hegde",
    referrerEmail: "pooja.hegde@organiclife.com",
    referrerCode: "POOJA-ORGANIC-77",
    referrerTier: "Silver",
    refereeName: "Deepak Verma",
    refereeEmail: "deepak.verma@rediffmail.com",
    refereePhone: "+91 98450 12398",
    orderId: "ORD-99342",
    orderTotal: 899,
    orderStatus: "Returned",
    rewardAmount: 150,
    status: "Rejected",
    createdAt: "2026-09-03 09:10 AM",
    holdingExpiryDate: "2026-09-10 09:10 AM",
    approvedAt: null,
    rejectedAt: "2026-09-10 02:20 PM",
    rejectionReason: "Order Returned & Full Refund Processed",
    fraudScore: "Medium (0.42)"
  },
  {
    id: "REF-1006",
    referrerId: "CUST-006",
    referrerName: "Rohan Mehra",
    referrerEmail: "rohan.mehra@gmail.com",
    referrerCode: "ROHAN-AGRO-11",
    referrerTier: "Silver",
    refereeName: "Suresh Nair",
    refereeEmail: "suresh.nair@nairassociates.com",
    refereePhone: "+91 97401 55667",
    orderId: "ORD-99365",
    orderTotal: 3100,
    orderStatus: "Delivered",
    rewardAmount: 150,
    status: "Pending",
    createdAt: "2026-09-08 03:30 PM",
    holdingExpiryDate: "2026-09-15 03:30 PM",
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    fraudScore: "Low (0.03)"
  },
  {
    id: "REF-1007",
    referrerId: "CUST-007",
    referrerName: "Meera Nambiar",
    referrerEmail: "meera.nambiar@gmail.com",
    referrerCode: "MEERA-AGRO-44",
    referrerTier: "Silver",
    refereeName: "Shreya Sen",
    refereeEmail: "shreya.sen@kolkataarts.in",
    refereePhone: "+91 98300 44556",
    orderId: "ORD-99380",
    orderTotal: 1650,
    orderStatus: "Delivered",
    rewardAmount: 150,
    status: "Approved",
    createdAt: "2026-08-28 01:00 PM",
    holdingExpiryDate: "2026-09-04 01:00 PM",
    approvedAt: "2026-09-05 10:00 AM",
    rejectedAt: null,
    rejectionReason: null,
    fraudScore: "Low (0.01)"
  },
  {
    id: "REF-1008",
    referrerId: "CUST-008",
    referrerName: "Vikram Malhotra",
    referrerEmail: "vikram.m@corporatemail.com",
    referrerCode: "VIKRAM-AGRO-88",
    referrerTier: "Silver",
    refereeName: "Vikram Malhotra (Alt)",
    refereeEmail: "vikram.personal@gmail.com",
    refereePhone: "+91 98112 33445",
    orderId: "ORD-99399",
    orderTotal: 750,
    orderStatus: "Cancelled",
    rewardAmount: 150,
    status: "Rejected",
    createdAt: "2026-09-06 05:40 PM",
    holdingExpiryDate: "2026-09-13 05:40 PM",
    approvedAt: null,
    rejectedAt: "2026-09-07 11:00 AM",
    rejectionReason: "Self-Referral IP Match & Same Phone Detected",
    fraudScore: "High (0.95)"
  }
];

export let globalWalletTransactions = [
  {
    id: "TXN-WAL-101",
    customerId: "CUST-001",
    customerName: "Aarav Patel",
    customerEmail: "aarav.patel@gmail.com",
    type: "credit",
    amount: 150,
    balanceAfter: 450,
    category: "Referral Reward",
    referenceId: "REF-1001",
    notes: "Referral reward approved for Neha Sharma's order ORD-99214",
    createdAt: "2026-09-08 04:30 PM"
  },
  {
    id: "TXN-WAL-102",
    customerId: "CUST-003",
    customerName: "Chef Sanjeev Kitchen",
    customerEmail: "chef.sanjeev@healthykitchen.in",
    type: "credit",
    amount: 225,
    balanceAfter: 1425,
    category: "Referral Reward",
    referenceId: "REF-1003",
    notes: "Gold Tier 1.5x commission approved for Vikram Malhotra's order ORD-99301",
    createdAt: "2026-09-09 11:15 AM"
  },
  {
    id: "TXN-WAL-103",
    customerId: "CUST-002",
    customerName: "Neha Sharma",
    customerEmail: "neha.sharma@yahoo.com",
    type: "debit",
    amount: 200,
    balanceAfter: 100,
    category: "Order Payment",
    referenceId: "ORD-99255",
    notes: "Redeemed wallet points at checkout for Cold Pressed Oils",
    createdAt: "2026-09-09 02:40 PM"
  },
  {
    id: "TXN-WAL-104",
    customerId: "CUST-009",
    customerName: "Rajesh Gupta",
    customerEmail: "rajesh.gupta@gmail.com",
    type: "credit",
    amount: 50,
    balanceAfter: 50,
    category: "Signup Bonus",
    referenceId: "WELCOME-50",
    notes: "New account registration welcome bonus credited",
    createdAt: "2026-09-10 10:00 AM"
  },
  {
    id: "TXN-WAL-105",
    customerId: "CUST-002",
    customerName: "Priya Sundaram",
    customerEmail: "priya.sundaram@outlook.com",
    type: "credit",
    amount: 250,
    balanceAfter: 650,
    category: "Manual Admin Credit",
    referenceId: "ADJ-ADMIN-01",
    notes: "Customer goodwill compensation for delivery delay",
    createdAt: "2026-09-10 03:20 PM"
  },
  {
    id: "TXN-WAL-106",
    customerId: "CUST-010",
    customerName: "Ananya Joshi",
    customerEmail: "ananya.joshi@gmail.com",
    type: "credit",
    amount: 65,
    balanceAfter: 115,
    category: "Order Cashback",
    referenceId: "ORD-99320",
    notes: "5% Prepaid Razorpay UPI order cashback credited",
    createdAt: "2026-09-10 06:15 PM"
  },
  {
    id: "TXN-WAL-107",
    customerId: "CUST-007",
    customerName: "Meera Nambiar",
    customerEmail: "meera.nambiar@gmail.com",
    type: "debit",
    amount: 150,
    balanceAfter: 200,
    category: "Order Payment",
    referenceId: "ORD-99410",
    notes: "Applied wallet credits on A2 Desi Ghee purchase",
    createdAt: "2026-09-11 09:30 AM"
  }
];

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
      { rank: 3, name: "Chef Sanjeev Kitchen", code: "CHEF-SANJEEV-01", tier: "Gold", successfulReferrals: 84, revenueDriven: 96000, commissionEarned: 12600 },
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
  { id: "sec-categories", type: "categories", name: "Category Harvest Grid", description: "Visual grid cards linking to organic pantry categories", enabled: true, order: 4 },
  { id: "sec-flash-sale", type: "flash_sale", name: "Flash Harvest Sale", description: "Time-limited urgent deals with real-time countdown timer", enabled: true, order: 5 },
  { id: "sec-featured", type: "featured_products", name: "Featured Products Showcase", description: "Curated seasonal finest harvest staples", enabled: true, order: 6 },
  { id: "sec-trending", type: "trending_products", name: "Trending This Week", description: "Top trending items gaining maximum momentum", enabled: true, order: 7 },
  { id: "sec-story", type: "brand_story", name: "Our Roots & Organic Vision", description: "Traditional wisdom, farm traceability, and brand philosophy", enabled: true, order: 8 },
  { id: "sec-best-seller", type: "best_sellers", name: "Best Sellers Pantry", description: "Highest rated crowd favorite pantry staples", enabled: true, order: 9 },
  { id: "sec-new-arrivals", type: "new_arrivals", name: "Fresh Harvest New Arrivals", description: "Recently harvested seasonal additions", enabled: true, order: 10 },
  { id: "sec-testimonials", type: "testimonials", name: "Community Reviews & Proof", description: "Verified customer testimonials and star ratings", enabled: true, order: 11 },
  { id: "sec-faq", type: "faq", name: "Pantry FAQs & Accordion", description: "Clear answers on organic purity, sourcing & shipping", enabled: true, order: 12 }
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
    title: "Cold-Pressed Vaagai Wood Chekku Oils",
    eyebrow: "Authentic Marachekku Extraction",
    subtitle: "Extracted under 38°C in single-origin batches to preserve natural aroma, vitamin E, and natural antioxidants.",
    primaryCtaLabel: "Shop Cold-Pressed Oils",
    primaryCtaUrl: "/categories/cold-pressed-oils",
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
    title: "Royal 2-Year Aged Himalayan Basmati Rice",
    eyebrow: "Festive Harvest Special",
    subtitle: "Extra-long pearls with pristine grain elongation, aged traditionally in Himalayan foothills for festive dining.",
    primaryCtaLabel: "Order Basmati Rice",
    primaryCtaUrl: "/products/organic-basmati-rice",
    secondaryCtaLabel: "Explore All Grains",
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
    categorySlug: "organic-rice",
    title: "Heritage Organic Rice & Grains",
    subtitle: "Single-origin aromatic grains grown in chemical-free black soil",
    desktopImageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1000&auto=format&fit=crop&q=80",
    mobileImageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
    badge: "Pesticide Free",
    active: true
  },
  {
    id: "CAT-BAN-2",
    categorySlug: "cold-pressed-oils",
    title: "Vaagai Wood Cold Pressed Oils",
    subtitle: "Natural unbleached edible oils for daily wellness & authentic taste",
    desktopImageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1000&auto=format&fit=crop&q=80",
    mobileImageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
    badge: "Zero Sulphur",
    active: true
  },
  {
    id: "CAT-BAN-3",
    categorySlug: "spices",
    title: "High-Curcumin Lakadong Spices",
    subtitle: "Hand-pounded Meghalaya turmeric, Tellicherry pepper & Kashmiri saffron",
    desktopImageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1000&auto=format&fit=crop&q=80",
    mobileImageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80",
    badge: "7.5% Curcumin",
    active: true
  },
  {
    id: "CAT-BAN-4",
    categorySlug: "pulses",
    title: "Unpolished Traditional Pulses",
    subtitle: "Unpolished native dals rich in dietary fiber and plant protein",
    desktopImageUrl: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=1000&auto=format&fit=crop&q=80",
    mobileImageUrl: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=600&auto=format&fit=crop&q=80",
    badge: "Water Polish Free",
    active: true
  }
];

let flashSaleBanners = [
  {
    id: "FLASH-1",
    title: "Autumn Equinox 48-Hour Harvest Flash Sale",
    subtitle: "Flat 35% discount on pure Lakadong Turmeric, Himalayan Basmati & Virgin Coconut Oil.",
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
    subtitle: "Our most-loved pantry staples, chosen for aroma, flavour and honest nourishment.",
    productIds: [1, 6, 3, 19, 9, 18, 11, 21],
    layoutStyle: "grid",
    itemsLimit: 8,
    enabled: true
  },
  trending: {
    sectionKey: "trending",
    heading: "Trending This Week",
    eyebrow: "Customer Favorites",
    subtitle: "Most ordered organic kitchen staples across South and West India.",
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
    subtitle: "Pantry heroes with over 1,000+ five-star verified customer reviews.",
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
    targetProductSlug = "organic-basmati-rice",
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
    id: "seg_millets",
    name: "Organic Millets & Traditional Grains Buyers",
    description: "Customers who frequently buy Foxtail, Kodo, Barnyard millets and native rice",
    criteria: "Purchased Category: Millets or Rice >= 2 times",
    count: 4120,
    growthRate: "+15.0%",
    createdAt: "2026-04-12"
  }
];

export let marketingCampaigns = [
  {
    id: "CAMP-101",
    name: "Diwali Organic Sweetness & Cold Pressed Oils Extravaganza",
    channel: "email",
    type: "festival",
    subject: "✨ Celebrate Diwali with 100% Pure Cold-Pressed Sweetness & Free Ghee!",
    previewText: "Flat 25% OFF on traditional oils & native jaggery sweets. Code: DIWALI25",
    messageBody: "Dear {CustomerName},\n\nCelebrate this festive season with pure wood cold-pressed groundnut, sesame, and mustard oils, along with organic jaggery.\n\nUse coupon DIWALI25 to save 25% on your harvest basket.",
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
    name: "Flash Harvest Drop: Extra ₹200 OFF on Wood Pressed Oils",
    channel: "sms",
    type: "offer",
    subject: "SMS VIP Flash Drop",
    previewText: "Exclusive VIP deal on freshly churned groundnut oil",
    messageBody: "Janani Agro: Special VIP treat for {CustomerName}! Get flat Rs.200 OFF on 5L Fresh Wood Pressed Oil. Use code VIPHARVEST at checkout. Valid till midnight: https://jananiagro.com/oils OptOut reply STOP",
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
    name: "🌾 Fresh Harvest Rice & Unpolished Millets Just Arrived!",
    channel: "push",
    type: "coupon",
    subject: "Fresh Harvest Grains Restocked!",
    previewText: "Unpolished Foxtail & Brown Basmati freshly packed from our farmers",
    messageBody: "Fresh batch of native grains and high-fiber millets ready for delivery. Use code MILLET15 for 15% discount.",
    targetSegmentId: "seg_millets",
    targetSegmentName: "Organic Millets & Traditional Grains Buyers",
    targetAudienceCount: 4120,
    couponCode: "MILLET15",
    ctaLabel: "View Fresh Millets",
    ctaUrl: "/products?category=millets",
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
    subject: "🌾 {CustomerName}, here is ₹150 for your organic pantry!",
    previewText: "It's been a while. Restock your kitchen with certified organic essentials.",
    messageBody: "We miss you at Janani Agro! Enjoy ₹150 OFF on your next order with coupon COMEBACK150. Valid on all staples, cold pressed oils, and spices.",
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

export let notificationHistory = [
  {
    id: "NOTIF-701",
    campaignId: "CAMP-101",
    campaignName: "Diwali Organic Sweetness & Cold Pressed Oils Extravaganza",
    channel: "email",
    segment: "All Registered Customers",
    recipients: 12850,
    delivered: 12650,
    status: "Delivered",
    sentAt: "2026-09-10T09:00:00.000Z",
    openRate: 40.9,
    clickRate: 15.3,
    revenue: 345600,
    providerStatus: "Delivered via AWS SES / Brevo SMTP"
  },
  {
    id: "NOTIF-702",
    campaignId: "CAMP-102",
    campaignName: "Flash Harvest Drop: Extra ₹200 OFF on Wood Pressed Oils",
    channel: "sms",
    segment: "VIP High LTV Champions (Spent > ₹5,000)",
    recipients: 1420,
    delivered: 1390,
    status: "Delivered",
    sentAt: "2026-09-11T14:30:00.000Z",
    openRate: 100.0,
    clickRate: 34.5,
    revenue: 148200,
    providerStatus: "Delivered via Gupshup DLT Gateway"
  },
  {
    id: "NOTIF-703",
    campaignId: "CAMP-103",
    campaignName: "🌾 Fresh Harvest Rice & Unpolished Millets Just Arrived!",
    channel: "push",
    segment: "Organic Millets & Traditional Grains Buyers",
    recipients: 4120,
    delivered: 3950,
    status: "Delivered",
    sentAt: "2026-09-11T17:00:00.000Z",
    openRate: 13.6,
    clickRate: 8.1,
    revenue: 68400,
    providerStatus: "Dispatched via Firebase Cloud Messaging & OneSignal"
  },
  {
    id: "NOTIF-704",
    campaignId: "CAMP-104",
    campaignName: "Festive Announcement: Free Farm-Fresh Sweets with Orders Above ₹999",
    channel: "announcement_banner",
    segment: "All Registered Customers",
    recipients: 12850,
    delivered: 12850,
    status: "Active",
    sentAt: "2026-09-01T00:00:00.000Z",
    openRate: 73.1,
    clickRate: 22.1,
    revenue: 412000,
    providerStatus: "Live on Storefront Header"
  },
  {
    id: "NOTIF-705",
    campaignId: "CAMP-105",
    campaignName: "Win Back: We Miss You! Here's ₹150 OFF Your Next Farm Basket",
    channel: "email",
    segment: "Dormant / Inactive (> 60 Days)",
    recipients: 2150,
    delivered: 0,
    status: "Scheduled",
    sentAt: "2026-09-18T10:00:00.000Z",
    openRate: 0,
    clickRate: 0,
    revenue: 0,
    providerStatus: "Scheduled for automated cron queue"
  }
];

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

export const getReportsAnalytics = (req, res) => {
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
    { sku: "JAN-GHEE-A2-500", name: "A2 Vedic Bilona Gir Cow Ghee (500ml)", stock: 84, monthlyRunRate: 340, daysOfSupply: 7, status: "High Velocity" },
    { sku: "JAN-OIL-GN-1000", name: "Cold Pressed Virgin Groundnut Oil (1L)", stock: 120, monthlyRunRate: 280, daysOfSupply: 13, status: "High Velocity" },
    { sku: "JAN-HNY-SUN-500", name: "Wild Raw Sundarban Honey (500g)", stock: 65, monthlyRunRate: 195, daysOfSupply: 10, status: "High Velocity" },
    { sku: "JAN-RICE-KAV-1000", name: "Ancient Black Kavuni Rice (1kg)", stock: 92, monthlyRunRate: 160, daysOfSupply: 17, status: "Healthy" },
    { sku: "JAN-MLT-FOX-1000", name: "Unpolished Foxtail Millet (1kg)", stock: 110, monthlyRunRate: 140, daysOfSupply: 23, status: "Healthy" }
  ];

  const slowMovingSkus = [
    { sku: "JAN-SPICE-SAF-1G", name: "Pure Kashmiri Mongra Saffron (1g)", stock: 140, monthlyRunRate: 24, daysOfSupply: 175, status: "Slow Moving" },
    { sku: "JAN-TEA-ORG-250", name: "Assam Orthodox Whole Leaf Tea (250g)", stock: 85, monthlyRunRate: 18, daysOfSupply: 141, status: "Slow Moving" },
    { sku: "JAN-JAG-LIQ-500", name: "Organic Liquid Kakvi Jaggery (500ml)", stock: 95, monthlyRunRate: 22, daysOfSupply: 129, status: "Slow Moving" }
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
    { rank: 1, sku: "JAN-GHEE-A2-500", name: "A2 Vedic Bilona Gir Cow Ghee (500ml)", category: "A2 Vedic Dairy", unitsSold: Math.round(480 * mult), revenue: Math.round(696000 * mult), cogs: Math.round(334080 * mult), margin: "52.0%", stock: 84, inStock: true },
    { rank: 2, sku: "JAN-OIL-GN-1000", name: "Cold-Pressed Virgin Groundnut Oil (1L)", category: "Cold Pressed Oils", unitsSold: Math.round(410 * mult), revenue: Math.round(172200 * mult), cogs: Math.round(89544 * mult), margin: "48.0%", stock: 120, inStock: true },
    { rank: 3, sku: "JAN-HNY-SUN-500", name: "Wild Raw Sundarban Multifloral Honey (500g)", category: "Raw Forest Honey", unitsSold: Math.round(320 * mult), revenue: Math.round(217600 * mult), cogs: Math.round(108800 * mult), margin: "50.0%", stock: 65, inStock: true },
    { rank: 4, sku: "JAN-RICE-KAV-1000", name: "Ancient Black Kavuni Heritage Rice (1kg)", category: "Heritage Rice", unitsSold: Math.round(290 * mult), revenue: Math.round(89900 * mult), cogs: Math.round(47647 * mult), margin: "47.0%", stock: 92, inStock: true },
    { rank: 5, sku: "JAN-OIL-SES-1000", name: "Wood-Pressed Black Sesame Gingelly Oil (1L)", category: "Cold Pressed Oils", unitsSold: Math.round(240 * mult), revenue: Math.round(124800 * mult), cogs: Math.round(63648 * mult), margin: "49.0%", stock: 78, inStock: true },
    { rank: 6, sku: "JAN-MLT-FOX-1000", name: "Unpolished Organic Foxtail Millet (1kg)", category: "Millet Staples", unitsSold: Math.round(210 * mult), revenue: Math.round(37800 * mult), cogs: Math.round(19656 * mult), margin: "48.0%", stock: 110, inStock: true },
    { rank: 7, sku: "JAN-JAG-ORG-1000", name: "Organic Granular Desi Jaggery Powder (1kg)", category: "Natural Sweeteners", unitsSold: Math.round(195 * mult), revenue: Math.round(37050 * mult), cogs: Math.round(18525 * mult), margin: "50.0%", stock: 145, inStock: true },
    { rank: 8, sku: "JAN-TUR-LAK-250", name: "High-Curcumin Lakadong Turmeric Powder (250g)", category: "Spices & Wellness", unitsSold: Math.round(175 * mult), revenue: Math.round(50750 * mult), cogs: Math.round(24360 * mult), margin: "52.0%", stock: 60, inStock: true },
    { rank: 9, sku: "JAN-DAL-TOOR-1000", name: "Unpolished Desi Toor Dal (1kg)", category: "Organic Pulses", unitsSold: Math.round(160 * mult), revenue: Math.round(35200 * mult), cogs: Math.round(18304 * mult), margin: "48.0%", stock: 98, inStock: true },
    { rank: 10, sku: "JAN-SHIL-GLD-20G", name: "Pure Himalayan Shilajit Resin (20g)", category: "Spices & Wellness", unitsSold: Math.round(135 * mult), revenue: Math.round(256365 * mult), cogs: Math.round(117927 * mult), margin: "54.0%", stock: 42, inStock: true }
  ];

  // 13. Top Categories
  const topCategories = [
    { rank: 1, name: "A2 Vedic Dairy & Bilona Ghee", revenue: Math.round(grossSales * 0.36), sharePercent: 36.0, unitsSold: Math.round(520 * mult), productsCount: 4, growthRate: "+28.4%" },
    { rank: 2, name: "Cold Pressed Virgin Oils", revenue: Math.round(grossSales * 0.22), sharePercent: 22.0, unitsSold: Math.round(710 * mult), productsCount: 6, growthRate: "+22.1%" },
    { rank: 3, name: "Raw Forest Honey & Bee Pollen", revenue: Math.round(grossSales * 0.14), sharePercent: 14.0, unitsSold: Math.round(360 * mult), productsCount: 3, growthRate: "+18.7%" },
    { rank: 4, name: "Spices, Herbs & Wellness", revenue: Math.round(grossSales * 0.12), sharePercent: 12.0, unitsSold: Math.round(310 * mult), productsCount: 8, growthRate: "+34.2%" },
    { rank: 5, name: "Heritage Rice & Ancient Grains", revenue: Math.round(grossSales * 0.08), sharePercent: 8.0, unitsSold: Math.round(390 * mult), productsCount: 5, growthRate: "+15.3%" },
    { rank: 6, name: "Millet Staples & Flours", revenue: Math.round(grossSales * 0.05), sharePercent: 5.0, unitsSold: Math.round(340 * mult), productsCount: 6, growthRate: "+12.9%" },
    { rank: 7, name: "Natural Sweeteners & Jaggery", revenue: Math.round(grossSales * 0.03), sharePercent: 3.0, unitsSold: Math.round(280 * mult), productsCount: 4, growthRate: "+9.8%" }
  ];

  // 14. Top Customers
  const topCustomers = [
    { rank: 1, id: "CUST-004", name: "Vikram Malhotra", email: "v.malhotra@techcorp.in", city: "Gurugram, HR", tier: "VIP Patron Elite", ordersCount: 21, totalSpend: 52100, aov: 2480, loyaltyPoints: 5210, lastOrder: "2026-09-10" },
    { rank: 2, id: "CUST-001", name: "Ananya Sharma", email: "ananya.s@gmail.com", city: "Bengaluru, KA", tier: "Platinum Gold", ordersCount: 16, totalSpend: 44850, aov: 2803, loyaltyPoints: 4485, lastOrder: "2026-09-11" },
    { rank: 3, id: "CUST-006", name: "Dr. Arvind Swamy", email: "arvind.swamy@apollo.org", city: "Hyderabad, TS", tier: "Platinum Gold", ordersCount: 14, totalSpend: 38400, aov: 2742, loyaltyPoints: 3840, lastOrder: "2026-09-08" },
    { rank: 4, id: "CUST-008", name: "Kavita Nair", email: "kavita.nair@cochinresorts.com", city: "Kochi, KL", tier: "Gold Member", ordersCount: 12, totalSpend: 29500, aov: 2458, loyaltyPoints: 2950, lastOrder: "2026-09-06" },
    { rank: 5, id: "CUST-009", name: "Meera Patel", email: "meera.patel@gujarattextiles.in", city: "Ahmedabad, GJ", tier: "Gold Member", ordersCount: 11, totalSpend: 26800, aov: 2436, loyaltyPoints: 2680, lastOrder: "2026-09-09" },
    { rank: 6, id: "CUST-002", name: "Rajesh Kulkarni", email: "rajesh.k@rediffmail.com", city: "Pune, MH", tier: "Gold Member", ordersCount: 8, totalSpend: 19450, aov: 2431, loyaltyPoints: 1945, lastOrder: "2026-09-11" },
    { rank: 7, id: "CUST-010", name: "Siddharth Sen", email: "siddharth.sen@calcuttaoils.com", city: "Kolkata, WB", tier: "Gold Member", ordersCount: 7, totalSpend: 16800, aov: 2400, loyaltyPoints: 1680, lastOrder: "2026-09-04" },
    { rank: 8, id: "CUST-003", name: "Sunita Iyer", email: "sunita.iyer@yahoo.com", city: "Chennai, TN", tier: "Silver Patron", ordersCount: 3, totalSpend: 7450, aov: 2483, loyaltyPoints: 745, lastOrder: "2026-09-11" },
    { rank: 9, id: "CUST-005", name: "Pooja Hegde", email: "pooja.hegde@infosys.com", city: "Mysuru, KA", tier: "Silver Patron", ordersCount: 3, totalSpend: 6900, aov: 2300, loyaltyPoints: 690, lastOrder: "2026-09-07" },
    { rank: 10, id: "CUST-007", name: "Amitabh Verma", email: "amitabh.verma@delhicapitals.in", city: "New Delhi, DL", tier: "Silver Patron", ordersCount: 2, totalSpend: 5120, aov: 2560, loyaltyPoints: 512, lastOrder: "2026-09-05" }
  ];

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
      description: "A2 Vedic Bilona Gir Cow Ghee (Pure Clarified Butter)",
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
      hsnCode: "04090000",
      description: "Raw Unfiltered Sundarban Wild Honey (Natural Honey)",
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
      description: "Cold Pressed Virgin Groundnut & Black Sesame Oils",
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
      description: "Unpolished Organic Foxtail & Little Millets",
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
      description: "Organic Desi Jaggery Powder & Kakvi Liquid Jaggery",
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
      description: "High-Curcumin Lakadong Turmeric & Kashmiri Saffron",
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
      description: "Unpolished Desi Toor Dal & Green Moong",
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

export const exportReportData = (req, res) => {
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
        csvRows = [
          "1,CUST-004,Vikram Malhotra,v.malhotra@techcorp.in,Gurugram HR,VIP Patron Elite,21,52100,2480,5210",
          "2,CUST-001,Ananya Sharma,ananya.s@gmail.com,Bengaluru KA,Platinum Gold,16,44850,2803,4485",
          "3,CUST-006,Dr. Arvind Swamy,arvind.swamy@apollo.org,Hyderabad TS,Platinum Gold,14,38400,2742,3840",
          "4,CUST-008,Kavita Nair,kavita.nair@cochinresorts.com,Kochi KL,Gold Member,12,29500,2458,2950",
          "5,CUST-009,Meera Patel,meera.patel@gujarattextiles.in,Ahmedabad GJ,Gold Member,11,26800,2436,2680",
          "6,CUST-002,Rajesh Kulkarni,rajesh.k@rediffmail.com,Pune MH,Gold Member,8,19450,2431,1945"
        ];
        break;

      case "inventory":
        csvHeader = "SKU,Product Name,Category,Units In Stock,Monthly Velocity,Days of Supply,Cost Price (INR),Retail Price (INR),Stock Status";
        csvRows = [
          "JAN-GHEE-A2-500,A2 Vedic Bilona Gir Cow Ghee (500ml),A2 Vedic Dairy,84,340,7,754,1450,High Velocity",
          "JAN-OIL-GN-1000,Cold-Pressed Virgin Groundnut Oil (1L),Cold Pressed Oils,120,280,13,218,420,High Velocity",
          "JAN-HNY-SUN-500,Wild Raw Sundarban Multifloral Honey (500g),Raw Forest Honey,65,195,10,340,680,High Velocity",
          "JAN-RICE-KAV-1000,Ancient Black Kavuni Heritage Rice (1kg),Heritage Rice,92,160,17,164,310,Healthy",
          "JAN-MLT-FOX-1000,Unpolished Organic Foxtail Millet (1kg),Millet Staples,110,140,23,93,180,Healthy",
          "JAN-SPICE-SAF-1G,Pure Kashmiri Mongra Saffron (1g),Spices & Herbs,140,24,175,280,550,Slow Moving"
        ];
        break;

      case "gst":
        csvHeader = "HSN Code,Description,UQC,Total Qty,Taxable Value (INR),GST Rate %,CGST 2.5% (INR),SGST 2.5% (INR),IGST 5.0% (INR),Total Tax (INR)";
        csvRows = [
          "04059020,A2 Vedic Bilona Gir Cow Ghee,LTR,520,754000,5.0%,14137.5,14137.5,9425,37700",
          "04090000,Raw Unfiltered Sundarban Honey,KGS,340,231200,5.0%,4335,4335,2890,11560",
          "15089091,Cold Pressed Virgin Groundnut Oil,LTR,680,285600,5.0%,5355,5355,3570,14280",
          "10063090,Ancient Black Kavuni Rice,KGS,420,130200,5.0%,2441.25,2441.25,1627.5,6510",
          "10082900,Unpolished Foxtail Millet,KGS,510,91800,5.0%,1721.25,1721.25,1147.5,4590",
          "17011490,Organic Desi Jaggery Powder,KGS,380,72200,5.0%,1353.75,1353.75,902.5,3610",
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
          "1,JAN-GHEE-A2-500,A2 Vedic Bilona Gir Cow Ghee (500ml),A2 Vedic Dairy,480,696000,334080,52.0%,In Stock (84 units)",
          "2,JAN-OIL-GN-1000,Cold-Pressed Virgin Groundnut Oil (1L),Cold Pressed Oils,410,172200,89544,48.0%,In Stock (120 units)",
          "3,JAN-HNY-SUN-500,Wild Raw Sundarban Multifloral Honey (500g),Raw Forest Honey,320,217600,108800,50.0%,In Stock (65 units)",
          "4,JAN-RICE-KAV-1000,Ancient Black Kavuni Heritage Rice (1kg),Heritage Rice,290,89900,47647,47.0%,In Stock (92 units)",
          "5,JAN-OIL-SES-1000,Wood-Pressed Black Sesame Gingelly Oil (1L),Cold Pressed Oils,240,124800,63648,49.0%,In Stock (78 units)"
        ];
        break;

      case "top_categories":
        csvHeader = "Rank,Category Name,Gross Revenue (INR),Revenue Share %,Units Sold,Products Count,YoY Growth %";
        csvRows = [
          "1,A2 Vedic Dairy & Bilona Ghee,701496,36.0%,520,4,+28.4%",
          "2,Cold Pressed Virgin Oils,428692,22.0%,710,6,+22.1%",
          "3,Raw Forest Honey & Bee Pollen,272804,14.0%,360,3,+18.7%",
          "4,Spices Herbs & Wellness,233832,12.0%,310,8,+34.2%",
          "5,Heritage Rice & Ancient Grains,155888,8.0%,390,5,+15.3%",
          "6,Millet Staples & Flours,97430,5.0%,340,6,+12.9%",
          "7,Natural Sweeteners & Jaggery,58458,3.0%,280,4,+9.8%"
        ];
        break;

      case "top_customers":
        csvHeader = "Rank,Customer ID,Name,Email,City/State,Loyalty Tier,Orders Count,Total Lifetime Spend (INR),AOV (INR),Loyalty Points";
        csvRows = [
          "1,CUST-004,Vikram Malhotra,v.malhotra@techcorp.in,Gurugram HR,VIP Patron Elite,21,52100,2480,5210",
          "2,CUST-001,Ananya Sharma,ananya.s@gmail.com,Bengaluru KA,Platinum Gold,16,44850,2803,4485",
          "3,CUST-006,Dr. Arvind Swamy,arvind.swamy@apollo.org,Hyderabad TS,Platinum Gold,14,38400,2742,3840",
          "4,CUST-008,Kavita Nair,kavita.nair@cochinresorts.com,Kochi KL,Gold Member,12,29500,2458,2950",
          "5,CUST-009,Meera Patel,meera.patel@gujarattextiles.in,Ahmedabad GJ,Gold Member,11,26800,2436,2680"
        ];
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
    storeTagline: "Ancient Grains, Bilona Ghee & Pure Forest Organics from Andhra & Gujarat",
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
    metaTitle: "Janani Agro | 100% Pure A2 Gir Cow Ghee, Forest Honey & Cold Pressed Oils",
    metaDescription: "Experience authentic Vedic farm-to-table nutrition. Certified organic A2 Bilona Ghee, raw multifloral forest honey, wood-pressed virgin oils, and GI-tagged heritage rice delivered fresh across India.",
    metaKeywords: "A2 bilona ghee, Gir cow ghee, raw forest honey, wood pressed oil, ancient black rice kavuni, organic foxtail millet, cold pressed gingelly oil, farm direct organic food",
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
let activityAuditLogs = [
  {
    id: "log_act_94812",
    timestamp: "2026-09-12 09:48 AM",
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated Store SEO Meta Description & Canonical Base",
    module: "SEO Settings",
    severity: "low",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { field: "metaDescription", change: "Added GI-tagged heritage rice keywords" }
  },
  {
    id: "log_act_94811",
    timestamp: "2026-09-12 09:15 AM",
    actor: { id: "staff_007", name: "Siddharth Rao", email: "siddharth.r@jananiagro.com", role: "Growth Lead" },
    action: "Dispatched Omnichannel Broadcast: Grand Harvest Festival Offer",
    module: "Marketing Module",
    severity: "medium",
    ipAddress: "49.37.155.62",
    device: "Dell XPS 15 (Windows 11 / Chrome)",
    metadata: { recipientsCount: 3840, campaign: "FESTIVAL-HARVEST-2026" }
  },
  {
    id: "log_act_94810",
    timestamp: "2026-09-12 08:35 AM",
    actor: { id: "staff_003", name: "Dr. Arvind Swamy", email: "arvind.s@jananiagro.com", role: "Store Manager" },
    action: "Approved 12 Verified Patron Reviews with Media Badges",
    module: "Reviews Management",
    severity: "low",
    ipAddress: "122.179.88.94",
    device: "iPad Pro (Safari 18)",
    metadata: { reviewIds: ["REV-901", "REV-902", "REV-903"] }
  },
  {
    id: "log_act_94809",
    timestamp: "2026-09-12 07:30 AM",
    actor: { id: "staff_004", name: "Harish Patel", email: "harish.p@jananiagro.com", role: "Logistics Lead" },
    action: "Generated Shiprocket AWB Manifest (Batch of 48 orders)",
    module: "Logistics & Shipping",
    severity: "medium",
    ipAddress: "182.73.190.22",
    device: "Zebra Warehouse Handheld (Android 14)",
    metadata: { warehouse: "WH-GIDC-01", awbCount: 48 }
  },
  {
    id: "log_act_94808",
    timestamp: "2026-09-11 11:45 PM",
    actor: { id: "system_cron", name: "Janani Automation Daemon", email: "system@jananiagro.com", role: "System Service" },
    action: "Generated Automated Nightly Database Snapshot (janani-db-snap-20260911.json)",
    module: "Backup & Disaster Recovery",
    severity: "low",
    ipAddress: "127.0.0.1",
    device: "Server Internal (Node.js Engine)",
    metadata: { snapshotSize: "14.8 MB", recordsCount: 18420, checksum: "sha256-e918abf" }
  },
  {
    id: "log_act_94807",
    timestamp: "2026-09-11 06:12 PM",
    actor: { id: "staff_001", name: "Doddi Sai Rama", email: "sairama@jananiagro.com", role: "Super Administrator" },
    action: "Updated Razorpay Webhook Configuration & Secret Token",
    module: "Payment Gateways",
    severity: "high",
    ipAddress: "103.142.45.12",
    device: "MacBook Pro (Chrome 128 / macOS 15)",
    metadata: { gateway: "Razorpay", webhook: "" }
  },
  {
    id: "log_act_94806",
    timestamp: "2026-09-11 04:30 PM",
    actor: { id: "staff_006", name: "CA Rajesh Mehta", email: "rajesh.m@jananiagro.com", role: "Financial Auditor" },
    action: "Exported GSTR-1 HSN Summary for August 2026 (CSV)",
    module: "Reports & GST",
    severity: "low",
    ipAddress: "103.211.54.80",
    device: "Lenovo ThinkPad (Chrome / Windows 11)",
    metadata: { month: "Aug 2026", turnover: "₹18,20,400" }
  },
  {
    id: "log_act_94805",
    timestamp: "2026-09-11 02:20 PM",
    actor: { id: "staff_005", name: "Pooja Sharma", email: "pooja.s@jananiagro.com", role: "Customer Support" },
    action: "Processed Wallet Goodwill Credit ₹200 to Customer CUST-001 (Ananya S)",
    module: "Customer Wallet",
    severity: "medium",
    ipAddress: "157.48.92.110",
    device: "HP Pavilion (Windows 11 / Chrome)",
    metadata: { customerId: "CUST-001", reason: "Goodwill gesture for delay" }
  },
  {
    id: "log_act_94804",
    timestamp: "2026-09-10 10:15 PM",
    actor: { id: "security_guard", name: "Security Firewall Watchdog", email: "firewall@jananiagro.com", role: "Security Sentinel" },
    action: "Blocked 5 Failed Login Attempts from Unrecognized IP 194.26.29.11",
    module: "Security Sentinel",
    severity: "critical",
    ipAddress: "194.26.29.11",
    device: "Unknown Bot / Python-requests",
    metadata: { targetUser: "admin@jananiagro.com", actionTaken: "Auto-IP Banned for 24 hours" }
  }
];

// 5. Login History Sessions Data Store
let loginHistorySessions = [
  {
    id: "sess_001",
    userId: "staff_001",
    userName: "Doddi Sai Rama",
    userEmail: "sairama@jananiagro.com",
    role: "Super Administrator",
    ipAddress: "103.142.45.12",
    location: "Rajkot, Gujarat, India",
    deviceType: "Desktop",
    browser: "Chrome 128.0 (macOS Sequoia)",
    loginTime: "2026-09-12 09:45 AM",
    lastActive: "Active Now (Current Session)",
    twoFactorVerified: true,
    authMethod: "Password + Authenticator TOTP",
    status: "Active",
    isCurrent: true
  },
  {
    id: "sess_002",
    userId: "staff_007",
    userName: "Siddharth Rao",
    userEmail: "siddharth.r@jananiagro.com",
    role: "Growth Lead",
    ipAddress: "49.37.155.62",
    location: "Bengaluru, Karnataka, India",
    deviceType: "Laptop",
    browser: "Chrome 128.0 (Windows 11)",
    loginTime: "2026-09-12 09:00 AM",
    lastActive: "15 mins ago",
    twoFactorVerified: true,
    authMethod: "Password + Authenticator TOTP",
    status: "Active",
    isCurrent: false
  },
  {
    id: "sess_003",
    userId: "staff_003",
    userName: "Dr. Arvind Swamy",
    userEmail: "arvind.s@jananiagro.com",
    role: "Store Manager",
    ipAddress: "122.179.88.94",
    location: "Bengaluru, Karnataka, India",
    deviceType: "Tablet",
    browser: "Mobile Safari (iPadOS 18)",
    loginTime: "2026-09-12 08:30 AM",
    lastActive: "45 mins ago",
    twoFactorVerified: true,
    authMethod: "Password + SMS OTP",
    status: "Active",
    isCurrent: false
  },
  {
    id: "sess_004",
    userId: "staff_004",
    userName: "Harish Patel",
    userEmail: "harish.p@jananiagro.com",
    role: "Logistics Lead",
    ipAddress: "182.73.190.22",
    location: "Rajkot, Gujarat, India",
    deviceType: "Handheld Scanner",
    browser: "Chrome Mobile (Android 14)",
    loginTime: "2026-09-12 07:15 AM",
    lastActive: "2 hours ago",
    twoFactorVerified: true,
    authMethod: "Password + SMS OTP",
    status: "Active",
    isCurrent: false
  },
  {
    id: "sess_005",
    userId: "staff_002",
    userName: "Kavya Doddi",
    userEmail: "kavya.d@jananiagro.com",
    role: "Super Administrator",
    ipAddress: "103.142.45.14",
    location: "Rajkot, Gujarat, India",
    deviceType: "Desktop",
    browser: "Safari 18.0 (macOS Sequoia)",
    loginTime: "2026-09-11 05:20 PM",
    lastActive: "Terminated (Logged Out)",
    twoFactorVerified: true,
    authMethod: "Password + Authenticator TOTP",
    status: "Terminated",
    isCurrent: false
  },
  {
    id: "sess_006",
    userId: "staff_005",
    userName: "Pooja Sharma",
    userEmail: "pooja.s@jananiagro.com",
    role: "Customer Support",
    ipAddress: "157.48.92.110",
    location: "Hyderabad, Telangana, India",
    deviceType: "Laptop",
    browser: "Edge 128.0 (Windows 11)",
    loginTime: "2026-09-11 01:10 PM",
    lastActive: "Terminated (Timeout 45m)",
    twoFactorVerified: false,
    authMethod: "Password Only",
    status: "Terminated",
    isCurrent: false
  }
];

// 6. System Database Backups Data Store
let systemBackupsList = [
  {
    id: "bkp_20260912_0945",
    filename: "janani-db-manual-snapshot-20260912-0945.json",
    type: "Manual Full Snapshot",
    scope: "Complete (Products, Orders, Customers, CMS, Settings, Ledger)",
    size: "14.85 MB",
    recordCount: 18492,
    status: "Completed",
    createdDate: "2026-09-12 09:45 AM",
    createdBy: "Doddi Sai Rama (Super Admin)",
    checksum: "sha256-a810fe930129bc48",
    downloadUrl: "/api/admin/backups/download/bkp_20260912_0945"
  },
  {
    id: "bkp_20260911_2345",
    filename: "janani-db-auto-nightly-20260911-2345.json",
    type: "Automated Nightly Backup",
    scope: "Complete",
    size: "14.82 MB",
    recordCount: 18420,
    status: "Completed",
    createdDate: "2026-09-11 11:45 PM",
    createdBy: "System Cron Daemon",
    checksum: "sha256-e918abf109283401",
    downloadUrl: "/api/admin/backups/download/bkp_20260911_2345"
  },
  {
    id: "bkp_20260910_2345",
    filename: "janani-db-auto-nightly-20260910-2345.json",
    type: "Automated Nightly Backup",
    scope: "Complete",
    size: "14.61 MB",
    recordCount: 18210,
    status: "Completed",
    createdDate: "2026-09-10 11:45 PM",
    createdBy: "System Cron Daemon",
    checksum: "sha256-cc18293849102834",
    downloadUrl: "/api/admin/backups/download/bkp_20260910_2345"
  },
  {
    id: "bkp_20260905_1200",
    filename: "janani-db-pre-marketing-push-20260905.json",
    type: "Manual Milestone Snapshot",
    scope: "Complete",
    size: "14.10 MB",
    recordCount: 17800,
    status: "Completed",
    createdDate: "2026-09-05 12:00 PM",
    createdBy: "Doddi Sai Rama (Super Admin)",
    checksum: "sha256-9921038491823019",
    downloadUrl: "/api/admin/backups/download/bkp_20260905_1200"
  }
];

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






