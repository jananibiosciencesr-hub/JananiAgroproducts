import React, { useState } from "react";
import { Globe, DollarSign, Bell, MessageSquare, Mail, Smartphone, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SupportedCurrency, SupportedLanguage } from "./types";

export function PreferencesTab() {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [currency, setCurrency] = useState<SupportedCurrency>("INR");
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Regional and notification preferences saved!");
    }, 400);
  };

  return (
    <form onSubmit={handleSave} className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-8">
      {/* 1. Language & Regional Settings */}
      <div className="space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Globe className="size-5 text-brand-leaf" /> Language & Regional Settings
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose your preferred language for invoices, SMS alerts, and catalog navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Preferred Language
            </label>
            <div className="space-y-2">
              {[
                { id: "en", label: "English", sub: "Standard Indian English" },
                { id: "gu", label: "ગુજરાતી", sub: "Gujarati (Native Saurashtra)" },
                { id: "hi", label: "हिन्दी", sub: "Hindi (Devanagari)" },
                { id: "mr", label: "मराठी", sub: "Marathi" },
              ].map((lang) => (
                <label
                  key={lang.id}
                  className={`flex items-center justify-between rounded-2xl border p-3 text-xs cursor-pointer transition ${
                    language === lang.id
                      ? "border-brand-leaf bg-brand-leaf/10 font-bold text-foreground"
                      : "border-border hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="language"
                      value={lang.id}
                      checked={language === lang.id}
                      onChange={() => setLanguage(lang.id as any)}
                      className="accent-brand-leaf"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{lang.label}</p>
                      <p className="text-[10px] text-muted-foreground">{lang.sub}</p>
                    </div>
                  </div>
                  {language === lang.id && <Check className="size-3.5 text-brand-leaf" />}
                </label>
              ))}
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Display Currency
            </label>
            <div className="space-y-2">
              {[
                { id: "INR", label: "₹ INR", sub: "Indian Rupee (Default Domestic)" },
                { id: "USD", label: "$ USD", sub: "United States Dollar (NRI / Export)" },
                { id: "EUR", label: "€ EUR", sub: "Euro (European Union)" },
                { id: "GBP", label: "£ GBP", sub: "British Pound" },
                { id: "AED", label: "د.إ AED", sub: "United Arab Emirates Dirham" },
              ].map((curr) => (
                <label
                  key={curr.id}
                  className={`flex items-center justify-between rounded-2xl border p-3 text-xs cursor-pointer transition ${
                    currency === curr.id
                      ? "border-brand-gold bg-brand-gold/10 font-bold text-foreground"
                      : "border-border hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="currency"
                      value={curr.id}
                      checked={currency === curr.id}
                      onChange={() => setCurrency(curr.id as any)}
                      className="accent-brand-gold"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{curr.label}</p>
                      <p className="text-[10px] text-muted-foreground">{curr.sub}</p>
                    </div>
                  </div>
                  {currency === curr.id && <Check className="size-3.5 text-brand-gold" />}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Notification Preferences */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="border-b border-border pb-3">
          <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Bell className="size-5 text-brand-gold" /> Communication & Dispatch Alerts
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage channels through which Janani Agro sends real-time order tracking and harvest announcements.
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-start justify-between gap-4 rounded-2xl border border-border p-4 hover:bg-secondary/40 transition cursor-pointer">
            <div className="flex items-start gap-3">
              <MessageSquare className="size-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-foreground">WhatsApp Dispatch & Delivery OTP</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Receive instant WhatsApp alerts when your order leaves Rajkot Hub, with live rider contact and delivery handover OTP.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="accent-emerald-600 size-4 mt-1"
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-border p-4 hover:bg-secondary/40 transition cursor-pointer">
            <div className="flex items-start gap-3">
              <Smartphone className="size-5 text-brand-leaf mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-foreground">SMS 2FA & Gate Code Notifications</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Critical account verification codes and carrier out-for-delivery SMS messages.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="accent-brand-leaf size-4 mt-1"
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-border p-4 hover:bg-secondary/40 transition cursor-pointer">
            <div className="flex items-start gap-3">
              <Mail className="size-5 text-brand-gold mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Seasonal Harvest Reports & New Batches</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Curated organic recipes, farm harvest logs, and monthly patron loyalty perks.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailDigest}
              onChange={(e) => setEmailDigest(e.target.checked)}
              className="accent-brand-gold size-4 mt-1"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-border flex justify-end">
        <Button
          type="submit"
          variant="gold"
          disabled={saving}
          className="rounded-full text-xs font-bold px-6 gap-2"
        >
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </form>
  );
}
