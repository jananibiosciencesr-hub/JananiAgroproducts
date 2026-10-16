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
  Sparkles,
  ShoppingBag,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Home,
  PackageCheck,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { products, getProductImage, pantryImage } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { OrderInvoiceModal } from "@/components/order-success/order-invoice-modal";

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
  const [isCopied, setIsCopied] = useState(false);

  // Effective order values
  const orderNumber = orderData?.orderNumber || orderData?.number || "JAP-749215";
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const deliveryDate = orderData?.slot?.dateStr || orderData?.deliverySlot || orderData?.expectedDelivery || "2-3 Business Days";
  const customerName = orderData?.customerName || orderData?.address?.fullName || user?.name || "Valued Patron";
  const customerPhone = orderData?.customerPhone || orderData?.address?.phone || user?.phone || "";
  const customerEmail = orderData?.customerEmail || orderData?.customer_email || orderData?.address?.email || user?.email || "";
  
  const customerAddress = orderData?.customerAddress || (orderData?.address
    ? `${orderData.address.streetAddress || orderData.address.houseFlat || ""}${orderData.address.street ? ", " + orderData.address.street : ""}${orderData.address.landmark ? ", " + orderData.address.landmark : ""}, ${orderData.address.city || ""}, ${orderData.address.state || ""} - ${orderData.address.pincode || ""}`
    : "Registered Delivery Address");

  const recipientCity = orderData?.address?.city || "Your Location";
  const paymentMethod = orderData?.paymentMethod === "upi"
    ? "Instant UPI / QR"
    : orderData?.paymentMethod === "card"
    ? "Credit / Debit Card"
    : orderData?.paymentMethod === "cod"
    ? "Cash on Delivery"
    : (orderData?.paymentMethod || "Verified Online Payment");

  const items = orderData?.items?.length
    ? orderData.items.map((it: any) => ({
        id: it.productId || it.product?.id || Math.random(),
        name: it.name || it.product?.name || "Agro Formulation Product",
        quantity: it.qty || it.quantity || 1,
        price: it.price || it.product?.price || 420,
        image: it.image || it.product?.image || pantryImage,
      }))
    : [
        { id: 1, name: "Bio-NPK Soil Booster - 1 Litre", quantity: 2, price: 420, image: pantryImage },
        { id: 2, name: "Neem Shield Organic Pest Controller - 500ml", quantity: 1, price: 410, image: pantryImage },
      ];

  const subtotal = orderData?.subtotal || items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0);
  const discount = orderData?.couponDiscount || orderData?.discount || 0;
  const deliveryFee = orderData?.shippingFee !== undefined 
    ? orderData.shippingFee 
    : (orderData?.deliveryFee !== undefined ? orderData.deliveryFee : (subtotal >= 799 ? 0 : 60));
  const gstAmount = orderData?.gstAmount !== undefined ? orderData.gstAmount : Math.round(subtotal * 0.05);
  const finalTotal = orderData?.finalTotal || orderData?.total || Math.max(0, subtotal + gstAmount + deliveryFee - discount);
  const awbNumber = orderData?.awb || `DEL-${orderNumber.replace(/[^0-9]/g, "") || "892144"}`;

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

  const steps = [
    {
      title: "Order Confirmed",
      desc: "Payment verified & inventory allocated",
      status: "completed",
      time: "Just now",
      icon: CheckCircle2,
    },
    {
      title: "Quality Checked & Packed",
      desc: "Inspected for batch quality & secure packing",
      status: "active",
      time: "Within 4 hours",
      icon: ShieldCheck,
    },
    {
      title: "Dispatched from Hub",
      desc: "Handed over to express courier logistics",
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

      {/* HERO CELEBRATION CARD */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-leaf/25 bg-gradient-to-b from-brand-leaf/10 via-card to-card p-4 sm:p-8 shadow-luxe text-center space-y-4 sm:space-y-5">
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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-leaf/30 bg-brand-leaf/15 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-leaf">
            <Sparkles className="size-3" /> Order Placed & Confirmed
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-1.5 max-w-xl mx-auto">
          <h1 className="font-display text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Thank You, <span className="text-brand-leaf">{customerName}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Your order has been received and confirmed. Our team has begun preparing your authentic farm products and scheduled them for express courier dispatch.
          </p>
        </div>

        {/* Quick Order Meta Bar - Fully Responsive, Never Breaks on Mobile */}
        <div className="w-full max-w-2xl mx-auto rounded-2xl bg-secondary/80 border border-border p-3 sm:p-4 text-left sm:text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {/* Order Reference */}
            <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-1 px-1 sm:px-2 py-0.5 sm:py-0">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Order Reference</span>
              <div className="flex items-center gap-1.5 bg-background/90 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-border">
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
            <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-1 px-1 sm:px-2 pt-2 sm:pt-0 py-0.5 sm:py-0">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Expected Delivery</span>
              <div className="flex items-center gap-1.5 text-foreground text-xs sm:text-sm font-bold">
                <Calendar className="size-3.5 sm:size-4 text-brand-gold shrink-0" />
                <span className="whitespace-nowrap">{deliveryDate}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-1 px-1 sm:px-2 pt-2 sm:pt-0 py-0.5 sm:py-0">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Payment Mode</span>
              <div className="flex items-center gap-1.5 text-foreground text-xs sm:text-sm font-bold">
                <BadgeCheck className="size-3.5 sm:size-4 text-brand-leaf shrink-0" />
                <span className="whitespace-nowrap truncate max-w-[140px] sm:max-w-none">{paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
          <Button
            asChild
            size="default"
            className="rounded-xl px-5 text-xs font-bold gap-2 bg-[#075B32] hover:bg-[#064e2b] text-white shadow-md transition"
          >
            <Link to="/track-order" search={{ orderId: orderNumber } as any}>
              <Truck className="size-4" />
              <span>Track Live Order</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="default"
            className="rounded-xl px-5 text-xs font-semibold gap-2 border-border hover:border-brand-leaf hover:text-brand-leaf transition"
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
            className="rounded-xl px-4 text-xs font-semibold gap-2 border-border hover:border-brand-leaf hover:text-brand-leaf transition"
          >
            <Download className="size-4 text-brand-leaf" />
            <span>Invoice PDF</span>
          </Button>
        </div>
      </div>

      {/* MAIN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left 2 Cols: Live Dispatch Milestones */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-7 shadow-soft space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-brand-leaf animate-ping" />
                  <span className="text-[11px] font-bold text-brand-leaf uppercase tracking-wider">
                    Fulfillment Status
                  </span>
                </div>
                <h3 className="font-display text-base sm:text-xl font-bold text-foreground mt-0.5">
                  Live Dispatch Milestones
                </h3>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-muted-foreground bg-secondary/80 px-3 py-1 rounded-xl border border-border/80 font-mono">
                  AWB: <strong className="text-foreground">{awbNumber}</strong>
                </span>
                <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-bold text-brand-leaf hover:text-brand-leaf hover:bg-brand-leaf/10 rounded-lg">
                  <Link to="/track-order" search={{ orderId: orderNumber } as any}>
                    Track <ArrowRight className="size-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="relative pt-1">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 md:gap-3">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isCompleted = step.status === "completed";
                  const isActive = step.status === "active";

                  return (
                    <div
                      key={step.title}
                      className={`flex md:flex-col items-start md:items-center md:text-center gap-3 md:gap-2 p-3 rounded-2xl transition border ${
                        isActive
                          ? "border-brand-gold/40 bg-brand-gold/5"
                          : isCompleted
                          ? "border-brand-leaf/20 bg-brand-leaf/5"
                          : "border-transparent bg-secondary/30"
                      }`}
                    >
                      <div
                        className={`size-10 sm:size-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                          isCompleted
                            ? "bg-brand-leaf text-white shadow-xs"
                            : isActive
                            ? "bg-brand-gold text-forest shadow-md ring-4 ring-brand-gold/20 animate-pulse font-bold"
                            : "bg-secondary text-muted-foreground border border-border"
                        }`}
                      >
                        <Icon className="size-4 sm:size-5" />
                      </div>

                      <div className="space-y-0.5 flex-1 min-w-0">
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
            <div className="pt-3.5 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-muted-foreground">
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
        <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-7 shadow-soft space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="font-display text-sm sm:text-base font-bold text-foreground">Order Receipt</h3>
              <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-leaf bg-brand-leaf/10 px-2.5 py-1 rounded-full">
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
                  className="size-10 rounded-xl object-cover border border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{item.name}</p>
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
              <span>GST (5%)</span>
              <span className="font-semibold text-foreground">₹{gstAmount}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brand-leaf font-semibold">
                <span>Discount Applied</span>
                <span>-₹{discount}</span>
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
                <p className="text-muted-foreground line-clamp-2 mt-0.5 text-[11px] leading-tight">{customerAddress}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-brand-leaf shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Payment Method</p>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
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
            className="rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 p-3 flex items-center justify-between text-xs transition cursor-pointer group"
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
            <span className="text-xs font-bold text-brand-leaf uppercase tracking-wider">
              Pair with Your Order
            </span>
            <h3 className="font-display text-lg sm:text-2xl font-bold text-foreground mt-1">
              Recommended Agricultural Products
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Specially formulated biological products and organic farm solutions for your crops and soil.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1.5 self-start h-8 sm:h-9">
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
        customerEmail={customerEmail}
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
