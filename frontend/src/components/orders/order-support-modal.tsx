import React, { useState } from "react";
import { X, MessageCircle, Phone, HelpCircle, FileText, Send, CheckCircle2, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerOrder } from "./types";
import { toast } from "sonner";

interface OrderSupportModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderSupportModal({
  order,
  isOpen,
  onClose,
}: OrderSupportModalProps) {
  const [ticketSubject, setTicketSubject] = useState("Where is my delivery?");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  if (!isOpen || !order) return null;

  const whatsappMessage = `Hi Janani Agro Farm Concierge! I have a question regarding my Order #${order.number} placed on ${order.date}. Total: ₹${order.total}. Could you please assist me?`;

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?phone=919311416225&text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    toast.success(`Support inquiry for #${order.number} logged! Our farm concierge will reply within 30 mins.`);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1500);
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
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Concierge Farm Support
            </span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mt-1">
            Support for Order {order.number}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Placed on {order.date} · {order.items.length} items · Total ₹{order.total}
          </p>
        </div>

        {/* Direct Instant Channels */}
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
                WhatsApp Chat
              </p>
              <p className="text-[11px] text-muted-foreground">
                Instant reply from manager
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
                Helpline Call
              </p>
              <p className="text-[11px] text-muted-foreground">
                +91 93114 16225
              </p>
            </div>
          </a>
        </div>

        {/* Quick FAQ / Common Inquiry Cards */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Quick Inquiries
          </label>
          <div className="rounded-2xl border border-border bg-secondary/50 p-3 space-y-2.5 text-xs">
            <div className="flex items-start gap-2">
              <Truck className="size-4 text-brand-leaf shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Where is my order?</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Your order is currently <strong>{order.status}</strong> via <strong>{order.courier}</strong> (AWB: {order.awb}). Expected arrival: {order.expectedDelivery}.
                </p>
              </div>
            </div>

            <div className="border-t border-border/60 pt-2 flex items-start gap-2">
              <FileText className="size-4 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Lab Test Certificate (COA)</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Every Janani batch is tested for 0% aflatoxin, pesticide traces, and acid value. Our team can email you this specific batch COA.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Ticket Form */}
        <form onSubmit={handleSendTicket} className="space-y-3 pt-2 border-t border-border">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Send Message to Support Desk
          </label>

          <select
            value={ticketSubject}
            onChange={(e) => setTicketSubject(e.target.value)}
            className="w-full h-10 rounded-2xl border border-input bg-card px-3 text-xs text-foreground outline-none focus:border-brand-leaf font-medium"
          >
            <option value="Where is my delivery?">Where is my delivery?</option>
            <option value="Change delivery address or timing">Change delivery address or timing</option>
            <option value="Packaging issue / Damaged item">Packaging issue / Damaged item</option>
            <option value="Tax invoice / GST credit question">Tax invoice / GST credit question</option>
            <option value="Other query">Other query</option>
          </select>

          <textarea
            required
            value={ticketMessage}
            onChange={(e) => setTicketMessage(e.target.value)}
            placeholder="Type your message here... We respond within 30 minutes during business hours."
            rows={2}
            className="w-full rounded-2xl border border-input bg-card p-3 text-xs outline-none focus:border-brand-leaf"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-full text-xs"
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="sm"
              disabled={isSent}
              className="rounded-full text-xs font-bold gap-1.5"
            >
              {isSent ? (
                <>
                  <CheckCircle2 className="size-3.5" /> Sent!
                </>
              ) : (
                <>
                  <Send className="size-3.5" /> Submit Query
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
