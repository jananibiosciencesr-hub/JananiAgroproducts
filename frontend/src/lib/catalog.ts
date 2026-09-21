import heroImage from "@/assets/janani-hero.jpg";
import productsImage from "@/assets/janani-products.jpg";
import storyImage from "@/assets/janani-story.jpg";
import pantryImage from "@/assets/janani-pantry.jpg";

export { heroImage, productsImage, storyImage, pantryImage };

// Smart Category Image Resolver with verified organic photography
export function getCategoryImage(nameOrSlug: string = "", customImage?: string): string {
  if (customImage && (customImage.startsWith("http://") || customImage.startsWith("https://") || customImage.startsWith("data:") || customImage.startsWith("/assets/"))) {
    return customImage;
  }
  const s = (nameOrSlug || "").toLowerCase();
  if (s.includes("oil") || s.includes("mustard") || s.includes("groundnut") || s.includes("sesame") || s.includes("coconut")) {
    return pantryImage;
  }
  if (s.includes("rice") || s.includes("basmati") || s.includes("sonamasuri") || s.includes("paddy")) {
    return productsImage;
  }
  if (s.includes("pulse") || s.includes("dal") || s.includes("toor") || s.includes("gram") || s.includes("moong") || s.includes("urad")) {
    return storyImage;
  }
  if (s.includes("spice") || s.includes("turmeric") || s.includes("chilli") || s.includes("pepper") || s.includes("cumin") || s.includes("masala")) {
    return productsImage;
  }
  if (s.includes("wheat") || s.includes("flour") || s.includes("grain") || s.includes("atta") || s.includes("besan") || s.includes("khapli")) {
    return heroImage;
  }
  if (s.includes("millet") || s.includes("ragi") || s.includes("jowar") || s.includes("foxtail") || s.includes("bajra") || s.includes("kodo")) {
    return pantryImage;
  }
  if (s.includes("ghee") || s.includes("bilona") || s.includes("dairy") || s.includes("cow")) {
    return pantryImage;
  }
  if (s.includes("seed") || s.includes("fruit") || s.includes("dry") || s.includes("honey") || s.includes("jaggery") || s.includes("sweet")) {
    return storyImage;
  }
  return pantryImage;
}

// Smart Product Image Resolver
export function getProductImage(nameOrCategory: string = "", customImage?: string): string {
  if (customImage && (customImage.startsWith("http://") || customImage.startsWith("https://") || customImage.startsWith("data:") || customImage.startsWith("/assets/"))) {
    return customImage;
  }
  return getCategoryImage(nameOrCategory, customImage);
}

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

export const categories: { id: number; name: string; slug: string; count: number; image: string; description?: string }[] = [
  { id: 1, name: "Cold Pressed Oils", slug: "cold-pressed-oils", count: 8, image: pantryImage, description: "Single-origin wood-pressed oils extracted at low temperatures without chemical refinement." },
  { id: 2, name: "Organic Rice", slug: "organic-rice", count: 6, image: productsImage, description: "Aromatic aged Basmati, indigenous Sonamasuri, and unpolished brown rice." },
  { id: 3, name: "Pulses & Dals", slug: "pulses-dals", count: 9, image: storyImage, description: "Naturally sun-dried unpolished dals with intact nutrient seed coats." },
  { id: 4, name: "Raw Spices", slug: "raw-spices", count: 12, image: productsImage, description: "Single-origin high curcumin Lakadong turmeric and stone-ground spices." },
  { id: 5, name: "Wheat & Grains", slug: "wheat-grains", count: 7, image: heroImage, description: "Ancient Khapli emmer wheat, stone-ground flour, and native whole grains." },
  { id: 6, name: "Ancient Millets", slug: "ancient-millets", count: 6, image: pantryImage, description: "Low GI, mineral-rich Foxtail, Ragi, Pearl, and Kodo millets." },
  { id: 7, name: "Vedic Ghee", slug: "vedic-ghee", count: 4, image: pantryImage, description: "Traditional Bilona churned A2 Gir cow ghee crafted from cultured curd." },
  { id: 8, name: "Seeds & Dry Fruits", slug: "seeds-dry-fruits", count: 8, image: storyImage, description: "Raw organic chia, flax, sesame seeds, and chemical-free jaggery." },
];

