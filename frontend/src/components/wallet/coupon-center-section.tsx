import React, { useState } from "react";
import {
  Tag,
  Sparkles,
  Copy,
  Check,
  Percent,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { type CouponVoucher } from "./types";

const INITIAL_COUPONS: CouponVoucher[] = [
  // Available
  {
    code: "ORGANIC100",
    title: "₹100 Pure Organic Saver",
    description: "Instant ₹100 flat savings on cold-pressed oils, grains, and kitchen essentials.",
    type: "flat",
    value: 100,
    minSubtotal: 750,
    expiry: "31 Dec 2026",
    badge: "FLAT DISCOUNT",
    status: "available",
  },
  {
    code: "HARVEST20",
    title: "20% Harvest Celebration",
    description: "Get 20% off your entire basket up to ₹250 on orders above ₹500.",
    type: "percentage",
    value: 20,
    maxDiscount: 250,
    minSubtotal: 500,
    expiry: "30 Sep 2026",
    badge: "MOST POPULAR",
    status: "available",
  },
  {
    code: "NEXTHARVEST15",
    title: "15% Repeat Patron Reward",
    description: "Exclusive reward voucher for returning farm patrons on seasonal items.",
    type: "percentage",
    value: 15,
    maxDiscount: 200,
    minSubtotal: 600,
    expiry: "15 Oct 2026",
    badge: "REPEAT REWARD",
    status: "available",
  },
  {
    code: "FREEDEL",
    title: "Zero Shipping Farm Privilege",
    description: "Waives standard and priority delivery fee completely on any order total.",
    type: "free_delivery",
    value: 60,
    minSubtotal: 0,
    expiry: "No Expiry",
    badge: "FREE SHIPPING",
    status: "available",
  },
  {
    code: "VEDIC50",
    title: "₹50 Vedic Honey & Ghee Gift",
    description: "Special flat ₹50 voucher on raw unpasteurized honey and wood-churned ghee.",
    type: "flat",
    value: 50,
    minSubtotal: 400,
    expiry: "20 Oct 2026",
    badge: "VEDIC SPECIAL",
    status: "available",
  },

  // Used
  {
    code: "WELCOME150",
    title: "New Patron Welcome Gift",
    description: "Redeemed for ₹150 instant savings on first farm basket order.",
    type: "flat",
    value: 150,
    minSubtotal: 600,
    expiry: "Redeemed",
    status: "used",
    usedOnDate: "28 Aug 2026",
    usedOnOrderId: "JA-8921",
    discountSaved: 150,
  },
  {
    code: "FIRST50",
    title: "First Order Starter Voucher",
    description: "Redeemed for ₹50 savings on initial pantry trial bag.",
    type: "flat",
    value: 50,
    minSubtotal: 300,
    expiry: "Redeemed",
    status: "used",
    usedOnDate: "12 Jul 2026",
    usedOnOrderId: "JA-7104",
    discountSaved: 50,
  },

  // Expired
  {
    code: "MONSOON2026",
    title: "25% Monsoon Harvest Fest",
    description: "Promotional campaign during monsoon planting season. Campaign completed.",
    type: "percentage",
    value: 25,
    maxDiscount: 300,
    minSubtotal: 800,
    expiry: "Expired 31 Aug 2026",
    status: "expired",
  },
  {
    code: "SUMMERCOOL",
    title: "₹75 Herbal Beverages Saver",
    description: "Seasonal promotional discount for cold-pressed sharbats & kokum.",
    type: "flat",
    value: 75,
    minSubtotal: 500,
    expiry: "Expired 15 Jun 2026",
    status: "expired",
  },
];

export function CouponCenterSection() {
  const [coupons, setCoupons] = useState<CouponVoucher[]>(INITIAL_COUPONS);
  const [activeTab, setActiveTab] = useState<"available" | "used" | "expired">("available");
  const [inputCode, setInputCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const availableCount = coupons.filter((c) => c.status === "available").length;
  const usedCount = coupons.filter((c) => c.status === "used").length;
  const expiredCount = coupons.filter((c) => c.status === "expired").length;

  const filteredCoupons = coupons.filter((c) => c.status === activeTab);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Coupon code "${code}" copied!`, {
        description: "Apply it during cart or checkout for instant discount.",
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.info(`Coupon code: ${code}`);
    }
  };

  const handleValidateAndApply = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (!clean) {
      toast.error("Please enter a coupon code");
      return;
    }

    const match = coupons.find((c) => c.code.toUpperCase() === clean);

    if (!match) {
      toast.error(`"${clean}" is not a valid coupon code`, {
        description: "Check the active coupon list below for valid harvest codes.",
      });
      return;
    }

    if (match.status === "used") {
      toast.error(`"${clean}" has already been redeemed`, {
        description: `Used on ${match.usedOnDate || "a past order"} (Order #${match.usedOnOrderId}).`,
      });
      return;
    }

    if (match.status === "expired") {
      toast.error(`"${clean}" is expired`, {
        description: `This seasonal promotion ended on ${match.expiry}.`,
      });
      return;
    }

    // Success
    toast.success(`Coupon "${match.code}" is valid & active!`, {
      description: `${match.title}: ${match.description} Min order ₹${match.minSubtotal}.`,
    });
    setInputCode("");
  };

  return (
    <div className="space-y-6">
      {/* HEADER & INTERACTIVE APPLY BAR */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-brand-gold/15 text-amber-700 dark:text-amber-300">
                <Tag className="size-5" />
              </span>
              <h2 className="text-2xl font-heading font-extrabold text-foreground">
                Coupon Center & Voucher Vault
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Browse guaranteed farm savings, claim seasonal discounts, and track redeemed vouchers.
            </p>
          </div>

          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <ShoppingBag className="size-4" />
            <span>Go to Shopping Cart</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Feature 11: Apply Coupon Interactive Input */}
        <div className="p-4 md:p-5 rounded-2xl bg-secondary/40 border border-border">
          <form onSubmit={handleValidateAndApply} className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Have a Promo or Referral Voucher?
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Tag className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Enter code (e.g. ORGANIC100, HARVEST20)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="pl-10 uppercase font-mono font-bold tracking-wider text-sm h-11 rounded-xl bg-background"
                />
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-sm"
              >
                Validate & Apply Coupon
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tip: Coupon discounts stack with free shipping thresholds and farm wallet credits.
            </p>
          </form>
        </div>
      </div>

      {/* TABBED VOUCHER HUB (Feature 7, 8, 9, 10) */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-secondary/60 border border-border/80 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("available")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "available"
                ? "bg-card text-emerald-700 dark:text-emerald-400 shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="size-3.5 text-brand-gold" />
            <span>Available Coupons ({availableCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("used")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "used"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            <span>Used Coupons ({usedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("expired")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "expired"
                ? "bg-card text-muted-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="size-3.5" />
            <span>Expired ({expiredCount})</span>
          </button>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCoupons.map((coupon) => {
            const isAvailable = coupon.status === "available";
            const isUsed = coupon.status === "used";
            const isExpired = coupon.status === "expired";
            const isCopied = copiedCode === coupon.code;

            return (
              <div
                key={coupon.code}
                className={`relative overflow-hidden rounded-3xl border transition-all p-5 flex flex-col justify-between gap-4 ${
                  isAvailable
                    ? "bg-card border-border hover:border-emerald-500/50 hover:shadow-md"
                    : "bg-secondary/30 border-border/70 opacity-80"
                }`}
              >
                {/* Top Section */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {coupon.badge && isAvailable && (
                        <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-1.5">
                          {coupon.badge}
                        </span>
                      )}
                      {isUsed && (
                        <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 mb-1.5">
                          REDEEMED
                        </span>
                      )}
                      {isExpired && (
                        <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border mb-1.5">
                          EXPIRED
                        </span>
                      )}
                      <h3 className="text-base font-heading font-bold text-foreground">
                        {coupon.title}
                      </h3>
                    </div>

                    {/* Value Badge */}
                    <div className="text-right shrink-0">
                      <div className="font-heading font-extrabold text-xl text-emerald-600 dark:text-emerald-400">
                        {coupon.type === "percentage"
                          ? `${coupon.value}% OFF`
                          : coupon.type === "free_delivery"
                          ? "FREE DEL"
                          : `₹${coupon.value} OFF`}
                      </div>
                      {coupon.maxDiscount && (
                        <span className="text-[10px] text-muted-foreground block">
                          Up to ₹{coupon.maxDiscount}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {coupon.description}
                  </p>
                </div>

                {/* Dotted divider with ticket notch look */}
                <div className="relative border-t border-dashed border-border my-1" />

                {/* Bottom Section: Code + Action */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black tracking-widest text-foreground bg-secondary/80 px-2.5 py-1 rounded-lg border border-border">
                        {coupon.code}
                      </span>
                      {isAvailable && (
                        <button
                          type="button"
                          onClick={() => handleCopy(coupon.code)}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition"
                          title="Copy Code"
                        >
                          {isCopied ? (
                            <Check className="size-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {isAvailable && (
                        <>
                          {coupon.minSubtotal > 0
                            ? `Min order ₹${coupon.minSubtotal} • `
                            : "No min order • "}
                          Expires: {coupon.expiry}
                        </>
                      )}
                      {isUsed && (
                        <>
                          Redeemed on {coupon.usedOnDate} • Order #{coupon.usedOnOrderId}
                        </>
                      )}
                      {isExpired && <span>{coupon.expiry}</span>}
                    </p>
                  </div>

                  {isAvailable ? (
                    <Button
                      type="button"
                      onClick={() => handleCopy(coupon.code)}
                      className="rounded-xl text-xs font-bold h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    >
                      {isCopied ? "Copied!" : "Copy Code"}
                    </Button>
                  ) : isUsed ? (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full shrink-0">
                      Saved ₹{coupon.discountSaved}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full shrink-0">
                      Campaign Inactive
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
