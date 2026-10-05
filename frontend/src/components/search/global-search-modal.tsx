import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  X,
  Mic,
  Clock,
  Flame,
  Sparkles,
  ArrowRight,
  Boxes,
  Tag,
  Star,
  CornerDownLeft,
  Sprout,
  ShieldCheck,
} from "lucide-react";
import { products, categories, type Product, getProductImage, pantryImage } from "@/lib/catalog";
import { ALL_PESTICIDES } from "@/lib/crop-protection-data";
import { useStore } from "@/components/store-provider";
import { VoiceSearchModal } from "@/components/search/voice-search-modal";
import { Button } from "@/components/ui/button";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const trendingQueries = [
  "Bhumi Shakti",
  "Harit Trichoderma",
  "Neem Oil 1000 PPM",
  "Pushkal Fruit Set",
  "Bio Fertilizers",
  "Bio Fungicides",
  "Bio Stimulants",
  "Humic & Fulvic",
];

const cropQuickFilters = [
  { name: "Rice (Paddy)", query: "Rice" },
  { name: "Cotton", query: "Cotton" },
  { name: "Chilli & Spices", query: "Chilli" },
  { name: "Soya Bean", query: "Soyabean" },
  { name: "Maize", query: "Maize" },
  { name: "Sugarcane", query: "Sugarcane" },
  { name: "Groundnut", query: "Groundnut" },
  { name: "Wheat", query: "Wheat" },
];

