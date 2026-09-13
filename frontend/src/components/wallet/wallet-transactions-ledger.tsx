import React, { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  Download,
  Calendar,
  Sparkles,
  ShoppingBag,
  Gift,
  RefreshCw,
  PlusCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { type WalletTransaction, type TransactionType } from "./types";

interface WalletTransactionsLedgerProps {
  transactions: WalletTransaction[];
}

export function WalletTransactionsLedger({ transactions }: WalletTransactionsLedgerProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | TransactionType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = activeFilter === "all" || tx.type === activeFilter;
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.orderId && tx.orderId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleDownloadStatement = () => {
    toast.success("Wallet Statement Generated", {
      description: "PDF statement for the current financial year has been prepared for download.",
    });
  };

  const getCategoryIcon = (category: WalletTransaction["category"], type: TransactionType) => {
    switch (category) {
      case "referral":
        return <Gift className="size-4 text-purple-600" />;
      case "cashback":
        return <Sparkles className="size-4 text-amber-600" />;
      case "topup":
        return <PlusCircle className="size-4 text-emerald-600" />;
      case "order_payment":
        return <ShoppingBag className="size-4 text-rose-600" />;
      case "refund":
        return <RefreshCw className="size-4 text-blue-600" />;
      default:
        return type === "credit" ? (
          <ArrowDownLeft className="size-4 text-emerald-600" />
        ) : (
          <ArrowUpRight className="size-4 text-rose-600" />
        );
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-7 shadow-xs space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-heading font-bold text-foreground">
            Wallet Transactions & Passbook
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time ledger of top-ups, referral rewards, order deductions, and cashbacks.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadStatement}
          className="rounded-xl text-xs font-semibold h-9 self-start sm:self-auto gap-1.5"
        >
          <Download className="size-3.5" />
          <span>Export Passbook</span>
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center p-1 rounded-2xl bg-secondary/60 border border-border/80 w-fit">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeFilter === "all"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("credit")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeFilter === "credit"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowDownLeft className="size-3 text-emerald-600" />
            Credits
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("debit")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeFilter === "debit"
                ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowUpRight className="size-3 text-rose-600" />
            Debits
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9 rounded-xl bg-background"
          />
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl p-6">
            <div className="size-12 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground mb-3">
              <Calendar className="size-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">No transactions found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery
                ? "No entries match your search criteria. Try a different keyword."
                : "You don't have any transactions in this category yet."}
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isCredit = tx.type === "credit";
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-background hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`size-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCredit
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : "bg-rose-500/10 border border-rose-500/20"
                    }`}
                  >
                    {getCategoryIcon(tx.category, tx.type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">
                        {tx.title}
                      </h4>
                      {tx.status === "completed" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="size-2.5" />
                          Success
                        </span>
                      )}
                      {tx.status === "pending" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <Clock className="size-2.5" />
                          Pending
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tx.description}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">ID: {tx.id}</span>
                      {tx.orderId && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">{tx.orderId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-base font-bold font-mono ${
                      isCredit ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {isCredit ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                    {tx.category.replace("_", " ")}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
