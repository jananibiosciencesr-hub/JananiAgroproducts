import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  Truck,
  ArrowRight,
  Download,
  Share2,
  Gift,
  Tag,
  Sparkles,
  ShoppingBag,
  MapPin,
  FileText,
  Phone,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Home,
  Clock,
  PackageCheck,
  Sprout,
  Heart,
  BadgeCheck,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { products, getProductImage, pantryImage, type Product } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

import { OrderInvoiceModal } from "@/components/order-success/order-invoice-modal";
import { ReferEarnModal } from "@/components/order-success/refer-earn-modal";

export const Route = createFileRoute("/order-success")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content: "Thank you for your order! Your organic cold-pressed products and pantry staples are being prepared for dispatch.",
      },
    ],
  }),
  component: OrderSuccessPage,
});

export function OrderSuccessPage() {
  const { user, products: storeProducts } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  // Load latest order from localStorage or fallback
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

  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isReferEarnModalOpen, setIsReferEarnModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Effective order values
  const orderNumber = orderData?.orderNumber || "JAP-749215";
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const deliveryDate = orderData?.slot?.dateStr || orderData?.deliverySlot || "2-3 Business Days";
  const customerName = orderData?.customerName || orderData?.address?.fullName || user?.name || "Valued Patron";
  const customerPhone = orderData?.customerPhone || orderData?.address?.phone || user?.phone || "";
  const customerAddress = orderData?.customerAddress || (orderData?.address
    ? `${orderData.address.houseFlat || ""}, ${orderData.address.street || ""}, ${orderData.address.landmark ? orderData.address.landmark + ", " : ""}${orderData.address.city || ""}, ${orderData.address.state || ""} - ${orderData.address.pincode || ""}`
    : "Registered Delivery Address");

  const recipientCity = orderData?.address?.city || "Your City";
  const paymentMethod = orderData?.paymentMethod === "upi"
    ? "Instant UPI / QR"
    : orderData?.paymentMethod === "card"
    ? "Credit / Debit Card"
    : orderData?.paymentMethod === "cod"
    ? "Cash on Delivery"
    : "Verified Online Payment";

  const items = orderData?.items?.length
    ? orderData.items.map((it: any) => ({
        id: it.product?.id || Math.random(),
        name: it.product?.name || "Organic Product",
        quantity: it.qty || 1,
        price: it.product?.price || 420,
        image: it.product?.image || pantryImage,
      }))
    : [
        { id: 1, name: "Wood Pressed Groundnut Oil - 1 Litre", quantity: 2, price: 420, image: pantryImage },
        { id: 2, name: "A2 Gir Cow Bilona Cultured Ghee - 500ml", quantity: 1, price: 950, image: pantryImage },
      ];

  const subtotal = orderData?.subtotal || items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0);
  const discount = orderData?.couponDiscount || orderData?.discount || 0;
  const deliveryFee = orderData?.shippingFee !== undefined ? orderData.shippingFee : (subtotal >= 799 ? 0 : 60);
  const finalTotal = orderData?.finalTotal || Math.max(0, subtotal + deliveryFee - discount);

  // Recommended next harvest items
  const recommendedProducts = useMemo(() => {
    return allProducts.slice(0, 4);
  }, [allProducts]);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderNumber);
    setIsCopied(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const steps = [
    {
      title: "Order Confirmed",
      desc: "Payment verified & inventory allocated",
      status: "completed",
      time: "Just now",
      icon: CheckCircle2,
    },
    {
      title: "Quality Tested & Packed",
      desc: "Nitrogen sealed with freshness check",
      status: "active",
      time: "Within 4 hours",
      icon: ShieldCheck,
    },
    {
      title: "Dispatched from Hub",
      desc: "Handed over to cold-chain logistics",
      status: "upcoming",
      time: "Tomorrow",
      icon: Truck,
    },
    {
      title: "Doorstep Delivery",
      desc: `Dispatched to ${recipientCity}`,
      status: "upcoming",
      time: deliveryDate,
      icon: PackageCheck,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 pb-24 lg:pb-16 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link to="/" className="hover:text-brand-leaf transition flex items-center gap-1">
          <Home className="size-3.5" /> Home
        </Link>
        <span>/</span>
        <Link to="/cart" className="hover:text-brand-leaf transition">Cart</Link>
        <span>/</span>
        <Link to="/checkout" className="hover:text-brand-leaf transition">Checkout</Link>
        <span>/</span>
        <span className="text-brand-leaf font-bold">Order Confirmed</span>
      </div>

      {/* HERO CELEBRATION CARD */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-leaf/30 bg-gradient-to-b from-brand-leaf/10 via-card to-card p-6 sm:p-10 shadow-luxe text-center space-y-5">
        {/* Glow ambient particle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-72 rounded-full bg-brand-leaf/15 blur-3xl pointer-events-none" />

        {/* Animated Checkmark Badge */}
        <div className="relative mx-auto size-20 sm:size-24 rounded-full bg-gradient-to-tr from-brand-leaf to-emerald-400 p-1 shadow-lg shadow-brand-leaf/25 flex items-center justify-center">
          <div className="size-full rounded-full bg-card flex items-center justify-center text-brand-leaf">
            <CheckCircle2 className="size-11 sm:size-13 stroke-[2.5] text-brand-leaf animate-in zoom-in duration-300" />
          </div>
        </div>

        {/* Tagline */}
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-leaf/30 bg-brand-leaf/15 px-4 py-1 text-xs font-bold uppercase tracking-wider text-brand-leaf">
          <Sparkles className="size-3.5" /> Order Placed & Confirmed
        </div>

        {/* Heading */}
        <div className="space-y-2 max-w-2xl mx-auto">
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-foreground">
            Thank You, <span className="text-brand-leaf">{customerName}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Your single-origin organic order has been successfully placed. Our Saurashtra farm hub has begun cold-press batch preparation and dispatch scheduling.
          </p>
        </div>

        {/* Quick Order Meta Bar */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 rounded-2xl bg-secondary/80 border border-border px-5 py-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Order Reference:</span>
            <strong className="font-mono text-brand-leaf font-bold tracking-wider">{orderNumber}</strong>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="p-1 rounded-md hover:bg-background text-muted-foreground hover:text-brand-leaf transition cursor-pointer"
              title="Copy Order ID"
            >
              {isCopied ? <Check className="size-3.5 text-brand-leaf" /> : <Copy className="size-3.5" />}
            </button>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-1.5 text-foreground font-semibold">
            <Calendar className="size-4 text-brand-gold" />
            <span>ETA: {deliveryDate}</span>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-1.5 text-foreground font-semibold">
            <BadgeCheck className="size-4 text-brand-leaf" />
            <span>{paymentMethod}</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            asChild
            variant="gold"
            size="lg"
            className="rounded-xl px-6 text-xs font-bold gap-2 shadow-md"
          >
            <Link to="/track-order">
              <Truck className="size-4" />
              <span>Track Live Dispatch</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setIsInvoiceModalOpen(true)}
            className="rounded-xl px-5 text-xs font-semibold gap-2 border-border hover:border-brand-leaf hover:text-brand-leaf transition"
          >
            <Download className="size-4" />
            <span>Download Invoice PDF</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setIsReferEarnModalOpen(true)}
            className="rounded-xl px-5 text-xs font-semibold gap-2 text-brand-gold border-brand-gold/40 hover:bg-brand-gold/10 transition"
          >
            <Gift className="size-4" />
            <span>Refer & Earn ₹250</span>
          </Button>
        </div>
      </div>

      {/* MAIN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Live Dispatch Timeline & Farm Highlights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dispatch Milestones Tracker Card */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-brand-leaf animate-ping" />
                  <span className="text-[11px] font-bold text-brand-leaf uppercase tracking-wider">
                    Fulfillment Status
                  </span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mt-0.5">
                  Live Dispatch Milestones
                </h3>
              </div>
              <div className="text-xs text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-xl border border-border/80 self-start sm:self-auto font-mono">
                AWB: <strong className="text-foreground">JAP-BD-892144</strong>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="relative pt-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-3">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isCompleted = step.status === "completed";
                  const isActive = step.status === "active";

                  return (
                    <div
                      key={step.title}
                      className={`flex md:flex-col items-start md:items-center md:text-center gap-3.5 md:gap-2 p-3 rounded-2xl transition border ${
                        isActive
                          ? "border-brand-gold/40 bg-brand-gold/5"
                          : isCompleted
                          ? "border-brand-leaf/20 bg-brand-leaf/5"
                          : "border-transparent bg-secondary/30"
                      }`}
                    >
                      <div
                        className={`size-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                          isCompleted
                            ? "bg-brand-leaf text-white shadow-sm"
                            : isActive
                            ? "bg-brand-gold text-forest shadow-md ring-4 ring-brand-gold/20 animate-pulse font-bold"
                            : "bg-secondary text-muted-foreground border border-border"
                        }`}
                      >
                        <Icon className="size-5" />
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-foreground">{step.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight">{step.desc}</p>
                        <span className="inline-block text-[10px] font-semibold text-brand-leaf bg-brand-leaf/10 px-2 py-0.5 rounded-md mt-1">
                          {step.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guaranteed Delivery Footer */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-brand-leaf shrink-0" />
                <span>
                  Delivering to: <strong className="text-foreground">{recipientCity}</strong> ({deliveryDate})
                </span>
              </div>
              <span className="text-brand-leaf font-bold">100% On-Time Freshness Guarantee</span>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Comprehensive Digital Order Receipt */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-border">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">Order Receipt</h3>
              <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-leaf bg-brand-leaf/10 px-2.5 py-1 rounded-full">
              Paid & Verified ✓
            </span>
          </div>

          {/* Items List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-border/60">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 pt-2.5 first:pt-0 text-xs">
                <img
                  src={getProductImage(item.name, item.image)}
                  alt={item.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = pantryImage;
                  }}
                  className="size-10 rounded-xl object-cover border border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <strong className="text-foreground shrink-0 font-mono">
                  ₹{item.quantity * item.price}
                </strong>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="pt-3 border-t border-border space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Items Subtotal</span>
              <span className="font-semibold text-foreground">₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brand-leaf font-semibold">
                <span>Discount / Voucher Applied</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Farm Direct Delivery</span>
              <span className={deliveryFee === 0 ? "text-brand-leaf font-bold" : "font-semibold text-foreground"}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between pt-2.5 border-t border-border font-bold text-sm text-foreground">
              <span>Total Paid</span>
              <span className="font-display text-lg text-brand-leaf">₹{finalTotal}</span>
            </div>
          </div>

          {/* Shipping & Payment Meta */}
          <div className="pt-3 border-t border-border space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="size-4 text-brand-leaf shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-foreground">Delivery Address</p>
                <p className="text-muted-foreground line-clamp-2 mt-0.5 text-[11px]">{customerAddress}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-brand-leaf shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Payment Settlement</p>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
                  Verified via <strong className="text-foreground">{paymentMethod}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Support Button */}
          <a
            href="https://api.whatsapp.com/send?phone=919876543210&text=Hi%20Janani%20Agro,%20I%20have%20a%20question%20about%20order"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-secondary/80 hover:bg-emerald-500/10 border border-border hover:border-emerald-500/30 p-3 flex items-center justify-between text-xs transition cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-emerald-600 group-hover:scale-110 transition" />
              <span className="font-semibold text-foreground">Need help with this order?</span>
            </div>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              Chat on WhatsApp →
            </span>
          </a>
        </div>
      </div>

      {/* RECOMMENDED HARVESTS */}
      <div className="pt-8 border-t border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-brand-leaf uppercase tracking-wider">
              Pair with Your Harvest Basket
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mt-1">
              Recommended Next Harvests
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Freshly cold-pressed batches that complement your pantry staple selection.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1.5 self-start h-9">
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

      {/* Modals */}
      <OrderInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        orderNumber={orderNumber}
        invoiceDate={formattedDate}
        customerName={customerName}
        customerPhone={customerPhone}
        customerAddress={customerAddress}
        items={items}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        discount={discount}
        finalTotal={finalTotal}
        paymentMethod={paymentMethod}
      />

      <ReferEarnModal
        isOpen={isReferEarnModalOpen}
        onClose={() => setIsReferEarnModalOpen(false)}
        referralCode={user?.referralCode || "JANANI100"}
      />
    </div>
  );
}
