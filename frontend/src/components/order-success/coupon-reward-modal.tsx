import React, { useState } from "react";
import { X, Sparkles, Tag, Copy, Check, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CouponRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  couponCode?: string;
  discountPercentage?: number;
}

export function CouponRewardModal({
  isOpen,
  onClose,
  couponCode = "NEXTHARVEST15",
  discountPercentage = 15,
}: CouponRewardModalProps) {
  const [copied, setCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    toast.success(`Coupon ${couponCode} copied! Applied to next harvest.`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-luxe text-center space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
        >
          <X className="size-5" />
        </button>

        {/* Header Graphic */}
        <div className="mx-auto size-16 rounded-3xl bg-brand-leaf/15 text-brand-leaf flex items-center justify-center shadow-xs animate-bounce duration-1000">
          <Sparkles className="size-8" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-leaf/15 text-brand-leaf px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
            Surprise Milestone Unlock
          </span>
          <h3 className="font-display text-2xl font-bold text-foreground mt-2">
            You Unlocked {discountPercentage}% OFF!
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            As a special thank you for supporting regenerative Indian organic farms, enjoy <strong>{discountPercentage}% off</strong> your next harvest basket.
          </p>
        </div>

        {/* Interactive Scratch / Reveal Card */}
        <div className="rounded-2xl border-2 border-dashed border-brand-leaf/40 bg-brand-leaf/5 p-4 space-y-3">
          {!isRevealed ? (
            <div
              onClick={() => setIsRevealed(true)}
              className="cursor-pointer py-4 rounded-xl bg-gradient-to-r from-brand-leaf/20 via-brand-gold/20 to-brand-leaf/20 flex flex-col items-center justify-center gap-1.5 border border-brand-leaf/30 hover:opacity-90 transition select-none"
            >
              <Gift className="size-6 text-brand-leaf animate-pulse" />
              <span className="text-xs font-bold text-foreground">
                Tap Here to Reveal Your Secret Voucher
              </span>
              <span className="text-[10px] text-muted-foreground">
                Valid for 30 days on all items
              </span>
            </div>
          ) : (
            <div className="space-y-3 animate-in zoom-in-95 duration-200">
              <span className="text-[10px] font-bold text-brand-leaf uppercase tracking-wider block">
                Exclusive Loyalty Voucher
              </span>
              <div className="flex items-center justify-between gap-2 bg-background p-2.5 rounded-xl border border-brand-leaf/40">
                <strong className="font-mono text-base font-extrabold text-brand-leaf tracking-widest pl-2">
                  {couponCode}
                </strong>
                <Button
                  type="button"
                  variant="gold"
                  size="sm"
                  onClick={handleCopy}
                  className="rounded-lg text-xs font-bold gap-1.5 h-8 px-4 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" /> Copy Code
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Min. cart value ₹500 • Automatically saved to your account!
              </p>
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="w-full text-xs font-bold rounded-2xl h-11"
        >
          Got It, Thanks!
        </Button>
      </div>
    </div>
  );
}
