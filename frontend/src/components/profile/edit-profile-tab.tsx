import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, Heart, ShieldCheck, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";

const DIETARY_TAGS = [
  "Wood-Pressed Cold Oils",
  "A2 Gir Cow Bilona Ghee",
  "Organic Heirloom Millets",
  "Unpolished Native Dals",
  "Vedic Single-Origin Spices",
  "Raw Forest Honey",
  "Natural Jaggery",
];

export function EditProfileTab() {
  const { user, updateUserProfile } = useStore();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: (user as any)?.gender || "",
    dob: (user as any)?.dob || "",
    bio: (user as any)?.bio || "",
  });

  const [selectedDietary, setSelectedDietary] = useState<string[]>(
    user?.preferences?.dietary || [
      "Wood-Pressed Cold Oils",
      "A2 Gir Cow Bilona Ghee",
    ]
  );

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: (user as any).gender || "",
        dob: (user as any).dob || "",
        bio: (user as any).bio || "",
      });
      if (user.preferences?.dietary) {
        setSelectedDietary(user.preferences.dietary);
      }
    }
  }, [user]);

  const [saving, setSaving] = useState(false);

  const toggleDietary = (tag: string) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      updateUserProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferences: {
          dietary: selectedDietary,
          pinCode: user?.preferences?.pinCode || "380054",
          ...(user?.preferences?.notifications ? { notifications: user.preferences.notifications } : {})
        },
      });
      setSaving(false);
      toast.success("Profile information updated successfully!");
    }, 400);
  };

  return (
    <form onSubmit={handleSave} className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
      <div className="border-b border-border pb-4">
        <h3 className="font-display text-xl font-bold text-foreground">
          Personal Information
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Update your contact details, bio, and farm-to-table dietary preferences.
        </p>
      </div>

      {/* Grid: Name, Email, Phone, Gender, DOB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User className="size-3.5 text-brand-leaf" /> Full Name
          </label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-11 rounded-2xl border border-input bg-card px-4 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf font-medium transition"
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5 text-brand-leaf" /> Email Address
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </label>
          <input
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-11 rounded-2xl border border-input bg-card px-4 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf font-medium transition"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5 text-brand-leaf" /> Mobile Number
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              SMS 2FA Linked
            </span>
          </label>
          <input
            required
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full h-11 rounded-2xl border border-input bg-card px-4 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf font-medium transition font-mono"
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="size-3.5 text-brand-leaf" /> Date of Birth
          </label>
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            className="w-full h-11 rounded-2xl border border-input bg-card px-4 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf font-medium transition"
          />
        </div>

        {/* Gender */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Gender
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { id: "female", label: "Female" },
              { id: "male", label: "Male" },
              { id: "non-binary", label: "Non-Binary" },
              { id: "undisclosed", label: "Prefer not to say" },
            ].map((g) => (
              <label
                key={g.id}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs cursor-pointer transition ${
                  formData.gender === g.id
                    ? "border-brand-leaf bg-brand-leaf/10 font-bold text-foreground"
                    : "border-border hover:bg-secondary text-muted-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={g.id}
                  checked={formData.gender === g.id}
                  onChange={() => setFormData({ ...formData, gender: g.id })}
                  className="accent-brand-leaf"
                />
                <span>{g.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Patron Bio & Cooking Philosophy
          </label>
          <textarea
            rows={2}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full rounded-2xl border border-input bg-card p-3 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf"
          />
        </div>
      </div>

      {/* Dietary / Lifestyle Interests */}
      <div className="pt-4 border-t border-border space-y-3">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Heart className="size-3.5 text-brand-gold" /> Organic Pantry Preferences
        </label>
        <p className="text-xs text-muted-foreground">
          Select items you frequently cook with. We tailor single-origin harvest batches and seasonal recipes to these interests.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {DIETARY_TAGS.map((tag) => {
            const isSelected = selectedDietary.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleDietary(tag)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-brand-leaf text-white shadow-xs"
                    : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                }`}
              >
                {isSelected && <Check className="size-3" />}
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Save Button */}
      <div className="pt-4 border-t border-border flex items-center justify-end">
        <Button
          type="submit"
          variant="gold"
          size="default"
          disabled={saving}
          className="rounded-full text-xs font-bold px-6 gap-2 shadow-sm"
        >
          <Save className="size-4" />
          {saving ? "Saving Changes..." : "Save Profile Details"}
        </Button>
      </div>
    </form>
  );
}
