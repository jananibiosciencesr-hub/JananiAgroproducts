import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  LogOut,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  FileText,
  Clock,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";
import { loadCustomerOrders, saveCustomerOrders } from "@/components/orders/orders-seed";
import { CustomerOrder } from "@/components/orders/types";
import { OrderInvoiceModal } from "@/components/order-success/order-invoice-modal";
import { loadUserSavedAddresses } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Account & Orders — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Customer portal to manage orders, real-time tracking, GST invoices, and saved delivery addresses." },
    ],
  }),
  component: DashboardPage,
  errorComponent: DashboardErrorFallback,
});

function DashboardErrorFallback({ error, reset }: { error: any; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-6">
      <div className="size-20 mx-auto rounded-3xl bg-amber-500/10 text-amber-600 grid place-items-center">
        <AlertCircle className="size-10" />
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold text-foreground">Dashboard Temporary Notice</h2>
        <p className="text-xs text-muted-foreground">
          We encountered an issue reading your cached account session. You can retry or refresh to continue.
        </p>
      </div>
      <div className="flex justify-center gap-3">
        <Button onClick={() => reset()} variant="gold" size="sm" className="rounded-full px-6 font-bold">
          Refresh Dashboard
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full px-6 font-semibold">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const { wishlist, addToCart, user, logoutUser, updateUserProfile, refreshUserProfile } = useStore();
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");

  // Real-time dynamic customer orders list strictly scoped to current user
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>(() => {
    try {
      const list = loadCustomerOrders(user?.email || user?.phone);
      return Array.isArray(list) ? list.filter((o) => o && typeof o === "object") : [];
    } catch (e) {
      console.warn("Failed to load initial customer orders:", e);
      return [];
    }
  });
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<CustomerOrder | null>(null);

  // Saved addresses state scoped strictly to the current logged-in user
  const [savedAddresses, setSavedAddresses] = useState<any[]>(() => {
    return loadUserSavedAddresses(user?.email || user?.id);
  });

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");

  // Refresh orders and addresses when user changes or component mounts
  useEffect(() => {
    try {
      const list = loadCustomerOrders(user?.email || user?.phone);
      if (Array.isArray(list)) {
        setCustomerOrders(list.filter((o) => o && typeof o === "object"));
      }
    } catch (e) {
      console.warn("Failed to refresh customer orders in useEffect:", e);
    }

    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
      setProfileEmail(user.email || "");
      setSavedAddresses(loadUserSavedAddresses(user.email || user.id));

      // Live fetch fresh profile from MySQL backend to guarantee phone & name sync
      const fetchLiveProfile = async () => {
        try {
          const identifier = user.email || user.id;
          if (!identifier) return;
          const res = await fetch(`/api.php?action=customers&id=${encodeURIComponent(identifier)}`);
          if (res.ok) {
            const data = await res.json();
            const serverUser = data?.customer || data?.user || data?.data;
            if (serverUser) {
              if (serverUser.phone) setProfilePhone(serverUser.phone);
              if (serverUser.name) setProfileName(serverUser.name);
              if (serverUser.email) setProfileEmail(serverUser.email);
            }
          }
        } catch (e) {
          console.warn("Failed to fetch customer profile in dashboard:", e);
        }
      };
      fetchLiveProfile();

      if (user.email || user.phone) {
        // Live fetch from MySQL server for this specific user
        const fetchLiveOrders = async () => {
          try {
            const qs = new URLSearchParams();
            if (user.email) qs.append("email", user.email);
            if (user.phone) qs.append("phone", user.phone);
            const res = await fetch(`/api.php?action=orders${qs.toString() ? `&${qs.toString()}` : ""}`);
            if (res.ok) {
              const data = await res.json();
              if (data?.success && Array.isArray(data.orders)) {
                const serverOrders: CustomerOrder[] = data.orders.map((o: any) => ({
                  id: o?.id || `ord-${o?.number || Date.now()}`,
                  number: o?.number || o?.orderNumber || "ORD-000",
                  orderNumber: o?.number || o?.orderNumber || "ORD-000",
                  customerEmail: o?.customer_email || o?.customerEmail || "",
                  customerPhone: o?.customer_phone || o?.customerPhone || "",
                  date: o?.order_date || o?.date || "Recent",
                  isoDate: o?.created_at ? o.created_at.split(" ")[0] : new Date().toISOString().split("T")[0]!,
                  status: (o?.order_status || o?.status || "Processing") as any,
                  courier: o?.courier || "Delhivery Air Express & Janani Direct",
                  awb: o?.awb || o?.tracking_id || `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                  expectedDelivery: o?.expected_delivery || o?.expectedDelivery || "Tomorrow Morning (9:00 AM – 1:00 PM)",
                  deliverySlot: o?.delivery_slot || o?.deliverySlot,
                  subtotal: Number(o?.subtotal) || 0,
                  discount: Number(o?.discount) || 0,
                  couponCode: o?.coupon_code || o?.couponCode,
                  couponDiscount: Number(o?.coupon_discount || o?.couponDiscount || 0),
                  walletDeduction: Number(o?.wallet_deduction || o?.walletDeduction || 0),
                  deliveryFee: Number(o?.delivery_fee || o?.deliveryFee || 0),
                  total: Number(o?.total || o?.finalTotal || 0),
                  finalTotal: Number(o?.total || o?.finalTotal || 0),
                  paymentMethod: o?.payment_method || o?.paymentMethod || "Razorpay (Online)",
                  paymentStatus: o?.payment_status || o?.paymentStatus || "Paid",
                  transactionId: o?.transaction_id || o?.transactionId || "pay_rzp_verified",
                  address: {
                    fullName: o?.shippingAddress?.fullName || o?.shippingAddress?.name || o?.customer_name || user?.name || "Valued Patron",
                    phone: o?.shippingAddress?.phone || o?.customer_phone || user?.phone || "",
                    streetAddress: o?.shippingAddress?.streetAddress || o?.shippingAddress?.street || "Registered Delivery Address",
                    city: o?.shippingAddress?.city || "Ahmedabad",
                    state: o?.shippingAddress?.state || "Gujarat",
                    pincode: o?.shippingAddress?.pincode || "380054",
                  },
                  items: Array.isArray(o?.items) ? o.items.map((it: any) => ({
                    productId: it?.productId || it?.id || 1,
                    name: it?.title || it?.name || "Single-Origin Organic Harvest",
                    variant: it?.variant || "Standard Pack",
                    quantity: it?.quantity || it?.qty || 1,
                    price: Number(it?.price) || 399,
                    image: it?.image || "",
                  })) : [],
                  timeline: Array.isArray(o?.timeline) ? o.timeline : []
                }));
                setCustomerOrders(serverOrders);
                saveCustomerOrders(serverOrders, user.email || user.phone);
              }
            }
          } catch (e) {
            console.warn("Failed to fetch dashboard orders from server:", e);
          }
        };
        fetchLiveOrders();
      }
    }
  }, [user]);

  const handleLogout = () => {
    logoutUser();
    toast.info("Signed out successfully.");
    navigate({ to: "/" });
  };

  const handleReorder = (order: CustomerOrder) => {
    if (order?.items && Array.isArray(order.items) && order.items.length > 0) {
      order.items.forEach((item) => {
        if (item?.productId) {
          addToCart(item.productId, item.quantity || 1);
        }
      });
      toast.success(`Items from order ${order.number || "order"} added to your basket!`);
      navigate({ to: "/cart" });
    } else {
      addToCart(1, 1);
      toast.success(`Order items added to your basket!`);
      navigate({ to: "/cart" });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: profileName.trim(),
      phone: profilePhone.trim(),
      email: profileEmail.trim(),
    });
    toast.success("Profile updated successfully!");
  };

  const userName = user?.name || "Valued Patron";
  const userEmail = user?.email || "";
  const userPhone = user?.phone || "";
  const initials = (userName || "JP")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "JP";

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-6 animate-in fade-in duration-300">
        <div className="size-20 mx-auto rounded-3xl bg-brand-leaf/10 text-brand-leaf grid place-items-center shadow-inner">
          <Package className="size-10" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Sign In to View Your Orders & Account
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Sign in with your Email OTP to manage your orders, live tracking status, GST tax invoices, and saved delivery addresses.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild variant="gold" size="default" className="rounded-full px-7 font-bold shadow-md">
            <Link to="/login">Sign In / Register with OTP</Link>
          </Button>
          <Button asChild variant="outline" size="default" className="rounded-full px-6 font-semibold">
            <Link to="/products">Explore Harvest Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Profile Header Card */}
      <div className="rounded-[2.5rem] bg-forest p-6 sm:p-10 text-primary-foreground shadow-luxe flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:gap-5">
          <span className="grid size-16 sm:size-18 place-items-center rounded-full bg-brand-gold text-forest font-display text-2xl font-bold shadow-md shrink-0">
            {initials || "JP"}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/15 px-2.5 py-0.5 rounded-full">
                {user?.tier || "Janani Member"}
              </span>
              {user && (
                <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Verified Account
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold mt-1">{userName}</h1>
            <p className="text-xs text-primary-foreground/75 mt-0.5">{userEmail} {userPhone ? `· ${userPhone}` : ""}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="gold" size="sm" className="rounded-full px-5 font-bold shadow-sm">
            <Link to="/products">Shop Harvest</Link>
          </Button>
          {user ? (
            <Button onClick={handleLogout} variant="glass" size="sm" className="gap-1.5 rounded-full">
              <LogOut className="size-4" /> Sign Out
            </Button>
          ) : (
            <Button asChild variant="glass" size="sm" className="rounded-full">
              <Link to="/login">Sign In / Register</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mt-8 sm:mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Navigation Tabs */}
        <aside className="space-y-2 rounded-3xl border border-border bg-card p-4 shadow-soft h-fit">
          {[
            { id: "orders", label: "My Orders & Shipments", icon: Package, count: customerOrders.length },
            { id: "addresses", label: "Saved Addresses", icon: MapPin, count: savedAddresses.length },
            { id: "profile", label: "Personal Information", icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-semibold transition ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="size-4" /> {item.label}
                </span>
                {item.count !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="border-t border-border pt-3 mt-3 space-y-1">
            <Link
              to="/orders"
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-semibold text-foreground hover:bg-secondary transition"
            >
              <span className="flex items-center gap-2.5">
                <Truck className="size-4 text-brand-leaf" /> Orders Hub & Tracking
              </span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Link>
            <Link
              to="/wishlist"
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-semibold text-foreground hover:bg-secondary transition"
            >
              <span className="flex items-center gap-2.5">
                <Heart className="size-4 text-brand-leaf" /> My Wishlist
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                {wishlist.length}
              </span>
            </Link>
          </div>
        </aside>

        {/* Tab Panels */}
        <div>
          {/* 1. Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Package className="size-5 text-brand-leaf" />
                    My Harvest Orders & Shipments
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {customerOrders.length > 0
                      ? `Showing ${customerOrders.length} placed orders in real-time`
                      : "No active or past orders found"}
                  </span>
                </div>
                {customerOrders.length > 0 && (
                  <Button asChild variant="gold" size="sm" className="rounded-full text-xs font-bold gap-1.5 shadow-sm self-start sm:self-auto">
                    <Link to="/orders">
                      <Truck className="size-3.5" /> Full Orders Hub & Tracking
                    </Link>
                  </Button>
                )}
              </div>

              {customerOrders.length === 0 ? (
                /* Clean Empty State */
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center space-y-4">
                  <div className="size-16 mx-auto rounded-full bg-brand-leaf/10 text-brand-leaf grid place-items-center">
                    <ShoppingBag className="size-8" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">No Harvest Orders Yet</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                      Explore our single-origin cold-pressed oils, bio-inputs, and certified organic agricultural staples.
                    </p>
                  </div>
                  <Button asChild variant="gold" size="sm" className="rounded-full px-6 font-bold shadow-md">
                    <Link to="/products">
                      Browse Products <ArrowRight className="size-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              ) : (
                /* Orders List */
                <div className="space-y-5">
                  {customerOrders.filter(Boolean).map((o, idx) => {
                    const orderNum = o.number || o.orderNumber || `ORD-${idx + 1}`;
                    const orderTotal = o.total ?? o.finalTotal ?? 0;
                    const orderItems = Array.isArray(o.items) ? o.items.filter(Boolean) : [];
                    const orderAddress = o.address || {
                      fullName: userName,
                      city: "Ahmedabad",
                      pincode: "380054",
                      streetAddress: "Registered Delivery Address",
                    };

                    return (
                      <div
                        key={o.id || orderNum || idx}
                        className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft transition hover:shadow-md space-y-4"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <strong className="font-mono text-base font-bold text-foreground">{orderNum}</strong>
                              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                o.status === "Delivered"
                                  ? "bg-brand-leaf/15 text-brand-leaf"
                                  : o.status === "Cancelled"
                                  ? "bg-destructive/15 text-destructive"
                                  : "bg-brand-gold/20 text-brand-gold"
                              }`}>
                                ● {o.status || "Processing"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Placed on <strong className="text-foreground">{o.date || "Recent"}</strong> · {orderItems.length || 1} distinct products · Paid via {o.paymentMethod || "Online"}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[11px] text-muted-foreground block">Total Amount</span>
                              <strong className="text-lg font-bold text-foreground">₹{orderTotal}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Items Preview */}
                        {orderItems.length > 0 && (
                          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 bg-secondary/40 p-3.5 rounded-2xl border border-border/70">
                            {orderItems.map((item, itemIdx) => (
                              <div key={itemIdx} className="flex items-center gap-3">
                                {item?.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name || "Product"}
                                    className="size-12 rounded-xl object-cover border border-border shrink-0 bg-white"
                                  />
                                )}
                                <div className="min-w-0 flex-1 text-xs">
                                  <p className="font-semibold text-foreground truncate">{item?.name || "Organic Product"}</p>
                                  <p className="text-[11px] text-muted-foreground">
                                    Qty: {item?.quantity || 1} × ₹{item?.price || 0}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Delivery Address & Status Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
                          <div className="flex items-start sm:items-center gap-2">
                            <MapPin className="size-4 text-brand-leaf shrink-0 mt-0.5 sm:mt-0" />
                            <span>
                              Deliver to: <strong className="text-foreground">{orderAddress?.fullName || userName}</strong> ({orderAddress?.city || "Ahmedabad"}, {orderAddress?.pincode || "380054"})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Truck className="size-4 text-brand-leaf shrink-0" />
                            <span>{o.courier || "Delhivery Air Express"}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoiceOrder(o)}
                            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                          >
                            <FileText className="size-3.5 text-brand-leaf" /> View GST Invoice
                          </Button>

                          <div className="flex items-center gap-2.5">
                            <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl">
                              <Link to="/track-order">
                                Track Shipment <ArrowRight className="size-3 ml-1" />
                              </Link>
                            </Button>
                            <Button onClick={() => handleReorder(o)} variant="gold" size="sm" className="h-8 text-xs gap-1.5 rounded-xl font-bold">
                              <RefreshCw className="size-3" /> Reorder
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Saved Delivery Addresses</h2>
                  <span className="text-xs text-muted-foreground">Manage doorstep addresses for fast 1-click checkout</span>
                </div>
                <Button size="sm" variant="gold" asChild className="rounded-full text-xs font-bold">
                  <Link to="/checkout">+ Add / Manage at Checkout</Link>
                </Button>
              </div>

              {savedAddresses.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center space-y-3">
                  <MapPin className="size-10 text-muted-foreground mx-auto" />
                  <p className="text-sm font-semibold text-foreground">No saved addresses yet</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Addresses added during registration or checkout with GPS auto-fill will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {savedAddresses.filter(Boolean).map((addr: any, idx: number) => (
                    <div
                      key={addr?.id || idx}
                      className={`rounded-3xl border p-6 shadow-soft relative bg-card ${
                        addr?.isDefault ? "border-brand-leaf/50 ring-1 ring-brand-leaf/20" : "border-border"
                      }`}
                    >
                      {addr?.isDefault && (
                        <span className="absolute right-4 top-4 rounded-full bg-brand-leaf/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-leaf">
                          Default
                        </span>
                      )}
                      <p className="font-semibold text-sm capitalize flex items-center gap-1.5">
                        <MapPin className="size-4 text-brand-leaf" /> {addr?.type || "Home"} Address
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground leading-6">
                        <strong className="text-foreground">{addr?.fullName || addr?.name || userName}</strong><br />
                        {[addr?.houseFlat, addr?.street, addr?.landmark].filter(Boolean).join(", ") || addr?.streetAddress || addr?.addressLine1 || "Registered Address"}<br />
                        {addr?.city || "Ahmedabad"}, {addr?.state || "Gujarat"} – {addr?.pincode || "380054"}<br />
                        Phone: <span className="text-foreground font-mono">{addr?.phone || userPhone}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Personal Information & Profile
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update your contact details for SMS delivery alerts and invoice receipts.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <label className="grid gap-1.5 font-semibold text-foreground">
                  <span>Full Name</span>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-brand-leaf text-foreground"
                  />
                </label>
                <label className="grid gap-1.5 font-semibold text-foreground">
                  <span>Mobile Number</span>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+91 98480 22338"
                    className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-brand-leaf text-foreground"
                  />
                </label>
                <label className="grid gap-1.5 font-semibold text-foreground sm:col-span-2">
                  <span>Email Address</span>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="youremail@gmail.com"
                    className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-brand-leaf text-foreground"
                  />
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" size="sm" variant="gold" className="rounded-2xl px-6 font-bold">
                  Save Profile Changes
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Invoice Modal Preview */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          order={{
            orderNumber: selectedInvoiceOrder.number || selectedInvoiceOrder.orderNumber || "ORD-000",
            transactionId: selectedInvoiceOrder.transactionId || "pay_rzp_verified",
            date: selectedInvoiceOrder.date || "Recent",
            paymentMethod: selectedInvoiceOrder.paymentMethod || "Razorpay (Online)",
            customerName: selectedInvoiceOrder.address?.fullName || userName || "Valued Patron",
            customerPhone: selectedInvoiceOrder.address?.phone || userPhone || "",
            customerAddress: selectedInvoiceOrder.address
              ? `${selectedInvoiceOrder.address.streetAddress || ""}, ${selectedInvoiceOrder.address.city || ""}, ${selectedInvoiceOrder.address.state || ""} - ${selectedInvoiceOrder.address.pincode || ""}`
              : "Registered Delivery Address",
            items: (Array.isArray(selectedInvoiceOrder.items) ? selectedInvoiceOrder.items : []).map((it) => ({
              product: {
                id: it?.productId || 1,
                name: it?.name || "Single-Origin Organic Harvest",
                price: it?.price || 0,
              },
              qty: it?.quantity || 1,
            })),
            subtotal: selectedInvoiceOrder.subtotal || selectedInvoiceOrder.total || 0,
            discount: selectedInvoiceOrder.discount || 0,
            deliveryFee: selectedInvoiceOrder.deliveryFee || 0,
            finalTotal: selectedInvoiceOrder.total || selectedInvoiceOrder.finalTotal || 0,
          }}
        />
      )}
    </div>
  );
}
