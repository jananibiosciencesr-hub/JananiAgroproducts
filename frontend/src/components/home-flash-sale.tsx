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
  const { addToCart, wishlist, toggleWishlist } = useStore();

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

  const fallbackProduct = products[0]!;
  const p1 = products[5] ?? fallbackProduct;
  const p2 = products[6] ?? fallbackProduct;
  const p3 = products[9] ?? fallbackProduct;
  const p4 = products[18] ?? fallbackProduct;

  // Flash Sale Items (Curated Deals)
  const flashDeals: FlashDealItem[] = [
    {
      id: p1.id,
      slug: p1.slug,
      name: p1.name,
      category: p1.category,
      image: p1.image,
      rating: p1.rating,
      reviews: p1.reviews,
      flashPrice: 349,
      originalPrice: p1.price,
      discount: 20,
      totalStock: 50,
      claimed: 41,
      badge: "Deal of the Day",
      subtitle: "Single-origin slow wood churned at 38°C"
    },
    {
      id: p2.id,
      slug: p2.slug,
      name: p2.name,
      category: p2.category,
      image: p2.image,
      rating: p2.rating,
      reviews: p2.reviews,
      flashPrice: 289,
      originalPrice: p2.price,
      discount: 18,
      totalStock: 35,
      claimed: 29,
      badge: "Morning Mill Batch",
      subtitle: "Cold-pressed pungent yellow mustard"
    },
    {
      id: p3.id,
      slug: p3.slug,
      name: p3.name,
      category: p3.category,
      image: p3.image,
      rating: p3.rating,
      reviews: p3.reviews,
      flashPrice: 119,
      originalPrice: p3.price,
      discount: 22,
      totalStock: 60,
      claimed: 52,
      badge: "Fresh Grain Harvest",
      subtitle: "Unpolished diabetic-friendly native grain"
    },
    {
      id: p4.id,
      slug: p4.slug,
      name: p4.name,
      category: p4.category,
      image: p4.image,
      rating: p4.rating,
      reviews: p4.reviews,
      flashPrice: 399,
      originalPrice: p4.price,
      discount: 15,
      totalStock: 40,
      claimed: 33,
      badge: "Pure Cold Pressed",
      subtitle: "Extracted from fresh coastal coconuts"
    }
  ];

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

        {/* Flash Deals 4-Card Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashDeals.map((item) => {
            const isWishlisted = wishlist.includes(item.id);
            const remaining = item.totalStock - item.claimed;
            const progressPercent = Math.round((item.claimed / item.totalStock) * 100);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border/70 bg-card p-5 shadow-md transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
              >
                {/* Image & Badges */}
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary/30">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  
                  <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                    {item.discount}% OFF
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(item.id)}
                    aria-label="Wishlist"
                    className={`absolute right-3 top-3 grid size-8 place-items-center rounded-full backdrop-blur-md transition shadow-sm ${
                      isWishlisted
                        ? "bg-red-500 text-white"
                        : "bg-white/80 text-foreground hover:bg-white hover:text-red-500"
                    }`}
                  >
                    <Heart className={`size-4 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>

                  <div className="absolute bottom-3 left-3 rounded-md bg-forest/80 px-2 py-0.5 text-[10px] font-bold text-brand-gold backdrop-blur-sm">
                    {item.badge}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 flex-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-brand-gold">
                    <Star className="size-3.5 fill-current" />
                    <span>{item.rating}</span>
                    <span className="text-muted-foreground font-normal">({item.reviews})</span>
                  </div>

                  <h3 className="mt-1 font-display text-base font-bold text-foreground group-hover:text-primary transition line-clamp-1">
                    <Link to="/products/$slug" params={{ slug: item.slug }}>
                      {item.name}
                    </Link>
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {item.subtitle}
                  </p>

                  {/* Price Row */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-xl font-extrabold text-foreground">
                      ₹{item.flashPrice}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{item.originalPrice}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">
                      Save ₹{item.originalPrice - item.flashPrice}
                    </span>
                  </div>

                  {/* Stock Scarcity Progress Meter */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-red-600 flex items-center gap-1">
                        <Flame className="size-3 fill-current" /> Only {remaining} left!
                      </span>
                      <span className="text-muted-foreground">{progressPercent}% Claimed</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Add to Cart CTA */}
                <div className="mt-4 pt-3 border-t border-border/50">
                  <Button
                    onClick={() => {
                      addToCart(item.id, 1);
                      toast.success(`⚡ Flash deal ${item.name} added to cart!`);
                    }}
                    variant="gold"
                    size="sm"
                    className="w-full rounded-xl font-bold text-xs shadow-sm gap-1.5 active:scale-95"
                  >
                    <ShoppingBag className="size-3.5" />
                    Claim Deal Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
