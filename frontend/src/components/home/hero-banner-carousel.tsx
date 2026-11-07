import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sprout,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Droplets,
  GitBranch,
  Leaf,
} from "lucide-react";
import { getHeroBanners, type HeroBanner } from "@/lib/api";

export interface BannerFeature {
  icon: string;
  label: string;
}

export interface BannerSlide {
  id: string;
  title: string;
  link: string;
  desktopImage: string;
  mobileImage: string;
  alt: string;
  ctaText: string;
  eyebrow?: string | undefined;
  badgeText?: string | undefined;
  subtitle?: string | undefined;
  features?: BannerFeature[] | undefined;
  secondaryCtaLabel?: string | undefined;
  secondaryCtaUrl?: string | undefined;
  desktopPosition?: string | undefined;
  mobilePosition?: string | undefined;
}

export const HERO_SLIDES: BannerSlide[] = [
  {
    id: "healthier-tomorrow",
    title: "Natural Solutions For A Healthier Tomorrow",
    link: "/products",
    desktopImage: "/banners/hero_healthier_tomorrow_desktop.jpg",
    mobileImage: "/banners/hero_healthier_tomorrow_mobile.jpg",
    alt: "Janani Agro Products - Grow Healthy Crops With Natural Care",
    ctaText: "Explore Our Products",
    desktopPosition: "md:object-center",
    mobilePosition: "object-top",
  },
  {
    id: "organic-biocare",
    title: "100% Organic Bio-Defense",
    link: "/categories/bio-fungicides",
    desktopImage: "/banners/hero_biocare_desktop.jpg",
    mobileImage: "/banners/hero_biocare_mobile.jpg",
    alt: "Janani Agro Products - Shield Your Crops Naturally",
    ctaText: "Explore Bio-Care",
    desktopPosition: "md:object-center",
    mobilePosition: "object-top",
  },
  {
    id: "organic-soilcare",
    title: "Organic Soil Nutrition",
    link: "/categories/bio-fertilizers",
    desktopImage: "/banners/hero_soilcare_desktop.jpg",
    mobileImage: "/banners/hero_soilcare_mobile.jpg",
    alt: "Janani Agro Products - Nourish From Root To Harvest",
    ctaText: "Explore Soil-Care",
    desktopPosition: "md:object-center",
    mobilePosition: "object-top",
  },
];

