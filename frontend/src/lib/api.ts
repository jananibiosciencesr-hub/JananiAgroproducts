import { products, categories, orders, type Product } from "./catalog";

const API_BASE_URL = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "/api";

/**
 * Generic fetch wrapper with error handling and fallback
 */
async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as T;
  } catch (error) {
    console.warn(`[API fetchJson] Network request failed for ${endpoint}, using fallback:`, error);
    return null;
  }
}

/**
 * Product API Methods
 */
export async function getProducts(params?: { category?: string; search?: string; sort?: string }): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "All") query.append("category", params.category);
  if (params?.search) query.append("search", params.search);
  if (params?.sort) query.append("sort", params.sort);

  const data = await fetchJson<{ success: boolean; products: Product[] }>(`/products?${query.toString()}`);
  if (data?.success && Array.isArray(data.products)) {
    return data.products;
  }

  // Fallback to local catalog
  return products.filter((p) => {
    const matchCat = !params?.category || params.category === "All" || p.category.toLowerCase() === params.category.toLowerCase();
    const matchSearch = !params?.search || p.name.toLowerCase().includes(params.search.toLowerCase());
    return matchCat && matchSearch;
  });
}

export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  const data = await fetchJson<{ success: boolean; product: Product }>(`/products/${idOrSlug}`);
  if (data?.success && data.product) {
    return data.product;
  }
  return products.find((p) => String(p.id) === idOrSlug || p.slug === idOrSlug) || null;
}

export async function getCategories() {
  const data = await fetchJson<{ success: boolean; categories: typeof categories }>(`/products/categories`);
  if (data?.success && Array.isArray(data.categories)) {
    return data.categories;
  }
  return categories;
}

/**
 * Order API Methods
 */
export async function createOrder(orderPayload: {
  items: Array<{ productId: number; name?: string; price: number; quantity: number }>;
  customer: {
    firstName?: string;
    lastName?: string;
    phone: string;
    email?: string;
    address: string;
    landmark?: string;
    city: string;
    state?: string;
    pincode: string;
  };
  paymentMethod: string;
  couponCode?: string;
}) {
  const data = await fetchJson<{ success: boolean; message: string; order: any }>(`/orders`, {
    method: "POST",
    body: JSON.stringify(orderPayload),
  });

  if (data?.success && data.order) {
    return data.order;
  }

  // Fallback simulated order if backend is unreachable
  const generatedId = `JAP-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    number: generatedId,
    status: "Confirmed",
    total: orderPayload.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    customer: orderPayload.customer,
  };
}

export async function trackOrder(query: string) {
  const data = await fetchJson<{ success: boolean; order: any }>(`/orders/track/${encodeURIComponent(query)}`);
  if (data?.success && data.order) {
    return data.order;
  }

  // Fallback tracking data
  return {
    number: query.toUpperCase().startsWith("JAP") ? query.toUpperCase() : `JAP-${query}`,
    status: "In Transit",
    courier: "Delhivery Air Express",
    awb: "DEL-8492048194",
    expected: "Within 2–3 Days",
    timeline: [
      { status: "Order Confirmed & Payment Verified", time: "Completed", done: true },
      { status: "Batch Quality Tested & Nitrogen Packed", time: "Completed", done: true },
      { status: "Dispatched from Lodhika GIDC Facility", time: "In Transit", done: true },
      { status: "Out for Delivery", time: "Pending", done: false },
      { status: "Delivered to Customer", time: "Pending", done: false },
    ],
  };
}

/**
 * Inquiry & Dealership Methods
 */
export async function submitCommercialInquiry(inquiryData: {
  name: string;
  businessName?: string;
  service: string;
  email: string;
  phone: string;
  quantity?: string;
  message?: string;
}) {
  return await fetchJson<{ success: boolean; message: string }>(`/inquiries`, {
    method: "POST",
    body: JSON.stringify(inquiryData),
  });
}

export async function submitDealerApplication(dealerData: {
  businessName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  gst?: string;
  city: string;
  state?: string;
  tier?: string;
  investment?: string;
  message?: string;
}) {
  return await fetchJson<{ success: boolean; message: string }>(`/inquiries/dealers`, {
    method: "POST",
    body: JSON.stringify(dealerData),
  });
}

/**
 * Contact & Newsletter
 */
export async function sendContactMessage(contactData: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  return await fetchJson<{ success: boolean; message: string }>(`/contact/message`, {
    method: "POST",
    body: JSON.stringify(contactData),
  });
}

export async function subscribeNewsletter(email: string) {
  return await fetchJson<{ success: boolean; message: string }>(`/contact/newsletter`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Admin Dashboard API Methods
 */
export async function getAdminStats() {
  const res = await fetchJson<{ success: boolean; data: any }>(`/admin/stats`);
  if (res?.success && res.data) return res.data;
  return {
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
}

export async function getAdminCharts() {
  const res = await fetchJson<{ success: boolean; data: any }>(`/admin/charts`);
  if (res?.success && res.data) return res.data;
  return {
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
}

export async function getAdminWidgets() {
  const res = await fetchJson<{ success: boolean; data: any }>(`/admin/widgets`);
  if (res?.success && res.data) return res.data;
  return {
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
}

export interface OrderQueryParams {
  status?: string | undefined;
  paymentStatus?: string | undefined;
  warehouse?: string | undefined;
  courier?: string | undefined;
  search?: string | undefined;
  sortBy?: string | undefined;
}

export async function getAdminOrders(params?: OrderQueryParams) {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.paymentStatus && params.paymentStatus !== "all") query.append("paymentStatus", params.paymentStatus);
  if (params?.warehouse && params.warehouse !== "all") query.append("warehouse", params.warehouse);
  if (params?.courier && params.courier !== "all") query.append("courier", params.courier);
  if (params?.search) query.append("search", params.search);
  if (params?.sortBy) query.append("sortBy", params.sortBy);

  const res = await fetchJson<{
    success: boolean;
    data: any[];
    total: number;
    stats?: {
      total: number;
      pending: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
      returned: number;
      grossRevenue: number;
    };
    pendingCount?: number;
    processingCount?: number;
    shippedCount?: number;
    deliveredCount?: number;
    cancelledCount?: number;
    totalRevenue?: number;
  }>(`/admin/orders?${query.toString()}`);
  return res || { success: true, data: [], total: 0, pendingCount: 0, processingCount: 0, shippedCount: 0, deliveredCount: 0, cancelledCount: 0, totalRevenue: 0 };
}

export async function getAdminOrderById(id: string) {
  const res = await fetchJson<{ success: boolean; data: any }>(`/admin/orders/${id}`);
  return res?.data || null;
}

export async function updateAdminOrderStatus(id: string, payload: { orderStatus?: string; trackingId?: string; courier?: string; note?: string }) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function assignOrderWarehouse(id: string, warehouse: string | { id: string; name: string; location: string; state?: string }) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/orders/${id}/warehouse`, {
    method: "POST",
    body: JSON.stringify({ warehouse })
  });
}

export async function generateShiprocketAwb(id: string, courierPartner?: string, pickupTime?: string) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/orders/${id}/shiprocket`, {
    method: "POST",
    body: JSON.stringify({ courierPartner, pickupTime })
  });
}

export async function addOrderAdminNote(id: string, text: string, author?: string) {
  return await fetchJson<{ success: boolean; message: string; data: any[] }>(`/admin/orders/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ text, author })
  });
}

export async function cancelAdminOrder(id: string, reason?: string | { reason?: string; restockInventory?: boolean }, restockInventory?: boolean) {
  const body = typeof reason === "object" ? reason : { reason, restockInventory };
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/orders/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function refundAdminOrder(id: string, amount?: number | { amount?: number; mode?: string; reason?: string }, mode?: string, reason?: string) {
  const body = typeof amount === "object" ? amount : { amount, mode, reason };
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/orders/${id}/refund`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function returnAdminOrder(id: string, reason?: string | { reason?: string; pickupDate?: string; courier?: string }, reverseCourier?: string) {
  const body = typeof reason === "object" ? reason : { reason, reverseCourier, courier: reverseCourier };
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/orders/${id}/return`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function exchangeAdminOrder(id: string, reason?: string | { replacementItem: string; reason?: string }, replacementSku?: string) {
  const body = typeof reason === "object" ? reason : { reason, replacementItem: replacementSku, replacementSku };
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/orders/${id}/exchange`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function bulkUpdateAdminOrderStatus(ids: string[], status: string) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/orders/bulk-status`, {
    method: "POST",
    body: JSON.stringify({ ids, status })
  });
}

export async function getAdminProducts(params?: {
  status?: string | undefined;
  category?: string | undefined;
  brand?: string | undefined;
  stockStatus?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  search?: string | undefined;
}) {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.category && params.category !== "all") query.append("category", params.category);
  if (params?.brand && params.brand !== "all") query.append("brand", params.brand);
  if (params?.stockStatus && params.stockStatus !== "all") query.append("stockStatus", params.stockStatus);
  if (params?.minPrice !== undefined) query.append("minPrice", String(params.minPrice));
  if (params?.maxPrice !== undefined) query.append("maxPrice", String(params.maxPrice));
  if (params?.search) query.append("search", params.search);

  const res = await fetchJson<{ success: boolean; data: any[]; total: number; activeCount: number; trashCount: number }>(`/admin/products?${query.toString()}`);
  return res || { success: true, data: [], total: 0, activeCount: 0, trashCount: 0 };
}

