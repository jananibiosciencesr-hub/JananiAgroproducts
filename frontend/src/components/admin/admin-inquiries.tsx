import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquareText,
  Mail,
  Phone,
  Building2,
  Calendar,
  Search,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Tag,
  X,
  MessageCircle,
  Sparkles,
  PhoneCall,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getAdminInquiries,
  updateAdminInquiryStatus,
  deleteAdminInquiry,
  createAdminInquiry,
  type AdminInquiry
} from "@/lib/api";

export function InquiriesManagement() {
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("all");

  // Modal states
  const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiry | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [internalNoteInput, setInternalNoteInput] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // New Inquiry form state
  const [newInquiryForm, setNewInquiryForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    service: "Dealership Application",
    quantity: "",
    message: "",
    priority: "High" as "High" | "Medium" | "Low",
    status: "New" as "New" | "Contacted" | "In Progress" | "Resolved" | "Closed"
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAdminInquiries();
      setInquiries(data);
    } catch (e) {
      console.warn("Failed loading admin inquiries:", e);
      toast.error("Failed to load inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("janani-inquiries-updated", handleUpdate);
    window.addEventListener("janani-subscribers-updated", handleUpdate);
    return () => {
      window.removeEventListener("janani-inquiries-updated", handleUpdate);
      window.removeEventListener("janani-subscribers-updated", handleUpdate);
    };
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = inquiries.length;
    const newCount = inquiries.filter((i) => i.status === "New").length;
    const dealershipCount = inquiries.filter((i) =>
      (i.service || "").toLowerCase().includes("dealer") ||
      (i.service || "").toLowerCase().includes("distribut")
    ).length;
    const commercialCount = inquiries.filter((i) =>
      (i.service || "").toLowerCase().includes("bulk") ||
      (i.service || "").toLowerCase().includes("commercial")
    ).length;
    const newsletterCount = inquiries.filter((i) =>
      (i.service || "").toLowerCase().includes("newsletter") ||
      (i.service || "").toLowerCase().includes("subscri")
    ).length;
    const resolvedCount = inquiries.filter((i) => i.status === "Resolved" || i.status === "Closed").length;
    const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 100;

    return { total, newCount, dealershipCount, commercialCount, newsletterCount, resolvedCount, resolutionRate };
  }, [inquiries]);

  // Filtered List
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        (item.businessName || item.business_name || "").toLowerCase().includes(q) ||
        (item.service || "").toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q);

      const matchesStatus =
        activeStatusFilter === "all" || item.status.toLowerCase() === activeStatusFilter.toLowerCase();

      let matchesType = true;
      if (activeTypeFilter === "dealers") {
        matchesType = (item.service || "").toLowerCase().includes("dealer") || (item.service || "").toLowerCase().includes("distribut");
      } else if (activeTypeFilter === "bulk") {
        matchesType = (item.service || "").toLowerCase().includes("bulk") || (item.service || "").toLowerCase().includes("commercial");
      } else if (activeTypeFilter === "advisory") {
        matchesType = (item.service || "").toLowerCase().includes("crop") || (item.service || "").toLowerCase().includes("solution") || (item.service || "").toLowerCase().includes("advisory");
      } else if (activeTypeFilter === "contact") {
        matchesType = (item.service || "").toLowerCase().includes("contact") || (item.service || "").toLowerCase().includes("general");
      } else if (activeTypeFilter === "newsletter") {
        matchesType = (item.service || "").toLowerCase().includes("newsletter") || (item.service || "").toLowerCase().includes("subscri");
      }

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [inquiries, searchQuery, activeStatusFilter, activeTypeFilter]);

  const handleStatusChange = async (
    inquiry: AdminInquiry,
    newStatus: "New" | "Contacted" | "In Progress" | "Resolved" | "Closed"
  ) => {
    try {
      await updateAdminInquiryStatus(inquiry.id, newStatus);
      setInquiries((prev) =>
        prev.map((i) => (String(i.id) === String(inquiry.id) ? { ...i, status: newStatus } : i))
      );
      if (selectedInquiry && String(selectedInquiry.id) === String(inquiry.id)) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
      toast.success(`Inquiry marked as ${newStatus}!`);
    } catch (e) {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to permanently delete this customer inquiry?")) return;
    try {
      await deleteAdminInquiry(id);
      setInquiries((prev) => prev.filter((i) => String(i.id) !== String(id)));
      if (selectedInquiry && String(selectedInquiry.id) === String(id)) {
        setSelectedInquiry(null);
      }
      toast.success("Inquiry removed.");
    } catch (e) {
      toast.error("Failed to delete inquiry.");
    }
  };

  const handleSaveNote = async () => {
    if (!selectedInquiry) return;
    setSavingNote(true);
    try {
      await updateAdminInquiryStatus(selectedInquiry.id, selectedInquiry.status, internalNoteInput);
      setInquiries((prev) =>
        prev.map((i) =>
          String(i.id) === String(selectedInquiry.id)
            ? { ...i, internalNotes: internalNoteInput }
            : i
        )
      );
      setSelectedInquiry({ ...selectedInquiry, internalNotes: internalNoteInput });
      toast.success("Internal note saved successfully!");
    } catch (e) {
      toast.error("Failed to save note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInquiryForm.name.trim() || !newInquiryForm.phone.trim()) {
      toast.error("Contact Name and Mobile Number are required.");
      return;
    }

    try {
      const res = await createAdminInquiry(newInquiryForm);
      if (res?.inquiry) {
        setInquiries((prev) => [res.inquiry!, ...prev]);
      }
      setIsAddModalOpen(false);
      setNewInquiryForm({
        name: "",
        businessName: "",
        email: "",
        phone: "",
        service: "Dealership Application",
        quantity: "",
        message: "",
        priority: "High",
        status: "New"
      });
      toast.success("New commercial inquiry recorded!");
    } catch (e) {
      toast.error("Failed to record inquiry.");
    }
  };

  const handleExportCSV = () => {
    if (inquiries.length === 0) {
      toast.error("No inquiries to export.");
      return;
    }

    const headers = [
      "Inquiry ID",
      "Date",
      "Full Name",
      "Business / Org",
      "Phone",
      "Email",
      "Service / Type",
      "Quantity / Budget",
      "Message",
      "Status",
      "Priority"
    ];

    const rows = inquiries.map((i) => [
      `"${i.id}"`,
      `"${i.createdAt || i.created_at || ""}"`,
      `"${(i.name || "").replace(/"/g, '""')}"`,
      `"${(i.businessName || i.business_name || "").replace(/"/g, '""')}"`,
      `"${i.phone || ""}"`,
      `"${i.email || ""}"`,
      `"${(i.service || i.subject || "").replace(/"/g, '""')}"`,
      `"${(i.quantity || "").replace(/"/g, '""')}"`,
      `"${(i.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
      `"${i.status}"`,
      `"${i.priority || "Medium"}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Janani_Agro_Inquiries_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Inquiries CSV exported successfully!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Customer & B2B Inquiries
            </h1>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              {stats.newCount} New Leads
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage inbound website leads, dealership & distributorship applications, commercial bulk tenders, and crop support messages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="rounded-2xl gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="rounded-2xl gap-1.5 text-xs font-semibold"
          >
            <Download className="size-3.5" /> Export CSV
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold gap-1.5 shadow-md shadow-emerald-900/20 text-xs"
          >
            <Plus className="size-4" /> Log Manual Lead
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Inquiries</span>
            <div className="grid size-8 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <MessageSquareText className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {stats.total}
          </p>
          <span className="mt-1 block text-[11px] text-muted-foreground">All time submissions</span>
        </div>

        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">New Leads</span>
            <div className="grid size-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Sparkles className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-3xl">
            {stats.newCount}
          </p>
          <span className="mt-1 block text-[11px] text-emerald-600/80">Action required</span>
        </div>

        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Dealerships</span>
            <div className="grid size-8 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
              <Briefcase className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 sm:text-3xl">
            {stats.dealershipCount}
          </p>
          <span className="mt-1 block text-[11px] text-amber-600/80">Retailers & distributors</span>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Resolution Rate</span>
            <div className="grid size-8 place-items-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {stats.resolutionRate}%
          </p>
          <span className="mt-1 block text-[11px] text-muted-foreground">{stats.resolvedCount} completed</span>
        </div>
      </div>

      {/* 3. Filter Controls & Search */}
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-soft space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Leads", count: inquiries.length },
              { id: "dealers", label: "Dealerships", count: stats.dealershipCount },
              { id: "bulk", label: "Bulk Commercial", count: stats.commercialCount },
              { id: "newsletter", label: "Newsletter Subscribers", count: stats.newsletterCount },
              { id: "advisory", label: "Crop Advisory", count: inquiries.filter((i) => (i.service || "").toLowerCase().includes("crop") || (i.service || "").toLowerCase().includes("solution")).length },
              { id: "contact", label: "Contact Form", count: inquiries.filter((i) => (i.service || "").toLowerCase().includes("contact") || (i.service || "").toLowerCase().includes("general")).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTypeFilter(tab.id)}
                className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeTypeFilter === tab.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeTypeFilter === tab.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Status:</span>
            <select
              value={activeStatusFilter}
              onChange={(e) => setActiveStatusFilter(e.target.value)}
              className="h-9 rounded-2xl border border-input bg-background px-3 text-xs font-semibold text-foreground outline-none focus:border-brand-leaf"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads by customer name, phone (+91), email, company, crop type, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-2xl border border-input bg-background/80 pl-10 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-brand-leaf focus:ring-1 focus:ring-brand-leaf/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 4. Inquiries List */}
      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center space-y-3 shadow-soft">
          <RefreshCw className="size-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-foreground">Loading inquiry stream from MySQL database...</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-3 shadow-soft">
          <MessageSquareText className="size-10 text-muted-foreground mx-auto" />
          <p className="text-base font-semibold text-foreground">No inquiries match your criteria</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search terms or filter tabs to find commercial inquiries.
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setActiveTypeFilter("all");
              setActiveStatusFilter("all");
            }}
            variant="outline"
            size="sm"
            className="rounded-2xl text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredInquiries.map((inq) => {
            const cleanPhone = (inq.phone || "").replace(/\D/g, "");
            const isDealership = (inq.service || "").toLowerCase().includes("dealer") || (inq.service || "").toLowerCase().includes("distribut");

            return (
              <div
                key={inq.id}
                onClick={() => {
                  setSelectedInquiry(inq);
                  setInternalNoteInput(inq.internalNotes || "");
                }}
                className={`group cursor-pointer rounded-3xl border bg-card p-5 sm:p-6 shadow-soft transition-all hover:border-emerald-500/40 hover:shadow-lg ${
                  inq.status === "New"
                    ? "border-emerald-500/30 ring-1 ring-emerald-500/10 bg-emerald-500/[0.02]"
                    : "border-border"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left Lead Info */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        inq.status === "New"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20"
                          : inq.status === "Contacted"
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          : inq.status === "In Progress"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                      }`}>
                        {inq.status === "New" && <Sparkles className="size-3" />}
                        {inq.status}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                        <Tag className="size-3 text-brand-leaf" /> {inq.service || inq.subject || "General Inquiry"}
                      </span>

                      {(inq.quantity || inq.businessName || inq.business_name) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                          <Building2 className="size-3" /> {inq.businessName || inq.business_name || inq.quantity}
                        </span>
                      )}

                      <span className="text-[11px] text-muted-foreground ml-auto sm:ml-0 flex items-center gap-1">
                        <Calendar className="size-3" /> {inq.createdAt || inq.created_at || "Recent"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-emerald-600 transition flex items-center gap-2">
                        {inq.name}
                        {isDealership && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.2 rounded-full">
                            B2B Partner
                          </span>
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1 text-foreground font-mono">
                          <Phone className="size-3 text-emerald-600" /> {inq.phone}
                        </span>
                        {inq.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="size-3 text-blue-500" /> {inq.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 bg-secondary/30 p-3 rounded-2xl border border-border/50">
                      "{inq.message}"
                    </p>

                    {inq.internalNotes && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl w-fit">
                        <span>📝 Internal Note:</span> {inq.internalNotes}
                      </div>
                    )}
                  </div>

                  {/* Right Quick Actions */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 lg:pt-0 shrink-0"
                  >
                    {/* Direct WhatsApp Action */}
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(`Hello ${inq.name}, thank you for contacting Janani Agro Products regarding ${inq.service || "your inquiry"}. How may we assist you today?`)}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Chat on WhatsApp"
                        className="inline-flex h-9 items-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 text-xs font-bold shadow-sm transition"
                      >
                        <MessageCircle className="size-3.5" /> WhatsApp
                      </a>
                    )}

                    {/* Direct Call */}
                    <a
                      href={`tel:${inq.phone}`}
                      title="Direct Call"
                      className="inline-flex h-9 items-center gap-1.5 rounded-2xl border border-border bg-secondary/80 hover:bg-secondary text-foreground px-3 text-xs font-semibold transition"
                    >
                      <PhoneCall className="size-3.5 text-brand-leaf" /> Call
                    </a>

                    {/* Direct Email */}
                    {inq.email && (
                      <a
                        href={`mailto:${inq.email}?subject=Janani%20Agro%20Response%20-%20${encodeURIComponent(inq.service || "Inquiry")}`}
                        title="Send Email"
                        className="inline-flex h-9 items-center justify-center rounded-2xl border border-border bg-secondary/80 hover:bg-secondary text-foreground px-2.5 text-xs transition"
                      >
                        <Mail className="size-3.5 text-blue-500" />
                      </a>
                    )}

                    {/* Status Dropdown */}
                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(inq, e.target.value as any)}
                      className="h-9 rounded-2xl border border-input bg-background px-2.5 text-xs font-bold text-foreground outline-none focus:border-brand-leaf"
                    >
                      <option value="New">Mark New</option>
                      <option value="Contacted">Mark Contacted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <Button
                      onClick={() => handleDelete(inq.id)}
                      variant="ghost"
                      size="sm"
                      className="size-9 p-0 rounded-2xl text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Detail & Response Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl space-y-6 text-left">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <X className="size-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-leaf/10 px-3 py-1 text-xs font-bold text-brand-leaf">
                  {selectedInquiry.service || selectedInquiry.subject || "Customer Inquiry"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Logged on {selectedInquiry.createdAt || selectedInquiry.created_at || "Recent"}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                {selectedInquiry.name}
              </h2>
              {(selectedInquiry.businessName || selectedInquiry.business_name) && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  🏢 {selectedInquiry.businessName || selectedInquiry.business_name}
                </p>
              )}
            </div>

            {/* Customer Contact Details Grid */}
            <div className="grid gap-3 sm:grid-cols-2 rounded-2xl bg-secondary/40 p-4 border border-border/60 text-xs">
              <div>
                <span className="font-semibold text-muted-foreground block">Mobile Number</span>
                <a href={`tel:${selectedInquiry.phone}`} className="font-mono font-bold text-foreground text-sm hover:underline">
                  {selectedInquiry.phone}
                </a>
              </div>

              <div>
                <span className="font-semibold text-muted-foreground block">Email Address</span>
                <a href={`mailto:${selectedInquiry.email}`} className="font-medium text-blue-500 hover:underline">
                  {selectedInquiry.email || "Not provided"}
                </a>
              </div>

              {selectedInquiry.quantity && (
                <div className="sm:col-span-2">
                  <span className="font-semibold text-muted-foreground block">Order Volume / Farm Scale</span>
                  <span className="font-bold text-foreground">{selectedInquiry.quantity}</span>
                </div>
              )}
            </div>

            {/* Full Message Body */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Inquiry Message / Request
              </h4>
              <div className="rounded-2xl border border-border bg-background p-4 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Internal Notes Editor */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Internal Staff Notes & Action Items
              </label>
              <textarea
                rows={3}
                placeholder="Add internal notes (e.g., 'Called customer on Oct 5; sent price catalog for Bio Fertilizers; waiting for GST certificate')..."
                value={internalNoteInput}
                onChange={(e) => setInternalNoteInput(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background p-3 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  size="sm"
                  variant="gold"
                  className="rounded-xl text-xs font-bold"
                >
                  {savingNote ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Status:</span>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(selectedInquiry, e.target.value as any)}
                  className="h-9 rounded-2xl border border-input bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-brand-leaf"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {selectedInquiry.phone && (
                  <a
                    href={`https://wa.me/91${(selectedInquiry.phone || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hello ${selectedInquiry.name}, reaching out from Janani Agro Products regarding your inquiry.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 text-xs font-bold shadow-sm transition"
                  >
                    <MessageCircle className="size-3.5" /> WhatsApp Customer
                  </a>
                )}

                <Button
                  onClick={() => setSelectedInquiry(null)}
                  variant="outline"
                  size="sm"
                  className="rounded-2xl text-xs font-semibold"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Log Manual Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateInquiry}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl space-y-5 text-left"
          >
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <X className="size-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-foreground">Log New Inbound Lead</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Record inquiries received via phone call, Kisan Mela expo, or distributor referral.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <label className="grid gap-1 font-semibold text-foreground">
                <span>Contact Full Name *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rameshwar Patel"
                  value={newInquiryForm.name}
                  onChange={(e) => setNewInquiryForm({ ...newInquiryForm, name: e.target.value })}
                  className="h-10 rounded-2xl border border-input bg-background px-3 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 font-semibold text-foreground">
                  <span>Mobile Phone Number *</span>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98480 22338"
                    value={newInquiryForm.phone}
                    onChange={(e) => setNewInquiryForm({ ...newInquiryForm, phone: e.target.value })}
                    className="h-10 rounded-2xl border border-input bg-background px-3 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf"
                  />
                </label>

                <label className="grid gap-1 font-semibold text-foreground">
                  <span>Email Address</span>
                  <input
                    type="email"
                    placeholder="partner@agroagency.in"
                    value={newInquiryForm.email}
                    onChange={(e) => setNewInquiryForm({ ...newInquiryForm, email: e.target.value })}
                    className="h-10 rounded-2xl border border-input bg-background px-3 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 font-semibold text-foreground">
                  <span>Company / Agency / Farm</span>
                  <input
                    type="text"
                    placeholder="e.g. Kisan Agro Agency"
                    value={newInquiryForm.businessName}
                    onChange={(e) => setNewInquiryForm({ ...newInquiryForm, businessName: e.target.value })}
                    className="h-10 rounded-2xl border border-input bg-background px-3 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf"
                  />
                </label>

                <label className="grid gap-1 font-semibold text-foreground">
                  <span>Inquiry Type / Channel</span>
                  <select
                    value={newInquiryForm.service}
                    onChange={(e) => setNewInquiryForm({ ...newInquiryForm, service: e.target.value })}
                    className="h-10 rounded-2xl border border-input bg-background px-3 text-xs font-semibold text-foreground outline-none focus:border-brand-leaf"
                  >
                    <option value="Dealership Application">Dealership & Distributorship</option>
                    <option value="Bulk Commercial Supply">Bulk Commercial Supply</option>
                    <option value="Crop Solution Advisory">Crop Solution Advisory</option>
                    <option value="Contract Farming">Contract Farming</option>
                    <option value="General Contact">General Contact</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1 font-semibold text-foreground">
                <span>Estimated Quantity / Budget</span>
                <input
                  type="text"
                  placeholder="e.g. 500 Liters Bio-Stimulant or ₹2,00,000"
                  value={newInquiryForm.quantity}
                  onChange={(e) => setNewInquiryForm({ ...newInquiryForm, quantity: e.target.value })}
                  className="h-10 rounded-2xl border border-input bg-background px-3 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf"
                />
              </label>

              <label className="grid gap-1 font-semibold text-foreground">
                <span>Message & Discussion Notes</span>
                <textarea
                  rows={3}
                  placeholder="Enter details of customer requirements, farm location, or discussion points..."
                  value={newInquiryForm.message}
                  onChange={(e) => setNewInquiryForm({ ...newInquiryForm, message: e.target.value })}
                  className="rounded-2xl border border-input bg-background p-3 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                variant="outline"
                size="sm"
                className="rounded-2xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs"
              >
                Save Inquiry Lead
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
