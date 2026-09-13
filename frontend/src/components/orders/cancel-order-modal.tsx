import React, { useState } from "react";
import { X, AlertTriangle, ShieldCheck, Wallet, CreditCard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerOrder } from "./types";
import { toast } from "sonner";

interface CancelOrderModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (orderId: string, reason: string, refundMethod: string) => void;
}

const CANCEL_REASONS = [
  "Ordered incorrect variant size or product by mistake",
  "Delivery slot no longer convenient / need to change address",
  "Found alternative item or purchased locally",
  "Placed duplicate order by accident",
  "Expected faster delivery timeframe",
  "Other personal reason",
];

export function CancelOrderModal({
  order,
  isOpen,
  onClose,
  onConfirmCancel,
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]!);
  const [refundMethod, setRefundMethod] = useState<"wallet" | "original">("wallet");
  const [customNote, setCustomNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const finalReason = selectedReason === "Other personal reason" && customNote.trim()
      ? customNote.trim()
      : selectedReason;

    const refundLabel = refundMethod === "wallet"
      ? "Instant Farm Wallet Credit"
      : `Original Method (${order.paymentMethod})`;

    setTimeout(() => {
      onConfirmCancel(order.id, finalReason, refundLabel);
      setSubmitting(false);
      onClose();
      toast.success(`Order ${order.number} has been cancelled.`);
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
          <div className="size-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="size-6" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Cancel Order {order.number}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total order value: <strong>₹{order.total}</strong> ({order.items.length} items)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Select Reason for Cancellation
            </label>
            <div className="space-y-2">
              {CANCEL_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 rounded-2xl border p-3 text-xs cursor-pointer transition ${
                    selectedReason === reason
                      ? "border-brand-leaf bg-brand-leaf/5 font-semibold text-foreground"
                      : "border-border hover:bg-secondary/60 text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-brand-leaf size-4"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === "Other personal reason" && (
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Please tell us more details..."
                rows={2}
                className="w-full mt-2 rounded-2xl border border-input bg-card p-3 text-xs outline-none focus:border-brand-leaf"
              />
            )}
          </div>

          {/* Refund Destination Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Refund Destination Preference
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex flex-col justify-between rounded-2xl border p-3.5 text-xs cursor-pointer transition ${
                  refundMethod === "wallet"
                    ? "border-brand-gold bg-brand-gold/10 font-medium text-foreground"
                    : "border-border hover:bg-secondary/60 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="refundMethod"
                    value="wallet"
                    checked={refundMethod === "wallet"}
                    onChange={() => setRefundMethod("wallet")}
                    className="accent-brand-gold"
                  />
                  <Wallet className="size-4 text-brand-gold" />
                  <span className="font-bold">Farm Wallet</span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
                  <strong>Instant credit</strong> of ₹{order.total}. Available immediately for next harvest purchase.
                </p>
              </label>

              <label
                className={`flex flex-col justify-between rounded-2xl border p-3.5 text-xs cursor-pointer transition ${
                  refundMethod === "original"
                    ? "border-brand-leaf bg-brand-leaf/10 font-medium text-foreground"
                    : "border-border hover:bg-secondary/60 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="refundMethod"
                    value="original"
                    checked={refundMethod === "original"}
                    onChange={() => setRefundMethod("original")}
                    className="accent-brand-leaf"
                  />
                  <CreditCard className="size-4 text-brand-leaf" />
                  <span className="font-bold">Original Source</span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
                  Transferred back to your source account / card in <strong>3–5 bank days</strong>.
                </p>
              </label>
            </div>
          </div>

          {/* Guarantee Note */}
          <div className="rounded-2xl bg-secondary/80 p-3.5 border border-border flex items-center gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-brand-leaf shrink-0" />
            <span>Zero cancellation fees. Full 100% refund is guaranteed.</span>
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
              Nevermind, Keep Order
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={submitting}
              className="w-full sm:w-auto rounded-full text-xs font-bold"
            >
              {submitting ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
