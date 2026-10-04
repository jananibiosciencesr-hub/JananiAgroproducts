import React from "react";
import { Heart, ShoppingBag, Star, Eye, MapPin, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/store-provider";
import { type Product, getProductImage, pantryImage } from "@/lib/catalog";
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

  const discountVal =
    product.discount > 0
      ? product.discount
      : product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 10;

  return (
    <article
      className={`group relative overflow-hidden rounded-none border border-gray-200 bg-white shadow-xs transition duration-300 hover:shadow-md flex flex-col justify-between ${
        list ? "sm:grid sm:grid-cols-[220px_1fr]" : ""
      }`}
    >
      {/* Media / Image Container */}
      <div
        className={`relative overflow-hidden bg-white ${
          list ? "aspect-[4/3] sm:aspect-auto" : "aspect-square"
        }`}
      >
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="relative block w-full h-full p-2.5 sm:p-3 overflow-hidden flex items-center justify-center bg-white"
        >
          <img
            src={getProductImage(product.name || product.category, product.image)}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = pantryImage;
            }}
            width={700}
            height={700}
            className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Top-Left Red Discount Badge - Sharp rectangular corners (rounded-none) */}
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-[#E53E3E] text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-none uppercase tracking-wider shadow-xs">
            SAVE {discountVal}%
          </span>
        </div>

        {/* Top-Right Circular Wishlist Button */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={`Save ${product.name}`}
            className={`size-7 sm:size-8 rounded-full shadow-xs flex items-center justify-center transition backdrop-blur-xs ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/95 text-gray-700 hover:text-red-500 hover:bg-white"
            }`}
          >
            <Heart
              className={`size-3.5 sm:size-4 transition ${
                isWishlisted ? "fill-current text-white scale-110" : "text-gray-700"
              }`}
            />
          </button>

          {/* Quick View Button */}
          {onQuickView && (
            <button
              type="button"
              onClick={handleQuickViewClick}
              aria-label={`Quick preview ${product.name}`}
              className="size-7 sm:size-8 rounded-full bg-white/95 text-gray-700 shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white hover:text-[#075B32]"
            >
              <Eye className="size-3.5 sm:size-4" />
            </button>
          )}
        </div>

        {/* Bottom Center Pill on Image - 🔥 BESTSELLER */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-[#064A29]/95 text-white text-[8px] sm:text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider backdrop-blur-xs">
            <span>🔥</span>
            <span>{product.badge || "BESTSELLER"}</span>
          </span>
        </div>

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-3 text-center z-20">
            <span className="bg-red-600 text-white px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase rounded-none tracking-wider shadow-xs">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Section - Sharp Rectangular Styling */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between border-t border-gray-100">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between gap-1">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#0B6B35] truncate">
              {product.category}
            </p>
            {product.origin && (
              <span className="text-[9px] text-gray-400 flex items-center gap-0.5 shrink-0 hidden xs:flex">
                <MapPin className="size-2.5 text-gray-400" /> {product.origin.split(" ")[0]}
              </span>
            )}
          </div>

          {/* Product Name in Dark Green */}
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="mt-1 font-bold text-xs sm:text-sm md:text-base text-[#075B32] hover:text-[#064A29] line-clamp-1 block transition leading-snug"
          >
            {product.name}
          </Link>

          {/* Subtitle / Unit */}
          <p className="text-[10px] sm:text-[11px] text-gray-500 line-clamp-1 mt-0.5">
            {product.subtitle || product.unit || product.description}
          </p>

          {/* Rating */}
          <div className="mt-1.5 flex items-center gap-1 text-[10px] sm:text-[11px]">
            <div className="flex items-center text-[#E7A91A]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-2.5 sm:size-3 fill-current" />
              ))}
            </div>
            <span className="text-gray-500 font-semibold ml-0.5">
              ({product.reviews || 89} reviews)
            </span>
          </div>

          {/* List View Description */}
          {list && (
            <div className="mt-2 space-y-1.5">
              <p className="text-xs leading-relaxed text-gray-600 line-clamp-2">
                {product.description}
              </p>
            </div>
          )}

          {/* Price: Rs. XXX  Rs. YYY */}
          <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
            <span className="font-bold text-xs sm:text-base text-gray-900 font-mono">
              Rs. {product.price}
            </span>
            {product.oldPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">
                Rs. {product.oldPrice}
              </span>
            )}
          </div>
        </div>

        {/* Full-width Rectangular Add to Cart Button - Exact match to mockup */}
        <div className="mt-2.5 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full bg-[#075B32] hover:bg-[#064A29] disabled:bg-gray-300 text-white text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 rounded-none uppercase tracking-wider transition text-center shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
          >
            <ShoppingBag className="size-3.5 sm:size-4" />
            <span>{product.inStock ? "ADD TO CART" : "OUT OF STOCK"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}