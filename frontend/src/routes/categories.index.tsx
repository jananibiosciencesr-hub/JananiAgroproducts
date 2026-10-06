import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowRight,
  ChevronRight,
  Package,
  Sparkles,
  Search,
  X,
  Sprout,
  ShieldAlert,
  Layers,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, products, getCategoryImage } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Agri Products Categories — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content:
          "Explore Janani Agri Products by category: Bio Fertilizers, Bio Pesticides, Bio Fungicides, Bio Stimulants, Micro Nutrients, Insecticides, Fungicides, Botanical Extracts, Water Solubles, Agri Inputs and Others.",
      },
      { property: "og:title", content: "Agri Products Categories — JANANI AGRO PRODUCTS" },
    ],
  }),
  component: CategoriesIndexPage,
});

function CategoriesIndexPage() {
  const { categories: storeCats, products: storeProds } = useStore();
  const allCats = storeCats && storeCats.length > 0 ? storeCats : categories;
  const allProds = storeProds && storeProds.length > 0 ? storeProds : products;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const filterTags = [
    { id: "all", label: "All Categories" },
    { id: "bio", label: "Biologicals & Organic" },
    { id: "protection", label: "Crop Protection" },
    { id: "nutrition", label: "Nutrition & Solubles" },
  ];

  const filteredCategories = useMemo(() => {
    return allCats.filter((cat) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        cat.name.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q)) ||
        cat.slug.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedTag === "bio") {
        return (
          cat.slug.includes("bio") ||
          cat.slug.includes("botanical") ||
          cat.slug.includes("organic")
        );
      }
      if (selectedTag === "protection") {
        return (
          cat.slug.includes("pesticide") ||
          cat.slug.includes("fungicide") ||
          cat.slug.includes("insecticide")
        );
      }
      if (selectedTag === "nutrition") {
        return (
          cat.slug.includes("fertilizer") ||
          cat.slug.includes("nutrient") ||
          cat.slug.includes("stimulant") ||
          cat.slug.includes("soluble")
        );
      }

      return true;
    });
  }, [allCats, searchQuery, selectedTag]);

  return (
    <>
      {/* Compact Categories Header */}
      <div className="border-b border-border/70 bg-gradient-to-b from-[#075B32]/10 via-background to-background pt-6 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav
              className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-2"
              aria-label="Breadcrumb"
            >
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="size-3 text-muted-foreground/60" />
              <span className="text-[#075B32] font-bold">Categories</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Agri Products Categories</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#075B32]/10 text-[#075B32] font-bold font-mono">
                {allCats.length} Collections
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Certified bio-inputs, organic crop protection, stimulants, micronutrients, and water solubles manufactured for sustainable Indian agriculture.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-9 text-xs font-bold rounded-xl border-[#075B32]/30 text-[#075B32] hover:bg-[#075B32]/5 shadow-xs"
            >
              <Link to="/products">
                <span>View All Products</span>
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Search & Filter Pill Bar */}
        <div className="mx-auto max-w-7xl mt-5 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="h-9 w-full rounded-xl border border-input bg-white pl-9 pr-8 text-xs outline-none focus:border-[#075B32] focus:ring-1 focus:ring-[#075B32] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {filterTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedTag === tag.id
                    ? "bg-[#075B32] text-white shadow-xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-border/80 p-8 shadow-xs">
            <Layers className="size-10 mx-auto text-muted-foreground/60 mb-3" />
            <h3 className="font-bold text-base text-foreground">No Categories Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No categories match your search term "{searchQuery}". Try searching for bio, fertilizer, or stimulants.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag("all");
              }}
              variant="outline"
              size="sm"
              className="mt-4 rounded-xl text-xs font-bold"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((cat) => {
              const count = allProds.filter(
                (p) =>
                  p.category.toLowerCase() === cat.name.toLowerCase() ||
                  p.category.toLowerCase().includes(cat.slug.replace(/-/g, " "))
              ).length;
              const catImg = getCategoryImage(cat.slug || cat.name, cat.image);

              return (
                <div
                  key={cat.slug}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#075B32]/30"
                >
                  {/* Clickable Image Header */}
                  <Link
                    to="/categories/$slug"
                    params={{ slug: cat.slug }}
                    className="relative aspect-[4/3] overflow-hidden bg-muted block"
                  >
                    <img
                      src={catImg}
                      alt={cat.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/categories/bio-fertilizers.jpg";
                      }}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#075B32]/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm shadow-xs">
                      <Package className="size-3" />
                      {count > 0 ? `${count} Products` : `${cat.count || 2} Products`}
                    </span>
                  </Link>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <Link
                        to="/categories/$slug"
                        params={{ slug: cat.slug }}
                        className="block group-hover:text-[#075B32] transition-colors"
                      >
                        <h3 className="text-lg font-bold text-foreground tracking-tight">
                          {cat.name}
                        </h3>
                      </Link>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {cat.description ||
                          "Certified organic bio-input formulated for sustainable agriculture and peak crop yields."}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between pt-3.5 border-t border-border/60">
                      <Link
                        to="/categories/$slug"
                        params={{ slug: cat.slug }}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#075B32] hover:text-[#4FAE2A] transition-colors"
                      >
                        <span>Explore Category</span>
                        <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                      <Link
                        to="/products"
                        className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        All
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Callout Banner */}
        <div className="mt-16 rounded-[2.5rem] bg-gradient-to-br from-[#075B32]/10 via-[#075B32]/5 to-transparent p-8 sm:p-12 text-center border border-[#075B32]/20 shadow-xs">
          <Sparkles className="mx-auto size-8 text-[#E7A91A]" />
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-[#075B32]">
            Looking for Bulk Agricultural or Dealer Supply?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
            We provide direct manufacturer supplies of certified bio-inputs, liquid formulations, and microbial cultures across India with GST invoicing.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-[#075B32] hover:bg-[#064A29] text-white rounded-full font-bold px-6">
              <Link to="/products">Shop All Products</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-[#075B32]/30 text-[#075B32] font-semibold px-6">
              <Link to="/contact">
                <span>Contact Agronomist</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
