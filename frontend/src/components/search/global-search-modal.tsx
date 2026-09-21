import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  X,
  Mic,
  Clock,
  Flame,
  Sparkles,
  ArrowRight,
  Boxes,
  Tag,
  Star,
  CornerDownLeft,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink
} from "lucide-react";
import { products, categories, type Product, getProductImage, pantryImage } from "@/lib/catalog";
import { VoiceSearchModal } from "@/components/search/voice-search-modal";
import { Button } from "@/components/ui/button";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const trendingQueries = [
  "Wood-Pressed Groundnut Oil",
  "Lakadong Turmeric",
  "Foxtail Millet",
  "Vedic A2 Cow Ghee",
  "Khapli Ancient Wheat",
  "Cold-Pressed Mustard Oil",
];

const aiHealthPrompts = [
  { prompt: "Diabetic friendly grains", query: "Foxtail Millet" },
  { prompt: "Heart healthy cooking oil", query: "Wood-Pressed Groundnut Oil" },
  { prompt: "High curcumin immunity booster", query: "Lakadong Turmeric" },
  { prompt: "Low gluten ancient wheat", query: "Khapli Wheat" },
];

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("janani_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via custom event or handler
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const saveSearchQuery = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem("janani_recent_searches", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("janani_recent_searches");
  };

  const removeRecentSearch = (itemToRemove: string) => {
    const updated = recentSearches.filter((item) => item !== itemToRemove);
    setRecentSearches(updated);
    localStorage.setItem("janani_recent_searches", JSON.stringify(updated));
  };

  const handleExecuteSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    saveSearchQuery(searchQuery);
    onClose();
    navigate({
      to: "/search",
      search: { q: searchQuery } as any,
    });
  };

  // Live Autocomplete Results
  const matchingProducts = useMemo(() => {
    if (!query.trim()) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.dietaryTags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 5);
  }, [query]);

  const matchingCategories = useMemo(() => {
    if (!query.trim()) return [];
    return categories
      .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3);
  }, [query]);

  const matchingBrands = useMemo(() => {
    if (!query.trim()) return [];
    const allBrands = [
      "Janani Pure Harvest",
      "Janani Vedic Reserve",
      "Janani Single-Origin",
      "Janani Wild Harvest",
    ];
    return allBrands
      .filter((b) => b.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2);
  }, [query]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/70 backdrop-blur-md">
        <div className="relative w-full max-w-2xl rounded-[2.5rem] bg-background border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Top Search Input Bar */}
          <div className="relative flex items-center px-6 py-4 border-b border-border">
            <Search className="size-5 text-brand-leaf shrink-0" />
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
              placeholder="Search organic oils, millets, Vedic staples or health benefits..."
              className="flex-1 bg-transparent px-4 text-sm sm:text-base outline-none text-foreground placeholder:text-muted-foreground font-medium"
            />

            <div className="flex items-center gap-1.5 shrink-0">
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              )}

              {/* Voice Search Trigger */}
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="rounded-full p-2 text-brand-leaf hover:bg-primary/10 hover:text-primary transition"
                title="Voice Search"
              >
                <Mic className="size-4.5" />
              </button>

              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted ml-1"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Results / Suggestions Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            {/* Live Autocomplete Matches (When typing) */}
            {query.trim() && (
              <div className="space-y-4">
                {/* 1. Category Quick Links */}
                {matchingCategories.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Boxes className="size-3.5 text-brand-leaf" /> Matching Categories
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {matchingCategories.map((c) => (
                        <Link
                          key={c.slug}
                          to="/categories/$slug"
                          params={{ slug: c.slug }}
                          onClick={onClose}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition"
                        >
                          <img src={c.image} alt={c.name} className="size-4 rounded-full object-cover" />
                          <span>{c.name}</span>
                          <span className="text-[10px] text-muted-foreground">({c.count})</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Brand Reserve Links */}
                {matchingBrands.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-brand-gold" /> Brand Reserves
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {matchingBrands.map((b) => (
                        <button
                          key={b}
                          onClick={() => handleExecuteSearch(b)}
                          className="rounded-full bg-brand-gold/10 border border-brand-gold/30 text-amber-800 px-3 py-1 text-xs font-semibold hover:bg-brand-gold/20 transition"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Matching Products List */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Products ({matchingProducts.length})
                  </span>

                  {matchingProducts.length > 0 ? (
                    <div className="space-y-2">
                      {matchingProducts.map((p) => (
                        <Link
                          key={p.id}
                          to="/products/$slug"
                          params={{ slug: p.slug }}
                          onClick={() => {
                            saveSearchQuery(p.name);
                            onClose();
                          }}
                          className="flex items-center justify-between p-2.5 rounded-2xl border border-border/70 bg-card hover:bg-muted/60 hover:border-primary/40 transition group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={getProductImage(p.name || p.category, p.image)}
                              alt={p.name}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = pantryImage;
                              }}
                              className="size-11 rounded-xl object-cover border border-border"
                            />
                            <div>
                              <p className="text-xs font-bold text-foreground group-hover:text-primary transition">
                                {p.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                <span>{p.category}</span>
                                <span>•</span>
                                <span className="text-foreground font-semibold">₹{p.price}</span>
                                <span>•</span>
                                <span className="flex items-center text-amber-500 font-bold">
                                  <Star className="size-2.5 fill-current mr-0.5" />
                                  {p.rating}
                                </span>
                              </div>
                            </div>
                          </div>

                          <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
                        </Link>
                      ))}

                      {/* View All Matches Button */}
                      <Button
                        onClick={() => handleExecuteSearch(query)}
                        className="w-full rounded-2xl h-11 text-xs font-bold mt-2"
                      >
                        View All Results for "{query}" <CornerDownLeft className="size-3.5 ml-1" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No direct product matches found for "{query}". Try pressing Enter to view all pantry items.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Default State (When query is empty) */}
            {!query.trim() && (
              <div className="space-y-6">
                {/* 1. Recent Searches (if any) */}
                {recentSearches.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Clock className="size-3.5 text-brand-leaf" /> Recent Searches
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[11px] font-semibold text-muted-foreground hover:text-destructive transition"
                      >
                        Clear History
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item) => (
                        <div
                          key={item}
                          className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground hover:border-primary transition group"
                        >
                          <button
                            onClick={() => handleExecuteSearch(item)}
                            className="mr-1.5 hover:text-primary"
                          >
                            {item}
                          </button>
                          <button
                            onClick={() => removeRecentSearch(item)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Remove"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Trending Searches */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Flame className="size-3.5 text-amber-500 fill-amber-500" /> Trending Harvests
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {trendingQueries.map((trend) => (
                      <button
                        key={trend}
                        onClick={() => handleExecuteSearch(trend)}
                        className="rounded-full border border-border bg-secondary/80 hover:bg-primary hover:text-primary-foreground px-3.5 py-1.5 text-xs font-medium text-foreground transition"
                      >
                        {trend}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. AI Smart Recommended Queries */}
                <div className="space-y-2.5 rounded-3xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="size-4" /> AI Health & Nutrition Recommendations
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {aiHealthPrompts.map((item) => (
                      <button
                        key={item.prompt}
                        onClick={() => handleExecuteSearch(item.query)}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card hover:bg-primary hover:text-primary-foreground transition text-left group"
                      >
                        <div>
                          <p className="text-xs font-bold text-foreground group-hover:text-primary-foreground">
                            "{item.prompt}"
                          </p>
                          <p className="text-[10px] text-muted-foreground group-hover:text-primary-foreground/80">
                            Suggests: {item.query}
                          </p>
                        </div>
                        <ArrowRight className="size-3.5 text-primary group-hover:text-primary-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Shortcuts Footer */}
          <div className="px-6 py-3 border-t border-border bg-muted/40 text-[11px] text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              Press <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] border border-border">Enter</kbd> to search
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] border border-border">Esc</kbd> to close
            </span>
          </div>
        </div>
      </div>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSearch={(spokenText) => {
          setQuery(spokenText);
          handleExecuteSearch(spokenText);
        }}
      />
    </>
  );
}
