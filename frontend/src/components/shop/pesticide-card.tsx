import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Check, ShieldCheck, Sparkles, Minus, Plus } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { toast } from "sonner";
import { type CropProtectionProduct } from "@/lib/crop-protection-data";
import { useStore } from "@/components/store-provider";

interface PesticideCardProps {
  product: CropProtectionProduct;
}

export function PesticideCard({ product }: PesticideCardProps) {
  const { cart, addToCart, updateQuantity, removeFromCart, wishlist, toggleWishlist } = useStore();
  const quantity = cart[product.catalogId] || 0;
  const isWishlisted = wishlist.includes(product.catalogId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addToCart(product.catalogId, 1);
    } catch {
      // fallback
    }
    toast.success(`${product.title} added to cart!`, {
      description: `Technical: ${product.technicalName}`,
    });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addToCart(product.catalogId, 1);
    } catch {
      // fallback
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (quantity <= 1) {
        removeFromCart(product.catalogId);
        toast.info(`Removed ${product.title} from cart`);
      } else {
        updateQuantity(product.catalogId, quantity - 1);
      }
    } catch {
      // fallback
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.catalogId);
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const qtyText = quantity > 0 ? ` (Qty: ${quantity})` : "";
    const msg = encodeURIComponent(
      `Hello Janani Agro, I am interested in ordering: ${product.title}${qtyText} (${product.technicalName}) at ₹${product.price}. Please provide stock availability and expert application dosage for my crops.`
    );
    window.open(`https://wa.me/919426989470?text=${msg}`, "_blank");
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="block"
      >
        {/* Top Badges: Discount on Left, Wishlist Heart on Right */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {product.discount > 0 ? (
            <span className="inline-flex items-center rounded-md bg-[#ff3b30] px-2 py-0.5 text-[11px] font-bold tracking-tight text-white shadow-xs">
              {product.discount}% Off
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
              {product.category}
            </span>
          )}

          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label="Wishlist"
            className="flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-red-500 active:scale-90"
          >
            <Heart
              className={`size-4 transition-colors ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-slate-500"
              }`}
            />
          </button>
        </div>

        {/* Product Photo Area */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white p-2 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Brand Name */}
        <p className="mt-3 text-xs font-semibold text-slate-500 line-clamp-1">
          {product.brand}
        </p>

        {/* Product Title */}
        <h3 className="mt-1 text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 transition-colors group-hover:text-emerald-700">
          {product.title}
        </h3>

        {/* Technical Name Chip */}
        <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
          <ShieldCheck className="size-3 text-emerald-600 shrink-0" />
          <span className="line-clamp-1">{product.technicalName}</span>
        </div>

        {/* Dosage Tag */}
        {product.dosage && (
          <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-1">
            <span className="font-semibold text-slate-700">Dose:</span> {product.dosage}
          </p>
        )}
      </Link>

      {/* Pricing and Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg sm:text-xl font-black text-emerald-600">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.oldPrice > product.price && (
            <span className="text-xs sm:text-sm font-medium text-slate-400 line-through">
              ₹{product.oldPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {quantity > 0 ? (
            <div className="flex items-center justify-between rounded-xl bg-emerald-700 text-white p-1 shadow-xs h-9">
              <button
                type="button"
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="size-7 rounded-lg flex items-center justify-center bg-white/20 hover:bg-white/30 text-white transition active:scale-90 cursor-pointer"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="font-bold text-xs sm:text-sm font-mono px-1 select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="size-7 rounded-lg flex items-center justify-center bg-white/20 hover:bg-white/30 text-white transition active:scale-90 cursor-pointer"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label="Add to Cart"
              title="Add to Cart"
              className="flex items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 py-2 px-2 transition-all shadow-xs h-9 cursor-pointer"
            >
              <ShoppingBag className="size-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleWhatsAppOrder}
            title="Chat & order on WhatsApp"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 py-2 px-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-95 h-9 cursor-pointer"
          >
            <WhatsAppIcon className="size-3.5 text-[#25D366]" />
            <span>Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
