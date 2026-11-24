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
import { formatProductName } from "@/lib/catalog";
import { requestOrderAction } from "@/lib/api";

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

export function MyOrdersPage() {
  const navigate = useNavigate();
  const { user } = useStore();

  // Orders state scoped to current user
  const [isMounted, setIsMounted] = useState(false);
  const [ordersList, setOrdersList] = useState<CustomerOrder[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

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
    saveCustomerOrders(newList, user?.email || user?.phone);
  };

  // Real-time server sync from MySQL backend strictly scoped to current user
  useEffect(() => {
    setIsMounted(true);
    // Immediately load cached orders for this specific customer
    const userScopedOrders = loadCustomerOrders(user?.email || user?.phone);
    setOrdersList(userScopedOrders);

    // If guest (not logged in), never query backend for all store orders
    if (!user?.email && !user?.phone) {
      return;
    }

    const fetchServerOrders = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (user?.email) {
          queryParams.append("email", user.email);
        } else if (user?.phone) {
          queryParams.append("phone", user.phone);
        }
        

        const qs = queryParams.toString();
        const res = await fetch(`/api.php?action=orders${qs ? `&${qs}` : ""}`);
        if (res.ok) {
          const data = await res.json();
          const ordersListRaw = Array.isArray(data?.orders) ? data.orders : (Array.isArray(data?.data) ? data.data : null);
          if (data?.success && Array.isArray(ordersListRaw)) {
            const serverOrders: CustomerOrder[] = ordersListRaw
              .map((o: any) => ({
              id: o.id || `ord-${o.number}`,
              number: o.number || o.orderNumber,
              orderNumber: o.number || o.orderNumber,
              customerEmail: o.customer_email || o.customerEmail || "",
              customerPhone: o.customer_phone || o.customerPhone || "",
              date: o.order_date || o.date || "Recent",
              isoDate: o.created_at ? o.created_at.split(" ")[0] : new Date().toISOString().split("T")[0]!,
              status: (o.order_status || o.status || "Processing") as OrderStatus,
              courier: o.courier || "Delhivery Air Express & Janani Fleet",
              awb: o.awb || o.tracking_id || "",
              expectedDelivery: o.expected_delivery || o.expectedDelivery || "2-3 Business Days",
              deliverySlot: o.delivery_slot || o.deliverySlot,
              subtotal: Number(o.subtotal) || 0,
              discount: Number(o.discount) || 0,
              couponCode: o.coupon_code || o.couponCode,
              couponDiscount: Number(o.coupon_discount || o.couponDiscount || 0),
              walletDeduction: Number(o.wallet_deduction || o.walletDeduction || 0),
              deliveryFee: Number(o.delivery_fee || o.deliveryFee || 0),
              total: Number(o.total || o.finalTotal || 0),
              finalTotal: Number(o.total || o.finalTotal || 0),
              paymentMethod: o.payment_method || o.paymentMethod || "",
              paymentStatus: o.payment_status || o.paymentStatus || "",
              transactionId: o.transaction_id || o.transactionId || "",
              address: {
                fullName: o.shippingAddress?.fullName || o.shippingAddress?.name || o.customer_name || user?.name || "",
                phone: o.shippingAddress?.phone || o.customer_phone || user?.phone || "",
                streetAddress: o.shippingAddress?.streetAddress || o.shippingAddress?.street || "",
                city: o.shippingAddress?.city || "",
                state: o.shippingAddress?.state || "",
                pincode: o.shippingAddress?.pincode || "",
              },
              items: Array.isArray(o.items) ? o.items.map((it: any) => ({
                productId: it.productId || it.id || 1,
                name: formatProductName(it.title || it.name || "Product"),
                variant: it.unit || it.variant || "",
                quantity: it.quantity || it.qty || 1,
                price: Number(it.price) || 0,
                image: it.image || "",
              })) : [],
              timeline: Array.isArray(o.timeline) ? o.timeline : [],
            }));

            // Authoritative server state directly sets user's order list
            setOrdersList(serverOrders);
            saveCustomerOrders(serverOrders, user?.email || user?.phone);
          }
        }
      } catch (e) {
        console.warn("Could not sync orders from MySQL server:", e);
      }
    };

    fetchServerOrders();
  }, [user]);

  // Status counts
  const counts = useMemo(() => {
    return {
      all: ordersList.length,
      active: ordersList.filter((o) => ["Processing", "Shipped", "Out for Delivery"].includes(o.status)).length,
      delivered: ordersList.filter((o) => o.status === "Delivered").length,
      cancelled: ordersList.filter((o) => o.status === "Cancelled").length,
      returns: ordersList.filter((o) => ["Return Requested", "Returned", "Exchange Requested", "Exchange Approved", "Exchanged"].includes(o.status)).length,
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
      result = result.filter((o) => ["Return Requested", "Returned", "Exchange Requested", "Exchange Approved", "Exchanged"].includes(o.status));
    }

    return result;
  }, [ordersList, searchQuery, statusFilter]);

  // Applies the order state returned by the server to the list shown on screen
  const applyServerOrderUpdate = (orderId: string, serverOrder: any, patch: Partial<CustomerOrder> & Record<string, any>) => {
    const updated = ordersList.map((o) => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        ...patch,
        status: ((serverOrder?.order_status || serverOrder?.status || patch.status || o.status) as OrderStatus),
        paymentStatus: serverOrder?.payment_status || serverOrder?.paymentStatus || o.paymentStatus,
        timeline: Array.isArray(serverOrder?.timeline) ? serverOrder.timeline : o.timeline,
      };
    });
    updateOrdersState(updated);
  };

  // Handler: Confirm Cancellation (server cancels, restocks and refunds online payments)
  const handleConfirmCancel = async (orderId: string, reason: string, refundMethod: string): Promise<boolean> => {
    const target = ordersList.find((o) => o.id === orderId);
    const res = await requestOrderAction(target?.number || orderId, "cancel", { reason, refundMethod });
    if (!res?.success) {
      toast.error(res?.message || "This order could not be cancelled. Please contact support.");
      return false;
    }
    applyServerOrderUpdate(orderId, res.order, {
      status: "Cancelled" as OrderStatus,
      cancellationReason: reason,
      cancelledAt: "Just now",
      refundMethod,
      refundStatus: res.refundNote || "",
    });
    toast.success(res.message || "Order cancelled.", { duration: 7000 });
    return true;
  };

  // Handler: Confirm Return Request (reviewed by the Janani team before pickup / refund)
  const handleConfirmReturn = async (orderId: string, returnData: { reason: string; pickupSlot: string; itemsSummary: string }): Promise<boolean> => {
    const target = ordersList.find((o) => o.id === orderId);
    const res = await requestOrderAction(target?.number || orderId, "return-request", {
      reason: returnData.reason,
      details: `Preferred pickup: ${returnData.pickupSlot}. ${returnData.itemsSummary}`,
    });
    if (!res?.success) {
      toast.error(res?.message || "Your return request could not be submitted. Please contact support.");
      return false;
    }
    applyServerOrderUpdate(orderId, res.order, {
      status: "Return Requested" as OrderStatus,
      returnReason: returnData.reason,
      returnPickupSlot: returnData.pickupSlot,
      returnStatus: "Requested",
    });
    toast.success(res.message || "Return requested.");
    return true;
  };

  // Handler: Confirm Exchange Request (reviewed by the Janani team)
  const handleConfirmExchange = async (orderId: string, exchangeData: { originalItem: string; replacementItem: string; reason: string }): Promise<boolean> => {
    const target = ordersList.find((o) => o.id === orderId);
    const res = await requestOrderAction(target?.number || orderId, "exchange-request", {
      reason: exchangeData.reason,
      details: `Exchange ${exchangeData.originalItem} for ${exchangeData.replacementItem}`,
    });
    if (!res?.success) {
      toast.error(res?.message || "Your exchange request could not be submitted. Please contact support.");
      return false;
    }
    applyServerOrderUpdate(orderId, res.order, {
      status: "Exchange Requested" as OrderStatus,
      exchangeReason: exchangeData.reason,
      exchangeReplacementItem: exchangeData.replacementItem,
      exchangeStatus: "Requested",
    });
    toast.success(res.message || "Exchange requested.");
    return true;
  };

    if (!isMounted) {
    return (
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:py-8 lg:py-12 pb-28 sm:pb-20 lg:pb-16 space-y-6" suppressHydrationWarning>
        <div className="h-28 rounded-3xl bg-secondary/80 animate-pulse" />
        <div className="h-12 rounded-2xl bg-secondary/80 animate-pulse" />
        <div className="space-y-4">
          <div className="h-48 rounded-3xl bg-secondary/80 animate-pulse" />
          <div className="h-48 rounded-3xl bg-secondary/80 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:py-8 lg:py-12 pb-28 sm:pb-20 lg:pb-16 space-y-4 sm:space-y-8 animate-in fade-in duration-300">
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
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-none text-left lg:whitespace-nowrap hyphens-none">
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
            {(searchQuery || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
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
          orderNumber={selectedInvoiceOrder.number || selectedInvoiceOrder.orderNumber || "ORD-000"}
          invoiceDate={selectedInvoiceOrder.date || "Recent"}
          customerName={selectedInvoiceOrder.address?.fullName || user?.name || "Valued Customer"}
          customerPhone={selectedInvoiceOrder.address?.phone || user?.phone || ""}
          customerEmail={selectedInvoiceOrder.customerEmail || (selectedInvoiceOrder.address as any)?.email || user?.email || ""}
          customerAddress={selectedInvoiceOrder.address ? `${selectedInvoiceOrder.address.streetAddress || ""}, ${selectedInvoiceOrder.address.city || ""}, ${selectedInvoiceOrder.address.state || ""} - ${selectedInvoiceOrder.address.pincode || ""}` : "Registered Delivery Address"}
          items={(Array.isArray(selectedInvoiceOrder.items) ? selectedInvoiceOrder.items : []).map((it: any) => ({
            name: formatProductName(it.name || it.title || "Agro Formulation Product"),
            quantity: it.quantity || it.qty || 1,
            price: it.price || 0,
          }))}
          subtotal={selectedInvoiceOrder.subtotal || 0}
          deliveryFee={selectedInvoiceOrder.deliveryFee || 0}
          discount={selectedInvoiceOrder.discount || 0}
          finalTotal={selectedInvoiceOrder.total || selectedInvoiceOrder.finalTotal || 0}
          paymentMethod={selectedInvoiceOrder.paymentMethod || "Online"}
          order={selectedInvoiceOrder}
        />
      )}
    </div>
  );
}
