import React from "react";
import { Zap, Sun, Sunset, Leaf, CheckCircle2, Clock, Truck } from "lucide-react";

export interface DeliverySlot {
  id: string;
  name: string;
  dateStr: string;
  timeWindow: string;
  badge?: string;
  badgeType?: "gold" | "green" | "blue" | "default";
  fee: number;
  description: string;
  ecoKarmaBonus?: number;
}

export const DELIVERY_SLOTS: DeliverySlot[] = [
  {
    id: "express_priority",
    name: "Express Priority Slot",
    dateStr: "Tomorrow Morning",
    timeWindow: "9:00 AM – 1:00 PM",
    badge: "FASTEST DISPATCH",
    badgeType: "gold",
    fee: 49,
    description: "Cold-chain air express priority dispatch directly from harvest hub.",
  },
  {
    id: "morning_fresh",
    name: "Morning Fresh Slot",
    dateStr: "Day After Tomorrow",
    timeWindow: "7:00 AM – 10:30 AM",
    badge: "RECOMMENDED",
    badgeType: "green",
    fee: 0,
    description: "Early morning harvest delivery before breakfast preparation.",
  },
  {
    id: "evening_convenience",
    name: "Evening Convenient Slot",
    dateStr: "Day After Tomorrow",
    timeWindow: "5:30 PM – 9:00 PM",
    badge: "AFTER WORK",
    badgeType: "blue",
    fee: 0,
    description: "Evening doorstep delivery when you return home from work.",
  },
  {
    id: "eco_green",
    name: "Zero Carbon Eco Slot",
    dateStr: "In 3 Days (Batched)",
    timeWindow: "10:00 AM – 4:00 PM",
    badge: "ZERO EMISSIONS",
    badgeType: "green",
    fee: 0,
    ecoKarmaBonus: 25,
    description: "Combined neighborhood EV transit. Reduces carbon footprint & awards +25 Eco Karma!",
  },
];

interface DeliverySlotPickerProps {
  selectedSlotId: string;
  onSelectSlot: (slot: DeliverySlot) => void;
  subtotal: number;
}

export function DeliverySlotPicker({
  selectedSlotId,
  onSelectSlot,
  subtotal,
}: DeliverySlotPickerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Clock className="size-5 text-brand-leaf" />
          Scheduled Delivery Slot
        </h3>
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          <Truck className="size-3.5 text-brand-leaf" /> 100% On-Time Farm Guarantee
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {DELIVERY_SLOTS.map((slot) => {
          const isSelected = slot.id === selectedSlotId;
          // Express slot is free for orders over ₹1200
          const actualFee = slot.id === "express_priority" && subtotal >= 1200 ? 0 : slot.fee;

          let Icon = Clock;
          if (slot.id === "express_priority") Icon = Zap;
          else if (slot.id === "morning_fresh") Icon = Sun;
          else if (slot.id === "evening_convenience") Icon = Sunset;
          else if (slot.id === "eco_green") Icon = Leaf;

          return (
            <div
              key={slot.id}
              onClick={() => onSelectSlot(slot)}
              className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 text-left flex flex-col justify-between ${
                isSelected
                  ? "border-brand-leaf bg-brand-leaf/5 shadow-soft ring-2 ring-brand-leaf/20"
                  : "border-border bg-card hover:border-brand-leaf/40 hover:bg-secondary/40"
              }`}
            >
              <div>
                {/* Header with Slot Type and Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid size-7 place-items-center rounded-xl transition-colors ${
                        isSelected
                          ? "bg-brand-leaf text-white"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-foreground">
                      {slot.name}
                    </span>
                  </div>

                  <div
                    className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-brand-leaf bg-brand-leaf text-white"
                        : "border-muted-foreground/30 bg-background"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="size-3.5" />}
                  </div>
                </div>

                {/* Timing & Date */}
                <div className="mt-2 space-y-0.5">
                  <p className="text-xs font-bold text-brand-leaf flex items-center gap-1.5">
                    <span>{slot.dateStr}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-foreground">{slot.timeWindow}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                    {slot.description}
                  </p>
                </div>
              </div>

              {/* Bottom footer: Fee & Bonus tag */}
              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                <div>
                  {slot.badge && (
                    <span
                      className={`inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        slot.badgeType === "gold"
                          ? "bg-brand-gold/15 text-brand-gold"
                          : slot.badgeType === "green"
                          ? "bg-brand-leaf/15 text-brand-leaf"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {slot.badge}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  {actualFee === 0 ? (
                    <span className="font-bold text-xs text-brand-leaf uppercase">FREE</span>
                  ) : (
                    <span className="font-bold text-xs text-foreground font-mono">
                      +₹{actualFee}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
