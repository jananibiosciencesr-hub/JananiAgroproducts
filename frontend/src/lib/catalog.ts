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

const brands = [
  "Janani Pure Harvest",
  "Janani Vedic Reserve",
  "Janani Single-Origin",
  "Janani Wild Harvest"
];

const origins = [
  "Gujarat (Saurashtra)",
  "Karnataka (Mandya)",
  "Rajasthan (Bikaner)",
  "Kerala (Wayanad)",
  "Maharashtra (Vidarbha)"
];

const names: [string, string, number, string, string[]][] = [
  ["Organic Basmati Rice", "Organic Rice", 249, "1 kg", ["Gluten Free", "Diabetic Friendly", "High Fiber"]],
  ["Premium Wheat Flour", "Flours", 119, "1 kg", ["Stone Ground", "Zero Additives", "High Fiber"]],
  ["Lakadong Turmeric Powder", "Spices", 189, "200 g", ["7%+ Curcumin", "Single Origin", "Cold Milled"]],
  ["Kashmiri Red Chilli Powder", "Spices", 169, "200 g", ["Zero Color", "Sun Dried", "Non-GMO"]],
  ["Whole Coriander Powder", "Spices", 139, "200 g", ["Slow Milled", "Aroma Sealed", "Organic"]],
  ["Wood-Pressed Groundnut Oil", "Cold Pressed Oils", 399, "1 L", ["Cold Pressed", "Wood Churned", "Kachi Ghani"]],
  ["Cold-Pressed Mustard Oil", "Cold Pressed Oils", 329, "1 L", ["Cold Pressed", "Pungent Grade-A", "Zero Heat"]],
  ["Organic Green Gram", "Pulses", 179, "500 g", ["High Protein", "Unpolished", "Easy Digest"]],
  ["Unpolished Toor Dal", "Pulses", 199, "500 g", ["High Protein", "Unpolished", "Native Seed"]],
  ["Foxtail Millet", "Millets", 149, "500 g", ["Gluten Free", "Diabetic Friendly", "Low GI"]],
  ["Natural Jaggery Powder", "Dry Fruits", 129, "500 g", ["Zero Chemical", "Iron Rich", "Sun Dried"]],
  ["Organic Sesame Seeds", "Seeds", 159, "250 g", ["Calcium Rich", "Raw & Cleaned", "Cold Ground"]],
  ["Brown Rice", "Organic Rice", 219, "1 kg", ["High Fiber", "Low GI", "Unpolished"]],
  ["Khapli Wheat", "Wheat", 189, "1 kg", ["Ancient Emmer", "Diabetic Friendly", "Low Gluten"]],
  ["Pearl Millet", "Millets", 109, "500 g", ["High Iron", "Gluten Free", "Native Crop"]],
  ["Split Bengal Gram", "Pulses", 149, "500 g", ["High Protein", "Unpolished", "Rich Fiber"]],
  ["Cumin Seeds", "Spices", 219, "200 g", ["Rich Essential Oil", "Hand Picked", "Organic"]],
  ["Black Pepper Whole", "Spices", 299, "150 g", ["Malabar Grade", "Single Origin", "High Piperine"]],
  ["Virgin Coconut Oil", "Cold Pressed Oils", 449, "500 ml", ["Cold Pressed", "MCT Rich", "Extra Virgin"]],
  ["Flax Seeds", "Seeds", 169, "250 g", ["Omega-3 Rich", "Raw & Untreated", "Vegan"]],
  ["Almonds Premium", "Dry Fruits", 599, "500 g", ["Mamra Grade", "Heart Healthy", "Unsweetened"]],
  ["Stoneground Besan", "Flours", 139, "500 g", ["100% Chana Dal", "High Protein", "Gluten Free"]],
  ["Vermicompost Plus", "Organic Fertilizers", 299, "5 kg", ["Earthworm Cultured", "100% Organic", "Soil Nurturing"]],
  ["Native Vegetable Seeds", "Seeds", 199, "12 packs", ["Heirloom Native", "Non-Hybrid", "High Germination"]],
];

const slugs = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const products: Product[] = names.map(([name, category, price, unit, dietaryTags], index) => {
  const brand = brands[index % brands.length]!;
  const origin = origins[index % origins.length]!;
  const oldPrice = Math.round(price * (1.2 + (index % 3) * 0.08));
  const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
  const inStock = index !== 17 && index !== 21; // 2 items out of stock for testing
  const stockCount = inStock ? 15 + ((index * 7) % 60) : 0;
  const isNew = index % 3 === 0;

  // Generate dynamic multi-pack variants
  const isLiquid = unit.includes("L") || unit.includes("ml");
  const variants: ProductVariant[] = isLiquid
    ? [
        { id: "500ml", label: "500 ml Glass Bottle", unit: "500 ml", price: Math.round(price * 0.55), oldPrice: Math.round(oldPrice * 0.55), inStock },
        { id: "1L", label: "1 Litre Tin Can", unit: "1 L", price, oldPrice, inStock },
        { id: "5L", label: "5 Litre Farm Can", unit: "5 L", price: Math.round(price * 4.6), oldPrice: Math.round(oldPrice * 4.6), inStock },
      ]
    : [
        { id: "500g", label: "500 g Eco Pouch", unit: "500 g", price: Math.round(price * 0.55), oldPrice: Math.round(oldPrice * 0.55), inStock },
        { id: "1kg", label: "1 kg Jute Bag", unit: "1 kg", price, oldPrice, inStock },
        { id: "5kg", label: "5 kg Family Pack", unit: "5 kg", price: Math.round(price * 4.6), oldPrice: Math.round(oldPrice * 4.6), inStock },
      ];

  return {
    id: index + 1,
    slug: slugs(name),
    name,
    category,
    brand,
    price,
    oldPrice,
    discount,
    unit,
    rating: Number((4.5 + (index % 5) * 0.1).toFixed(1)),
    reviews: 28 + index * 9,
    inStock,
    stockCount,
    badge: index < 4 ? "Bestseller" : isNew ? "New Harvest" : undefined,
    image: index % 2 === 0 ? pantryImage : productsImage,
    description: `Carefully sourced ${name.toLowerCase()} with natural flavour, honest nutrition and complete traceability from our partner farms in ${origin}.`,
    origin,
    dietaryTags,
    certifications: ["FSSAI Organic", "NPOP India", "Jaivik Bharat"],
    popularity: 100 - index * 3 + ((index * 13) % 25),
    isNew,
    variants,
  };
});

export const categories = [
  "Organic Rice", "Wheat", "Millets", "Pulses", "Spices", "Cold Pressed Oils", "Seeds", "Dry Fruits", "Flours", "Organic Fertilizers",
].map((name, index) => ({ name, slug: slugs(name), count: products.filter((p) => p.category === name).length || index + 3, image: index % 2 ? productsImage : pantryImage }));

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