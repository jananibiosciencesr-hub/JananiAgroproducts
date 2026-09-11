import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/store-provider";
import type { Product } from "@/lib/catalog";

export function ProductCard({ product, list = false }: { product: Product; list?: boolean }) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  return (
    <article className={`group overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-luxe ${list ? "grid sm:grid-cols-[220px_1fr]" : ""}`}>
      <div className={`relative overflow-hidden bg-secondary ${list ? "aspect-[4/3] sm:aspect-auto" : "aspect-square"}`}>
        <img src={product.image} alt={product.name} loading="lazy" width={700} height={700} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{product.badge ?? "Organic"}</span>
        <Button variant="glass" size="icon" className="absolute right-3 top-3" onClick={() => toggleWishlist(product.id)} aria-label={`Save ${product.name}`}><Heart className={wishlist.includes(product.id) ? "fill-current text-destructive" : ""} /></Button>
      </div>
      <div className="flex flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-leaf">{product.category}</p>
        <Link to="/products/$slug" params={{ slug: product.slug }} className="mt-2 font-display text-xl font-semibold text-foreground transition hover:text-primary">{product.name}</Link>
        <div className="mt-2 flex items-center gap-1 text-brand-gold"><Star className="size-3.5 fill-current" /><span className="text-xs font-semibold text-foreground">{product.rating}</span><span className="text-xs text-muted-foreground">({product.reviews})</span></div>
        {list && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.description}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div><strong className="text-lg text-foreground">₹{product.price}</strong><span className="ml-2 text-xs text-muted-foreground line-through">₹{product.oldPrice}</span><span className="block text-xs text-muted-foreground">{product.unit}</span></div>
          <Button size="icon" onClick={() => addToCart(product.id)} aria-label={`Add ${product.name} to cart`}><ShoppingBag /></Button>
        </div>
      </div>
    </article>
  );
}