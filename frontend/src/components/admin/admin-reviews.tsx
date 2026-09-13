import React, { useState, useEffect } from "react";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  Pin,
  Image as ImageIcon,
  Eye,
  Filter,
  Search,
  Download,
  Plus,
  CornerDownRight,
  Sparkles,
  ShieldAlert,
  BarChart3,
  ExternalLink,
  Clock,
  User,
  Mail,
  ShoppingBag,
  Layers,
  RefreshCw,
  SlidersHorizontal,
  Heart,
  Check,
  X,
  Send,
  Flag,
  ChevronRight,
  Maximize2
} from "lucide-react";
import {
  getAdminReviews,
  getAdminReviewById,
  createAdminReview,
  updateAdminReviewStatus,
  toggleFeatureReview,
  addAdminReply,
  deleteAdminReply,
  addCustomerReply,
  reportReviewAbuse,
  dismissReviewAbuse,
  toggleReviewImageStatus,
  deleteAdminReview,
  getReviewAnalytics,
  AdminReview,
  ReviewImage,
  ReviewStats,
  ReviewAnalyticsData,
  ReviewQueryParams
} from "@/lib/api";
import { toast } from "sonner";

export function ReviewsManagement() {
  const [activeTab, setActiveTab] = useState<"desk" | "gallery" | "abuse" | "analytics">("desk");
  const [statusSubTab, setStatusSubTab] = useState<"all" | "pending" | "approved" | "rejected" | "flagged">("all");

  // Data State
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    flaggedCount: 0,
    photoReviewsCount: 0,
    averageRating: 5.0,
    responseRate: "96.4%",
    recommendationRate: "94.8%"
  });
  const [analytics, setAnalytics] = useState<ReviewAnalyticsData | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterWithPhotosOnly, setFilterWithPhotosOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "rating_high" | "rating_low" | "helpful">("newest");

  // Interactive Modals & Drawers
  const [replyingReview, setReplyingReview] = useState<AdminReview | null>(null);
  const [rejectingReview, setRejectingReview] = useState<AdminReview | null>(null);
  const [reportingReview, setReportingReview] = useState<AdminReview | null>(null);
  const [inspectingReview, setInspectingReview] = useState<AdminReview | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ image: ReviewImage; review: AdminReview } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load reviews and stats
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params: ReviewQueryParams = {
        status: statusSubTab === "all" ? undefined : statusSubTab,
        rating: selectedRating === "all" ? undefined : selectedRating,
        verified: filterVerifiedOnly ? true : undefined,
        hasImages: filterWithPhotosOnly ? true : undefined,
        search: searchQuery.trim() || undefined,
        sortBy
      };

      const res = await getAdminReviews(params);
      if (res && res.data) {
        setReviews(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
      toast.error("Failed to load customer reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await getReviewAnalytics();
      if (data) setAnalytics(data);
    } catch (err) {
      console.error("Failed to load review analytics:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusSubTab, selectedRating, filterVerifiedOnly, filterWithPhotosOnly, sortBy]);

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Actions
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleApprove = async (review: AdminReview) => {
    try {
      const res = await updateAdminReviewStatus(review.id, "Approved");
      if (res?.success) {
        toast.success(`Review ${review.id} approved and published to storefront!`);
        fetchReviews();
      }
    } catch (err) {
      toast.error("Failed to approve review");
    }
  };

  const handleToggleFeature = async (review: AdminReview) => {
    try {
      const res = await toggleFeatureReview(review.id);
      if (res?.success) {
        toast.success(res.message);
        fetchReviews();
      }
    } catch (err) {
      toast.error("Failed to update feature status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete review ${id}?`)) return;
    try {
      const res = await deleteAdminReview(id);
      if (res?.success) {
        toast.success(`Review ${id} permanently deleted.`);
        fetchReviews();
      }
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Review ID", "Product", "Customer", "Email", "Rating", "Status", "Verified", "Photos Count", "Helpful Votes", "Date"];
    const rows = reviews.map(r => [
      r.id,
      `"${r.productName.replace(/"/g, '""')}"`,
      `"${r.customerName.replace(/"/g, '""')}"`,
      r.customerEmail,
      r.rating,
      r.status,
      r.verifiedPurchase ? "Yes" : "No",
      r.images ? r.images.length : 0,
      r.helpfulCount,
      r.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `janani-reviews-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Reviews export CSV downloaded successfully!");
  };

  // Collect all images across reviews for the UGC gallery tab
  const allUgcImages: Array<{ image: ReviewImage; review: AdminReview }> = [];
  reviews.forEach(r => {
    if (r.images && r.images.length > 0) {
      r.images.forEach(img => {
        allUgcImages.push({ image: img, review: r });
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Star className="size-5 fill-current" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Reviews & Ratings</h1>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Verified Buyer Trust
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Shopify Plus & Yotpo grade moderation desk, customer UGC photo galleries, official merchant replies, and sentiment analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchReviews}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-muted"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-muted"
          >
            <Download className="size-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-leaf px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-leaf/90"
          >
            <Plus className="size-4" />
            Add Review
          </button>
        </div>
      </div>

      {/* 6 KPI Ribbon Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Average Rating</span>
            <Star className="size-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-foreground">{stats.averageRating}</span>
            <span className="text-xs font-semibold text-muted-foreground">/ 5.0</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">★ Top 5% Organic Tier</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Reviews</span>
            <MessageSquare className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{stats.totalReviews}</div>
          <p className="mt-1 text-[11px] text-muted-foreground">{stats.approvedCount} Publicly Visible</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Pending Review</span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingCount}</span>
            {stats.pendingCount > 0 && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                Needs Action
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Queued for Moderation</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">UGC Photo Reviews</span>
            <ImageIcon className="size-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{stats.photoReviewsCount}</div>
          <p className="mt-1 text-[11px] text-purple-600 font-medium">38.5% Unboxing Proof</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Response Rate</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.responseRate}</div>
          <p className="mt-1 text-[11px] text-muted-foreground">&lt; 24h Merchant Turnaround</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Abuse Quarantine</span>
            <ShieldAlert className="size-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.flaggedCount}</span>
            {stats.flaggedCount > 0 && (
              <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                Flagged
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">AI Abuse Shield Protected</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("desk")}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-1 ${
              activeTab === "desk"
                ? "border-brand-leaf text-brand-leaf bg-brand-leaf/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="size-4" />
            All & Moderation Desk
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {stats.totalReviews}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-1 ${
              activeTab === "gallery"
                ? "border-brand-leaf text-brand-leaf bg-brand-leaf/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="size-4" />
            UGC Photo Gallery
            <span className="ml-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400">
              {allUgcImages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("abuse")}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-1 ${
              activeTab === "abuse"
                ? "border-brand-leaf text-brand-leaf bg-brand-leaf/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldAlert className="size-4" />
            Abuse Shield & Quarantine
            {stats.flaggedCount > 0 && (
              <span className="ml-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                {stats.flaggedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-1 ${
              activeTab === "analytics"
                ? "border-brand-leaf text-brand-leaf bg-brand-leaf/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="size-4" />
            Analytics & Sentiment Radar
          </button>
        </div>
      </div>

      {/* TAB 1: ALL & MODERATION DESK */}
      {activeTab === "desk" && (
        <div className="space-y-4">
          {/* Sub Tabs + Filter Toolbar */}
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            {/* 5 Status Sub-Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
              {[
                { id: "all", label: "All Reviews", count: stats.totalReviews },
                { id: "pending", label: "Pending Review", count: stats.pendingCount, alert: stats.pendingCount > 0 },
                { id: "approved", label: "Approved Public", count: stats.approvedCount },
                { id: "rejected", label: "Rejected / Quarantined", count: stats.rejectedCount },
                { id: "flagged", label: "Flagged for Abuse", count: stats.flaggedCount, alert: stats.flaggedCount > 0 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusSubTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    statusSubTab === tab.id
                      ? "bg-brand-leaf text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                      statusSubTab === tab.id
                        ? "bg-white/20 text-white"
                        : tab.alert
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Filter Row */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by customer, product, review keywords, email, or order ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand-leaf focus:outline-none"
                />
              </form>

              <div className="flex flex-wrap items-center gap-2">
                {/* Rating Filter */}
                <select
                  value={selectedRating}
                  onChange={e => setSelectedRating(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-brand-leaf focus:outline-none"
                >
                  <option value="all">All Star Ratings</option>
                  <option value="5">5 Stars (★★★★★)</option>
                  <option value="4">4 Stars (★★★★☆)</option>
                  <option value="3">3 Stars (★★★☆☆)</option>
                  <option value="2">2 Stars (★★☆☆☆)</option>
                  <option value="1">1 Star (★☆☆☆☆)</option>
                </select>

                {/* Verified Purchase Toggle */}
                <button
                  type="button"
                  onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    filterVerifiedOnly
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Check className="size-3.5" />
                  Verified Buyer Only
                </button>

                {/* With Photos Only Toggle */}
                <button
                  type="button"
                  onClick={() => setFilterWithPhotosOnly(!filterWithPhotosOnly)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    filterWithPhotosOnly
                      ? "border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <ImageIcon className="size-3.5" />
                  With Photos Only
                </button>

                {/* Sorting */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-brand-leaf focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating_high">Highest Rating (5★ → 1★)</option>
                  <option value="rating_low">Lowest Rating (1★ → 5★)</option>
                  <option value="helpful">Most Helpful Votes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-border bg-card">
              <RefreshCw className="size-8 animate-spin text-brand-leaf" />
              <p className="mt-3 text-xs font-medium text-muted-foreground">Loading reviews desk...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-6 text-center">
              <MessageSquare className="size-10 text-muted-foreground" />
              <h3 className="mt-3 text-sm font-bold text-foreground">No customer reviews matched your filter</h3>
              <p className="mt-1 text-xs text-muted-foreground">Try clearing search filters or checking other status queues.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRating("all");
                  setFilterVerifiedOnly(false);
                  setFilterWithPhotosOnly(false);
                  setStatusSubTab("all");
                }}
                className="mt-4 rounded-lg bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div
                  key={review.id}
                  className={`relative rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md ${
                    review.status === "Pending"
                      ? "border-amber-500/40 bg-amber-500/[0.02]"
                      : review.status === "Rejected"
                      ? "border-rose-500/30 bg-rose-500/[0.02]"
                      : review.abuseReportsCount > 0
                      ? "border-amber-500/60"
                      : "border-border"
                  }`}
                >
                  {/* Card Header: Product Link, Status Badge, Quick Actions */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: Product & Customer info */}
                    <div className="flex items-start gap-3">
                      <img
                        src={review.customerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                        alt={review.customerName}
                        className="size-11 rounded-full object-cover border border-border shadow-xs"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">{review.customerName}</h3>
                          {review.verifiedPurchase && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="size-3" />
                              Verified Buyer
                            </span>
                          )}
                          {review.isFeatured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <Pin className="size-3" />
                              Pinned Feature
                            </span>
                          )}
                          {review.orderId && (
                            <span className="text-xs text-muted-foreground">
                              Order: <strong className="text-foreground">{review.orderId}</strong>
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{review.customerEmail}</span>
                          <span>•</span>
                          <span>{review.createdAt}</span>
                          <span>•</span>
                          <span className="font-semibold text-brand-leaf">{review.productCategory}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill & Inspector Action */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          review.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : review.status === "Pending"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {review.status}
                      </span>

                      <button
                        onClick={() => setInspectingReview(review)}
                        className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Open 360° Review Inspector Drawer"
                      >
                        <Eye className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Star Rating & Product Link Line */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-500">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`size-4 ${star <= review.rating ? "fill-current" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-foreground">{review.rating}.0 / 5.0</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ShoppingBag className="size-3.5 text-brand-leaf" />
                      <span>Product:</span>
                      <strong className="text-foreground">{review.productName}</strong>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="mt-2.5">
                    <h4 className="text-sm font-bold text-foreground">{review.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{review.comment}</p>
                  </div>

                  {/* Rejection Note (if rejected) */}
                  {review.status === "Rejected" && review.rejectionReason && (
                    <div className="mt-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-600 dark:text-rose-400">
                      <strong>Rejection Reason:</strong> {review.rejectionReason}
                    </div>
                  )}

                  {/* Attached UGC Customer Photos */}
                  {review.images && review.images.length > 0 && (
                    <div className="mt-3.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground mb-2">
                        <ImageIcon className="size-3.5 text-purple-500" />
                        <span>Customer Attached Photos ({review.images.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {review.images.map(img => (
                          <div
                            key={img.id}
                            onClick={() => setLightboxImage({ image: img, review })}
                            className="group relative size-18 cursor-pointer overflow-hidden rounded-lg border border-border shadow-xs hover:border-brand-leaf"
                          >
                            <img src={img.url} alt={img.caption || "Review UGC photo"} className="size-full object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <Maximize2 className="size-4 text-white" />
                            </div>
                            {img.status === "Hidden" && (
                              <span className="absolute bottom-0 inset-x-0 bg-rose-600 text-white text-[9px] font-bold text-center py-0.5">
                                Hidden
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Merchant Admin Reply Card */}
                  {review.adminReply ? (
                    <div className="mt-4 rounded-xl border border-brand-leaf/20 bg-brand-leaf/[0.03] p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-brand-leaf text-white text-[10px] font-bold">
                            JA
                          </span>
                          <div>
                            <span className="text-xs font-bold text-foreground">{review.adminReply.authorName}</span>
                            <span className="ml-1.5 rounded-full bg-brand-leaf/10 px-2 py-0.2 text-[10px] font-semibold text-brand-leaf">
                              {review.adminReply.authorRole}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{review.adminReply.repliedAt}</span>
                          <button
                            onClick={() => setReplyingReview(review)}
                            className="text-xs text-brand-leaf hover:underline font-semibold"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed pl-8">
                        {review.adminReply.message}
                      </p>
                    </div>
                  ) : null}

                  {/* Customer Replies Thread (if any) */}
                  {review.customerReplies && review.customerReplies.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                        <MessageSquare className="size-3" />
                        <span>Customer Comments ({review.customerReplies.length})</span>
                      </div>
                      {review.customerReplies.map(rep => (
                        <div key={rep.id} className="rounded-lg bg-muted/50 p-2.5 text-xs">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <strong className="text-foreground">{rep.customerName}</strong>
                            <span className="text-[10px]">{rep.createdAt}</span>
                          </div>
                          <p className="mt-1 text-muted-foreground">{rep.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Card Bottom Actions Toolbar */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="size-3.5 text-brand-leaf" />
                        <strong>{review.helpfulCount}</strong> helpful votes
                      </span>
                      {review.abuseReportsCount > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="size-3.5" />
                          {review.abuseReportsCount} Abuse Flags
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Approve button (if not approved) */}
                      {review.status !== "Approved" && (
                        <button
                          onClick={() => handleApprove(review)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                        >
                          <Check className="size-3.5" />
                          Approve Public
                        </button>
                      )}

                      {/* Reject button (if not rejected) */}
                      {review.status !== "Rejected" && (
                        <button
                          onClick={() => setRejectingReview(review)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                        >
                          <X className="size-3.5" />
                          Reject Review
                        </button>
                      )}

                      {/* Admin Reply button */}
                      <button
                        onClick={() => setReplyingReview(review)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        <MessageSquare className="size-3.5 text-brand-leaf" />
                        {review.adminReply ? "Edit Reply" : "Official Reply"}
                      </button>

                      {/* Pin/Feature toggle */}
                      <button
                        onClick={() => handleToggleFeature(review)}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          review.isFeatured
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                        }`}
                        title="Pin to Storefront Featured Section"
                      >
                        <Pin className="size-3.5" />
                        {review.isFeatured ? "Featured" : "Pin"}
                      </button>

                      {/* Report Abuse Button */}
                      <button
                        onClick={() => setReportingReview(review)}
                        className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-amber-600"
                        title="Flag Abuse / Policy Violation"
                      >
                        <Flag className="size-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"
                        title="Delete Review Permanently"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UGC PHOTO & MEDIA GALLERY */}
      {activeTab === "gallery" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Customer Unboxing & UGC Photos Wall</h3>
                <p className="text-xs text-muted-foreground">
                  Browse authentic unboxing pictures uploaded by verified buyers. Click any photo to preview full resolution and moderate visibility.
                </p>
              </div>
              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                {allUgcImages.length} High-Res Media Assets
              </span>
            </div>
          </div>

          {allUgcImages.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card">
              <ImageIcon className="size-10 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">No customer review photos found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {allUgcImages.map(({ image, review }) => (
                <div
                  key={image.id}
                  onClick={() => setLightboxImage({ image, review })}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={image.url}
                      alt={image.caption || review.productName}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between text-amber-500">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`size-3 ${star <= review.rating ? "fill-current" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                          image.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {image.status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs font-bold text-foreground">{review.productName}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">By {review.customerName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ABUSE SHIELD & QUARANTINE DESK */}
      {activeTab === "abuse" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Abuse Moderation & Quarantine Desk</h3>
                <p className="text-xs text-muted-foreground">
                  Automated profanity filters and customer-flagged reviews quarantined from public storefront display.
                </p>
              </div>
              <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                {reviews.filter(r => r.abuseReportsCount > 0 || r.status === "Rejected").length} Reviews Under Quarantine
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {reviews
              .filter(r => r.abuseReportsCount > 0 || r.status === "Rejected")
              .map(review => (
                <div key={review.id} className="rounded-xl border border-rose-500/30 bg-rose-500/[0.02] p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                          {review.status === "Rejected" ? "Quarantined / Rejected" : "Flagged by Users"}
                        </span>
                        <h4 className="text-sm font-bold text-foreground">{review.productName}</h4>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Customer: <strong className="text-foreground">{review.customerName}</strong> ({review.customerEmail}) • {review.createdAt}
                      </p>
                      <div className="mt-2 text-xs italic text-foreground bg-muted/60 p-2.5 rounded-lg">
                        "{review.comment}"
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await dismissReviewAbuse(review.id);
                            if (res?.success) {
                              toast.success("Abuse flags dismissed. Review restored!");
                              fetchReviews();
                            }
                          } catch (err) {
                            toast.error("Failed to dismiss abuse report");
                          }
                        }}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        Dismiss Flag
                      </button>

                      {review.status !== "Rejected" && (
                        <button
                          onClick={() => setRejectingReview(review)}
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                        >
                          Quarantine
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(review.id)}
                        className="rounded-lg border border-border p-1.5 text-rose-600 hover:bg-rose-500/10"
                        title="Delete Review"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Abuse Reports Breakdown */}
                  {review.abuseReports && review.abuseReports.length > 0 && (
                    <div className="mt-3 border-t border-rose-500/20 pt-3 text-xs space-y-1">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">Reported Reasons:</span>
                      {review.abuseReports.map(ab => (
                        <div key={ab.id} className="flex items-center gap-2 text-muted-foreground">
                          <span>•</span>
                          <strong className="text-foreground">{ab.reason}</strong>
                          <span>reported by {ab.reporterName} on {ab.reportedAt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS & SENTIMENT RADAR */}
      {activeTab === "analytics" && analytics && (
        <div className="space-y-6">
          {/* Top 3 Scorecards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground">Customer Recommendation Score (NPS)</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-brand-leaf">{analytics.recommendationRate}</span>
                <span className="text-xs text-muted-foreground">would recommend Janani Agro</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Calculated across all 5-star & 4-star verified customer feedback.</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground">Verified Purchase Authenticity</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.verifiedPurchaseRate}</span>
                <span className="text-xs text-muted-foreground">of reviews from verified buyers</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">100% matched against real fulfilled order IDs.</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground">Merchant Response Quality</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{analytics.merchantResponseRate}</span>
                <span className="text-xs text-muted-foreground">inquiries answered</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Average resolution time: 4 hours 12 minutes.</p>
            </div>
          </div>

          {/* Star Distribution & Sentiment Radar Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Star Rating Breakdown Bar Charts */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground">Rating Distribution Spectrum</h3>
              <p className="mt-1 text-xs text-muted-foreground">Cumulative breakdown across all product ratings</p>

              <div className="mt-5 space-y-3">
                {analytics.starBreakdown.map(item => (
                  <div key={item.stars} className="flex items-center gap-3 text-xs">
                    <span className="flex w-14 items-center gap-1 font-bold text-foreground">
                      {item.stars} <Star className="size-3.5 fill-amber-500 text-amber-500" />
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-semibold text-muted-foreground">{item.percentage}%</span>
                    <span className="w-8 text-right text-muted-foreground font-medium">({item.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment Radar & Keyword Tags */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground">Customer Sentiment Radar</h3>
              <p className="mt-1 text-xs text-muted-foreground">AI NLP analysis of review comments and keywords</p>

              <div className="mt-5 flex items-center justify-around rounded-xl bg-muted/40 p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.sentiment.positive}%</div>
                  <span className="text-xs font-semibold text-muted-foreground">Positive</span>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{analytics.sentiment.neutral}%</div>
                  <span className="text-xs font-semibold text-muted-foreground">Neutral</span>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{analytics.sentiment.critical}%</div>
                  <span className="text-xs font-semibold text-muted-foreground">Critical</span>
                </div>
              </div>

              <div className="mt-5">
                <span className="text-xs font-bold text-foreground">Top Mentioned Keywords:</span>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {analytics.sentiment.topKeywords.map(kw => (
                    <span
                      key={kw.keyword}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        kw.sentiment === "positive"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : kw.sentiment === "neutral"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {kw.keyword}
                      <span className="rounded-full bg-background px-1.5 py-0.2 text-[10px] font-bold">
                        {kw.count}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Reviewed Products Leaderboard */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-bold text-foreground">Top-Rated Products Performance</h3>
            <p className="mt-1 text-xs text-muted-foreground">Products with highest verified customer satisfaction and volume</p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                    <th className="p-3 font-semibold">Product Name</th>
                    <th className="p-3 font-semibold">Total Reviews</th>
                    <th className="p-3 font-semibold">Average Star Rating</th>
                    <th className="p-3 font-semibold">Recommendation Rate</th>
                    <th className="p-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {analytics.topProducts.map(prod => (
                    <tr key={prod.name} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-bold text-foreground">{prod.name}</td>
                      <td className="p-3 text-muted-foreground">{prod.reviewsCount} reviews</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 font-bold text-amber-500">
                          <Star className="size-3.5 fill-current" />
                          <span>{prod.averageRating}</span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-brand-leaf">{prod.recommendationRate}</td>
                      <td className="p-3 text-right">
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Top Seller
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Admin Reply Composer Modal */}
      {replyingReview && (
        <AdminReplyModal
          review={replyingReview}
          onClose={() => setReplyingReview(null)}
          onSuccess={() => {
            setReplyingReview(null);
            fetchReviews();
          }}
        />
      )}

      {/* MODAL 2: Reject Review Reason Modal */}
      {rejectingReview && (
        <RejectReviewModal
          review={rejectingReview}
          onClose={() => setRejectingReview(null)}
          onSuccess={() => {
            setRejectingReview(null);
            fetchReviews();
          }}
        />
      )}

      {/* MODAL 3: Report Abuse Modal */}
      {reportingReview && (
        <ReportAbuseModal
          review={reportingReview}
          onClose={() => setReportingReview(null)}
          onSuccess={() => {
            setReportingReview(null);
            fetchReviews();
          }}
        />
      )}

      {/* MODAL 4: High-Res Image Lightbox Modal */}
      {lightboxImage && (
        <ImageLightboxModal
          image={lightboxImage.image}
          review={lightboxImage.review}
          onClose={() => setLightboxImage(null)}
          onToggleStatus={async () => {
            try {
              const res = await toggleReviewImageStatus(lightboxImage.review.id, lightboxImage.image.id);
              if (res?.success) {
                toast.success(res.message);
                setLightboxImage(null);
                fetchReviews();
              }
            } catch (err) {
              toast.error("Failed to toggle image status");
            }
          }}
        />
      )}

      {/* MODAL 5: Create Review Modal */}
      {isCreateModalOpen && (
        <CreateReviewModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchReviews();
          }}
        />
      )}

      {/* DRAWER: 360° Review Inspector Drawer */}
      {inspectingReview && (
        <ReviewInspectorDrawer
          review={inspectingReview}
          onClose={() => setInspectingReview(null)}
          onApprove={() => {
            handleApprove(inspectingReview);
            setInspectingReview(null);
          }}
          onReject={() => {
            setRejectingReview(inspectingReview);
            setInspectingReview(null);
          }}
          onReply={() => {
            setReplyingReview(inspectingReview);
            setInspectingReview(null);
          }}
          onDelete={() => {
            handleDelete(inspectingReview.id);
            setInspectingReview(null);
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// MODAL COMPONENTS
// ==========================================

function AdminReplyModal({
  review,
  onClose,
  onSuccess
}: {
  review: AdminReview;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [authorName, setAuthorName] = useState(review.adminReply?.authorName || "Doddi Sai Rama");
  const [authorRole, setAuthorRole] = useState(review.adminReply?.authorRole || "Quality & Founder");
  const [message, setMessage] = useState(review.adminReply?.message || "");
  const [saving, setSaving] = useState(false);

  const templates = [
    { label: "Thank You 5★", text: "Dear " + review.customerName + ", thank you so much for your heartwarming feedback! We are thrilled that you loved the authentic purity of our " + review.productName + ". Happy cooking!" },
    { label: "Quality Assurance", text: "Hi " + review.customerName + ", thank you for your review! We take pride in 100% natural, chemical-free processing directly from verified organic farms. Feel free to contact us anytime." },
    { label: "Transit Apology", text: "Dear " + review.customerName + ", we sincerely apologize for the inconvenience with your delivery package. Our customer care team will reach out immediately to resolve this for you." }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Reply message cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const res = await addAdminReply(review.id, {
        authorName,
        authorRole,
        message
      });
      if (res?.success) {
        toast.success("Merchant official reply published successfully!");
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to publish reply");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-leaf/10 text-brand-leaf">
              <MessageSquare className="size-4" />
            </span>
            <h2 className="text-base font-bold text-foreground">Official Merchant Response</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        {/* Review Snippet */}
        <div className="mt-4 rounded-xl bg-muted/40 p-3 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <strong className="text-foreground">{review.customerName}</strong>
            <span className="text-amber-500 font-bold">{review.rating} ★</span>
          </div>
          <p className="mt-1 line-clamp-2 text-muted-foreground italic">"{review.comment}"</p>
        </div>

        {/* Quick Canned Templates */}
        <div className="mt-3.5">
          <span className="text-[11px] font-semibold text-muted-foreground">Quick Response Templates:</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {templates.map(tpl => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => setMessage(tpl.text)}
                className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:border-brand-leaf hover:bg-brand-leaf/5"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Responder Name</label>
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-brand-leaf focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Official Title / Role</label>
              <input
                type="text"
                value={authorRole}
                onChange={e => setAuthorRole(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-brand-leaf focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Merchant Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write a polite, professional reply to the customer..."
              className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground focus:border-brand-leaf focus:outline-none leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-leaf px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-leaf/90 disabled:opacity-50"
            >
              <Send className="size-3.5" />
              {saving ? "Publishing..." : "Publish Official Reply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RejectReviewModal({
  review,
  onClose,
  onSuccess
}: {
  review: AdminReview;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("Competitor Spam / Promotion");
  const [customReason, setCustomReason] = useState("");
  const [saving, setSaving] = useState(false);

  const reasons = [
    "Competitor Spam / Promotion",
    "Contains Profanity / Offensive Language",
    "Fake / Unverified Accusations without purchase proof",
    "Irrelevant / Courier Issue / Off-topic Content",
    "Personal / Sensitive Data Exposure",
    "Other / Custom Policy Violation"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === "Other / Custom Policy Violation" ? customReason : reason;

    if (!finalReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setSaving(true);
    try {
      const res = await updateAdminReviewStatus(review.id, "Rejected", finalReason);
      if (res?.success) {
        toast.success(`Review ${review.id} rejected and quarantined from public view.`);
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to reject review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-rose-600">
            <XCircle className="size-5" />
            <h2 className="text-base font-bold text-foreground">Reject & Quarantine Review</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Rejecting review <strong className="text-foreground">{review.id}</strong> by <strong>{review.customerName}</strong> will immediately unpublish it from the storefront and move it to the moderation quarantine desk.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground">Disqualification Reason</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-rose-500 focus:outline-none"
            >
              {reasons.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {reason === "Other / Custom Policy Violation" && (
            <div>
              <label className="text-xs font-semibold text-foreground">Specify Custom Reason</label>
              <textarea
                rows={3}
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="Enter exact reason for rejection..."
                className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground focus:border-rose-500 focus:outline-none"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
            >
              {saving ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReportAbuseModal({
  review,
  onClose,
  onSuccess
}: {
  review: AdminReview;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("Spam / Promotion");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await reportReviewAbuse(review.id, {
        reporterName: "Admin Moderator",
        reason
      });
      if (res?.success) {
        toast.success(`Review ${review.id} flagged for ${reason}.`);
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to flag review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-amber-500">
            <Flag className="size-5" />
            <h2 className="text-base font-bold text-foreground">Flag Review for Policy Abuse</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground">Violation Category</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-amber-500 focus:outline-none"
            >
              <option value="Spam / Promotion">Spam / Commercial Links</option>
              <option value="Profanity / Offensive">Profanity / Hate Speech / Harassment</option>
              <option value="Fake / Inaccurate">Fake / Coordinated Attack</option>
              <option value="Irrelevant / Off-topic">Irrelevant / Courier Transit Issue</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? "Flagging..." : "Confirm Abuse Flag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImageLightboxModal({
  image,
  review,
  onClose,
  onToggleStatus
}: {
  image: ReviewImage;
  review: AdminReview;
  onClose: () => void;
  onToggleStatus: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative max-w-2xl w-full rounded-2xl overflow-hidden bg-card border border-border shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 p-3.5">
          <div>
            <h3 className="text-xs font-bold text-foreground">{review.productName}</h3>
            <p className="text-[11px] text-muted-foreground">Uploaded by {review.customerName} • {review.rating} ★</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-hidden bg-black flex items-center justify-center">
          <img src={image.url} alt={image.caption || "Customer UGC photo"} className="max-h-[60vh] max-w-full object-contain" />
        </div>

        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card border-t border-border">
          <div className="text-xs">
            <span className="font-semibold text-muted-foreground">Caption: </span>
            <span className="text-foreground">{image.caption || "No caption provided"}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleStatus}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                image.status === "Approved"
                  ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {image.status === "Approved" ? "Hide from Storefront" : "Approve Photo"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateReviewModal({
  onClose,
  onSuccess
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [productName, setProductName] = useState("Organic Basmati Rice (1 kg)");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !title || !comment) {
      toast.error("Please fill in all required review fields");
      return;
    }

    setSaving(true);
    try {
      const res = await createAdminReview({
        productName,
        customerName,
        customerEmail,
        rating,
        title,
        comment,
        verifiedPurchase: true
      });
      if (res?.success) {
        toast.success("Review recorded and published successfully!");
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to add review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-leaf/10 text-brand-leaf">
              <Plus className="size-4" />
            </span>
            <h2 className="text-base font-bold text-foreground">Add Verified Customer Review</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-foreground">Select Product</label>
            <select
              value={productName}
              onChange={e => setProductName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-brand-leaf focus:outline-none"
            >
              <option value="Organic Basmati Rice (1 kg)">Organic Basmati Rice (1 kg)</option>
              <option value="Wood-Pressed Groundnut Oil (1 L)">Wood-Pressed Groundnut Oil (1 L)</option>
              <option value="Lakadong Turmeric Powder (200 g)">Lakadong Turmeric Powder (200 g)</option>
              <option value="Virgin Coconut Oil (500 ml)">Virgin Coconut Oil (500 ml)</option>
              <option value="Unpolished Toor Dal (500 g)">Unpolished Toor Dal (500 g)</option>
              <option value="Black Pepper Whole (150 g)">Black Pepper Whole (150 g)</option>
              <option value="Natural Jaggery Powder (500 g)">Natural Jaggery Powder (500 g)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Babu"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-brand-leaf focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Customer Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-brand-leaf focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Star Rating</label>
            <div className="mt-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`size-8 rounded-lg flex items-center justify-center border text-sm font-bold transition-all ${
                    star <= rating
                      ? "border-amber-500 bg-amber-500/10 text-amber-500"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Star className={`size-4 ${star <= rating ? "fill-current" : ""}`} />
                </button>
              ))}
              <span className="text-xs font-bold text-foreground ml-2">{rating}.0 Stars</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Review Headline / Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Pristine aroma and exceptional quality!"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-brand-leaf focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Review Body / Comments *</label>
            <textarea
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Detailed customer experience review..."
              className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground focus:border-brand-leaf focus:outline-none leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-leaf px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-leaf/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviewInspectorDrawer({
  review,
  onClose,
  onApprove,
  onReject,
  onReply,
  onDelete
}: {
  review: AdminReview;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onReply: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md h-full bg-card border-l border-border shadow-2xl p-6 overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-leaf/10 text-brand-leaf">
              <Eye className="size-4" />
            </span>
            <h2 className="text-base font-bold text-foreground">360° Review Inspector</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        {/* Customer Profile & Trust Badge */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <img
              src={review.customerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
              alt={review.customerName}
              className="size-12 rounded-full object-cover border border-border"
            />
            <div>
              <h3 className="text-sm font-bold text-foreground">{review.customerName}</h3>
              <p className="text-xs text-muted-foreground">{review.customerEmail}</p>
              <div className="mt-1 flex items-center gap-2">
                {review.verifiedPurchase ? (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                    ✓ Verified Customer
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    Guest Review
                  </span>
                )}
                {review.orderId && (
                  <span className="text-[11px] text-muted-foreground">Order: {review.orderId}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div>
          <span className="text-xs font-semibold text-muted-foreground">Associated Product:</span>
          <div className="mt-1.5 flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <h4 className="text-xs font-bold text-foreground">{review.productName}</h4>
              <p className="text-[11px] text-brand-leaf font-medium">{review.productCategory}</p>
            </div>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
              <Star className="size-3.5 fill-current" />
              <span>{review.rating}.0</span>
            </div>
          </div>
        </div>

        {/* Review Title & Body */}
        <div>
          <span className="text-xs font-semibold text-muted-foreground">Review Content:</span>
          <div className="mt-1.5 rounded-xl border border-border bg-card p-4 space-y-2">
            <h4 className="text-sm font-bold text-foreground">{review.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-2">
              <span>Submitted: {review.createdAt}</span>
              <span>Helpful Votes: {review.helpfulCount}</span>
            </div>
          </div>
        </div>

        {/* Photos (if any) */}
        {review.images && review.images.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Attached Photos ({review.images.length}):</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {review.images.map(img => (
                <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border border-border">
                  <img src={img.url} alt="" className="size-full object-cover" />
                  <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white">
                    {img.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons in Drawer */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-2">
            {review.status !== "Approved" && (
              <button
                onClick={onApprove}
                className="w-full rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Approve Review
              </button>
            )}
            {review.status !== "Rejected" && (
              <button
                onClick={onReject}
                className="w-full rounded-lg border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/20"
              >
                Reject Review
              </button>
            )}
          </div>
          <button
            onClick={onReply}
            className="w-full rounded-lg border border-border bg-card py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            {review.adminReply ? "Edit Merchant Reply" : "Post Merchant Reply"}
          </button>
          <button
            onClick={onDelete}
            className="w-full rounded-lg border border-rose-500/20 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/10"
          >
            Delete Review Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
