import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  ShieldCheck,
  MapPin,
  Leaf,
  Boxes
} from "lucide-react";
import { categories, products, type Product } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";
import { ProductCard } from "@/components/product-card";
import { PageHero } from "@/components/page-kit";
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
  }, [category, query, sort, inStockOnly]);

  return (
    <>
      <PageHero
        eyebrow="Single-Origin Category Collection"
        title={category.name}
        copy={`Pure, freshly processed and farm-sourced ${category.name.toLowerCase()} packaged with authentic purity in Gujarat.`}
        image={category.image}
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-primary-foreground/80">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link to="/categories" className="hover:underline">
            Categories
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-brand-gold">{category.name}</span>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Highlights Bar */}
        <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Leaf className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">100% Certified Organic</h4>
              <p className="text-[11px] text-muted-foreground">NPOP & Jaivik Bharat Verified</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:border-x sm:border-border sm:px-4">
            <div className="size-10 rounded-2xl bg-brand-gold/15 flex items-center justify-center text-amber-600">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Single Farm Provenance</h4>
              <p className="text-[11px] text-muted-foreground">Direct Farmer Profit Share</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Zero Preservatives</h4>
              <p className="text-[11px] text-muted-foreground">No artificial heat or chemical polish</p>
            </div>
          </div>
        </div>

        {/* Top Controls Toolbar */}
        <div className="mb-8 rounded-3xl border border-border bg-card p-4 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
              <Link to="/products">
                <ArrowLeft className="size-3.5 mr-1" /> All Pantry
              </Link>
            </Button>
            <span className="text-xs font-semibold text-muted-foreground">
              Showing <strong className="text-foreground">{categoryProducts.length}</strong> items in {category.name}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

        {/* Product Grid */}
        {categoryProducts.length > 0 ? (
          <div
            className={`grid gap-6 ${
              list
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
              Try modifying your search keywords or explore other pantry categories.
            </p>
            <Button onClick={() => setQuery("")} className="mt-2 rounded-full" variant="outline">
              Clear Search
            </Button>
          </div>
        )}

        {/* Other Categories Carousel Strip */}
        <section className="mt-20 border-t border-border pt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold font-display text-foreground">
                Explore More Harvest Categories
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Discover other organic pantry staples from our farm network.
              </p>
            </div>
            <Button asChild variant="ghost" className="text-xs font-bold text-primary">
              <Link to="/categories">
                View All Categories <ChevronRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories
              .filter((c) => c.slug !== category.slug)
              .slice(0, 6)
              .map((c) => (
                <Link
                  key={c.slug}
                  to="/categories/$slug"
                  params={{ slug: c.slug }}
                  className="group flex flex-col items-center text-center p-4 rounded-2xl border border-border bg-card shadow-soft hover:shadow-md hover:-translate-y-1 transition duration-300"
                >
                  <img
                    src={c.image}
                    alt={c.name}
                    className="size-16 rounded-full object-cover mb-3 group-hover:scale-105 transition duration-500"
                  />
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {c.name}
                  </h4>
                  <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    {c.count} items
                  </span>
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
