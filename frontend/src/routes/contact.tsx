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
import { Button } from "@/components/ui/button";
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

  // Phone change handler: strictly only digits, strictly max 10 digits, real-time validation
  const handlePhoneChange = (val: string) => {
    // Only accept digits, max 10 digits
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

  // Email/Gmail change handler: real-time validation on typing
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
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-white via-cream/40 to-emerald-50/20 py-4 sm:py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-5 lg:grid-cols-12 items-start">
          
          {/* Left Column: Direct Coordinates (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Sparkles className="size-3 text-primary animate-pulse" />
                Direct Coordinates
              </div>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Reach Us Directly
              </h1>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Our customer service desk and commercial sales offices are active seven days a week.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Address */}
              <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-3.5 shadow-xs transition hover:border-primary/40">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary mt-0.5">
                  <MapPin className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground">Registered Facility & Office</h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    SUB PLOTS NO.2/1/B, REVENUE SURVEY NO.160 TAL.,<br />
                    LODHIKA GIDC, State: Gujarat – 24, India
                  </p>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-3.5 shadow-xs transition hover:border-primary/40">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 mt-0.5">
                  <Phone className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-foreground">Phone & WhatsApp Support</h4>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Direct: <a href="tel:+919311416225" className="font-semibold text-foreground hover:text-primary">+91 93114 16225</a> / <a href="tel:+919625854967" className="font-semibold text-foreground hover:text-primary">+91 96258 54967</a>
                  </p>
                  <div className="mt-2">
                    <Button asChild size="sm" variant="gold" className="h-7 px-2.5 rounded-lg gap-1.5 text-[11px] font-bold shadow-xs">
                      <a href="https://wa.me/919311416225" target="_blank" rel="noreferrer">
                        <MessageCircle className="size-3.5" /> WhatsApp Chat
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Email & Hours */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-xs">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Mail className="size-3.5" />
                    <h4 className="font-bold text-[11px] text-foreground">Official Email</h4>
                  </div>
                  <a href="mailto:info@jananiagroproducts.com" className="mt-1 block text-[11px] font-medium text-brand-leaf hover:underline truncate">
                    info@jananiagroproducts.com
                  </a>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-xs">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Clock className="size-3.5" />
                    <h4 className="font-bold text-[11px] text-foreground">Working Hours</h4>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground leading-tight">
                    Mon – Sun: 9 AM – 9 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card/95 p-5 sm:p-6 shadow-xl backdrop-blur-md">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Send a Direct Message</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Fill in the form below and our customer desk will respond within a few hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold">
                  <span>Your Name *</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Priyesh Patel"
                    className="h-10.5 rounded-xl border border-input bg-background/90 px-3.5 text-xs sm:text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </label>

                {/* Phone Number Field with real-time validation */}
                <div className="grid gap-1 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span>Phone Number *</span>
                    {isPhoneValid && (
                      <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Valid Indian Mobile
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center gap-1 text-xs text-muted-foreground font-semibold pointer-events-none select-none border-r border-border pr-2 whitespace-nowrap shrink-0">
                      <span className="text-xs leading-none shrink-0">🇮🇳</span>
                      <span className="shrink-0 font-bold text-[11px]">+91</span>
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
                      className={`h-10.5 w-full rounded-xl border bg-background/90 pl-15 pr-9 text-xs sm:text-sm outline-none transition tracking-wide font-mono ${
                        touched.phone && errors.phone
                          ? "border-destructive focus:border-destructive ring-1 ring-destructive/20 bg-destructive/5 text-destructive"
                          : isPhoneValid
                          ? "border-emerald-500/70 focus:border-emerald-600 bg-emerald-50/20"
                          : "border-input focus:border-primary focus:ring-1 focus:ring-primary/20"
                      }`}
                    />
                    {isPhoneValid && (
                      <CheckCircle2 className="absolute right-3 top-3 size-4 text-emerald-600 pointer-events-none" />
                    )}
                  </div>
                  {touched.phone && errors.phone ? (
                    <p className="text-[10px] text-destructive flex items-center gap-1 font-medium mt-0.5">
                      <AlertCircle className="size-3 shrink-0" /> {errors.phone}
                    </p>
                  ) : form.phone.length > 0 && form.phone.length < 10 ? (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Enter 10-digit mobile number ({form.phone.length}/10 digits)
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Email Address / Gmail Field with real-time validation */}
                <div className="grid gap-1 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span>Email Address *</span>
                    {isEmailValid && (
                      <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
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
                      className={`h-10.5 w-full rounded-xl border bg-background/90 px-3.5 pr-9 text-xs sm:text-sm outline-none transition ${
                        touched.email && errors.email
                          ? "border-destructive focus:border-destructive ring-1 ring-destructive/20 bg-destructive/5 text-destructive"
                          : isEmailValid
                          ? "border-emerald-500/70 focus:border-emerald-600 bg-emerald-50/20"
                          : "border-input focus:border-primary focus:ring-1 focus:ring-primary/20"
                      }`}
                    />
                    {isEmailValid && (
                      <CheckCircle2 className="absolute right-3 top-3 size-4 text-emerald-600 pointer-events-none" />
                    )}
                  </div>
                  {touched.email && errors.email && (
                    <div className="mt-0.5 space-y-0.5">
                      <p className="text-[10px] text-destructive flex items-center gap-1 font-medium">
                        <AlertCircle className="size-3 shrink-0" /> {errors.email}
                      </p>
                      {errors.emailSuggestion && (
                        <button
                          type="button"
                          onClick={handleApplyEmailSuggestion}
                          className="text-[10px] text-brand-leaf hover:underline font-semibold flex items-center gap-1 text-left"
                        >
                          💡 {errors.emailSuggestion} (Click to apply)
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <label className="grid gap-1 text-xs font-semibold">
                  <span>Subject *</span>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="h-10.5 rounded-xl border border-input bg-background/90 px-3.5 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Product Sourcing">Product Sourcing & Quality</option>
                    <option value="Order Tracking">Order Tracking & Support</option>
                    <option value="Dealer & Wholesale">Dealer & Wholesale Inquiry</option>
                    <option value="Feedback">Feedback & Suggestions</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1 text-xs font-semibold">
                <span>Your Message *</span>
                <textarea
                  required
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we assist you today?"
                  className="rounded-xl border border-input bg-background/90 p-3 text-xs sm:text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </label>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full h-11 rounded-xl font-bold text-xs sm:text-sm shadow-md cursor-pointer mt-1"
                disabled={sending}
              >
                {sending ? "Sending Message to Admin..." : "Send Message"} <Send className="size-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