export async function createAdminProduct(productData: any) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/products`, {
    method: "POST",
    body: JSON.stringify(productData)
  });
}

export async function updateAdminProduct(id: string, productData: any) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData)
  });
}

export async function toggleAdminProduct(id: string, field: "active" | "featured" | "trending" | "isNewArrival") {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/products/${id}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ field })
  });
}

export async function duplicateAdminProduct(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/products/${id}/duplicate`, {
    method: "POST"
  });
}

export async function deleteAdminProduct(id: string | number) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/products/${id}`, {
    method: "DELETE"
  });
}

export async function restoreAdminProduct(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/products/${id}/restore`, {
    method: "POST"
  });
}

export async function permanentDeleteAdminProduct(id: string) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/products/${id}/permanent`, {
    method: "DELETE"
  });
}

export async function bulkUpdateProductStatus(ids: string[], active: boolean) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/products/bulk-status`, {
    method: "POST",
    body: JSON.stringify({ ids, active })
  });
}

export async function bulkUpdateProductPrice(payload: { ids: string[]; type: "percentage" | "flat" | "fixed"; value: number; mode: "increase" | "decrease" | "set" }) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/products/bulk-price`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function bulkUpdateProductStock(payload: { ids: string[]; quantity: number; operation: "add" | "set" }) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/products/bulk-stock`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function bulkDeleteAdminProducts(ids: string[]) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/products/bulk-delete`, {
    method: "POST",
    body: JSON.stringify({ ids })
  });
}

export async function importAdminProducts(products: any[]) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/products/import`, {
    method: "POST",
    body: JSON.stringify({ products })
  });
}

export interface CustomerQueryParams {
  status?: string | undefined;
  tier?: string | undefined;
  search?: string | undefined;
  sortBy?: string | undefined;
}

export async function getAdminCustomers(params?: CustomerQueryParams) {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.tier && params.tier !== "all") query.append("tier", params.tier);
  if (params?.search) query.append("search", params.search);
  if (params?.sortBy) query.append("sortBy", params.sortBy);

  const res = await fetchJson<{
    success: boolean;
    data: any[];
    total: number;
    activeCount: number;
    suspendedCount: number;
    inactiveCount: number;
    totalLtv: number;
    totalWallet: number;
    totalLoyalty: number;
  }>(`/admin/customers?${query.toString()}`);
  return res || { success: true, data: [], total: 0, activeCount: 0, suspendedCount: 0, inactiveCount: 0, totalLtv: 0, totalWallet: 0, totalLoyalty: 0 };
}

export async function getAdminCustomerById(id: string) {
  const res = await fetchJson<{ success: boolean; data: any }>(`/admin/customers/${id}`);
  return res?.data || null;
}

export async function createAdminCustomer(customerData: any) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/customers`, {
    method: "POST",
    body: JSON.stringify(customerData)
  });
}

export async function updateAdminCustomer(id: string, customerData: any) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(customerData)
  });
}

export async function toggleCustomerStatus(id: string, status?: string, reason?: string) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/customers/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason })
  });
}

export async function adjustCustomerWallet(id: string, payload: { amount: number; type: "credit" | "debit"; description: string }) {
  return await fetchJson<{ success: boolean; message: string; data: { walletBalance: number; transaction: any } }>(`/admin/customers/${id}/wallet`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function deleteAdminCustomer(id: string) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/customers/${id}`, {
    method: "DELETE"
  });
}

export async function getAdminInventory() {
  const res = await fetchJson<{ success: boolean; data: any[] }>(`/admin/inventory`);
  return res?.data || [];
}

export async function restockAdminInventory(id: string | number, quantity: number) {
  return await fetchJson<{ success: boolean; data: any }>(`/admin/inventory/restock`, {
    method: "POST",
    body: JSON.stringify({ id, quantity })
  });
}

export interface ReviewImage {
  id: string;
  url: string;
  caption?: string | undefined;
  status: "Approved" | "Hidden";
}

export interface AdminReply {
  authorName: string;
  authorRole: string;
  message: string;
  repliedAt: string;
  updatedAt?: string | undefined;
}

export interface CustomerReply {
  id: string;
  customerName: string;
  message: string;
  createdAt: string;
  likes: number;
}

export interface AbuseReport {
  id: string;
  reporterName: string;
  reason: string;
  reportedAt: string;
}

export interface AdminReview {
  id: string;
  productId: string;
  productName: string;
  productCategory: string;
  productImage: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string | undefined;
  orderId?: string | null | undefined;
  rating: number;
  title: string;
  comment: string;
  images: ReviewImage[];
  verifiedPurchase: boolean;
  status: "Approved" | "Pending" | "Rejected";
  rejectionReason?: string | undefined;
  isFeatured: boolean;
  helpfulCount: number;
  abuseReportsCount: number;
  abuseReports: AbuseReport[];
  adminReply?: AdminReply | null | undefined;
  customerReplies: CustomerReply[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  flaggedCount: number;
  photoReviewsCount: number;
  averageRating: number;
  responseRate: string;
  recommendationRate: string;
}

export interface ReviewAnalyticsData {
  totalReviews: number;
  averageRating: number;
  recommendationRate: string;
  verifiedPurchaseRate: string;
  photoReviewsRate: string;
  merchantResponseRate: string;
  starBreakdown: Array<{ stars: number; count: number; percentage: number }>;
  sentiment: {
    positive: number;
    neutral: number;
    critical: number;
    topKeywords: Array<{ keyword: string; count: number; sentiment: "positive" | "neutral" | "critical" }>;
  };
  topProducts: Array<{
    name: string;
    reviewsCount: number;
    averageRating: number;
    recommendationRate: string;
  }>;
}

export interface ReviewQueryParams {
  status?: string | undefined;
  rating?: string | number | undefined;
  verified?: boolean | string | undefined;
  hasImages?: boolean | string | undefined;
  hasAbuse?: boolean | string | undefined;
  search?: string | undefined;
  sortBy?: "newest" | "oldest" | "rating_high" | "rating_low" | "helpful" | undefined;
}

export async function getAdminReviews(params?: ReviewQueryParams) {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.rating) query.append("rating", String(params.rating));
  if (params?.verified !== undefined) query.append("verified", String(params.verified));
  if (params?.hasImages !== undefined) query.append("hasImages", String(params.hasImages));
  if (params?.hasAbuse !== undefined) query.append("hasAbuse", String(params.hasAbuse));
  if (params?.search) query.append("search", params.search);
  if (params?.sortBy) query.append("sortBy", params.sortBy);

  const qs = query.toString();
  const url = qs ? `/admin/reviews?${qs}` : `/admin/reviews`;
  const res = await fetchJson<{ success: boolean; data: AdminReview[]; count: number; total: number; stats: ReviewStats }>(url);
  return res || { success: true, data: [], count: 0, total: 0, stats: { totalReviews: 0, approvedCount: 0, pendingCount: 0, rejectedCount: 0, flaggedCount: 0, photoReviewsCount: 0, averageRating: 5.0, responseRate: "0%", recommendationRate: "0%" } };
}

export async function getAdminReviewById(id: string) {
  const res = await fetchJson<{ success: boolean; data: AdminReview }>(`/admin/reviews/${id}`);
  return res?.data;
}

export async function createAdminReview(payload: Partial<AdminReview>) {
  return await fetchJson<{ success: boolean; message: string; data: AdminReview }>(`/admin/reviews`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateAdminReviewStatus(id: string, status: string, rejectionReason?: string) {
  return await fetchJson<{ success: boolean; message: string; data: AdminReview }>(`/admin/reviews/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejectionReason })
  });
}

export async function toggleFeatureReview(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: AdminReview }>(`/admin/reviews/${id}/feature`, {
    method: "PATCH"
  });
}

export async function addAdminReply(id: string, reply: { authorName?: string | undefined; authorRole?: string | undefined; message: string }) {
  return await fetchJson<{ success: boolean; message: string; data: AdminReview }>(`/admin/reviews/${id}/admin-reply`, {
    method: "POST",
    body: JSON.stringify(reply)
  });
}

export async function deleteAdminReply(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: AdminReview }>(`/admin/reviews/${id}/admin-reply`, {
    method: "DELETE"
  });
}

export async function addCustomerReply(id: string, reply: { customerName?: string | undefined; message: string }) {
  return await fetchJson<{ success: boolean; message: string; data: CustomerReply }>(`/admin/reviews/${id}/customer-reply`, {
    method: "POST",
    body: JSON.stringify(reply)
  });
}

export async function reportReviewAbuse(id: string, report: { reporterName?: string | undefined; reason?: string | undefined }) {
  return await fetchJson<{ success: boolean; message: string; data: AdminReview }>(`/admin/reviews/${id}/report-abuse`, {
    method: "POST",
    body: JSON.stringify(report)
  });
}

export async function dismissReviewAbuse(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: AdminReview }>(`/admin/reviews/${id}/dismiss-abuse`, {
    method: "PATCH"
  });
}

export async function toggleReviewImageStatus(id: string, imageId: string, status?: string) {
  return await fetchJson<{ success: boolean; message: string; data: ReviewImage }>(`/admin/reviews/${id}/images/${imageId}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export async function deleteAdminReview(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: AdminReview }>(`/admin/reviews/${id}`, {
    method: "DELETE"
  });
}

export async function getReviewAnalytics() {
  const res = await fetchJson<{ success: boolean; data: ReviewAnalyticsData }>(`/admin/reviews/analytics`);
  return res?.data;
}

export async function getAdminReturns() {
  const res = await fetchJson<{ success: boolean; data: any[] }>(`/admin/returns`);
  return res?.data || [];
}

export async function updateAdminReturnStatus(id: string, status: string) {
  return await fetchJson<{ success: boolean; data: any }>(`/admin/returns/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

/**
 * 3-Tier Categories API Methods
 */
export async function getAdminFullCategories(params?: { status?: string; level?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.level) query.append("level", params.level);
  if (params?.search) query.append("search", params.search);

  const res = await fetchJson<{ success: boolean; data: any[]; total: number; activeCount: number; trashCount: number }>(`/admin/categories?${query.toString()}`);
  return res || { success: true, data: [], total: 0, activeCount: 0, trashCount: 0 };
}

export async function createAdminCategory(payload: any) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/categories`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateAdminCategory(id: string, payload: any) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function toggleAdminCategory(id: string, field: "active" | "featured" | "trending") {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/categories/${id}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ field })
  });
}

export async function deleteAdminCategory(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/categories/${id}`, {
    method: "DELETE"
  });
}

export async function restoreAdminCategory(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/categories/${id}/restore`, {
    method: "POST"
  });
}

