import React, { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface CropItem {
  id: string;
  name: string;
  queryParam: string;
  image: string;
}

const CROPS: CropItem[] = [
  {
    id: "rice",
    name: "Rice (Transplanted...)",
    queryParam: "rice",
    image: "/images/crops/rice.jpg"
  },
  {
    id: "cotton",
    name: "Cotton",
    queryParam: "cotton",
    image: "/images/crops/cotton.jpg"
  },
  {
    id: "soyabean",
    name: "Soya Bean",
    queryParam: "soya",
    image: "/images/crops/soyabean.jpg"
  },
  {
    id: "maize",
    name: "Maize",
    queryParam: "maize",
    image: "/images/crops/maize.jpg"
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    queryParam: "sugarcane",
    image: "/images/crops/sugarcane.jpg"
  },
  {
    id: "groundnut",
    name: "Groundnut",
    queryParam: "groundnut",
    image: "/images/crops/groundnut.jpg"
  },
  {
    id: "wheat",
    name: "Wheat",
    queryParam: "wheat",
    image: "/products/category-rice.jpg"
  },
  {
    id: "chilli",
    name: "Chilli & Spices",
    queryParam: "spices",
    image: "/products/category-spices.jpg"
  }
];

export function ShopByCrop() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-white">
      <div className="mx-auto max-w-7xl bg-white p-2 sm:p-3 relative">
        {/* Header row: Title, Subtitle, and View All link */}
        <div className="flex items-center justify-between gap-3 mb-2 sm:mb-2.5">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-[1.5rem] font-black text-[#075B32] tracking-tight">
              Shop By Crop
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Get solutions customized for your crops.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Scroll navigation arrows for carousel */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
                className="size-8 rounded-full bg-slate-100 text-[#075B32] flex items-center justify-center transition hover:bg-[#F8FAEE] hover:text-[#4FAE2A] hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
                className="size-8 rounded-full bg-slate-100 text-[#075B32] flex items-center justify-center transition hover:bg-[#F8FAEE] hover:text-[#4FAE2A] hover:scale-105 active:scale-95"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <Link
              to="/products"
              className="text-[#075B32] hover:text-[#4FAE2A] font-bold text-sm sm:text-base flex items-center gap-1 transition-colors group"
            >
              <span>View All</span>
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Carousel Row of Crops */}
        <div
          ref={scrollRef}
          className="flex items-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto scrollbar-none pb-2 pt-1 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {CROPS.map((crop) => (
            <Link
              key={crop.id}
              to="/crops/$slug"
              params={{ slug: crop.id }}
              className="group flex flex-col items-center flex-shrink-0 snap-start select-none w-28 sm:w-32 md:w-36 text-center"
            >
              {/* Circular Avatar / Card */}
              <div className="size-24 sm:size-28 md:size-32 rounded-full bg-[#f4f7f2] flex items-center justify-center p-2 sm:p-2.5 transition-all duration-300 group-hover:scale-105 group-hover:bg-[#ebf3e7] relative overflow-hidden">
                <img
                  src={crop.image}
                  alt={crop.name}
                  loading="lazy"
                  className="h-full w-full object-contain rounded-full transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Crop Label */}
              <span className="text-xs sm:text-sm font-semibold text-[#075B32] mt-2.5 sm:mt-3 text-center transition-colors group-hover:text-[#4FAE2A] line-clamp-1">
                {crop.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
