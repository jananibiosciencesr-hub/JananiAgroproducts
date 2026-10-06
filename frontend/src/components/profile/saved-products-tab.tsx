import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Check,
  Package,
  Plus,
  Minus,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { products, type Product, getProductImage, pantryImage } from "@/lib/catalog";
import { ALL_PESTICIDES } from "@/lib/crop-protection-data";
import { Button } from "@/components/ui/button";

export function SavedProductsTab() {
  const { wishlist, toggleWishlist, addToCart, moveToCart, clearWishlist, products: storeProducts } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  // Retrieve saved for later items from localStorage if any
  const [savedForLater, setSavedForLater] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_saved_for_later");
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return [];
  });

  // Combine wishlist and savedForLater IDs
  const combinedSavedIds = useMemo(() => {
    return Array.from(new Set([...wishlist, ...savedForLater]));
  }, [wishlist, savedForLater]);

  // Resolve product items
  const savedItems = useMemo(() => {
    return combinedSavedIds
      .map((id) => {
        const catalogProd = allProducts.find((p) => Number(p.id) === Number(id) || String(p.id) === String(id));
        if (catalogProd) return catalogProd;
        const fallbackProd = products.find((p) => Number(p.id) === Number(id) || String(p.id) === String(id));
        if (fallbackProd) return fallbackProd;
        const pesticide = ALL_PESTICIDES.find((p) => Number(p.catalogId) === Number(id));
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
            variants: []
          } as Product;
        }
        return undefined;
      })
      .filter((p): p is Product => Boolean(p));
  }, [combinedSavedIds, allProducts]);

  const inStockItems = useMemo(() => savedItems.filter((p) => p.inStock), [savedItems]);

  const handleRemove = (productId: number, productName: string) => {
    if (wishlist.includes(productId)) {
      toggleWishlist(productId);
    }
    setSavedForLater((prev) => {
      const updated = prev.filter((id) => id !== productId);
      if (typeof window !== "undefined") {
        localStorage.setItem("janani_saved_for_later", JSON.stringify(updated));
      }
      return updated;
    });
    toast.info(`Removed ${productName} from saved products`);
  };

  const handleMoveToBasket = (productId: number, productName: string) => {
    addToCart(productId, 1);
    toast.success(`Added ${productName} to your basket!`);
  };

  const handleMoveAllToCart = () => {
    if (inStockItems.length === 0) {
      toast.error("No items in your saved list are currently in stock.");
      return;
    }
    inStockItems.forEach((p) => {
      addToCart(p.id, 1);
    });
    toast.success(`Moved ${inStockItems.length} in-stock harvests to your shopping basket!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3.5">
          <div className="grid size-12 place-items-center rounded-2xl bg-brand-leaf/10 text-brand-leaf">
            <Bookmark className="size-6" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              Saved Products & Wishlist
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary font-mono">
                {savedItems.length} {savedItems.length === 1 ? "item" : "items"}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review your bookmarked biological crop inputs, pure Vedic staples, and quick-add them to basket.
            </p>
          </div>
        </div>

        {savedItems.length > 0 && inStockItems.length > 0 && (
          <Button
            onClick={handleMoveAllToCart}
            variant="gold"
            size="sm"
            className="rounded-xl font-bold text-xs shadow-sm self-start sm:self-center shrink-0"
          >
            <ShoppingBag className="size-3.5 mr-1.5" /> Move All In-Stock to Basket
          </Button>
        )}
      </div>

      {/* Saved Products Grid / Empty State */}
      {savedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {savedItems.map((prod) => {
            const discountPercent =
              prod.oldPrice && prod.oldPrice > prod.price
                ? Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100)
                : 0;

            return (
              <div
                key={prod.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-4 shadow-soft hover:border-primary/40 hover:shadow-md transition-all duration-300"
              >
                {/* Top: Product Image + Badges */}
                <div className="space-y-3">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-center p-3">
                    <img
                      src={getProductImage(prod.name || prod.category, prod.image)}
                      alt={prod.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = pantryImage;
                      }}
                      className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-105"
                    />

                    {/* Stock status badge */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      {prod.inStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 text-white px-2 py-0.5 text-[10px] font-bold shadow-xs">
                          <Check className="size-2.5" /> In Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-500/90 text-white px-2 py-0.5 text-[10px] font-bold shadow-xs">
                          Out of Stock
                        </span>
                      )}
                      {discountPercent > 0 && (
                        <span className="rounded-full bg-brand-gold text-forest px-2 py-0.5 text-[10px] font-bold shadow-xs">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(prod.id, prod.name)}
                      className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-background/90 text-muted-foreground hover:text-destructive hover:bg-card shadow-sm transition"
                      title="Remove from saved"
                      aria-label="Remove from saved products"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {/* Title and Category */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-leaf block">
                      {prod.category}
                    </span>
                    <Link
                      to="/products/$slug"
                      params={{ slug: prod.slug }}
                      className="font-bold text-sm text-foreground hover:text-primary transition line-clamp-1 block mt-0.5"
                    >
                      {prod.name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                      {prod.unit} • {prod.brand || "Janani Agro"}
                    </p>
                  </div>
                </div>

                {/* Bottom: Price + Add to Basket Button */}
                <div className="pt-3 mt-3 border-t border-border flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-base font-black text-foreground">
                        ₹{prod.price}
                      </span>
                      {prod.oldPrice && prod.oldPrice > prod.price && (
                        <span className="font-mono text-xs text-muted-foreground line-through">
                          ₹{prod.oldPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleMoveToBasket(prod.id, prod.name)}
                    disabled={!prod.inStock}
                    size="sm"
                    className="rounded-xl font-bold text-xs h-9 px-3 gap-1.5 shadow-xs"
                  >
                    <ShoppingBag className="size-3.5" /> Add to Basket
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Clean Empty State */
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-4">
          <div className="size-16 mx-auto rounded-3xl bg-brand-leaf/10 text-brand-leaf grid place-items-center">
            <Bookmark className="size-8" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-display font-bold text-lg text-foreground">
              No Saved Products Yet
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When browsing our organic harvests and bio crop solutions, click the bookmark or heart icon to save products for later.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild size="sm" className="rounded-full px-6 font-bold shadow-sm">
              <Link to="/products">
                Explore Farm Catalog <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
