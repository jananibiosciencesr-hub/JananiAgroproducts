import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  MessageCircle,
  Home,
  Grid2X2,
  Sparkles,
  Truck,
  Tag,
  Phone,
  LogOut,
  Package,
  Wallet,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";
import { StoreProvider, useStore } from "@/components/store-provider";
import { categories } from "@/lib/catalog";
import { Toaster, toast } from "sonner";
import { subscribeNewsletter } from "@/lib/api";
import { HomeMegaMenu } from "@/components/home-mega-menu";
import { GlobalSearchModal } from "@/components/search/global-search-modal";
import { CartDrawer } from "@/components/cart/cart-drawer";

const links = [
  ["Home", "/"],
  ["Products", "/products"],
  ["Categories", "/categories"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Journal", "/blog"],
  ["Contact", "/contact"]
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Shell>{children}</Shell>
      <Toaster position="top-right" richColors />
    </StoreProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { cartCount, wishlist, user, logoutUser } = useStore();

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic Announcement Ticker */}
      <div className="bg-forest px-4 py-2 text-center text-[11px] font-medium text-primary-foreground sm:text-xs flex items-center justify-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 text-brand-gold font-bold">
          <Sparkles className="size-3.5 fill-current" />
          FESTIVE HARVEST:
        </span>
        <span>Flat 20% OFF on Wood-Pressed Oils & Vedic Ghee with code <strong>HARVEST20</strong></span>
        <span className="hidden sm:inline text-brand-gold/60">•</span>
        <span className="hidden sm:inline">Complimentary delivery on orders above ₹799</span>
      </div>

      {/* Sticky Main Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-cream/90 backdrop-blur-xl">
        <div className="mx-auto grid h-20 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6">
          <Brand />
          
          <nav className="hidden items-center justify-center gap-6 xl:flex" aria-label="Main navigation">
            {links.map(([label, to]) => {
              const isCategoryOrProducts = label === "Categories" || label === "Products";

              return (
                <div
                  key={to}
                  className="relative py-2"
                  onMouseEnter={() => isCategoryOrProducts && setIsMegaMenuOpen(true)}
                >
                  <Link
                    to={to}
                    activeOptions={{ exact: to === "/" }}
                    activeProps={{ className: "text-primary font-bold" }}
                    className="group relative flex items-center gap-1 text-xs font-semibold text-foreground/75 transition hover:text-primary"
                  >
                    {label}
                    {isCategoryOrProducts && <ChevronDown className="size-3 text-muted-foreground transition group-hover:rotate-180" />}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand-gold transition-all group-hover:w-full" />
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsGlobalSearchOpen(true)}
              aria-label="Quick Search (Ctrl+K)"
              title="Search Pantry (Ctrl+K)"
            >
              <Search className="size-4" />
            </Button>
            
            <Button asChild variant="ghost" size="icon" className="relative hidden sm:inline-flex">
              <Link to="/wishlist" aria-label="Wishlist">
                <Heart className="size-4" />
                {wishlist.length > 0 && <Count value={wishlist.length} />}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label="Open Shopping Basket"
              title="Your Basket"
            >
              <ShoppingBag className="size-4" />
              {cartCount > 0 && <Count value={cartCount} />}
            </Button>
            
            {user && (
              <Link
                to="/wallet"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs font-bold shadow-xs"
                title="Janani Farm Wallet & Rewards"
              >
                <Wallet className="size-3.5 text-emerald-600" />
                <span>₹{user.walletBalance || 0}</span>
              </Link>
            )}

            {user ? (
              <Link
                to="/profile"
                className="ml-2 hidden items-center gap-2.5 rounded-2xl border border-border/80 bg-card/80 py-1.5 pl-2 pr-3.5 shadow-sm transition hover:border-primary/40 hover:bg-card lg:inline-flex"
              >
                <div className="grid size-7 place-items-center rounded-full bg-brand-gold text-[11px] font-bold text-forest">
                  {user.name ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("") : "U"}
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-xs font-semibold text-foreground truncate max-w-[90px]">{user.name ? user.name.split(" ")[0] : "Patron"}</span>
                  <span className="block text-[10px] font-medium text-emerald-600">₹{user.walletBalance || 0} Wallet</span>
                </div>
              </Link>
            ) : (
              <Button asChild variant="gold" className="ml-2 hidden lg:inline-flex rounded-xl font-semibold text-xs h-9">
                <Link to="/login">Sign In / Register</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setMenu(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>

        {/* Desktop Mega Menu */}
        <HomeMegaMenu
          isOpen={isMegaMenuOpen}
          onClose={() => setIsMegaMenuOpen(false)}
        />
      </header>

      {/* Mobile Drawer */}
      {menu && (
        <div className="fixed inset-0 z-50 bg-forest/40 backdrop-blur-sm" onClick={() => setMenu(false)}>
          <aside
            className="ml-auto flex h-full w-[88%] max-w-sm flex-col bg-cream p-6 shadow-luxe overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Brand />
              <Button variant="ghost" size="icon" onClick={() => setMenu(false)}>
                <X className="size-5" />
              </Button>
            </div>

            {user && (
              <div className="mt-6 rounded-2xl border border-border/80 bg-card p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-brand-gold text-xs font-bold text-forest">
                    {user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{user.name}</h4>
                    <p className="text-[11px] text-emerald-600 font-semibold">₹{user.walletBalance} Wallet Balance</p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="text-xs h-8">
                  <Link to="/profile" onClick={() => setMenu(false)}>Profile</Link>
                </Button>
              </div>
            )}

            <nav className="mt-6 grid gap-1">
              {[...links, ["Farm Wallet & Rewards", "/wallet"] as const, ["My Orders", "/orders"] as const, ["Profile Settings", "/profile"] as const, ["Track Order", "/track-order"] as const].map(([label, to]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenu(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-border">
              {user ? (
                <Button onClick={() => { logoutUser(); setMenu(false); }} variant="outline" className="w-full gap-2">
                  <LogOut className="size-4" /> Sign Out
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link to="/login" onClick={() => setMenu(false)}>Sign In / Register</Link>
                </Button>
              )}
            </div>
          </aside>
        </div>
      )}

      <main>{children}</main>
      
      <Footer />

      <a
        href="https://wa.me/919311416225"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-20 right-4 z-30 grid size-13 place-items-center rounded-full bg-brand-leaf text-primary-foreground shadow-luxe transition hover:-translate-y-1 md:bottom-6"
      >
        <MessageCircle />
      </a>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-cream/95 px-2 py-2 backdrop-blur-lg md:hidden">
        {[
          { Icon: Home, label: "Home", to: "/" },
          { Icon: Grid2X2, label: "Categories", to: "/categories" },
          { Icon: Heart, label: "Wishlist", to: "/wishlist" },
          { Icon: ShoppingBag, label: "Cart", to: "/cart" },
          { Icon: User, label: "Account", to: "/dashboard" },
        ].map(({ Icon, label, to }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 text-[9px] font-semibold text-muted-foreground"
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Global Quick Search Omnibar Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />

      {/* Global Slide-Out Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
    </div>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-brand-gold text-[9px] font-bold text-forest">
      {value}
    </span>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const res = await subscribeNewsletter(email);
      toast.success(res?.message || "Thank you for subscribing to harvest updates!");
      setEmail("");
    } catch {
      toast.success("Thank you for subscribing to harvest updates!");
      setEmail("");
    } finally {
      setSubscribing(false);
    }
  };

  const exploreLinks: [string, string][] = [
    ["About", "/about"],
    ["Products", "/products"],
    ["Services", "/services"],
    ["Journal", "/blog"]
  ];
  const careLinks: [string, string][] = [
    ["FAQs", "/faq"],
    ["Shipping", "/shipping-policy"],
    ["Returns", "/return-policy"],
    ["Privacy", "/privacy"]
  ];

  return (
    <footer className="mb-14 bg-forest text-primary-foreground md:mb-0">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Brand />
          <p className="mt-5 max-w-sm text-sm leading-7 text-primary-foreground/70">
            Nurturing Nature, Enriching Future. Premium agricultural produce, thoughtfully sourced from trusted Indian farms.
          </p>
        </div>
        <FooterLinks title="Explore" items={exploreLinks} />
        <FooterLinks title="Care" items={careLinks} />
        <div>
          <h3 className="font-sans text-sm font-semibold">Stay close to the farm</h3>
          <p className="mt-4 text-sm text-primary-foreground/65">
            Harvest notes, nourishing recipes and private offers.
          </p>
          <form className="mt-5 flex border-b border-primary-foreground/30 pb-2" onSubmit={handleSubscribe}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-primary-foreground/40"
              placeholder="Email address"
              type="email"
              aria-label="Email address"
            />
            <Button size="sm" variant="gold" disabled={subscribing}>
              {subscribing ? "..." : "Join"}
            </Button>
          </form>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 px-6 py-6 text-center text-xs text-primary-foreground/60">
        © 2026 JANANI AGRO PRODUCTS · Lodhika GIDC, Gujarat · +91 93114 16225
      </div>
    </footer>
  );
}

function FooterLinks({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <h3 className="font-sans text-sm font-semibold">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.map(([label, to]) => (
          <Link key={to} to={to} className="text-sm text-primary-foreground/65 transition hover:text-brand-gold">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}