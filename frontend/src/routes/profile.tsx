import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  User,
  MapPin,
  CreditCard,
  Globe,
  Trash2,
  LogOut,
  ShoppingBag,
  ShieldAlert,
  Home,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/store-provider";

import { ProfileHeader } from "@/components/profile/profile-header";
import { EditProfileTab } from "@/components/profile/edit-profile-tab";
import { AddressManagerTab } from "@/components/profile/address-manager-tab";
import { SavedPaymentsTab } from "@/components/profile/saved-payments-tab";
import { PreferencesTab } from "@/components/profile/preferences-tab";
import { AccountDeleteModal } from "@/components/profile/account-delete-modal";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Account Settings — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content: "Manage personal details, saved shipping addresses, payment methods, language, and account security.",
      },
    ],
  }),
  component: ProfilePage,
});

type ProfileTab = "edit" | "addresses" | "payments" | "preferences";

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("edit");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { user } = useStore();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 pb-24 lg:pb-16 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link to="/" className="hover:text-brand-leaf transition flex items-center gap-1">
          <Home className="size-3.5" /> Home
        </Link>
        <span>/</span>
        <Link to="/dashboard" className="hover:text-brand-leaf transition">Account</Link>
        <span>/</span>
        <span className="text-brand-leaf font-bold">Profile Settings</span>
      </div>

      {/* Profile Header Card */}
      <ProfileHeader />

      {/* Main Content Layout: Sidebar Navigation Tabs + Tab Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
        {/* Left: Navigation Tabs */}
        <aside className="space-y-2 rounded-3xl border border-border bg-card p-4 shadow-soft">
          {[
            { id: "edit", label: "Personal Information", icon: User, desc: "Name, email & bio" },
            { id: "addresses", label: "Saved Addresses", icon: MapPin, desc: "Shipping locations" },
            { id: "payments", label: "Saved Payment Methods", icon: CreditCard, desc: "Cards & UPI IDs" },
            { id: "preferences", label: "Language & Regional", icon: Globe, desc: "Currency & alerts" },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as ProfileTab)}
                className={`flex w-full items-start gap-3 rounded-2xl p-3.5 text-left transition ${
                  isActive
                    ? "bg-brand-leaf text-white shadow-sm"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className={`size-4.5 mt-0.5 shrink-0 ${isActive ? "text-white" : "text-brand-leaf"}`} />
                <div>
                  <p className="text-xs font-bold leading-tight">{item.label}</p>
                  <p className={`text-[10px] mt-0.5 ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}

          <div className="border-t border-border pt-3 mt-3 space-y-1">
            <Link
              to="/orders"
              className="flex w-full items-center justify-between rounded-2xl p-3 text-xs font-semibold text-foreground hover:bg-secondary transition"
            >
              <span className="flex items-center gap-2.5">
                <ShoppingBag className="size-4 text-brand-gold" /> My Orders Hub
              </span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Link>
          </div>

          {/* Danger Zone: Account Deletion Trigger */}
          <div className="border-t border-border pt-3 mt-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex w-full items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition"
            >
              <Trash2 className="size-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </aside>

        {/* Right: Active Tab Content */}
        <main className="space-y-6">
          {activeTab === "edit" && <EditProfileTab />}
          {activeTab === "addresses" && <AddressManagerTab />}
          {activeTab === "payments" && <SavedPaymentsTab />}
          {activeTab === "preferences" && <PreferencesTab />}
        </main>
      </div>

      {/* Feature 9: Account Delete Request Modal */}
      <AccountDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
