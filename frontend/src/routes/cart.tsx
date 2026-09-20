import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  Gift,
  Bookmark,
  Heart,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { products, type Product } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Cart & Organic Harvest Basket — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content: "Review your farm-fresh organic harvest order, apply coupons, add gift wrapping, and calculate shipping.",
      },
    ],
  }),
  component: CartPage,
});

export function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, addToCart, subtotal, cartCount, products: storeProducts } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Gift Wrap State
  const [isGiftWrap, setIsGiftWrap] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  // Save for Later State (Persisted in localStorage)
  const [savedForLater, setSavedForLater] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_saved_for_later");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        // ignore
      }
    }
    return [4, 8]; // Pre-seed 2 items for demonstration
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("janani_saved_for_later", JSON.stringify(savedForLater));
    }
  }, [savedForLater]);

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

  const savedForLaterProducts = useMemo(() => {
    return savedForLater
      .map((id) => allProducts.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [savedForLater, allProducts]);

  // Shipping Calculation
  const freeShippingThreshold = 799;
  const isFreeDeliveryCoupon = appliedCoupon?.includes("FREEDEL");
  const shippingFee =
    subtotal >= freeShippingThreshold || subtotal === 0 || isFreeDeliveryCoupon ? 0 : 60;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const giftWrapFee = isGiftWrap ? 49 : 0;

  // Coupon Engine
  const availableCoupons = [
    { code: "ORGANIC100", label: "₹100 Instant Discount (Min ₹599)", min: 599, val: 100 },
    { code: "HARVEST20", label: "20% OFF Everything", min: 499, val: "20%" },
    { code: "FREEDEL", label: "Free Farm Delivery (Any Order)", min: 0, val: "freedel" },
  ];

  const handleApplyCoupon = (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    const code = (directCode || couponCode).trim().toUpperCase();

    if (code === "ORGANIC100") {
      if (subtotal < 599) {
        toast.error("ORGANIC100 requires a minimum cart value of ₹599.");
        return;
      }
      setDiscount(100);
      setAppliedCoupon("ORGANIC100 (₹100 Off)");
      setCouponCode("ORGANIC100");
      toast.success("Coupon ORGANIC100 applied! ₹100 deducted.");
    } else if (code === "HARVEST20") {
      const discountVal = Math.round(subtotal * 0.2);
      setDiscount(discountVal);
      setAppliedCoupon(`HARVEST20 (20% Off: -₹${discountVal})`);
      setCouponCode("HARVEST20");
      toast.success("Coupon HARVEST20 applied! 20% discount saved.");
    } else if (code === "FREEDEL") {
      setDiscount(0);
      setAppliedCoupon("FREEDEL (Free Shipping)");
      setCouponCode("FREEDEL");
      toast.success("Coupon FREEDEL applied! Free shipping unlocked.");
    } else {
      toast.error("Invalid coupon code. Try ORGANIC100 or HARVEST20.");
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed.");
  };

  // Save for Later actions
  const handleSaveForLater = (productId: number, productName: string) => {
    removeFromCart(productId);
    setSavedForLater((prev) =>
      prev.includes(productId) ? prev : [productId, ...prev]
    );
    toast.info(`Moved ${productName} to Saved for Later.`);
  };

  const handleMoveBackToCart = (productId: number, productName: string) => {
    addToCart(productId, 1);
    setSavedForLater((prev) => prev.filter((id) => id !== productId));
    toast.success(`Moved ${productName} back to your active basket!`);
  };

  const handleRemoveFromSaved = (productId: number) => {
    setSavedForLater((prev) => prev.filter((id) => id !== productId));
    toast.info("Item removed from saved list.");
  };

  const finalTotal = Math.max(0, subtotal - discount + shippingFee + giftWrapFee);
  const totalSavings = cartItems.reduce(
    (sum, { product, qty }) => sum + (product.oldPrice - product.price) * qty,
    0
  ) + discount;

  // Recommended Add-ons
  const recommendedAddons = useMemo(() => {
    const inCartIds = cartItems.map((item) => item.product.id);
    return products.filter((p) => !inCartIds.includes(p.id)).slice(0, 4);
  }, [cartItems]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-leaf flex items-center gap-1.5">
            <ShoppingBag className="size-4 text-brand-leaf" /> Harvest Basket
          </span>
          <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold text-foreground">
            Shopping Cart ({cartCount} {cartCount === 1 ? "item" : "items"})
          </h1>
        </div>

        {cartItems.length > 0 && (
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
            <Link to="/products">← Continue Shopping</Link>
          </Button>
        )}
      </div>

      {cartItems.length > 0 ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] items-start">
          {/* Left Column: Free Shipping Bar, Cart Items List, Gift Wrap, Save for Later */}
          <div className="space-y-6">
            {/* Free Shipping Progress Bar */}
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-foreground">
                <span className="flex items-center gap-2">
                  <Truck className="size-4 text-brand-leaf" />
                  {amountToFreeShipping > 0 && !isFreeDeliveryCoupon ? (
                    <>
                      Add <strong className="text-primary font-mono font-bold">₹{amountToFreeShipping}</strong> more for <strong>FREE Farm Delivery!</strong>
                    </>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      🎉 Congratulations! You have unlocked FREE Express Delivery!
                    </span>
                  )}
                </span>
                <span className="text-xs font-bold text-muted-foreground font-mono">
                  {isFreeDeliveryCoupon ? 100 : progressPercent}%
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-brand-leaf transition-all duration-500 rounded-full"
                  style={{ width: `${isFreeDeliveryCoupon ? 100 : progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-border rounded-[2rem] border border-border bg-card shadow-soft overflow-hidden">
              {cartItems.map(({ product, qty }) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 hover:bg-muted/20 transition"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="size-20 sm:size-24 shrink-0 rounded-2xl object-cover border border-border"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-leaf">
                        {product.category}
                      </span>
                      <Link
                        to="/products/$slug"
                        params={{ slug: product.slug }}
                        className="block font-bold text-sm sm:text-base text-foreground hover:text-primary transition"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ₹{product.price} • {product.unit}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                        <Check className="size-3" /> In Stock • Fresh Farm Batch
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    {/* Quantity Selector */}
                    <div className="flex h-10 items-center rounded-xl border border-input bg-background p-0.5">
                      <button
                        onClick={() => updateQuantity(product.id, qty - 1)}
                        className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold font-mono">{qty}</span>
                      <button
                        onClick={() => updateQuantity(product.id, qty + 1)}
                        className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-20">
                      <strong className="block text-base font-bold font-mono text-foreground">
                        ₹{product.price * qty}
                      </strong>
                      <span className="text-[10px] text-muted-foreground line-through font-mono">
                        ₹{product.oldPrice * qty}
                      </span>
                    </div>

                    {/* Actions: Save for Later & Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSaveForLater(product.id, product.name)}
                        className="p-2 text-muted-foreground hover:text-brand-leaf transition rounded-lg hover:bg-muted"
                        title="Save for later"
                        aria-label="Save for later"
                      >
                        <Bookmark className="size-4" />
                      </button>

                      <button
                        onClick={() => {
                          removeFromCart(product.id);
                          toast.info(`Removed ${product.name} from cart`);
                        }}
                        className="p-2 text-muted-foreground hover:text-destructive transition rounded-lg hover:bg-muted"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Eco-Friendly Gift Wrap Box */}
            <div className="rounded-[2rem] border border-border bg-card p-5 shadow-soft space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGiftWrap}
                  onChange={(e) => setIsGiftWrap(e.target.checked)}
                  className="mt-1 size-4 accent-primary rounded cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Gift className="size-4 text-brand-gold" /> Eco-Friendly Jute Gift Wrap & Hand-Written Card
                    </span>
                    <span className="text-xs font-mono font-bold text-primary">+ ₹49</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Thoughtfully wrapped in biodegradable unbleached jute with an artisanal farm greeting note.
                  </p>
                </div>
              </label>

              {/* Gift Wrap Note Input (when checked) */}
              {isGiftWrap && (
                <div className="pt-3 border-t border-border space-y-2.5">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      value={giftRecipient}
                      onChange={(e) => setGiftRecipient(e.target.value)}
                      placeholder="e.g. Grandma, Dr. Ramesh Sharma"
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Custom Greeting Note (Handwritten)
                    </label>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      rows={2}
                      placeholder="e.g. Wishing you health, pure nutrition and wellness from Janani Agro!"
                      className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Saved For Later Section */}
            {savedForLaterProducts.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                    <Bookmark className="size-5 text-brand-leaf" /> Saved for Later ({savedForLaterProducts.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedForLaterProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="size-14 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to="/products/$slug"
                            params={{ slug: prod.slug }}
                            className="font-bold text-xs text-foreground hover:text-primary transition truncate block"
                          >
                            {prod.name}
                          </Link>
                          <span className="font-mono text-xs font-bold text-primary">
                            ₹{prod.price}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1.5 line-through">
                            ₹{prod.oldPrice}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveBackToCart(prod.id, prod.name)}
                          className="h-8 rounded-xl text-xs font-bold"
                        >
                          Move to Basket
                        </Button>
                        <button
                          onClick={() => handleRemoveFromSaved(prod.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive"
                          title="Remove from saved"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Price Summary Sidebar & Coupon Engine */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="rounded-[2.5rem] border border-border bg-card p-6 sm:p-7 shadow-soft space-y-6">
              <h2 className="text-lg font-bold font-display text-foreground border-b border-border pb-4">
                Price Summary
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Bag Subtotal ({cartCount} items)</span>
                  <span className="font-semibold font-mono text-foreground">₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Delivery Fee</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      <span className="font-mono">₹{shippingFee}</span>
                    )}
                  </span>
                </div>

                {isGiftWrap && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Eco Jute Gift Wrap</span>
                    <span className="font-mono font-bold text-foreground">+ ₹49</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Applied Coupon Savings</span>
                    <span className="font-mono">- ₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Tax Invoice (GST)</span>
                  <span className="text-xs text-brand-leaf font-medium">Included in MRP</span>
                </div>

                <div className="border-t border-border pt-4 flex items-baseline justify-between text-base font-bold text-foreground">
                  <span>Total Payable</span>
                  <span className="text-primary font-display text-3xl font-black font-mono">
                    ₹{finalTotal}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-center text-xs font-bold text-emerald-700">
                    🎉 You are saving a total of ₹{totalSavings} on this organic harvest!
                  </div>
                )}
              </div>

              {/* Coupon Code Section */}
              <div className="border-t border-border pt-5 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Tag className="size-3.5 text-brand-leaf" /> Apply Coupon / Voucher
                </span>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-semibold text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <Check className="size-4 text-emerald-600" /> {appliedCoupon}
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter voucher code"
                        className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-xs uppercase font-mono font-semibold outline-none focus:border-primary"
                      />
                    </div>
                    <Button type="submit" size="sm" variant="outline" className="h-10 text-xs font-bold px-4">
                      Apply
                    </Button>
                  </form>
                )}

                {/* Available Quick Coupon Pills */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Available Coupons:</span>
                  <div className="flex flex-col gap-1.5">
                    {availableCoupons.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => handleApplyCoupon(undefined, c.code)}
                        className="flex items-center justify-between p-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition text-left text-xs"
                      >
                        <span className="font-mono font-bold text-primary">{c.code}</span>
                        <span className="text-[10px] text-muted-foreground">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                asChild
                size="lg"
                variant="gold"
                className="w-full h-14 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition"
              >
                <Link to="/checkout">
                  Proceed to Checkout <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
                <ShieldCheck className="size-4 text-brand-leaf" />
                <span>100% Safe & Encrypted Razorpay Checkout</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div className="mx-auto max-w-md py-20 text-center space-y-4">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="size-10" />
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Your Basket is Currently Empty
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Looks like you haven't added any pure organic harvests yet. Explore our pantry staples,
            single-origin oils, and native millets to start filling your basket.
          </p>
          <div className="pt-2">
            <Button asChild className="rounded-full px-8 font-bold shadow-md" size="lg">
              <Link to="/products">
                Explore Farm Harvests <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Recommended Products (Pantry Add-ons) */}
      <section className="mt-20 border-t border-border pt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf flex items-center gap-1.5">
              <Sparkles className="size-4 text-brand-gold" /> Frequently Bought Together
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
              Complete Your Organic Kitchen
            </h3>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-bold">
            <Link to="/products">View All Products</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedAddons.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
