import { useState, useEffect } from "react";
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
  Gift,
  MapPin,
  Mail,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";
import jananiEmblem from "@/assets/janani-emblem.png";
import { StoreProvider, useStore } from "@/components/store-provider";
import { categories } from "@/lib/catalog";
import { Toaster } from "@/components/ui/sonner";
import { HomeMegaMenu } from "@/components/home-mega-menu";
import { GlobalSearchModal } from "@/components/search/global-search-modal";
import { CartDrawer } from "@/components/cart/cart-drawer";
import {
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  WhatsAppIcon
} from "@/components/ui/brand-icons";

const links = [
  ["Home", "/"],
  ["Categories", "/categories"],
  ["Products", "/products"],
  ["About", "/about"],
  ["Contact", "/contact"]
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Shell>{children}</Shell>
      <Toaster position="top-right" richColors closeButton duration={3500} />
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Automatically close mega menu and mobile menu whenever route changes
  useEffect(() => {
    setIsMegaMenuOpen(false);
    setMenu(false);
  }, [pathname]);

  if (isAdminRoute) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic Announcement Bar - Deep Gradient Forest Green with Gold Accents */}
      <div className="bg-gradient-to-r from-[#032613] via-[#064A29] to-[#032613] border-b border-[#D99A12]/25 h-8 sm:h-9 flex items-center overflow-hidden select-none">
        {/* Mobile View: Continuous Marquee Scrolling Ticker */}
        <div className="md:hidden w-full overflow-hidden whitespace-nowrap">
          <div className="animate-marquee flex items-center gap-6 text-[11px] font-medium text-emerald-100">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D99A12]/20 border border-[#F5B726]/40 text-[#F5B726] font-bold text-[10px]">
                <Sparkles className="size-3 fill-current" />
                PURE SOIL TO SOUL
              </span>
              <span className="text-white">"Nurturing Soil Health & Empowering Farmers for Sustainable Agriculture"</span>
            </span>
            <span className="text-[#F5B726]">•</span>
            <span className="text-emerald-200 font-semibold">100% Certified Biological Formulations</span>
            <span className="text-[#F5B726]">•</span>
            <span className="text-emerald-200 font-semibold">Direct Farm Support Across India</span>
            <span className="text-[#F5B726]">•</span>

            {/* Seamless duplicate loop for infinite single-line scroll */}
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D99A12]/20 border border-[#F5B726]/40 text-[#F5B726] font-bold text-[10px]">
                <Sparkles className="size-3 fill-current" />
                PURE SOIL TO SOUL
              </span>
              <span className="text-white">"Nurturing Soil Health & Empowering Farmers for Sustainable Agriculture"</span>
            </span>
            <span className="text-[#F5B726]">•</span>
            <span className="text-emerald-200 font-semibold">100% Certified Biological Formulations</span>
            <span className="text-[#F5B726]">•</span>
            <span className="text-emerald-200 font-semibold">Direct Farm Support Across India</span>
            <span className="text-[#F5B726]">•</span>
          </div>
        </div>

        {/* Desktop View: Side Aligned Single Line with Utility Links */}
        <div className="hidden md:flex w-full items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto text-xs font-medium text-emerald-100 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D99A12]/20 border border-[#F5B726]/40 text-[#F5B726] font-extrabold text-[10.5px] uppercase tracking-wider">
              <Sparkles className="size-3 fill-current" />
              PURE SOIL TO SOUL
            </span>
            <span className="text-white/95 font-medium">
              "Nurturing Soil Health, Empowering Farmers & Cultivating Sustainable Agriculture"
            </span>
            <span className="text-[#F5B726]">•</span>
            <span className="text-emerald-200 font-semibold">100% Certified Biological Formulations</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-emerald-200/90 font-medium">
            <a
              href="tel:+919311416225"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Phone className="size-3 text-[#F5B726]" />
              <span>Helpline: +91 93114 16225</span>
            </a>
            <span className="text-white/30">|</span>
            <Link to="/track-order" className="hover:text-white transition-colors flex items-center gap-1">
              <Truck className="size-3 text-[#F5B726]" />
              <span>Track Order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Main Header - Ultra-Luxe Elevated Frosted Design */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "border-b border-[#075B32]/15 bg-white/98 shadow-[0_12px_36px_-6px_rgba(7,91,50,0.12)] backdrop-blur-2xl py-2"
            : "border-b border-[#075B32]/10 bg-white/95 shadow-[0_4px_25px_-5px_rgba(7,91,50,0.06)] backdrop-blur-xl py-2.5 sm:py-3"
        }`}
        style={{ top: 0 }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Brand Logo with Ambient Halo */}
          <Brand />

          {/* Luxury Pill Navigation */}
          <nav className="hidden items-center justify-center gap-1.5 lg:flex" aria-label="Main navigation">
            {links.map(([label, to]) => {
              const hasDropdown = label === "Products";
              const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);

              return (
                <div
                  key={label}
                  className="relative py-1"
                  onMouseEnter={() => {
                    if (label === "Products") {
                      setIsMegaMenuOpen(true);
                    } else {
                      setIsMegaMenuOpen(false);
                    }
                  }}
                  onMouseLeave={() => {
                    if (label === "Products") {
                      setIsMegaMenuOpen(false);
                    }
                  }}
                >
                  <Link
                    to={to}
                    onClick={() => setIsMegaMenuOpen(false)}
                    className={`group relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13.5px] tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "text-[#075B32] font-black bg-[#F0F7ED] shadow-[inset_0_0_0_1px_rgba(7,91,50,0.14)]"
                        : "text-slate-700 font-bold hover:text-[#075B32] hover:bg-[#F4F8F1]"
                    }`}
                  >
                    {isActive && (
                      <span className="size-1.5 rounded-full bg-[#075B32] animate-pulse" />
                    )}
                    <span>{label}</span>
                    {hasDropdown && (
                      <ChevronDown
                        className={`size-3.5 transition-transform duration-200 group-hover:rotate-180 ${
                          isActive ? "text-[#075B32] stroke-[2.5]" : "text-slate-400 group-hover:text-[#075B32]"
                        }`}
                      />
                    )}
                  </Link>

                  {/* Products Dropdown List */}
                  {hasDropdown && (
                    <HomeMegaMenu
                      isOpen={isMegaMenuOpen}
                      onClose={() => setIsMegaMenuOpen(false)}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action Terminal: Quick Search Pill, Wishlist, Cart & Luxe Auth */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {/* Desktop Quick Search Pill */}
            <button
              type="button"
              onClick={() => setIsGlobalSearchOpen(true)}
              aria-label="Quick Search"
              title="Search products..."
              className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#075B32]/15 bg-[#F8FAF4] hover:bg-[#F0F7ED] hover:border-[#075B32]/35 text-slate-500 hover:text-[#075B32] transition-all duration-200 shadow-2xs group w-40 lg:w-48 text-left cursor-pointer"
            >
              <Search className="size-3.5 text-[#075B32]/75 group-hover:text-[#075B32] transition-colors" />
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 truncate">
                Search products...
              </span>
            </button>

            {/* Mobile/Compact Search Icon Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsGlobalSearchOpen(true)}
              aria-label="Quick Search"
              title="Search Products"
              className="md:hidden size-10 rounded-full text-[#075B32] hover:text-[#054324] hover:bg-[#F0F7ED]"
            >
              <Search className="size-4.5" />
            </Button>
            
            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative hidden sm:flex size-10 items-center justify-center rounded-full text-[#075B32] hover:text-[#054324] hover:bg-[#F0F7ED] transition-colors"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="size-4.5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#E7A91A] px-1 text-[9px] font-black text-[#075B32] shadow-xs ring-2 ring-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label="Open Shopping Cart"
              title="Shopping Cart"
              className="relative flex size-10 items-center justify-center rounded-full text-[#075B32] hover:text-[#054324] hover:bg-[#F0F7ED] transition-all cursor-pointer group"
            >
              <ShoppingBag className="size-4.5 group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gradient-to-r from-[#D99A12] to-[#E7A91A] px-1 text-[9px] font-black text-white shadow-xs ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Sign In */}
            {user ? (
              <Link
                to="/profile"
                className="ml-1.5 hidden items-center gap-2.5 rounded-full border border-[#075B32]/15 bg-[#F8FAF4] hover:bg-[#F0F7ED] py-1.5 pl-2 pr-3.5 shadow-2xs transition hover:border-[#075B32]/35 lg:inline-flex"
              >
                <div className="grid size-7 place-items-center rounded-full bg-gradient-to-tr from-[#D99A12] to-[#F5B726] text-[11px] font-black text-[#1E3A1E] shadow-2xs">
                  {user.name ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("") : "U"}
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-xs font-bold text-slate-800 truncate max-w-[105px]">
                    {user.name ? user.name.split(" ")[0] : "Account"}
                  </span>
                  <span className="block text-[9.5px] font-semibold text-[#075B32]">
                    My Account
                  </span>
                </div>
              </Link>
            ) : (
              <Button
                asChild
                className="ml-1.5 hidden lg:inline-flex rounded-full font-black text-xs h-9.5 px-5 shadow-[0_4px_14px_rgba(217,154,18,0.35)] hover:shadow-[0_6px_20px_rgba(217,154,18,0.45)] hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-[#D99A12] via-[#E7A91A] to-[#D99A12] hover:from-[#c98e10] hover:to-[#D99A12] text-[#1E3A1E] border border-[#FDE68A]/60 transition-all duration-200"
              >
                <Link to="/login" className="flex items-center gap-1.5 whitespace-nowrap">
                  <User className="size-3.5 stroke-[2.5]" />
                  <span>Sign In / Register</span>
                </Link>
              </Button>
            )}

            {/* Mobile Menu Trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden size-10 rounded-full text-[#075B32] hover:bg-[#F0F7ED]"
              onClick={() => setMenu(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
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
                    <p className="text-[11px] text-muted-foreground">{user.email || user.phone}</p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="text-xs h-8">
                  <Link to="/profile" onClick={() => setMenu(false)}>Profile</Link>
                </Button>
              </div>
            )}

            <nav className="mt-6 grid gap-1.5">
              {[...links, ["My Orders", "/orders"] as const, ["Profile Settings", "/profile"] as const, ["Track Order", "/track-order"] as const].map(([label, to]) => {
                const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
                return (
                  <Link
                    key={label}
                    to={to}
                    onClick={() => setMenu(false)}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition flex items-center justify-between ${
                      isActive
                        ? "bg-[#075B32] text-white font-bold shadow-md"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span>{label}</span>
                    {isActive && <span className="size-2 rounded-full bg-[#E7A91A] shadow-xs" />}
                  </Link>
                );
              })}
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
        className="fixed bottom-20 right-4 z-30 grid size-12 place-items-center rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl transition-all hover:scale-110 active:scale-95 md:bottom-6"
      >
        <WhatsAppIcon className="size-6" />
      </a>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-white/98 px-2 py-2 backdrop-blur-lg md:hidden shadow-lg">
        {[
          { Icon: Home, label: "Home", to: "/" },
          { Icon: Grid2X2, label: "Categories", to: "/categories" },
          { Icon: Heart, label: "Wishlist", to: "/wishlist" },
          { Icon: ShoppingBag, label: "Cart", to: "/cart" },
          { Icon: User, label: "Account", to: user ? "/profile" : "/login" },
        ].map(({ Icon, label, to }) => {
          const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 text-[10px] transition-all relative py-0.5 ${
                isActive
                  ? "text-[#075B32] font-black"
                  : "text-muted-foreground hover:text-foreground font-semibold"
              }`}
            >
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 bg-[#075B32] rounded-full shadow-xs" />
              )}
              <Icon className={`size-5 transition-transform ${isActive ? "scale-110 text-[#075B32] stroke-[2.5]" : ""}`} />
              <span>{label}</span>
            </Link>
          );
        })}
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
  const { categories: storeCategories } = useStore();
  const allCategories = storeCategories && storeCategories.length > 0 ? storeCategories : categories;

  const quickLinks: [string, string][] = [
    ["Home", "/"],
    ["Categories", "/categories"],
    ["Products", "/products"],
    ["About Us", "/about"],
    ["Contact Us", "/contact"]
  ];

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com",
      Icon: FacebookIcon,
      bgClass: "bg-[#1877F2] text-white hover:bg-[#166fe5] shadow-md hover:scale-110",
    },
    {
      name: "Instagram",
      href: "https://instagram.com",
      Icon: InstagramIcon,
      bgClass: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-md hover:scale-110",
    },
    {
      name: "YouTube",
      href: "https://youtube.com",
      Icon: YouTubeIcon,
      bgClass: "bg-[#FF0000] text-white hover:bg-[#e60000] shadow-md hover:scale-110",
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/919311416225",
      Icon: WhatsAppIcon,
      bgClass: "bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-md hover:scale-110",
    }
  ];

  return (
    <footer className="relative bg-[#064A29] text-white pt-10 sm:pt-12 pb-12 md:pb-6 overflow-hidden select-none">
      {/* Top Graceful Wavy Ribbon Curve */}
      <div className="absolute top-0 inset-x-0 overflow-hidden leading-none pointer-events-none -translate-y-[1px]">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-8 sm:h-10 text-[#064A29] fill-current"
        >
          <path
            d="M0,0 C150,60 350,-30 500,45 C650,110 900,10 1200,60 L1200,0 L0,0 Z"
            fill="#ffffff"
          />
          <path
            d="M0,45 C180,95 400,10 600,65 C850,120 1050,40 1200,75 L1200,0 L0,0 Z"
            fill="#D99A12"
            fillOpacity="0.45"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 pb-6 border-b border-[#0B6B35]/50">
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-3.5 bg-white rounded-2xl p-2.5 sm:p-3 pr-4 sm:pr-5 shadow-md border border-white/40 hover:shadow-lg transition-all group"
            >
              <img
                src={jananiEmblem}
                alt="JANANI AGRO PRODUCTS"
                className="size-12 sm:size-14 object-contain shrink-0 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="flex flex-col text-left">
                <span className="font-display text-sm sm:text-base font-black tracking-tight text-[#075B32] leading-tight">
                  JANANI AGRO
                </span>
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#D99A12]">
                  Products
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-[#0B6B35]/80 mt-0.5">
                  Pure Soil to Soul
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-[13px] leading-relaxed text-emerald-100/90 max-w-sm">
              Providing high-quality, natural and biological agro formulations for sustainable farming and a healthier tomorrow.
            </p>
            {/* Social Icons with Authentic Brand Colors */}
            <div className="flex items-center gap-2.5 pt-2">
              {socialLinks.map(({ name, href, Icon, bgClass }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  className={`size-8.5 rounded-full flex items-center justify-center transition-all duration-200 ${bgClass}`}
                >
                  <Icon className="size-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-[#E7A91A] uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map(([label, to]) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-xs sm:text-[13px] text-emerald-100/80 hover:text-[#E7A91A] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="size-1 rounded-full bg-[#4FAE2A] group-hover:bg-[#E7A91A] transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories (Dynamic from Admin) */}
          <div>
            <h3 className="text-sm font-bold text-[#E7A91A] uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {allCategories.slice(0, 6).map((cat) => (
                <li key={cat.id || cat.slug}>
                  <Link
                    to="/categories/$slug"
                    params={{ slug: cat.slug }}
                    className="text-xs sm:text-[13px] text-emerald-100/80 hover:text-[#E7A91A] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="size-1 rounded-full bg-[#4FAE2A] group-hover:bg-[#E7A91A] transition-colors" />
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/categories"
                  className="text-xs sm:text-[13px] font-bold text-[#E7A91A] hover:underline flex items-center gap-1.5 pt-1"
                >
                  <span>View All Categories ({allCategories.length}) →</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="text-sm font-bold text-[#E7A91A] uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-xs sm:text-[13px] text-emerald-100/90">
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 text-[#E7A91A] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  <strong className="text-white block font-semibold">Janani Agro Products</strong>
                  SUB PLOTS NO.2/1-10, REVENUE SURVEY NO.193, TAL. LODHIKA, LODHIKA GIDC, Gujarat - 360021
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 text-[#E7A91A] shrink-0" />
                <a href="tel:+919311416225" className="hover:text-[#E7A91A] transition-colors font-medium">
                  +91 9311416225
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-[#E7A91A] shrink-0" />
                <a href="mailto:jananiagroproducts@outlook.com" className="hover:text-[#E7A91A] transition-colors break-all">
                  jananiagroproducts@outlook.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="size-4 text-[#E7A91A] shrink-0" />
                <a href="https://www.jananiagroproducts.com" target="_blank" rel="noreferrer" className="hover:text-[#E7A91A] transition-colors">
                  www.jananiagroproducts.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-footer Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-300/70">
          <p>© 2026 Janani Agro Products. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-[#E7A91A] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#E7A91A] transition-colors">Terms & Conditions</Link>
            <span>•</span>
            <Link to="/about" className="hover:text-[#E7A91A] transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}