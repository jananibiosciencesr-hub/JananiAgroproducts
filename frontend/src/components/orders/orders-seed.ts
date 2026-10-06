import { CustomerOrder } from "./types";
import { pantryImage } from "@/lib/catalog";

export const INITIAL_ORDERS: CustomerOrder[] = [];

export function getUserOrdersKey(userEmailOrPhone?: string | null): string {
  if (!userEmailOrPhone) {
    if (typeof window !== "undefined") {
      try {
        const u = localStorage.getItem("janani_user") || localStorage.getItem("janani_auth_user");
        if (u) {
          const parsed = JSON.parse(u);
          const idOrEmail = parsed?.email || parsed?.phone || parsed?.id;
          if (idOrEmail) {
            const clean = String(idOrEmail).toLowerCase().trim().replace(/[^a-z0-9_@.-]/g, "_");
            return `janani_customer_orders_${clean}`;
          }
        }
      } catch (e) {}
    }
    return "janani_customer_orders_guest";
  }
  const clean = String(userEmailOrPhone).toLowerCase().trim().replace(/[^a-z0-9_@.-]/g, "_");
  return `janani_customer_orders_${clean}`;
}

export function loadCustomerOrders(userEmailOrPhone?: string | null): CustomerOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS;

  try {
    let effectiveUser = userEmailOrPhone;
    if (!effectiveUser) {
      try {
        const u = localStorage.getItem("janani_user") || localStorage.getItem("janani_auth_user");
        if (u) {
          const parsed = JSON.parse(u);
          effectiveUser = parsed?.email || parsed?.phone || null;
        }
      } catch (e) {}
    }

    const userKey = getUserOrdersKey(effectiveUser);
    const saved = localStorage.getItem(userKey);
    let ordersList: CustomerOrder[] = [];

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          ordersList = parsed.filter((o) => o && typeof o === "object");
        }
      } catch (e) {
        console.warn("Error parsing stored customer orders:", e);
      }
    }

    // Filter out any order that has an explicit customerEmail/customerPhone belonging to another customer
    if (effectiveUser) {
      const cleanUser = effectiveUser.toLowerCase().trim();
      const phoneDigits = effectiveUser.replace(/\D/g, "");
      ordersList = ordersList.filter((o: any) => {
        const orderEmail = (o.customerEmail || o.email || "").toLowerCase().trim();
        const orderPhone = (o.customerPhone || o.phone || o.address?.phone || "").replace(/\D/g, "");
        if (orderEmail && cleanUser.includes("@")) {
          return orderEmail === cleanUser;
        }
        if (orderPhone && phoneDigits.length >= 10) {
          return orderPhone.endsWith(phoneDigits.slice(-10));
        }
        return true;
      });
    }

    // Check if there is a recently placed order in janani_latest_order
    const latestRaw = localStorage.getItem("janani_latest_order");
    if (latestRaw) {
      try {
        const latest = JSON.parse(latestRaw);
        if (latest && typeof latest === "object" && latest.orderNumber) {
          const latestEmail = (latest.customerEmail || "").toLowerCase().trim();
          const latestPhone = (latest.customerPhone || "").replace(/\D/g, "");
          const currentEmail = (effectiveUser || "").toLowerCase().trim();
          const currentPhone = (effectiveUser || "").replace(/\D/g, "");

          const belongsToUser = !effectiveUser ||
            (currentEmail && latestEmail && currentEmail === latestEmail) ||
            (currentPhone && latestPhone && currentPhone.endsWith(latestPhone.slice(-10)));

          if (belongsToUser) {
            const exists = ordersList.some((o) => o && (o.number === latest.orderNumber || o.orderNumber === latest.orderNumber));
            if (!exists) {
              const newOrder: CustomerOrder = {
                id: `ord-${Date.now()}`,
                number: latest.orderNumber,
                orderNumber: latest.orderNumber,
                customerEmail: latest.customerEmail,
                customerPhone: latest.customerPhone,
                date: latest.date || "Today, Just now",
                isoDate: new Date().toISOString().split("T")[0]!,
                status: "Processing",
                courier: "Delhivery Air Express & Janani Direct",
                awb: `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                expectedDelivery: latest.deliveryDate || "Tomorrow Morning (9:00 AM – 1:00 PM)",
                deliverySlot: latest.deliverySlot || latest.slot?.dateStr || latest.deliveryDate,
                subtotal: Number(latest.subtotal) || Number(latest.amount) || 0,
                discount: Number(latest.discount) || 0,
                couponCode: latest.couponCode || null,
                couponDiscount: Number(latest.couponDiscount) || 0,
                walletDeduction: Number(latest.walletDeduction) || 0,
                deliveryFee: Number(latest.deliveryFee) || 0,
                total: Number(latest.finalTotal) || Number(latest.amount) || 0,
                finalTotal: Number(latest.finalTotal) || Number(latest.amount) || 0,
                paymentMethod: latest.paymentMethod || "Razorpay (Online)",
                transactionId: latest.transactionId || `pay_rzp_${Date.now()}`,
                address: {
                  fullName: latest.customerName || latest.address?.fullName || "Valued Patron",
                  phone: latest.customerPhone || latest.address?.phone || "",
                  streetAddress: latest.customerAddress || latest.address?.streetAddress || "Registered Delivery Address",
                  city: latest.address?.city || "Ahmedabad",
                  state: latest.address?.state || "Gujarat",
                  pincode: latest.address?.pincode || "380054",
                },
                items: Array.isArray(latest.items) ? latest.items.map((it: any) => ({
                  productId: it?.product?.id || it?.productId || 1,
                  name: it?.product?.name || it?.name || "Janani Bio Formulation",
                  variant: it?.variant || "Standard Pack",
                  quantity: it?.qty || it?.quantity || 1,
                  price: Number(it?.product?.price || it?.price || 399),
                  image: it?.product?.image || it?.image || pantryImage,
                })) : [],
                timeline: [
                  {
                    title: "Order Placed & Payment Verified",
                    time: "Today, Just now",
                    location: "Regional Processing Hub",
                    done: true,
                    current: true,
                  },
                  {
                    title: "Quality Tested & Formulation Inspected",
                    time: "Within 4 hours",
                    location: "Rajkot Lodhika Processing Hub",
                    done: false,
                  },
                  {
                    title: "Dispatched via Express Courier",
                    time: "Scheduled Tomorrow",
                    location: "Central Gateway",
                    done: false,
                  },
                  {
                    title: "Out for Doorstep Delivery",
                    time: latest.deliveryDate || "Tomorrow",
                    location: "Local Delivery Hub",
                    done: false,
                  },
                ],
              };
              ordersList = [newOrder, ...ordersList];
              localStorage.setItem(userKey, JSON.stringify(ordersList));
            }
          }
        }
      } catch (e) {
        console.warn("Error parsing latest order:", e);
      }
    }

    return ordersList;
  } catch (e) {
    console.error("Failed to load customer orders", e);
    return INITIAL_ORDERS;
  }
}

export function saveCustomerOrders(orders: CustomerOrder[], userEmailOrPhone?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    let effectiveUser = userEmailOrPhone;
    if (!effectiveUser) {
      try {
        const u = localStorage.getItem("janani_user") || localStorage.getItem("janani_auth_user");
        if (u) {
          const parsed = JSON.parse(u);
          effectiveUser = parsed?.email || parsed?.phone || null;
        }
      } catch (e) {}
    }
    const key = getUserOrdersKey(effectiveUser);
    localStorage.setItem(key, JSON.stringify(orders));
  } catch (e) {
    console.error("Failed to save customer orders", e);
  }
}
