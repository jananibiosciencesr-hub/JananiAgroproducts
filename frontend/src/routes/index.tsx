import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  Sprout,
  Leaf,
  Award,
  FlaskConical,
  Sparkles,
  Layers,
  Package,
  TrendingUp,
  Activity,
  Heart,
  ShoppingBag,
  ShieldAlert,
  Wheat,
  Bug,
  Shield,
  Droplets,
  Plus,
  Minus
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { getStorefrontReviews } from "@/lib/api";
import { products, categories, getCategoryImage, slugs, type Product } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { HeroBannerCarousel } from "@/components/home/hero-banner-carousel";
import { ProductQuickViewModal } from "@/components/shop/product-quick-view-modal";
import { GrowingPlantAnimation } from "@/components/home/growing-plant-animation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Janani Agro Products — Grow Healthy Crops with Natural Care" },
      {
        name: "description",
        content:
          "High quality agro inputs for sustainable farming. Certified biological crop protection, organic plant nutrients, and soil conditioners for bumper crop yields.",
      },
      { property: "og:title", content: "Janani Agro Products — Healthy Soil, Brighter Harvests" },
      {
        property: "og:description",
        content: "Natural and effective agro solutions for sustainable farming and peak crop productivity across India.",
      },
    ],
  }),
  component: HomePage,
});

