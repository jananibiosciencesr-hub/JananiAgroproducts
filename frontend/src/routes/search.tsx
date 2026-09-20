import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import React, { useMemo, useState, useEffect } from "react";
import {
  ArrowRight,
  Filter,
  Grid2X2,
  List,
  Search as SearchIcon,
  X,
  Mic,
  Clock,
  Flame,
  Sparkles,
  Boxes,
  Tag,
  Star,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  MapPin
} from "lucide-react";
import { categories, products, type Product } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { VoiceSearchModal } from "@/components/search/voice-search-modal";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: typeof search["q"] === "string" ? search["q"] : "",
    };
  },
  head: () => ({
    meta: [
      { title: "Smart Search & AI Pantry Discovery — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content:
          "Search 100% certified organic grains, cold-pressed oils, native millets, and Vedic pantry essentials with smart voice and AI health filters.",
      },
    ],
  }),
  component: SearchPage,
});

const trendingSearches = [
  "Wood-Pressed Groundnut Oil",
  "Lakadong Turmeric",
  "Foxtail Millet",
  "Vedic A2 Ghee",
  "Khapli Wheat",
  "Cold-Pressed Mustard Oil",
  "Organic Basmati Rice",
  "Virgin Coconut Oil",
];

const aiHealthSuggestions = [
  { label: "Diabetic Friendly", query: "Foxtail Millet", badge: "Low GI Native Grain" },
  { label: "Heart Healthy", query: "Wood-Pressed Groundnut Oil", badge: "Cold Pressed MUFA Rich" },
  { label: "Immunity Boost", query: "Lakadong Turmeric Powder", badge: "7%+ Curcumin" },
  { label: "Ancient Grains", query: "Khapli Wheat", badge: "Ancient Emmer" },
  { label: "High Protein", query: "Organic Green Gram", badge: "Unpolished Pulse" },
];

const dietaryBadges = [
  "Gluten Free",
  "Diabetic Friendly",
  "High Fiber",
  "High Protein",
  "Low GI",
  "Cold Pressed",
  "Zero Chemical",
  "Single Origin",
];

const allBrands = [
  "Janani Pure Harvest",
  "Janani Vedic Reserve",
  "Janani Single-Origin",
  "Janani Wild Harvest",
];

const dietaryTagOptions = [
  "Cold Pressed",
  "Gluten Free",
  "Diabetic Friendly",
  "High Protein",
  "High Fiber",
  "Zero Chemical",
  "Single Origin",
];

