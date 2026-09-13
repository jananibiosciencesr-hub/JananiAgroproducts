import React from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
  Truck,
  ArrowRight,
  ShieldAlert,
  PhoneCall,
  Sparkles,
  ShoppingBag,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentSuccessViewProps {
  orderNumber: string;
  transactionId: string;
  paymentMethod: string;
  amount: number;
  deliveryDate: string;
  recipientName: string;
  recipientCity: string;
  onDownloadInvoice?: () => void;
}

export function PaymentSuccessView({
  orderNumber,
  transactionId,
  paymentMethod,
  amount,
  deliveryDate,
  recipientName,
  recipientCity,
}: PaymentSuccessViewProps) {
  const handleDownloadInvoice = () => {
    toast.success("GST Tax Invoice downloaded successfully!");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center animate-in fade-in duration-300">
      <div className="rounded-[3rem] border border-border bg-card p-6 sm:p-12 shadow-luxe">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-brand-leaf/15 text-brand-leaf shadow-inner">
          <CheckCircle2 className="size-12" />
        </span>

        <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-leaf bg-brand-leaf/10 px-3.5 py-1 rounded-full">
          <Sparkles className="size-3.5" /> Payment Verified Successfully
        </span>

        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-foreground">
          Harvest Order Confirmed!
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          We have verified your payment through <strong>{paymentMethod}</strong>. Your single-origin goods are queued for nitrogen-sealed packaging.
        </p>

        {/* Transaction & Order Summary Card */}
        <div className="my-8 rounded-3xl bg-secondary/70 p-5 sm:p-6 text-left border border-border space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between items-center pb-2.5 border-b border-border">
            <span className="text-muted-foreground">Order Reference:</span>
            <strong className="text-foreground font-mono text-base">{orderNumber}</strong>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Transaction ID:</span>
            <span className="font-mono text-brand-leaf font-bold">{transactionId}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Payment Method:</span>
            <span className="font-semibold uppercase text-foreground">{paymentMethod}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Scheduled Dispatch:</span>
            <span className="font-semibold text-brand-leaf">{deliveryDate}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Delivering To:</span>
            <span className="font-semibold text-foreground">
              {recipientName} ({recipientCity})
            </span>
          </div>

          <div className="flex justify-between items-center pt-2.5 border-t border-border">
            <span className="font-bold text-foreground">Total Paid:</span>
            <strong className="font-display text-2xl font-bold text-foreground">
              ₹{amount}
            </strong>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleDownloadInvoice}
            className="rounded-2xl px-5 text-xs font-bold gap-2"
          >
            <Download className="size-4" /> Download GST Invoice
          </Button>

          <Button asChild variant="gold" size="lg" className="rounded-2xl px-6 text-xs font-bold gap-2 shadow-md">
            <Link to="/order-success">
              <Sparkles className="size-4" /> Full Confirmation & Rewards
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="rounded-2xl px-5 text-xs font-bold gap-2 shadow-sm">
            <Link to="/track-order">
              <Truck className="size-4" /> Track Order Status
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="rounded-2xl px-5 text-xs font-semibold">
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface PaymentFailureViewProps {
  orderNumber: string;
  reason: string;
  onRetryPayment: () => void;
  onSwitchToCod: () => void;
}

export function PaymentFailureView({
  orderNumber,
  reason,
  onRetryPayment,
  onSwitchToCod,
}: PaymentFailureViewProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center animate-in fade-in duration-300">
      <div className="rounded-[3rem] border border-destructive/30 bg-card p-6 sm:p-12 shadow-luxe">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-destructive/10 text-destructive shadow-inner">
          <XCircle className="size-12" />
        </span>

        <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-destructive bg-destructive/10 px-3.5 py-1 rounded-full">
          <ShieldAlert className="size-3.5" /> Transaction Authorization Failed
        </span>

        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-foreground">
          Payment Was Not Completed
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          We could not complete your transaction with the selected payment provider.
        </p>

        {/* Error Details Card */}
        <div className="my-6 rounded-3xl bg-secondary/70 p-5 sm:p-6 text-left border border-border space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between items-center pb-2.5 border-b border-border">
            <span className="text-muted-foreground">Order Reference:</span>
            <strong className="text-foreground font-mono text-sm">{orderNumber}</strong>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground font-medium block">Reason for Decline:</span>
            <p className="text-destructive font-semibold text-xs bg-destructive/10 p-2.5 rounded-xl border border-destructive/20">
              {reason || "Bank gateway timed out or session was interrupted by user."}
            </p>
          </div>

          <div className="pt-2 text-[11px] text-muted-foreground">
            💡 <strong>Peace of mind guarantee:</strong> If money was debited from your account, your bank will automatically refund it within 24 to 48 banking hours.
          </div>
        </div>

        {/* Retry & Recovery Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            variant="gold"
            size="lg"
            onClick={onRetryPayment}
            className="rounded-2xl px-6 text-xs font-bold gap-2 shadow-md"
          >
            <RotateCcw className="size-4" /> Retry Payment
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onSwitchToCod}
            className="rounded-2xl px-5 text-xs font-semibold gap-2 border-brand-leaf/40 text-brand-leaf hover:bg-brand-leaf/10"
          >
            Switch to Cash on Delivery
          </Button>

          <Button asChild variant="outline" size="lg" className="rounded-2xl px-5 text-xs font-semibold">
            <Link to="/contact">Contact Farm Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
