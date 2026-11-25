import React from "react";
import { Wallet, ShieldCheck, Sparkles, Clock, Gift, CheckCircle2, Lock } from "lucide-react";
import { WALLET_RULES_DEFAULT, type WalletSummary } from "@/lib/api";

interface WalletBalanceCardProps {
  /** Wallet ledger summary from the server (null while loading / signed out) */
  summary: WalletSummary | null;
  loading?: boolean;
}

/**
 * Janani Wallet: first-order reward credit (10% of the first order, valid 90 days,
 * one-time use on a later order of ₹500+ excluding delivery). Balances come from the server ledger.
 */
export function WalletBalanceCard({ summary, loading }: WalletBalanceCardProps) {
  const rules = summary?.rules || WALLET_RULES_DEFAULT;
  const available = summary?.availableBalance ?? 0;
  const locked = summary?.lockedBalance ?? 0;
  const activeCredits = (summary?.credits || []).filter((c) => c.status === "active");

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-6 md:p-8 text-white shadow-xl shadow-emerald-950/20 border border-emerald-700/40">
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 size-64 rounded-full bg-brand-gold/15 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Balance */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="size-3.5 text-brand-gold" />
              Janani Wallet
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300/80">
              <CheckCircle2 className="size-3 text-emerald-400" />
              Synced with your account
            </span>
          </div>

          <div>
            <p className="text-xs uppercase font-medium tracking-wider text-emerald-200/80">Available wallet credit</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-white">
                {loading && !summary ? "…" : `₹${available.toLocaleString("en-IN")}`}
              </span>
              <span className="text-sm font-semibold text-emerald-300">INR</span>
            </div>
            {locked > 0 && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-200">
                <Lock className="size-3.5" />₹{locked.toLocaleString("en-IN")} more unlocks once your first order is delivered
              </p>
            )}
          </div>

          {activeCredits.length > 0 && (
            <div className="space-y-1.5">
              {activeCredits.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-2 text-xs text-emerald-100/90">
                  <Clock className="size-3.5 text-brand-gold shrink-0" />
                  <span>
                    ₹{c.amount.toLocaleString("en-IN")} {c.title.toLowerCase()} • expires {c.expiresOn} ({c.daysLeft} day{c.daysLeft === 1 ? "" : "s"} left)
                    {c.lockedReason ? ` • ${c.lockedReason}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          {summary?.firstOrderRewardEligible && (
            <div className="flex items-start gap-2 rounded-2xl bg-white/10 border border-white/10 p-3 text-xs text-emerald-50 max-w-md">
              <Gift className="size-4 text-brand-gold shrink-0 mt-0.5" />
              <span>
                Place your first order of ₹{rules.minOrderValue}+ (excluding delivery) and get <strong>{rules.rewardPercent}%</strong> of it back as
                wallet credit for your next order.
              </span>
            </div>
          )}
        </div>

        <div className="shrink-0 rounded-2xl bg-white/10 backdrop-blur-md p-3 px-4 border border-white/10 text-[11px] text-emerald-100 flex items-center gap-2 max-w-xs">
          <Wallet className="size-4 text-brand-gold shrink-0" />
          <span>Wallet credit is applied automatically at checkout — no top-up needed.</span>
        </div>
      </div>

      {/* How it works (the real rules) */}
      <div className="relative z-10 mt-6 pt-5 border-t border-emerald-700/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-emerald-200">
        <div className="flex items-start gap-2.5">
          <div className="size-6 rounded-lg bg-emerald-700/50 flex items-center justify-center text-brand-gold shrink-0 mt-0.5 font-bold">%</div>
          <div>
            <p className="font-semibold text-white">{rules.rewardPercent}% back on your first order</p>
            <p className="text-[11px] text-emerald-300/80">On first orders of ₹{rules.minOrderValue}+ (products value, excl. delivery & GST)</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="size-6 rounded-lg bg-emerald-700/50 flex items-center justify-center text-brand-gold shrink-0 mt-0.5">
            <ShieldCheck className="size-3.5" />
          </div>
          <div>
            <p className="font-semibold text-white">Use it on your next order</p>
            <p className="text-[11px] text-emerald-300/80">One-time use on an order of ₹{rules.minOrderValue}+; any unused part lapses</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="size-6 rounded-lg bg-emerald-700/50 flex items-center justify-center text-brand-gold shrink-0 mt-0.5">
            <Clock className="size-3.5" />
          </div>
          <div>
            <p className="font-semibold text-white">Valid for {rules.validityDays} days</p>
            <p className="text-[11px] text-emerald-300/80">Credit expires {rules.validityDays} days after your first order</p>
          </div>
        </div>
      </div>
    </div>
  );
}