export async function permanentDeleteAdminCategory(id: string) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/categories/${id}/permanent`, {
    method: "DELETE"
  });
}

export async function bulkUpdateAdminCategoryStatus(ids: string[], active: boolean) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/categories/bulk-status`, {
    method: "POST",
    body: JSON.stringify({ ids, active })
  });
}

export async function bulkDeleteAdminCategories(ids: string[]) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/categories/bulk-delete`, {
    method: "POST",
    body: JSON.stringify({ ids })
  });
}

export async function reorderAdminCategories(orderedIds: string[]) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/categories/reorder`, {
    method: "POST",
    body: JSON.stringify({ orderedIds })
  });
}

export async function importAdminCategories(categories: any[]) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/categories/import`, {
    method: "POST",
    body: JSON.stringify({ categories })
  });
}

/**
 * Shiprocket Logistics & Shipping Management API Methods
 */
export async function getShippingConfig() {
  const res = await fetchJson<{ success: boolean; data: any }>(`/admin/shipping/config`);
  return res?.data || null;
}

export async function updateShippingConfig(payload: any) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/shipping/config`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function testShiprocketConnection() {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/shipping/test-connection`, {
    method: "POST"
  });
}

export async function getPickupLocations() {
  const res = await fetchJson<{ success: boolean; data: any[] }>(`/admin/shipping/pickup-locations`);
  return res?.data || [];
}

export async function createPickupLocation(payload: any) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/shipping/pickup-locations`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updatePickupLocation(id: string, payload: any) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/shipping/pickup-locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deletePickupLocation(id: string) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/shipping/pickup-locations/${id}`, {
    method: "DELETE"
  });
}

export interface ShipmentQueryParams {
  status?: string | undefined;
  courier?: string | undefined;
  search?: string | undefined;
  sortBy?: string | undefined;
}

export async function getShipments(params?: ShipmentQueryParams) {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.courier && params.courier !== "all") query.append("courier", params.courier);
  if (params?.search) query.append("search", params.search);
  if (params?.sortBy) query.append("sortBy", params.sortBy);

  const res = await fetchJson<{
    success: boolean;
    data: any[];
    stats: {
      totalShipments: number;
      activeShipments: number;
      inTransit: number;
      outForDelivery: number;
      ndrExceptions: number;
      delivered: number;
      totalShippingSpend: number;
    };
    total: number;
  }>(`/admin/shipping/shipments?${query.toString()}`);
  return res || { success: true, data: [], stats: { totalShipments: 0, activeShipments: 0, inTransit: 0, outForDelivery: 0, ndrExceptions: 0, delivered: 0, totalShippingSpend: 0 }, total: 0 };
}

export async function getShipmentByAwb(awb: string) {
  const res = await fetchJson<{ success: boolean; data: any }>(`/admin/shipping/track/${awb}`);
  return res?.data || null;
}

export async function cancelShipment(awb: string, reason?: string) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/shipping/cancel/${awb}`, {
    method: "POST",
    body: JSON.stringify({ reason })
  });
}

export async function calculateShippingRates(payload: {
  originPincode?: string;
  destinationPincode?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  paymentType?: "prepaid" | "cod";
  orderAmount?: number;
}) {
  return await fetchJson<{ success: boolean; data: any }>(`/admin/shipping/calculate-rate`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getCourierRecommendations(payload: {
  destinationPincode?: string;
  weight?: number;
  isFragile?: boolean;
}) {
  return await fetchJson<{ success: boolean; data: any[] }>(`/admin/shipping/recommendations`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function schedulePickup(payload: {
  pickupLocationId?: string;
  pickupDate?: string;
  timeSlot?: string;
  expectedPackagesCount?: number;
}) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/shipping/schedule-pickup`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getNdrList() {
  const res = await fetchJson<{ success: boolean; data: any[] }>(`/admin/shipping/ndr`);
  return res?.data || [];
}

export async function handleNdrAction(id: string, payload: {
  action: "reattempt" | "update_info" | "rto";
  note?: string;
  reattemptDate?: string;
  updatedPhone?: string;
  updatedAddress?: string;
}) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/shipping/ndr/${id}/action`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function generateManifest(shipmentIds?: string[]) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/shipping/manifest`, {
    method: "POST",
    body: JSON.stringify({ shipmentIds: shipmentIds || [] })
  });
}

// -------------------------------------------------------------
// Payment Management & Gateway Integrations
// -------------------------------------------------------------

export interface PaymentTransaction {
  id: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  gateway: string;
  method: string;
  grossAmount: number;
  gatewayFee: number;
  gstOnFee: number;
  netSettledAmount: number;
  currency: string;
  status: "Captured" | "Pending" | "Failed" | "Refunded" | "Partially Refunded";
  refundedAmount: number;
  bankUtr: string | null;
  settlementBatchId: string | null;
  settlementStatus: string;
  paymentMetadata: Record<string, any>;
  createdAt: string;
  settledAt: string | null;
}

export interface PaymentRefundRecord {
  id: string;
  transactionId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  refundType: string;
  amount: number;
  totalOrderAmount: number;
  destination: string;
  reason: string;
  status: string;
  gatewayRefundId: string;
  processedAt: string;
}

export interface SettlementReport {
  batchId: string;
  gateway: string;
  settlementDate: string;
  transactionsCount: number;
  grossVolume: number;
  gatewayDeductions: number;
  netBankDeposit: number;
  bankAccount: string;
  bankUtr: string;
  status: string;
}

export interface FailedPaymentRetry {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  cartAmount: number;
  cartItems: string;
  failureReason: string;
  errorCode: string;
  failedAt: string;
  recoveryStatus: "Pending Link Send" | "Link Sent" | "Recovered" | "Converted to COD";
  retryLink: string;
  lastSentAt: string | null;
}

export interface PaymentStats {
  grossInflow: number;
  settledToBank: number;
  pendingPayouts: number;
  codInTransit: number;
  totalRefunds: number;
  recoveryRate: string;
}

export interface PaymentQueryParams {
  status?: string | undefined;
  gateway?: string | undefined;
  search?: string | undefined;
  sortBy?: string | undefined;
}

export async function getPaymentTransactions(params?: PaymentQueryParams) {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.gateway && params.gateway !== "all") query.append("gateway", params.gateway);
  if (params?.search) query.append("search", params.search);
  if (params?.sortBy) query.append("sortBy", params.sortBy);

  const res = await fetchJson<{
    success: boolean;
    data: PaymentTransaction[];
    stats: PaymentStats;
    total: number;
  }>(`/admin/payments/transactions?${query.toString()}`);
  return res || { success: true, data: [], stats: { grossInflow: 0, settledToBank: 0, pendingPayouts: 0, codInTransit: 0, totalRefunds: 0, recoveryRate: "0%" }, total: 0 };
}

export async function getPaymentTransactionById(id: string) {
  const res = await fetchJson<{ success: boolean; data: PaymentTransaction }>(`/admin/payments/transactions/${id}`);
  return res?.data || null;
}

export async function processPaymentRefund(payload: {
  transactionId: string;
  orderId?: string;
  refundType: "full" | "partial";
  amount: number;
  destination: "gateway" | "wallet";
  reason: string;
}) {
  return await fetchJson<{
    success: boolean;
    message: string;
    data: { transaction: PaymentTransaction; refund: PaymentRefundRecord };
  }>(`/admin/payments/refund`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getGatewayConfig() {
  const res = await fetchJson<{ success: boolean; data: Record<string, any> }>(`/admin/payments/gateways`);
  return res?.data || null;
}

export async function updateGatewayConfig(gateway: string, config: any) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/payments/gateways`, {
    method: "PUT",
    body: JSON.stringify({ gateway, config })
  });
}

export async function testGatewayConnection(gateway: string) {
  return await fetchJson<{ success: boolean; message: string; data: any }>(`/admin/payments/test-gateway`, {
    method: "POST",
    body: JSON.stringify({ gateway })
  });
}

export async function getSettlementReports() {
  const res = await fetchJson<{ success: boolean; data: SettlementReport[] }>(`/admin/payments/settlements`);
  return res?.data || [];
}

export async function getFailedPaymentRetries() {
  const res = await fetchJson<{ success: boolean; data: FailedPaymentRetry[] }>(`/admin/payments/failed-retries`);
  return res?.data || [];
}

export async function sendPaymentRetryLink(id: string, channel: "whatsapp" | "sms" | "email" = "whatsapp") {
  return await fetchJson<{ success: boolean; message: string; data: FailedPaymentRetry }>(`/admin/payments/failed-retries/${id}/send-link`, {
    method: "POST",
    body: JSON.stringify({ channel })
  });
}

export async function convertFailedToCod(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: { retry: FailedPaymentRetry; orderId: string } }>(`/admin/payments/failed-retries/${id}/convert-cod`, {
    method: "POST"
  });
}

// ==========================================
// 🎟️ COUPONS & PROMOTIONS MANAGEMENT API
// ==========================================

export interface AdminCoupon {
  id: string;
  code: string;
  title: string;
  description: string;
  type: "percentage" | "flat" | "free_shipping";
  discount: number;
  minCart: number;
  maxDiscount: number;
  startDate: string;
  expiryDate: string;
  uses: number;
  maxUses: number;
  perUserLimit: number;
  isFirstOrderOnly: boolean;
  isFreeShipping: boolean;
  categorySpecific: string[];
  productSpecific: string[];
  userSpecificTier: string;
  userSpecificEmails: string[];
  active: boolean;
  createdAt?: string | undefined;
  usageHistory?: CouponUsageRecord[] | undefined;
}

export interface CouponUsageRecord {
  id: string;
  couponCode: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderTotal: number;
  discountAmount: number;
  finalPaid: number;
  appliedAt: string;
  orderStatus: string;
}

export interface CouponStats {
  activeCoupons: number;
  totalRedemptions: number;
  totalDiscountDisbursed: number;
  totalInfluencedRevenue: number;
  avgOrderWithPromo: number;
  topCoupon: string;
}

export interface CouponAnalyticsData {
  topCoupons: Array<{
    code: string;
    redemptions: number;
    revenueGenerated: number;
    totalDiscounts: number;
    conversionRate: string;
  }>;
  categoryBreakdown: Array<{
    category: string;
    percentage: number;
  }>;
}

export interface BulkCouponPayload {
  prefix: string;
  count: number;
  type: "percentage" | "flat" | "free_shipping";
  discount: number;
  minCart: number;
  maxDiscount: number;
  expiryDate: string;
  maxUsesPerCoupon: number;
  isFirstOrderOnly: boolean;
  userSpecificTier: string;
}

export interface CouponQueryParams {
  search?: string | undefined;
  type?: string | undefined;
  status?: string | undefined;
  sortBy?: string | undefined;
}

export async function getAdminCoupons(params?: CouponQueryParams) {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.type && params.type !== "all") query.append("type", params.type);
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.sortBy) query.append("sortBy", params.sortBy);

  const res = await fetchJson<{
    success: boolean;
    data: AdminCoupon[];
    stats: CouponStats;
    total: number;
  }>(`/admin/coupons?${query.toString()}`);
  return res || {
    success: true,
    data: [],
    stats: {
      activeCoupons: 0,
      totalRedemptions: 0,
      totalDiscountDisbursed: 0,
      totalInfluencedRevenue: 0,
      avgOrderWithPromo: 0,
      topCoupon: "N/A"
    },
    total: 0
  };
}