function SearchPage() {
  const searchParams = useSearch({ from: "/search" });
  const { products: storeProducts, categories: storeCategories } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;
  const allCategories = storeCategories && storeCategories.length > 0 ? storeCategories : categories;

  const [query, setQuery] = useState(searchParams.q || "");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Search Filter States
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [sort, setSort] = useState("featured");
  const [list, setList] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Sync search param if navigated from navbar omnibar
  useEffect(() => {
    if (searchParams.q) {
      setQuery(searchParams.q);
    }
  }, [searchParams.q]);

  // Load Recent Searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem("janani_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const saveQuery = (qText: string) => {
    const trimmed = qText.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem("janani_recent_searches", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const removeRecent = (itemToRemove: string) => {
    const updated = recentSearches.filter((i) => i !== itemToRemove);
    setRecentSearches(updated);
    localStorage.setItem("janani_recent_searches", JSON.stringify(updated));
  };

  const clearRecents = () => {
    setRecentSearches([]);
    localStorage.removeItem("janani_recent_searches");
  };

  const handleApplyQuery = (val: string) => {
    setQuery(val);
    saveQuery(val);
  };

  const toggleDietary = (tag: string) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setQuery("");
    setSelectedCat("All");
    setSelectedBrand("All");
    setMaxPrice(1000);
    setMinRating(null);
    setInStockOnly(false);
    setSelectedDietary([]);
    setSort("featured");
  };

  // Filter Engine
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        // Text search across name, category, description, brand, dietary tags, and origin
        if (query.trim()) {
          const q = query.toLowerCase();
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.origin.toLowerCase().includes(q) ||
            p.dietaryTags.some((t) => t.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Category Filter
        if (selectedCat !== "All" && p.category !== selectedCat) {
          return false;
        }

        // Brand Filter
        if (selectedBrand !== "All" && p.brand !== selectedBrand) {
          return false;
        }

        // Price Filter
        if (p.price > maxPrice) {
          return false;
        }

        // Rating Filter
        if (minRating !== null && p.rating < minRating) {
          return false;
        }

        // In Stock Filter
        if (inStockOnly && !p.inStock) {
          return false;
        }

        // Dietary tags
        if (selectedDietary.length > 0) {
          const matchesDiet = selectedDietary.some((tag) =>
            p.dietaryTags.includes(tag)
          );
          if (!matchesDiet) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === "low") return a.price - b.price;
        if (sort === "high") return b.price - a.price;
        if (sort === "rating") return b.rating - a.rating;
        if (sort === "discount") return b.discount - a.discount;
        if (sort === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        return a.id - b.id;
      });
  }, [
    query,
    selectedCat,
    selectedBrand,
    maxPrice,
    minRating,
    inStockOnly,
    selectedDietary,
    sort,
  ]);

  const activeFilterCount =
    (selectedCat !== "All" ? 1 : 0) +
    (selectedBrand !== "All" ? 1 : 0) +
    (maxPrice < 1000 ? 1 : 0) +
    (minRating !== null ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (selectedDietary.length > 0 ? 1 : 0) +
    (query ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Search Header Hero */}
      <div className="mx-auto max-w-3xl text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="size-3.5" /> AI Smart Search & Filter Suite
        </span>
        <h1 className="font-display text-3xl font-bold sm:text-4xl text-foreground">
          Find Your Pure Organic Essentials
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          Search with real-time text, voice recognition, or AI nutrition recommendations across 100% certified farm harvests.
        </p>

        {/* Global Smart Search Bar */}
        <div className="relative mt-8">
          <SearchIcon className="absolute left-5 top-4 size-5 text-brand-leaf" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveQuery(query);
            }}
            placeholder="Search by grain, cold-pressed oil, Vedic spice, or health goal..."
            className="h-14 w-full rounded-full border-2 border-primary/30 bg-card pl-14 pr-24 text-sm sm:text-base outline-none transition focus:border-primary shadow-soft text-foreground placeholder:text-muted-foreground font-medium"
            autoFocus
          />

          <div className="absolute right-3 top-2.5 flex items-center gap-1">
            {query && (
              <button
                onClick={() => setQuery("")}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                title="Clear input"
              >
                <X className="size-4" />
              </button>
            )}

            {/* Voice Search Button */}
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="size-9 rounded-full bg-primary/10 text-brand-leaf hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition shadow-xs"
              title="Voice Search"
            >
              <Mic className="size-4.5" />
            </button>
          </div>
        </div>

        {/* Recent Searches Pills (if any) */}
        {recentSearches.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-muted-foreground flex items-center gap-1 font-semibold">
              <Clock className="size-3.5 text-brand-leaf" /> Recent:
            </span>
            {recentSearches.map((item) => (
              <div
                key={item}
                className="inline-flex items-center rounded-full border border-border bg-card px-3 py-0.5 text-xs font-medium text-foreground hover:border-primary transition"
              >
                <button onClick={() => handleApplyQuery(item)} className="mr-1.5 hover:text-primary">
                  {item}
                </button>
                <button
                  onClick={() => removeRecent(item)}
                  className="text-muted-foreground hover:text-destructive"
                  title="Remove"
                >
                  <X className="size-2.5" />
                </button>
              </div>
            ))}
            <button
              onClick={clearRecents}
              className="text-[11px] text-muted-foreground hover:text-destructive underline ml-1"
            >
              Clear
            </button>
          </div>
        )}

        {/* Trending Searches Row */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="text-muted-foreground flex items-center gap-1 font-semibold">
            <Flame className="size-3.5 text-amber-500 fill-amber-500" /> Trending:
          </span>
          {trendingSearches.map((tag) => (
            <button
              key={tag}
              onClick={() => handleApplyQuery(tag)}
              className={`rounded-full border px-3 py-0.5 text-xs font-medium transition ${
                query.toLowerCase() === tag.toLowerCase()
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-secondary/70 text-foreground/80 hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* AI Health & Dietary Recommendation Strip */}
        <div className="mt-6 rounded-3xl border border-primary/20 bg-primary/5 p-4 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-4 text-brand-gold" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              AI Smart Health Suggestions
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {aiHealthSuggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => handleApplyQuery(s.query)}
                className="flex flex-col p-2.5 rounded-2xl border border-border bg-card hover:bg-primary hover:text-primary-foreground transition group text-left"
              >
                <span className="text-xs font-bold text-foreground group-hover:text-primary-foreground">
                  {s.label}
                </span>
                <span className="text-[10px] text-muted-foreground group-hover:text-primary-foreground/80 mt-0.5 truncate">
                  {s.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area: Sidebar Filters & Results */}
      <div className="mt-12 grid gap-8 lg:grid-cols-[260px_1fr] items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-soft h-fit sticky top-28">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="flex items-center gap-2 font-display font-semibold text-base">
              <SlidersHorizontal className="size-4 text-primary" /> Search Filters
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-brand-leaf hover:underline flex items-center gap-1"
              >
                <RotateCcw className="size-3" /> Reset
              </button>
            )}
          </div>

          {/* 1. Category Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Boxes className="size-3.5 text-brand-leaf" /> Category
            </h4>
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
              {["All", ...categories.map((c) => c.name)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                    selectedCat === cat
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <span>{cat}</span>
                  {cat !== "All" && (
                    <span className="text-[10px] opacity-70 font-mono">
                      ({products.filter((p) => p.category === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Brand Reserve Filter */}
          <div className="space-y-2 border-t border-border pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-brand-gold" /> Brand Reserve
            </h4>
            <div className="space-y-1">
              {["All", ...allBrands].map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                    selectedBrand === brand
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="truncate">{brand}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Price Slider */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Tag className="size-3.5 text-brand-leaf" /> Max Price
              </span>
              <span className="font-mono font-bold text-foreground">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min={100}
              max={1000}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>₹100</span>
              <span>₹500</span>
              <span>₹1,000+</span>
            </div>
          </div>

          {/* 4. Rating Filter */}
          <div className="border-t border-border pt-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Star className="size-3.5 text-amber-500 fill-amber-500" /> Minimum Rating
            </span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: "4.5★+", val: 4.5 },
                { label: "4.0★+", val: 4.0 },
                { label: "All", val: null },
              ].map((r) => (
                <button
                  key={r.label}
                  onClick={() => setMinRating(r.val)}
                  className={`py-1 rounded-lg text-xs font-semibold border text-center transition ${
                    minRating === r.val
                      ? "bg-amber-500/15 border-amber-500 text-amber-700"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. In Stock Toggle */}
          <div className="border-t border-border pt-4">
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition ${
                inStockOnly
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-700"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600" /> In Stock Only
              </span>
              <span className={`size-2 rounded-full ${inStockOnly ? "bg-emerald-500" : "bg-muted"}`} />
            </button>
          </div>

          {/* 6. Dietary Tags */}
          <div className="border-t border-border pt-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-brand-leaf" /> Dietary Benefits
            </span>
            <div className="flex flex-wrap gap-1.5">
              {dietaryTagOptions.map((tag) => {
                const isSelected = selectedDietary.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleDietary(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
                      isSelected
                        ? "bg-brand-leaf text-white border-brand-leaf"
                        : "bg-secondary/70 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <div className="space-y-6">
          {/* Results Toolbar */}
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-soft flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Found <strong className="text-primary">{filteredProducts.length}</strong> organic harvests
                {query && (
                  <span className="font-normal text-muted-foreground"> matching "{query}"</span>
                )}
              </p>
              {activeFilterCount > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeFilterCount} filter criteria applied
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Select */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold outline-none focus:border-primary cursor-pointer"
              >
                <option value="featured">✨ Sort by: Featured</option>
                <option value="low">💰 Price: Low to High</option>
                <option value="high">💎 Price: High to Low</option>
                <option value="rating">⭐ Top Customer Rating</option>
                <option value="discount">🏷️ Highest Discount</option>
                <option value="newest">🌱 New Harvests First</option>
              </select>

              {/* View Switcher */}
              <div className="flex items-center rounded-xl border border-input bg-background p-0.5">
                <Button
                  variant={!list ? "default" : "ghost"}
                  size="icon"
                  className="size-9 rounded-lg"
                  onClick={() => setList(false)}
                  aria-label="Grid view"
                >
                  <Grid2X2 className="size-4" />
                </Button>
                <Button
                  variant={list ? "default" : "ghost"}
                  size="icon"
                  className="size-9 rounded-lg"
                  onClick={() => setList(true)}
                  aria-label="List view"
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Filters:
              </span>
              {query && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-semibold">
                  Query: "{query}"
                  <button onClick={() => setQuery("")}><X className="size-3" /></button>
                </span>
              )}
              {selectedCat !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-semibold">
                  Category: {selectedCat}
                  <button onClick={() => setSelectedCat("All")}><X className="size-3" /></button>
                </span>
              )}
              {selectedBrand !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-semibold">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand("All")}><X className="size-3" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-3 py-1 text-xs font-semibold">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)}><X className="size-3" /></button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-destructive hover:underline ml-2"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Products Grid or Empty State */}
          {filteredProducts.length > 0 ? (
            <div className={list ? "grid gap-5" : "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"}>
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} list={list} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2.5rem] border border-dashed border-border bg-card p-12 text-center space-y-4 shadow-soft">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto text-brand-leaf">
                <SearchIcon className="size-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                No Harvest Products Found
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                We couldn't find any products matching your exact filters. Try adjusting your query, exploring trending searches, or reset the filters.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <Button onClick={resetFilters} className="rounded-full px-6 font-bold">
                  Reset All Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setQuery("Oils")}
                  className="rounded-full px-6 font-bold"
                >
                  Explore Oils
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSearch={(spokenText) => {
          setQuery(spokenText);
          saveQuery(spokenText);
        }}
      />
    </div>
  );
}
