import React, { useState } from "react";
import { X, RefreshCw, ArrowRightLeft, ShieldCheck, CheckCircle2, Sparkles, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerOrder, OrderItem } from "./types";
import { toast } from "sonner";

interface ExchangeOrderModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmExchange: (orderId: string, exchangeData: {
    originalItem: string;
    replacementItem: string;
    reason: string;
  }) => void;
}

const EXCHANGE_REASONS = [
  "Want a different package size / quantity (e.g. 1 Litre instead of 500ml)",
  "Replace with identical fresh batch (defect / damage exchange)",
  "Want to swap with another organic pantry staple",
  "Ordered wrong product variant by mistake",
];

const REPLACEMENT_OPTIONS = [
  "Wood-Pressed Groundnut Oil (1 Litre Tin Can)",
  "Cold-Pressed Mustard Oil (1 Litre Bottle)",
  "Organic Basmati Rice (1 kg Pack)",
  "A2 Gir Cow Bilona Cultured Ghee (500ml)",
  "Lakadong Turmeric Powder (200 g Aroma-Jar)",
  "Same Item Fresh Batch Replacement",
];

export function ExchangeOrderModal({
  order,
  isOpen,
  onClose,
  onConfirmExchange,
}: ExchangeOrderModalProps) {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [selectedReason, setSelectedReason] = useState(EXCHANGE_REASONS[0]!);
  const [replacementChoice, setReplacementChoice] = useState(REPLACEMENT_OPTIONS[0]!);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const currentItem: OrderItem = order.items[selectedItemIndex] || order.items[0]!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      onConfirmExchange(order.id, {
        originalItem: `${currentItem.name} (${currentItem.variant || "Standard"})`,
        replacementItem: replacementChoice,
        reason: selectedReason,
      });
      setSubmitting(false);
      onClose();
      toast.success(`Exchange request placed for Order ${order.number}!`);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-luxe space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
        >
          <X className="size-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 border-b border-border pb-4">
          <div className="size-12 rounded-2xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
            <ArrowRightLeft className="size-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-brand-gold uppercase tracking-wider">
              Doorstep Handover Exchange
            </span>
            <h3 className="font-display text-xl font-bold text-foreground mt-0.5">
              Exchange Item — Order {order.number}
            </h3>
            <p className="text-xs text-muted-foreground">
              Our courier will deliver your replacement and collect the return at the same time.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item from order selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              1. Choose Item to Exchange
            </label>
            <div className="space-y-2">
              {order.items.map((it, idx) => (
                <label
                  key={idx}
                  className={`flex items-center justify-between rounded-2xl border p-3 text-xs cursor-pointer transition ${
                    selectedItemIndex === idx
                      ? "border-brand-leaf bg-brand-leaf/5 font-semibold text-foreground"
                      : "border-border hover:bg-secondary/60 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="exchangeItem"
                      checked={selectedItemIndex === idx}
                      onChange={() => setSelectedItemIndex(idx)}
                      className="accent-brand-leaf size-4"
                    />
                    <div>
                      <p className="text-foreground font-semibold">{it.name}</p>
                      <p className="text-[11px] text-muted-foreground">{it.variant} · Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <strong className="font-mono text-foreground">₹{it.price}</strong>
                </label>
              ))}
            </div>
          </div>

          {/* Replacement choice */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              2. Desired Replacement
            </label>
            <select
              value={replacementChoice}
              onChange={(e) => setReplacementChoice(e.target.value)}
              className="w-full h-11 rounded-2xl border border-input bg-card px-4 text-xs text-foreground outline-none focus:border-brand-leaf font-medium"
            >
              {REPLACEMENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              3. Exchange Reason
            </label>
            <div className="space-y-1.5">
              {EXCHANGE_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs cursor-pointer transition ${
                    selectedReason === reason
                      ? "border-brand-gold bg-brand-gold/10 font-medium text-foreground"
                      : "border-border hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="exchangeReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-brand-gold"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Guarantee info */}
          <div className="rounded-2xl bg-secondary/80 p-3.5 border border-border flex items-center gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-brand-leaf shrink-0" />
            <span>Zero extra delivery charge for door-to-door harvest exchange.</span>
          </div>

          {/* Actions */}
          <div className="border-t border-border pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto rounded-full text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="sm"
              disabled={submitting}
              className="w-full sm:w-auto rounded-full text-xs font-bold"
            >
              {submitting ? "Processing..." : "Confirm Item Exchange"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
