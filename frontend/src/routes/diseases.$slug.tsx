import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useMemo, useState } from "react";
import {
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Bug,
  Sparkles,
  Leaf,
  Filter,
  MessageCircle,
  AlertTriangle
} from "lucide-react";
import {
  getDiseaseById,
  getPesticidesForDisease,
  DISEASE_LIST,
  type DiseaseData,
  type CropProtectionProduct
} from "@/lib/crop-protection-data";
import { PesticideCard } from "@/components/shop/pesticide-card";

export const Route = createFileRoute("/diseases/$slug")({
  head: ({ params }) => {
    const disease = getDiseaseById(params.slug);
    const title = disease
      ? `${disease.name} Control & Recommended Pesticides — JANANI AGRO`
      : "Disease & Pest Control — JANANI AGRO";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: disease?.tagline || "Proven pesticides and biological formulations to eradicate crop diseases and pests."
        }
      ]
    };
  },
  component: DiseaseDetailPage
});

function DiseaseDetailPage() {
  const { slug } = Route.useParams();
  const disease: DiseaseData = getDiseaseById(slug) || DISEASE_LIST[2]; // defaults to Gram pod borers
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const pesticides = useMemo(() => {
    const all = getPesticidesForDisease(disease.id);
    if (selectedCategory === "all") return all;
    if (selectedCategory === "protection") {
      return all.filter((p) => p.category === "Biological Crop Protection");
    }
    if (selectedCategory === "nutrients") {
      return all.filter((p) => p.category === "Organic Plant Nutrients" || p.category === "Soil Conditioners & Biostimulants");
    }
    return all;
  }, [disease, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Breadcrumb Bar matching the design pattern: Home >> Diseases >> [Name] */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-emerald-700 transition-colors">
              Home
            </Link>
            <span className="text-slate-400">››</span>
            <Link to="/" className="hover:text-emerald-700 transition-colors">
              Diseases & Pests
            </Link>
            <span className="text-slate-400">››</span>
            <span className="font-semibold text-slate-900">{disease.name}</span>
          </nav>
        </div>
      </div>

      {/* Disease Header Banner matching the 2nd screenshot */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Circular Avatar of the Disease / Pest */}
              <div className="size-20 sm:size-24 rounded-full border-2 border-emerald-400 ring-4 ring-emerald-50 bg-white p-2 shadow-sm flex items-center justify-center shrink-0">
                <img
                  src={disease.image}
                  alt={disease.name}
                  className="h-full w-full object-contain rounded-full"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    {disease.name}
                  </h1>
                  <span className="inline-flex items-center rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    {disease.category}
                  </span>
                </div>
                <p className="text-sm sm:text-base italic text-slate-500 font-medium mt-0.5">
                  {disease.scientificName || disease.name}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1.5">
                  {disease.tagline}
                </p>
              </div>
            </div>

            {/* Quick Warning / Advisory Banner */}
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200/80 rounded-2xl p-3 sm:p-4 shrink-0">
              <div className="size-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Immediate Action Required</h4>
                <p className="text-[11px] text-slate-600">Spray at first symptom for 100% control</p>
              </div>
            </div>
          </div>

          {/* Symptoms and Control Overview */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl bg-slate-50 border border-slate-200/80 p-4 sm:p-5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-1.5">
                <ShieldAlert className="size-4 text-amber-600" /> Identification & Symptoms
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {disease.symptoms}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="size-4 text-emerald-600" /> Recommended Control Strategy
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {disease.controlMeasure}
              </p>
            </div>
          </div>

          {/* Susceptible Crops */}
          {disease.susceptibleCrops && disease.susceptibleCrops.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Susceptible Crops:</span>
              {disease.susceptibleCrops.map((cropName) => (
                <span
                  key={cropName}
                  className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                >
                  {cropName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area: Recommended Pesticides Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Targeted Pesticides & Control Formulations ({pesticides.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Scientifically selected pesticides proven to eradicate {disease.name}.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Formulations" },
              { id: "protection", label: "Biological Crop Protection" },
              { id: "nutrients", label: "Organic Nutrients & Biostimulants" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === tab.id
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid matching the 2nd screenshot */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
          {pesticides.map((product) => (
            <PesticideCard key={product.id} product={product} />
          ))}
        </div>

        {/* Other Diseases Quick Nav */}
        <div className="mt-14 pt-8 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
            Browse Other Crop Diseases & Pests
          </h3>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {DISEASE_LIST.filter((d) => d.id !== disease.id).map((other) => (
              <Link
                key={other.id}
                to="/diseases/$slug"
                params={{ slug: other.id }}
                className="group flex items-center gap-2.5 rounded-2xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 shadow-2xs transition-all shrink-0"
              >
                <img
                  src={other.image}
                  alt={other.name}
                  className="size-6 rounded-full object-contain"
                />
                <span>{other.name}</span>
                <ChevronRight className="size-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Floating WhatsApp chat widget */}
      <a
        href="https://wa.me/919426989470?text=Hello%20Janani%20Agro,%20I%20need%20treatment%20recommendations%20for%20crop%20diseases."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:scale-110 active:scale-95 transition-transform drop-shadow-md"
      >
        <MessageCircle className="size-7 fill-white text-[#25D366]" />
      </a>
    </div>
  );
}