export async function getAdminCouponById(id: string) {
  const res = await fetchJson<{ success: boolean; data: AdminCoupon }>(`/admin/coupons/${id}`);
  return res?.data || null;
}

export async function createAdminCoupon(payload: Partial<AdminCoupon>) {
  return await fetchJson<{ success: boolean; message: string; data: AdminCoupon }>(`/admin/coupons`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateAdminCoupon(id: string, payload: Partial<AdminCoupon>) {
  return await fetchJson<{ success: boolean; message: string; data: AdminCoupon }>(`/admin/coupons/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function toggleAdminCoupon(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: AdminCoupon }>(`/admin/coupons/${id}/toggle`, {
    method: "PATCH"
  });
}

export async function deleteAdminCoupon(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: AdminCoupon }>(`/admin/coupons/${id}`, {
    method: "DELETE"
  });
}

export async function generateBulkCoupons(payload: BulkCouponPayload) {
  return await fetchJson<{ success: boolean; message: string; count: number; data: AdminCoupon[] }>(`/admin/coupons/bulk-generate`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getCouponUsageHistory(params?: { couponCode?: string | undefined; search?: string | undefined }) {
  const query = new URLSearchParams();
  if (params?.couponCode && params.couponCode !== "all") query.append("couponCode", params.couponCode);
  if (params?.search) query.append("search", params.search);

  const res = await fetchJson<{ success: boolean; count: number; data: CouponUsageRecord[] }>(`/admin/coupons/history/usage?${query.toString()}`);
  return res?.data || [];
}

export async function getCouponAnalytics() {
  const res = await fetchJson<{ success: boolean; data: CouponAnalyticsData }>(`/admin/coupons/reports/analytics`);
  return res?.data || { topCoupons: [], categoryBreakdown: [] };
}

// ==========================================
// 🤝 REFER & EARN AND WALLET MANAGEMENT API
// ==========================================

export interface ReferralProgramConfig {
  enabled: boolean;
  referrerRewardType: "flat" | "percentage";
  referrerRewardValue: number;
  refereeDiscountType: "flat" | "percentage" | "free_shipping";
  refereeDiscountValue: number;
  minOrderValue: number;
  holdingDays: number;
  rewardExpirationDays: number;
  silverMultiplier: number;
  goldMultiplier: number;
  platinumMultiplier: number;
  allowSelfReferral: boolean;
  requireDeliveredStatus: boolean;
  lastUpdated?: string | undefined;
}

export interface WalletProgramConfig {
  enabled: boolean;
  cashbackPercentage: number;
  signupBonus: number;
  maxRedemptionPercent: number;
  minOrderForRedemption: number;
  pointsToRupeeRatio: number;
  autoExpireDays: number;
  allowCashbackOnSaleItems: boolean;
  lastUpdated?: string | undefined;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  referrerCode: string;
  referrerTier: string;
  refereeName: string;
  refereeEmail: string;
  refereePhone: string;
  orderId: string;
  orderTotal: number;
  orderStatus: string;
  rewardAmount: number;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  holdingExpiryDate: string;
  approvedAt?: string | null | undefined;
  rejectedAt?: string | null | undefined;
  rejectionReason?: string | null | undefined;
  fraudScore?: string | undefined;
}

export interface WalletTransactionRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  category: string;
  referenceId: string;
  notes?: string | undefined;
  createdAt: string;
}

export interface ReferralStats {
  totalReferralGmv: number;
  totalRewardsPaid: number;
  totalConversions: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  pendingEscrowAmount: number;
  conversionRate: string;
  topReferrer: string;
}

export interface ReferralAnalyticsData {
  funnel: Array<{
    stage: string;
    count: number;
    conversionRate: string;
  }>;
  leaderboard: Array<{
    rank: number;
    name: string;
    code: string;
    tier: string;
    successfulReferrals: number;
    revenueDriven: number;
    commissionEarned: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface ReferralQueryParams {
  status?: string | undefined;
  search?: string | undefined;
  sortBy?: string | undefined;
}

export async function getReferralConfig() {
  const res = await fetchJson<{ success: boolean; data: ReferralProgramConfig }>(`/admin/referrals/config`);
  return res?.data || null;
}

export async function updateReferralConfig(config: Partial<ReferralProgramConfig>) {
  return await fetchJson<{ success: boolean; message: string; data: ReferralProgramConfig }>(`/admin/referrals/config`, {
    method: "PUT",
    body: JSON.stringify(config)
  });
}

export async function getWalletConfig() {
  const res = await fetchJson<{ success: boolean; data: WalletProgramConfig }>(`/admin/referrals/wallet-config`);
  return res?.data || null;
}

export async function updateWalletConfig(config: Partial<WalletProgramConfig>) {
  return await fetchJson<{ success: boolean; message: string; data: WalletProgramConfig }>(`/admin/referrals/wallet-config`, {
    method: "PUT",
    body: JSON.stringify(config)
  });
}

export async function getReferralRecords(params?: ReferralQueryParams) {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.search) query.append("search", params.search);
  if (params?.sortBy) query.append("sortBy", params.sortBy);

  const res = await fetchJson<{
    success: boolean;
    data: ReferralRecord[];
    stats: ReferralStats;
    total: number;
  }>(`/admin/referrals/records?${query.toString()}`);
  return res || {
    success: true,
    data: [],
    stats: {
      totalReferralGmv: 0,
      totalRewardsPaid: 0,
      totalConversions: 0,
      approvedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
      pendingEscrowAmount: 0,
      conversionRate: "0%",
      topReferrer: "N/A"
    },
    total: 0
  };
}

export async function getReferralRecordById(id: string) {
  const res = await fetchJson<{ success: boolean; data: ReferralRecord }>(`/admin/referrals/records/${id}`);
  return res?.data || null;
}

export async function approveReferralReward(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: { record: ReferralRecord; transaction: WalletTransactionRecord } }>(`/admin/referrals/records/${id}/approve`, {
    method: "POST"
  });
}

export async function rejectReferralReward(id: string, reason: string) {
  return await fetchJson<{ success: boolean; message: string; data: ReferralRecord }>(`/admin/referrals/records/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason })
  });
}

export async function getGlobalWalletTransactions(params?: { type?: string | undefined; search?: string | undefined; category?: string | undefined }) {
  const query = new URLSearchParams();
  if (params?.type && params.type !== "all") query.append("type", params.type);
  if (params?.search) query.append("search", params.search);
  if (params?.category && params.category !== "all") query.append("category", params.category);

  const res = await fetchJson<{
    success: boolean;
    data: WalletTransactionRecord[];
    stats: { totalCredits: number; totalDebits: number; activeCirculation: number };
    total: number;
  }>(`/admin/referrals/wallet-transactions?${query.toString()}`);
  return res || {
    success: true,
    data: [],
    stats: { totalCredits: 0, totalDebits: 0, activeCirculation: 0 },
    total: 0
  };
}

