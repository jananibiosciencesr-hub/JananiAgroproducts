import { Link } from "@tanstack/react-router";
import jananiEmblem from "@/assets/janani-emblem.png";
import { Sparkles } from "lucide-react";

export function Brand({
  compact = false,
  dark = false,
  className = "",
}: {
  compact?: boolean;
  dark?: boolean;
  className?: string;
}) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 sm:gap-3 group select-none shrink-0 ${className}`}
      aria-label="JANANI AGRO PRODUCTS home"
    >
      {/* Emblem with subtle ambient glow and hover lift */}
      <div className="relative shrink-0">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#075B32]/20 via-[#D99A12]/20 to-transparent blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={jananiEmblem}
          alt="JANANI AGRO PRODUCTS"
          className="relative size-8.5 sm:size-11 md:size-13 object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(7,91,50,0.18)] transition-all duration-300 group-hover:scale-105"
        />
      </div>

      {/* Brand Typography with Premium Hierarchy */}
      <div className="flex flex-col text-left leading-none whitespace-nowrap min-w-0">
        <span className="font-display text-[15px] sm:text-[18px] md:text-[19px] font-black tracking-tight text-[#075B32] group-hover:text-[#054324] transition-colors whitespace-nowrap">
          JANANI AGRO
        </span>
        <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
          <span className="text-[9px] sm:text-[10.5px] font-extrabold uppercase tracking-[0.2em] bg-gradient-to-r from-[#D99A12] via-[#E7A91A] to-[#B87B08] bg-clip-text text-transparent">
            PRODUCTS
          </span>
          <span className="text-[7.5px] sm:text-[9px] font-semibold text-[#0B6B35]/85 tracking-wide flex items-center gap-0.5">
            <span className="text-[#D99A12] font-black leading-none">•</span>
            <Sparkles className="size-2 text-[#D99A12] fill-current" />
            Pure Soil to Soul
          </span>
        </div>
      </div>
    </Link>
  );
}