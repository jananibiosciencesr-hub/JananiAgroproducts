import React from "react";
import {
  X,
  RotateCcw,
  Star,
  Check,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  MapPin,
  Tag,
  Boxes
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, products } from "@/lib/catalog";

export interface ShopFilterState {
  searchQuery: string;
  selectedCategories: string[];
  selectedBrands: string[];
  priceRange: [number, number];
  minRating: number | null;
  inStockOnly: boolean;
  minDiscount: number | null;
  selectedDietary: string[];
  selectedOrigins: string[];
}

export const initialFilterState: ShopFilterState = {
  searchQuery: "",
  selectedCategories: [],
  selectedBrands: [],
  priceRange: [0, 1000],
  minRating: null,
  inStockOnly: false,
  minDiscount: null,
  selectedDietary: [],
  selectedOrigins: [],
};

const allBrands = [
  "Janani Pure Harvest",
  "Janani Vedic Reserve",
  "Janani Single-Origin",
  "Janani Wild Harvest"
];

const allDietaryTags = [
  "Cold Pressed",
  "Gluten Free",
  "Diabetic Friendly",
  "High Protein",
  "High Fiber",
  "Zero Chemical",
  "Single Origin",
  "Stone Ground"
];

const allOrigins = [
  "Gujarat (Saurashtra)",
  "Karnataka (Mandya)",
  "Rajasthan (Bikaner)",
  "Kerala (Wayanad)",
  "Maharashtra (Vidarbha)"
];