export function HeroBannerCarousel() {
  const [slides, setSlides] = useState<BannerSlide[]>(HERO_SLIDES);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const loadBanners = async () => {
    try {
      const cmsBanners = await getHeroBanners();
      if (Array.isArray(cmsBanners) && cmsBanners.length > 0) {
        // Filter out any stale product bottle cutouts if previously cached
        const validCmsBanners = cmsBanners.filter((b: HeroBanner) => {
          const img = b.desktopImageUrl || (b as any).desktopImage || "";
          return (
            !img.includes("/products/harit") &&
            !img.includes("/products/suraksha") &&
            !img.includes("/products/bhumi") &&
            !img.includes("neem-oil")
          );
        });
        const active = (validCmsBanners.length > 0 ? validCmsBanners : HERO_SLIDES).filter(
          (b: any) => b.active !== false
        );
        if (active.length > 0) {
          const mapped: BannerSlide[] = active.map((b: any) => {
            let desktop = b.desktopImageUrl || b.desktopImage || b.image || "/banners/hero_healthier_tomorrow_desktop.jpg";
            let mobile = b.mobileImageUrl || b.mobileImage || desktop;

            const isBuiltinDefault =
              b.id === "healthier-tomorrow" ||
              b.id === "organic-biocare" ||
              b.id === "organic-soilcare" ||
              desktop.includes("/banners/hero_");

            if (b.id === "healthier-tomorrow" || desktop.includes("healthier")) {
              desktop = "/banners/hero_healthier_tomorrow_desktop.jpg";
              mobile = "/banners/hero_healthier_tomorrow_mobile.jpg";
            } else if (b.id === "organic-biocare" || desktop.includes("biocare")) {
              desktop = "/banners/hero_biocare_desktop.jpg";
              mobile = "/banners/hero_biocare_mobile.jpg";
            } else if (b.id === "organic-soilcare" || desktop.includes("soilcare")) {
              desktop = "/banners/hero_soilcare_desktop.jpg";
              mobile = "/banners/hero_soilcare_mobile.jpg";
            }

            let desktopPos = b.desktopPosition;
            if (
              !desktopPos ||
              (isBuiltinDefault &&
                (desktopPos === "md:object-top" ||
                  desktopPos === "object-top" ||
                  desktopPos === "md:object-center" ||
                  desktopPos === "md:object-hero-center" ||
                  desktopPos.includes("object-hero")))
            ) {
              desktopPos = "md:object-center";
            } else if (!desktopPos.startsWith("md:")) {
              desktopPos = `md:${desktopPos}`;
            }

            return {
              id: b.id,
              title: b.title || "Natural Solutions For A Healthier Tomorrow",
              link: b.primaryCtaUrl || b.link || "/products",
              desktopImage: desktop,
              mobileImage: mobile,
              alt: b.title || "Janani Agro Products - Grow Healthy Crops With Natural Care",
              ctaText: b.primaryCtaLabel || b.ctaText || "Explore Products",
              eyebrow: b.eyebrow,
              badgeText: b.badgeText,
              subtitle: b.subtitle,
              features: b.features,
              secondaryCtaLabel: isBuiltinDefault ? undefined : b.secondaryCtaLabel,
              secondaryCtaUrl: isBuiltinDefault ? undefined : b.secondaryCtaUrl,
              desktopPosition: desktopPos,
              mobilePosition: b.mobilePosition || "object-top",
            };
          });
          setSlides(mapped);
          return;
        }
      }
    } catch (err) {
      console.error("Error loading hero banners for carousel:", err);
    }
    setSlides(HERO_SLIDES);
  };

  useEffect(() => {
    loadBanners();

    const handleUpdate = () => {
      loadBanners();
    };

    window.addEventListener("janani_cms_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("janani_cms_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const total = slides.length || 1;

  const nextSlide = () => setCurrent((prev) => (prev + 1) % total);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + total) % total);

  // Auto-play timer (5 seconds)
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [current, isPaused, total]);

  // Ensure current slide index is valid if slide count changes
  useEffect(() => {
    if (current >= total) {
      setCurrent(0);
    }
  }, [total, current]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    if (touch) touchStartX.current = touch.clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    if (touch) touchEndX.current = touch.clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      nextSlide(); // Swiped left -> next
    } else if (diff < -45) {
      prevSlide(); // Swiped right -> prev
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const renderFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case "Sprout":
        return <Sprout className="size-3 sm:size-3.5 text-[#075B32] shrink-0" />;
      case "TrendingUp":
        return <TrendingUp className="size-3 sm:size-3.5 text-[#075B32] shrink-0" />;
      case "ShieldCheck":
        return <ShieldCheck className="size-3 sm:size-3.5 text-[#075B32] shrink-0" />;
      case "Sparkles":
        return <Sparkles className="size-3 sm:size-3.5 text-[#075B32] shrink-0" />;
      case "Droplets":
        return <Droplets className="size-3 sm:size-3.5 text-[#075B32] shrink-0" />;
      case "GitBranch":
        return <GitBranch className="size-3 sm:size-3.5 text-[#075B32] shrink-0" />;
      case "Leaf":
        return <Leaf className="size-3 sm:size-3.5 text-[#075B32] shrink-0" />;
      default:
        return <Sprout className="size-3 sm:size-3.5 text-[#075B32] shrink-0" />;
    }
  };

  return (
    <section
      data-no-scroll-reveal="true"
      className="relative overflow-hidden bg-white select-none hero-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Janani Agro Featured Campaigns"
    >
      {/* Slides Container - Dedicated aspect ratios matching native banner assets for edge-to-edge full screen width with zero crop */}
      <div className="relative w-full aspect-[9/16] sm:aspect-[1376/768] overflow-hidden">
        <div
          className="flex w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, idx) => {
            const isCurrent = current === idx;
            const isGraphicBanner =
              slide.desktopImage.includes("/banners/hero_") ||
              slide.desktopImage.includes("/banners/banner_") ||
              slide.title === "." ||
              slide.title === "-" ||
              !slide.title.trim();

            const hasTextContent =
              !isGraphicBanner &&
              Boolean(
                (slide.eyebrow && slide.eyebrow.trim()) ||
                  (slide.subtitle && slide.subtitle.trim()) ||
                  (slide.badgeText && slide.badgeText.trim()) ||
                  (slide.title && slide.title.trim())
              );
            const mobileSrc = slide.mobileImage && slide.mobileImage.trim() ? slide.mobileImage : slide.desktopImage;

            return (
              <div
                key={slide.id || idx}
                className="w-full h-full shrink-0 relative overflow-hidden bg-[#021f10]"
              >
                {/* Responsive Picture: Edge-to-edge full screen width on all screens with zero side margins */}
                <picture className="w-full h-full block">
                  {mobileSrc && (
                    <source
                      media="(max-width: 640px)"
                      srcSet={mobileSrc}
                    />
                  )}
                  <img
                    src={slide.desktopImage}
                    alt={slide.alt || slide.title}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className={`w-full h-full object-cover block transition-transform duration-700 ${
                      slide.mobilePosition ? (slide.mobilePosition.includes("object-") ? slide.mobilePosition : `object-${slide.mobilePosition}`) : "object-top"
                    } ${
                      slide.desktopPosition ? (slide.desktopPosition.includes("object-") ? (slide.desktopPosition.startsWith("md:") ? slide.desktopPosition : `md:${slide.desktopPosition}`) : `md:object-${slide.desktopPosition}`) : "md:object-center"
                    }`}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.includes("hero_healthier_tomorrow_desktop")) {
                        target.src = "/banners/hero_healthier_tomorrow_desktop.jpg";
                      }
                    }}
                  />
                </picture>

                {/* Option 2: Dynamic HTML/CSS Text Overlay with refined, proportionate typography */}
                {hasTextContent ? (
                  <div className="absolute inset-0 z-10 flex items-start sm:items-center pointer-events-none">
                    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-4 sm:px-8 md:px-12 lg:px-16 pt-3.5 sm:pt-4 pb-3 pointer-events-auto">
                      {/* Badge Tag */}
                      {slide.badgeText && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-white/90 backdrop-blur-xs px-2.5 sm:px-3 py-0.5 sm:py-1 mb-1 sm:mb-2 shadow-xs">
                          <span className="size-1.5 rounded-full bg-[#0B6B35] animate-pulse" />
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#075B32]">
                            {slide.badgeText}
                          </span>
                        </div>
                      )}

                      {/* Eyebrow */}
                      {slide.eyebrow && (
                        <p className="text-[10px] sm:text-xs md:text-xs lg:text-sm font-extrabold uppercase tracking-wider text-[#0B6B35] mb-0.5 font-sans">
                          {slide.eyebrow}
                        </p>
                      )}

                      {/* Title - slightly smaller, refined typography */}
                      {slide.title && (
                        <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-3.5xl xl:text-4xl font-black text-[#075B32] tracking-tight leading-[1.15] drop-shadow-xs">
                          {slide.title}
                        </h2>
                      )}

                      {/* Subtitle */}
                      {slide.subtitle && (
                        <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs md:text-sm text-stone-700 font-medium leading-relaxed max-w-xs sm:max-w-md drop-shadow-xs line-clamp-2">
                          {slide.subtitle}
                        </p>
                      )}

                      {/* 4 Feature Badges (if present) */}
                      {slide.features && slide.features.length > 0 && (
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 my-2 sm:my-3 max-w-xs sm:max-w-md">
                          {slide.features.map((feat, fIdx) => (
                            <div
                              key={fIdx}
                              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-white/90 backdrop-blur-xs border border-emerald-800/10 shadow-xs text-[9px] sm:text-xs font-bold text-[#075B32]"
                            >
                              {renderFeatureIcon(feat.icon)}
                              <span className="truncate">{feat.label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CTA Buttons */}
                      <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-2.5">
                        <Link
                          to={slide.link || "/products"}
                          tabIndex={isCurrent ? 0 : -1}
                          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#075B32] hover:bg-[#064e2b] text-white px-3.5 sm:px-5.5 py-1.5 sm:py-2 text-[11px] sm:text-sm font-bold shadow-md shadow-[#075B32]/25 hover:shadow-lg transition-transform active:scale-95 cursor-pointer"
                        >
                          <span>{slide.ctaText || "Explore Products"}</span>
                          <ArrowRight className="size-3 sm:size-4" />
                        </Link>
                        {slide.secondaryCtaLabel && (
                          <Link
                            to={slide.secondaryCtaUrl || "/contact"}
                            tabIndex={isCurrent ? 0 : -1}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#075B32]/40 bg-white/90 hover:bg-[#075B32] hover:text-white px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#075B32] backdrop-blur-xs shadow-xs transition-all cursor-pointer"
                          >
                            <span>{slide.secondaryCtaLabel}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Entire graphic banner acts as a clickable background link */
                  <Link
                    to={slide.link || "/products"}
                    className="absolute inset-0 z-10 cursor-pointer"
                    tabIndex={isCurrent ? 0 : -1}
                    aria-label={slide.title || "Janani Agro Banner"}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Sleek Floating Navigation Buttons (< and >) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                prevSlide();
              }}
              aria-label="Previous Slide"
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 size-9 sm:size-12 rounded-full bg-white/90 hover:bg-white text-[#075B32] hover:text-[#4FAE2A] shadow-lg border border-[#D99A12]/40 backdrop-blur-md flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="size-5 sm:size-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                nextSlide();
              }}
              aria-label="Next Slide"
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 size-9 sm:size-12 rounded-full bg-white/90 hover:bg-white text-[#075B32] hover:text-[#4FAE2A] shadow-lg border border-[#D99A12]/40 backdrop-blur-md flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight className="size-5 sm:size-6" />
            </button>
          </>
        )}

        {/* Sleek Floating Pagination Indicators inside banner (Zero space gap) */}
        {total > 1 && (
          <div className="absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/35 backdrop-blur-xs px-2.5 sm:px-3 py-1 rounded-full border border-white/10 shadow-sm pointer-events-auto">
            {slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                onClick={() => setCurrent(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  current === idx
                    ? "w-6 sm:w-7 h-1.5 bg-[#E7A91A] shadow-xs"
                    : "w-1.5 h-1.5 bg-white/70 hover:bg-white"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
