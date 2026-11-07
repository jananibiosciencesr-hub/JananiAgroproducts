import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { getHeroBanners, type HeroBanner } from "@/lib/api";

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
    desktopPosition: "md:object-hero-center",
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
    desktopPosition: "md:object-hero-center",
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
    desktopPosition: "md:object-hero-center",
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
          return !img.includes("/products/harit") && !img.includes("/products/suraksha") && !img.includes("/products/bhumi") && !img.includes("neem-oil");
        });
        const active = (validCmsBanners.length > 0 ? validCmsBanners : HERO_SLIDES).filter((b: any) => b.active !== false);
        if (active.length > 0) {
          const mapped: BannerSlide[] = active.map((b: any) => {
            const desktop = b.desktopImageUrl || b.desktopImage || b.image || "/banners/hero_healthier_tomorrow_desktop.jpg";
            const mobile = b.mobileImageUrl || b.mobileImage || desktop;
            const isBuiltinDefault =
              b.id === "healthier-tomorrow" ||
              b.id === "organic-biocare" ||
              b.id === "organic-soilcare" ||
              desktop.includes("/banners/hero_");

            let desktopPos = b.desktopPosition;
            if (!desktopPos || (isBuiltinDefault && (desktopPos === "md:object-top" || desktopPos === "object-top" || desktopPos === "md:object-center"))) {
              desktopPos = isBuiltinDefault ? "md:object-hero-center" : "md:object-top";
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
      {/* Slides Container - Compact, proportionate hero banner on all devices */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] md:aspect-[16/7.5] lg:aspect-[16/7] xl:aspect-[16/6.8] 2xl:aspect-[16/6.5] max-h-[360px] sm:max-h-[350px] md:max-h-[380px] lg:max-h-[420px] xl:max-h-[440px] 2xl:max-h-[460px] overflow-hidden">
        <div
          className="flex w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, idx) => {
            const isCurrent = current === idx;
            const isGraphicBanner =
              slide.desktopImage.includes("/banners/hero_") ||
              slide.desktopImage.includes("/banners/banner_") ||
              slide.desktopImage.startsWith("data:image/") ||
              slide.id === "healthier-tomorrow" ||
              slide.id === "organic-biocare" ||
              slide.id === "organic-soilcare" ||
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
                className="w-full h-full shrink-0 relative overflow-hidden"
              >
                {/* Responsive Picture: Portrait for mobile screens, Landscape for desktop */}
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
                      slide.desktopPosition ? (slide.desktopPosition.includes("object-") ? (slide.desktopPosition.startsWith("md:") ? slide.desktopPosition : `md:${slide.desktopPosition}`) : `md:object-${slide.desktopPosition}`) : "md:object-hero-center"
                    }`}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.includes("hero_healthier_tomorrow")) {
                        target.src = "/banners/hero_healthier_tomorrow_desktop.jpg";
                      }
                    }}
                  />
                </picture>

                {/* If slide has custom text content (like newly added admin slides with uploaded or URL image) */}
                {hasTextContent ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent flex items-center z-10 pointer-events-none">
                    <div className="max-w-xl sm:max-w-2xl px-5 sm:px-12 md:px-16 py-4 pointer-events-auto">
                      {slide.badgeText && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-slate-950/70 px-3 py-1 backdrop-blur-md mb-2 shadow-xs">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300">
                            {slide.badgeText}
                          </span>
                        </div>
                      )}
                      {slide.eyebrow && (
                        <p className="text-[11px] sm:text-xs md:text-sm font-extrabold uppercase tracking-wider text-amber-400 drop-shadow mb-1 font-sans">
                          {slide.eyebrow}
                        </p>
                      )}
                      {slide.title && (
                        <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-md">
                          {slide.title}
                        </h2>
                      )}
                      {slide.subtitle && (
                        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base text-slate-100/90 leading-relaxed max-w-lg drop-shadow line-clamp-2 sm:line-clamp-3">
                          {slide.subtitle}
                        </p>
                      )}
                      <div className="mt-3 sm:mt-5 flex flex-wrap items-center gap-3">
                        <Link
                          to={slide.link || "/products"}
                          tabIndex={isCurrent ? 0 : -1}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-black/20 hover:shadow-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <span>{slide.ctaText || "Explore Products"}</span>
                          <ArrowRight className="size-3.5 sm:size-4" />
                        </Link>
                        {slide.secondaryCtaLabel && (
                          <Link
                            to={slide.secondaryCtaUrl || "/contact"}
                            tabIndex={isCurrent ? 0 : -1}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-slate-950/40 hover:bg-white hover:text-slate-950 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-lg transition-all hover:scale-105 cursor-pointer"
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
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 size-9 sm:size-12 rounded-full bg-white/90 hover:bg-white text-[#075B32] hover:text-[#4FAE2A] shadow-lg border border-[#D99A12]/40 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
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
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 size-9 sm:size-12 rounded-full bg-white/90 hover:bg-white text-[#075B32] hover:text-[#4FAE2A] shadow-lg border border-[#D99A12]/40 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="size-5 sm:size-6" />
            </button>
          </>
        )}

        {/* Sleek Floating Pagination Indicators inside banner (Zero space gap) */}
        {total > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/25 backdrop-blur-xs px-3 py-1.5 rounded-full">
            {slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                onClick={() => setCurrent(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${current === idx
                    ? "w-7 sm:w-8 h-2 bg-[#E7A91A] shadow-xs"
                    : "w-2 h-2 bg-white/70 hover:bg-white"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
