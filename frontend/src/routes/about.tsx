import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  Factory,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Sprout,
  Users,
  FlaskConical,
  Wheat,
  Microscope,
  Globe2,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-kit";
import { Button } from "@/components/ui/button";
import { heroImage, storyImage, pantryImage } from "@/lib/catalog";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — JANANI AGRO PRODUCTS" },
      {
        name: "description",
        content:
          "Learn about Janani Agro Products, our commitment to biological crop protection, organic bio-fertilizers, and sustainable agronomy empowering 50,000+ Indian farmers.",
      },
      { property: "og:title", content: "About Us — JANANI AGRO PRODUCTS" },
      { property: "og:description", content: "Pure Soil to Soul — Nurturing Soil Health, Empowering Farmers, Enriching Nature." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Pure Soil to Soul • Agricultural Excellence"
        title="Nurturing Soil Health, Empowering Farmers, Enriching Nature."
        copy="Janani Agro Products is dedicated to revolutionizing Indian agriculture through scientific bio-fertilizers, natural biological crop protection, and sustainable plant nutrition for bumper crop yields and healthy soil ecosystems."
        image={heroImage}
      >
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="gold" size="lg" className="rounded-full px-7 font-bold">
            <Link to="/products">Explore Agri Products</Link>
          </Button>
          <Button asChild variant="glass" size="lg" className="rounded-full px-7 font-bold">
            <Link to="/become-distributor">Become a Distributor</Link>
          </Button>
        </div>
      </PageHero>

      {/* Stats bar */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          {[
            ["50,000+", "Farmers Empowered"],
            ["15+ Years", "Bio-Agronomy Legacy"],
            ["100+", "Certified Agri Formulations"],
            ["100% Eco-Safe", "Zero Chemical Residue"],
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
              eyebrow="Our Mission & Origin"
              title="Science-backed biologicals for sustainable harvest prosperity."
              copy="Founded with a vision to restore vitality to Indian soils, Janani Agro Products bridges state-of-the-art microbiology with practical farm agronomy to solve pest, disease, and nutrient challenges naturally."
              align="left"
            />
            <div className="mt-8 space-y-4 text-sm leading-8 text-muted-foreground">
              <p>
                Decades of intensive synthetic chemical application have depleted organic carbon in our soils, resulting in declining crop yields, pest resistance, and rising input costs for farmers. At <strong>Janani Agro Products</strong>, we engineer biological alternatives that work in harmony with nature.
              </p>
              <p>
                From beneficial microbial inoculants (Azotobacter, PSB, KMB, Trichoderma) and high-potency bio-stimulants to botanical pest deterrents and chelated micronutrients, every Janani formulation is rigorously tested for high active CFU counts, field efficacy, and complete environmental safety.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "100% Residue-free bio-inputs",
                "Advanced microbial fermentation",
                "Higher crop yield & root vigor",
                "Eco-friendly certified formulas",
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
              alt="Healthy green crops supported by Janani Agro biologicals"
              className="aspect-[4/3] w-full rounded-[3rem] object-cover shadow-luxe"
            />
            <div className="absolute -bottom-6 -left-4 max-w-72 rounded-3xl border border-border bg-cream p-5 shadow-luxe sm:left-6">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-leaf/15 text-brand-leaf">
                  <Sprout className="size-6" />
                </span>
                <div>
                  <h4 className="font-semibold text-foreground">Certified Bio-Inputs</h4>
                  <p className="text-xs text-muted-foreground">Tested for active CFU counts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories & Capabilities */}
      <section className="bg-secondary/40 px-6 py-20 border-y border-border">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Complete Crop Solutions"
            title="Comprehensive Agro Input Portfolio"
            copy="Tailored formulations designed for every stage of crop growth — from soil preparation and seed treatment to flowering and harvest."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sprout,
                title: "Bio-Fertilizers & Soil Health",
                desc: "Nitrogen-fixing, phosphate & potash solubilizers, and mycorrhizal fungi that revive soil organic carbon and nutrient uptake.",
              },
              {
                icon: ShieldCheck,
                title: "Biological Crop Protection",
                desc: "Bio-fungicides, bio-pesticides, and botanical extracts that protect crops from blights, aphids, borers, and root rot without toxins.",
              },
              {
                icon: Sparkles,
                title: "Bio-Stimulants & Yield Boosters",
                desc: "Seaweed extracts, amino acids, and fulvic boosters that stimulate vegetative growth, abundant flowering, and bumper fruiting.",
              },
              {
                icon: FlaskConical,
                title: "Chelated Micro-Nutrients",
                desc: "Water-soluble Zinc, Boron, Ferrous, and multi-micronutrient foliar blends that rapidly eliminate crop deficiencies.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:-translate-y-1 transition duration-200">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-leaf/10 text-brand-leaf mb-4">
                  <Icon className="size-6" />
                </span>
                <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Our Core Values"
            title="The Janani Trust Promise"
            copy="Guiding every formulation we produce, every farmer partnership we nurture, and every solution we deliver."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Leaf,
                title: "100% Eco-Safe Formulations",
                desc: "Zero chemical residues, safe for soil micro-organisms, beneficial pollinators, earthworms, and groundwater.",
              },
              {
                icon: Microscope,
                title: "Rigorous Lab Standards",
                desc: "Standardized biological strain cultures, high viable spore counts, and multi-stage quality checks in our testing labs.",
              },
              {
                icon: HeartHandshake,
                title: "Farmer Prosperity First",
                desc: "Maximizing the farmer's return on investment (ROI) through lower input costs and significantly enhanced harvest quality.",
              },
              {
                icon: Factory,
                title: "Modern Manufacturing",
                desc: "Controlled sterile fermentation vessels, clean packaging lines, and temperature-stabilized warehousing.",
              },
              {
                icon: Award,
                title: "Proven Field Efficacy",
                desc: "Field-tested on staple cereals, commercial cotton, pulses, sugarcane, vegetables, and fruit orchards across India.",
              },
              {
                icon: Users,
                title: "Agronomy Support & Network",
                desc: "Dedicated agricultural advisory, dealer network enablement, and swift delivery support throughout the country.",
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
      <section className="px-6 py-12 pb-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 rounded-[3rem] bg-forest p-8 text-primary-foreground sm:p-14 lg:grid-cols-2 shadow-xl">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Infrastructure & Operations</span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl font-display">State-of-the-Art Production & Distribution</h2>
            <p className="mt-4 text-sm leading-8 text-primary-foreground/85">
              Janani Agro Products operates a centralized manufacturing and blending hub equipped with industrial fermentation units, automated powder and liquid packaging systems, and nationwide logistics connectivity.
            </p>
            <div className="mt-6 space-y-2.5 text-xs text-primary-foreground/80">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-brand-gold shrink-0" />
                <span><strong>Manufacturing & Operations Hub:</strong> Lodhika GIDC, Gujarat – 360024</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-brand-gold shrink-0" />
                <span><strong>Agronomy & Dealer Helpline:</strong> +91 98480 22338 / +91 93114 16225</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-brand-gold shrink-0" />
                <span><strong>Official Inquiries:</strong> jananibiosciences.r@gmail.com</span>
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild variant="gold" className="rounded-full px-6 font-bold">
                <Link to="/contact">Get in Touch</Link>
              </Button>
              <Button asChild variant="glass" className="rounded-full px-6 font-bold">
                <Link to="/become-distributor">Partner with Us</Link>
              </Button>
            </div>
          </div>
          <div>
            <img
              src={pantryImage}
              alt="Janani Agro Products biological formulations collection"
              className="rounded-3xl object-cover shadow-luxe w-full aspect-[4/3]"
            />
          </div>
        </div>
      </section>
    </>
  );
}
