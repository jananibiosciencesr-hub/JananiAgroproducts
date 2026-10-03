import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MessageSquare
} from "lucide-react";

export interface HeroSlideData {
  id: string;
  badge: string;
  badgeIcon?: "sprout" | "zap" | "shield" | "sparkles" | "award";
  headlinePrefix?: string;
  headlineLines?: { text: string; highlight?: boolean }[];
  headlineMain: string;
  headlineHighlight?: string;
  subheadline: string;
  tags?: string[];
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaPrimaryVariant?: "gold" | "crimson" | "amber" | "emerald" | "default" | "blue";
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  discountBadgeText?: string;
  discountBadgeSub?: string;
  bgImage: string;
  themeColor: "emerald" | "amber" | "blue" | "crimson";
  contentAlign: "left" | "right" | "center";
}

const DEFAULT_SLIDES: HeroSlideData[] = [
  {
    id: "slide-crop-protection",
    badge: "100% CERTIFIED • ECO-SAFE • FARM FRIENDLY",
    badgeIcon: "sprout",
    headlinePrefix: "YOUR TRUSTED PARTNER IN FARM PROTECTION",
    headlineLines: [
      { text: "Natural Protection.", highlight: false },
      { text: "Stronger Crops.", highlight: true },
      { text: "Better Harvests.", highlight: false }
    ],
    headlineMain: "Natural Protection. Stronger Crops. Better Harvests.",
    subheadline: "Powerful botanical crop protection solutions designed to protect your crops while supporting healthier and sustainable farming.",
    tags: ["Bio-Shield Fungicide", "Bio-Care Leaf Defense", "Bio-Herb Weed Control", "Pest-Guard Canister"],
    ctaPrimaryText: "EXPLORE PRODUCTS",
    ctaPrimaryLink: "/categories/crop-protection",
    ctaPrimaryVariant: "amber",
    ctaSecondaryText: "ENQUIRE NOW",
    ctaSecondaryLink: "/contact",
    discountBadgeText: "100% SAFE",
    discountBadgeSub: "Zero Toxin Residue",
    bgImage: "/banners/banner_crop_protection_hd.jpg",
    themeColor: "emerald",
    contentAlign: "left"
  },
  {
    id: "slide-bharat-farmer",
    badge: "Dedicated to the hands that feed our BHARAT!",
    badgeIcon: "sprout",
    headlinePrefix: "PROUD TO SUPPORT",
    headlineLines: [
      { text: "Proud to Support", highlight: false },
      { text: "India's Farmers.", highlight: true }
    ],
    headlineMain: "India's Farmers",
    subheadline: "Certified biological crop protection and plant nutrition engineered for disease resistance and bumper harvest yields.",
    tags: ["Balavan Bacillus Subtilis", "Suraksha Pseudomonas", "Annada Fish Amino", "100% Eco-Safe"],
    ctaPrimaryText: "EXPLORE PRODUCTS",
    ctaPrimaryLink: "/products",
    ctaPrimaryVariant: "amber",
    ctaSecondaryText: "ENQUIRE NOW",
    ctaSecondaryLink: "/contact",
    discountBadgeText: "100% BIO",
    discountBadgeSub: "Residue Free",
    bgImage: "/banners/banner_farmer_spraying_hd.jpg",
    themeColor: "amber",
    contentAlign: "left"
  },
  {
    id: "slide-bio-nutrients",
    badge: "Advanced Soil & Plant Nutrition",
    badgeIcon: "sparkles",
    headlinePrefix: "NATURAL NUTRITION & BIOSTIMULANTS",
    headlineLines: [
      { text: "Bio-Nutrition,", highlight: false },
      { text: "Root to Shoot.", highlight: true }
    ],
    headlineMain: "Root to Shoot",
    subheadline: "Bio-fertilizers, humic fulvic soil rejuvenators, and concentrated fish amino acids for balanced vegetative and reproductive growth.",
    tags: ["Bhumi Shakti Humic & Fulvic", "Dharani KMB Mobilizer", "Pushkal Fruit Set", "Harit Trichoderma"],
    ctaPrimaryText: "EXPLORE PRODUCTS",
    ctaPrimaryLink: "/categories/organic-plant-nutrients",
    ctaPrimaryVariant: "emerald",
    ctaSecondaryText: "ENQUIRE NOW",
    ctaSecondaryLink: "/contact",
    discountBadgeText: "HIGH YIELD",
    discountBadgeSub: "Maximum Efficacy",
    bgImage: "/banners/banner_pantry_harvest_hd.jpg",
    themeColor: "emerald",
    contentAlign: "left"
  }
];

