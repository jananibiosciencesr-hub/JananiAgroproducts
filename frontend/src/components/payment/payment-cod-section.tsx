import React, { useState } from "react";
import { Wallet, ShieldCheck, CheckCircle2, Phone, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentCodSectionProps {
  amount: number;
  orderNumber: string;
  customerPhone: string;
  onPaymentSuccess: (details: { method: string; transactionId: string }) => void;
  onPaymentFailure: (reason: string) => void;
  simulateFailure: boolean;
}

export function PaymentCodSection({
  amount,
  orderNumber,
  customerPhone,
  onPaymentSuccess,
  onPaymentFailure,
  simulateFailure,
}: PaymentCodSectionProps) {
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendOtp = () => {
    setOtpSent(true);
    setEnteredOtp("4829");
    toast.success(`Verification OTP sent to +91 ${customerPhone || "9311416225"}! (Test code: 4829)`);
  };

  const handleConfirmCodOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.length !== 4) {
      toast.error("Please enter the 4-digit SMS verification code.");
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (simulateFailure) {
        onPaymentFailure("COD Verification failed: Mobile OTP was invalid or expired.");
      } else {
        const txnId = `COD-${Date.now().toString().slice(-6)}`;
        onPaymentSuccess({
          method: "Cash on Delivery (Doorstep Verification)",
          transactionId: txnId,
        });
      }
    }, 1000);
  };

  return (
    <div className="space-y-4 py-1">
      {/* Guidelines Card */}
      <div className="rounded-2xl bg-secondary/80 p-4 border border-border space-y-2 text-xs">
        <div className="flex items-center gap-2 text-brand-leaf font-bold">
          <Wallet className="size-4" />
          <span>Doorstep Cash on Delivery Guidelines</span>
        </div>
        <ul className="space-y-1.5 text-muted-foreground list-disc pl-4 text-[11px]">
          <li>Keep exact cash of <strong>₹{amount}</strong> ready at the time of harvest arrival.</li>
          <li>Our Delhivery / Shiprocket courier partner also carries a dynamic UPI QR scanner for contactless doorstep payment.</li>
          <li>Please verify tamper-evident harvest seal before accepting the delivery box.</li>
        </ul>
      </div>

      {/* Anti-Fraud SMS OTP Verification */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold text-foreground block">
              1-Time Mobile Verification
            </span>
            <span className="text-[11px] text-muted-foreground">
              Required to prevent accidental or fraudulent harvest dispatches.
            </span>
          </div>
          {!otpSent && (
            <Button
              type="button"
              onClick={handleSendOtp}
              variant="outline"
              size="sm"
              className="text-xs font-bold rounded-xl shrink-0"
            >
              Send SMS OTP
            </Button>
          )}
        </div>

        {otpSent ? (
          <form onSubmit={handleConfirmCodOrder} className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              <input
                required
                maxLength={4}
                placeholder="4-digit OTP"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="h-11 w-36 rounded-xl border border-input bg-background px-3 text-center font-mono text-base font-bold tracking-widest outline-none focus:border-brand-leaf text-foreground"
              />
              <span className="text-[11px] text-muted-foreground">
                Sent to <strong>+91 {customerPhone.slice(-4) || "6225"}</strong> (Test: <strong>4829</strong>)
              </span>
            </div>

            <Button
              type="submit"
              disabled={isVerifying || enteredOtp.length < 4}
              variant="gold"
              size="lg"
              className="w-full text-xs font-bold rounded-2xl h-11 shadow-sm gap-2 mt-2"
            >
              {isVerifying ? (
                "Verifying OTP & Placing Order..."
              ) : (
                <>
                  Confirm Cash on Delivery Order • ₹{amount}
                  <CheckCircle2 className="size-4" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5 pt-1">
            <AlertCircle className="size-3.5 shrink-0" />
            Click &quot;Send SMS OTP&quot; to verify your delivery contact number.
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/60">
        <ShieldCheck className="size-3.5 text-brand-leaf" />
        <span>Verified Safe Dispatch Guarantee</span>
      </div>
    </div>
  );
}
