import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  Wallet,
  Gift,
  Tag,
  Home,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Award,
} from "lucide-react";
import { WalletBalanceCard } from "@/components/wallet/wallet-balance-card";
import { WalletTransactionsLedger } from "@/components/wallet/wallet-transactions-ledger";
import { ReferralProgramSection } from "@/components/wallet/referral-program-section";
import { CouponCenterSection } from "@/components/wallet/coupon-center-section";
import { type WalletTransaction } from "@/components/wallet/types";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Farm Wallet & Refer & Earn — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content:
          "Manage your Janani Agro Farm Wallet balance, view transaction passbook, refer friends to earn ₹250 instant cash, and browse active discount coupon codes.",
      },
    ],
  }),
  component: WalletPage,
});

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "TXN-884920",
    date: "12 Sep 2026",
    title: "Wallet Top-up",
    description: "Instant UPI Top-up via PhonePe (+₹50 Agro Bonus)",
    amount: 1050,
    type: "credit",
    status: "completed",
    category: "topup",
    referenceId: "UPI-4091823901",
  },
  {
    id: "TXN-874102",
    date: "08 Sep 2026",
    title: "Referral Cash Reward",
    description: "Friend Rohan Sharma completed first harvest order",
    amount: 250,
    type: "credit",
    status: "completed",
    category: "referral",
    orderId: "JA-9042",
  },
  {
    id: "TXN-863901",
    date: "04 Sep 2026",
    title: "Order Payment",
    description: "Cold-Pressed Sesame Oil & Vedic Bansi Wheat",
    amount: 540,
    type: "debit",
    status: "completed",
    category: "order_payment",
    orderId: "JA-8921",
  },
  {
    id: "TXN-851294",
    date: "28 Aug 2026",
    title: "Monsoon Harvest Cashback",
    description: "Cashback credited from organic ghee promotion",
    amount: 150,
    type: "credit",
    status: "completed",
    category: "cashback",
    orderId: "JA-8710",
  },
  {
    id: "TXN-840112",
    date: "15 Aug 2026",
    title: "Harvest Welcome Reward",
    description: "Special sign-up patron wallet grant",
    amount: 250,
    type: "credit",
    status: "completed",
    category: "cashback",
  },
];

type ActiveViewTab = "all" | "wallet" | "referrals" | "coupons";

export function WalletPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<ActiveViewTab>("all");

  const handleTransactionAdded = (newTx: WalletTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 space-y-6">
        {/* BREADCRUMB */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center space-x-2 text-xs text-muted-foreground"
        >
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="size-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="size-3" />
          <Link
            to="/profile"
            className="hover:text-foreground transition-colors"
          >
            My Account
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-foreground">
            Farm Wallet & Rewards
          </span>
        </nav>

        {/* PAGE TITLE & NAVIGATION TABS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600">
                <Award className="size-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight">
                  Farm Wallet, Refer & Earn
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  1-tap instant checkouts, invite earnings, and exclusive seasonal harvest vouchers.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-secondary/70 border border-border/80 self-start md:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "all"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="size-3.5 text-brand-gold" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("wallet")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "wallet"
                  ? "bg-card text-emerald-700 dark:text-emerald-400 shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wallet className="size-3.5 text-emerald-600" />
              <span>Passbook & Wallet</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("referrals")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "referrals"
                  ? "bg-card text-purple-700 dark:text-purple-400 shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Gift className="size-3.5 text-purple-600" />
              <span>Refer & Earn</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("coupons")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "coupons"
                  ? "bg-card text-amber-700 dark:text-amber-400 shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tag className="size-3.5 text-amber-600" />
              <span>Coupons & Vault</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="space-y-8">
          {/* 1. WALLET BALANCE & TOP-UP (Shown in all or wallet view) */}
          {(activeTab === "all" || activeTab === "wallet") && (
            <section className="space-y-6">
              <WalletBalanceCard onTransactionAdded={handleTransactionAdded} />
              <WalletTransactionsLedger transactions={transactions} />
            </section>
          )}

          {/* 2. REFERRAL PROGRAM (Shown in all or referrals view) */}
          {(activeTab === "all" || activeTab === "referrals") && (
            <section className="pt-2">
              <ReferralProgramSection />
            </section>
          )}

          {/* 3. COUPON CENTER (Shown in all or coupons view) */}
          {(activeTab === "all" || activeTab === "coupons") && (
            <section className="pt-2">
              <CouponCenterSection />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
