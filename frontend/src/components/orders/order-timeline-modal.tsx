import React, { useState } from "react";
import { X, CheckCircle2, Truck, Package, MapPin, Copy, Check, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerOrder } from "./types";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

interface OrderTimelineModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderTimelineModal({ order, isOpen, onClose }: OrderTimelineModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopyAwb = () => {
    if (order.awb && order.awb !== "N/A") {
      navigator.clipboard.writeText(order.awb);
      setCopied(true);
      toast.success("Tracking AWB copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-luxe space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
        >
          <X className="size-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-brand-leaf animate-ping" />
            <span className="text-xs font-bold text-brand-leaf uppercase tracking-wider">
              Live Shipment Tracker
            </span>
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground mt-1">
            Order {order.number}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Carrier: <strong>{order.courier}</strong>
            {order.awb && order.awb !== "N/A" && (
              <span className="ml-2 inline-flex items-center gap-1 font-mono text-foreground bg-secondary px-2 py-0.5 rounded-md">
                AWB: {order.awb}
                <button
                  type="button"
                  onClick={handleCopyAwb}
                  className="hover:text-brand-leaf transition ml-1"
                  title="Copy AWB"
                >
                  {copied ? <Check className="size-3 text-brand-leaf" /> : <Copy className="size-3" />}
                </button>
              </span>
            )}
          </p>
        </div>

        {/* Status / ETA Banner */}
        <div className="rounded-2xl bg-secondary/80 p-4 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Current Status:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`size-2 rounded-full ${
                order.status === "Delivered" ? "bg-emerald-500" :
                order.status === "Cancelled" ? "bg-red-500" : "bg-brand-gold"
              }`} />
              <strong className="text-sm font-bold text-foreground">{order.status}</strong>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-muted-foreground">Expected Doorstep ETA:</span>
            <p className="font-semibold text-brand-leaf mt-0.5">{order.expectedDelivery}</p>
          </div>
        </div>

        {/* Vertical Timeline Stepper */}
        <div className="space-y-6 pl-2 pr-1">
          {order.timeline.map((step, idx) => {
            const isLast = idx === order.timeline.length - 1;
            const isDone = step.done;
            const isCurrent = step.current;

            return (
              <div key={idx} className="relative flex items-start gap-4">
                {/* Connecting vertical line */}
                {!isLast && (
                  <div
                    className={`absolute left-4 top-8 -bottom-4 w-0.5 ${
                      isDone ? "bg-brand-leaf" : "bg-border"
                    }`}
                  />
                )}

                {/* Step node icon */}
                <div
                  className={`relative z-10 size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                    isDone
                      ? "bg-brand-leaf text-white shadow-md shadow-brand-leaf/25"
                      : isCurrent
                      ? "bg-brand-gold text-white ring-4 ring-brand-gold/20 animate-pulse"
                      : "bg-secondary text-muted-foreground border border-border"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="size-4" />
                  ) : isCurrent ? (
                    <Truck className="size-4" />
                  ) : (
                    <Package className="size-3.5" />
                  )}
                </div>

                {/* Step Text Info */}
                <div className="flex-1 space-y-0.5 pt-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className={`text-sm font-bold ${
                      isDone || isCurrent ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {step.title}
                    </p>
                    <span className="text-[11px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                      {step.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3 text-brand-leaf shrink-0" />
                    <span>{step.location}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button asChild variant="gold" size="sm" className="w-full sm:w-auto rounded-full text-xs font-bold gap-1.5">
            <Link to="/track-order">
              <span>Dedicated Tracking Page</span>
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto rounded-full text-xs">
            Close Tracker
          </Button>
        </div>
      </div>
    </div>
  );
}
