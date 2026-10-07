import { Link } from "@tanstack/react-router";
import jananiLogo from "@/assets/janani-agro-logo.png";

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
      className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}
      aria-label="JANANI AGRO PRODUCTS home"
    >
      {/* Circular Emblem on the Left */}
      <div className="size-11 sm:size-12.5 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-emerald-50/80 border border-emerald-200/60 shadow-xs">
        <img
          src={jananiLogo}
          alt="JANANI AGRO PRODUCTS"
          className="w-[125%] h-[125%] max-w-none object-cover object-top -mt-0.5 transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Brand Text on the Right */}
      <div className="flex flex-col text-left leading-none">
        <span className="font-display text-sm sm:text-base font-black tracking-tight text-[#075B32]">
          JANANI AGRO
        </span>
        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#D99A12] mt-0.5">
          Products
        </span>
        <span className="text-[8px] sm:text-[9px] font-semibold text-[#0B6B35]/75 tracking-wider mt-0.5">
          Pure Soil to Soul
        </span>
      </div>
    </Link>
  );
}