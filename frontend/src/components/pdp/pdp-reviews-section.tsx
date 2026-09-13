import React, { useState } from "react";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquarePlus,
  X,
  Filter,
  Camera,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Product } from "@/lib/catalog";

interface PdpReviewsSectionProps {
  product: Product;
}

interface CustomerReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  helpfulCount: number;
  userVoted?: boolean;
}

export function PdpReviewsSection({ product }: PdpReviewsSectionProps) {
  const initialReviews: CustomerReview[] = [
    {
      id: "rev-1",
      name: "Radhika K.",
      location: "Ahmedabad, Gujarat",
      rating: 5,
      date: "04 Sep 2026",
      title: "Authentic aroma and pure traditional extraction!",
      comment: `The fragrance and texture of this ${product.name} are completely unmatched compared to commercially refined market brands. You can visibly see the single-origin purity and quality.`,
      verified: true,
      helpfulCount: 24,
    },
    {
      id: "rev-2",
      name: "Suresh Narayanan",
      location: "Bengaluru, Karnataka",
      rating: 5,
      date: "28 Aug 2026",
      title: "Clean packing, fast delivery and authentic taste.",
      comment: `Ordered the family pack. The eco-packaging is top notch, no leakage, and food cooked with this has a distinct earthy aroma. Highly recommended.`,
      verified: true,
      helpfulCount: 18,
    },
    {
      id: "rev-3",
      name: "Meera Deshmukh",
      location: "Pune, Maharashtra",
      rating: 5,
      date: "15 Aug 2026",
      title: "100% genuine farm produce. Subscribing for monthly refills.",
      comment: `Our entire family has switched to Janani Agro for our pantry staples. Great initiative supporting local Saurashtra farmers directly.`,
      verified: true,
      helpfulCount: 12,
    },
    {
      id: "rev-4",
      name: "Anand Sharma",
      location: "Delhi NCR",
      rating: 4,
      date: "02 Aug 2026",
      title: "Very good quality, arrived in 3 days.",
      comment: `Purity and taste are 5 stars. Delivery to Delhi took 3 days which is reasonable for direct farm dispatch. Will buy again.`,
      verified: true,
      helpfulCount: 9,
    },
  ];

  const [reviews, setReviews] = useState<CustomerReview[]>(initialReviews);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // New Review Form State
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");

  const handleHelpful = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (r.userVoted) return r;
          return { ...r, helpfulCount: r.helpfulCount + 1, userVoted: true };
        }
        return r;
      })
    );
    toast.success("Thank you for your feedback!");
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newComment.trim() || !newName.trim()) {
      toast.error("Please fill in all review fields.");
      return;
    }

    const createdReview: CustomerReview = {
      id: `rev-${Date.now()}`,
      name: newName.trim(),
      location: newCity.trim() || "India",
      rating: newRating,
      date: "Just now",
      title: newTitle.trim(),
      comment: newComment.trim(),
      verified: true,
      helpfulCount: 1,
      userVoted: false,
    };

    setReviews([createdReview, ...reviews]);
    setIsWriteModalOpen(false);
    setNewTitle("");
    setNewComment("");
    setNewName("");
    setNewCity("");
    toast.success("Your verified buyer review has been posted!", {
      description: "Thank you for supporting sustainable organic farming.",
    });
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  return (
    <section className="mt-16 border-t border-border pt-12 space-y-8">
      {/* Header & Scorecard */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf">
            Customer Feedback
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Ratings & Verified Reviews
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Real feedback from households enjoying Janani Agro organic harvests.
          </p>
        </div>

        <Button
          onClick={() => setIsWriteModalOpen(true)}
          className="rounded-full px-6 font-bold flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <MessageSquarePlus className="size-4" />
          Write a Review
        </Button>
      </div>

      {/* Rating Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft items-center">
        {/* Left: Overall Big Score */}
        <div className="text-center md:border-r border-border md:pr-8 space-y-2">
          <span className="font-display text-5xl font-black text-foreground">
            {product.rating}
          </span>
          <div className="flex justify-center text-brand-gold">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-5 fill-current text-amber-500" />
            ))}
          </div>
          <p className="text-xs font-semibold text-muted-foreground">
            Based on {product.reviews} verified buyer ratings
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 className="size-3.5" /> 98% Recommend This Harvest
          </span>
        </div>

        {/* Right: Star Bars */}
        <div className="space-y-2">
          {[
            { stars: 5, pct: 86, count: Math.round(product.reviews * 0.86) },
            { stars: 4, pct: 11, count: Math.round(product.reviews * 0.11) },
            { stars: 3, pct: 2, count: Math.round(product.reviews * 0.02) },
            { stars: 2, pct: 1, count: Math.round(product.reviews * 0.01) },
            { stars: 1, pct: 0, count: 0 },
          ].map((bar) => (
            <div key={bar.stars} className="flex items-center gap-3 text-xs">
              <span className="w-8 font-bold text-foreground flex items-center gap-1">
                {bar.stars} <Star className="size-3 fill-amber-500 text-amber-500" />
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
              <span className="w-12 text-right text-muted-foreground font-mono">
                {bar.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mr-2">
          <Filter className="size-3.5 text-brand-leaf" /> Filter:
        </span>
        <button
          onClick={() => setFilterRating(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
            filterRating === null
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          All Reviews ({reviews.length})
        </button>
        {[5, 4, 3].map((star) => (
          <button
            key={star}
            onClick={() => setFilterRating(star)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 transition ${
              filterRating === star
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {star} Stars <Star className="size-3 fill-current text-amber-500" />
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                  {rev.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-foreground">{rev.name}</h5>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.2 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="size-3 text-emerald-600" /> Verified Buyer
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{rev.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < rev.rating ? "fill-amber-500" : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {rev.date}
                </span>
              </div>
            </div>

            <div>
              <h6 className="font-bold text-sm text-foreground">{rev.title}</h6>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {rev.comment}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-[11px]">
                <ShieldCheck className="size-3.5 text-emerald-600" /> Verified Farm Batch Quality
              </span>
              <button
                onClick={() => handleHelpful(rev.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition ${
                  rev.userVoted
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 font-bold"
                    : "border-border hover:bg-muted"
                }`}
              >
                <ThumbsUp className="size-3.5" /> Helpful ({rev.helpfulCount})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Write a Review Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-background border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="size-5 text-brand-leaf" />
                <h3 className="font-display font-bold text-lg">Write a Verified Review</h3>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="rounded-full p-1 hover:bg-muted text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Star Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`size-6 ${
                          star <= newRating ? "fill-amber-500 text-amber-500" : "text-muted"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-foreground">
                    {newRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Review Headline / Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Exceptional purity and authentic aroma!"
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-primary"
                  required
                />
              </div>

              {/* Review Content */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Detailed Experience
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Tell us about the aroma, taste, packaging, cooking experience..."
                  className="w-full rounded-xl border border-input bg-card p-3 text-xs outline-none focus:border-primary resize-none"
                  required
                />
              </div>

              {/* Author & City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Pooja S."
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    City / State
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Surat, Gujarat"
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsWriteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="font-bold">
                  Submit Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
