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
      className={`inline-flex items-center gap-3 sm:gap-3.5 group select-none ${className}`}
      aria-label="JANANI AGRO PRODUCTS home"
    >
      {/* Emblem with subtle ambient glow and hover lift */}
      <div className="relative shrink-0">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#075B32]/20 via-[#D99A12]/20 to-transparent blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={jananiEmblem}
          alt="JANANI AGRO PRODUCTS"
          className="relative size-11 sm:size-13 md:size-14 object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(7,91,50,0.18)] transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_4px_12px_rgba(217,154,18,0.3)]"
        />
      </div>

      {/* Brand Typography with Premium Hierarchy */}
      <div className="flex flex-col text-left leading-none">
        <span className="font-display text-[15px] sm:text-[18px] md:text-[19px] font-black tracking-tight text-[#075B32] group-hover:text-[#054324] transition-colors">
          JANANI AGRO
        </span>
        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.24em] bg-gradient-to-r from-[#D99A12] via-[#E7A91A] to-[#B87B08] bg-clip-text text-transparent mt-0.5">
          PRODUCTS
        </span>
        <span className="text-[8.5px] sm:text-[9.5px] font-semibold text-[#0B6B35]/80 tracking-wider mt-1 flex items-center gap-1">
          <Sparkles className="size-2 text-[#D99A12] fill-current" />
          Pure Soil to Soul
        </span>
      </div>
    </Link>
  );
}