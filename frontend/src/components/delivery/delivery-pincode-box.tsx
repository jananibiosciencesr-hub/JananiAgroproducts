import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, MapPin, Truck } from "lucide-react";
import type { DeliveryQuote } from "@/lib/delivery";

interface DeliveryPincodeBoxProps {
  pincode: string;
  onPincodeChange: (pin: string) => void;
  quote: DeliveryQuote | null;
  loading: boolean;
  /** server unreachable */
  error?: boolean;
  /** compact variant for the product page */
  compact?: boolean;
  /** what the quote is for, e.g. "this item" */
  scope?: string;
}

const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/** Amazon-style "Deliver to <pincode>" box: enter a pincode and see the delivery charge for the cart / item. */
export function DeliveryPincodeBox({ pincode, onPincodeChange, quote, loading, error, compact, scope = "your order" }: DeliveryPincodeBoxProps) {
  const [draft, setDraft] = useState(pincode);
  const [editing, setEditing] = useState(!pincode);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setDraft(pincode);
    if (pincode) setEditing(false);
  }, [pincode]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setTouched(true);
    if (/^\d{6}$/.test(draft)) {
      onPincodeChange(draft);
      setEditing(false);
    }
  };

  const invalidDraft = touched && !/^\d{6}$/.test(draft);

  return (
    <div className={`border border-[#075B32]/25 bg-white ${compact ? "p-3" : "p-4"} space-y-2.5`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-bold text-[#075B32]">
          <Truck className="size-4" /> Delivery
        </span>
        {!editing && pincode && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-bold text-[#075B32] hover:underline cursor-pointer"
          >
            Change pincode
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={submit} className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value.replace(/\D/g, ""));
                setTouched(false);
              }}
              placeholder="Enter 6-digit pincode"
              aria-label="Delivery pincode"
              className="w-full h-10 border border-input bg-background pl-9 pr-3 text-sm font-mono font-semibold outline-none focus:border-[#075B32]"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-4 bg-[#075B32] hover:bg-[#064A29] text-white text-xs font-bold tracking-wide cursor-pointer"
          >
            Check
          </button>
        </form>
      ) : (
        <p className="flex items-center gap-1.5 text-sm text-foreground">
          <MapPin className="size-4 text-[#075B32]" />
          Deliver to <strong className="font-mono">{pincode}</strong>
          {quote?.city ? <span className="text-muted-foreground">({quote.city})</span> : null}
        </p>
      )}

      {invalidDraft && (
        <p className="flex items-center gap-1.5 text-xs text-red-700">
          <AlertCircle className="size-3.5 shrink-0" /> Please enter a valid 6-digit pincode.
        </p>
      )}

      {!pincode && (
        <p className="text-xs text-muted-foreground">Delivery charges are applicable. Enter your pincode to see the exact charge for {scope}.</p>
      )}

      {pincode && loading && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Calculating delivery charge…
        </p>
      )}

      {pincode && !loading && error && (
        <p className="flex items-center gap-1.5 text-xs text-red-700">
          <AlertCircle className="size-3.5 shrink-0" /> We could not check delivery right now. Please try again.
        </p>
      )}

      {pincode && !loading && quote && !quote.ok && (
        <p className="flex items-start gap-1.5 text-sm font-semibold text-red-700">
          <AlertCircle className="size-4 shrink-0 mt-0.5" /> {quote.message || "Delivery is not available for this pincode."}
        </p>
      )}

      {pincode && !loading && quote && quote.ok && quote.known && (
        <div className="space-y-1.5">
          {quote.free ? (
            <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-700">
              <CheckCircle2 className="size-4" /> FREE delivery on {scope}
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" /> Delivery charge: <span className="font-mono">{inr(quote.charge)}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Shipping weight {Number(quote.weightKg.toFixed(2))} kg
            {quote.freeAbove > 0 && !quote.free && quote.amountToFree > 0 && (
              <>
                {" "}
                · Add <strong className="text-[#075B32]">{inr(quote.amountToFree)}</strong> more for <strong className="text-emerald-700">FREE delivery</strong>
              </>
            )}
            {quote.freeAbove > 0 && quote.free && <> · Free delivery on orders above {inr(quote.freeAbove)}</>}
          </p>
        </div>
      )}
    </div>
  );
}
