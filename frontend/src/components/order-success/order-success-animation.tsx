import React from "react";
import { CheckCircle2, Sparkles, Sprout, Heart } from "lucide-react";

export function OrderSuccessAnimation() {
  return (
    <div className="relative flex flex-col items-center justify-center py-4">
      {/* Decorative Aura Glow */}
      <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-brand-leaf/20 via-brand-gold/20 to-brand-leaf/20 blur-2xl opacity-70 animate-pulse pointer-events-none" />

      {/* Main Checkmark Badge */}
      <div className="relative z-10 size-24 sm:size-28 rounded-full bg-gradient-to-tr from-brand-leaf to-emerald-400 p-1 shadow-luxe flex items-center justify-center animate-in zoom-in-75 duration-300">
        <div className="size-full rounded-full bg-card flex items-center justify-center text-brand-leaf shadow-inner">
          <CheckCircle2 className="size-14 sm:size-16 stroke-[2.2] animate-in zoom-in duration-500 text-brand-leaf" />
        </div>
      </div>

      {/* Floating Sparkles & Badges */}
      <div className="absolute top-2 left-1/4 -translate-x-8 -translate-y-2 bg-brand-gold/15 text-brand-gold p-1.5 rounded-full animate-bounce duration-1000 shadow-sm">
        <Sparkles className="size-4" />
      </div>
      <div className="absolute bottom-4 right-1/4 translate-x-8 bg-brand-leaf/15 text-brand-leaf p-1.5 rounded-full animate-pulse shadow-sm">
        <Sprout className="size-4" />
      </div>

      {/* Tagline */}
      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-leaf/30 bg-brand-leaf/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-leaf shadow-xs">
        <Sparkles className="size-3.5" /> Order Placed & Confirmed
      </div>
    </div>
  );
}
