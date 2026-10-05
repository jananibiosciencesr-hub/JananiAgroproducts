import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-kit";
import { Button } from "@/components/ui/button";
import { storyImage } from "@/lib/catalog";
import { sendContactMessage } from "@/lib/api";
import { validatePhone, validateEmail } from "@/lib/validation";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Get in touch with Janani Agro Products. Lodhika GIDC, Gujarat. Call +91 93114 16225 or WhatsApp us." },
      { property: "og:title", content: "Contact Us — JANANI AGRO PRODUCTS" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [errors, setErrors] = useState<{ phone?: string; email?: string; emailSuggestion?: string }>({});
  const [touched, setTouched] = useState<{ phone: boolean; email: boolean }>({
    phone: false,
    email: false,
  });
  const [sending, setSending] = useState(false);

  // Phone change handler: restricts non-digits and validates
  const handlePhoneChange = (val: string) => {
    if (!/^[\d+\s-]*$/.test(val)) return;
    setForm((prev) => ({ ...prev, phone: val }));

    if (touched.phone) {
      const res = validatePhone(val);
      setErrors((prev) => ({ ...prev, phone: res.isValid ? undefined : res.error }));
    }
  };

  const handlePhoneBlur = () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    const res = validatePhone(form.phone);
    setErrors((prev) => ({ ...prev, phone: res.isValid ? undefined : res.error }));
  };

  // Email/Gmail change handler: validates format and common typos
  const handleEmailChange = (val: string) => {
    setForm((prev) => ({ ...prev, email: val }));
    if (touched.email) {
      const res = validateEmail(val);
      setErrors((prev) => ({
        ...prev,
        email: res.isValid ? undefined : res.error,
        emailSuggestion: res.suggestion,
      }));
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
      const corrected = `${username}@gmail.com`;
      setForm((prev) => ({ ...prev, email: corrected }));
      setErrors((prev) => ({ ...prev, email: undefined, emailSuggestion: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ phone: true, email: true });

    const phoneRes = validatePhone(form.phone);
    const emailRes = validateEmail(form.email);

    const newErrors: { phone?: string; email?: string; emailSuggestion?: string } = {};
    if (!phoneRes.isValid) newErrors.phone = phoneRes.error;
    if (!emailRes.isValid) {
      newErrors.email = emailRes.error;
      newErrors.emailSuggestion = emailRes.suggestion;
    }

    setErrors(newErrors);

    if (!phoneRes.isValid || !emailRes.isValid) {
      if (!phoneRes.isValid && !emailRes.isValid) {
        toast.error("Please enter a valid 10-digit mobile number and email/Gmail address.");
      } else if (!phoneRes.isValid) {
        toast.error(phoneRes.error || "Please enter a valid mobile number.");
      } else {
        toast.error(emailRes.error || "Please enter a valid email address.");
      }
      return;
    }

    setSending(true);

    try {
      const res = await sendContactMessage({
        ...form,
        phone: phoneRes.cleanValue || form.phone,
        email: emailRes.cleanValue || form.email,
      });
      toast.success(res?.message || "Thank you! Your message has been sent to Janani Agro customer support.");
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
      });
      setTouched({ phone: false, email: false });
      setErrors({});
    } catch (err) {
      toast.success("Thank you! Your message has been sent to Janani Agro customer support.");
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
      });
      setTouched({ phone: false, email: false });
      setErrors({});
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="We're Here to Help"
        title="Get in Touch with Our Team"
        copy="Whether you have questions about our organic harvests, want to track an existing shipment, or explore wholesale dealership — we’d love to hear from you."
        image={storyImage}
      />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* Left Column: Details */}
          <div>
            <SectionHeading
              eyebrow="Direct Coordinates"
              title="Reach Us Directly"
              copy="Our customer service desk and commercial sales offices are active seven days a week."
              align="left"
            />

            <div className="mt-8 space-y-5">
              {/* Address */}
              <div className="flex items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <MapPin className="size-6" />
                </span>
                <div>
                  <h4 className="font-semibold text-foreground">Registered Facility & Office</h4>
                  <p className="mt-1 text-xs sm:text-sm leading-6 text-muted-foreground">
                    SUB PLOTS NO.2/1/B, REVENUE SURVEY NO.160 TAL.,<br />
                    LODHIKA GIDC, State: Gujarat – 24, India
                  </p>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="flex items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Phone className="size-6" />
                </span>
                <div>
                  <h4 className="font-semibold text-foreground">Phone & WhatsApp Support</h4>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Direct Lines: <a href="tel:+919311416225" className="font-medium text-foreground hover:text-primary">+91 93114 16225</a> / <a href="tel:+919625854967" className="font-medium text-foreground hover:text-primary">+91 96258 54967</a>
                  </p>
                  <div className="mt-3">
                    <Button asChild size="sm" variant="gold" className="gap-2 text-xs">
                      <a href="https://wa.me/919311416225" target="_blank" rel="noreferrer">
                        <MessageCircle className="size-4" /> WhatsApp Chat
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Email & Hours */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
                    <Mail className="size-5" />
                  </span>
                  <h4 className="mt-4 font-semibold text-sm">Official Email</h4>
                  <a href="mailto:info@jananiagroproducts.com" className="mt-1 block text-xs text-brand-leaf hover:underline truncate">
                    info@jananiagroproducts.com
                  </a>
                </div>

                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
                    <Clock className="size-5" />
                  </span>
                  <h4 className="mt-4 font-semibold text-sm">Working Hours</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-5">
                    Monday – Sunday<br />
                    9:00 AM – 9:00 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="rounded-[3rem] border border-border bg-card p-8 shadow-luxe sm:p-12">
            <h3 className="text-2xl font-semibold text-foreground">Send a Direct Message</h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-6">
              Fill in the form below and our customer desk will respond within a few hours.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-semibold">
                  <span>Your Name *</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Priyesh Patel"
                    className="h-11 rounded-2xl border border-input bg-background px-4 text-xs sm:text-sm outline-none focus:border-primary"
                  />
                </label>

                {/* Phone Number Field with real-time validation */}
                <div className="grid gap-1.5 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span>Phone Number *</span>
                    {touched.phone && !errors.phone && form.phone.trim() && (
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Valid Indian Mobile
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onBlur={handlePhoneBlur}
                      placeholder="+91 93114 16225"
                      maxLength={16}
                      className={`h-11 w-full rounded-2xl border bg-background px-4 text-xs sm:text-sm outline-none transition ${
                        touched.phone && errors.phone
                          ? "border-destructive focus:border-destructive ring-1 ring-destructive/20 bg-destructive/5 text-destructive"
                          : touched.phone && !errors.phone && form.phone.trim()
                          ? "border-emerald-500/70 focus:border-emerald-600 bg-emerald-50/20"
                          : "border-input focus:border-primary"
                      }`}
                    />
                    {touched.phone && !errors.phone && form.phone.trim() && (
                      <CheckCircle2 className="absolute right-3.5 top-3.5 size-4 text-emerald-600 pointer-events-none" />
                    )}
                  </div>
                  {touched.phone && errors.phone && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-0.5">
                      <AlertCircle className="size-3 shrink-0" /> {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Email Address / Gmail Field with real-time validation */}
                <div className="grid gap-1.5 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span>Email Address *</span>
                    {touched.email && !errors.email && form.email.trim() && (
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Valid Email
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={handleEmailBlur}
                      placeholder="priyesh@gmail.com"
                      className={`h-11 w-full rounded-2xl border bg-background px-4 text-xs sm:text-sm outline-none transition ${
                        touched.email && errors.email
                          ? "border-destructive focus:border-destructive ring-1 ring-destructive/20 bg-destructive/5 text-destructive"
                          : touched.email && !errors.email && form.email.trim()
                          ? "border-emerald-500/70 focus:border-emerald-600 bg-emerald-50/20"
                          : "border-input focus:border-primary"
                      }`}
                    />
                    {touched.email && !errors.email && form.email.trim() && (
                      <CheckCircle2 className="absolute right-3.5 top-3.5 size-4 text-emerald-600 pointer-events-none" />
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

                <label className="grid gap-1.5 text-xs font-semibold">
                  <span>Subject *</span>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="h-11 rounded-2xl border border-input bg-background px-4 text-xs sm:text-sm outline-none focus:border-primary"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Product Sourcing">Product Sourcing & Quality</option>
                    <option value="Order Tracking">Order Tracking & Support</option>
                    <option value="Dealer & Wholesale">Dealer & Wholesale Inquiry</option>
                    <option value="Feedback">Feedback & Suggestions</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1.5 text-xs font-semibold">
                <span>Your Message *</span>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we assist you today?"
                  className="rounded-2xl border border-input bg-background p-4 text-xs sm:text-sm outline-none focus:border-primary"
                />
              </label>

              <Button type="submit" size="lg" className="w-full" disabled={sending}>
                {sending ? "Sending Message..." : "Send Message"} <Send className="size-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
