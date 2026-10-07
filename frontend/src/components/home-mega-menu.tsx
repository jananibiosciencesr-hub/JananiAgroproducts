import React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
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
      className="absolute left-1/2 top-full -translate-x-1/2 pt-3 z-50 w-80 sm:w-96"
      role="menu"
      aria-orientation="vertical"
    >
      <div className="overflow-hidden rounded-3xl border border-[#075B32]/15 bg-white/98 backdrop-blur-2xl shadow-[0_25px_70px_-12px_rgba(7,91,50,0.22)] ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Luxury Header Banner */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#F0F7ED] via-[#F9FAF6] to-[#F0F7ED] border-b border-[#075B32]/10">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#075B32] text-white">
              <Sparkles className="size-3 text-[#F5B726] fill-current" />
            </span>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#075B32]">
                Biological Catalog
              </h4>
              <p className="text-[10px] font-semibold text-slate-500">
                100% Certified Crop Care
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#075B32]/10 text-[#075B32] border border-[#075B32]/15">
            {productList.length} Solutions
          </span>
        </div>

        {/* Clean Products List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100/80 py-1.5 scrollbar-thin">
          {productList.map((prod) => (
            <Link
              key={prod.id || prod.slug}
              to="/products/$slug"
              params={{ slug: prod.slug }}
              onClick={onClose}
              className="group flex items-center justify-between px-4 sm:px-5 py-2.5 text-left transition-all duration-150 hover:bg-[#F0F7ED]/70"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="size-2 rounded-full bg-slate-300 group-hover:bg-[#075B32] group-hover:scale-125 transition-all shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#075B32] transition-colors truncate block">
                    {prod.name}
                  </span>
                  {prod.category && (
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-600 transition-colors truncate block">
                      {prod.category}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="size-4 text-slate-300 group-hover:text-[#075B32] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>
          ))}
        </div>

        {/* Bottom Bar: View All Products */}
        <div className="p-3 bg-[#F9FAF6] border-t border-[#075B32]/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#075B32]">
            <ShieldCheck className="size-3.5 text-[#4FAE2A]" />
            <span>Govt. Certified</span>
          </div>

          <Link
            to="/products"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-full bg-gradient-to-r from-[#075B32] to-[#0B6B35] hover:from-[#054324] hover:to-[#075B32] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all duration-150"
          >
            <span>Explore All Products</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}


