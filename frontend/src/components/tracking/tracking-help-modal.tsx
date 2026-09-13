import React, { useState } from "react";
import { X, MessageCircle, Phone, Clock, MapPin, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TrackingHelpModalProps {
  orderNumber: string;
  awb: string;
  isOpen: boolean;
  onClose: () => void;
}

const INSTRUCTION_OPTIONS = [
  "Leave package with security gate / society reception",
  "Leave with neighbor if door is unanswered",
  "Call phone 10 minutes prior to doorstep arrival",
  "Avoid delivery between 1:00 PM – 3:00 PM",
  "Fragile cold-pressed glass bottles — handle with care",
];

export function TrackingHelpModal({
  orderNumber,
  awb,
  isOpen,
  onClose,
}: TrackingHelpModalProps) {
  const [selectedInstruction, setSelectedInstruction] = useState(INSTRUCTION_OPTIONS[0]!);
  const [rescheduleSlot, setRescheduleSlot] = useState("Tomorrow Morning (9:00 AM – 1:00 PM)");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const whatsappMessage = `Hi Janani Agro Logistics Concierge! I need assistance with live delivery for Order #${orderNumber} (AWB: ${awb}).`;

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?phone=919311416225&text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onClose();
      toast.success(`Delivery instructions relayed to rider for ${orderNumber}!`);
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
        <div className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-brand-gold animate-pulse" />
            <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">
              Dispatch Concierge Assistance
            </span>
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground mt-1">
            Need Delivery Assistance?
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Order: <strong className="font-mono text-foreground">{orderNumber}</strong> · AWB: <span className="font-mono">{awb}</span>
          </p>
        </div>

        {/* Quick Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-left hover:bg-emerald-500/20 transition group"
          >
            <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                WhatsApp Concierge
              </p>
              <p className="text-[11px] text-muted-foreground">
                Instant delivery help
              </p>
            </div>
          </button>

          <a
            href="tel:+919311416225"
            className="flex items-center gap-3 rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-3.5 text-left hover:bg-brand-gold/20 transition group"
          >
            <div className="size-10 rounded-xl bg-brand-gold text-white flex items-center justify-center shrink-0 shadow-xs">
              <Phone className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                Carrier Helpline
              </p>
              <p className="text-[11px] text-muted-foreground">
                +91 93114 16225
              </p>
            </div>
          </a>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4 pt-1">
          {/* Delivery Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Special Doorstep Delivery Instructions
            </label>
            <div className="space-y-1.5">
              {INSTRUCTION_OPTIONS.map((inst) => (
                <label
                  key={inst}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs cursor-pointer transition ${
                    selectedInstruction === inst
                      ? "border-brand-leaf bg-brand-leaf/10 font-medium text-foreground"
                      : "border-border hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryInstruction"
                    value={inst}
                    checked={selectedInstruction === inst}
                    onChange={() => setSelectedInstruction(inst)}
                    className="accent-brand-leaf"
                  />
                  <span>{inst}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reschedule Slot */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Reschedule Preferred Delivery Window
            </label>
            <select
              value={rescheduleSlot}
              onChange={(e) => setRescheduleSlot(e.target.value)}
              className="w-full h-11 rounded-2xl border border-input bg-card px-4 text-xs text-foreground outline-none focus:border-brand-leaf font-medium"
            >
              <option value="Tomorrow Morning (9:00 AM – 1:00 PM)">Tomorrow Morning (9:00 AM – 1:00 PM)</option>
              <option value="Tomorrow Evening (2:00 PM – 7:00 PM)">Tomorrow Evening (2:00 PM – 7:00 PM)</option>
              <option value="Day After Tomorrow (9:00 AM – 1:00 PM)">Day After Tomorrow (9:00 AM – 1:00 PM)</option>
              <option value="Weekend Special Slot (10:00 AM – 2:00 PM)">Weekend Special Slot (10:00 AM – 2:00 PM)</option>
            </select>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto rounded-full text-xs"
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="sm"
              disabled={submitting}
              className="w-full sm:w-auto rounded-full text-xs font-bold"
            >
              {submitting ? "Updating..." : "Relay to Delivery Rider"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
