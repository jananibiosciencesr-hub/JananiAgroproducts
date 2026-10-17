import React, { useMemo, useState } from "react";
import { Heart, ShoppingBag, Eye, MapPin, Sparkles, Minus, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/store-provider";
import { type Product, type ProductVariant, resolveProductVariants, getProductImage, getProductVariantImage, pantryImage, formatProductName } from "@/lib/catalog";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  list?: boolean;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, list = false, onQuickView }: ProductCardProps) {
  const { cart, wishlist, toggleWishlist, addToCart, updateQuantity, removeFromCart } = useStore();

  const variants = useMemo(() => resolveProductVariants(product), [product]);

  // Default to 1L variant if present, otherwise first available
  const defaultVariant = useMemo(() => {
    return (
      variants.find((v) => {
        const u = (v.unit || v.label || v.name || "").toLowerCase();
        return u.includes("1 l") || u.includes("1l") || u.includes("1 litre");
      }) ||
      variants[0] || {
        id: "1l",
        label: "1 L",
        unit: "1 L",
        price: product.price,
        oldPrice: product.oldPrice,
        inStock: product.inStock,
        image: getProductVariantImage(product, "1l"),
      }
    );
  }, [variants, product]);

  const [selectedVariantId, setSelectedVariantId] = useState<string>(defaultVariant.id);

  // Sync current selected variant
  const selectedVariant = useMemo(() => {
    return variants.find((v) => v.id === selectedVariantId) || defaultVariant;
  }, [variants, selectedVariantId, defaultVariant]);

  const variantNormId = selectedVariant.id.toLowerCase().includes("5") || selectedVariant.unit.includes("5") ? "5l" : "1l";
  const canonicalKey = `${product.id}__${variantNormId}`;

  // Image dynamically switches between 1L bottle and 5L can
  const currentImage = selectedVariant.image || getProductVariantImage(product, variantNormId) || product.image;

  // Track cart qty for this specific selected pack size
  const cartQty =
    (cart[canonicalKey] ?? 0) +
    (variantNormId === "1l"
      ? (cart[product.id] ?? (cart as any)[String(product.id)] ?? (cart as any)[Number(product.id)] ?? 0)
      : 0);

  const isWishlisted = wishlist.some((item) => String(item) === String(product.id) || Number(item) === Number(product.id));

  const currentPrice = Number(selectedVariant.price) || Number(product.price) || 0;
  const currentOldPrice =
    Number(selectedVariant.oldPrice ?? (selectedVariant as any).originalPrice) ||
    Number(product.oldPrice) ||
    Math.round(currentPrice * 1.2);

  const discountVal =
    currentOldPrice > currentPrice
      ? Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)
      : product.discount > 0
      ? product.discount
      : 10;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) {
      toast.error(`${formatProductName(product.name)} is currently out of stock.`);
      return;
    }
    addToCart(product.id, 1, variantNormId);
    toast.success(`Added ${formatProductName(product.name)} (${selectedVariant.label || selectedVariant.unit}) to cart!`, {
      description: `₹${currentPrice} • ${selectedVariant.unit || selectedVariant.label}`,
    });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product.id, 1, variantNormId);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartQty <= 1) {
      removeFromCart(canonicalKey);
      if (variantNormId === "1l") {
        removeFromCart(product.id);
        removeFromCart(String(product.id));
        if (!isNaN(Number(product.id))) removeFromCart(Number(product.id));
      }
      toast.info(`Removed ${formatProductName(product.name)} (${selectedVariant.label || selectedVariant.unit}) from cart`);
    } else {
      updateQuantity(canonicalKey, cartQty - 1);
    }
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
      className={`group relative overflow-hidden rounded-none border-0 bg-white shadow-none transition duration-300 hover:shadow-md flex flex-col justify-between ${
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
            src={getProductImage(product.name || product.category, currentImage)}
            alt={`${product.name} - ${selectedVariant.label || selectedVariant.unit}`}
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

        {/* Top-Right Wishlist Button (Transparent Background) */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={`Save ${product.name}`}
            className="size-7 sm:size-8 bg-transparent shadow-none flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <Heart
              className={`size-4 sm:size-4.5 transition-colors ${
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-slate-600 hover:text-red-500"
              }`}
            />
          </button>

          {/* Quick View Button */}
          {onQuickView && (
            <button
              type="button"
              onClick={handleQuickViewClick}
              aria-label={`Quick preview ${product.name}`}
              className="size-7 sm:size-8 rounded-full bg-white/95 text-gray-700 shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white hover:text-[#075B32] cursor-pointer"
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
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
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
            {formatProductName(product.name)}
          </Link>

          {/* Subtitle / Unit */}
          <p className="text-[10px] sm:text-[11px] text-gray-500 line-clamp-1 mt-0.5">
            {product.subtitle || product.unit || product.description}
          </p>

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
              Rs. {currentPrice}
            </span>
            {currentOldPrice > currentPrice && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">
                Rs. {currentOldPrice}
              </span>
            )}
          </div>

          {/* Pack Size Selection Suggestions (1 L / 5 L) */}
          <div className="mt-2 pt-1.5 border-t border-gray-100">
            <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
              <span>Pack Size</span>
              <span className="text-[#075B32] font-extrabold">{selectedVariant.label || selectedVariant.unit}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {variants.slice(0, 2).map((v) => {
                const vNorm = v.id.toLowerCase().includes("5") || v.unit.includes("5") ? "5l" : "1l";
                const isSelected = variantNormId === vNorm;
                const vLabel = v.label || v.unit || (vNorm === "5l" ? "5 L" : "1 L");

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariantId(v.id);
                    }}
                    className={`py-1 px-1.5 rounded-sm border text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-[#075B32] text-white border-[#075B32] shadow-xs font-bold"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-gray-200 font-medium"
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs">{vLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Full-width Rectangular Add to Cart / Quantity Stepper Button */}
        <div className="mt-2.5 pt-1">
          {cartQty > 0 ? (
            <div className="w-full bg-[#075B32] text-white py-1.5 sm:py-2 px-3 rounded-none transition shadow-xs flex items-center justify-between">
              <button
                type="button"
                onClick={handleDecrement}
                className="size-7 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-md transition active:scale-90 cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="font-bold text-sm sm:text-base select-none px-2 tracking-tight">
                {cartQty}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="size-7 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-md transition active:scale-90 cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full bg-[#075B32] hover:bg-[#064A29] disabled:bg-gray-300 text-white text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 rounded-none uppercase tracking-wider transition text-center shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
            >
              <ShoppingBag className="size-3.5 sm:size-4" />
              <span>{product.inStock ? "ADD TO CART" : "OUT OF STOCK"}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}