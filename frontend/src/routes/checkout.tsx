import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Lock,
  Package,
  QrCode,
  ShieldCheck,
  Truck,
  Wallet,
  Sparkles,
  ChevronRight,
  Receipt,
  RotateCcw,
  Check,
  Info,
  Calendar,
  Phone
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { products, getProductImage, pantryImage } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { createOrder, sendAuthOtp, verifyAuthOtp, signupCustomer } from "@/lib/api";

import { AddressManager, type ShippingAddress } from "@/components/checkout/address-manager";
import {
  DeliverySlotPicker,
  DELIVERY_SLOTS,
  type DeliverySlot,
} from "@/components/checkout/delivery-slot-picker";
import {
  CouponSelector,
  calculateCouponDiscount,
  type CouponRule,
} from "@/components/checkout/coupon-selector-modal";
import { WalletToggleCard } from "@/components/checkout/wallet-toggle-card";
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
    cartCount,
    user,
    loginUser,
    logoutUser,
    clearCart,
    deductWalletBalance,
    products: storeProducts,
  } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  const [step, setStep] = useState<"checkout" | "success">("checkout");
  const [orderId, setOrderId] = useState("");
  const [placedOrderSummary, setPlacedOrderSummary] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email OTP Checkout Auth State
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1. Address Selection State
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);

  // 2. Delivery Slot State
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot>(DELIVERY_SLOTS[1]!); // Default to Morning Fresh (FREE)

  // 3. Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<CouponRule | null>(null);

  // 4. Wallet State
  const [isWalletEnabled, setIsWalletEnabled] = useState(false);

  // 5. Gift Card State
  const [appliedGiftCard, setAppliedGiftCard] = useState<AppliedGiftCard | null>(null);

  // 6. Order Notes State
  const [orderNotes, setOrderNotes] = useState("");

  // 7. Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");

  // Timer countdown for OTP resend
  useEffect(() => {
    if (isOtpSent && resendTimer > 0) {
      const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isOtpSent, resendTimer]);

  // Handle Send Realtime OTP to Email
  const handleSendCheckoutOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const emailToUse = checkoutEmail.trim().toLowerCase();
    if (!emailToUse || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToUse)) {
      toast.error("Please enter a valid email address to receive your OTP.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendAuthOtp({ email: emailToUse, purpose: "checkout" });
      if (res.success) {
        setIsOtpSent(true);
        setResendTimer(60);
        setOtpCode(["", "", "", "", "", ""]);
        toast.success(`6-Digit OTP sent to ${emailToUse} via Gmail. Please check your inbox!`);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        toast.error(res.message || "Failed to dispatch OTP. Please try again.");
      }
    } catch (err) {
      toast.error("Network error while sending OTP. Please retry.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP digit inputs
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...otpCode];
      next[index] = "";
      setOtpCode(next);
      return;
    }

    if (cleaned.length > 1) {
      const next = [...otpCode];
      cleaned.slice(0, 6).split("").forEach((char, i) => {
        if (i < 6) next[i] = char;
      });
      setOtpCode(next);
      const nextFocus = Math.min(cleaned.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const next = [...otpCode];
    next[index] = cleaned[0] || "";
    setOtpCode(next);
    if (index < 5 && cleaned[0]) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Verify OTP and auto-login
  const handleVerifyCheckoutOtp = async () => {
    const code = otpCode.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP sent to your email.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await verifyAuthOtp({ email: checkoutEmail.trim().toLowerCase(), otp: code });
      if (res.success && res.user) {
        // If customer provided a custom name/phone during checkout auth, merge it
        const updatedUser = {
          ...res.user,
          name: checkoutName.trim() || res.user.name || "Valued Patron",
          phone: checkoutPhone.trim() || res.user.phone || "+91 98480 22338",
        };
        loginUser(updatedUser);
        toast.success(`Welcome ${updatedUser.name}! Signed in successfully. Your cart items are preserved.`);
      } else {
        toast.error(res.message || "Invalid or expired OTP. Please check and try again.");
      }
    } catch (err) {
      toast.error("Error verifying OTP. Please retry.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Cart items list
  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([idStr, qty]) => {
        const product = allProducts.find((p) => p.id === Number(idStr));
        return { product, qty };
      })
      .filter(
        (item): item is { product: NonNullable<typeof item.product>; qty: number } =>
          item.product !== undefined
      );
  }, [cart, allProducts]);

  // Financial Calculations
  const standardShippingFee = subtotal >= 799 || subtotal === 0 ? 0 : 60;
  // Slot surcharge: express priority is free if subtotal >= 1200
  const slotFee =
    selectedSlot.id === "express_priority" && subtotal >= 1200 ? 0 : selectedSlot.fee;
  const totalShippingCharges = standardShippingFee + slotFee;

  // Coupon discount
  const couponDiscount = calculateCouponDiscount(
    appliedCoupon,
    subtotal,
    standardShippingFee
  );

  // Net before wallet & gift card
  const grossPayable = Math.max(0, subtotal + totalShippingCharges - couponDiscount);

  // Wallet deduction
  const userWalletBalance = user?.walletBalance ?? 250;
  const walletDeduction = isWalletEnabled
    ? Math.min(userWalletBalance, grossPayable)
    : 0;

  const payableAfterWallet = Math.max(0, grossPayable - walletDeduction);

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
      customerName: selectedAddress.fullName || user?.name || checkoutName || "Valued Patron",
      customerEmail: user?.email || checkoutEmail || "patron@jananiagro.com",
      customerPhone: selectedAddress.phone || user?.phone || checkoutPhone || "+91 98480 22338",
      address: selectedAddress,
      slot: selectedSlot,
      items: cartItems,
      subtotal,
      shippingFee: standardShippingFee,
      slotFee,
      couponDiscount,
      walletDeduction: isWalletEnabled ? walletDeduction : 0,
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
              <span className="text-muted-foreground font-medium">Scheduled Window:</span>
              <span className="font-semibold text-brand-leaf text-right">
                {placedOrderSummary?.slot?.dateStr} • {placedOrderSummary?.slot?.timeWindow}
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
          {/* USER AUTH & REALTIME EMAIL OTP SECTION */}
          {!user ? (
            <section className="rounded-3xl border-2 border-brand-gold/40 bg-gradient-to-br from-brand-gold/10 via-card to-background p-5 sm:p-7 shadow-soft space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-2xl bg-brand-gold text-forest text-sm font-bold shadow-sm">
                    🔐
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground">
                      Customer Sign In / Quick OTP Verification
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Enter your email to receive a real-time OTP via Gmail. Basket items are 100% saved.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-brand-gold bg-brand-gold/15 px-2.5 py-1 rounded-full self-start sm:self-auto">
                  ⚡ Fast Login
                </span>
              </div>

              {!isOtpSent ? (
                <form onSubmit={handleSendCheckoutOtp} className="space-y-4 pt-1">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Full Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-2xl border border-input bg-card text-xs text-foreground focus:border-brand-leaf outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98480 22338"
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-2xl border border-input bg-card text-xs text-foreground focus:border-brand-leaf outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="youremail@gmail.com"
                        value={checkoutEmail}
                        onChange={(e) => setCheckoutEmail(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-2xl border border-brand-gold/50 bg-card text-xs text-foreground focus:border-brand-leaf outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <p className="text-[11px] text-muted-foreground">
                      💡 A 6-digit verification code will be sent to your Gmail inbox instantly.
                    </p>
                    <Button
                      type="submit"
                      disabled={isSendingOtp}
                      variant="gold"
                      size="sm"
                      className="rounded-2xl px-5 font-bold text-xs h-10 shadow-sm"
                    >
                      {isSendingOtp ? "Sending Code..." : "Send Realtime OTP to Email ✉️"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 pt-1 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-secondary/80 p-3.5 rounded-2xl border border-border text-xs">
                    <div>
                      <span className="text-muted-foreground">Verification code sent to: </span>
                      <strong className="text-foreground font-semibold">{checkoutEmail}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      className="text-brand-leaf font-semibold hover:underline self-start sm:self-auto text-xs"
                    >
                      Change Email
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-2 block text-center sm:text-left">
                      Enter 6-Digit Email OTP Code:
                    </label>
                    <div className="flex justify-center sm:justify-start gap-2 sm:gap-3">
                      {otpCode.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpDigitKeyDown(index, e)}
                          className="size-11 sm:size-12 text-center text-lg font-bold font-mono rounded-xl border border-border bg-card focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-foreground transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-muted-foreground">
                      {resendTimer > 0 ? (
                        <span>Resend code in <strong className="text-foreground font-mono">{resendTimer}s</strong></span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendCheckoutOtp()}
                          className="text-brand-leaf font-bold hover:underline"
                        >
                          🔄 Resend OTP Code
                        </button>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={handleVerifyCheckoutOtp}
                      disabled={isVerifyingOtp || otpCode.join("").length !== 6}
                      variant="gold"
                      size="sm"
                      className="rounded-2xl px-6 font-bold text-xs h-10 shadow-sm"
                    >
                      {isVerifyingOtp ? "Verifying..." : "Verify OTP & Continue ✨"}
                    </Button>
                  </div>
                </div>
              )}
            </section>
          ) : (
            <section className="rounded-3xl border border-brand-leaf/40 bg-brand-leaf/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-brand-leaf text-white font-bold text-base shrink-0">
                  ✓
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-foreground">
                      {user.name || "Valued Patron"}
                    </strong>
                    <span className="text-[10px] font-bold uppercase bg-brand-leaf/20 text-brand-leaf px-2 py-0.5 rounded-full">
                      Logged In
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {user.email} {user.phone ? `· ${user.phone}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    logoutUser();
                    toast.info("Signed out from checkout. You can switch accounts.");
                  }}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground transition underline"
                >
                  Switch / Sign Out
                </button>
              </div>
            </section>
          )}

          {/* STEP 1: Delivery Address (CRUD) */}
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-brand-leaf text-white text-xs font-bold">
                  1
                </span>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Select Delivery Location
                </h2>
              </div>
              {selectedAddress && (
                <span className="text-xs text-brand-leaf font-bold">
                  ✓ Address Selected
                </span>
              )}
            </div>

            <AddressManager
              selectedAddressId={selectedAddress?.id || ""}
              onSelectAddress={(addr) => setSelectedAddress(addr)}
            />
          </section>

          {/* STEP 2: Delivery Slot Selection */}
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-brand-leaf text-white text-xs font-bold">
                  2
                </span>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Choose Delivery Slot
                </h2>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {selectedSlot.name}
              </span>
            </div>

            <DeliverySlotPicker
              selectedSlotId={selectedSlot.id}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
              subtotal={subtotal}
            />
          </section>

          {/* STEP 3: Coupons, Wallet & Gift Card */}
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-soft space-y-5">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <span className="grid size-7 place-items-center rounded-full bg-brand-leaf text-white text-xs font-bold">
                3
              </span>
              <h2 className="font-display text-lg font-bold text-foreground">
                Promotions, Wallet & Gift Cards
              </h2>
            </div>

            <div className="space-y-4">
              {/* Coupon Picker */}
              <CouponSelector
                appliedCoupon={appliedCoupon}
                onApplyCoupon={(coupon) => setAppliedCoupon(coupon)}
                subtotal={subtotal}
                shippingFee={standardShippingFee}
              />

              {/* Wallet Toggle */}
              <WalletToggleCard
                walletBalance={userWalletBalance}
                isWalletEnabled={isWalletEnabled}
                onToggleWallet={(enabled) => setIsWalletEnabled(enabled)}
                maxDeductible={grossPayable}
              />

              {/* Gift Card */}
              <GiftCardCard
                appliedGiftCard={appliedGiftCard}
                onApplyGiftCard={(card) => setAppliedGiftCard(card)}
                maxDeductible={payableAfterWallet}
              />
            </div>
          </section>

          {/* STEP 4: Order Notes & Harvest Instructions */}
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <span className="grid size-7 place-items-center rounded-full bg-brand-leaf text-white text-xs font-bold">
                4
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

          {/* STEP 5: Payment Method Selection */}
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <span className="grid size-7 place-items-center rounded-full bg-brand-leaf text-white text-xs font-bold">
                5
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
                    className={`flex flex-col items-center p-4 rounded-2xl border text-center transition-all duration-200 relative ${
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
        <div>
          {/* Order Items Preview */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs mb-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex justify-between">
              <span>Items in Basket</span>
              <span className="font-mono">{cartCount} Total</span>
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

          {/* Payment & Tax Summary Card */}
          <PaymentSummaryCard
            cartItemsCount={cartCount}
            subtotal={subtotal}
            shippingFee={standardShippingFee}
            slotFee={slotFee}
            coupon={appliedCoupon}
            couponDiscount={couponDiscount}
            isWalletEnabled={isWalletEnabled}
            walletDeduction={walletDeduction}
            appliedGiftCard={appliedGiftCard}
            finalTotal={finalTotal}
            totalSavings={totalSavings}
            selectedAddress={selectedAddress}
            selectedSlot={selectedSlot}
            isSubmitting={isSubmitting}
            onPlaceOrder={handlePlaceOrder}
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
