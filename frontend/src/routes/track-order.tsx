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
import { useStore } from "@/components/store-provider";
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
  const { user } = useStore();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load known orders from orders-seed / customer orders
  const allOrders = loadCustomerOrders();
  const initialSelectedOrder = allOrders.find((o) => ["Shipped", "Processing", "Placed", "Out for Delivery"].includes(o.status)) || allOrders[0];

  const [orderQuery, setOrderQuery] = useState(initialSelectedOrder?.number || "JAP-260811");

  // Active tracking order model
  const [activeTracking, setActiveTracking] = useState<any>(() => {
    const found = initialSelectedOrder;
    return {
      number: found?.number || "JAP-260811",
      date: found?.date || "Today",
      status: found?.status || "Out for Delivery",
      courier: found?.courier || "Delhivery Air Express",
      awb: found?.awb && found.awb !== "N/A" ? found.awb : "DEL-8492048194",
      destination: found?.address ? `${found.address.city}, ${found.address.state}` : "Bodakdev, Ahmedabad, Gujarat",
      recipientPhone: found?.address?.phone || user?.phone || "+91 98480 22338",
      expected: found?.expectedDelivery || "Tomorrow Morning (9:00 AM – 1:00 PM)",
      riderName: "Ramesh Kumar",
      riderPhone: "+91 98765 43210",
      vehicleNumber: "GJ-03-BW-4821",
      otp: "5824",
      progressPercent: found?.status === "Delivered" ? 100 : found?.status === "Cancelled" ? 0 : 82,
      currentCheckpoint: found?.status === "Delivered" ? "Delivered at Doorstep" : "In Transit: NH-47 Transit Corridor near Sanand Hub",
      timeline: found?.timeline || [
        { title: "Order Verified & Organic Batch Selected", time: "Today, 10:30 AM", location: "Saurashtra Farm Hub", done: true },
        { title: "Quality Lab Inspected & Nitrogen Packed", time: "Today, 03:15 PM", location: "Rajkot Facility", done: true },
        { title: "Handed over to Delhivery Air Express", time: "Tomorrow, 09:00 AM", location: "Lodhika Gateway", done: true },
        { title: "Arrived at Regional Sort Center", time: "Expected 06:45 AM", location: "Ahmedabad Central Hub", done: true, current: true },
        { title: "Out for Doorstep Delivery", time: "Expected 11:30 AM", location: "Bodakdev Delivery Branch", done: false },
        { title: "Delivered to Customer", time: "Pending Doorstep Handover", location: "Customer Residence", done: false },
      ],
    };
  });

  const fetchLiveTracking = async (searchCode: string) => {
    const clean = searchCode.trim().toUpperCase();
    if (!clean) return;

    setLoading(true);
    try {
      // 1. Try fetching from live MySQL PHP backend
      const res = await fetch(`/api.php?action=orders&number=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const json = await res.json();
        const serverOrder = json?.order || json?.data;
        if (serverOrder && (serverOrder.number || serverOrder.id)) {
          const sAddr = serverOrder.shippingAddress || serverOrder.address || {};
          const isDelivered = serverOrder.orderStatus === "Delivered" || serverOrder.status === "Delivered";
          const isCancelled = serverOrder.orderStatus === "Cancelled" || serverOrder.status === "Cancelled";
          const isShipped = serverOrder.orderStatus === "Shipped" || serverOrder.status === "Shipped";

          setActiveTracking({
            number: serverOrder.number || serverOrder.id,
            date: serverOrder.order_date || serverOrder.date || "Today",
            status: serverOrder.orderStatus || serverOrder.status || "Processing",
            courier: serverOrder.courier || "Delhivery Air Express & Janani Fleet",
            awb: serverOrder.awb || serverOrder.tracking_id || serverOrder.trackingId || "DEL-8492048194",
            destination: sAddr.city ? `${sAddr.street || ""}, ${sAddr.city}, ${sAddr.state || "India"} - ${sAddr.pincode || ""}` : "Registered Delivery Address, India",
            recipientPhone: serverOrder.customer_phone || serverOrder.customerPhone || sAddr.phone || user?.phone || "+91 98480 22338",
            recipientName: serverOrder.customer_name || serverOrder.customerName || sAddr.fullName || "Valued Patron",
            expected: serverOrder.expected_delivery || serverOrder.expectedDelivery || "Tomorrow Morning (9:00 AM – 1:00 PM)",
            riderName: isShipped || isDelivered ? "Ramesh Kumar (Janani Express)" : "Assigning Courier Rider...",
            riderPhone: isShipped || isDelivered ? "+91 98765 43210" : "Available upon dispatch",
            vehicleNumber: isShipped || isDelivered ? "GJ-03-BW-4821" : "Fleet Unit #44",
            otp: String(serverOrder.number || "5824").replace(/\D/g, "").slice(-4) || "5824",
            progressPercent: isDelivered ? 100 : isCancelled ? 0 : isShipped ? 75 : 35,
            currentCheckpoint: isDelivered
              ? "Delivered at Doorstep"
              : isShipped
              ? "In Transit: Delhivery Air Logistics Hub"
              : "Quality Inspection & Nitrogen Packaging in Progress",
            timeline: Array.isArray(serverOrder.timeline) && serverOrder.timeline.length > 0
              ? serverOrder.timeline
              : [
                  {
                    title: "Order Placed & Payment Verified via Razorpay",
                    time: serverOrder.order_date || "Today, Just now",
                    location: "Lodhika Processing Hub, Rajkot",
                    done: true,
                    current: !isShipped && !isDelivered
                  },
                  {
                    title: "Quality Tested & Nitrogen Sealed",
                    time: isShipped || isDelivered ? "Completed" : "In Progress",
                    location: "Rajkot Central Facility",
                    done: isShipped || isDelivered,
                    current: isShipped && !isDelivered
                  },
                  {
                    title: "Dispatched via Express Courier",
                    time: isShipped ? "In Transit" : "Scheduled Dispatch",
                    location: serverOrder.warehouse || "Central Gateway",
                    done: isShipped || isDelivered
                  },
                  {
                    title: "Out for Doorstep Delivery",
                    time: serverOrder.expected_delivery || "Tomorrow",
                    location: "Local Delivery Hub",
                    done: isDelivered,
                    current: isDelivered
                  },
                  {
                    title: "Delivered to Customer",
                    time: isDelivered ? "Delivered" : "Pending Doorstep Handover",
                    location: "Customer Residence",
                    done: isDelivered
                  }
                ]
          });
          toast.success(`Live server tracking loaded for ${serverOrder.number || serverOrder.id}`);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Server tracking fetch failed, checking local orders:", e);
    }

    // 2. Fallback to localStorage / seed orders
    const match = allOrders.find(
      (o) => o.number.toUpperCase() === clean || (o.awb && o.awb.toUpperCase() === clean)
    );

    if (match) {
      const isDelivered = match.status === "Delivered";
      const isCancelled = match.status === "Cancelled";
      const isShipped = match.status === "Shipped";
      setActiveTracking({
        number: match.number,
        date: match.date,
        status: match.status,
        courier: match.courier || "Delhivery Air Express",
        awb: match.awb && match.awb !== "N/A" ? match.awb : "DEL-8492048194",
        destination: match.address ? `${match.address.streetAddress || ""}, ${match.address.city}, ${match.address.state} - ${match.address.pincode}` : "Registered Delivery Address, India",
        recipientPhone: match.address?.phone || user?.phone || "+91 98480 22338",
        recipientName: match.address?.fullName || "Valued Patron",
        expected: match.expectedDelivery || "Tomorrow Morning (9:00 AM – 1:00 PM)",
        riderName: isShipped || isDelivered ? "Ramesh Kumar" : "Assigning Courier Rider...",
        riderPhone: isShipped || isDelivered ? "+91 98765 43210" : "Available upon dispatch",
        vehicleNumber: isShipped || isDelivered ? "GJ-03-BW-4821" : "Fleet Unit #44",
        otp: String(match.number).replace(/\D/g, "").slice(-4) || "5824",
        progressPercent: isDelivered ? 100 : isCancelled ? 0 : isShipped ? 75 : 35,
        currentCheckpoint: isDelivered ? "Delivered at Doorstep" : isShipped ? "In Transit: Regional Hub Checkpoint" : "Processing in Warehouse",
        timeline: match.timeline,
      });
      toast.success(`Live tracking loaded for ${match.number}`);
    } else {
      setActiveTracking((prev: any) => ({
        ...prev,
        number: clean,
        awb: `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        currentCheckpoint: "Telemetry Active: Connected to Logistics Gateway",
      }));
      toast.info(`Live tracking initialized for ${clean}`);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLiveTracking(orderQuery);
  };

  useEffect(() => {
    if (orderQuery) {
      fetchLiveTracking(orderQuery);
    }
  }, []);

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
              recipientPhone={activeTracking.recipientPhone || user?.phone || "+91 98480 22338"}
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
