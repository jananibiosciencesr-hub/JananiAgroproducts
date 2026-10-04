import React from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Sprout,
  TrendingUp,
  Wheat,
  Bug,
  Shield,
  Leaf,
  Droplets,
  Layers,
  Sparkles,
  Package
} from "lucide-react";
import { categories, products } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HomeMegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const { products: storeProducts, categories: storeCategories } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 11 Agri Products Categories (from handwritten specification)
  const agriCategories = [
    {
      slug: "bio-fertilizers",
      name: "Bio Fertilizers",
      tagline: "Rhizobium, PSB & bio-inoculants",
      Icon: Sprout,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      featured: "Dharani KMB, Janani Rhizo",
    },
    {
      slug: "bio-pesticides",
      name: "Bio Pesticides",
      tagline: "Biological pest control & neem solutions",
      Icon: ShieldAlert,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      featured: "Neem Oil 1000 PPM, Bioguard",
    },
    {
      slug: "bio-fungicides",
      name: "Bio Fungicides",
      tagline: "Trichoderma & biological fungal defense",
      Icon: ShieldCheck,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      featured: "Harit Trichoderma, Balavan",
    },
    {
      slug: "bio-stimulants",
      name: "Bio Stimulants",
      tagline: "Humic, fulvic & flowering boosters",
      Icon: TrendingUp,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      featured: "Bhumi Shakti, Pushkal",
    },
    {
      slug: "micro-nutrients",
      name: "Micro Nutrients",
      tagline: "Chelated Zinc, Boron & trace minerals",
      Icon: Wheat,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      featured: "Zinc Max, Micro Plus",
    },
    {
      slug: "insecticides",
      name: "Insecticides",
      tagline: "Targeted insect & pest protection",
      Icon: Bug,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      featured: "Bio-Insecto Targeted Defense",
    },
    {
      slug: "fungicides",
      name: "Fungicides",
      tagline: "Protective copper & curative treatments",
      Icon: Shield,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      featured: "Janani Copper Bio-Shield",
    },
    {
      slug: "botanical-extracts",
      name: "Botanical Extracts",
      tagline: "Plant extracts & herbal formulations",
      Icon: Leaf,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      featured: "Herbo-Extract Multi-Action",
    },
    {
      slug: "water-solubles",
      name: "Water Solubles",
      tagline: "100% soluble drip & foliar formulations",
      Icon: Droplets,
      color: "text-blue-700 bg-blue-50 border-blue-200",
      featured: "Solu-NPK 19:19:19 Complex",
    },
    {
      slug: "agri-inputs",
      name: "Agri Inputs",
      tagline: "Wetting agents, spreaders & soil activators",
      Icon: Layers,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      featured: "Agri-Stick Organic Spreader",
    },
    {
      slug: "others",
      name: "Others",
      tagline: "Speciality farm formulations & custom mixes",
      Icon: Sparkles,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      featured: "Speciality Agro Formulations",
    },
  ];

  return (
    <>
      {/* Click-outside backdrop */}
      <div
        className="fixed inset-0 top-20 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />
      <div
        onMouseLeave={onClose}
        className="absolute left-0 right-0 top-full z-50 border-b border-border bg-[#fafaf7] p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(15,35,22,0.22)] transition-all duration-300 animate-in fade-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto"
      >
        <div className="mx-auto max-w-7xl space-y-5">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#075B32] text-white">
                  AGRI PRODUCTS
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  11 Specialized Agro Categories
                </span>
              </div>
              <h2 className="text-lg font-black text-[#075B32] tracking-tight mt-1">
                Explore Agricultural Formulations by Category
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/categories"
                onClick={onClose}
                className="text-xs font-bold text-[#075B32] hover:text-[#0B6B35] px-3 py-1.5 rounded-lg border border-[#075B32]/20 hover:bg-white transition"
              >
                All Categories Directory
              </Link>
              <Link
                to="/products"
                onClick={onClose}
                className="text-xs font-bold text-white bg-[#075B32] hover:bg-[#064A29] px-3 py-1.5 rounded-lg shadow-sm transition inline-flex items-center gap-1"
              >
                <span>View All Products</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

          {/* 11 Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {agriCategories.map((cat) => {
              const Icon = cat.Icon;
              const prodCount = allProducts.filter(
                (p) => p.category.toLowerCase() === cat.name.toLowerCase()
              ).length;

              return (
                <Link
                  key={cat.slug}
                  to="/categories/$slug"
                  params={{ slug: cat.slug }}
                  onClick={onClose}
                  className="group flex flex-col justify-between p-3.5 rounded-2xl border border-border/80 bg-white hover:border-[#075B32]/40 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid size-10 shrink-0 place-items-center rounded-xl border ${cat.color} group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-xs font-black text-gray-900 group-hover:text-[#075B32] transition truncate">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 shrink-0">
                          {prodCount > 0 ? `${prodCount}` : "1+"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {cat.tagline}
                      </p>
                      <p className="text-[10px] text-[#0B6B35] font-semibold truncate mt-1">
                        {cat.featured}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#075B32] group-hover:text-[#4FAE2A] transition">
                    <span>Explore Products</span>
                    <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer Information Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/70 text-xs text-muted-foreground">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                100% Bio-Organic Formulations
              </span>
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <span className="size-1.5 rounded-full bg-amber-500 inline-block" />
                All India Farm Delivery
              </span>
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <span className="size-1.5 rounded-full bg-blue-500 inline-block" />
                Agronomy Guidance Support
              </span>
            </div>
            <Link
              to="/crops"
              onClick={onClose}
              className="text-[11px] font-bold text-[#075B32] hover:underline"
            >
              Shop Solutions by Crop (Paddy, Cotton, Chilli...) →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
