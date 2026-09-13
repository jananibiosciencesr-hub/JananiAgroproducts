import React, { useState, useEffect } from "react";
import {
  Layout,
  Sliders,
  Image as ImageIcon,
  Sparkles,
  Flame,
  Tag,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Edit,
  RotateCcw,
  Smartphone,
  Monitor,
  Tablet,
  Search,
  ExternalLink,
  Layers,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Percent,
  Check,
  X,
  Copy,
  AlertCircle,
  HelpCircle,
  Settings,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import {
  getHomepageCms,
  updateHomepageLayout,
  getHeroBanners,
  createHeroBanner,
  updateHeroBanner,
  toggleHeroBanner,
  deleteHeroBanner,
  getOfferBanners,
  createOfferBanner,
  updateOfferBanner,
  toggleOfferBanner,
  deleteOfferBanner,
  getCategoryBanners,
  createCategoryBanner,
  updateCategoryBanner,
  toggleCategoryBanner,
  deleteCategoryBanner,
  getFlashSaleBanners,
  createFlashSaleBanner,
  updateFlashSaleBanner,
  toggleFlashSaleBanner,
  deleteFlashSaleBanner,
  getCuratedSections,
  updateCuratedSection,
  getProducts,
  type CmsSection,
  type HeroBanner,
  type OfferBanner,
  type CategoryBanner,
  type FlashSaleBanner,
  type CuratedSectionConfig,
  type HomepageCmsData
} from "@/lib/api";
import { type Product } from "@/lib/catalog";

export function CmsManagement() {
  const [activeTab, setActiveTab] = useState<"layout" | "hero" | "offers" | "categories" | "flashSale" | "showcases">("layout");
  const [loading, setLoading] = useState(true);

  // Core CMS Data
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [offerBanners, setOfferBanners] = useState<OfferBanner[]>([]);
  const [categoryBanners, setCategoryBanners] = useState<CategoryBanner[]>([]);
  const [flashSaleBanners, setFlashSaleBanners] = useState<FlashSaleBanner[]>([]);
  const [curatedSections, setCuratedSections] = useState<{
    featured: CuratedSectionConfig;
    trending: CuratedSectionConfig;
    newArrivals: CuratedSectionConfig;
    bestSellers: CuratedSectionConfig;
  }>({
    featured: { heading: "Featured Organic Essentials", productIds: [], maxDisplayCount: 8, layout: "grid", active: true },
    trending: { heading: "Trending This Harvest Week", productIds: [], maxDisplayCount: 8, layout: "grid", active: true },
    newArrivals: { heading: "Fresh Farm Harvest Arrivals", productIds: [], maxDisplayCount: 8, layout: "grid", active: true },
    bestSellers: { heading: "Customer Top Favorites", productIds: [], maxDisplayCount: 8, layout: "grid", active: true }
  });

  // Store Products for Curated Pickers
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [selectedShowcaseKey, setSelectedShowcaseKey] = useState<"featured" | "trending" | "newArrivals" | "bestSellers">("featured");

  // Filter & Search States
  const [offerFilter, setOfferFilter] = useState<string>("all");
  const [productSearchQuery, setProductSearchQuery] = useState("");

  // Modals
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroBanner | null>(null);

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferBanner | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryBanner | null>(null);

  const [isFlashSaleModalOpen, setIsFlashSaleModalOpen] = useState(false);
  const [editingFlashSale, setEditingFlashSale] = useState<FlashSaleBanner | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Load all CMS data
  const loadCmsData = async () => {
    try {
      setLoading(true);
      const [cmsData, prods] = await Promise.all([
        getHomepageCms(),
        getProducts()
      ]);

      if (cmsData) {
        setSections(cmsData.sections || []);
        setHeroBanners(cmsData.heroBanners || []);
        setOfferBanners(cmsData.offerBanners || []);
        setCategoryBanners(cmsData.categoryBanners || []);
        setFlashSaleBanners(cmsData.flashSaleBanners || []);
        if (cmsData.curatedProductSections) {
          setCuratedSections(cmsData.curatedProductSections);
        }
      }
      setStoreProducts(prods || []);
    } catch (err) {
      console.error("Error loading CMS data:", err);
      toast.error("Failed to load storefront CMS configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCmsData();
  }, []);

  // ----------------------------------------------------
  // SECTION REORDERING & PUBLISHING
  // ----------------------------------------------------
  const moveSection = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    const targetItem = updated[targetIndex];
    if (!temp || !targetItem) return;
    updated[index] = targetItem;
    updated[targetIndex] = temp;

    const reordered = updated.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    setSections(reordered);
  };

  const toggleSectionEnabled = (id: string) => {
    setSections(prev =>
      prev.map(sec => (sec.id === id ? { ...sec, enabled: !sec.enabled } : sec))
    );
  };

  const handleSaveLayout = async () => {
    try {
      const res = await updateHomepageLayout(sections);
      if (res?.success) {
        toast.success("Homepage layout published to live storefront!");
      } else {
        toast.error("Failed to save layout.");
      }
    } catch {
      toast.error("An error occurred while publishing layout.");
    }
  };

  const handleResetDefaultLayout = () => {
    const defaultSections: CmsSection[] = [
      { id: "sec_hero", name: "Hero Carousel Banners", type: "hero_slider", enabled: true, order: 1, description: "Full-width responsive carousel with dual desktop/mobile banners & primary CTAs." },
      { id: "sec_trust", name: "Trust Badges & Value Strip", type: "trust_badges", enabled: true, order: 2, description: "100% Organic, Direct Farmer Sourced, Chemical Free, Fast Delivery badges." },
      { id: "sec_promo_strip", name: "Promotional Announcement Strip", type: "offer_strip", enabled: true, order: 3, description: "Highlight seasonal coupons & sitewide free shipping thresholds." },
      { id: "sec_categories", name: "Shop by Category Cards", type: "category_grid", enabled: true, order: 4, description: "Curated category cards for Millets, Cold Pressed Oils, Rice & Sweeteners." },
      { id: "sec_flash_sale", name: "Urgent Flash Sale Ticker", type: "flash_sale", enabled: true, order: 5, description: "Time-limited urgent deal box with live countdown timer & stock scarcity meter." },
      { id: "sec_featured", name: "Featured Organic Essentials", type: "product_showcase_featured", enabled: true, order: 6, description: "Hand-picked organic staple products curated by admin." },
      { id: "sec_trending", name: "Trending This Harvest Week", type: "product_showcase_trending", enabled: true, order: 7, description: "High velocity organic best-sellers and newly in-demand items." },
      { id: "sec_brand_story", name: "Janani Agro Farm Story", type: "brand_story", enabled: true, order: 8, description: "Heritage mission, ethical farmer partnerships, and purity guarantee video/story." },
      { id: "sec_best_sellers", name: "Customer Top Favorites", type: "product_showcase_bestsellers", enabled: true, order: 9, description: "Top-rated 5-star items loved by over 50,000+ happy households." },
      { id: "sec_new_arrivals", name: "Fresh Harvest Arrivals", type: "product_showcase_new", enabled: true, order: 10, description: "Newly harvested grains, freshly pressed oils and seasonal jaggery." },
      { id: "sec_testimonials", name: "Customer Reviews & UGC Showcase", type: "testimonials", enabled: true, order: 11, description: "Verified customer photo reviews and verified health benefits feedback." },
      { id: "sec_faq", name: "Frequently Asked Questions", type: "faq", enabled: true, order: 12, description: "Organic certifications, delivery timeline, and farm sourcing FAQs." }
    ];
    setSections(defaultSections);
    toast.info("Layout reset to default standard hierarchy. Click 'Save & Publish' to sync.");
  };

  // ----------------------------------------------------
  // HERO BANNER HANDLERS
  // ----------------------------------------------------
  const handleToggleHero = async (id: string) => {
    const res = await toggleHeroBanner(id);
    if (res?.success && res.data) {
      setHeroBanners(prev => prev.map(b => (b.id === id ? res.data : b)));
      toast.success(`Slide ${res.data.active ? "enabled" : "hidden"}`);
    }
  };

  const handleDeleteHero = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero slide?")) return;
    const res = await deleteHeroBanner(id);
    if (res?.success) {
      setHeroBanners(prev => prev.filter(b => b.id !== id));
      toast.success("Hero slide deleted.");
    }
  };

  const handleSaveHeroModal = async (bannerData: Partial<HeroBanner>) => {
    if (editingHero) {
      const res = await updateHeroBanner(editingHero.id, bannerData);
      if (res?.success && res.data) {
        setHeroBanners(prev => prev.map(b => (b.id === editingHero.id ? res.data : b)));
        toast.success("Hero slide updated successfully!");
        setIsHeroModalOpen(false);
        setEditingHero(null);
      }
    } else {
      const res = await createHeroBanner(bannerData);
      if (res?.success && res.data) {
        setHeroBanners(prev => [...prev, res.data]);
        toast.success("Hero slide created!");
        setIsHeroModalOpen(false);
      }
    }
  };

  // ----------------------------------------------------
  // OFFER BANNER HANDLERS
  // ----------------------------------------------------
  const handleToggleOffer = async (id: string) => {
    const res = await toggleOfferBanner(id);
    if (res?.success && res.data) {
      setOfferBanners(prev => prev.map(o => (o.id === id ? res.data : o)));
      toast.success(`Offer banner ${res.data.active ? "activated" : "deactivated"}`);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer banner?")) return;
    const res = await deleteOfferBanner(id);
    if (res?.success) {
      setOfferBanners(prev => prev.filter(o => o.id !== id));
      toast.success("Offer banner deleted.");
    }
  };

  const handleSaveOfferModal = async (offerData: Partial<OfferBanner>) => {
    if (editingOffer) {
      const res = await updateOfferBanner(editingOffer.id, offerData);
      if (res?.success && res.data) {
        setOfferBanners(prev => prev.map(o => (o.id === editingOffer.id ? res.data : o)));
        toast.success("Offer banner updated!");
        setIsOfferModalOpen(false);
        setEditingOffer(null);
      }
    } else {
      const res = await createOfferBanner(offerData);
      if (res?.success && res.data) {
        setOfferBanners(prev => [...prev, res.data]);
        toast.success("Offer banner created!");
        setIsOfferModalOpen(false);
      }
    }
  };

  // ----------------------------------------------------
  // CATEGORY BANNER HANDLERS
  // ----------------------------------------------------
  const handleToggleCategory = async (id: string) => {
    const res = await toggleCategoryBanner(id);
    if (res?.success && res.data) {
      setCategoryBanners(prev => prev.map(c => (c.id === id ? res.data : c)));
      toast.success(`Category banner ${res.data.active ? "enabled" : "hidden"}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category banner?")) return;
    const res = await deleteCategoryBanner(id);
    if (res?.success) {
      setCategoryBanners(prev => prev.filter(c => c.id !== id));
      toast.success("Category banner deleted.");
    }
  };

  const handleSaveCategoryModal = async (catData: Partial<CategoryBanner>) => {
    if (editingCategory) {
      const res = await updateCategoryBanner(editingCategory.id, catData);
      if (res?.success && res.data) {
        setCategoryBanners(prev => prev.map(c => (c.id === editingCategory.id ? res.data : c)));
        toast.success("Category banner updated!");
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
      }
    } else {
      const res = await createCategoryBanner(catData);
      if (res?.success && res.data) {
        setCategoryBanners(prev => [...prev, res.data]);
        toast.success("Category banner created!");
        setIsCategoryModalOpen(false);
      }
    }
  };

  // ----------------------------------------------------
  // FLASH SALE HANDLERS
  // ----------------------------------------------------
  const handleToggleFlashSale = async (id: string) => {
    const res = await toggleFlashSaleBanner(id);
    if (res?.success && res.data) {
      setFlashSaleBanners(prev => prev.map(f => (f.id === id ? res.data : f)));
      toast.success(`Flash sale campaign ${res.data.active ? "activated" : "deactivated"}`);
    }
  };

  const handleDeleteFlashSale = async (id: string) => {
    if (!confirm("Are you sure you want to remove this flash sale campaign?")) return;
    const res = await deleteFlashSaleBanner(id);
    if (res?.success) {
      setFlashSaleBanners(prev => prev.filter(f => f.id !== id));
      toast.success("Flash sale removed.");
    }
  };

  const handleSaveFlashSaleModal = async (fsData: Partial<FlashSaleBanner>) => {
    if (editingFlashSale) {
      const res = await updateFlashSaleBanner(editingFlashSale.id, fsData);
      if (res?.success && res.data) {
        setFlashSaleBanners(prev => prev.map(f => (f.id === editingFlashSale.id ? res.data : f)));
        toast.success("Flash sale updated!");
        setIsFlashSaleModalOpen(false);
        setEditingFlashSale(null);
      }
    } else {
      const res = await createFlashSaleBanner(fsData);
      if (res?.success && res.data) {
        setFlashSaleBanners(prev => [...prev, res.data]);
        toast.success("Flash sale created!");
        setIsFlashSaleModalOpen(false);
      }
    }
  };

  // ----------------------------------------------------
  // CURATED PRODUCT SHOWCASE HANDLERS
  // ----------------------------------------------------
  const handleToggleProductInShowcase = (productId: string) => {
    const currentConfig = curatedSections[selectedShowcaseKey];
    const exists = currentConfig.productIds.includes(productId);
    const updatedIds = exists
      ? currentConfig.productIds.filter(id => id !== productId)
      : [...currentConfig.productIds, productId];

    setCuratedSections(prev => ({
      ...prev,
      [selectedShowcaseKey]: {
        ...prev[selectedShowcaseKey],
        productIds: updatedIds
      }
    }));
  };

  const handleSaveCuratedShowcase = async () => {
    try {
      const config = curatedSections[selectedShowcaseKey];
      const res = await updateCuratedSection(selectedShowcaseKey, config);
      if (res?.success) {
        toast.success(`${config.heading} showcase saved & published!`);
      } else {
        toast.error("Failed to update showcase section.");
      }
    } catch {
      toast.error("An error occurred while updating showcase.");
    }
  };

  // KPIs
  const totalActiveHero = heroBanners.filter(b => b.active).length;
  const totalActiveOffers = offerBanners.filter(o => o.active).length;
  const totalActiveCategories = categoryBanners.filter(c => c.active).length;
  const isFlashSaleActive = flashSaleBanners.some(f => f.active);
  const totalActiveBanners = totalActiveHero + totalActiveOffers + totalActiveCategories + (isFlashSaleActive ? 1 : 0);
  const totalActiveSections = sections.filter(s => s.enabled).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium animate-pulse">Loading Storefront CMS & Layout Builder...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-900 p-6 rounded-2xl text-white shadow-xl border border-emerald-800/40">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Layout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Homepage CMS & Storefront Customizer</h1>
              <p className="text-sm text-emerald-300/80 mt-0.5">
                Shopify Online Store 2.0 architecture • Reorder 12 dynamic sections, manage dual responsive banners, and curate organic showcases.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow"
          >
            <Eye className="w-4 h-4" />
            Live Device Preview
          </button>
          <button
            onClick={handleSaveLayout}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-emerald-500/25"
          >
            <CheckCircle2 className="w-4 h-4" />
            Publish Layout
          </button>
        </div>
      </div>

      {/* 2. KPI Ribbon Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Active Assets</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{totalActiveBanners}</span>
            <span className="text-xs text-zinc-500 ml-1.5">Assets Live</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Hero Carousel</span>
            <ImageIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{totalActiveHero}</span>
            <span className="text-xs text-zinc-500 ml-1.5">/ {heroBanners.length} Slides</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Promo Tickers</span>
            <Tag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{totalActiveOffers}</span>
            <span className="text-xs text-zinc-500 ml-1.5">Live Strips</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Flash Deal</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
              isFlashSaleActive ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}>
              {isFlashSaleActive ? "🔥 ACTIVE 40%" : "INACTIVE"}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Active Sections</span>
            <Sliders className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{totalActiveSections}</span>
            <span className="text-xs text-zinc-500 ml-1.5">/ {sections.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Storefront Sync</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time Live</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("layout")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "layout"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Homepage Section Builder ({sections.length})
        </button>

        <button
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "hero"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Hero Slides ({heroBanners.length})
        </button>

        <button
          onClick={() => setActiveTab("offers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "offers"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Tag className="w-4 h-4" />
          Offer Banners & Tickers ({offerBanners.length})
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "categories"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          Category Showcases ({categoryBanners.length})
        </button>

        <button
          onClick={() => setActiveTab("flashSale")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "flashSale"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Flame className="w-4 h-4" />
          Flash Sale Deals ({flashSaleBanners.length})
        </button>

        <button
          onClick={() => setActiveTab("showcases")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "showcases"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Product Showcases (4)
        </button>
      </div>

      {/* 4. TAB 1: SECTION LAYOUT BUILDER */}
      {activeTab === "layout" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Storefront Section Flow & Ordering
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Reorder sections using the Up/Down controls. Disabled sections will be gracefully hidden from the live storefront.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleResetDefaultLayout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Defaults
              </button>
              <button
                onClick={handleSaveLayout}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                Save & Publish
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  section.enabled
                    ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/50"
                    : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200/60 dark:border-zinc-800/60 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex items-center gap-1">
                    <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      {section.order}
                    </span>
                    <div className="flex flex-col">
                      <button
                        disabled={index === 0}
                        onClick={() => moveSection(index, "up")}
                        className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={index === sections.length - 1}
                        onClick={() => moveSection(index, "down")}
                        className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{section.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono">
                        {section.type}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{section.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (section.type === "hero_slider") setActiveTab("hero");
                      else if (section.type === "offer_strip") setActiveTab("offers");
                      else if (section.type === "category_grid") setActiveTab("categories");
                      else if (section.type === "flash_sale") setActiveTab("flashSale");
                      else if (section.type.startsWith("product_showcase")) {
                        setActiveTab("showcases");
                        if (section.type.includes("featured")) setSelectedShowcaseKey("featured");
                        else if (section.type.includes("trending")) setSelectedShowcaseKey("trending");
                        else if (section.type.includes("bestsellers")) setSelectedShowcaseKey("bestSellers");
                        else if (section.type.includes("new")) setSelectedShowcaseKey("newArrivals");
                      } else {
                        toast.info(`Configuring ${section.name}...`);
                      }
                    }}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Configure</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => toggleSectionEnabled(section.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      section.enabled
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {section.enabled ? "Visible" : "Hidden"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB 2: HERO CAROUSEL BANNERS */}
      {activeTab === "hero" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Hero Carousel Slides
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Manage full-width responsive slides with dual desktop (1920x800) and mobile (750x1000) visual banners.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingHero(null);
                setIsHeroModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Hero Slide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {heroBanners.map(banner => (
              <div
                key={banner.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 transition-all"
              >
                <div>
                  {/* Visual Asset Preview */}
                  <div className="relative aspect-[16/9] w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={banner.desktopImageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                      {banner.badgeText && (
                        <span className="self-start px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-zinc-950 mb-1">
                          {banner.badgeText}
                        </span>
                      )}
                      <p className="text-xs text-emerald-300 font-medium">{banner.eyebrow}</p>
                      <h3 className="text-base font-bold leading-tight">{banner.title}</h3>
                    </div>

                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                      Slide #{banner.slideOrder}
                    </span>
                  </div>

                  {/* Slide Details */}
                  <div className="p-4 space-y-2.5">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{banner.subtitle}</p>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                        Primary: {banner.primaryCtaLabel}
                      </span>
                      {banner.secondaryCtaLabel && (
                        <span className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                          Sec: {banner.secondaryCtaLabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <Clock className="w-3 h-3" />
                      <span>{banner.startDate || "2026-09-01"} ~ {banner.endDate || "2026-12-31"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800/60 mt-3 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleHero(banner.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      banner.active
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {banner.active ? "Active" : "Hidden"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingHero(banner);
                        setIsHeroModalOpen(true);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Edit Slide"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteHero(banner.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 3: OFFER BANNERS & PROMO TICKERS */}
      {activeTab === "offers" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  Offer Banners, Strips & Announcement Tickers
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Manage sitewide top notification banners, promo highlights, and special coupon discount triggers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={offerFilter}
                onChange={e => setOfferFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-zinc-700 dark:text-zinc-300"
              >
                <option value="all">All Banner Types</option>
                <option value="ticker">Announcement Ticker</option>
                <option value="promo_strip">Promotional Strip</option>
                <option value="coupon_highlight">Coupon Highlight</option>
              </select>

              <button
                onClick={() => {
                  setEditingOffer(null);
                  setIsOfferModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Offer Banner
              </button>
            </div>
          </div>

          <div className="space-y-3.5">
            {offerBanners
              .filter(o => (offerFilter === "all" ? true : o.type === offerFilter))
              .map(offer => (
                <div
                  key={offer.id}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Live Mini Preview Bar */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {offer.type.replace("_", " ")}
                      </span>
                      {offer.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                          {offer.badge}
                        </span>
                      )}
                    </div>

                    <div
                      className="p-3 rounded-xl flex items-center justify-between gap-3 shadow-inner"
                      style={{ backgroundColor: offer.backgroundColor || "#1b4332", color: offer.textColor || "#ffffff" }}
                    >
                      <div>
                        <p className="text-sm font-bold leading-tight">{offer.headline}</p>
                        {offer.subtitle && <p className="text-xs opacity-90">{offer.subtitle}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        {offer.couponCode && (
                          <span className="px-2.5 py-1 rounded bg-black/30 border border-white/30 text-xs font-mono font-bold tracking-wider">
                            {offer.couponCode}
                          </span>
                        )}
                        {offer.ctaLabel && (
                          <span className="px-3 py-1 rounded-lg bg-white text-zinc-900 text-xs font-bold shadow">
                            {offer.ctaLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2 md:pt-0">
                    <button
                      onClick={() => handleToggleOffer(offer.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        offer.active
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {offer.active ? "Active" : "Disabled"}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingOffer(offer);
                          setIsOfferModalOpen(true);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Edit Offer Banner"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Offer Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 7. TAB 4: CATEGORY SHOWCASES */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Category Showcase Cards
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Highlight your core organic catalog categories (Millets, Cold Pressed Oils, Rice, Natural Sweeteners).
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setIsCategoryModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Category Banner
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryBanners.map(cat => (
              <div
                key={cat.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 transition-all"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={cat.desktopImageUrl}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                      {cat.badge && (
                        <span className="self-start px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-zinc-950 mb-1">
                          {cat.badge}
                        </span>
                      )}
                      <h3 className="text-base font-bold">{cat.title}</h3>
                      <p className="text-xs text-zinc-300">{cat.subtitle}</p>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">/products?category={cat.categorySlug}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 pt-0 border-t border-zinc-100 dark:border-zinc-800/60 mt-2 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      cat.active
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {cat.active ? "Active" : "Hidden"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Edit Category Banner"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete Category Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB 5: FLASH SALE URGENT CAMPAIGNS */}
      {activeTab === "flashSale" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                Flash Sale Urgent Deal Campaigns
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Drive instant conversions with live countdown clocks, stock scarcity bars, and instant add-to-cart deals.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingFlashSale(null);
                setIsFlashSaleModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Configure Flash Sale
            </button>
          </div>

          <div className="space-y-4">
            {flashSaleBanners.map(sale => (
              <div
                key={sale.id}
                className="bg-gradient-to-r from-rose-950 via-zinc-900 to-amber-950 p-6 rounded-2xl border border-rose-800/40 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                      {sale.badge || "LIMITED HARVEST"}
                    </span>
                    <span className="text-sm font-bold text-amber-400">
                      Save {sale.discountPercentage}% OFF
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black">{sale.title}</h3>
                    <p className="text-sm text-zinc-300 mt-1">{sale.subtitle}</p>
                  </div>

                  {/* Stock Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-rose-300">🔥 Claimed: {sale.claimedStock || 84} / {sale.totalStock || 100} bags</span>
                      <span className="text-amber-300">Only {(sale.totalStock || 100) - (sale.claimedStock || 84)} left in stock!</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.round(((sale.claimedStock || 84) / (sale.totalStock || 100)) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Countdown Box & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-4">
                  <div className="p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                    <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Sale Ends At</span>
                    <p className="text-base font-mono font-bold text-amber-400 mt-1">
                      {new Date(sale.endsAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFlashSale(sale.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        sale.active
                          ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {sale.active ? "Campaign Active" : "Campaign Paused"}
                    </button>

                    <button
                      onClick={() => {
                        setEditingFlashSale(sale);
                        setIsFlashSaleModalOpen(true);
                      }}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                      title="Edit Campaign"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFlashSale(sale.id)}
                      className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. TAB 6: CURATED PRODUCT SHOWCASES */}
      {activeTab === "showcases" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Curated Product Showcase Collections
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Select which catalog products are showcased in each dedicated homepage grid or carousel.
              </p>
            </div>

            {/* Showcase Section Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-x-auto">
              {(["featured", "trending", "newArrivals", "bestSellers"] as const).map(key => (
                <button
                  key={key}
                  onClick={() => setSelectedShowcaseKey(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                    selectedShowcaseKey === key
                      ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {key === "newArrivals" ? "Fresh Arrivals" : key === "bestSellers" ? "Best Sellers" : key}
                </button>
              ))}
            </div>
          </div>

          {/* Active Showcase Configuration Card */}
          {curatedSections[selectedShowcaseKey] && (
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Showcase Title</label>
                  <input
                    type="text"
                    value={curatedSections[selectedShowcaseKey].heading}
                    onChange={e =>
                      setCuratedSections(prev => ({
                        ...prev,
                        [selectedShowcaseKey]: { ...prev[selectedShowcaseKey], heading: e.target.value }
                      }))
                    }
                    className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Subheading / Description</label>
                  <input
                    type="text"
                    value={curatedSections[selectedShowcaseKey].subheading || ""}
                    onChange={e =>
                      setCuratedSections(prev => ({
                        ...prev,
                        [selectedShowcaseKey]: { ...prev[selectedShowcaseKey], subheading: e.target.value }
                      }))
                    }
                    className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. 100% Certified Organic • Lab Tested Purity"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Display Layout</label>
                    <select
                      value={curatedSections[selectedShowcaseKey].layout}
                      onChange={e =>
                        setCuratedSections(prev => ({
                          ...prev,
                          [selectedShowcaseKey]: {
                            ...prev[selectedShowcaseKey],
                            layout: e.target.value as "grid" | "carousel"
                          }
                        }))
                      }
                      className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="grid">Responsive Grid</option>
                      <option value="carousel">Horizontal Carousel</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Max Count</label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={curatedSections[selectedShowcaseKey].maxDisplayCount}
                      onChange={e =>
                        setCuratedSections(prev => ({
                          ...prev,
                          [selectedShowcaseKey]: { ...prev[selectedShowcaseKey], maxDisplayCount: Number(e.target.value) }
                        }))
                      }
                      className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Product Picker Section */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Select Products for this Showcase ({curatedSections[selectedShowcaseKey].productIds.length} Selected)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearchQuery}
                        onChange={e => setProductSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none w-48 sm:w-64"
                      />
                    </div>

                    <button
                      onClick={handleSaveCuratedShowcase}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Showcase
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto p-1">
                  {storeProducts
                    .filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.category.toLowerCase().includes(productSearchQuery.toLowerCase()))
                    .map(product => {
                      const isSelected = curatedSections[selectedShowcaseKey].productIds.includes(String(product.id));
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleToggleProductInShowcase(String(product.id))}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20"
                              : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                          }`}
                        >
                          <img
                            src={product.image || (product as any).images?.[0] || "https://images.unsplash.com/photo-1586201375761-83865001e31c"}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-white shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{product.name}</p>
                            <p className="text-[11px] text-zinc-500 truncate">{product.category}</p>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">₹{product.price}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 10. HERO BANNER CRUD MODAL */}
      {isHeroModalOpen && (
        <HeroBannerModal
          banner={editingHero}
          onClose={() => {
            setIsHeroModalOpen(false);
            setEditingHero(null);
          }}
          onSave={handleSaveHeroModal}
        />
      )}

      {/* 11. OFFER BANNER CRUD MODAL */}
      {isOfferModalOpen && (
        <OfferBannerModal
          offer={editingOffer}
          onClose={() => {
            setIsOfferModalOpen(false);
            setEditingOffer(null);
          }}
          onSave={handleSaveOfferModal}
        />
      )}

      {/* 12. CATEGORY BANNER CRUD MODAL */}
      {isCategoryModalOpen && (
        <CategoryBannerModal
          category={editingCategory}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategoryModal}
        />
      )}

      {/* 13. FLASH SALE CRUD MODAL */}
      {isFlashSaleModalOpen && (
        <FlashSaleModal
          flashSale={editingFlashSale}
          onClose={() => {
            setIsFlashSaleModalOpen(false);
            setEditingFlashSale(null);
          }}
          onSave={handleSaveFlashSaleModal}
        />
      )}

      {/* 14. RESPONSIVE DEVICE LIVE PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <LiveDevicePreviewModal
          device={previewDevice}
          setDevice={setPreviewDevice}
          sections={sections}
          heroBanners={heroBanners}
          offerBanners={offerBanners}
          categoryBanners={categoryBanners}
          flashSaleBanners={flashSaleBanners}
          curatedSections={curatedSections}
          storeProducts={storeProducts}
          onClose={() => setIsPreviewModalOpen(false)}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// HERO BANNER MODAL
// ----------------------------------------------------
function HeroBannerModal({
  banner,
  onClose,
  onSave
}: {
  banner: HeroBanner | null;
  onClose: () => void;
  onSave: (data: Partial<HeroBanner>) => void;
}) {
  const [formData, setFormData] = useState<Partial<HeroBanner>>(
    banner || {
      title: "",
      eyebrow: "100% Certified Organic",
      subtitle: "",
      desktopImageUrl: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=1920&q=80",
      mobileImageUrl: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=750&q=80",
      primaryCtaLabel: "Shop Organic Now",
      primaryCtaUrl: "/products",
      secondaryCtaLabel: "View Lab Reports",
      secondaryCtaUrl: "/about",
      badgeText: "Harvest 2026",
      active: true,
      startDate: "2026-09-01",
      endDate: "2026-12-31"
    }
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
            {banner ? "Edit Hero Carousel Slide" : "Add New Hero Carousel Slide"}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (!formData.title || !formData.desktopImageUrl) {
              toast.error("Please enter a title and desktop banner image URL.");
              return;
            }
            onSave(formData);
          }}
          className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Slide Main Headline *</label>
              <input
                type="text"
                required
                value={formData.title || ""}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. 100% Pure Wood Cold Pressed Oils"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Eyebrow Tagline</label>
              <input
                type="text"
                value={formData.eyebrow || ""}
                onChange={e => setFormData({ ...formData, eyebrow: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Fresh Farm Harvest"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Badge Text</label>
              <input
                type="text"
                value={formData.badgeText || ""}
                onChange={e => setFormData({ ...formData, badgeText: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Limited Edition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Subtitle Description</label>
              <textarea
                rows={2}
                value={formData.subtitle || ""}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Traditional wooden churn extraction at 35°C retaining 100% natural nutrients & aroma."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Desktop Banner Image URL (1920x800) *</label>
              <input
                type="url"
                required
                value={formData.desktopImageUrl || ""}
                onChange={e => setFormData({ ...formData, desktopImageUrl: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Mobile Banner Image URL (750x1000)</label>
              <input
                type="url"
                value={formData.mobileImageUrl || ""}
                onChange={e => setFormData({ ...formData, mobileImageUrl: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Primary CTA Button Text</label>
              <input
                type="text"
                value={formData.primaryCtaLabel || ""}
                onChange={e => setFormData({ ...formData, primaryCtaLabel: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Shop Oils"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Primary CTA URL</label>
              <input
                type="text"
                value={formData.primaryCtaUrl || ""}
                onChange={e => setFormData({ ...formData, primaryCtaUrl: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="/products?category=Oils"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Secondary CTA Button Text</label>
              <input
                type="text"
                value={formData.secondaryCtaLabel || ""}
                onChange={e => setFormData({ ...formData, secondaryCtaLabel: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Learn Extraction"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Secondary CTA URL</label>
              <input
                type="text"
                value={formData.secondaryCtaUrl || ""}
                onChange={e => setFormData({ ...formData, secondaryCtaUrl: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="/about"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
            >
              Save Hero Slide
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// OFFER BANNER MODAL
// ----------------------------------------------------
function OfferBannerModal({
  offer,
  onClose,
  onSave
}: {
  offer: OfferBanner | null;
  onClose: () => void;
  onSave: (data: Partial<OfferBanner>) => void;
}) {
  const [formData, setFormData] = useState<Partial<OfferBanner>>(
    offer || {
      type: "promo_strip",
      headline: "Festive Organic Sale: Flat 20% OFF on Traditional Rice & Millets",
      subtitle: "Use Code ORGANIC20 at checkout • Free Delivery on orders over ₹499",
      couponCode: "ORGANIC20",
      ctaLabel: "Shop Sale",
      ctaUrl: "/products",
      badge: "Limited Time",
      backgroundColor: "#1b4332",
      textColor: "#ffffff",
      active: true
    }
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            {offer ? "Edit Offer Banner" : "Add New Offer Banner"}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (!formData.headline) {
              toast.error("Please enter a headline.");
              return;
            }
            onSave(formData);
          }}
          className="p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Banner Format / Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="ticker">Top Announcement Ticker</option>
                <option value="promo_strip">Mid-Page Promo Strip</option>
                <option value="coupon_highlight">Coupon Highlight Box</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Badge Text</label>
              <input
                type="text"
                value={formData.badge || ""}
                onChange={e => setFormData({ ...formData, badge: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Free Shipping"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Headline Announcement *</label>
              <input
                type="text"
                required
                value={formData.headline || ""}
                onChange={e => setFormData({ ...formData, headline: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Get 20% OFF on all cold pressed oils today!"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Subtitle / Details</label>
              <input
                type="text"
                value={formData.subtitle || ""}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Free Delivery above ₹499"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Coupon Code</label>
              <input
                type="text"
                value={formData.couponCode || ""}
                onChange={e => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                placeholder="e.g. ORGANIC20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">CTA Button Label</label>
              <input
                type="text"
                value={formData.ctaLabel || ""}
                onChange={e => setFormData({ ...formData, ctaLabel: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Shop Now"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Background Color (Hex)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={formData.backgroundColor || "#1b4332"}
                  onChange={e => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={formData.backgroundColor || "#1b4332"}
                  onChange={e => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Text Color (Hex)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={formData.textColor || "#ffffff"}
                  onChange={e => setFormData({ ...formData, textColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={formData.textColor || "#ffffff"}
                  onChange={e => setFormData({ ...formData, textColor: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
            >
              Save Offer Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// CATEGORY BANNER MODAL
// ----------------------------------------------------
function CategoryBannerModal({
  category,
  onClose,
  onSave
}: {
  category: CategoryBanner | null;
  onClose: () => void;
  onSave: (data: Partial<CategoryBanner>) => void;
}) {
  const [formData, setFormData] = useState<Partial<CategoryBanner>>(
    category || {
      categorySlug: "oils",
      title: "Wood Cold Pressed Oils",
      subtitle: "Traditional Marachekku Extraction",
      desktopImageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80",
      mobileImageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80",
      badge: "Pure Harvest",
      active: true
    }
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            {category ? "Edit Category Banner" : "Add Category Banner"}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (!formData.title || !formData.desktopImageUrl) {
              toast.error("Please enter a category title and image URL.");
              return;
            }
            onSave(formData);
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Category Slug *</label>
            <input
              type="text"
              required
              value={formData.categorySlug || ""}
              onChange={e => setFormData({ ...formData, categorySlug: e.target.value.toLowerCase() })}
              className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. millets, oils, rice, sweeteners"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Display Title *</label>
            <input
              type="text"
              required
              value={formData.title || ""}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. Traditional Heritage Millets"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Subtitle / Tagline</label>
            <input
              type="text"
              value={formData.subtitle || ""}
              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
              className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. Unpolished & High Fiber"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Desktop Image URL *</label>
            <input
              type="url"
              required
              value={formData.desktopImageUrl || ""}
              onChange={e => setFormData({ ...formData, desktopImageUrl: e.target.value })}
              className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Badge Text</label>
            <input
              type="text"
              value={formData.badge || ""}
              onChange={e => setFormData({ ...formData, badge: e.target.value })}
              className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. Organic, Farm Fresh"
            />
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
            >
              Save Category Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// FLASH SALE MODAL
// ----------------------------------------------------
function FlashSaleModal({
  flashSale,
  onClose,
  onSave
}: {
  flashSale: FlashSaleBanner | null;
  onClose: () => void;
  onSave: (data: Partial<FlashSaleBanner>) => void;
}) {
  const [formData, setFormData] = useState<Partial<FlashSaleBanner>>(
    flashSale || {
      title: "Harvest Festival Flash Deal: Premium Groundnut Wood Pressed Oil (5L)",
      subtitle: "First Cold Pressing • Zero Chemicals • Unrefined Nutty Flavor",
      badge: "LIMITED HARVEST",
      endsAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16),
      discountPercentage: 40,
      targetProductSlug: "wood-pressed-groundnut-oil-5l",
      bannerImageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1200&q=80",
      totalStock: 100,
      claimedStock: 84,
      active: true
    }
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            {flashSale ? "Configure Flash Sale Campaign" : "New Flash Sale Campaign"}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (!formData.title || !formData.endsAt) {
              toast.error("Please provide campaign title and end date.");
              return;
            }
            onSave(formData);
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Campaign Title *</label>
            <input
              type="text"
              required
              value={formData.title || ""}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Subtitle / Urgency Pitch</label>
            <input
              type="text"
              value={formData.subtitle || ""}
              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
              className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Discount Percentage (%)</label>
              <input
                type="number"
                min={1}
                max={99}
                value={formData.discountPercentage || 40}
                onChange={e => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Sale Ends At (Date & Time) *</label>
              <input
                type="datetime-local"
                required
                value={formData.endsAt ? formData.endsAt.slice(0, 16) : ""}
                onChange={e => setFormData({ ...formData, endsAt: new Date(e.target.value).toISOString() })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Total Campaign Stock</label>
              <input
                type="number"
                value={formData.totalStock || 100}
                onChange={e => setFormData({ ...formData, totalStock: Number(e.target.value) })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Claimed Stock</label>
              <input
                type="number"
                value={formData.claimedStock || 84}
                onChange={e => setFormData({ ...formData, claimedStock: Number(e.target.value) })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Target Product Slug</label>
            <input
              type="text"
              value={formData.targetProductSlug || ""}
              onChange={e => setFormData({ ...formData, targetProductSlug: e.target.value })}
              className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono"
              placeholder="e.g. wood-pressed-groundnut-oil-5l"
            />
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-sm"
            >
              Save Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// LIVE DEVICE PREVIEW MODAL
// ----------------------------------------------------
function LiveDevicePreviewModal({
  device,
  setDevice,
  sections,
  heroBanners,
  offerBanners,
  categoryBanners,
  flashSaleBanners,
  curatedSections,
  storeProducts,
  onClose
}: {
  device: "desktop" | "tablet" | "mobile";
  setDevice: (d: "desktop" | "tablet" | "mobile") => void;
  sections: CmsSection[];
  heroBanners: HeroBanner[];
  offerBanners: OfferBanner[];
  categoryBanners: CategoryBanner[];
  flashSaleBanners: FlashSaleBanner[];
  curatedSections: any;
  storeProducts: Product[];
  onClose: () => void;
}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const activeHeroSlides = heroBanners.filter(b => b.active);
  const activeOffer = offerBanners.find(o => o.active);
  const activeFlashSale = flashSaleBanners.find(f => f.active);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden">
      {/* Top Device Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-white shadow-2xl mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">Storefront Live Device Simulator</span>
          <span className="text-xs text-zinc-400 hidden sm:inline">• Renders live CMS sections in real-time</span>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              device === "desktop" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Desktop (1440px)
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              device === "tablet" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            Tablet (768px)
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              device === "mobile" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile (375px)
          </button>
        </div>

        <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Frame Container */}
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
        <div
          className={`h-full bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-y-auto border border-zinc-300 dark:border-zinc-800 transition-all duration-300 ${
            device === "desktop"
              ? "w-full max-w-5xl"
              : device === "tablet"
              ? "w-[768px] max-w-full"
              : "w-[375px] max-w-full border-[8px] border-zinc-900 rounded-[36px]"
          }`}
        >
          {/* Top Promo Ticker (if active) */}
          {activeOffer && (
            <div
              className="py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2"
              style={{ backgroundColor: activeOffer.backgroundColor || "#1b4332", color: activeOffer.textColor || "#ffffff" }}
            >
              <span>{activeOffer.headline}</span>
              {activeOffer.couponCode && (
                <span className="px-2 py-0.5 rounded bg-black/20 text-[10px] font-mono font-bold">
                  {activeOffer.couponCode}
                </span>
              )}
            </div>
          )}

          {/* Store Navbar Mockup */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
                JA
              </div>
              <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">JANANI AGRO</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
              <span className="hidden sm:inline">Millets</span>
              <span className="hidden sm:inline">Oils</span>
              <span className="hidden sm:inline">Rice</span>
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* Dynamic Ordered Sections */}
          <div className="space-y-8 pb-12">
            {sections
              .filter(s => s.enabled)
              .sort((a, b) => a.order - b.order)
              .map(sec => {
                // 1. HERO SLIDER
                if (sec.type === "hero_slider") {
                  const currentSlide = activeHeroSlides[activeSlide] || activeHeroSlides[0];
                  if (!currentSlide) return null;
                  return (
                    <div key={sec.id} className="relative aspect-[16/8] sm:aspect-[21/9] w-full bg-zinc-950 overflow-hidden group">
                      <img
                        src={device === "mobile" && currentSlide.mobileImageUrl ? currentSlide.mobileImageUrl : currentSlide.desktopImageUrl}
                        alt={currentSlide.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-6 sm:p-10 text-white max-w-xl">
                        {currentSlide.badgeText && (
                          <span className="self-start px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-zinc-950 mb-2">
                            {currentSlide.badgeText}
                          </span>
                        )}
                        <p className="text-xs text-emerald-300 font-medium">{currentSlide.eyebrow}</p>
                        <h2 className="text-xl sm:text-3xl font-extrabold leading-tight mt-1">{currentSlide.title}</h2>
                        <p className="text-xs sm:text-sm text-zinc-200 mt-2 line-clamp-2">{currentSlide.subtitle}</p>
                        <div className="flex items-center gap-2 mt-4">
                          <button className="px-4 py-2 bg-emerald-500 text-zinc-950 rounded-xl text-xs font-bold shadow">
                            {currentSlide.primaryCtaLabel || "Shop Now"}
                          </button>
                        </div>
                      </div>

                      {activeHeroSlides.length > 1 && (
                        <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
                          {activeHeroSlides.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveSlide(i)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                activeSlide === i ? "w-6 bg-emerald-400" : "bg-white/40"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // 2. TRUST BADGES
                if (sec.type === "trust_badges") {
                  return (
                    <div key={sec.id} className="px-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">🌿 100% Organic</p>
                          <p className="text-[10px] text-zinc-500">Certified pure harvest</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">🚜 Direct From Farmers</p>
                          <p className="text-[10px] text-zinc-500">Zero middlemen cuts</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">🧪 Lab Tested Purity</p>
                          <p className="text-[10px] text-zinc-500">Zero chemical residues</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">⚡ Express Delivery</p>
                          <p className="text-[10px] text-zinc-500">Pan-India Shiprocket</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                // 3. CATEGORY GRID
                if (sec.type === "category_grid") {
                  return (
                    <div key={sec.id} className="px-6 space-y-3">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Shop by Category</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {categoryBanners.filter(c => c.active).map(cat => (
                          <div key={cat.id} className="relative aspect-[4/3] rounded-xl overflow-hidden group shadow-sm bg-zinc-900">
                            <img src={cat.desktopImageUrl} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                              <p className="text-xs font-bold leading-tight">{cat.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // 4. FLASH SALE
                if (sec.type === "flash_sale" && activeFlashSale) {
                  return (
                    <div key={sec.id} className="px-6">
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-900 to-amber-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white uppercase">
                            {activeFlashSale.badge || "FLASH SALE"}
                          </span>
                          <h4 className="text-base font-bold mt-1">{activeFlashSale.title}</h4>
                          <p className="text-xs text-rose-200">{activeFlashSale.subtitle}</p>
                        </div>
                        <button className="px-4 py-2 bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl shrink-0 shadow">
                          Claim {activeFlashSale.discountPercentage}% OFF
                        </button>
                      </div>
                    </div>
                  );
                }

                // 5. PRODUCT SHOWCASES
                if (sec.type.startsWith("product_showcase")) {
                  let cfg = curatedSections.featured;
                  if (sec.type.includes("trending")) cfg = curatedSections.trending;
                  else if (sec.type.includes("bestsellers")) cfg = curatedSections.bestSellers;
                  else if (sec.type.includes("new")) cfg = curatedSections.newArrivals;

                  return (
                    <div key={sec.id} className="px-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{cfg.heading}</h3>
                          {cfg.subheading && <p className="text-xs text-zinc-500">{cfg.subheading}</p>}
                        </div>
                        <span className="text-xs font-semibold text-emerald-600">View All →</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {storeProducts.slice(0, cfg.maxDisplayCount || 4).map(p => (
                          <div key={p.id} className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                            <img src={p.image || (p as any).images?.[0]} alt={p.name} className="w-full aspect-square object-cover rounded-lg bg-zinc-100" />
                            <div>
                              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{p.name}</p>
                              <p className="text-xs font-bold text-emerald-600 mt-0.5">₹{p.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
