import React, { useState } from "react";
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Mail,
  Send,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { type ReferralAnalytics } from "./types";

const INITIAL_REFERRAL_DATA: ReferralAnalytics = {
  referralCode: "NEHA250",
  referralUrl: "https://jananiagro.com/invite/NEHA250",
  totalEarnings: 1250,
  completedInvites: 5,
  pendingInvites: 2,
  currentMilestone: {
    tierName: "Vedic Community Champion",
    targetCount: 10,
    currentCount: 5,
    bonusAmount: 1000,
    progressPercent: 50,
  },
  friends: [
    {
      id: "ref-1",
      name: "Rohan Sharma",
      phoneOrEmail: "rohan.sharma@gmail.com",
      date: "08 Sep 2026",
      status: "rewarded",
      rewardAmount: 250,
      orderValue: 1820,
    },
    {
      id: "ref-2",
      name: "Priya Deshmukh",
      phoneOrEmail: "+91 98450 *****",
      date: "02 Sep 2026",
      status: "rewarded",
      rewardAmount: 250,
      orderValue: 1200,
    },
    {
      id: "ref-3",
      name: "Amit Verma",
      phoneOrEmail: "amit.v@outlook.com",
      date: "24 Aug 2026",
      status: "rewarded",
      rewardAmount: 250,
      orderValue: 2450,
    },
    {
      id: "ref-4",
      name: "Sunita Rao",
      phoneOrEmail: "+91 97412 *****",
      date: "15 Aug 2026",
      status: "rewarded",
      rewardAmount: 250,
      orderValue: 890,
    },
    {
      id: "ref-5",
      name: "Vikram Joshi",
      phoneOrEmail: "vikram.j@techcorp.io",
      date: "01 Aug 2026",
      status: "rewarded",
      rewardAmount: 250,
      orderValue: 3100,
    },
    {
      id: "ref-6",
      name: "Deepa K",
      phoneOrEmail: "+91 99001 *****",
      date: "10 Sep 2026",
      status: "pending_first_order",
      rewardAmount: 250,
    },
    {
      id: "ref-7",
      name: "Karthik N",
      phoneOrEmail: "karthik.n@gmail.com",
      date: "11 Sep 2026",
      status: "pending_first_order",
      rewardAmount: 250,
    },
  ],
};

