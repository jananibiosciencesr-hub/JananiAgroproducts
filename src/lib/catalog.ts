import heroImage from "@/assets/janani-hero.jpg";
import productsImage from "@/assets/janani-products.jpg";
import storyImage from "@/assets/janani-story.jpg";
import pantryImage from "@/assets/janani-pantry.jpg";

export { heroImage, productsImage, storyImage, pantryImage };

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  unit: string;
  rating: number;
  reviews: number;
  badge?: string;
  image: string;
  description: string;
};

const names = [
  ["Organic Basmati Rice", "Organic Rice", 249, "1 kg"],
  ["Premium Wheat Flour", "Flours", 119, "1 kg"],
  ["Lakadong Turmeric Powder", "Spices", 189, "200 g"],
  ["Kashmiri Red Chilli Powder", "Spices", 169, "200 g"],
  ["Whole Coriander Powder", "Spices", 139, "200 g"],
  ["Wood-Pressed Groundnut Oil", "Cold Pressed Oils", 399, "1 L"],
  ["Cold-Pressed Mustard Oil", "Cold Pressed Oils", 329, "1 L"],
  ["Organic Green Gram", "Pulses", 179, "500 g"],
  ["Unpolished Toor Dal", "Pulses", 199, "500 g"],
  ["Foxtail Millet", "Millets", 149, "500 g"],
  ["Natural Jaggery Powder", "Dry Fruits", 129, "500 g"],
  ["Organic Sesame Seeds", "Seeds", 159, "250 g"],
  ["Brown Rice", "Organic Rice", 219, "1 kg"],
  ["Khapli Wheat", "Wheat", 189, "1 kg"],
  ["Pearl Millet", "Millets", 109, "500 g"],
  ["Split Bengal Gram", "Pulses", 149, "500 g"],
  ["Cumin Seeds", "Spices", 219, "200 g"],
  ["Black Pepper Whole", "Spices", 299, "150 g"],
  ["Virgin Coconut Oil", "Cold Pressed Oils", 449, "500 ml"],
  ["Flax Seeds", "Seeds", 169, "250 g"],
  ["Almonds Premium", "Dry Fruits", 599, "500 g"],
  ["Stoneground Besan", "Flours", 139, "500 g"],
  ["Vermicompost Plus", "Organic Fertilizers", 299, "5 kg"],
  ["Native Vegetable Seeds", "Seeds", 199, "12 packs"],
] as const;

const slugs = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const products: Product[] = names.map(([name, category, price, unit], index) => ({
  id: index + 1,
  slug: slugs(name),
  name,
  category,
  price,
  oldPrice: Math.round(price * 1.2),
  unit,
  rating: Number((4.6 + (index % 4) * 0.1).toFixed(1)),
  reviews: 34 + index * 7,
  badge: index < 4 ? "Bestseller" : index % 4 === 0 ? "New Harvest" : undefined,
  image: index % 2 === 0 ? pantryImage : productsImage,
  description: `Carefully sourced ${name.toLowerCase()} with natural flavour, honest nutrition and complete traceability from our partner farms.`,
}));

export const categories = [
  "Organic Rice", "Wheat", "Millets", "Pulses", "Spices", "Cold Pressed Oils", "Seeds", "Dry Fruits", "Flours", "Organic Fertilizers",
].map((name, index) => ({ name, slug: slugs(name), count: products.filter((p) => p.category === name).length || index + 3, image: index % 2 ? productsImage : pantryImage }));

export const services = [
  ["Dealer Supply", "Reliable stock, market-ready packaging and dedicated account support."],
  ["Wholesale Supply", "Consistent quality and competitive pricing for institutional buyers."],
  ["Retail Products", "Farm-traceable pantry staples in practical everyday pack sizes."],
  ["Bulk Orders", "Custom quantities and dispatch planning for large requirements."],
  ["Organic Consultation", "Practical guidance for sourcing and transitioning to organics."],
  ["Private Label", "From product selection to compliant, premium packaging."],
] as const;

export const posts = [
  ["Why Ancient Grains Belong in the Modern Kitchen", "A simple guide to bringing millets back to everyday meals."],
  ["Cold-Pressed Oils: A Better Way to Cook", "How slow extraction protects aroma, flavour and nutrients."],
  ["How to Read an Organic Food Label", "The signals that separate trusted produce from clever packaging."],
  ["From Gujarat Farms to Your Pantry", "Meet the growers and careful hands behind every harvest."],
  ["Five Ways to Use Turmeric Every Day", "Golden ideas beyond curry, from breakfast to bedtime."],
  ["The Case for Unpolished Pulses", "Why less processing can mean more flavour and nourishment."],
  ["Building Healthier Soil Naturally", "Traditional methods helping farms become more resilient."],
  ["A Guide to Storing Grains at Home", "Keep staples fresher for longer with these practical steps."],
].map(([title, excerpt], index) => ({ slug: slugs(title), title, excerpt, date: `${12 + index} August 2026`, image: index % 2 ? storyImage : pantryImage }));

export const faqs = [
  ["Are all JANANI products certified organic?", "Our organic range is sourced from verified farms and quality-tested batches. Certification details are shown on each applicable pack."],
  ["Where do you deliver?", "We deliver across serviceable pin codes in India. Enter your delivery details at checkout for availability and estimates."],
  ["How are products packed?", "Products are cleaned, batch tested, and packed in food-safe, moisture-resistant packaging to preserve freshness."],
  ["Can I place a wholesale or dealer order?", "Yes. Use our dealer enquiry form and our sales team will contact you with pricing and availability."],
  ["What is your return policy?", "Unopened items can be reported within seven days. Damaged or incorrect deliveries are prioritised for replacement."],
  ["Do you offer cash on delivery?", "Cash on delivery is shown at checkout wherever it is available for the selected pin code."],
];

export const testimonials = [
  ["Neha Patel", "Ahmedabad", "The rice has a delicate aroma and cooks beautifully. The packaging feels as thoughtful as the product."],
  ["Rohan Mehta", "Mumbai", "Janani has become our trusted source for oils and everyday dals. Quality is remarkably consistent."],
  ["Asha Menon", "Bengaluru", "Fresh, clean and honestly labelled. The turmeric colour and fragrance are exceptional."],
  ["Devang Shah", "Rajkot", "Their wholesale team is responsive and dispatches arrive exactly as committed."],
  ["Ira Kapoor", "Delhi", "Beautiful pantry staples that I feel good serving to my family."],
  ["Farhan Ali", "Pune", "The groundnut oil tastes wonderfully traditional without feeling heavy."],
  ["Mira Joshi", "Surat", "Fast delivery, careful packing and grains that are visibly premium."],
  ["Kunal Rao", "Hyderabad", "A rare brand that gets traceability, taste and presentation equally right."],
] as const;

export const orders = [
  { number: "JAP-260811", date: "08 Sep 2026", total: 1246, status: "Shipped", items: 4 },
  { number: "JAP-260724", date: "24 Aug 2026", total: 879, status: "Delivered", items: 3 },
  { number: "JAP-260619", date: "19 Jul 2026", total: 1548, status: "Delivered", items: 6 },
];