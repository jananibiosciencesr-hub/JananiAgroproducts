import React, { useState } from "react";
import { Tag, Sparkles, Check, X, ArrowRight, ShieldCheck, Percent, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface CouponRule {
  code: string;
  title: string;
  description: string;
  type: "percentage" | "flat" | "free_delivery";
  value: number; // e.g. 20 for 20%, 100 for ₹100
  maxDiscount?: number;
  minSubtotal: number;
  expiry: string;
  badge?: string;
}

export const AVAILABLE_COUPONS: CouponRule[] = [
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
  },
  {
    code: "ORGANIC100",
    title: "₹100 Pure Organic Saver",
    description: "Instant ₹100 off on cold-pressed oils, grains, and kitchen pantry items.",
    type: "flat",
    value: 100,
    minSubtotal: 750,
    expiry: "31 Dec 2026",
    badge: "FLAT DISCOUNT",
  },
  {
    code: "FREEDEL",
    title: "Complimentary Farm Delivery",
    description: "Waives standard and priority delivery fee entirely on any order value.",
    type: "free_delivery",
    value: 60,
    minSubtotal: 0,
    expiry: "No Expiry",
    badge: "FREE SHIPPING",
  },
  {
    code: "FARMDIRECT",
    title: "₹150 Bulk Harvest Reward",
    description: "Special ₹150 privilege discount for family monthly pantry stocking orders.",
    type: "flat",
    value: 150,
    minSubtotal: 1200,
    expiry: "15 Oct 2026",
    badge: "BULK REWARD",
  },
  {
    code: "WELCOME150",
    title: "₹150 New Patron Welcome",
    description: "First time tasting Janani Agro organic harvests? Enjoy ₹150 off right away.",
    type: "flat",
    value: 150,
    minSubtotal: 600,
    expiry: "31 Dec 2026",
    badge: "NEW PATRON",
  },
];

export function calculateCouponDiscount(
  coupon: CouponRule | null,
  subtotal: number,
  shippingFee: number
): number {
  if (!coupon || subtotal < coupon.minSubtotal) return 0;
  if (coupon.type === "percentage") {
    const rawDiscount = (subtotal * coupon.value) / 100;
    return Math.min(rawDiscount, coupon.maxDiscount || rawDiscount);
  }
  if (coupon.type === "flat") {
    return Math.min(coupon.value, subtotal);
  }
  if (coupon.type === "free_delivery") {
    return shippingFee;
  }
  return 0;
}

interface CouponSelectorProps {
  appliedCoupon: CouponRule | null;
  onApplyCoupon: (coupon: CouponRule | null) => void;
  subtotal: number;
  shippingFee: number;
}

