import React, { useState } from "react";
import { Truck, Copy, Check, Phone, ShieldCheck, UserCheck, ExternalLink, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LiveCourierCardProps {
  courierName?: string;
  awb?: string;
  status?: string;
  riderName?: string;
  riderPhone?: string;
  vehicleNumber?: string;
  lastUpdated?: string;
}

export function LiveCourierCard({
  courierName = "Delhivery Air Express",
  awb = "DEL-8492048194",
  status = "Out for Delivery",
  riderName = "Ramesh Kumar",
  riderPhone = "+91 98765 43210",
  vehicleNumber = "GJ-03-BW-4821",
  lastUpdated = "14 mins ago",
}: LiveCourierCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAwb = () => {
    navigator.clipboard.writeText(awb);
    setCopied(true);
    toast.success("Tracking AWB copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-sm space-y-5">
      {/* Header with Live Status Beacon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Logistics Partner
          </span>
          <h4 className="font-display text-lg font-bold text-foreground mt-0.5">
            {courierName}
          </h4>
        </div>

        {/* Live Status Beacon */}
        <div className="flex items-center gap-2 rounded-full bg-brand-leaf/15 text-brand-leaf border border-brand-leaf/30 px-3.5 py-1 text-xs font-bold self-start sm:self-auto">
          <span className="size-2 rounded-full bg-brand-leaf animate-ping" />
          <span>{status}</span>
        </div>
      </div>

      {/* Tracking Number (AWB) Bar */}
      <div className="rounded-2xl bg-secondary/80 p-3.5 border border-border flex items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-muted-foreground block text-[11px]">Consignment Number (AWB)</span>
          <strong className="font-mono text-sm text-foreground font-bold tracking-wider">{awb}</strong>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyAwb}
            className="rounded-full text-xs font-bold gap-1.5 h-8"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-brand-leaf" /> Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" /> Copy AWB
              </>
            )}
          </Button>

          <Button asChild variant="ghost" size="sm" className="rounded-full text-xs h-8 p-2" title="Carrier Portal">
            <a
              href={`https://www.delhivery.com/track/package/${awb}`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Assigned Delivery Rider Profile */}
      <div className="rounded-2xl border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-brand-leaf/15 text-brand-leaf flex items-center justify-center font-display font-bold text-base">
            RK
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h5 className="text-xs font-bold text-foreground">{riderName}</h5>
              <span className="inline-flex items-center gap-1 rounded-md bg-brand-leaf/10 text-brand-leaf px-1.5 py-0.2 text-[10px] font-bold">
                <UserCheck className="size-3" /> Verified Rider
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Vehicle: <strong className="font-mono text-foreground">{vehicleNumber}</strong> · Updated {lastUpdated}
            </p>
          </div>
        </div>

        <Button asChild variant="gold" size="sm" className="rounded-full text-xs font-bold gap-1.5 self-start sm:self-auto shadow-xs">
          <a href={`tel:${riderPhone}`}>
            <Phone className="size-3.5" /> Call Rider
          </a>
        </Button>
      </div>
    </div>
  );
}
