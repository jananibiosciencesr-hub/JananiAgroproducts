import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowRight,
  ChevronRight,
  Package,
  Sprout,
  ShieldAlert,
  Layers,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, products, getCategoryImage, isProductInCategory, isGroceryCategory } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Agricultural Input Categories — Bio Fertilizers, Pesticides & Stimulants | JANANI AGRO" },
      {
        name: "description",
        content:
          "Explore Janani Agri Products by category: Bio Fertilizers, Bio Pesticides, Bio Fungicides, Bio Stimulants, Micro Nutrients, Insecticides, Botanical Extracts, and Water Solubles. 100% genuine biological formulations for Indian agriculture.",
      },
      {
        name: "keywords",
        content:
          "agricultural input categories, bio fertilizers category, bio pesticides, bio fungicides, bio stimulants, micro nutrients, botanical extracts, neem oil, Janani Agro categories",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { property: "og:title", content: "Agricultural Input Categories — JANANI AGRO PRODUCTS" },
      {
        property: "og:description",
        content: "Explore certified biological crop protection, organic plant nutrients, and soil conditioners for sustainable farming.",
      },
      { property: "og:url", content: "https://jananiagroproducts.com/categories" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://jananiagroproducts.com/images/categories/bio-fertilizers.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Agricultural Input Categories — JANANI AGRO PRODUCTS" },
      {
        name: "twitter:description",
        content: "Certified biological crop protection and plant nutrition formulations.",
      },
      { name: "twitter:image", content: "https://jananiagroproducts.com/images/categories/bio-fertilizers.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://jananiagroproducts.com/categories" },
    ],
  }),
  component: CategoriesIndexPage,
});

function CategoriesIndexPage() {
  const { categories: storeCats, products: storeProds } = useStore();
  const rawCats = storeCats && storeCats.length > 0 ? storeCats : categories;
  const allCats = useMemo(() => {
    const forbiddenKeys = [
      "termeric",
      "cat-termeric",
      "turmeric",
      "cat-turmeric",
      "biological-crop-protection",
      "cat-biological-crop-protection",
      "organic-plant-nutrients",
      "cat-organic-plant-nutrients",
      "soil-conditioners-biostimulants",
      "cat-soil-conditioners-biostimulants",
      "fungs",
      "cat-fungs",
      "pestocides",
      "cat-pestocides"
    ];
    const hasUserOther = rawCats.some((c: any) => {
      const s = (c.slug || "").toLowerCase().trim();
      const n = (c.name || "").toLowerCase().trim();
      return (s === "other-categories" || n === "other categories") && !c.deleted_at && !c.deletedAt && c.active !== 0 && c.active !== false && c.active !== "0";
    });
    const seen = new Set<string>();
    const filtered = rawCats.filter((cat: any) => {
      if (cat.deleted_at || cat.deletedAt || cat.active === 0 || cat.active === false || cat.active === "0") {
        return false;
      }
      const n = (cat.name || "").toLowerCase().trim();
      const s = (cat.slug || "").toLowerCase().trim();
      const id = (cat.id || "").toString().toLowerCase().trim();

      if (forbiddenKeys.some((b) => s === b || id === b || n === b)) return false;

      if (isGroceryCategory(cat)) {
        return false;
      }

      // If user created 'Other Categories', drop any redundant duplicate 'Other' or 'Others'
      if (hasUserOther && (s === "other" || s === "others" || n === "other" || n === "others" || id === "cat-other")) {
        return false;
      }

      const isOther = s.includes("other") || n.includes("other");
      if (isOther) {
        if (seen.has("deduped-other-category-card")) return false;
        seen.add("deduped-other-category-card");
      }

      const dedupeKey = id || s || n;
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    });

    return filtered.length > 0 ? filtered : categories;
  }, [rawCats]);
  const allProds = storeProds && storeProds.length > 0 ? storeProds : products;

  return (
    <>
      {/* Compact Categories Header */}
      <div className="border-b border-border/70 bg-gradient-to-b from-[#075B32]/10 via-background to-background pt-3 pb-3 sm:pt-6 sm:pb-5 px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] 3xl:max-w-[1720px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <nav
                className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1.5"
                aria-label="Breadcrumb"
              >
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
                <ChevronRight className="size-3 text-muted-foreground/60" />
                <span className="text-[#075B32] font-bold">Categories</span>
              </nav>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2.5">
                <span>Agri Products Categories</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#075B32]/10 text-[#075B32] font-bold font-mono">
                  {allCats.length} Collections
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-none text-left lg:whitespace-nowrap hyphens-none">
                Discover biological crop protection, soil biostimulants, and organic plant nutrients.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 mt-2 md:mt-0">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-9 text-xs font-bold rounded-xl border-[#075B32]/30 text-[#075B32] hover:bg-[#075B32]/5 shadow-xs shrink-0"
              >
                <Link to="/products">
                  <span>View All Products</span>
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid (Restored Large Card Layout) */}
      <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] 3xl:max-w-[1720px] px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8">
        {allCats.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-border/80 p-8 shadow-xs">
            <Layers className="size-10 mx-auto text-muted-foreground/60 mb-3" />
            <h3 className="font-bold text-base text-foreground">No Categories Available</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Please check back shortly or explore our full product catalog directly.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-4 rounded-xl text-xs font-bold"
            >
              <Link to="/products">View All Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-5">
            {allCats.map((cat) => {
              const count = allProds.filter((p: any) => isProductInCategory(p, cat)).length;
              const catImg = (cat.image && typeof cat.image === "string" && cat.image.trim().length > 0)
                ? getCategoryImage(cat.slug || cat.name, cat.image)
                : getCategoryImage(cat.slug || cat.name);

              return (
                <div
                  key={cat.slug}
                  data-card="category"
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-white shadow-soft transition-all duration-300 hover:shadow-xl hover:border-[#075B32]/30"
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
                      className="h-full w-full object-cover transition duration-700 group-"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#075B32]/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm shadow-xs">
                      <Package className="size-3" />
                      {count > 0 ? `${count} Products` : `${cat.count || 0} Products`}
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
                        <ChevronRight className="size-3.5" />
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
      </div>
    </>
  );
}
