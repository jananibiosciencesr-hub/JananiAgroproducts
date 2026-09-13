import React, { useState } from "react";
import { Gift, Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentGiftcardSectionProps {
  amount: number;
  orderNumber: string;
  onPaymentSuccess: (details: { method: string; transactionId: string }) => void;
  onPaymentFailure: (reason: string) => void;
  simulateFailure: boolean;
}

export function PaymentGiftcardSection({
  amount,
  orderNumber,
  onPaymentSuccess,
  onPaymentFailure,
  simulateFailure,
}: PaymentGiftcardSectionProps) {
  const [cardCode, setCardCode] = useState("JANANI-GIFT-500");
  const [pin, setPin] = useState("2026");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRedeemGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = cardCode.trim().toUpperCase();
    const cleanPin = pin.trim();

    if (!cleanCode || cleanPin.length !== 4) {
      toast.error("Please enter a valid Gift Card code and 4-digit PIN.");
      return;
    }

    setIsProcessing(true);
    toast.info("Validating harvest gift voucher on secure vault...");

    setTimeout(() => {
      setIsProcessing(false);
      if (simulateFailure) {
        onPaymentFailure("Gift Card redemption failed: Card balance exhausted or invalid security PIN.");
      } else {
        const txnId = `GC-${Date.now().toString().slice(-8)}`;
        onPaymentSuccess({
          method: `Digital Gift Card (${cleanCode})`,
          transactionId: txnId,
        });
      }
    }, 1100);
  };

  return (
    <div className="space-y-4 py-1">
      <div className="rounded-2xl bg-secondary/80 p-3.5 border border-border text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Gift className="size-4 text-brand-gold" />
          <span>Test Card Pre-loaded</span>
        </div>
        <span className="text-[11px] font-mono text-brand-leaf font-bold">
          Code: JANANI-GIFT-500 • PIN: 2026
        </span>
      </div>

      <form onSubmit={handleRedeemGiftCard} className="space-y-3.5 text-xs font-semibold">
        <div className="space-y-1.5">
          <label className="text-foreground">16-Character Gift Card Number *</label>
          <input
            required
            type="text"
            placeholder="e.g. JANANI-GIFT-500"
            value={cardCode}
            onChange={(e) => setCardCode(e.target.value.toUpperCase())}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-xs font-mono font-bold tracking-wider outline-none focus:border-brand-leaf text-foreground uppercase"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-foreground">4-Digit Security PIN *</label>
          <input
            required
            type="password"
            maxLength={4}
            placeholder="4 digits"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="h-11 w-40 rounded-xl border border-input bg-background px-3 text-center text-xs font-mono font-bold tracking-widest outline-none focus:border-brand-leaf text-foreground"
          />
        </div>

        <Button
          type="submit"
          disabled={isProcessing || !cardCode.trim() || pin.length < 4}
          variant="gold"
          size="lg"
          className="w-full text-xs font-bold rounded-2xl h-11 shadow-sm gap-2 mt-2"
        >
          {isProcessing ? (
            "Verifying & Redeeming Card..."
          ) : (
            <>
              Redeem Card & Complete Order • ₹{amount}
              <CheckCircle2 className="size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/60">
        <ShieldCheck className="size-3.5 text-brand-leaf" />
        <span>Authentic Janani Agro Harvest Voucher</span>
      </div>
    </div>
  );
}
