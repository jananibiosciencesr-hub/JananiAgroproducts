import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  QrCode,
  CreditCard,
  Building,
  Wallet,
  Gift,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Package,
  Layers
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { products, pantryImage } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/api";

import { PaymentUpiSection } from "@/components/payment/payment-upi-section";
import { PaymentRazorpayModal } from "@/components/payment/payment-razorpay-modal";
import { PaymentStripeSection } from "@/components/payment/payment-stripe-section";
import { PaymentNetbankingSection } from "@/components/payment/payment-netbanking-section";
import { PaymentCodSection } from "@/components/payment/payment-cod-section";
import { PaymentWalletSection } from "@/components/payment/payment-wallet-section";
import { PaymentGiftcardSection } from "@/components/payment/payment-giftcard-section";
import {
  PaymentSuccessView,
  PaymentFailureView,
} from "@/components/payment/payment-status-views";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Payment & Settlement — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content: "Secure payment gateway for Janani organic harvest orders with UPI, Razorpay, Stripe, and NetBanking.",
      },
    ],
  }),
  component: PaymentPage,
});

type PaymentMethodTab = "upi" | "razorpay" | "stripe" | "netbanking" | "cod" | "wallet" | "giftcard";

export function PaymentPage() {
  const navigate = useNavigate();
  const { cart, subtotal, cartCount, user, clearCart, deductWalletBalance } = useStore();

  // Checkout context from localStorage or fallback
  const [checkoutData, setCheckoutData] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_pending_checkout");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse pending checkout", e);
      }
    }
    return null;
  });

  // Main UI State
  const [viewState, setViewState] = useState<"payment" | "success" | "failure">("payment");
  const [activeMethod, setActiveMethod] = useState<PaymentMethodTab>("upi");
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Success / Failure details
  const [transactionDetails, setTransactionDetails] = useState<{
    orderNumber: string;
    transactionId: string;
    method: string;
    amount: number;
    failureReason?: string;
  }>({
    orderNumber: checkoutData?.orderNumber || `JAP-${Math.floor(100000 + Math.random() * 900000)}`,
    transactionId: "",
    method: "",
    amount: checkoutData?.finalTotal || (subtotal > 0 ? subtotal : 420),
  });

  // Effective Order Values
  const effectiveAmount = checkoutData?.finalTotal || (subtotal > 0 ? subtotal : 420);
  const effectiveOrderNumber = checkoutData?.orderNumber || transactionDetails.orderNumber;
  const customerName = checkoutData?.customerName || checkoutData?.address?.fullName || user?.name || "Valued Patron";
  const customerPhone = checkoutData?.customerPhone || checkoutData?.address?.phone || user?.phone || "+91 98480 22338";
  const customerEmail = checkoutData?.customerEmail || user?.email || "patron@jananiagro.com";
  const deliveryDate = checkoutData?.slot?.dateStr || "Tomorrow Morning (9:00 AM – 1:00 PM)";
  const city = checkoutData?.address?.city || "Ahmedabad";

  // Cart items list for sidebar
  const cartItems = useMemo(() => {
    if (checkoutData?.items && checkoutData.items.length > 0) {
      return checkoutData.items;
    }
    return Object.entries(cart)
      .map(([idStr, qty]) => {
        const product = products.find((p) => p.id === Number(idStr));
        return product ? { product, qty } : null;
      })
      .filter((item): item is { product: NonNullable<typeof item>["product"]; qty: number } => item !== null);
  }, [cart, checkoutData]);

  // Handle Payment Success
  const handlePaymentSuccess = async (details: { method: string; transactionId: string }) => {
    setTransactionDetails((prev) => ({
      ...prev,
      transactionId: details.transactionId,
      method: details.method,
      amount: effectiveAmount,
    }));

    const nowFormatted = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const streetAddr = checkoutData?.address
      ? [checkoutData.address.houseFlat, checkoutData.address.street, checkoutData.address.landmark].filter(Boolean).join(", ") || checkoutData.address.streetAddress || "Registered Delivery Address"
      : "Registered Delivery Address";

    const confirmedOrder = {
      orderNumber: effectiveOrderNumber,
      transactionId: details.transactionId,
      paymentMethod: details.method,
      amount: effectiveAmount,
      deliveryDate,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress: checkoutData?.address
        ? `${streetAddr}, ${checkoutData.address.city}, ${checkoutData.address.state} - ${checkoutData.address.pincode}`
        : "Registered Delivery Address, Ahmedabad, Gujarat - 380054",
      items: cartItems.map((item: any) => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image || pantryImage,
        },
        qty: item.qty || 1,
      })),
      subtotal: checkoutData?.subtotal || subtotal,
      discount: checkoutData?.couponDiscount || checkoutData?.discount || 0,
      deliveryFee: checkoutData?.shippingFee || 0,
      finalTotal: effectiveAmount,
      slot: checkoutData?.slot || { dateStr: deliveryDate },
      address: checkoutData?.address || {
        fullName: customerName,
        phone: customerPhone,
        streetAddress: streetAddr,
        city,
        state: "Gujarat",
        pincode: "380054",
      },
    };

    // Full customer order object for Dashboard & Orders Hub
    const newCustomerOrder = {
      id: `ord-${Date.now()}`,
      number: effectiveOrderNumber,
      date: nowFormatted,
      isoDate: new Date().toISOString().split("T")[0]!,
      status: "Processing" as const,
      courier: "Delhivery Air Express & Janani Direct",
      awb: `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      expectedDelivery: deliveryDate,
      subtotal: checkoutData?.subtotal || subtotal,
      discount: checkoutData?.couponDiscount || checkoutData?.discount || 0,
      deliveryFee: checkoutData?.shippingFee || 0,
      total: effectiveAmount,
      paymentMethod: details.method,
      transactionId: details.transactionId,
      address: {
        fullName: customerName,
        phone: customerPhone,
        streetAddress: streetAddr,
        city: checkoutData?.address?.city || city,
        state: checkoutData?.address?.state || "Gujarat",
        pincode: checkoutData?.address?.pincode || "380054",
      },
      items: cartItems.map((item: any) => ({
        productId: item.product.id,
        name: item.product.name,
        variant: "Standard Pack",
        quantity: item.qty || 1,
        price: item.product.price,
        image: item.product.image || pantryImage,
      })),
      timeline: [
        {
          title: "Order Placed & Payment Verified",
          time: nowFormatted,
          location: "Regional Processing Hub",
          done: true,
          current: true,
        },
        {
          title: "Quality Tested & Nitrogen Sealed",
          time: "Within 4 hours",
          location: "Rajkot Lodhika Processing Facility",
          done: false,
        },
        {
          title: "Dispatched via Express Courier",
          time: "Scheduled Tomorrow",
          location: "Central Transit Gateway",
          done: false,
        },
        {
          title: "Out for Doorstep Delivery",
          time: deliveryDate,
          location: "Local Delivery Hub",
          done: false,
        },
      ],
    };

    // 1. Save latest order & customer orders in localStorage
    try {
      localStorage.setItem("janani_latest_order", JSON.stringify(confirmedOrder));

      const existingOrdersRaw = localStorage.getItem("janani_customer_orders");
      const existingOrders = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
      const updatedOrders = [newCustomerOrder, ...existingOrders.filter((o: any) => o.number !== effectiveOrderNumber)];
      localStorage.setItem("janani_customer_orders", JSON.stringify(updatedOrders));
    } catch (e) {
      console.error("Failed to save order to localStorage", e);
    }

    // 2. Persist order to backend database
    try {
      await createOrder({
        items: cartItems.map((i: any) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.qty || 1,
        })),
        customer: {
          firstName: customerName.split(" ")[0] || "Valued",
          lastName: customerName.split(" ").slice(1).join(" ") || "Patron",
          phone: customerPhone,
          email: customerEmail,
          address: streetAddr,
          city: checkoutData?.address?.city || city,
          state: checkoutData?.address?.state || "Gujarat",
          pincode: checkoutData?.address?.pincode || "380054",
        },
        paymentMethod: details.method,
        couponCode: checkoutData?.coupon?.code,
      });
    } catch (apiErr) {
      console.warn("Backend order creation sync note:", apiErr);
    }

    clearCart();
    if (checkoutData?.walletDeduction > 0) {
      deductWalletBalance(checkoutData.walletDeduction);
    }
    localStorage.removeItem("janani_pending_checkout");

    toast.success(`Payment verified via ${details.method}! Order ${effectiveOrderNumber} placed.`);
    navigate({ to: "/order-success" });
  };

  // Handle Payment Failure
  const handlePaymentFailure = (reason: string) => {
    setTransactionDetails((prev) => ({
      ...prev,
      failureReason: reason,
    }));
    setViewState("failure");
    toast.error("Payment failed. You can retry with another method.");
  };

  // 1-Click Retry Payment
  const handleRetryPayment = () => {
    setSimulateFailure(false);
    setViewState("payment");
    toast.info("Ready to retry payment. You may choose any gateway.");
  };

  const handleSwitchToCod = () => {
    setActiveMethod("cod");
    setViewState("payment");
    toast.info("Switched payment method to Cash on Delivery.");
  };

  if (viewState === "success") {
    return (
      <PaymentSuccessView
        orderNumber={effectiveOrderNumber}
        transactionId={transactionDetails.transactionId || `TXN-${Date.now().toString().slice(-8)}`}
        paymentMethod={transactionDetails.method || "Instant UPI"}
        amount={effectiveAmount}
        deliveryDate={deliveryDate}
        recipientName={customerName}
        recipientCity={city}
      />
    );
  }

  if (viewState === "failure") {
    return (
      <PaymentFailureView
        orderNumber={effectiveOrderNumber}
        reason={transactionDetails.failureReason || "Authorization timed out."}
        onRetryPayment={handleRetryPayment}
        onSwitchToCod={handleSwitchToCod}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 pb-24 lg:pb-12">
      {/* Header & Trust Badge */}
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Link to="/" className="hover:text-brand-leaf transition">Home</Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-brand-leaf transition">Cart</Link>
            <span>/</span>
            <Link to="/checkout" className="hover:text-brand-leaf transition">Checkout</Link>
            <span>/</span>
            <span className="text-brand-leaf">Payment</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl text-foreground flex items-center gap-3">
            Choose Payment Method
          </h1>
        </div>

        {/* Security / QA controls */}
        <div className="flex items-center gap-3">
          {/* Test Failure Toggle for QA */}
          <label className="flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-3.5 py-1.5 text-xs font-semibold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="rounded text-destructive focus:ring-destructive size-3.5"
            />
            <span className={simulateFailure ? "text-destructive font-bold" : "text-muted-foreground"}>
              {simulateFailure ? "⚠️ Simulate Failure ON" : "Test Mode: Success"}
            </span>
          </label>

          <div className="flex items-center gap-2 rounded-full border border-brand-leaf/30 bg-brand-leaf/5 px-4 py-1.5 text-xs font-semibold text-brand-leaf">
            <ShieldCheck className="size-4" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Payment Tabs + Right Summary Rail */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] items-start">
        {/* Left Column: Method Tabs & Active Section */}
        <div className="space-y-6">
          {/* Methods Horizontal / Vertical Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              { id: "upi", label: "Instant UPI", icon: QrCode, badge: "FAST" },
              { id: "razorpay", label: "Razorpay", icon: Layers, badge: "POPULAR" },
              { id: "stripe", label: "Cards", icon: CreditCard },
              { id: "netbanking", label: "NetBanking", icon: Building },
              { id: "wallet", label: "Wallet", icon: Wallet },
              { id: "giftcard", label: "Gift Card", icon: Gift },
              { id: "cod", label: "COD", icon: ShieldCheck },
            ].map((method) => {
              const Icon = method.icon;
              const isActive = activeMethod === method.id;
              return (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => {
                    setActiveMethod(method.id as PaymentMethodTab);
                    if (method.id === "razorpay") {
                      setIsRazorpayModalOpen(true);
                    }
                  }}
                  className={`relative p-3 sm:py-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isActive
                      ? "border-brand-leaf bg-brand-leaf/10 text-brand-leaf shadow-sm ring-1 ring-brand-leaf/30 font-bold"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/60 font-semibold"
                  }`}
                >
                  {method.badge && (
                    <span className="absolute top-1 right-1 text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-brand-gold/15 text-brand-gold">
                      {method.badge}
                    </span>
                  )}
                  <Icon className="size-5" />
                  <span className="text-[11px] truncate w-full">{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Method Section Container */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-soft">
            {activeMethod === "upi" && (
              <PaymentUpiSection
                amount={effectiveAmount}
                orderNumber={effectiveOrderNumber}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
                simulateFailure={simulateFailure}
              />
            )}

            {activeMethod === "razorpay" && (
              <div className="text-center py-6 space-y-4">
                <div className="size-16 mx-auto rounded-3xl bg-blue-900/10 text-blue-950 flex items-center justify-center">
                  <Layers className="size-8" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Razorpay Checkout Gateway
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Seamless checkout with Debit/Credit cards, NetBanking, and UPI through Razorpay.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsRazorpayModalOpen(true)}
                  className="bg-[#0c2340] hover:bg-[#153a66] text-white font-bold text-xs h-11 px-8 rounded-xl shadow-md"
                >
                  Open Razorpay Modal (₹{effectiveAmount})
                </Button>
              </div>
            )}

            {activeMethod === "stripe" && (
              <PaymentStripeSection
                amount={effectiveAmount}
                orderNumber={effectiveOrderNumber}
                customerName={customerName}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
                simulateFailure={simulateFailure}
              />
            )}

            {activeMethod === "netbanking" && (
              <PaymentNetbankingSection
                amount={effectiveAmount}
                orderNumber={effectiveOrderNumber}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
                simulateFailure={simulateFailure}
              />
            )}

            {activeMethod === "wallet" && (
              <PaymentWalletSection
                amount={effectiveAmount}
                orderNumber={effectiveOrderNumber}
                walletBalance={user?.walletBalance ?? 250}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
                simulateFailure={simulateFailure}
              />
            )}

            {activeMethod === "giftcard" && (
              <PaymentGiftcardSection
                amount={effectiveAmount}
                orderNumber={effectiveOrderNumber}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
                simulateFailure={simulateFailure}
              />
            )}

            {activeMethod === "cod" && (
              <PaymentCodSection
                amount={effectiveAmount}
                orderNumber={effectiveOrderNumber}
                customerPhone={customerPhone}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
                simulateFailure={simulateFailure}
              />
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Security Info */}
        <div className="space-y-5 sticky top-24">
          {/* Order Snapshot Card */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                <Package className="size-4 text-brand-leaf" />
                Order Summary
              </span>
              <span className="font-mono text-xs font-bold text-muted-foreground">
                {effectiveOrderNumber}
              </span>
            </div>

            {/* Recipient Snippet */}
            <div className="text-xs text-muted-foreground space-y-1 bg-secondary/50 p-3 rounded-2xl border border-border/80">
              <div className="flex justify-between font-semibold text-foreground">
                <span>Deliver To:</span>
                <span className="text-brand-leaf">{customerName}</span>
              </div>
              <p className="line-clamp-1">{checkoutData?.address?.street || "Judges Bungalow Road, Bodakdev"}</p>
              <p className="font-semibold text-foreground">
                Slot: <span className="text-brand-leaf">{deliveryDate}</span>
              </p>
            </div>

            {/* Items list */}
            {cartItems.length > 0 && (
              <div className="max-h-40 overflow-y-auto divide-y divide-border/60 pr-1 text-xs space-y-1">
                {cartItems.map((item: any, idx: number) => {
                  const p = item.product || item;
                  const q = item.qty || item.quantity || 1;
                  return (
                    <div key={idx} className="flex items-center justify-between py-1.5">
                      <span className="truncate pr-2 text-foreground font-medium">
                        {p.name} <span className="text-muted-foreground">×{q}</span>
                      </span>
                      <strong className="text-foreground font-mono">
                        ₹{(p.price || 0) * q}
                      </strong>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Price Calculations */}
            <div className="border-t border-border pt-3 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">
                  ₹{checkoutData?.subtotal || subtotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-semibold text-brand-leaf">
                  {checkoutData?.shippingFee === 0 || subtotal >= 799 ? "FREE" : "₹60"}
                </span>
              </div>
              {checkoutData?.couponDiscount > 0 && (
                <div className="flex justify-between text-brand-leaf font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{checkoutData.couponDiscount}</span>
                </div>
              )}
              {checkoutData?.walletDeduction > 0 && (
                <div className="flex justify-between text-brand-leaf font-semibold">
                  <span>Farm Wallet</span>
                  <span>-₹{checkoutData.walletDeduction}</span>
                </div>
              )}
            </div>

            {/* Total Payable */}
            <div className="border-t border-border pt-3 flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Payable
              </span>
              <span className="font-display text-2xl font-bold text-foreground">
                ₹{effectiveAmount}
              </span>
            </div>
          </div>

          {/* Security Guarantee Card */}
          <div className="rounded-2xl border border-border bg-card p-4 text-[11px] text-muted-foreground space-y-2 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <ShieldCheck className="size-4 text-brand-leaf" />
              <span>Certified Payment Security</span>
            </div>
            <p className="leading-relaxed">
              All transactions are encrypted with 256-bit TLS bank-grade certificates. Janani Agro does not store raw CVV codes or payment passwords.
            </p>
          </div>
        </div>
      </div>

      {/* Razorpay Popover Modal */}
      <PaymentRazorpayModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        amount={effectiveAmount}
        orderNumber={effectiveOrderNumber}
        customerName={customerName}
        customerPhone={customerPhone}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
        simulateFailure={simulateFailure}
      />
    </div>
  );
}
