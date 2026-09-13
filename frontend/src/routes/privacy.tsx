import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/page-kit";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Privacy policy, data protection, and customer rights for Janani Agro Products." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy & Data Protection Policy"
      intro="JANANI AGRO PRODUCTS values your trust and is committed to protecting the privacy, confidentiality, and security of your personal information."
      sections={[
        [
          "1. Information We Collect",
          "We collect essential details necessary to process and dispatch your orders, including your name, shipping address, billing address, phone number, email address, and payment confirmation tokens. We do not store sensitive payment card details or net banking passwords on our servers.",
        ],
        [
          "2. How We Use Your Information",
          "Your information is utilized solely to: (a) Deliver products and send order status notifications via SMS and email, (b) Provide responsive customer service and process returns, (c) Improve our website experience and product catalog, (d) Send periodic promotional offers only if you have opted in.",
        ],
        [
          "3. Data Sharing & Third-Party Service Providers",
          "We never sell, rent, or trade your personal information to third-party marketers. We share limited delivery information strictly with verified logistics partners (Delhivery, BlueDart, DTDC) and secure RBI-compliant payment gateways solely to fulfill your orders.",
        ],
        [
          "4. Security & Encryption",
          "Our website employs 256-bit SSL encryption to protect all transmitted data. We implement industry-standard cybersecurity measures to safeguard our database against unauthorized access or disclosure.",
        ],
        [
          "5. Cookies & Browsing Experience",
          "We use necessary session cookies to maintain your shopping cart items, remember login sessions, and optimize website loading speeds. You can configure your browser to reject cookies if preferred.",
        ],
        [
          "6. Grievance Officer & Contact",
          "If you have any questions or concerns regarding this privacy policy, please write to us at: info@jananiagroproducts.com, or address your correspondence to: Legal Desk, JANANI AGRO PRODUCTS, SUB PLOTS NO.2/1/B, REVENUE SURVEY NO.160 TAL., LODHIKA GIDC, Gujarat – 24, India.",
        ],
      ]}
    />
  );
}
