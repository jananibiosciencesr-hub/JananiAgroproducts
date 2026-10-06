import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  PackageX,
  X,
  Boxes,
  Leaf,
  ShieldCheck,
  Star,
  Eye,
  Truck,
  Shield,
  Headphones,
  Award,
  Layers,
  Bug,
  Sun,
  Wheat,
  Sparkles,
  Filter,
  Check,
  ShoppingBag,
  Heart,
  Sprout,
  ShieldAlert,
  TrendingUp,
  Droplets
} from "lucide-react";
import { products, categories, type Product } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";
import { ProductQuickViewModal } from "@/components/shop/product-quick-view-modal";
import { toast } from "sonner";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Products — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content:
          "Natural and effective agro solutions for healthier crops and higher yields. Bio fertilizers, bio pesticides, bio fungicides, bio stimulants, micro nutrients, insecticides, botanical extracts and water solubles.",
      },
      { property: "og:title", content: "Products — JANANI AGRO PRODUCTS" },
      {
        property: "og:description",
        content: "Natural and effective agro solutions for healthier crops and higher yields.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ProductsPage,
});

type SortOption = "featured" | "price_asc" | "price_desc" | "rating" | "newest";

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

const ALL_BENEFITS = [
  "Soil Health",
  "Root Growth",
  "Damping Off Control",
  "Fungal Disease Control",
  "Plant Growth",
  "Crop Yield",
  "Organic Farming",
];

function getCategoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("fertilizer")) {
    return <Sprout className="size-4 text-[#075B32]" />;
  }
  if (n.includes("bio pesticide") || n.includes("biopesticide")) {
    return <ShieldAlert className="size-4 text-[#075B32]" />;
  }
  if (n.includes("bio fungicide") || n.includes("biofungicide")) {
    return <ShieldCheck className="size-4 text-[#075B32]" />;
  }
  if (n.includes("stimulant")) {
    return <TrendingUp className="size-4 text-[#075B32]" />;
  }
  if (n.includes("nutrient")) {
    return <Wheat className="size-4 text-[#075B32]" />;
  }
  if (n.includes("insecticide")) {
    return <Bug className="size-4 text-[#075B32]" />;
  }
  if (n.includes("fungicide")) {
    return <Shield className="size-4 text-[#075B32]" />;
  }
  if (n.includes("botanical")) {
    return <Leaf className="size-4 text-[#075B32]" />;
  }
  if (n.includes("soluble")) {
    return <Droplets className="size-4 text-[#075B32]" />;
  }
  if (n.includes("input")) {
    return <Layers className="size-4 text-[#075B32]" />;
  }
  if (n.includes("other")) {
    return <Sparkles className="size-4 text-[#075B32]" />;
  }
  return <Leaf className="size-4 text-[#075B32]" />;
}

