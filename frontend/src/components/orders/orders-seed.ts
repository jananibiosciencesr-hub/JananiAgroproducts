import { CustomerOrder } from "./types";
import { pantryImage, productsImage, storyImage } from "@/lib/catalog";

export const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: "ord-1",
    number: "JAP-260811",
    date: "08 Sep 2026",
    isoDate: "2026-09-08",
    status: "Shipped",
    courier: "Delhivery Air Express",
    awb: "DEL-8492048194",
    expectedDelivery: "13 Sep 2026 (Morning 9:00 AM – 1:00 PM)",
    subtotal: 1396,
    discount: 150,
    deliveryFee: 0,
    total: 1246,
    paymentMethod: "UPI (Google Pay)",
    transactionId: "TXN-90248102",
    address: {
      fullName: "Neha Patel",
      phone: "+91 93114 16225",
      streetAddress: "Flat 402, Green Acre Heights, Bodakdev",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380054",
    },
    items: [
      {
        productId: 6,
        name: "Wood-Pressed Groundnut Oil",
        variant: "1 Litre Tin Can",
        quantity: 2,
        price: 399,
        image: pantryImage,
      },
      {
        productId: 1,
        name: "Organic Basmati Rice",
        variant: "1 kg Pack",
        quantity: 1,
        price: 249,
        image: productsImage,
      },
      {
        productId: 3,
        name: "Lakadong Turmeric Powder",
        variant: "200 g Aroma-Jar",
        quantity: 2,
        price: 189,
        image: storyImage,
      },
    ],
    timeline: [
      {
        title: "Order Placed & Payment Verified",
        time: "08 Sep 2026, 10:30 AM",
        location: "Ahmedabad Portal",
        done: true,
      },
      {
        title: "Batch Quality Tested & Nitrogen Packed",
        time: "09 Sep 2026, 03:15 PM",
        location: "Rajkot Lodhika Processing Hub",
        done: true,
      },
      {
        title: "Dispatched via Delhivery Express",
        time: "10 Sep 2026, 09:00 AM",
        location: "Saurashtra Central Gateway",
        done: true,
      },
      {
        title: "Arrived at Regional Sort Hub",
        time: "11 Sep 2026, 06:45 AM",
        location: "Ahmedabad Hub",
        done: true,
        current: true,
      },
      {
        title: "Out for Doorstep Delivery",
        time: "Expected 13 Sep 2026",
        location: "Bodakdev Delivery Branch",
        done: false,
      },
      {
        title: "Delivered to Customer",
        time: "Pending",
        location: "Customer Residence",
        done: false,
      },
    ],
  },
  {
    id: "ord-2",
    number: "JAP-260724",
    date: "24 Aug 2026",
    isoDate: "2026-08-24",
    status: "Delivered",
    courier: "BlueDart Express",
    awb: "BD-9912048551",
    expectedDelivery: "27 Aug 2026",
    subtotal: 979,
    discount: 100,
    deliveryFee: 0,
    total: 879,
    paymentMethod: "Net Banking (HDFC)",
    transactionId: "TXN-88241094",
    address: {
      fullName: "Neha Patel",
      phone: "+91 93114 16225",
      streetAddress: "Flat 402, Green Acre Heights, Bodakdev",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380054",
    },
    items: [
      {
        productId: 7,
        name: "Cold-Pressed Mustard Oil",
        variant: "1 Litre Bottle",
        quantity: 1,
        price: 329,
        image: pantryImage,
      },
      {
        productId: 9,
        name: "Unpolished Toor Dal",
        variant: "500 g Pack",
        quantity: 2,
        price: 199,
        image: productsImage,
      },
      {
        productId: 11,
        name: "Natural Jaggery Powder",
        variant: "500 g Pouch",
        quantity: 1,
        price: 129,
        image: storyImage,
      },
    ],
    timeline: [
      {
        title: "Order Placed",
        time: "24 Aug 2026, 02:15 PM",
        location: "Ahmedabad Portal",
        done: true,
      },
      {
        title: "Packed & Certified Organic",
        time: "25 Aug 2026, 11:00 AM",
        location: "Rajkot Hub",
        done: true,
      },
      {
        title: "Handed over to BlueDart",
        time: "25 Aug 2026, 06:00 PM",
        location: "Rajkot Transit Hub",
        done: true,
      },
      {
        title: "Delivered at Doorstep",
        time: "27 Aug 2026, 12:45 PM",
        location: "Bodakdev, Ahmedabad",
        done: true,
        current: true,
      },
    ],
  },
  {
    id: "ord-3",
    number: "JAP-260619",
    date: "19 Jul 2026",
    isoDate: "2026-07-19",
    status: "Delivered",
    courier: "Delhivery Air Express",
    awb: "DEL-7719203941",
    expectedDelivery: "22 Jul 2026",
    subtotal: 1648,
    discount: 100,
    deliveryFee: 0,
    total: 1548,
    paymentMethod: "Razorpay Card (Visa)",
    transactionId: "TXN-71930284",
    address: {
      fullName: "Neha Patel",
      phone: "+91 93114 16225",
      streetAddress: "Flat 402, Green Acre Heights, Bodakdev",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380054",
    },
    items: [
      {
        productId: 14,
        name: "Khapli Wheat (Emmer)",
        variant: "1 kg Pack",
        quantity: 2,
        price: 189,
        image: productsImage,
      },
      {
        productId: 21,
        name: "Almonds Premium (Mamra)",
        variant: "500 g Pack",
        quantity: 1,
        price: 599,
        image: storyImage,
      },
      {
        productId: 19,
        name: "Virgin Coconut Oil",
        variant: "500 ml Glass Jar",
        quantity: 1,
        price: 449,
        image: pantryImage,
      },
    ],
    timeline: [
      {
        title: "Order Placed",
        time: "19 Jul 2026, 09:00 AM",
        location: "Ahmedabad Portal",
        done: true,
      },
      {
        title: "Delivered to Customer",
        time: "22 Jul 2026, 04:30 PM",
        location: "Bodakdev, Ahmedabad",
        done: true,
        current: true,
      },
    ],
  },
  {
    id: "ord-4",
    number: "JAP-260512",
    date: "12 May 2026",
    isoDate: "2026-05-12",
    status: "Cancelled",
    courier: "Cancelled Before Dispatch",
    awb: "N/A",
    expectedDelivery: "Cancelled",
    subtotal: 658,
    discount: 0,
    deliveryFee: 40,
    total: 698,
    paymentMethod: "UPI (PhonePe)",
    transactionId: "TXN-55201948",
    cancellationReason: "Ordered wrong variant size by mistake",
    cancelledAt: "12 May 2026, 10:45 AM",
    refundMethod: "Refunded to Farm Wallet",
    refundStatus: "Completed",
    address: {
      fullName: "Neha Patel",
      phone: "+91 93114 16225",
      streetAddress: "Flat 402, Green Acre Heights, Bodakdev",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380054",
    },
    items: [
      {
        productId: 6,
        name: "Wood-Pressed Groundnut Oil",
        variant: "500 ml Bottle",
        quantity: 1,
        price: 219,
        image: pantryImage,
      },
      {
        productId: 19,
        name: "Virgin Coconut Oil",
        variant: "500 ml Glass Jar",
        quantity: 1,
        price: 449,
        image: storyImage,
      },
    ],
    timeline: [
      {
        title: "Order Placed",
        time: "12 May 2026, 09:15 AM",
        location: "Ahmedabad Portal",
        done: true,
      },
      {
        title: "Order Cancelled by Customer",
        time: "12 May 2026, 10:45 AM",
        location: "Ahmedabad Portal",
        done: true,
        current: true,
      },
      {
        title: "Full Refund Credited to Farm Wallet",
        time: "12 May 2026, 10:46 AM",
        location: "Janani Ledger",
        done: true,
      },
    ],
  },
];

