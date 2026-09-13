import React, { useState } from "react";
import { Gift, ChevronDown, ChevronUp, Lock, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface AppliedGiftCard {
  code: string;
  totalBalance: number;
  appliedAmount: number;
  remainingBalance: number;
}

interface GiftCardCardProps {
  appliedGiftCard: AppliedGiftCard | null;
  onApplyGiftCard: (card: AppliedGiftCard | null) => void;
  maxDeductible: number;
}

export function GiftCardCard({
  appliedGiftCard,
  onApplyGiftCard,
  maxDeductible,
}: GiftCardCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cardCode, setCardCode] = useState("");
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = cardCode.trim().toUpperCase();
    const cleanPin = pin.trim();

    if (!cleanCode || !cleanPin) {
      toast.error("Please enter both Gift Card Number and 4-digit PIN.");
      return;
    }

    if (cleanPin.length !== 4) {
      toast.error("Gift card PIN must be 4 digits.");
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);

      // Predefined test cards
      let totalBalance = 250;
      if (cleanCode.includes("500") || cleanCode === "JANANI-GIFT-500") {
        totalBalance = 500;
      } else if (cleanCode.includes("1000")) {
        totalBalance = 1000;
      }

      const appliedAmount = Math.min(totalBalance, Math.max(0, maxDeductible));
      const remainingBalance = totalBalance - appliedAmount;

      const newCard: AppliedGiftCard = {
        code: cleanCode,
        totalBalance,
        appliedAmount,
        remainingBalance,
      };

      onApplyGiftCard(newCard);
      setCardCode("");
      setPin("");
      setIsOpen(false);
      toast.success(`Gift Card ${cleanCode} verified! Applied ₹${appliedAmount}`);
    }, 600);
  };

  const handleRemove = () => {
    onApplyGiftCard(null);
    toast.info("Gift Card removed.");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
      {/* Header */}
      <div
        onClick={() => !appliedGiftCard && setIsOpen(!isOpen)}
        className={`flex items-center justify-between ${
          !appliedGiftCard ? "cursor-pointer" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-xl bg-secondary text-brand-leaf">
            <Gift className="size-4" />
          </span>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-foreground">
              Have a Janani Gift Card / Voucher?
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Redeem digital gift cards and harvest certificates
            </p>
          </div>
        </div>

        {!appliedGiftCard && (
          <button
            type="button"
            className="p-1 text-muted-foreground hover:text-foreground transition"
          >
            {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        )}
      </div>

      {/* When card is applied */}
      {appliedGiftCard ? (
        <div className="mt-3.5 flex items-center justify-between rounded-xl bg-brand-leaf/10 border border-brand-leaf/30 p-3">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-brand-leaf flex items-center justify-center text-white">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-foreground tracking-wider">
                  {appliedGiftCard.code}
                </span>
                <span className="rounded-full bg-brand-leaf/20 text-brand-leaf px-1.5 py-0.5 text-[9px] font-bold">
                  APPLIED
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Applied ₹{appliedGiftCard.appliedAmount} (Card total: ₹{appliedGiftCard.totalBalance})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-bold text-destructive hover:bg-destructive/10 px-2 py-1 rounded-md transition"
          >
            Remove
          </button>
        </div>
      ) : (
        /* Expandable Form */
        isOpen && (
          <form onSubmit={handleApply} className="mt-4 pt-3.5 border-t border-border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-2.5">
              <div>
                <input
                  type="text"
                  placeholder="Gift Card Code (e.g. JANANI-GIFT-500)"
                  value={cardCode}
                  onChange={(e) => setCardCode(e.target.value.toUpperCase())}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-mono font-semibold tracking-wider outline-none focus:border-brand-leaf text-foreground"
                />
              </div>
              <div>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="4-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-mono font-semibold tracking-widest outline-none focus:border-brand-leaf text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Lock className="size-3" /> Test Demo: JANANI-GIFT-500 • PIN: 2026
              </span>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                disabled={isVerifying || !cardCode.trim() || pin.length < 4}
                className="rounded-xl text-xs font-bold px-4 h-9"
              >
                {isVerifying ? "Verifying..." : "Apply Card"}
              </Button>
            </div>
          </form>
        )
      )}
    </div>
  );
}
