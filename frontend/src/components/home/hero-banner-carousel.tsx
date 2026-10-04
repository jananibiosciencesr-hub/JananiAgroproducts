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
      <div className="relative w-full overflow-hidden">
        <div
          className="flex w-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className="w-full shrink-0 relative flex justify-center items-center"
            >
              <Link
                to={slide.link}
                className="block w-full relative group cursor-pointer focus:outline-hidden"
                tabIndex={current === idx ? 0 : -1}
                aria-label={slide.title}
              >
                {/* Responsive Picture: Portrait 9:16 for mobile screens, Landscape 16:9 for desktop */}
                <picture className="w-full block">
                  <source
                    media="(max-width: 768px)"
                    srcSet={slide.mobileImage}
                  />
                  <img
                    src={slide.desktopImage}
                    alt={slide.alt}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="w-full h-auto max-h-[88vh] object-cover sm:object-contain mx-auto block transition-transform duration-700 group-hover:scale-[1.01]"
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
      </div>

      {/* Clean Bottom Pagination Indicators below banner (Zero overlap with banner buttons) */}
      <div className="py-2.5 sm:py-3.5 flex items-center justify-center gap-2 bg-white">
        {HERO_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrent(idx)}
            aria-label={`Jump to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              current === idx
                ? "w-8 sm:w-10 h-2 sm:h-2.5 bg-[#075B32]"
                : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
