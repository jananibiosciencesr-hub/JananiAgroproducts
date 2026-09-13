import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Grid2X2,
  List,
  LayoutGrid,
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PackageX,
  X,
  Boxes,
  Leaf,
  ShieldCheck,
  Check
} from "lucide-react";
import { products, categories, type Product } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { PageHero } from "@/components/page-kit";
import { Button } from "@/components/ui/button";
import {
  ShopFilterSidebar,
  initialFilterState,
  type ShopFilterState,
} from "@/components/shop/shop-filter-sidebar";
import { ProductQuickViewModal } from "@/components/shop/product-quick-view-modal";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Organic Pantry & Harvest Shop — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content:
          "Shop 100% certified organic grains, cold-pressed oils, single-origin spices, native millets, and Vedic pantry essentials directly from Indian farms.",
      },
      { property: "og:title", content: "Organic Pantry & Harvest Shop — JANANI" },
      {
        property: "og:description",
        content: "Explore certified organic food products with complete origin traceability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

type ViewMode = "grid-4" | "grid-3" | "list";
type SortOption =
  | "featured"
  | "newest"
  | "popularity"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "discount";

function ProductsPage() {
  // Filter State
  const [filters, setFilters] = useState<ShopFilterState>(initialFilterState);
  const [sort, setSort] = useState<SortOption>("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("grid-4");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination vs Infinite Scroll State
  const [paginationMode, setPaginationMode] = useState<"pagination" | "infinite">("pagination");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [infiniteCount, setInfiniteCount] = useState(12);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter and Sort Engine
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search filter
      if (
        filters.searchQuery &&
        !p.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !p.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !p.category.toLowerCase().includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

      // 2. Category filter
      if (
        filters.selectedCategories.length > 0 &&
        !filters.selectedCategories.includes(p.category)
      ) {
        return false;
      }

      // 3. Brand filter
      if (
        filters.selectedBrands.length > 0 &&
        !filters.selectedBrands.includes(p.brand)
      ) {
        return false;
      }

      // 4. Price range
      if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) {
        return false;
      }

      // 5. Min Rating
      if (filters.minRating !== null && p.rating < filters.minRating) {
        return false;
      }

      // 6. Availability
      if (filters.inStockOnly && !p.inStock) {
        return false;
      }

      // 7. Min Discount
      if (filters.minDiscount !== null && p.discount < filters.minDiscount) {
        return false;
      }

      // 8. Dietary tags
      if (filters.selectedDietary.length > 0) {
        const matchesAny = filters.selectedDietary.some((tag) =>
          p.dietaryTags?.includes(tag)
        );
        if (!matchesAny) return false;
      }

      // 9. Origins
      if (
        filters.selectedOrigins.length > 0 &&
        !filters.selectedOrigins.includes(p.origin)
      ) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Sort Engine
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sort) {
      case "price_asc":
        return list.sort((a, b) => a.price - b.price);
      case "price_desc":
        return list.sort((a, b) => b.price - a.price);
      case "newest":
        return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id);
      case "popularity":
        return list.sort((a, b) => b.popularity - a.popularity || b.reviews - a.reviews);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      case "discount":
        return list.sort((a, b) => b.discount - a.discount);
      case "featured":
      default:
        return list.sort((a, b) => a.id - b.id);
    }
  }, [filteredProducts, sort]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setInfiniteCount(itemsPerPage);
  }, [filters, sort, itemsPerPage]);

  // Paginated Slices
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    if (paginationMode === "infinite") {
      return sortedProducts.slice(0, infiniteCount);
    }
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, paginationMode, currentPage, itemsPerPage, infiniteCount]);

  // Active filter badge helpers
  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; onRemove: () => void }[] = [];

    if (filters.searchQuery) {
      list.push({
        key: "search",
        label: `Search: "${filters.searchQuery}"`,
        onRemove: () => setFilters((prev) => ({ ...prev, searchQuery: "" })),
      });
    }

    filters.selectedCategories.forEach((cat) => {
      list.push({
        key: `cat-${cat}`,
        label: cat,
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            selectedCategories: prev.selectedCategories.filter((c) => c !== cat),
          })),
      });
    });

    filters.selectedBrands.forEach((b) => {
      list.push({
        key: `brand-${b}`,
        label: b,
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            selectedBrands: prev.selectedBrands.filter((item) => item !== b),
          })),
      });
    });

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      list.push({
        key: "price",
        label: `₹${filters.priceRange[0]} — ₹${filters.priceRange[1]}`,
        onRemove: () => setFilters((prev) => ({ ...prev, priceRange: [0, 1000] })),
      });
    }

    if (filters.minRating !== null) {
      list.push({
        key: "rating",
        label: `${filters.minRating}★ & above`,
        onRemove: () => setFilters((prev) => ({ ...prev, minRating: null })),
      });
    }

    if (filters.inStockOnly) {
      list.push({
        key: "instock",
        label: "In Stock Only",
        onRemove: () => setFilters((prev) => ({ ...prev, inStockOnly: false })),
      });
    }

    if (filters.minDiscount !== null) {
      list.push({
        key: "discount",
        label: `${filters.minDiscount}%+ Discount`,
        onRemove: () => setFilters((prev) => ({ ...prev, minDiscount: null })),
      });
    }

    filters.selectedDietary.forEach((tag) => {
      list.push({
        key: `diet-${tag}`,
        label: tag,
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            selectedDietary: prev.selectedDietary.filter((t) => t !== tag),
          })),
      });
    });

    filters.selectedOrigins.forEach((origin) => {
      list.push({
        key: `origin-${origin}`,
        label: origin,
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            selectedOrigins: prev.selectedOrigins.filter((o) => o !== origin),
          })),
      });
    });

    return list;
  }, [filters]);

  const loadMore = () => {
    setInfiniteCount((prev) => Math.min(prev + itemsPerPage, sortedProducts.length));
  };

  return (
    <>
      {/* Page Hero */}
      <PageHero
        eyebrow="The JANANI Pantry"
        title="Pure Organic Harvest Collection"
        copy="Explore single-origin cold-pressed oils, Vedic A2 bilona ghee, unpolished native millets, and farm-fresh spices cultivated with care across India."
      />

      {/* Category Pills Quick Scroll Strip */}
      <section className="border-b border-border bg-card/60 backdrop-blur-md py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, selectedCategories: [] }))
              }
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                filters.selectedCategories.length === 0
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Boxes className="size-3.5" />
              All Pantry ({products.length})
            </button>

            {categories.map((cat) => {
              const isSelected = filters.selectedCategories.includes(cat.name);
              const count = products.filter((p) => p.category === cat.name).length;
              return (
                <button
                  key={cat.slug}
                  onClick={() => {
                    setFilters((prev) => {
                      const exists = prev.selectedCategories.includes(cat.name);
                      return {
                        ...prev,
                        selectedCategories: exists
                          ? prev.selectedCategories.filter((c) => c !== cat.name)
                          : [cat.name], // select single category on quick strip
                      };
                    });
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="size-5 rounded-full object-cover"
                  />
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Shop Body */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <ShopFilterSidebar
            filters={filters}
            setFilters={setFilters}
            totalMatching={sortedProducts.length}
            isOpenMobile={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />

          {/* Right Product Grid Area */}
          <div className="flex-1 w-full space-y-6">
            {/* Top Toolbar */}
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Left: Product Counts & Mobile Trigger */}
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden flex items-center gap-2 rounded-xl text-xs font-bold"
                  onClick={() => setIsMobileFilterOpen(true)}
                >
                  <Filter className="size-4 text-brand-leaf" />
                  Filters
                  {activeFilters.length > 0 && (
                    <span className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                      {activeFilters.length}
                    </span>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground">
                  Showing{" "}
                  <strong className="text-foreground font-semibold">
                    {sortedProducts.length === 0
                      ? 0
                      : paginationMode === "infinite"
                      ? Math.min(infiniteCount, sortedProducts.length)
                      : Math.min((currentPage - 1) * itemsPerPage + 1, sortedProducts.length)}
                    –
                    {paginationMode === "infinite"
                      ? Math.min(infiniteCount, sortedProducts.length)
                      : Math.min(currentPage * itemsPerPage, sortedProducts.length)}
                  </strong>{" "}
                  of <strong className="text-foreground">{sortedProducts.length}</strong> harvests
                </div>
              </div>

              {/* Right: Search, Sorting, Layout Modes */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 sm:flex-initial sm:w-56">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                    }
                    placeholder="Search pantry..."
                    className="w-full h-9 rounded-xl border border-input bg-background pl-9 pr-8 text-xs outline-none focus:border-primary transition"
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

                {/* Sort Dropdown */}
                <div className="relative flex items-center">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="h-9 rounded-xl border border-input bg-background px-3 pr-8 text-xs font-semibold outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="featured">✨ Featured Harvest</option>
                    <option value="popularity">🔥 Popularity (Best Selling)</option>
                    <option value="newest">🌱 Newest First</option>
                    <option value="price_asc">💰 Price: Low to High</option>
                    <option value="price_desc">💎 Price: High to Low</option>
                    <option value="rating">⭐ Customer Rating (High)</option>
                    <option value="discount">🏷️ Highest Discount</option>
                  </select>
                  <ArrowUpDown className="absolute right-2.5 size-3.5 text-muted-foreground pointer-events-none" />
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center rounded-xl border border-input bg-background p-0.5">
                  <button
                    onClick={() => setViewMode("grid-4")}
                    className={`size-8 rounded-lg flex items-center justify-center transition ${
                      viewMode === "grid-4"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="4-Column Grid View"
                  >
                    <Grid2X2 className="size-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid-3")}
                    className={`size-8 rounded-lg flex items-center justify-center transition hidden sm:flex ${
                      viewMode === "grid-3"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="3-Column Luxe View"
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`size-8 rounded-lg flex items-center justify-center transition ${
                      viewMode === "list"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="List View"
                  >
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Strip */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Active Filters:
                </span>
                {activeFilters.map((af) => (
                  <button
                    key={af.key}
                    onClick={af.onRemove}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition group"
                  >
                    <span>{af.label}</span>
                    <X className="size-3.5 text-primary/70 group-hover:text-primary" />
                  </button>
                ))}
                <button
                  onClick={() => setFilters(initialFilterState)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-destructive hover:underline ml-2"
                >
                  <RotateCcw className="size-3" /> Clear All
                </button>
              </div>
            )}

            {/* Product Display Grid / List */}
            {paginatedProducts.length > 0 ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "list"
                    ? "grid-cols-1"
                    : viewMode === "grid-3"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                }`}
              >
                {paginatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    list={viewMode === "list"}
                    onQuickView={(prod) => setQuickViewProduct(prod)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="rounded-[2.5rem] border border-dashed border-border bg-card/60 p-12 text-center space-y-4">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <PackageX className="size-8 text-brand-leaf" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  No Matching Harvest Products Found
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  We couldn't find any products matching your current combination of filters. Try
                  loosening your price range, dietary tags, or clear the search query.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={() => setFilters(initialFilterState)}
                    className="rounded-full px-6 font-bold"
                  >
                    Reset All Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, selectedCategories: [] }))
                    }
                    className="rounded-full px-6"
                  >
                    View All Categories
                  </Button>
                </div>
              </div>
            )}

            {/* Bottom Toolbar: Pagination or Infinite Load More */}
            {sortedProducts.length > 0 && (
              <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Pagination Mode Toggle (Pages vs Infinite) */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Navigation Mode:</span>
                  <div className="flex rounded-xl border border-input bg-card p-0.5">
                    <button
                      onClick={() => setPaginationMode("pagination")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        paginationMode === "pagination"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Numbered Pages
                    </button>
                    <button
                      onClick={() => setPaginationMode("infinite")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        paginationMode === "infinite"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Infinite Load More
                    </button>
                  </div>
                </div>

                {/* Numbered Pagination UI */}
                {paginationMode === "pagination" && totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl px-3 text-xs font-bold"
                    >
                      <ChevronLeft className="size-4 mr-1" /> Prev
                    </Button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`size-8 rounded-xl text-xs font-bold font-mono transition ${
                              currentPage === pageNumber
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-xl px-3 text-xs font-bold"
                    >
                      Next <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </div>
                )}

                {/* Infinite Load More UI */}
                {paginationMode === "infinite" && (
                  <div>
                    {infiniteCount < sortedProducts.length ? (
                      <Button
                        onClick={loadMore}
                        className="rounded-full px-8 py-2 font-bold shadow-md"
                      >
                        Load More Harvest ({sortedProducts.length - infiniteCount} Remaining)
                      </Button>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Check className="size-4 text-emerald-600" /> You've reached the end of our current harvest catalog.
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Quick View Dialog Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}