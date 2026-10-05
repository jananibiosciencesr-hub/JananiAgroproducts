import React, { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface DiseaseItem {
  id: string;
  name: string;
  queryParam: string;
  image: string;
  isPopular?: boolean;
}

const DISEASES: DiseaseItem[] = [
  {
    id: "mustard-aphid",
    name: "Mustard Aphid",
    queryParam: "aphid",
    image: "/images/diseases/mustard-aphid.png"
  },
  {
    id: "paddy-sheath-blight",
    name: "Paddy Sheath Blight",
    queryParam: "sheath blight",
    image: "/images/diseases/paddy-sheath-blight.png"
  },
  {
    id: "gram-pod-borers",
    name: "Gram pod borers",
    queryParam: "borer",
    image: "/images/diseases/gram-pod-borers.png",
    isPopular: true
  },
  {
    id: "rice-blast",
    name: "Rice Blast",
    queryParam: "blast",
    image: "/images/diseases/rice-blast.png"
  },
  {
    id: "bacterial-leaf-blight",
    name: "Bacterial Leaf Blight",
    queryParam: "bacterial blight",
    image: "/images/diseases/bacterial-leaf-blight.png"
  },
  {
    id: "helicoverpa-armigera",
    name: "Helicoverpa armigera",
    queryParam: "helicoverpa",
    image: "/images/diseases/helicoverpa-armigera.png"
  }
];

export function ShopByDisease() {
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
              Shop By Disease & Pest
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
              Protect your crops from diseases and pests.
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

        {/* Carousel Row of Diseases & Pests */}
        <div
          ref={scrollRef}
          className="flex items-center justify-start lg:justify-between gap-4 sm:gap-6 lg:gap-8 overflow-x-auto scrollbar-none pb-2 pt-1 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {DISEASES.map((disease) => (
            <Link
              key={disease.id}
              to="/diseases/$slug"
              params={{ slug: disease.id }}
              className="group flex flex-col items-center flex-shrink-0 snap-start select-none w-28 sm:w-32 md:w-36 text-center"
            >
              {/* Circular Avatar / Card */}
              <div
                className="size-24 sm:size-28 md:size-32 rounded-full bg-[#f4f7f2] flex items-center justify-center p-1.5 sm:p-2 transition-all duration-300 group-hover:scale-105 group-hover:bg-[#ebf3e7] relative overflow-hidden"
              >
                <img
                  src={disease.image}
                  alt={disease.name}
                  loading="lazy"
                  className="h-full w-full object-contain rounded-full transition-transform duration-500 group-hover:scale-110 drop-shadow-xs"
                />
              </div>

              {/* Disease Label */}
              <span
                className={`text-xs sm:text-sm font-medium mt-2.5 sm:mt-3 text-center transition-colors line-clamp-1 ${
                  disease.isPopular
                    ? "text-[#075B32] font-semibold"
                    : "text-slate-700 group-hover:text-[#4FAE2A]"
                }`}
              >
                {disease.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