export async function manualWalletCredit(payload: {
  customerName: string;
  customerEmail?: string | undefined;
  amount: number;
  category?: string | undefined;
  notes?: string | undefined;
}) {
  return await fetchJson<{ success: boolean; message: string; data: WalletTransactionRecord }>(`/admin/referrals/wallet/credit`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function manualWalletDebit(payload: {
  customerName: string;
  customerEmail?: string | undefined;
  amount: number;
  reason?: string | undefined;
  notes?: string | undefined;
}) {
  return await fetchJson<{ success: boolean; message: string; data: WalletTransactionRecord }>(`/admin/referrals/wallet/debit`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getReferralAnalytics() {
  const res = await fetchJson<{ success: boolean; data: ReferralAnalyticsData }>(`/admin/referrals/analytics`);
  return res?.data || { funnel: [], leaderboard: [], statusDistribution: [] };
}

// ----------------------------------------------------
// HOMEPAGE CMS & STOREFRONT LAYOUT BUILDER TYPES & API
// ----------------------------------------------------

export interface CmsSection {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  order: number;
  description: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  badgeText?: string;
  slideOrder: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

export interface OfferBanner {
  id: string;
  type: "ticker" | "promo_strip" | "coupon_highlight";
  headline: string;
  subtitle?: string;
  couponCode?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  badge?: string;
  backgroundColor?: string;
  textColor?: string;
  active: boolean;
}

export interface CategoryBanner {
  id: string;
  categorySlug: string;
  title: string;
  subtitle?: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  badge?: string;
  active: boolean;
}

export interface FlashSaleBanner {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  endsAt: string;
  discountPercentage: number;
  targetProductSlug: string;
  bannerImageUrl: string;
  active: boolean;
  totalStock?: number;
  claimedStock?: number;
}

export interface CuratedSectionConfig {
  heading: string;
  subheading?: string;
  badge?: string;
  productIds: string[];
  maxDisplayCount: number;
  viewAllUrl?: string;
  layout: "grid" | "carousel";
  active: boolean;
}

export interface HomepageCmsData {
  sections: CmsSection[];
  heroBanners: HeroBanner[];
  offerBanners: OfferBanner[];
  categoryBanners: CategoryBanner[];
  flashSaleBanners: FlashSaleBanner[];
  curatedProductSections: {
    featured: CuratedSectionConfig;
    trending: CuratedSectionConfig;
    newArrivals: CuratedSectionConfig;
    bestSellers: CuratedSectionConfig;
  };
}

export async function getHomepageCms(): Promise<HomepageCmsData> {
  const res = await fetchJson<{ success: boolean; data: HomepageCmsData }>(`/admin/cms/all`);
  return res?.data || {
    sections: [],
    heroBanners: [],
    offerBanners: [],
    categoryBanners: [],
    flashSaleBanners: [],
    curatedProductSections: {
      featured: { heading: "Featured Collection", productIds: [], maxDisplayCount: 8, layout: "grid", active: true },
      trending: { heading: "Trending This Week", productIds: [], maxDisplayCount: 8, layout: "grid", active: true },
      newArrivals: { heading: "Fresh Harvest Arrivals", productIds: [], maxDisplayCount: 8, layout: "grid", active: true },
      bestSellers: { heading: "Customer Top Favorites", productIds: [], maxDisplayCount: 8, layout: "grid", active: true }
    }
  };
}

export async function updateHomepageLayout(sections: CmsSection[]) {
  return await fetchJson<{ success: boolean; message: string; data: CmsSection[] }>(`/admin/cms/layout`, {
    method: "PUT",
    body: JSON.stringify({ sections })
  });
}

export async function getHeroBanners() {
  const res = await fetchJson<{ success: boolean; count: number; data: HeroBanner[] }>(`/admin/cms/hero-banners`);
  return res?.data || [];
}

export async function createHeroBanner(bannerData: Partial<HeroBanner>) {
  return await fetchJson<{ success: boolean; message: string; data: HeroBanner }>(`/admin/cms/hero-banners`, {
    method: "POST",
    body: JSON.stringify(bannerData)
  });
}

export async function updateHeroBanner(id: string, bannerData: Partial<HeroBanner>) {
  return await fetchJson<{ success: boolean; message: string; data: HeroBanner }>(`/admin/cms/hero-banners/${id}`, {
    method: "PUT",
    body: JSON.stringify(bannerData)
  });
}

export async function toggleHeroBanner(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: HeroBanner }>(`/admin/cms/hero-banners/${id}/toggle`, {
    method: "PATCH"
  });
}

export async function deleteHeroBanner(id: string) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/cms/hero-banners/${id}`, {
    method: "DELETE"
  });
}

export async function getOfferBanners() {
  const res = await fetchJson<{ success: boolean; count: number; data: OfferBanner[] }>(`/admin/cms/offer-banners`);
  return res?.data || [];
}

export async function createOfferBanner(offerData: Partial<OfferBanner>) {
  return await fetchJson<{ success: boolean; message: string; data: OfferBanner }>(`/admin/cms/offer-banners`, {
    method: "POST",
    body: JSON.stringify(offerData)
  });
}

export async function updateOfferBanner(id: string, offerData: Partial<OfferBanner>) {
  return await fetchJson<{ success: boolean; message: string; data: OfferBanner }>(`/admin/cms/offer-banners/${id}`, {
    method: "PUT",
    body: JSON.stringify(offerData)
  });
}

export async function toggleOfferBanner(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: OfferBanner }>(`/admin/cms/offer-banners/${id}/toggle`, {
    method: "PATCH"
  });
}

export async function deleteOfferBanner(id: string) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/cms/offer-banners/${id}`, {
    method: "DELETE"
  });
}

export async function getCategoryBanners() {
  const res = await fetchJson<{ success: boolean; count: number; data: CategoryBanner[] }>(`/admin/cms/category-banners`);
  return res?.data || [];
}

export async function createCategoryBanner(catData: Partial<CategoryBanner>) {
  return await fetchJson<{ success: boolean; message: string; data: CategoryBanner }>(`/admin/cms/category-banners`, {
    method: "POST",
    body: JSON.stringify(catData)
  });
}

export async function updateCategoryBanner(id: string, catData: Partial<CategoryBanner>) {
  return await fetchJson<{ success: boolean; message: string; data: CategoryBanner }>(`/admin/cms/category-banners/${id}`, {
    method: "PUT",
    body: JSON.stringify(catData)
  });
}

export async function toggleCategoryBanner(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: CategoryBanner }>(`/admin/cms/category-banners/${id}/toggle`, {
    method: "PATCH"
  });
}

export async function deleteCategoryBanner(id: string) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/cms/category-banners/${id}`, {
    method: "DELETE"
  });
}

export async function getFlashSaleBanners() {
  const res = await fetchJson<{ success: boolean; count: number; data: FlashSaleBanner[] }>(`/admin/cms/flash-sale`);
  return res?.data || [];
}

export async function createFlashSaleBanner(fsData: Partial<FlashSaleBanner>) {
  return await fetchJson<{ success: boolean; message: string; data: FlashSaleBanner }>(`/admin/cms/flash-sale`, {
    method: "POST",
    body: JSON.stringify(fsData)
  });
}

export async function updateFlashSaleBanner(id: string, fsData: Partial<FlashSaleBanner>) {
  return await fetchJson<{ success: boolean; message: string; data: FlashSaleBanner }>(`/admin/cms/flash-sale/${id}`, {
    method: "PUT",
    body: JSON.stringify(fsData)
  });
}

export async function toggleFlashSaleBanner(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: FlashSaleBanner }>(`/admin/cms/flash-sale/${id}/toggle`, {
    method: "PATCH"
  });
}

export async function deleteFlashSaleBanner(id: string) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/cms/flash-sale/${id}`, {
    method: "DELETE"
  });
}

export async function getCuratedSections() {
  const res = await fetchJson<{
    success: boolean;
    data: {
      featured: CuratedSectionConfig;
      trending: CuratedSectionConfig;
      newArrivals: CuratedSectionConfig;
      bestSellers: CuratedSectionConfig;
    };
  }>(`/admin/cms/curated-sections`);
  return res?.data;
}

export async function updateCuratedSection(sectionKey: string, config: Partial<CuratedSectionConfig>) {
  return await fetchJson<{ success: boolean; message: string; data: CuratedSectionConfig }>(`/admin/cms/curated-sections/${sectionKey}`, {
    method: "PUT",
    body: JSON.stringify(config)
  });
}

// ----------------------------------------------------
// MARKETING MANAGEMENT & AUTOMATION TYPES & API
// ----------------------------------------------------

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: "email" | "sms" | "push" | "announcement_banner" | "whatsapp";
  type: "offer" | "festival" | "coupon" | "newsletter";
  subject: string;
  previewText?: string;
  messageBody: string;
  targetSegmentId: string;
  targetSegmentName: string;
  targetAudienceCount: number;
  couponCode?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  bannerStyle?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    position?: string;
  };
  status: "Draft" | "Scheduled" | "Sending" | "Sent" | "Active" | "Paused" | "Cancelled";
  scheduledAt?: string | null;
  sentAt?: string | null;
  stats: {
    recipients: number;
    delivered: number;
    deliveryRate: number;
    opened: number;
    openRate: number;
    clicked: number;
    clickRate: number;
    conversions: number;
    revenue: number;
  };
  createdBy?: string;
  createdAt: string;
}

export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  criteria: string;
  count: number;
  growthRate?: string;
  createdAt: string;
}

