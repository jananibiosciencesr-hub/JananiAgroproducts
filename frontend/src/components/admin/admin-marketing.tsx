import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Mail,
  MessageSquare,
  Bell,
  Sparkles,
  Users,
  Clock,
  Send,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Tag,
  Copy,
  Check,
  X,
  Calendar,
  DollarSign,
  Smartphone,
  Globe,
  Radio,
  FileText,
  Sliders,
  ChevronRight,
  Play,
  Pause,
  RefreshCw,
  Gift
} from "lucide-react";
import { toast } from "sonner";
import {
  getMarketingOverview,
  getMarketingCampaigns,
  getMarketingCampaignById,
  createMarketingCampaign,
  updateMarketingCampaign,
  deleteMarketingCampaign,
  triggerMarketingCampaignSend,
  toggleMarketingCampaignStatus,
  getAudienceSegments,
  createAudienceSegment,
  getNotificationHistory,
  getMarketingAnalytics,
  type MarketingCampaign,
  type AudienceSegment,
  type NotificationHistoryItem,
  type MarketingOverviewData,
  type MarketingAnalyticsData
} from "@/lib/api";

export function MarketingManagement() {
  const [activeTab, setActiveTab] = useState<"all" | "email" | "sms" | "push" | "announcements" | "segments" | "history">("all");
  const [loading, setLoading] = useState(true);

  // Core Data States
  const [overview, setOverview] = useState<MarketingOverviewData | null>(null);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [analytics, setAnalytics] = useState<MarketingAnalyticsData | null>(null);

  // Filters & Search
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);
  const [selectedCampaignForDetails, setSelectedCampaignForDetails] = useState<MarketingCampaign | null>(null);
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Load all marketing data
  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewData, campaignsData, segmentsData, historyData, analyticsData] = await Promise.all([
        getMarketingOverview(),
        getMarketingCampaigns(),
        getAudienceSegments(),
        getNotificationHistory(),
        getMarketingAnalytics()
      ]);

      setOverview(overviewData);
      setCampaigns(campaignsData.data || []);
      setSegments(segmentsData || []);
      setHistory(historyData.data || []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Error loading marketing data:", err);
      toast.error("Failed to load marketing dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ----------------------------------------------------
  // CAMPAIGN ACTIONS
  // ----------------------------------------------------
  const handleTriggerSend = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to broadcast "${name}" to its target audience now?`)) return;
    try {
      const res = await triggerMarketingCampaignSend(id);
      if (res?.success && res.data) {
        setCampaigns(prev => prev.map(c => (c.id === id ? res.data : c)));
        toast.success(`Campaign "${name}" broadcasted successfully!`);
        // Refresh history
        const hRes = await getNotificationHistory();
        setHistory(hRes.data || []);
      }
    } catch {
      toast.error("Failed to broadcast campaign.");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await toggleMarketingCampaignStatus(id);
      if (res?.success && res.data) {
        setCampaigns(prev => prev.map(c => (c.id === id ? res.data : c)));
        toast.success(`Campaign status changed to ${res.data.status}`);
      }
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!confirm(`Delete campaign "${name}" permanently?`)) return;
    try {
      const res = await deleteMarketingCampaign(id);
      if (res?.success) {
        setCampaigns(prev => prev.filter(c => c.id !== id));
        toast.success("Campaign deleted.");
      }
    } catch {
      toast.error("Failed to delete campaign.");
    }
  };

  const handleSaveCampaignModal = async (payload: Partial<MarketingCampaign> & { sendNow?: boolean }) => {
    try {
      if (editingCampaign) {
        const res = await updateMarketingCampaign(editingCampaign.id, payload);
        if (res?.success && res.data) {
          setCampaigns(prev => prev.map(c => (c.id === editingCampaign.id ? res.data : c)));
          toast.success("Campaign updated successfully!");
          setIsBuilderOpen(false);
          setEditingCampaign(null);
        }
      } else {
        const res = await createMarketingCampaign(payload);
        if (res?.success && res.data) {
          setCampaigns(prev => [res.data, ...prev]);
          toast.success(payload.sendNow ? "Campaign created and broadcasted!" : "Campaign created!");
          setIsBuilderOpen(false);
          // Refresh overview & history
          loadData();
        }
      }
    } catch {
      toast.error("Failed to save campaign.");
    }
  };

  const handleCreateSegment = async (payload: { name: string; description?: string; criteria: string; estimatedCount?: number }) => {
    try {
      const res = await createAudienceSegment(payload);
      if (res?.success && res.data) {
        setSegments(prev => [...prev, res.data]);
        toast.success(`Segment "${payload.name}" created!`);
        setIsSegmentModalOpen(false);
      }
    } catch {
      toast.error("Failed to create segment.");
    }
  };

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const matchChannel =
      activeTab === "email" ? c.channel === "email" :
      activeTab === "sms" ? c.channel === "sms" :
      activeTab === "push" ? c.channel === "push" :
      activeTab === "announcements" ? c.channel === "announcement_banner" :
      channelFilter === "all" || c.channel === channelFilter;

    const matchType = typeFilter === "all" || c.type === typeFilter;
    const matchStatus = statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.subject && c.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.couponCode && c.couponCode.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchChannel && matchType && matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium animate-pulse">Loading Marketing & Omnichannel Automation Hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Top Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-900 p-6 rounded-2xl text-white shadow-xl border border-emerald-800/40">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Marketing & Omnichannel Studio</h1>
              <p className="text-sm text-emerald-300/80 mt-0.5">
                Klaviyo + Brevo + OneSignal standard • Launch targeted Email, SMS, Web Push, and Storefront Announcement Banners.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-medium text-sm transition-all shadow-sm"
          >
            <Radio className="w-4 h-4" />
            Test Broadcast QA
          </button>
          <button
            onClick={() => {
              setEditingCampaign(null);
              setIsBuilderOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-emerald-500/25"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* 2. 6 KPI Ribbon Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Reach</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {overview?.totalRecipients ? overview.totalRecipients.toLocaleString() : "48,920"}
            </span>
            <span className="text-xs text-zinc-500 ml-1.5">Contacts</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Email Open Rate</span>
            <Mail className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{overview?.avgEmailOpenRate || 40.9}%</span>
            <span className="text-xs text-emerald-600 font-semibold ml-1.5">+6.2% vs avg</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>SMS Delivery</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{overview?.avgSmsDeliveryRate || 97.8}%</span>
            <span className="text-xs text-zinc-500 ml-1.5">DLT Verified</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Push CTR</span>
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{overview?.avgPushCtr || 14.2}%</span>
            <span className="text-xs text-zinc-500 ml-1.5">Click rate</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Attributed Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{(overview?.totalRevenue || 974200).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Scheduled Drops</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{overview?.scheduledDrops || 1}</span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold ml-1.5">Queued</span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "all"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          All Campaigns ({campaigns.length})
        </button>

        <button
          onClick={() => setActiveTab("email")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "email"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Mail className="w-4 h-4" />
          Email Studio ({campaigns.filter(c => c.channel === "email").length})
        </button>

        <button
          onClick={() => setActiveTab("sms")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "sms"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          SMS & WhatsApp ({campaigns.filter(c => c.channel === "sms" || c.channel === "whatsapp").length})
        </button>

        <button
          onClick={() => setActiveTab("push")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "push"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Bell className="w-4 h-4" />
          Push Notifications ({campaigns.filter(c => c.channel === "push").length})
        </button>

        <button
          onClick={() => setActiveTab("announcements")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "announcements"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Globe className="w-4 h-4" />
          Announcement Banners ({campaigns.filter(c => c.channel === "announcement_banner").length})
        </button>

        <button
          onClick={() => setActiveTab("segments")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "segments"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Audience Segments ({segments.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "history"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          Notification History ({history.length})
        </button>
      </div>

      {/* 4. Filter & Search Controls (for campaign tabs) */}
      {activeTab !== "segments" && activeTab !== "history" && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search campaigns by name, subject or coupon..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "all" && (
              <select
                value={channelFilter}
                onChange={e => setChannelFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300"
              >
                <option value="all">All Channels</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
                <option value="announcement_banner">Announcement Banner</option>
              </select>
            )}

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300"
            >
              <option value="all">All Campaign Types</option>
              <option value="festival">Festival Specials</option>
              <option value="offer">Flash Offers</option>
              <option value="coupon">Coupon Highlights</option>
              <option value="newsletter">Newsletters</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300"
            >
              <option value="all">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      )}

      {/* 5. CAMPAIGN CARDS LIST (all, email, sms, push, announcements) */}
      {activeTab !== "segments" && activeTab !== "history" && (
        <div className="space-y-4">
          {filteredCampaigns.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-3">
              <Megaphone className="w-10 h-10 text-zinc-400 mx-auto opacity-50" />
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No campaigns found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No marketing campaigns match your current filters. Create a new campaign to start driving organic orders.
              </p>
              <button
                onClick={() => {
                  setEditingCampaign(null);
                  setIsBuilderOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-500 shadow-sm mt-2"
              >
                <Plus className="w-4 h-4" /> Create Campaign
              </button>
            </div>
          ) : (
            filteredCampaigns.map(camp => (
              <div
                key={camp.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left: Campaign Info */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Channel Badge */}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      camp.channel === "email" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400" :
                      camp.channel === "sms" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400" :
                      camp.channel === "push" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400" :
                      "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400"
                    }`}>
                      {camp.channel === "email" && <Mail className="w-3.5 h-3.5" />}
                      {camp.channel === "sms" && <MessageSquare className="w-3.5 h-3.5" />}
                      {camp.channel === "push" && <Bell className="w-3.5 h-3.5" />}
                      {camp.channel === "announcement_banner" && <Globe className="w-3.5 h-3.5" />}
                      {camp.channel.replace("_", " ")}
                    </span>

                    {/* Campaign Type */}
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 capitalize">
                      {camp.type} Campaign
                    </span>

                    {/* Status Pill */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      camp.status === "Sent" || camp.status === "Active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400" :
                      camp.status === "Scheduled" ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400" :
                      camp.status === "Paused" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400" :
                      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {camp.status}
                    </span>

                    {camp.couponCode && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {camp.couponCode}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{camp.name}</h3>
                    {camp.subject && camp.subject !== camp.name && (
                      <p className="text-xs text-zinc-500 mt-0.5 font-medium">Subject: "{camp.subject}"</p>
                    )}
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">{camp.messageBody}</p>
                  </div>

                  {/* Target Segment & Timestamp */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                      <Users className="w-3.5 h-3.5" />
                      {camp.targetSegmentName} ({camp.targetAudienceCount.toLocaleString()} users)
                    </span>
                    <span>•</span>
                    {camp.scheduledAt && camp.status === "Scheduled" ? (
                      <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        Scheduled: {new Date(camp.scheduledAt).toLocaleString()}
                      </span>
                    ) : camp.sentAt ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Sent: {new Date(camp.sentAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span>Draft</span>
                    )}
                  </div>
                </div>

                {/* Middle: Performance Metrics (if sent/active) */}
                {(camp.status === "Sent" || camp.status === "Active") && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center shrink-0">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Delivered</span>
                      <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                        {camp.stats.delivered.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-zinc-500">{camp.stats.deliveryRate}%</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Opened</span>
                      <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                        {camp.stats.opened.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-bold">{camp.stats.openRate}%</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Orders</span>
                      <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                        {camp.stats.conversions}
                      </p>
                      <span className="text-[10px] text-zinc-500">{camp.stats.clickRate}% CTR</span>
                    </div>

                    <div className="col-span-3 sm:col-span-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200 dark:border-zinc-700">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Revenue</span>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ₹{camp.stats.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
                  {camp.status === "Draft" && (
                    <button
                      onClick={() => handleTriggerSend(camp.id, camp.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Broadcast Now
                    </button>
                  )}

                  {camp.channel === "announcement_banner" && (
                    <button
                      onClick={() => handleToggleStatus(camp.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        camp.status === "Active"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                      }`}
                    >
                      {camp.status === "Active" ? "Pause Banner" : "Activate Banner"}
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedCampaignForDetails(camp)}
                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                    title="View Analytics & Logs"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingCampaign(camp);
                      setIsBuilderOpen(true);
                    }}
                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                    title="Edit Campaign"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 6. TAB: AUDIENCE SEGMENTATION */}
      {activeTab === "segments" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Audience Segmentation & Behavioral Cohorts
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Target precision campaigns based on purchase frequency, lifetime value, and organic category affinity.
              </p>
            </div>
            <button
              onClick={() => setIsSegmentModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Custom Cohort
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map(seg => (
              <div
                key={seg.id}
                className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono">
                      {seg.id}
                    </span>
                    {seg.growthRate && (
                      <span className={`text-xs font-semibold ${seg.growthRate.startsWith("+") ? "text-emerald-600" : "text-rose-600"}`}>
                        {seg.growthRate} 30d
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-2">{seg.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{seg.description}</p>

                  <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Segmentation Rule</span>
                    <p className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">{seg.criteria}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400">Total Subscribers</span>
                    <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">{seg.count.toLocaleString()}</p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingCampaign({
                        id: "",
                        name: `Campaign for ${seg.name}`,
                        channel: "email",
                        type: "offer",
                        subject: "",
                        messageBody: "",
                        targetSegmentId: seg.id,
                        targetSegmentName: seg.name,
                        targetAudienceCount: seg.count,
                        status: "Draft",
                        stats: { recipients: seg.count, delivered: 0, deliveryRate: 0, opened: 0, openRate: 0, clicked: 0, clickRate: 0, conversions: 0, revenue: 0 },
                        createdAt: new Date().toISOString()
                      });
                      setIsBuilderOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Launch Drop
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB: NOTIFICATION HISTORY & AUDIT LOGS */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Notification Delivery History & Audit Logs
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Real-time delivery confirmation logs, gateway provider responses, and attributed order values.
              </p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-xl transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Logs
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Log ID</th>
                    <th className="py-3 px-4">Campaign Name</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Target Cohort</th>
                    <th className="py-3 px-4">Recipients</th>
                    <th className="py-3 px-4">Open Rate</th>
                    <th className="py-3 px-4">Attributed Sales</th>
                    <th className="py-3 px-4">Gateway Provider</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {history.map(item => (
                    <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-700 dark:text-zinc-300">{item.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{item.campaignName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {item.channel.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">{item.segment}</td>
                      <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">{item.recipients.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{item.openRate}%</td>
                      <td className="py-3.5 px-4 font-black text-emerald-700 dark:text-emerald-300">
                        {item.revenue > 0 ? `₹${item.revenue.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500">{item.providerStatus}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === "Delivered" || item.status === "Active"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400"
                        }`}>
                          {item.status}
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

      {/* 8. MODAL: CAMPAIGN BUILDER & SCHEDULER */}
      {isBuilderOpen && (
        <CampaignBuilderModal
          campaign={editingCampaign}
          segments={segments}
          onClose={() => {
            setIsBuilderOpen(false);
            setEditingCampaign(null);
          }}
          onSave={handleSaveCampaignModal}
        />
      )}

      {/* 9. DRAWER: CAMPAIGN DETAILS & ANALYTICS */}
      {selectedCampaignForDetails && (
        <CampaignDetailsDrawer
          campaign={selectedCampaignForDetails}
          onClose={() => setSelectedCampaignForDetails(null)}
        />
      )}

      {/* 10. MODAL: SEGMENT BUILDER */}
      {isSegmentModalOpen && (
        <SegmentBuilderModal
          onClose={() => setIsSegmentModalOpen(false)}
          onSave={handleCreateSegment}
        />
      )}

      {/* 11. MODAL: TEST BROADCAST QA */}
      {isTestModalOpen && (
        <TestBroadcastModal
          onClose={() => setIsTestModalOpen(false)}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// CAMPAIGN BUILDER MODAL
// ----------------------------------------------------
function CampaignBuilderModal({
  campaign,
  segments,
  onClose,
  onSave
}: {
  campaign: MarketingCampaign | null;
  segments: AudienceSegment[];
  onClose: () => void;
  onSave: (data: Partial<MarketingCampaign> & { sendNow?: boolean }) => void;
}) {
  const [formData, setFormData] = useState<Partial<MarketingCampaign>>({
    name: campaign?.name || "",
    channel: campaign?.channel || "email",
    type: campaign?.type || "festival",
    subject: campaign?.subject || "",
    previewText: campaign?.previewText || "",
    messageBody: campaign?.messageBody || "",
    targetSegmentId: campaign?.targetSegmentId || (segments[0]?.id || "seg_all"),
    couponCode: campaign?.couponCode || "",
    ctaLabel: campaign?.ctaLabel || "Shop Organic Specials",
    ctaUrl: campaign?.ctaUrl || "/products",
    scheduledAt: campaign?.scheduledAt ? campaign.scheduledAt.slice(0, 16) : "",
    bannerStyle: campaign?.bannerStyle || { backgroundColor: "#1b4332", textColor: "#ffffff" }
  });

  const [sendImmediately, setSendImmediately] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            {campaign?.id ? "Edit Campaign" : "Create Omnichannel Marketing Campaign"}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (!formData.name || !formData.messageBody) {
              toast.error("Please enter a campaign name and message body.");
              return;
            }
            onSave({
              ...formData,
              sendNow: sendImmediately
            });
          }}
          className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Campaign Name *</label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Diwali Harvest Special 25% OFF Drop"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Marketing Channel *</label>
              <select
                value={formData.channel}
                onChange={e => setFormData({ ...formData, channel: e.target.value as any })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="email">📧 Email Newsletter</option>
                <option value="sms">📱 SMS Drop (DLT Verified)</option>
                <option value="push">🔔 Web & Mobile Push</option>
                <option value="announcement_banner">🌐 Storefront Announcement Banner</option>
                <option value="whatsapp">💬 WhatsApp Business Broadcast</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Campaign Type *</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="festival">✨ Festival Special</option>
                <option value="offer">🔥 Flash Offer</option>
                <option value="coupon">🎟️ Coupon Highlight</option>
                <option value="newsletter">📰 General Newsletter</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Target Audience Segment *</label>
              <select
                value={formData.targetSegmentId}
                onChange={e => setFormData({ ...formData, targetSegmentId: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {segments.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.count.toLocaleString()} contacts)
                  </option>
                ))}
              </select>
            </div>

            {formData.channel !== "sms" && (
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Subject Line / Push Title</label>
                <input
                  type="text"
                  value={formData.subject || ""}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. ✨ Celebrate with 25% OFF on Cold Pressed Oils!"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Message Content Body *</label>
                <span className="text-[11px] text-zinc-400">
                  {formData.messageBody?.length || 0} characters {formData.channel === "sms" ? `(~${Math.ceil((formData.messageBody?.length || 0) / 160)} SMS parts)` : ""}
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={formData.messageBody || ""}
                onChange={e => setFormData({ ...formData, messageBody: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                placeholder="Hi {CustomerName}, enjoy pure harvest specials with code {CouponCode}..."
              />
              <p className="text-[11px] text-zinc-400 mt-1">Available placeholders: <code className="text-emerald-600 font-bold">{`{CustomerName}`}</code>, <code className="text-emerald-600 font-bold">{`{CouponCode}`}</code></p>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Attach Coupon Code</label>
              <input
                type="text"
                value={formData.couponCode || ""}
                onChange={e => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold"
                placeholder="e.g. DIWALI25"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">CTA Button Label</label>
              <input
                type="text"
                value={formData.ctaLabel || ""}
                onChange={e => setFormData({ ...formData, ctaLabel: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Shop Organic"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Schedule Future Delivery (Optional)</label>
              <input
                type="datetime-local"
                value={formData.scheduledAt || ""}
                onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Broadcast Immediately upon saving</p>
                <p className="text-[11px] text-zinc-500">Dispatch this drop immediately to the selected audience segment.</p>
              </div>
              <input
                type="checkbox"
                checked={sendImmediately}
                onChange={e => setSendImmediately(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
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
              {sendImmediately ? "Launch & Broadcast Now" : "Save Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// CAMPAIGN DETAILS DRAWER
// ----------------------------------------------------
function CampaignDetailsDrawer({
  campaign,
  onClose
}: {
  campaign: MarketingCampaign;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase font-mono">{campaign.id}</span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{campaign.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campaign Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <span className="text-zinc-400 block font-semibold">Channel</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase mt-0.5 block">{campaign.channel}</span>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <span className="text-zinc-400 block font-semibold">Campaign Type</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 capitalize mt-0.5 block">{campaign.type}</span>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <span className="text-zinc-400 block font-semibold">Target Segment</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 block truncate">{campaign.targetSegmentName}</span>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <span className="text-zinc-400 block font-semibold">Coupon Code</span>
            <span className="font-bold font-mono text-emerald-600 mt-0.5 block">{campaign.couponCode || "None"}</span>
          </div>
        </div>

        {/* Performance Gauges */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Conversion & Performance Funnel</h4>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl space-y-3 border border-zinc-100 dark:border-zinc-700/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-400">Total Targeted Recipients</span>
              <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{campaign.stats.recipients.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-400">Delivered Successfully</span>
              <span className="font-extrabold text-emerald-600">{campaign.stats.delivered.toLocaleString()} ({campaign.stats.deliveryRate}%)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-400">Opened / Read</span>
              <span className="font-extrabold text-blue-600">{campaign.stats.opened.toLocaleString()} ({campaign.stats.openRate}%)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-400">Link Clicks & Engagements</span>
              <span className="font-extrabold text-amber-600">{campaign.stats.clicked.toLocaleString()} ({campaign.stats.clickRate}%)</span>
            </div>
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-sm">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Attributed Store Sales</span>
              <span className="font-black text-emerald-600">₹{campaign.stats.revenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Message Creative Preview */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Message Creative Preview</h4>
          <div className="p-4 bg-zinc-900 text-white rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed border border-zinc-800">
            {campaign.messageBody}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SEGMENT BUILDER MODAL
// ----------------------------------------------------
function SegmentBuilderModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (data: { name: string; description?: string; criteria: string; estimatedCount?: number }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState("Lifetime Spend > ₹3000 and Orders >= 2");
  const [estimatedCount, setEstimatedCount] = useState(1500);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Create Customer Segment
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (!name || !criteria) {
              toast.error("Please fill in segment name and criteria.");
              return;
            }
            onSave({ name, description, criteria, estimatedCount });
          }}
          className="space-y-3.5"
        >
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Cohort Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              placeholder="e.g. Cold Pressed Oil Loyalists"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              placeholder="e.g. Customers who purchased 5L tins in last 90 days"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Rule Logic *</label>
            <input
              type="text"
              required
              value={criteria}
              onChange={e => setCriteria(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Estimated Subscribers</label>
            <input
              type="number"
              value={estimatedCount}
              onChange={e => setEstimatedCount(Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            />
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
            >
              Create Segment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// TEST BROADCAST QA MODAL
// ----------------------------------------------------
function TestBroadcastModal({ onClose }: { onClose: () => void }) {
  const [testEmail, setTestEmail] = useState("admin@jananiagro.com");
  const [testPhone, setTestPhone] = useState("+91 98765 43210");
  const [sending, setSending] = useState(false);

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success(`Test broadcast packet sent to ${testEmail} and ${testPhone}!`);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-600" />
            Quality Assurance Test Broadcast
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-500">
          Send a simulated test broadcast to your admin inbox and mobile device before triggering live customer campaigns.
        </p>

        <form onSubmit={handleSendTest} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Test Email Address</label>
            <input
              type="email"
              required
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Test SMS Mobile Number</label>
            <input
              type="text"
              required
              value={testPhone}
              onChange={e => setTestPhone(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            />
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm flex items-center gap-1.5"
            >
              {sending ? "Sending QA Drop..." : "Send Test Drop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
