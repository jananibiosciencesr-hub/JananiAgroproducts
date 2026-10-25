import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { HelpCircle, MessageCircle, Phone, Search } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/page-kit";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqs, storyImage } from "@/lib/catalog";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Answers about organic certification, purity testing, delivery, and wholesale orders." },
    ],
  }),
  component: FaqPage,
});

const allFaqs: Array<[string, string]> = [
  ...faqs,
  ["How does Harit (Trichoderma Viride) prevent root rot and wilt in crops?", "Harit contains live beneficial Trichoderma viride spores (5 × 10⁸ CFU/ml) that aggressively colonize the root zone (rhizosphere), physically outcompeting and parasitizing harmful soil-borne pathogens like Fusarium, Rhizoctonia, and Pythium."],
  ["What is the recommended dosage of Bhumi Shakti per acre?", "For drip irrigation or fertigation, apply 1 to 2 Litres of Bhumi Shakti per acre during active vegetative stages. For foliar spraying, mix 3 to 5 ml per litre of clean spray water."],
  ["Can Janani Agro bio-fertilizers be mixed with chemical insecticides or weedicides?", "We advise keeping a 4 to 7-day interval between biological bio-fungicide (Trichoderma) applications and chemical copper/systemic fungicides. However, botanical pest deterrents like Neem Oil 1000 PPM are widely tank-mix compatible."],
  ["What is the shelf life and storage requirement for Janani liquid formulations?", "Our formulations have an active shelf life of 12 to 18 months from manufacturing date when stored in a cool, ventilated shed away from direct solar radiation."],
  ["How do I place a bulk wholesale order for our FPO, dealer store, or farm estate?", "You can submit an inquiry via our Become a Distributor page or call our dedicated commercial sales desk at +91 93114 16225 for wholesale volume dispatch in 1L, 5L, or 200L drums."],
  ["What payment modes do you accept for agricultural doorstep delivery?", "We accept all major UPI apps (Google Pay, PhonePe, Paytm, BHIM), NetBanking, Credit/Debit Cards, and Cash on Delivery (COD) for rural and semi-urban agricultural pin codes across India."],
];

function FaqPage() {
  const [search, setSearch] = useState("");

  const filtered = allFaqs.filter(([q, a]) => {
    const question = q || "";
    const answer = a || "";
    return question.toLowerCase().includes(search.toLowerCase()) || answer.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <PageHero
        eyebrow="Help & Support"
        title="Frequently Asked Questions"
        copy="Everything you need to know about our agricultural bio-formulation standards, crop compatibility, field dosages, and dealership partnerships."
        image={storyImage}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Search */}
        <div className="relative mb-12">
          <Search className="absolute left-4 top-3.5 size-5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions (e.g. bio-fertilizer, dosage, trichoderma, delivery, dealers)..."
            className="h-12 w-full rounded-full border border-input bg-card pl-12 pr-4 text-sm outline-none focus:border-primary shadow-soft"
          />
        </div>

        {/* Accordion List */}
        <div className="rounded-[2.5rem] border border-border bg-card p-6 sm:p-10 shadow-luxe">
          <Accordion type="single" collapsible className="w-full divide-y divide-border">
            {filtered.map(([q, a], idx) => (
              <AccordionItem key={q} value={`faq-item-${idx}`} className="py-2 border-none">
                <AccordionTrigger className="text-left font-semibold text-base sm:text-lg hover:text-primary">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-8 text-muted-foreground pt-2">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <HelpCircle className="mx-auto size-12 opacity-40 mb-3" />
              <p className="font-semibold text-foreground">No matching questions found</p>
              <p className="text-xs mt-1">Please try searching with another keyword or connect with us directly.</p>
            </div>
          )}
        </div>

        {/* Contact Strip */}
        <div className="mt-12 rounded-3xl bg-secondary/80 p-8 text-center border border-border">
          <h3 className="text-xl font-semibold text-foreground">Still have questions?</h3>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Our team in Lodhika GIDC, Gujarat is ready to assist you.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="sm" className="gap-2">
              <a href="https://wa.me/919311416225">
                <MessageCircle className="size-4" /> WhatsApp Support
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/contact">
                <Phone className="size-4" /> Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