export interface NotificationHistoryItem {
  id: string;
  campaignId: string;
  campaignName: string;
  channel: string;
  segment: string;
  recipients: number;
  delivered: number;
  status: string;
  sentAt: string;
  openRate: number;
  clickRate: number;
  revenue: number;
  providerStatus: string;
}

export interface MarketingOverviewData {
  totalCampaigns: number;
  totalRecipients: number;
  totalRevenue: number;
  avgEmailOpenRate: number;
  avgSmsDeliveryRate: number;
  avgPushCtr: number;
  activeBanners: number;
  scheduledDrops: number;
  channelsActive: string[];
}

export interface MarketingAnalyticsData {
  channelBreakdown: Array<{
    channel: string;
    campaignsCount: number;
    reach: number;
    openRate: number;
    revenue: number;
  }>;
  campaignTypePerformance: Array<{
    type: string;
    revenue: number;
    orders: number;
    avgOrderValue: number;
  }>;
}

export async function getMarketingOverview(): Promise<MarketingOverviewData> {
  const res = await fetchJson<{ success: boolean; data: MarketingOverviewData }>(`/admin/marketing/overview`);
  return res?.data || {
    totalCampaigns: 0,
    totalRecipients: 0,
    totalRevenue: 0,
    avgEmailOpenRate: 38.4,
    avgSmsDeliveryRate: 97.8,
    avgPushCtr: 14.2,
    activeBanners: 0,
    scheduledDrops: 0,
    channelsActive: ["email", "sms", "push", "announcement_banner", "whatsapp"]
  };
}

export async function getMarketingCampaigns(params?: {
  channel?: string;
  type?: string;
  status?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.channel && params.channel !== "all") query.append("channel", params.channel);
  if (params?.type && params.type !== "all") query.append("type", params.type);
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.search) query.append("search", params.search);

  const res = await fetchJson<{
    success: boolean;
    count: number;
    total: number;
    data: MarketingCampaign[];
  }>(`/admin/marketing/campaigns?${query.toString()}`);
  return res || { success: true, count: 0, total: 0, data: [] };
}

export async function getMarketingCampaignById(id: string) {
  const res = await fetchJson<{ success: boolean; data: MarketingCampaign }>(`/admin/marketing/campaigns/${id}`);
  return res?.data || null;
}