export function loadCustomerOrders(): CustomerOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS;

  try {
    const saved = localStorage.getItem("janani_customer_orders");
    let ordersList: CustomerOrder[] = saved ? JSON.parse(saved) : [...INITIAL_ORDERS];

    // Check if there is a recently placed order in janani_latest_order to prepend
    const latestRaw = localStorage.getItem("janani_latest_order");
    if (latestRaw) {
      const latest = JSON.parse(latestRaw);
      const exists = ordersList.some((o) => o.number === latest.orderNumber);
      if (!exists && latest.orderNumber) {
        const newOrder: CustomerOrder = {
          id: `ord-${Date.now()}`,
          number: latest.orderNumber,
          date: "Today, Just now",
          isoDate: new Date().toISOString().split("T")[0]!,
          status: "Processing",
          courier: "Delhivery Air Express & Janani Direct",
          awb: `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          expectedDelivery: latest.deliveryDate || "Tomorrow Morning (9:00 AM – 1:00 PM)",
          subtotal: latest.subtotal || latest.amount || 1790,
          discount: latest.discount || 0,
          deliveryFee: latest.deliveryFee || 0,
          total: latest.finalTotal || latest.amount || 1790,
          paymentMethod: latest.paymentMethod || "Instant UPI",
          transactionId: latest.transactionId || `TXN-${Date.now().toString().slice(-8)}`,
          address: {
            fullName: latest.customerName || "Neha Patel",
            phone: latest.customerPhone || "+91 93114 16225",
            streetAddress: latest.customerAddress || "Flat 402, Green Acre Heights, Bodakdev",
            city: latest.address?.city || "Ahmedabad",
            state: "Gujarat",
            pincode: "380054",
          },
          items: latest.items?.map((it: any) => ({
            productId: it.product?.id || 1,
            name: it.product?.name || "Single-Origin Organic Harvest",
            variant: "Standard Pack",
            quantity: it.qty || 1,
            price: it.product?.price || 399,
            image: pantryImage,
          })) || [
            {
              productId: 6,
              name: "Wood-Pressed Groundnut Oil",
              variant: "1 Litre Tin Can",
              quantity: 2,
              price: 420,
              image: pantryImage,
            },
          ],
          timeline: [
            {
              title: "Order Placed & Payment Verified",
              time: "Today, Just now",
              location: "Ahmedabad Portal",
              done: true,
              current: true,
            },
            {
              title: "Quality Tested & Sealed",
              time: "Within 4 hours",
              location: "Rajkot Lodhika Facility",
              done: false,
            },
            {
              title: "Dispatched from Rajkot Hub",
              time: "Scheduled Tomorrow",
              location: "Central Gateway",
              done: false,
            },
            {
              title: "Out for Doorstep Delivery",
              time: latest.deliveryDate || "Tomorrow",
              location: "Ahmedabad Hub",
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
