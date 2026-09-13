import React, { useState } from "react";
import { ChevronUp, ChevronDown, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileCheckoutBarProps {
  finalTotal: number;
  subtotal: number;
  shippingFee: number;
  slotFee: number;
  couponDiscount: number;
  walletDeduction: number;
  giftCardDeduction: number;
  isSubmitting: boolean;
  onPlaceOrder: (e: React.FormEvent) => void;
  disabled: boolean;
}

export function MobileCheckoutBar({
  finalTotal,
  subtotal,
  shippingFee,
  slotFee,
  couponDiscount,
  walletDeduction,
  giftCardDeduction,
  isSubmitting,
  onPlaceOrder,
  disabled,
}: MobileCheckoutBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-card/95 backdrop-blur-md border-t border-border shadow-luxe transition-all">
      {/* Expandable Breakdown Drawer */}
      {isExpanded && (
        <div className="p-4 border-b border-border bg-background/90 text-xs space-y-2 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex justify-between text-muted-foreground">
            <span>Items Subtotal</span>
            <span className="font-semibold text-foreground">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery Charges</span>
            <span className="font-semibold text-brand-leaf">
              {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
            </span>
          </div>
          {slotFee > 0 && (
            <div className="flex justify-between text-brand-gold">
              <span>Express Priority Surcharge</span>
              <span className="font-semibold">+₹{slotFee}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-brand-leaf font-semibold">
              <span>Coupon Savings</span>
              <span>-₹{couponDiscount}</span>
            </div>
          )}
          {walletDeduction > 0 && (
            <div className="flex justify-between text-brand-leaf font-semibold">
              <span>Wallet Credits</span>
              <span>-₹{walletDeduction}</span>
            </div>
          )}
          {giftCardDeduction > 0 && (
            <div className="flex justify-between text-brand-leaf font-semibold">
              <span>Gift Card</span>
              <span>-₹{giftCardDeduction}</span>
            </div>
          )}
          <div className="pt-2 border-t border-border flex justify-between font-bold text-foreground">
            <span>Total Payable</span>
            <span className="text-base text-brand-leaf">₹{finalTotal}</span>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="flex items-center justify-between p-3.5 px-4 gap-3">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer select-none"
        >
          <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Total</span>
            {isExpanded ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />}
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            ₹{finalTotal}
          </span>
        </div>

        <Button
          type="button"
          onClick={onPlaceOrder}
          disabled={disabled || isSubmitting}
          variant="gold"
          size="default"
          className="flex-1 max-w-[220px] text-xs font-bold rounded-xl h-11 gap-1.5 shadow-sm"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </span>
          ) : (
            <>
              Place Order
              <ChevronRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