export async function createMarketingCampaign(payload: Partial<MarketingCampaign> & { sendNow?: boolean }) {
  return await fetchJson<{ success: boolean; message: string; data: MarketingCampaign }>(`/admin/marketing/campaigns`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateMarketingCampaign(id: string, payload: Partial<MarketingCampaign>) {
  return await fetchJson<{ success: boolean; message: string; data: MarketingCampaign }>(`/admin/marketing/campaigns/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteMarketingCampaign(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: MarketingCampaign }>(`/admin/marketing/campaigns/${id}`, {
    method: "DELETE"
  });
}

export async function triggerMarketingCampaignSend(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: MarketingCampaign }>(`/admin/marketing/campaigns/${id}/send`, {
    method: "POST"
  });
}

export async function toggleMarketingCampaignStatus(id: string) {
  return await fetchJson<{ success: boolean; message: string; data: MarketingCampaign }>(`/admin/marketing/campaigns/${id}/toggle`, {
    method: "PATCH"
  });
}

export async function getAudienceSegments() {
  const res = await fetchJson<{ success: boolean; count: number; data: AudienceSegment[] }>(`/admin/marketing/segments`);
  return res?.data || [];
}

export async function createAudienceSegment(payload: {
  name: string;
  description?: string;
  criteria: string;
  estimatedCount?: number;
}) {
  return await fetchJson<{ success: boolean; message: string; data: AudienceSegment }>(`/admin/marketing/segments`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getNotificationHistory(params?: { channel?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.channel && params.channel !== "all") query.append("channel", params.channel);
  if (params?.status && params.status !== "all") query.append("status", params.status);

  const res = await fetchJson<{
    success: boolean;
    count: number;
    total: number;
    data: NotificationHistoryItem[];
  }>(`/admin/marketing/history?${query.toString()}`);
  return res || { success: true, count: 0, total: 0, data: [] };
}

export async function getMarketingAnalytics() {
  const res = await fetchJson<{ success: boolean; data: MarketingAnalyticsData }>(`/admin/marketing/analytics`);
  return res?.data || { channelBreakdown: [], campaignTypePerformance: [] };
}

// ==========================================
// REPORTS & ANALYTICS ENTERPRISE TYPES & CLIENT
// ==========================================

export interface ReportsSummary {
  grossSales: number;
  netSales: number;
  discounts: number;
  taxCollected: number;
  shippingFees: number;
  totalOrders: number;
  aov: number;
  cogs: number;
  grossProfit: number;
  grossProfitMarginPercent: number;
  netEbitda: number;
  ebitdaMarginPercent: number;
  activeCustomers: number;
  repeatPurchaseRate: number;
  codSharePercent: number;
  onlineSharePercent: number;
}

export interface SalesTimeSeriesPoint {
  date: string;
  grossSales: number;
  netSales: number;
  ordersCount: number;
  discount: number;
  tax: number;
  shipping: number;
}

export interface PaymentMethodDistributionItem {
  method: string;
  share: number;
  revenue: number;
  count: number;
}

export interface SalesChannelItem {
  channel: string;
  share: number;
  revenue: number;
  orders: number;
}

export interface SalesReportData {
  grossSales: number;
  netSales: number;
  discounts: number;
  taxCollected: number;
  shippingFees: number;
  totalOrders: number;
  aov: number;
  timeSeries: SalesTimeSeriesPoint[];
  paymentMethodDistribution: PaymentMethodDistributionItem[];
  salesByChannel: SalesChannelItem[];
}

export interface MonthlyPnlItem {
  month: string;
  grossSales: number;
  cogs: number;
  opex: number;
  grossProfit: number;
  netEbitda: number;
  margin: string;
}

export interface RevenueReportData {
  grossRevenue: number;
  cogs: number;
  grossProfit: number;
  grossProfitMarginPercent: number;
  gatewayFees: number;
  shippingCosts: number;
  packagingCosts: number;
  marketingSpend: number;
  netEbitda: number;
  ebitdaMarginPercent: number;
  monthlyPnl: MonthlyPnlItem[];
}

export interface OrderStatusBreakdownItem {
  status: string;
  count: number;
  percentage: number;
  color: string;
  revenue: number;
}

export interface OrderReportData {
  totalOrders: number;
  completedOrders: number;
  inTransitOrders: number;
  processingOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  aov: number;
  fulfillmentVelocityHours: number;
  onTimeDeliveryRate: string;
  statusBreakdown: OrderStatusBreakdownItem[];
}

export interface TierDistributionItem {
  tier: string;
  count: number;
  share: number;
  minSpend: string;
  avgSpend: number;
  color: string;
}

export interface LtvCohortItem {
  bracket: string;
  count: number;
  percentage: number;
}

export interface CustomerReportData {
  totalRegisteredCustomers: number;
  newCustomersInPeriod: number;
  returningCustomersInPeriod: number;
  repeatPurchaseRate: number;
  avgLtv: number;
  tierDistribution: TierDistributionItem[];
  ltvCohorts: LtvCohortItem[];
}

export interface FastMovingSkuItem {
  sku: string;
  name: string;
  stock: number;
  monthlyRunRate: number;
  daysOfSupply: number;
  status: string;
}

export interface SlowMovingSkuItem {
  sku: string;
  name: string;
  stock: number;
  monthlyRunRate: number;
  daysOfSupply: number;
  status: string;
}

export interface InventoryReportData {
  totalSkus: number;
  inStockSkus: number;
  lowStockSkus: number;
  outOfStockSkus: number;
  totalRetailValuation: number;
  totalCostValuation: number;
  stockTurnoverRatio: string;
  fastMovingSkus: FastMovingSkuItem[];
  slowMovingSkus: SlowMovingSkuItem[];
}

export interface TopCouponItem {
  code: string;
  type: string;
  redemptions: number;
  totalDiscount: number;
  revenueGenerated: number;
  roi: string;
  conversion: string;
}

export interface CouponReportData {
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
  totalDiscountsDisbursed: number;
  attributedRevenue: number;
  avgRoiMultiplier: string;
  topCoupons: TopCouponItem[];
}

export interface TopAdvocateItem {
  name: string;
  code: string;
  invites: number;
  converted: number;
  rewardsEarned: number;
  revenueDriven: number;
  tier: string;
}

export interface ReferralReportData {
  totalInvites: number;
  convertedAdvocates: number;
  totalRewardsDisbursed: number;
  walletRedeemed: number;
  referralGmv: number;
  referralConversionRate: string;
  topAdvocates: TopAdvocateItem[];
}

export interface CashReconciliationData {
  totalCodCollectedCourier: number;
  remittedToJananiBank: number;
  pendingCourierRemittance: number;
  courierSettlementCycle: string;
}

export interface CodVsOnlineReportData {
  onlineOrdersCount: number;
  onlineRevenue: number;
  onlineSharePercent: number;
  onlineRtoPercent: number;
  codOrdersCount: number;
  codRevenue: number;
  codSharePercent: number;
  codRtoPercent: number;
  cashReconciliation: CashReconciliationData;
}

export interface TopProductReportItem {
  rank: number;
  sku: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  cogs: number;
  margin: string;
  stock: number;
  inStock: boolean;
}

export interface TopCategoryReportItem {
  rank: number;
  name: string;
  revenue: number;
  sharePercent: number;
  unitsSold: number;
  productsCount: number;
  growthRate: string;
}

export interface TopCustomerReportItem {
  rank: number;
  id: string;
  name: string;
  email: string;
  city: string;
  tier: string;
  ordersCount: number;
  totalSpend: number;
  aov: number;
  loyaltyPoints: number;
  lastOrder: string;
}

export interface ReportsAnalyticsData {
  summary: ReportsSummary;
  salesReport: SalesReportData;
  revenueReport: RevenueReportData;
  orderReport: OrderReportData;
  customerReport: CustomerReportData;
  inventoryReport: InventoryReportData;
  couponReport: CouponReportData;
  referralReport: ReferralReportData;
  codVsOnlineReport: CodVsOnlineReportData;
  topProducts: TopProductReportItem[];
  topCategories: TopCategoryReportItem[];
  topCustomers: TopCustomerReportItem[];
}

export interface Gstr1Summary {
  taxableTurnover: number;
  totalTaxCollected: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  invoiceCount: number;
  taxRate: string;
}

export interface HsnBreakdownItem {
  hsnCode: string;
  description: string;
  uqc: string;
  totalQuantity: number;
  totalValue: number;
  taxableValue: number;
  rate: number;
  integratedTax: number;
  centralTax: number;
  stateTax: number;
  cess: number;
}

export interface StateWiseTaxItem {
  state: string;
  stateCode: string;
  type: string;
  invoiceCount: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
}

export interface B2cSmallInvoiceItem {
  invoiceNo: string;
  date: string;
  customer: string;
  state: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface GstReportData {
  gstr1Summary: Gstr1Summary;
  hsnBreakdown: HsnBreakdownItem[];
  stateWiseTax: StateWiseTaxItem[];
  b2cSmallInvoices: B2cSmallInvoiceItem[];
}

export async function getReportsAnalytics(params?: { period?: string; startDate?: string; endDate?: string }) {
  const query = new URLSearchParams();
  if (params?.period) query.append("period", params.period);
  if (params?.startDate) query.append("startDate", params.startDate);
  if (params?.endDate) query.append("endDate", params.endDate);

  const res = await fetchJson<{
    success: boolean;
    period: string;
    periodLabel: string;
    daysCount: number;
    data: ReportsAnalyticsData;
  }>(`/admin/reports/analytics?${query.toString()}`);

  return res || null;
}

export async function getGstTaxReport(params?: { period?: string; financialYear?: string; month?: string }) {
  const query = new URLSearchParams();
  if (params?.period) query.append("period", params.period);
  if (params?.financialYear) query.append("financialYear", params.financialYear);
  if (params?.month) query.append("month", params.month);

  const res = await fetchJson<{
    success: boolean;
    financialYear: string;
    month: string;
    period: string;
    gstin: string;
    legalName: string;
    tradeName: string;
    data: GstReportData;
  }>(`/admin/reports/gst?${query.toString()}`);

  return res || null;
}

export function getReportExportUrl(type: string, format: string = "csv", period: string = "30d") {
  const base = typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api";
  return `${base}/admin/reports/export?type=${type}&format=${format}&period=${period}`;
}

// ==========================================
// ⚙️ SETTINGS, ROLES, STAFF & AUDIT API
// ==========================================

export interface StoreSettings {
  storeName: string;
  legalBusinessName: string;
  storeTagline: string;
  supportEmail: string;
  ordersEmail: string;
  supportPhone: string;
  tollFreeNumber: string;
  storeAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  fssaiLicenseNo: string;
  cinNumber: string;
  gstin: string;
  defaultCurrency: string;
  defaultTimezone: string;
  weightUnit: string;
  dimensionsUnit: string;
  orderIdPrefix: string;
  orderIdPadding: number;
  maintenanceMode: boolean;
  operatingHours: string;
}

export interface BrandingSettings {
  logoLightUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
  adminBrandAccent: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  emailHeaderBannerUrl: string;
  invoiceWatermarkText: string;
  customerAppBanner: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalBaseUrl: string;
  ogImageUrl: string;
  ogType: string;
  twitterCard: string;
  twitterHandle: string;
  googleSiteVerificationId: string;
  bingSiteVerificationId: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  schemaMarkupEnabled: boolean;
}

export interface RazorpayGatewayConfig {
  enabled: boolean;
  mode: "live" | "test";
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  autoCapture: boolean;
  supportedMethods: string[];
  status?: string | undefined;
}

export interface PhonePeGatewayConfig {
  enabled: boolean;
  mode: "live" | "test";
  merchantId: string;
  saltKey: string;
  saltIndex: string;
  env: string;
  webhookUrl: string;
  status?: string | undefined;
}

export interface CashfreeGatewayConfig {
  enabled: boolean;
  mode: "live" | "test";
  appId: string;
  secretKey: string;
  webhookUrl: string;
  status?: string | undefined;
}

export interface CodGatewayConfig {
  enabled: boolean;
  minOrderAmount: number;
  maxOrderAmount: number;
  verificationRequired: boolean;
  extraFee: number;
  otpPreVerification: boolean;
  restrictedPincodesCount: number;
}

export interface PaymentGatewaysSettings {
  razorpay: RazorpayGatewayConfig;
  phonepe: PhonePeGatewayConfig;
  cashfree: CashfreeGatewayConfig;
  cod: CodGatewayConfig;
}

export interface ShiprocketSettings {
  enabled: boolean;
  email: string;
  apiKey: string;
  apiSecret: string;
  tokenExpiry: string;
  defaultWarehouse: string;
  autoManifestOrders: boolean;
  weightBufferPercentage: number;
  preferredCouriers: string[];
  smartRoutingStrategy: string;
  rtoRiskThresholdScore: number;
  liveTrackingWebhookUrl: string;
}

export interface GstSettings {
  gstin: string;
  legalName: string;
  stateCode: string;
  registeredState: string;
  standardTaxRate: number;
  ayurvedicTaxRate: number;
  eWayBillThreshold: number;
  compositionScheme: boolean;
  eInvoiceApplicable: boolean;
  lutArnNumber: string;
  reverseChargeApplicable: boolean;
}

export interface DeliveryChargesSettings {
  freeDeliveryThreshold: number;
  standardShippingFee: number;
  expressAirShippingFee: number;
  ruralRemotePinSurcharge: number;
  codHandlingFee: number;
  metroSameDaySurcharge: number;
  estimatedStandardDays: string;
  estimatedExpressDays: string;
}

export interface ReferralRulesSettings {
  programEnabled: boolean;
  advocateRewardType: "wallet_cashback" | "flat_discount";
  advocateRewardAmount: number;
  friendDiscountType: "flat_discount" | "free_shipping";
  friendDiscountAmount: number;
  friendMinCartValue: number;
  rewardTriggerEvent: string;
  maxReferralsPerAdvocatePerMonth: number;
  walletExpiryDays: number;
  allowRewardStackingWithCoupons: boolean;
}

export interface CouponRulesSettings {
  maxCouponDiscountCap: number;
  allowStackingWithCategoryDiscounts: boolean;
  maxCouponsPerCart: number;
  firstTimeBuyerWelcomePromoCode: string;
  firstTimeDiscountAmount: number;
  minFirstOrderSpend: number;
  autoApplyBestCouponInCart: boolean;
  fraudDetectionMaxRedemptionsPerIp: number;
}

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  authRequired: boolean;
  username: string;
  password?: string | undefined;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  bccOrdersEmail: string;
  tlsEncryption: string;
  connectionStatus?: string | undefined;
}

export interface SmsSettings {
  provider: string;
  senderId: string;
  dltEntityId: string;
  apiKey: string;
  webhookUrl: string;
  templates: {
    orderConfirmationDltId: string;
    orderDispatchDltId: string;
    deliveryOtpDltId: string;
    marketingPromoDltId: string;
  };
  route: string;
  connectionStatus?: string | undefined;
}

export interface SecuritySettings {
  mandatoryTwoFactorAuth: boolean;
  sessionIdleTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  lockoutDurationMinutes: number;
  passwordExpirationDays: number;
  enforceStrongPassword: boolean;
  allowIpWhitelistingOnly: boolean;
  whitelistedIpAddresses: string[];
  corsAllowedOrigins: string[];
  cspHeadersEnabled: boolean;
  sslTlsEnforced: boolean;
  rateLimitingEnabled: boolean;
  rateLimitRequestsPerMin: number;
}

export interface AdminSettingsData {
  store: StoreSettings;
  branding: BrandingSettings;
  seo: SeoSettings;
  paymentGateways: PaymentGatewaysSettings;
  shiprocket: ShiprocketSettings;
  gst: GstSettings;
  deliveryCharges: DeliveryChargesSettings;
  referralRules: ReferralRulesSettings;
  couponRules: CouponRulesSettings;
  smtp: SmtpSettings;
  sms: SmsSettings;
  security: SecuritySettings;
}

export interface AdminRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  color: string;
  staffCount: number;
  permissions: string[];
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

export interface AdminStaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  roleName: string;
  department: string;
  avatar: string;
  status: "Active" | "Suspended" | "Pending Verification";
  twoFactorEnabled: boolean;
  lastLogin: string;
  lastLoginIp: string;
  lastLoginLocation: string;
  assignedWarehouses: string[];
  notes?: string | undefined;
  createdAt?: string | undefined;
}

export interface ActivityAuditLog {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  module: string;
  severity: "low" | "medium" | "high" | "critical";
  ipAddress: string;
  device: string;
  metadata?: Record<string, any> | undefined;
}

export interface LoginSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  ipAddress: string;
  location: string;
  deviceType: string;
  browser: string;
  loginTime: string;
  lastActive: string;
  twoFactorVerified: boolean;
  authMethod: string;
  status: "Active" | "Terminated";
  isCurrent: boolean;
}

export interface SystemBackup {
  id: string;
  filename: string;
  type: string;
  scope: string;
  size: string;
  recordCount: number;
  status: string;
  createdDate: string;
  createdBy: string;
  checksum: string;
  downloadUrl: string;
  notes?: string | undefined;
}

// Settings API Handlers
export async function getAdminSettings() {
  const res = await fetchJson<{ success: boolean; data: AdminSettingsData }>(`/admin/settings`);
  return res?.data || null;
}

export async function updateStoreSettings(payload: Partial<StoreSettings>) {
  return await fetchJson<{ success: boolean; message: string; data: StoreSettings }>(`/admin/settings/store`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateBrandingSettings(payload: Partial<BrandingSettings>) {
  return await fetchJson<{ success: boolean; message: string; data: BrandingSettings }>(`/admin/settings/branding`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateSeoSettings(payload: Partial<SeoSettings>) {
  return await fetchJson<{ success: boolean; message: string; data: SeoSettings }>(`/admin/settings/seo`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updatePaymentSettings(payload: Partial<PaymentGatewaysSettings>) {
  return await fetchJson<{ success: boolean; message: string; data: PaymentGatewaysSettings }>(`/admin/settings/payments`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateShippingSettings(payload: Partial<ShiprocketSettings>) {
  return await fetchJson<{ success: boolean; message: string; data: ShiprocketSettings }>(`/admin/settings/shipping`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateGstSettings(payload: Partial<GstSettings>) {
  return await fetchJson<{ success: boolean; message: string; data: GstSettings }>(`/admin/settings/gst`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateDeliveryFeeSettings(payload: Partial<DeliveryChargesSettings>) {
  return await fetchJson<{ success: boolean; message: string; data: DeliveryChargesSettings }>(`/admin/settings/delivery`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateReferralRulesSettings(payload: Partial<ReferralRulesSettings>) {
  return await fetchJson<{ success: boolean; message: string; data: ReferralRulesSettings }>(`/admin/settings/referrals`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateCouponRulesSettings(payload: Partial<CouponRulesSettings>) {
  return await fetchJson<{ success: boolean; message: string; data: CouponRulesSettings }>(`/admin/settings/coupons`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateSmtpSettings(payload: Partial<SmtpSettings>) {
  return await fetchJson<{ success: boolean; message: string; data: SmtpSettings }>(`/admin/settings/smtp`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function testSmtpConnection(recipientEmail: string) {
  return await fetchJson<{ success: boolean; message: string; diagnostic: any }>(`/admin/settings/smtp/test`, {
    method: "POST",
    body: JSON.stringify({ recipientEmail })
  });
}

export async function updateSmsSettings(payload: Partial<SmsSettings>) {
  return await fetchJson<{ success: boolean; message: string; data: SmsSettings }>(`/admin/settings/sms`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function testSmsConnection(recipientPhone: string) {
  return await fetchJson<{ success: boolean; message: string; diagnostic: any }>(`/admin/settings/sms/test`, {
    method: "POST",
    body: JSON.stringify({ recipientPhone })
  });
}

// Roles & Permissions API
export async function getAdminRoles() {
  const res = await fetchJson<{ success: boolean; roles: AdminRole[]; total: number }>(`/admin/roles`);
  return res?.roles || [];
}

export async function createAdminRole(payload: Partial<AdminRole>) {
  return await fetchJson<{ success: boolean; message: string; role: AdminRole }>(`/admin/roles`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateAdminRole(id: string, payload: Partial<AdminRole>) {
  return await fetchJson<{ success: boolean; message: string; role: AdminRole }>(`/admin/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteAdminRole(id: string) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/roles/${id}`, {
    method: "DELETE"
  });
}

// Admin Staff Management API
export async function getAdminStaffList() {
  const res = await fetchJson<{ success: boolean; staff: AdminStaffUser[]; total: number }>(`/admin/staff`);
  return res?.staff || [];
}

export async function createAdminStaff(payload: Partial<AdminStaffUser>) {
  return await fetchJson<{ success: boolean; message: string; staff: AdminStaffUser }>(`/admin/staff`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateAdminStaff(id: string, payload: Partial<AdminStaffUser>) {
  return await fetchJson<{ success: boolean; message: string; staff: AdminStaffUser }>(`/admin/staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function toggleAdminStaffStatus(id: string) {
  return await fetchJson<{ success: boolean; message: string; staff: AdminStaffUser }>(`/admin/staff/${id}/toggle`, {
    method: "PATCH"
  });
}

export async function deleteAdminStaff(id: string) {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/staff/${id}`, {
    method: "DELETE"
  });
}

// Activity Audit Logs API
export async function getActivityLogs(params?: { module?: string; severity?: string; search?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.module && params.module !== "all") query.append("module", params.module);
  if (params?.severity && params.severity !== "all") query.append("severity", params.severity);
  if (params?.search) query.append("search", params.search);
  if (params?.limit) query.append("limit", String(params.limit));

  const res = await fetchJson<{
    success: boolean;
    logs: ActivityAuditLog[];
    total: number;
    severities: { critical: number; high: number; medium: number; low: number };
  }>(`/admin/logs/activity?${query.toString()}`);
  return res || { success: true, logs: [], total: 0, severities: { critical: 0, high: 0, medium: 0, low: 0 } };
}

export async function clearActivityLogs() {
  return await fetchJson<{ success: boolean; message: string }>(`/admin/logs/activity/clear`, {
    method: "POST"
  });
}

// Login History API
export async function getLoginHistory() {
  const res = await fetchJson<{
    success: boolean;
    sessions: LoginSession[];
    total: number;
    activeSessionsCount: number;
  }>(`/admin/logs/logins`);
  return res || { success: true, sessions: [], total: 0, activeSessionsCount: 0 };
}

export async function terminateLoginSession(id: string) {
  return await fetchJson<{ success: boolean; message: string; session: LoginSession }>(`/admin/logs/logins/${id}/terminate`, {
    method: "POST"
  });
}

// Security Policies API
export async function updateSecuritySettings(payload: Partial<SecuritySettings>) {
  return await fetchJson<{ success: boolean; message: string; data: SecuritySettings }>(`/admin/security`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

// Backups API
export async function getSystemBackups() {
  const res = await fetchJson<{
    success: boolean;
    backups: SystemBackup[];
    total: number;
    systemStorageHealth: {
      totalCapacity: string;
      usedStorage: string;
      freeStorage: string;
      databaseEngine: string;
      lastAutomatedSnapshot: string;
    };
  }>(`/admin/backups`);
  return res || { success: true, backups: [], total: 0, systemStorageHealth: { totalCapacity: "100 GB", usedStorage: "0 GB", freeStorage: "100 GB", databaseEngine: "In-Memory", lastAutomatedSnapshot: "N/A" } };
}

export async function createSystemBackup(type?: string, notes?: string) {
  return await fetchJson<{ success: boolean; message: string; backup: SystemBackup }>(`/admin/backups/create`, {
    method: "POST",
    body: JSON.stringify({ type: type || "Manual Full Snapshot", notes: notes || "" })
  });
}

export async function restoreSystemBackup(id: string) {
  return await fetchJson<{ success: boolean; message: string; restoredFrom: SystemBackup }>(`/admin/backups/restore`, {
    method: "POST",
    body: JSON.stringify({ id })
  });
}

export function getBackupDownloadUrl(id: string) {
  const base = typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api";
  return `${base}/admin/backups/download/${id}`;
}

// ==========================================
// CUSTOMER AUTHENTICATION & ONBOARDING API
// ==========================================

export interface UserPreferences {
  dietary: string[];
  pinCode: string;
  notifications?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  walletBalance: number;
  referralCode: string;
  isVerified: boolean;
  tier?: string;
  preferences?: UserPreferences;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  isNewUser?: boolean;
  token: string;
  user: AuthUser;
}

export interface OtpSendResponse {
  success: boolean;
  message: string;
  demoOtpCode?: string;
  resendCooldownSeconds?: number;
}

export async function loginWithEmail(payload: { email: string; password: string; rememberMe?: boolean }) {
  return await fetchJson<AuthResponse>("/auth/login-email", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function sendAuthOtp(payload: { phone?: string; email?: string; purpose?: string }) {
  return await fetchJson<OtpSendResponse>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function verifyAuthOtp(payload: { phone?: string; email?: string; otp: string }) {
  return await fetchJson<AuthResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function signupCustomer(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
  agreeTerms: boolean;
}) {
  return await fetchJson<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function loginWithGoogle(payload?: {
  token?: string;
  email?: string;
  name?: string;
  avatar?: string;
}) {
  return await fetchJson<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
}

export async function forgotPassword(payload: { identifier: string }) {
  return await fetchJson<{ success: boolean; message: string; targetPhone?: string; demoOtpCode?: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function resetPassword(payload: { phone: string; otp: string; newPassword: string }) {
  return await fetchJson<{ success: boolean; message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getAuthProfile() {
  return await fetchJson<{ success: boolean; user: AuthUser }>("/auth/me");
}

export async function saveOnboardingPreferences(payload: {
  userId: string;
  dietary: string[];
  pinCode: string;
  notifications?: { email: boolean; sms: boolean; whatsapp: boolean };
}) {
  return await fetchJson<{ success: boolean; message: string; preferences: UserPreferences }>("/auth/preferences", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}










