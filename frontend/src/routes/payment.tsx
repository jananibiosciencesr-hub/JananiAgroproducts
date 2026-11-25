import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { generateNextOrderNumber, getAuthoritativeNextOrderNumber } from "@/lib/api";
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
import { openRazorpayCheckout, loadRazorpayScript, createRazorpayOrder } from "@/lib/razorpay";
import { PaymentSuccessView, PaymentFailureView } from "@/components/payment/payment-status-views";
import { saveCustomerOrders, loadCustomerOrders } from "@/components/orders/orders-seed";

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
  const { cart, subtotal, user, clearCart } = useStore();

  // Redirect to checkout if not logged in
  useEffect(() => {
    if (!user) {
      toast.error("Please Sign In or Register in Checkout to proceed with payment.");
      navigate({ to: "/checkout" });
    }
  }, [user, navigate]);

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

  // Detect Cash on Delivery
  const isCod = checkoutData?.paymentMethod === "cod";

  // UI States
  const [viewState, setViewState] = useState<"payment" | "success" | "failure">("payment");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyingText, setVerifyingText] = useState("Connecting to Razorpay Secure Gateway...");
  const [paymentIssue, setPaymentIssue] = useState<{ paymentId: string; message: string } | null>(null);
  const [onlinePaymentUnavailable, setOnlinePaymentUnavailable] = useState(false);

  // Success / Failure details
  const [transactionDetails, setTransactionDetails] = useState<{
    orderNumber: string;
    transactionId: string;
    method: string;
    amount: number;
    failureReason?: string;
  }>({
    orderNumber: checkoutData?.orderNumber || generateNextOrderNumber(),
    transactionId: "",
    method: checkoutData?.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay Standard Gateway",
    amount: checkoutData?.finalTotal || (subtotal > 0 ? subtotal : 420),
  });

  // Query live database for next authoritative order number if not supplied in pending checkout
  useEffect(() => {
    if (!checkoutData?.orderNumber) {
      getAuthoritativeNextOrderNumber().then((liveNum) => {
        if (liveNum) {
          setTransactionDetails((prev) => ({ ...prev, orderNumber: liveNum }));
        }
      });
    }
  }, [checkoutData?.orderNumber]);

  // Effective Order Values
  const effectiveAmount = checkoutData?.finalTotal ?? (checkoutData?.total ?? (subtotal > 0 ? subtotal : 0));
  const effectiveOrderNumber = checkoutData?.orderNumber || transactionDetails.orderNumber;
  const customerName = (
    checkoutData?.customerName ||
    checkoutData?.address?.fullName ||
    checkoutData?.address?.name ||
    user?.name ||
    "Valued Customer"
  ).trim();
  const customerPhone = (
    checkoutData?.customerPhone ||
    checkoutData?.address?.phone ||
    user?.phone ||
    ""
  ).trim();

  const resolvedCustomerEmail = useMemo(() => {
    const candidates = [
      user?.email,
      checkoutData?.customerEmail,
      checkoutData?.address?.email,
    ];
    for (const c of candidates) {
      if (c && typeof c === "string" && c.includes("@") && !c.endsWith("@jananiagro.com") && !c.endsWith("@janani.customer")) {
        return c.trim().toLowerCase();
      }
    }
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("janani_user") || "{}");
        if (u?.email && u.email.includes("@") && !u.email.endsWith("@jananiagro.com")) {
          return u.email.trim().toLowerCase();
        }
        const au = JSON.parse(localStorage.getItem("janani_auth_user") || "{}");
        if (au?.email && au.email.includes("@") && !au.email.endsWith("@jananiagro.com")) {
          return au.email.trim().toLowerCase();
        }
      } catch (e) { }
    }
    return "";
  }, [user?.email, checkoutData]);

  // Query SQL directly for the user's phone associated with this specific email
  const [sqlPhone, setSqlPhone] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(`janani_sql_phone_${resolvedCustomerEmail}`);
        if (cached && cached.trim()) {
          return cached.trim();
        }
      } catch (e) { }
    }
    return "";
  });

  useEffect(() => {
    const targetEmail = resolvedCustomerEmail || user?.email;
    if (!targetEmail || targetEmail.endsWith("@jananiagro.com")) return;

    fetch(`/api.php?action=get-user-phone&email=${encodeURIComponent(targetEmail)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.phone !== undefined && data?.phone !== null) {
          const p = String(data.phone).trim();
          setSqlPhone(p);
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(`janani_sql_phone_${targetEmail}`, p);
              const u = JSON.parse(localStorage.getItem("janani_user") || "{}");
              if (u) {
                u.phone = p;
                localStorage.setItem("janani_user", JSON.stringify(u));
              }
              const au = JSON.parse(localStorage.getItem("janani_auth_user") || "{}");
              if (au) {
                au.phone = p;
                localStorage.setItem("janani_auth_user", JSON.stringify(au));
              }
            } catch (e) { }
          }
        }
      })
      .catch(() => { });
  }, [resolvedCustomerEmail, user?.email]);

  const resolvedCustomerPhone = useMemo(() => {
    const candidates = [
      checkoutData?.address?.phone,
      checkoutData?.customerPhone,
      sqlPhone,
      user?.phone,
      customerPhone,
    ];
    for (const p of candidates) {
      if (p && typeof p === "string" && p.trim()) {
        return p.trim();
      }
    }
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("janani_user") || "{}");
        if (u?.phone && typeof u.phone === "string" && u.phone.trim()) {
          return u.phone.trim();
        }
      } catch (e) { }
    }
    return "";
  }, [checkoutData, sqlPhone, user?.phone, customerPhone]);
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

  // Auth Guard View
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="size-20 mx-auto rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold">
          <Lock className="size-10" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-foreground">
          Sign In Required for Payment
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You must be signed in with your OTP to securely complete the transaction and link your order.
        </p>
        <Button asChild variant="gold" size="lg" className="mt-6 rounded-full px-8 font-bold">
          <Link to="/checkout">Return to Checkout & Sign In</Link>
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Order placement. The server prices the cart, verifies the payment and assigns the
  // order number; this page only shows a confirmation after the server confirms.
  // ---------------------------------------------------------------------------
  const streetAddr = checkoutData?.address
    ? [checkoutData.address.houseFlat, checkoutData.address.street, checkoutData.address.landmark].filter(Boolean).join(", ") || checkoutData.address.streetAddress || ""
    : "";

  const orderItemsPayload = cartItems.map((i: any) => ({
    productId: i.product?.id ?? i.productId ?? i.id,
    slug: i.product?.slug ?? i.slug,
    cartKey: i.cartKey,
    variantKey: i.variant?.id,
    variantId: i.variantId,
    name: i.product?.name || i.name,
    price: i.price ?? i.product?.price ?? 0,
    quantity: i.qty || i.quantity || 1,
    image: i.variant?.image || i.product?.image,
  }));

  const deliveryAddress = {
    fullName: customerName,
    name: customerName,
    phone: resolvedCustomerPhone,
    email: resolvedCustomerEmail,
    houseFlat: checkoutData?.address?.houseFlat || "",
    street: streetAddr,
    streetAddress: streetAddr,
    landmark: checkoutData?.address?.landmark || "",
    city: checkoutData?.address?.city || "",
    state: checkoutData?.address?.state || "",
    pincode: checkoutData?.address?.pincode || "",
  };

  const appliedCouponCode = checkoutData?.couponDiscount > 0 ? (checkoutData?.coupon?.code || checkoutData?.couponCode || "") : "";

  const buildOrderRequest = (extra: Partial<Parameters<typeof createOrder>[0]>) => ({
    items: orderItemsPayload,
    customer: {
      name: customerName,
      phone: resolvedCustomerPhone,
      email: resolvedCustomerEmail,
      streetAddress: streetAddr,
      landmark: deliveryAddress.landmark,
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      pincode: deliveryAddress.pincode,
    },
    couponCode: appliedCouponCode,
    finalTotal: effectiveAmount,
    deliverySlot: checkoutData?.slot?.dateStr || deliveryDate,
    orderNotes: checkoutData?.orderNotes || "",
    useWalletCredit: !!checkoutData?.useWalletCredit,
    ...extra,
  });

  const handleOrderRejection = (err: any) => {
    const message = err?.message || "Your order could not be placed. Please try again.";
    toast.error(message, { duration: 8000 });
    if (err?.priceChanged || err?.couponInvalid || err?.outOfStock) {
      // Cart is out of date (price / coupon / stock changed): send the customer back to review it.
      localStorage.removeItem("janani_pending_checkout");
      navigate({ to: "/cart" });
    } else if (err?.walletInvalid) {
      // Wallet credit expired / already used: review the total again on checkout
      localStorage.removeItem("janani_pending_checkout");
      navigate({ to: "/checkout" });
    }
  };

  /** Shows the confirmation for an order the server has recorded. */
  const finishOrder = (created: any, methodLabel: string) => {
    const number = created?.number || created?.orderNumber || "";
    const items = Array.isArray(created?.items) ? created.items : [];
    const confirmedOrder = {
      orderNumber: number,
      transactionId: created?.transaction_id || created?.transactionId || "",
      paymentMethod: methodLabel,
      paymentStatus: created?.payment_status || created?.paymentStatus,
      amount: Number(created?.total ?? effectiveAmount),
      deliveryDate,
      customerName,
      customerPhone: resolvedCustomerPhone,
      customerEmail: resolvedCustomerEmail,
      customerAddress: [streetAddr, deliveryAddress.city, deliveryAddress.state].filter(Boolean).join(", ") + (deliveryAddress.pincode ? ` - ${deliveryAddress.pincode}` : ""),
      items: items.map((it: any) => ({
        product: { id: it.productId, name: `${it.name}${it.unit ? ` (${it.unit})` : ""}`, price: Number(it.price) || 0, image: it.image || pantryImage },
        qty: it.quantity || 1,
      })),
      subtotal: Number(created?.subtotal ?? 0),
      gstAmount: Number(created?.gst_amount ?? created?.gstAmount ?? 0),
      discount: Number(created?.coupon_discount ?? created?.couponDiscount ?? 0),
      couponCode: created?.coupon_code || created?.couponCode || "",
      couponDiscount: Number(created?.coupon_discount ?? created?.couponDiscount ?? 0),
      walletDeduction: Number(created?.wallet_deduction ?? created?.walletDeduction ?? 0),
      walletReward: created?.walletReward || null,
      deliveryFee: Number(created?.delivery_fee ?? created?.deliveryFee ?? 0),
      finalTotal: Number(created?.total ?? effectiveAmount),
      total: Number(created?.total ?? effectiveAmount),
      slot: checkoutData?.slot || { dateStr: deliveryDate },
      deliverySlot: checkoutData?.slot?.dateStr || deliveryDate,
      address: deliveryAddress,
      timeline: created?.timeline,
    };
    try {
      localStorage.setItem("janani_latest_order", JSON.stringify(confirmedOrder));
      const userIdentifier = resolvedCustomerEmail || user?.email || resolvedCustomerPhone;
      const existingUserOrders = loadCustomerOrders(userIdentifier);
      saveCustomerOrders(
        [
          {
            ...created,
            id: created?.id || number,
            number,
            orderNumber: number,
            status: created?.order_status || created?.status || "Processing",
            date: created?.order_date || new Date().toLocaleDateString("en-GB"),
            isoDate: new Date().toISOString().split("T")[0]!,
            address: deliveryAddress,
            items: items.map((it: any) => ({ ...it, qty: it.quantity })),
          },
          ...existingUserOrders.filter((o: any) => o.number !== number),
        ],
        userIdentifier
      );
      localStorage.removeItem("janani_customer_orders");
    } catch (e) {
      console.error("Failed to cache confirmed order", e);
    }

    clearCart();
    localStorage.removeItem("janani_pending_checkout");
    setTransactionDetails((prev) => ({ ...prev, orderNumber: number, transactionId: confirmedOrder.transactionId, method: methodLabel, amount: confirmedOrder.total }));
    setVerifyingText(`Order ${number} confirmed! Redirecting...`);
    toast.success(`Order ${number} placed successfully!`);
    if (created?.walletReward?.amount) {
      toast.success(`🎁 ₹${created.walletReward.amount} wallet credit added for your next order (valid till ${created.walletReward.expiresOn}).`, { duration: 9000 });
    }
    try {
      navigate({ to: "/order-success" });
    } catch (navErr) {
      console.warn("Router navigate failed:", navErr);
    }
    if (typeof window !== "undefined") {
      setTimeout(() => {
        if (window.location.pathname !== "/order-success") window.location.href = "/order-success";
      }, 300);
    }
  };

  // Cash on Delivery
  const placeCodOrder = async () => {
    if (isProcessing && !isVerifying) return;
    setPaymentIssue(null);
    setIsProcessing(true);
    setIsVerifying(true);
    setVerifyingText("Confirming your Cash on Delivery order...");
    try {
      const created = await createOrder(buildOrderRequest({ paymentMethod: "Cash on Delivery" }));
      finishOrder(created, "Cash on Delivery");
    } catch (err: any) {
      setIsVerifying(false);
      setIsProcessing(false);
      handleOrderRejection(err);
    }
  };

  // Records a paid online order. Safe to retry: the server creates the order only once per payment.
  const confirmOnlineOrder = async (resp: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
    setIsProcessing(true);
    setIsVerifying(true);
    setVerifyingText("Payment received. Verifying it and confirming your order...");
    const request = buildOrderRequest({
      paymentMethod: "Razorpay (Online)",
      transactionId: resp.razorpay_payment_id,
      razorpayOrderId: resp.razorpay_order_id,
      razorpaySignature: resp.razorpay_signature,
    });
    let lastError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const created = await createOrder(request);
        finishOrder(created, "Razorpay (Online)");
        return;
      } catch (err: any) {
        lastError = err;
        if (!err?.networkError) break;
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
    // The payment succeeded but this browser could not get the confirmation. The Razorpay webhook
    // records the order on the server, so the cart is cleared to avoid paying twice.
    clearCart();
    localStorage.removeItem("janani_pending_checkout");
    setIsVerifying(false);
    setIsProcessing(false);
    setPaymentIssue({
      paymentId: resp.razorpay_payment_id,
      message: lastError?.message || "We could not confirm your order yet.",
    });
  };

  // Handle Payment Failure (no money captured)
  const handlePaymentFailure = (reason: string) => {
    setIsProcessing(false);
    setIsVerifying(false);
    setTransactionDetails((prev) => ({
      ...prev,
      failureReason: reason,
    }));
    setViewState("failure");
  };

  const handleRetryPayment = () => {
    setViewState("payment");
    handleLaunchRazorpay();
  };

  // Razorpay Standard Checkout: the server creates the Razorpay order with its own amount
  const handleLaunchRazorpay = async () => {
    if (isProcessing) return;
    setPaymentIssue(null);
    setIsProcessing(true);
    setVerifyingText("Connecting to Razorpay Secure Gateway...");

    let activePhone = sqlPhone || resolvedCustomerPhone;
    try {
      const res = await fetch(`/api.php?action=get-user-phone`);
      const d = await res.json().catch(() => null);
      if (d?.phone) activePhone = String(d.phone).trim() || activePhone;
    } catch (e) { }

    const rzOrder = await createRazorpayOrder({
      items: orderItemsPayload,
      couponCode: appliedCouponCode,
      address: deliveryAddress,
      expectedTotal: effectiveAmount,
      deliverySlot: checkoutData?.slot?.dateStr || deliveryDate,
      orderNotes: checkoutData?.orderNotes || "",
      useWalletCredit: !!checkoutData?.useWalletCredit,
    });
    if (!rzOrder.success) {
      setIsProcessing(false);
      if (rzOrder.onlinePaymentUnavailable) setOnlinePaymentUnavailable(true);
      handleOrderRejection(rzOrder);
      return;
    }

    const opened = await openRazorpayCheckout({
      order: rzOrder,
      orderLabel: "Janani Agro Products order",
      customerName,
      customerEmail: resolvedCustomerEmail,
      customerPhone: activePhone,
      onSuccess: (res) => {
        confirmOnlineOrder(res);
      },
      onFailure: (err) => {
        handlePaymentFailure(err.description || "Razorpay transaction failed.");
      },
      onDismiss: () => {
        setIsProcessing(false);
        setIsVerifying(false);
        toast.info("Payment window closed. No money was charged. Click Pay when you're ready.");
      },
    });

    if (!opened.opened) {
      setIsProcessing(false);
      handlePaymentFailure(opened.reason);
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
          setViewState("payment");
          placeCodOrder();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 py-4 sm:py-8 pb-32 lg:pb-12 w-full overflow-x-hidden">
      {/* Header & Trust Badge */}
      <div className="border-b border-border pb-5 sm:pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-muted-foreground">
            <Link to="/" className="hover:text-brand-leaf transition">Home</Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-brand-leaf transition">Cart</Link>
            <span>/</span>
            <Link to="/checkout" className="hover:text-brand-leaf transition">Checkout</Link>
            <span>/</span>
            <span className="text-brand-leaf">{isCod ? "Cash on Delivery" : "Razorpay Payment"}</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            {isCod ? "Cash on Delivery Confirmation" : "Secure Razorpay Payment"}
          </h1>
        </div>

        {/* Security / QA controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-brand-leaf/30 bg-brand-leaf/5 px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold text-brand-leaf w-fit">
            <ShieldCheck className="size-4 shrink-0" />
            <span>{isCod ? "Pay on Delivery • 100% Genuine Agro Care" : "Razorpay 256-Bit SSL Encrypted"}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Razorpay Main Card + Right Summary Rail */}
      <div className="mt-6 sm:mt-8 grid gap-6 sm:gap-8 lg:grid-cols-[1fr_400px] items-start">
        {/* Left Column: Exclusive Razorpay Gateway Card */}
        <div className="space-y-6">
          <div className="rounded-[1.75rem] sm:rounded-[2rem] border-2 border-brand-leaf/40 bg-gradient-to-br from-card via-card to-brand-leaf/5 p-4 sm:p-8 shadow-luxe relative overflow-hidden">
            {/* Background glowing watermark */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 size-48 rounded-full bg-brand-leaf/10 blur-2xl pointer-events-none" />

            {/* Header Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4 sm:pb-5">
              <div className="flex items-start sm:items-center gap-3">
                <div className="size-11 sm:size-12 rounded-2xl bg-[#0c2340] text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0 mt-0.5 sm:mt-0">
                  {isCod ? <Wallet className="size-5 sm:size-6 text-amber-400" /> : <Layers className="size-5 sm:size-6 text-emerald-400" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
                      {isCod ? "Cash on Delivery (COD)" : "Razorpay Checkout Gateway"}
                    </h2>
                    {isCod && (
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30 shrink-0">
                        Pay at Doorstep
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isCod
                      ? "Zero advance payment required • Pay cash or UPI upon delivery"
                      : "100% Secure Instant Settlement • Live UPI, Cards & NetBanking"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto bg-secondary/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-border text-[11px] sm:text-xs font-mono font-bold text-foreground max-w-full truncate">
                <Lock className="size-3.5 text-brand-leaf shrink-0" />
                <span className="truncate">{isCod ? "Payment Mode: Cash on Delivery" : "Secured by Razorpay"}</span>
              </div>
            </div>

            {/* Customer Billing Snapshot */}
            <div className="mt-5 sm:mt-6 rounded-2xl bg-secondary/60 p-3.5 sm:p-4 border border-border text-xs space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-muted-foreground">
                <span className="shrink-0 font-medium">Paying Customer:</span>
                <strong className="text-foreground font-semibold break-words sm:text-right">
                  {customerName} {resolvedCustomerPhone ? `(${resolvedCustomerPhone})` : ""}
                </strong>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-muted-foreground">
                <span className="shrink-0 font-medium">Payment Mode:</span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold uppercase sm:text-right">
                  {isCod ? "Cash on Delivery (Pay upon arrival)" : "Online Pre-paid Gateway"}
                </strong>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-muted-foreground">
                <span className="shrink-0 font-medium">Receipt Email:</span>
                <span className="text-foreground font-mono break-all sm:text-right">
                  {resolvedCustomerEmail}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-muted-foreground">
                <span className="shrink-0 font-medium">Scheduled Delivery:</span>
                <span className="text-brand-leaf font-semibold sm:text-right">
                  {deliveryDate}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 sm:mt-8 space-y-3">
              <Button
                type="button"
                onClick={() => {
                  if (isCod) {
                    placeCodOrder();
                  } else {
                    handleLaunchRazorpay();
                  }
                }}
                disabled={isProcessing || isVerifying}
                className="w-full min-h-[3.25rem] sm:h-14 py-3 px-4 rounded-2xl bg-[#0c2340] hover:bg-[#153a66] text-white font-display text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 sm:gap-3 cursor-pointer text-center disabled:opacity-75"
              >
                {isProcessing || isVerifying ? (
                  <>
                    <div className="size-4 sm:size-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span className="truncate">{verifyingText || (isCod ? "Confirming Cash on Delivery Order..." : "Processing Razorpay Payment...")}</span>
                  </>
                ) : (
                  <>
                    {isCod ? (
                      <Wallet className="size-4 sm:size-5 text-amber-400 shrink-0" />
                    ) : (
                      <Lock className="size-4 sm:size-5 text-emerald-400 animate-pulse shrink-0" />
                    )}
                    <span className="break-words">
                      {isCod ? `Confirm Cash on Delivery Order • Pay ₹${effectiveAmount}` : `Pay ₹${effectiveAmount} with Razorpay Secure`}
                    </span>
                    <ArrowRight className="size-4 sm:size-5 shrink-0 hidden xs:inline-block" />
                  </>
                )}
              </Button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground px-1 pt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-brand-leaf shrink-0" />
                  <span>{isCod ? "Zero advance fees • Inspect order packaging upon arrival" : "Zero convenience fees • Instant refund guarantee"}</span>
                </span>
              </div>

              {!isCod && onlinePaymentUnavailable && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 space-y-2">
                  <p className="font-semibold">Online payment is temporarily unavailable.</p>
                  <p>You can still place this order with Cash on Delivery and pay when it arrives.</p>
                  <Button type="button" variant="outline" size="sm" onClick={placeCodOrder} disabled={isProcessing || isVerifying}>
                    Place order with Cash on Delivery
                  </Button>
                </div>
              )}

              {paymentIssue && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-950 space-y-2">
                  <p className="font-bold text-sm">Payment received — we are confirming your order</p>
                  <p>
                    Your payment <span className="font-mono font-semibold">{paymentIssue.paymentId}</span> was successful. Your order is being recorded
                    automatically and the confirmation email will reach {resolvedCustomerEmail || "your inbox"} shortly. Please do not pay again.
                  </p>
                  <p>If it does not appear in <Link to="/orders" className="underline font-semibold">My Orders</Link> within 15 minutes, contact support with the payment ID above.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Security Info */}
        <div className="space-y-5 lg:sticky lg:top-24">
          {/* Order Snapshot Card */}
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3 gap-2">
              <span className="font-display text-sm font-bold text-foreground flex items-center gap-2 shrink-0">
                <Package className="size-4 text-brand-leaf" />
                Order Summary
              </span>
              <span className="font-mono text-xs font-bold text-muted-foreground truncate max-w-[150px] sm:max-w-none text-right">
                {effectiveOrderNumber}
              </span>
            </div>

            {/* Recipient Snippet */}
            <div className="text-xs text-muted-foreground space-y-1.5 bg-secondary/50 p-3 sm:p-3.5 rounded-2xl border border-border/80">
              <div className="flex justify-between font-semibold text-foreground gap-2">
                <span className="shrink-0">Deliver To:</span>
                <span className="text-brand-leaf truncate text-right">{customerName}</span>
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
                <span>Applicable GST Tax</span>
                <span className="font-semibold text-foreground">
                  +₹{checkoutData?.gstAmount ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-semibold text-brand-leaf">
                  {checkoutData?.shippingFee === 0 || (checkoutData?.subtotal || subtotal) >= 799 ? "FREE" : "₹60"}
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
                  <span>Wallet Credit</span>
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

      {/* Full-Screen Payment Processing & Order Verification Overlay */}
      {isVerifying && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 text-center animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/40 bg-card p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-foreground">
            {/* Animated Brand Dual-Ring Spinner */}
            <div className="relative size-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping opacity-75" />
              <div className="size-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-600 animate-spin" />
              <ShieldCheck className="absolute size-9 text-emerald-600 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">
                <Sparkles className="size-3" />
                <span>Razorpay Secure Settlement</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Finalizing Your Order
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                {verifyingText || "Verifying payment with bank and confirming your harvest shipment..."}
              </p>
            </div>

            {/* Order & Amount Snapshot Badge */}
            <div className="rounded-2xl bg-muted/60 p-3.5 border border-border/80 flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Order Reference: <strong className="text-foreground">{effectiveOrderNumber}</strong></span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">₹{effectiveAmount}</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground/80">
              <Lock className="size-3 text-emerald-600 shrink-0" />
              <span>Please do not close or refresh this tab. Redirecting automatically...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
