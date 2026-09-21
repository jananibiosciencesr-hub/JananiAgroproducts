import React, { useRef, useState } from "react";
import {
  Camera,
  LogOut,
  Sparkles,
  Wallet,
  ShieldCheck,
  Upload,
  Trash2,
  Check,
  User,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { Link, useNavigate } from "@tanstack/react-router";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
];

export function ProfileHeader() {
  const { user, updateUserProfile, logoutUser } = useStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPresets, setShowPresets] = useState(false);

  const handleAvatarChange = (newUrl: string) => {
    updateUserProfile({ avatar: newUrl });
    setShowPresets(false);
    toast.success("Profile photo updated successfully!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          updateUserProfile({ avatar: reader.result as string });
          toast.success("New profile picture uploaded!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    updateUserProfile({ avatar: "" });
    toast.info("Profile photo removed. Showing default initials.");
  };

  const handleLogout = () => {
    logoutUser();
    navigate({ to: "/login" });
  };

  const name = user?.name || "Janani Patron";
  const email = user?.email || "customer@jananiagro.com";
  const phone = user?.phone || "";
  const tier = user?.tier || "Harvest Member";
  const walletBalance = user?.walletBalance ?? 0;
  const avatar = user?.avatar;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="relative rounded-[2.5rem] bg-gradient-to-r from-forest via-forest to-emerald-950 p-6 sm:p-10 text-primary-foreground shadow-luxe overflow-hidden">
      {/* Subtle organic watermark */}
      <div className="absolute -right-16 -bottom-16 size-64 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Avatar with Upload Button + Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar container with interactive Camera button */}
          <div className="relative group shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="size-24 sm:size-28 rounded-3xl object-cover border-2 border-brand-gold/40 shadow-md ring-4 ring-white/10"
              />
            ) : (
              <div className="size-24 sm:size-28 rounded-3xl bg-brand-gold text-forest font-display text-3xl font-bold flex items-center justify-center shadow-md ring-4 ring-white/10">
                {initials}
              </div>
            )}

            {/* Camera Overlay Button */}
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="absolute -bottom-2 -right-2 size-9 rounded-full bg-brand-gold text-forest flex items-center justify-center shadow-md hover:scale-105 transition"
              title="Change Profile Photo"
            >
              <Camera className="size-4.5" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* User Meta */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold/20 text-brand-gold px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="size-3" /> {tier}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                <ShieldCheck className="size-3" /> KYC Verified
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {name}
            </h1>
            <p className="text-xs text-primary-foreground/75">
              {email} · {phone}
            </p>

            {/* Wallet Quick Pill */}
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-3">
              <Link
                to="/wallet"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 transition px-3 py-1 text-xs backdrop-blur-sm border border-white/10 text-white"
                title="View Wallet & Referrals"
              >
                <Wallet className="size-3.5 text-brand-gold" />
                <span>Farm Wallet: <strong className="text-brand-gold">₹{walletBalance}</strong> &bull; Refer & Earn &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 self-center md:self-auto">
          <Button asChild variant="glass" size="sm" className="rounded-full text-xs font-bold gap-1.5 shadow-sm text-white">
            <Link to="/wallet">
              <Wallet className="size-4 text-brand-gold" /> Farm Wallet
            </Link>
          </Button>

          <Button asChild variant="gold" size="sm" className="rounded-full text-xs font-bold gap-1.5 shadow-sm">
            <Link to="/orders">
              <ShoppingBag className="size-4" /> My Orders Hub
            </Link>
          </Button>

          <Button
            type="button"
            variant="glass"
            size="sm"
            onClick={handleLogout}
            className="rounded-full text-xs font-semibold gap-1.5 border-white/20 text-white hover:bg-white/15"
          >
            <LogOut className="size-3.5" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Preset Avatar Popover / Picker Drawer */}
      {showPresets && (
        <div className="mt-6 pt-5 border-t border-white/15 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-brand-gold flex items-center gap-1.5">
              <Upload className="size-3.5" /> Choose Profile Avatar or Upload Photo
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full text-[11px] h-7 bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Upload from Device
              </Button>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-white/70 hover:text-red-300 text-[11px] flex items-center gap-1 transition"
                >
                  <Trash2 className="size-3" /> Remove Photo
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-1">
            {AVATAR_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAvatarChange(preset)}
                className={`relative rounded-2xl p-0.5 border-2 transition ${
                  avatar === preset ? "border-brand-gold scale-105" : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <img src={preset} alt={`Preset ${idx + 1}`} className="size-12 rounded-xl object-cover" />
                {avatar === preset && (
                  <span className="absolute -top-1 -right-1 size-4 rounded-full bg-brand-gold text-forest flex items-center justify-center">
                    <Check className="size-2.5 stroke-[3]" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
