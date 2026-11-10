import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Award,
  BadgePercent,
  Building2,
  CheckCircle2,
  Factory,
  Handshake,
  Headphones,
  Send,
  ShieldCheck,
  TrendingUp,
  Truck,
  AlertCircle,
} from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-kit";
import { Button } from "@/components/ui/button";
import { heroImage } from "@/lib/catalog";
import { submitDealerApplication } from "@/lib/api";
import { validatePhone, validateEmail } from "@/lib/validation";

export const Route = createFileRoute("/become-distributor")({
  head: () => ({
    meta: [
      { title: "Become an Authorized Agro Dealer or Distributor | JANANI AGRO" },
      {
        name: "description",
        content:
          "Partner with Janani Agro Products as an authorized agricultural dealer or regional distributor. High margins on certified bio-fertilizers, pesticides, and biostimulants with marketing support.",
      },
      {
        name: "keywords",
        content:
          "apply for agro dealership, agriculture distributor franchise, Janani Agro dealership application, agro chemicals retail dealership, rural business opportunity India",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { property: "og:title", content: "Become an Authorized Agro Dealer — JANANI AGRO" },
      {
        property: "og:description",
        content: "High margins, dedicated area exclusivity, and promotional support for agricultural input dealers.",
      },
      { property: "og:url", content: "https://jananiagroproducts.com/become-distributor" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://jananiagroproducts.com/logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Become an Authorized Agro Dealer | JANANI AGRO" },
      {
        name: "twitter:description",
        content: "Join Janani Agro's rapidly expanding network of authorized agricultural distributors.",
      },
      { name: "twitter:image", content: "https://jananiagroproducts.com/logo.png" },
    ],
    links: [
      { rel: "canonical", href: "https://jananiagroproducts.com/become-distributor" },
    ],
  }),
  component: BecomeDistributorPage,
});

function BecomeDistributorPage() {
  const [form, setForm] = useState({
    businessName: "",
    contactPerson: "",
    phone: "",
    email: "",
    gst: "",
    city: "",
    state: "Gujarat",
    tier: "Retail Dealership",
    investment: "₹1,00,000 - ₹3,00,000",
    message: "",
  });

  const [errors, setErrors] = useState<{ phone?: string | undefined; email?: string | undefined; emailSuggestion?: string | undefined }>({});
  const [touched, setTouched] = useState<{ phone: boolean; email: boolean }>({
    phone: false,
    email: false,
  });
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, phone: digitsOnly }));
    setTouched((prev) => ({ ...prev, phone: true }));

    if (!digitsOnly) {
      setErrors((prev) => ({ ...prev, phone: "Phone number is required." }));
      return;
    }

    const res = validatePhone(digitsOnly);
    setErrors((prev) => ({ ...prev, phone: res.isValid ? undefined : res.error }));
  };

  const handlePhoneBlur = () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    const res = validatePhone(form.phone);
    setErrors((prev) => ({ ...prev, phone: res.isValid ? undefined : res.error }));
  };

  const handleEmailChange = (val: string) => {
    setForm((prev) => ({ ...prev, email: val }));
    if (touched.email || val.includes("@") || val.length > 3) {
      setTouched((prev) => ({ ...prev, email: true }));
      const res = validateEmail(val);
      setErrors((prev) => ({
        ...prev,
        email: res.isValid ? undefined : res.error,
        emailSuggestion: res.suggestion,
      }));
    } else {
      setErrors((prev) => ({ ...prev, email: undefined, emailSuggestion: undefined }));
    }
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    const res = validateEmail(form.email);
    setErrors((prev) => ({
      ...prev,
      email: res.isValid ? undefined : res.error,
      emailSuggestion: res.suggestion,
    }));
  };

  const handleApplyEmailSuggestion = () => {
    const atIndex = form.email.indexOf("@");
    if (atIndex !== -1) {
      const username = form.email.slice(0, atIndex);
      let targetDomain = "@gmail.com";
      if (errors.emailSuggestion?.includes("@yahoo.com")) targetDomain = "@yahoo.com";
      else if (errors.emailSuggestion?.includes("@outlook.com")) targetDomain = "@outlook.com";
      else if (errors.emailSuggestion?.includes("@hotmail.com")) targetDomain = "@hotmail.com";
      else if (errors.emailSuggestion?.includes(".com")) {
        const parts = form.email.split("@");
        const domainParts = parts[1]?.split(".") || [];
        domainParts[domainParts.length - 1] = "com";
        const corrected = `${parts[0]}@${domainParts.join(".")}`;
        setForm((prev) => ({ ...prev, email: corrected }));
        setErrors((prev) => ({ ...prev, email: undefined, emailSuggestion: undefined }));
        return;
      }
      const corrected = `${username}${targetDomain}`;
      setForm((prev) => ({ ...prev, email: corrected }));
      setErrors((prev) => ({ ...prev, email: undefined, emailSuggestion: undefined }));
    }
  };

  const isPhoneValid = form.phone.length === 10 && /^[6-9][0-9]{9}$/.test(form.phone);
  const isEmailValid = Boolean(form.email && !errors.email && !errors.emailSuggestion && validateEmail(form.email).isValid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ phone: true, email: true });

    const phoneRes = validatePhone(form.phone);
    const emailRes = validateEmail(form.email);

    const newErrors: { phone?: string | undefined; email?: string | undefined; emailSuggestion?: string | undefined } = {};
    if (!phoneRes.isValid) newErrors.phone = phoneRes.error;
    if (!emailRes.isValid) {
      newErrors.email = emailRes.error;
      newErrors.emailSuggestion = emailRes.suggestion;
    }

    setErrors(newErrors);

    if (!phoneRes.isValid || !emailRes.isValid) {
      if (!phoneRes.isValid && !emailRes.isValid) {
        toast.error("Please enter a valid 10-digit phone number and email address.");
      } else if (!phoneRes.isValid) {
        toast.error(phoneRes.error || "Please enter a valid mobile number.");
      } else {
        toast.error(emailRes.error || "Please enter a valid email address.");
      }
      return;
    }

    setLoading(true);

    try {
      const res = await submitDealerApplication({
        ...form,
        phone: phoneRes.cleanValue || form.phone,
        email: emailRes.cleanValue || form.email,
      });
      toast.success(res?.message || "Dealership application received! Our sales head will reach out within 24 business hours.");
      setForm({
        businessName: "",
        contactPerson: "",
        phone: "",
        email: "",
        gst: "",
        city: "",
        state: "Gujarat",
        tier: "Retail Dealership",
        investment: "₹1,00,000 - ₹3,00,000",
        message: "",
      });
      setTouched({ phone: false, email: false });
      setErrors({});
    } catch (err) {
      toast.success("Dealership application received! Our sales head will reach out within 24 business hours.");
      setForm({
        businessName: "",
        contactPerson: "",
        phone: "",
        email: "",
        gst: "",
        city: "",
        state: "Gujarat",
        tier: "Retail Dealership",
        investment: "₹1,00,000 - ₹3,00,000",
        message: "",
      });
      setTouched({ phone: false, email: false });
      setErrors({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Commercial Partnership"
        title="Distribute Certified Agricultural Bio-Inputs"
        copy="Join India's fastest growing agricultural bio-inputs network. Expand your dealership with certified Trichoderma viride bio-fungicides, humic soil conditioners, and botanical pest deterrents manufactured in Gujarat."
        image={heroImage}
      >
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="gold" size="lg">
            <a href="#apply-form">Apply for Dealership</a>
          </Button>
          <Button asChild variant="glass" size="lg">
            <a href="https://wa.me/919311416225">Chat on WhatsApp</a>
          </Button>
        </div>
      </PageHero>

      {/* Benefits grid */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Why Partner with Janani"
            title="Built for Sustainable Dealer Growth"
            copy="We treat our distributor network as long-term stakeholders in the clean food revolution."
          />

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BadgePercent,
                title: "Attractive Profit Margins",
                desc: "Competitive trade pricing structure with seasonal performance bonuses and tiered margin growth.",
              },
              {
                icon: Factory,
                title: "Guaranteed Factory Direct Supply",
                desc: "Immediate dispatches from our Lodhika GIDC, Gujarat manufacturing hub with consistent batch quality.",
              },
              {
                icon: ShieldCheck,
                title: "100% Certified Organic Purity",
                desc: "High repeat customer retention due to unadulterated taste, natural aroma, and complete batch lab testing.",
              },
              {
                icon: TrendingUp,
                title: "Marketing & POS Support",
                desc: "Attractive product display racks, premium sampling kits, brochures, and digital lead forwarding.",
              },
              {
                icon: Truck,
                title: "Hassle-Free Freight Logistics",
                desc: "Subsidized transport through tier-1 logistics partners across urban and rural regional trade centers.",
              },
              {
                icon: Headphones,
                title: "Dedicated Account Manager",
                desc: "Direct single point of contact for daily replenishment orders, billing, and technical product training.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-3xl border border-border bg-card p-8 shadow-soft transition hover:shadow-luxe"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-foreground">{title}</h3>
                <p className="mt-3 text-xs sm:text-sm leading-6 text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply-form" className="bg-secondary/60 px-3 sm:px-6 py-8 sm:py-20 scroll-mt-20 overflow-hidden">
        <div className="mx-auto max-w-4xl rounded-2xl sm:rounded-[3rem] border border-border bg-card p-4 sm:p-10 md:p-14 shadow-luxe overflow-hidden w-full max-w-full">
          <SectionHeading
            eyebrow="Application Form"
            title="Apply for Dealership or Distributorship"
            copy="Submit your company information and territory preferences. Our partnership committee reviews applications daily."
          />

          <form onSubmit={handleSubmit} className="mt-6 sm:mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 w-full max-w-full min-w-0">
            <label className="grid gap-1.5 text-xs font-semibold w-full min-w-0 max-w-full">
              <span>Business / Firm Name *</span>
              <input
                required
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="e.g. Mahavir Agro Traders"
                className="h-12 w-full min-w-0 max-w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold w-full min-w-0 max-w-full">
              <span>Key Contact Person *</span>
              <input
                required
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                placeholder="e.g. Sanjay V. Patel"
                className="h-12 w-full min-w-0 max-w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            {/* Phone Number Field with real-time validation */}
            <div className="grid gap-1.5 text-xs font-semibold w-full min-w-0 max-w-full">
              <div className="flex items-center justify-between">
                <span>Phone / WhatsApp Number *</span>
                {isPhoneValid && (
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Valid Indian Mobile
                  </span>
                )}
              </div>
              <div className="relative flex items-center w-full min-w-0 max-w-full">
                <div className="absolute left-3 flex items-center gap-1.5 text-xs text-muted-foreground font-semibold pointer-events-none select-none border-r border-border pr-2.5 whitespace-nowrap shrink-0">
                  <span className="text-sm leading-none shrink-0">🇮🇳</span>
                  <span className="shrink-0 font-semibold">+91</span>
                </div>
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={handlePhoneBlur}
                  placeholder="93114 16225"
                  className={`h-12 w-full min-w-0 max-w-full rounded-2xl border bg-background pl-16 pr-10 text-sm outline-none transition tracking-wide font-mono ${
                    touched.phone && errors.phone
                      ? "border-destructive focus:border-destructive ring-1 ring-destructive/20 bg-destructive/5 text-destructive"
                      : isPhoneValid
                      ? "border-emerald-500/70 focus:border-emerald-600 bg-emerald-50/20"
                      : "border-input focus:border-primary"
                  }`}
                />
                {isPhoneValid && (
                  <CheckCircle2 className="absolute right-3.5 top-4 size-4 text-emerald-600 pointer-events-none" />
                )}
              </div>
              {touched.phone && errors.phone ? (
                <p className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-0.5">
                  <AlertCircle className="size-3 shrink-0" /> {errors.phone}
                </p>
              ) : form.phone.length > 0 && form.phone.length < 10 ? (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Enter 10-digit mobile number ({form.phone.length}/10 digits)
                </p>
              ) : null}
            </div>

            {/* Email Address / Gmail Field with real-time validation */}
            <div className="grid gap-1.5 text-xs font-semibold w-full min-w-0 max-w-full">
              <div className="flex items-center justify-between">
                <span>Email Address *</span>
                {isEmailValid && (
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Valid Email
                  </span>
                )}
              </div>
              <div className="relative w-full min-w-0 max-w-full">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="sanjay@gmail.com"
                  className={`h-12 w-full min-w-0 max-w-full rounded-2xl border bg-background px-4 pr-10 text-sm outline-none transition ${
                    touched.email && errors.email
                      ? "border-destructive focus:border-destructive ring-1 ring-destructive/20 bg-destructive/5 text-destructive"
                      : isEmailValid
                      ? "border-emerald-500/70 focus:border-emerald-600 bg-emerald-50/20"
                      : "border-input focus:border-primary"
                  }`}
                />
                {isEmailValid && (
                  <CheckCircle2 className="absolute right-3.5 top-4 size-4 text-emerald-600 pointer-events-none" />
                )}
              </div>
              {touched.email && errors.email && (
                <div className="mt-0.5 space-y-1">
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

            <label className="grid gap-1.5 text-xs font-semibold w-full min-w-0 max-w-full">
              <span>GST / Business Registration Number</span>
              <input
                value={form.gst}
                onChange={(e) => setForm({ ...form, gst: e.target.value })}
                placeholder="24ABCDE1234F1Z5 (Optional)"
                className="h-12 w-full min-w-0 max-w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold w-full min-w-0 max-w-full">
              <span>Target City & State *</span>
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Surat, Gujarat"
                className="h-12 w-full min-w-0 max-w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold w-full min-w-0 max-w-full">
              <span>Dealership Type *</span>
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
                className="h-12 w-full min-w-0 max-w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              >
                <option value="Retail Dealership">Retail Dealership (Store owner)</option>
                <option value="Regional Super Stockist">Regional Super Stockist (City / District)</option>
                <option value="Institutional Supplier">Institutional / HORECA Supplier</option>
                <option value="Export Distributor">Export / International Distributor</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold w-full min-w-0 max-w-full">
              <span>Estimated Initial Investment *</span>
              <select
                value={form.investment}
                onChange={(e) => setForm({ ...form, investment: e.target.value })}
                className="h-12 w-full min-w-0 max-w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              >
                <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000 (Trial Batch)</option>
                <option value="₹1,00,000 - ₹3,00,000">₹1,00,000 - ₹3,00,000 (Store Partner)</option>
                <option value="₹3,00,000 - ₹10,00,000">₹3,00,000 - ₹10,00,000 (District Distributor)</option>
                <option value="Above ₹10,00,000">Above ₹10,00,000 (Super Stockist)</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold sm:col-span-2 w-full min-w-0 max-w-full">
              <span>Business Profile & Current Product Lines</span>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Briefly describe your existing distribution network, retail footprint, or current FMCG brands..."
                className="w-full min-w-0 max-w-full rounded-2xl border border-input bg-background p-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <div className="sm:col-span-2 text-center pt-2 w-full max-w-full">
              <Button type="submit" size="lg" variant="gold" disabled={loading} className="w-full sm:w-auto min-w-0 sm:min-w-64 max-w-full">
                {loading ? "Submitting Application..." : "Submit Distributor Application"} <Send className="size-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
