import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wallet,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Building,
  ArrowRight,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { type WalletTransaction } from "./types";

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tx: WalletTransaction) => void;
}

const PRESET_AMOUNTS = [
  { amount: 500, label: "₹500", tag: "Starter" },
  { amount: 1000, label: "₹1,000", tag: "Popular + 5% Extra", bonus: 50 },
  { amount: 2000, label: "₹2,000", tag: "Vedic Saver + 8% Extra", bonus: 160 },
  { amount: 5000, label: "₹5,000", tag: "Pantry Patron + 10% Extra", bonus: 500 },
];

export function AddMoneyModal({ isOpen, onClose, onSuccess }: AddMoneyModalProps) {
  const { addWalletBalance } = useStore();
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("1000");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [isProcessing, setIsProcessing] = useState(false);

  const activeBonus =
    PRESET_AMOUNTS.find((p) => p.amount === selectedAmount)?.bonus || 0;

  const handleSelectPreset = (val: number) => {
    setSelectedAmount(val);
    setCustomAmount(String(val));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setCustomAmount(val);
    setSelectedAmount(Number(val) || 0);
  };

  const handleTopUp = async () => {
    const finalAmount = Number(customAmount);
    if (!finalAmount || finalAmount < 100) {
      toast.error("Please enter a minimum top-up amount of ₹100");
      return;
    }

    setIsProcessing(true);

    // Simulate instant gateway authorization
    await new Promise((res) => setTimeout(res, 800));

    const totalCredited = finalAmount + activeBonus;
    addWalletBalance(totalCredited);

    const newTx: WalletTransaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      title: "Wallet Top-up",
      description: `Loaded via ${selectedPaymentMethod.toUpperCase()} ${
        activeBonus > 0 ? `(+₹${activeBonus} Agro Bonus)` : ""
      }`,
      amount: totalCredited,
      type: "credit",
      status: "completed",
      category: "topup",
      referenceId: `GATEWAY-${Date.now().toString().slice(-6)}`,
    };

    onSuccess(newTx);
    setIsProcessing(false);
    toast.success(`Successfully added ₹${totalCredited} to your Farm Wallet!`, {
      description: "Balance updated immediately for zero-friction 1-tap checkout.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6 overflow-hidden rounded-3xl border-border bg-card">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Wallet className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-heading font-bold text-foreground">
                Add Money to Wallet
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                1-tap checkout, zero payment gateway drops, and exclusive harvest discounts.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          {/* Quick preset chips */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Select Top-up Amount
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_AMOUNTS.map((preset) => {
                const isSelected = selectedAmount === preset.amount;
                return (
                  <button
                    key={preset.amount}
                    type="button"
                    onClick={() => handleSelectPreset(preset.amount)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                        : "border-border hover:border-emerald-300 bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-foreground">
                        {preset.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="size-4 text-emerald-600" />
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 block mt-0.5">
                      {preset.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom amount field */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Or Enter Custom Amount</span>
              <span className="text-muted-foreground text-[11px]">Min: ₹100</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
                ₹
              </span>
              <Input
                type="text"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="e.g. 1500"
                className="pl-8 text-lg font-bold h-12 rounded-xl"
              />
            </div>
          </div>

          {/* Bonus callout */}
          {activeBonus > 0 && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
              <Sparkles className="size-4 text-amber-600 shrink-0" />
              <span>
                <strong>Hooray!</strong> You receive an instant bonus of{" "}
                <strong>+₹{activeBonus}</strong> credited straight to your balance.
              </span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Payment Source
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod("upi")}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs transition ${
                  selectedPaymentMethod === "upi"
                    ? "border-emerald-600 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                <Smartphone className="size-4 text-emerald-600" />
                <span>Instant UPI</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod("card")}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs transition ${
                  selectedPaymentMethod === "card"
                    ? "border-emerald-600 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                <CreditCard className="size-4 text-blue-600" />
                <span>Debit/Card</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod("netbanking")}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs transition ${
                  selectedPaymentMethod === "netbanking"
                    ? "border-emerald-600 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                <Building className="size-4 text-purple-600" />
                <span>Net Banking</span>
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-secondary/40 p-2.5 rounded-xl">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>
              100% Reserve Backed • Instant 1-tap checkout • Unused funds refundable anytime
            </span>
          </div>

          {/* Action button */}
          <Button
            type="button"
            onClick={handleTopUp}
            disabled={isProcessing || !Number(customAmount) || Number(customAmount) < 100}
            className="w-full h-12 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            {isProcessing ? (
              <span>Authorizing with Bank...</span>
            ) : (
              <>
                <Zap className="size-4 fill-white" />
                <span>
                  Add ₹
                  {(Number(customAmount) || 0) + activeBonus}{" "}
                  {activeBonus > 0 ? `(Incl. ₹${activeBonus} Bonus)` : "to Wallet"}
                </span>
                <ArrowRight className="size-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
