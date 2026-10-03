import React from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  ShieldCheck,
  Sprout,
  Layers
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
  const allCategories = storeCategories && storeCategories.length > 0 ? storeCategories : categories;

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

  // Authentic Agricultural Category Configs
  const categoryConfigs = [
    {
      slug: "biological-crop-protection",
      name: "Biological Crop Protection",
      tagline: "Bio-Fungicides & Botanical Pest Controls",
      Icon: ShieldCheck,
      colorClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      accentBg: "group-hover:bg-emerald-600",
      items: [
        {
          name: "BALAVAN - Bacillus Subtilis (5L)",
          slug: "balavan-bacillus-subtilis-5l",
          image: "/products/balavan.jpg",
          price: 5600
        },
        {
          name: "SURAKSHA - Pseudomonas (5L)",
          slug: "suraksha-pseudomonas-fluorescens-5l",
          image: "/products/suraksha.jpg",
          price: 4900
        },
        {
          name: "HARIT - Trichoderma Viride (1L)",
          slug: "harit-trichoderma-viride-liquid-biofungal-formulation-1l",
          image: "/products/harit.jpg",
          price: 950
        },
        {
          name: "NEEM OIL 1000 PPM (1L)",
          slug: "neem-oil-1000-ppm-azadirachtin-1l",
          image: "/products/neem-oil.jpg",
          price: 599
        }
      ]
    },
    {
      slug: "organic-plant-nutrients",
      name: "Organic Plant Nutrients",
      tagline: "Natural Amino Acids & Flowering Boosters",
      Icon: Sprout,
      colorClass: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      accentBg: "group-hover:bg-amber-600",
      items: [
        {
          name: "ANNADA - Fish Amino Acid (5L)",
          slug: "annada-fish-amino-acid-5l",
          image: "/products/annada.jpg",
          price: 3600
        },
        {
          name: "PUSHKAL - Fruit Set Biostimulant (1L)",
          slug: "pushkal-flowering-fruit-set-biostimulant-1l",
          image: "/products/pushkal.jpg",
          price: 999
        }
      ]
    },
    {
      slug: "soil-conditioners-biostimulants",
      name: "Soil Conditioners & Biostimulants",
      tagline: "Humic Biostimulants & K-Mobilizers",
      Icon: Layers,
      colorClass: "bg-teal-500/10 text-teal-700 border-teal-500/20",
      accentBg: "group-hover:bg-teal-600",
      items: [
        {
          name: "BHUMI SHAKTI - Humic & Fulvic (5L)",
          slug: "bhumi-shakti-humic-fulvic-biostimulant-5l",
          image: "/products/bhumi-shakti.jpg",
          price: 3900
        },
        {
          name: "DHARANI KMB - Potassium Mobilizer (5L)",
          slug: "dharani-kmb-potassium-mobilizing-biofertilizer-5l",
          image: "/products/dharani.jpg",
          price: 5300
        }
      ]
    }
  ];

  return (
    <>
      {/* Click-outside backdrop */}
      <div
        className="fixed inset-0 top-20 z-40 bg-black/15 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />
      <div
        onMouseLeave={onClose}
        className="absolute left-0 right-0 top-full z-50 border-b border-border bg-[#fdfdfb] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(15,35,22,0.22)] transition-all duration-300 animate-in fade-in slide-in-from-top-2"
      >
      <div className="mx-auto max-w-7xl space-y-5">

        {/* Mega Menu 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columns 1-3: The 3 Agricultural Categories */}
          {categoryConfigs.map((cat) => {
            const Icon = cat.Icon;

            return (
              <div
                key={cat.slug}
                className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-600/40 hover:shadow-lg"
              >
                <div>
                  {/* Category Header */}
                  <Link
                    to="/categories/$slug"
                    params={{ slug: cat.slug }}
                    onClick={onClose}
                    className="flex items-start gap-3.5 mb-4"
                  >
                    <div className={`grid size-11 shrink-0 place-items-center rounded-2xl border transition-all duration-300 ${cat.colorClass} ${cat.accentBg} group-hover:text-white group-hover:shadow-md`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-emerald-800 transition line-clamp-1">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-medium line-clamp-1">
                        {cat.tagline}
                      </p>
                    </div>
                  </Link>

                  {/* Product List Rows */}
                  <div className="space-y-2 border-t border-border/60 pt-3">
                    {cat.items.map((prod) => (
                      <Link
                        key={prod.slug}
                        to="/products/$slug"
                        params={{ slug: prod.slug }}
                        onClick={onClose}
                        className="group/item flex items-center justify-between rounded-2xl p-2.5 transition duration-200 hover:bg-emerald-50/60 border border-transparent hover:border-emerald-100"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/products/balavan.jpg";
                            }}
                            className="size-9 rounded-xl object-cover shrink-0 border border-border/60 bg-muted/30 shadow-xs group-hover/item:scale-105 transition"
                          />
                          <span className="text-xs font-bold text-foreground group-hover/item:text-emerald-800 transition truncate">
                            {prod.name}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="block text-xs font-bold text-foreground">
                            ₹{prod.price}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 mt-3">
                  <Link
                    to="/categories/$slug"
                    params={{ slug: cat.slug }}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition"
                  >
                    View All Formulations in Category
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
