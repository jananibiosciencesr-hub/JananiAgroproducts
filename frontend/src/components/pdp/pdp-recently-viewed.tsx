import React, { useEffect, useState } from "react";
import { Clock, Eye, Sparkles } from "lucide-react";
import { products, type Product } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

interface PdpRecentlyViewedProps {
  currentProductId: number;
}

export function PdpRecentlyViewed({ currentProductId }: PdpRecentlyViewedProps) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("janani_recently_viewed");
      let ids: number[] = stored ? JSON.parse(stored) : [];

      // Add current product to front of list without duplicates
      ids = [currentProductId, ...ids.filter((id) => id !== currentProductId)].slice(0, 10);
      localStorage.setItem("janani_recently_viewed", JSON.stringify(ids));

      // Filter out current product for the display list
      const otherIds = ids.filter((id) => id !== currentProductId);
      let items = otherIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p));

      // If user has viewed fewer than 4 other items, pad with popular suggestions
      if (items.length < 4) {
        const fallback = products
          .filter((p) => p.id !== currentProductId && !otherIds.includes(p.id))
          .slice(0, 4 - items.length);
        items = [...items, ...fallback];
      }

      setRecentProducts(items.slice(0, 4));
    } catch (e) {
      // Fallback
      setRecentProducts(products.filter((p) => p.id !== currentProductId).slice(0, 4));
    }
  }, [currentProductId]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf flex items-center gap-1.5">
            <Clock className="size-4 text-brand-leaf" /> Your Browsing History
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Recently Viewed Harvests
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recentProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