export function ReferralProgramSection() {
  const { user } = useStore();
  const [data] = useState<ReferralAnalytics>(() => ({
    ...INITIAL_REFERRAL_DATA,
    referralCode: user?.referralCode || "NEHA250",
    referralUrl: `https://jananiagro.com/invite/${user?.referralCode || "NEHA250"}`,
  }));

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const inviteMessage = `Hey! Taste the purest cold-pressed oils and organic Vedic grains from Janani Agro Products. Use my invite code ${data.referralCode} to get flat ₹250 off your first harvest basket! Shop here: ${data.referralUrl}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(data.referralCode);
      setCopiedCode(true);
      toast.success(`Referral code "${data.referralCode}" copied!`);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.info(`Your referral code is: ${data.referralCode}`);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(data.referralUrl);
      setCopiedUrl(true);
      toast.success("Referral invitation link copied to clipboard!");
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      toast.info(`Your referral link: ${data.referralUrl}`);
    }
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(data.referralUrl)}&text=${encodeURIComponent(
      `Taste pure organic cold-pressed harvests from Janani Agro! Use code ${data.referralCode} for ₹250 OFF.`
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent("Special ₹250 Gift: Fresh Organic Harvests from Janani Agro");
    const body = encodeURIComponent(inviteMessage);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Janani Agro Products — ₹250 Harvest Gift",
          text: inviteMessage,
          url: data.referralUrl,
        });
        toast.success("Shared successfully!");
      } catch (e) {
        // User dismissed share dialog
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER & HOW IT WORKS */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-amber-500/10 via-card to-emerald-500/10 p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/20 text-amber-900 dark:text-amber-300 border border-brand-gold/30 text-xs font-bold">
              <Gift className="size-3.5 text-amber-600" />
              Give ₹250, Get ₹250
            </span>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">
              Refer Friends & Harvest Cash Rewards
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Introduce your family and loved ones to authentic wood-pressed oils, unpolished
              millets, and chemical-free groceries. They get <strong>₹250 off</strong> their first
              order, and you earn <strong>₹250 instant wallet cash</strong> directly in your passbook!
            </p>
          </div>

          {/* Quick How It Works Steps */}
          <div className="grid grid-cols-3 gap-3 bg-card/80 backdrop-blur-md p-4 rounded-2xl border border-border/80 text-center">
            <div className="space-y-1">
              <div className="size-8 rounded-full bg-emerald-500/15 text-emerald-600 font-bold text-xs flex items-center justify-center mx-auto">
                1
              </div>
              <p className="text-[11px] font-bold text-foreground">Share Code</p>
              <p className="text-[10px] text-muted-foreground">Send invite link</p>
            </div>
            <div className="space-y-1">
              <div className="size-8 rounded-full bg-amber-500/15 text-amber-600 font-bold text-xs flex items-center justify-center mx-auto">
                2
              </div>
              <p className="text-[11px] font-bold text-foreground">Friend Orders</p>
              <p className="text-[10px] text-muted-foreground">They save ₹250</p>
            </div>
            <div className="space-y-1">
              <div className="size-8 rounded-full bg-purple-500/15 text-purple-600 font-bold text-xs flex items-center justify-center mx-auto">
                3
              </div>
              <p className="text-[11px] font-bold text-foreground">You Earn ₹250</p>
              <p className="text-[10px] text-muted-foreground">Direct wallet cash</p>
            </div>
          </div>
        </div>
      </div>

      {/* SHARE CONTROLS: CODE, LINK & SOCIAL BUTTONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Code Box */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-heading font-bold text-foreground">
                Your Unique Referral Code
              </h3>
              <p className="text-xs text-muted-foreground">
                Friends can enter this code in cart or checkout.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              Never Expires
            </span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 border border-border">
            <span className="font-mono text-xl md:text-2xl font-black tracking-widest text-emerald-700 dark:text-emerald-400 flex-1 pl-2">
              {data.referralCode}
            </span>
            <Button
              type="button"
              onClick={handleCopyCode}
              className={`rounded-xl h-10 px-4 font-bold text-xs flex items-center gap-1.5 transition-all ${
                copiedCode
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {copiedCode ? (
                <>
                  <Check className="size-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>

          {/* Referral Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Or Copy Direct Invite Link
            </label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={data.referralUrl}
                className="font-mono text-xs h-10 rounded-xl bg-background"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyUrl}
                className="rounded-xl h-10 px-3 text-xs shrink-0 font-semibold"
              >
                {copiedUrl ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* 1-Click Social Share Buttons */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="size-4 text-emerald-600" />
              <h3 className="text-base font-heading font-bold text-foreground">
                Share with Friends & Family
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Broadcast your invite link directly across social channels with pre-filled promo text.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] dark:text-[#25D366] flex flex-col items-center justify-center gap-1.5 transition hover:scale-105 active:scale-95"
            >
              <MessageCircle className="size-5 fill-current" />
              <span className="text-xs font-bold">WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              type="button"
              onClick={handleShareTelegram}
              className="p-3 rounded-2xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#229ED9] flex flex-col items-center justify-center gap-1.5 transition hover:scale-105 active:scale-95"
            >
              <Send className="size-5" />
              <span className="text-xs font-bold">Telegram</span>
            </button>

            {/* Email */}
            <button
              type="button"
              onClick={handleShareEmail}
              className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex flex-col items-center justify-center gap-1.5 transition hover:scale-105 active:scale-95"
            >
              <Mail className="size-5" />
              <span className="text-xs font-bold">Email</span>
            </button>

            {/* Native Web Share */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary flex flex-col items-center justify-center gap-1.5 transition hover:scale-105 active:scale-95"
            >
              <Share2 className="size-5" />
              <span className="text-xs font-bold">More</span>
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            Tip: Sharing in family food groups brings the fastest first orders!
          </p>
        </div>
      </div>

      {/* REFERRAL EARNINGS DASHBOARD & MILESTONE PROGRESS */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-heading font-bold text-foreground">
              Referral Earnings & Milestone Progress
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track your earnings growth, invited friends, and unlock milestone bonuses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
              Tier: {data.currentMilestone.tierName}
            </span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Earned</span>
              <Sparkles className="size-4" />
            </div>
            <p className="text-2xl md:text-3xl font-heading font-extrabold text-emerald-800 dark:text-emerald-300">
              ₹{data.totalEarnings.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-emerald-600/80">Credited to Wallet Balance</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1">
            <div className="flex items-center justify-between text-blue-700 dark:text-blue-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Successful Orders</span>
              <Users className="size-4" />
            </div>
            <p className="text-2xl md:text-3xl font-heading font-extrabold text-blue-800 dark:text-blue-300">
              {data.completedInvites} Friends
            </p>
            <p className="text-[11px] text-blue-600/80">Received their ₹250 discount</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
              <Clock className="size-4" />
            </div>
            <p className="text-2xl md:text-3xl font-heading font-extrabold text-amber-800 dark:text-amber-300">
              {data.pendingInvites} Friends
            </p>
            <p className="text-[11px] text-amber-600/80">₹500 earnings awaiting checkout</p>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="p-5 rounded-2xl bg-secondary/50 border border-border space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Trophy className="size-4 text-brand-gold" />
              <span className="font-bold text-foreground">
                Next Milestone: Refer 10 Friends & Win Extra ₹1,000 Bonus
              </span>
            </div>
            <span className="font-bold text-emerald-600">
              {data.currentMilestone.currentCount} / {data.currentMilestone.targetCount} ({data.currentMilestone.progressPercent}%)
            </span>
          </div>

          {/* Progress bar line */}
          <div className="w-full h-3 rounded-full bg-secondary overflow-hidden border border-border/80 relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-brand-gold rounded-full transition-all duration-700"
              style={{ width: `${data.currentMilestone.progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>5 more completed referrals required</span>
            <span className="font-semibold text-foreground">Reward: ₹1,000 Instant Cash Voucher</span>
          </div>
        </div>

        {/* REFERRED FRIENDS ACTIVITY LIST */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Referral Activity Log
            </h4>
            <span className="text-xs text-muted-foreground">
              {data.friends.length} Patrons Invited
            </span>
          </div>

          <div className="divide-y divide-border/60 rounded-2xl border border-border/80 overflow-hidden bg-background">
            {data.friends.map((friend) => {
              const isRewarded = friend.status === "rewarded";
              return (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3.5 md:px-5 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-9 rounded-full flex items-center justify-center text-xs font-bold ${
                        isRewarded
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {friend.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {friend.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {friend.phoneOrEmail} • Invited on {friend.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {isRewarded ? (
                      <div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="size-3" />
                          +₹{friend.rewardAmount} Credited
                        </span>
                        {friend.orderValue && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            First order: ₹{friend.orderValue}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                        <Clock className="size-3" />
                        Order Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
