import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  RotateCcw,
  Copy,
  Star,
  Flame,
  Sparkles,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  DollarSign,
  Warehouse,
  CheckSquare,
  Square,
  X,
  Save,
  Globe,
  ImageIcon,
  Tag,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  HelpCircle,
  Check,
  ChevronDown,
  Info,
  ListPlus,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  toggleAdminProduct,
  duplicateAdminProduct,
  deleteAdminProduct,
  restoreAdminProduct,
  permanentDeleteAdminProduct,
  bulkUpdateProductStatus,
  bulkUpdateProductPrice,
  bulkUpdateProductStock,
  bulkDeleteAdminProducts,
  importAdminProducts,
  getAdminFullCategories,
  getCategories
} from "@/lib/api";

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  originalPrice: number;
  stock: number;
}

export const JANANI_DEFAULT_CATEGORIES = [
  "Bio Fertilizers",
  "Bio Pesticides",
  "Bio Fungicides",
  "Bio Stimulants",
  "Micro Nutrients",
  "Insecticides",
  "Fungicides",
  "Botanical Extracts",
  "Water Solubles",
  "Agri Inputs",
  "Others"
];

export const JANANI_DEFAULT_BRANDS = [
  "Janani Agro Products",
  "Janani Bio Sciences",
  "Janani Farm Care"
];

export interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  unit: string;
  warehouseStock: number;
  reservedStock: number;
  stock: number; // Available
  lowStockThreshold: number;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Draft";
  active: boolean;
  featured: boolean;
  trending: boolean;
  isNewArrival: boolean;
  badge: string;
  rating: number;
  reviewsCount: number;
  image: string;
  gallery: string[];
  variants: ProductVariant[];
  description: string;
  harvestOrigin: string;
  organicCertifications: string[];
  subtitle?: string;
  benefits?: string[];
  dosage?: string;
  methodOfApplication?: string;
  recommendedCrops?: string;
  crops?: string[];
  activeOrganism?: string;
  targetDiseases?: string;
  compatibility?: string;
  storageNotice?: string;
  shelfLife?: string;
  specifications?: Record<string, string>;
  faqs?: { q: string; a: string; question?: string; answer?: string }[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    canonicalUrl: string;
    ogImage: string;
  };
  deletedAt: string | null;
  createdAt: string;
}

