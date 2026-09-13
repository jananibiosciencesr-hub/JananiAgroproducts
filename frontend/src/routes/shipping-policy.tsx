import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/page-kit";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping & Delivery Policy — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Learn about our nationwide shipping timelines, complimentary delivery above ₹799, and dispatch standards." },
    ],
  }),
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping & Delivery Policy"
      intro="We take utmost care to ensure that your pure organic harvests are packed hygienically and delivered to your doorstep in the freshest possible condition."
      sections={[
        [
          "1. Delivery Coverage & Serviceable Locations",
          "Janani Agro Products delivers to over 24,000 pin codes across India. We partner with leading tier-1 courier partners including Delhivery, BlueDart, DTDC, and India Post Speed Post for regional and rural dispatches.",
        ],
        [
          "2. Order Processing & Dispatch Timelines",
          "All orders placed before 2:00 PM IST (Monday through Saturday) are typically verified, quality-inspected, and dispatched from our central facility in Lodhika GIDC, Gujarat within 24 to 48 hours. Orders placed on Sundays or national holidays are dispatched on the next working day.",
        ],
        [
          "3. Delivery Estimates",
          "• Metro Cities (Ahmedabad, Mumbai, Delhi, Bengaluru, Pune, Hyderabad, Chennai, Kolkata): 2 to 4 business days.\n• Tier-2 & Tier-3 Cities: 3 to 6 business days.\n• Remote & North-East Regions: 5 to 8 business days.",
        ],
        [
          "4. Shipping Charges & Free Delivery Threshold",
          "• Complimentary FREE Delivery is applicable on all domestic retail orders with a cart value of ₹799 and above.\n• For orders below ₹799, a nominal standard shipping fee of ₹60 is applied at checkout.\n• Bulk & Wholesale shipments are governed by custom freight quotations.",
        ],
        [
          "5. Real-Time Tracking & Shipment Notifications",
          "Once your order is handed over to our logistics partner, an automated SMS and email containing the Air Waybill (AWB) number and live tracking link will be sent to your registered contact details. You can also track your order directly on our website using the Track Order page.",
        ],
        [
          "6. Damaged or Tampered Packaging",
          "If you notice that the outer parcel is visibly damaged, open, or wet at the time of delivery, please take a photo and refuse acceptance, or accept with an endorsement on the delivery receipt and notify our customer support desk within 24 hours at +91 93114 16225.",
        ],
      ]}
    />
  );
}
