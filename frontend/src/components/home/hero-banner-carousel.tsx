import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export interface BannerSlide {
  id: string;
  title: string;
  link: string;
  desktopImage: string;
  mobileImage: string;
  alt: string;
  ctaText: string;
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
  },
  {
    id: "organic-biocare",
    title: "100% Organic Bio-Defense",
    link: "/categories/bio-fungicides",
    desktopImage: "/banners/hero_biocare_desktop.jpg",
    mobileImage: "/banners/hero_biocare_mobile.jpg",
    alt: "Janani Agro Products - Shield Your Crops Naturally",
    ctaText: "Explore Bio-Care",
  },
  {
    id: "organic-soilcare",
    title: "Organic Soil Nutrition",
    link: "/categories/bio-fertilizers",
    desktopImage: "/banners/hero_soilcare_desktop.jpg",
    mobileImage: "/banners/hero_soilcare_mobile.jpg",
    alt: "Janani Agro Products - Nourish From Root To Harvest",
    ctaText: "Explore Soil-Care",
  },
];

export function HeroBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = HERO_SLIDES.length;

  const nextSlide = () => setCurrent((prev) => (prev + 1) % total);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + total) % total);

  // Auto-play timer (5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [current, isPaused]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
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
      className="relative overflow-hidden bg-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Janani Agro Featured Campaigns"
    >
      {/* Slides Container */}
      <div className="relative w-full h-[380px] sm:h-[420px] md:h-[460px] lg:h-[500px] xl:h-[540px] overflow-hidden">
        <div
          className="flex w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className="w-full h-full shrink-0 relative"
            >
              <Link
                to={slide.link}
                className="block w-full h-full relative group cursor-pointer focus:outline-hidden"
                tabIndex={current === idx ? 0 : -1}
                aria-label={slide.title}
              >
                {/* Responsive Picture: Portrait 9:16 for mobile screens, Landscape for desktop */}
                <picture className="w-full h-full block">
                  <source
                    media="(max-width: 768px)"
                    srcSet={slide.mobileImage}
                  />
                  <img
                    src={slide.desktopImage}
                    alt={slide.alt}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-cover object-center block transition-transform duration-700 group-hover:scale-[1.01]"
                  />
                </picture>
              </Link>
            </div>
          ))}
        </div>

        {/* Sleek Floating Navigation Buttons (< and >) */}
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

        {/* Sleek Floating Pagination Indicators inside banner (Zero space gap) */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/25 backdrop-blur-xs px-3 py-1.5 rounded-full">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrent(idx)}
              aria-label={`Jump to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                current === idx
                  ? "w-7 sm:w-8 h-2 bg-[#E7A91A] shadow-xs"
                  : "w-2 h-2 bg-white/70 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
