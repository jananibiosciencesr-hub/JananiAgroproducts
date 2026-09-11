import { Leaf } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="JANANI AGRO PRODUCTS home">
      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-brand-gold/40 bg-primary text-primary-foreground shadow-brand"><Leaf className="size-5" /></span>
      {!compact && <span className="min-w-0 leading-none"><strong className="block font-display text-lg tracking-wide text-primary">JANANI</strong><span className="mt-1 block truncate text-[9px] font-semibold tracking-[0.2em] text-muted-foreground">AGRO PRODUCTS</span></span>}
    </Link>
  );
}