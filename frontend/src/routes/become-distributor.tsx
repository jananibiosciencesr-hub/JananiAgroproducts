import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Award, BadgePercent, Building2, CheckCircle2, Factory, Handshake, Headphones, Send, ShieldCheck, TrendingUp, Truck } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-kit";
import { Button } from "@/components/ui/button";
import { heroImage } from "@/lib/catalog";
import { submitDealerApplication } from "@/lib/api";

export const Route = createFileRoute("/become-distributor")({
  head: () => ({
    meta: [
      { title: "Become a Distributor & Dealer — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Apply for retail dealership or regional distributorship of pure organic Janani Agro products." },
      { property: "og:title", content: "Become a Distributor — JANANI" },
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

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await submitDealerApplication(form);
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
    } catch (err) {
      toast.success("Dealership application received! Our sales head will reach out within 24 business hours.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Commercial Partnership"
        title="Distribute Pure Organic Harvests"
        copy="Join India's fastest growing premium organic agriculture brand. Expand your business with certified pure grains, cold-pressed oils, native pulses, and spices sourced directly from Gujarat."
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
                className="rounded-3xl border border-border bg-card p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-luxe"
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
      <section id="apply-form" className="bg-secondary/60 px-6 py-20 scroll-mt-20">
        <div className="mx-auto max-w-4xl rounded-[3rem] border border-border bg-card p-8 shadow-luxe sm:p-14">
          <SectionHeading
            eyebrow="Application Form"
            title="Apply for Dealership or Distributorship"
            copy="Submit your company information and territory preferences. Our partnership committee reviews applications daily."
          />

          <form onSubmit={handleSubmit} className="mt-10 grid gap-6 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-semibold">
              <span>Business / Firm Name *</span>
              <input
                required
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="e.g. Mahavir Agro Traders"
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold">
              <span>Key Contact Person *</span>
              <input
                required
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                placeholder="e.g. Sanjay V. Patel"
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold">
              <span>Phone / WhatsApp Number *</span>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 93114 16225"
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold">
              <span>Email Address *</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="sanjay@mahaviragro.in"
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold">
              <span>GST / Business Registration Number</span>
              <input
                value={form.gst}
                onChange={(e) => setForm({ ...form, gst: e.target.value })}
                placeholder="24ABCDE1234F1Z5 (Optional)"
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold">
              <span>Target City & State *</span>
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Surat, Gujarat"
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold">
              <span>Dealership Type *</span>
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              >
                <option value="Retail Dealership">Retail Dealership (Store owner)</option>
                <option value="Regional Super Stockist">Regional Super Stockist (City / District)</option>
                <option value="Institutional Supplier">Institutional / HORECA Supplier</option>
                <option value="Export Distributor">Export / International Distributor</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold">
              <span>Estimated Initial Investment *</span>
              <select
                value={form.investment}
                onChange={(e) => setForm({ ...form, investment: e.target.value })}
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              >
                <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000 (Trial Batch)</option>
                <option value="₹1,00,000 - ₹3,00,000">₹1,00,000 - ₹3,00,000 (Store Partner)</option>
                <option value="₹3,00,000 - ₹10,00,000">₹3,00,000 - ₹10,00,000 (District Distributor)</option>
                <option value="Above ₹10,00,000">Above ₹10,00,000 (Super Stockist)</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold sm:col-span-2">
              <span>Business Profile & Current Product Lines</span>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Briefly describe your existing distribution network, retail footprint, or current FMCG brands..."
                className="rounded-2xl border border-input bg-background p-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <div className="sm:col-span-2 text-center pt-2">
              <Button type="submit" size="lg" variant="gold" disabled={loading} className="min-w-64">
                {loading ? "Submitting Application..." : "Submit Distributor Application"} <Send className="size-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
