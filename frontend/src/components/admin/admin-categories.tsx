import React, { useState, useEffect, useMemo } from "react";
import {
  FolderTree,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Upload,
  Trash2,
  Edit,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Star,
  Flame,
  ArrowUpDown,
  ExternalLink,
  Save,
  X,
  FileSpreadsheet,
  Layers,
  Sparkles,
  GripVertical,
  Globe,
  ImageIcon,
  Eye,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getAdminProducts,
  getAdminFullCategories,
  createAdminCategory,
  updateAdminCategory,
  toggleAdminCategory,
  deleteAdminCategory,
  restoreAdminCategory,
  permanentDeleteAdminCategory,
  bulkUpdateAdminCategoryStatus,
  bulkDeleteAdminCategories,
  reorderAdminCategories,
  importAdminCategories
} from "@/lib/api";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: "root" | "sub" | "child";
  description: string;
  icon: string;
  image: string;
  bannerImage: string;
  featured: boolean;
  trending: boolean;
  active: boolean;
  orderIndex: number;
  productsCount: number;
  deletedAt: string | null;
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    canonicalUrl: string;
    ogImage: string;
  };
  createdAt: string;
}

export interface CategoriesManagementProps {
  searchQuery?: string;
  addTrigger?: number;
  products?: any[];
}

