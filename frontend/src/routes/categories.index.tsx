import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, products, getCategoryImage, pantryImage } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Agri Products Categories — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Explore Janani Agri Products by category: Bio Fertilizers, Bio Pesticides, Bio Fungicides, Bio Stimulants, Micro Nutrients, Insecticides, Fungicides, Botanical Extracts, Water Solubles, Agri Inputs and Others." },
      { property: "og:title", content: "Agri Products Categories — JANANI AGRO PRODUCTS" },
    ],
  }),
  component: CategoriesIndexPage,
});

function CategoriesIndexPage() {
  const { categories: storeCats, products: storeProds } = useStore();
  const allCats = storeCats && storeCats.length > 0 ? storeCats : categories;
  const allProds = storeProds && storeProds.length > 0 ? storeProds : products;
  const displayCats = allCats;

  return (
    <>
      {/* Compact Categories Header */}
      <div className="border-b border-border/70 bg-gradient-to-b from-emerald-950/10 via-background to-background pt-5 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1.5" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="size-3 text-muted-foreground/60" />
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Agri Products</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Agri Products Categories
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              Certified bio-inputs, organic crop protection, stimulants, micronutrients, and water solubles.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="self-start sm:self-center h-8 text-xs font-bold rounded-xl border-emerald-200 hover:bg-emerald-50">
            <Link to="/products">View All Products <ArrowRight className="size-3 ml-1" /></Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mx-auto">
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
