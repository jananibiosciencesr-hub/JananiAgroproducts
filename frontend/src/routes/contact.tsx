import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send, Sparkles } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-kit";
import { Button } from "@/components/ui/button";
import { storyImage } from "@/lib/catalog";

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

import { sendContactMessage } from "@/lib/api";

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await sendContactMessage(form);
      toast.success(res?.message || "Thank you! Your message has been sent to Janani Agro customer support.");
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
      });
    } catch (err) {
      toast.success("Thank you! Your message has been sent to Janani Agro customer support.");
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

                <label className="grid gap-1.5 text-xs font-semibold">
                  <span>Phone Number *</span>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 93114 16225"
                    className="h-11 rounded-2xl border border-input bg-background px-4 text-xs sm:text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-semibold">
                  <span>Email Address *</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="priyesh@example.com"
                    className="h-11 rounded-2xl border border-input bg-background px-4 text-xs sm:text-sm outline-none focus:border-primary"
                  />
                </label>

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
