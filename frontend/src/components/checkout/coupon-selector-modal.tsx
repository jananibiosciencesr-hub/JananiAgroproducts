import React, { useState, useEffect } from "react";
import { Tag, Sparkles, Check, X, ArrowRight, ShieldCheck, Percent, HelpCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getStorefrontCoupons, type AdminCoupon } from "@/lib/api";

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
    code: "JANANI10",
    title: "10% Off Storewide",
    description: "Save 10% on your entire basket of organic essentials",
    type: "percentage",
    value: 10,
    maxDiscount: 300,
    minSubtotal: 499,
    expiry: "31 Dec 2026",
    badge: "10% OFF",
  },
  {
    code: "HARVEST15",
    title: "15% Harvest Fest Savings",
    description: "15% off orders above ₹999 on cold pressed oils and pulses",
    type: "percentage",
    value: 15,
    maxDiscount: 500,
    minSubtotal: 999,
    expiry: "31 Dec 2026",
    badge: "15% OFF",
  },
  {
    code: "FREESHIP",
    title: "Free Priority Delivery",
    description: "Complimentary delivery anywhere in India on orders ₹499+",
    type: "free_delivery",
    value: 60,
    minSubtotal: 499,
    expiry: "31 Dec 2026",
    badge: "FREE SHIPPING",
  },
  {
    code: "BILONA20",
    title: "Flat 20% on Desi Ghee",
    description: "Special savings on handcrafted Bilona Gir Cow Ghee jars",
    type: "percentage",
    value: 20,
    maxDiscount: 400,
    minSubtotal: 1450,
    expiry: "31 Dec 2026",
    badge: "20% OFF",
  },
  {
    code: "ORGANIC100",
    title: "₹100 Pure Organic Saver",
    description: "Instant ₹100 off on cold-pressed oils, grains, and kitchen pantry items.",
    type: "flat",
    value: 100,
    minSubtotal: 750,
    expiry: "31 Dec 2026",
    badge: "FLAT ₹100",
  },
  {
    code: "FARMDIRECT",
    title: "₹150 Bulk Harvest Reward",
    description: "Special ₹150 privilege discount for family monthly pantry stocking orders.",
    type: "flat",
    value: 150,
    minSubtotal: 1200,
    expiry: "31 Dec 2026",
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
  const [couponsList, setCouponsList] = useState<CouponRule[]>(AVAILABLE_COUPONS);

  useEffect(() => {
    let active = true;
    getStorefrontCoupons().then((dbCoupons) => {
      if (!active || !dbCoupons || dbCoupons.length === 0) return;
      const mapped: CouponRule[] = dbCoupons.map((c) => {
        let typeVal: "percentage" | "flat" | "free_delivery" = "percentage";
        if (c.type === "flat") typeVal = "flat";
        else if (c.type === "free_shipping" || c.isFreeShipping) typeVal = "free_delivery";

        return {
          code: c.code,
          title: c.title || `${c.code} Promo`,
          description: c.description || (c.type === "percentage" ? `${c.discount}% instant off` : `Flat ₹${c.discount} off`),
          type: typeVal,
          value: c.discount,
          maxDiscount: c.maxDiscount || undefined,
          minSubtotal: c.minCart || 0,
          expiry: c.expiryDate || "31 Dec 2026",
          badge: c.type === "percentage" ? `${c.discount}% OFF` : c.type === "flat" ? `FLAT ₹${c.discount}` : "FREE SHIPPING",
        };
      });
      setCouponsList(mapped);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleManualApply = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = manualCode.trim().toUpperCase();
    if (!cleaned) return;

    const matched = couponsList.find((c) => c.code.toUpperCase() === cleaned);
    if (!matched) {
      toast.error(`Coupon code "${cleaned}" is invalid or expired.`);
      return;
    }

    if (subtotal < matched.minSubtotal) {
      toast.error(`Minimum order amount of ₹${matched.minSubtotal} required for ${matched.code}. (Add ₹${matched.minSubtotal - subtotal} more)`);
      return;
    }

    onApplyCoupon(matched);
    setManualCode("");
    setIsModalOpen(false);
    toast.success(`Coupon ${matched.code} applied! Saved ₹${calculateCouponDiscount(matched, subtotal, shippingFee)}`);
  };

  const handleSelectCoupon = (coupon: CouponRule) => {
    if (subtotal < coupon.minSubtotal) {
      toast.error(`Cart total must be at least ₹${coupon.minSubtotal} to use this coupon. (Add ₹${coupon.minSubtotal - subtotal} more)`);
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
          className="text-xs font-bold text-brand-leaf hover:underline flex items-center gap-1 cursor-pointer"
        >
          See All Offers ({couponsList.length}) <ArrowRight className="size-3" />
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
            className="text-xs font-bold text-destructive hover:bg-destructive/10 px-2 py-1 rounded-md transition cursor-pointer"
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
              placeholder="Enter coupon (e.g. JANANI10)"
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
            className="rounded-xl text-xs font-bold px-4 cursor-pointer"
          >
            Apply
          </Button>
        </form>
      )}

      {/* Suggested Quick Coupon Pills */}
      {!appliedCoupon && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {couponsList.slice(0, 4).map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleSelectCoupon(c)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-brand-leaf/40 bg-brand-leaf/5 px-2.5 py-1 text-[11px] font-mono font-bold text-brand-leaf hover:bg-brand-leaf/15 transition cursor-pointer"
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
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold">
                  <Percent className="size-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Available Coupons ({couponsList.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Store Offers & Verified Promotions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="py-3.5 border-b border-border/60 shrink-0">
              <form onSubmit={handleManualApply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code (e.g. JANANI10)"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-mono font-semibold uppercase tracking-wider outline-none focus:border-brand-leaf"
                />
                <Button type="submit" size="sm" className="h-10 text-xs font-bold px-4 rounded-xl bg-[#075B32] hover:bg-[#064B29] text-white cursor-pointer">
                  Apply
                </Button>
              </form>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 py-4 flex-1">
              {couponsList.map((coupon) => {
                const isApplicable = subtotal >= coupon.minSubtotal;
                const isCurrent = appliedCoupon?.code === coupon.code;
                const potentialSavings = calculateCouponDiscount(coupon, subtotal, shippingFee);
                const diffToUnlock = coupon.minSubtotal - subtotal;

                return (
                  <div
                    key={coupon.code}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      isCurrent
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                        : isApplicable
                        ? "border-border bg-card hover:border-emerald-500/50 hover:shadow-xs"
                        : "border-border/60 bg-muted/20 opacity-80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-emerald-500/15 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-800 tracking-wider">
                            {coupon.code}
                          </span>
                          {coupon.badge && (
                            <span className="rounded-md bg-emerald-600/10 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                              {coupon.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-foreground mt-1">
                          {coupon.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          {coupon.description}
                        </p>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
                            <Check className="size-3.5" /> Applied
                          </span>
                        ) : isApplicable ? (
                          <button
                            type="button"
                            onClick={() => handleSelectCoupon(coupon)}
                            className="rounded-xl bg-emerald-600/15 text-emerald-800 hover:bg-emerald-600 hover:text-white px-4 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer border border-emerald-600/30 uppercase tracking-wider"
                          >
                            Apply
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="rounded-xl border border-border bg-muted/60 px-3 py-1.5 text-xs font-bold text-muted-foreground cursor-not-allowed"
                          >
                            Locked
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 font-medium">
                        {coupon.minSubtotal > 0 ? (
                          isApplicable ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Check className="size-3.5 text-emerald-600" /> Min Purchase ₹{coupon.minSubtotal} met
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <AlertCircle className="size-3.5" /> Add ₹{diffToUnlock} more (Min ₹{coupon.minSubtotal})
                            </span>
                          )
                        ) : (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <Check className="size-3.5" /> No minimum purchase required
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-muted-foreground font-medium">
                        <Clock className="size-3" />
                        <span>Expires: {coupon.expiry}</span>
                      </div>
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
