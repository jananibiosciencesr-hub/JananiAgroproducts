import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Package, Sparkles } from "lucide-react";
import { PageHero } from "@/components/page-kit";
import { Button } from "@/components/ui/button";
import { categories, products, getCategoryImage, pantryImage } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Product Categories — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Explore Janani Agro Products by category: Rice, Grains, Pulses, Spices, Oils, Seeds and Organic Fertilizers." },
      { property: "og:title", content: "Product Categories — JANANI AGRO PRODUCTS" },
    ],
  }),
  component: CategoriesIndexPage,
});

function CategoriesIndexPage() {
  const { categories: storeCats, products: storeProds } = useStore();
  const allCats = storeCats && storeCats.length > 0 ? storeCats : categories;
  const allProds = storeProds && storeProds.length > 0 ? storeProds : products;

  const agroCats = allCats.filter((c) =>
    ["biological-crop-protection", "organic-plant-nutrients", "soil-conditioners-biostimulants"].includes(c.slug?.toLowerCase()) ||
    c.name?.toLowerCase().includes("biological") ||
    c.name?.toLowerCase().includes("nutrient") ||
    c.name?.toLowerCase().includes("soil")
  );
  const displayCats = agroCats.length > 0 ? agroCats.slice(0, 3) : categories.slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow="Agricultural Bio-Inputs"
        title="Explore by Category"
        copy="Browse our scientifically formulated range of certified organic biological crop protection, plant nutrients, and soil conditioners."
      />

      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {displayCats.map((cat) => {
            const count = allProds.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase() || p.category.toLowerCase().includes(cat.slug.replace(/-/g, " "))).length;
            const catImg = getCategoryImage(cat.slug || cat.name, cat.image);
            return (
              <div
                key={cat.slug}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-luxe"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={catImg}
                    alt={cat.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/products/balavan.jpg";
                    }}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-forest/80 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground backdrop-blur-sm">
                    <Package className="size-3" />
                    {count > 0 ? `${count} items` : `${cat.count || 2} items`}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                      {cat.description || "Certified organic bio-input formulated for sustainable agriculture and peak crop yields."}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
                    <Link
                      to="/categories/$slug"
                      params={{ slug: cat.slug }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-leaf hover:text-primary transition-colors"
                    >
                      View Category <ChevronRight className="size-3.5" />
                    </Link>
                    <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
                      <Link to="/products">All Products</Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner */}
        <div className="mt-16 rounded-[2.5rem] bg-secondary/80 p-8 sm:p-12 text-center border border-border">
          <Sparkles className="mx-auto size-8 text-brand-gold" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">Looking for bulk agricultural or dealer orders?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
            We provide direct manufacturer supplies of certified bio-inputs, liquid formulations, and microbial cultures across India.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold">
              <Link to="/products">Shop All Products</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/services">Explore Services <ArrowRight className="size-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
