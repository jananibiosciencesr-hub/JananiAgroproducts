import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { generateNextOrderNumber, createOrder, normalizeCouponData } from "@/lib/api";
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

  const [step, setStep] = useState<"checkout" | "success">("checkout");
  const [orderId, setOrderId] = useState("");
  const [placedOrderSummary, setPlacedOrderSummary] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Address Selection State
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);

  // 2. Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<CouponRule | null>(null);
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
    } catch (e) {}
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
  const [appliedGiftCard, setAppliedGiftCard] = useState<AppliedGiftCard | null>(null);

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

  // GST 5% (2.5% CGST + 2.5% SGST) added on top of items subtotal
  const gstAmount = Math.round(subtotal * 0.05);
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;

  // Net before gift card: Subtotal + GST + Shipping - Discount
  const grossPayable = Math.max(0, subtotal + gstAmount + totalShippingCharges - couponDiscount);
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
      orderNumber: generateNextOrderNumber(),
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
      gstAmount,
      cgst,
      sgst,
      shippingFee: standardShippingFee,
      slotFee: 0,
      couponDiscount,
      walletDeduction: 0,
      finalTotal,
      totalSavings,
      paymentMethod,
    };

    if (paymentMethod === "cod") {
      setIsSubmitting(true);
      try {
        const orderNumber = pendingCheckout.orderNumber;
        const nowFormatted = new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const streetAddr = selectedAddress
          ? [selectedAddress.houseFlat, selectedAddress.street, selectedAddress.landmark].filter(Boolean).join(", ") || "Registered Delivery Address"
          : "Registered Delivery Address";

        const confirmedOrder = {
          orderNumber,
          transactionId: `COD-${Date.now().toString().slice(-6)}`,
          paymentMethod: "Cash on Delivery",
          paymentStatus: "Pending (COD)",
          amount: finalTotal,
          deliveryDate: "2-3 Business Days",
          customerName: pendingCheckout.customerName,
          customerPhone: pendingCheckout.customerPhone,
          customerEmail: pendingCheckout.customerEmail,
          customerAddress: `${streetAddr}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`,
          items: cartItems.map((item: any) => ({
            product: {
              id: item.product.id,
              name: item.product.name,
              price: item.price || item.product.price,
              image: item.product.image || pantryImage,
            },
            qty: item.qty || 1,
          })),
          subtotal,
          discount: couponDiscount,
          couponCode: appliedCoupon?.code || "",
          couponDiscount,
          walletDeduction: 0,
          deliveryFee: standardShippingFee,
          finalTotal,
          total: finalTotal,
          slot: pendingCheckout.slot,
          deliverySlot: pendingCheckout.deliverySlot,
          address: {
            fullName: pendingCheckout.customerName,
            phone: pendingCheckout.customerPhone,
            streetAddress: streetAddr,
            city: selectedAddress.city,
            state: selectedAddress.state || "Gujarat",
            pincode: selectedAddress.pincode,
          },
        };

        const newCustomerOrder = {
          id: `ord-${Date.now()}`,
          number: orderNumber,
          orderNumber,
          customerEmail: user?.email || pendingCheckout.customerEmail || "",
          customerPhone: user?.phone || pendingCheckout.customerPhone || "",
          date: nowFormatted,
          isoDate: new Date().toISOString().split("T")[0]!,
          status: "Processing" as const,
          courier: "Delhivery Air Express & Janani Direct",
          awb: `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          expectedDelivery: "2-3 Business Days",
          deliverySlot: "Standard Delivery (2-3 Business Days)",
          subtotal,
          discount: couponDiscount,
          couponCode: appliedCoupon?.code || "",
          couponDiscount,
          walletDeduction: 0,
          deliveryFee: standardShippingFee,
          total: finalTotal,
          finalTotal,
          paymentMethod: "Cash on Delivery",
          paymentStatus: "Pending (COD)",
          transactionId: `COD-${Date.now().toString().slice(-6)}`,
          address: {
            fullName: pendingCheckout.customerName,
            phone: pendingCheckout.customerPhone,
            streetAddress: streetAddr,
            city: selectedAddress.city,
            state: selectedAddress.state || "Gujarat",
            pincode: selectedAddress.pincode,
          },
          items: cartItems.map((item: any) => ({
            productId: item.product.id,
            name: item.product.name,
            variant: item.variant?.name || "Standard Pack",
            quantity: item.qty || 1,
            qty: item.qty || 1,
            price: item.price || item.product.price,
            image: item.product.image || pantryImage,
          })),
          timeline: [
            {
              title: "Order Placed (Cash on Delivery)",
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
              time: "2-3 Business Days",
              location: "Local Delivery Hub",
              done: false,
              current: false,
            },
            {
              title: "Delivered to Recipient (Collect Cash)",
              time: "Upon Arrival",
              location: "Customer Doorstep",
              done: false,
              current: false,
            },
          ],
        };

        const resolvedEmail =
          user?.email ||
          pendingCheckout.customerEmail ||
          selectedAddress.email ||
          (() => {
            if (typeof window !== "undefined") {
              try {
                const u = JSON.parse(localStorage.getItem("janani_user") || "{}");
                if (u?.email) return u.email;
                const au = JSON.parse(localStorage.getItem("janani_auth_user") || "{}");
                if (au?.email) return au.email;
              } catch (e) {}
            }
            return "";
          })() ||
          "patron@jananiagro.com";

        if (typeof window !== "undefined") {
          localStorage.setItem("janani_latest_order", JSON.stringify({
            ...confirmedOrder,
            customerEmail: resolvedEmail,
          }));
          const userIdentifier = resolvedEmail || user?.email || user?.phone;
          const existingUserOrders = loadCustomerOrders(userIdentifier);
          const updatedOrders = [newCustomerOrder, ...existingUserOrders.filter((o: any) => o.number !== orderNumber && o.id !== newCustomerOrder.id)];
          saveCustomerOrders(updatedOrders, userIdentifier);
          localStorage.removeItem("janani_pending_checkout");
        }

        try {
          await createOrder({
            id: orderNumber,
            number: orderNumber,
            orderNumber,
            items: cartItems.map((i: any) => ({
              productId: i.product.id,
              name: i.product.name,
              price: i.price || i.product.price,
              quantity: i.qty || 1,
              image: i.product.image || pantryImage,
            })),
            customer: {
              name: pendingCheckout.customerName,
              firstName: pendingCheckout.customerName.split(" ")[0] || "Valued",
              lastName: pendingCheckout.customerName.split(" ").slice(1).join(" ") || "Patron",
              phone: user?.phone || pendingCheckout.customerPhone,
              email: resolvedEmail,
              address: streetAddr,
              streetAddress: streetAddr,
              city: selectedAddress.city,
              state: selectedAddress.state || "Gujarat",
              pincode: selectedAddress.pincode,
            },
            subtotal,
            gstAmount,
            cgst,
            sgst,
            discount: couponDiscount,
            couponCode: appliedCoupon?.code || "",
            couponDiscount,
            walletDeduction: 0,
            deliveryFee: standardShippingFee,
            shippingFee: standardShippingFee,
            finalTotal,
            total: finalTotal,
            paymentMethod: "Cash on Delivery",
            paymentStatus: "Pending (COD)",
            transactionId: `COD-${Date.now().toString().slice(-6)}`,
            deliverySlot: "Standard Delivery (2-3 Business Days)",
            expectedDelivery: "2-3 Business Days",
            timeline: newCustomerOrder.timeline,
          });
        } catch (apiErr) {
          console.warn("Backend order creation sync note:", apiErr);
        }

        try {
          fetch("/api.php?action=send-order-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            keepalive: true,
            body: JSON.stringify({
              number: orderNumber,
              orderNumber,
              customer_name: pendingCheckout.customerName,
              customerName: pendingCheckout.customerName,
              customer_email: resolvedEmail,
              customerEmail: resolvedEmail,
              customer_phone: user?.phone || pendingCheckout.customerPhone,
              customerPhone: user?.phone || pendingCheckout.customerPhone,
              shipping_address: {
                streetAddress: streetAddr,
                city: selectedAddress.city,
                state: selectedAddress.state || "Gujarat",
                pincode: selectedAddress.pincode,
              },
              items: cartItems.map((i: any) => ({
                name: i.product?.name || i.name,
                price: i.price || i.product?.price,
                quantity: i.qty || 1,
              })),
              subtotal,
              gstAmount,
              delivery_fee: standardShippingFee,
              discount: couponDiscount,
              total: finalTotal,
              finalTotal,
              payment_method: "Cash on Delivery",
            }),
          }).catch(() => {});
          sessionStorage.setItem(`janani_invoice_dispatched_${orderNumber}`, "true");
        } catch (e) {}

        clearCart();
        toast.success(`Cash on Delivery order ${orderNumber} placed successfully!`);
        navigate({ to: "/order-success" });
      } catch (err) {
        console.error("Failed to place Cash on Delivery order:", err);
        toast.error("An error occurred while placing order. Please try again.");
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
