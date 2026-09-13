import React, { useState } from "react";
import { Wallet, Sparkles, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentWalletSectionProps {
  amount: number;
  orderNumber: string;
  walletBalance: number;
  onPaymentSuccess: (details: { method: string; transactionId: string }) => void;
  onPaymentFailure: (reason: string) => void;
  simulateFailure: boolean;
}

export function PaymentWalletSection({
  amount,
  orderNumber,
  walletBalance,
  onPaymentSuccess,
  onPaymentFailure,
  simulateFailure,
}: PaymentWalletSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isSufficient = walletBalance >= amount;
  const remainingShortfall = Math.max(0, amount - walletBalance);

  const handlePayWithWallet = () => {
    setIsProcessing(true);
    toast.info("Debiting Janani Farm Wallet ledger...");

    setTimeout(() => {
      setIsProcessing(false);
      if (simulateFailure) {
        onPaymentFailure("Wallet Transaction failed: Ledger synchronization error.");
      } else {
        const txnId = `WLT-${Date.now().toString().slice(-8)}`;
        onPaymentSuccess({
          method: "Janani Farm Wallet",
          transactionId: txnId,
        });
      }
    }, 1000);
  };

  return (
    <div className="space-y-4 py-1">
      {/* Wallet Balance Status Card */}
      <div className="rounded-3xl border border-brand-leaf/30 bg-brand-leaf/5 p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-brand-leaf text-white flex items-center justify-center shadow-xs">
            <Wallet className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Janani Farm Wallet
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <strong className="font-display text-2xl font-bold text-foreground">
                ₹{walletBalance}
              </strong>
              <span className="text-xs font-semibold text-brand-leaf">
                Active & Verified
              </span>
            </div>
          </div>
        </div>

        <span className="text-xs font-bold bg-brand-leaf/20 text-brand-leaf px-2.5 py-1 rounded-full">
          Instant 1-Click
        </span>
      </div>

      {isSufficient ? (
        <div className="space-y-3">
          <div className="rounded-2xl bg-secondary/80 p-3.5 border border-border text-xs text-foreground space-y-1">
            <p className="font-semibold">
              ✓ Full amount of <strong>₹{amount}</strong> will be debited from your Farm Wallet.
            </p>
            <p className="text-muted-foreground text-[11px]">
              Remaining wallet balance after order: <strong>₹{walletBalance - amount}</strong>
            </p>
          </div>

          <Button
            type="button"
            onClick={handlePayWithWallet}
            disabled={isProcessing}
            variant="gold"
            size="lg"
            className="w-full text-xs font-bold rounded-2xl h-11 shadow-sm gap-2 mt-1"
          >
            {isProcessing ? (
              "Processing Wallet Payment..."
            ) : (
              <>
                Confirm 1-Click Payment • ₹{amount}
                <CheckCircle2 className="size-4" />
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-amber-600 font-bold">
              <AlertCircle className="size-4 shrink-0" />
              <span>Insufficient Full Wallet Balance</span>
            </div>
            <p className="text-muted-foreground text-[11px]">
              Your wallet has ₹{walletBalance}, but the order total is ₹{amount}. You can apply ₹{walletBalance} from your wallet and pay the remaining <strong>₹{remainingShortfall}</strong> via UPI or Card.
            </p>
          </div>

          <Button
            type="button"
            onClick={handlePayWithWallet}
            disabled={isProcessing || walletBalance <= 0}
            variant="outline"
            size="lg"
            className="w-full text-xs font-bold rounded-2xl h-11 border-brand-leaf/40 text-brand-leaf hover:bg-brand-leaf/10 gap-2"
          >
            Apply ₹{walletBalance} Wallet & Pay Remaining ₹{remainingShortfall} via UPI
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/60">
        <ShieldCheck className="size-3.5 text-brand-leaf" />
        <span>Instant Balance Updates on Verified Ledger</span>
      </div>
    </div>
  );
}