export function CategoriesManagement({ searchQuery, addTrigger, products: propProducts }: CategoriesManagementProps = {}) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingCategory, setViewingCategory] = useState<CategoryItem | null>(null);
  const [loadedProducts, setLoadedProducts] = useState<any[]>([]);
  const liveProducts = (propProducts && propProducts.length > 0) ? propProducts : loadedProducts;

  useEffect(() => {
    if (!propProducts || propProducts.length === 0) {
      getAdminProducts().then((res: any) => {
        if (res?.success && Array.isArray(res.data?.products)) {
          setLoadedProducts(res.data.products);
        } else if (Array.isArray(res?.data)) {
          setLoadedProducts(res.data);
        }
      }).catch(() => {});
    }
  }, [propProducts]);

  // Filters & State
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | "root" | "sub" | "child">("all");
  const [statusFilter, setStatusFilter] = useState<"active" | "trash">("active");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "featured" | "trending">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Synchronize search query from Top Navbar
  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearch(searchQuery);
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // Synchronize Add Category trigger from Top Navbar or custom event
  useEffect(() => {
    if (addTrigger && addTrigger > 0) {
      setEditingCategory(null);
      setIsFormModalOpen(true);
    }
  }, [addTrigger]);

  useEffect(() => {
    const handleAdd = () => {
      setEditingCategory(null);
      setIsFormModalOpen(true);
    };
    window.addEventListener("admin:add-category", handleAdd);
    return () => window.removeEventListener("admin:add-category", handleAdd);
  }, []);

  // Load Data
  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await getAdminFullCategories({ status: statusFilter, level: levelFilter, search });
      if (res?.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [statusFilter, levelFilter]);

  // Client-side filtering
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      // Search
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase()) ||
        c.seo?.metaTitle?.toLowerCase().includes(search.toLowerCase());

      // Visibility Filter
      const matchVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "featured" && c.featured) ||
        (visibilityFilter === "trending" && c.trending);

      return matchSearch && matchVisibility;
    });
  }, [categories, search, visibilityFilter]);

  // Pagination
  const paginatedCategories = filteredCategories;

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedCategories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCategories.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Inline Toggles
  const handleToggleField = async (id: string, field: "active" | "featured" | "trending") => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: !c[field] } : c))
    );
    await toggleAdminCategory(id, field);
    toast.success(`Category ${field} updated`);
  };

  // Delete & Restore Handlers
  const handleDelete = async (id: string) => {
    const deletedCat = categories.find((c) => c.id === id);
    await permanentDeleteAdminCategory(id);
    
    // Find destination category for reassignment (prefer user's Other Categories, then any other variant)
    const existingOther = categories.find((c) => (c.slug === "other-categories" || c.name === "Other Categories") && c.id !== id) ||
      categories.find((c) => ((c.slug || "").toLowerCase().includes("other") || (c.name || "").toLowerCase().includes("other")) && c.id !== id);

    const targetOtherId = existingOther?.id || "cat-other-categories";
    const targetOtherName = existingOther?.name || "Other Categories";
    const targetOtherSlug = existingOther?.slug || "other-categories";

    // Reassign products locally in localStorage if any exist
    if (deletedCat && typeof window !== "undefined") {
      try {
        for (const storageKey of ["janani_admin_products", "jap_admin_products"]) {
          const storedProds = JSON.parse(localStorage.getItem(storageKey) || "[]");
          let changed = false;
          const updatedProds = storedProds.map((p: any) => {
            const pCat = (p.category || p.category_name || "").toLowerCase().trim();
            const dName = (deletedCat.name || "").toLowerCase().trim();
            const dSlug = (deletedCat.slug || "").toLowerCase().trim();
            if (pCat === dName || pCat === dSlug || String(p.category_id) === String(id)) {
              changed = true;
              return { ...p, category: targetOtherName, category_name: targetOtherName, category_id: targetOtherId, category_slug: targetOtherSlug };
            }
            return p;
          });
          if (changed) {
            localStorage.setItem(storageKey, JSON.stringify(updatedProds));
          }
        }
      } catch (e) {}
    }

    setCategories((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      const hasOther = remaining.some((c) => (c.slug || "").toLowerCase().includes("other") || (c.name || "").toLowerCase().includes("other"));
      if (!hasOther) {
        remaining.push({
          id: targetOtherId,
          name: targetOtherName,
          slug: targetOtherSlug,
          parentId: null,
          level: "root",
          description: "All remaining products are present in this categories",
          icon: "📦",
          image: "/images/categories/others.jpg",
          bannerImage: "/images/categories/others.jpg",
          featured: false,
          trending: false,
          active: true,
          orderIndex: 999,
          productsCount: 0,
          deletedAt: null,
          seo: {
            metaTitle: "Other Agro Products",
            metaDescription: "General sustainable farm inputs",
            metaKeywords: "other, agri",
            canonicalUrl: "",
            ogImage: ""
          },
          createdAt: new Date().toISOString()
        });
      }
      return remaining;
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("janani-categories-updated"));
      window.dispatchEvent(new CustomEvent("janani-products-updated"));
    }
    toast.success(`Category deleted. Associated products moved to '${targetOtherName}'.`);
  };

  const handleRestore = async (id: string) => {
    await restoreAdminCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success("Category restored to active catalog");
  };

  // Bulk Actions
  const handleBulkStatus = async (active: boolean) => {
    if (selectedIds.length === 0) return;
    await bulkUpdateAdminCategoryStatus(selectedIds, active);
    setCategories((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, active } : c))
    );
    setSelectedIds([]);
    toast.success(`Updated ${selectedIds.length} categories to ${active ? 'Active' : 'Inactive'}`);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const deletedCats = categories.filter((c) => selectedIds.includes(c.id));
    for (const id of selectedIds) {
      await permanentDeleteAdminCategory(id);
    }

    // Find destination category for reassignment (prefer user's Other Categories, then any other variant)
    const existingOther = categories.find((c) => (c.slug === "other-categories" || c.name === "Other Categories") && !selectedIds.includes(c.id)) ||
      categories.find((c) => ((c.slug || "").toLowerCase().includes("other") || (c.name || "").toLowerCase().includes("other")) && !selectedIds.includes(c.id));

    const targetOtherId = existingOther?.id || "cat-other-categories";
    const targetOtherName = existingOther?.name || "Other Categories";
    const targetOtherSlug = existingOther?.slug || "other-categories";

    // Reassign products locally in localStorage if any exist
    if (deletedCats.length > 0 && typeof window !== "undefined") {
      try {
        for (const storageKey of ["janani_admin_products", "jap_admin_products"]) {
          const storedProds = JSON.parse(localStorage.getItem(storageKey) || "[]");
          let changed = false;
          const updatedProds = storedProds.map((p: any) => {
            const pCat = (p.category || p.category_name || "").toLowerCase().trim();
            const matches = deletedCats.some((dc) => {
              const dName = (dc.name || "").toLowerCase().trim();
              const dSlug = (dc.slug || "").toLowerCase().trim();
              return pCat === dName || pCat === dSlug || String(p.category_id) === String(dc.id);
            });
            if (matches) {
              changed = true;
              return { ...p, category: targetOtherName, category_name: targetOtherName, category_id: targetOtherId, category_slug: targetOtherSlug };
            }
            return p;
          });
          if (changed) {
            localStorage.setItem(storageKey, JSON.stringify(updatedProds));
          }
        }
      } catch (e) {}
    }

    setCategories((prev) => {
      const remaining = prev.filter((c) => !selectedIds.includes(c.id));
      const hasOther = remaining.some((c) => (c.slug || "").toLowerCase().includes("other") || (c.name || "").toLowerCase().includes("other"));
      if (!hasOther) {
        remaining.push({
          id: targetOtherId,
          name: targetOtherName,
          slug: targetOtherSlug,
          parentId: null,
          level: "root",
          description: "All remaining products are present in this categories",
          icon: "📦",
          image: "/images/categories/others.jpg",
          bannerImage: "/images/categories/others.jpg",
          featured: false,
          trending: false,
          active: true,
          orderIndex: 999,
          productsCount: 0,
          deletedAt: null,
          seo: {
            metaTitle: "Other Agro Products",
            metaDescription: "General sustainable farm inputs",
            metaKeywords: "other, agri",
            canonicalUrl: "",
            ogImage: ""
          },
          createdAt: new Date().toISOString()
        });
      }
      return remaining;
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("janani-categories-updated"));
      window.dispatchEvent(new CustomEvent("janani-products-updated"));
    }
    toast.success(`Deleted ${deletedCats.length} categories. Associated products moved to '${targetOtherName}'.`);
    setSelectedIds([]);
  };

  // Reordering (Sequence)
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredCategories.length) return;

    const newOrder = [...filteredCategories];
    const temp = newOrder[index]!;
    newOrder[index] = newOrder[targetIndex]!;
    newOrder[targetIndex] = temp;

    setCategories(newOrder);
    await reorderAdminCategories(newOrder.map((c) => c.id));
    toast.success("Category display sequence updated");
  };

  // CSV Export
  const exportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Slug",
      "Level",
      "Parent ID",
      "Icon",
      "Description",
      "Featured",
      "Trending",
      "Active",
      "Products Count",
      "Meta Title",
      "Meta Description"
    ];
    const rows = categories.map((c) => [
      c.id,
      `"${c.name}"`,
      c.slug,
      c.level,
      c.parentId || "",
      `"${c.icon || ''}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`,
      c.featured,
      c.trending,
      c.active,
      c.productsCount || 0,
      `"${(c.seo?.metaTitle || '').replace(/"/g, '""')}"`,
      `"${(c.seo?.metaDescription || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Janani_Agro_Categories_${Date.now()}.csv`;
    link.click();
    toast.success("Categories exported to CSV");
  };

  // Parent name resolver helper
  const getParentName = (parentId: string | null) => {
    if (!parentId) return "None (Top Root)";
    const p = categories.find((c) => c.id === parentId);
    return p ? p.name : parentId;
  };

  if (isFormModalOpen) {
    return (
      <CategoryFormView
        isOpen={isFormModalOpen}
        initialData={editingCategory}
        allCategories={categories}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={async (formData) => {
          try {
            if (editingCategory) {
              const res = await updateAdminCategory(editingCategory.id, formData);
              if (res?.success === false) {
                toast.error(res?.message || `Failed to update category "${formData.name}"`);
                return;
              }
              const updatedData = res?.data || { ...editingCategory, ...formData };
              setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? updatedData : c)));
              toast.success(res?.message || `Category "${formData.name}" updated successfully`);
            } else {
              const res = await createAdminCategory(formData);
              if (res?.success === false) {
                toast.error(res?.message || `Failed to create category "${formData.name}"`);
                return;
              }
              const createdData = res?.data || formData;
              setCategories((prev) => [createdData, ...prev.filter((c) => c.id !== createdData.id)]);
              toast.success(res?.message || `Category "${formData.name}" created successfully`);
            }
            await loadCategories();
            setIsFormModalOpen(false);
            setEditingCategory(null);
          } catch (err: any) {
            console.error("Save category error:", err);
            toast.error(err?.message || "Failed to save category to database");
          }
        }}
      />
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-xs overflow-hidden">

      {/* Page Title & Action Subheader */}
      <div className="w-full bg-card border-b border-border px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
            Categories
          </h1>
          {filteredCategories.length > 0 && (
            <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
              {filteredCategories.length} items
            </span>
          )}
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setIsFormModalOpen(true);
          }}
          size="sm"
          className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-sm shadow-emerald-700/20 transition-all cursor-pointer px-3.5 sm:px-4 shrink-0"
        >
          <Plus className="size-4 stroke-[2.5]" />
          <span>Add Category</span>
        </Button>
      </div>
      {/* Bulk Action Bar (When 1+ rows selected) */}
      {selectedIds.length > 0 && (
        <div className="w-full border-b border-emerald-500/30 bg-emerald-500/10 p-3.5 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in rounded-none">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-emerald-600 px-2.5 py-0.5 text-xs font-extrabold text-white">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
              Bulk Actions Available:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleBulkStatus(true)}
              size="sm"
              variant="outline"
              className="h-8 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-500/20"
            >
              Mark Active
            </Button>
            <Button
              onClick={() => handleBulkStatus(false)}
              size="sm"
              variant="outline"
              className="h-8 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-500/20"
            >
              Mark Inactive
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
              className="text-xs text-muted-foreground hover:underline ml-2 cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Categories Table */}
      <div className="w-full border-b border-border bg-card shadow-none overflow-hidden rounded-none flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1 w-full relative min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-72px)]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-muted-foreground shadow-xs">
              <tr>
                <th className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md border-b border-border/80 px-6 py-4">Category Name & Hierarchy</th>
                <th className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md border-b border-border/80 px-6 py-4">Products</th>
                <th className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md border-b border-border/80 px-6 py-4 text-center">Featured</th>
                <th className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md border-b border-border/80 px-6 py-4 text-center">Trending</th>
                <th className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md border-b border-border/80 px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((cat, idx) => {
                  const realIdx = filteredCategories.findIndex((c) => c.id === cat.id);
                  const effectiveIdx = realIdx !== -1 ? realIdx : idx;
                  return (
                  <tr
                    key={cat.id}
                    className="hover:bg-accent/40 transition-colors"
                  >
                    {/* Category Title & Icon & Parent Linkage */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-2xl bg-muted/80 border border-border/80 overflow-hidden flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                          {cat.image && (cat.image.startsWith("http") || cat.image.startsWith("data:") || cat.image.startsWith("/")) ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="size-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/images/categories/bio-fertilizers.jpg";
                              }}
                            />
                          ) : (
                            cat.icon || "🌾"
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-foreground text-sm truncate">{cat.name}</span>
                            {cat.seo?.metaTitle && (
                              <span title={`SEO: ${cat.seo.metaTitle}`} className="text-muted-foreground hover:text-foreground">
                                <Globe className="size-3" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <span className="font-mono text-emerald-600">/{cat.slug}</span>
                            {cat.parentId && (
                              <span className="rounded bg-muted px-1.5 py-0.2">Parent: {getParentName(cat.parentId)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Products Count */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-foreground">{cat.productsCount || 0}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">items</span>
                    </td>

                    {/* Featured Toggle */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleField(cat.id, "featured")}
                        className={`p-1.5 rounded-xl transition-colors ${
                          cat.featured ? "bg-amber-500/15 text-amber-600" : "text-muted-foreground/40 hover:text-muted-foreground"
                        }`}
                        title="Toggle Homepage Featured"
                      >
                        <Star className={`size-4 ${cat.featured ? "fill-amber-500" : ""}`} />
                      </button>
                    </td>

                    {/* Trending Toggle */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleField(cat.id, "trending")}
                        className={`p-1.5 rounded-xl transition-colors ${
                          cat.trending ? "bg-rose-500/15 text-rose-600" : "text-muted-foreground/40 hover:text-muted-foreground"
                        }`}
                        title="Toggle Trending"
                      >
                        <Flame className={`size-4 ${cat.trending ? "fill-rose-500" : ""}`} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {statusFilter === "trash" ? (
                          <>
                            <Button
                              onClick={() => handleRestore(cat.id)}
                              size="sm"
                              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] h-7 font-bold gap-1"
                            >
                              <RotateCcw className="size-3" /> Restore
                            </Button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/15 text-rose-600 transition-colors"
                              title="Delete Permanently"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setViewingCategory(cat)}
                              className="p-1.5 rounded-xl hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 transition-colors"
                              title="View Category Details & Products"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCategory(cat);
                                setIsFormModalOpen(true);
                              }}
                              className="p-1.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit Category & SEO"
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
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
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <FolderTree className="size-10 mx-auto opacity-30 mb-2" />
                    <p className="text-sm font-bold text-foreground">No categories match your criteria</p>
                    <p className="text-xs text-muted-foreground mt-1">Try resetting filters or adding a new category</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


      </div>

      {/* View Category Details & Products Modal */}
      {viewingCategory && (
        <CategoryViewModal
          category={viewingCategory}
          allCategories={categories}
          allProducts={liveProducts}
          onClose={() => setViewingCategory(null)}
          onEdit={(cat) => {
            setEditingCategory(cat);
            setIsFormModalOpen(true);
          }}
        />
      )}



      {/* Import CSV Modal */}
      <CategoryImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async (importedList) => {
          await importAdminCategories(importedList);
          loadCategories();
          toast.success(`Successfully imported ${importedList.length} categories`);
          setIsImportModalOpen(false);
        }}
      />
    </div>
  );
}

// -------------------------------------------------------------
// Category Add / Edit Tabbed Modal
// -------------------------------------------------------------
function processCategoryMediaFile(file: File, maxWidth = 1200, maxHeight = 800): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return resolve("");
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          resolve(compressed);
        } else {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}


function CategoryViewModal({
  category,
  allCategories,
  allProducts,
  onClose,
  onEdit,
}: {
  category: CategoryItem;
  allCategories: CategoryItem[];
  allProducts: any[];
  onClose: () => void;
  onEdit: (cat: CategoryItem) => void;
}) {
  // Find products belonging to this category
  const matchingProducts = allProducts.filter((p) => {
    const pCatId = typeof p.category === "object" ? p.category?.id : p.categoryId || p.category_id;
    const pCatSlug = typeof p.category === "object" ? p.category?.slug : p.category;
    const pCatName = typeof p.category === "object" ? p.category?.name : p.category;
    return (
      (pCatId && String(pCatId) === String(category.id)) ||
      (pCatSlug && String(pCatSlug).toLowerCase() === String(category.slug).toLowerCase()) ||
      (pCatName && String(pCatName).toLowerCase() === String(category.name).toLowerCase())
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-card border border-border/80 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Banner & Title */}
        <div className="relative px-5 py-3.5 border-b border-border/70 bg-gradient-to-r from-emerald-500/10 via-emerald-600/5 to-transparent flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-11 rounded-xl bg-muted/90 border border-border/80 overflow-hidden flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
              {category.image && (category.image.startsWith("http") || category.image.startsWith("data:") || category.image.startsWith("/")) ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="size-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/categories/bio-fertilizers.jpg";
                  }}
                />
              ) : (
                category.icon || "🌾"
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight truncate">
                  {category.name}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    category.active
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${category.active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                  {category.active ? "Active" : "Inactive"}
                </span>
                {category.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                    <Star className="size-3 fill-amber-500" /> Featured
                  </span>
                )}
                {category.trending && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 px-2 py-0.5 text-[10px] font-bold">
                    <Flame className="size-3 fill-rose-500" /> Trending
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                <span className="font-mono text-emerald-600 font-semibold text-[11px]">/{category.slug}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="size-8 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body - Sleek, Fits without scrollbar */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[84vh] scrollbar-none">
          {/* Category Overview Card */}
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-3 sm:p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FolderTree className="size-3.5 text-emerald-600" /> Category Overview
              </h3>
              <div>
                <a
                  href={`/categories/${category.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  View on Store <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed line-clamp-2">
              {category.description || "No description provided for this agricultural input category."}
            </p>
            <div className="flex items-center gap-4 pt-1.5 border-t border-border/60 text-xs text-muted-foreground">
              <span className="text-[11px] text-muted-foreground">
                Associated Products: <strong className="font-extrabold text-foreground">{matchingProducts.length} items</strong>
              </span>
            </div>
          </div>

          {/* Products in this category */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Package className="size-3.5 text-blue-600" /> Products in this Category ({matchingProducts.length})
              </h3>
              {matchingProducts.length > 0 && (
                <span className="text-[11px] text-muted-foreground">Showing all {matchingProducts.length} items</span>
              )}
            </div>

            {matchingProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto scrollbar-none pr-0.5">
                {matchingProducts.map((prod: any, pIdx: number) => {
                  const pImg = prod.thumbnail || prod.image || (Array.isArray(prod.images) ? prod.images[0] : null) || "/images/products/harit.jpg";
                  const pPrice = Number(prod.price || prod.sellingPrice || prod.regularPrice || 0);
                  const pOriginalPrice = Number(prod.originalPrice || prod.regularPrice || prod.mrp || 0);
                  const pStock = Number(prod.stock ?? prod.warehouseStock ?? 50);

                  return (
                    <div
                      key={prod.id || pIdx}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/80 bg-card hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="size-10 rounded-lg bg-muted/60 border border-border/60 overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src={pImg}
                          alt={prod.name || prod.title}
                          className="size-full object-contain p-0.5"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/images/products/harit.jpg";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-foreground truncate" title={prod.name || prod.title}>
                          {prod.name || prod.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                            ₹{pPrice.toLocaleString("en-IN")}
                          </span>
                          {pOriginalPrice > pPrice && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              ₹{pOriginalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-bold ml-auto ${
                              pStock > 10
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : pStock > 0
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                            }`}
                          >
                            {pStock > 0 ? `${pStock} in stock` : "Out of stock"}
                          </span>
                        </div>
                        {prod.sku && (
                          <span className="text-[10px] text-muted-foreground truncate font-mono block mt-0.5">SKU: {prod.sku}</span>
                        )}
                      </div>
                      {prod.slug && (
                        <a
                          href={`/products/${prod.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors shrink-0"
                          title="View Product Page"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 p-4 text-center bg-muted/10">
                <Package className="size-6 text-muted-foreground/40 mx-auto mb-1" />
                <p className="text-xs font-bold text-foreground">No Products in this Category</p>
                <p className="text-[11px] text-muted-foreground">
                  Products assigned to '{category.name}' will automatically appear here.
                </p>
              </div>
            )}
          </div>

          {/* SEO & Meta Tags Card */}
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-3 sm:p-3.5 space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Globe className="size-3.5 text-indigo-600" /> SEO & Search Engine Optimization
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Meta Title</span>
                <p className="font-semibold text-foreground truncate text-xs mt-0.5">
                  {category.seo?.metaTitle || `${category.name} - Janani Agro Products`}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Canonical URL</span>
                <p className="font-mono text-[11px] text-emerald-600 truncate mt-0.5">
                  {category.seo?.canonicalUrl || `https://jananiagroproducts.com/categories/${category.slug}`}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Meta Description</span>
                <p className="text-[11px] text-foreground/80 mt-0.5 line-clamp-1">
                  {category.seo?.metaDescription || category.description || "Discover high-yield biological agro inputs and organic solutions at Janani Agro."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-border/80 bg-muted/20 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold h-8.5 px-3"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={() => {
              onClose();
              onEdit(category);
            }}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8.5 px-3.5 gap-1.5 shadow-sm"
          >
            <Edit className="size-3.5" /> Edit Category & SEO
          </Button>
        </div>
      </div>
    </div>
  );
}

function CategoryFormView({
  isOpen,
  onClose,
  initialData,
  allCategories,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: CategoryItem | null;
  allCategories: CategoryItem[];
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    level: "root" as "root" | "sub" | "child",
    parentId: "" as string | null,
    description: "",
    icon: "",
    image: "",
    bannerImage: "",
    featured: false,
    trending: false,
    active: true,
    orderIndex: 1,
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      canonicalUrl: "",
      ogImage: ""
    }
  });

  const handleUploadMediaFile = async (e: React.ChangeEvent<HTMLInputElement>, field: "image" | "bannerImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large. Please select a photo under 10MB.");
      return;
    }

    try {
      toast.loading("Processing and optimizing image for database...", { id: "cat-upload" });
      const maxWidth = field === "bannerImage" ? 1600 : 1000;
      const maxHeight = field === "bannerImage" ? 800 : 1000;
      const dataUrl = await processCategoryMediaFile(file, maxWidth, maxHeight);
      if (dataUrl) {
        setFormData((prev) => ({
          ...prev,
          [field]: dataUrl,
          ...(field === "image" ? { bannerImage: dataUrl } : {})
        }));
        toast.success(`Successfully uploaded ${field === "image" ? "card thumbnail" : "hero banner"}!`, { id: "cat-upload" });
      }
    } catch (err) {
      toast.error("Failed to process image file", { id: "cat-upload" });
    } finally {
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        level: initialData.level || "root",
        parentId: initialData.parentId || "",
        description: initialData.description || "",
        icon: initialData.icon || "",
        image: initialData.image || "",
        bannerImage: initialData.bannerImage || initialData.image || "",
        featured: Boolean(initialData.featured),
        trending: Boolean(initialData.trending),
        active: initialData.active !== undefined ? Boolean(initialData.active) : true,
        orderIndex: initialData.orderIndex || 1,
        seo: {
          metaTitle: initialData.seo?.metaTitle || "",
          metaDescription: initialData.seo?.metaDescription || "",
          metaKeywords: initialData.seo?.metaKeywords || "",
          canonicalUrl: initialData.seo?.canonicalUrl || "",
          ogImage: initialData.seo?.ogImage || ""
        }
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        level: "root",
        parentId: "",
        description: "",
        icon: "",
        image: "",
        bannerImage: "",
        featured: false,
        trending: false,
        active: true,
        orderIndex: allCategories.length + 1,
        seo: {
          metaTitle: "",
          metaDescription: "",
          metaKeywords: "",
          canonicalUrl: "",
          ogImage: ""
        }
      });
    }
  }, [initialData, isOpen]);

  // Auto-generate slug and meta title from name
  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setFormData((prev) => ({
      ...prev,
      name,
      slug: initialData ? prev.slug : slug,
      seo: {
        ...prev.seo,
        metaTitle: initialData ? prev.seo.metaTitle : `${name} | JANANI AGRO PRODUCTS`,
        canonicalUrl: `https://jananiagro.com/categories/${slug}`
      }
    }));
  };

  // Filter possible parents based on selected level
  const parentCandidates = allCategories.filter((c) => {
    if (formData.level === "sub") return c.level === "root";
    if (formData.level === "child") return c.level === "sub";
    return false;
  });

  return (
    <div className="w-full flex-1 flex flex-col min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-72px)] bg-card animate-in fade-in">
      {/* Top Page Header Bar */}
      <div className="w-full bg-card border-b border-border px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1.5 px-2.5 rounded-xl border border-border hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Categories</span>
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
              {initialData ? `Edit Category: ${initialData.name}` : "Create New Category"}
            </h1>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              3-Tier Hierarchy, SEO tags, and Category Image
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold h-9 px-3.5 cursor-pointer">
            Cancel
          </Button>
          <Button
            onClick={() => onSave(formData)}
            disabled={!formData.name}
            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs gap-1.5 shadow-sm h-9 px-4 cursor-pointer"
          >
            <Save className="size-4" /> Save Category
          </Button>
        </div>
      </div>

      {/* Page Form Body - Unified Continuous Scrolling Container */}
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* SECTION 1: General Info & Hierarchy */}
        <div id="cat-section-general" className="scroll-mt-28 rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/70">
            <div className="size-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">General Information & Hierarchy</h3>
              <p className="text-[11px] text-muted-foreground">Category name, URL slug, parent hierarchy, and description</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Category Name *</label>
              <input
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Bio-Fertilizers & Inoculants"
                className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-bold outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">URL Slug *</label>
              <input
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="bio-fertilizers"
                className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-mono font-semibold text-emerald-600 outline-none"
              />
            </div>

            {formData.level !== "root" && (
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Select Parent Category ({formData.level === "sub" ? "Select Root Parent" : "Select Sub Parent"}) *
                </label>
                <select
                  value={formData.parentId || ""}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-semibold outline-none"
                >
                  <option value="">-- Choose Parent --</option>
                  {parentCandidates.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.icon} {parent.name} ({parent.level} tier)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Category Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe harvest origins, purity certifications, and organic cultivation standards..."
                className="w-full rounded-2xl border border-border bg-background p-3 text-xs outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Media & Images */}
        <div id="cat-section-media" className="scroll-mt-28 rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="size-4 text-emerald-600" />
                  <span>Category Image & Thumbnail</span>
                </h3>
                <p className="text-[11px] text-muted-foreground">Used in storefront cards, grids, and navigation banners</p>
              </div>
            </div>
            {formData.image && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, image: "", bannerImage: "" }))}
                className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Trash2 className="size-3" /> Clear Image
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Upload from Computer / Device */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                📁 Option 1: Upload from Device
              </span>
              <label className="flex flex-col items-center justify-center h-24 rounded-2xl border-2 border-dashed border-border hover:border-emerald-500 bg-muted/20 hover:bg-emerald-500/5 cursor-pointer transition-colors p-2 text-center group">
                <Upload className="size-5 text-muted-foreground group-hover:text-emerald-600 mb-1 transition-transform group-hover:scale-110" />
                <span className="text-xs font-bold text-foreground">Click to Browse Thumbnail</span>
                <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP, SVG</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadMediaFile(e, "image")}
                />
              </label>
            </div>

            {/* Direct URL input */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                🔗 Option 2: Direct Image URL
              </span>
              <div className="flex flex-col justify-between h-24">
                <input
                  value={formData.image}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, image: val, bannerImage: val }));
                  }}
                  placeholder="e.g. https://... or upload from device"
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600 font-mono text-[11px]"
                />
                <p className="text-[10px] text-muted-foreground">
                  Supports local paths, HTTPS links, or uploaded Base64 image data.
                </p>
              </div>
            </div>
          </div>

          {/* Thumbnail Preview Bar */}
          {formData.image && (
            <div className="flex items-center gap-3 pt-2.5 border-t border-border/60">
              <div className="size-12 rounded-xl border border-border overflow-hidden bg-muted shrink-0 shadow-xs">
                <img
                  src={formData.image}
                  alt="Thumbnail preview"
                  className="size-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-foreground block truncate">Active Card Thumbnail</span>
                <span className="text-[10px] font-mono text-muted-foreground truncate block">
                  {formData.image.startsWith("data:") ? "Local Image File Selected (Ready to Save)" : formData.image}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: SEO Suite */}
        <div id="cat-section-seo" className="scroll-mt-28 rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/70">
            <div className="size-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Globe className="size-3.5 text-emerald-600" />
                <span>SEO & Meta Tags Suite</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">Custom meta titles, descriptions, keywords, and live Google SERP preview</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-foreground">SEO Meta Title</label>
                <span className="text-[10px] text-muted-foreground">{(formData.seo.metaTitle || '').length}/60 chars</span>
              </div>
              <input
                value={formData.seo.metaTitle}
                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })}
                placeholder="Buy Pure Organic Rice Online | Janani Agro"
                className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-foreground">SEO Meta Description</label>
                <span className="text-[10px] text-muted-foreground">{(formData.seo.metaDescription || '').length}/160 chars</span>
              </div>
              <textarea
                rows={2}
                value={formData.seo.metaDescription}
                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })}
                placeholder="Certified organic grains grown without chemical pesticides..."
                className="w-full rounded-2xl border border-border bg-background p-3 text-xs outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Meta Keywords</label>
                <input
                  value={formData.seo.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaKeywords: e.target.value } })}
                  placeholder="bio-fertilizer, trichoderma, humic, soil health"
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Canonical URL</label>
                <input
                  value={formData.seo.canonicalUrl}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, canonicalUrl: e.target.value } })}
                  placeholder="https://jananiagro.com/categories/..."
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-mono text-[11px] outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* SERP Google Snippet Preview */}
            <div className="rounded-2xl border border-border bg-muted/30 p-4 shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1.5 flex items-center gap-1">
                <Globe className="size-3 text-emerald-600" /> Google Search Result Preview:
              </span>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 truncate hover:underline cursor-pointer">
                {formData.seo.metaTitle || `${formData.name || 'Category'} | JANANI AGRO`}
              </p>
              <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 truncate">
                {formData.seo.canonicalUrl || `https://jananiagro.com/categories/${formData.slug || 'slug'}`}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {formData.seo.metaDescription || formData.description || "Discover farm-fresh organic harvest products directly tested for purity."}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 4: Storefront Toggles & Visibility */}
        <div id="cat-section-settings" className="scroll-mt-28 rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/70">
            <div className="size-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
              4
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Storefront Toggles & Visibility</h3>
              <p className="text-[11px] text-muted-foreground">Active storefront status, homepage carousel display, trending badges, and sequence</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-foreground block">Active Visibility</span>
                  <span className="text-[11px] text-muted-foreground">Show category live on public navigation & filter menus</span>
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
                  <span className="text-xs font-bold text-foreground block">Featured on Homepage</span>
                  <span className="text-[11px] text-muted-foreground">Display prominently on the homepage category carousel</span>
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
                  <span className="text-xs font-bold text-foreground block">Trending Tag</span>
                  <span className="text-[11px] text-muted-foreground">Show glowing 'Trending Harvest' badge</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.trending}
                  onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                  className="size-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Sort Order Sequence</label>
              <input
                type="number"
                value={formData.orderIndex}
                onChange={(e) => setFormData({ ...formData, orderIndex: Number(e.target.value) })}
                className="h-10 w-32 rounded-2xl border border-border bg-background px-3 text-xs font-bold outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="w-full border-t border-border bg-card px-4 sm:px-6 py-3.5 flex items-center justify-between mt-auto">
        <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold h-9 px-4 cursor-pointer">
          Cancel
        </Button>
        <Button
          onClick={() => onSave(formData)}
          disabled={!formData.name}
          className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs gap-1.5 shadow-sm h-9 px-4 cursor-pointer"
        >
          <Save className="size-4" /> Save Category
        </Button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Category CSV Import Modal
