import React, { useState } from "react";
import { X, RotateCcw, ShieldCheck, Upload, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerOrder } from "./types";
import { toast } from "sonner";

interface ReturnOrderModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReturn: (orderId: string, returnData: {
    reason: string;
    pickupSlot: string;
    itemsSummary: string;
  }) => void;
}

const RETURN_REASONS = [
  "Damaged in transit / bottle or container leaking",
  "Tamper-evident safety seal was broken or open",
  "Incorrect item or weight dispatched",
  "Quality / aroma / taste variation from standard batch",
  "Product expired or nearing best-before window",
];

const PICKUP_SLOTS = [
  "Tomorrow (9:00 AM – 1:00 PM)",
  "Tomorrow (2:00 PM – 7:00 PM)",
  "Day After (9:00 AM – 1:00 PM)",
  "Day After (2:00 PM – 7:00 PM)",
];

export function ReturnOrderModal({
  order,
  isOpen,
  onClose,
  onConfirmReturn,
}: ReturnOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState(RETURN_REASONS[0]!);
  const [selectedSlot, setSelectedSlot] = useState(PICKUP_SLOTS[0]!);
  const [comments, setComments] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      onConfirmReturn(order.id, {
        reason: selectedReason,
        pickupSlot: selectedSlot,
        itemsSummary: `${order.items.length} items (Total: ₹${order.total})`,
      });
      setSubmitting(false);
      onClose();
      toast.success(`Return pickup scheduled for Order ${order.number}!`);
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

        {/* Header */}
        <div className="flex items-start gap-4 border-b border-border pb-4">
          <div className="size-12 rounded-2xl bg-brand-leaf/15 text-brand-leaf flex items-center justify-center shrink-0">
            <RotateCcw className="size-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-brand-leaf uppercase tracking-wider">
              7-Day Harvest Guarantee
            </span>
            <h3 className="font-display text-xl font-bold text-foreground mt-0.5">
              Request Return for {order.number}
            </h3>
            <p className="text-xs text-muted-foreground">
              Delivered on {order.date} · Doorstep reverse pickup
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Reason for Return
            </label>
            <div className="space-y-2">
              {RETURN_REASONS.map((reason) => (
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
                    name="returnReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-brand-leaf size-4"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pickup Slot Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Select Doorstep Pickup Window
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PICKUP_SLOTS.map((slot) => (
                <label
                  key={slot}
                  className={`flex items-center gap-2.5 rounded-2xl border p-3 text-xs cursor-pointer transition ${
                    selectedSlot === slot
                      ? "border-brand-leaf bg-brand-leaf/10 font-bold text-foreground"
                      : "border-border hover:bg-secondary/60 text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="pickupSlot"
                    value={slot}
                    checked={selectedSlot === slot}
                    onChange={() => setSelectedSlot(slot)}
                    className="accent-brand-leaf"
                  />
                  <span>{slot}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Photo Proof Upload Simulator */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Photo Verification (Optional)</span>
              <span className="text-[10px] text-muted-foreground">Speeds up approval</span>
            </label>

            <div
              onClick={() => {
                setHasPhoto(!hasPhoto);
                toast.info(hasPhoto ? "Photo removed" : "Sample verification photo attached!");
              }}
              className={`rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition ${
                hasPhoto
                  ? "border-brand-leaf bg-brand-leaf/10 text-brand-leaf"
                  : "border-border hover:border-brand-leaf/50 text-muted-foreground"
              }`}
            >
              {hasPhoto ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold">
                  <CheckCircle2 className="size-4" />
                  <span>Batch_Damage_Photo_01.jpg Attached</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-xs">
                  <Upload className="size-5" />
                  <span className="font-semibold">Click to attach photo evidence</span>
                  <span className="text-[10px]">JPEG, PNG up to 10MB</span>
                </div>
              )}
            </div>
          </div>

          {/* Note / Comments */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Additional Details (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide any specific details for the reverse pickup executive..."
              rows={2}
              className="w-full rounded-2xl border border-input bg-card p-3 text-xs outline-none focus:border-brand-leaf"
            />
          </div>

          {/* Policy reassurance */}
          <div className="rounded-2xl bg-secondary/80 p-3.5 border border-border flex items-center gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-brand-leaf shrink-0" />
            <span>Refund of ₹{order.total} will be released immediately once picked up.</span>
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
              {submitting ? "Scheduling..." : "Schedule Return Pickup"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
