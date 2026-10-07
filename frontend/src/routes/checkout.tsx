import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Lock,
  Package,
  QrCode,
  ShieldCheck,
  Wallet,
  Sparkles,
  UserCheck,
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { products, getProductImage, pantryImage } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

import { AddressManager, type ShippingAddress } from "@/components/checkout/address-manager";
import {
  CouponSelector,
  calculateCouponDiscount,
  type CouponRule,
} from "@/components/checkout/coupon-selector-modal";
import { GiftCardCard, type AppliedGiftCard } from "@/components/checkout/gift-card-card";
import { OrderNotesCard } from "@/components/checkout/order-notes-card";
import { PaymentSummaryCard } from "@/components/checkout/payment-summary-card";
import { MobileCheckoutBar } from "@/components/checkout/mobile-checkout-bar";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout & Dispatch — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content: "Secure checkout for farm-fresh organic harvest orders with scheduled delivery.",
      },
    ],
  }),
  component: CheckoutPage,
});

export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    user,
    logoutUser,
    products: storeProducts,
  } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  // Auto redirect to login with return redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/checkout" } as any });
    }
  }, [user, navigate]);

  const [step, setStep] = useState<"checkout" | "success">("checkout");
  const [orderId, setOrderId] = useState("");
  const [placedOrderSummary, setPlacedOrderSummary] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Address Selection State
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);

  // 2. Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<CouponRule | null>(null);

  // 3. Gift Card State
  const [appliedGiftCard, setAppliedGiftCard] = useState<AppliedGiftCard | null>(null);

  // 4. Order Notes State
  const [orderNotes, setOrderNotes] = useState("");

  // 5. Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");

  // Cart items list
  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([idStr, qty]) => {
        const product = allProducts.find((p) => Number(p.id) === Number(idStr) || String(p.id) === String(idStr))
          || products.find((p) => Number(p.id) === Number(idStr) || String(p.id) === String(idStr));
        return { product, qty: Number(qty) || 1 };
      })
      .filter(
        (item): item is { product: NonNullable<typeof item.product>; qty: number } =>
          item.product !== undefined && item.qty > 0
      );
  }, [cart, allProducts]);

  const actualCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.qty, 0);
  }, [cartItems]);

  // Financial Calculations
  const standardShippingFee = subtotal >= 799 || subtotal === 0 ? 0 : 60;
  const slotFee = 0;
  const totalShippingCharges = standardShippingFee;

  // Coupon discount
  const couponDiscount = calculateCouponDiscount(
    appliedCoupon,
    subtotal,
    standardShippingFee
  );

  // Net before gift card
  const grossPayable = Math.max(0, subtotal + totalShippingCharges - couponDiscount);
  const walletDeduction = 0;
  const payableAfterWallet = grossPayable;

  // Gift card deduction
  const giftCardDeduction = appliedGiftCard
    ? Math.min(appliedGiftCard.totalBalance, payableAfterWallet)
    : 0;

  const finalTotal = Math.max(0, payableAfterWallet - giftCardDeduction);

  const totalSavings =
    couponDiscount +
    walletDeduction +
    giftCardDeduction +
    (subtotal >= 799 ? 60 : 0);

  // Handle Order Placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to complete your order.");
      navigate({ to: "/login", search: { redirect: "/checkout" } as any });
      return;
    }
    if (!selectedAddress) {
      toast.error("Please select or add a delivery address.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const pendingCheckout = {
      orderNumber: `JAP-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: selectedAddress.fullName || user?.name || "Valued Patron",
      customerEmail: user?.email || "patron@jananiagro.com",
      customerPhone: selectedAddress.phone || user?.phone || "",
      address: selectedAddress,
      deliverySlot: "Standard Delivery (2-3 Business Days)",
      slot: {
        id: "standard",
        name: "Standard Delivery",
        dateStr: "2-3 Business Days",
        timeWindow: "9:00 AM – 7:00 PM",
        fee: 0,
      },
      items: cartItems,
      subtotal,
      shippingFee: standardShippingFee,
      slotFee: 0,
      couponDiscount,
      walletDeduction: 0,
      finalTotal,
      totalSavings,
      paymentMethod,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("janani_pending_checkout", JSON.stringify(pendingCheckout));
    }

    toast.info("Proceeding to Secure Payment Gateway...");
    navigate({ to: "/payment" });
    setIsSubmitting(false);
  };

  // NOT SIGNED IN GUARD - Clean Redirect Screen
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center space-y-4">
        <div className="size-16 mx-auto rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold animate-pulse">
          <Lock className="size-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Sign In Required for Checkout
        </h2>
        <p className="text-sm text-muted-foreground">
          Please sign in to verify your account, access saved delivery addresses, and complete your secure checkout.
        </p>
        <Button asChild variant="gold" size="lg" className="mt-4 rounded-2xl px-8 font-bold">
          <Link to="/login" search={{ redirect: "/checkout" } as any}>
            Continue to Sign In <ArrowRight className="size-4 ml-1.5" />
          </Link>
        </Button>
      </div>
    );
  }

  // SUCCESS CONFIRMATION VIEW
  if (step === "success") {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center animate-in fade-in duration-300">
        <div className="rounded-[3rem] border border-border bg-card p-6 sm:p-14 shadow-luxe">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-brand-leaf/15 text-brand-leaf shadow-inner">
            <CheckCircle2 className="size-12" />
          </span>

          <span className="mt-6 inline-block text-xs font-bold uppercase tracking-widest text-brand-leaf bg-brand-leaf/10 px-3 py-1 rounded-full">
            Order Confirmed & Scheduled
          </span>

          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl text-foreground">
            Thank You for Your Harvest Order!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
            Your single-origin organic goods have been reserved at our regional packaging hub.
            SMS & WhatsApp confirmation sent to{" "}
            <strong className="text-foreground">{placedOrderSummary?.address?.phone}</strong>.
          </p>

          {/* Order Details Card */}
          <div className="my-8 rounded-3xl bg-secondary/70 p-6 text-left border border-border space-y-3.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center pb-2.5 border-b border-border">
              <span className="text-muted-foreground font-medium">Order Reference:</span>
              <strong className="text-brand-leaf font-mono text-base tracking-wider">
                {orderId}
              </strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Delivery Location:</span>
              <span className="font-semibold text-foreground text-right">
                {placedOrderSummary?.address?.fullName} ({placedOrderSummary?.address?.city},{" "}
                {placedOrderSummary?.address?.pincode})
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Estimated Delivery:</span>
              <span className="font-semibold text-brand-leaf text-right">
                {placedOrderSummary?.slot?.dateStr
                  ? `${placedOrderSummary?.slot?.dateStr} • ${placedOrderSummary?.slot?.timeWindow}`
                  : placedOrderSummary?.deliverySlot || "Standard Dispatch (2-3 Days)"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Payment Selection:</span>
              <span className="font-semibold uppercase text-foreground">
                {placedOrderSummary?.paymentMethod === "upi"
                  ? "Instant UPI / QR"
                  : placedOrderSummary?.paymentMethod === "card"
                  ? "Card & Banking"
                  : "Cash on Delivery"}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t border-border">
              <div>
                <span className="font-bold text-foreground block">Total Paid:</span>
                {placedOrderSummary?.totalSavings > 0 && (
                  <span className="text-[11px] text-brand-leaf font-semibold">
                    Saved ₹{placedOrderSummary.totalSavings}
                  </span>
                )}
              </div>
              <strong className="font-display text-2xl text-foreground">
                ₹{placedOrderSummary?.finalTotal}
              </strong>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="lg" className="rounded-2xl px-6 font-bold shadow-md">
              <Link to="/track-order">
                Track Live Dispatch <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl px-6 font-semibold">
              <Link to="/products">Explore More Harvests</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART GUARD
  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="size-20 mx-auto rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
          <Package className="size-10" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-foreground">
          Your Harvest Basket is Empty
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add wood-pressed oils, aged pulses, or natural spices to proceed to secure checkout.
        </p>
        <Button asChild variant="gold" size="lg" className="mt-6 rounded-full px-8 font-bold">
          <Link to="/products">Browse Organic Staples</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 pb-28 lg:pb-12">
      {/* Header with Breadcrumb & Trust Ticker */}
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Link to="/" className="hover:text-brand-leaf transition">Home</Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-brand-leaf transition">Cart</Link>
            <span>/</span>
            <span className="text-brand-leaf">Checkout</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl text-foreground flex items-center gap-3">
            Checkout & Scheduled Dispatch
          </h1>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-brand-leaf/30 bg-brand-leaf/5 px-4 py-1.5 text-xs font-semibold text-brand-leaf">
          <ShieldCheck className="size-4" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      {/* Main Grid: Left Steps + Right Rail Summary */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px] items-start">
        {/* Left Column: Sequential Checkout Steps */}
        <div className="space-y-8">
          {/* USER PROFILE INFO BANNER */}
          <section className="rounded-3xl border border-brand-leaf/40 bg-gradient-to-r from-brand-leaf/10 via-brand-leaf/5 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="grid size-11 place-items-center rounded-2xl bg-brand-leaf text-white font-bold text-sm shadow-sm shrink-0">
                <UserCheck className="size-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-base font-bold text-foreground">
                    {user.name || "Valued Patron"}
                  </strong>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-leaf/20 text-brand-leaf px-2.5 py-0.5 rounded-full border border-brand-leaf/30">
                    Verified Customer
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user.email} {user.phone ? `· ${user.phone}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  toast.info("Signed out. Redirecting to Sign In...");
                  navigate({ to: "/login", search: { redirect: "/checkout" } as any });
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition cursor-pointer px-3 py-1.5 rounded-xl hover:bg-destructive/10"
              >
                <LogOut className="size-3.5" />
                <span>Switch Account / Sign Out</span>
              </button>
            </div>
          </section>

          {/* STEP 1: Delivery Address (CRUD) */}
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-brand-leaf text-white text-xs font-bold shadow-xs">
                  1
                </span>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Select Delivery Location
                </h2>
              </div>
              {selectedAddress && (
                <span className="text-xs text-brand-leaf font-bold flex items-center gap-1">
                  ✓ Address Selected
                </span>
              )}
            </div>

            <AddressManager
              selectedAddressId={selectedAddress?.id || ""}
              onSelectAddress={(addr) => setSelectedAddress(addr)}
            />
          </section>

          {/* STEP 2: Order Notes & Harvest Instructions */}
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <span className="grid size-7 place-items-center rounded-full bg-brand-leaf text-white text-xs font-bold shadow-xs">
                2
              </span>
              <h2 className="font-display text-lg font-bold text-foreground">
                Special Delivery Instructions
              </h2>
            </div>

            <OrderNotesCard
              orderNotes={orderNotes}
              onChangeNotes={(notes) => setOrderNotes(notes)}
            />
          </section>

          {/* STEP 3: Payment Option Selection */}
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <span className="grid size-7 place-items-center rounded-full bg-brand-leaf text-white text-xs font-bold shadow-xs">
                3
              </span>
              <h2 className="font-display text-lg font-bold text-foreground">
                Payment Option
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  id: "upi",
                  label: "Instant UPI / QR",
                  icon: QrCode,
                  sub: "Google Pay, PhonePe, Paytm, BHIM",
                  badge: "FASTEST",
                },
                {
                  id: "card",
                  label: "Cards & Banking",
                  icon: CreditCard,
                  sub: "Visa, Mastercard, RuPay, NetBanking",
                },
                {
                  id: "cod",
                  label: "Cash on Delivery",
                  icon: Wallet,
                  sub: "Pay upon harvest doorstep arrival",
                },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex flex-col items-center p-4 rounded-2xl border text-center transition-all duration-200 relative cursor-pointer ${
                      isSelected
                        ? "border-brand-leaf bg-brand-leaf/10 text-brand-leaf shadow-sm ring-1 ring-brand-leaf/30"
                        : "border-border bg-background text-foreground hover:bg-secondary"
                    }`}
                  >
                    {m.badge && (
                      <span className="absolute top-2 right-2 text-[9px] font-extrabold uppercase bg-brand-gold/15 text-brand-gold px-1.5 py-0.5 rounded">
                        {m.badge}
                      </span>
                    )}
                    <Icon className="size-6 mb-2" />
                    <span className="text-xs font-bold">{m.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === "upi" && (
              <div className="rounded-2xl bg-secondary/80 p-3.5 text-center border border-border text-xs text-muted-foreground">
                💡 Instant QR Code will generate immediately after you click <strong>Place Order</strong>.
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Sticky Rail Summary */}
        <div className="space-y-4">
          {/* Order Items Preview */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex justify-between">
              <span>Items in Basket</span>
              <span className="font-mono">{actualCartCount} Total</span>
            </h4>
            <div className="max-h-48 overflow-y-auto divide-y divide-border/60 pr-1 mt-2 space-y-1">
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center gap-2.5 pt-2 text-xs">
                  <img
                    src={getProductImage(product.name || product.category, product.image)}
                    alt={product.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = pantryImage;
                    }}
                    className="size-10 rounded-lg object-cover border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-foreground text-xs">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Qty: {qty} × ₹{product.price}
                    </p>
                  </div>
                  <strong className="font-bold text-foreground text-xs">
                    ₹{product.price * qty}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Apply Promo Coupons & Vouchers (Directly Above Payment Summary) */}
          <CouponSelector
            appliedCoupon={appliedCoupon}
            onApplyCoupon={(coupon) => setAppliedCoupon(coupon)}
            subtotal={subtotal}
            shippingFee={standardShippingFee}
          />

          {/* Payment & Tax Summary Card */}
          <PaymentSummaryCard
            cartItemsCount={actualCartCount}
            subtotal={subtotal}
            shippingFee={standardShippingFee}
            slotFee={slotFee}
            coupon={appliedCoupon}
            couponDiscount={couponDiscount}
            isWalletEnabled={false}
            walletDeduction={0}
            appliedGiftCard={appliedGiftCard}
            finalTotal={finalTotal}
            totalSavings={totalSavings}
            selectedAddress={selectedAddress}
            isSubmitting={isSubmitting}
            onPlaceOrder={handlePlaceOrder}
          />

          {/* Janani Gift Card / Voucher Redemption */}
          <GiftCardCard
            appliedGiftCard={appliedGiftCard}
            onApplyGiftCard={(card) => setAppliedGiftCard(card)}
            maxDeductible={payableAfterWallet}
          />
        </div>
      </div>

      {/* Floating Bottom Action Bar for Mobile Viewports */}
      <MobileCheckoutBar
        finalTotal={finalTotal}
        subtotal={subtotal}
        shippingFee={standardShippingFee}
        slotFee={slotFee}
        couponDiscount={couponDiscount}
        walletDeduction={walletDeduction}
        giftCardDeduction={giftCardDeduction}
        isSubmitting={isSubmitting}
        onPlaceOrder={handlePlaceOrder}
        disabled={!selectedAddress || cartItems.length === 0}
      />
    </div>
  );
}
