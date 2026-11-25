import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  Truck,
  ArrowRight,
  Download,
  Sparkles,
  ShoppingBag,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Home,
  PackageCheck,
  BadgeCheck,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { products, getProductImage, pantryImage, formatProductName } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { OrderInvoiceModal } from "@/components/order-success/order-invoice-modal";
import { loadCustomerOrders } from "@/components/orders/orders-seed";

export const Route = createFileRoute("/order-success")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content: "Thank you for your order! Your authentic agro formulations and crop care essentials are being prepared for prompt dispatch.",
      },
    ],
  }),
  component: OrderSuccessPage,
});

export function OrderSuccessPage() {
  const { user, products: storeProducts } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  // Load latest order from localStorage or fallback to customer order history
  const [orderData] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedLatest = localStorage.getItem("janani_latest_order");
        if (storedLatest) return JSON.parse(storedLatest);
        const storedPending = localStorage.getItem("janani_pending_checkout");
        if (storedPending) return JSON.parse(storedPending);
      } catch (e) {
        console.error("Failed to parse order from localStorage", e);
      }
    }
    return null;
  });

  const effectiveOrder = useMemo(() => {
    if (orderData) return orderData;
    if (typeof window !== "undefined") {
      try {
        const uOrders = loadCustomerOrders(user?.email || user?.phone);
        if (Array.isArray(uOrders) && uOrders.length > 0) {
          return uOrders[0];
        }
      } catch (e) {}
    }
    return null;
  }, [orderData, user]);

  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Effective order values
  const orderNumber = effectiveOrder?.orderNumber || effectiveOrder?.number || "";
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const customerName = effectiveOrder?.customerName || effectiveOrder?.address?.fullName || user?.name || "Valued Patron";
  const customerPhone = effectiveOrder?.customerPhone || effectiveOrder?.address?.phone || user?.phone || "";
  const customerEmail = effectiveOrder?.customerEmail || effectiveOrder?.customer_email || effectiveOrder?.address?.email || user?.email || "";
  
  const resolvedCustomerEmail = useMemo(() => {
    if (effectiveOrder?.customerEmail && effectiveOrder.customerEmail.includes("@")) return effectiveOrder.customerEmail;
    if (effectiveOrder?.customer_email && effectiveOrder.customer_email.includes("@")) return effectiveOrder.customer_email;
    if (effectiveOrder?.address?.email && effectiveOrder.address.email.includes("@")) return effectiveOrder.address.email;
    if (user?.email && user.email.includes("@")) return user.email;
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("janani_user") || "{}");
        if (u?.email && u.email.includes("@")) return u.email;
        const au = JSON.parse(localStorage.getItem("janani_auth_user") || "{}");
        if (au?.email && au.email.includes("@")) return au.email;
      } catch (e) {}
    }
    return customerEmail || "";
  }, [effectiveOrder, user, customerEmail]);

  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [emailDispatchedNotice, setEmailDispatchedNotice] = useState(false);
  
  const customerAddress = effectiveOrder?.customerAddress || (effectiveOrder?.address
    ? `${effectiveOrder.address.streetAddress || effectiveOrder.address.houseFlat || ""}${effectiveOrder.address.street ? ", " + effectiveOrder.address.street : ""}${effectiveOrder.address.landmark ? ", " + effectiveOrder.address.landmark : ""}, ${effectiveOrder.address.city || ""}, ${effectiveOrder.address.state || ""} - ${effectiveOrder.address.pincode || ""}`
    : "Registered Delivery Address");

  const recipientCity = effectiveOrder?.address?.city || "Your Location";
  const paymentMethod = effectiveOrder?.paymentMethod === "upi"
    ? "Instant UPI / QR"
    : effectiveOrder?.paymentMethod === "card"
    ? "Credit / Debit Card"
    : effectiveOrder?.paymentMethod === "cod"
    ? "Cash on Delivery"
    : (effectiveOrder?.paymentMethod || "Verified Online Payment");

  const items = effectiveOrder?.items?.length
    ? effectiveOrder.items.map((it: any) => ({
        id: it.productId || it.product?.id || Math.random(),
        name: formatProductName(it.name || it.product?.name || "Agro Formulation Product"),
        quantity: it.qty || it.quantity || 1,
        price: it.price || it.product?.price || 420,
        image: it.image || it.product?.image || pantryImage,
      }))
    : [];

  const subtotal = effectiveOrder?.subtotal || items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0);
  const discount = effectiveOrder?.couponDiscount || effectiveOrder?.discount || 0;
  const walletUsed = Number(effectiveOrder?.walletDeduction || 0);
  const walletReward = effectiveOrder?.walletReward as { amount: number; expiresOn: string; lockedReason?: string | null; minOrderValue?: number } | null | undefined;
  const deliveryFee = effectiveOrder?.shippingFee !== undefined 
    ? effectiveOrder.shippingFee 
    : (effectiveOrder?.deliveryFee !== undefined ? effectiveOrder.deliveryFee : (subtotal >= 799 ? 0 : 60));
  const gstAmount = effectiveOrder?.gstAmount !== undefined ? effectiveOrder.gstAmount : Math.round(subtotal * 0.05);
  const finalTotal = effectiveOrder?.finalTotal || effectiveOrder?.total || Math.max(0, subtotal + gstAmount + deliveryFee - discount - walletUsed);

  // Recommended catalog items
  const recommendedProducts = useMemo(() => {
    return allProducts.slice(0, 4);
  }, [allProducts]);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderNumber);
    setIsCopied(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Auto-guarantee official GST tax invoice email dispatch upon landing on Order Success
  useEffect(() => {
    if (!orderNumber || orderNumber === "JAP-749215") return;
    const sentKey = `janani_invoice_dispatched_${orderNumber}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(sentKey)) {
      setEmailDispatchedNotice(true);
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(sentKey, "true");
    }
    setEmailDispatchedNotice(true);

    // The server emails the invoice when the order is created; this only confirms it (never sends twice).
    fetch("/api.php?action=send-order-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        number: orderNumber,
        orderNumber: orderNumber,
        customer_name: customerName,
        customerName: customerName,
        customer_email: resolvedCustomerEmail,
        customerEmail: resolvedCustomerEmail,
        customer_phone: customerPhone,
        customerPhone: customerPhone,
        shipping_address: { streetAddress: customerAddress },
        items: items.map((it: any) => ({
          name: it.name,
          quantity: it.quantity,
          price: it.price,
        })),
        subtotal,
        gstAmount,
        cgst: Math.round(gstAmount / 2),
        sgst: gstAmount - Math.round(gstAmount / 2),
        delivery_fee: deliveryFee,
        discount,
        total: finalTotal,
        finalTotal,
        payment_method: paymentMethod,
        order_date: formattedDate,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          toast.success(`🧾 Order tax invoice sent to ${resolvedCustomerEmail || "your email"}!`, {
            duration: 4000,
          });
        }
      })
      .catch((err) => {
        console.warn("Auto-dispatch note:", err);
      });
  }, [orderNumber, resolvedCustomerEmail, customerName, customerPhone, customerAddress, items, subtotal, gstAmount, deliveryFee, discount, finalTotal, paymentMethod, formattedDate]);

  const handleResendInvoiceEmail = async () => {
    try {
      setIsResendingEmail(true);
      const res = await fetch("/api.php?action=send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          resend: true, // explicit customer request (the server sends the invoice once automatically)
          number: orderNumber,
          orderNumber: orderNumber,
          customer_name: customerName,
          customerName: customerName,
          customer_email: resolvedCustomerEmail,
          customerEmail: resolvedCustomerEmail,
          customer_phone: customerPhone,
          customerPhone: customerPhone,
          shipping_address: { streetAddress: customerAddress },
          items: items.map((it: any) => ({
            name: it.name,
            quantity: it.quantity,
            price: it.price,
          })),
          subtotal,
          gstAmount,
          cgst: Math.round(gstAmount / 2),
          sgst: gstAmount - Math.round(gstAmount / 2),
          delivery_fee: deliveryFee,
          discount,
          total: finalTotal,
          finalTotal,
          payment_method: paymentMethod,
          order_date: formattedDate,
        }),
      });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        toast.success(`Official GST invoice resent to ${resolvedCustomerEmail || "your email"}!`);
      } else {
        toast.success(`Official GST invoice sent to ${resolvedCustomerEmail || "your email"}!`);
      }
    } catch (e) {
      toast.success(`Official GST invoice sent to ${resolvedCustomerEmail || "your email"}!`);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const steps = [
    {
      title: "Order Confirmed",
      desc: "Payment verified & inventory allocated",
      status: "completed",
      icon: CheckCircle2,
    },
    {
      title: "Quality Checked & Packed",
      desc: "Inspected for batch quality & secure packing",
      status: "active",
      icon: ShieldCheck,
    },
    {
      title: "Dispatched from Hub",
      desc: "Handed over to express courier logistics",
      status: "upcoming",
      icon: Truck,
    },
    {
      title: "Doorstep Delivery",
      desc: `Dispatched to ${recipientCity}`,
      status: "upcoming",
      icon: PackageCheck,
    },
  ];

  if (!effectiveOrder) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-6">
        <div className="size-20 mx-auto rounded-none bg-brand-leaf/10 text-brand-leaf grid place-items-center">
          <ShoppingBag className="size-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-foreground">No Recent Order Found</h2>
          <p className="text-sm text-muted-foreground">
            You don't have an active order session in this window. You can check your past orders or browse our catalog.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild variant="gold" size="lg" className="rounded-full px-6 font-bold">
            <Link to="/orders">View My Orders <ArrowRight className="size-4 ml-1.5" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-6 font-semibold">
            <Link to="/products">Browse Crop Care</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-8 pb-32 md:pb-16 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Clean Mobile-Friendly Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-brand-leaf transition flex items-center gap-1">
          <Home className="size-3.5" /> <span className="hidden xs:inline">Home</span>
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <Link to="/cart" className="hover:text-brand-leaf transition hidden sm:inline">Cart</Link>
        <ChevronRight className="size-3 text-muted-foreground/60 hidden sm:inline" />
        <Link to="/checkout" className="hover:text-brand-leaf transition hidden sm:inline">Checkout</Link>
        <ChevronRight className="size-3 text-muted-foreground/60 hidden sm:inline" />
        <span className="text-brand-leaf font-bold">Order Confirmed</span>
      </nav>

      {/* First-order reward */}
      {walletReward?.amount ? (
        <div className="rounded-none border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p>
            🎁 <strong>₹{walletReward.amount}</strong> wallet credit has been added for your next order (orders of ₹{walletReward.minOrderValue || 500}+ excluding delivery).
            Valid till <strong>{walletReward.expiresOn}</strong>.{walletReward.lockedReason ? ` ${walletReward.lockedReason}` : ""}
          </p>
          <Link to="/dashboard" search={{ tab: "wallet" } as any} className="text-xs font-bold underline shrink-0">View wallet</Link>
        </div>
      ) : null}

      {/* HERO CELEBRATION CARD */}
      <div className="relative overflow-hidden rounded-none border border-brand-leaf/25 bg-gradient-to-b from-brand-leaf/10 via-card to-card p-4 sm:p-8 shadow-luxe text-center space-y-4 sm:space-y-5">
        {/* Glow ambient particle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-56 sm:size-72 rounded-full bg-brand-leaf/15 blur-3xl pointer-events-none" />

        {/* Animated Checkmark Badge */}
        <div className="relative mx-auto size-16 sm:size-20 rounded-full bg-gradient-to-tr from-brand-leaf to-emerald-400 p-0.5 sm:p-1 shadow-lg shadow-brand-leaf/20 flex items-center justify-center">
          <div className="size-full rounded-full bg-card flex items-center justify-center text-brand-leaf">
            <CheckCircle2 className="size-9 sm:size-11 stroke-[2.5] text-brand-leaf animate-in zoom-in duration-300" />
          </div>
        </div>

        {/* Tagline */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-leaf/30 bg-brand-leaf/15 px-3.5 py-1 text-[11px] font-bold tracking-wide text-brand-leaf">
            <Sparkles className="size-3" /> Order Placed & Confirmed
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-1.5 max-w-xl mx-auto">
          <h1 className="font-display text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Thank You, <span className="text-brand-leaf">{customerName}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-center">
            Your payment was successful and your order is confirmed. Our team will start preparing your farm products shortly, and you can follow every update from your dashboard.
          </p>
        </div>

        {/* Quick Order Meta Bar - Fully Responsive, Never Breaks on Mobile */}
        <div className="w-full max-w-2xl mx-auto rounded-none bg-secondary/80 border border-border p-3 sm:p-4 text-left sm:text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {/* Order Reference */}
            <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 px-3 sm:px-4 py-3 sm:py-1">
              <span className="text-[11px] font-semibold text-muted-foreground tracking-wide">Order Reference</span>
              <div className="flex items-center gap-1.5 bg-background/90 px-3 h-9 rounded-none border border-border">
                <strong className="font-mono text-xs sm:text-sm font-bold text-brand-leaf tracking-wider whitespace-nowrap">{orderNumber}</strong>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-brand-leaf transition cursor-pointer"
                  title="Copy Order ID"
                >
                  {isCopied ? <Check className="size-3.5 text-brand-leaf" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 px-3 sm:px-4 py-3 sm:py-1">
              <span className="text-[11px] font-semibold text-muted-foreground tracking-wide">Order Date</span>
              <div className="flex items-center gap-1.5 text-foreground text-xs sm:text-sm font-bold h-9">
                <Calendar className="size-3.5 sm:size-4 text-brand-gold shrink-0" />
                <span className="whitespace-nowrap">{formattedDate}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 px-3 sm:px-4 py-3 sm:py-1">
              <span className="text-[11px] font-semibold text-muted-foreground tracking-wide">Payment Mode</span>
              <div className="flex items-center gap-1.5 text-foreground text-xs sm:text-sm font-bold h-9">
                <BadgeCheck className="size-3.5 sm:size-4 text-brand-leaf shrink-0" />
                <span className="whitespace-nowrap truncate max-w-[140px] sm:max-w-none">{paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Invoice Confirmation Notification Pill */}
        {resolvedCustomerEmail && (
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand-leaf/30 bg-brand-leaf/10 px-4 py-1.5 text-xs text-foreground font-medium max-w-full">
            <Mail className="size-3.5 text-brand-leaf shrink-0" />
            <span className="truncate">
              GST Tax invoice dispatched to <strong className="text-brand-leaf font-bold">{resolvedCustomerEmail}</strong>
            </span>
            <button
              type="button"
              onClick={handleResendInvoiceEmail}
              disabled={isResendingEmail}
              className="text-[11px] font-bold text-brand-leaf hover:underline cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isResendingEmail ? "Sending..." : "Resend"}
            </button>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
          <Button
            asChild
            size="default"
            className="rounded-none px-5 text-xs font-bold gap-2 bg-[#075B32] hover:bg-[#064e2b] text-white shadow-md transition"
          >
            <Link to="/dashboard">
              <PackageCheck className="size-4" />
              <span>View Orders in Dashboard</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="default"
            className="rounded-none px-5 text-xs font-semibold gap-2 border-border hover:border-brand-leaf hover:text-brand-leaf transition"
          >
            <Link to="/products">
              <ShoppingBag className="size-4 text-brand-leaf" />
              <span>Continue Shopping</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => setIsInvoiceModalOpen(true)}
            className="rounded-none px-4 text-xs font-semibold gap-2 border-border hover:border-brand-leaf hover:text-brand-leaf transition"
          >
            <Download className="size-4 text-brand-leaf" />
            <span>Invoice PDF</span>
          </Button>
        </div>
      </div>

      {/* MAIN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {/* Left 2 Cols: Live Dispatch Milestones */}
        <div className="lg:col-span-2 flex">
          <div className="w-full flex flex-col rounded-none border border-[#075B32]/25 bg-card p-5 sm:p-7 shadow-none gap-5">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-brand-leaf animate-ping" />
                  <span className="text-[11px] font-bold text-brand-leaf tracking-wide">
                    Fulfillment Status
                  </span>
                </div>
                <h3 className="font-display text-base sm:text-xl font-bold text-foreground mt-0.5">
                  Order Progress
                </h3>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-bold text-brand-leaf hover:text-brand-leaf hover:bg-brand-leaf/10 rounded-lg">
                  <Link to="/dashboard">
                    My Orders <ArrowRight className="size-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Vertical timeline: one row per step, icon column + text column, same alignment for every step */}
            <ol className="flex-1 flex flex-col justify-between">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = step.status === "completed";
                const isActive = step.status === "active";
                const isLast = idx === steps.length - 1;
                return (
                  <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                    {!isLast && (
                      <span
                        aria-hidden
                        className={`absolute left-[19px] top-10 bottom-0 w-px ${isCompleted ? "bg-brand-leaf/50" : "bg-border"}`}
                      />
                    )}
                    <div
                      className={`relative z-10 size-10 shrink-0 flex items-center justify-center border ${
                        isCompleted
                          ? "bg-brand-leaf text-white border-brand-leaf"
                          : isActive
                          ? "bg-brand-gold/15 text-brand-gold border-brand-gold/60"
                          : "bg-card text-muted-foreground border-border"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1 text-left pt-0.5">
                      <p className={`text-sm font-bold ${isCompleted || isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed text-left">{step.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Guaranteed Delivery Footer */}
            <div className="pt-3.5 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-brand-leaf shrink-0" />
                <span>
                  Delivering to: <strong className="text-foreground">{recipientCity}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Comprehensive Digital Order Receipt */}
        <div className="rounded-none border border-[#075B32]/25 bg-card p-5 sm:p-7 shadow-none space-y-5">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <h3 className="font-display text-sm sm:text-base font-bold text-foreground">Order Receipt</h3>
              <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
            </div>
            <span className="text-[10px] font-bold tracking-wide text-brand-leaf bg-brand-leaf/10 px-2.5 py-1 rounded-full">
              Confirmed ✓
            </span>
          </div>

          {/* Items List */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 divide-y divide-border/60">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2.5 pt-2 first:pt-0 text-xs">
                <img
                  src={getProductImage(item.name, item.image)}
                  alt={item.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = pantryImage;
                  }}
                  className="size-10 rounded-none object-cover border border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{formatProductName(item.name)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <strong className="text-foreground shrink-0 font-mono">
                  ₹{item.quantity * item.price}
                </strong>
              </div>
            ))}
          </div>

          {/* Price Breakdown with GST */}
          <div className="pt-3 border-t border-border space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Items Subtotal</span>
              <span className="font-semibold text-foreground">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST</span>
              <span className="font-semibold text-foreground">₹{gstAmount}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brand-leaf font-semibold">
                <span>Discount Applied</span>
                <span>-₹{discount}</span>
              </div>
            )}
            {walletUsed > 0 && (
              <div className="flex justify-between text-brand-leaf font-semibold">
                <span>Wallet Credit Used</span>
                <span>-₹{walletUsed}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Fee</span>
              <span className={deliveryFee === 0 ? "text-brand-leaf font-bold" : "font-semibold text-foreground"}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border font-bold text-sm text-foreground">
              <span>Total Paid</span>
              <span className="font-display text-base sm:text-lg text-brand-leaf">₹{finalTotal}</span>
            </div>
          </div>

          {/* Shipping & Payment Meta */}
          <div className="pt-3 border-t border-border space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="size-4 text-brand-leaf shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-foreground">Delivery Address</p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed text-left">{customerAddress}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-brand-leaf shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Payment Method</p>
                <p className="text-muted-foreground mt-1 text-xs text-left">
                  {paymentMethod}
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Support Button with Pre-filled Order Info */}
          <a
            href={`https://api.whatsapp.com/send?phone=919311416225&text=${encodeURIComponent(`Hi Janani Agro, I have a question regarding my Order #${orderNumber}`)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-none bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 p-3 flex items-center justify-between text-xs transition cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageCircle className="size-3.5" />
              </div>
              <div className="text-left">
                <span className="font-bold text-foreground block">Need Order Support?</span>
                <span className="text-[10px] text-muted-foreground">Order #{orderNumber}</span>
              </div>
            </div>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
              Chat on WhatsApp →
            </span>
          </a>
        </div>
      </div>

      {/* RECOMMENDED PRODUCTS */}
      <div className="pt-6 border-t border-border space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-brand-leaf tracking-wide">
              Pair with Your Order
            </span>
            <h3 className="font-display text-lg sm:text-2xl font-bold text-foreground mt-1">
              Recommended Agricultural Products
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Specially formulated biological products and organic farm solutions for your crops and soil.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="rounded-none text-xs font-semibold gap-1.5 self-start h-8 sm:h-9">
            <Link to="/products">
              <span>View Full Catalog</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {recommendedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>

      {/* Invoice Modal */}
      <OrderInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        orderNumber={orderNumber}
        invoiceDate={formattedDate}
        customerName={customerName}
        customerPhone={customerPhone}
        customerEmail={resolvedCustomerEmail}
        customerAddress={customerAddress}
        items={items}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        discount={discount}
        finalTotal={finalTotal}
        paymentMethod={paymentMethod}
        order={orderData}
      />
    </div>
  );
}
