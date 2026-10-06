import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Check,
  Save,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Pencil,
  X,
  ShieldCheck,
  Sprout,
  FileText,
  BadgeCheck,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useStore } from "@/components/store-provider";
import { validateEmail, validatePhone } from "@/lib/validation";

const AGRI_INTEREST_TAGS = [
  "Bio Fertilizers",
  "Bio Pesticides",
  "Bio Fungicides",
  "Bio Stimulants",
  "Micro Nutrients",
  "Insecticides",
  "Botanical Extracts",
  "Water Solubles",
  "Agri Inputs",
  "Plant Growth Promoters"
];

const GENDER_OPTIONS = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "non-binary", label: "Non-Binary" },
  { id: "undisclosed", label: "Prefer not to say" },
];

export function EditProfileTab() {
  const { user, updateUserProfile } = useStore();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    dob: user?.dob || "",
    bio: user?.bio || "",
  });

  const [errors, setErrors] = useState<{ phone?: string; email?: string; emailSuggestion?: string }>({});
  const [touched, setTouched] = useState<{ phone?: boolean; email?: boolean }>({});

  const getCleanAgriInterests = (tags?: string[]) => {
    if (!tags || !Array.isArray(tags)) return ["Bio Fertilizers", "Bio Stimulants"];
    const valid = tags.filter((t) => AGRI_INTEREST_TAGS.includes(t));
    return valid.length > 0 ? valid : ["Bio Fertilizers", "Bio Stimulants"];
  };

  const [selectedDietary, setSelectedDietary] = useState<string[]>(() =>
    getCleanAgriInterests(user?.preferences?.dietary)
  );

  const resetFormToUser = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dob: user.dob || "",
        bio: user.bio || "",
      });
      if (user.preferences?.dietary) {
        setSelectedDietary(getCleanAgriInterests(user.preferences.dietary));
      }
    }
    setErrors({});
    setTouched({});
  };

  useEffect(() => {
    resetFormToUser();
  }, [user]);

  const [saving, setSaving] = useState(false);

  // Phone Validation
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: raw }));
    setTouched((prev) => ({ ...prev, phone: true }));

    const res = validatePhone(raw);
    if (!res.isValid && raw.length > 0) {
      setErrors((prev) => ({ ...prev, phone: res.error }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  const handlePhoneBlur = () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    const res = validatePhone(formData.phone);
    if (!res.isValid) {
      setErrors((prev) => ({ ...prev, phone: res.error || "Indian mobile number must be 10 digits starting with 6, 7, 8, or 9." }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  // Email Validation
  const handleEmailChange = (val: string) => {
    setFormData((prev) => ({ ...prev, email: val }));
    setTouched((prev) => ({ ...prev, email: true }));

    const res = validateEmail(val);
    if (!res.isValid && val.length > 0) {
      setErrors((prev) => ({
        ...prev,
        email: res.error,
        emailSuggestion: res.suggestion
      }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        delete next.emailSuggestion;
        return next;
      });
    }
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    const res = validateEmail(formData.email);
    if (!res.isValid) {
      setErrors((prev) => ({
        ...prev,
        email: res.error || "Please enter a valid email address.",
        emailSuggestion: res.suggestion
      }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        delete next.emailSuggestion;
        return next;
      });
    }
  };

  const handleApplyEmailSuggestion = () => {
    if (!errors.emailSuggestion) return;
    const match = errors.emailSuggestion.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (match) {
      const correctDomain = match[1];
      const localPart = formData.email.split("@")[0] || "";
      const corrected = `${localPart}@${correctDomain}`;
      setFormData((prev) => ({ ...prev, email: corrected }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        delete next.emailSuggestion;
        return next;
      });
      toast.success(`Updated email to ${corrected}`);
    }
  };

  const isPhoneValid = formData.phone.length === 10 && /^[6-9]\d{9}$/.test(formData.phone);
  const isEmailValid = Boolean(formData.email && validateEmail(formData.email).isValid);

  const toggleDietary = (tag: string) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCancelEdit = () => {
    resetFormToUser();
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneCheck = validatePhone(formData.phone);
    if (!phoneCheck.isValid) {
      setTouched((prev) => ({ ...prev, phone: true }));
      setErrors((prev) => ({ ...prev, phone: phoneCheck.error }));
      toast.error(phoneCheck.error || "Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.isValid) {
      setTouched((prev) => ({ ...prev, email: true }));
      setErrors((prev) => ({
        ...prev,
        email: emailCheck.error,
        emailSuggestion: emailCheck.suggestion
      }));
      toast.error(emailCheck.error || "Please enter a valid email address.");
      return;
    }

    setSaving(true);

    try {
      const cleanPhone = formData.phone.replace(/\D/g, "");
      const formattedPhone = cleanPhone.length === 10 ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}` : formData.phone;

      await updateUserProfile({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formattedPhone,
        gender: formData.gender,
        dob: formData.dob,
        bio: formData.bio,
        preferences: {
          dietary: selectedDietary,
          pinCode: user?.preferences?.pinCode || "380054",
          ...(user?.preferences?.notifications ? { notifications: user.preferences.notifications } : {})
        },
      });

      setIsEditing(false);
      toast.success("Profile details updated and saved to database successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const formattedDob = user?.dob
    ? new Date(user.dob).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : null;

  const currentGenderLabel =
    GENDER_OPTIONS.find((g) => g.id === user?.gender)?.label ||
    (user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : null);

  const cleanPhoneDisplay = user?.phone
    ? user.phone.length === 10
      ? `+91 ${user.phone.slice(0, 5)} ${user.phone.slice(5)}`
      : user.phone.startsWith("+91")
      ? user.phone
      : `+91 ${user.phone}`
    : "Not linked";

  // ==========================================
  // 1. VIEW MODE (Read-Only Account Overview)
  // ==========================================
  if (!isEditing) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-7 animate-in fade-in duration-200">
        {/* Top Header with Edit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Personal Information
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[11px] font-bold">
                <BadgeCheck className="size-3.5" /> Active Patron
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your verified account credentials, contact channels, and farm agriculture preferences.
            </p>
          </div>

          <Button
            type="button"
            variant="gold"
            size="default"
            onClick={() => setIsEditing(true)}
            className="rounded-full text-xs font-bold px-5 gap-2 shadow-sm shrink-0 self-start sm:self-auto hover:scale-[1.02] transition"
          >
            <Pencil className="size-3.5" /> Edit Profile Details
          </Button>
        </div>

        {/* View Grid Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Full Name Card */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 space-y-1.5 hover:border-brand-leaf/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <User className="size-3.5 text-brand-leaf" /> Full Name
              </span>
              <span className="text-[10px] font-semibold text-brand-leaf bg-brand-leaf/10 px-2 py-0.5 rounded-full">
                Primary Account
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground truncate">
              {user?.name || "Not provided"}
            </p>
          </div>

          {/* Email Address Card */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 space-y-1.5 hover:border-brand-leaf/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="size-3.5 text-brand-leaf" /> Email Address
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Verified
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground font-mono truncate">
              {user?.email || "Not provided"}
            </p>
          </div>

          {/* Mobile Number Card */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 space-y-1.5 hover:border-brand-leaf/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="size-3.5 text-brand-leaf" /> Mobile Number
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                SMS 2FA Linked
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground font-mono">
              {cleanPhoneDisplay}
            </p>
          </div>

          {/* Date of Birth Card */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 space-y-1.5 hover:border-brand-leaf/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="size-3.5 text-brand-leaf" /> Date of Birth
              </span>
              <span className="text-[10px] font-semibold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full">
                Birthday Perks
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground">
              {formattedDob || <span className="text-muted-foreground font-normal italic">Not specified</span>}
            </p>
          </div>

          {/* Gender Card */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 space-y-1.5 hover:border-brand-leaf/40 transition">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="size-3.5 text-brand-leaf" /> Gender
            </span>
            <p className="text-sm sm:text-base font-bold text-foreground">
              {currentGenderLabel || <span className="text-muted-foreground font-normal italic">Not specified</span>}
            </p>
          </div>

          {/* Membership Tier & Status */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 space-y-1.5 hover:border-brand-leaf/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-brand-gold" /> Membership Tier
              </span>
              <span className="text-[10px] font-bold text-brand-gold bg-brand-gold/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="size-3" /> {user?.tier || "Harvest Member"}
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground font-mono">
              Patron ID: <span className="text-brand-leaf font-semibold">{user?.id || "JAP-USR-8821"}</span>
            </p>
          </div>
        </div>

        {/* Patron Bio & Farming Practice Card */}
        <div className="rounded-2xl border border-border/80 bg-background/50 p-5 space-y-2 hover:border-brand-leaf/40 transition">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sprout className="size-3.5 text-brand-leaf" /> Patron Bio & Farming Practice
          </span>
          {user?.bio ? (
            <p className="text-xs sm:text-sm text-foreground leading-relaxed italic bg-card p-3 rounded-xl border border-border/60">
              "{user.bio}"
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No farming bio added yet. Click &quot;Edit Profile Details&quot; to add your crop cultivation, soil types, or farming practice.
            </p>
          )}
        </div>

        {/* Selected Agro Interests */}
        <div className="rounded-2xl border border-border/80 bg-background/50 p-5 space-y-3 hover:border-brand-leaf/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="size-3.5 text-brand-gold" /> Agro Product Interests & Crop Solutions
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">
              {selectedDietary.length} Selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedDietary.length > 0 ? (
              selectedDietary.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-leaf/10 text-brand-leaf border border-brand-leaf/25 px-3 py-1 text-xs font-semibold"
                >
                  <Check className="size-3" /> {tag}
                </span>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No agro interests selected yet.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Edit Trigger */}
        <div className="pt-2 flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="rounded-full text-xs font-semibold px-5 gap-1.5 border-border hover:bg-secondary"
          >
            <Pencil className="size-3.5 text-brand-leaf" /> Edit Information
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. EDIT MODE (Interactive Edit Form)
  // ==========================================
  return (
    <form onSubmit={handleSave} className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
      {/* Top Header with Cancel Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl font-bold text-foreground">
              Edit Personal Information
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold/15 text-brand-gold px-2.5 py-0.5 text-[10px] font-bold uppercase">
              Editing Mode
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Update your contact details, bio, and farm agriculture preferences.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCancelEdit}
          className="rounded-full text-xs font-semibold px-4 gap-1.5 shrink-0 self-start sm:self-auto border-border"
        >
          <X className="size-3.5" /> Cancel
        </Button>
      </div>

      {/* Grid: Name, Email, Phone, Gender, DOB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User className="size-3.5 text-brand-leaf" /> Full Name *
          </label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-11 rounded-2xl border border-input bg-card px-4 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf font-medium transition"
          />
        </div>

        {/* Email Address with real-time validation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="size-3.5 text-brand-leaf" /> Email Address *
            </label>
            {isEmailValid ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Valid Email
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>
          <div className="relative">
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="kameswarip98@gmail.com"
              className={`w-full h-11 rounded-2xl border bg-card px-4 text-xs sm:text-sm text-foreground outline-none font-medium transition ${
                touched.email && errors.email
                  ? "border-destructive ring-1 ring-destructive/20 text-destructive bg-destructive/5"
                  : isEmailValid
                  ? "border-emerald-500/70 focus:border-emerald-600 bg-emerald-50/10"
                  : "border-input focus:border-brand-leaf"
              }`}
            />
            {isEmailValid && (
              <CheckCircle2 className="absolute right-3.5 top-3.5 size-4 text-emerald-600 pointer-events-none" />
            )}
          </div>
          {touched.email && errors.email && (
            <div className="mt-1 space-y-1">
              <p className="text-[11px] text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="size-3 shrink-0" /> {errors.email}
              </p>
              {errors.emailSuggestion && (
                <button
                  type="button"
                  onClick={handleApplyEmailSuggestion}
                  className="text-[11px] text-brand-leaf hover:underline font-semibold flex items-center gap-1 text-left"
                >
                  💡 {errors.emailSuggestion} (Click to apply)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Phone Number with real-time Indian mobile validation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="size-3.5 text-brand-leaf" /> Mobile Number *
            </label>
            {isPhoneValid ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Valid Indian Mobile
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                SMS 2FA Linked
              </span>
            )}
          </div>
          <div className={`flex items-center rounded-2xl border bg-card shadow-xs transition ${
            touched.phone && errors.phone
              ? "border-destructive ring-1 ring-destructive/20 text-destructive bg-destructive/5"
              : isPhoneValid
              ? "border-emerald-500/70 focus-within:border-emerald-600 bg-emerald-50/10"
              : "border-input focus-within:border-brand-leaf"
          }`}>
            <span className="inline-flex items-center gap-1.5 border-r border-border/70 px-3 py-2.5 text-xs font-semibold text-muted-foreground select-none pointer-events-none shrink-0 whitespace-nowrap">
              <span className="text-sm leading-none shrink-0">🇮🇳</span>
              <span className="shrink-0 font-semibold">+91</span>
            </span>
            <input
              required
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="93114 16225"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={handlePhoneBlur}
              className="w-full min-w-0 h-11 rounded-r-2xl bg-transparent px-3 text-xs sm:text-sm text-foreground outline-none font-mono font-semibold"
            />
            {isPhoneValid && (
              <CheckCircle2 className="mr-3 size-4 text-emerald-600 pointer-events-none shrink-0" />
            )}
          </div>
          {touched.phone && errors.phone ? (
            <p className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-1">
              <AlertCircle className="size-3 shrink-0" /> {errors.phone}
            </p>
          ) : formData.phone.length > 0 && formData.phone.length < 10 ? (
            <p className="text-[10px] text-muted-foreground mt-1">
              Enter 10-digit mobile number ({formData.phone.length}/10 digits)
            </p>
          ) : null}
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
            {GENDER_OPTIONS.map((g) => (
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
            Patron Bio & Farming Practice
          </label>
          <textarea
            rows={2}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about your crop cultivation, soil types, or farming requirements..."
            className="w-full rounded-2xl border border-input bg-card p-3 text-xs sm:text-sm text-foreground outline-none focus:border-brand-leaf"
          />
        </div>
      </div>

      {/* Agriculture Interests */}
      <div className="pt-4 border-t border-border space-y-3">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Heart className="size-3.5 text-brand-gold" /> Agro Product Interests & Crop Solutions
        </label>
        <p className="text-xs text-muted-foreground">
          Select agricultural solutions you frequently use. We tailor seasonal organic dosage schedules and product advisories to these categories.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {AGRI_INTEREST_TAGS.map((tag) => {
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

      {/* Footer Save & Cancel Buttons */}
      <div className="pt-4 border-t border-border flex flex-wrap items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={handleCancelEdit}
          disabled={saving}
          className="rounded-full text-xs font-semibold px-5 border-border"
        >
          Cancel
        </Button>
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
