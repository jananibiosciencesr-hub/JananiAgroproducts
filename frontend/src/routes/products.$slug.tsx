import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  Minus,
  Plus,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Zap,
  Leaf,
  Check,
  MapPin,
  ChevronDown,
  ChevronUp,
  Play,
  Maximize2,
  X,
  Sprout,
  Wheat,
  Bug,
  Sun,
  Sparkles,
  Award,
  Shield,
  Headphones,
  CheckCircle2,
  FileText,
  Droplets,
  ArrowRight,
  Mail,
  Users,
  Eye,
  Heart
} from "lucide-react";
import { products, categories, type Product, type ProductVariant } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";
import { toast } from "sonner";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => {
    const p = products.find((x) => x.slug === params.slug || String(x.id) === params.slug);
    const title = p
      ? `${p.name} — ${p.subtitle || "Janani Agro Products"}`
      : "Product Detail — JANANI AGRO PRODUCTS";
    const description =
      p?.description ??
      "Natural and effective agro solutions for healthier crops and higher yields.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductDetailPage,
});

type TabType =
  | "description"
  | "benefits"
  | "how-to-use"
  | "suitable-crops"
  | "technical"
  | "reviews"
  | "faqs";

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { addToCart, products: storeProducts } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : products;

  // Resolve active product
  const product =
    allProducts.find((p) => p.slug === slug || String(p.id) === slug) ||
    allProducts.find((p) => slug.includes(p.slug) || p.slug.includes(slug)) ||
    allProducts[0]!;

  // Variants setup
  const defaultVariant =
    product.variants.find((v) => v.unit.toLowerCase().includes("1 l") || v.label.includes("1 Litre")) ||
    product.variants[0] || {
      id: "1l",
      label: "1 Litre",
      unit: "1 Litre",
      price: product.price,
      oldPrice: product.oldPrice,
      inStock: true,
    };

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(defaultVariant);
  const [qty, setQty] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Sync selected variant when product slug changes
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const match1L = product.variants.find(
        (v) => v.unit.toLowerCase().includes("1 l") || v.label.includes("1 Litre")
      );
      setSelectedVariant(match1L || product.variants[0]!);
    }
    setQty(1);
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [product.slug]);

  // Gallery Images List matching mockup
  const galleryImages = useMemo(() => {
    return [
      { id: "main", src: product.image, label: "Main Pack" },
      { id: "soil", src: "/images/hands-soil-sprout.jpg", label: "Seedling in Soil" },
      { id: "roots", src: "/images/sprout_roots_circle.jpg", label: "Root Health" },
      {
        id: "label",
        src: product.image.includes("harit")
          ? "/products/harit-label.png"
          : product.image.includes("bhumi")
          ? "/products/bhumi-shakti-label.png"
          : product.image.includes("neem")
          ? "/products/neem-oil-label.png"
          : "/products/harit-label.png",
        label: "Dosage & Label Guide",
      },
      { id: "field", src: "/images/farmer_ramesh.jpg", label: "Field Results" },
      { id: "video", src: product.image, label: "Application Video", isVideo: true },
    ];
  }, [product]);

  const discountPercent = Math.round(
    ((selectedVariant.oldPrice - selectedVariant.price) / selectedVariant.oldPrice) * 100
  );

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addToCart(product.id);
    }
    toast.success(`Added ${qty}x ${product.name} (${selectedVariant.label}) to cart!`, {
      description: `₹${(selectedVariant.price * qty).toFixed(2)} • Quick checkout ready`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (user) {
      navigate({ to: "/checkout" });
    } else {
      navigate({ to: "/login", search: { redirect: "/checkout" } as any });
    }
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  // Recommended products (excluding current)
  const recommendedProducts = useMemo(() => {
    return allProducts.filter((p) => p.id !== product.id).slice(0, 5);
  }, [allProducts, product.id]);

  // Dynamic Benefits resolver
  const dynamicBenefits = useMemo(() => {
    if (product.benefits && product.benefits.length > 0) {
      return product.benefits;
    }
    const cat = (product.category || "").toLowerCase();
    if (cat.includes("fungicide")) {
      return [
        "Controls and suppresses soil-borne fungal pathogens and root rot",
        "Reduces damping-off, wilt, and collar rot in seedlings and mature crops",
        "Improves rhizosphere beneficial microbial biodiversity",
        "Enhances plant immunity against recurring environmental stress",
        "Promotes strong lateral root development and feeder hairs",
        "100% Residue-free and safe for certified organic farming"
      ];
    }
    if (cat.includes("fertilizer") || cat.includes("nutrient")) {
      return [
        "Accelerates nutrient mobilization and essential mineral absorption",
        "Replenishes soil micronutrient balance and promotes root growth",
        "Enhances chlorophyll synthesis and photosynthetic efficiency",
        "Improves soil aeration and water retention capacity",
        "Increases vegetative vigour and crop biomass",
        "Fully compatible with drip irrigation and organic composting"
      ];
    }
    if (cat.includes("stimulant")) {
      return [
        "Stimulates vigorous flowering, reduces flower/fruit drop",
        "Improves fruit size, uniformity, colour, and market quality",
        "Enhances vegetative growth and metabolic enzyme activity",
        "Increases root nutrient absorption capacity by up to 35%",
        "Builds resilience against drought, salinity, and heat stress",
        "Delivers higher yield returns across all harvest cycles"
      ];
    }
    if (cat.includes("pesticide") || cat.includes("insecticide") || cat.includes("botanical")) {
      return [
        "Provides broad-spectrum bio-control against sucking and chewing pests",
        "Controls caterpillars, borers, whiteflies, thrips, and mites",
        "Disrupts pest feeding, egg-laying, and reproductive cycles",
        "Zero toxic residues, safe for honeybees and natural predators",
        "Effective as preventive and curative agricultural protection",
        "Ideal for Integrated Pest Management (IPM) systems"
      ];
    }
    return [
      "Enhances overall soil fertility and rhizosphere health",
      "Promotes rapid root proliferation and vigorous plant establishment",
      "Corrects nutritional deficiencies and prevents crop stress",
      "Improves yield quantity, crop grade, and post-harvest shelf life",
      "Eco-friendly, chemical-free, and safe for continuous use",
      "Suitable for all agricultural and horticultural cropping systems"
    ];
  }, [product]);

  // Dynamic Crop List resolver
  const cropList = useMemo(() => {
    if (product.crops && product.crops.length > 0) {
      return product.crops;
    }
    if (product.recommendedCrops) {
      return product.recommendedCrops.split(",").map((c) => c.trim()).filter(Boolean);
    }
    return [
      "Paddy / Rice",
      "Cotton",
      "Chilli",
      "Tomato",
      "Brinjal",
      "Sugarcane",
      "Banana",
      "Pomegranate",
      "Mango",
      "Wheat",
      "Groundnut",
      "Soyabean",
      "Pulses",
      "Turmeric & Ginger"
    ];
  }, [product]);

  // Dynamic Specifications resolver
  const dynamicSpecifications = useMemo(() => {
    const base: Record<string, string> = {
      "Product Name": product.name,
      "Category": product.category,
      "Brand": product.brand || "Janani Agro Products",
      "Formulation Type": product.unit?.toLowerCase().includes("l") || product.unit?.toLowerCase().includes("ml") ? "Liquid Biological Formulation" : "Water Soluble Inoculant / Granules",
      "Origin": product.origin || "Janani Bio Sciences, Gujarat",
      "Certifications": product.certifications?.join(", ") || "100% Certified Organic & NPOP Verified",
      "Shelf Life": product.specifications?.["Shelf Life"] || "18–24 Months from manufacturing date",
      ...(product.specifications || {})
    };
    if (product.subtitle && !base["Technical Formulation"]) {
      base["Technical Formulation"] = product.subtitle;
    }
    if (product.dosage && !base["Dosage"]) {
      base["Recommended Dosage"] = product.dosage;
    }
    if (product.targetDiseases && !base["Targeted Diseases / Pests"]) {
      base["Targeted Diseases / Pests"] = product.targetDiseases;
    }
    if (product.compatibility && !base["Compatibility"]) {
      base["Compatibility"] = product.compatibility;
    }
    return base;
  }, [product]);

  // Dynamic FAQs
  const productFaqs = useMemo(() => {
    if (product.faqs && product.faqs.length > 0) {
      return product.faqs;
    }
    return [
      {
        q: `What is ${product.name} and what are its key agricultural benefits?`,
        a: `${product.name} (${product.subtitle || product.category}) is formulated by Janani Agro Products to promote vigorous root development, protect against crop stress and pathogens, enhance nutrient mobilization, and build sustained agricultural resilience.`,
      },
      {
        q: `What is the recommended application dosage and schedule?`,
        a:
          product.dosage ||
          "Foliar Spray: 2–3 ml per litre of water | Drip Fertigation: 500 ml–1 litre per acre | Soil Application: 1–2 litres per acre during early vegetative and root development stages.",
      },
      {
        q: `Which crops can ${product.name} be safely applied to?`,
        a:
          product.recommendedCrops ||
          "Suitable for all vegetables (chilli, tomato, brinjal), fruits (mango, pomegranate, grapes, banana), cereals (paddy, wheat, maize), pulses, oilseeds, cotton, and sugarcane.",
      },
      {
        q: `What is the shelf life, compatibility, and storage conditions?`,
        a:
          product.storageNotice ||
          product.compatibility ||
          "Shelf life is 18 to 24 months from date of manufacturing. Store in a cool, dry place away from direct sunlight. Compatible with organic biofertilizers and compost manures.",
      },
    ];
  }, [product]);

  return (
    <div className="bg-white min-h-screen text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 1. Breadcrumbs Strip */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 font-medium flex-wrap">
          <Link to="/" className="hover:text-[#075B32] transition">
            Home
          </Link>
          <span className="text-gray-400">&gt;</span>
          <Link to="/products" className="hover:text-[#075B32] transition">
            Products
          </Link>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-600">{product.category}</span>
          <span className="text-gray-400">&gt;</span>
          <span className="font-semibold text-gray-900 truncate max-w-xs">
            {product.name} - {product.subtitle || "Liquid Formulation"}
          </span>
        </nav>

        {/* 2. Top Hero Product Grid (Left: Gallery, Right: Details) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* LEFT: Product Gallery with Left Vertical Thumbnails */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4 h-full">
            {/* Vertical Thumbnail Strip */}
            <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[500px] w-full sm:w-20 shrink-0 scrollbar-none pb-2 sm:pb-0">
              {galleryImages.map((img, idx) => {
                const isActive = activeImageIndex === idx;
                return (
                  <button
                    key={img.id}
                    onClick={() => {
                      setActiveImageIndex(idx);
                      if (img.isVideo) setIsVideoModalOpen(true);
                    }}
                    className={`relative size-16 sm:size-18 rounded-xl overflow-hidden border-2 bg-white transition shrink-0 p-1 flex items-center justify-center ${
                      isActive
                        ? "border-[#075B32] shadow-xs"
                        : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      className="w-full h-full object-contain"
                    />
                    {img.isVideo && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="size-4 text-white fill-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Main Big Image Viewport */}
            <div className="relative flex-1 w-full h-full min-h-[440px] rounded-2xl border border-gray-200 bg-white p-4 flex items-center justify-center overflow-hidden group shadow-xs">
              <img
                src={galleryImages[activeImageIndex]?.src || product.image}
                alt={product.name}
                className="w-full h-full max-h-[460px] object-contain transition-transform duration-500 group-hover:scale-105"
              />

              {/* Prev Arrow */}
              <button
                onClick={handlePrevImage}
                aria-label="Previous Image"
                className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#075B32] hover:text-white transition"
              >
                <ChevronLeft className="size-5" />
              </button>

              {/* Next Arrow */}
              <button
                onClick={handleNextImage}
                aria-label="Next Image"
                className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#075B32] hover:text-white transition"
              >
                <ChevronRight className="size-5" />
              </button>

              {/* Expand Lightbox Button (Bottom Right) */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                title="Expand Full View"
                className="absolute bottom-3 right-3 size-8 rounded-lg bg-white/90 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#075B32] hover:bg-white shadow-xs transition"
              >
                <Maximize2 className="size-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: Product Purchasing Information */}
          <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3">
              {/* Title & In Stock Badge */}
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#075B32] tracking-tight uppercase font-display">
                  {product.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF5E9] text-[#075B32] border border-[#075B32]/20 shrink-0">
                  <Leaf className="size-3.5 fill-current" />
                  In Stock
                </span>
              </div>

              {/* Subtitle / Technical formulation info */}
              <p className="text-sm font-medium text-gray-600 leading-snug">
                {product.subtitle || "Trichoderma Viride Liquid Biofungal Formulation"}
              </p>

              {/* Ratings & Social Proof */}
              <div className="flex items-center gap-2 pt-0.5 text-xs text-gray-500 font-medium">
                <div className="flex items-center text-[#E7A91A]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-gray-800">({product.rating.toFixed(1)})</span>
                <span>{product.reviews || 28} Reviews</span>
                <span>|</span>
                <span className="text-[#075B32] font-semibold">{product.stockCount || 124} Sold</span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                  ₹ {selectedVariant.price.toFixed(2)}
                </span>
                <span className="text-base text-gray-400 line-through font-medium">
                  ₹ {selectedVariant.oldPrice.toFixed(2)}
                </span>
                <span className="bg-[#4FAE2A] text-white text-xs font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                  {discountPercent}% OFF
                </span>
              </div>

              {/* Short Paragraph Description (Text Justified) */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1 text-justify">
                {product.description}
              </p>
            </div>

            {/* Bottom Controls: Pack Size, Quantity, Action Buttons */}
            <div className="space-y-4 pt-2">
              {/* Pack Size Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-900 block">Pack Size</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-2 sm:p-2.5 rounded-xl border text-center transition flex flex-col justify-center items-center ${
                          isSelected
                            ? "border-2 border-[#075B32] bg-[#EAF5E9] text-[#075B32] shadow-xs"
                            : "border-gray-200 bg-white hover:border-gray-400 text-gray-700"
                        }`}
                      >
                        <span className="text-xs font-bold leading-tight">{v.label}</span>
                        <span
                          className={`text-[11px] mt-0.5 font-medium ${
                            isSelected ? "text-[#075B32]" : "text-gray-500"
                          }`}
                        >
                          ₹ {v.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-900 block">Quantity</label>
                <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1">
                  <button
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="size-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-gray-900 font-mono">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((prev) => prev + 1)}
                    className="size-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: [Add to Cart] & [Buy Now] */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#075B32] hover:bg-[#064A29] text-white font-bold text-sm py-3.5 px-6 rounded-xl transition shadow-xs flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="size-4" />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#E7A91A] hover:bg-[#d99a12] text-white font-bold text-sm py-3.5 px-6 rounded-xl transition shadow-xs flex items-center justify-center gap-2"
                >
                  <Zap className="size-4 fill-white" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content Section */}
        <section className="mt-12">
          {/* Tab Headers */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-200 pb-px scrollbar-none">
            {[
              { id: "description", label: "Product Description" },
              { id: "benefits", label: "Key Benefits" },
              { id: "how-to-use", label: "How to Use" },
              { id: "suitable-crops", label: "Suitable Crops" },
              { id: "technical", label: "Technical Details" },
              { id: "reviews", label: `Reviews (${product.reviews || 28})` },
              { id: "faqs", label: "FAQs" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap transition border-b-2 -mb-px ${
                    isActive
                      ? "border-[#075B32] text-[#075B32]"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Body: Product Description */}
          {activeTab === "description" && (
            <div className="py-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-display">
                  Product Description
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Rich Text Explanation */}
                  <div className="lg:col-span-7 space-y-3.5 text-xs sm:text-sm text-gray-600 leading-relaxed text-justify">
                    <p>
                      <strong>{product.name}</strong>{" "}
                      {product.subtitle ? `(${product.subtitle})` : ""}{" "}
                      is a scientifically formulated agricultural product from Janani Agro Products. It contains high-potency{" "}
                      <strong>
                        {product.specifications?.["Active Organism"] ||
                          product.specifications?.["Technical Composition"] ||
                          product.category}
                      </strong>
                      , carefully formulated to improve rhizosphere soil conditions, enhance microbial activity, and protect crops.
                    </p>
                    <p>
                      {product.description}
                    </p>
                    {product.targetDiseases && (
                      <p>
                        <strong>Target Protection:</strong> {product.name} is particularly effective against {product.targetDiseases}, suppressing disease development and encouraging vigorous vegetative growth.
                      </p>
                    )}
                    <p>
                      {product.name} integrates seamlessly with sustainable agricultural practices, organic inputs, biofertilizers, and drip fertigation systems across all crop cycles.
                    </p>
                  </div>

                  {/* Right Column: Hero Visual Card with Hands, Soil & Seedling */}
                  <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md border border-gray-200">
                    <img
                      src="/images/hands-soil-sprout.jpg"
                      alt="Healthy Soil, Stronger Roots, Better Yields"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6">
                      <span className="font-display font-bold text-xl sm:text-2xl text-white leading-tight drop-shadow-md">
                        Healthy Soil
                        <br />
                        Stronger Roots
                        <br />
                        <span className="text-[#E7A91A]">Better Yields</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Body: Key Benefits Dedicated View */}
          {activeTab === "benefits" && (
            <div className="py-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 font-display">Key Agricultural Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dynamicBenefits.map((benefit, i) => {
                  const icons = [ShieldCheck, Sprout, CheckCircle2, Leaf, Wheat, Droplets];
                  const IconComponent = icons[i % icons.length]!;
                  return (
                    <div key={i} className="p-5 rounded-2xl border border-gray-200 bg-[#EAF5E9]/40 space-y-2">
                      <h4 className="text-sm font-bold text-[#075B32] flex items-center gap-2">
                        <IconComponent className="size-4 shrink-0" /> Feature #{i + 1}
                      </h4>
                      <p className="text-xs text-gray-700 leading-relaxed text-justify">
                        {benefit}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Body: How to Use */}
          {activeTab === "how-to-use" && (
            <div className="py-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-display">
                  How to Use & Dosage Guidelines
                </h3>
                {product.dosage && (
                  <div className="mt-2 p-4 rounded-xl bg-[#EAF5E9] border border-[#075B32]/20 text-xs text-[#075B32] font-semibold">
                    <strong>Recommended General Dosage:</strong> {product.dosage}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#075B32]">
                    Method 1: Soil Application & Drip
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <strong>Dosage:</strong> {product.dosage?.includes("Drip") ? product.dosage : "500 ml – 1 Litre per acre mixed with 100 kg of well-rotted FYM/compost, or injected directly through drip fertigation during early vegetative stages."}
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#075B32]">
                    Method 2: Seed Treatment
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <strong>Dosage:</strong> {product.dosage?.includes("Seed") ? product.dosage : "5–10 ml per kg of seed. Mix with water and coat seeds evenly. Shade dry for 20–30 minutes before sowing in the field."}
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#075B32]">
                    Method 3: Seedling Root Dip
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <strong>Dosage:</strong> 5–10 ml per litre of water. Dip nursery roots for 15–20 minutes prior to transplanting in mainline soil.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#075B32]">
                    Method 4: Foliar Spray
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <strong>Dosage:</strong> {product.dosage?.includes("Foliar") ? product.dosage : "2–3 ml per litre of water. Spray during early morning or late afternoon for thorough foliage coverage."}
                  </p>
                </div>
              </div>

              {product.methodOfApplication && (
                <p className="text-xs text-gray-600 italic">
                  * Note: {product.methodOfApplication}
                </p>
              )}
            </div>
          )}

          {/* Tab Body: Suitable Crops */}
          {activeTab === "suitable-crops" && (
            <div className="py-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 font-display">Recommended Crops</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.recommendedCrops ||
                  "Suitable for all Agricultural, Horticultural, Vegetable, Fruit, Plantation, Spice, Flower and Commercial Cash Crops."}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {cropList.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#EAF5E9] text-[#075B32]"
                  >
                    <Check className="size-3.5" />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tab Body: Technical Details */}
          {activeTab === "technical" && (
            <div className="py-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 font-display">Technical Particulars</h3>
              <div className="rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 max-w-2xl bg-white">
                {Object.entries(dynamicSpecifications).map(([key, val]) => (
                  <div key={key} className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-medium text-gray-600">{key}</span>
                    <span className="font-bold text-gray-900 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Body: Reviews */}
          {activeTab === "reviews" && (
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-display">Farmer Reviews</h3>
                  <p className="text-xs text-gray-500">Based on {product.reviews || 28} verified customer experiences</p>
                </div>
                <div className="flex items-center gap-1 text-[#E7A91A]">
                  <Star className="size-4 fill-current" />
                  <span className="text-sm font-bold text-gray-900">{product.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-gray-900">Ramesh Patel (Gujarat)</strong>
                    <span className="text-[10px] text-gray-400">12 Sep 2026</span>
                  </div>
                  <div className="flex text-[#E7A91A]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed text-justify">
                    Used for my chilli and cotton crop drip application. Excellent root development and zero wilt
                    problems observed during the heavy monsoon season. Highly recommended!
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-gray-900">
                      Srinivas Rao (Andhra Pradesh)
                    </strong>
                    <span className="text-[10px] text-gray-400">28 Aug 2026</span>
                  </div>
                  <div className="flex text-[#E7A91A]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed text-justify">
                    Very reliable formulation with genuine CFU count and high purity. Applied as seed treatment for paddy,
                    germination percentage was noticeably higher than previous seasons.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Body: FAQs */}
          {activeTab === "faqs" && (
            <div className="py-6 space-y-3">
              <h3 className="text-xl font-bold text-gray-900 font-display mb-3">
                Frequently Asked Questions
              </h3>
              {productFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-white p-4 transition"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-gray-900"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="size-4 text-[#075B32] shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="size-4 text-gray-400 shrink-0 ml-2" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs leading-relaxed text-gray-600 pt-2 border-t border-gray-100 text-justify">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 5. Recommended Products Carousel/Grid */}
        <section className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900 font-display">
                Recommended <span className="text-[#E7A91A]">Products</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Explore more natural and effective solutions for your crops
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
            {recommendedProducts.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      </div>

      {/* Lightbox Fullscreen Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 size-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition"
          >
            <X className="size-5" />
          </button>
          <img
            src={galleryImages[activeImageIndex]?.src || product.image}
            alt={product.name}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-3 right-3 size-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition z-10"
            >
              <X className="size-4" />
            </button>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-900 flex items-center justify-center">
              <div className="text-center p-6 space-y-3">
                <div className="size-16 rounded-full bg-[#075B32] text-white flex items-center justify-center mx-auto shadow-lg animate-pulse">
                  <Play className="size-7 fill-white ml-0.5" />
                </div>
                <h4 className="text-white font-bold text-base font-display">
                  {product.name} - Application & Field Results Demo
                </h4>
                <p className="text-neutral-400 text-xs max-w-md mx-auto">
                  Demonstrating seed treatment, seedling root dip, and drip fertigation best practices for
                  maximum root health.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}