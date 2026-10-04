import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useMemo, useState } from "react";
import {
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
import { categories, products, type Product } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";
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
});

function CategoryDetailPage() {
  const { slug } = Route.useParams();
  const { categories: storeCats, products: storeProds } = useStore();
  const allCats = storeCats && storeCats.length > 0 ? storeCats : categories;
  const allProds = storeProds && storeProds.length > 0 ? storeProds : products;
  const category = allCats.find((c) => c.slug === slug) ?? allCats[0];
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [list, setList] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-28 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-sm font-semibold text-muted-foreground">Loading category harvests...</p>
      </div>
    );
  }

  // Products matching this category
  const categoryProducts = useMemo(() => {
    let items = allProds.filter(
      (p) => p.category.toLowerCase() === category.name.toLowerCase()
    );
    if (items.length === 0) {
      items = allProds.filter(
        (p) =>
          p.category.toLowerCase().includes(category.name.toLowerCase()) ||
          category.name.toLowerCase().includes(p.category.toLowerCase())
      );
    }
    if (items.length === 0) {
      items = allProds.slice(0, 6);
    }

    // Search inside category
    if (query.trim()) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Availability
    if (inStockOnly) {
      items = items.filter((p) => p.inStock);
    }

    // Sorting
    return [...items].sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "discount") return b.discount - a.discount;
      return a.id - b.id;
    });
  }, [category, query, sort, inStockOnly, allProds]);

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5">
            <div>
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
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {category.description || `Certified biological and organic ${category.name.toLowerCase()} formulated for disease protection, balanced nutrition, and high yields.`}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="h-8 text-xs font-bold rounded-xl border-emerald-200 hover:bg-emerald-50">
                <Link to="/products">
                  All Products <ChevronRight className="size-3 ml-0.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Category Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap mr-1 hidden sm:inline">
              Categories:
            </span>
            {allCats.map((cat) => {
              const isSelected = cat.slug === category.slug;
              return (
                <Link
                  key={cat.slug}
                  to="/categories/$slug"
                  params={{ slug: cat.slug }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? "bg-emerald-700 text-white shadow-sm shadow-emerald-900/20 scale-[1.02]"
                      : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-emerald-50/50 hover:border-emerald-200"
                  }`}
                >
                  <Leaf className={`size-3 ${isSelected ? "text-amber-300" : "text-emerald-600"}`} />
                  {cat.name}
                </Link>
              );
            })}
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
            <p className="text-lg font-bold text-foreground">No products found matching "{query}"</p>
            <p className="text-xs text-muted-foreground">
              Try modifying your search keywords or explore other bio-input categories.
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

        {/* Other Categories Carousel Strip */}
        <section className="mt-20 border-t border-border pt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold font-display text-foreground">
                Explore Other Bio-Input Categories
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Discover biological crop protection, soil biostimulants, and organic plant nutrients.
              </p>
            </div>
            <Button asChild variant="ghost" className="text-xs font-bold text-primary">
              <Link to="/categories">
                View All Categories <ChevronRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto gap-4">
            {categories
              .filter((c) => c.slug !== category.slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  to="/categories/$slug"
                  params={{ slug: c.slug }}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-card shadow-soft hover:shadow-md hover:-translate-y-1 transition duration-300"
                >
                  <img
                    src={c.image}
                    alt={c.name}
                    className="size-16 rounded-xl object-cover group-hover:scale-105 transition duration-500 shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {c.name}
                    </h4>
                    <span className="text-[11px] text-brand-leaf font-semibold mt-0.5 block">
                      {c.count} formulations
                    </span>
                  </div>
                </Link>
              ))}
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
