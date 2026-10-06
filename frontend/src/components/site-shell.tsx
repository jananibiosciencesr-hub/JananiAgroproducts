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
import jananiLogo from "@/assets/janani-agro-logo.png";
import { StoreProvider, useStore } from "@/components/store-provider";
import { categories } from "@/lib/catalog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/api";
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
  ["About Us", "/about"],
  ["Products", "/products"],
  ["Categories", "/categories"],
  ["Contact Us", "/contact"]
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
      {/* Dynamic Announcement Bar - SINGLE LINE ON ALL SCREENS */}
      <div className="bg-[#075B32] border-b border-[#0B6B35] h-8 sm:h-9 flex items-center overflow-hidden select-none">
        {/* Mobile View: Continuous Marquee Scrolling Ticker in a SINGLE LINE */}
        <div className="md:hidden w-full overflow-hidden whitespace-nowrap">
          <div className="animate-marquee flex items-center gap-6 text-[11px] font-medium text-white">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[#E7A91A] font-bold">
                <Sparkles className="size-3 fill-current" />
                KHARIF & RABI BIO-CARE:
              </span>
              <span>Flat ₹250 OFF with code <strong className="text-[#E7A91A] font-bold">ORGANIC250</strong></span>
            </span>
            <span className="text-[#E7A91A]/60">•</span>
            <span className="text-white/90">Free Farm Delivery Above ₹999</span>
            <span className="text-[#E7A91A]/60">•</span>
            <span className="text-white/90">100% Genuine Biological Inputs</span>
            <span className="text-[#E7A91A]/60">•</span>

            {/* Seamless duplicate loop for infinite single-line scroll */}
            <span className="inline-flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[#E7A91A] font-bold">
                <Sparkles className="size-3 fill-current" />
                KHARIF & RABI BIO-CARE:
              </span>
              <span>Flat ₹250 OFF with code <strong className="text-[#E7A91A] font-bold">ORGANIC250</strong></span>
            </span>
            <span className="text-[#E7A91A]/60">•</span>
            <span className="text-white/90">Free Farm Delivery Above ₹999</span>
            <span className="text-[#E7A91A]/60">•</span>
            <span className="text-white/90">100% Genuine Biological Inputs</span>
            <span className="text-[#E7A91A]/60">•</span>
          </div>
        </div>

        {/* Desktop View: Centered Static Single Line */}
        <div className="hidden md:flex w-full items-center justify-center gap-2 px-4 text-xs font-medium text-white whitespace-nowrap overflow-hidden">
          <span className="flex items-center gap-1 text-[#E7A91A] font-bold">
            <Sparkles className="size-3.5 fill-current" />
            KHARIF & RABI BIO-CARE:
          </span>
          <span>Flat ₹250 OFF on Certified Biological Crop Protection & Bio-Nutrients with code <strong className="text-[#E7A91A]">ORGANIC250</strong></span>
          <span className="text-[#E7A91A]/60">•</span>
          <span className="text-white/90">Complimentary direct farm delivery on orders above ₹999</span>
        </div>
      </div>

      {/* Sticky Main Header - Pure White (#FFFFFF) */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "border-b border-[#0B6B35]/30 bg-white/98 shadow-md backdrop-blur-xl"
            : "border-b border-[#0B6B35]/20 bg-white/95 backdrop-blur-xl shadow-xs"
        }`}
        style={{ top: 0 }}
        onMouseLeave={() => setIsMegaMenuOpen(false)}
      >
        <div className="mx-auto grid h-16 sm:h-18 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6">
          <Brand />
          
          <nav className="hidden items-center justify-center gap-6 lg:flex" aria-label="Main navigation">
            {links.map(([label, to]) => {
              const hasDropdown = label === "Products" || label === "Categories";
              const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);

              return (
                <div
                  key={label}
                  className="relative py-2"
                  onMouseEnter={() => {
                    if (label === "Products" || label === "Categories") {
                      setIsMegaMenuOpen(true);
                    } else {
                      setIsMegaMenuOpen(false);
                    }
                  }}
                >
                  <Link
                    to={to}
                    onClick={() => setIsMegaMenuOpen(false)}
                    className={`group relative flex items-center gap-1.5 py-1 text-sm tracking-tight transition-all duration-200 ${
                      isActive
                        ? "text-[#075B32] font-black"
                        : "text-[#075B32]/75 hover:text-[#075B32] font-bold"
                    }`}
                  >
                    <span>{label}</span>
                    {hasDropdown && (
                      <ChevronDown
                        className={`size-3.5 transition-transform duration-200 group-hover:rotate-180 ${
                          isActive ? "text-[#075B32] stroke-[2.5]" : "text-[#0B6B35]/70"
                        }`}
                      />
                    )}
                    {/* Active tab bottom indicator bar */}
                    <span
                      className={`absolute -bottom-1.5 left-0 h-[3px] rounded-full transition-all duration-300 ${
                        isActive
                          ? "w-full bg-[#075B32] shadow-sm"
                          : "w-0 bg-[#4FAE2A] group-hover:w-full opacity-80"
                      }`}
                    />
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsGlobalSearchOpen(true)}
              aria-label="Quick Search (Ctrl+K)"
              title="Search Products (Ctrl+K)"
              className="text-[#075B32] hover:text-[#4FAE2A] hover:bg-[#F8FAEE]"
            >
              <Search className="size-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative text-[#075B32] hover:text-[#4FAE2A] hover:bg-[#F8FAEE]"
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label="Open Shopping Cart"
              title="Shopping Cart"
            >
              <ShoppingBag className="size-4" />
              {cartCount > 0 && <Count value={cartCount} />}
            </Button>



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
              <Button asChild variant="gold" className="ml-2 hidden lg:inline-flex rounded-xl font-semibold text-xs h-9 whitespace-nowrap shrink-0">
                <Link to="/login" className="whitespace-nowrap">Sign In / Register</Link>
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
  const quickLinks: [string, string][] = [
    ["Home", "/"],
    ["About Us", "/about"],
    ["Products", "/products"],
    ["Categories", "/categories"],
    ["Contact Us", "/contact"]
  ];

  const productLinks: [string, string][] = [
    ["HARIT", "/products/harit-trichoderma-viride-liquid-biofungal-formulation-1l"],
    ["Bhumi Shakti", "/products/bhumi-shakti-humic-fulvic-biostimulant-5l"],
    ["Neem Oil", "/products/neem-oil-1000-ppm-azadirachtin-1l"],
    ["Plant Growth Promoters", "/categories/organic-plant-nutrients"],
    ["Soil Conditioners", "/categories/soil-conditioners-biostimulants"],
    ["All Products", "/products"]
  ];

  return (
    <footer className="relative bg-[#064A29] text-white pt-6 pb-12 md:pb-6 overflow-hidden select-none">
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 pb-6 border-b border-[#0B6B35]/50">
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="inline-block group">
              <img
                src={jananiLogo}
                alt="JANANI AGRO PRODUCTS"
                className="h-16 w-auto object-contain drop-shadow-md brightness-110"
              />
            </Link>
            <p className="text-xs sm:text-[13px] leading-relaxed text-emerald-100/80 max-w-sm">
              Providing high-quality, natural and effective agro products for sustainable farming and a healthier tomorrow.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              {[
                { name: "Facebook", href: "https://facebook.com", Icon: FacebookIcon, hoverClass: "hover:bg-[#1877F2] hover:border-[#1877F2]" },
                { name: "Instagram", href: "https://instagram.com", Icon: InstagramIcon, hoverClass: "hover:bg-[#E4405F] hover:border-[#E4405F]" },
                { name: "YouTube", href: "https://youtube.com", Icon: YouTubeIcon, hoverClass: "hover:bg-[#FF0000] hover:border-[#FF0000]" },
                { name: "WhatsApp", href: "https://wa.me/919311416225", Icon: WhatsAppIcon, hoverClass: "hover:bg-[#25D366] hover:border-[#25D366]" }
              ].map(({ name, href, Icon, hoverClass }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  className={`size-8 rounded-full bg-[#075B32] border border-[#0B6B35] text-emerald-100 hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs ${hoverClass}`}
                >
                  <Icon className="size-4" />
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

          {/* Column 3: Our Products */}
          <div>
            <h3 className="text-sm font-bold text-[#E7A91A] uppercase tracking-wider mb-4">
              Our Products
            </h3>
            <ul className="space-y-2.5">
              {productLinks.map(([label, to]) => (
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