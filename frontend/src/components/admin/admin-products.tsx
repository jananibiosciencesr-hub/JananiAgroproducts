import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
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
  MessageSquare,
  Video,
  Play,
  Download
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
import { formatProductName, getVideoEmbedInfo, SAMPLE_PRODUCT_VIDEO } from "@/lib/catalog";
import { matchesProductSearch } from "@/lib/search-helper";

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  originalPrice: number;
  stock: number;
  label?: string;
  unit?: string;
  oldPrice?: number;
  inStock?: boolean;
  image?: string;
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

export interface ProductsManagementProps {
  searchQuery?: string;
  addTrigger?: number;
}

export function ProductsManagement({ searchQuery, addTrigger }: ProductsManagementProps = {}) {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Synchronize search query from Top Navbar
  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearch(searchQuery);
      setCurrentPage(1);
    }
  }, [searchQuery]);
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

  // Dynamic Categories strictly from active Categories Management
  const [categoriesList, setCategoriesList] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janani_admin_categories");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const delRaw = localStorage.getItem("janani_deleted_categories");
            const delList: string[] = delRaw ? JSON.parse(delRaw) : [];
            return parsed
              .filter((c: any) => c.active !== false && !c.deletedAt && !c.deleted_at && !delList.includes(String(c.name).toLowerCase()) && !delList.includes(String(c.id).toLowerCase()) && !delList.includes(String(c.slug).toLowerCase()))
              .map((c: any) => (typeof c.name === "string" ? c.name.trim() : ""))
              .filter(Boolean);
          }
        }
      } catch { }
    }
    return [];
  });

  const loadCategories = async () => {
    try {
      const res = await getAdminFullCategories({ status: "active" });
      let names: string[] = [];
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        names = res.data
          .filter((c: any) => c.active !== false && !c.deletedAt && !c.deleted_at)
          .map((c: any) => (typeof c.name === "string" ? c.name.trim() : ""))
          .filter(Boolean);
      } else if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("janani_admin_categories");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              names = parsed
                .filter((c: any) => c.active !== false && !c.deletedAt && !c.deleted_at)
                .map((c: any) => (typeof c.name === "string" ? c.name.trim() : ""))
                .filter(Boolean);
            }
          }
        } catch (e) { }
      }

      if (typeof window !== "undefined") {
        try {
          const delStored = localStorage.getItem("janani_deleted_categories");
          if (delStored) {
            const delList: string[] = JSON.parse(delStored);
            if (Array.isArray(delList) && delList.length > 0) {
              names = names.filter((n) => !delList.includes(n.toLowerCase()));
            }
          }
        } catch { }
      }

      if (names.length > 0) {
        const unique = Array.from(new Set(names));
        setCategoriesList(unique);
      }
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
    return undefined;
  }, []);

  // Modals & Drawers
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductItem | null>(null);
  const [previewProduct, setPreviewProduct] = useState<AdminProductItem | null>(null);
  const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);
  const [isBulkStockOpen, setIsBulkStockOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<AdminProductItem | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronize Add Product trigger from Top Navbar or custom event
  useEffect(() => {
    if (addTrigger && addTrigger > 0) {
      setEditingProduct(null);
      setIsFormModalOpen(true);
    }
  }, [addTrigger]);

  useEffect(() => {
    const handleAdd = () => {
      setEditingProduct(null);
      setIsFormModalOpen(true);
    };
    window.addEventListener("admin:add-product", handleAdd);
    return () => window.removeEventListener("admin:add-product", handleAdd);
  }, []);

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

  // Synchronize category & product updates dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleUpdate = () => {
      loadProducts();
      loadCategories();
    };
    window.addEventListener("janani-products-updated", handleUpdate);
    window.addEventListener("janani-categories-updated", handleUpdate);
    return () => {
      window.removeEventListener("janani-products-updated", handleUpdate);
      window.removeEventListener("janani-categories-updated", handleUpdate);
    };
  }, []);

  // Dynamic categories strictly reflecting the Categories management list + any categories in products (guaranteeing 'Other')
  const availableCategories = useMemo(() => {
    const list = [...categoriesList];
    products.forEach((p) => {
      const cat = p.category || (p as any).category_name;
      if (cat && !list.some((c) => c.toLowerCase() === cat.toLowerCase())) {
        list.push(cat);
      }
    });
    if (!list.some((c) => c.toLowerCase() === "other")) {
      list.push("Other");
    }
    return Array.from(new Set(list.filter(Boolean)));
  }, [categoriesList, products]);

  // Client-side Filter
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search.trim() || matchesProductSearch(p, search);
      const matchMin = !minPrice || p.price >= Number(minPrice);
      const matchMax = !maxPrice || p.price <= Number(maxPrice);
      const matchCategory =
        categoryFilter === "all" ||
        (p.category && p.category.toLowerCase() === categoryFilter.toLowerCase()) ||
        ((p as any).category_name && (p as any).category_name.toLowerCase() === categoryFilter.toLowerCase()) ||
        ((p as any).category_id && String((p as any).category_id).toLowerCase() === categoryFilter.toLowerCase());

      return matchSearch && matchMin && matchMax && matchCategory;
    });
  }, [products, search, minPrice, maxPrice, categoryFilter]);

  // Display all products directly without pagination slicing
  const paginatedProducts = filteredProducts;

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

  // Delete & Restore Handlers
  const handleDelete = async (id: string) => {
    await deleteAdminProduct(id);
    await loadProducts();
    toast.success("Product deleted from database");
  };

  const handleRestore = async (id: string) => {
    await restoreAdminProduct(id);
    await loadProducts();
    toast.success("Product restored in database");
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
    toast.success(`Deleted ${selectedIds.length} products from database`);
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
      {/* Top Action Bar */}
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            setEditingProduct(null);
            setIsFormModalOpen(true);
          }}
          size="sm"
          className="h-9 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold gap-1.5 shadow-soft cursor-pointer"
        >
          <Plus className="size-4" /> Add Product
        </Button>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
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
                onClick={() => setIsBulkDeleteModalOpen(true)}
                size="sm"
                className="h-8 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold gap-1 cursor-pointer"
              >
                <Trash2 className="size-3.5" /> Delete Selected
              </Button>

              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-muted-foreground hover:underline ml-2"
              >
                Deselect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Data Table */}
      <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-190px)] min-h-[260px] relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-muted-foreground shadow-xs">
              <tr>
                <th className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md border-b border-border/80 px-6 py-4">Product Details</th>
                <th className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md border-b border-border/80 px-4 py-4">Category & Brand</th>
                <th className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md border-b border-border/80 px-4 py-4">Pricing</th>
                <th className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md border-b border-border/80 px-3 py-4 text-center">Featured</th>
                <th className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md border-b border-border/80 px-3 py-4 text-center">Trending</th>
                
                <th className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md border-b border-border/80 px-6 py-4 text-right">Actions</th>
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
                      className={`hover:bg-accent/40 transition-colors ${selectedIds.includes(p.id) ? "bg-emerald-500/5" : ""
                        }`}
                    >


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
                              {formatProductName(p.name)}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              <span className="font-mono text-emerald-600 font-bold">{p.sku}</span>
                              <span>• {p.unit || "500g"}</span>
                              {Array.isArray(p.variants) && p.variants.length > 1 && (
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



                      {/* Featured (Star) */}
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => handleToggleField(p.id, "featured")}
                          className={`p-1.5 rounded-xl transition-colors ${p.featured ? "bg-amber-500/15 text-amber-600" : "text-muted-foreground/40 hover:text-muted-foreground"
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
                          className={`p-1.5 rounded-xl transition-colors ${p.trending ? "bg-rose-500/15 text-rose-600" : "text-muted-foreground/40 hover:text-muted-foreground"
                            }`}
                          title="Toggle Trending"
                        >
                          <Flame className={`size-4 ${p.trending ? "fill-rose-500" : ""}`} />
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
                                onClick={() => setDeleteConfirmTarget(p)}
                                className="p-1.5 rounded-lg hover:bg-rose-500/15 text-rose-600 transition-colors cursor-pointer"
                                title="Delete Permanently"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setPreviewProduct(p)}
                                className="p-1.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                title="Quick Storefront Preview"
                              >
                                <Eye className="size-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsFormModalOpen(true);
                                }}
                                className="p-1.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                title="Edit Product & Variants"
                              >
                                <Edit className="size-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmTarget(p)}
                                className="p-1.5 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete Product"
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
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Package className="size-10 mx-auto opacity-30 mb-2" />
                    <p className="text-sm font-bold text-foreground">No products match your filters</p>
                    <p className="text-xs text-muted-foreground mt-1">Reset your filters or add a new organic product</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      {/* Confirmation Modal: Single Product Delete */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">
                Delete Product?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-foreground">{deleteConfirmTarget.name}</strong>{" "}
                from the database? This cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted border border-border cursor-pointer transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await handleDelete(deleteConfirmTarget.id);
                    setDeleteConfirmTarget(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Bulk Delete */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">
                Delete {selectedIds.length} Products?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete the selected <strong className="text-foreground">{selectedIds.length}</strong> products permanently from the database? This cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted border border-border cursor-pointer transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await handleBulkDelete();
                    setIsBulkDeleteModalOpen(false);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [selectedVariant, setSelectedVariant] = useState<any>(
    Array.isArray(product.variants) && product.variants.length > 0 ? product.variants[0] : null
  );

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
                  className={`size-14 rounded-2xl border-2 overflow-hidden shrink-0 transition-all ${selectedImage === img ? "border-emerald-600 shadow-md" : "border-border/60 opacity-60 hover:opacity-100"
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
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <div>
              <span className="text-xs font-bold text-foreground block mb-1.5">Select Pack Variant:</span>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${selectedVariant?.id === v.id
                      ? "border-emerald-600 bg-emerald-500/10 font-bold"
                      : "border-border bg-card hover:bg-muted/40"
                      }`}
                  >
                    <span className="block font-bold">{v.name || v.label || v.unit}</span>
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
  categories = [],
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: AdminProductItem | null;
  categories?: string[];
  onSave: (data: any) => void;
}) {
  const activeCategories = (categories && categories.length > 0) ? categories : [];
  const defaultCategory = activeCategories[0] || initialData?.category || "";

  const [activeTab, setActiveTab] = useState<"general" | "variants" | "gallery" | "specs" | "seo" | "toggles">("general");
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
    videoUrl: "",
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

      // Resolve variants safely from array or JSON string
      let resolvedVariants: ProductVariant[] = [];
      if (Array.isArray(initialData.variants) && initialData.variants.length > 0) {
        resolvedVariants = initialData.variants.map((v: any, idx: number) => ({
          id: String(v.id || `VAR-${idx + 1}`),
          name: v.name || v.label || v.unit || `Variant ${idx + 1}`,
          label: v.label || v.name || v.unit || `Variant ${idx + 1}`,
          unit: v.unit || v.name || v.label || initialData.unit || "1 L",
          sku: v.sku || `${initialData.sku || "JAP"}-${idx + 1}`,
          price: Number(v.price) || Number(initialData.price) || 0,
          originalPrice: Number(v.originalPrice ?? v.oldPrice) || Math.round((Number(v.price) || Number(initialData.price) || 0) * 1.2),
          oldPrice: Number(v.oldPrice ?? v.originalPrice) || Math.round((Number(v.price) || Number(initialData.price) || 0) * 1.2),
          stock: v.stock !== undefined ? Number(v.stock) : Number(initialData.stock || 50),
          inStock: (v.stock !== undefined ? Number(v.stock) : Number(initialData.stock || 50)) > 0,
          image: v.image ? String(v.image).trim() : ""
        }));
      } else if (typeof (initialData as any).variants === "string" && (initialData as any).variants.trim()) {
        try {
          const parsed = JSON.parse((initialData as any).variants);
          if (Array.isArray(parsed) && parsed.length > 0) {
            resolvedVariants = parsed.map((v: any, idx: number) => ({
              id: String(v.id || `VAR-${idx + 1}`),
              name: v.name || v.label || v.unit || `Variant ${idx + 1}`,
              label: v.label || v.name || v.unit || `Variant ${idx + 1}`,
              unit: v.unit || v.name || v.label || initialData.unit || "1 L",
              sku: v.sku || `${initialData.sku || "JAP"}-${idx + 1}`,
              price: Number(v.price) || Number(initialData.price) || 0,
              originalPrice: Number(v.originalPrice ?? v.oldPrice) || Math.round((Number(v.price) || Number(initialData.price) || 0) * 1.2),
              oldPrice: Number(v.oldPrice ?? v.originalPrice) || Math.round((Number(v.price) || Number(initialData.price) || 0) * 1.2),
              stock: v.stock !== undefined ? Number(v.stock) : Number(initialData.stock || 50),
              inStock: (v.stock !== undefined ? Number(v.stock) : Number(initialData.stock || 50)) > 0,
              image: v.image ? String(v.image).trim() : ""
            }));
          }
        } catch { }
      }

      if (resolvedVariants.length === 0) {
        resolvedVariants = [
          {
            id: `VAR-1`,
            name: initialData.unit || "Standard Pack",
            label: initialData.unit || "Standard Pack",
            unit: initialData.unit || "1 L",
            sku: `${initialData.sku || "JAP"}-STD`,
            price: Number(initialData.price) || 450,
            originalPrice: Number(initialData.originalPrice) || Math.round((Number(initialData.price) || 450) * 1.2),
            oldPrice: Number(initialData.originalPrice) || Math.round((Number(initialData.price) || 450) * 1.2),
            stock: Number(initialData.stock || 50),
            inStock: Number(initialData.stock || 50) > 0,
            image: initialData.image || ""
          }
        ];
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
        videoUrl: (initialData as any).videoUrl || (initialData as any).video_url || rawData.video_url || rawData.videoUrl || "",
        gallery: (initialData.gallery && initialData.gallery.length > 0)
          ? initialData.gallery
          : (initialData.image ? [initialData.image] : []),
        variants: resolvedVariants,
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
        videoUrl: "",
        gallery: [],
        variants: [
          { id: `VAR-1`, name: "500 ml Pack", label: "500 ml Pack", unit: "500 ml", sku: `JAP-500ML`, price: 250, originalPrice: 290, oldPrice: 290, stock: 25, inStock: true },
          { id: `VAR-2`, name: "1 L Standard", label: "1 L Standard", unit: "1 L", sku: `JAP-1L`, price: 450, originalPrice: 520, oldPrice: 520, stock: 25, inStock: true }
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
    const curList = Array.isArray(formData.variants) ? formData.variants : [];
    const count = curList.length + 1;
    const basePrice = Number(formData.price) || 450;
    const newVar: ProductVariant = {
      id: `VAR-${Date.now()}-${count}`,
      name: `${count * 2} kg Value Pack`,
      label: `${count * 2} kg Value Pack`,
      unit: `${count * 2} kg`,
      sku: `${formData.sku || "JAP"}-${count * 2}KG`,
      price: Math.round(basePrice * 1.8),
      originalPrice: Math.round(basePrice * 2.2),
      oldPrice: Math.round(basePrice * 2.2),
      stock: 20,
      inStock: true,
      image: ""
    };
    setFormData((prev) => ({
      ...prev,
      variants: [...(Array.isArray(prev.variants) ? prev.variants : []), newVar]
    }));
    toast.success("New product variant added!");
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: (Array.isArray(prev.variants) ? prev.variants : []).filter((_, i) => i !== index)
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

  // Upload product showcase video file
  const handleUploadVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.warning("Video file exceeds 50 MB. For optimal playback, please use a video under 50 MB or paste a YouTube link.");
      return;
    }

    toast.info(`Uploading video "${file.name}"...`);
    try {
      const fd = new FormData();
      fd.append("video", file);
      const res = await fetch("/api.php?action=upload-video", {
        method: "POST",
        body: fd
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.success && (data?.url || data?.videoUrl)) {
          const vUrl = data.url || data.videoUrl;
          setFormData((prev) => ({
            ...prev,
            videoUrl: vUrl
          }));
          toast.success(`Video "${file.name}" uploaded to server successfully!`);
          e.target.value = "";
          return;
        }
      }
    } catch (err) {
      console.warn("Direct upload to server failed, falling back to local file reading:", err);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({
          ...prev,
          videoUrl: dataUrl
        }));
        toast.success(`Video "${file.name}" loaded successfully!`);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read video file");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-2xl max-h-[92vh] flex flex-col">
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
        <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-muted/40 p-1.5 mt-4 shrink-0 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "general", label: "1. Info" },
            { id: "variants", label: "2. Variants" },
            { id: "gallery", label: "3. Product Video" },
            { id: "specs", label: "4. Agro Specs & Tabs" },
            { id: "seo", label: "5. SEO" },
            { id: "toggles", label: "6. Toggles" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-max px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center whitespace-nowrap select-none ${activeTab === tab.id
                ? "bg-card text-emerald-700 dark:text-emerald-400 shadow-sm border border-border/80 font-extrabold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
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
                  placeholder="e.g. Harit Trichoderma Viride (1 L)"
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
                    placeholder="harit-trichoderma-1l"
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
                    {formData.category && !activeCategories.includes(formData.category) && (
                      <option value={formData.category}>{formData.category} (Current)</option>
                    )}
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

          {/* TAB 2: Product Variants */}
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
                {(Array.isArray(formData.variants) ? formData.variants : []).map((v, i) => (
                  <div key={v.id || i} className="rounded-2xl border border-border bg-card p-3.5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">Variant #{i + 1}</span>
                      <button type="button" onClick={() => handleRemoveVariant(i)} className="text-rose-500 hover:text-rose-700 text-xs">
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block">Name / Size</label>
                        <input
                          value={v.name || v.label || ""}
                          placeholder="e.g. 500 ml Pack"
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...(Array.isArray(formData.variants) ? formData.variants : [])];
                            updated[i] = { ...v, name: val, label: val, unit: val };
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block">SKU</label>
                        <input
                          value={v.sku || ""}
                          placeholder="e.g. JAP-500ML"
                          onChange={(e) => {
                            const updated = [...(Array.isArray(formData.variants) ? formData.variants : [])];
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
                            const pVal = Number(e.target.value) || 0;
                            const updated = [...(Array.isArray(formData.variants) ? formData.variants : [])];
                            updated[i] = {
                              ...v,
                              price: pVal,
                              originalPrice: v.originalPrice || Math.round(pVal * 1.2),
                              oldPrice: v.oldPrice || Math.round(pVal * 1.2)
                            };
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
                            const sVal = Number(e.target.value) || 0;
                            const updated = [...(Array.isArray(formData.variants) ? formData.variants : [])];
                            updated[i] = { ...v, stock: sVal, inStock: sVal > 0 };
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs outline-none"
                        />
                      </div>
                    </div>

                    {/* Variant Specific Image Section */}
                    <div className="pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                          <ImageIcon className="size-3 text-emerald-600" />
                          <span>Variant Specific Image (1L Bottle / 5L Can / Custom Size Photo)</span>
                        </label>
                        {v.image && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...(Array.isArray(formData.variants) ? formData.variants : [])];
                              updated[i] = { ...v, image: "" };
                              setFormData({ ...formData, variants: updated });
                            }}
                            className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                          >
                            Clear Image
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Mini Thumbnail Preview */}
                        <div className="size-9 rounded-xl border border-border bg-muted/40 overflow-hidden shrink-0 flex items-center justify-center">
                          {v.image ? (
                            <img
                              src={v.image}
                              alt={v.name || `Variant ${i + 1}`}
                              className="size-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/products/placeholder.webp";
                              }}
                            />
                          ) : (
                            <ImageIcon className="size-4 text-muted-foreground/40" />
                          )}
                        </div>

                        {/* Paste Image URL Input */}
                        <input
                          type="text"
                          value={v.image || ""}
                          placeholder="Paste Image URL (e.g. /products/harit-5l.jpg or web link)"
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...(Array.isArray(formData.variants) ? formData.variants : [])];
                            updated[i] = { ...v, image: val };
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="h-8 flex-1 rounded-xl border border-border bg-background px-2.5 text-xs font-mono outline-none focus:border-emerald-600"
                        />

                        {/* Upload Button */}
                        <input
                          type="file"
                          id={`variant-upload-${i}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const dataUrl = event.target?.result as string;
                              if (dataUrl) {
                                const updated = [...(Array.isArray(formData.variants) ? formData.variants : [])];
                                updated[i] = { ...v, image: dataUrl };
                                setFormData({ ...formData, variants: updated });
                                toast.success(`Variant image loaded for ${v.name || `Variant #${i + 1}`}!`);
                              }
                            };
                            reader.readAsDataURL(file);
                            e.target.value = "";
                          }}
                        />
                        <label
                          htmlFor={`variant-upload-${i}`}
                          className="h-8 px-3 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-xs"
                        >
                          <Upload className="size-3.5" />
                          Upload
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Product Video Showcase */}
          {activeTab === "gallery" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Video className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      Product Video Showcase
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                        Storefront Position #3
                      </span>
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Displays in 3rd thumbnail position with a Play badge. Supports YouTube, Vimeo &amp; direct MP4/WebM uploads.
                    </p>
                  </div>
                </div>
                {formData.videoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, videoUrl: "" }));
                      toast.info("Product video removed");
                    }}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] h-7 px-2.5 rounded-xl cursor-pointer"
                  >
                    <X className="size-3 mr-1" /> Remove Video
                  </Button>
                )}
              </div>

                {/* Video Inputs: Upload & URL */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  <div className="sm:col-span-8 flex gap-2">
                    <input
                      value={formData.videoUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="Paste YouTube watch/shorts URL, Vimeo, or MP4 link..."
                      className="h-10 flex-1 rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600 font-mono text-[11px]"
                    />
                  </div>
                  <div className="sm:col-span-4 flex items-center gap-1.5">
                    <label className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-2xl border border-border bg-card hover:bg-accent text-foreground text-xs font-bold cursor-pointer transition-colors shadow-sm">
                      <Upload className="size-3.5 text-brand-leaf" />
                      <span>Upload Video</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                        className="hidden"
                        onChange={handleUploadVideoFile}
                      />
                    </label>
                  </div>
                </div>

                {/* Help tip for video format */}
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Play className="size-3 text-emerald-600 fill-emerald-600 shrink-0" />
                  <span>Supports public YouTube links (e.g. <code className="font-mono bg-muted px-1 rounded">https://www.youtube.com/watch?v=...</code> or <code className="font-mono bg-muted px-1 rounded">https://youtu.be/...</code>), Vimeo links, or uploaded MP4/WebM video files.</span>
                </p>

                {/* Quick Client Demo Preset Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Quick Sample Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        videoUrl: SAMPLE_PRODUCT_VIDEO
                      }));
                      toast.success("Loaded built-in Janani Agro sample video!");
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-border bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 text-[11px] font-medium transition-all cursor-pointer"
                  >
                    <Play className="size-3 text-emerald-600 fill-emerald-600" />
                    Janani Agro Sample Demo (Direct MP4)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        videoUrl: "https://www.youtube.com/watch?v=TihdID6918Q"
                      }));
                      toast.success("Loaded Organic Farming Trichoderma YouTube Demo!");
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-border bg-muted/40 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-[11px] font-medium transition-all cursor-pointer"
                  >
                    <Play className="size-3 text-emerald-600 fill-emerald-600" />
                    Trichoderma Viride Organic Farming Demo (YouTube)
                  </button>
                </div>

                {/* Live Video Preview Box */}
                <div className="rounded-2xl border border-border bg-muted/30 p-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-2 flex items-center gap-1">
                    <Eye className="size-3.5 text-emerald-600" /> Live Video Preview Player:
                  </span>
                  {formData.videoUrl ? (
                    (() => {
                      const vInfo = getVideoEmbedInfo(formData.videoUrl);
                      return (
                        <div className="w-full aspect-video max-h-56 rounded-xl border border-border overflow-hidden bg-black flex items-center justify-center shadow-inner relative">
                          {vInfo.isEmbeddable ? (
                            <iframe
                              src={vInfo.embedUrl}
                              title="Product Video Preview"
                              className="size-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              src={vInfo.rawUrl}
                              controls
                              className="size-full object-contain"
                            />
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="h-28 rounded-xl border border-dashed border-border/80 flex flex-col items-center justify-center text-center p-3 text-muted-foreground">
                      <Video className="size-6 mb-1 text-muted-foreground/40" />
                      <p className="text-xs font-semibold">No video attached to this product</p>
                      <p className="text-[10px]">Add a YouTube / Vimeo URL or upload an MP4 video above to activate the video thumbnail on the storefront.</p>
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${specsSubTab === st.id
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
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${isSelected
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

              const cleanVariants = (Array.isArray(formData.variants) ? formData.variants : []).map((v: any, idx: number) => {
                const p = Number(v.price) || Number(formData.price) || (initialData?.price ? Number(initialData.price) : 450);
                const op = Number(v.originalPrice ?? v.oldPrice) || Math.round(p * 1.2);
                const st = v.stock !== undefined ? Number(v.stock) : (Number(formData.warehouseStock) || 50);
                const n = v.name || v.label || v.unit || `Variant ${idx + 1}`;
                const u = v.unit || v.name || v.label || formData.unit || "1 L";
                const img = v.image && typeof v.image === "string" && v.image.trim() ? v.image.trim() : "";
                return {
                  id: String(v.id || `VAR-${Date.now()}-${idx + 1}`),
                  name: n,
                  label: n,
                  unit: u,
                  sku: v.sku || `${formData.sku || "JAP"}-${idx + 1}`,
                  price: p,
                  originalPrice: op,
                  oldPrice: op,
                  stock: st,
                  inStock: st > 0,
                  image: img
                };
              });

              const primaryPrice = cleanVariants[0]?.price || Number(formData.price) || (initialData?.price ? Number(initialData.price) : 450);
              const primaryOriginalPrice = cleanVariants[0]?.originalPrice || cleanVariants[0]?.oldPrice || Number(formData.originalPrice) || Math.round(primaryPrice * 1.2);
              const primaryUnit = cleanVariants[0]?.unit || formData.unit || (initialData?.unit || "1 L");
              const primaryStock = cleanVariants.length > 0
                ? cleanVariants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
                : (Number(formData.warehouseStock) || (initialData?.stock ? Number(initialData.stock) : 100));

              const variantImages = cleanVariants.map((v: any) => v.image).filter(Boolean);
              const primaryImage = cleanVariants[0]?.image || formData.image || (initialData?.image ? String(initialData.image).trim() : "/products/harit.jpg");
              const galleryImages = variantImages.length > 0 ? variantImages : (Array.isArray(formData.gallery) && formData.gallery.length > 0 ? formData.gallery : [primaryImage]);

              const payload = {
                ...formData,
                image: primaryImage,
                gallery: galleryImages,
                price: primaryPrice,
                originalPrice: primaryOriginalPrice,
                oldPrice: primaryOriginalPrice,
                old_price: primaryOriginalPrice,
                unit: primaryUnit,
                stock: primaryStock,
                warehouseStock: primaryStock,
                videoUrl: formData.videoUrl || "",
                video_url: formData.videoUrl || "",
                variants: cleanVariants,
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
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-colors ${mode === "increase" ? "border-emerald-600 bg-emerald-500/10 text-emerald-700" : "border-border"
                    }`}
                >
                  + Increase
                </button>
                <button
                  type="button"
                  onClick={() => setMode("decrease")}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-colors ${mode === "decrease" ? "border-rose-600 bg-rose-500/10 text-rose-700" : "border-border"
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
                className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-colors ${operation === "add" ? "border-emerald-600 bg-emerald-500/10 text-emerald-700" : "border-border"
                  }`}
              >
                + Add Inbound Stock
              </button>
              <button
                type="button"
                onClick={() => setOperation("set")}
                className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-colors ${operation === "set" ? "border-emerald-600 bg-emerald-500/10 text-emerald-700" : "border-border"
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
"Harit Trichoderma Viride",JAP-BIO-01,Bio-Pesticides,"Janani Agro",450,550,120,"1 L","Biological fungicide for root rot, wilt, and damping off control"
"Bhumi Shakti Soil Conditioner",JAP-SOIL-02,Bio-Fertilizers,"Janani Agro",750,900,80,"1 L","Liquid organic carbon and humic formulation for enhanced soil aeration"
"Janani Neem Oil 1000 PPM",JAP-BOT-03,Bio-Pesticides,"Janani Agro",380,480,100,"1 L","Cold-formulated botanical neem deterrent against sucking pests"`;

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
            category: cols[2] || "Bio-Fertilizers",
            brand: cols[3] || "Janani Agro Products",
            price: Number(cols[4]) || 450,
            originalPrice: Number(cols[5]) || 550,
            stock: Number(cols[6]) || 50,
            unit: cols[7] || "1 L",
            description: cols[8] || "Certified agricultural bio-input formulation."
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
            placeholder={`Name,SKU,Category,Brand,Price,MRP,Stock,Unit,Description\n"Harit Trichoderma Viride",JAP-BIO-01,Bio-Pesticides,"Janani Agro",450,550,100,"1 L","Bio-fungicide formulation"`}
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