export function CouponSelector({
  appliedCoupon,
  onApplyCoupon,
  subtotal,
  shippingFee,
}: CouponSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const handleManualApply = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = manualCode.trim().toUpperCase();
    if (!cleaned) return;

    const matched = AVAILABLE_COUPONS.find((c) => c.code === cleaned);
    if (!matched) {
      toast.error(`Coupon code "${cleaned}" is invalid or expired.`);
      return;
    }

    if (subtotal < matched.minSubtotal) {
      toast.error(`Minimum order amount of ₹${matched.minSubtotal} required for ${matched.code}.`);
      return;
    }

    onApplyCoupon(matched);
    setManualCode("");
    setIsModalOpen(false);
    toast.success(`Coupon ${matched.code} applied! Saved ₹${calculateCouponDiscount(matched, subtotal, shippingFee)}`);
  };

  const handleSelectCoupon = (coupon: CouponRule) => {
    if (subtotal < coupon.minSubtotal) {
      toast.error(`Cart total must be at least ₹${coupon.minSubtotal} to use this coupon.`);
      return;
    }
    onApplyCoupon(coupon);
    setIsModalOpen(false);
    toast.success(`Coupon ${coupon.code} applied! Saved ₹${calculateCouponDiscount(coupon, subtotal, shippingFee)}`);
  };

  const handleRemoveCoupon = () => {
    onApplyCoupon(null);
    toast.info("Coupon removed.");
  };

  const currentDiscount = calculateCouponDiscount(appliedCoupon, subtotal, shippingFee);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Tag className="size-3.5 text-brand-leaf" />
          Promo Coupons & Vouchers
        </span>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-xs font-bold text-brand-leaf hover:underline flex items-center gap-1"
        >
          View Offers ({AVAILABLE_COUPONS.length}) <ArrowRight className="size-3" />
        </button>
      </div>

      {/* If coupon is applied */}
      {appliedCoupon ? (
        <div className="flex items-center justify-between rounded-xl bg-brand-leaf/10 border border-brand-leaf/30 px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg bg-brand-leaf text-white font-mono font-bold text-xs">
              %
            </span>
            <div>
              <div className="flex items-center gap-2">
                <strong className="font-mono text-xs font-bold text-brand-leaf tracking-wider">
                  {appliedCoupon.code}
                </strong>
                <span className="text-[10px] font-bold bg-brand-leaf/20 text-brand-leaf px-1.5 py-0.5 rounded">
                  APPLIED
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Saving ₹{currentDiscount} on this order
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="text-xs font-bold text-destructive hover:bg-destructive/10 px-2 py-1 rounded-md transition"
          >
            Remove
          </button>
        </div>
      ) : (
        /* Manual input strip */
        <form onSubmit={handleManualApply} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter coupon (e.g. HARVEST20)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-mono font-semibold uppercase tracking-wider outline-none focus:border-brand-leaf"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={!manualCode.trim()}
            className="rounded-xl text-xs font-bold px-4"
          >
            Apply
          </Button>
        </form>
      )}

      {/* Suggested Quick Coupon Pills */}
      {!appliedCoupon && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {AVAILABLE_COUPONS.slice(0, 3).map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleSelectCoupon(c)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-brand-leaf/40 bg-brand-leaf/5 px-2.5 py-1 text-[11px] font-mono font-bold text-brand-leaf hover:bg-brand-leaf/15 transition"
            >
              <Sparkles className="size-3" />
              {c.code}
            </button>
          ))}
        </div>
      )}

      {/* Available Coupons Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-luxe max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <X className="size-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf flex items-center gap-1.5">
                <Tag className="size-3.5" /> Available Harvest Coupons
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground mt-1">
                Apply a Promo Offer
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Select from genuine farm discounts and free shipping privileges.
              </p>
            </div>

            <div className="space-y-3">
              {AVAILABLE_COUPONS.map((coupon) => {
                const isApplicable = subtotal >= coupon.minSubtotal;
                const isCurrent = appliedCoupon?.code === coupon.code;
                const potentialSavings = calculateCouponDiscount(coupon, subtotal, shippingFee);

                return (
                  <div
                    key={coupon.code}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      isCurrent
                        ? "border-brand-leaf bg-brand-leaf/10 ring-2 ring-brand-leaf/30"
                        : isApplicable
                        ? "border-border bg-card hover:border-brand-leaf/40 hover:bg-secondary/40"
                        : "border-border/40 bg-secondary/30 opacity-70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-brand-leaf/15 px-2 py-0.5 font-mono text-xs font-bold text-brand-leaf tracking-wider">
                            {coupon.code}
                          </span>
                          {coupon.badge && (
                            <span className="rounded-full bg-brand-gold/15 text-brand-gold px-2 py-0.5 text-[9px] font-extrabold uppercase">
                              {coupon.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-foreground mt-1.5">
                          {coupon.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {coupon.description}
                        </p>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        disabled={!isApplicable || isCurrent}
                        variant={isCurrent ? "outline" : "gold"}
                        onClick={() => handleSelectCoupon(coupon)}
                        className="shrink-0 text-xs font-bold rounded-full px-4"
                      >
                        {isCurrent ? "Applied" : "Apply"}
                      </Button>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        Min. Order: ₹{coupon.minSubtotal} • Valid till {coupon.expiry}
                      </span>
                      {isApplicable && (
                        <strong className="text-brand-leaf font-semibold">
                          Saves ₹{potentialSavings}
                        </strong>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
