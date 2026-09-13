import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  Package,
  Search,
  Filter,
  Truck,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Home,
  SlidersHorizontal,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";

import { CustomerOrder, OrderStatus } from "@/components/orders/types";
import { loadCustomerOrders, saveCustomerOrders } from "@/components/orders/orders-seed";
import { OrderCard } from "@/components/orders/order-card";
import { OrderTimelineModal } from "@/components/orders/order-timeline-modal";
import { CancelOrderModal } from "@/components/orders/cancel-order-modal";
import { ReturnOrderModal } from "@/components/orders/return-order-modal";
import { ExchangeOrderModal } from "@/components/orders/exchange-order-modal";
import { OrderSupportModal } from "@/components/orders/order-support-modal";
import { OrderInvoiceModal } from "@/components/order-success/order-invoice-modal";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders & Shipments — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content: "Track live shipments, view past harvest orders, download GST invoices, cancel, return or exchange orders.",
      },
    ],
  }),
  component: MyOrdersPage,
});

type FilterStatus = "all" | "active" | "delivered" | "cancelled" | "returns";
type DateFilter = "all" | "30days" | "6months" | "2026";

export function MyOrdersPage() {
  const navigate = useNavigate();
  const { user } = useStore();

  // Orders state
  const [ordersList, setOrdersList] = useState<CustomerOrder[]>(() => loadCustomerOrders());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  // Active Modals state
  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState<CustomerOrder | null>(null);
  const [selectedCancelOrder, setSelectedCancelOrder] = useState<CustomerOrder | null>(null);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<CustomerOrder | null>(null);
  const [selectedExchangeOrder, setSelectedExchangeOrder] = useState<CustomerOrder | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<CustomerOrder | null>(null);
  const [selectedSupportOrder, setSelectedSupportOrder] = useState<CustomerOrder | null>(null);

  // Sync back to localStorage when ordersList changes
  const updateOrdersState = (newList: CustomerOrder[]) => {
    setOrdersList(newList);
    saveCustomerOrders(newList);
  };

  // Status counts
  const counts = useMemo(() => {
    return {
      all: ordersList.length,
      active: ordersList.filter((o) => ["Processing", "Shipped", "Out for Delivery"].includes(o.status)).length,
      delivered: ordersList.filter((o) => o.status === "Delivered").length,
      cancelled: ordersList.filter((o) => o.status === "Cancelled").length,
      returns: ordersList.filter((o) => ["Return Requested", "Exchanged"].includes(o.status)).length,
    };
  }, [ordersList]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    let result = ordersList;

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((o) => {
        const matchesNumber = o.number.toLowerCase().includes(q);
        const matchesAwb = o.awb?.toLowerCase().includes(q);
        const matchesItem = o.items.some((it) => it.name.toLowerCase().includes(q));
        const matchesAddress = o.address.city.toLowerCase().includes(q) || o.address.fullName.toLowerCase().includes(q);
        return matchesNumber || matchesAwb || matchesItem || matchesAddress;
      });
    }

    // 2. Status Filter
    if (statusFilter === "active") {
      result = result.filter((o) => ["Processing", "Shipped", "Out for Delivery"].includes(o.status));
    } else if (statusFilter === "delivered") {
      result = result.filter((o) => o.status === "Delivered");
    } else if (statusFilter === "cancelled") {
      result = result.filter((o) => o.status === "Cancelled");
    } else if (statusFilter === "returns") {
      result = result.filter((o) => ["Return Requested", "Exchanged"].includes(o.status));
    }

    // 3. Date Filter
    if (dateFilter !== "all") {
      const now = new Date("2026-09-12T21:00:00Z").getTime();
      result = result.filter((o) => {
        const orderTime = new Date(o.isoDate).getTime();
        const diffDays = (now - orderTime) / (1000 * 60 * 60 * 24);
        if (dateFilter === "30days") return diffDays <= 30;
        if (dateFilter === "6months") return diffDays <= 180;
        if (dateFilter === "2026") return o.isoDate.startsWith("2026");
        return true;
      });
    }

    return result;
  }, [ordersList, searchQuery, statusFilter, dateFilter]);

  // Handler: Confirm Cancellation
  const handleConfirmCancel = (orderId: string, reason: string, refundMethod: string) => {
    const updated = ordersList.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "Cancelled" as OrderStatus,
          cancellationReason: reason,
          cancelledAt: "Today, Just now",
          refundMethod,
          refundStatus: "Refund Credited",
          timeline: [
            ...o.timeline,
            {
              title: "Order Cancelled by Customer",
              time: "Today, Just now",
              location: "Janani Care Desk",
              done: true,
              current: true,
            },
            {
              title: `Refund Processed (${refundMethod})`,
              time: "Within 24 Hours",
              location: "Accounts Treasury",
              done: true,
            },
          ],
        };
      }
      return o;
    });
    updateOrdersState(updated);
  };

  // Handler: Confirm Return Request
  const handleConfirmReturn = (orderId: string, returnData: { reason: string; pickupSlot: string; itemsSummary: string }) => {
    const updated = ordersList.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "Return Requested" as OrderStatus,
          returnReason: returnData.reason,
          returnPickupSlot: returnData.pickupSlot,
          returnStatus: "Pickup Scheduled",
          timeline: [
            ...o.timeline,
            {
              title: "Return Request Registered",
              time: "Today, Just now",
              location: "Janani Care Desk",
              done: true,
            },
            {
              title: `Reverse Pickup Scheduled (${returnData.pickupSlot})`,
              time: "Scheduled",
              location: "Doorstep Courier Hub",
              done: false,
              current: true,
            },
          ],
        };
      }
      return o;
    });
    updateOrdersState(updated);
  };

  // Handler: Confirm Exchange Request
  const handleConfirmExchange = (orderId: string, exchangeData: { originalItem: string; replacementItem: string; reason: string }) => {
    const updated = ordersList.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "Exchanged" as OrderStatus,
          exchangeReason: exchangeData.reason,
          exchangeReplacementItem: exchangeData.replacementItem,
          exchangeStatus: "Replacement Dispatched",
          timeline: [
            ...o.timeline,
            {
              title: "Item Exchange Handover Scheduled",
              time: "Today, Just now",
              location: "Janani Logistics Center",
              done: true,
              current: true,
            },
            {
              title: `Replacement Handover (${exchangeData.replacementItem})`,
              time: "Expected in 2 Days",
              location: "Customer Residence",
              done: false,
            },
          ],
        };
      }
      return o;
    });
    updateOrdersState(updated);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 pb-24 lg:pb-16 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link to="/" className="hover:text-brand-leaf transition flex items-center gap-1">
          <Home className="size-3.5" /> Home
        </Link>
        <span>/</span>
        <Link to="/dashboard" className="hover:text-brand-leaf transition">Account</Link>
        <span>/</span>
        <span className="text-brand-leaf font-bold">My Orders</span>
      </div>

      {/* Page Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-leaf/15 text-brand-leaf px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
              <Package className="size-3.5" /> Patron Order History
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-2">
            My Orders & Shipments
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            Track real-time courier dispatches, download GST invoices, initiate easy returns or exchanges, and reorder favourite organic batches with 1 click.
          </p>
        </div>

        {/* Quick actions & stats */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Button asChild variant="gold" size="sm" className="rounded-full text-xs font-bold gap-1.5 shadow-sm">
            <Link to="/products">
              <ShoppingBag className="size-4" /> Shop Fresh Harvest
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-semibold gap-1.5">
            <Link to="/track-order">
              <Truck className="size-4" /> Live Tracking Map
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (e.g. JAP-260811), product name, or AWB..."
              className="h-11 w-full rounded-2xl border border-input bg-card pl-11 pr-10 text-xs sm:text-sm outline-none focus:border-brand-leaf shadow-xs transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3 p-0.5 rounded-full hover:bg-secondary text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Date Range Dropdown */}
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground hidden sm:block shrink-0" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="h-11 rounded-2xl border border-input bg-card px-3.5 text-xs font-semibold text-foreground outline-none focus:border-brand-leaf shadow-xs"
            >
              <option value="all">All Time History</option>
              <option value="30days">Last 30 Days</option>
              <option value="6months">Past 6 Months</option>
              <option value="2026">Year 2026</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "all", label: "All Orders", count: counts.all },
            { id: "active", label: "In Transit / Active", count: counts.active },
            { id: "delivered", label: "Delivered", count: counts.delivered },
            { id: "returns", label: "Returns & Exchanges", count: counts.returns },
            { id: "cancelled", label: "Cancelled", count: counts.cancelled },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as FilterStatus)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition shrink-0 ${
                  isActive
                    ? "bg-brand-leaf text-white shadow-sm"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive ? "bg-white/25 text-white" : "bg-card text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List / Results */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing <strong>{filteredOrders.length}</strong> of {ordersList.length} orders
            </span>
            {(searchQuery || statusFilter !== "all" || dateFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDateFilter("all");
                }}
                className="text-brand-leaf font-bold hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOpenTimeline={(ord) => setSelectedTimelineOrder(ord)}
                onOpenCancel={(ord) => setSelectedCancelOrder(ord)}
                onOpenReturn={(ord) => setSelectedReturnOrder(ord)}
                onOpenExchange={(ord) => setSelectedExchangeOrder(ord)}
                onOpenInvoice={(ord) => setSelectedInvoiceOrder(ord)}
                onOpenSupport={(ord) => setSelectedSupportOrder(ord)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
            <Package className="size-8" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">
            No Matching Orders Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `We couldn't find any orders matching "${searchQuery}". Try searching with a different keyword or Order ID.`
              : "You do not have any orders matching the selected filter criteria."}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setDateFilter("all");
              }}
              className="rounded-full text-xs"
            >
              Clear Filters
            </Button>
            <Button asChild variant="gold" size="sm" className="rounded-full text-xs font-bold">
              <Link to="/products">Explore Catalog</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Modals Suite */}
      <OrderTimelineModal
        order={selectedTimelineOrder}
        isOpen={!!selectedTimelineOrder}
        onClose={() => setSelectedTimelineOrder(null)}
      />

      <CancelOrderModal
        order={selectedCancelOrder}
        isOpen={!!selectedCancelOrder}
        onClose={() => setSelectedCancelOrder(null)}
        onConfirmCancel={handleConfirmCancel}
      />

      <ReturnOrderModal
        order={selectedReturnOrder}
        isOpen={!!selectedReturnOrder}
        onClose={() => setSelectedReturnOrder(null)}
        onConfirmReturn={handleConfirmReturn}
      />

      <ExchangeOrderModal
        order={selectedExchangeOrder}
        isOpen={!!selectedExchangeOrder}
        onClose={() => setSelectedExchangeOrder(null)}
        onConfirmExchange={handleConfirmExchange}
      />

      <OrderSupportModal
        order={selectedSupportOrder}
        isOpen={!!selectedSupportOrder}
        onClose={() => setSelectedSupportOrder(null)}
      />

      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          orderNumber={selectedInvoiceOrder.number}
          invoiceDate={selectedInvoiceOrder.date}
          customerName={selectedInvoiceOrder.address.fullName}
          customerPhone={selectedInvoiceOrder.address.phone}
          customerAddress={`${selectedInvoiceOrder.address.streetAddress}, ${selectedInvoiceOrder.address.city}, ${selectedInvoiceOrder.address.state} - ${selectedInvoiceOrder.address.pincode}`}
          items={selectedInvoiceOrder.items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            price: it.price,
          }))}
          subtotal={selectedInvoiceOrder.subtotal}
          deliveryFee={selectedInvoiceOrder.deliveryFee}
          discount={selectedInvoiceOrder.discount}
          finalTotal={selectedInvoiceOrder.total}
          paymentMethod={selectedInvoiceOrder.paymentMethod}
        />
      )}
    </div>
  );
}
