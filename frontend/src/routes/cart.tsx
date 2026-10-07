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
  X,
  Clock,
  Calendar,
  Percent,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { products, type Product, getProductImage, pantryImage } from "@/lib/catalog";
import { ALL_PESTICIDES } from "@/lib/crop-protection-data";
import { getStorefrontCoupons, validateCoupon, type AdminCoupon } from "@/lib/api";
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
  const {
    cart,
    updateQuantity,
    removeFromCart,
    addToCart,
    subtotal,
    cartCount,
    user,
    products: storeProducts,
    wishlist,
    toggleWishlist,
  } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  // Dynamic Database Coupons State
  const [availableCoupons, setAvailableCoupons] = useState<AdminCoupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [isAllCouponsModalOpen, setIsAllCouponsModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [appliedCouponObj, setAppliedCouponObj] = useState<AdminCoupon | null>(null);
  const [isCouponsDropdownOpen, setIsCouponsDropdownOpen] = useState(false);

  // Fetch active database coupons on mount
  useEffect(() => {
    let active = true;
    getStorefrontCoupons()
      .then((data) => {
        if (active) {
          setAvailableCoupons(data || []);
          setLoadingCoupons(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to load storefront coupons:", err);
        if (active) setLoadingCoupons(false);
      });
    return () => {
      active = false;
    };
  }, []);


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
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("janani_saved_for_later", JSON.stringify(savedForLater));
    }
  }, [savedForLater]);

  const cartItems = useMemo(() => {
    const itemMap = new Map<number, { product: Product; qty: number }>();

    for (const [idStr, qtyRaw] of Object.entries(cart)) {
      const q = Number(qtyRaw) || 1;
      if (q <= 0) continue;

      let matchedProduct =
        allProducts.find((p) => Number(p.id) === Number(idStr) || String(p.id) === String(idStr) || p.slug === idStr) ||
        products.find((p) => Number(p.id) === Number(idStr) || String(p.id) === String(idStr) || p.slug === idStr);

      if (!matchedProduct) {
        const pesticide = ALL_PESTICIDES.find(
          (p) => p.id === idStr || String(p.catalogId) === idStr || p.slug === idStr
        );
        if (pesticide) {
          matchedProduct =
            allProducts.find((p) => Number(p.id) === Number(pesticide.catalogId) || p.slug === pesticide.slug) ||
            products.find((p) => Number(p.id) === Number(pesticide.catalogId) || p.slug === pesticide.slug);
        }
      }

      if (matchedProduct) {
        const prodId = Number(matchedProduct.id);
        const existing = itemMap.get(prodId);
        if (existing) {
          existing.qty += q;
        } else {
          itemMap.set(prodId, { product: matchedProduct, qty: q });
        }
      }
    }

    return Array.from(itemMap.values());
  }, [cart, allProducts]);

  // Actual total quantity of verified items in the basket
  const actualCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.qty, 0);
  }, [cartItems]);

  // Active items currently in the cart
  const activeCartIds = useMemo(() => new Set(Object.keys(cart).map(Number)), [cart]);

  // Combined Saved for Later and Liked (Wishlisted) products not currently in the active cart
  const savedForLaterProducts = useMemo(() => {
    const combinedIds = Array.from(new Set([...savedForLater, ...(wishlist || [])]));
    const availableIds = combinedIds.filter((id) => !activeCartIds.has(id));

    return availableIds
      .map((id) => {
        const catalogProd = allProducts.find((p) => p.id === id);
        if (catalogProd) return catalogProd;
        const pesticide = ALL_PESTICIDES.find((p) => p.catalogId === id);
        if (pesticide) {
          return {
            id: pesticide.catalogId,
            slug: pesticide.slug,
            name: pesticide.title,
            subtitle: pesticide.technicalName,
            category: pesticide.category,
            brand: pesticide.brand,
            price: pesticide.price,
            oldPrice: pesticide.oldPrice,
            discount: pesticide.discount,
            unit: "Unit",
            rating: pesticide.rating,
            reviews: pesticide.reviewsCount,
            inStock: pesticide.inStock,
            stockCount: 50,
            badge: pesticide.badge || "Popular",
            image: pesticide.image,
            description: pesticide.description,
            origin: "Janani Agro",
            dietaryTags: [],
            certifications: [],
            popularity: 90,
            isNew: false,
            crops: pesticide.crops,
            benefits: [],
            variants: [],
          } as Product;
        }
        return undefined;
      })
      .filter((p): p is Product => Boolean(p));
  }, [savedForLater, wishlist, activeCartIds, allProducts]);

  // Re-calculate applied coupon discount whenever subtotal changes
  useEffect(() => {
    if (!appliedCouponObj) return;

    if (appliedCouponObj.minCart > 0 && subtotal < appliedCouponObj.minCart) {
      setDiscount(0);
      setAppliedCoupon(null);
      setAppliedCouponObj(null);
      toast.warning(
        `Coupon ${appliedCouponObj.code} removed because cart subtotal is below the required ₹${appliedCouponObj.minCart}.`
      );
      return;
    }

    if (appliedCouponObj.type === "percentage") {
      const calculated = Math.round((subtotal * appliedCouponObj.discount) / 100);
      const capped = appliedCouponObj.maxDiscount > 0 ? Math.min(calculated, appliedCouponObj.maxDiscount) : calculated;
      setDiscount(capped);
      setAppliedCoupon(`${appliedCouponObj.code} (${appliedCouponObj.discount}% Off: -₹${capped})`);
    } else if (appliedCouponObj.type === "flat") {
      const capped = Math.min(appliedCouponObj.discount, subtotal);
      setDiscount(capped);
      setAppliedCoupon(`${appliedCouponObj.code} (Flat ₹${capped} Off)`);
    }
  }, [subtotal, appliedCouponObj]);

  // Shipping Calculation
  const freeShippingThreshold = 799;
  const isFreeDeliveryCoupon =
    appliedCouponObj?.type === "free_shipping" ||
    appliedCouponObj?.isFreeShipping ||
    appliedCoupon?.toLowerCase().includes("free delivery") ||
    appliedCoupon?.toLowerCase().includes("free shipping") ||
    appliedCoupon?.includes("FREEDEL") ||
    appliedCoupon?.includes("FREESHIP");
  const shippingFee =
    subtotal >= freeShippingThreshold || subtotal === 0 || isFreeDeliveryCoupon ? 0 : 60;

  const handleApplyCoupon = async (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    const code = (directCode || couponCode).trim().toUpperCase();

    if (!code) {
      toast.error("Please enter a valid coupon code");
      return;
    }

    const res = await validateCoupon(code, subtotal);
    if (!res.valid || !res.coupon) {
      toast.error(res.message);
      return;
    }

    const coupon = res.coupon;
    setAppliedCouponObj(coupon);
    setCouponCode(coupon.code);

    if (coupon.type === "free_shipping" || coupon.isFreeShipping) {
      setDiscount(0);
      setAppliedCoupon(`${coupon.code} (Free Farm Delivery Unlocked)`);
      toast.success(`Coupon ${coupon.code} applied! Free delivery unlocked.`);
    } else if (coupon.type === "percentage") {
      setDiscount(res.discount);
      setAppliedCoupon(`${coupon.code} (${coupon.discount}% Off: -₹${res.discount})`);
      toast.success(`Coupon ${coupon.code} applied! ₹${res.discount} discount saved.`);
    } else {
      setDiscount(res.discount);
      setAppliedCoupon(`${coupon.code} (Flat ₹${res.discount} Off)`);
      toast.success(`Coupon ${coupon.code} applied! Flat ₹${res.discount} deducted.`);
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setAppliedCouponObj(null);
    setCouponCode("");
    toast.info("Coupon removed.");
  };

  const formatCouponExpiry = (expiry?: string) => {
    if (!expiry) return "No Expiry";
    try {
      const d = new Date(expiry);
      if (isNaN(d.getTime())) return expiry;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return expiry;
    }
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
    if (wishlist.includes(productId)) {
      toggleWishlist(productId);
    }
    toast.success(`Moved ${productName} back to your active basket!`);
  };

  const handleRemoveFromSaved = (productId: number, productName?: string) => {
    setSavedForLater((prev) => prev.filter((id) => id !== productId));
    if (wishlist.includes(productId)) {
      toggleWishlist(productId);
    }
    toast.info(productName ? `Removed ${productName} from saved list.` : "Item removed from saved list.");
  };

  const finalTotal = Math.max(0, subtotal - discount + shippingFee);
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
            Shopping Cart ({actualCartCount} {actualCartCount === 1 ? "item" : "items"})
          </h1>
        </div>

        {actualCartCount > 0 && (
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
            <Link to="/products">← Continue Shopping</Link>
          </Button>
        )}
      </div>

      {actualCartCount > 0 ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] items-start">
          {/* Left Column: Cart Items List, Gift Wrap, Save for Later */}
          <div className="space-y-6">
            {/* Cart Items List */}
            <div className="divide-y divide-border rounded-[2rem] border border-border bg-card shadow-soft overflow-hidden">
              {cartItems.map(({ product, qty }) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 hover:bg-muted/20 transition"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={getProductImage(product.name || product.category, product.image)}
                      alt={product.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = pantryImage;
                      }}
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
                          src={getProductImage(prod.name || prod.category, prod.image)}
                          alt={prod.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = pantryImage;
                          }}
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
                          onClick={() => handleRemoveFromSaved(prod.id, prod.name)}
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
                  <span>Bag Subtotal ({actualCartCount} {actualCartCount === 1 ? "item" : "items"})</span>
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

                {/* Available Storefront Coupons Dropdown Accordion */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCouponsDropdownOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between p-3.5 text-left hover:bg-muted/40 transition cursor-pointer"
                  >
                    <span className="text-[12px] uppercase tracking-wider font-extrabold text-foreground flex items-center gap-2">
                      <Percent className="size-4 text-brand-leaf" /> Available Coupons ({availableCoupons.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        {isCouponsDropdownOpen ? "Hide Offers" : "View Offers"}
                      </span>
                      <ChevronDown
                        className={`size-4 text-emerald-700 dark:text-emerald-400 transition-transform duration-200 ${
                          isCouponsDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Dropdown Content */}
                  {isCouponsDropdownOpen && (
                    <div className="p-3.5 pt-0 border-t border-border/60 space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-end pt-2">
                        {availableCoupons.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsAllCouponsModalOpen(true)}
                            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            See All Offers ({availableCoupons.length}) <ArrowRight className="size-3" />
                          </button>
                        )}
                      </div>

                      {loadingCoupons ? (
                        <div className="py-4 text-center text-xs text-muted-foreground animate-pulse">
                          Loading available coupons...
                        </div>
                      ) : availableCoupons.length === 0 ? (
                        <div className="p-3 text-center rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
                          No promo coupons active right now. Check back soon!
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                          {availableCoupons.map((c) => {
                            const isApplied =
                              appliedCouponObj?.code === c.code ||
                              (appliedCoupon && appliedCoupon.toUpperCase().startsWith(c.code.toUpperCase()));
                            const isEligible = subtotal >= (c.minCart || 0);
                            const diffToUnlock = (c.minCart || 0) - subtotal;

                            let offerTitle = c.title;
                            if (!offerTitle || offerTitle.includes("Promo Offer") || offerTitle.includes("Special Offer")) {
                              if (c.type === "percentage") {
                                offerTitle = `${c.discount}% Instant Discount${c.maxDiscount ? ` (Up to ₹${c.maxDiscount})` : ""}`;
                              } else if (c.type === "flat") {
                                offerTitle = `Flat ₹${c.discount} Instant Discount`;
                              } else if (c.type === "free_shipping" || c.isFreeShipping) {
                                offerTitle = "Free Farm Delivery (Save ₹60)";
                              }
                            }

                            return (
                              <div
                                key={c.id || c.code}
                                className={`p-3 rounded-xl border transition-all relative overflow-hidden ${
                                  isApplied
                                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-xs"
                                    : isEligible
                                    ? "bg-background border-border hover:border-brand-leaf/50 hover:bg-brand-leaf/[0.02] shadow-xs"
                                    : "bg-muted/30 border-border/60 opacity-85"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-mono font-black text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg tracking-wider">
                                        {c.code}
                                      </span>
                                      {c.type === "percentage" && (
                                        <span className="text-[10px] font-bold bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded">
                                          {c.discount}% OFF
                                        </span>
                                      )}
                                      {c.type === "flat" && (
                                        <span className="text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 px-1.5 py-0.2 rounded">
                                          FLAT ₹{c.discount} OFF
                                        </span>
                                      )}
                                      {(c.type === "free_shipping" || c.isFreeShipping) && (
                                        <span className="text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 px-1.5 py-0.2 rounded">
                                          FREE SHIPPING
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="text-xs font-bold text-foreground leading-snug">
                                      {offerTitle}
                                    </h4>
                                    {c.description && (
                                      <p className="text-[11px] text-muted-foreground leading-tight">
                                        {c.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="shrink-0 pt-0.5">
                                    {isApplied ? (
                                      <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-xs">
                                        <Check className="size-3" /> Applied
                                      </span>
                                    ) : isEligible ? (
                                      <button
                                        type="button"
                                        onClick={() => handleApplyCoupon(undefined, c.code)}
                                        className="rounded-xl border border-emerald-600 bg-emerald-600/10 px-3 py-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition uppercase tracking-wider shadow-xs cursor-pointer"
                                      >
                                        Apply
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled
                                        className="rounded-xl border border-border bg-muted/60 px-2.5 py-1 text-[10px] font-bold text-muted-foreground cursor-not-allowed"
                                      >
                                        Locked
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Terms, Minimum Spend & Expiry Date */}
                                <div className="mt-2.5 pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                                  <div className="flex items-center gap-1.5 font-medium">
                                    {c.minCart > 0 ? (
                                      isEligible ? (
                                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                          <Check className="size-3 text-emerald-600" /> Min Purchase ₹{c.minCart} met
                                        </span>
                                      ) : (
                                        <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                                          <AlertCircle className="size-3" /> Add ₹{diffToUnlock} more (Min ₹{c.minCart})
                                        </span>
                                      )
                                    ) : (
                                      <span className="text-muted-foreground">
                                        No minimum spend
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-muted-foreground flex items-center gap-1 font-medium">
                                    <Clock className="size-3 text-muted-foreground/70" />
                                    <span>Expires: {formatCouponExpiry(c.expiryDate)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                asChild
                size="lg"
                variant="gold"
                className="w-full h-14 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition"
              >
                <Link to={user ? "/checkout" : "/login"} search={user ? undefined : ({ redirect: "/checkout" } as any)}>
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
        <div className="space-y-12">
          <div className="mx-auto max-w-md py-16 text-center space-y-4">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-primary/10 text-primary">
              <ShoppingBag className="size-10" />
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Your Basket is Currently Empty
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {savedForLaterProducts.length > 0
                ? "You have saved or liked harvests waiting below. Move them into your active basket or explore our full catalog."
                : "Looks like you haven't added any pure organic harvests yet. Explore our pantry staples, single-origin oils, and native millets to start filling your basket."}
            </p>
            <div className="pt-2">
              <Button asChild className="rounded-full px-8 font-bold shadow-md" size="lg">
                <Link to="/products">
                  Explore Farm Harvests <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {savedForLaterProducts.length > 0 && (
            <div className="max-w-4xl mx-auto pt-6 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <Bookmark className="size-5 text-brand-leaf" /> Saved for Later ({savedForLaterProducts.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedForLaterProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/30 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getProductImage(prod.name || prod.category, prod.image)}
                        alt={prod.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = pantryImage;
                        }}
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
                        className="h-8 rounded-xl text-xs font-bold hover:bg-primary hover:text-primary-foreground transition"
                      >
                        Move to Basket
                      </Button>
                      <button
                        onClick={() => handleRemoveFromSaved(prod.id, prod.name)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition"
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {recommendedAddons.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* All Available Coupons & Offers Modal */}
      {isAllCouponsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold">
                  <Percent className="size-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Available Coupons ({availableCoupons.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Store Offers & Verified Promotions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAllCouponsModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Quick manual search / apply form inside modal */}
            <div className="py-3.5 border-b border-border/60 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleApplyCoupon(e);
                  setIsAllCouponsModalOpen(false);
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon (e.g. JANANI10)"
                    className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-xs uppercase font-mono font-semibold outline-none focus:border-primary"
                  />
                </div>
                <Button type="submit" size="sm" className="h-10 text-xs font-bold px-4 rounded-xl bg-[#075B32] hover:bg-[#064B29] text-white cursor-pointer">
                  Apply
                </Button>
              </form>
            </div>

            {/* Scrollable Coupons List */}
            <div className="space-y-3 overflow-y-auto pr-1 py-4 flex-1">
              {availableCoupons.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No active coupons found.
                </div>
              ) : (
                availableCoupons.map((c) => {
                  const isApplied =
                    appliedCouponObj?.code === c.code ||
                    (appliedCoupon && appliedCoupon.toUpperCase().startsWith(c.code.toUpperCase()));
                  const isEligible = subtotal >= (c.minCart || 0);
                  const diffToUnlock = (c.minCart || 0) - subtotal;

                  let offerTitle = c.title;
                  if (!offerTitle || offerTitle.includes("Promo Offer") || offerTitle.includes("Special Offer")) {
                    if (c.type === "percentage") {
                      offerTitle = `${c.discount}% Off Storewide`;
                    } else if (c.type === "flat") {
                      offerTitle = `Flat ₹${c.discount} Instant Discount`;
                    } else if (c.type === "free_shipping" || c.isFreeShipping) {
                      offerTitle = "Free Priority Delivery";
                    }
                  }

                  let discountBadge = "";
                  if (c.type === "percentage") discountBadge = `${c.discount}% OFF`;
                  else if (c.type === "flat") discountBadge = `FLAT ₹${c.discount} OFF`;
                  else if (c.type === "free_shipping" || c.isFreeShipping) discountBadge = "0% OFF (FREE SHIPPING)";

                  return (
                    <div
                      key={c.id || c.code}
                      className={`p-4 rounded-2xl border transition-all relative ${
                        isApplied
                          ? "border-emerald-600 bg-emerald-500/10 ring-2 ring-emerald-500/20"
                          : isEligible
                          ? "bg-card border-border hover:border-emerald-500/50 hover:shadow-xs"
                          : "bg-muted/20 border-border/60 opacity-80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg tracking-wider">
                              {c.code}
                            </span>
                            {discountBadge && (
                              <span className="text-[10px] font-bold bg-emerald-600/10 text-emerald-700 px-2 py-0.5 rounded-md">
                                {discountBadge}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-foreground leading-snug">
                            {offerTitle}
                          </h4>
                          {c.description && (
                            <p className="text-xs text-muted-foreground leading-snug">
                              {c.description}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 pt-0.5">
                          {isApplied ? (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
                              <Check className="size-3.5" /> Applied
                            </span>
                          ) : isEligible ? (
                            <button
                              type="button"
                              onClick={() => {
                                handleApplyCoupon(undefined, c.code);
                                setIsAllCouponsModalOpen(false);
                              }}
                              className="rounded-xl bg-emerald-600/15 text-emerald-800 hover:bg-emerald-600 hover:text-white px-4 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer border border-emerald-600/30 uppercase tracking-wider"
                            >
                              Apply
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="rounded-xl border border-border bg-muted/60 px-3 py-1.5 text-xs font-bold text-muted-foreground cursor-not-allowed"
                            >
                              Locked
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Terms, Minimum Purchase Requirement & Expiry Date */}
                      <div className="mt-3 pt-2.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 font-medium">
                          {c.minCart > 0 ? (
                            isEligible ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <Check className="size-3.5 text-emerald-600" /> Min Purchase ₹{c.minCart} met
                              </span>
                            ) : (
                              <span className="text-amber-700 font-semibold flex items-center gap-1">
                                <AlertCircle className="size-3.5" /> Add ₹{diffToUnlock} more to unlock (Min ₹{c.minCart})
                              </span>
                            )
                          ) : (
                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                              <Check className="size-3.5" /> No minimum purchase required
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-muted-foreground font-medium">
                          <Clock className="size-3" />
                          <span>Expires: {c.expiryDate || "31 Dec 2026"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
