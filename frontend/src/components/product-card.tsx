import React from "react";
import { Heart, ShoppingBag, Star, Eye, MapPin, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/store-provider";
import type { Product } from "@/lib/catalog";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  list?: boolean;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, list = false, onQuickView }: ProductCardProps) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) {
      toast.error(`${product.name} is currently out of stock.`);
      return;
    }
    addToCart(product.id);
    toast.success(`Added ${product.name} to cart!`, {
      description: `₹${product.price} • ${product.unit}`,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-luxe flex flex-col ${
        list ? "sm:grid sm:grid-cols-[240px_1fr]" : ""
      }`}
    >
      {/* Media / Image Container */}
      <div
        className={`relative overflow-hidden bg-secondary ${
          list ? "aspect-[4/3] sm:aspect-auto" : "aspect-square"
        }`}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={700}
          height={700}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1 items-start">
          <span className="rounded-full bg-cream/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md">
            {product.badge ?? "100% Organic"}
          </span>
          {product.discount > 0 && (
            <span className="rounded-full bg-destructive text-destructive-foreground px-2 py-0.5 text-[10px] font-bold shadow-sm">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Top Right Actions */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {/* Wishlist Button */}
          <Button
            variant="glass"
            size="icon"
            className="size-8 rounded-full shadow-sm"
            onClick={handleWishlist}
            aria-label={`Save ${product.name}`}
          >
            <Heart
              className={`size-4 transition ${
                isWishlisted ? "fill-destructive text-destructive scale-110" : "text-foreground"
              }`}
            />
          </Button>

          {/* Quick View Button */}
          {onQuickView && (
            <Button
              variant="glass"
              size="icon"
              className="size-8 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition duration-300"
              onClick={handleQuickViewClick}
              aria-label={`Quick preview ${product.name}`}
            >
              <Eye className="size-4 text-foreground" />
            </Button>
          )}
        </div>

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 text-center">
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-destructive">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5 justify-between">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-leaf truncate">
              {product.category}
            </p>
            {product.origin && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                <MapPin className="size-2.5 text-muted-foreground" /> {product.origin.split(" ")[0]}
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="mt-1.5 block font-display text-lg sm:text-xl font-bold text-foreground transition hover:text-primary line-clamp-1"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="flex items-center text-brand-gold">
              <Star className="size-3.5 fill-current" />
              <span className="ml-1 text-xs font-bold text-foreground">{product.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
            {product.inStock && (
              <span className="ml-auto text-[10px] font-semibold text-emerald-600">
                • In Stock
              </span>
            )}
          </div>

          {/* List View Description & Dietary Tags */}
          {list && (
            <div className="mt-3 space-y-2">
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {product.description}
              </p>
              {product.dietaryTags && product.dietaryTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.dietaryTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 flex items-end justify-between gap-3 pt-4 border-t border-border/60">
          <div>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-lg font-bold text-foreground font-mono">
                ₹{product.price}
              </strong>
              {product.oldPrice > product.price && (
                <span className="text-xs text-muted-foreground line-through font-mono">
                  ₹{product.oldPrice}
                </span>
              )}
            </div>
            <span className="block text-[11px] text-muted-foreground font-medium">
              {product.unit}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onQuickView && (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex h-9 rounded-xl text-xs font-semibold"
                onClick={handleQuickViewClick}
              >
                Quick View
              </Button>
            )}
            <Button
              size="icon"
              className="size-9 rounded-xl shadow-sm"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}