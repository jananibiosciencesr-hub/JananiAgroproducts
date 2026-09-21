import React, { useState } from "react";
import { Building, ShieldCheck, ArrowRight, CheckCircle2, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentNetbankingSectionProps {
  amount: number;
  orderNumber: string;
  onPaymentSuccess: (details: { method: string; transactionId: string }) => void;
  onPaymentFailure: (reason: string) => void;
  simulateFailure: boolean;
}

const POPULAR_BANKS = [
  { id: "hdfc", name: "HDFC Bank", short: "HDFC", color: "#004c8f" },
  { id: "icici", name: "ICICI Bank", short: "ICICI", color: "#b02a30" },
  { id: "sbi", name: "State Bank of India", short: "SBI", color: "#280071" },
  { id: "axis", name: "Axis Bank", short: "AXIS", color: "#97144d" },
  { id: "kotak", name: "Kotak Mahindra Bank", short: "KOTAK", color: "#ed1c24" },
  { id: "pnb", name: "Punjab National Bank", short: "PNB", color: "#a20a3a" },
];

const OTHER_BANKS = [
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Bank of India",
  "IndusInd Bank",
  "Yes Bank",
  "IDBI Bank",
  "Federal Bank",
  "IDFC FIRST Bank",
  "Indian Bank",
  "Central Bank of India",
  "RBL Bank",
  "Standard Chartered Bank",
  "AU Small Finance Bank",
];

export function PaymentNetbankingSection({
  amount,
  orderNumber,
  onPaymentSuccess,
  onPaymentFailure,
  simulateFailure,
}: PaymentNetbankingSectionProps) {
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [isSimulatingBankAuth, setIsSimulatingBankAuth] = useState(false);
  const [bankUsername, setBankUsername] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartBankAuth = () => {
    setIsSimulatingBankAuth(true);
  };

  const handleAuthorizeBankLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSimulatingBankAuth(false);
      if (simulateFailure) {
        onPaymentFailure(`NetBanking authorization failed at ${selectedBank}: Gateway timed out.`);
      } else {
        const txnId = `NB-${Date.now().toString().slice(-8)}`;
        onPaymentSuccess({
          method: `NetBanking (${selectedBank})`,
          transactionId: txnId,
        });
      }
    }, 1400);
  };

  return (
    <div className="space-y-5 py-1">
      {/* Top Banks Grid */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground">
          Select From Popular Indian Banks:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {POPULAR_BANKS.map((bank) => {
            const isSelected = selectedBank === bank.name;
            return (
              <button
                type="button"
                key={bank.id}
                onClick={() => setSelectedBank(bank.name)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                  isSelected
                    ? "border-brand-leaf bg-brand-leaf/10 ring-1 ring-brand-leaf/30"
                    : "border-border bg-card hover:border-brand-leaf/40 hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="size-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px]"
                    style={{ backgroundColor: bank.color }}
                  >
                    {bank.short}
                  </span>
                  <span className="font-bold text-xs text-foreground">
                    {bank.short}
                  </span>
                </div>
                {isSelected && <CheckCircle2 className="size-4 text-brand-leaf" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* All Banks Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground">
          Or Choose Any Other Bank:
        </label>
        <select
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf text-foreground font-semibold"
        >
          {POPULAR_BANKS.map((b) => (
            <option key={b.id} value={b.name}>
              {b.name}
            </option>
          ))}
          <option disabled>──────────</option>
          {OTHER_BANKS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Submit CTA */}
      <Button
        type="button"
        onClick={handleStartBankAuth}
        variant="gold"
        size="lg"
        className="w-full text-xs font-bold rounded-2xl h-11 shadow-sm gap-2"
      >
        Proceed to {selectedBank} • ₹{amount}
        <ArrowRight className="size-4" />
      </Button>

      {/* Bank Authorization Simulator Modal */}
      {isSimulatingBankAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-luxe space-y-4">
            <button
              type="button"
              onClick={() => setIsSimulatingBankAuth(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <X className="size-4" />
            </button>

            <div className="text-center space-y-1">
              <span className="size-10 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
                <Building className="size-5" />
              </span>
              <h3 className="font-display text-base font-bold text-foreground">
                {selectedBank} Retail NetBanking
              </h3>
              <p className="text-xs text-muted-foreground">
                Authorizing payment of <strong>₹{amount}</strong> to Janani Agro
              </p>
            </div>

            <form onSubmit={handleAuthorizeBankLogin} className="space-y-3 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-foreground">Customer / User ID</label>
                <input
                  required
                  value={bankUsername}
                  onChange={(e) => setBankUsername(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-foreground">NetBanking Password</label>
                <input
                  required
                  type="password"
                  defaultValue="password123"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-brand-leaf font-mono tracking-widest"
                />
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  type="submit"
                  disabled={isProcessing}
                  variant="gold"
                  className="w-full text-xs font-bold rounded-xl h-10 shadow-sm"
                >
                  {isProcessing ? "Authorizing Transfer..." : "Confirm & Transfer"}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsSimulatingBankAuth(false)}
                  className="w-full text-center text-[11px] text-muted-foreground hover:underline"
                >
                  Cancel and Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security info */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border/60">
        <ShieldCheck className="size-3.5 text-brand-leaf" />
        <span>RBI Dual-Factor Authentication Protocol</span>
      </div>
    </div>
  );
}
