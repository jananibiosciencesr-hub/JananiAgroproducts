import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Sparkles,
  MapPin,
  Leaf,
  Plus,
  Minus,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/store-provider";
import { type Product, type ProductVariant, getProductImage, pantryImage } from "@/lib/catalog";
import { toast } from "sonner";

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductQuickViewModal({ product, onClose }: ProductQuickViewModalProps) {
  if (!product) return null;

  return <QuickViewContent product={product} onClose={onClose} />;
}

function QuickViewContent({ product, onClose }: { product: Product; onClose: () => void }) {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart } = useStore();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants && product.variants.length > 0
      ? product.variants[0]!
      : {
          id: "std",
          label: product.unit,
          unit: product.unit,
          price: product.price,
          oldPrice: product.oldPrice,
          inStock: product.inStock,
        }
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<"overview" | "nutrition" | "origin">("overview");

  const isWishlisted = wishlist.includes(product.id);
  const discountPercent = Math.round(
    ((selectedVariant.oldPrice - selectedVariant.price) / selectedVariant.oldPrice) * 100
  );

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id);
    }
    toast.success(`Added ${quantity}x ${product.name} (${selectedVariant.label}) to cart!`, {
      description: "Enjoy fresh farm-direct pure organic delivery.",
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    onClose();
    navigate({ to: "/checkout" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-border bg-background shadow-2xl z-10 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 rounded-full bg-background/80 p-2 text-muted-foreground backdrop-blur-md hover:bg-muted hover:text-foreground transition"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Media Gallery */}
          <div className="relative flex flex-col justify-between bg-muted/40 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-border">
            {/* Top Badges */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Leaf className="size-3" />
                {product.badge ?? "100% Organic"}
              </span>
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3.5 text-brand-leaf" /> {product.origin}
              </span>
            </div>

            {/* Main Image */}
            <div className="my-6 relative aspect-square overflow-hidden rounded-3xl bg-secondary/80 flex items-center justify-center">
              <img
                src={getProductImage(product.name || product.category, product.image)}
                alt={product.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = pantryImage;
                }}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 rounded-full bg-destructive text-destructive-foreground px-2.5 py-1 text-xs font-bold shadow-md">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Farm Trust Bar */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-card/80 p-3 text-center border border-border">
              <div>
                <p className="text-[10px] text-muted-foreground">Certified</p>
                <p className="text-xs font-bold text-foreground">NPOP / FSSAI</p>
              </div>
              <div className="border-x border-border">
                <p className="text-[10px] text-muted-foreground">Purity</p>
                <p className="text-xs font-bold text-emerald-600">Lab Tested</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Traceable</p>
                <p className="text-xs font-bold text-brand-gold">Single Farm</p>
              </div>
            </div>
          </div>

          {/* Right: Product Options & Actions */}
          <div className="flex flex-col justify-between p-6 sm:p-8 space-y-6">
            <div>
              {/* Category & Brand */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-leaf">
                  {product.category}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {product.brand}
                </span>
              </div>

              {/* Name */}
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-foreground">
                {product.name}
              </h2>

              {/* Ratings */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < Math.floor(product.rating)
                          ? "fill-amber-500 text-amber-500"
                          : "text-muted stroke-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-foreground">{product.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({product.reviews} verified buyer reviews)
                </span>
              </div>

              {/* Price Calculation */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-foreground font-mono">
                  ₹{selectedVariant.price}
                </span>
                <span className="text-sm text-muted-foreground line-through font-mono">
                  ₹{selectedVariant.oldPrice}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  Save ₹{selectedVariant.oldPrice - selectedVariant.price} ({discountPercent}% OFF)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Inclusive of all taxes • Free shipping on orders over ₹499
              </p>

              {/* Multi-pack Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-5 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Select Pack Size / Quantity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition ${
                            isSelected
                              ? "bg-primary/10 border-primary text-primary font-bold shadow-sm"
                              : "bg-card border-border hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          <span className="text-xs font-bold text-foreground">{v.unit}</span>
                          <span className="text-[11px] font-mono text-primary">₹{v.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & Stock Status */}
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Quantity
                  </span>
                  <div className="flex items-center rounded-xl border border-input bg-card p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="size-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
                      disabled={quantity <= 1}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="size-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  {product.inStock ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock ({product.stockCount} left)
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-destructive">
                      Out of Stock (Pre-order Available)
                    </span>
                  )}
                </div>
              </div>

              {/* Description Tabs */}
              <div className="mt-6 border-t border-border pt-4">
                <div className="flex gap-4 border-b border-border pb-2 text-xs font-bold">
                  <button
                    onClick={() => setSelectedTab("overview")}
                    className={`pb-1 border-b-2 transition ${
                      selectedTab === "overview"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setSelectedTab("nutrition")}
                    className={`pb-1 border-b-2 transition ${
                      selectedTab === "nutrition"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Dietary Tags
                  </button>
                  <button
                    onClick={() => setSelectedTab("origin")}
                    className={`pb-1 border-b-2 transition ${
                      selectedTab === "origin"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Farm Story
                  </button>
                </div>

                <div className="mt-3 min-h-[50px] text-xs leading-relaxed text-muted-foreground">
                  {selectedTab === "overview" && <p>{product.description}</p>}
                  {selectedTab === "nutrition" && (
                    <div className="flex flex-wrap gap-1.5">
                      {product.dietaryTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-medium text-[11px]"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedTab === "origin" && (
                    <p>
                      Cultivated directly in {product.origin} following Vedic natural farming principles
                      without synthetic chemical inputs or hybrid tampering.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 h-12 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
                >
                  <ShoppingBag className="size-4" />
                  Add to Basket • ₹{selectedVariant.price * quantity}
                </Button>
                <Button
                  onClick={() => toggleWishlist(product.id)}
                  variant="outline"
                  className={`size-12 rounded-2xl flex items-center justify-center transition ${
                    isWishlisted ? "text-destructive border-destructive" : ""
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`size-5 ${isWishlisted ? "fill-destructive" : ""}`} />
                </Button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBuyNow}
                  className="text-primary font-bold hover:underline"
                >
                  Instant Checkout ⚡
                </Button>
                <Link
                  to="/products/$slug"
                  params={{ slug: product.slug }}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium"
                >
                  View Full Product Details <ExternalLink className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
