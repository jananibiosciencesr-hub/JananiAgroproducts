import React, { useState } from "react";
import { X, Gift, Copy, Check, Share2, Sparkles, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReferEarnModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
}

export function ReferEarnModal({
  isOpen,
  onClose,
  referralCode = "NEHA250",
}: ReferEarnModalProps) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const referralUrl = `https://jananiagro.com/invite/${referralCode}`;
  const shareMessage = `Hey! I just ordered single-origin organic cold-pressed oils & pantry staples from Janani Agro Products. Use my referral link to get ₹150 off your first harvest basket: ${referralUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
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

        {/* Header Icon */}
        <div className="mx-auto size-16 rounded-3xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shadow-xs">
          <Gift className="size-8" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/15 text-brand-gold px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="size-3" /> Patron Community Privilege
          </span>
          <h3 className="font-display text-2xl font-bold text-foreground mt-2">
            Give ₹150, Earn ₹250!
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Introduce farm-pure wellness to friends. They get <strong>₹150 off</strong> their first order, and you earn <strong>₹250</strong> in your Farm Wallet!
          </p>
        </div>

        {/* Referral Link Copy Field */}
        <div className="rounded-2xl bg-secondary/80 p-3.5 border border-border space-y-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block text-left">
            Your Personal Invite Code
          </span>
          <div className="flex items-center justify-between gap-2 bg-background p-2 rounded-xl border border-input">
            <span className="font-mono text-xs font-bold text-foreground truncate pl-1">
              {referralUrl}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="rounded-lg text-xs font-bold gap-1.5 h-8 px-3 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-brand-leaf" /> Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* WhatsApp & Social Share */}
        <div className="space-y-2 pt-1">
          <Button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs h-11 rounded-2xl shadow-sm gap-2"
          >
            <MessageCircle className="size-4" /> Share on WhatsApp
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCopyLink}
            className="w-full text-xs font-bold rounded-2xl h-11 gap-2"
          >
            <Share2 className="size-4" /> Copy Direct Invitation Link
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground italic">
          Wallet bonuses automatically credit as soon as your friend&apos;s first harvest is delivered.
        </p>
      </div>
    </div>
  );
}
