import React, { useState, useEffect, useMemo } from "react";
import {
  FolderTree,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Star,
  Flame,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Save,
  X,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Eye,
  GripVertical,
  Globe,
  ImageIcon,
  CheckSquare,
  Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
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

export function CategoriesManagement() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

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
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

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

  // Soft Delete & Restore Handlers
  const handleDelete = async (id: string) => {
    if (statusFilter === "trash") {
      // Permanent delete
      await permanentDeleteAdminCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category permanently deleted");
    } else {
      // Soft delete
      await deleteAdminCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category moved to Trash Bin");
    }
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
    await bulkDeleteAdminCategories(selectedIds);
    setCategories((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    setSelectedIds([]);
    toast.success(`Moved ${selectedIds.length} categories to Trash`);
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

  return (
    <div className="space-y-6">
      {/* Header & Overview Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
            <FolderTree className="size-3.5" /> 3-Tier Taxonomy System
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Categories & Taxonomy Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage Root Categories, Sub Categories, Child Categories, SEO Meta Tags, and Storefront Hero Banners.
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
              setEditingCategory(null);
              setIsFormModalOpen(true);
            }}
            size="sm"
            className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs gap-1.5 shadow-md shadow-emerald-700/20"
          >
            <Plus className="size-4" /> Add Category
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by category name, slug, SEO tags..."
              className="h-10 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-xs outline-none focus:border-emerald-600 shadow-sm"
            />
          </div>

          {/* Level Filter Tabs */}
          <div className="flex rounded-2xl border border-border bg-muted/40 p-1 text-xs font-semibold">
            {(["all", "root", "sub", "child"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setLevelFilter(lvl);
                  setCurrentPage(1);
                }}
                className={`rounded-xl px-3 py-1 capitalize transition-colors ${
                  levelFilter === lvl
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lvl === "all" ? "All Tiers" : `${lvl} Tier`}
              </button>
            ))}
          </div>

          {/* Visibility Filter */}
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as any)}
            className="h-10 rounded-2xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-emerald-600"
          >
            <option value="all">All Visibility</option>
            <option value="featured">Featured on Homepage</option>
            <option value="trending">Trending Harvest</option>
          </select>
        </div>

        {/* Bulk Action Bar (When 1+ rows selected) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between rounded-2xl bg-emerald-500/10 p-3 border border-emerald-500/30 animate-in fade-in">
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
                className="text-xs text-muted-foreground hover:underline ml-2"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Categories Table */}
      <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-4 text-center w-10">
                  <button onClick={handleSelectAll} className="text-muted-foreground hover:text-foreground">
                    {selectedIds.length > 0 && selectedIds.length === paginatedCategories.length ? (
                      <CheckSquare className="size-4 text-emerald-600" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-4 w-12 text-center">Seq</th>
                <th className="px-6 py-4">Category Name & Hierarchy</th>
                <th className="px-6 py-4">Tier Level</th>
                <th className="px-6 py-4">Products</th>
                <th className="px-6 py-4 text-center">Featured</th>
                <th className="px-6 py-4 text-center">Trending</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((cat, idx) => (
                  <tr
                    key={cat.id}
                    className={`hover:bg-accent/40 transition-colors ${
                      selectedIds.includes(cat.id) ? "bg-emerald-500/5" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handleToggleSelect(cat.id)}>
                        {selectedIds.includes(cat.id) ? (
                          <CheckSquare className="size-4 text-emerald-600" />
                        ) : (
                          <Square className="size-4 text-muted-foreground" />
                        )}
                      </button>
                    </td>

                    {/* Order Sequence Up/Down */}
                    <td className="px-3 py-4 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          onClick={() => handleMove(idx, "up")}
                          disabled={idx === 0}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                        <span className="text-[10px] font-bold text-muted-foreground">{cat.orderIndex || idx + 1}</span>
                        <button
                          onClick={() => handleMove(idx, "down")}
                          disabled={idx === paginatedCategories.length - 1}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Category Title & Icon & Parent Linkage */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-2xl bg-muted/80 border border-border/80 overflow-hidden flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                          {cat.image && cat.image.startsWith("http") ? (
                            <img src={cat.image} alt={cat.name} className="size-full object-cover" />
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

                    {/* Tier Level Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-xl px-2.5 py-1 text-[10px] font-extrabold capitalize ${
                          cat.level === "root"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                            : cat.level === "sub"
                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30"
                            : "bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30"
                        }`}
                      >
                        {cat.level === "root" ? "Root Tier 1" : cat.level === "sub" ? "Sub Tier 2" : "Child Tier 3"}
                      </span>
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

                    {/* Status Active Toggle Switch */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleField(cat.id, "active")}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold transition-colors ${
                          cat.active
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${cat.active ? "bg-emerald-500" : "bg-muted-foreground"}`}></span>
                        {cat.active ? "Active" : "Inactive"}
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
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <FolderTree className="size-10 mx-auto opacity-30 mb-2" />
                    <p className="text-sm font-bold text-foreground">No categories match your criteria</p>
                    <p className="text-xs text-muted-foreground mt-1">Try resetting filters or adding a new category</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border bg-muted/20 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Showing {paginatedCategories.length} of {filteredCategories.length} items</span>
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

      {/* Add / Edit Category Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCategory(null);
        }}
        initialData={editingCategory}
        allCategories={categories}
        onSave={async (formData) => {
          try {
            if (editingCategory) {
              const res = await updateAdminCategory(editingCategory.id, formData);
              if (res?.success === false) {
                toast.error(res?.message || `Failed to update category "${formData.name}"`);
                return;
              }
              toast.success(res?.message || `Category "${formData.name}" updated successfully`);
            } else {
              const res = await createAdminCategory(formData);
              if (res?.success === false) {
                toast.error(res?.message || `Failed to create category "${formData.name}"`);
                return;
              }
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
function CategoryFormModal({
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
  const [activeTab, setActiveTab] = useState<"general" | "media" | "seo" | "settings">("general");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    level: "root" as "root" | "sub" | "child",
    parentId: "" as string | null,
    description: "",
    icon: "🌾",
    image: "/images/cat-rice.jpg",
    bannerImage: "/images/banner-rice.jpg",
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        level: initialData.level || "root",
        parentId: initialData.parentId || "",
        description: initialData.description || "",
        icon: initialData.icon || "🌾",
        image: initialData.image || "/images/cat-rice.jpg",
        bannerImage: initialData.bannerImage || "/images/banner-rice.jpg",
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
        icon: "🌾",
        image: "/images/cat-rice.jpg",
        bannerImage: "/images/banner-rice.jpg",
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

  if (!isOpen) return null;

  // Filter possible parents based on selected level
  const parentCandidates = allCategories.filter((c) => {
    if (formData.level === "sub") return c.level === "root";
    if (formData.level === "child") return c.level === "sub";
    return false;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {initialData ? `Edit Category: ${initialData.name}` : "Create New Category"}
            </h3>
            <p className="text-xs text-muted-foreground">3-Tier Hierarchy, SEO tags, and Image Banners</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent text-muted-foreground"><X className="size-4" /></button>
        </div>

        {/* Modal Tabs */}
        <div className="flex rounded-2xl border border-border bg-muted/40 p-1 mt-4 text-xs font-bold shrink-0">
          {[
            { id: "general", label: "1. General & Hierarchy" },
            { id: "media", label: "2. Images & Banners" },
            { id: "seo", label: "3. SEO & Meta Tags" },
            { id: "settings", label: "4. Storefront Toggles" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 rounded-xl py-2 transition-colors text-center ${
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
                <label className="text-xs font-bold text-foreground block mb-1">Category Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Royal Aged Basmati Rice"
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">URL Slug *</label>
                  <input
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="royal-aged-basmati-rice"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-mono font-semibold text-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Taxonomy Tier *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any, parentId: "" })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-bold outline-none"
                  >
                    <option value="root">Root Category (Tier 1)</option>
                    <option value="sub">Sub Category (Tier 2)</option>
                    <option value="child">Child Category (Tier 3)</option>
                  </select>
                </div>
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
          )}

          {/* TAB 2: Media & Images */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Icon / Emoji Symbol</label>
                  <div className="flex items-center gap-2">
                    <input
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="🌾"
                      className="h-10 w-16 text-center text-xl rounded-2xl border border-border bg-background outline-none"
                    />
                    <div className="flex flex-wrap gap-1">
                      {["🌾", "🫒", "🥣", "🌶️", "🍚", "🍯", "👑", "🟡", "🌻"].map((emoji) => (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => setFormData({ ...formData, icon: emoji })}
                          className="p-1 rounded-lg border border-border hover:bg-accent text-sm"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Card Thumbnail URL</label>
                  <input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/images/cat-rice.jpg"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Category Landing Hero Banner URL</label>
                <input
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  placeholder="/images/banner-rice.jpg"
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none"
                />
              </div>

              {/* Preview Box */}
              <div className="rounded-2xl border border-border bg-muted/40 p-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-2">Banner Preview:</span>
                <div className="h-28 w-full rounded-xl bg-muted border border-border overflow-hidden relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 to-transparent p-4 flex flex-col justify-end text-white">
                    <span className="text-xl">{formData.icon}</span>
                    <h4 className="font-bold text-base">{formData.name || "Category Title"}</h4>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEO Suite */}
          {activeTab === "seo" && (
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
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none"
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
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Meta Keywords</label>
                  <input
                    value={formData.seo.metaKeywords}
                    onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaKeywords: e.target.value } })}
                    placeholder="organic rice, basmati, pesticide-free"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Canonical URL</label>
                  <input
                    value={formData.seo.canonicalUrl}
                    onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, canonicalUrl: e.target.value } })}
                    placeholder="https://jananiagro.com/categories/..."
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-mono text-[11px] outline-none"
                  />
                </div>
              </div>

              {/* SERP Google Snippet Preview */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
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
          )}

          {/* TAB 4: Storefront Toggles */}
          {activeTab === "settings" && (
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
                  className="h-10 w-32 rounded-2xl border border-border bg-background px-3 text-xs font-bold outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-border flex items-center justify-between shrink-0">
          <Button variant="outline" onClick={onClose} className="rounded-2xl text-xs font-semibold">
            Cancel
          </Button>

          <Button
            onClick={() => onSave(formData)}
            disabled={!formData.name}
            className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs gap-1.5 shadow-md"
          >
            <Save className="size-4" /> Save Category
          </Button>
        </div>
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
