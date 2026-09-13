import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Truck,
  HelpCircle,
  Sparkles,
  Calendar,
  Radio,
  ExternalLink,
  ChevronRight,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadCustomerOrders } from "@/components/orders/orders-seed";
import { CustomerOrder } from "@/components/orders/types";

import { ShipmentRouteMap } from "@/components/tracking/shipment-route-map";
import { DeliveryOtpCard } from "@/components/tracking/delivery-otp-card";
import { LiveCourierCard } from "@/components/tracking/live-courier-card";
import { TrackingHelpModal } from "@/components/tracking/tracking-help-modal";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Live Shipment Tracking & Map — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content: "Track real-time GPS location, cold-chain temperature telemetry, delivery OTP, and milestones for your organic harvest shipment.",
      },
    ],
  }),
  component: LiveTrackingPage,
});

export function LiveTrackingPage() {
  const [orderQuery, setOrderQuery] = useState("JAP-260811");
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load known orders from orders-seed / customer orders
  const allOrders = loadCustomerOrders();

  // Active tracking order model
  const [activeTracking, setActiveTracking] = useState<any>(() => {
    const found = allOrders.find((o) => o.number === "JAP-260811" || o.status === "Shipped");
    return {
      number: found?.number || "JAP-260811",
      date: found?.date || "08 Sep 2026",
      status: found?.status || "Out for Delivery",
      courier: found?.courier || "Delhivery Air Express",
      awb: found?.awb && found.awb !== "N/A" ? found.awb : "DEL-8492048194",
      destination: found?.address ? `${found.address.city}, ${found.address.state}` : "Bodakdev, Ahmedabad, Gujarat",
      expected: found?.expectedDelivery || "Tomorrow Morning (9:00 AM – 1:00 PM)",
      riderName: "Ramesh Kumar",
      riderPhone: "+91 98765 43210",
      vehicleNumber: "GJ-03-BW-4821",
      otp: "5824",
      progressPercent: 82,
      currentCheckpoint: "In Transit: NH-47 Transit Corridor near Sanand Hub",
      timeline: found?.timeline || [
        { title: "Order Verified & Organic Batch Selected", time: "08 Sep 2026, 10:30 AM", location: "Saurashtra Farm Hub", done: true },
        { title: "Quality Lab Inspected & Nitrogen Packed", time: "09 Sep 2026, 03:15 PM", location: "Rajkot Facility", done: true },
        { title: "Handed over to Delhivery Air Express", time: "10 Sep 2026, 09:00 AM", location: "Lodhika Gateway", done: true },
        { title: "Arrived at Regional Sort Center", time: "11 Sep 2026, 06:45 AM", location: "Ahmedabad Central Hub", done: true, current: true },
        { title: "Out for Doorstep Delivery", time: "Expected Today, 11:30 AM", location: "Bodakdev Delivery Branch", done: false },
        { title: "Delivered to Customer", time: "Pending Doorstep Handover", location: "Customer Residence", done: false },
      ],
    };
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderQuery.trim().toUpperCase();
    if (!clean) return;

    setLoading(true);
    setTimeout(() => {
      const match = allOrders.find(
        (o) => o.number.toUpperCase() === clean || o.awb.toUpperCase() === clean
      );

      if (match) {
        setActiveTracking({
          number: match.number,
          date: match.date,
          status: match.status,
          courier: match.courier,
          awb: match.awb && match.awb !== "N/A" ? match.awb : "DEL-8492048194",
          destination: `${match.address.city}, ${match.address.state}`,
          expected: match.expectedDelivery,
          riderName: "Ramesh Kumar",
          riderPhone: "+91 98765 43210",
          vehicleNumber: "GJ-03-BW-4821",
          otp: "5824",
          progressPercent: match.status === "Delivered" ? 100 : match.status === "Cancelled" ? 0 : 82,
          currentCheckpoint: match.status === "Delivered" ? "Delivered at Doorstep" : "In Transit: NH-47 Corridor",
          timeline: match.timeline,
        });
        toast.success(`Live tracking loaded for ${match.number}`);
      } else {
        // Fallback with custom number
        setActiveTracking((prev: any) => ({
          ...prev,
          number: clean,
          awb: `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        }));
        toast.info(`Simulated live telemetry loaded for ${clean}`);
      }
      setLoading(false);
    }, 400);
  };

  const handlePresetSelect = (orderNum: string) => {
    setOrderQuery(orderNum);
    const match = allOrders.find((o) => o.number === orderNum);
    if (match) {
      setActiveTracking({
        number: match.number,
        date: match.date,
        status: match.status,
        courier: match.courier,
        awb: match.awb && match.awb !== "N/A" ? match.awb : "DEL-8492048194",
        destination: `${match.address.city}, ${match.address.state}`,
        expected: match.expectedDelivery,
        riderName: "Ramesh Kumar",
        riderPhone: "+91 98765 43210",
        vehicleNumber: "GJ-03-BW-4821",
        otp: "5824",
        progressPercent: match.status === "Delivered" ? 100 : match.status === "Cancelled" ? 0 : 82,
        currentCheckpoint: match.status === "Delivered" ? "Delivered at Doorstep" : "In Transit: Regional Hub Checkpoint",
        timeline: match.timeline,
      });
      toast.success(`Tracking loaded for ${orderNum}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 pb-24 lg:pb-16 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link to="/" className="hover:text-brand-leaf transition flex items-center gap-1">
          <Home className="size-3.5" /> Home
        </Link>
        <span>/</span>
        <Link to="/orders" className="hover:text-brand-leaf transition">My Orders</Link>
        <span>/</span>
        <span className="text-brand-leaf font-bold">Live Tracking</span>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-leaf/15 text-brand-leaf px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
              <Radio className="size-3.5 animate-pulse text-brand-leaf" /> Real-Time Cold-Chain Radar
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Track Harvest Shipment
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            Live GPS telemetry, cold-chain temperature monitoring, delivery OTP, and doorstep arrival estimations.
          </p>
        </div>

        {/* Action Button: Need Help */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsHelpModalOpen(true)}
            className="rounded-full text-xs font-bold gap-1.5 hover:border-brand-gold hover:text-brand-gold shadow-xs"
          >
            <HelpCircle className="size-4" />
            <span>Need Help?</span>
          </Button>

          <Button asChild variant="gold" size="sm" className="rounded-full text-xs font-bold gap-1.5 shadow-sm">
            <Link to="/orders">
              <Package className="size-4" /> My Orders Hub
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Omnibar & Quick Sample Order Chips */}
      <div className="space-y-3 max-w-2xl mx-auto text-center">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
            <input
              required
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="Enter Order ID (e.g. JAP-260811) or AWB..."
              className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-4 text-xs sm:text-sm uppercase font-mono outline-none focus:border-brand-leaf shadow-sm transition"
            />
          </div>
          <Button type="submit" size="lg" variant="gold" disabled={loading} className="rounded-full px-6 text-xs font-bold shrink-0">
            {loading ? "Locating..." : "Track Now"}
          </Button>
        </form>

        {/* Quick Sample Order Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-muted-foreground text-[11px]">Sample Consignments:</span>
          {allOrders.slice(0, 3).map((ord) => (
            <button
              key={ord.id}
              type="button"
              onClick={() => handlePresetSelect(ord.number)}
              className={`rounded-full px-3 py-1 text-[11px] font-mono font-semibold border transition ${
                activeTracking.number === ord.number
                  ? "border-brand-leaf bg-brand-leaf/10 text-brand-leaf"
                  : "border-border bg-secondary hover:bg-secondary/80 text-foreground"
              }`}
            >
              {ord.number} ({ord.status})
            </button>
          ))}
        </div>
      </div>

      {/* Active Shipment Command Center */}
      <div className="space-y-8">
        {/* Top Highlight Banner: Expected Delivery Time & Order Status */}
        <div className="rounded-3xl border border-border bg-gradient-to-r from-secondary/90 via-card to-secondary/90 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <strong className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                {activeTracking.number}
              </strong>
              <span className="rounded-full bg-brand-leaf/15 text-brand-leaf px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-brand-leaf animate-ping" />
                {activeTracking.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Dispatched from <strong>Janani Lodhika GIDC Plant</strong> to <strong>{activeTracking.destination}</strong>
            </p>
          </div>

          <div className="rounded-2xl bg-card border border-border p-4 shadow-xs space-y-1 md:text-right">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Expected Doorstep Arrival
            </span>
            <p className="font-display text-lg sm:text-xl font-bold text-brand-leaf">
              {activeTracking.expected}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <ShieldCheck className="size-3 text-brand-leaf" /> 100% On-Time Guarantee
            </span>
          </div>
        </div>

        {/* 2-Column Layout: Visual Map + Courier/OTP Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Animated Route Map + Full Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Feature 7: Shipment Route Map Placeholder / Simulator */}
            <ShipmentRouteMap
              origin="Janani Farm Hub (Rajkot)"
              destination={activeTracking.destination}
              progressPercent={activeTracking.progressPercent}
              currentCheckpoint={activeTracking.currentCheckpoint}
              vehicleNumber={activeTracking.vehicleNumber}
            />

            {/* Feature 1: Tracking Timeline Stepper */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Fulfillment & Transit Milestones
                </h3>
                <span className="text-xs text-muted-foreground">
                  Updated automatically every 15 mins
                </span>
              </div>

              <div className="space-y-6 pl-2 pr-1">
                {activeTracking.timeline.map((step: any, idx: number) => {
                  const isLast = idx === activeTracking.timeline.length - 1;
                  const isDone = step.done;
                  const isCurrent = step.current;

                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      {!isLast && (
                        <div
                          className={`absolute left-4 top-8 -bottom-4 w-0.5 ${
                            isDone ? "bg-brand-leaf" : "bg-border"
                          }`}
                        />
                      )}

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
                          idx + 1
                        )}
                      </div>

                      <div className="flex-1 space-y-0.5 pt-0.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className={`text-sm font-bold ${
                            isDone || isCurrent ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {step.title || step.status}
                          </p>
                          <span className="text-[11px] font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-md">
                            {step.time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="size-3 text-brand-leaf shrink-0" />
                          <span>{step.location || "En Route Transit Gateway"}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Live Courier Card + Delivery OTP Card + Support Quick Action */}
          <div className="space-y-6">
            {/* Feature 5: Delivery OTP Card */}
            <DeliveryOtpCard
              initialOtp={activeTracking.otp}
              recipientPhone="+91 93114 16225"
            />

            {/* Feature 2, 3, 4: Live Courier Partner & AWB Card */}
            <LiveCourierCard
              courierName={activeTracking.courier}
              awb={activeTracking.awb}
              status={activeTracking.status}
              riderName={activeTracking.riderName}
              riderPhone={activeTracking.riderPhone}
              vehicleNumber={activeTracking.vehicleNumber}
              lastUpdated="12 mins ago"
            />

            {/* Feature 8: Need Help Card Banner */}
            <div className="rounded-3xl border border-border bg-secondary/70 p-6 space-y-3 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-foreground font-bold text-sm">
                <HelpCircle className="size-4 text-brand-leaf" />
                <span>Need Delivery Help?</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Have questions regarding delivery timing, address adjustments, or container inspection? Our logistics concierge is online.
              </p>
              <Button
                type="button"
                variant="gold"
                size="sm"
                onClick={() => setIsHelpModalOpen(true)}
                className="w-full rounded-full text-xs font-bold gap-1.5 shadow-xs"
              >
                <span>Open Assistance Desk</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 8 Modal: Tracking Help Modal */}
      <TrackingHelpModal
        orderNumber={activeTracking.number}
        awb={activeTracking.awb}
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
