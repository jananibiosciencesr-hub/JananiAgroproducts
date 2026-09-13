import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  Droplet,
  Milk,
  Wheat,
  CookingPot,
  Flower2,
  Package,
  Award,
  Flame,
  CheckCircle2
} from "lucide-react";
import { categories, products } from "@/lib/catalog";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HomeMegaMenu({ isOpen, onClose }: MegaMenuProps) {
  if (!isOpen) return null;

  // Category Icon Mapping
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "cold-pressed-oils":
        return Droplet;
      case "vedic-ghee":
      case "a2-ghee-dairy":
        return Milk;
      case "organic-millets":
        return Wheat;
      case "pulses-and-dals":
        return CookingPot;
      case "spices-and-flours":
        return Flower2;
      default:
        return Package;
    }
  };

  return (
    <div
      onMouseLeave={onClose}
      className="absolute left-0 right-0 top-full z-50 border-b border-border/80 bg-cream/95 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      <div className="mx-auto max-w-7xl">
        {/* Top Header Strip inside Mega Menu */}
        <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-brand-leaf/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-leaf">
              <Sparkles className="size-3.5 text-brand-gold" />
              100% Single-Origin & Farm Traceable
            </span>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              Direct from 450+ certified heritage grower clusters across Gujarat & Karnataka
            </span>
          </div>

          <Link
            to="/products"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-leaf hover:underline"
          >
            Explore Complete Harvest Catalog ({products.length}+ Items)
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Mega Menu Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Column 1-3: Categories with Sub-Links */}
          {categories.slice(0, 3).map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            const catProducts = products.filter(
              (p) => p.category.toLowerCase().includes(cat.name.toLowerCase()) || p.category.toLowerCase().includes(cat.slug.replace(/-/g, " "))
            );

            return (
              <div
                key={cat.slug}
                className="group rounded-3xl border border-border/60 bg-card/60 p-5 shadow-sm transition hover:border-primary/40 hover:bg-card hover:shadow-md"
              >
                {/* Category Header */}
                <Link
                  to="/categories/$slug"
                  params={{ slug: cat.slug }}
                  onClick={onClose}
                  className="flex items-center gap-3"
                >
                  <div className="grid size-11 place-items-center rounded-2xl bg-brand-gold/15 text-brand-gold group-hover:bg-primary group-hover:text-primary-foreground transition duration-300">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-brand-leaf">
                      {catProducts.length || 4} Harvest Items
                    </span>
                  </div>
                </Link>

                {/* Subcategories / Product Links */}
                <div className="mt-4 space-y-1.5 border-t border-border/50 pt-3">
                  {(catProducts.length > 0 ? catProducts : products.slice(0, 4)).slice(0, 4).map((prod) => (
                    <Link
                      key={prod.id}
                      to="/products/$slug"
                      params={{ slug: prod.slug }}
                      onClick={onClose}
                      className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                    >
                      <span className="truncate pr-2">{prod.name}</span>
                      <span className="font-semibold text-foreground shrink-0">₹{prod.price}</span>
                    </Link>
                  ))}
                </div>

                <Link
                  to="/categories/$slug"
                  params={{ slug: cat.slug }}
                  onClick={onClose}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline pt-1"
                >
                  View All in {cat.name} <ChevronRight className="size-3" />
                </Link>
              </div>
            );
          })}

          {/* Column 4: Featured Promo Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest via-[#1a3826] to-[#0f2418] p-6 text-primary-foreground shadow-lg flex flex-col justify-between">
            <div className="absolute -right-8 -top-8 size-36 rounded-full bg-brand-gold/15 blur-2xl" />
            
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                <Flame className="size-3 text-brand-gold" />
                Featured Bestseller
              </span>
              <h4 className="mt-3 font-display text-lg font-bold text-white leading-snug">
                Wood-Pressed Mustard Oil (5 Litre Tin)
              </h4>
              <p className="mt-1 text-xs text-white/70">
                Cold-churned in native Vagai wood expellers at 38°C for authentic sharp pungency.
              </p>
              
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold text-brand-gold">₹1,199</span>
                <span className="text-xs text-white/50 line-through">₹1,499</span>
                <span className="rounded-md bg-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  20% OFF
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-5 pt-4 border-t border-white/10">
              <Link
                to="/products/$slug"
                params={{ slug: "cold-pressed-mustard-oil" }}
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-brand-gold py-2.5 text-xs font-bold text-forest shadow-md hover:bg-brand-gold/90 transition active:scale-95"
              >
                Order Direct from Mill <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-brand-leaf" />
            <span>Certified NPOP Organic & FSSAI Lic: <strong>10020021001234</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="size-4 text-brand-gold" />
            <span>Complimentary Express Delivery on orders above <strong>₹799</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Droplet className="size-4 text-blue-500" />
            <span>Zero Hexane / Zero Refined Palm Adulteration</span>
          </div>
        </div>
      </div>
    </div>
  );
}
