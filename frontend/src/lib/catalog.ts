import heroImage from "@/assets/janani-hero.jpg";
import productsImage from "@/assets/janani-products.jpg";
import storyImage from "@/assets/janani-story.jpg";
import pantryImage from "@/assets/janani-pantry.jpg";

export { heroImage, productsImage, storyImage, pantryImage };

export type ProductVariant = {
  id: string;
  label: string;
  unit: string;
  price: number;
  oldPrice: number;
  inStock: boolean;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  oldPrice: number;
  discount: number;
  unit: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockCount: number;
  badge?: string | undefined;
  image: string;
  description: string;
  origin: string;
  dietaryTags: string[];
  certifications: string[];
  popularity: number;
  isNew: boolean;
  variants: ProductVariant[];
};

export const slugs = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Dynamic: Live catalog populated directly from MySQL database API (no hardcoded/default arrays)
export const products: Product[] = [];
export const categories: { name: string; slug: string; count: number; image: string }[] = [];

export const services: [string, string][] = [
  ["Dealer Supply", "Reliable stock, market-ready packaging and dedicated account support."],
  ["Wholesale Supply", "Consistent quality and competitive pricing for institutional buyers."],
  ["Retail Products", "Farm-traceable pantry staples in practical everyday pack sizes."],
  ["Bulk Orders", "Custom quantities and dispatch planning for large requirements."],
  ["Organic Consultation", "Practical guidance for sourcing and transitioning to organics."],
  ["Private Label", "From product selection to compliant, premium packaging."],
];

const rawPosts: [string, string][] = [
  ["Why Ancient Grains Belong in the Modern Kitchen", "A simple guide to bringing millets back to everyday meals."],
  ["Cold-Pressed Oils: A Better Way to Cook", "How slow extraction protects aroma, flavour and nutrients."],
  ["How to Read an Organic Food Label", "The signals that separate trusted produce from clever packaging."],
  ["From Gujarat Farms to Your Pantry", "Meet the growers and careful hands behind every harvest."],
  ["Five Ways to Use Turmeric Every Day", "Golden ideas beyond curry, from breakfast to bedtime."],
  ["The Case for Unpolished Pulses", "Why less processing can mean more flavour and nourishment."],
  ["Building Healthier Soil Naturally", "Traditional methods helping farms become more resilient."],
  ["A Guide to Storing Grains at Home", "Keep staples fresher for longer with these practical steps."],
];

export const posts = rawPosts.map(([title, excerpt], index) => ({
  slug: slugs(title),
  title,
  excerpt,
  date: `${12 + index} August 2026`,
  image: index % 2 ? storyImage : pantryImage,
}));

export const faqs: [string, string][] = [
  ["Are all JANANI products certified organic?", "Our organic range is sourced from verified farms and quality-tested batches. Certification details are shown on each applicable pack."],
  ["Where do you deliver?", "We deliver across serviceable pin codes in India. Enter your delivery details at checkout for availability and estimates."],
  ["How are products packed?", "Products are cleaned, batch tested, and packed in food-safe, moisture-resistant packaging to preserve freshness."],
  ["Can I place a wholesale or dealer order?", "Yes. Use our dealer enquiry form and our sales team will contact you with pricing and availability."],
  ["What is your return policy?", "Unopened items can be reported within seven days. Damaged or incorrect deliveries are prioritised for replacement."],
  ["Do you offer cash on delivery?", "Cash on delivery is shown at checkout wherever it is available for the selected pin code."],
];

export const testimonials: [string, string, string][] = [
  ["Neha Patel", "Ahmedabad", "The rice has a delicate aroma and cooks beautifully. The packaging feels as thoughtful as the product."],
  ["Rohan Mehta", "Mumbai", "Janani has become our trusted source for oils and everyday dals. Quality is remarkably consistent."],
  ["Asha Menon", "Bengaluru", "Fresh, clean and honestly labelled. The turmeric colour and fragrance are exceptional."],
  ["Devang Shah", "Rajkot", "Their wholesale team is responsive and dispatches arrive exactly as committed."],
  ["Ira Kapoor", "Delhi", "Beautiful pantry staples that I feel good serving to my family."],
  ["Farhan Ali", "Pune", "The groundnut oil tastes wonderfully traditional without feeling heavy."],
  ["Mira Joshi", "Surat", "Fast delivery, careful packing and grains that are visibly premium."],
  ["Kunal Rao", "Hyderabad", "A rare brand that gets traceability, taste and presentation equally right."],
];

export const orders = [
  { number: "JAP-260811", date: "08 Sep 2026", total: 1246, status: "Shipped", items: 4 },
  { number: "JAP-260724", date: "24 Aug 2026", total: 879, status: "Delivered", items: 3 },
  { number: "JAP-260619", date: "19 Jul 2026", total: 1548, status: "Delivered", items: 6 },
];