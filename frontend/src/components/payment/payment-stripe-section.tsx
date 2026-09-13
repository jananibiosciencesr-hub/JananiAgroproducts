import React, { useState } from "react";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentStripeSectionProps {
  amount: number;
  orderNumber: string;
  customerName: string;
  onPaymentSuccess: (details: { method: string; transactionId: string }) => void;
  onPaymentFailure: (reason: string) => void;
  simulateFailure: boolean;
}

export function PaymentStripeSection({
  amount,
  orderNumber,
  customerName,
  onPaymentSuccess,
  onPaymentFailure,
  simulateFailure,
}: PaymentStripeSectionProps) {
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardholderName, setCardholderName] = useState(customerName || "Neha Patel");
  const [expiry, setExpiry] = useState("11/29");
  const [cvc, setCvc] = useState("314");
  const [postalCode, setPostalCode] = useState("380054");
  const [isProcessing, setIsProcessing] = useState(false);

  // Format card number with spaces
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(" "));
  };

  // Format expiry MM/YY
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 2) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  // Detect card brand
  const getCardBrand = (number: string) => {
    const clean = number.replace(/\D/g, "");
    if (clean.startsWith("4")) return "Visa";
    if (/^(5[1-5]|2[2-7])/.test(clean)) return "Mastercard";
    if (/^3[47]/.test(clean)) return "American Express";
    if (/^(60|65|8[1-2])/.test(clean)) return "RuPay";
    return "Card";
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    toast.info("Connecting to Stripe 3DS Card Network...");

    setTimeout(() => {
      setIsProcessing(false);
      if (simulateFailure) {
        onPaymentFailure("Stripe Card Authorization failed: Your card was declined by the issuer.");
      } else {
        const txnId = `ch_stripe_${Date.now().toString().slice(-8)}`;
        onPaymentSuccess({
          method: `Stripe (${getCardBrand(cardNumber)})`,
          transactionId: txnId,
        });
      }
    }, 1600);
  };

  const handleFillTestCard = () => {
    setCardNumber("4242 4242 4242 4242");
    setExpiry("12/29");
    setCvc("888");
    toast.success("Stripe Global Test Card auto-filled!");
  };

  return (
    <div className="space-y-5 py-1">
      {/* Test Card Auto-Fill Strip */}
      <div className="flex items-center justify-between rounded-xl bg-secondary/80 p-3 border border-border text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-brand-gold" />
          <span className="font-semibold text-foreground">Global Card Mode (Stripe)</span>
        </div>
        <button
          type="button"
          onClick={handleFillTestCard}
          className="text-brand-leaf font-bold hover:underline text-[11px]"
        >
          Auto-Fill Test Card
        </button>
      </div>

      <form onSubmit={handlePay} className="space-y-4 text-xs font-semibold">
        {/* Card Number */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-foreground">Card Number *</label>
            <span className="text-[10px] font-mono font-bold text-brand-leaf uppercase">
              {getCardBrand(cardNumber)}
            </span>
          </div>
          <div className="relative">
            <input
              required
              type="text"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 pl-10 text-xs font-mono font-bold outline-none focus:border-brand-leaf text-foreground tracking-wider"
            />
            <CreditCard className="size-4 text-muted-foreground absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Cardholder Name */}
        <div className="space-y-1.5">
          <label className="text-foreground">Cardholder Name *</label>
          <input
            required
            type="text"
            placeholder="Name as printed on card"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground"
          />
        </div>

        {/* Expiry, CVC, Postal Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-foreground">Expiry (MM/YY) *</label>
            <input
              required
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => handleExpiryChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-xs font-mono font-bold text-center outline-none focus:border-brand-leaf text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground flex items-center justify-between">
              <span>CVC / CVV *</span>
              <span title="3 or 4 digit security code on back of card" className="cursor-help">
                <HelpCircle className="size-3 text-muted-foreground" />
              </span>
            </label>
            <input
              required
              type="password"
              maxLength={4}
              placeholder="•••"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-xs font-mono font-bold text-center outline-none focus:border-brand-leaf text-foreground tracking-widest"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground">ZIP / Postal *</label>
            <input
              required
              placeholder="Postal Code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-xs font-mono font-bold text-center outline-none focus:border-brand-leaf text-foreground"
            />
          </div>
        </div>

        {/* Pay Button */}
        <Button
          type="submit"
          disabled={isProcessing || !cardNumber.trim()}
          variant="gold"
          size="lg"
          className="w-full text-xs font-bold rounded-2xl h-11 shadow-sm gap-2 mt-2"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing 3D Secure Card Verification...
            </span>
          ) : (
            <>
              Pay ₹{amount} with Stripe Card
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border/60">
        <ShieldCheck className="size-3.5 text-brand-leaf" />
        <span>Stripe PCI Service Provider Level 1 Certified</span>
      </div>
    </div>
  );
}
