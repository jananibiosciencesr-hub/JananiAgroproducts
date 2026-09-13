import React from "react";
import { Wallet, Sparkles, Check, ArrowRight } from "lucide-react";

interface WalletToggleProps {
  walletBalance: number;
  isWalletEnabled: boolean;
  onToggleWallet: (enabled: boolean) => void;
  maxDeductible: number; // max amount that can be deducted (e.g. order payable before wallet)
}

export function WalletToggleCard({
  walletBalance,
  isWalletEnabled,
  onToggleWallet,
  maxDeductible,
}: WalletToggleProps) {
  const actualDeduction = Math.min(walletBalance, Math.max(0, maxDeductible));
  const remainingWallet = Math.max(0, walletBalance - (isWalletEnabled ? actualDeduction : 0));

  if (walletBalance <= 0) return null;

  return (
    <div
      onClick={() => onToggleWallet(!isWalletEnabled)}
      className={`relative cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
        isWalletEnabled
          ? "border-brand-leaf bg-brand-leaf/10 shadow-xs ring-1 ring-brand-leaf/30"
          : "border-border bg-card hover:border-brand-leaf/40 hover:bg-secondary/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`grid size-10 place-items-center rounded-xl transition-colors ${
              isWalletEnabled
                ? "bg-brand-leaf text-white"
                : "bg-secondary text-brand-leaf"
            }`}
          >
            <Wallet className="size-5" />
          </span>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-foreground">
                Janani Farm Wallet
              </h4>
              <span className="rounded-full bg-brand-leaf/15 text-brand-leaf px-2 py-0.5 text-[10px] font-extrabold uppercase">
                Available: ₹{walletBalance}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-0.5">
              {isWalletEnabled ? (
                <span className="text-brand-leaf font-semibold">
                  Applying ₹{actualDeduction} credit • ₹{remainingWallet} left in wallet
                </span>
              ) : (
                <span>Check to deduct up to ₹{actualDeduction} from total payable</span>
              )}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="relative inline-flex items-center">
          <button
            type="button"
            role="switch"
            aria-checked={isWalletEnabled}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWallet(!isWalletEnabled);
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isWalletEnabled ? "bg-brand-leaf" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isWalletEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
