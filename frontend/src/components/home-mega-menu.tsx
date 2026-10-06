import React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ArrowRight } from "lucide-react";
import { products as fallbackProducts, type Product } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HomeMegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const { products: storeProducts } = useStore();
  const rawProducts = storeProducts && storeProducts.length > 0 ? storeProducts : fallbackProducts;

  // Deduplicate products by slug
  const productList = React.useMemo(() => {
    const seen = new Set<string>();
    const list: Product[] = [];
    for (const p of rawProducts) {
      if (p.slug && !seen.has(p.slug)) {
        seen.add(p.slug);
        list.push(p);
      }
    }
    return list;
  }, [rawProducts]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute left-1/2 top-full -translate-x-1/2 pt-2 z-50 w-72 sm:w-80"
      role="menu"
      aria-orientation="vertical"
    >
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-white/98 dark:bg-[#0b1c12]/98 backdrop-blur-xl shadow-[0_20px_50px_-10px_rgba(7,91,50,0.25)] ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
        {/* Clean Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-cream/90 via-[#f4f7ee] to-cream/90 dark:from-[#112419] dark:to-[#0f2016] border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#4FAE2A] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#075B32] dark:text-[#4FAE2A]">
              Products
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#075B32]/10 text-[#075B32] dark:bg-[#4FAE2A]/20 dark:text-[#4FAE2A]">
            {productList.length} Items
          </span>
        </div>

        {/* Clean Products List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-border/30 py-1 scrollbar-thin">
          {productList.map((prod) => (
            <Link
              key={prod.id || prod.slug}
              to="/products/$slug"
              params={{ slug: prod.slug }}
              onClick={onClose}
              className="group flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-150 hover:bg-[#075B32]/10 dark:hover:bg-[#4FAE2A]/15"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="size-1.5 rounded-full bg-slate-300 group-hover:bg-[#075B32] group-hover:scale-125 dark:group-hover:bg-[#4FAE2A] transition-all shrink-0" />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100 group-hover:text-[#075B32] dark:group-hover:text-[#4FAE2A] transition-colors truncate">
                  {prod.name}
                </span>
              </div>
              <ChevronRight className="size-3.5 text-muted-foreground/40 group-hover:text-[#075B32] dark:group-hover:text-[#4FAE2A] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>
          ))}
        </div>

        {/* Bottom Link: View All Products */}
        <div className="p-2 bg-slate-50/90 dark:bg-[#0e1d14] border-t border-border/60">
          <Link
            to="/products"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-[#075B32] hover:bg-[#0B6B35] text-white text-xs font-bold shadow-xs transition-all duration-150 text-center"
          >
            <span>View All Products</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

