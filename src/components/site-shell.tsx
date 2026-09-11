import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X, MessageCircle, Home, Grid2X2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";
import { StoreProvider, useStore } from "@/components/store-provider";
import { categories } from "@/lib/catalog";
import { Toaster } from "@/components/ui/sonner";

const links = [["Home", "/"], ["About", "/about"], ["Products", "/products"], ["Categories", "/categories"], ["Services", "/services"], ["Journal", "/blog"], ["Contact", "/contact"]] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  return <StoreProvider><Shell>{children}</Shell><Toaster position="top-right" richColors /></StoreProvider>;
}

function Shell({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState(false);
  const { cartCount, wishlist } = useStore();
  return <div className="min-h-screen bg-background">
    <div className="bg-forest px-4 py-2 text-center text-[11px] font-medium text-primary-foreground sm:text-xs">Complimentary delivery on orders above ₹799 <span className="mx-2 text-brand-gold">•</span> Farm fresh, every day</div>
    <header className="sticky top-0 z-40 border-b border-border/60 bg-cream/90 backdrop-blur-xl">
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6">
        <Brand />
        <nav className="hidden items-center justify-center gap-5 xl:flex" aria-label="Main navigation">
          {links.map(([label, to]) => <Link key={to} to={to} activeOptions={{ exact: to === "/" }} activeProps={{ className: "text-primary" }} className="group relative text-xs font-semibold text-foreground/75 transition hover:text-primary">{label}{label === "Products" && <ChevronDown className="ml-1 inline size-3" />}<span className="absolute -bottom-2 left-0 h-px w-0 bg-brand-gold transition-all group-hover:w-full" /></Link>)}
        </nav>
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon"><Link to="/search" aria-label="Search"><Search /></Link></Button>
          <Button asChild variant="ghost" size="icon" className="relative hidden sm:inline-flex"><Link to="/wishlist" aria-label="Wishlist"><Heart />{wishlist.length > 0 && <Count value={wishlist.length} />}</Link></Button>
          <Button asChild variant="ghost" size="icon" className="relative"><Link to="/cart" aria-label="Cart"><ShoppingBag />{cartCount > 0 && <Count value={cartCount} />}</Link></Button>
          <Button asChild variant="outline" className="ml-2 hidden lg:inline-flex"><Link to="/login">Login</Link></Button>
          <Button asChild variant="gold" className="hidden lg:inline-flex"><Link to="/become-distributor">Become a dealer</Link></Button>
          <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setMenu(true)} aria-label="Open menu"><Menu /></Button>
        </div>
      </div>
      <div className="group absolute left-0 right-0 top-full hidden border-t border-border bg-cream p-8 shadow-luxe xl:[header:has(a[href='/products']:hover)_&]:block hover:block">
        <div className="mx-auto grid max-w-6xl grid-cols-5 gap-5">{categories.map((cat) => <Link key={cat.slug} to="/categories/$slug" params={{ slug: cat.slug }} className="text-sm font-medium text-foreground/80 hover:text-primary">{cat.name}</Link>)}</div>
      </div>
    </header>
    {menu && <div className="fixed inset-0 z-50 bg-forest/40 backdrop-blur-sm" onClick={() => setMenu(false)}><aside className="ml-auto flex h-full w-[88%] max-w-sm flex-col bg-cream p-6 shadow-luxe" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><Brand /><Button variant="ghost" size="icon" onClick={() => setMenu(false)}><X /></Button></div><nav className="mt-10 grid gap-1">{[...links, ["Track Order", "/track-order"] as const].map(([label, to]) => <Link key={to} to={to} onClick={() => setMenu(false)} className="rounded-2xl px-4 py-3 text-base font-semibold hover:bg-secondary">{label}</Link>)}</nav><Button asChild className="mt-auto"><Link to="/login">My account</Link></Button></aside></div>}
    <main>{children}</main>
    <Footer />
    <a href="https://wa.me/919311416225" aria-label="Chat on WhatsApp" className="fixed bottom-20 right-4 z-30 grid size-13 place-items-center rounded-full bg-brand-leaf text-primary-foreground shadow-luxe transition hover:-translate-y-1 md:bottom-6"><MessageCircle /></a>
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-cream/95 px-2 py-2 backdrop-blur-lg md:hidden">{[[Home,"Home","/"],[Grid2X2,"Categories","/categories"],[Heart,"Wishlist","/wishlist"],[ShoppingBag,"Cart","/cart"],[User,"Account","/dashboard"]].map(([Icon,label,to]) => <Link key={String(label)} to={String(to)} className="flex flex-col items-center gap-1 text-[9px] font-semibold text-muted-foreground"><Icon className="size-5" />{String(label)}</Link>)}</nav>
  </div>;
}

function Count({ value }: { value: number }) { return <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-brand-gold text-[9px] font-bold text-forest">{value}</span>; }

function Footer() { return <footer className="mb-14 bg-forest text-primary-foreground md:mb-0"><div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]"><div><Brand /><p className="mt-5 max-w-sm text-sm leading-7 text-primary-foreground/70">Nurturing Nature, Enriching Future. Premium agricultural produce, thoughtfully sourced from trusted Indian farms.</p></div><FooterLinks title="Explore" items={[["About","/about"],["Products","/products"],["Services","/services"],["Journal","/blog"]]} /><FooterLinks title="Care" items={[["FAQs","/faq"],["Shipping","/shipping-policy"],["Returns","/return-policy"],["Privacy","/privacy"]]} /><div><h3 className="font-sans text-sm font-semibold">Stay close to the farm</h3><p className="mt-4 text-sm text-primary-foreground/65">Harvest notes, nourishing recipes and private offers.</p><form className="mt-5 flex border-b border-primary-foreground/30 pb-2" onSubmit={(e) => e.preventDefault()}><input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-primary-foreground/40" placeholder="Email address" type="email" aria-label="Email address"/><Button size="sm" variant="gold">Join</Button></form></div></div><div className="border-t border-primary-foreground/10 px-6 py-6 text-center text-xs text-primary-foreground/60">© 2026 JANANI AGRO PRODUCTS · Lodhika GIDC, Gujarat · +91 93114 16225</div></footer>; }
function FooterLinks({ title, items }: { title: string; items: string[][] }) { return <div><h3 className="font-sans text-sm font-semibold">{title}</h3><div className="mt-4 grid gap-3">{items.map(([label,to]) => <Link key={to} to={to} className="text-sm text-primary-foreground/65 transition hover:text-brand-gold">{label}</Link>)}</div></div>; }