// -------------------------------------------------------------
function CategoryImportModal({
  isOpen,
  onClose,
  onImport
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (categories: any[]) => void;
}) {
  const [csvText, setCsvText] = useState("");

  if (!isOpen) return null;

  const sampleCsv = `Name,Slug,Level,ParentId,Description,Icon,Featured,Trending,Active
"Cold Pressed Sesame Oil",cold-pressed-sesame-oil,sub,CAT-ROOT-2,"Traditional wooden expeller sesame oil",🫒,true,false,true
"Stoneground Wheat Flours",stoneground-wheat-flours,root,,"100% whole grain stoneground flours",🌾,false,true,true
"Sharbati Wheat Flour",sharbati-wheat-flour,sub,CAT-ROOT-1,"High dietary fiber Madhya Pradesh harvest",🌾,true,true,true`;

  const handleProcessImport = () => {
    try {
      const lines = csvText.trim().split("\n");
      if (lines.length <= 1) {
        toast.error("Please provide CSV data with header and at least 1 row");
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
            slug: cols[1] || cols[0].toLowerCase().replace(/\s+/g, "-"),
            level: cols[2] || "root",
            parentId: cols[3] || null,
            description: cols[4] || "",
            icon: cols[5] || "🌾",
            featured: cols[6] === "true",
            trending: cols[7] === "true",
            active: cols[8] !== "false"
          });
        }
      }

      onImport(parsed);
    } catch (err) {
      toast.error("Failed to parse CSV text");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-emerald-600" />
            <h3 className="text-base font-bold text-foreground">Import Categories via CSV</h3>
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
            placeholder={`Name,Slug,Level,ParentId,Description,Icon,Featured,Trending,Active\n"Organic Spices",organic-spices,root,,"Single-estate spices",🌶️,true,true,true`}
            className="w-full rounded-2xl border border-border bg-background p-3 font-mono text-[11px] outline-none focus:border-emerald-600"
          />

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold">
              Cancel
            </Button>
            <Button
              onClick={handleProcessImport}
              disabled={!csvText.trim()}
              className="rounded-xl bg-emerald-600 text-white font-bold text-xs gap-1.5 shadow"
            >
              <Upload className="size-4" /> Import Categories
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
