import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  CreditCard,
  QrCode,
  Building,
  Wallet,
  Sparkles,
  CheckCircle2,
  Package,
  Layers,
  Zap,
  HelpCircle,
  ExternalLink,
  Shield,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { products, pantryImage } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/api";
import {
  openRazorpayCheckout,
  loadRazorpayScript,
  RAZORPAY_KEY_ID
} from "@/lib/razorpay";
import { PaymentRazorpayModal } from "@/components/payment/payment-razorpay-modal";
import {
  PaymentSuccessView,
  PaymentFailureView,
} from "@/components/payment/payment-status-views";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Razorpay Secure Payment — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content: "Official Razorpay payment gateway for Janani organic harvest orders. Supports UPI, Cards, NetBanking, and Wallets.",
      },
    ],
  }),
  component: PaymentPage,
});

export function PaymentPage() {
  const navigate = useNavigate();
  const { cart, subtotal, user, clearCart, deductWalletBalance } = useStore();

  // Checkout context from localStorage or fallback
  const [checkoutData] = useState<any>(() => {
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

  // UI States
  const [viewState, setViewState] = useState<"payment" | "success" | "failure">("payment");
  const [isProcessing, setIsProcessing] = useState(false);
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
    method: "Razorpay Standard Gateway",
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

  // Pre-load Razorpay script on page mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

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

  // Handle Payment Success & Order Settlement
  const handlePaymentSuccess = async (details: { method: string; transactionId: string }) => {
    setTransactionDetails((prev) => ({
      ...prev,
      transactionId: details.transactionId,
      method: details.method || "Razorpay Gateway",
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
      paymentMethod: details.method || "Razorpay (All-In-One)",
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
      couponCode: checkoutData?.coupon?.code || checkoutData?.couponCode || "",
      couponDiscount: checkoutData?.couponDiscount || (checkoutData?.coupon?.code ? checkoutData?.discount : 0) || 0,
      walletDeduction: checkoutData?.walletDeduction || 0,
      deliveryFee: checkoutData?.shippingFee || 0,
      finalTotal: effectiveAmount,
      total: effectiveAmount,
      slot: checkoutData?.slot || { dateStr: deliveryDate },
      deliverySlot: checkoutData?.slot?.dateStr || deliveryDate,
      address: checkoutData?.address || {
        fullName: customerName,
        phone: customerPhone,
        streetAddress: streetAddr,
        city,
        state: "Gujarat",
        pincode: "380054",
      },
      paymentMethod: "Razorpay (Online)",
      transactionId: details.transactionId,
      razorpayOrderId: details.razorpayOrderId,
    };

    // Full customer order object for Dashboard & Orders Hub with Flipkart 5-stage tracking
    const newCustomerOrder = {
      id: `ord-${Date.now()}`,
      number: effectiveOrderNumber,
      orderNumber: effectiveOrderNumber,
      date: nowFormatted,
      isoDate: new Date().toISOString().split("T")[0]!,
      status: "Processing" as const,
      courier: "Delhivery Air Express & Janani Direct",
      awb: `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      expectedDelivery: deliveryDate,
      deliverySlot: checkoutData?.slot?.dateStr || deliveryDate,
      subtotal: checkoutData?.subtotal || subtotal,
      discount: checkoutData?.couponDiscount || checkoutData?.discount || 0,
      couponCode: checkoutData?.coupon?.code || checkoutData?.couponCode || "",
      couponDiscount: checkoutData?.couponDiscount || (checkoutData?.coupon?.code ? checkoutData?.discount : 0) || 0,
      walletDeduction: checkoutData?.walletDeduction || 0,
      deliveryFee: checkoutData?.shippingFee || 0,
      total: effectiveAmount,
      finalTotal: effectiveAmount,
      paymentMethod: "Razorpay (Online)",
      paymentStatus: "Paid",
      transactionId: details.transactionId,
      razorpayOrderId: details.razorpayOrderId,
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
        qty: item.qty || 1,
        price: item.product.price,
        image: item.product.image || pantryImage,
      })),
      timeline: [
        {
          title: "Order Placed & Payment Verified via Razorpay",
          time: nowFormatted,
          location: "Regional Processing Hub, Lodhika Rajkot",
          done: true,
          current: true,
        },
        {
          title: "Quality Tested & Nitrogen Sealed",
          time: "Within 4 hours",
          location: "Rajkot Central Facility",
          done: false,
          current: false,
        },
        {
          title: "Dispatched via Delhivery Air Express",
          time: "Scheduled Tomorrow",
          location: "Central Transit Gateway",
          done: false,
          current: false,
        },
        {
          title: "Out for Doorstep Delivery",
          time: checkoutData?.slot?.dateStr || deliveryDate,
          location: "Local Delivery Hub",
          done: false,
          current: false,
        },
        {
          title: "Delivered to Recipient",
          time: deliveryDate,
          location: "Customer Doorstep",
          done: false,
          current: false,
        },
      ],
    };

    // 1. Save latest order & customer orders in localStorage
    try {
      localStorage.setItem("janani_latest_order", JSON.stringify(confirmedOrder));

      const existingOrdersRaw = localStorage.getItem("janani_customer_orders");
      const existingOrders = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
      const updatedOrders = [newCustomerOrder, ...existingOrders.filter((o: any) => o.number !== effectiveOrderNumber && o.id !== newCustomerOrder.id)];
      localStorage.setItem("janani_customer_orders", JSON.stringify(updatedOrders));
    } catch (e) {
      console.error("Failed to save order to localStorage", e);
    }

    // 2. Persist order to MySQL backend database in real time
    try {
      await createOrder({
        id: effectiveOrderNumber,
        number: effectiveOrderNumber,
        orderNumber: effectiveOrderNumber,
        items: cartItems.map((i: any) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.qty || 1,
          image: i.product.image || pantryImage,
        })),
        customer: {
          name: customerName,
          firstName: customerName.split(" ")[0] || "Valued",
          lastName: customerName.split(" ").slice(1).join(" ") || "Patron",
          phone: customerPhone,
          email: customerEmail,
          address: streetAddr,
          streetAddress: streetAddr,
          city: checkoutData?.address?.city || city,
          state: checkoutData?.address?.state || "Gujarat",
          pincode: checkoutData?.address?.pincode || "380054",
        },
        subtotal: checkoutData?.subtotal || subtotal,
        discount: checkoutData?.discount || 0,
        couponCode: checkoutData?.coupon?.code || checkoutData?.couponCode || "",
        couponDiscount: checkoutData?.couponDiscount || (checkoutData?.coupon?.code ? checkoutData?.discount : 0) || 0,
        walletDeduction: checkoutData?.walletDeduction || 0,
        deliveryFee: checkoutData?.shippingFee || 0,
        shippingFee: checkoutData?.shippingFee || 0,
        finalTotal: effectiveAmount,
        total: effectiveAmount,
        paymentMethod: "Razorpay",
        paymentStatus: "Paid",
        transactionId: details.transactionId,
        razorpayOrderId: details.razorpayOrderId,
        deliverySlot: checkoutData?.slot?.dateStr || deliveryDate,
        expectedDelivery: deliveryDate,
        timeline: newCustomerOrder.timeline,
      });
    } catch (apiErr) {
      console.warn("Backend order creation sync note:", apiErr);
    }

    clearCart();
    if (checkoutData?.walletDeduction > 0) {
      deductWalletBalance(checkoutData.walletDeduction);
    }
    localStorage.removeItem("janani_pending_checkout");

    toast.success(`Payment verified via Razorpay! Order ${effectiveOrderNumber} placed successfully.`);
    navigate({ to: "/order-success" });
  };

  // Handle Payment Failure
  const handlePaymentFailure = (reason: string) => {
    setTransactionDetails((prev) => ({
      ...prev,
      failureReason: reason,
    }));
    setViewState("failure");
    toast.error("Razorpay payment failed or cancelled. Please try again.");
  };

  // 1-Click Retry Payment
  const handleRetryPayment = () => {
    setSimulateFailure(false);
    setViewState("payment");
    handleLaunchRazorpay();
  };

  // Launch Razorpay Standard Checkout Popup
  const handleLaunchRazorpay = async () => {
    if (simulateFailure) {
      handlePaymentFailure("Simulated Test Mode: Transaction declined by bank.");
      return;
    }

    setIsProcessing(true);
    const opened = await openRazorpayCheckout({
      amount: effectiveAmount,
      orderNumber: effectiveOrderNumber,
      customerName,
      customerEmail,
      customerPhone,
      onSuccess: (res) => {
        setIsProcessing(false);
        handlePaymentSuccess({
          method: "Razorpay Standard Checkout",
          transactionId: res.razorpay_payment_id || `pay_${Date.now()}`
        });
      },
      onFailure: (err) => {
        setIsProcessing(false);
        handlePaymentFailure(err.description || "Razorpay transaction failed.");
      },
      onDismiss: () => {
        setIsProcessing(false);
        toast.info("Payment window closed. Click below when ready to complete your order.");
      }
    });

    if (!opened) {
      // If popup blocked or offline, open styled Razorpay component modal
      setIsProcessing(false);
      setIsRazorpayModalOpen(true);
    }
  };

  if (viewState === "success") {
    return (
      <PaymentSuccessView
        orderNumber={effectiveOrderNumber}
        transactionId={transactionDetails.transactionId || `pay_rzp_${Date.now().toString().slice(-8)}`}
        paymentMethod={transactionDetails.method || "Razorpay Gateway"}
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
        reason={transactionDetails.failureReason || "Authorization timed out or transaction cancelled."}
        onRetryPayment={handleRetryPayment}
        onSwitchToCod={() => {
          handlePaymentSuccess({
            method: "Cash on Delivery",
            transactionId: `COD-${Date.now().toString().slice(-6)}`
          });
        }}
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
            <span className="text-brand-leaf">Razorpay Payment</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl text-foreground flex items-center gap-3">
            Secure Razorpay Payment
          </h1>
        </div>

        {/* Security / QA controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-brand-leaf/30 bg-brand-leaf/5 px-4 py-1.5 text-xs font-semibold text-brand-leaf">
            <ShieldCheck className="size-4" />
            <span>Razorpay 256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Razorpay Main Card + Right Summary Rail */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] items-start">
        {/* Left Column: Exclusive Razorpay Gateway Card */}
        <div className="space-y-6">
          <div className="rounded-[2rem] border-2 border-brand-leaf/40 bg-gradient-to-br from-card via-card to-brand-leaf/5 p-6 sm:p-8 shadow-luxe relative overflow-hidden">
            {/* Background glowing watermark */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 size-48 rounded-full bg-brand-leaf/10 blur-2xl pointer-events-none" />

            {/* Header Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="size-12 rounded-2xl bg-[#0c2340] text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                  <Layers className="size-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Razorpay Checkout Gateway
                    </h2>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30">
                      Official Partner
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    100% Secure Instant Settlement • Live UPI, Cards & NetBanking
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto bg-secondary/80 px-3 py-1.5 rounded-xl border border-border text-xs font-mono font-bold text-foreground">
                <Lock className="size-3.5 text-brand-leaf" />
                <span>Test Mode Key: {RAZORPAY_KEY_ID.slice(0, 12)}...</span>
              </div>
            </div>

            {/* Supported Payment Channels Pill Showcase */}
            <div className="mt-6 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                All Indian Payment Methods Accepted Inside Razorpay:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. UPI & QR */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border shadow-2xs hover:border-brand-leaf/40 transition">
                  <span className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 font-bold">
                    <Smartphone className="size-5" />
                  </span>
                  <div>
                    <strong className="text-xs font-bold text-foreground block">Instant UPI & QR Code</strong>
                    <span className="text-[11px] text-muted-foreground">Google Pay, PhonePe, Paytm, CRED, BHIM</span>
                  </div>
                </div>

                {/* 2. Credit & Debit Cards */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border shadow-2xs hover:border-brand-leaf/40 transition">
                  <span className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                    <CreditCard className="size-5" />
                  </span>
                  <div>
                    <strong className="text-xs font-bold text-foreground block">Credit / Debit Cards</strong>
                    <span className="text-[11px] text-muted-foreground">Visa, MasterCard, RuPay, Maestro</span>
                  </div>
                </div>

                {/* 3. NetBanking */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border shadow-2xs hover:border-brand-leaf/40 transition">
                  <span className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
                    <Building className="size-5" />
                  </span>
                  <div>
                    <strong className="text-xs font-bold text-foreground block">NetBanking (50+ Banks)</strong>
                    <span className="text-[11px] text-muted-foreground">HDFC, SBI, ICICI, Axis, Kotak & more</span>
                  </div>
                </div>

                {/* 4. Digital Wallets */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border shadow-2xs hover:border-brand-leaf/40 transition">
                  <span className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                    <Wallet className="size-5" />
                  </span>
                  <div>
                    <strong className="text-xs font-bold text-foreground block">Wallets & PayLater</strong>
                    <span className="text-[11px] text-muted-foreground">Amazon Pay, Mobikwik, Freecharge</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Billing Snapshot */}
            <div className="mt-6 rounded-2xl bg-secondary/60 p-4 border border-border text-xs space-y-2">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Paying Customer:</span>
                <strong className="text-foreground">{customerName} ({customerPhone})</strong>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Receipt Email:</span>
                <span className="text-foreground font-mono">{customerEmail}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Scheduled Delivery:</span>
                <span className="text-brand-leaf font-semibold">{deliveryDate}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <Button
                type="button"
                onClick={handleLaunchRazorpay}
                disabled={isProcessing}
                className="w-full h-14 rounded-2xl bg-[#0c2340] hover:bg-[#153a66] text-white font-display text-base font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Lock className="size-5 text-emerald-400 animate-pulse" />
                    <span>Pay ₹{effectiveAmount} with Razorpay Secure</span>
                    <ArrowRight className="size-5" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-2 pt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-brand-leaf" />
                  Zero convenience fees • Instant refund guarantee
                </span>
                <button
                  type="button"
                  onClick={() => setIsRazorpayModalOpen(true)}
                  className="text-brand-leaf font-semibold hover:underline"
                >
                  Alternate Gateway View
                </button>
              </div>
            </div>
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
              All transactions are encrypted with 256-bit TLS bank-grade certificates via Razorpay. Janani Agro does not store raw card numbers or payment passwords.
            </p>
          </div>
        </div>
      </div>

      {/* Razorpay Interactive Popover Modal (Fallback) */}
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
