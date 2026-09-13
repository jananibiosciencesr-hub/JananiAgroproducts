import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  Clock,
  Download,
  Truck,
  ArrowRight,
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
  Home
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { products, type Product } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

import { OrderSuccessAnimation } from "@/components/order-success/order-success-animation";
import { OrderDispatchTrackerPreview } from "@/components/order-success/order-dispatch-tracker-preview";
import { OrderInvoiceModal } from "@/components/order-success/order-invoice-modal";
import { ReferEarnModal } from "@/components/order-success/refer-earn-modal";
import { CouponRewardModal } from "@/components/order-success/coupon-reward-modal";

export const Route = createFileRoute("/order-success")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content: "Thank you for your order! Your organic cold-pressed oils and pantry staples are being fresh-packed.",
      },
    ],
  }),
  component: OrderSuccessPage,
});

export function OrderSuccessPage() {
  const { user } = useStore();

  // Load latest order from localStorage or fallback to realistic default
  const [orderData, setOrderData] = useState<any>(() => {
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
  const [isCouponRewardModalOpen, setIsCouponRewardModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Auto-pop surprise reward coupon after 1.5s on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCouponRewardModalOpen(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Effective values
  const orderNumber = orderData?.orderNumber || "JAP-749215";
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const deliveryDate = orderData?.slot?.dateStr || "Tomorrow Morning (9:00 AM – 1:00 PM)";
  const customerName = orderData?.address?.fullName || user?.name || "Neha Patel";
  const customerPhone = orderData?.address?.phone || user?.phone || "+91 93114 16225";
  const customerAddress = orderData?.address
    ? `${orderData.address.streetAddress}, ${orderData.address.city}, ${orderData.address.state} - ${orderData.address.pincode}`
    : "Flat 402, Green Acre Heights, Bodakdev, Ahmedabad, Gujarat - 380054";

  const recipientCity = orderData?.address?.city || "Ahmedabad";
  const paymentMethod = orderData?.paymentMethod || "UPI (Google Pay)";
  const items = orderData?.items?.length
    ? orderData.items.map((it: any) => ({
        name: it.product.name,
        quantity: it.qty,
        price: it.product.price,
      }))
    : [
        { name: "Wood Pressed Groundnut Oil - 1 Litre", quantity: 2, price: 420 },
        { name: "A2 Gir Cow Bilona Cultured Ghee - 500ml", quantity: 1, price: 950 },
      ];

  const subtotal = orderData?.subtotal || 1790;
  const discount = orderData?.discount || 150;
  const deliveryFee = orderData?.deliveryFee || 0;
  const finalTotal = orderData?.finalTotal || 1640;

  // Recommended next harvest items
  const recommendedProducts = useMemo(() => {
    return products.slice(0, 4);
  }, []);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderNumber);
    setIsCopied(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 pb-24 lg:pb-16 space-y-10 animate-in fade-in duration-300">
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

      {/* Top Hero: Animation + Title + Essential Meta */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <OrderSuccessAnimation />

        <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
          Harvest Order Placed!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Thank you, <strong className="text-foreground">{customerName}</strong>! Your single-origin order is received. Our Saurashtra farm-hub has begun cold-press packaging with zero chemical preservatives.
        </p>

        {/* Quick Order ID & Delivery Ticker Banner */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 rounded-2xl bg-secondary/80 border border-border px-5 py-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Order ID:</span>
            <strong className="font-mono text-foreground font-bold tracking-wider">{orderNumber}</strong>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="p-1 rounded-md hover:bg-background text-muted-foreground hover:text-brand-leaf transition"
              title="Copy Order ID"
            >
              {isCopied ? <Check className="size-4 text-brand-leaf" /> : <Copy className="size-4" />}
            </button>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-1.5 text-brand-leaf font-semibold">
            <Calendar className="size-4" />
            <span>ETA: {deliveryDate}</span>
          </div>
        </div>
      </div>

      {/* Interactive Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setIsInvoiceModalOpen(true)}
          className="rounded-2xl px-5 text-xs font-bold gap-2 shadow-xs hover:border-brand-leaf hover:text-brand-leaf transition"
        >
          <Download className="size-4" />
          <span>Download Tax Invoice</span>
        </Button>

        <Button
          asChild
          variant="gold"
          size="lg"
          className="rounded-2xl px-6 text-xs font-bold gap-2 shadow-md shadow-brand-gold/20"
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
          onClick={() => setIsReferEarnModalOpen(true)}
          className="rounded-2xl px-5 text-xs font-bold gap-2 text-brand-gold border-brand-gold/40 hover:bg-brand-gold/10 transition"
        >
          <Gift className="size-4" />
          <span>Refer & Earn ₹250</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => setIsCouponRewardModalOpen(true)}
          className="rounded-2xl px-5 text-xs font-bold gap-2 text-brand-leaf hover:bg-brand-leaf/10 transition"
        >
          <Tag className="size-4" />
          <span>View Reward Voucher</span>
        </Button>
      </div>

      {/* Main Grid: Live Fulfillment Tracker + Order Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Live Dispatch Timeline Preview */}
        <div className="lg:col-span-2 space-y-6">
          <OrderDispatchTrackerPreview
            orderNumber={orderNumber}
            deliveryDate={deliveryDate}
            recipientCity={recipientCity}
          />

          {/* Patron Privilege Callout Card */}
          <div className="rounded-3xl border border-brand-gold/30 bg-gradient-to-r from-brand-gold/10 via-brand-leaf/5 to-transparent p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/20 text-brand-gold px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                <Sparkles className="size-3" /> Janani Circle Privilege
              </span>
              <h4 className="font-display text-lg sm:text-xl font-bold text-foreground">
                Earned 120 Harvest Green Points
              </h4>
              <p className="text-xs text-muted-foreground max-w-md">
                This purchase added 120 loyalty points to your account balance. Points automatically apply as instant discounts on subsequent orders.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReferEarnModalOpen(true)}
              className="rounded-full border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white shrink-0 font-bold text-xs gap-1.5"
            >
              <Share2 className="size-3.5" />
              <span>Invite Friends</span>
            </Button>
          </div>
        </div>

        {/* Right 1 Col: Comprehensive Order Details Card */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h3 className="font-display text-lg font-bold text-foreground">
              Order Receipt
            </h3>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>

          {/* Items List */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start text-xs gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-foreground line-clamp-1">{item.name}</p>
                  <p className="text-muted-foreground mt-0.5">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
                <strong className="text-foreground shrink-0 font-mono">
                  ₹{item.quantity * item.price}
                </strong>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="pt-4 border-t border-border space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brand-leaf font-semibold">
                <span>Discount / Voucher Applied</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Farm Direct Delivery</span>
              <span className={deliveryFee === 0 ? "text-brand-leaf font-semibold" : ""}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border font-bold text-sm text-foreground">
              <span>Total Paid</span>
              <span className="font-display text-lg text-brand-leaf">₹{finalTotal}</span>
            </div>
          </div>

          {/* Delivery & Payment Badges */}
          <div className="pt-4 border-t border-border space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="size-4 text-brand-leaf shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Delivery Address</p>
                <p className="text-muted-foreground line-clamp-2 mt-0.5">{customerAddress}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-brand-leaf shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Payment Settlement</p>
                <p className="text-muted-foreground mt-0.5">
                  Verified via <strong className="text-foreground">{paymentMethod}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp / Concierge help */}
          <div className="rounded-2xl bg-secondary/70 p-3.5 border border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-emerald-600" />
              <span className="font-medium text-foreground">Need order help?</span>
            </div>
            <a
              href="https://api.whatsapp.com/send?phone=919876543210&text=Hi%20Janani%20Agro,%20I%20have%20a%20question%20about%20order"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Recommended Products Carousel / Grid ("Continue Shopping Pairing") */}
      <div className="pt-8 border-t border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-brand-leaf uppercase tracking-wider">
              Pair with Your Harvest Basket
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
              Recommended Next Harvests
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Freshly cold-pressed batches that complement your pantry staple selection.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-semibold gap-1.5 self-start">
            <Link to="/products">
              <span>View Full Catalog</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>

      {/* All 3 Modals for Order Success Journey */}
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
        referralCode="NEHA250"
      />

      <CouponRewardModal
        isOpen={isCouponRewardModalOpen}
        onClose={() => setIsCouponRewardModalOpen(false)}
        couponCode="NEXTHARVEST15"
        discountPercentage={15}
      />
    </div>
  );
}