interface ShopFilterSidebarProps {
  filters: ShopFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ShopFilterState>>;
  totalMatching: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function ShopFilterSidebar({
  filters,
  setFilters,
  totalMatching,
  isOpenMobile = false,
  onCloseMobile
}: ShopFilterSidebarProps) {

  const activeFilterCount =
    (filters.selectedCategories.length > 0 ? 1 : 0) +
    (filters.selectedBrands.length > 0 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0) +
    (filters.minRating !== null ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.minDiscount !== null ? 1 : 0) +
    (filters.selectedDietary.length > 0 ? 1 : 0) +
    (filters.selectedOrigins.length > 0 ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  const resetFilters = () => {
    setFilters(initialFilterState);
  };

  const toggleCategory = (catName: string) => {
    setFilters((prev) => {
      const exists = prev.selectedCategories.includes(catName);
      return {
        ...prev,
        selectedCategories: exists
          ? prev.selectedCategories.filter((c) => c !== catName)
          : [...prev.selectedCategories, catName],
      };
    });
  };

  const toggleBrand = (brandName: string) => {
    setFilters((prev) => {
      const exists = prev.selectedBrands.includes(brandName);
      return {
        ...prev,
        selectedBrands: exists
          ? prev.selectedBrands.filter((b) => b !== brandName)
          : [...prev.selectedBrands, brandName],
      };
    });
  };

  const toggleDietary = (tag: string) => {
    setFilters((prev) => {
      const exists = prev.selectedDietary.includes(tag);
      return {
        ...prev,
        selectedDietary: exists
          ? prev.selectedDietary.filter((t) => t !== tag)
          : [...prev.selectedDietary, tag],
      };
    });
  };

  const toggleOrigin = (origin: string) => {
    setFilters((prev) => {
      const exists = prev.selectedOrigins.includes(origin);
      return {
        ...prev,
        selectedOrigins: exists
          ? prev.selectedOrigins.filter((o) => o !== origin)
          : [...prev.selectedOrigins, origin],
      };
    });
  };

  const filterContent = (
    <div className="space-y-6 text-foreground">
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-brand-leaf" />
          <h3 className="font-display font-semibold text-lg">Filter Harvest</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        )}
      </div>

      {/* 1. Search Inside Shop / Category */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Search className="size-3.5 text-brand-leaf" /> Search in Pantry
        </label>
        <div className="relative">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search oils, millets, spices..."
            className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-primary transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: "" }))}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Categories Filter */}
      <div className="space-y-2.5 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Boxes className="size-3.5 text-brand-leaf" /> Category
          </label>
          <span className="text-[11px] text-muted-foreground">
            {categories.length}
          </span>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = filters.selectedCategories.includes(cat.name);
            const count = products.filter((p) => p.category === cat.name).length;
            return (
              <button
                key={cat.slug}
                onClick={() => toggleCategory(cat.name)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`size-3.5 rounded border flex items-center justify-center ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input bg-card"
                    }`}
                  >
                    {isSelected && <Check className="size-2.5" />}
                  </div>
                  <span>{cat.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Brand Filter */}
      <div className="space-y-2.5 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-brand-gold" /> Brand & Reserve
          </label>
        </div>
        <div className="space-y-1">
          {allBrands.map((b) => {
            const isSelected = filters.selectedBrands.includes(b);
            const count = products.filter((p) => p.brand === b).length;
            return (
              <button
                key={b}
                onClick={() => toggleBrand(b)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`size-3.5 rounded border flex items-center justify-center ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input bg-card"
                    }`}
                  >
                    {isSelected && <Check className="size-2.5" />}
                  </div>
                  <span>{b}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Price Slider */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Tag className="size-3.5 text-brand-leaf" /> Price Range
          </label>
          <span className="text-xs font-semibold text-primary font-mono">
            ₹{filters.priceRange[0]} — ₹{filters.priceRange[1]}
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={1000}
            step={25}
            value={filters.priceRange[1]}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                priceRange: [prev.priceRange[0], Number(e.target.value)],
              }))
            }
            className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>₹0 (Budget)</span>
            <span>₹500 (Standard)</span>
            <span>₹1,000+ (Bulk)</span>
          </div>
        </div>
      </div>

      {/* 5. Rating Filter */}
      <div className="space-y-2.5 pt-2 border-t border-border">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Star className="size-3.5 text-amber-500 fill-amber-500" /> Customer Rating
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "4.5★+", val: 4.5 },
            { label: "4.0★+", val: 4.0 },
            { label: "All", val: null },
          ].map((r) => {
            const isSelected = filters.minRating === r.val;
            return (
              <button
                key={r.label}
                onClick={() => setFilters((prev) => ({ ...prev, minRating: r.val }))}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500 text-amber-600 font-bold"
                    : "border-border bg-card hover:bg-muted text-muted-foreground"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Availability & Stock Filter */}
      <div className="space-y-2.5 pt-2 border-t border-border">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-emerald-600" /> Availability
        </label>
        <button
          onClick={() => setFilters((prev) => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition ${
            filters.inStockOnly
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 font-semibold"
              : "bg-card border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${filters.inStockOnly ? "bg-emerald-500" : "bg-muted-foreground"}`} />
            In-Stock Ready to Dispatch
          </span>
          <div
            className={`size-3.5 rounded border flex items-center justify-center ${
              filters.inStockOnly ? "bg-emerald-600 border-emerald-600 text-white" : "border-input bg-card"
            }`}
          >
            {filters.inStockOnly && <Check className="size-2.5" />}
          </div>
        </button>
      </div>

      {/* 7. Minimum Discount Filter */}
      <div className="space-y-2.5 pt-2 border-t border-border">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Tag className="size-3.5 text-brand-gold" /> Special Offers & Deals
        </label>
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: "10%+", val: 10 },
            { label: "20%+", val: 20 },
            { label: "25%+", val: 25 },
            { label: "All", val: null },
          ].map((d) => {
            const isSelected = filters.minDiscount === d.val;
            return (
              <button
                key={d.label}
                onClick={() => setFilters((prev) => ({ ...prev, minDiscount: d.val }))}
                className={`py-1.5 text-center text-xs rounded-lg border transition ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-bold border-primary"
                    : "bg-card border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 8. Dietary & Health Benefits */}
      <div className="space-y-2.5 pt-2 border-t border-border">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-brand-leaf" /> Dietary & Health Tags
        </label>
        <div className="flex flex-wrap gap-1.5">
          {allDietaryTags.map((tag) => {
            const isSelected = filters.selectedDietary.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleDietary(tag)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
                  isSelected
                    ? "bg-brand-leaf text-white border-brand-leaf"
                    : "bg-secondary/80 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 9. Farm Origin Region */}
      <div className="space-y-2.5 pt-2 border-t border-border">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <MapPin className="size-3.5 text-rose-500" /> Farm Provenance
        </label>
        <div className="space-y-1">
          {allOrigins.map((origin) => {
            const isSelected = filters.selectedOrigins.includes(origin);
            return (
              <button
                key={origin}
                onClick={() => toggleOrigin(origin)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`size-3.5 rounded border flex items-center justify-center ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input bg-card"
                    }`}
                  >
                    {isSelected && <Check className="size-2.5" />}
                  </div>
                  <span>{origin}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-28 rounded-3xl border border-border bg-card p-6 shadow-soft">
          {filterContent}
        </div>
      </aside>

      {/* Mobile / Tablet Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-background p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-brand-leaf" />
                <h2 className="font-display font-bold text-lg">Filters</h2>
              </div>
              <button
                onClick={onCloseMobile}
                className="rounded-full p-1.5 hover:bg-muted text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 flex-1">{filterContent}</div>

            <div className="mt-6 pt-4 border-t border-border flex gap-3 sticky bottom-0 bg-background">
              <Button variant="outline" className="flex-1" onClick={resetFilters}>
                Reset
              </Button>
              <Button className="flex-1" onClick={onCloseMobile}>
                Show {totalMatching} Items
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