function ProductsPage() {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  // Strictly use our authentic Janani Agro products from catalog (all 18 genuine items)
  const activeProductList = products;

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sliderPrice, setSliderPrice] = useState<number>(6000);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number>(6000);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("featured");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const itemsPerPage = 12;

  // Read initial category from URL query parameters (e.g. from navbar / categories links)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCat = params.get("category");
      if (urlCat) {
        const urlNorm = urlCat.toLowerCase().replace(/[^a-z0-9]/g, "");
        const matched = categories.find(
          (c) =>
            c.name.toLowerCase().replace(/[^a-z0-9]/g, "") === urlNorm ||
            c.slug.toLowerCase().replace(/[^a-z0-9]/g, "") === urlNorm
        );
        if (matched) {
          setSelectedCategory(matched.name);
        }
      }
    }
  }, []);

  const handleSelectCategory = (catName: string | null) => {
    setSelectedCategory(catName);
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (catName) {
        url.searchParams.set("category", catName);
      } else {
        url.searchParams.delete("category");
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Handle Crop Toggle
  const toggleCrop = (crop: string) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  // Handle Benefit Toggle
  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(benefit) ? prev.filter((b) => b !== benefit) : [...prev, benefit]
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    handleSelectCategory(null);
    setSliderPrice(6000);
    setAppliedMaxPrice(6000);
    setSelectedCrops([]);
    setSelectedBenefits([]);
    setSearchQuery("");
    setSort("featured");
    setCurrentPage(1);
  };

  // Apply Price Filter Button
  const handleApplyPrice = () => {
    setAppliedMaxPrice(sliderPrice);
    setCurrentPage(1);
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return activeProductList.filter((p) => {
      // 1. Category
      if (selectedCategory) {
        const selNorm = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, "");
        const pNorm = (p.category || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (pNorm !== selNorm) return false;
      }

      // 2. Price (only filter if user set appliedMaxPrice below catalog maximum of 6000)
      if (appliedMaxPrice < 6000 && p.price > appliedMaxPrice) {
        return false;
      }

      // 3. Crops
      if (selectedCrops.length > 0) {
        const prodCrops = p.crops || [];
        const hasMatch = selectedCrops.some((c) =>
          c === "All Crops" ? true : prodCrops.includes(c)
        );
        if (!hasMatch) return false;
      }

      // 4. Benefits
      if (selectedBenefits.length > 0) {
        const prodBenefits = p.benefits || [];
        const hasMatch = selectedBenefits.some((b) => prodBenefits.includes(b));
        if (!hasMatch) return false;
      }

      // 5. Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSub = (p.subtitle || "").toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesSub && !matchesCat) return false;
      }

      return true;
    });
  }, [activeProductList, selectedCategory, appliedMaxPrice, selectedCrops, selectedBenefits, searchQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sort) {
      case "price_asc":
        return list.sort((a, b) => a.price - b.price);
      case "price_desc":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      case "newest":
        return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id);
      case "featured":
      default:
        return list.sort((a, b) => a.id - b.id);
    }
  }, [filteredProducts, sort]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, appliedMaxPrice, selectedCrops, selectedBenefits, searchQuery, sort]);

  // Paginated slice
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
    toast.success(`Added ${product.name} to cart!`, {
      description: `₹${product.price.toFixed(2)} • ${product.unit}`,
    });
  };

  const handleQuickView = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  // Reusable Filter Sidebar Content
  const filterSidebarContent = (
    <div className="space-y-6">
      {/* 1. Categories Section */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">Categories</h3>
        <div className="space-y-1">
          {/* All Products */}
          <button
            onClick={() => handleSelectCategory(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
              selectedCategory === null
                ? "bg-[#075B32]/10 text-[#075B32] font-bold"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Boxes className="size-4 text-[#075B32]" />
              <span>All Products</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
                selectedCategory === null
                  ? "bg-[#075B32] text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {activeProductList.length}
            </span>
          </button>

          {/* Individual Categories */}
          {categories.map((cat) => {
            const count = activeProductList.filter((p) => {
              const pCat = (p.category || "").toLowerCase().replace(/[^a-z0-9]/g, "");
              const cName = cat.name.toLowerCase().replace(/[^a-z0-9]/g, "");
              return pCat === cName;
            }).length;
            const isSelected = selectedCategory?.toLowerCase().replace(/[^a-z0-9]/g, "") === cat.name.toLowerCase().replace(/[^a-z0-9]/g, "");

            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => handleSelectCategory(isSelected ? null : cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                  isSelected
                    ? "bg-[#075B32]/10 text-[#075B32] font-bold"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  {getCategoryIcon(cat.name)}
                  <span className="truncate">{cat.name}</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium shrink-0 ${
                    isSelected
                      ? "bg-[#075B32] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* 2. Price Range Section */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">Price Range</h3>
        <div className="pt-1">
          <input
            type="range"
            min={0}
            max={6000}
            step={100}
            value={sliderPrice}
            onChange={(e) => setSliderPrice(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#075B32]"
          />
          <div className="flex items-center justify-between text-xs text-gray-600 mt-2 font-medium">
            <span>₹ 0</span>
            <span className="font-semibold text-[#075B32]">₹ {sliderPrice}</span>
            <span>₹ 6000</span>
          </div>
        </div>
        <button
          onClick={handleApplyPrice}
          className="w-full bg-[#075B32] hover:bg-[#064A29] text-white text-xs font-bold py-2 px-4 rounded-xl transition shadow-xs cursor-pointer"
        >
          Apply Price Filter
        </button>
      </div>

      <hr className="border-gray-200" />

      {/* 3. Crops Checkboxes */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">Crops</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {ALL_CROPS.map((crop) => {
            const isChecked = selectedCrops.includes(crop);
            return (
              <label
                key={crop}
                className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none hover:text-[#075B32]"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCrop(crop)}
                  className="rounded border-gray-300 text-[#075B32] focus:ring-[#075B32] size-3.5"
                />
                <span>{crop}</span>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* 4. Benefits Checkboxes */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">Benefits</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {ALL_BENEFITS.map((benefit) => {
            const isChecked = selectedBenefits.includes(benefit);
            return (
              <label
                key={benefit}
                className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none hover:text-[#075B32]"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleBenefit(benefit)}
                  className="rounded border-gray-300 text-[#075B32] focus:ring-[#075B32] size-3.5"
                />
                <span>{benefit}</span>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Clear Filters Button */}
      <button
        onClick={handleClearFilters}
        className="w-full border border-gray-300 hover:border-[#075B32] text-gray-700 hover:text-[#075B32] text-xs font-semibold py-2 px-4 rounded-xl transition bg-white"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb (NO top banner as requested) */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 font-medium">
          <Link to="/" className="hover:text-[#075B32] transition">
            Home
          </Link>
          <span className="text-gray-400">&gt;</span>
          <span className="font-semibold text-gray-800">Products</span>
        </nav>

        {/* Main 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar (Desktop) */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              {filterSidebarContent}
            </div>
          </aside>

          {/* Right Main Content Area */}
          <div className="flex-1 w-full min-w-0">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100 mb-6">
              {/* Left: Product count & Mobile filter trigger */}
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#075B32] hover:border-[#075B32] transition"
                >
                  <Filter className="size-3.5 text-[#075B32]" />
                  Filters
                  {(selectedCategory || selectedCrops.length > 0 || selectedBenefits.length > 0 || appliedMaxPrice < 6000) && (
                    <span className="size-2 rounded-full bg-[#075B32]" />
                  )}
                </button>

                <p className="text-xs text-gray-600 font-medium">
                  Showing{" "}
                  <strong className="text-gray-900 font-bold">
                    {sortedProducts.length === 0
                      ? "0"
                      : `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(
                          currentPage * itemsPerPage,
                          sortedProducts.length
                        )}`}
                  </strong>{" "}
                  of <strong className="text-gray-900 font-bold">{sortedProducts.length}</strong> products
                </p>
              </div>

              {/* Right: Search + Sort Dropdown */}
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative w-44 sm:w-52">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full h-8 pl-8 pr-7 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#075B32] transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="hidden sm:inline">Sort by:</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="h-8 pl-2.5 pr-6 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#075B32] cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Pills */}
            {(selectedCategory || selectedCrops.length > 0 || selectedBenefits.length > 0 || appliedMaxPrice < 6000 || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Filters:
                </span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#075B32]/10 text-[#075B32]">
                    {selectedCategory}
                    <button onClick={() => handleSelectCategory(null)} className="hover:text-red-600">
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {appliedMaxPrice < 6000 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#075B32]/10 text-[#075B32]">
                    Under ₹{appliedMaxPrice}
                    <button onClick={() => { setSliderPrice(6000); setAppliedMaxPrice(6000); }} className="hover:text-red-600">
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {selectedCrops.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#075B32]/10 text-[#075B32]">
                    {c}
                    <button onClick={() => toggleCrop(c)} className="hover:text-red-600">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                {selectedBenefits.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#075B32]/10 text-[#075B32]">
                    {b}
                    <button onClick={() => toggleBenefit(b)} className="hover:text-red-600">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#075B32]/10 text-[#075B32]">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="hover:text-red-600">
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-red-600 hover:underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* 4-Column Product Grid: 2 columns on mobile, 3 on md, 4 on xl - No Curves Sharp Style */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                {paginatedProducts.map((p) => {
                  const isWishlisted = wishlist.includes(p.id);
                  const discountVal = p.discount || Math.round(((p.oldPrice - p.price) / (p.oldPrice || p.price)) * 100) || 12;

                  return (
                    <article
                      key={p.id}
                      className="group bg-white rounded-none border border-gray-200 hover:border-[#075B32] hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
                    >
                      {/* Image Container with Badges */}
                      <div className="relative aspect-square w-full bg-white overflow-hidden p-2 sm:p-3 flex items-center justify-center rounded-none">
                        <Link
                          to="/products/$slug"
                          params={{ slug: p.slug }}
                          className="w-full h-full flex items-center justify-center"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        {/* Top-Left Red Discount Badge - Sharp rectangular like mockup */}
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-[#E53E3E] text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-none uppercase tracking-wider shadow-xs">
                            SAVE {discountVal}%
                          </span>
                        </div>

                        {/* Top-Right Circular Wishlist Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(p.id);
                          }}
                          className={`absolute top-2 right-2 z-10 size-7 sm:size-8 rounded-full shadow-xs flex items-center justify-center transition backdrop-blur-xs ${
                            isWishlisted
                              ? "bg-red-500 text-white"
                              : "bg-white/90 text-gray-700 hover:text-red-500 hover:bg-white"
                          }`}
                          aria-label="Wishlist"
                        >
                          <Heart className={`size-3.5 sm:size-4 ${isWishlisted ? "fill-current" : ""}`} />
                        </button>

                        {/* Bottom Center Pill on Image - 🔥 BESTSELLER */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 bg-[#064A29]/95 text-white text-[8px] sm:text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider backdrop-blur-xs">
                            <span>🔥</span>
                            <span>{p.badge || "BESTSELLER"}</span>
                          </span>
                        </div>
                      </div>

                      {/* Info & Details - Sharp edges */}
                      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between border-t border-gray-100">
                        <div>
                          {/* Title in brand dark green */}
                          <Link
                            to="/products/$slug"
                            params={{ slug: p.slug }}
                            className="font-bold text-xs sm:text-sm text-[#075B32] group-hover:text-[#4FAE2A] transition line-clamp-1 block"
                          >
                            {p.name}
                          </Link>

                          {/* Subtitle / Spec */}
                          <p className="text-[10px] sm:text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {p.subtitle || p.description}
                          </p>

                          {/* Rating & Reviews */}
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] sm:text-[11px]">
                            <div className="flex items-center text-[#E7A91A]">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="size-2.5 sm:size-3 fill-current" />
                              ))}
                            </div>
                            <span className="text-gray-500 font-semibold ml-0.5">
                              ({p.reviews} reviews)
                            </span>
                          </div>

                          {/* Price: Rs. XXX  Rs. YYY */}
                          <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-base text-gray-900 font-mono">
                              Rs. {p.price}
                            </span>
                            {p.oldPrice && p.oldPrice > p.price && (
                              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">
                                Rs. {p.oldPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Full-width Rectangular Add to Cart Button - EXACTLY LIKE MOCKUP */}
                        <div className="mt-2.5 pt-2">
                          <button
                            onClick={(e) => handleAddToCart(e, p)}
                            className="w-full bg-[#075B32] hover:bg-[#064A29] text-white text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 rounded-none uppercase tracking-wider transition text-center shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
                          >
                            <ShoppingBag className="size-3.5 sm:size-4" />
                            <span>ADD TO CART</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center space-y-3">
                <PackageX className="size-10 text-gray-400 mx-auto" />
                <h3 className="text-lg font-bold text-gray-800">No matching agro products found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try adjusting your price range, selected crops, or search query.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-[#075B32] text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls (< 1 >) */}
            {sortedProducts.length > 0 && totalPages > 1 && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="size-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#075B32] hover:text-[#075B32] transition"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  const isActive = currentPage === pNum;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`size-8 rounded-lg text-xs font-bold transition ${
                        isActive
                          ? "bg-[#075B32] text-white shadow-xs"
                          : "border border-gray-200 text-gray-700 hover:border-[#075B32] hover:text-[#075B32]"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="size-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#075B32] hover:text-[#075B32] transition"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4 Bottom Trust Badges (Horizontal Card matching mockup) */}
        <section className="mt-14 mb-8 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* 1. Free Shipping */}
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-full bg-[#075B32]/10 flex items-center justify-center shrink-0">
                <Truck className="size-5 text-[#075B32]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">Free Shipping</h4>
                <p className="text-xs text-gray-500">On Bulk Orders</p>
              </div>
            </div>

            {/* 2. 100% Secure */}
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-full bg-[#075B32]/10 flex items-center justify-center shrink-0">
                <Shield className="size-5 text-[#075B32]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">100% Secure</h4>
                <p className="text-xs text-gray-500">Payments</p>
              </div>
            </div>

            {/* 3. Expert Support */}
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-full bg-[#075B32]/10 flex items-center justify-center shrink-0">
                <Headphones className="size-5 text-[#075B32]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">Expert Support</h4>
                <p className="text-xs text-gray-500">For Crop Solutions</p>
              </div>
            </div>

            {/* 4. Quality Products */}
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-full bg-[#075B32]/10 flex items-center justify-center shrink-0">
                <Award className="size-5 text-[#075B32]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">Quality Products</h4>
                <p className="text-xs text-gray-500">For Better Yield</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Filters Slide-over Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          {/* Drawer */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="size-4 text-[#075B32]" />
                  Filters
                </h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
                >
                  <X className="size-5" />
                </button>
              </div>

              {filterSidebarContent}
            </div>

            <div className="pt-6 border-t border-gray-100 mt-6">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-[#075B32] text-white text-xs font-bold py-2.5 rounded-xl shadow-xs"
              >
                Show Results ({sortedProducts.length})
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
    </div>
  );
}