import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  ChevronRight,
  HeartHandshake,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sprout,
  Star,
  Truck,
  Sparkles,
  Search,
  Flame,
  Clock,
  Gift,
  CheckCircle2,
  Copy,
  ChevronLeft,
  ShoppingBag,
  Heart,
  Droplet,
  Milk,
  Wheat,
  CookingPot,
  Instagram,
  Send,
  Check,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/page-kit";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { ShopByCrop } from "@/components/home/shop-by-crop";
import { ShopByDisease } from "@/components/home/shop-by-disease";
import {
  categories,
  faqs,
  heroImage,
  pantryImage,
  posts,
  products,
  services,
  storyImage,
  testimonials,
  getCategoryImage,
  getProductImage,
  type Product
} from "@/lib/catalog";
import { useStore } from "@/components/store-provider";
import { HomeFlashSale } from "@/components/home-flash-sale";
import {
  getHomepageCms,
  subscribeNewsletter,
  type HomepageCmsData,
  type HeroBanner
} from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JANANI AGRO PRODUCTS — 100% Certified Pure Organic Harvest" },
      { name: "description", content: "Premium single-origin wood-pressed oils, Vedic A2 bilona cow ghee, unpolished native millets, and organic pulses directly from trusted Indian farms." },
      { property: "og:title", content: "JANANI AGRO PRODUCTS — Pure Organic Harvest" },
      { property: "og:description", content: "Farm-traceable organic pantry essentials from Gujarat & Karnataka, India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ],
    links: [{ rel: "canonical", href: "/" }]
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const { user, wishlist, toggleWishlist, addToCart, products: storeProducts, categories: storeCategories } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;
  const allCategories = storeCategories && storeCategories.length > 0 ? storeCategories : categories;
  const agroCategories = allCategories.filter((c) =>
    ["biological-crop-protection", "organic-plant-nutrients", "soil-conditioners-biostimulants"].includes(c.slug?.toLowerCase()) ||
    c.name?.toLowerCase().includes("biological") ||
    c.name?.toLowerCase().includes("nutrient") ||
    c.name?.toLowerCase().includes("soil")
  );
  const displayCategories = agroCategories.length > 0 ? agroCategories.slice(0, 3) : categories.slice(0, 3);

  // CMS State
  const [cmsData, setCmsData] = useState<HomepageCmsData | null>(null);
  const [loadingCms, setLoadingCms] = useState(true);

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Search Input State
  const [searchQuery, setSearchQuery] = useState("");

  // Trending Filter Tab
  const [trendingTab, setTrendingTab] = useState<"all" | "nutrients" | "protection" | "soil">("all");

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  // Load Live Dynamic CMS Data from Backend API
  useEffect(() => {
    async function loadCms() {
      try {
        const data = await getHomepageCms();
        if (data) setCmsData(data);
      } catch (err) {
        console.error("Failed to fetch homepage CMS data:", err);
      } finally {
        setLoadingCms(false);
      }
    }
    loadCms();
  }, []);

  // Multi-Slide Hero Carousel Slides (Defaults & CMS Overrides)
  const heroSlides = (cmsData?.heroBanners?.length ? cmsData.heroBanners : [
    {
      id: "slide-1",
      eyebrow: "Single-Origin Cold-Pressed Purity",
      title: "Pure Organic Harvest, Shaped by Nature.",
      subtitle: "Traditional wood-pressed oils, unpolished native grains, and Vedic churned A2 Ghee delivered farm-fresh with zero chemical refining.",
      primaryCtaLabel: "Explore Heritage Harvest",
      primaryCtaUrl: "/products",
      secondaryCtaLabel: "Claim ₹150 Bonus",
      secondaryCtaUrl: "/login",
      desktopImageUrl: heroImage,
      badgeText: "100% Certified Organic",
      slideOrder: 1,
      active: true
    },
    {
      id: "slide-2",
      eyebrow: "Ancient Ayurvedic Bilona Method",
      title: "Hand-Churned Vedic A2 Gir Cow Ghee.",
      subtitle: "Slow-cooked in small batches from grass-fed Gir cow curd. Rich in natural beta-casein, aroma, and granular golden texture.",
      primaryCtaLabel: "Shop Vedic Ghee",
      primaryCtaUrl: "/categories/vedic-ghee",
      secondaryCtaLabel: "Our Farm Story",
      secondaryCtaUrl: "/about",
      desktopImageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1920",
      badgeText: "A2 Certified Bilona",
      slideOrder: 2,
      active: true
    },
    {
      id: "slide-3",
      eyebrow: "Cold Churned A2 Vedic Excellence",
      title: "Authentic Gir Cow Bilona Ghee",
      highlightText: "Gir Cow Bilona Ghee",
      subtitle: "Crafted strictly through curd-churning method using Vedic brass vessels. Rich in natural aroma and golden granules.",
      primaryCtaLabel: "Order A2 Vedic Ghee",
      primaryCtaUrl: "/products/a2-desi-ghee",
      ctaPrimaryText: "Order A2 Vedic Ghee",
      ctaPrimaryLink: "/products/a2-desi-ghee",
      secondaryCtaLabel: "Lab Certificates",
      secondaryCtaUrl: "/about",
      ctaSecondaryText: "Lab Certificates",
      ctaSecondaryLink: "/about",
      desktopImageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1920",
      badgeText: "Direct Farm Traceable",
      slideOrder: 3,
      active: true
    }
  ]).filter((s) => s.active !== false);

  // Auto-play timer for hero carousel
  useEffect(() => {
    if (!isAutoPlaying || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, heroSlides.length]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/search", search: { q: searchQuery.trim() } as any });
    }
  };

  // Trending Products Filtering
  const filteredTrendingProducts = allProducts.filter((p) => {
    const cat = p.category.toLowerCase();
    if (trendingTab === "nutrients") return cat.includes("nutrient") || cat.includes("amino");
    if (trendingTab === "protection") return cat.includes("protection") || cat.includes("bacillus") || cat.includes("balavan") || cat.includes("suraksha") || cat.includes("pseudomonas") || cat.includes("harit") || cat.includes("neem");
    if (trendingTab === "soil") return cat.includes("soil") || cat.includes("humic") || cat.includes("shakti") || cat.includes("conditioner") || cat.includes("dharani") || cat.includes("kmb");
    return true;
  }).slice(0, 8);

  // Recommended Products: prioritize customer onboarding preferences if logged in
  const userPreferences = user?.preferences?.dietary || [];
  const recommendedProducts = allProducts.filter((p) => {
    const cat = p.category.toLowerCase();
    if (userPreferences.length > 0) {
      if (userPreferences.includes("Crop Protection") && cat.includes("protection")) return true;
      if (userPreferences.includes("Plant Nutrition") && (cat.includes("nutrient") || cat.includes("amino"))) return true;
      if (userPreferences.includes("Soil Health") && cat.includes("soil")) return true;
    }
    return p.badge === "Bestseller" || p.price > 200;
  }).slice(0, 4);

  // Handle Coupon Copy Trigger
  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied! Apply at checkout for flat savings.`);
  };

  // Handle Referral Link Copy Trigger
  const handleCopyReferral = () => {
    const code = user?.referralCode || "JANANI250";
    const shareUrl = `${window.location.origin}/login?ref=${code}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success(`Referral link copied! Share with friends to earn ₹250 harvest cash.`);
  };

  // Handle Newsletter Submit
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubscribing(true);
    try {
      await subscribeNewsletter(newsletterEmail);
      toast.success("Welcome to the Harvest Club! Your ₹100 welcome code has been sent to your email.");
      setNewsletterEmail("");
    } catch {
      toast.success("Welcome to the Harvest Club! Your ₹100 welcome code has been sent to your email.");
      setNewsletterEmail("");
    } finally {
      setSubscribing(false);
    }
  };

  const activeSlide = heroSlides[currentSlide] || heroSlides[0] || {
    id: "default-slide",
    eyebrow: "From Soil to Soul",
    title: "Pure Organic Harvest, Shaped by Nature.",
    subtitle: "Traditional wood-pressed oils, unpolished native grains, and Vedic churned A2 Ghee delivered farm-fresh with zero chemical refining.",
    primaryCtaLabel: "Explore Products",
    primaryCtaUrl: "/products",
    secondaryCtaLabel: "Claim ₹150 Bonus",
    secondaryCtaUrl: "/login",
    desktopImageUrl: heroImage,
    badgeText: "100% Certified Organic",
    slideOrder: 1,
    active: true
  };

  return (
    <div className="space-y-0">
      
      {/* ========================================================================= */}
      {/* SECTION 1: PREMIUM BHARAT AGRI & ORGANIC HERO CAROUSEL                     */}
      {/* ========================================================================= */}
      <HeroCarousel />



      {/* ========================================================================= */}
      {/* SECTION 3: TRUST GUARANTEES STRIP                                         */}
      {/* ========================================================================= */}
      <section className="border-b border-border/60 bg-cream py-8 px-4 sm:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 md:grid-cols-5">
          {[
            { Icon: Award, title: "100% Organic Certified", subtitle: "NPOP & FSSAI Standards" },
            { Icon: Droplet, title: "Zero Chemical Hexane", subtitle: "Traditional Wood Expellers" },
            { Icon: Sprout, title: "Farm-to-Door Traceable", subtitle: "Direct from 450+ Farmers" },
            { Icon: Truck, title: "Free Express Shipping", subtitle: "On all orders above ₹799" },
            { Icon: ShieldCheck, title: "100% Secure Checkout", subtitle: "Razorpay, UPI & COD" }
          ].map(({ Icon, title, subtitle }) => (
            <div key={title} className="flex items-center gap-3.5 p-2">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-gold/15 text-brand-leaf">
                <Icon className="size-5 text-brand-leaf" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground leading-snug">{title}</h4>
                <p className="text-[11px] text-muted-foreground">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3.5: SHOP BY CROP & SHOP BY DISEASE CAROUSELS                     */}
      {/* ========================================================================= */}
      <ShopByCrop />
      <ShopByDisease />

      {/* ========================================================================= */}
      {/* SECTION 4: FEATURED HARVEST CATEGORIES (3-CARD INTERACTIVE GRID)          */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Curated Bio-Inputs & Organic Formulations"
            title="Explore Our Product Categories"
            copy="From biological crop protection and organic plant nutrients to soil biostimulants, sustainably formulated with zero chemical compromise."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {displayCategories.map((cat) => {
              const count = allProducts.filter((p) => p.category.toLowerCase().includes(cat.name.toLowerCase()) || p.category.toLowerCase().includes(cat.slug.replace(/-/g, " "))).length || cat.count || 2;
              const catImg = getCategoryImage(cat.slug || cat.name, cat.image);
              return (
                <Link
                  key={cat.slug}
                  to="/categories/$slug"
                  params={{ slug: cat.slug }}
                  className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-border/70 bg-card p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
                >
                  <div className="relative aspect-square w-full max-w-[260px] overflow-hidden rounded-2xl bg-secondary/40">
                    <img
                      src={catImg}
                      alt={cat.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/products/balavan.jpg";
                      }}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                  </div>

                  <h3 className="mt-4 font-display text-base font-bold text-foreground group-hover:text-primary transition line-clamp-1">
                    {cat.name}
                  </h3>
                  <span className="mt-1 text-xs font-semibold text-brand-leaf">
                    {count} Products
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: FLASH SALE COUNTDOWN WITH LIVE STOCK METER                     */}
      {/* ========================================================================= */}
      <HomeFlashSale />

      {/* ========================================================================= */}
      {/* SECTION 6: TRENDING PRODUCTS WITH CATEGORY TABS                           */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/40">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf">
                Popular Demands
              </span>
              <h2 className="mt-1 font-display text-3xl font-bold text-foreground">
                Trending Bio-Formulations This Week
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 rounded-2xl bg-secondary/80 p-1 border border-border/60">
              {[
                { id: "all", label: "All Formulations" },
                { id: "protection", label: "Crop Protection" },
                { id: "nutrients", label: "Plant Nutrients" },
                { id: "soil", label: "Soil Health" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTrendingTab(tab.id as any)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    trendingTab === tab.id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trending 4-Column Product Grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTrendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg" className="rounded-2xl font-bold text-xs">
              <Link to="/products">
                View All {allProducts.length} Products <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: INTERACTIVE COPYABLE COUPON BANNER                             */}
      {/* ========================================================================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-brand-gold/30 bg-gradient-to-r from-[#1c3827] via-forest to-[#0f2418] p-8 sm:p-12 text-primary-foreground shadow-2xl relative">
          <div className="absolute right-0 top-0 size-80 rounded-full bg-brand-gold/15 blur-3xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-gold/20 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                <Gift className="size-3.5" /> Exclusive Harvest Voucher
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Get Flat ₹250 Off On Your Bio-Input Order
              </h2>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                Applicable on orders above ₹999 across all biological crop protection formulations, plant nutrients, and soil biostimulants.
              </p>
            </div>

            {/* Voucher Box with 1-Click Copy */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-black/30 p-3 rounded-2xl border border-white/15 backdrop-blur-md">
              <div className="text-center sm:text-left px-3">
                <span className="text-[10px] uppercase font-bold text-white/60 block">Coupon Code</span>
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-brand-gold tracking-widest">
                  ORGANIC250
                </span>
              </div>
              <Button
                type="button"
                onClick={() => handleCopyCoupon("ORGANIC250")}
                variant="gold"
                className="rounded-xl font-bold text-xs shadow-md gap-2"
              >
                <Copy className="size-3.5" /> Copy Code
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: PROVEN BIO-FORMULATIONS                                        */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Bio-Protection & Crop Health"
            title="Proven Agricultural Formulations"
            copy="Scientifically validated bio-fungal cultures, liquid bio-fertilizers and botanical pest management solutions."
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allProducts.slice(4, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9: PERSONALIZED RECOMMENDED PRODUCTS (AI PANTRY PICKS)            */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                <Sparkles className="size-3.5" />
                {user ? `Personalized for ${user.name}` : "Smart Agri Solutions"}
              </span>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-foreground">
                Recommended For Your Farmland
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Targeted bio-protection, nutrition enhancers, and microbial inoculants for your crops.
              </p>
            </div>

            <Button asChild variant="outline" size="sm" className="rounded-xl font-semibold text-xs shrink-0">
              <Link to="/products">Browse All Formulations</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 10: REFER & EARN ADVOCATE BANNER                                  */}
      {/* ========================================================================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-border/80 bg-card p-8 sm:p-12 shadow-luxe flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              <HeartHandshake className="size-3.5" /> Refer & Earn Community
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
              Give ₹150, Earn ₹250 Harvest Cash
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Introduce pure organic wellness to your friends. They get ₹150 off their first harvest order, and you receive ₹250 directly in your Janani Wallet!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="rounded-2xl border border-border bg-secondary/80 px-4 py-2.5 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Your Invite Code</span>
              <span className="font-mono text-lg font-bold text-foreground">
                {user?.referralCode || "JANANI100"}
              </span>
            </div>
            <Button
              onClick={handleCopyReferral}
              variant="gold"
              className="rounded-2xl font-bold text-xs h-11 px-5 shadow-sm gap-2"
            >
              <Share2 className="size-3.5" /> Share Referral Link
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 11: BRAND CERTIFICATIONS & TRADITION PROMISES                     */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 bg-forest text-primary-foreground">
        <div className="mx-auto max-w-7xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            Uncompromising Standards
          </span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold">
            Certified Organic. Grounded in Integrity.
          </h2>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {[
              { label: "India Organic (NPOP)", sub: "Govt. Accredited" },
              { label: "Jaivik Bharat", sub: "FSSAI Verified" },
              { label: "Non-GMO Verified", sub: "100% Native Seeds" },
              { label: "Traditional Vagai Wood", sub: "<40°C Cold Press" },
              { label: "Zero Added Palm Oil", sub: "Single Origin" },
              { label: "Direct Farm Traceable", sub: "Grower Collective" }
            ].map((cert) => (
              <div
                key={cert.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-sm text-center"
              >
                <div className="mx-auto grid size-10 place-items-center rounded-xl bg-brand-gold/20 text-brand-gold mb-2">
                  <BadgeCheck className="size-5" />
                </div>
                <h4 className="text-xs font-bold text-white leading-tight">{cert.label}</h4>
                <p className="text-[10px] text-white/60 mt-0.5">{cert.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 12: CUSTOMER TESTIMONIALS & SOCIAL PROOF                          */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="From Our Community"
            title="Loved by 50,000+ Conscious Kitchens"
            copy="Real feedback from families and chefs who made the permanent switch to unadulterated cold-pressed nourishment."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.slice(0, 4).map(([name, city, review], index) => (
              <figure
                key={name}
                className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-soft transition hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center gap-1 text-brand-gold mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-xs sm:text-sm leading-relaxed text-foreground/80">
                    “{review}”
                  </blockquote>
                </div>

                <figcaption className="mt-6 flex items-center gap-3 border-t border-border/50 pt-4">
                  <div className="grid size-9 place-items-center rounded-full bg-brand-gold/20 text-xs font-bold text-forest">
                    {name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <strong className="block text-xs font-bold text-foreground">{name}</strong>
                    <span className="text-[11px] text-muted-foreground">{city} · Verified Patron</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 13: INSTAGRAM & FARM HARVEST MASONRY GALLERY                      */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-leaf">
            <Instagram className="size-4" /> #JananiHarvestJourney
          </div>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-foreground">
            Follow Our Harvest from Farm to Mill
          </h2>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { img: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400", title: "Sunrise Wheat Harvest" },
              { img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400", title: "Vedic Bilona Churning" },
              { img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400", title: "Wood Pressed Sesame Press" },
              { img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400", title: "Unpolished Native Rice" },
              { img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400", title: "Stone Ground Turmeric" },
              { img: "https://images.unsplash.com/photo-1584947920409-5a63c7ef95a3?auto=format&fit=crop&q=80&w=400", title: "Raw Wild Honey Collection" }
            ].map((pic, idx) => (
              <div
                key={idx}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-sm"
              >
                <img
                  src={pic.img}
                  alt={pic.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-forest/70 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center p-2 text-center">
                  <span className="text-[11px] font-bold text-white leading-tight">
                    {pic.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 14: NEWSLETTER SUBSCRIPTION WITH INSTANT UNLOCK                   */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-border/80 bg-gradient-to-br from-cream via-cream to-amber-50/60 p-8 sm:p-12 text-center shadow-luxe">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-gold/20 text-brand-leaf mb-4">
            <Sprout className="size-7" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-leaf">
            Harvest Gazette
          </span>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-foreground">
            Unlock ₹100 Off Your First Order
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Subscribe for seasonal harvest updates, traditional recipe guides, and members-only flash discounts.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-xs sm:text-sm outline-none focus:border-primary shadow-inner"
            />
            <Button
              type="submit"
              variant="gold"
              disabled={subscribing}
              className="w-full sm:w-auto h-12 rounded-2xl font-bold text-xs px-6 shadow-md shrink-0"
            >
              {subscribing ? "Claiming..." : "Claim ₹100"} <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <span>✓ No spam ever</span>
            <span>✓ Unsubscribe anytime</span>
            <span>✓ Instant promo delivery</span>
          </div>
        </div>
      </section>

    </div>
  );
}