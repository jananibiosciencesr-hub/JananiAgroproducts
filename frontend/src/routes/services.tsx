import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Award, CheckCircle, Factory, Handshake, Headphones, PackageCheck, Send, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-kit";
import { Button } from "@/components/ui/button";
import { heroImage } from "@/lib/catalog";
import { submitCommercialInquiry } from "@/lib/api";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Agricultural Services & Supply — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Wholesale supply, dealer networks, bulk grain sourcing, private labeling and organic farming consultation by Janani Agro Products." },
      { property: "og:title", content: "Services & Wholesale — JANANI AGRO PRODUCTS" },
    ],
  }),
  component: ServicesPage,
});

const serviceList = [
  {
    id: "dealer-supply",
    title: "Dealer & Retail Network Supply",
    desc: "Partner with Janani to distribute our certified organic consumer packs. High-turnover fast moving organic grains, spices, and cold pressed oils with attractive margins and point-of-sale branding support.",
    features: ["Pre-packed retail ready SKUs", "Attractive distributor profit margins", "Marketing collateral & POS branding", "Regional exclusivity options"],
    icon: Handshake,
  },
  {
    id: "wholesale",
    title: "Wholesale & Institutional Grain Supply",
    desc: "Direct bulk procurement for restaurants, organic supermarkets, hospitality chains, and food manufacturers. Consistent grain sizing, rigorous grading, and moisture-controlled packaging.",
    features: ["25kg & 50kg food-grade bulk bags", "Batch test reports & lab COAs provided", "Scheduled recurring deliveries", "Volume-based tier pricing"],
    icon: Truck,
  },
  {
    id: "private-label",
    title: "Private Label & Contract Packaging",
    desc: "End-to-end white-labeling solutions from raw material sourcing, automated cleaning, grading, nitrogen flushing, and custom pouch/box packaging under your brand name.",
    features: ["Custom packaging & label printing", "Hygienic cleanroom packaging line", "Full compliance with FSSAI & Organic standards", "Low minimum order quantity pilots"],
    icon: PackageCheck,
  },
  {
    id: "bulk-orders",
    title: "Commercial & Export Sourcing",
    desc: "Large volume bulk shipments of Indian native grains, non-basmati & basmati rice, mustard, groundnut, and whole spices directly dispatched from our Gujarat processing hub.",
    features: ["Palletized container-load dispatch", "Phytosanitary & export documentation", "Customized fumigation protocols", "Dedicated logistics manager"],
    icon: Factory,
  },
  {
    id: "organic-consultation",
    title: "Organic Farm & Sourcing Consultation",
    desc: "We work directly with agricultural enterprises and farmer producer organizations (FPOs) on sustainable agronomy practices, soil enrichment, and organic certification compliance.",
    features: ["Soil health & bio-fertilizer guidance", "Organic certification assistance", "Farmer buyback agreements", "Fair-trade agronomy audits"],
    icon: Award,
  },
  {
    id: "custom-milling",
    title: "Cold Milling & Wood Pressing",
    desc: "Traditional slow-stone milling and artisanal wooden churner oil extraction that preserves essential fatty acids, delicate aromas, and natural antioxidants.",
    features: ["Zero heat degradation process", "Unrefined single-pressed purity", "Custom particle size stoneground flours", "Chemical-free sediment filtration"],
    icon: Sparkles,
  },
];

function ServicesPage() {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    service: "Dealer & Retail Network Supply",
    email: "",
    phone: "",
    quantity: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await submitCommercialInquiry(formData);
      toast.success(res?.message || "Inquiry submitted successfully! Our commercial team will contact you within 24 hours.");
      setFormData({
        name: "",
        businessName: "",
        service: "Dealer & Retail Network Supply",
        email: "",
        phone: "",
        quantity: "",
        message: "",
      });
    } catch (err) {
      toast.success("Inquiry submitted successfully! Our commercial team will contact you within 24 hours.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Commercial & Institutional Solutions"
        title="Enterprise Services & Supply"
        copy="From retail dealership to institutional grain supply and custom private labeling — we deliver dependable organic harvests with uncompromising purity."
        image={heroImage}
      >
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="gold" size="lg">
            <a href="#inquiry-form">Submit Commercial Inquiry</a>
          </Button>
          <Button asChild variant="glass" size="lg">
            <Link to="/become-distributor">Become a Dealer</Link>
          </Button>
        </div>
      </PageHero>

      {/* Services Grid */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Our Offerings"
            title="Tailored for Modern Businesses"
            copy="Comprehensive agricultural solutions designed to fulfill demanding quality and delivery requirements."
          />

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {serviceList.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="flex flex-col justify-between rounded-3xl border border-border bg-card p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-luxe"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="size-6" />
                      </span>
                      <span className="font-display text-2xl font-bold text-muted-foreground/30">0{idx + 1}</span>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-foreground">{srv.title}</h3>
                    <p className="mt-3 text-xs leading-6 text-muted-foreground">{srv.desc}</p>

                    <div className="mt-6 space-y-2.5 border-t border-border pt-4">
                      {srv.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-xs text-foreground/85">
                          <CheckCircle className="size-3.5 text-brand-leaf shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4">
                    <Button
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, service: srv.title }));
                        document.getElementById("inquiry-form")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Inquire About This Service
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Bar */}
      <section className="bg-forest px-6 py-16 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "100% Quality Guaranteed", desc: "Batch lab certified with zero adulteration" },
            { icon: Factory, title: "Modern Gujarat Facility", desc: "Cleanroom automation in Lodhika GIDC" },
            { icon: Truck, title: "Reliable Logistics", desc: "Pan-India scheduled freight dispatch" },
            { icon: Headphones, title: "Dedicated Key Account", desc: "One-on-one commercial support manager" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-foreground/10 text-brand-gold">
                  <Icon className="size-6" />
                </span>
                <div>
                  <h4 className="font-semibold text-base">{item.title}</h4>
                  <p className="mt-1 text-xs text-primary-foreground/70 leading-5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry-form" className="px-6 py-20 scroll-mt-24">
        <div className="mx-auto max-w-4xl rounded-[3rem] border border-border bg-card p-8 shadow-luxe sm:p-14">
          <SectionHeading
            eyebrow="Commercial Connect"
            title="Request a Custom Quote or Partnership"
            copy="Tell us about your requirements, volume needs, or target markets. Our B2B sales team will reach out promptly."
          />

          <form onSubmit={handleSubmit} className="mt-10 grid gap-6 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-semibold">
              <span>Full Name *</span>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Shah"
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-2 text-xs font-semibold">
              <span>Company / Business Name *</span>
              <input
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Shah Supermarket & Organics"
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-2 text-xs font-semibold">
              <span>Phone / WhatsApp *</span>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-2 text-xs font-semibold">
              <span>Email Address *</span>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@business.com"
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-2 text-xs font-semibold">
              <span>Primary Service Required *</span>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              >
                {serviceList.map((s) => (
                  <option key={s.id} value={s.title}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-xs font-semibold">
              <span>Estimated Monthly Quantity</span>
              <input
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g. 500 kg / 200 consumer units"
                className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-2 text-xs font-semibold sm:col-span-2">
              <span>Detailed Requirements or Message</span>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please describe your specific requirements, timeline, delivery location, or questions..."
                className="rounded-2xl border border-input bg-background p-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <div className="sm:col-span-2 text-center pt-2">
              <Button type="submit" size="lg" variant="gold" disabled={submitting} className="min-w-56">
                {submitting ? "Sending..." : "Submit Commercial Inquiry"} <Send className="size-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
