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
      className={`flex min-w-0 items-center gap-2 group ${className}`}
      aria-label="JANANI AGRO PRODUCTS home"
    >
      <img
        src={jananiLogo}
        alt="JANANI AGRO PRODUCTS"
        className="h-13 sm:h-16 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
      />
    </Link>
  );
}