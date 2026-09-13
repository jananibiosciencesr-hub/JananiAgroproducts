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
  ["What makes Janani Agro Basmati rice different from commercial market rice?", "Our Basmati rice is grown in fertile pesticide-free soils, naturally aged for 18–24 months to enhance aroma and elongation, and never bleached or synthetically coated with mineral oils."],
  ["Are your edible oils truly cold-pressed and unrefined?", "Yes. Our Groundnut, Mustard, and Coconut oils are extracted using traditional slow wooden expellers (Kachi Ghani / Lakdi Ghani) without chemical solvent extraction or high-temperature processing."],
  ["How do ensure zero pest infestation in stored pulses without chemical fumigants?", "We utilize temperature-controlled clean storage, airtight nitrogen flushing packaging, and natural organic bio-deterrents like neem leaves and dry red chilies rather than chemical synthetic fumigants."],
  ["What is the shelf life of Janani Agro products?", "Most grains and pulses have a shelf life of 12 months when stored in an airtight container in a cool, dry place. Cold-pressed oils have a recommended shelf life of 9 months."],
  ["How do I place a bulk order for institutional or temple requirements?", "You can submit an inquiry via our Services page or directly contact our commercial desk at +91 93114 16225. We provide custom 25kg/50kg packing with dedicated freight."],
  ["What payment modes do you accept on the website?", "We accept all major UPI apps (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, NetBanking, and Cash on Delivery for serviceable pin codes."],
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
        copy="Everything you need to know about our organic cultivation standards, purity testing, doorstep delivery, and wholesale partnerships."
        image={storyImage}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Search */}
        <div className="relative mb-12">
          <Search className="absolute left-4 top-3.5 size-5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions (e.g. organic, delivery, cold pressed, returns)..."
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
