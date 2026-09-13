import React from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  ShieldCheck,
  ArrowRight,
  MapPin,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderDispatchTrackerPreviewProps {
  orderNumber: string;
  deliveryDate: string;
  recipientCity: string;
  trackingId?: string;
  carrierName?: string;
}

export function OrderDispatchTrackerPreview({
  orderNumber,
  deliveryDate,
  recipientCity,
  trackingId = "JAP-BD-892144",
  carrierName = "BlueDart Express & Janani Direct",
}: OrderDispatchTrackerPreviewProps) {
  const steps = [
    {
      title: "Order Confirmed",
      desc: "Payment verified & inventory allocated",
      status: "completed",
      time: "Today, Just now",
      icon: CheckCircle2,
    },
    {
      title: "Quality Tested & Sealed",
      desc: "Aflatoxin zero-tested, nitrogen-flushed packaging",
      status: "active",
      time: "Within 4 hours",
      icon: ShieldCheck,
    },
    {
      title: "Shipped from Rajkot Hub",
      desc: "Handed over to cold-chain logistics",
      status: "upcoming",
      time: "Scheduled tomorrow",
      icon: Truck,
    },
    {
      title: "Out for Delivery",
      desc: `Dispatched to ${recipientCity} doorstep`,
      status: "upcoming",
      time: deliveryDate,
      icon: PackageCheck,
    },
  ];

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-brand-leaf animate-ping" />
            <span className="text-xs font-bold text-brand-leaf uppercase tracking-wider">
              Live Fulfillment Preview
            </span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mt-1">
            Dispatch Milestones
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            AWB: <strong className="font-mono text-foreground">{trackingId}</strong> via {carrierName}
          </p>
        </div>

        <Button asChild variant="gold" size="sm" className="rounded-full text-xs font-bold gap-1.5 shadow-sm sm:self-start">
          <Link to="/track-order">
            <span>Full Tracking Map</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      {/* Stepper Timeline */}
      <div className="mt-8 relative">
        {/* Progress Bar background */}
        <div className="hidden md:block absolute top-6 left-8 right-8 h-1 bg-border -z-0">
          <div className="h-full bg-brand-leaf w-[35%] rounded-full transition-all duration-700" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = step.status === "completed";
            const isActive = step.status === "active";

            return (
              <div key={step.title} className="flex md:flex-col items-start md:items-center md:text-center gap-4 md:gap-2">
                {/* Node circle */}
                <div
                  className={`size-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? "bg-brand-leaf text-white shadow-md shadow-brand-leaf/20"
                      : isActive
                      ? "bg-brand-gold text-white shadow-md shadow-brand-gold/30 ring-4 ring-brand-gold/20 animate-pulse"
                      : "bg-secondary text-muted-foreground border border-border"
                  }`}
                >
                  <Icon className="size-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center md:justify-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">
                      {step.title}
                    </span>
                    {isActive && (
                      <span className="inline-block size-1.5 rounded-full bg-brand-gold" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {step.desc}
                  </p>
                  <span className="inline-block text-[10px] font-semibold text-brand-leaf/90 bg-brand-leaf/10 px-2 py-0.5 rounded-md mt-1">
                    {step.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Delivery Guarantee Note */}
      <div className="mt-8 pt-5 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-brand-leaf shrink-0" />
          <span>
            Expected at your doorstep: <strong className="text-foreground font-medium">{deliveryDate}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="text-brand-leaf font-bold">100% On-Time Guarantee</span>
          <span>• Sealed Freshness Insured</span>
        </div>
      </div>
    </div>
  );
}