export function HeroCarousel({
  customSlides,
  autoPlayInterval = 6500
}: {
  customSlides?: HeroSlideData[];
  autoPlayInterval?: number;
}) {
  const slides = customSlides && customSlides.length > 0 ? customSlides : DEFAULT_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  // Smooth Auto-Play Progress Bar & Transition
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const stepMs = 50;
    const progressIncrement = (stepMs / autoPlayInterval) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((curr) => (curr + 1) % slides.length);
          return 0;
        }
        return prev + progressIncrement;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPaused, slides.length, autoPlayInterval, currentSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  // Touch Swipe Gesture Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();

    setTouchStart(null);
    setTouchEnd(null);
  };

  const active = slides[currentSlide];
  const isRightAlign = active.contentAlign === "right";
  const isCenterAlign = active.contentAlign === "center";

  return (
    <section className="relative w-full bg-stone-900 overflow-hidden select-none">
      {/* MAIN WIDESCREEN HERO CAROUSEL BANNER */}
      <div
        className="relative w-full h-[340px] sm:h-[390px] md:h-[440px] lg:h-[480px] xl:h-[500px] overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Slides with Full Image Vibrancy and Smooth Ken-Burns Zoom */}
        {slides.map((slide, idx) => {
          const isCurrent = idx === currentSlide;
          const alignRight = slide.contentAlign === "right";
          const alignCenter = slide.contentAlign === "center";

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isCurrent ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              {/* High-Definition Vivid Photography with Headroom Protection */}
              <img
                src={slide.bgImage}
                alt={`${slide.headlinePrefix || ""} ${slide.headlineMain}`}
                className={`h-full w-full object-cover transition-transform duration-[10000ms] ease-out transform ${
                  slide.id === "slide-crop-protection"
                    ? "object-[center_18%]"
                    : "object-center"
                } ${isCurrent ? "scale-[1.02]" : "scale-100"}`}
              />

              {/* Directional Vignette Scrim (Protects text legibility on text side while keeping right side 100% radiant) */}
              <div
                className={`absolute inset-0 pointer-events-none ${
                  alignCenter
                    ? "bg-[radial-gradient(ellipse_at_center,_rgba(2,6,23,0.72)_0%,_rgba(2,6,23,0.35)_45%,_transparent_72%)]"
                    : alignRight
                    ? "bg-gradient-to-l from-slate-950/85 via-slate-950/45 md:via-slate-950/30 to-transparent"
                    : "bg-gradient-to-r from-slate-950/80 via-slate-950/45 md:via-slate-950/20 to-transparent"
                }`}
              />

              {/* Subtle top & bottom shadow gradient for navigation & header contrast */}
              <div className="absolute inset-x-0 top-0 h-12 sm:h-16 bg-gradient-to-b from-slate-950/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent pointer-events-none" />
            </div>
          );
        })}

        {/* Foreground Content: Sleek Luxury Typography */}
        <div
          className={`relative z-20 mx-auto flex h-full max-w-7xl items-center px-6 sm:px-12 lg:px-16 ${
            isCenterAlign
              ? "justify-center text-center"
              : isRightAlign
              ? "justify-center sm:justify-end text-center sm:text-right"
              : "justify-center sm:justify-start text-center sm:text-left"
          }`}
        >
          <div
            key={active.id}
            className={`max-w-xl lg:max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-700 select-none py-3 sm:py-4 ${
              isCenterAlign
                ? "mx-auto text-center"
                : isRightAlign
                ? "sm:items-end text-right"
                : "sm:items-start text-left"
            }`}
          >
            {/* 1. Eco-Safe Pill Badge */}
            {active.badge && (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-slate-950/60 px-3.5 sm:px-4 py-1.5 backdrop-blur-md shadow-lg shadow-black/40 mb-2 sm:mb-2.5">
                <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  {active.badge}
                </span>
              </div>
            )}

            {/* 2. Headline Prefix */}
            {active.headlinePrefix && (
              <p className="text-[11px] sm:text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] text-amber-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] mb-1 sm:mb-1.5 font-sans">
                {active.headlinePrefix}
              </p>
            )}

            {/* 3. Main Multi-line Headline */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-black leading-[1.08] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
              {active.headlineLines ? (
                active.headlineLines.map((line, lIdx) => (
                  <span
                    key={lIdx}
                    className={`block ${line.highlight ? "text-amber-400" : "text-white"}`}
                  >
                    {line.text}
                  </span>
                ))
              ) : (
                active.headlineMain
              )}
            </h1>

            {/* 4. Subheadline */}
            {active.subheadline && (
              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base font-normal text-slate-100/90 leading-relaxed max-w-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                {active.subheadline}
              </p>
            )}

            {/* 5. Luxury Action Buttons */}
            <div
              className={`mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-4 ${
                isCenterAlign
                  ? "justify-center"
                  : isRightAlign
                  ? "justify-center sm:justify-end"
                  : "justify-center sm:justify-start"
              }`}
            >
              {/* Primary Explore Products Button */}
              <Link
                to={active.ctaPrimaryLink || "/products"}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 shadow-[0_8px_20px_rgba(245,158,11,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_28px_rgba(245,158,11,0.65)] active:scale-95"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                <span>{active.ctaPrimaryText || "EXPLORE PRODUCTS"}</span>
                <ArrowRight className="size-3.5 sm:size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              {/* Secondary Enquire Button */}
              <Link
                to={active.ctaSecondaryLink || "/contact"}
                className="group inline-flex items-center gap-2 rounded-full border-2 border-white/70 bg-slate-950/40 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-white backdrop-blur-xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-white hover:text-slate-950 hover:border-white hover:shadow-[0_8px_20px_rgba(255,255,255,0.3)] active:scale-95"
              >
                <MessageSquare className="size-3.5 sm:size-4 text-amber-400 transition-colors group-hover:text-slate-950" />
                <span>{active.ctaSecondaryText || "ENQUIRE NOW"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 6. PREV / NEXT ARROW BUTTONS (Frosted Glass) */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-2.5 sm:left-5 top-1/2 -translate-y-1/2 z-30 flex size-9 sm:size-11 items-center justify-center rounded-full border border-white/25 bg-slate-950/40 text-white backdrop-blur-xl shadow-xl transition hover:scale-110 hover:bg-white hover:text-slate-950 active:scale-95"
        >
          <ChevronLeft className="size-4 sm:size-5" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-2.5 sm:right-5 top-1/2 -translate-y-1/2 z-30 flex size-9 sm:size-11 items-center justify-center rounded-full border border-white/25 bg-slate-950/40 text-white backdrop-blur-xl shadow-xl transition hover:scale-110 hover:bg-white hover:text-slate-950 active:scale-95"
        >
          <ChevronRight className="size-4 sm:size-5" />
        </button>

        {/* 7. BOTTOM SLIDE PROGRESS TABS & COUNTER */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-2.5 rounded-full border border-white/20 bg-slate-950/70 px-3.5 sm:px-4 py-1.5 backdrop-blur-xl shadow-xl">
          <span className="text-[11px] font-bold text-amber-400 font-mono tracking-wider mr-0.5">
            0{currentSlide + 1} / 0{slides.length}
          </span>
          <div className="h-3 w-px bg-white/25" />
          {slides.map((s, index) => {
            const isActive = index === currentSlide;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`relative group flex items-center justify-center rounded-full transition-all duration-300 ${
                  isActive ? "w-8 sm:w-11 h-2 bg-white/20" : "size-2 bg-white/40 hover:bg-white/80"
                }`}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

