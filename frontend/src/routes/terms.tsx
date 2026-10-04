import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Terms of service and legal agreement for JANANI AGRO PRODUCTS." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#075B32] hover:underline mb-8"
        >
          <ArrowLeft className="size-3.5" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-[#075B32]/10 flex items-center justify-center text-[#075B32]">
            <ShieldCheck className="size-5" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Terms & Conditions</h1>
        </div>

        <p className="text-xs text-gray-500 mb-8">Last Updated: October 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">1. Acceptance of Terms</h2>
            <p className="text-sm">
              By accessing and using the services of Janani Agro Products, you acknowledge and agree to comply with all applicable terms, conditions, and regulations governing agricultural product purchase and delivery across India.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">2. Agricultural Product Use</h2>
            <p className="text-sm">
              All biofertilizers, botanical pesticides, plant growth promoters and soil conditioners sold by Janani Agro Products are manufactured and labeled strictly FOR AGRICULTURE USE ONLY. Recommended application dosages and intervals must be observed.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">3. Orders & Pricing</h2>
            <p className="text-sm">
              Prices displayed on our digital catalog are inclusive of applicable taxes unless stated otherwise. We reserve the right to revise catalog prices and availability without prior notice.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">4. Contact Information</h2>
            <p className="text-sm">
              For any legal or terms inquiries, please contact Janani Agro Products at care@jananiagro.com or phone +91 9311416225.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
