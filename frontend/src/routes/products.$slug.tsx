import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
  Share2,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Zap,
  Leaf,
  Check,
  MapPin,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Copy,
  ExternalLink,
  MessageCircle,
  Facebook,
  Twitter,
  X
} from "lucide-react";
import { products, categories, type Product, type ProductVariant } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { useStore } from "@/components/store-provider";
import { PdpGallery } from "@/components/pdp/pdp-gallery";
import { PdpOfferCoupons } from "@/components/pdp/pdp-offer-coupons";
import { PdpDeliveryChecker } from "@/components/pdp/pdp-delivery-checker";
import { PdpReviewsSection } from "@/components/pdp/pdp-reviews-section";
import { PdpRecentlyViewed } from "@/components/pdp/pdp-recently-viewed";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => {
    const p = products.find((x) => x.slug === params.slug);
    const title = p
      ? `${p.name} — Pure Organic Harvest — JANANI AGRO PRODUCTS`
      : `Organic Product — JANANI`;
    const description =
      p?.description ??
      "100% certified pure organic pantry essentials directly from Indian farms.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const fallbackProduct = products[0]!;
  const product = products.find((p) => p.slug === slug) ?? fallbackProduct;

  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isWishlisted = wishlist.includes(product.id);

  // Selected Variant State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants && product.variants.length > 0
      ? product.variants[0]!
      : {
          id: "std",
          label: product.unit,
          unit: product.unit,
          price: product.price,
          oldPrice: product.oldPrice,
          inStock: product.inStock,
        }
  );

  // Sync selected variant when product changes
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]!);
    }
    setQty(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [product.slug]);

  const [qty, setQty] = useState(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const discountPercent = Math.round(
    ((selectedVariant.oldPrice - selectedVariant.price) / selectedVariant.oldPrice) * 100
  );

  const handleAddToCart = () => {
    if (!selectedVariant.inStock) {
      toast.error("This variant is currently out of stock.");
      return;
    }
    for (let i = 0; i < qty; i++) {
      addToCart(product.id);
    }
    toast.success(`Added ${qty}x ${product.name} (${selectedVariant.unit}) to cart!`, {
      description: "Direct farm-fresh organic delivery queued.",
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate({ to: "/checkout" });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Product link copied to clipboard!");
  };

  // Product-specific FAQs
  const productFaqs = [
    {
      q: `What is the shelf life and ideal storage for this ${product.name}?`,
      a: `Our ${product.name} has a recommended shelf life of 9 to 12 months from the date of cold-pressing/harvesting. Store in an airtight container in a cool, dry place away from direct sunlight. No chemical preservatives or anti-caking agents are added.`,
    },
    {
      q: `How is this product tested and certified organic?`,
      a: `Every batch is cultivated in compliance with NPOP (National Programme for Organic Production) standards and verified with Jaivik Bharat & FSSAI Organic credentials. We conduct rigorous NABL-accredited third-party lab testing for zero pesticide residue, heavy metals, and adulterants.`,
    },
    {
      q: `Where is this harvested and who is the grower?`,
      a: `This single-origin batch is sourced directly from certified organic farmer collectives in ${product.origin}. Farmers receive fair-trade remunerative pricing above conventional market benchmarks.`,
    },
    {
      q: `Can I order institutional bulk quantities or dealership distribution?`,
      a: `Yes, we supply 15kg/25kg bulk bags and 15L industrial tins for Ayurvedic pharmacies, organic kitchens, and supermarkets. Please visit our 'Become a Distributor' page or contact wholesale@jananiagro.com.`,
    },
  ];

  // Related products from same category or complementary
  const relatedProducts = useMemo(() => {
    let items = products.filter(
      (p) => p.category === product.category && p.id !== product.id
    );
    if (items.length < 4) {
      const remaining = products.filter(
        (p) => p.id !== product.id && !items.some((item) => item.id === p.id)
      );
      items = [...items, ...remaining];
    }
    return items.slice(0, 4);
  }, [product]);

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb Strip */}
      <div className="border-b border-border bg-card/40 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center gap-2 text-xs font-medium text-muted-foreground flex-wrap">
          <Link to="/" className="hover:text-primary transition">
            Home
          </Link>
          <ChevronRight className="size-3 text-muted-foreground" />
          <Link to="/products" className="hover:text-primary transition">
            Pantry
          </Link>
          <ChevronRight className="size-3 text-muted-foreground" />
          <Link
            to="/categories/$slug"
            params={{ slug: product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") }}
            className="hover:text-primary transition"
          >
            {product.category}
          </Link>
          <ChevronRight className="size-3 text-muted-foreground" />
          <span className="font-semibold text-foreground truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Top Product Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column (5 Cols): Large Gallery, Farm Story, Specifications */}
          <div className="lg:col-span-6 space-y-6">
            <PdpGallery product={product} />

            {/* Farm Origin Provenance Card */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf flex items-center gap-1.5">
                  <MapPin className="size-4 text-brand-leaf" /> Farm Provenance & Traceability
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  100% Traceable
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Cultivated by single-origin farmer clusters in <strong>{product.origin}</strong> using
                traditional Vedic compost and solar sun-drying. Batch ID:{" "}
                <span className="font-mono text-foreground font-semibold">
                  JAP-HARVEST-{product.id}26
                </span>
                .
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {product.dietaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary"
                  >
                    <Leaf className="size-3" /> {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Product Info, Pricing, Variants, Actions, Offers, PIN Checker */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Category & Brand Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-leaf">
                  {product.category}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">
                  {product.brand}
                </span>
              </div>

              {/* Main Product Title */}
              <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Ratings & Social Proof */}
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-amber-700 font-bold text-xs">
                  <Star className="size-3.5 fill-current text-amber-500" />
                  <span>{product.rating}</span>
                </div>
                <a
                  href="#customer-reviews"
                  className="text-xs font-semibold text-muted-foreground hover:text-primary underline decoration-dotted"
                >
                  {product.reviews} Verified Customer Reviews
                </a>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="size-3.5" /> FSSAI / NPOP Certified
                </span>
              </div>

              {/* Dynamic Price Breakdown Box */}
              <div className="mt-6 rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-xs space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-foreground">
                    ₹{selectedVariant.price * qty}
                  </span>
                  <span className="font-mono text-base sm:text-lg text-muted-foreground line-through">
                    ₹{selectedVariant.oldPrice * qty}
                  </span>
                  <span className="rounded-full bg-emerald-600 text-white px-3 py-0.5 text-xs font-bold shadow-xs">
                    Save ₹{(selectedVariant.oldPrice - selectedVariant.price) * qty} ({discountPercent}% OFF)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-primary/10">
                  <span>Unit: {selectedVariant.unit} (₹{Math.round(selectedVariant.price / (selectedVariant.unit.includes("5") ? 5 : 1))}/kg approx)</span>
                  <span className="text-emerald-700 font-semibold">Inclusive of all taxes & GST</span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              {/* Multi-Pack Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-6 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Select Pack Size / Quantity
                    </label>
                    <span className="text-xs text-brand-leaf font-semibold">
                      Current: {selectedVariant.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
                            isSelected
                              ? "bg-primary/15 border-primary text-primary font-bold shadow-sm ring-2 ring-primary/20"
                              : "bg-card border-border hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          <span className="text-xs font-bold text-foreground">{v.unit}</span>
                          <span className="text-xs font-mono font-bold text-primary mt-0.5">
                            ₹{v.price}
                          </span>
                          <span className="text-[10px] text-muted-foreground line-through">
                            ₹{v.oldPrice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Stock Status */}
              <div className="mt-6 flex items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Quantity
                  </span>
                  <div className="flex items-center rounded-xl border border-input bg-card p-1">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="size-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
                      disabled={qty <= 1}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold font-mono">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="size-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  {selectedVariant.inStock ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                      In Stock Ready to Dispatch
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-destructive">
                      Out of Stock (Pre-order Open)
                    </span>
                  )}
                </div>
              </div>

              {/* Main Action Buttons (Add to Cart, Buy Now, Wishlist, Share) */}
              <div className="mt-6 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Add to Cart */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant.inStock}
                    className="h-14 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
                  >
                    <ShoppingBag className="size-5" />
                    Add to Basket • ₹{selectedVariant.price * qty}
                  </Button>

                  {/* Buy Now Direct Checkout */}
                  <Button
                    variant="gold"
                    onClick={handleBuyNow}
                    disabled={!selectedVariant.inStock}
                    className="h-14 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
                  >
                    <Zap className="size-5 fill-current" />
                    Buy Now ⚡
                  </Button>
                </div>

                {/* Secondary Actions: Wishlist & Share */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => toggleWishlist(product.id)}
                    className={`flex-1 h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                      isWishlisted ? "text-destructive border-destructive bg-destructive/5" : ""
                    }`}
                  >
                    <Heart className={`size-4 ${isWishlisted ? "fill-destructive" : ""}`} />
                    {isWishlisted ? "Saved in Wishlist" : "Save to Wishlist"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex-1 h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Share2 className="size-4 text-brand-leaf" />
                    Share Product
                  </Button>
                </div>
              </div>
            </div>

            {/* Coupons & Bank Offers Widget */}
            <PdpOfferCoupons productPrice={selectedVariant.price * qty} />

            {/* Delivery Date & Serviceability Checker */}
            <PdpDeliveryChecker productName={product.name} />
          </div>
        </div>

        {/* Product FAQs Accordion */}
        <section className="mt-20 border-t border-border pt-12 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf">
              Frequently Asked Questions
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
              Purity, Processing & Storage FAQs
            </h3>
          </div>

          <div className="space-y-3">
            {productFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-card p-4 transition"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-foreground"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="size-4 text-primary shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground pt-3 border-t border-border/60">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Customer Reviews & Ratings Suite */}
        <div id="customer-reviews">
          <PdpReviewsSection product={product} />
        </div>

        {/* Related Products Carousel */}
        <section className="mt-20 border-t border-border pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf">
                Pairings & Complements
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
                Pairs Well With Your Pantry
              </h3>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-bold">
              <Link to="/products">Explore All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Recently Viewed Products */}
        <PdpRecentlyViewed currentProductId={product.id} />
      </main>

      {/* Share Product Dialog Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-background border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Share2 className="size-5 text-brand-leaf" />
                <h3 className="font-display font-bold text-lg">Share Product</h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="rounded-full p-1 hover:bg-muted text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Share <strong>{product.name}</strong> with your family & friends to earn referral harvest cash.
            </p>

            {/* Share options */}
            <div className="grid grid-cols-3 gap-3">
              <a
                href={`https://wa.me/?text=Check%20out%20${encodeURIComponent(
                  product.name
                )}%20from%20Janani%20Agro:%20${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 transition text-center"
              >
                <MessageCircle className="size-6 text-emerald-600 mb-1" />
                <span className="text-xs font-bold">WhatsApp</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=Loving%20pure%20organic%20${encodeURIComponent(
                  product.name
                )}%20from%20@JananiAgro&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-500/10 text-sky-700 hover:bg-sky-500/20 transition text-center"
              >
                <Twitter className="size-6 text-sky-600 mb-1" />
                <span className="text-xs font-bold">Twitter/X</span>
              </a>

              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition text-center"
              >
                <Copy className="size-6 text-primary mb-1" />
                <span className="text-xs font-bold">Copy Link</span>
              </button>
            </div>

            <div className="pt-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="w-full h-9 rounded-xl border border-input bg-muted px-3 text-xs font-mono text-muted-foreground outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}