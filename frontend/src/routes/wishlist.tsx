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
import { products, type Product } from "@/lib/catalog";
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
  const { wishlist, toggleWishlist, addToCart, clearWishlist, moveToCart } = useStore();

  const [sort, setSort] = useState<SortOption>("recent");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [notifiedItems, setNotifiedItems] = useState<Record<number, boolean>>({});
  const [priceAlertActive, setPriceAlertActive] = useState<Record<number, boolean>>({
    6: true, // groundnut oil price alert active by default
    10: true, // foxtail millet
  });

  // Fetch product objects corresponding to wishlist IDs
  const rawSavedProducts = useMemo(() => {
    return wishlist
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [wishlist]);

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

      {/* Wishlist Items Grid */}
      {savedProducts.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {savedProducts.map((product) => {
            const hasPriceDrop = product.id % 2 === 0; // Simulate price drop on item 6, 10, etc.
            const isAlertActive = priceAlertActive[product.id];
            const isNotified = notifiedItems[product.id];

            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-luxe"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    {/* Top Badges */}
                    <div className="absolute left-3 top-3 flex flex-col gap-1 items-start">
                      <span className="rounded-full bg-cream/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-xs">
                        {product.badge ?? "100% Organic"}
                      </span>
                      {hasPriceDrop && (
                        <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-xs flex items-center gap-1">
                          <TrendingDown className="size-3" /> Price Dropped ₹{Math.round(product.price * 0.1)}
                        </span>
                      )}
                    </div>

                    {/* Delete From Wishlist Button */}
                    <button
                      onClick={() => {
                        toggleWishlist(product.id);
                        toast.info(`Removed ${product.name} from wishlist`);
                      }}
                      className="absolute right-3 top-3 size-8 rounded-full bg-background/80 text-muted-foreground backdrop-blur-md flex items-center justify-center hover:bg-destructive hover:text-white transition shadow-sm"
                      title="Remove from wishlist"
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </button>

                    {/* Out of Stock Overlay */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 text-center">
                        <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-destructive">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-leaf truncate">
                        {product.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {product.brand.split(" ")[1]}
                      </span>
                    </div>

                    <Link
                      to="/products/$slug"
                      params={{ slug: product.slug }}
                      className="block font-display font-bold text-lg text-foreground hover:text-primary transition line-clamp-1"
                    >
                      {product.name}
                    </Link>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <strong className="text-xl font-bold font-mono text-foreground">
                        ₹{product.price}
                      </strong>
                      <span className="text-xs text-muted-foreground line-through font-mono">
                        ₹{product.oldPrice}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">
                        {product.discount}% OFF
                      </span>
                    </div>
                    <span className="block text-[11px] text-muted-foreground">
                      Pack Size: {product.unit}
                    </span>

                    {/* Alerts Toolbar */}
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                      {/* Price Drop Alert Trigger */}
                      <button
                        onClick={() => handleTogglePriceAlert(product.id, product.name)}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium transition ${
                          isAlertActive
                            ? "text-brand-leaf font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Get notified when price drops"
                      >
                        {isAlertActive ? (
                          <BellRing className="size-3 text-brand-leaf animate-pulse" />
                        ) : (
                          <Bell className="size-3" />
                        )}
                        {isAlertActive ? "Price Alert On" : "Track Price"}
                      </button>

                      {/* Stock Status Badge */}
                      {product.inStock ? (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-500" /> In Stock
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-destructive">
                          Batch Awaiting
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Bottom CTA Actions */}
                <div className="p-5 pt-0">
                  {product.inStock ? (
                    <Button
                      onClick={() => moveToCart(product.id, 1)}
                      className="w-full h-11 rounded-2xl text-xs font-bold gap-2 shadow-xs hover:shadow-md transition"
                    >
                      <ShoppingBag className="size-4" /> Move to Basket
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleStockNotification(product.id, product.name)}
                      disabled={isNotified}
                      className="w-full h-11 rounded-2xl text-xs font-bold gap-2 border-dashed"
                    >
                      <Bell className="size-4 text-brand-gold" />
                      {isNotified ? "Alert Subscribed ✓" : "Notify When In Stock"}
                    </Button>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
