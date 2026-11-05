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
  ArrowRight
} from "lucide-react";
import { categories, products, getCategoryImage, isProductInCategory, isGroceryCategory, type Product } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";
import { getCategories } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { ProductQuickViewModal } from "@/components/shop/product-quick-view-modal";

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
    return rawCats.filter((cat: any) => !isGroceryCategory(cat));
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
    const found = allCats.find((c: any) => (c.slug || "").toLowerCase().trim() === slugLower) ||
      allCats.find((c: any) => (c.slug || "").toLowerCase().replace(/[^a-z0-9]/g, "") === slugNorm) ||
      allCats.find((c: any) => (c.name || "").toLowerCase().replace(/[^a-z0-9]/g, "") === slugNorm);
    return found || directCat || null;
  }, [allCats, slug, directCat]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [list, setList] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const otherCategoriesScrollRef = useRef<HTMLDivElement>(null);

  const scrollOtherCategories = (direction: "left" | "right") => {
    if (otherCategoriesScrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      otherCategoriesScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

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

    // Sorting
    return [...items].sort((a, b) => {
      if (sort === "low") return (a.price ?? 0) - (b.price ?? 0);
      if (sort === "high") return (b.price ?? 0) - (a.price ?? 0);
      if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sort === "discount") return (b.discount ?? 0) - (a.discount ?? 0);
      return String(a.id || "").localeCompare(String(b.id || ""));
    });
  }, [category, query, sort, inStockOnly, allProds]);

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

  return (
    <>
      {/* COMPACT CATEGORY HEADER & DIRECT PRODUCT DISPLAY */}
      <div className="border-b border-border/70 bg-gradient-to-b from-emerald-950/10 via-background to-background pt-4 pb-3 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
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

      {/* MAIN PRODUCTS SECTION — DIRECTLY DISPLAYED */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Controls Toolbar */}
        <div className="mb-6 rounded-2xl border border-border/80 bg-card p-3 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">
              Showing <strong className="text-foreground">{categoryProducts.length}</strong> available products
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Search Inside Category */}
            <div className="relative flex-1 sm:flex-initial sm:w-56">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search in ${category.name}...`}
                className="w-full h-9 rounded-xl border border-input bg-background pl-9 pr-4 text-xs outline-none focus:border-primary"
              />
            </div>

            {/* In Stock Toggle */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                inStockOnly
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-700"
                  : "bg-background border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              In Stock Only
            </button>

            {/* Sort Select */}
            <div className="relative flex items-center">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 rounded-xl border border-input bg-background px-3 pr-8 text-xs font-semibold outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Biggest Discount</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 size-3.5 text-muted-foreground pointer-events-none" />
            </div>

            {/* View Switcher */}
            <div className="flex items-center rounded-xl border border-input bg-background p-0.5">
              <button
                onClick={() => setList(false)}
                className={`size-8 rounded-lg flex items-center justify-center transition ${
                  !list ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid View"
              >
                <Grid2X2 className="size-4" />
              </button>
              <button
                onClick={() => setList(true)}
                className={`size-8 rounded-lg flex items-center justify-center transition ${
                  list ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                title="List View"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid — DIRECTLY RENDERED */}
        {categoryProducts.length > 0 ? (
          <div
            className={`grid ${
              list
                ? "grid-cols-1 gap-4"
                : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6"
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
            <p className="text-lg font-bold text-foreground">
              {query ? `No products found matching "${query}"` : `No products currently available in ${category.name}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {query
                ? "Try modifying your search keywords or explore other bio-input categories."
                : "New formulations and farm inputs will be listed here soon."}
            </p>
            <Button onClick={() => setQuery("")} className="mt-2 rounded-full" variant="outline">
              Clear Search
            </Button>
          </div>
        )}

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
                      className="group flex-none shrink-0 w-[225px] sm:w-[245px] snap-start flex items-center gap-3 p-3 sm:p-3.5 rounded-3xl border border-border/80 bg-white hover:border-[#075B32]/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="size-14 sm:size-16 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                        <img
                          src={cImg}
                          alt={c.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/images/categories/bio-fertilizers.jpg";
                          }}
                          className="size-full object-cover group-hover:scale-105 transition duration-300"
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

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}