export function ProductsManagement() {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [statusFilter, setStatusFilter] = useState<"active" | "trash">("active");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Multi-Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dynamic Categories from DB / API
  const [categoriesList, setCategoriesList] = useState<string[]>(JANANI_DEFAULT_CATEGORIES);

  const loadCategories = async () => {
    try {
      const res = await getAdminFullCategories({ status: "active" });
      const namesFromApi: string[] = [];
      if (res?.success && Array.isArray(res.data)) {
        res.data.forEach((c: any) => {
          if (c.name && typeof c.name === "string" && c.name.trim()) {
            namesFromApi.push(c.name.trim());
          }
        });
      }

      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("janani_admin_categories");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              parsed.forEach((c: any) => {
                if (c.name && typeof c.name === "string" && c.name.trim()) {
                  namesFromApi.push(c.name.trim());
                }
              });
            }
          }
        } catch (e) {}
      }

      const combined = Array.from(new Set([...namesFromApi, ...JANANI_DEFAULT_CATEGORIES])).filter(Boolean);
      setCategoriesList(combined);
    } catch (e) {
      console.warn("Could not load categories in ProductsManagement:", e);
    }
  };

  useEffect(() => {
    loadCategories();

    const handleCategoryUpdate = () => {
      loadCategories();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("janani-categories-updated", handleCategoryUpdate);
      return () => {
        window.removeEventListener("janani-categories-updated", handleCategoryUpdate);
      };
    }
  }, []);

  // Modals & Drawers
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductItem | null>(null);
  const [previewProduct, setPreviewProduct] = useState<AdminProductItem | null>(null);
  const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);
  const [isBulkStockOpen, setIsBulkStockOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Load Products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getAdminProducts({
        status: statusFilter,
        category: categoryFilter,
        brand: brandFilter,
        stockStatus: stockFilter,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        search
      });
      if (res?.success && Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [statusFilter, categoryFilter, brandFilter, stockFilter]);

  // Combined available categories for filters and forms
  const availableCategories = useMemo(() => {
    const fromProds = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...categoriesList, ...fromProds])).filter(Boolean);
  }, [categoriesList, products]);

  // Client-side Filter
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q);

      const matchMin = !minPrice || p.price >= Number(minPrice);
      const matchMax = !maxPrice || p.price <= Number(maxPrice);

      return matchSearch && matchMin && matchMax;
    });
  }, [products, search, minPrice, maxPrice]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Inline Toggles
  const handleToggleField = async (id: string, field: "active" | "featured" | "trending" | "isNewArrival") => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: !p[field] } : p))
    );
    await toggleAdminProduct(id, field);
    await loadProducts();
    toast.success(`Product ${field} updated in database`);
  };

  // Duplication
  const handleDuplicate = async (id: string) => {
    const res = await duplicateAdminProduct(id);
    if (res?.success) {
      await loadProducts();
      toast.success("Product duplicated successfully in database");
    } else {
      toast.error(res?.message || "Failed to duplicate product");
    }
  };

  // Soft Delete & Restore Handlers
  const handleDelete = async (id: string) => {
    if (statusFilter === "trash") {
      await permanentDeleteAdminProduct(id);
      await loadProducts();
      toast.success("Product permanently deleted from database");
    } else {
      await deleteAdminProduct(id);
      await loadProducts();
      toast.success("Product moved to Trash Bin in database");
    }
  };

  const handleRestore = async (id: string) => {
    await restoreAdminProduct(id);
    await loadProducts();
    toast.success("Product restored to active catalog in database");
  };

  // Bulk Operations
  const handleBulkStatus = async (active: boolean) => {
    if (selectedIds.length === 0) return;
    await bulkUpdateProductStatus(selectedIds, active);
    setSelectedIds([]);
    await loadProducts();
    toast.success(`Updated status for ${selectedIds.length} products in database`);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    await bulkDeleteAdminProducts(selectedIds);
    setSelectedIds([]);
    await loadProducts();
    toast.success(`Moved ${selectedIds.length} products to Trash Bin in database`);
  };

  // CSV Export
  const exportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "SKU",
      "Category",
      "Brand",
      "Price",
      "MRP",
      "Available Stock",
      "Warehouse Stock",
      "Reserved Stock",
      "Status",
      "Active",
      "Featured",
      "Trending",
      "New Arrival",
      "Badge",
      "Meta Title",
      "Meta Description"
    ];

    const rows = products.map((p) => [
      p.id,
      `"${p.name}"`,
      p.sku,
      `"${p.category}"`,
      `"${p.brand || 'Janani Gold Reserve'}"`,
      p.price,
      p.originalPrice || Math.round(p.price * 1.2),
      p.stock,
      p.warehouseStock || p.stock,
      p.reservedStock || 0,
      p.status || "In Stock",
      p.active,
      p.featured,
      p.trending,
      p.isNewArrival,
      `"${p.badge || ''}"`,
      `"${(p.seo?.metaTitle || '').replace(/"/g, '""')}"`,
      `"${(p.seo?.metaDescription || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Janani_Agro_Products_${Date.now()}.csv`;
    link.click();
    toast.success("Products catalog exported to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Master Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
            <Package className="size-3.5" /> Product Catalog & Inventory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Products & Variants Manager ({products.length})
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage SKU listings, variant pack sizes, warehouse inventory vs reserved stock, pricing, and SEO meta tags.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Trash Bin Toggle */}
          <button
            onClick={() => {
              setStatusFilter(statusFilter === "active" ? "trash" : "active");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all shadow-sm ${
              statusFilter === "trash"
                ? "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-400"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trash2 className="size-4" />
            {statusFilter === "trash" ? "Back to Active" : "Trash Bin"}
          </button>

          <Button
            onClick={() => setIsImportModalOpen(true)}
            variant="outline"
            size="sm"
            className="rounded-2xl text-xs font-bold gap-1.5"
          >
            <Upload className="size-3.5" /> Import CSV
          </Button>

          <Button
            onClick={exportCSV}
            variant="outline"
            size="sm"
            className="rounded-2xl text-xs font-bold gap-1.5"
          >
            <Download className="size-3.5" /> Export CSV
          </Button>

          <Button
            onClick={() => {
              setEditingProduct(null);
              setIsFormModalOpen(true);
            }}
            size="sm"
            className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs gap-1.5 shadow-md shadow-emerald-700/20"
          >
            <Plus className="size-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Multi-Filter Toolbar */}
      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by product name, SKU, brand, tags..."
              className="h-10 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-xs outline-none focus:border-emerald-600 shadow-sm font-medium"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-2xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-emerald-600"
          >
            <option value="all">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-2xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-emerald-600"
          >
            <option value="all">All Brands</option>
            {JANANI_DEFAULT_BRANDS.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          {/* Stock Level Filter */}
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="h-10 rounded-2xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-emerald-600"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock (&gt; 20 units)</option>
            <option value="low_stock">Low Stock (≤ 20 units)</option>
            <option value="out_of_stock">Out of Stock (0 units)</option>
          </select>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-500/10 p-3 border border-emerald-500/30 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-emerald-600 px-2.5 py-0.5 text-xs font-extrabold text-white">
                {selectedIds.length} Products Selected
              </span>
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold hidden sm:inline">
                Bulk Batch Operations:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setIsBulkPriceOpen(true)}
                size="sm"
                variant="outline"
                className="h-8 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-500/20 gap-1"
              >
                <DollarSign className="size-3.5" /> Bulk Price Update
              </Button>

              <Button
                onClick={() => setIsBulkStockOpen(true)}
                size="sm"
                variant="outline"
                className="h-8 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-500/20 gap-1"
              >
                <Warehouse className="size-3.5" /> Bulk Stock Restock
              </Button>

              <Button
                onClick={() => handleBulkStatus(true)}
                size="sm"
                variant="outline"
                className="h-8 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-500/20"
              >
                Set Active
              </Button>

              <Button
                onClick={() => handleBulkStatus(false)}
                size="sm"
                variant="outline"
                className="h-8 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-500/20"
              >
                Set Inactive
              </Button>

              <Button
                onClick={handleBulkDelete}
                size="sm"
                className="h-8 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold gap-1"
              >
                <Trash2 className="size-3.5" /> Move to Trash
              </Button>

              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-muted-foreground hover:underline ml-2"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Data Table */}
      <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-4 text-center w-10">
                  <button onClick={handleSelectAll} className="text-muted-foreground hover:text-foreground">
                    {selectedIds.length > 0 && selectedIds.length === paginatedProducts.length ? (
                      <CheckSquare className="size-4 text-emerald-600" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-4 py-4">Category & Brand</th>
                <th className="px-4 py-4">Pricing</th>
                <th className="px-4 py-4">Warehouse & Available</th>
                <th className="px-3 py-4 text-center">Featured</th>
                <th className="px-3 py-4 text-center">Trending</th>
                <th className="px-3 py-4 text-center">New</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const available = p.stock ?? (p.warehouseStock || 50) - (p.reservedStock || 0);
                  const isLow = available <= (p.lowStockThreshold || 20) && available > 0;
                  const isOut = available === 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-accent/40 transition-colors ${
                        selectedIds.includes(p.id) ? "bg-emerald-500/5" : ""
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => handleToggleSelect(p.id)}>
                          {selectedIds.includes(p.id) ? (
                            <CheckSquare className="size-4 text-emerald-600" />
                          ) : (
                            <Square className="size-4 text-muted-foreground" />
                          )}
                        </button>
                      </td>

                      {/* Title, Thumbnail, SKU */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setPreviewProduct(p)}
                            className="size-12 rounded-2xl bg-muted/80 border border-border/80 overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity shadow-sm flex items-center justify-center font-bold text-xs"
                          >
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="size-full object-cover" />
                            ) : (
                              "🌿"
                            )}
                          </div>
                          <div className="min-w-0">
                            <span
                              onClick={() => setPreviewProduct(p)}
                              className="font-extrabold text-foreground text-sm hover:text-emerald-600 cursor-pointer truncate block"
                            >
                              {p.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              <span className="font-mono text-emerald-600 font-bold">{p.sku}</span>
                              <span>• {p.unit || "500g"}</span>
                              {p.variants && p.variants.length > 1 && (
                                <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700">
                                  {p.variants.length} Variants
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-muted px-2 py-0.5 text-[10px] font-semibold block w-fit">
                          {p.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block truncate">
                          {p.brand || "Janani Gold Reserve"}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="px-4 py-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-extrabold text-foreground text-sm">₹{p.price}</span>
                          <span className="text-[10px] text-muted-foreground line-through">
                            ₹{p.originalPrice || Math.round(p.price * 1.2)}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-600 block">
                          {Math.round((((p.originalPrice || Math.round(p.price * 1.2)) - p.price) / (p.originalPrice || Math.round(p.price * 1.2))) * 100)}% Margin
                        </span>
                      </td>

                      {/* Warehouse vs Reserved vs Available Stock */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                              isOut ? "bg-rose-500/15 text-rose-600 border border-rose-500/30" : isLow ? "bg-amber-500/15 text-amber-600 border border-amber-500/30" : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                            }`}>
                              {available} Avail
                            </span>
                            {p.reservedStock ? (
                              <span className="text-[9px] text-muted-foreground font-mono">
                                ({p.reservedStock} res)
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[9px] text-muted-foreground block">
                            Warehouse: {p.warehouseStock || p.stock} units
                          </span>
                        </div>
                      </td>

                      {/* Featured (Star) */}
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => handleToggleField(p.id, "featured")}
                          className={`p-1.5 rounded-xl transition-colors ${
                            p.featured ? "bg-amber-500/15 text-amber-600" : "text-muted-foreground/40 hover:text-muted-foreground"
                          }`}
                          title="Toggle Featured"
                        >
                          <Star className={`size-4 ${p.featured ? "fill-amber-500" : ""}`} />
                        </button>
                      </td>

                      {/* Trending (Flame) */}
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => handleToggleField(p.id, "trending")}
                          className={`p-1.5 rounded-xl transition-colors ${
                            p.trending ? "bg-rose-500/15 text-rose-600" : "text-muted-foreground/40 hover:text-muted-foreground"
                          }`}
                          title="Toggle Trending"
                        >
                          <Flame className={`size-4 ${p.trending ? "fill-rose-500" : ""}`} />
                        </button>
                      </td>

                      {/* New Arrival (Sparkles) */}
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => handleToggleField(p.id, "isNewArrival")}
                          className={`p-1.5 rounded-xl transition-colors ${
                            p.isNewArrival ? "bg-blue-500/15 text-blue-600" : "text-muted-foreground/40 hover:text-muted-foreground"
                          }`}
                          title="Toggle New Arrival"
                        >
                          <Sparkles className={`size-4 ${p.isNewArrival ? "fill-blue-500" : ""}`} />
                        </button>
                      </td>

                      {/* Active Status */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleField(p.id, "active")}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold transition-colors ${
                            p.active
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${p.active ? "bg-emerald-500" : "bg-muted-foreground"}`}></span>
                          {p.active ? "Active" : "Draft"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {statusFilter === "trash" ? (
                            <>
                              <Button
                                onClick={() => handleRestore(p.id)}
                                size="sm"
                                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] h-7 font-bold gap-1"
                              >
                                <RotateCcw className="size-3" /> Restore
                              </Button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-500/15 text-rose-600 transition-colors"
                                title="Delete Permanently"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setPreviewProduct(p)}
                                className="p-1.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                title="Quick Storefront Preview"
                              >
                                <Eye className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(p.id)}
                                className="p-1.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                title="Duplicate Product"
                              >
                                <Copy className="size-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsFormModalOpen(true);
                                }}
                                className="p-1.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                title="Edit Product & Variants"
                              >
                                <Edit className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="p-1.5 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors"
                                title="Move to Trash"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <Package className="size-10 mx-auto opacity-30 mb-2" />
                    <p className="text-sm font-bold text-foreground">No products match your filters</p>
                    <p className="text-xs text-muted-foreground mt-1">Reset your filters or add a new organic product</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border bg-muted/20 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Showing {paginatedProducts.length} of {filteredProducts.length} products</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 rounded-xl border border-border bg-card px-2 text-xs font-semibold outline-none"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl text-xs font-semibold h-8"
            >
              Previous
            </Button>
            <span className="px-3 text-xs font-bold text-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl text-xs font-semibold h-8"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Product Preview Slide-out Drawer */}
      {previewProduct && (
        <ProductPreviewDrawer
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
          onEdit={() => {
            setEditingProduct(previewProduct);
            setPreviewProduct(null);
            setIsFormModalOpen(true);
          }}
        />
      )}

      {/* Add / Edit Product 6-Tab Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        categories={availableCategories}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProduct(null);
        }}
        initialData={editingProduct}
        onSave={async (formData) => {
          try {
            if (editingProduct) {
              const res = await updateAdminProduct(editingProduct.id, formData);
              if (!res || res.success === false) {
                toast.error(res?.message || "Failed to update product in database");
                return;
              }
              toast.success(`Product "${formData.name}" updated successfully in database`);
            } else {
              const res = await createAdminProduct(formData);
              if (!res || res.success === false) {
                toast.error(res?.message || "Failed to create product in database");
                return;
              }
              toast.success(`Product "${formData.name}" created successfully in database`);
            }
            await loadProducts();
          } catch (err: any) {
            toast.error(err?.message || "An error occurred while saving product");
          } finally {
            setIsFormModalOpen(false);
            setEditingProduct(null);
          }
        }}
      />

      {/* Bulk Price Update Modal */}
      <BulkPriceModal
        isOpen={isBulkPriceOpen}
        selectedCount={selectedIds.length}
        onClose={() => setIsBulkPriceOpen(false)}
        onSubmit={async (payload) => {
          await bulkUpdateProductPrice({ ids: selectedIds, ...payload });
          loadProducts();
          setSelectedIds([]);
          setIsBulkPriceOpen(false);
          toast.success("Bulk prices updated across selected products");
        }}
      />

      {/* Bulk Stock Restock Modal */}
      <BulkStockModal
        isOpen={isBulkStockOpen}
        selectedCount={selectedIds.length}
        onClose={() => setIsBulkStockOpen(false)}
        onSubmit={async (payload) => {
          await bulkUpdateProductStock({ ids: selectedIds, ...payload });
          loadProducts();
          setSelectedIds([]);
          setIsBulkStockOpen(false);
          toast.success("Bulk inventory restocked across selected products");
        }}
      />

      {/* Import Products CSV Modal */}
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async (importedList) => {
          await importAdminProducts(importedList);
          loadProducts();
          setIsImportModalOpen(false);
          toast.success(`Successfully imported ${importedList.length} products`);
        }}
      />
    </div>
  );
}

// -------------------------------------------------------------
// Product Preview Slide-out Drawer
// -------------------------------------------------------------
function ProductPreviewDrawer({
  product,
  onClose,
  onEdit
}: {
  product: AdminProductItem;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-card border-l border-border h-full p-6 shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Live Storefront Preview
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent text-muted-foreground"><X className="size-4" /></button>
        </div>

        <div className="mt-4 space-y-4 flex-1">
          {/* Main Gallery Image */}
          <div className="h-64 w-full rounded-3xl bg-muted border border-border/80 overflow-hidden shadow-inner flex items-center justify-center">
            {selectedImage ? (
              <img src={selectedImage} alt={product.name} className="size-full object-cover" />
            ) : (
              "🌿"
            )}
          </div>

          {/* Gallery Thumbnails */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 pb-1 no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {product.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`size-14 rounded-2xl border-2 overflow-hidden shrink-0 transition-all ${
                    selectedImage === img ? "border-emerald-600 shadow-md" : "border-border/60 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="thumb" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Product Header */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              {product.category} • {product.brand || "Janani Gold Reserve"}
            </span>
            <h3 className="text-xl font-extrabold text-foreground mt-0.5">{product.name}</h3>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">SKU: {product.sku}</p>
          </div>

          {/* Pricing & Stock */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/60">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-foreground">
                  ₹{selectedVariant?.price || product.price}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  ₹{selectedVariant?.originalPrice || product.originalPrice}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Available Stock</span>
              <p className="text-base font-extrabold text-emerald-600">
                {product.stock} units
              </p>
            </div>
          </div>

          {/* Inventory Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Warehouse On-Hand:</span>
              <strong className="text-foreground">{product.warehouseStock || product.stock} units</strong>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Reserved in Customer Orders:</span>
              <strong className="text-foreground">{product.reservedStock || 0} units</strong>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Low Stock Alert Trigger:</span>
              <strong className="text-amber-600">≤ {product.lowStockThreshold || 20} units</strong>
            </div>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <span className="text-xs font-bold text-foreground block mb-1.5">Select Pack Variant:</span>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${
                      selectedVariant?.id === v.id
                        ? "border-emerald-600 bg-emerald-500/10 font-bold"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <span className="block font-bold">{v.name}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">₹{v.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <span className="text-xs font-bold text-foreground block mb-1">Description</span>
            <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Origin & Certifications */}
          <div className="pt-2 border-t border-border space-y-1.5 text-xs text-muted-foreground">
            <p>📍 <strong>Origin:</strong> {product.harvestOrigin || "Gujarat Farmer Cluster"}</p>
            <p>🌱 <strong>Certifications:</strong> {(product.organicCertifications || ["NPOP Certified Organic"]).join(", ")}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex gap-2">
          <Button onClick={onEdit} className="w-full rounded-2xl bg-emerald-600 text-white font-bold text-xs gap-1.5 shadow">
            <Edit className="size-3.5" /> Edit This Product
          </Button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Add / Edit Product 6-Tab Modal
// -------------------------------------------------------------
function ProductFormModal({
  isOpen,
  onClose,
  initialData,
  categories = JANANI_DEFAULT_CATEGORIES,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: AdminProductItem | null;
  categories?: string[];
  onSave: (data: any) => void;
}) {
  const activeCategories = (categories && categories.length > 0) ? categories : JANANI_DEFAULT_CATEGORIES;
  const defaultCategory = activeCategories[0] || "Bio Fertilizers";

  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "variants" | "gallery" | "specs" | "seo" | "toggles">("general");
  const [specsSubTab, setSpecsSubTab] = useState<"desc" | "benefits" | "usage" | "crops" | "specs" | "reviews" | "faqs">("desc");

  const COMMON_CROPS = [
    "Paddy / Rice",
    "Cotton",
    "Chilli",
    "Tomato",
    "Brinjal",
    "Sugarcane",
    "Banana",
    "Mango",
    "Pomegranate",
    "Wheat",
    "Groundnut",
    "Soyabean",
    "Pulses",
    "Turmeric & Ginger",
    "Vegetables",
    "Fruit Crops"
  ];

  const BENEFIT_PRESETS = [
    "Controls and suppresses soil-borne fungal pathogens and root rot",
    "Reduces damping-off, wilt, and collar rot in seedlings and mature crops",
    "Stimulates vigorous root system and lateral feeder roots growth",
    "Improves rhizosphere beneficial microbial biodiversity",
    "Enhances nutrient mobilization and moisture absorption capacity",
    "100% Residue-free and safe for certified organic farming",
    "Fully compatible with drip fertigation and organic composts",
    "Improves crop yield grade, fruit size uniformity, and post-harvest shelf life"
  ];

  const SPEC_PRESETS = [
    { key: "CFU Count", value: "2 x 10^8 CFU/ml minimum" },
    { key: "pH Level", value: "6.5 – 7.5" },
    { key: "Formulation Type", value: "Liquid Bio-Active Formulation" },
    { key: "Carrier Material", value: "Aqueous Bio-Buffer Base" },
    { key: "Organic Matter", value: "25.0% w/w minimum" },
    { key: "Solubility", value: "100% Water Soluble" },
    { key: "Purity / Potency", value: "High-grade certified active inoculant" }
  ];

  const FAQ_TEMPLATES = [
    {
      q: "When and how should this product be applied for maximum efficacy?",
      a: "Apply during early morning or late afternoon for optimal microbial viability. In wet soils, drip fertigation or soil drenching delivers rapid root-zone uptake."
    },
    {
      q: "Can this product be tank-mixed with other fertilizers or pesticides?",
      a: "Fully compatible with organic biofertilizers, seaweed extracts, and compost teas. Avoid mixing in tank with chemical copper fungicides, bactericides, or harsh systemic poisons."
    },
    {
      q: "What is the recommended shelf life and storage practice?",
      a: "Shelf life is 18–24 months from manufacturing date. Store in a cool, dry place away from direct sunlight and heat."
    },
    {
      q: "Is this certified for organic farming and zero-residue agriculture?",
      a: "Yes, 100% certified organic and compliant with NPOP organic agriculture standards, leaving zero chemical residues on produce."
    }
  ];

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    category: defaultCategory,
    brand: "Janani Agro Products",
    price: "450",
    originalPrice: "520",
    unit: "1 L",
    warehouseStock: "50",
    reservedStock: "0",
    lowStockThreshold: "20",
    badge: "100% Organic",
    rating: "4.8",
    reviewsCount: "53",
    description: "",
    harvestOrigin: "Janani Bio Sciences Cluster, Gujarat",
    image: "",
    gallery: [] as string[],
    variants: [] as ProductVariant[],
    organicCertifications: ["NPOP Certified Organic", "Jaivik Bharat"],
    subtitle: "",
    benefits: "",
    dosage: "",
    methodOfApplication: "",
    recommendedCrops: "",
    activeOrganism: "",
    targetDiseases: "",
    compatibility: "",
    storageNotice: "Store in a cool, dry place away from direct sunlight",
    shelfLife: "18–24 Months",
    customSpecs: [
      { key: "CFU Count", value: "2 x 10^8 CFU/ml minimum" },
      { key: "pH Level", value: "6.5 – 7.5" },
      { key: "Formulation Type", value: "Liquid Bio-Active Formulation" }
    ] as { key: string; value: string }[],
    faqs: FAQ_TEMPLATES as { q: string; a: string }[],
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      canonicalUrl: "",
      ogImage: ""
    },
    active: true,
    featured: false,
    trending: false,
    isNewArrival: true
  });

  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  useEffect(() => {
    if (initialData) {
      const rawData = initialData as any;

      // Extract custom specifications (excluding default fixed keys)
      const existingSpecs: { key: string; value: string }[] = [];
      if (rawData.specifications && typeof rawData.specifications === "object") {
        Object.entries(rawData.specifications).forEach(([k, v]) => {
          if (!["Active Organism", "Targeted Diseases / Pests", "Targeted Diseases", "Compatibility", "Shelf Life", "Dosage", "Recommended Dosage", "Formulation"].includes(k)) {
            existingSpecs.push({ key: k, value: String(v) });
          }
        });
      }
      if (existingSpecs.length === 0) {
        existingSpecs.push(
          { key: "CFU Count", value: "2 x 10^8 CFU/ml minimum" },
          { key: "pH Level", value: "6.5 – 7.5" }
        );
      }

      // Extract FAQs
      let existingFaqs: { q: string; a: string }[] = [];
      if (Array.isArray(rawData.faqs) && rawData.faqs.length > 0) {
        existingFaqs = rawData.faqs.map((f: any) => ({
          q: f.q || f.question || "",
          a: f.a || f.answer || ""
        })).filter((f: any) => f.q && f.a);
      }
      if (existingFaqs.length === 0) {
        existingFaqs = FAQ_TEMPLATES;
      }

      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        sku: initialData.sku || "",
        category: initialData.category || defaultCategory,
        brand: initialData.brand || "Janani Agro Products",
        price: String(initialData.price || 450),
        originalPrice: String(initialData.originalPrice || 520),
        unit: initialData.unit || "1 L",
        warehouseStock: String(initialData.warehouseStock ?? initialData.stock ?? 50),
        reservedStock: String(initialData.reservedStock ?? 0),
        lowStockThreshold: String(initialData.lowStockThreshold || 20),
        badge: initialData.badge || "100% Organic",
        rating: String(initialData.rating || 4.8),
        reviewsCount: String(initialData.reviewsCount || (initialData as any).reviews || 53),
        description: initialData.description || "",
        harvestOrigin: initialData.harvestOrigin || "Janani Bio Sciences Cluster, Gujarat",
        image: initialData.image || "",
        gallery: (initialData.gallery && initialData.gallery.length > 0)
          ? initialData.gallery
          : (initialData.image ? [initialData.image] : []),
        variants: initialData.variants || [],
        organicCertifications: initialData.organicCertifications || ["NPOP Certified Organic"],
        subtitle: rawData.subtitle || "",
        benefits: Array.isArray(rawData.benefits) ? rawData.benefits.join("\n") : (rawData.benefits || ""),
        dosage: rawData.dosage || "",
        methodOfApplication: rawData.methodOfApplication || "",
        recommendedCrops: rawData.recommendedCrops || (Array.isArray(rawData.crops) ? rawData.crops.join(", ") : ""),
        activeOrganism: rawData.specifications?.["Active Organism"] || rawData.specifications?.["Technical Composition"] || rawData.activeOrganism || "",
        targetDiseases: rawData.targetDiseases || rawData.specifications?.["Targeted Diseases"] || rawData.specifications?.["Targeted Diseases / Pests"] || "",
        compatibility: rawData.compatibility || rawData.specifications?.["Compatibility"] || "",
        storageNotice: rawData.storageNotice || "Store in a cool, dry place away from direct sunlight",
        shelfLife: rawData.specifications?.["Shelf Life"] || rawData.shelfLife || "18–24 Months",
        customSpecs: existingSpecs,
        faqs: existingFaqs,
        seo: {
          metaTitle: initialData.seo?.metaTitle || "",
          metaDescription: initialData.seo?.metaDescription || "",
          metaKeywords: initialData.seo?.metaKeywords || "",
          canonicalUrl: initialData.seo?.canonicalUrl || "",
          ogImage: initialData.seo?.ogImage || ""
        },
        active: initialData.active !== undefined ? Boolean(initialData.active) : true,
        featured: Boolean(initialData.featured),
        trending: Boolean(initialData.trending),
        isNewArrival: Boolean(initialData.isNewArrival)
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        sku: `JAP-${Math.floor(1000 + Math.random() * 9000)}`,
        category: defaultCategory,
        brand: "Janani Agro Products",
        price: "450",
        originalPrice: "520",
        unit: "1 L",
        warehouseStock: "50",
        reservedStock: "0",
        lowStockThreshold: "20",
        badge: "100% Organic",
        rating: "4.8",
        reviewsCount: "53",
        description: "",
        harvestOrigin: "Janani Bio Sciences Cluster, Gujarat",
        image: "",
        gallery: [],
        variants: [
          { id: `VAR-1`, name: "500 ml Pack", sku: `JAP-500ML`, price: 250, originalPrice: 290, stock: 25 },
          { id: `VAR-2`, name: "1 L Standard", sku: `JAP-1L`, price: 450, originalPrice: 520, stock: 25 }
        ],
        organicCertifications: ["NPOP Certified Organic", "Jaivik Bharat"],
        subtitle: "",
        benefits: "Controls soil-borne fungal pathogens and root diseases\nImproves rhizosphere microbial biodiversity\nStimulates robust root system and feeder hair growth\nEnhances nutrient mobilization and moisture absorption",
        dosage: "Foliar Spray: 2–3 ml/L | Drip Fertigation: 1 L/acre | Seed Treatment: 5–10 ml/kg",
        methodOfApplication: "Soil Application, Drip Fertigation, Seed Treatment, and Foliar Spray",
        recommendedCrops: "Paddy, Cotton, Chilli, Tomato, Brinjal, Sugarcane, Banana, Mango, Groundnut, Pulses, Wheat",
        activeOrganism: "Trichoderma viride 1.5% W.P (2x10^6 CFU/ml)",
        targetDiseases: "Wilt, Damping-off, Root rot, Collar rot, Leaf spots",
        compatibility: "Compatible with biofertilizers, seaweed, and organic manures",
        storageNotice: "Store in a cool, dry place away from direct sunlight",
        shelfLife: "18–24 Months",
        customSpecs: [
          { key: "CFU Count", value: "2 x 10^8 CFU/ml minimum" },
          { key: "pH Level", value: "6.5 – 7.5" },
          { key: "Formulation Type", value: "Liquid Bio-Active Formulation" }
        ],
        faqs: FAQ_TEMPLATES,
        seo: {
          metaTitle: "",
          metaDescription: "",
          metaKeywords: "",
          canonicalUrl: "",
          ogImage: ""
        },
        active: true,
        featured: false,
        trending: false,
        isNewArrival: true
      });
    }
  }, [initialData, isOpen, defaultCategory]);

  // Crop toggle helper
  const handleToggleCrop = (crop: string) => {
    const current = formData.recommendedCrops
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    let updated: string[];
    if (current.some((c) => c.toLowerCase() === crop.toLowerCase())) {
      updated = current.filter((c) => c.toLowerCase() !== crop.toLowerCase());
    } else {
      updated = [...current, crop];
    }
    setFormData((prev) => ({ ...prev, recommendedCrops: updated.join(", ") }));
  };

  // Benefit preset helper
  const handleAddBenefitPreset = (benefit: string) => {
    const current = formData.benefits ? formData.benefits.split("\n").map((x) => x.trim()).filter(Boolean) : [];
    if (!current.includes(benefit)) {
      const updated = [...current, benefit].join("\n");
      setFormData((prev) => ({ ...prev, benefits: updated }));
      toast.success("Added benefit to list!");
    } else {
      toast.info("Benefit already in list");
    }
  };

  // Spec presets and handlers
  const handleAddSpecPreset = (key: string, value: string) => {
    if (formData.customSpecs.some((s) => s.key.toLowerCase() === key.toLowerCase())) {
      toast.info(`"${key}" specification already exists in table`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      customSpecs: [...prev.customSpecs, { key, value }]
    }));
    toast.success(`Added ${key} to specifications!`);
  };

  const handleAddBlankSpec = () => {
    setFormData((prev) => ({
      ...prev,
      customSpecs: [...prev.customSpecs, { key: "", value: "" }]
    }));
  };

  const handleRemoveSpec = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customSpecs: prev.customSpecs.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateSpec = (index: number, field: "key" | "value", val: string) => {
    setFormData((prev) => {
      const next = [...prev.customSpecs];
      if (next[index]) {
        next[index] = { ...next[index], [field]: val };
      }
      return { ...prev, customSpecs: next };
    });
  };

  // FAQ handlers
  const handleAddBlankFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { q: "", a: "" }]
    }));
  };

  const handleRemoveFaq = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateFaq = (index: number, field: "q" | "a", val: string) => {
    setFormData((prev) => {
      const next = [...prev.faqs];
      if (next[index]) {
        next[index] = { ...next[index], [field]: val };
      }
      return { ...prev, faqs: next };
    });
  };

  const handleLoadFaqTemplates = () => {
    setFormData((prev) => {
      const existingQ = prev.faqs.map((f) => f.q.toLowerCase());
      const toAdd = FAQ_TEMPLATES.filter((t) => !existingQ.includes(t.q.toLowerCase()));
      return {
        ...prev,
        faqs: [...prev.faqs, ...toAdd]
      };
    });
    toast.success("Loaded agricultural FAQ templates!");
  };

  const handleTitleChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setFormData((prev) => ({
      ...prev,
      name,
      slug: initialData ? prev.slug : slug,
      seo: {
        ...prev.seo,
        metaTitle: initialData ? prev.seo.metaTitle : `${name} | JANANI AGRO PRODUCTS`,
        canonicalUrl: `https://jananiagro.com/products/${slug}`
      }
    }));
  };

  // Add/Remove Variant
  const handleAddVariant = () => {
    const newVar: ProductVariant = {
      id: `VAR-${Date.now()}`,
      name: "5 kg Value Pack",
      sku: `${formData.sku}-5KG`,
      price: Math.round(Number(formData.price) * 4.5),
      originalPrice: Math.round(Number(formData.price) * 5.2),
      stock: 15
    };
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVar]
    }));
    toast.success("New product variant added!");
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // Add Gallery Image (with URL trimming and toast)
  const handleAddGalleryImage = (urlToAdd?: string) => {
    const target = (typeof urlToAdd === "string" ? urlToAdd : newGalleryUrl).trim();
    if (!target) {
      toast.error("Please enter or paste an image URL, or upload from your device.");
      return;
    }
    setFormData((prev) => {
      const alreadyExists = prev.gallery.includes(target);
      const updatedGallery = alreadyExists ? prev.gallery : [...prev.gallery, target];
      return {
        ...prev,
        image: prev.image || target,
        gallery: updatedGallery
      };
    });
    setNewGalleryUrl("");
    toast.success("Image added to product gallery!");
  };

  // Upload local image files directly
  const handleUploadGalleryFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setFormData((prev) => {
            const updatedGallery = prev.gallery.includes(dataUrl) ? prev.gallery : [...prev.gallery, dataUrl];
            return {
              ...prev,
              image: prev.image || dataUrl,
              gallery: updatedGallery
            };
          });
          toast.success(`Uploaded ${file.name} to gallery!`);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {initialData ? `Edit Product: ${initialData.name}` : "Create New Product Listing"}
            </h3>
            <p className="text-xs text-muted-foreground">Variants, agro specifications, tab descriptions & SEO suite</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent text-muted-foreground"><X className="size-4" /></button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap rounded-2xl border border-border bg-muted/40 p-1 mt-4 text-xs font-bold shrink-0 no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "general", label: "1. Info" },
            { id: "pricing", label: "2. Pricing & Stock" },
            { id: "variants", label: "3. Variants" },
            { id: "gallery", label: "4. Gallery" },
            { id: "specs", label: "5. Agro Specs & Tabs" },
            { id: "seo", label: "6. SEO" },
            { id: "toggles", label: "7. Toggles" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[70px] rounded-xl py-2 transition-colors text-center ${
                activeTab === tab.id ? "bg-card text-foreground shadow-sm font-extrabold text-emerald-700 dark:text-emerald-400" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1 scrollbar-thin">
          {/* TAB 1: General Info */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Product Title *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Royal Traditional Aged Basmati Rice (5kg)"
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">SKU Code *</label>
                  <input
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="JAP-1001"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-mono font-bold text-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">URL Slug *</label>
                  <input
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="royal-basmati-rice"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-semibold outline-none"
                  >
                    {activeCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Brand Line</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-semibold outline-none"
                  >
                    {JANANI_DEFAULT_BRANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Pure organic harvest description..."
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Pricing & Inventory */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Selling Price (₹) *</label>
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-bold text-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Pack Size / Unit</label>
                  <input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="1 kg"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Warehouse Stock *</label>
                  <input
                    type="number"
                    value={formData.warehouseStock}
                    onChange={(e) => setFormData({ ...formData, warehouseStock: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Reserved in Orders</label>
                  <input
                    type="number"
                    value={formData.reservedStock}
                    onChange={(e) => setFormData({ ...formData, reservedStock: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Low Stock Alert (≤)</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none text-amber-600"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/40 p-4">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">Calculated Available Stock:</span>
                <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {Math.max(0, Number(formData.warehouseStock) - Number(formData.reservedStock))} units ready for sale
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Product Variants */}
          {activeTab === "variants" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Pack Size / Weight Variants</h4>
                  <p className="text-[10px] text-muted-foreground">Each variant can have independent price and stock</p>
                </div>
                <Button type="button" onClick={handleAddVariant} size="sm" variant="outline" className="rounded-xl text-xs font-bold gap-1">
                  <Plus className="size-3.5" /> Add Variant
                </Button>
              </div>

              <div className="space-y-3">
                {formData.variants.map((v, i) => (
                  <div key={v.id || i} className="rounded-2xl border border-border bg-card p-3.5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">Variant #{i + 1}</span>
                      <button type="button" onClick={() => handleRemoveVariant(i)} className="text-rose-500 hover:text-rose-700 text-xs">
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block">Name</label>
                        <input
                          value={v.name}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[i] = { ...v, name: e.target.value };
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block">SKU</label>
                        <input
                          value={v.sku}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[i] = { ...v, sku: e.target.value };
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block">Price (₹)</label>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[i] = { ...v, price: Number(e.target.value) };
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs font-bold text-emerald-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block">Stock</label>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[i] = { ...v, stock: Number(e.target.value) };
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Gallery Manager */}
          {activeTab === "gallery" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Primary Thumbnail Image URL</label>
                <div className="flex gap-2">
                  <input
                    value={formData.image}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        image: val,
                        gallery: val && !prev.gallery.includes(val) ? [val, ...prev.gallery] : prev.gallery
                      }));
                    }}
                    placeholder="Enter image URL or upload below (e.g. /products/dharani.jpg)"
                    className="h-10 flex-1 rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                  {formData.image ? (
                    <div className="size-10 rounded-xl border border-border bg-muted overflow-hidden shrink-0">
                      <img
                        src={formData.image}
                        alt="Primary thumbnail"
                        className="size-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Add Image URL to Gallery</label>
                <div className="flex gap-2">
                  <input
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddGalleryImage();
                      }
                    }}
                    placeholder="Enter URL or paste image link (e.g. /images/categories/rice.webp)"
                    className="h-10 flex-1 rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600 font-mono"
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddGalleryImage()}
                    size="sm"
                    className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 shadow-sm"
                  >
                    Add
                  </Button>
                  <label className="inline-flex items-center justify-center gap-1.5 px-3 rounded-2xl border border-border bg-card hover:bg-accent text-foreground text-xs font-bold cursor-pointer transition-colors shrink-0 shadow-sm">
                    <Upload className="size-3.5 text-brand-leaf" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleUploadGalleryFile}
                    />
                  </label>
                </div>
              </div>

              {/* Quick Preset Images */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Quick Catalog Presets (Click to add):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Bio-Fertilizers", url: "/products/dharani.jpg" },
                    { label: "Bio-Pesticides", url: "/products/suraksha.jpg" },
                    { label: "Bio-Fungicides", url: "/products/harit.jpg" },
                    { label: "Bio-Stimulants", url: "/products/pushkal.jpg" },
                    { label: "Micro Nutrients", url: "/products/annada.jpg" },
                    { label: "Insecticides", url: "/products/balavan.jpg" },
                    { label: "Botanical Neem", url: "/products/neem-oil.jpg" },
                    { label: "Water Solubles", url: "/products/dhanya.jpg" },
                    { label: "Agri Inputs", url: "/products/bhumi-shakti.jpg" },
                    { label: "Growth Activator", url: "/products/balavan-bottle.jpg" }
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => handleAddGalleryImage(preset.url)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-border bg-muted/50 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-[11px] font-medium text-foreground transition-all"
                    >
                      <span className="text-emerald-600 font-bold">+</span> {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gallery Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground">
                    Product Gallery ({formData.gallery.length} Images)
                  </span>
                  {formData.gallery.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gallery: [], image: "" })}
                      className="text-[11px] text-rose-500 hover:underline font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {formData.gallery.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
                    <ImageIcon className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs font-bold text-foreground">No gallery images added yet</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Click "Upload File" above, paste an image link, or pick from presets.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {formData.gallery.map((img, i) => {
                      const isPrimary = formData.image === img;
                      return (
                        <div
                          key={i}
                          className={`relative group rounded-2xl border bg-muted h-28 overflow-hidden shadow-sm transition-all ${
                            isPrimary ? "ring-2 ring-emerald-600 border-emerald-600" : "border-border hover:border-foreground/40"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Gallery ${i + 1}`}
                            className="size-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/products/dharani.jpg"; }}
                          />
                          {isPrimary && (
                            <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow">
                              Primary
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.gallery.filter((_, idx) => idx !== i);
                                  const nextPrimary = isPrimary ? (updated[0] || "") : formData.image;
                                  setFormData({ ...formData, gallery: updated, image: nextPrimary });
                                }}
                                className="size-6 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition"
                                title="Remove image"
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, image: img });
                                  toast.success("Set as primary thumbnail!");
                                }}
                                className="w-full py-1 rounded-lg bg-white/90 text-foreground text-[10px] font-bold hover:bg-white transition"
                              >
                                Set as Primary
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Agro Specifications & Storefront Tabs (All 7 Tabs) */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              {/* 7-Subtab Header Navigation */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border/80 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {[
                  { id: "desc", label: "1. Description", icon: Info },
                  { id: "benefits", label: "2. Key Benefits", icon: CheckCircle2 },
                  { id: "usage", label: "3. How to Use", icon: ShieldCheck },
                  { id: "crops", label: "4. Suitable Crops", icon: Check },
                  { id: "specs", label: "5. Technical Details", icon: Layers },
                  { id: "reviews", label: `6. Reviews (${formData.reviewsCount})`, icon: Star },
                  { id: "faqs", label: `7. FAQs (${formData.faqs.length})`, icon: HelpCircle }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSpecsSubTab(st.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      specsSubTab === st.id
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <st.icon className="size-3.5" />
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>

              {/* Subtab 1: Description & Formulation */}
              {specsSubTab === "desc" && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Product Formulation Subtitle
                    </label>
                    <input
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="e.g. Trichoderma Viride Liquid Biofungal Formulation"
                      className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600 font-semibold"
                    />
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">
                      Displays directly underneath the product title on the details page.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Active Organism / Strain Identity
                      </label>
                      <input
                        value={formData.activeOrganism}
                        onChange={(e) => setFormData({ ...formData, activeOrganism: e.target.value })}
                        placeholder="e.g. Trichoderma viride 1.5% W.P (2x10^6 CFU/ml)"
                        className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Target Pathogens / Diseases Suppressed
                      </label>
                      <input
                        value={formData.targetDiseases}
                        onChange={(e) => setFormData({ ...formData, targetDiseases: e.target.value })}
                        placeholder="e.g. Root rot, Wilt, Damping-off, Collar rot"
                        className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Full Product Description (Detailed Narrative)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Elaborate on how this biological formula enriches soil health, enhances root systems, and protects crops..."
                      className="w-full rounded-2xl border border-border bg-background p-3 text-xs outline-none focus:border-emerald-600 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Subtab 2: Key Benefits */}
              {specsSubTab === "benefits" && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-foreground block">
                        Key Agricultural Benefits (1 benefit per line)
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        Each line renders as a dedicated benefit feature card on the storefront.
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {formData.benefits ? formData.benefits.split("\n").filter((x) => x.trim()).length : 0} Cards Active
                    </span>
                  </div>

                  <textarea
                    rows={5}
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    placeholder={"Controls and suppresses soil-borne fungal pathogens and root rot\nStimulates vigorous root system and lateral feeder roots growth\nImproves rhizosphere beneficial microbial biodiversity\n100% Residue-free and safe for certified organic farming"}
                    className="w-full rounded-2xl border border-border bg-background p-3 text-xs outline-none focus:border-emerald-600 font-sans leading-relaxed"
                  />

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      Quick 1-Click Benefit Presets (Click to append):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {BENEFIT_PRESETS.map((b, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddBenefitPreset(b)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-border bg-muted/40 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-[11px] font-medium text-foreground transition-all text-left"
                        >
                          <span className="text-emerald-600 font-bold">+</span> {b.slice(0, 42)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Subtab 3: How to Use */}
              {specsSubTab === "usage" && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Recommended General Dosage Guidelines
                    </label>
                    <input
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="e.g. Foliar Spray: 2–3 ml/L | Drip Fertigation: 1 L/acre | Seed Treatment: 5–10 ml/kg"
                      className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Methods of Application
                    </label>
                    <input
                      value={formData.methodOfApplication}
                      onChange={(e) => setFormData({ ...formData, methodOfApplication: e.target.value })}
                      placeholder="e.g. Soil Application, Drip Fertigation, Seed Treatment, Foliar Spray"
                      className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Compatibility Guidelines
                    </label>
                    <input
                      value={formData.compatibility}
                      onChange={(e) => setFormData({ ...formData, compatibility: e.target.value })}
                      placeholder="e.g. Compatible with biofertilizers and organic manures; avoid tank-mixing with chemical copper fungicides"
                      className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Storage & Safety Guidelines
                    </label>
                    <input
                      value={formData.storageNotice}
                      onChange={(e) => setFormData({ ...formData, storageNotice: e.target.value })}
                      placeholder="e.g. Store in a cool, dry place away from direct sunlight. Shelf life is 18–24 months."
                      className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              {/* Subtab 4: Suitable Crops */}
              {specsSubTab === "crops" && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Suitable Crops (Comma-separated for badges)
                    </label>
                    <input
                      value={formData.recommendedCrops}
                      onChange={(e) => setFormData({ ...formData, recommendedCrops: e.target.value })}
                      placeholder="e.g. Paddy / Rice, Cotton, Chilli, Tomato, Brinjal, Sugarcane, Banana, Mango, Groundnut, Pulses"
                      className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      1-Click Popular Crop Badges (Click to toggle in/out):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_CROPS.map((crop) => {
                        const isSelected = formData.recommendedCrops
                          .toLowerCase()
                          .includes(crop.toLowerCase().split("/")[0]?.trim() || crop.toLowerCase());
                        return (
                          <button
                            key={crop}
                            type="button"
                            onClick={() => handleToggleCrop(crop)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                              isSelected
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                : "bg-muted/40 border-border text-foreground hover:bg-muted"
                            }`}
                          >
                            {isSelected ? <Check className="size-3.5" /> : "+"} {crop}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Subtab 5: Technical Details */}
              {specsSubTab === "specs" && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Formulation Shelf Life
                      </label>
                      <input
                        value={formData.shelfLife}
                        onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
                        placeholder="e.g. 18–24 Months from manufacturing date"
                        className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleAddBlankSpec}
                        size="sm"
                        variant="outline"
                        className="h-10 w-full rounded-2xl border-dashed border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold text-xs gap-1.5"
                      >
                        <Plus className="size-3.5" /> Add Custom Specification Row
                      </Button>
                    </div>
                  </div>

                  {/* Quick Preset Specifications */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      Quick Technical Spec Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SPEC_PRESETS.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddSpecPreset(p.key, p.value)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-border bg-muted/40 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-[11px] font-medium text-foreground transition-all"
                        >
                          <span className="text-emerald-600 font-bold">+</span> {p.key}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Specifications Table */}
                  <div className="rounded-2xl border border-border bg-muted/20 p-3 space-y-2">
                    <span className="text-xs font-bold text-foreground block">
                      Custom Technical Specifications ({formData.customSpecs.length})
                    </span>

                    {formData.customSpecs.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-2">
                        No custom specifications added. Click "Add Custom Specification Row" above.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {formData.customSpecs.map((spec, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              value={spec.key}
                              onChange={(e) => handleUpdateSpec(i, "key", e.target.value)}
                              placeholder="Parameter (e.g. CFU Count)"
                              className="h-8 w-2/5 rounded-xl border border-border bg-background px-2.5 text-xs font-bold outline-none focus:border-emerald-600"
                            />
                            <input
                              value={spec.value}
                              onChange={(e) => handleUpdateSpec(i, "value", e.target.value)}
                              placeholder="Value (e.g. 2 x 10^8 CFU/ml)"
                              className="h-8 flex-1 rounded-xl border border-border bg-background px-2.5 text-xs outline-none focus:border-emerald-600"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSpec(i)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                              title="Delete row"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subtab 6: Reviews & Rating */}
              {specsSubTab === "reviews" && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Storefront Average Rating Score (1.0 - 5.0)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={formData.rating}
                          onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                          className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-bold outline-none focus:border-emerald-600"
                        />
                        <div className="flex text-amber-500 shrink-0">
                          <Star className="size-5 fill-current" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Total Verified Reviews Count (e.g. 53)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.reviewsCount}
                        onChange={(e) => setFormData({ ...formData, reviewsCount: e.target.value })}
                        placeholder="53"
                        className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-bold outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-emerald-500/10 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                      <Star className="size-4 fill-emerald-600 text-emerald-600" />
                      <span>Storefront Reviews Tab Preview</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      On the customer storefront, this will show: <strong>Reviews ({formData.reviewsCount})</strong> with an average score of <strong>{formData.rating} / 5.0</strong>. Verified farmer testimonials and moderation are handled in the Admin Reviews console.
                    </p>
                  </div>
                </div>
              )}

              {/* Subtab 7: FAQs Accordion Manager */}
              {specsSubTab === "faqs" && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-foreground block">
                        Product Frequently Asked Questions ({formData.faqs.length})
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        Custom interactive accordion for this product listing.
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleLoadFaqTemplates}
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl text-xs font-bold gap-1"
                      >
                        <ListPlus className="size-3.5" /> Load Presets
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddBlankFaq}
                        size="sm"
                        className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                      >
                        <Plus className="size-3.5" /> Add FAQ
                      </Button>
                    </div>
                  </div>

                  {formData.faqs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
                      <HelpCircle className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-xs font-bold text-foreground">No FAQs added yet</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Click "Load Presets" to add standard agri questions, or "+ Add FAQ".</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {formData.faqs.map((faq, i) => (
                        <div key={i} className="rounded-2xl border border-border bg-card p-3 space-y-2 shadow-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                              Question #{i + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFaq(i)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                              title="Delete FAQ"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                          <input
                            value={faq.q}
                            onChange={(e) => handleUpdateFaq(i, "q", e.target.value)}
                            placeholder="e.g. When and how should I apply this product?"
                            className="h-8 w-full rounded-xl border border-border bg-background px-2.5 text-xs font-bold outline-none focus:border-emerald-600"
                          />
                          <textarea
                            rows={2}
                            value={faq.a}
                            onChange={(e) => handleUpdateFaq(i, "a", e.target.value)}
                            placeholder="Detailed farmer guidance and answer..."
                            className="w-full rounded-xl border border-border bg-background p-2 text-xs outline-none focus:border-emerald-600 leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SEO Meta Suite */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Meta Title</label>
                <input
                  value={formData.seo.metaTitle}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={formData.seo.metaDescription}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })}
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Canonical URL</label>
                <input
                  value={formData.seo.canonicalUrl}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, canonicalUrl: e.target.value } })}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-mono text-[11px] outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 7: Storefront Toggles */}
          {activeTab === "toggles" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Active Visibility</span>
                    <span className="text-[11px] text-muted-foreground">Show product live on storefront for purchase</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="size-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-border/60">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Featured Product (⭐)</span>
                    <span className="text-[11px] text-muted-foreground">Display in homepage featured collections</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="size-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-border/60">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Trending Harvest (🔥)</span>
                    <span className="text-[11px] text-muted-foreground">Highlight with trending flame badge</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.trending}
                    onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                    className="size-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-border/60">
                  <div>
                    <span className="text-xs font-bold text-foreground block">New Arrival (✨)</span>
                    <span className="text-[11px] text-muted-foreground">Show new harvest crop badge</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="size-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Custom Promo Badge</label>
                <input
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. 100% Certified Organic"
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border flex items-center justify-between shrink-0">
          <Button variant="outline" onClick={onClose} className="rounded-2xl text-xs font-semibold">
            Cancel
          </Button>
          <Button
            onClick={() => {
              // Compile custom specifications dictionary
              const compiledSpecs: Record<string, string> = {
                "Active Organism": formData.activeOrganism || formData.name,
                "Targeted Diseases / Pests": formData.targetDiseases || "Broad Spectrum Crop Protection",
                "Compatibility": formData.compatibility || "Compatible with biofertilizers & organic manures",
                "Shelf Life": formData.shelfLife || "18–24 Months",
                "Dosage": formData.dosage || "2–3 ml / Litre",
                "Formulation": formData.unit?.toLowerCase().includes("l") || formData.unit?.toLowerCase().includes("ml") ? "Liquid Biological Formulation" : "Granular / Water Soluble Inoculant"
              };
              formData.customSpecs.forEach((s) => {
                if (s.key.trim() && s.value.trim()) {
                  compiledSpecs[s.key.trim()] = s.value.trim();
                }
              });

              const payload = {
                ...formData,
                rating: Number(formData.rating) || 4.8,
                reviewsCount: Number(formData.reviewsCount) || 53,
                reviews: Number(formData.reviewsCount) || 53,
                subtitle: formData.subtitle,
                benefits: formData.benefits ? formData.benefits.split("\n").map((b: string) => b.trim()).filter(Boolean) : undefined,
                dosage: formData.dosage,
                methodOfApplication: formData.methodOfApplication,
                recommendedCrops: formData.recommendedCrops,
                crops: formData.recommendedCrops ? formData.recommendedCrops.split(",").map((c: string) => c.trim()).filter(Boolean) : undefined,
                targetDiseases: formData.targetDiseases,
                compatibility: formData.compatibility,
                storageNotice: formData.storageNotice,
                specifications: compiledSpecs,
                faqs: formData.faqs.filter((f) => f.q.trim() && f.a.trim())
              };
              onSave(payload);
            }}
            disabled={!formData.name || !formData.sku}
            className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs gap-1.5 shadow"
          >
            <Save className="size-4" /> Save Product Listing
          </Button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Bulk Price Update Modal
// -------------------------------------------------------------
function BulkPriceModal({
  isOpen,
  selectedCount,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  selectedCount: number;
  onClose: () => void;
  onSubmit: (data: { type: "percentage" | "flat" | "fixed"; value: number; mode: "increase" | "decrease" | "set" }) => void;
}) {
  const [type, setType] = useState<"percentage" | "flat" | "fixed">("percentage");
  const [mode, setMode] = useState<"increase" | "decrease" | "set">("increase");
  const [value, setValue] = useState("10");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Bulk Price Update ({selectedCount} items)</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent text-muted-foreground"><X className="size-4" /></button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Adjustment Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold outline-none"
            >
              <option value="percentage">% Percentage</option>
              <option value="flat">₹ Flat Amount</option>
              <option value="fixed">Set Fixed Price (₹)</option>
            </select>
          </div>

          {type !== "fixed" && (
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Direction</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("increase")}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-colors ${
                    mode === "increase" ? "border-emerald-600 bg-emerald-500/10 text-emerald-700" : "border-border"
                  }`}
                >
                  + Increase
                </button>
                <button
                  type="button"
                  onClick={() => setMode("decrease")}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-colors ${
                    mode === "decrease" ? "border-rose-600 bg-rose-500/10 text-rose-700" : "border-border"
                  }`}
                >
                  - Decrease
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Value {type === 'percentage' ? '(%)' : '(₹)'}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-bold text-emerald-600 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold">
              Cancel
            </Button>
            <Button
              onClick={() => onSubmit({ type, value: Number(value), mode: type === 'fixed' ? 'set' : mode })}
              className="rounded-xl bg-emerald-600 text-white font-bold text-xs shadow"
            >
              Apply to {selectedCount} Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Bulk Stock Restock Modal
// -------------------------------------------------------------
function BulkStockModal({
  isOpen,
  selectedCount,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  selectedCount: number;
  onClose: () => void;
  onSubmit: (data: { quantity: number; operation: "add" | "set" }) => void;
}) {
  const [operation, setOperation] = useState<"add" | "set">("add");
  const [quantity, setQuantity] = useState("50");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Bulk Stock Restock ({selectedCount} items)</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent text-muted-foreground"><X className="size-4" /></button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Operation</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOperation("add")}
                className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-colors ${
                  operation === "add" ? "border-emerald-600 bg-emerald-500/10 text-emerald-700" : "border-border"
                }`}
              >
                + Add Inbound Stock
              </button>
              <button
                type="button"
                onClick={() => setOperation("set")}
                className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-colors ${
                  operation === "set" ? "border-emerald-600 bg-emerald-500/10 text-emerald-700" : "border-border"
                }`}
              >
                Set Exact Quantity
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Quantity (Units)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-bold text-emerald-600 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold">
              Cancel
            </Button>
            <Button
              onClick={() => onSubmit({ quantity: Number(quantity), operation })}
              className="rounded-xl bg-emerald-600 text-white font-bold text-xs shadow"
            >
              Restock {selectedCount} Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Product CSV Import Modal
// -------------------------------------------------------------
function ProductImportModal({
  isOpen,
  onClose,
  onImport
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: any[]) => void;
}) {
  const [csvText, setCsvText] = useState("");

  if (!isOpen) return null;

  const sampleCsv = `Name,SKU,Category,Brand,Price,MRP,Stock,Unit,Description
"Single Estate Lakadong Turmeric",JAP-TUR-01,Spices,"Janani Gold Reserve",199,249,60,"200g","High 7.5% curcumin turmeric from Meghalaya"
"Wild Himalayan Raw Forest Honey",JAP-HNY-02,Spices,"Janani Farm Fresh",520,640,40,"500g","Unfiltered monofloral honey from high altitude hives"
"Organic Pearl Bajra Flour",JAP-BAJ-03,Flours,"Heritage Organic",140,180,80,"1 kg","Stoneground organic pearl millet flour"`;

  const handleProcess = () => {
    try {
      const lines = csvText.trim().split("\n");
      if (lines.length <= 1) {
        toast.error("Please provide CSV content with headers and at least 1 row");
        return;
      }

      const parsed: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;
        const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
        if (cols[0]) {
          parsed.push({
            name: cols[0],
            sku: cols[1] || `JAP-${Date.now()}`,
            category: cols[2] || "Organic Staples",
            brand: cols[3] || "Janani Gold Reserve",
            price: Number(cols[4]) || 299,
            originalPrice: Number(cols[5]) || 399,
            stock: Number(cols[6]) || 50,
            unit: cols[7] || "1 kg",
            description: cols[8] || "Farm fresh organic product."
          });
        }
      }

      onImport(parsed);
    } catch (err) {
      toast.error("Failed to parse CSV file");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-emerald-600" />
            <h3 className="text-base font-bold text-foreground">Import Products via CSV</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent text-muted-foreground"><X className="size-4" /></button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-foreground">Paste CSV Content</span>
            <button
              onClick={() => setCsvText(sampleCsv)}
              className="text-[11px] font-bold text-emerald-600 hover:underline"
            >
              Load Sample Template
            </button>
          </div>

          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`Name,SKU,Category,Brand,Price,MRP,Stock,Unit,Description\n"Organic Toor Dal",JAP-DAL-01,Pulses,"Janani Gold",199,249,50,"500g","Unpolished unbleached toor dal"`}
            className="w-full rounded-2xl border border-border bg-background p-3 font-mono text-[11px] outline-none focus:border-emerald-600"
          />

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold">
              Cancel
            </Button>
            <Button
              onClick={handleProcess}
              disabled={!csvText.trim()}
              className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5 shadow"
            >
              <Upload className="size-4" /> Import Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
