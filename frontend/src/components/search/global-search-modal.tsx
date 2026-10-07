import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X, ArrowRight } from "lucide-react";
import { products, type Product, getProductImage, pantryImage } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const popularSearches = [
  "Bio Fertilizers",
  "Bio Pesticides",
  "Neem Oil",
  "Bio Stimulants",
  "Bhumi Shakti",
  "Harit",
];

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const navigate = useNavigate();
  const { products: storeProducts } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Execute Search
  const handleExecuteSearch = (q: string) => {
    if (!q.trim()) return;
    onClose();
    navigate({
      to: "/search",
      search: { q: q.trim() },
    });
  };

  // Filter matching products
  const matchingProducts = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return allProducts
      .filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const catMatch = p.category?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        return nameMatch || catMatch || descMatch;
      })
      .slice(0, 6);
  }, [query, allProducts]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple Clean Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white">
          <Search className="size-5 text-[#075B32] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleExecuteSearch(query);
              }
            }}
            placeholder="Search products..."
            className="flex-1 bg-transparent text-sm sm:text-base outline-none text-slate-900 placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Clear text"
            >
              <X className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search Content */}
        <div className="max-h-[380px] overflow-y-auto p-3 scrollbar-thin">
          {/* 1. Results when typing */}
          {query.trim() ? (
            <div>
              {matchingProducts.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Products ({matchingProducts.length})
                  </div>
                  {matchingProducts.map((p) => (
                    <Link
                      key={p.id || p.slug}
                      to="/products/$slug"
                      params={{ slug: p.slug }}
                      onClick={onClose}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F0F7ED] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getProductImage(p.name || p.category, p.image)}
                          alt={p.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = pantryImage;
                          }}
                          className="size-10 rounded-lg object-cover border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#075B32] transition-colors truncate">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {p.category && (
                              <span className="text-[#075B32] font-semibold">{p.category}</span>
                            )}
                            {p.price && <span>• ₹{p.price}</span>}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-slate-300 group-hover:text-[#075B32] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </Link>
                  ))}

                  {/* Press Enter to see all */}
                  <button
                    type="button"
                    onClick={() => handleExecuteSearch(query)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-50 hover:bg-[#F0F7ED] text-xs font-bold text-[#075B32] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View all results for "{query}"</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  <p>No products found for "{query}".</p>
                  <button
                    type="button"
                    onClick={() => handleExecuteSearch(query)}
                    className="mt-2 text-xs font-bold text-[#075B32] hover:underline"
                  >
                    Search across all catalog items →
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* 2. Simple clean state when empty */
            <div className="py-3 px-2 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Popular Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      handleExecuteSearch(item);
                    }}
                    className="rounded-full bg-slate-100 hover:bg-[#F0F7ED] hover:text-[#075B32] text-slate-600 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
