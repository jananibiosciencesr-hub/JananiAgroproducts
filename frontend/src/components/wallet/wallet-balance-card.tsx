import React, { useState } from "react";
import {
  Wallet,
  Plus,
  ShieldCheck,
  Zap,
  Sparkles,
  RefreshCcw,
  ArrowUpRight,
  Gift,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/store-provider";
import { AddMoneyModal } from "./add-money-modal";
import { type WalletTransaction } from "./types";

interface WalletBalanceCardProps {
  onTransactionAdded: (tx: WalletTransaction) => void;
}

export function WalletBalanceCard({ onTransactionAdded }: WalletBalanceCardProps) {
  const { user } = useStore();
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);

  const balance = user?.walletBalance ?? 250;

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-6 md:p-8 text-white shadow-xl shadow-emerald-950/20 border border-emerald-700/40">
        {/* Background decorative glows */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 size-64 rounded-full bg-brand-gold/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Balance Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="size-3.5 text-brand-gold" />
                Janani Farm Passbook
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300/80">
                <CheckCircle2 className="size-3 text-emerald-400" />
                Active & Verified
              </span>
            </div>

            <div>
              <p className="text-xs uppercase font-medium tracking-wider text-emerald-200/80">
                Available Wallet Balance
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-white">
                  ₹{balance.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-semibold text-emerald-300">
                  INR
                </span>
              </div>
            </div>

            {/* Quick value badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100/90 pt-1">
              <div className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-brand-gold fill-brand-gold" />
                <span>1-Tap Instant Checkout</span>
              </div>
              <span className="text-emerald-500">•</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                <span>100% Refund Protected</span>
              </div>
              <span className="text-emerald-500">•</span>
              <div className="flex items-center gap-1.5">
                <RefreshCcw className="size-3.5 text-emerald-400" />
                <span>Never Expires</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Button
              type="button"
              onClick={() => setIsAddMoneyOpen(true)}
              className="h-12 px-6 rounded-2xl bg-brand-gold hover:bg-amber-400 text-forest font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="size-4 stroke-[3]" />
              <span>Add Money to Wallet</span>
            </Button>

            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-2xl bg-white/10 backdrop-blur-md p-2.5 px-3 border border-white/10 text-[11px] text-emerald-100 flex items-center gap-2">
                <Gift className="size-4 text-brand-gold shrink-0" />
                <span>Get up to <strong>10% bonus</strong> on recharge packs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner with patron perks */}
        <div className="mt-6 pt-5 border-t border-emerald-700/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-emerald-200">
          <div className="flex items-start gap-2.5">
            <div className="size-6 rounded-lg bg-emerald-700/50 flex items-center justify-center text-brand-gold shrink-0 mt-0.5">
              0%
            </div>
            <div>
              <p className="font-semibold text-white">Zero Gateway Drop</p>
              <p className="text-[11px] text-emerald-300/80">No bank OTP delays during high demand seasons</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="size-6 rounded-lg bg-emerald-700/50 flex items-center justify-center text-brand-gold shrink-0 mt-0.5">
              <ArrowUpRight className="size-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">Priority Farm Dispatch</p>
              <p className="text-[11px] text-emerald-300/80">Wallet orders receive express same-day sorting</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="size-6 rounded-lg bg-emerald-700/50 flex items-center justify-center text-brand-gold shrink-0 mt-0.5">
              ₹
            </div>
            <div>
              <p className="font-semibold text-white">Instant Refunds</p>
              <p className="text-[11px] text-emerald-300/80">Reversals credited within 3 seconds, not 7 days</p>
            </div>
          </div>
        </div>
      </div>

      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        onSuccess={onTransactionAdded}
      />
    </>
  );
}