export function HomePage() {
  const { products: storeProducts, categories: storeCats, cart, addToCart, updateQuantity, removeFromCart, wishlist, toggleWishlist } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;
  const allCategories = storeCats && storeCats.length > 0 ? storeCats : categories;
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Categories Carousel Ref for Smooth Scrolling
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const scrollCategories = (direction: "left" | "right") => {
    if (categoriesScrollRef.current) {
      const offset = direction === "left" ? -300 : 300;
      categoriesScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Featured Products Carousel Ref for Smooth Scrolling
  const productsScrollRef = useRef<HTMLDivElement>(null);
  const scrollProducts = (direction: "left" | "right") => {
    if (productsScrollRef.current) {
      const offset = direction === "left" ? -320 : 320;
      productsScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Testimonial Carousel Ref & State
  const testimonialsScrollRef = useRef<HTMLDivElement>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const scrollTestimonials = (direction: "left" | "right") => {
    if (testimonialsScrollRef.current) {
      const container = testimonialsScrollRef.current;
      const scrollAmount = container.clientWidth > 768 ? 400 : 310;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleTestimonialScroll = () => {
    if (testimonialsScrollRef.current) {
      const container = testimonialsScrollRef.current;
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.clientWidth > 768 ? 400 : 310;
      const idx = Math.round(scrollLeft / cardWidth);
      setActiveTestimonial(Math.min(Math.max(0, idx), 4));
    }
  };

  const scrollToTestimonialIndex = (idx: number) => {
    if (testimonialsScrollRef.current) {
      const container = testimonialsScrollRef.current;
      const cardWidth = container.clientWidth > 768 ? 400 : 310;
      container.scrollTo({
        left: idx * cardWidth,
        behavior: "smooth",
      });
      setActiveTestimonial(idx);
    }
  };

  // Dynamic Agri Products Categories (from database & store)
  const categoryCards = useMemo(() => {
    return allCategories
      .filter((cat: any) => {
        const n = (cat.name || cat.title || "").toLowerCase();
        const s = (cat.slug || "").toLowerCase();
        if (n.includes("neem") || s.includes("neem") || n.includes("botanical") || s.includes("botanical")) return true;
        return !["rice", "grain", "pulse", "dal", "spice", "ghee", "basmati", "mustard oil", "cold pressed", "oil", "wheat", "millet"].some((term) => n.includes(term) || s.includes(term));
      })
      .map((cat: any) => {
      const slug = cat.slug || slugs(cat.name || "");
      const title = cat.name || cat.title || "Category";
      const image = getCategoryImage(slug || title, cat.image || cat.bannerImage || cat.banner_image);
      const link = `/categories/${slug}`;
      const description = cat.description || "Natural, biological, and effective solutions for every stage of crop growth.";
      return {
        id: cat.id || slug,
        title,
        image,
        link,
        description,
      };
    });
  }, [allCategories]);

  // 5 Featured Products (From Mockup)
  const featuredProductsList = [
    {
      id: "harit",
      numId: 1,
      name: "HARIT",
      spec: "Trichoderma Viride Liquid Biofungal Formulation",
      image: "/products/harit.jpg",
      link: "/products/harit-trichoderma-viride-liquid-biofungal-formulation-1l",
      price: 950,
      oldPrice: 1100,
    },
    {
      id: "bhumi-shakti",
      numId: 2,
      name: "BHUMI SHAKTI",
      spec: "Humic & Fulvic Based Soil Conditioner Biostimulant",
      image: "/products/bhumi-shakti.jpg",
      link: "/products/bhumi-shakti-humic-fulvic-biostimulant-5l",
      price: 3900,
      oldPrice: 4400,
    },
    {
      id: "neem-oil",
      numId: 3,
      name: "NEEM OIL",
      spec: "Containing Azadirachtin 1000 PPM",
      image: "/products/neem-oil.jpg",
      link: "/products/neem-oil-1000-ppm-azadirachtin-1l",
      price: 599,
      oldPrice: 750,
    },
    {
      id: "nano-gold",
      numId: 4,
      name: "NANO GOLD",
      spec: "Plant Growth Promoter",
      image: "/products/pushkal.jpg",
      link: "/products/pushkal-flowering-fruit-set-biostimulant-1l",
      price: 999,
      oldPrice: 1200,
    },
    {
      id: "vermi-boost",
      numId: 5,
      name: "VERMI BOOST",
      spec: "Organic Soil Enhancer",
      image: "/products/annada.jpg",
      link: "/products/annada-fish-amino-acid-5l",
      price: 3600,
      oldPrice: 3999,
    },
  ];

  // 5 Real Indian Farmer Testimonials (default authentic fallback)
  const defaultTestimonials = [
    {
      id: 1,
      name: "Ramesh Kumar",
      location: "Mango Farmer, Andhra Pradesh",
      image: "/images/farmer_ramesh.jpg",
      quote:
        "Using Janani products improved my soil health and increased my yield significantly. Highly recommended!",
      stars: 5,
    },
    {
      id: 2,
      name: "Srinivas Reddy",
      location: "Vegetable Farmer, Telangana",
      image: "/images/farmer_srinivas.jpg",
      quote:
        "HARIT helped in controlling root rot and my plants are now much healthier.",
      stars: 5,
    },
    {
      id: 3,
      name: "Mahesh Patel",
      location: "Cotton Farmer, Gujarat",
      image: "/images/farmer_mahesh.jpg",
      quote:
        "Good quality products and excellent results. My cotton crop showed great improvement.",
      stars: 5,
    },
    {
      id: 4,
      name: "Suresh Patil",
      location: "Sugarcane Farmer, Maharashtra",
      image: "/images/farmer_suresh.jpg",
      quote:
        "Janani bio-stimulants gave my sugarcane thicker stalks and higher sugar recovery. Truly dependable organic results!",
      stars: 5,
    },
    {
      id: 5,
      name: "Baldev Singh",
      location: "Wheat & Paddy Farmer, Punjab",
      image: "/images/farmer_baldev.jpg",
      quote:
        "Zero chemical residue and vigorous tillering in my paddy fields. The soil moisture retention has also noticeably improved.",
      stars: 5,
    },
  ];

  const [testimonials, setTestimonials] = useState<any[]>(defaultTestimonials);

  useEffect(() => {
    let mounted = true;
    getStorefrontReviews().then((revs) => {
      if (!mounted) return;
      if (revs && revs.length > 0) {
        const mapped = revs.map((r: any, idx: number) => ({
          id: r.id || idx + 1,
          name: r.customerName || "Farmer",
          location: r.location || r.productCategory || "Organic Farmer",
          image: r.customerAvatar || "/images/farmer_ramesh.jpg",
          quote: r.comment || r.title || "Excellent agro inputs from Janani.",
          stars: r.rating || 5,
        }));
        setTestimonials(mapped);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="bg-white text-[#075B32] overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: CAMPAIGN CAROUSEL WITH DEDICATED DESKTOP & MOBILE BANNERS */}
      {/* ========================================================================= */}
      <HeroBannerCarousel />

      {/* ========================================================================= */}
      {/* 2. EXPLORE OUR PRODUCT CATEGORIES                                         */}
      {/* ========================================================================= */}
      <section className="py-4 sm:py-5 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="mx-auto max-w-7xl">
          {/* Section Header with Left Text & Right Controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3 sm:mb-4 text-left">
            <div>
              <p className="text-[11px] sm:text-xs font-black tracking-[0.2em] uppercase text-[#0B6B35]">
                AGRI PRODUCTS
              </p>
              <h2 className="mt-0.5 text-2xl sm:text-3xl font-black text-[#075B32] tracking-tight">
                PRODUCT <span className="text-[#D99A12]">CATEGORIES</span>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Natural, biological, and effective solutions for every stage of crop growth.
              </p>
            </div>

            {/* Top-Right Controls: Left & Right Navigation Arrows + View All Categories Button */}
            <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
              {/* Carousel Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollCategories("left")}
                  aria-label="Previous Categories"
                  className="size-9 rounded-full bg-slate-100 hover:bg-[#ebf3e7] text-[#075B32] hover:text-[#4FAE2A] flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs border border-slate-200/70"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCategories("right")}
                  aria-label="Next Categories"
                  className="size-9 rounded-full bg-slate-100 hover:bg-[#ebf3e7] text-[#075B32] hover:text-[#4FAE2A] flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs border border-slate-200/70"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* View All Categories Link Button */}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full font-bold text-xs border-0 bg-slate-100 hover:bg-[#ebf3e7] text-[#075B32] h-9 px-3.5 shadow-xs"
              >
                <Link to="/categories">
                  View All Categories <ArrowRight className="size-3.5 ml-1 text-[#4FAE2A]" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Carousel Controls & Cards Strip */}
          <div className="relative">
            {/* Side Floating Nav Arrow Left (Desktop helper) */}
            <button
              type="button"
              onClick={() => scrollCategories("left")}
              aria-label="Previous Categories"
              className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-white/90 text-[#075B32] hover:text-[#4FAE2A] hover:bg-[#ebf3e7] items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-md border border-emerald-100"
            >
              <ChevronLeft className="size-5" />
            </button>

            {/* Side Floating Nav Arrow Right (Desktop helper) */}
            <button
              type="button"
              onClick={() => scrollCategories("right")}
              aria-label="Next Categories"
              className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-white/90 text-[#075B32] hover:text-[#4FAE2A] hover:bg-[#ebf3e7] items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-md border border-emerald-100"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Scrollable Container */}
            <div
              ref={categoriesScrollRef}
              className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 px-2 scrollbar-none snap-x snap-mandatory"
            >
              {categoryCards.map((cat) => (
                <Link
                  key={cat.id}
                  to={cat.link}
                  className="snap-start flex-none w-[170px] sm:w-[195px] flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl bg-[#f4f7f2] hover:bg-[#ebf3e7] transition-all duration-300 hover:-translate-y-1.5 group"
                >
                  <div className="size-20 sm:size-24 rounded-2xl overflow-hidden mb-3.5 shadow-sm border border-emerald-100/80 bg-white group-hover:border-[#4FAE2A]/50 group-hover:shadow-md transition-all duration-300 relative">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#075B32] group-hover:text-[#4FAE2A] transition-colors line-clamp-1">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 3. FEATURED PRODUCTS SECTION                                              */}
      {/* ========================================================================= */}
      <section className="py-4 sm:py-5 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="mx-auto max-w-7xl">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3 sm:mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#075B32] tracking-tight">
                FEATURED <span className="text-[#D99A12]">PRODUCTS</span>
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
                Our most trusted and effective products for healthier crops and higher yields.
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="self-start sm:self-auto rounded-full font-bold text-xs border-0 bg-slate-100 hover:bg-[#ebf3e7] text-[#075B32]"
            >
              <Link to="/products">
                View All Products <ArrowRight className="size-3.5 ml-1 text-[#4FAE2A]" />
              </Link>
            </Button>
          </div>

          {/* Carousel Wrapper */}
          <div className="relative">
            {/* Left Scroll Arrow */}
            <button
              type="button"
              onClick={() => scrollProducts("left")}
              aria-label="Previous Products"
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 size-9 sm:size-10 rounded-full bg-slate-100 text-[#075B32] hover:text-[#4FAE2A] hover:bg-[#ebf3e7] flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
            >
              <ChevronLeft className="size-5" />
            </button>

            {/* Right Scroll Arrow */}
            <button
              type="button"
              onClick={() => scrollProducts("right")}
              aria-label="Next Products"
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 size-9 sm:size-10 rounded-full bg-slate-100 text-[#075B32] hover:text-[#4FAE2A] hover:bg-[#ebf3e7] flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Product Cards Row */}
            <div
              ref={productsScrollRef}
              className="flex items-stretch gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 px-2 scrollbar-none snap-x snap-mandatory"
            >
              {featuredProductsList.map((prod) => {
                const isWishlisted = wishlist.includes(prod.numId);
                const cartQty = cart[prod.numId] || (cart as any)[String(prod.numId)] || (cart as any)[prod.id] || 0;
                const discountVal = prod.oldPrice
                  ? Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100)
                  : 12;

                return (
                  <div
                    key={prod.id}
                    className="snap-start flex-none w-[calc(50%-10px)] min-w-[155px] sm:w-[245px] flex flex-col justify-between rounded-2xl bg-[#f4f7f2] shadow-xs hover:shadow-md transition-all duration-300 group overflow-hidden"
                  >
                    {/* Bottle Image with natural backdrop */}
                    <div className="relative aspect-square w-full bg-white p-2 sm:p-2.5 overflow-hidden flex items-center justify-center">
                      <Link
                        to={prod.link}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          loading="lazy"
                          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>

                      {/* Top-Left Red Discount Badge - Sharp corners */}
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-[#E53E3E] text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-none uppercase tracking-wider shadow-xs">
                          SAVE {discountVal}%
                        </span>
                      </div>

                      {/* Top-Right Circular Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(prod.numId);
                        }}
                        aria-label={`Save ${prod.name}`}
                        className={`absolute top-2 right-2 z-10 size-7 sm:size-8 rounded-full shadow-xs flex items-center justify-center transition backdrop-blur-xs ${
                          isWishlisted
                            ? "bg-red-500 text-white"
                            : "bg-white/95 text-gray-700 hover:text-red-500 hover:bg-white"
                        }`}
                      >
                        <Heart
                          className={`size-3.5 sm:size-4 transition ${
                            isWishlisted ? "fill-current text-white scale-110" : "text-gray-700"
                          }`}
                        />
                      </button>

                      {/* Bottom-Center Pill - 🔥 BESTSELLER */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap pointer-events-none">
                        <span className="inline-flex items-center gap-1 bg-[#064A29]/95 text-white text-[8px] sm:text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider backdrop-blur-xs">
                          <span>🔥</span>
                          <span>BESTSELLER</span>
                        </span>
                      </div>
                    </div>

                    {/* Product Info & CTA */}
                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          to={prod.link}
                          className="text-xs sm:text-sm font-bold text-[#075B32] hover:text-[#064A29] line-clamp-1 block transition leading-snug"
                        >
                          {prod.name}
                        </Link>
                        <p className="mt-0.5 text-[10px] sm:text-[11px] text-gray-500 line-clamp-1">
                          {prod.spec}
                        </p>

                        {/* Rating */}
                        <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-[11px]">
                          <div className="flex items-center text-[#E7A91A]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="size-2.5 sm:size-3 fill-current" />
                            ))}
                          </div>
                          <span className="text-gray-500 font-semibold ml-0.5">
                            (89 reviews)
                          </span>
                        </div>

                        {/* Price: Rs. XXX  Rs. YYY */}
                        <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-base text-gray-900 font-mono">
                            Rs. {prod.price}
                          </span>
                          {prod.oldPrice && (
                            <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">
                              Rs. {prod.oldPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Full-width Rectangular Add to Cart / Quantity Stepper Button */}
                      <div className="mt-2.5 pt-2">
                        {cartQty > 0 ? (
                          <div className="w-full bg-[#075B32] text-white text-[11px] sm:text-xs font-bold py-1 sm:py-1.5 rounded-none transition shadow-xs flex items-center justify-between px-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (cartQty <= 1) {
                                  removeFromCart(prod.numId);
                                  removeFromCart(prod.id);
                                  toast.info(`Removed ${prod.name} from cart`);
                                } else {
                                  updateQuantity(prod.numId, cartQty - 1);
                                }
                              }}
                              className="size-7 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-sm transition active:scale-90 cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="font-mono font-bold text-xs select-none">
                              {cartQty} IN BASKET
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart(prod.numId, 1);
                              }}
                              className="size-7 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-sm transition active:scale-90 cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(prod.numId, 1);
                              toast.success(`Added ${prod.name} to cart!`);
                            }}
                            className="w-full bg-[#075B32] hover:bg-[#064A29] text-white text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 rounded-none uppercase tracking-wider transition text-center shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
                          >
                            <ShoppingBag className="size-3.5 sm:size-4" />
                            <span>ADD TO CART</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHY CHOOSE JANANI AGRO PRODUCTS?                                       */}
      {/* ========================================================================= */}
      <section className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
            {/* Left Column: Dynamic Growing Plant Animation */}
            <div className="lg:col-span-5 flex justify-center">
              <GrowingPlantAnimation />
            </div>

            {/* Right Column: Content & 4 Features */}
            <div className="lg:col-span-7 space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-[#075B32] tracking-tight leading-[1.12]">
                WHY CHOOSE<br />
                <span className="text-[#075B32]">JANANI </span>
                <span className="text-[#D99A12]">AGRO PRODUCTS?</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg break-normal">
                We are committed to providing high-quality, eco-friendly, and effective agricultural solutions for sustainable farming.
              </p>

              {/* 4 Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1 max-w-lg">
                {[
                  {
                    title: "Natural Formulations",
                    desc: "Plant and soil-friendly products",
                    icon: Leaf,
                  },
                  {
                    title: "Improves Soil Health",
                    desc: "Enhances soil fertility and structure",
                    icon: Sprout,
                  },
                  {
                    title: "Better Crop Yield",
                    desc: "Healthier plants, higher productivity",
                    icon: Award,
                  },
                  {
                    title: "Safe & Sustainable",
                    desc: "Environment friendly farming solutions",
                    icon: ShieldCheck,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white hover:bg-[#f4f7f2] transition-all border border-slate-200/90 shadow-xs hover:border-[#075B32]/30 hover:shadow-sm"
                  >
                    <div className="size-9 rounded-xl bg-[#f4f7f2] text-[#075B32] flex items-center justify-center shrink-0 border border-emerald-100">
                      <item.icon className="size-4.5" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs sm:text-sm font-bold text-[#075B32] leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. WHAT OUR FARMERS SAY (TESTIMONIALS)                                    */}
      {/* ========================================================================= */}
      <section className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-3 sm:mb-4 text-left">
            <p className="text-[11px] sm:text-xs font-black tracking-[0.2em] uppercase text-[#0B6B35]">
              FARMER STORIES
            </p>
            <h2 className="mt-0.5 text-2xl sm:text-3xl font-black text-[#075B32] tracking-tight">
              WHAT OUR <span className="text-[#D99A12]">FARMERS SAY</span>
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
              Real experiences from farmers who trust Janani Agro Products.
            </p>
          </div>

          {/* Testimonial Cards Carousel Container */}
          <div className="relative">
            {/* Left Nav Arrow Button */}
            <button
              type="button"
              onClick={() => scrollTestimonials("left")}
              aria-label="Previous Testimonials"
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 size-9 sm:size-10 rounded-full bg-slate-100 text-[#075B32] hover:text-[#4FAE2A] hover:bg-[#ebf3e7] flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
            >
              <ChevronLeft className="size-5" />
            </button>

            {/* Right Nav Arrow Button */}
            <button
              type="button"
              onClick={() => scrollTestimonials("right")}
              aria-label="Next Testimonials"
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 size-9 sm:size-10 rounded-full bg-slate-100 text-[#075B32] hover:text-[#4FAE2A] hover:bg-[#ebf3e7] flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Scrollable Testimonials Strip */}
            <div
              ref={testimonialsScrollRef}
              onScroll={handleTestimonialScroll}
              className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory"
            >
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="snap-start flex-none w-[290px] sm:w-[350px] md:w-[380px] flex flex-col justify-between p-6 rounded-3xl bg-[#f4f7f2] hover:bg-[#ebf3e7] transition-all duration-300 hover:-translate-y-1"
                >
                  <div>
                    {/* Farmer Headshot + Rating Stars */}
                    <div className="flex items-center gap-3.5 mb-4">
                      <img
                        src={t.image}
                        alt={t.name}
                        loading="lazy"
                        decoding="async"
                        className="size-14 rounded-full object-cover shadow-xs"
                      />
                      <div>
                        {/* 5 Stars */}
                        <div className="flex items-center gap-1 text-[#E7A91A]">
                          {Array.from({ length: t.stars }).map((_, s) => (
                            <Star key={s} className="size-3.5 fill-current" />
                          ))}
                        </div>
                        <h3 className="text-sm font-bold text-[#075B32] mt-0.5">
                          {t.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {t.location}
                        </p>
                      </div>
                    </div>

                    {/* Quote */}
                    <p className="text-xs sm:text-[13px] text-slate-700 italic leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slider Pagination Indicator Dots */}
          <div className="mt-2 flex items-center justify-center gap-2">
            {testimonials.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => scrollToTestimonialIndex(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
                className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${
                  activeTestimonial === idx
                    ? "w-6 bg-[#075B32]"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. NATURAL CARE FOR HEALTHY HARVESTS PROMO BANNER                         */}
      {/* ========================================================================= */}
      <section className="py-3 sm:py-5 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-r from-[#F8FAEE] via-white to-[#F8FAEE] p-4 sm:p-6 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-4">
              {/* Brand Logo Seal */}
              <img
                src="/logo.png"
                alt="Janani Agro Products"
                loading="lazy"
                decoding="async"
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-xs"
              />

              <h2 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight leading-[1.15] text-[#075B32]">
                NATURAL CARE FOR<br />
                <span className="text-[#D99A12]">HEALTHY HARVESTS</span>
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-slate-700 max-w-lg leading-relaxed">
                Trusted agro solutions for fruits, vegetables, field crops and more.
              </p>

              <div className="pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-[#075B32] hover:bg-[#064A29] text-white font-bold text-xs sm:text-sm px-8 py-3.5 shadow-md transition-all hover:scale-105 active:scale-95 group"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right Fresh Harvest Bounty Image */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative max-w-lg w-full">
                <img
                  src="/banners/harvest_produce_banner.jpg"
                  alt="Healthy Harvest Bounty (Tomatoes, Mangoes, Cotton)"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover rounded-3xl shadow-lg transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}