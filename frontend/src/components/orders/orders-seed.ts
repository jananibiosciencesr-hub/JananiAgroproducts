import { CustomerOrder } from "./types";
import { pantryImage, productsImage, storyImage } from "@/lib/catalog";

export const INITIAL_ORDERS: CustomerOrder[] = [];

export function loadCustomerOrders(): CustomerOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS;

  try {
    const saved = localStorage.getItem("janani_customer_orders");
    let ordersList: CustomerOrder[] = saved ? JSON.parse(saved) : [];

    // Check if there is a recently placed order in janani_latest_order to prepend if missing
    const latestRaw = localStorage.getItem("janani_latest_order");
    if (latestRaw) {
      const latest = JSON.parse(latestRaw);
      const exists = ordersList.some((o) => o.number === latest.orderNumber);
      if (!exists && latest.orderNumber) {
        const newOrder: CustomerOrder = {
          id: `ord-${Date.now()}`,
          number: latest.orderNumber,
          date: latest.date || "Today, Just now",
          isoDate: new Date().toISOString().split("T")[0]!,
          status: "Processing",
          courier: "Delhivery Air Express & Janani Direct",
          awb: `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          expectedDelivery: latest.deliveryDate || "Tomorrow Morning (9:00 AM – 1:00 PM)",
          subtotal: latest.subtotal || latest.amount || 0,
          discount: latest.discount || 0,
          deliveryFee: latest.deliveryFee || 0,
          total: latest.finalTotal || latest.amount || 0,
          paymentMethod: latest.paymentMethod || "Instant UPI",
          transactionId: latest.transactionId || `TXN-${Date.now().toString().slice(-8)}`,
          address: {
            fullName: latest.customerName || latest.address?.fullName || "Valued Patron",
            phone: latest.customerPhone || latest.address?.phone || "+91 98480 22338",
            streetAddress: latest.customerAddress || latest.address?.streetAddress || "Registered Delivery Address",
            city: latest.address?.city || "Ahmedabad",
            state: latest.address?.state || "Gujarat",
            pincode: latest.address?.pincode || "380054",
          },
          items: latest.items?.map((it: any) => ({
            productId: it.product?.id || it.productId || 1,
            name: it.product?.name || it.name || "Single-Origin Organic Harvest",
            variant: it.variant || "Standard Pack",
            quantity: it.qty || it.quantity || 1,
            price: it.product?.price || it.price || 399,
            image: it.product?.image || it.image || pantryImage,
          })) || [],
          timeline: [
            {
              title: "Order Placed & Payment Verified",
              time: "Today, Just now",
              location: "Regional Processing Hub",
              done: true,
              current: true,
            },
            {
              title: "Quality Tested & Nitrogen Sealed",
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
        localStorage.setItem("janani_customer_orders", JSON.stringify(ordersList));
      }
    }

    return ordersList;
  } catch (e) {
    console.error("Failed to load customer orders", e);
    return INITIAL_ORDERS;
  }
}

export function saveCustomerOrders(orders: CustomerOrder[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("janani_customer_orders", JSON.stringify(orders));
  } catch (e) {
    console.error("Failed to save customer orders", e);
  }
}
