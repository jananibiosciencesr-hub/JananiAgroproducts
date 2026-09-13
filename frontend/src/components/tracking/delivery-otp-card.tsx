import React, { useState } from "react";
import { KeyRound, Copy, Check, RotateCcw, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeliveryOtpCardProps {
  initialOtp?: string;
  recipientPhone?: string;
}

export function DeliveryOtpCard({
  initialOtp = "5824",
  recipientPhone = "+91 93114 16225",
}: DeliveryOtpCardProps) {
  const [otp, setOtp] = useState(initialOtp);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    toast.success("Delivery Handover OTP copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setOtp(newOtp);
      setRegenerating(false);
      toast.success(`New Delivery OTP generated: ${newOtp}`);
    }, 400);
  };

  return (
    <div className="rounded-3xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold/10 via-card to-card p-6 sm:p-7 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center">
            <KeyRound className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Secure Delivery Handover OTP
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Required by rider at doorstep
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRegenerate}
          disabled={regenerating}
          className="text-xs font-semibold text-brand-gold hover:text-brand-gold/80 flex items-center gap-1 transition"
          title="Generate fresh OTP"
        >
          <RotateCcw className={`size-3.5 ${regenerating ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh OTP</span>
        </button>
      </div>

      {/* Digits Display */}
      <div className="flex items-center justify-center gap-3 py-2">
        {otp.split("").map((digit, idx) => (
          <div
            key={idx}
            className="size-14 sm:size-16 rounded-2xl bg-card border-2 border-brand-gold/40 flex items-center justify-center font-display text-2xl sm:text-3xl font-extrabold text-foreground shadow-sm"
          >
            {digit}
          </div>
        ))}
      </div>

      {/* Copy & Notification Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
        <span className="text-muted-foreground">
          Sent via SMS to <strong className="text-foreground">{recipientPhone}</strong>
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="rounded-full text-xs font-bold gap-1.5 self-center sm:self-auto border-brand-gold/40 hover:bg-brand-gold/10"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-brand-leaf" /> Copied!
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> Copy OTP
            </>
          )}
        </Button>
      </div>

      {/* Tamper warning */}
      <div className="rounded-2xl bg-secondary/80 p-3 border border-border flex items-start gap-2.5 text-[11px] text-muted-foreground leading-relaxed">
        <ShieldCheck className="size-4 text-brand-leaf shrink-0 mt-0.5" />
        <span>
          <strong>Patron Security Advisory:</strong> Inspect the tamper-evident seal and container integrity before disclosing this OTP to the delivery executive.
        </span>
      </div>
    </div>
  );
}
