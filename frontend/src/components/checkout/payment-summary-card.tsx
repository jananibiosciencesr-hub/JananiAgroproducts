import React from "react";
import {
  ShieldCheck,
  Lock,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Receipt,
  Gift,
  Tag,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShippingAddress } from "./address-manager";
import type { DeliverySlot } from "./delivery-slot-picker";
import type { CouponRule } from "./coupon-selector-modal";
import type { AppliedGiftCard } from "./gift-card-card";

interface PaymentSummaryCardProps {
  cartItemsCount: number;
  subtotal: number;
  shippingFee: number;
  slotFee: number;
  coupon: CouponRule | null;
  couponDiscount: number;
  isWalletEnabled: boolean;
  walletDeduction: number;
  appliedGiftCard: AppliedGiftCard | null;
  finalTotal: number;
  totalSavings: number;
  selectedAddress: ShippingAddress | null;
  selectedSlot: DeliverySlot | null;
  isSubmitting: boolean;
  onPlaceOrder: (e: React.FormEvent) => void;
}

export function PaymentSummaryCard({
  cartItemsCount,
  subtotal,
  shippingFee,
  slotFee,
  coupon,
  couponDiscount,
  isWalletEnabled,
  walletDeduction,
  appliedGiftCard,
  finalTotal,
  totalSavings,
  selectedAddress,
  selectedSlot,
  isSubmitting,
  onPlaceOrder,
}: PaymentSummaryCardProps) {
  // GST 5% breakdown (2.5% CGST + 2.5% SGST)
  const taxableValue = Math.round(subtotal / 1.05);
  const totalGst = subtotal - taxableValue;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  return (
    <div className="space-y-4 sticky top-24">
      {/* 1. Dispatch & Delivery Route Preview */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-2.5 text-xs">
        <h4 className="font-bold text-foreground flex items-center justify-between border-b border-border pb-2">
          <span className="flex items-center gap-1.5 text-brand-leaf font-display text-sm">
            <Truck className="size-4" /> Dispatch Route Summary
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {cartItemsCount} {cartItemsCount === 1 ? "Item" : "Items"}
          </span>
        </h4>

        {/* Selected Address recap */}
        {selectedAddress ? (
          <div className="text-muted-foreground space-y-0.5">
            <div className="flex justify-between font-semibold text-foreground">
              <span>Deliver To:</span>
              <span className="text-brand-leaf">{selectedAddress.fullName}</span>
            </div>
            <p className="line-clamp-1">
              {selectedAddress.houseFlat}, {selectedAddress.city} ({selectedAddress.pincode})
            </p>
            <p className="text-[11px] text-muted-foreground/80">
              Mobile: {selectedAddress.phone}
            </p>
          </div>
        ) : (
          <p className="text-xs text-amber-600 font-medium">Please select a delivery address</p>
        )}

        {/* Selected Slot recap */}
        {selectedSlot && (
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-muted-foreground">
            <span>Delivery Window:</span>
            <span className="font-semibold text-foreground text-right">
              {selectedSlot.dateStr} • {selectedSlot.timeWindow}
            </span>
          </div>
        )}
      </div>

      {/* 2. Itemized Financial Summary Card */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <Receipt className="size-4 text-brand-leaf" />
            Payment Summary
          </h3>
          <span className="text-xs font-semibold text-muted-foreground">
            INR (₹) All Inclusive
          </span>
        </div>

        {/* Line Items */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Items Subtotal</span>
            <span className="font-semibold text-foreground">₹{subtotal}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              Standard Delivery
              {subtotal >= 799 && (
                <span className="text-[9px] bg-brand-leaf/15 text-brand-leaf px-1.5 py-0.2 rounded font-bold uppercase">
                  FREE OVER ₹799
                </span>
              )}
            </span>
            <span className="font-semibold text-foreground">
              {shippingFee === 0 ? (
                <span className="text-brand-leaf font-bold">FREE</span>
              ) : (
                `₹${shippingFee}`
              )}
            </span>
          </div>

          {slotFee > 0 && (
            <div className="flex justify-between text-brand-gold">
              <span>Express Priority Slot Surcharge</span>
              <span className="font-semibold">+₹{slotFee}</span>
            </div>
          )}

          {/* Coupon Discount */}
          {coupon && couponDiscount > 0 && (
            <div className="flex justify-between text-brand-leaf font-semibold">
              <span className="flex items-center gap-1">
                <Tag className="size-3" /> Coupon ({coupon.code})
              </span>
              <span>-₹{couponDiscount}</span>
            </div>
          )}

          {/* Wallet Balance */}
          {isWalletEnabled && walletDeduction > 0 && (
            <div className="flex justify-between text-brand-leaf font-semibold">
              <span className="flex items-center gap-1">
                <Wallet className="size-3" /> Farm Wallet Applied
              </span>
              <span>-₹{walletDeduction}</span>
            </div>
          )}

          {/* Gift Card */}
          {appliedGiftCard && appliedGiftCard.appliedAmount > 0 && (
            <div className="flex justify-between text-brand-leaf font-semibold">
              <span className="flex items-center gap-1">
                <Gift className="size-3" /> Gift Card ({appliedGiftCard.code})
              </span>
              <span>-₹{appliedGiftCard.appliedAmount}</span>
            </div>
          )}

          {/* Tax Breakdown Accordion */}
          <div className="pt-2 border-t border-dashed border-border text-[11px] space-y-1 text-muted-foreground/80">
            <div className="flex justify-between">
              <span>Taxable Merchandise Value</span>
              <span>₹{taxableValue}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (2.5% on organic staples)</span>
              <span>₹{cgst}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (2.5% on organic staples)</span>
              <span>₹{sgst}</span>
            </div>
          </div>
        </div>

        {/* Total Savings Callout */}
        {totalSavings > 0 && (
          <div className="rounded-xl bg-brand-leaf/10 border border-brand-leaf/30 p-2.5 text-center text-xs font-bold text-brand-leaf">
            🎉 You are saving ₹{totalSavings} on this organic harvest order!
          </div>
        )}

        {/* Final Amount */}
        <div className="border-t border-border pt-3.5 flex items-baseline justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Total Payable
            </span>
            <span className="text-[10px] text-muted-foreground">Inclusive of all taxes & delivery</span>
          </div>
          <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            ₹{finalTotal}
          </span>
        </div>

        {/* Place Order CTA */}
        <Button
          type="button"
          onClick={onPlaceOrder}
          disabled={isSubmitting || cartItemsCount === 0 || !selectedAddress}
          variant="gold"
          size="lg"
          className="w-full text-sm font-bold shadow-md h-12 rounded-2xl gap-2"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Confirming Harvest Order...
            </span>
          ) : (
            <>
              Place Order • ₹{finalTotal}
              <ChevronRight className="size-4" />
            </>
          )}
        </Button>

        {/* Trust Badges */}
        <div className="pt-3 border-t border-border/80 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-brand-leaf shrink-0" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-brand-leaf shrink-0" />
            <span>100% Certified Organic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RotateCcw className="size-3.5 text-brand-leaf shrink-0" />
            <span>Easy 7-Day Returns</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="size-3.5 text-brand-leaf shrink-0" />
            <span>Cold-Chain Secured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
