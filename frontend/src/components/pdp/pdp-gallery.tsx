import React, { useState, useRef } from "react";
import {
  Play,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Leaf,
  Maximize2,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroImage, pantryImage, productsImage, storyImage, getProductImage, type Product } from "@/lib/catalog";

interface PdpGalleryProps {
  product: Product;
}

export function PdpGallery({ product }: PdpGalleryProps) {
  // Gallery images array
  const galleryImages = [
    { id: "main", src: getProductImage(product.name || product.category, product.image), alt: `${product.name} - Front Package View`, label: "Main Pack" },
    { id: "pantry", src: pantryImage, alt: `${product.name} - Pantry Lifestyle Texture`, label: "Pantry Texture" },
    { id: "story", src: storyImage, alt: `${product.name} - Farm Origin Harvest`, label: "Farm Harvest" },
    { id: "products", src: productsImage, alt: `${product.name} - Pure Harvest Batch`, label: "Batch Close-up" },
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Zoom lens coordinates on hover
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const activeImage = galleryImages[activeImageIndex] || galleryImages[0]!;

  return (
    <div className="space-y-4">
      {/* Main Image Viewport with Zoom Lens */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-soft">
        {/* Badges Overlay */}
        <div className="absolute left-5 top-5 z-10 flex flex-col gap-1.5 items-start">
          <span className="rounded-full bg-cream/95 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-md backdrop-blur-md">
            {product.badge ?? "100% Certified Organic"}
          </span>
          {product.discount > 0 && (
            <span className="rounded-full bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold shadow-md">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Action Overlays (Zoom & Video) */}
        <div className="absolute right-5 top-5 z-10 flex items-center gap-2">
          {/* Video Preview Button */}
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-brand-gold text-forest px-3.5 py-1.5 text-xs font-bold shadow-md hover:bg-amber-400 transition transform hover:scale-105"
          >
            <Play className="size-3.5 fill-current" />
            Watch Farm Video
          </button>

          {/* Fullscreen Lightbox Button */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="size-9 rounded-full bg-background/80 text-foreground backdrop-blur-md flex items-center justify-center hover:bg-muted transition shadow-md"
            title="Expand Fullscreen Image"
          >
            <Maximize2 className="size-4" />
          </button>
        </div>

        {/* Interactive Image Container */}
        <div
          ref={imageContainerRef}
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsLightboxOpen(true)}
          className="relative aspect-square w-full cursor-zoom-in overflow-hidden bg-secondary flex items-center justify-center"
        >
          <img
            src={activeImage.src}
            alt={activeImage.alt}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = pantryImage;
            }}
            className={`h-full w-full object-cover transition-transform duration-200 ${
              isZooming ? "scale-150" : "scale-100"
            }`}
            style={
              isZooming
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : undefined
            }
          />

          {/* Zoom Instruction Hint */}
          <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm pointer-events-none flex items-center gap-1.5">
            <ZoomIn className="size-3.5" /> Hover to Zoom • Click to Expand
          </span>
        </div>
      </div>

      {/* Thumbnails Row + Video Thumbnail */}
      <div className="grid grid-cols-5 gap-3">
        {galleryImages.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setActiveImageIndex(idx)}
            className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition ${
              activeImageIndex === idx
                ? "border-primary shadow-md ring-2 ring-primary/20 scale-105"
                : "border-border/80 hover:border-primary/50 opacity-80 hover:opacity-100"
            }`}
          >
            <img src={img.src} alt={img.label} className="h-full w-full object-cover" />
            <span className="absolute bottom-1 inset-x-1 rounded bg-black/60 py-0.5 text-[9px] font-semibold text-white text-center truncate">
              {img.label}
            </span>
          </button>
        ))}

        {/* 5th Tile: Farm Video Thumbnail */}
        <button
          onClick={() => setIsVideoModalOpen(true)}
          className="relative aspect-square overflow-hidden rounded-2xl border-2 border-brand-gold/60 bg-forest flex flex-col items-center justify-center text-center p-2 text-white group hover:border-brand-gold transition shadow-sm"
        >
          <div className="size-7 rounded-full bg-brand-gold text-forest flex items-center justify-center mb-1 group-hover:scale-110 transition">
            <Play className="size-3.5 fill-current ml-0.5" />
          </div>
          <span className="text-[10px] font-bold text-brand-gold leading-tight">
            Farm Story Video
          </span>
        </button>
      </div>

      {/* Lightbox Fullscreen Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white rounded-full p-2 bg-white/10"
          >
            <X className="size-6" />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] flex items-center justify-center">
            <img
              src={activeImage.src}
              alt={activeImage.alt}
              className="max-h-[80vh] w-auto rounded-3xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[2.5rem] bg-forest border border-border shadow-2xl p-6 sm:p-8 text-cream">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-5 right-5 text-cream/70 hover:text-cream rounded-full p-2 bg-black/30"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 text-brand-gold text-xs font-bold uppercase tracking-wider mb-2">
              <Leaf className="size-4" /> Traditional Extraction & Farm Provenance
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-4">
              Behind The Harvest: {product.name}
            </h3>

            {/* Video Simulated Player */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/10 flex items-center justify-center">
              <img
                src={storyImage}
                alt="Farm Harvest Process"
                className="h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              <div className="absolute text-center px-4">
                <div className="size-16 rounded-full bg-brand-gold text-forest flex items-center justify-center mx-auto mb-3 shadow-xl animate-pulse">
                  <Play className="size-8 fill-current ml-1" />
                </div>
                <p className="text-sm font-semibold text-white">
                  38°C Slow Wood-Pressed / Stone-Ground Live Demonstration
                </p>
                <p className="text-xs text-cream/80 mt-1">
                  Single-origin harvest from {product.origin} with zero chemical processing.
                </p>
              </div>

              {/* Controls bar */}
              <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-xs text-white/80 bg-black/60 px-4 py-2 rounded-xl backdrop-blur-sm">
                <span className="flex items-center gap-2">
                  <Play className="size-3.5 fill-current text-brand-gold" />
                  01:45 / 03:20
                </span>
                <span className="flex items-center gap-2 text-[11px]">
                  <Volume2 className="size-3.5" /> 1080p HD Farm Cam
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-cream/80">
              <span>🌾 Verified NPOP Certified Farm Harvest</span>
              <Button
                variant="gold"
                size="sm"
                onClick={() => setIsVideoModalOpen(false)}
                className="rounded-full text-xs font-bold"
              >
                Back to Product Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
