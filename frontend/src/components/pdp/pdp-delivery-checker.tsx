import React, { useState } from "react";
import {
  MapPin,
  Truck,
  RotateCcw,
  ShieldCheck,
  PackageCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/store-provider";

interface PdpDeliveryCheckerProps {
  productName: string;
}

export function PdpDeliveryChecker({ productName }: PdpDeliveryCheckerProps) {
  const { user } = useStore();
  const [pincode, setPincode] = useState(user?.preferences?.pinCode || "380015");
  const [checkStatus, setCheckStatus] = useState<"idle" | "success" | "invalid">("success");
  const [deliveryInfo, setDeliveryInfo] = useState({
    city: "Ahmedabad, Gujarat",
    estimate: "Tomorrow by 2:00 PM",
    isExpress: true,
    codAvailable: true,
    freeDelivery: true,
  });

  const handleCheck = () => {
    if (!/^\d{6}$/.test(pincode.trim())) {
      setCheckStatus("invalid");
      return;
    }

    // Determine realistic location & delivery slot based on pin
    const pin = pincode.trim();
    if (pin.startsWith("38") || pin.startsWith("39") || pin.startsWith("36")) {
      setDeliveryInfo({
        city: "Gujarat Hub",
        estimate: "Tomorrow by 2:00 PM",
        isExpress: true,
        codAvailable: true,
        freeDelivery: true,
      });
    } else if (pin.startsWith("40") || pin.startsWith("41") || pin.startsWith("56")) {
      setDeliveryInfo({
        city: "Metro Zone (Mumbai / Bangalore)",
        estimate: "In 2 Days (Express Air)",
        isExpress: true,
        codAvailable: true,
        freeDelivery: true,
      });
    } else {
      setDeliveryInfo({
        city: "Pan-India Standard Zone",
        estimate: "In 3–4 Working Days",
        isExpress: false,
        codAvailable: true,
        freeDelivery: true,
      });
    }
    setCheckStatus("success");
  };

  return (
    <div className="space-y-4">
      {/* Delivery PIN Code Box */}
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf flex items-center gap-1.5">
            <Truck className="size-4 text-brand-leaf" /> Estimated Delivery & Serviceability
          </span>
          <span className="text-[11px] text-muted-foreground">Pan-India Dispatch</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, ""));
                setCheckStatus("idle");
              }}
              placeholder="Enter 6-digit PIN code"
              className="w-full h-10 rounded-xl border border-input bg-background pl-9 pr-3 text-xs font-mono font-semibold outline-none focus:border-primary"
            />
          </div>
          <Button
            onClick={handleCheck}
            variant="outline"
            className="h-10 rounded-xl px-4 text-xs font-bold"
          >
            Check
          </Button>
        </div>

        {/* Verification Feedback Result */}
        {checkStatus === "success" && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Delivering to {pincode} ({deliveryInfo.city})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-emerald-700 pl-6">
              <p>• Estimated Delivery: <strong>{deliveryInfo.estimate}</strong></p>
              <p>• Free Delivery on this order</p>
              <p>• Cash on Delivery (COD) Available</p>
              <p>• Dispatched from Farm Hub in 12 hrs</p>
            </div>
          </div>
        )}

        {checkStatus === "invalid" && (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            Please enter a valid 6-digit Indian PIN code (e.g. 380015).
          </div>
        )}
      </div>

      {/* Return & Trust Guarantee Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card/70 p-3 text-center flex flex-col items-center justify-center">
          <RotateCcw className="size-5 text-brand-leaf mb-1.5" />
          <h5 className="text-xs font-bold text-foreground">7-Day Easy Return</h5>
          <p className="text-[10px] text-muted-foreground mt-0.5">Hassle-free replacement</p>
        </div>

        <div className="rounded-2xl border border-border bg-card/70 p-3 text-center flex flex-col items-center justify-center">
          <ShieldCheck className="size-5 text-emerald-600 mb-1.5" />
          <h5 className="text-xs font-bold text-foreground">100% Pure Organic</h5>
          <p className="text-[10px] text-muted-foreground mt-0.5">Lab tested batch purity</p>
        </div>

        <div className="rounded-2xl border border-border bg-card/70 p-3 text-center flex flex-col items-center justify-center">
          <PackageCheck className="size-5 text-brand-gold mb-1.5" />
          <h5 className="text-xs font-bold text-foreground">Eco Glass Packaging</h5>
          <p className="text-[10px] text-muted-foreground mt-0.5">Food-grade safe delivery</p>
        </div>

        <div className="rounded-2xl border border-border bg-card/70 p-3 text-center flex flex-col items-center justify-center">
          <Sparkles className="size-5 text-amber-500 mb-1.5" />
          <h5 className="text-xs font-bold text-foreground">Direct Fair Trade</h5>
          <p className="text-[10px] text-muted-foreground mt-0.5">Direct farmer profit share</p>
        </div>
      </div>
    </div>
  );
}
