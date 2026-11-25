import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { generateNextOrderNumber, getAuthoritativeNextOrderNumber, createOrder, normalizeCouponData, getMyWallet, WALLET_RULES_DEFAULT, type WalletSummary } from "@/lib/api";
import { WalletToggleCard } from "@/components/checkout/wallet-toggle-card";
import { saveCustomerOrders, loadCustomerOrders } from "@/components/orders/orders-seed";
import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Package,
  ShieldCheck,
  Sparkles,
  UserCheck,
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { products, getProductImage, getProductVariantImage, pantryImage, formatProductName, parseCartItems } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

import { AddressManager, type ShippingAddress } from "@/components/checkout/address-manager";
import {
  CouponSelector,
  calculateCouponDiscount,
  type CouponRule,
} from "@/components/checkout/coupon-selector-modal";
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
    clearCart,
    products: storeProducts,
  } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  // Auto redirect to login with return redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/checkout" } as any });
    }
  }, [user, navigate]);

  // Sync authentic customer phone strictly from MySQL matching user's email
  useEffect(() => {
    if (!user?.email || user.email === "patron@jananiagro.com") return;
    fetch(`/api.php?action=get-user-phone&email=${encodeURIComponent(user.email)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.phone !== undefined && data?.phone !== null) {
          const p = String(data.phone).trim();
          if (p && !p.includes("8522901998")) {
            try {
              sessionStorage.setItem(`janani_sql_phone_${user.email}`, p);
              const u = JSON.parse(localStorage.getItem("janani_user") || "{}");
              if (u && u.phone !== p) {
                u.phone = p;
                localStorage.setItem("janani_user", JSON.stringify(u));
              }
            } catch (e) { }
          }
        }
      })
      .catch(() => { });
  }, [user?.email]);

  const [step, setStep] = useState<"checkout" | "success">("checkout");
  const [orderId, setOrderId] = useState("");
  const [placedOrderSummary, setPlacedOrderSummary] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Address Selection State
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);

  // 2. Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<CouponRule | null>(null);

  // Wallet credit (first-order reward) - balance and rules come from the server ledger
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [useWalletCredit, setUseWalletCredit] = useState(true);
  const refreshWallet = () => {
    getMyWallet().then((w) => setWallet(w));
  };
  useEffect(() => {
    if (user) refreshWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  // Restore applied coupon post-mount to eliminate React #418 hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("janani_applied_coupon");
      if (saved) {
        const parsed = JSON.parse(saved);
        const rawCoupon = parsed.coupon;
        if (rawCoupon) {
          const normalized = normalizeCouponData(rawCoupon);
          const minReq = Number(normalized.minCart ?? (normalized as any).min_cart ?? 0);
          if (minReq > 0 && subtotal > 0 && subtotal < minReq) {
            localStorage.removeItem("janani_applied_coupon");
            setAppliedCoupon(null);
            return;
          }
          const isFree =
            normalized.type === "free_shipping" ||
            Boolean(normalized.isFreeShipping) ||
            normalized.code?.toUpperCase().includes("FREESHIP") ||
            normalized.code?.toUpperCase().includes("FREEDEL");

          setAppliedCoupon({
            code: normalized.code,
            title: normalized.title || (isFree ? "Free Priority Delivery" : `${normalized.code} Promo`),
            description: normalized.description || "",
            type: isFree ? "free_delivery" : (normalized.type === "flat" ? "flat" : "percentage"),
            value: isFree ? 60 : normalized.discount,
            maxDiscount: normalized.maxDiscount || undefined,
            minSubtotal: minReq,
            expiry: normalized.expiryDate || "31 Dec 2026",
            badge: isFree ? "FREE DELIVERY" : normalized.type === "percentage" ? `${normalized.discount}% OFF` : `FLAT ₹${normalized.discount} OFF`,
          });
        }
      }
    } catch (e) { }
  }, [subtotal]);


  const handleApplyCoupon = (coupon: CouponRule | null) => {
    setAppliedCoupon(coupon);
    if (typeof window !== "undefined") {
      if (coupon) {
        localStorage.setItem(
          "janani_applied_coupon",
          JSON.stringify({
            code: coupon.code,
            coupon: {
              code: coupon.code,
              title: coupon.title,
              description: coupon.description,
              type: coupon.type === "free_delivery" ? "free_shipping" : coupon.type,
              discount: coupon.value,
              minCart: coupon.minSubtotal,
              maxDiscount: coupon.maxDiscount,
              expiryDate: coupon.expiry,
              isFreeShipping: coupon.type === "free_delivery",
              active: true,
            },
            discount: coupon.value,
            label: `${coupon.code} (${coupon.badge || coupon.title})`,
          })
        );
      } else {
        localStorage.removeItem("janani_applied_coupon");
      }
    }
  };

  useEffect(() => {
    if (appliedCoupon) {
      const minRequired = Number(appliedCoupon.minSubtotal ?? (appliedCoupon as any).minCart ?? (appliedCoupon as any).min_cart ?? 0);
      if (minRequired > 0 && subtotal < minRequired) {
        setAppliedCoupon(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("janani_applied_coupon");
        }
        toast.warning(`Coupon ${appliedCoupon.code} removed because cart total is below ₹${minRequired}.`);
      }
    }
  }, [subtotal, appliedCoupon]);

  // 3. Gift Card State
  // Gift cards are not offered: there is no real gift-card ledger to validate codes against.

  // 4. Order Notes State
  const [orderNotes, setOrderNotes] = useState("");

  // 5. Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");

  // Cart items list
  const cartItems = useMemo(() => {
    return parseCartItems(cart, allProducts);
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

  // Dynamic GST calculation based on each item's configured product gstRate (default 5%)
  const gstAmount = Number(
    cartItems.reduce((acc: number, item: any) => {
      const itemPrice = Number(item.price || item.product?.price || 0);
      const itemQty = Number(item.qty || item.quantity || 1);
      const rate = Number(item.product?.gstRate ?? item.product?.gst_rate ?? (item as any)?.gstRate ?? 5);
      const itemGst = (itemPrice * itemQty * rate) / 100;
      return acc + itemGst;
    }, 0).toFixed(2)
  );
  const cgst = Number((gstAmount / 2).toFixed(2));
  const sgst = Number((gstAmount - cgst).toFixed(2));

  // Net before gift card: Subtotal + GST + Shipping - Discount
  const grossPayable = Number(Math.max(0, subtotal + gstAmount + totalShippingCharges - couponDiscount).toFixed(2));

  // Wallet credit: one-time use on products value (after coupon, excl. delivery & GST) of ₹500+
  const walletRules = wallet?.rules || WALLET_RULES_DEFAULT;
  const productsValue = Number(Math.max(0, subtotal - couponDiscount).toFixed(2));
  const walletAvailable = wallet?.availableBalance || 0;
  const walletOrderEligible = productsValue >= walletRules.minOrderValue;
  const walletDeduction =
    useWalletCredit && walletOrderEligible && walletAvailable > 0 ? Number(Math.min(walletAvailable, productsValue).toFixed(2)) : 0;
  const payableAfterWallet = Number(Math.max(0, grossPayable - walletDeduction).toFixed(2));
  const firstOrderRewardPreview = wallet?.firstOrderRewardEligible && walletOrderEligible
    ? Number(((productsValue * walletRules.rewardPercent) / 100).toFixed(2))
    : 0;

  // Gift card deduction
  const giftCardDeduction = 0;

  const finalTotal = Number(Math.max(0, payableAfterWallet - giftCardDeduction).toFixed(2));

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

    const effectiveCustomerName = (selectedAddress.fullName || user?.name || "Valued Customer").trim();
    const effectiveCustomerEmail = (selectedAddress.email || user?.email || "").trim().toLowerCase();
    const effectiveCustomerPhone = (selectedAddress.phone || user?.phone || "").trim();

    setIsSubmitting(true);
    let liveOrderNumber = generateNextOrderNumber();
    try {
      liveOrderNumber = await getAuthoritativeNextOrderNumber();
    } catch (e) {
      console.warn("Failed to query live next order number, fallback to client sequence", e);
    }

    const pendingCheckout = {
      orderNumber: liveOrderNumber,
      customerName: effectiveCustomerName,
      customerEmail: effectiveCustomerEmail,
      customerPhone: effectiveCustomerPhone,
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
      gstAmount,
      cgst,
      sgst,
      shippingFee: standardShippingFee,
      deliveryFee: standardShippingFee,
      couponDiscount,
      discount: couponDiscount,
      coupon: appliedCoupon,
      couponCode: couponDiscount > 0 ? (appliedCoupon?.code || "") : "",
      walletDeduction,
      giftCardDeduction,
      finalTotal,
      total: finalTotal,
      totalSavings,
      paymentMethod,
      orderNotes,
      useWalletCredit: walletDeduction > 0,
    };

    if (paymentMethod === "cod") {
      setIsSubmitting(true);
      try {
        // The server prices the cart, validates the coupon and stock, and assigns the order number.
        const streetAddr = [selectedAddress.houseFlat, selectedAddress.street, selectedAddress.landmark].filter(Boolean).join(", ") || (selectedAddress as any).streetAddress || "";
        const created: any = await createOrder({
          items: cartItems.map((i: any) => ({
            productId: i.product.id,
            slug: i.product.slug,
            cartKey: i.cartKey,
            variantKey: i.variant?.id,
            variantId: i.variantId,
            name: i.product.name,
            price: i.price || i.product.price,
            quantity: i.qty || 1,
            image: i.variant?.image || i.product.image,
            gstRate: i.product?.gstRate ?? i.product?.gst_rate ?? 5,
          })),
          gstAmount,
          cgst,
          sgst,
          customer: {
            name: effectiveCustomerName,
            phone: effectiveCustomerPhone,
            email: effectiveCustomerEmail,
            streetAddress: streetAddr,
            landmark: selectedAddress.landmark || "",
            city: selectedAddress.city,
            state: selectedAddress.state || "",
            pincode: selectedAddress.pincode,
          },
          couponCode: couponDiscount > 0 ? (appliedCoupon?.code || "") : "",
          finalTotal,
          paymentMethod: "Cash on Delivery",
          deliverySlot: "Standard Delivery (2-3 Business Days)",
          orderNotes,
          useWalletCredit: walletDeduction > 0,
        });

        const orderNumber = created.number || created.orderNumber;
        const serverItems = Array.isArray(created.items) ? created.items : [];
        const deliveryAddress = {
          fullName: effectiveCustomerName,
          phone: effectiveCustomerPhone,
          streetAddress: streetAddr,
          city: selectedAddress.city,
          state: selectedAddress.state || "",
          pincode: selectedAddress.pincode,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("janani_latest_order", JSON.stringify({
            orderNumber,
            transactionId: "",
            paymentMethod: "Cash on Delivery",
            paymentStatus: created.payment_status || "Pending (COD)",
            amount: Number(created.total),
            deliveryDate: "2-3 Business Days",
            customerName: effectiveCustomerName,
            customerPhone: effectiveCustomerPhone,
            customerEmail: effectiveCustomerEmail,
            customerAddress: `${streetAddr}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`,
            items: serverItems.map((it: any) => ({
              product: { id: it.productId, name: `${it.name}${it.unit ? ` (${it.unit})` : ""}`, price: Number(it.price) || 0, image: it.image || pantryImage },
              qty: it.quantity || 1,
            })),
            subtotal: Number(created.subtotal),
            gstAmount: Number(created.gst_amount ?? created.gstAmount ?? 0),
            discount: Number(created.coupon_discount ?? 0),
            couponCode: created.coupon_code || "",
            couponDiscount: Number(created.coupon_discount ?? 0),
            walletDeduction: Number(created.wallet_deduction ?? created.walletDeduction ?? 0),
            walletReward: created.walletReward || null,
            deliveryFee: Number(created.delivery_fee ?? 0),
            finalTotal: Number(created.total),
            total: Number(created.total),
            slot: pendingCheckout.slot,
            deliverySlot: pendingCheckout.deliverySlot,
            address: deliveryAddress,
            timeline: created.timeline,
          }));
          const userIdentifier = effectiveCustomerEmail || user?.email || user?.phone;
          const existingUserOrders = loadCustomerOrders(userIdentifier);
          saveCustomerOrders(
            [
              {
                ...created,
                id: created.id || orderNumber,
                number: orderNumber,
                orderNumber,
                status: created.order_status || "Processing",
                date: created.order_date,
                isoDate: new Date().toISOString().split("T")[0]!,
                address: deliveryAddress,
                items: serverItems.map((it: any) => ({ ...it, qty: it.quantity })),
              },
              ...existingUserOrders.filter((o: any) => o.number !== orderNumber),
            ],
            userIdentifier
          );
          localStorage.removeItem("janani_pending_checkout");
        }

        clearCart();
        toast.success(`Cash on Delivery order ${orderNumber} placed successfully!`);
        if (created.walletReward?.amount) {
          toast.success(`🎁 ₹${created.walletReward.amount} wallet credit added for your next order (valid till ${created.walletReward.expiresOn}).`, { duration: 9000 });
        }
        navigate({ to: "/order-success" });
      } catch (err: any) {
        console.error("Failed to place Cash on Delivery order:", err);
        toast.error(err?.message || "Your order could not be placed. Please try again.", { duration: 8000 });
        if (err?.couponInvalid) {
          setAppliedCoupon(null);
          if (typeof window !== "undefined") localStorage.removeItem("janani_applied_coupon");
        }
        if (err?.walletInvalid) {
          setUseWalletCredit(false);
          refreshWallet();
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

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
              <Link to="/dashboard">
                View Orders in Dashboard <ArrowRight className="size-4 ml-1.5" />
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
          Add bio-fertilizers, growth promoters, or botanical shields to proceed to secure checkout.
        </p>
        <Button asChild variant="gold" size="lg" className="mt-6 rounded-full px-8 font-bold">
          <Link to="/products">Browse Agricultural Formulations</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] 3xl:max-w-[1720px] px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-6 lg:py-8 pb-32 lg:pb-12">
      {/* Header with Breadcrumb & Trust Ticker */}
      <div className="border-b border-border pb-3 sm:pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Link to="/" className="hover:text-brand-leaf transition">Home</Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-brand-leaf transition">Cart</Link>
            <span>/</span>
            <span className="text-brand-leaf font-bold">Checkout</span>
          </div>
          <h1 className="mt-1 font-display text-xl sm:text-3xl font-bold text-foreground">
            Secure Checkout
          </h1>
        </div>

        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-brand-leaf/30 bg-brand-leaf/10 px-3 py-1 text-xs font-semibold text-brand-leaf">
          <ShieldCheck className="size-3.5" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* Main Grid: Left Steps + Right Rail Summary */}
      <div className="mt-5 sm:mt-8 grid gap-5 sm:gap-8 lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px] 2xl:grid-cols-[1fr_460px] items-start">
        {/* Left Column: Sequential Checkout Steps */}
        <div className="space-y-4 sm:space-y-6">
          {/* USER PROFILE INFO BANNER */}
          <section className="rounded-2xl border border-brand-leaf/30 bg-brand-leaf/5 p-3 sm:p-4 flex items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid size-9 place-items-center rounded-full bg-brand-leaf text-white font-bold text-xs shrink-0 shadow-xs">
                {(user.name || "U")[0]?.toUpperCase() || <UserCheck className="size-4" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-foreground text-xs sm:text-sm truncate">
                    {user.name || "Valued Patron"}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-leaf/20 text-brand-leaf px-1.5 py-0.5 rounded border border-brand-leaf/30 shrink-0">
                    Verified Customer
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {user.email} {user.phone ? `· ${user.phone}` : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logoutUser();
                toast.info("Signed out. Redirecting to Sign In...");
                navigate({ to: "/login", search: { redirect: "/checkout" } as any });
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-destructive shrink-0 cursor-pointer px-2.5 py-1.5 rounded-xl hover:bg-destructive/10 transition"
              title="Sign out or switch account"
            >
              <LogOut className="size-3" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </section>

          {/* STEP 1: Delivery Address (CRUD) */}
          <section className="rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 sm:p-6 shadow-soft space-y-3.5">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <span className="grid size-6 sm:size-7 place-items-center rounded-full bg-brand-leaf text-white text-xs font-bold shadow-xs">
                  1
                </span>
                <h2 className="font-display text-base sm:text-lg font-bold text-foreground">
                  Delivery Address
                </h2>
              </div>
              {selectedAddress && (
                <span className="text-xs text-brand-leaf font-bold flex items-center gap-1">
                  ✓ Selected
                </span>
              )}
            </div>

            <AddressManager
              selectedAddressId={selectedAddress?.id || ""}
              onSelectAddress={(addr) => setSelectedAddress(addr)}
            />
          </section>

          {/* STEP 2: Order Notes & Harvest Instructions */}
          <section className="rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 sm:p-6 shadow-soft space-y-3.5">
            <div className="flex items-center gap-2 border-b border-border pb-2.5">
              <span className="grid size-6 sm:size-7 place-items-center rounded-full bg-brand-leaf text-white text-xs font-bold shadow-xs">
                2
              </span>
              <h2 className="font-display text-base sm:text-lg font-bold text-foreground">
                Special Delivery Instructions
              </h2>
            </div>

            <OrderNotesCard
              orderNotes={orderNotes}
              onChangeNotes={(notes) => setOrderNotes(notes)}
            />
          </section>
        </div>

        {/* Right Column: Sticky Rail Summary */}
        <div
          className="space-y-4 sticky-sidebar lg:sticky lg:top-24 self-start h-fit z-20"
          data-sticky-sidebar="true"
          style={{ position: "sticky", top: "5.5rem", alignSelf: "flex-start" }}
        >
          {/* Order Items Preview */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex justify-between">
              <span>Items in Basket</span>
              <span className="font-mono">{actualCartCount} Total</span>
            </h4>
            <div className="max-h-48 overflow-y-auto divide-y divide-border/60 pr-1 mt-2 space-y-1">
              {cartItems.map((item) => (
                <div key={item.cartKey} className="flex items-center gap-2.5 pt-2 text-xs">
                  <img
                    src={getProductImage(item.product.name || item.product.category, item.variant?.image || getProductVariantImage(item.product, item.variantId) || item.product.image)}
                    alt={`${item.product.name} - ${item.unit}`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = item.product.image || "/products/harit.jpg";
                    }}
                    className="size-10 rounded-lg object-contain border border-border shrink-0 p-0.5 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-foreground text-xs">
                      {formatProductName(item.product.name)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Qty: {item.qty} × ₹{item.price} • {item.unit}
                    </p>
                  </div>
                  <strong className="font-bold text-foreground text-xs font-mono">
                    ₹{item.lineTotal}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Apply Promo Coupons & Vouchers (Directly Above Payment Summary) */}
          <CouponSelector
            appliedCoupon={appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            subtotal={subtotal}
            shippingFee={standardShippingFee}
          />

          {/* First-order reward banner */}
          {wallet?.firstOrderRewardEligible && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950">
              {firstOrderRewardPreview > 0 ? (
                <p>
                  🎁 <strong>First order bonus:</strong> you will get <strong>₹{firstOrderRewardPreview}</strong> ({walletRules.rewardPercent}%) wallet credit
                  for your next order of ₹{walletRules.minOrderValue}+ — valid for {walletRules.validityDays} days.
                </p>
              ) : (
                <p>
                  🎁 Add <strong>₹{Number((walletRules.minOrderValue - productsValue).toFixed(2))}</strong> more (excluding delivery) to earn{" "}
                  {walletRules.rewardPercent}% wallet credit on your first order.
                </p>
              )}
            </div>
          )}

          {/* Wallet credit (one-time use) */}
          {walletAvailable > 0 && (
            walletOrderEligible ? (
              <WalletToggleCard
                walletBalance={walletAvailable}
                isWalletEnabled={useWalletCredit}
                onToggleWallet={setUseWalletCredit}
                maxDeductible={productsValue}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-xs text-muted-foreground">
                You have <strong className="text-foreground">₹{walletAvailable}</strong> wallet credit. It can be used on orders of ₹{walletRules.minOrderValue}+
                (excluding delivery) — add ₹{Number((walletRules.minOrderValue - productsValue).toFixed(2))} more to use it.
              </div>
            )
          )}
          {walletAvailable <= 0 && (wallet?.lockedBalance || 0) > 0 && (
            <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-xs text-muted-foreground">
              ₹{wallet?.lockedBalance} wallet credit is waiting for you — it unlocks once your first order is delivered.
            </div>
          )}

          {/* Payment & Tax Summary Card */}
          <PaymentSummaryCard
            cartItemsCount={actualCartCount}
            subtotal={subtotal}
            shippingFee={standardShippingFee}
            slotFee={slotFee}
            coupon={appliedCoupon}
            couponDiscount={couponDiscount}
            isWalletEnabled={walletDeduction > 0}
            walletDeduction={walletDeduction}
            appliedGiftCard={null}
            gstAmount={gstAmount}
            cgst={cgst}
            sgst={sgst}
            finalTotal={finalTotal}
            totalSavings={totalSavings}
            selectedAddress={selectedAddress}
            isSubmitting={isSubmitting}
            paymentMethod={paymentMethod}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>

      {/* Floating Bottom Action Bar for Mobile Viewports */}
      <MobileCheckoutBar
        finalTotal={finalTotal}
        subtotal={subtotal}
        gstAmount={gstAmount}
        shippingFee={standardShippingFee}
        slotFee={slotFee}
        couponDiscount={couponDiscount}
        walletDeduction={walletDeduction}
        giftCardDeduction={giftCardDeduction}
        isSubmitting={isSubmitting}
        paymentMethod={paymentMethod}
        onPlaceOrder={handlePlaceOrder}
        disabled={!selectedAddress || cartItems.length === 0}
      />
    </div>
  );
}
