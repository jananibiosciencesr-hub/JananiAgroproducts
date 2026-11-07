import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  ShieldCheck,
  Leaf,
  Package,
  PackageX,
  ArrowRight,
  Filter,
  X,
  Check,
  RotateCcw
} from "lucide-react";
import { categories, products, getCategoryImage, isProductInCategory, isGroceryCategory, type Product } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";
import { getCategories } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { ProductQuickViewModal } from "@/components/shop/product-quick-view-modal";

const ALL_CROPS = [
  "Fruits",
  "Vegetables",
  "Cereals",
  "Pulses",
  "Oilseeds",
  "Cotton",
  "Sugarcane",
  "All Crops",
];

const CROP_SYNONYMS: Record<string, string[]> = {
  vegetables: [
    "vegetable", "vegetables", "tomato", "chilli", "chili", "brinjal",
    "potato", "onion", "ginger", "turmeric", "garlic", "okra", "bhindi",
    "cabbage", "cauliflower", "horticulture", "horticultural"
  ],
  fruits: [
    "fruit", "fruits", "fruit crops", "orchard", "orchards", "mango",
    "banana", "pomegranate", "grapes", "grape", "citrus", "papaya",
    "apple", "guava", "horticulture", "horticultural", "plantation"
  ],
  cereals: [
    "cereal", "cereals", "paddy", "rice", "wheat", "maize", "corn",
    "millet", "millets", "grain", "grains", "sorghum", "barley"
  ],
  pulses: [
    "pulse", "pulses", "gram", "chickpea", "pigeonpea", "lentil",
    "lentils", "dal", "beans", "blackgram", "greengram"
  ],
  oilseeds: [
    "oilseed", "oilseeds", "groundnut", "peanut", "soyabean", "soybean",
    "mustard", "sunflower", "sesame"
  ],
  cotton: ["cotton", "kapas"],
  sugarcane: ["sugarcane", "cane"]
};

function isProductSuitableForCrop(p: any, cropFilter: string): boolean {
  if (!p || !cropFilter) return false;
  const cleanFilter = cropFilter.trim();
  if (cleanFilter === "All Crops") return true;

  const cropsList: string[] = Array.isArray(p.crops)
    ? p.crops
    : typeof p.crops === "string"
    ? (p.crops.startsWith("[")
        ? (() => {
            try {
              const parsed = JSON.parse(p.crops);
              return Array.isArray(parsed) ? parsed : p.crops.split(",");
            } catch {
              return p.crops.split(",");
            }
          })()
        : p.crops.split(","))
    : [];

  const cleanCropsList = cropsList.map((c: any) => String(c).trim()).filter(Boolean);
  const recCrops = String(p.recommendedCrops || p.recommended_crops || "").toLowerCase();
  const desc = String(p.description || "").toLowerCase();

  const isForAll =
    cleanCropsList.some((c) => c.toLowerCase().includes("all crop")) ||
    recCrops.includes("all crop") ||
    recCrops.includes("all agricultural crop") ||
    desc.includes("all crop") ||
    desc.includes("all agricultural crop");

  if (isForAll) return true;

  const filterKey = cleanFilter.toLowerCase();
  const directMatch = cleanCropsList.some((c) => {
    const cLower = c.toLowerCase();
    if (cLower === filterKey) return true;
    if (cLower.replace(/s$/, "") === filterKey.replace(/s$/, "")) return true;
    return false;
  });
  if (directMatch) return true;

  const keywords = CROP_SYNONYMS[filterKey] || [filterKey];
  const combinedText = `${cleanCropsList.join(" ")} ${recCrops} ${desc}`.toLowerCase();

  return keywords.some((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, "i");
    return regex.test(combinedText);
  });
}

