import React, { useRef, useState } from "react";
import {
  Camera,
  LogOut,
  Sparkles,
  ShieldCheck,
  Upload,
  Trash2,
  Check,
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

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    logoutUser();
    navigate({ to: "/" });
  };

  const name = user?.name || "Janani Patron";
  const email = user?.email || "customer@jananiagro.com";
  const phone = user?.phone || "";
  const tier = user?.tier || "Silver";
  const avatar = user?.avatar;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-forest via-[#075B32] to-[#04341B] p-3 sm:p-4 text-white shadow-md border border-white/10 overflow-hidden">
      {/* Subtle organic ambient glow */}
      <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-brand-gold/10 blur-2xl pointer-events-none" />

      {/* Single-line compact horizontal layout */}
      <div className="relative z-10 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Compact Avatar + Name & Info in Single Line */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          {/* Compact Avatar with interactive Camera button */}
          <div className="relative group shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="size-11 sm:size-13 rounded-xl object-cover border border-brand-gold/50 shadow-xs"
              />
            ) : (
              <div className="size-11 sm:size-13 rounded-xl bg-brand-gold text-forest font-display text-base sm:text-xl font-bold flex items-center justify-center shadow-xs">
                {initials}
              </div>
            )}

            {/* Camera Overlay Icon */}
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="absolute -bottom-1 -right-1 size-5 rounded-full bg-brand-gold text-forest flex items-center justify-center shadow hover:scale-110 transition cursor-pointer"
              title="Change Profile Photo"
            >
              <Camera className="size-2.5" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-display text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-[150px] sm:max-w-xs">
                {name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold/25 text-brand-gold px-2 py-0.2 text-[9.5px] font-extrabold uppercase tracking-wide">
                <Sparkles className="size-2.5" /> {tier}
              </span>
              <span className="hidden xs:inline-flex sm:inline-flex items-center gap-0.5 rounded-full bg-emerald-500/25 text-emerald-300 px-1.5 py-0.2 text-[9px] font-semibold">
                <ShieldCheck className="size-2.5" /> Verified
              </span>
            </div>

            <p className="text-[11px] text-white/80 truncate">
              {email}{phone ? ` • ${phone}` : ""}
            </p>
          </div>
        </div>

        {/* Right: Compact Action Buttons in Single Line */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold text-[#05321A] bg-gradient-to-b from-[#FFE072] to-[#F5B723] hover:from-[#FFF099] hover:to-[#F9C33F] border border-[#FFF4B8]/80 shadow-xs hover:shadow transition active:scale-95 cursor-pointer"
            title="My Orders Hub"
          >
            <ShoppingBag className="size-3.5 stroke-[2.4] text-[#05321A]" />
            <span className="whitespace-nowrap font-bold text-[11px] sm:text-xs">
              <span className="hidden xs:inline">My </span>Orders
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-white/90 bg-white/10 hover:bg-rose-500/25 hover:text-white hover:border-rose-400/40 border border-white/20 transition active:scale-95 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline text-xs">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Preset Avatar Popover / Picker Drawer */}
      {showPresets && (
        <div className="mt-3 pt-3 border-t border-white/15 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-brand-gold text-[11px] flex items-center gap-1">
              <Upload className="size-3" /> Select Avatar or Upload:
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg text-[10px] h-6 px-2.5 bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Upload Photo
              </Button>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-white/70 hover:text-rose-300 text-[10px] flex items-center gap-1 transition px-1 py-0.5 cursor-pointer"
                >
                  <Trash2 className="size-2.5" /> Remove
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {AVATAR_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAvatarChange(preset)}
                className={`relative rounded-xl p-0.5 border-2 transition shrink-0 cursor-pointer ${
                  avatar === preset ? "border-brand-gold scale-105" : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <img src={preset} alt={`Preset ${idx + 1}`} className="size-9 rounded-lg object-cover" />
                {avatar === preset && (
                  <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-brand-gold text-forest flex items-center justify-center">
                    <Check className="size-2 stroke-[3]" />
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