const aiCropPrompts = [
  { prompt: "Paddy Sheath Blight & Blast control", query: "Harit", benefit: "Suggests: HARIT (Trichoderma Viride)" },
  { prompt: "Soil carbon & root zone development", query: "Bhumi Shakti", benefit: "Suggests: BHUMI SHAKTI (Humic & Fulvic)" },
  { prompt: "Aphids, Whiteflies & Caterpillar defense", query: "Neem Oil 1000 PPM", benefit: "Suggests: NEEM OIL (Azadirachtin)" },
  { prompt: "Fruit setting & flower drop prevention", query: "Pushkal", benefit: "Suggests: PUSHKAL Biostimulant" },
  { prompt: "Potassium mobilization for crop yield", query: "Dharani KMB", benefit: "Suggests: DHARANI KMB Bio-Fertilizer" },
  { prompt: "Soil-borne Wilt & Root Rot treatment", query: "Balavan", benefit: "Suggests: BALAVAN (Bacillus Subtilis)" },
];

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const navigate = useNavigate();
  const { products: storeProducts, categories: storeCategories } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;
  const allCategories = storeCategories && storeCategories.length > 0 ? storeCategories : categories;

  const [query, setQuery] = useState("");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage and purge any legacy dummy grocery strings
  useEffect(() => {
    try {
      const stored = localStorage.getItem("janani_recent_searches");
      if (stored) {
        const parsed = JSON.parse(stored);
        const cleaned = (Array.isArray(parsed) ? parsed : []).filter(
          (s: string) =>
            !s.toLowerCase().includes("groundnut oil") &&
            !s.toLowerCase().includes("ghee") &&
            !s.toLowerCase().includes("millet") &&
            !s.toLowerCase().includes("turmeric") &&
            !s.toLowerCase().includes("khapli") &&
            !s.toLowerCase().includes("mustard oil")
        );
        setRecentSearches(cleaned);
        localStorage.setItem("janani_recent_searches", JSON.stringify(cleaned));
      }
    } catch (e) {
      // ignore
    }
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const saveSearchQuery = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem("janani_recent_searches", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("janani_recent_searches");
  };

  const removeRecentSearch = (itemToRemove: string) => {
    const updated = recentSearches.filter((item) => item !== itemToRemove);
    setRecentSearches(updated);
    localStorage.setItem("janani_recent_searches", JSON.stringify(updated));
  };

  const handleExecuteSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    saveSearchQuery(searchQuery);
    onClose();
    navigate({
      to: "/search",
      search: { q: searchQuery } as any,
    });
  };

  // Live Autocomplete Results
  const matchingProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const catalogMatches = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.crops && p.crops.some((c) => c.toLowerCase().includes(q))) ||
        (p.targetDiseases && p.targetDiseases.toLowerCase().includes(q)) ||
        (p.dietaryTags && p.dietaryTags.some((t) => t.toLowerCase().includes(q)))
    );

    if (catalogMatches.length > 0) {
      return catalogMatches.slice(0, 5);
    }

    // Fallback to ALL_PESTICIDES if no catalog match
    const pesticideMatches = ALL_PESTICIDES.filter(
      (pest) =>
        pest.title.toLowerCase().includes(q) ||
        pest.technicalName.toLowerCase().includes(q) ||
        pest.crops.some((c) => c.toLowerCase().includes(q)) ||
        pest.diseases.some((d) => d.toLowerCase().includes(q))
    ).map(
      (pest) =>
        ({
          id: pest.catalogId,
          slug: pest.slug,
          name: pest.title,
          subtitle: pest.technicalName,
          category: pest.category,
          brand: pest.brand,
          price: pest.price,
          oldPrice: pest.oldPrice,
          discount: pest.discount,
          unit: "1 Unit",
          rating: pest.rating,
          reviews: pest.reviewsCount,
          inStock: pest.inStock,
          stockCount: 50,
          badge: pest.badge || "Popular",
          image: pest.image,
          description: pest.description,
          origin: "Janani Agro Products",
          dietaryTags: [],
          certifications: [],
          popularity: 90,
          isNew: false,
          crops: pest.crops,
          benefits: [],
          variants: [],
        } as Product)
    );

    return pesticideMatches.slice(0, 5);
  }, [query, allProducts]);

  const matchingCategories = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allCategories
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 4);
  }, [query, allCategories]);

  const matchingBrands = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const allBrands = [
      "Janani Agro Products",
      "Janani Certified Quality",
      "Janani Bio Sciences",
    ];
    return allBrands.filter((b) => b.toLowerCase().includes(q)).slice(0, 2);
  }, [query]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/70 backdrop-blur-md">
        <div className="relative w-full max-w-2xl rounded-[2.5rem] bg-background border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Top Search Input Bar */}
          <div className="relative flex items-center px-6 py-4 border-b border-border bg-card">
            <Search className="size-5 text-[#075B32] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleExecuteSearch(query);
                }
              }}
              placeholder="Search bio-fertilizers, pesticides, crop diseases, or products (e.g. Bhumi Shakti, Harit)..."
              className="flex-1 bg-transparent px-4 text-sm sm:text-base outline-none text-foreground placeholder:text-muted-foreground font-medium"
            />

            <div className="flex items-center gap-1.5 shrink-0">
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              )}

              {/* Voice Search Trigger */}
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="rounded-full p-2 text-[#075B32] hover:bg-primary/10 hover:text-primary transition"
                title="Voice Search"
              >
                <Mic className="size-4.5" />
              </button>

              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted ml-1"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Results / Suggestions Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            {/* Live Autocomplete Matches (When typing) */}
            {query.trim() && (
              <div className="space-y-4">
                {/* 1. Category Quick Links */}
                {matchingCategories.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Boxes className="size-3.5 text-[#075B32]" /> Matching Categories
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {matchingCategories.map((c) => (
                        <Link
                          key={c.slug}
                          to="/categories/$slug"
                          params={{ slug: c.slug }}
                          onClick={onClose}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition"
                        >
                          <img src={c.image} alt={c.name} className="size-4 rounded-full object-cover" />
                          <span>{c.name}</span>
                          <span className="text-[10px] text-muted-foreground">({c.count})</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Brand Reserve Links */}
                {matchingBrands.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-[#075B32]" /> Genuine Brand
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {matchingBrands.map((b) => (
                        <button
                          key={b}
                          onClick={() => handleExecuteSearch(b)}
                          className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 text-xs font-semibold hover:bg-emerald-100 transition"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Matching Products List */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Products ({matchingProducts.length})
                  </span>

                  {matchingProducts.length > 0 ? (
                    <div className="space-y-2">
                      {matchingProducts.map((p) => (
                        <Link
                          key={p.id}
                          to="/products/$slug"
                          params={{ slug: p.slug }}
                          onClick={() => {
                            saveSearchQuery(p.name);
                            onClose();
                          }}
                          className="flex items-center justify-between p-2.5 rounded-2xl border border-border/70 bg-card hover:bg-muted/60 hover:border-primary/40 transition group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={getProductImage(p.name || p.category, p.image)}
                              alt={p.name}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = pantryImage;
                              }}
                              className="size-11 rounded-xl object-cover border border-border"
                            />
                            <div>
                              <p className="text-xs font-bold text-foreground group-hover:text-primary transition">
                                {p.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                <span className="text-emerald-700 font-medium">{p.category}</span>
                                <span>•</span>
                                <span className="text-foreground font-semibold">₹{p.price}</span>
                                <span>•</span>
                                <span className="flex items-center text-amber-500 font-bold">
                                  <Star className="size-2.5 fill-current mr-0.5" />
                                  {p.rating}
                                </span>
                              </div>
                            </div>
                          </div>

                          <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
                        </Link>
                      ))}

                      {/* View All Matches Button */}
                      <Button
                        onClick={() => handleExecuteSearch(query)}
                        className="w-full rounded-2xl h-11 text-xs font-bold mt-2 bg-[#075B32] hover:bg-[#064A29]"
                      >
                        View All Results for "{query}" <CornerDownLeft className="size-3.5 ml-1" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No direct product matches found for "{query}". Try pressing Enter to explore all agricultural inputs.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Default State (When query is empty) */}
            {!query.trim() && (
              <div className="space-y-6">
                {/* 1. Recent Searches (if any) */}
                {recentSearches.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Clock className="size-3.5 text-[#075B32]" /> Recent Searches
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[11px] font-semibold text-muted-foreground hover:text-destructive transition"
                      >
                        Clear History
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item) => (
                        <div
                          key={item}
                          className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground hover:border-primary transition group"
                        >
                          <button
                            onClick={() => handleExecuteSearch(item)}
                            className="mr-1.5 hover:text-primary"
                          >
                            {item}
                          </button>
                          <button
                            onClick={() => removeRecentSearch(item)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Remove"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Trending Searches */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Flame className="size-3.5 text-emerald-600 fill-emerald-600" /> Trending Agro Searches
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {trendingQueries.map((trend) => (
                      <button
                        key={trend}
                        onClick={() => handleExecuteSearch(trend)}
                        className="rounded-full border border-border bg-secondary/80 hover:bg-[#075B32] hover:text-white px-3.5 py-1.5 text-xs font-medium text-foreground transition"
                      >
                        {trend}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Quick Crop Solutions */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sprout className="size-3.5 text-[#075B32]" /> Search by Crop Solutions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {cropQuickFilters.map((crop) => (
                      <button
                        key={crop.name}
                        onClick={() => handleExecuteSearch(crop.query)}
                        className="rounded-full border border-emerald-200/70 bg-emerald-50/50 hover:bg-[#075B32] hover:text-white px-3.5 py-1.5 text-xs font-medium text-[#075B32] transition"
                      >
                        🌾 {crop.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. AI Crop Care & Disease Solutions */}
                <div className="space-y-2.5 rounded-3xl border border-emerald-500/20 bg-emerald-50/40 p-4 sm:p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#075B32] flex items-center gap-1.5">
                    <Sparkles className="size-4 text-[#D99A12]" /> AI Crop Care & Disease Solutions
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {aiCropPrompts.map((item) => (
                      <button
                        key={item.prompt}
                        onClick={() => handleExecuteSearch(item.query)}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card hover:bg-[#075B32] hover:text-white transition text-left group"
                      >
                        <div>
                          <p className="text-xs font-bold text-foreground group-hover:text-white">
                            "{item.prompt}"
                          </p>
                          <p className="text-[10px] text-emerald-700 font-semibold group-hover:text-emerald-100">
                            {item.benefit}
                          </p>
                        </div>
                        <ArrowRight className="size-3.5 text-[#075B32] group-hover:text-white shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Shortcuts Footer */}
          <div className="px-6 py-3 border-t border-border bg-muted/40 text-[11px] text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              Press <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] border border-border">Enter</kbd> to search
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] border border-border">Esc</kbd> to close
            </span>
          </div>
        </div>
      </div>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSearch={(spokenText) => {
          setQuery(spokenText);
          handleExecuteSearch(spokenText);
        }}
      />
    </>
  );
}