export const Route = createFileRoute("/categories/$slug")({
  head: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.slug);
    const title = cat ? `${cat.name} — Pure Organic Harvest — JANANI` : "Category — JANANI";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Shop pure and single-origin ${cat?.name ?? "products"} from Janani Agro Products with certified organic quality.`,
        },
      ],
    };
  },
  component: CategoryDetailPage,
  errorComponent: () => {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200">
          <span className="text-3xl">🌾</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Category Formulations</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          We encountered an issue displaying this category formulation. Please explore our full catalog.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-all"
          >
            Browse All Categories
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-all"
          >
            View All Products
          </Link>
        </div>
      </div>
    );
  },
});

function CategoryDetailPage() {
  const { slug } = Route.useParams();
  const { categories: storeCats, products: storeProds } = useStore();
  const rawCats = storeCats && storeCats.length > 0 ? storeCats : categories;
  const allCats = useMemo(() => {
    const hasUserOther = rawCats.some((c: any) => {
      const s = (c.slug || "").toLowerCase().trim();
      const n = (c.name || "").toLowerCase().trim();
      return (s === "other-categories" || n === "other categories") && !c.deleted_at && !c.deletedAt && c.active !== 0 && c.active !== false && c.active !== "0";
    });
    return rawCats.filter((cat: any) => {
      if (cat.deleted_at || cat.deletedAt || cat.active === 0 || cat.active === false || cat.active === "0") return false;
      if (isGroceryCategory(cat)) return false;
      const s = (cat.slug || "").toLowerCase().trim();
      const n = (cat.name || "").toLowerCase().trim();
      const id = (cat.id || "").toString().toLowerCase().trim();
      if (hasUserOther && (s === "other" || s === "others" || n === "other" || n === "others" || id === "cat-other")) {
        return false;
      }
      return true;
    });
  }, [rawCats]);
  const allProds = storeProds && storeProds.length > 0 ? storeProds : products;
  const [directCat, setDirectCat] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setNotFound(false);
    const timer = setTimeout(() => {
      setNotFound(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [slug]);

  useEffect(() => {
    if (slug) {
      (async () => {
        try {
          const fetched = await getCategories();
          const match = fetched.find((c: any) =>
            (c.slug || "").toLowerCase().trim() === slug.toLowerCase().trim() ||
            (c.slug || "").toLowerCase().replace(/[^a-z0-9]/g, "") === slug.toLowerCase().replace(/[^a-z0-9]/g, "") ||
            (c.name || "").toLowerCase().replace(/[^a-z0-9]/g, "") === slug.toLowerCase().replace(/[^a-z0-9]/g, "")
          );
          if (match) {
            setDirectCat(match);
          }
        } catch (e) {}
      })();
    }
  }, [slug]);

  const category = useMemo(() => {
    const slugLower = (slug || "").toLowerCase().trim();
    const slugNorm = slugLower.replace(/[^a-z0-9]/g, "");
    let found = allCats.find((c: any) => (c.slug || "").toLowerCase().trim() === slugLower) ||
      allCats.find((c: any) => (c.slug || "").toLowerCase().replace(/[^a-z0-9]/g, "") === slugNorm) ||
      allCats.find((c: any) => (c.name || "").toLowerCase().replace(/[^a-z0-9]/g, "") === slugNorm);

    // If slug is any other variant (other, others, other-categories), match the active other category
    if (!found && slugLower.includes("other")) {
      found = allCats.find((c: any) => (c.slug || "").toLowerCase().includes("other") || (c.name || "").toLowerCase().includes("other"));
    }
    return found || directCat || null;
  }, [allCats, slug, directCat]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [list, setList] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sliderPrice, setSliderPrice] = useState<number>(6000);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number>(6000);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const otherCategoriesScrollRef = useRef<HTMLDivElement>(null);

  const scrollOtherCategories = (direction: "left" | "right") => {
    if (otherCategoriesScrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      otherCategoriesScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const toggleCrop = (crop: string) => {
    setSelectedCrops((prev) => {
      if (crop === "All Crops") {
        return prev.includes("All Crops") ? [] : ["All Crops"];
      }
      const withoutAll = prev.filter((c) => c !== "All Crops");
      if (withoutAll.includes(crop)) {
        return withoutAll.filter((c) => c !== crop);
      } else {
        return [...withoutAll, crop];
      }
    });
  };

  const handleClearFilters = () => {
    setQuery("");
    setInStockOnly(false);
    setSliderPrice(6000);
    setAppliedMaxPrice(6000);
    setSelectedCrops([]);
    setSort("featured");
  };

  const hasActiveFilters = Boolean(
    query.trim() ||
    inStockOnly ||
    appliedMaxPrice < 6000 ||
    selectedCrops.length > 0
  );

  // Products matching this category
  const categoryProducts = useMemo(() => {
    if (!category) return [];

    let items = allProds.filter((p: any) => {
      if (p.active === false || p.status === "Trash") return false;
      return isProductInCategory(p, category);
    });

    // Search inside category
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      items = items.filter(
        (p) =>
          String(p.name || "").toLowerCase().includes(q) ||
          String(p.description || "").toLowerCase().includes(q) ||
          String(p.slug || "").toLowerCase().includes(q)
      );
    }

    // Availability
    if (inStockOnly) {
      items = items.filter((p) => p.inStock);
    }

    // Price Range Filter
    if (appliedMaxPrice < 6000) {
      items = items.filter((p) => (p.price ?? 0) <= appliedMaxPrice);
    }

    // Crops Filter
    if (selectedCrops.length > 0) {
      items = items.filter((p) => selectedCrops.some((c) => isProductSuitableForCrop(p, c)));
    }

    // Sorting
    return [...items].sort((a, b) => {
      if (sort === "low") return (a.price ?? 0) - (b.price ?? 0);
      if (sort === "high") return (b.price ?? 0) - (a.price ?? 0);
      if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sort === "discount") return (b.discount ?? 0) - (a.discount ?? 0);
      return String(a.id || "").localeCompare(String(b.id || ""));
    });
  }, [category, query, sort, inStockOnly, appliedMaxPrice, selectedCrops, allProds]);

  if (!category) {
    if (notFound) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200">
            <span className="text-3xl">🌾</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Category Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            The category you are looking for does not exist or may have been updated.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-all"
            >
              Browse All Categories
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-7xl px-4 py-28 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-sm font-semibold text-muted-foreground">Loading category formulations...</p>
      </div>
    );
  }

  // Reusable Filter Sidebar Card Content
  const filterSidebarCard = (
    <div className="space-y-5">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-[#075B32]" />
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Category Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-[11px] font-semibold text-[#075B32] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="size-3" />
            Reset All
          </button>
        )}
      </div>

      {/* 1. Search Within Category */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-800">
          Search in {category.name}
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full h-8.5 rounded-xl border border-input bg-white pl-8 pr-7 text-xs outline-none focus:border-[#075B32] focus:ring-1 focus:ring-[#075B32] transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 2. Categories Switcher (Active category highlighted, other categories clickable) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-800">
            Categories ({allCats.length})
          </label>
          <Link
            to="/categories"
            className="text-[11px] font-medium text-[#075B32] hover:underline"
          >
            All
          </Link>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1 no-scrollbar text-xs">
          {allCats.map((cat: any) => {
            const isSelected = (cat.slug || "").toLowerCase().trim() === (category.slug || "").toLowerCase().trim();
            const count = allProds.filter((p: any) => isProductInCategory(p, cat)).length;
            return isSelected ? (
              <div
                key={cat.slug || cat.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#075B32] text-white font-bold shadow-2xs"
              >
                <div className="flex items-center gap-1.5 truncate min-w-0">
                  <Check className="size-3.5 shrink-0 text-[#F5B726]" />
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/20 text-white shrink-0 ml-1">
                  {count}
                </span>
              </div>
            ) : (
              <Link
                key={cat.slug || cat.id}
                to="/categories/$slug"
                params={{ slug: cat.slug }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-gray-700 hover:bg-emerald-50/70 hover:text-[#075B32] transition font-medium"
              >
                <span className="truncate">{cat.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0 ml-1">
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 3. Price Range Slider */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-800">
            Price Range
          </label>
          {appliedMaxPrice < 6000 && (
            <button
              type="button"
              onClick={() => {
                setSliderPrice(6000);
                setAppliedMaxPrice(6000);
              }}
              className="text-[11px] font-semibold text-[#075B32] hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        <input
          type="range"
          min={0}
          max={6000}
          step={100}
          value={sliderPrice}
          onChange={(e) => {
            const val = Number(e.target.value);
            setSliderPrice(val);
            setAppliedMaxPrice(val);
          }}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#075B32]"
        />
        <div className="flex items-center justify-between text-[11px] text-gray-600 font-medium">
          <span>₹ 0</span>
          <span className="font-bold text-[#075B32]">₹ {sliderPrice}</span>
          <span>₹ 6000</span>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 4. Crops Suitable */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-800">
            Suitable Crops
          </label>
          {selectedCrops.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCrops([])}
              className="text-[11px] font-semibold text-[#075B32] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
          {ALL_CROPS.map((crop) => {
            const isChecked = selectedCrops.includes(crop);
            return (
              <label
                key={crop}
                className="flex items-center gap-2 text-gray-700 cursor-pointer select-none hover:text-[#075B32]"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCrop(crop)}
                  className="rounded border-gray-300 text-[#075B32] focus:ring-[#075B32] size-3.5 accent-[#075B32]"
                />
                <span>{crop}</span>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 5. In Stock Toggle */}
      <div>
        <label className="flex items-center justify-between text-xs font-bold text-gray-800 cursor-pointer select-none">
          <span>In Stock Only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={() => setInStockOnly(!inStockOnly)}
            className="rounded border-gray-300 text-[#075B32] focus:ring-[#075B32] size-4 accent-[#075B32]"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* COMPACT CATEGORY HEADER & DIRECT PRODUCT DISPLAY */}
      <div className="border-b border-border/70 bg-gradient-to-b from-emerald-950/10 via-background to-background pt-4 pb-3 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] 3xl:max-w-[1720px]">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-2.5" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <Link to="/categories" className="hover:text-foreground transition-colors">
              Categories
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              {category.name}
            </span>
          </nav>

          {/* Title Row + Badge + Description */}
          <div className="mb-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {category.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-bold">
                  {categoryProducts.length} Formulations
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-semibold">
                  100% Certified Eco-Safe
                </span>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="h-8 text-xs font-bold rounded-xl border-emerald-200 hover:bg-emerald-50">
                  <Link to="/products">
                    All Products <ChevronRight className="size-3 ml-0.5" />
                  </Link>
                </Button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-none text-justify hyphens-none">
              {category.description || `Certified biological and organic ${category.name.toLowerCase()} formulated for disease protection, balanced nutrition, and high yields.`}
            </p>
          </div>
        </div>
      </div>

      {/* MAIN PRODUCTS SECTION WITH LEFT STICKY FILTER CARD */}
      <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] 3xl:max-w-[1720px] px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8">
        {/* Main 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-10 items-start">
          {/* Left Sticky Filter Card (Desktop) */}
          <aside className="hidden lg:block w-64 xl:w-72 2xl:w-80 shrink-0 lg:sticky lg:top-24 self-start z-10">
            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-none">
              {filterSidebarCard}
            </div>
          </aside>

          {/* Right Main Content Area */}
          <div className="flex-1 w-full min-w-0">
            {/* Top Controls Toolbar */}
            <div className="mb-4 rounded-2xl border border-border/80 bg-card p-3 sm:p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-white text-xs font-bold text-gray-700 hover:text-[#075B32] hover:border-[#075B32] transition cursor-pointer shadow-2xs"
                >
                  <Filter className="size-3.5 text-[#075B32]" />
                  Filters
                  {hasActiveFilters && (
                    <span className="size-2 rounded-full bg-[#075B32]" />
                  )}
                </button>

                <span className="text-xs font-semibold text-muted-foreground">
                  Showing <strong className="text-foreground">{categoryProducts.length}</strong> available products
                </span>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
                {/* Sort Select */}
                <div className="relative flex items-center">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-8.5 rounded-xl border border-input bg-background px-3 pr-8 text-xs font-semibold outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                  <ArrowUpDown className="absolute right-2.5 size-3 text-muted-foreground pointer-events-none" />
                </div>

                {/* View Switcher */}
                <div className="flex items-center rounded-xl border border-input bg-background p-0.5">
                  <button
                    onClick={() => setList(false)}
                    className={`size-7.5 rounded-lg flex items-center justify-center transition cursor-pointer ${
                      !list ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Grid View"
                  >
                    <Grid2X2 className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setList(true)}
                    className={`size-7.5 rounded-lg flex items-center justify-center transition cursor-pointer ${
                      list ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="List View"
                  >
                    <List className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Active Filters:
                </span>
                {query.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#075B32]/10 text-[#075B32]">
                    "{query}"
                    <button onClick={() => setQuery("")} className="hover:text-red-600 cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {appliedMaxPrice < 6000 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#075B32]/10 text-[#075B32]">
                    Under ₹{appliedMaxPrice}
                    <button
                      onClick={() => {
                        setSliderPrice(6000);
                        setAppliedMaxPrice(6000);
                      }}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {selectedCrops.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#075B32]/10 text-[#075B32]">
                    {c}
                    <button onClick={() => toggleCrop(c)} className="hover:text-red-600 cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#075B32]/10 text-[#075B32]">
                    In Stock Only
                    <button onClick={() => setInStockOnly(false)} className="hover:text-red-600 cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-red-600 hover:underline ml-1 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Product Grid — DIRECTLY RENDERED */}
            {categoryProducts.length > 0 ? (
              <div
                className={`grid ${
                  list
                    ? "grid-cols-1 gap-4"
                    : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5"
                }`}
              >
                {categoryProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    list={list}
                    onQuickView={(prod) => setQuickViewProduct(prod)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-3">
                <PackageX className="size-10 text-gray-400 mx-auto" />
                <p className="text-lg font-bold text-foreground">
                  {hasActiveFilters
                    ? "No formulations match your filter criteria"
                    : `No products currently available in ${category.name}`}
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {hasActiveFilters
                    ? "Try adjusting your price range, selected crops, or search query."
                    : "New formulations and farm inputs will be listed here soon."}
                </p>
                {hasActiveFilters && (
                  <Button onClick={handleClearFilters} className="mt-2 rounded-full" variant="outline">
                    Reset All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quality Guarantees Strip (Positioned Below Products) */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-emerald-100/80 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Leaf className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">100% Certified Organic</h4>
              <p className="text-[11px] text-muted-foreground">Zero chemical residue, bio-safe</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:border-x sm:border-emerald-200/60 sm:px-4">
            <div className="size-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">High Efficacy Concentration</h4>
              <p className="text-[11px] text-muted-foreground">Potent liquid formulations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Direct Farm Delivery</h4>
              <p className="text-[11px] text-muted-foreground">PAN India courier dispatch</p>
            </div>
          </div>
        </div>

        {/* Other Categories Single-Line Carousel Strip */}
        <section className="mt-16 sm:mt-20 border-t border-border/80 pt-10 sm:pt-12 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                Explore Other Bio-Input Categories
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Discover biological crop protection, soil biostimulants, and organic plant nutrients.
              </p>
            </div>
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {/* Carousel Navigation Arrows */}
              <div className="flex items-center gap-1.5 mr-1">
                <button
                  type="button"
                  onClick={() => scrollOtherCategories("left")}
                  aria-label="Previous categories"
                  className="size-8 rounded-full border border-border bg-white text-muted-foreground hover:text-[#075B32] hover:border-[#075B32]/40 hover:bg-emerald-50/50 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollOtherCategories("right")}
                  aria-label="Next categories"
                  className="size-8 rounded-full border border-border bg-white text-muted-foreground hover:text-[#075B32] hover:border-[#075B32]/40 hover:bg-emerald-50/50 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <Button asChild variant="ghost" className="text-xs font-bold text-[#075B32] hover:text-[#0B6B35]">
                <Link to="/categories">
                  View All Categories <ChevronRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Single-Line Scrollable Strip */}
          <div className="relative w-full overflow-hidden">
            <div
              ref={otherCategoriesScrollRef}
              className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none pb-3 pt-1 px-1 no-scrollbar w-full snap-x snap-mandatory"
            >
              {allCats
                .filter((c: any) => c.slug !== category.slug)
                .map((c: any) => {
                  const cImg = (c.image && typeof c.image === "string" && c.image.trim().length > 0)
                    ? getCategoryImage(c.slug || c.name, c.image)
                    : getCategoryImage(c.slug || c.name);
                  return (
                    <Link
                      key={c.slug}
                      to="/categories/$slug"
                      params={{ slug: c.slug }}
                      className="group flex-none shrink-0 w-[225px] sm:w-[245px] snap-start flex items-center gap-3 p-3 sm:p-3.5 rounded-3xl border border-border/80 bg-white hover:border-[#075B32]/40 shadow-xs hover:shadow-md transition-all duration-200"
                    >
                      <div className="size-14 sm:size-16 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                        <img
                          src={cImg}
                          alt={c.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/images/categories/bio-fertilizers.jpg";
                          }}
                          className="size-full object-cover group- transition duration-300"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-[#075B32] group-hover:text-[#4FAE2A] transition-colors truncate">
                          {c.name}
                        </h4>
                        <span className="text-[11px] text-[#0B6B35] font-semibold mt-0.5 block">
                          {allProds.filter((p: any) => isProductInCategory(p, c)).length || c.count || (c as any).productsCount || 0} formulations
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Filters Slide-Out Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-2xl flex flex-col z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-[#075B32]" />
                <h3 className="text-base font-bold text-gray-900">Category Filters</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="flex-1 overflow-y-auto p-4">
              {filterSidebarCard}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex items-center gap-3 bg-gray-50/50">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#075B32] text-white text-xs font-bold shadow-xs hover:bg-[#064A29] transition cursor-pointer"
              >
                View {categoryProducts.length} Formulations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}
