import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BadgeCheck, CheckCircle2, Factory, HeartHandshake, Leaf, ShieldCheck, Sprout, Users } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-kit";
import { Button } from "@/components/ui/button";
import { heroImage, storyImage, pantryImage } from "@/lib/catalog";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Learn about Janani Agro Products, our 15 years of farmer partnerships, and our commitment to pure organic agriculture." },
      { property: "og:title", content: "About Us — JANANI AGRO PRODUCTS" },
      { property: "og:description", content: "Nurturing Nature, Enriching Future." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story & Philosophy"
        title="Nurturing Nature, Enriching Future."
        copy="Janani Agro Products was founded with a single mission: to bring pure, unadulterated, and nutrient-rich agricultural produce directly from trusted Indian farms to your dining table."
        image={heroImage}
      >
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="gold" size="lg">
            <Link to="/products">Explore Our Harvest</Link>
          </Button>
          <Button asChild variant="glass" size="lg">
            <Link to="/services">Our Services</Link>
          </Button>
        </div>
      </PageHero>

      {/* Stats bar */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          {[
            ["15+ Years", "Agricultural Legacy"],
            ["500+ Acres", "Organic Partner Farms"],
            ["25+ Items", "Pure Farm Products"],
            ["10,000+", "Satisfied Homes & Dealers"],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <strong className="font-display text-3xl text-primary md:text-4xl">{val}</strong>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story & Roots */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Our Roots"
              title="Grown with care, harvested with honor."
              copy="From our processing and distribution facility in Lodhika GIDC, Gujarat, Janani Agro Products bridges the gap between dedicated organic growers and health-conscious families across India."
              align="left"
            />
            <div className="mt-8 space-y-4 text-sm leading-8 text-muted-foreground">
              <p>
                We believe that modern food systems have become overly industrialised, stripping grains and spices of their innate flavours and natural micronutrients. We take a different path — honoring traditional cultivation cycles, pesticide-free soils, and minimal processing techniques.
              </p>
              <p>
                Whether it is our fragrant aged Basmati rice, single-origin Lakadong turmeric, or wood-pressed cold edible oils, every batch undergoes thorough batch testing to guarantee purity and zero synthetic chemical residue.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "100% Traceable batch numbers",
                "Cold-milling & wood-pressing",
                "Direct fair-price farmer trade",
                "Eco-friendly food grade packing",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                  <CheckCircle2 className="size-4 text-brand-leaf" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <img
              src={storyImage}
              alt="Indian farmers harvesting in organic fields"
              className="aspect-[4/3] w-full rounded-[3rem] object-cover shadow-luxe"
            />
            <div className="absolute -bottom-6 -left-4 max-w-64 rounded-3xl border border-border bg-cream p-5 shadow-luxe sm:left-6">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-leaf/15 text-brand-leaf">
                  <Sprout className="size-6" />
                </span>
                <div>
                  <h4 className="font-semibold text-foreground">100% Pure Organic</h4>
                  <p className="text-xs text-muted-foreground">Zero additives or fillers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-secondary/60 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Our Core Values"
            title="The Janani Trust Promise"
            copy="Guiding every seed we plant, every harvest we collect, and every product we ship."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Leaf,
                title: "Purity & Nature",
                desc: "Never treated with chemical preservatives, synthetic dyes, or artificial polishing agents.",
              },
              {
                icon: ShieldCheck,
                title: "Rigorous Quality",
                desc: "Certified testing protocols for moisture, aroma, nutritional retention, and hygiene.",
              },
              {
                icon: HeartHandshake,
                title: "Farmer Prosperity",
                desc: "Empowering rural agrarian communities with transparent pricing and fair buyback contracts.",
              },
              {
                icon: Factory,
                title: "Modern Infrastructure",
                desc: "Cleanroom packaging and humidity-controlled storage in Lodhika GIDC, Gujarat.",
              },
              {
                icon: Award,
                title: "True Authenticity",
                desc: "Indigenous seed varieties preserved for their natural aroma, texture, and deep flavour.",
              },
              {
                icon: Users,
                title: "Customer First",
                desc: "Dedicated personal customer support and seamless home delivery across India.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-3xl border border-border bg-card p-8 shadow-soft transition hover:-translate-y-1">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facility & Location info */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 rounded-[3rem] bg-forest p-8 text-primary-foreground sm:p-14 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Infrastructure & Origin</span>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">State-of-the-art facility in Gujarat</h2>
            <p className="mt-4 text-sm leading-8 text-primary-foreground/80">
              Our central processing, cleaning, and distribution unit is strategically located in Lodhika GIDC, Rajkot district, Gujarat — the heartland of Indian pulses, spices, and oilseed agriculture.
            </p>
            <div className="mt-6 space-y-2 text-xs text-primary-foreground/70">
              <p>📍 <strong>Registered Address:</strong> SUB PLOTS NO.2/1/B, REVENUE SURVEY NO.160 TAL., LODHIKA GIDC, Gujarat – 24</p>
              <p>📞 <strong>Phone:</strong> +91 93114 16225 / +91 96258 54967</p>
              <p>✉️ <strong>Email:</strong> info@jananiagroproducts.com</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild variant="gold">
                <Link to="/contact">Contact Our Team</Link>
              </Button>
              <Button asChild variant="glass">
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>
          </div>
          <div>
            <img
              src={pantryImage}
              alt="Janani Agro Products pantry collection"
              className="rounded-3xl object-cover shadow-luxe"
            />
          </div>
        </div>
      </section>
    </>
  );
}
