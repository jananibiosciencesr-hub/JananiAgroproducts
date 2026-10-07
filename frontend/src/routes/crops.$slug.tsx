import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useMemo, useState } from "react";
import {
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Leaf,
  Bug,
  Filter,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import {
  getCropById,
  getPesticidesForCrop,
  CROP_LIST,
  type CropData,
  type CropProtectionProduct
} from "@/lib/crop-protection-data";
import { PesticideCard } from "@/components/shop/pesticide-card";
import { WhatsAppIcon } from "@/components/ui/brand-icons";

export const Route = createFileRoute("/crops/$slug")({
  head: ({ params }) => {
    const crop = getCropById(params.slug);
    const title = crop
      ? `${crop.name} Pesticides & Crop Protection — JANANI AGRO`
      : "Crop Protection — JANANI AGRO";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: crop?.tagline || "Discover effective pesticides and bio-inputs for crop protection."
        }
      ]
    };
  },
  component: CropDetailPage
});

function CropDetailPage() {
  const { slug } = Route.useParams();
  const crop: CropData = getCropById(slug) || CROP_LIST[0]; // defaults to Cotton if not found
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const pesticides = useMemo(() => {
    const all = getPesticidesForCrop(crop.id);
    if (selectedFilter === "all") return all;
    if (selectedFilter === "protection") {
      return all.filter((p) => p.category === "Biological Crop Protection");
    }
    if (selectedFilter === "nutrients") {
      return all.filter((p) => p.category === "Organic Plant Nutrients");
    }
    if (selectedFilter === "soil") {
      return all.filter((p) => p.category === "Soil Conditioners & Biostimulants");
    }
    return all;
  }, [crop, selectedFilter]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Breadcrumb Bar matching the exact screenshot: Home >> Crops >> Cotton */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-emerald-700 transition-colors">
              Home
            </Link>
            <span className="text-slate-400">››</span>
            <Link to="/" className="hover:text-emerald-700 transition-colors">
              Crops
            </Link>
            <span className="text-slate-400">››</span>
            <span className="font-semibold text-slate-900">{crop.name}</span>
          </nav>
        </div>
      </div>

      {/* Crop Header Banner matching the 2nd screenshot */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Circular Avatar of the Crop */}
              <div className="size-20 sm:size-24 rounded-full border-2 border-emerald-100 bg-emerald-50/50 p-2 shadow-sm flex items-center justify-center shrink-0">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="h-full w-full object-contain rounded-full"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  {crop.name}
                </h1>
                <p className="text-sm sm:text-base italic text-slate-500 font-medium mt-0.5">
                  {crop.subName || crop.name}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 max-w-none text-left lg:whitespace-nowrap hyphens-none mt-1.5">
                  {crop.tagline}
                </p>
              </div>
            </div>

            {/* Quick Consultation Badge */}
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100/90 rounded-2xl p-3 sm:p-4 shrink-0">
              <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Leaf className="size-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Expert Crop Guidance</h4>
                <p className="text-[11px] text-slate-600">Scientifically tested formulations</p>
              </div>
            </div>
          </div>

          {/* Key Pests Affecting this Crop */}
          {crop.majorPestsAndDiseases && crop.majorPestsAndDiseases.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Bug className="size-3.5 text-emerald-600" />
                Target Diseases & Pests:
              </span>
              {crop.majorPestsAndDiseases.map((pest) => (
                <span
                  key={pest}
                  className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  {pest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area: Products Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Toolbar & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Recommended Pesticides & Bio-Inputs ({pesticides.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Top-performing solutions proven to protect {crop.name} yields.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Formulations" },
              { id: "protection", label: "Biological Crop Protection" },
              { id: "nutrients", label: "Organic Plant Nutrients" },
              { id: "soil", label: "Soil Conditioners & Biostimulants" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedFilter === tab.id
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

        {/* Additional Other Crops Quick Navigation */}
        <div className="mt-14 pt-8 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
            Protect Other Crops
          </h3>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {CROP_LIST.filter((c) => c.id !== crop.id).map((other) => (
              <Link
                key={other.id}
                to="/crops/$slug"
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

      {/* Floating WhatsApp chat widget (visible in both user screenshots) */}
      <a
        href="https://wa.me/919426989470?text=Hello%20Janani%20Agro,%20I%20need%20expert%20recommendations%20for%20my%20crops."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:scale-110 active:scale-95 transition-transform drop-shadow-md"
      >
        <WhatsAppIcon className="size-7" />
      </a>
    </div>
  );
}