export const products: Product[] = [
  {
    id: 1,
    slug: "wood-pressed-groundnut-oil-1l",
    name: "Wood-Pressed Groundnut Oil (1L)",
    category: "Cold Pressed Oils",
    brand: "Janani Pure Harvest",
    price: 399,
    oldPrice: 480,
    discount: 17,
    unit: "1 L",
    rating: 4.9,
    reviews: 86,
    inStock: true,
    stockCount: 50,
    badge: "Bestseller",
    image: pantryImage,
    description: "Cold-pressed in traditional Vagai wood expellers below 38°C to retain raw aroma, tocopherols, and heart-healthy phytosterols.",
    origin: "Lodhika GIDC, Gujarat",
    dietaryTags: ["Cold-Pressed", "Heart Healthy", "Unrefined"],
    certifications: ["Certified Organic & NPOP Verified", "FSSAI 10724026000048"],
    popularity: 98,
    isNew: false,
    variants: [
      { id: "1l", label: "1 Litre Glass Bottle", unit: "1 L", price: 399, oldPrice: 480, inStock: true },
      { id: "5l", label: "5 Litre Tin Can", unit: "5 L", price: 1850, oldPrice: 2250, inStock: true }
    ]
  },
  {
    id: 2,
    slug: "a2-vedic-bilona-gir-cow-ghee-500ml",
    name: "A2 Vedic Bilona Gir Cow Ghee (500ml)",
    category: "Vedic Ghee",
    brand: "Janani Pure Harvest",
    price: 1450,
    oldPrice: 1750,
    discount: 17,
    unit: "500 ml",
    rating: 5.0,
    reviews: 142,
    inStock: true,
    stockCount: 35,
    badge: "Vedic Churned",
    image: pantryImage,
    description: "Authentic A2 Gir cow ghee hand-churned using bilona wooden churners from cultured whole curd, slow cooked over low firewood heat.",
    origin: "Saurashtra Gir Sanctuary Belt, Gujarat",
    dietaryTags: ["A2 Protein", "Grass-Fed", "Bilona Method", "Immunity Booster"],
    certifications: ["NPOP Certified Organic", "A2 DNA Tested"],
    popularity: 99,
    isNew: true,
    variants: [
      { id: "500ml", label: "500 ml Glass Jar", unit: "500 ml", price: 1450, oldPrice: 1750, inStock: true },
      { id: "1000ml", label: "1 Litre Glass Jar", unit: "1 L", price: 2799, oldPrice: 3300, inStock: true }
    ]
  },
  {
    id: 3,
    slug: "cold-pressed-mustard-oil-1l",
    name: "Cold-Pressed Mustard Oil (1L)",
    category: "Cold Pressed Oils",
    brand: "Janani Pure Harvest",
    price: 329,
    oldPrice: 389,
    discount: 15,
    unit: "1 L",
    rating: 4.8,
    reviews: 54,
    inStock: true,
    stockCount: 42,
    badge: "Pungent & Pure",
    image: pantryImage,
    description: "Traditional cold-pressed yellow mustard oil with high allyl isothiocyanate content for authentic Indian tempering and natural pungency.",
    origin: "Rajasthan Heritage Farm Belt",
    dietaryTags: ["Cold-Pressed", "Zero Chemical", "Natural Antioxidants"],
    certifications: ["Certified Organic & NPOP Verified"],
    popularity: 92,
    isNew: false,
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 329, oldPrice: 389, inStock: true }
    ]
  },
  {
    id: 4,
    slug: "royal-aged-organic-basmati-rice-1kg",
    name: "Royal Aged Organic Basmati Rice (1kg)",
    category: "Organic Rice",
    brand: "Janani Pure Harvest",
    price: 249,
    oldPrice: 299,
    discount: 17,
    unit: "1 kg",
    rating: 4.9,
    reviews: 112,
    inStock: true,
    stockCount: 65,
    badge: "2-Year Aged",
    image: productsImage,
    description: "Naturally aged long-grain Basmati paddy grown in mineral-rich Himalayan foothills. Extra-long fluffiness and fragrant aroma upon cooking.",
    origin: "Dehradun Foothills, Uttarakhand",
    dietaryTags: ["Pesticide Free", "Long Grain", "Naturally Aged"],
    certifications: ["Certified Organic & NPOP Verified"],
    popularity: 96,
    isNew: false,
    variants: [
      { id: "1kg", label: "1 kg Cotton Bag", unit: "1 kg", price: 249, oldPrice: 299, inStock: true },
      { id: "5kg", label: "5 kg Jute Sack", unit: "5 kg", price: 1180, oldPrice: 1420, inStock: true }
    ]
  },
  {
    id: 5,
    slug: "lakadong-turmeric-powder-200g",
    name: "Lakadong Turmeric Powder (200g)",
    category: "Raw Spices",
    brand: "Janani Pure Harvest",
    price: 189,
    oldPrice: 230,
    discount: 18,
    unit: "200 g",
    rating: 4.9,
    reviews: 73,
    inStock: true,
    stockCount: 80,
    badge: "7.5%+ Curcumin",
    image: productsImage,
    description: "World renowned Meghalaya Lakadong turmeric powder with exceptional 7.5%+ natural curcumin content and deep golden saffron hue.",
    origin: "Jaintia Hills, Meghalaya",
    dietaryTags: ["High Curcumin", "Stone Ground", "Zero Lead Chromate"],
    certifications: ["Certified Organic", "Heavy Metal Tested"],
    popularity: 94,
    isNew: false,
    variants: [
      { id: "200g", label: "200 g Pouch", unit: "200 g", price: 189, oldPrice: 230, inStock: true },
      { id: "500g", label: "500 g Jar", unit: "500 g", price: 440, oldPrice: 520, inStock: true }
    ]
  },
  {
    id: 6,
    slug: "unpolished-toor-dal-500g",
    name: "Unpolished Toor Dal (500g)",
    category: "Pulses & Dals",
    brand: "Janani Pure Harvest",
    price: 199,
    oldPrice: 240,
    discount: 17,
    unit: "500 g",
    rating: 4.8,
    reviews: 61,
    inStock: true,
    stockCount: 55,
    badge: "100% Unpolished",
    image: storyImage,
    description: "Native pigeon peas cultivated under dryland natural farming. Unpolished and unprocessed without oil or water polishing agents.",
    origin: "Latur, Maharashtra",
    dietaryTags: ["High Protein", "Unpolished", "Easy to Digest"],
    certifications: ["Certified Organic & NPOP Verified"],
    popularity: 91,
    isNew: false,
    variants: [
      { id: "500g", label: "500 g Pouch", unit: "500 g", price: 199, oldPrice: 240, inStock: true },
      { id: "1kg", label: "1 kg Pouch", unit: "1 kg", price: 380, oldPrice: 460, inStock: true }
    ]
  },
  {
    id: 7,
    slug: "khapli-emmer-wheat-flour-1kg",
    name: "Ancient Khapli Emmer Wheat Flour (1kg)",
    category: "Wheat & Grains",
    brand: "Janani Pure Harvest",
    price: 189,
    oldPrice: 225,
    discount: 16,
    unit: "1 kg",
    rating: 4.9,
    reviews: 58,
    inStock: true,
    stockCount: 45,
    badge: "Diabetic Friendly",
    image: heroImage,
    description: "Low-gluten heirloom Emmer (Khapli) wheat stoneground slowly at cold RPM to preserve natural dietary fiber, magnesium, and low glycemic index.",
    origin: "Bijapur, Karnataka",
    dietaryTags: ["Ancient Grain", "Low GI", "Stoneground"],
    certifications: ["Certified Organic"],
    popularity: 93,
    isNew: false,
    variants: [
      { id: "1kg", label: "1 kg Cloth Bag", unit: "1 kg", price: 189, oldPrice: 225, inStock: true },
      { id: "5kg", label: "5 kg Sack", unit: "5 kg", price: 899, oldPrice: 1050, inStock: true }
    ]
  },
  {
    id: 8,
    slug: "unpolished-foxtail-millet-500g",
    name: "Unpolished Foxtail Millet (500g)",
    category: "Ancient Millets",
    brand: "Janani Pure Harvest",
    price: 149,
    oldPrice: 180,
    discount: 17,
    unit: "500 g",
    rating: 4.8,
    reviews: 49,
    inStock: true,
    stockCount: 60,
    badge: "Nutrient Rich",
    image: pantryImage,
    description: "Gluten-free native foxtail millets dehusked without polishing. Abundant in dietary fiber, iron, and slow-burning complex carbs.",
    origin: "Anantapur Rainfed Collectives, Andhra Pradesh",
    dietaryTags: ["Gluten Free", "High Fiber", "Immunity"],
    certifications: ["Certified Organic & NPOP Verified"],
    popularity: 90,
    isNew: false,
    variants: [
      { id: "500g", label: "500 g Pack", unit: "500 g", price: 149, oldPrice: 180, inStock: true }
    ]
  }
];

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
  ["Nandini Patel", "Ahmedabad", "The rice has a delicate aroma and cooks beautifully. The packaging feels as thoughtful as the product."],
  ["Rohan Mehta", "Mumbai", "Janani has become our trusted source for oils and everyday dals. Quality is remarkably consistent."],
  ["Asha Menon", "Bengaluru", "Fresh, clean and honestly labelled. The turmeric colour and fragrance are exceptional."],
  ["Devang Shah", "Rajkot", "Their wholesale team is responsive and dispatches arrive exactly as committed."],
  ["Ira Kapoor", "Delhi", "Beautiful pantry staples that I feel good serving to my family."],
  ["Farhan Ali", "Pune", "The groundnut oil tastes wonderfully traditional without feeling heavy."],
  ["Mira Joshi", "Surat", "Fast delivery, careful packing and grains that are visibly premium."],
  ["Kunal Rao", "Hyderabad", "A rare brand that gets traceability, taste and presentation equally right."],
];

export const orders: any[] = [];