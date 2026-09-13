import React from "react";
import { MapPin, Navigation, Truck, ShieldCheck, Thermometer, Radio, ArrowRight } from "lucide-react";

interface ShipmentRouteMapProps {
  origin?: string;
  destination?: string;
  progressPercent?: number;
  currentCheckpoint?: string;
  vehicleNumber?: string;
}

export function ShipmentRouteMap({
  origin = "Janani Farm Hub (Rajkot)",
  destination = "Customer Doorstep (Ahmedabad)",
  progressPercent = 82,
  currentCheckpoint = "In Transit: NH-47 Transit Corridor near Sanand",
  vehicleNumber = "GJ-03-BW-4821",
}: ShipmentRouteMapProps) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-brand-leaf animate-ping" />
            <span className="text-xs font-bold text-brand-leaf uppercase tracking-wider">
              Live GPS Telemetry
            </span>
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mt-1">
            Cold-Chain Transit Route
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fleet Vehicle: <strong className="font-mono text-foreground">{vehicleNumber}</strong> · Insulated Van
          </p>
        </div>

        {/* Telemetry pill badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-leaf/10 border border-brand-leaf/20 px-3 py-1 text-xs font-semibold text-brand-leaf">
            <Thermometer className="size-3.5" /> 18°C Controlled
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
            <Radio className="size-3.5 text-brand-gold animate-pulse" /> Live Tracking Active
          </span>
        </div>
      </div>

      {/* Visual Graphical SVG Map Corridor */}
      <div className="relative rounded-2xl bg-secondary/50 border border-border p-6 sm:p-8 overflow-hidden">
        {/* Subtle decorative grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Dynamic Route Line */}
        <div className="relative z-10 space-y-8">
          {/* Top Progress Bar & Distance */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Navigation className="size-4 text-brand-leaf" />
              <span>{currentCheckpoint}</span>
            </div>
            <span className="font-mono font-bold text-brand-leaf bg-brand-leaf/10 px-2.5 py-0.5 rounded-full">
              {progressPercent}% Journey Completed
            </span>
          </div>

          {/* SVG Road Track with Animated Moving Van */}
          <div className="relative py-4">
            {/* Background road line */}
            <div className="h-3 w-full rounded-full bg-border relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-leaf via-brand-gold to-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Pulsating Vehicle Pin Positioned on the Road */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
              style={{ left: `${progressPercent}%` }}
            >
              <div className="relative flex flex-col items-center">
                <div className="size-10 rounded-2xl bg-brand-gold text-white flex items-center justify-center shadow-lg shadow-brand-gold/40 ring-4 ring-brand-gold/20 animate-bounce duration-1000">
                  <Truck className="size-5" />
                </div>
                <span className="absolute -top-7 whitespace-nowrap rounded-md bg-foreground text-background px-2 py-0.5 text-[10px] font-bold shadow-md">
                  Moving · 58 km/h
                </span>
              </div>
            </div>
          </div>

          {/* Key Milestone Waypoints */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-brand-leaf">
                <span className="size-2 rounded-full bg-brand-leaf" />
                <span>Origin Hub</span>
              </div>
              <p className="font-semibold text-foreground line-clamp-1">{origin}</p>
              <span className="text-[10px] text-muted-foreground block">Departed 09:00 AM</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-brand-leaf">
                <span className="size-2 rounded-full bg-brand-leaf" />
                <span>Rajkot Gateway</span>
              </div>
              <p className="font-semibold text-foreground line-clamp-1">Sorted & Dispatched</p>
              <span className="text-[10px] text-muted-foreground block">Passed 11:30 AM</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-brand-gold">
                <span className="size-2 rounded-full bg-brand-gold animate-ping" />
                <span>Ahmedabad Sort</span>
              </div>
              <p className="font-semibold text-foreground line-clamp-1">Arrived at Regional Hub</p>
              <span className="text-[10px] text-brand-gold font-medium block">Current Hub Checkpoint</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-muted-foreground">
                <span className="size-2 rounded-full bg-border" />
                <span>Destination</span>
              </div>
              <p className="font-semibold text-foreground line-clamp-1">{destination}</p>
              <span className="text-[10px] text-brand-leaf font-bold block">Next Stop · Expected Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Assurance Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-brand-leaf shrink-0" />
          <span>Cold-Pressed Integrity: Temperature logs validated by sensor array.</span>
        </div>
        <div className="font-medium text-foreground">
          Distance Remaining: <strong className="text-brand-leaf">38 km</strong> (Est. 45 mins)
        </div>
      </div>
    </div>
  );
}
