import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Flame,
  ShoppingBag,
  Heart,
  Star
} from "lucide-react";
import { toast } from "sonner";
import { products, type Product } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";

interface FlashSaleProps {
  bannerTitle?: string;
  bannerSubtitle?: string;
  endsAt?: string;
}

interface FlashDealItem {
  id: number;
  slug: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  flashPrice: number;
  originalPrice: number;
  discount: number;
  totalStock: number;
  claimed: number;
  badge: string;
  subtitle: string;
}

export function HomeFlashSale({
  bannerTitle = "Festive Harvest Flash Sale",
  bannerSubtitle = "Limited small-batch cold-pressed oils & A2 Vedic Ghee directly from today's morning press.",
}: FlashSaleProps) {
  const { addToCart, wishlist, toggleWishlist, products: storeProducts } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  // 12-Hour Live Countdown Timer
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 11, minutes: 47, seconds: 23 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!allProducts || allProducts.length === 0) {
    return null;
  }

  // Dynamic Flash Deals from Live Store / Catalog Products
  const flashDeals: FlashDealItem[] = allProducts.slice(0, 4).map((p, idx) => {
    const originalPrice = p.oldPrice && p.oldPrice > p.price ? p.oldPrice : Math.round(p.price * 1.25);
    const flashPrice = p.price;
    const discount = Math.max(10, Math.round(((originalPrice - flashPrice) / originalPrice) * 100));

    const totalStock = p.stockCount || 50;
    const remaining = Math.max(3, Math.min(12, (p.id * 7) % 9 + 4));
    const claimed = totalStock - remaining;

    const badges = ["Deal of the Day", "Morning Mill Batch", "Fresh Harvest", "Bestseller Deal"];
    const badge = p.badge || badges[idx % badges.length];

    const subtitle = p.description
      ? (p.description.length > 55 ? p.description.slice(0, 52) + "..." : p.description)
      : (p.unit ? `${p.unit} • 100% Certified Organic` : "Direct from partner organic farms");

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      image: p.image || "/assets/janani-pantry.jpg",
      rating: p.rating || 4.9,
      reviews: p.reviews || 48,
      flashPrice,
      originalPrice,
      discount,
      totalStock,
      claimed,
      badge,
      subtitle
    };
  });

  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-500/5 via-cream to-cream">
      <div className="mx-auto max-w-7xl">
        {/* Header Strip with Live Countdown */}
        <div className="rounded-[2.5rem] border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-brand-gold/20 to-amber-500/10 p-6 sm:p-8 backdrop-blur-xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm animate-pulse">
              <Flame className="size-3.5 fill-current" />
              Flash Deal — Ending Soon
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
              {bannerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              {bannerSubtitle}
            </p>
          </div>

          {/* Countdown Clock Display */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-card/80 p-3.5 rounded-2xl border border-border/80 backdrop-blur-md shadow-inner shrink-0">
            <div className="flex flex-col items-center">
              <span className="font-mono text-2xl sm:text-3xl font-black text-foreground bg-secondary/80 px-2.5 py-1 rounded-xl">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Hours</span>
            </div>
            <span className="font-mono text-xl font-bold text-brand-gold pb-4">:</span>
            <div className="flex flex-col items-center">
              <span className="font-mono text-2xl sm:text-3xl font-black text-foreground bg-secondary/80 px-2.5 py-1 rounded-xl">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Mins</span>
            </div>
            <span className="font-mono text-xl font-bold text-brand-gold pb-4">:</span>
            <div className="flex flex-col items-center">
              <span className="font-mono text-2xl sm:text-3xl font-black text-red-600 bg-red-500/10 px-2.5 py-1 rounded-xl">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Secs</span>
            </div>
          </div>
        </div>

        {/* Flash Deals 4-Card Grid: 2 columns on mobile, 4 columns on desktop */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {flashDeals.map((item) => {
            const isWishlisted = wishlist.includes(item.id);
            const remaining = Math.max(1, item.totalStock - item.claimed);
            const progressPercent = Math.min(95, Math.max(65, Math.round((item.claimed / item.totalStock) * 100)));

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-none border border-gray-200 bg-white shadow-xs hover:shadow-md transition duration-300"
              >
                {/* Image & Badges */}
                <div className="relative aspect-square w-full overflow-hidden rounded-none bg-white p-2.5 flex items-center justify-center">
                  <Link
                    to="/products/$slug"
                    params={{ slug: item.slug }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/assets/janani-pantry.jpg";
                      }}
                      className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-105"
                    />
                  </Link>
                  
                  {/* Top-Left Red Badge - Sharp corners */}
                  <span className="absolute left-2 top-2 z-10 rounded-none bg-[#E53E3E] px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                    SAVE {item.discount}%
                  </span>

                  {/* Top-Right Circular Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(item.id)}
                    aria-label="Wishlist"
                    className={`absolute right-2 top-2 z-10 grid size-7 sm:size-8 place-items-center rounded-full backdrop-blur-md transition shadow-xs ${
                      isWishlisted
                        ? "bg-red-500 text-white"
                        : "bg-white/95 text-gray-700 hover:bg-white hover:text-red-500"
                    }`}
                  >
                    <Heart className={`size-3.5 sm:size-4 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>

                  {/* Bottom-Center Pill - 🔥 BESTSELLER */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap pointer-events-none">
                    <span className="inline-flex items-center gap-1 bg-[#064A29]/95 text-white text-[8px] sm:text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider backdrop-blur-xs">
                      <span>🔥</span>
                      <span>{item.badge}</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between border-t border-gray-100">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#E7A91A]">
                      <Star className="size-2.5 sm:size-3 fill-current" />
                      <span>{item.rating}</span>
                      <span className="text-gray-500 font-normal">({item.reviews})</span>
                    </div>

                    <h3 className="mt-1 font-bold text-xs sm:text-sm text-[#075B32] group-hover:text-[#064A29] transition line-clamp-1 leading-snug">
                      <Link to="/products/$slug" params={{ slug: item.slug }}>
                        {item.name}
                      </Link>
                    </h3>
                    <p className="mt-0.5 text-[10px] sm:text-[11px] text-gray-500 line-clamp-1">
                      {item.subtitle}
                    </p>

                    {/* Price Row */}
                    <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-bold text-xs sm:text-base text-gray-900 font-mono">
                        Rs. {item.flashPrice}
                      </span>
                      {item.originalPrice > item.flashPrice && (
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">
                          Rs. {item.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Stock Scarcity Progress Meter */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
                        <span className="font-semibold text-red-600 flex items-center gap-0.5 truncate">
                          <Flame className="size-2.5 fill-current shrink-0" /> Only {remaining} left!
                        </span>
                        <span className="text-gray-400 shrink-0">{progressPercent}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart CTA */}
                  <div className="mt-2.5 pt-2">
                    <button
                      onClick={() => {
                        addToCart(item.id, 1);
                        toast.success(`⚡ Flash deal ${item.name} added to cart!`);
                      }}
                      className="w-full bg-[#075B32] hover:bg-[#064A29] text-white text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 rounded-none uppercase tracking-wider transition text-center shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
                    >
                      <ShoppingBag className="size-3.5 sm:size-4 shrink-0" />
                      <span>CLAIM DEAL</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
