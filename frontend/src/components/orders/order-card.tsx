import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Truck,
  Download,
  RotateCcw,
  RefreshCw,
  HelpCircle,
  XCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Package,
  ShoppingBag,
  ArrowRightLeft,
  AlertCircle,
  Copy,
  Check,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerOrder } from "./types";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";

interface OrderCardProps {
  order: CustomerOrder;
  onOpenTimeline: (order: CustomerOrder) => void;
  onOpenCancel: (order: CustomerOrder) => void;
  onOpenReturn: (order: CustomerOrder) => void;
  onOpenExchange: (order: CustomerOrder) => void;
  onOpenInvoice: (order: CustomerOrder) => void;
  onOpenSupport: (order: CustomerOrder) => void;
}

export function OrderCard({
  order,
  onOpenTimeline,
  onOpenCancel,
  onOpenReturn,
  onOpenExchange,
  onOpenInvoice,
  onOpenSupport,
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const { addToCart } = useStore();

  const handleCopyAwb = () => {
    if (order.awb && order.awb !== "N/A") {
      navigator.clipboard.writeText(order.awb);
      setCopiedAwb(true);
      toast.success("AWB copied!");
      setTimeout(() => setCopiedAwb(false), 2000);
    }
  };

  const handleReorder = () => {
    order.items.forEach((item) => {
      addToCart(item.productId, item.quantity);
    });
    toast.success(`Added ${order.items.length} items from ${order.number} to cart!`);
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold">
            <CheckCircle2 className="size-3.5" /> Delivered
          </span>
        );
      case "Shipped":
      case "Out for Delivery":
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold/20 text-brand-gold px-3 py-1 text-xs font-bold">
            <Truck className="size-3.5" /> {order.status}
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 text-destructive px-3 py-1 text-xs font-bold">
            <XCircle className="size-3.5" /> Cancelled
          </span>
        );
      case "Return Requested":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 px-3 py-1 text-xs font-bold">
            <RotateCcw className="size-3.5" /> Return Scheduled
          </span>
        );
      case "Exchanged":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-400 px-3 py-1 text-xs font-bold">
            <ArrowRightLeft className="size-3.5" /> Item Exchanged
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">
            {order.status}
          </span>
        );
    }
  };

  const isCancellable = order.status === "Processing" || order.status === "Shipped";
  const isReturnable = order.status === "Delivered";

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-soft transition-all duration-200 hover:shadow-md space-y-5">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <strong className="font-mono text-lg font-bold text-foreground tracking-tight">
              {order.number}
            </strong>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="size-3 text-muted-foreground" /> Placed on {order.date}
            </span>
            <span>•</span>
            <span>{order.items.length} items</span>
            {order.awb && order.awb !== "N/A" && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono text-foreground bg-secondary px-2 py-0.5 rounded-md">
                  AWB: {order.awb}
                  <button
                    type="button"
                    onClick={handleCopyAwb}
                    className="hover:text-brand-leaf transition ml-1"
                    title="Copy AWB"
                  >
                    {copiedAwb ? <Check className="size-3 text-brand-leaf" /> : <Copy className="size-3" />}
                  </button>
                </span>
              </>
            )}
          </p>
        </div>

        {/* Total Price & Expand Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="sm:text-right">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Total Paid</span>
            <p className="font-display text-xl font-bold text-foreground">₹{order.total}</p>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition"
            title={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          </button>
        </div>
      </div>

      {/* Cancellation or Return Notification Banner */}
      {order.status === "Cancelled" && order.cancellationReason && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive flex items-start gap-2.5">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Cancellation Confirmed ({order.cancelledAt || "Recent"})</p>
            <p className="text-muted-foreground mt-0.5">
              Reason: {order.cancellationReason} · <strong>{order.refundMethod || "Refund Processed"}</strong>
            </p>
          </div>
        </div>
      )}

      {order.status === "Return Requested" && order.returnPickupSlot && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
          <RotateCcw className="size-4 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-bold">Reverse Pickup Scheduled</p>
            <p className="text-muted-foreground mt-0.5">
              Doorstep courier arriving: <strong>{order.returnPickupSlot}</strong>. Keep items in original packaging.
            </p>
          </div>
        </div>
      )}

      {order.status === "Exchanged" && order.exchangeReplacementItem && (
        <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-3.5 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
          <ArrowRightLeft className="size-4 shrink-0 mt-0.5 text-purple-600" />
          <div>
            <p className="font-bold">Doorstep Item Exchange Initiated</p>
            <p className="text-muted-foreground mt-0.5">
              Replacement item: <strong>{order.exchangeReplacementItem}</strong>. Delivered at same visit.
            </p>
          </div>
        </div>
      )}

      {/* Items Preview List */}
      <div className="space-y-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="size-12 rounded-xl object-cover border border-border shrink-0"
                />
              ) : (
                <div className="size-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border">
                  <Package className="size-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-bold text-foreground text-sm line-clamp-1">{item.name}</p>
                <p className="text-muted-foreground mt-0.5">
                  {item.variant ? `${item.variant} · ` : ""}Qty: {item.quantity} × ₹{item.price}
                </p>
              </div>
            </div>

            <strong className="font-mono text-sm text-foreground shrink-0">
              ₹{item.quantity * item.price}
            </strong>
          </div>
        ))}
      </div>

      {/* Expanded Details: Address, Courier, Payment Breakdown */}
      {expanded && (
        <div className="pt-4 border-t border-border space-y-4 text-xs animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-2xl bg-secondary/60 p-4 border border-border">
            <div>
              <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                <MapPin className="size-3.5 text-brand-leaf" /> Delivery Address
              </span>
              <p className="font-medium text-foreground mt-1">{order.address.fullName}</p>
              <p className="text-muted-foreground mt-0.5">{order.address.streetAddress}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
              <p className="text-muted-foreground mt-0.5">{order.address.phone}</p>
            </div>

            <div>
              <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                <CreditCard className="size-3.5 text-brand-gold" /> Payment Information
              </span>
              <p className="font-medium text-foreground mt-1">Method: {order.paymentMethod}</p>
              <p className="text-muted-foreground mt-0.5">Transaction ID: <span className="font-mono">{order.transactionId}</span></p>
              <p className="text-brand-leaf font-semibold mt-0.5">Status: Settlement Verified</p>
            </div>

            <div>
              <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                <Truck className="size-3.5 text-brand-leaf" /> Logistics Details
              </span>
              <p className="font-medium text-foreground mt-1">Carrier: {order.courier}</p>
              <p className="text-muted-foreground mt-0.5">Estimated Delivery: {order.expectedDelivery}</p>
            </div>
          </div>

          {/* Pricing breakdown row */}
          <div className="flex flex-wrap justify-end gap-6 text-xs text-muted-foreground pt-1">
            <span>Subtotal: <strong className="text-foreground">₹{order.subtotal}</strong></span>
            {order.discount > 0 && (
              <span className="text-brand-leaf font-semibold">
                Discount: -₹{order.discount}
              </span>
            )}
            <span>Delivery: <strong className="text-foreground">{order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}</strong></span>
            <span>Total Paid: <strong className="font-bold text-foreground text-sm font-display">₹{order.total}</strong></span>
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
        {/* Left Secondary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Track Shipment / Timeline */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenTimeline(order)}
            className="rounded-full text-xs font-bold gap-1.5 hover:border-brand-leaf hover:text-brand-leaf"
          >
            <Truck className="size-3.5" />
            <span>Track Shipment</span>
          </Button>

          {/* Download Tax Invoice */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenInvoice(order)}
            className="rounded-full text-xs font-medium gap-1.5 hover:bg-secondary"
          >
            <Download className="size-3.5" />
            <span>Invoice</span>
          </Button>

          {/* Support Concierge */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenSupport(order)}
            className="rounded-full text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <HelpCircle className="size-3.5" />
            <span>Support</span>
          </Button>
        </div>

        {/* Right Primary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Reorder Button */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleReorder}
            className="rounded-full text-xs font-bold gap-1.5 hover:bg-brand-leaf/10 hover:text-brand-leaf"
          >
            <ShoppingBag className="size-3.5" />
            <span>Reorder</span>
          </Button>

          {/* Cancel Order (if eligible) */}
          {isCancellable && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenCancel(order)}
              className="rounded-full text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
            >
              Cancel Order
            </Button>
          )}

          {/* Return & Exchange (if delivered) */}
          {isReturnable && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenExchange(order)}
                className="rounded-full text-xs font-semibold gap-1.5 text-brand-gold border-brand-gold/40 hover:bg-brand-gold/10"
              >
                <ArrowRightLeft className="size-3.5" />
                <span>Exchange</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenReturn(order)}
                className="rounded-full text-xs font-semibold gap-1.5 hover:border-brand-leaf hover:text-brand-leaf"
              >
                <RotateCcw className="size-3.5" />
                <span>Return</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
