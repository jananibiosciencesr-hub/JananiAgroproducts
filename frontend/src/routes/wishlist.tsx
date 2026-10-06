import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useMemo } from "react";
import {
  ArrowRight,
  Heart,
  ShoppingBag,
  Trash2,
  Bell,
  BellRing,
  Share2,
  TrendingDown,
  ShieldAlert,
  Sparkles,
  Check,
  MapPin,
  X,
  MessageCircle,
  Copy,
  ChevronRight,
  PackageCheck,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { products, type Product, getProductImage, pantryImage } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Organic Wishlist & Saved Harvests — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content:
          "Manage your saved single-origin organic pantry essentials, track price drop alerts, and move items to cart.",
      },
    ],
  }),
  component: WishlistPage,
});

type SortOption = "recent" | "price_asc" | "price_desc" | "discount" | "in_stock";

export function WishlistPage() {
  const { user, wishlist, toggleWishlist, addToCart, clearWishlist, moveToCart, products: storeProducts } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  const [sort, setSort] = useState<SortOption>("recent");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [notifiedItems, setNotifiedItems] = useState<Record<number, boolean>>({});
  const [priceAlertActive, setPriceAlertActive] = useState<Record<number, boolean>>({
    6: true, // groundnut oil price alert active by default
    10: true, // foxtail millet
  });

  // If patron is not signed in, show clean Sign In prompt
  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-6 animate-in fade-in duration-300">
        <div className="size-20 mx-auto rounded-3xl bg-red-500/10 text-red-500 grid place-items-center shadow-inner">
          <Heart className="size-10 fill-red-500/20 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Sign In to Access Your Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Wishlist is only available for registered patrons. Please sign in or register with your email OTP to save and track your favourite crop solutions.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild variant="gold" size="default" className="rounded-full px-7 font-bold shadow-md">
            <Link to="/login">Sign In / Register with OTP</Link>
          </Button>
          <Button asChild variant="outline" size="default" className="rounded-full px-6 font-semibold">
            <Link to="/products">Explore Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Fetch product objects corresponding to wishlist IDs
  const rawSavedProducts = useMemo(() => {
    return wishlist
      .map((id) => allProducts.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [wishlist, allProducts]);

  // Filter & Sort
  const savedProducts = useMemo(() => {
    let list = inStockOnly ? rawSavedProducts.filter((p) => p.inStock) : [...rawSavedProducts];

    switch (sort) {
      case "price_asc":
        return list.sort((a, b) => a.price - b.price);
      case "price_desc":
        return list.sort((a, b) => b.price - a.price);
      case "discount":
        return list.sort((a, b) => b.discount - a.discount);
      case "in_stock":
        return list.sort((a, b) => (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0));
      case "recent":
      default:
        // Maintains reverse insertion order based on wishlist index
        return list;
    }
  }, [rawSavedProducts, inStockOnly, sort]);

  const totalValue = savedProducts.reduce((sum, p) => sum + p.price, 0);
  const totalSavings = savedProducts.reduce((sum, p) => sum + (p.oldPrice - p.price), 0);
  const inStockCount = savedProducts.filter((p) => p.inStock).length;

  const handleMoveAllToCart = () => {
    const inStockItems = savedProducts.filter((p) => p.inStock);
    if (inStockItems.length === 0) {
      toast.error("No items in your wishlist are currently in stock.");
      return;
    }

    inStockItems.forEach((p) => {
      moveToCart(p.id, 1);
    });

    toast.success(`Moved ${inStockItems.length} in-stock harvest items to your cart!`, {
      description: "Proceed to checkout whenever you are ready.",
    });
  };

  const handleTogglePriceAlert = (id: number, name: string) => {
    setPriceAlertActive((prev) => {
      const active = !prev[id];
      if (active) {
        toast.success(`Price drop alert activated for ${name}`, {
          description: "We will notify you instantly if this harvest drops in price.",
        });
      } else {
        toast.info(`Price drop alert turned off for ${name}`);
      }
      return { ...prev, [id]: active };
    });
  };

  const handleStockNotification = (id: number, name: string) => {
    setNotifiedItems((prev) => ({ ...prev, [id]: true }));
    toast.success(`Stock alert registered for ${name}!`, {
      description: "You'll receive an SMS/WhatsApp notification as soon as the fresh harvest batch is ready.",
    });
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Wishlist share link copied to clipboard!");
  };

  // Recommended staples for Empty State or Upselling
  const recommendedStaples = useMemo(() => {
    return products.filter((p) => !wishlist.includes(p.id)).slice(0, 4);
  }, [wishlist]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Wishlist Header & Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-leaf flex items-center gap-1.5">
            <Heart className="size-3.5 fill-current text-destructive" /> Personal Harvest Vault
          </span>
          <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold text-foreground">
            My Saved Wishlist
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {savedProducts.length} {savedProducts.length === 1 ? "harvest staple" : "harvest staples"} saved.{" "}
            {savedProducts.length > 0 && (
              <>
                Estimated Basket Value: <strong className="text-foreground font-mono">₹{totalValue}</strong>{" "}
                <span className="text-emerald-700 font-semibold">(Total Savings: ₹{totalSavings})</span>
              </>
            )}
          </p>
        </div>

        {savedProducts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Share Wishlist */}
            <Button
              onClick={() => setIsShareModalOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <Share2 className="size-3.5 text-brand-leaf" /> Share Wishlist
            </Button>

            {/* Clear All */}
            <Button
              onClick={clearWishlist}
              variant="ghost"
              size="sm"
              className="rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10"
            >
              Clear All
            </Button>

            {/* Move All to Cart */}
            <Button
              onClick={handleMoveAllToCart}
              variant="gold"
              size="sm"
              disabled={inStockCount === 0}
              className="rounded-xl text-xs font-bold gap-1.5 shadow-md hover:shadow-lg"
            >
              <ShoppingBag className="size-4" /> Move All to Cart ({inStockCount})
            </Button>
          </div>
        )}
      </div>

      {/* Filter & Sorting Controls */}
      {savedProducts.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-card border border-border p-3.5 px-5 shadow-xs">
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-semibold transition ${
                inStockOnly
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-700"
                  : "bg-background border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className={`size-2 rounded-full ${inStockOnly ? "bg-emerald-500" : "bg-muted-foreground"}`} />
              In Stock Only ({inStockCount})
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground font-semibold">Sort By:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-primary cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Biggest Discount (% Off)</option>
              <option value="in_stock">In Stock First</option>
            </select>
          </div>
        </div>
      )}

      {/* Wishlist Items Grid: 2 columns on mobile, 3/4 on desktop */}
      {savedProducts.length > 0 ? (
        <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
          {savedProducts.map((product) => {
            const hasPriceDrop = product.id % 2 === 0; // Simulate price drop on item 6, 10, etc.
            const isAlertActive = priceAlertActive[product.id];
            const isNotified = notifiedItems[product.id];

            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-none border border-gray-200 bg-white shadow-xs hover:shadow-md transition duration-300"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-white p-2.5 flex items-center justify-center rounded-none">
                    <Link
                      to="/products/$slug"
                      params={{ slug: product.slug }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <img
                        src={getProductImage(product.name || product.category, product.image)}
                        alt={product.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = pantryImage;
                        }}
                        className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Top Badges - Sharp corners */}
                    <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 items-start">
                      <span className="rounded-none bg-[#E53E3E] text-white px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                        SAVE {product.discount}%
                      </span>
                      {hasPriceDrop && (
                        <span className="rounded-none bg-[#075B32] text-white px-2 py-0.5 text-[9px] font-bold shadow-xs flex items-center gap-1">
                          <TrendingDown className="size-2.5" /> Price Drop
                        </span>
                      )}
                    </div>

                    {/* Delete From Wishlist Button */}
                    <button
                      onClick={() => {
                        toggleWishlist(product.id);
                        toast.info(`Removed ${product.name} from wishlist`);
                      }}
                      className="absolute right-2 top-2 z-10 size-7 sm:size-8 rounded-full bg-white/95 text-gray-700 backdrop-blur-md flex items-center justify-center hover:bg-red-500 hover:text-white transition shadow-xs"
                      title="Remove from wishlist"
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-3.5 sm:size-4" />
                    </button>

                    {/* Bottom-Center Pill - 🔥 BESTSELLER */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap pointer-events-none">
                      <span className="inline-flex items-center gap-1 bg-[#064A29]/95 text-white text-[8px] sm:text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider backdrop-blur-xs">
                        <span>🔥</span>
                        <span>{product.badge || "BESTSELLER"}</span>
                      </span>
                    </div>

                    {/* Out of Stock Overlay */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 text-center z-20">
                        <span className="rounded-none bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-2.5 sm:p-3 space-y-1 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#0B6B35] truncate">
                        {product.category}
                      </span>
                      <span className="text-[9px] text-gray-400 hidden xs:inline">
                        {product.unit}
                      </span>
                    </div>

                    <Link
                      to="/products/$slug"
                      params={{ slug: product.slug }}
                      className="block font-bold text-xs sm:text-sm text-[#075B32] hover:text-[#064A29] transition line-clamp-1 leading-snug"
                    >
                      {product.name}
                    </Link>

                    {/* Pricing: Rs. XXX  Rs. YYY */}
                    <div className="flex items-baseline gap-1.5 pt-0.5 flex-wrap">
                      <strong className="text-xs sm:text-base font-bold font-mono text-gray-900">
                        Rs. {product.price}
                      </strong>
                      <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">
                        Rs. {product.oldPrice}
                      </span>
                    </div>

                    {/* Alerts Toolbar */}
                    <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-xs">
                      {/* Price Drop Alert Trigger */}
                      <button
                        onClick={() => handleTogglePriceAlert(product.id, product.name)}
                        className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-medium transition ${
                          isAlertActive
                            ? "text-[#075B32] font-bold"
                            : "text-gray-400 hover:text-gray-700"
                        }`}
                        title="Get notified when price drops"
                      >
                        {isAlertActive ? (
                          <BellRing className="size-2.5 text-[#075B32] animate-pulse" />
                        ) : (
                          <Bell className="size-2.5" />
                        )}
                        <span className="truncate">{isAlertActive ? "Alert On" : "Track"}</span>
                      </button>

                      {/* Stock Status Badge */}
                      {product.inStock ? (
                        <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-500" /> In Stock
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-red-600">
                          Awaiting
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Bottom CTA Actions - Full width rounded-none */}
                <div className="p-2.5 sm:p-3 pt-0">
                  {product.inStock ? (
                    <button
                      onClick={() => moveToCart(product.id, 1)}
                      className="w-full bg-[#075B32] hover:bg-[#064A29] text-white text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 rounded-none uppercase tracking-wider transition text-center shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
                    >
                      <ShoppingBag className="size-3.5 sm:size-4" /> Move to Cart
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStockNotification(product.id, product.name)}
                      disabled={isNotified}
                      className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 rounded-none uppercase tracking-wider transition text-center shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Bell className="size-3.5 sm:size-4 text-[#E7A91A]" />
                      <span>{isNotified ? "Subscribed ✓" : "Notify Me"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Responsive Empty State */
        <div className="mx-auto max-w-lg py-16 text-center space-y-4">
          <div className="mx-auto grid size-24 place-items-center rounded-full bg-primary/10 text-primary shadow-inner">
            <Heart className="size-12 stroke-1" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Your Harvest Wishlist is Empty
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            You haven't saved any organic pantry staples yet. Tap the heart icon on any cold-pressed oil,
            millet, or Vedic spice to track price drops and save items for your next harvest order.
          </p>
          <div className="pt-2">
            <Button asChild className="rounded-full px-8 font-bold shadow-md" size="lg">
              <Link to="/products">
                Explore Farm Pantry <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Curated Recommendations for You Section */}
      <section className="mt-20 border-t border-border pt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf flex items-center gap-1.5">
              <Sparkles className="size-4 text-brand-gold" /> Recommended For Your Pantry
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
              Top Rated Organic Staples
            </h3>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-bold">
            <Link to="/products">View All Products</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {recommendedStaples.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Share Wishlist Dialog Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-background border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Share2 className="size-5 text-brand-leaf" />
                <h3 className="font-display font-bold text-lg">Share Your Harvest Wishlist</h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="rounded-full p-1 hover:bg-muted text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Share your curated collection of {savedProducts.length} organic staples with your family or friends.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/?text=Check%20out%20my%20Janani%20Agro%20Organic%20Pantry%20Wishlist:%20${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 transition text-center"
              >
                <MessageCircle className="size-6 text-emerald-600 mb-1" />
                <span className="text-xs font-bold">WhatsApp</span>
              </a>

              <button
                onClick={handleCopyShareLink}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition text-center"
              >
                <Copy className="size-6 text-primary mb-1" />
                <span className="text-xs font-bold">Copy Link</span>
              </button>
            </div>

            <div className="pt-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="w-full h-9 rounded-xl border border-input bg-muted px-3 text-xs font-mono text-muted-foreground outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
