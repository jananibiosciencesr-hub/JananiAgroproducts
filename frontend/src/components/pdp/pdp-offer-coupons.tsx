import React, { useState } from "react";
import {
  Tag,
  Copy,
  Check,
  CreditCard,
  Percent,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  HelpCircle,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PdpOfferCouponsProps {
  productPrice: number;
}

export function PdpOfferCoupons({ productPrice }: PdpOfferCouponsProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [isEmiModalOpen, setIsEmiModalOpen] = useState(false);

  const coupons = [
    {
      code: "ORGANIC100",
      discount: "₹100 Instant Discount",
      minOrder: 599,
      desc: "Valid on all cold-pressed oils & Vedic staples above ₹599.",
    },
    {
      code: "FIRSTHARVEST",
      discount: "15% OFF Welcome Reward",
      minOrder: 499,
      desc: "For new Janani Agro accounts on first order.",
    },
    {
      code: "BULK500",
      discount: "Flat ₹500 OFF",
      minOrder: 2499,
      desc: "Applicable on 5L cans & family packs.",
    },
  ];

  const bankOffers = [
    {
      id: "upi",
      title: "Flat ₹50 Instant Cashback via UPI / Cred Pay",
      desc: "Valid on minimum cart value of ₹499. No coupon code needed.",
      badge: "UPI Exclusive",
    },
    {
      id: "card",
      title: "10% Instant Discount on HDFC & ICICI Bank Cards",
      desc: "Up to ₹200 off on Credit & Debit Cards.",
      badge: "Bank Offer",
    },
    {
      id: "freebie",
      title: "Free 100g Cold-Pressed Sesame Seeds on Orders > ₹999",
      desc: "Automatically bundled during packing.",
      badge: "Gift with Purchase",
    },
    {
      id: "harvest_cash",
      title: "Earn 5% Harvest Cash Rewards in Your Wallet",
      desc: "Usable on your next organic refill.",
      badge: "Loyalty Cashback",
    },
  ];

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`, {
      description: "Paste at checkout for instant savings.",
    });
    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
  };

  const emiPerMonth = Math.round(productPrice / 3);

  return (
    <div className="space-y-4">
      {/* Interactive Copyable Coupons Strip */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf flex items-center gap-1.5">
            <Tag className="size-4 text-brand-leaf" /> Available Coupon Codes
          </span>
          <span className="text-[11px] text-muted-foreground">Click code to copy</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {coupons.map((c) => {
            const isCopied = copiedCode === c.code;
            return (
              <div
                key={c.code}
                className="relative flex flex-col justify-between rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-3 hover:bg-primary/10 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-bold text-primary tracking-wider">
                      {c.code}
                    </span>
                    <button
                      onClick={() => handleCopyCoupon(c.code)}
                      className="inline-flex items-center gap-1 rounded-lg bg-background px-2 py-0.5 text-[10px] font-bold text-primary shadow-xs hover:bg-primary hover:text-primary-foreground transition"
                    >
                      {isCopied ? (
                        <>
                          <Check className="size-2.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-2.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs font-bold text-foreground">{c.discount}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bank & Payment Offers Accordion */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
            <Percent className="size-4 text-amber-500" /> Bank Offers & Cashbacks
          </span>
          <button
            onClick={() => setShowAllOffers(!showAllOffers)}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            {showAllOffers ? "Show Less" : `View All (${bankOffers.length})`}
            {showAllOffers ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </div>

        <div className="space-y-2">
          {(showAllOffers ? bankOffers : bankOffers.slice(0, 2)).map((offer) => (
            <div
              key={offer.id}
              className="flex items-start gap-3 rounded-2xl bg-secondary/50 p-3 border border-border/50 text-xs"
            >
              <span className="shrink-0 rounded-full bg-amber-500/15 text-amber-700 px-2 py-0.5 text-[10px] font-bold">
                {offer.badge}
              </span>
              <div>
                <p className="font-semibold text-foreground">{offer.title}</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">{offer.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EMI Option Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card/60 p-3.5 px-4 text-xs">
        <div className="flex items-center gap-2.5">
          <CreditCard className="size-4 text-brand-leaf" />
          <span>
            No Cost EMI starts at <strong className="font-mono font-bold text-foreground">₹{emiPerMonth}/mo</strong> with Credit Cards & UPI.
          </span>
        </div>
        <button
          onClick={() => setIsEmiModalOpen(true)}
          className="font-bold text-primary hover:underline text-xs"
        >
          View Plans
        </button>
      </div>

      {/* EMI Breakdown Modal */}
      {isEmiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-background border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-brand-leaf" />
                <h3 className="font-display font-bold text-lg">EMI Calculator & Plans</h3>
              </div>
              <button
                onClick={() => setIsEmiModalOpen(false)}
                className="rounded-full p-1 hover:bg-muted text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Total Payable: <strong className="text-foreground font-mono">₹{productPrice}</strong> • Available across all major Indian banks & Bajaj Finserv.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {[
                { months: "3 Months", emi: Math.round(productPrice / 3), rate: "0% No Cost", total: productPrice },
                { months: "6 Months", emi: Math.round((productPrice * 1.05) / 6), rate: "12% p.a.", total: Math.round(productPrice * 1.05) },
                { months: "9 Months", emi: Math.round((productPrice * 1.08) / 9), rate: "13% p.a.", total: Math.round(productPrice * 1.08) },
                { months: "12 Months", emi: Math.round((productPrice * 1.12) / 12), rate: "14% p.a.", total: Math.round(productPrice * 1.12) },
              ].map((plan) => (
                <div
                  key={plan.months}
                  className="flex items-center justify-between p-3 rounded-2xl border border-border bg-card hover:bg-muted/40 transition text-xs"
                >
                  <div>
                    <span className="font-bold text-foreground">{plan.months}</span>
                    <span className="ml-2 text-[11px] text-emerald-600 font-semibold">{plan.rate}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-primary">₹{plan.emi}/mo</span>
                    <span className="block text-[10px] text-muted-foreground">Total: ₹{plan.total}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button onClick={() => setIsEmiModalOpen(false)} className="rounded-xl font-bold">
                Got It
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
