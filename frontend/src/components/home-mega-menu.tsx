import React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
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
      className="absolute left-0 top-full pt-1.5 z-50 w-56 sm:w-60"
      role="menu"
      aria-orientation="vertical"
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl py-1 animate-in fade-in slide-in-from-top-1 duration-150">
        {/* All Products Option */}
        <div className="px-1">
          <Link
            to="/products"
            onClick={onClose}
            className="flex items-center justify-between px-3 py-2 text-xs font-bold text-[#075B32] hover:bg-[#F0F7ED] rounded-lg transition-colors"
          >
            <span>All Products</span>
            <ChevronRight className="size-3.5 text-[#075B32]" />
          </Link>
        </div>

        <div className="my-1 border-t border-slate-100" />

        {/* Clean Normal Product List */}
        <div className="max-h-72 overflow-y-auto px-1 space-y-0.5 scrollbar-thin">
          {productList.map((prod) => (
            <Link
              key={prod.id || prod.slug}
              to="/products/$slug"
              params={{ slug: prod.slug }}
              onClick={onClose}
              className="flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-[#075B32] hover:bg-[#F0F7ED] rounded-lg transition-colors"
            >
              <span className="truncate">{prod.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


