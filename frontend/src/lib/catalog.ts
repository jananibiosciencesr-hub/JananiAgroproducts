import heroImage from "@/assets/janani-hero.jpg";
import productsImage from "@/assets/janani-products.jpg";
import storyImage from "@/assets/janani-story.jpg";
import pantryImage from "@/assets/janani-pantry.jpg";

export { heroImage, productsImage, storyImage, pantryImage };

// Smart Category Image Resolver with verified organic photography
export function getCategoryImage(nameOrSlug: string = "", customImage?: string): string {
  if (customImage && (customImage.startsWith("http://") || customImage.startsWith("https://") || customImage.startsWith("data:") || customImage.startsWith("/products/") || customImage.startsWith("/images/categories/"))) {
    return customImage;
  }
  const s = (nameOrSlug || "").toLowerCase();
  if (s.includes("fertilizer") || s.includes("bio-fertilizer")) {
    return "/images/categories/bio-fertilizers.jpg";
  }
  if (s.includes("bio-pesticide") || s.includes("suraksha")) {
    return "/images/categories/bio-pesticides.jpg";
  }
  if (s.includes("bio-fungicide") || s.includes("harit") || s.includes("trichoderma") || s.includes("viride")) {
    return "/images/categories/bio-fungicides.jpg";
  }
  if (s.includes("stimulant") || s.includes("bio-stimulant") || s.includes("pushkal") || s.includes("vigor")) {
    return "/images/categories/bio-stimulants.jpg";
  }
  if (s.includes("micro-nutrient") || s.includes("nutrient") || s.includes("annada") || s.includes("green-power")) {
    return "/images/categories/micro-nutrients.jpg";
  }
  if (s.includes("insecticide") || s.includes("shield")) {
    return "/images/categories/insecticides.jpg";
  }
  if (s.includes("fungicide") || s.includes("care")) {
    return "/images/categories/fungicides.jpg";
  }
  if (s.includes("botanical") || s.includes("neem")) {
    return "/images/categories/botanical-extracts.jpg";
  }
  if (s.includes("soluble") || s.includes("water-soluble") || s.includes("foliar")) {
    return "/images/categories/water-solubles.jpg";
  }
  if (s.includes("input") || s.includes("agri-input") || s.includes("bhumi") || s.includes("soil")) {
    return "/images/categories/agri-inputs.jpg";
  }
  if (s.includes("other") || s.includes("stick")) {
    return "/images/categories/others.jpg";
  }
  return "/images/categories/bio-fertilizers.jpg";
}

// Smart Product Image Resolver
export function getProductImage(nameOrCategory: string = "", customImage?: string): string {
  if (customImage && (customImage.startsWith("http://") || customImage.startsWith("https://") || customImage.startsWith("data:") || customImage.startsWith("/assets/") || customImage.startsWith("/") || customImage.startsWith("./"))) {
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
  subtitle?: string;
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
  crops?: string[];
  benefits?: string[];
  specifications?: Record<string, string>;
  recommendedCrops?: string;
  dosage?: string;
  methodOfApplication?: string;
  compatibility?: string;
  storageNotice?: string;
  netContent?: string;
  targetDiseases?: string;
};

export const slugs = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// The 11 Core Agri Products Categories (from client specification)
export const categories: { id: number; name: string; slug: string; count: number; image: string; description?: string }[] = [
  { id: 1, name: "Bio Fertilizers", slug: "bio-fertilizers", count: 2, image: "/products/dharani.jpg", description: "Beneficial microbial biofertilizers and potassium mobilizers for enhanced soil fertility and root vigour." },
  { id: 2, name: "Bio Pesticides", slug: "bio-pesticides", count: 2, image: "/products/suraksha.jpg", description: "Targeted biological and microbial pest management formulations for organic insect and borer control." },
  { id: 3, name: "Bio Fungicides", slug: "bio-fungicides", count: 2, image: "/products/harit.jpg", description: "Antagonistic biological control agents suppressing wilt, damping-off, root rot, collar rot and soil-borne fungal pathogens." },
  { id: 4, name: "Bio Stimulants", slug: "bio-stimulants", count: 4, image: "/products/pushkal.jpg", description: "Humic-fulvic biostimulants, amino peptides and seaweed extracts that maximize flowering, fruit set and yield." },
  { id: 5, name: "Micro Nutrients", slug: "micro-nutrients", count: 2, image: "/products/annada.jpg", description: "Chelated essential micronutrients and fish amino acids for correcting chlorosis and supporting balanced crop health." },
  { id: 6, name: "Insecticides", slug: "insecticides", count: 1, image: "/products/balavan.jpg", description: "Broad-spectrum eco-safe solutions for comprehensive management of sucking pests, mites, caterpillars and borers." },
  { id: 7, name: "Fungicides", slug: "fungicides", count: 1, image: "/products/suraksha.jpg", description: "Protective and curative agricultural fungicides defending foliage and roots against mildew, blights and leaf spots." },
  { id: 8, name: "Botanical Extracts", slug: "botanical-extracts", count: 1, image: "/products/neem-oil.jpg", description: "Cold-pressed herbal derivatives and Azadirachtin neem formulations for zero-residue IPM protection." },
  { id: 9, name: "Water Solubles", slug: "water-solubles", count: 1, image: "/products/dhanya.jpg", description: "100% water soluble foliar and drip fertigation formulations for immediate plant absorption and rapid vegetative recovery." },
  { id: 10, name: "Agri Inputs", slug: "agri-inputs", count: 2, image: "/products/bhumi-shakti.jpg", description: "Essential agricultural soil amendments, organic carbon inputs, and sustainable soil rejuvenation solutions." },
  { id: 11, name: "Others", slug: "others", count: 1, image: "/products/balavan-bottle.jpg", description: "Speciality agricultural aids, spray activators, silicone spreaders, and farm adjuvants." }
];

export const products: Product[] = [
  {
    id: 1,
    slug: "harit",
    name: "HARIT",
    subtitle: "Trichoderma Viride Liquid Biofungal Formulation",
    category: "Bio Fungicides",
    brand: "Janani Agro Products",
    price: 450,
    oldPrice: 520,
    discount: 13,
    unit: "1 L",
    rating: 4.8,
    reviews: 142,
    inStock: true,
    stockCount: 150,
    badge: "Best Seller",
    image: "/products/harit.jpg",
    description: "HARIT contains beneficial Trichoderma viride, a naturally occurring beneficial fungus used in agricultural and horticultural production. It helps establish a healthy rhizosphere and supports favourable soil and root-zone conditions. HARIT helps suppress harmful soil-borne fungal pathogens associated with wilt, damping-off, root rot, collar rot and other root-zone diseases.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Trichoderma Viride", "Biofungicide", "Wilt Protection", "Root Rot Control", "Rhizosphere Health"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality", "Gujarat State Reg. 24"],
    popularity: 100,
    isNew: false,
    crops: ["Fruits", "Vegetables", "Cereals", "Pulses", "Cotton", "Sugarcane", "All Crops"],
    benefits: ["Fungal Disease Control", "Damping Off Control", "Root Growth", "Soil Health"],
    variants: [
      { id: "250ml", label: "250 ml", unit: "250 ml", price: 150, oldPrice: 180, inStock: true },
      { id: "500ml", label: "500 ml", unit: "500 ml", price: 280, oldPrice: 320, inStock: true },
      { id: "1l", label: "1 Litre", unit: "1 Litre", price: 450, oldPrice: 520, inStock: true },
      { id: "5l", label: "5 Litre", unit: "5 Litre", price: 2000, oldPrice: 2350, inStock: true }
    ],
    specifications: {
      "Active Organism": "Trichoderma viride Minimum 5 × 10⁸ CFU/ml",
      "Formulation": "Liquid Biofungal Formulation",
      "Carrier / Base": "Suitable Microbial Carrier",
      "Contamination Level": "Nil at 10⁶ dilution",
      "pH": "6.5 – 7.5",
      "Net Content": "1 Litre (1 Ltr.)",
      "MRP": "Rs. 520/- (Inclusive of all taxes)",
      "Expiry Date": "18 Months from date of Mfg."
    },
    recommendedCrops: "Suitable for vegetables, fruits, paddy, cereals, pulses, oilseeds, cotton, sugarcane, plantation crops, nursery plants and horticultural crops.",
    dosage: "Soil Application: 500 ml–1 litre per acre | Drip / Fertigation: 500 ml–1 litre per acre | Seed Treatment: 5–10 ml per kg seed.",
    targetDiseases: "Wilt, Damping-off, Root rot, Collar rot, Seedling rot, Rhizoctonia-related root-zone problems, Fusarium-related soil-borne disease pressure."
  },
  {
    id: 2,
    slug: "bhumi-shakti",
    name: "BHUMI SHAKTI",
    subtitle: "Humic & Fulvic Based Soil Conditioner",
    category: "Bio Stimulants",
    brand: "Janani Agro Products",
    price: 380,
    oldPrice: 450,
    discount: 15,
    unit: "1 L",
    rating: 4.7,
    reviews: 98,
    inStock: true,
    stockCount: 120,
    badge: "New",
    image: "/products/bhumi-shakti.jpg",
    description: "BHUMI SHAKTI is a humic and fulvic based formulation designed to support soil health, improve nutrient availability and promote efficient nutrient utilization by plants. Its organic carbon-rich components help support favourable soil conditions and contribute to better root-zone development.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Humic Acid 12%", "Fulvic Acid 5%", "Soil Conditioner", "Organic Carbon", "Biostimulant"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality", "State: 24-Gujarat"],
    popularity: 98,
    isNew: true,
    crops: ["Fruits", "Vegetables", "Cereals", "Pulses", "Oilseeds", "Cotton", "Sugarcane", "All Crops"],
    benefits: ["Soil Health", "Root Growth", "Plant Growth", "Organic Farming"],
    variants: [
      { id: "250ml", label: "250 ml", unit: "250 ml", price: 130, oldPrice: 150, inStock: true },
      { id: "500ml", label: "500 ml", unit: "500 ml", price: 220, oldPrice: 260, inStock: true },
      { id: "1l", label: "1 Litre", unit: "1 Litre", price: 380, oldPrice: 450, inStock: true },
      { id: "5l", label: "5 Litre", unit: "5 Litre", price: 1750, oldPrice: 2100, inStock: true }
    ],
    specifications: {
      "Humic Acid": "12.00%",
      "Fulvic Acid": "5.00%",
      "Total Organic Carbon": "8.00%",
      "Potassium (K₂O)": "3.00%",
      "Amino Acids": "5.00%",
      "Organic Matter": "20.00%",
      "Net Content": "1 Ltr.",
      "MRP": "Rs. 450/- (Inclusive of all taxes)",
      "Expiry Date": "3 years from date of Mfg."
    },
    recommendedCrops: "Suitable for vegetables, fruits, paddy, cereals, pulses, oilseeds, cotton, sugarcane, flowers, plantation crops and horticultural crops.",
    dosage: "Foliar Spray: 2–3 ml per litre of water | Drip / Fertigation: 500 ml–1 litre per acre | Soil Application: 1–2 litres per acre."
  },
  {
    id: 3,
    slug: "neem-oil-1000-ppm",
    name: "NEEM OIL 1000 PPM",
    subtitle: "Containing Azadirachtin 1000 PPM",
    category: "Botanical Extracts",
    brand: "Janani Agro Products",
    price: 550,
    oldPrice: 650,
    discount: 15,
    unit: "1 L",
    rating: 4.6,
    reviews: 86,
    inStock: true,
    stockCount: 140,
    badge: "Popular",
    image: "/products/neem-oil.jpg",
    description: "NEEM OIL 1000 PPM is a neem-oil-based botanical formulation containing standardized azadirachtin (0.10% w/w minimum / 1000 ppm). It is intended for use as part of an Integrated Pest Management (IPM) programme for management of susceptible insect pests.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Neem Oil", "Azadirachtin 1000 PPM", "Insect Control", "Mite Control", "Botanical IPM"],
    certifications: ["For Agriculture Use Only", "Botanical Formulation", "State: 24-Gujarat"],
    popularity: 97,
    isNew: false,
    crops: ["Fruits", "Vegetables", "Cotton", "Pulses", "Cereals", "All Crops"],
    benefits: ["Organic Farming", "Crop Yield"],
    variants: [
      { id: "250ml", label: "250 ml", unit: "250 ml", price: 180, oldPrice: 210, inStock: true },
      { id: "500ml", label: "500 ml", unit: "500 ml", price: 320, oldPrice: 380, inStock: true },
      { id: "1l", label: "1 Litre", unit: "1 Litre", price: 550, oldPrice: 650, inStock: true },
      { id: "5l", label: "5 Litre", unit: "5 Litre", price: 2500, oldPrice: 2950, inStock: true }
    ],
    specifications: {
      "Active Ingredient": "Azadirachtin - 0.10% w/w minimum (1000 ppm)",
      "Technical Source": "Azadirachta indica (Neem)",
      "Formulation": "Botanical Emulsifiable Formulation",
      "Net Content": "1 Litre (1 Ltr.)",
      "MRP": "Rs. 650/- (Inclusive of all taxes)",
      "Expiry Date": "2 Years from date of Mfg."
    },
    recommendedCrops: "Suitable for vegetables, fruits, cotton, pulses, cereals, tea, spices, floriculture and greenhouse horticultural crops.",
    dosage: "Suggested dosage: 1–3 ml per litre of water. Ensure uniform coverage of foliage.",
    targetDiseases: "Aphids, Whiteflies, Thrips, Jassids, Mealybugs, Caterpillars, Leaf Miners, Mites, and other susceptible insect pests."
  },
  {
    id: 4,
    slug: "nano-gold",
    name: "NANO GOLD",
    subtitle: "Plant Growth Promoter",
    category: "Bio Stimulants",
    brand: "Janani Agro Products",
    price: 600,
    oldPrice: 720,
    discount: 16,
    unit: "1 L",
    rating: 4.5,
    reviews: 74,
    inStock: true,
    stockCount: 95,
    image: "/products/pushkal.jpg",
    description: "NANO GOLD is an advanced bio-nanotechnology plant growth promoter formulated with bioactive peptides, micronutrients and organic stimulants to enhance metabolic activity, chlorophyll synthesis and photosynthesis efficiency.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Nano Nutrients", "Growth Promoter", "Photosynthesis Booster", "100% Bio-active"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality", "State: 24-Gujarat"],
    popularity: 95,
    isNew: false,
    crops: ["Fruits", "Vegetables", "Cotton", "Cereals", "Sugarcane"],
    benefits: ["Plant Growth", "Crop Yield", "Root Growth"],
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 600, oldPrice: 720, inStock: true },
      { id: "500ml", label: "500 ml Bottle", unit: "500 ml", price: 340, oldPrice: 400, inStock: true }
    ],
    specifications: {
      "Bioactive Peptides": "8.00%",
      "Chelated Trace Elements": "4.50%",
      "Plant Stimulant Factors": "12.00%",
      "Net Content": "1 Ltr.",
      "MRP": "Rs. 720/- (Inclusive of all taxes)",
      "Expiry Date": "3 Years from date of Mfg."
    },
    recommendedCrops: "Cotton, Sugarcane, Chilli, Tomato, Pomegranate, Banana, Grapes, Paddy, Wheat, Maize.",
    dosage: "Foliar Application: 1.5–2.5 ml per litre of water during rapid vegetative and pre-flowering stages."
  },
  {
    id: 5,
    slug: "vermi-boost",
    name: "VERMI BOOST",
    subtitle: "Organic Soil Enhancer",
    category: "Agri Inputs",
    brand: "Janani Agro Products",
    price: 420,
    oldPrice: 490,
    discount: 14,
    unit: "1 L",
    rating: 4.6,
    reviews: 65,
    inStock: true,
    stockCount: 110,
    image: "/products/annada.jpg",
    description: "VERMI BOOST is an enzymatic liquid extract rich in vermi-wash metabolites, organic acids, and beneficial soil microbe stimulants designed to enrich soil ecology and accelerate root aeration and nutrient assimilation.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Vermi Extract", "Soil Enhancer", "Organic Nutrition", "Rhizosphere Care"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality", "State: 24-Gujarat"],
    popularity: 94,
    isNew: false,
    crops: ["Vegetables", "Fruits", "Cereals", "Pulses", "All Crops"],
    benefits: ["Soil Health", "Organic Farming", "Plant Growth"],
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 420, oldPrice: 490, inStock: true }
    ],
    specifications: {
      "Vermi-Derived Liquid": "35.00%",
      "Humic Fractions": "6.00%",
      "Organic Nitrogen": "2.50%",
      "Net Content": "1 Ltr.",
      "MRP": "Rs. 490/- (Inclusive of all taxes)"
    },
    recommendedCrops: "All agricultural crops, open-field vegetables, orchards and protected cultivation greenhouses.",
    dosage: "Drip / Drenching: 1–2 Litres per acre | Foliar: 3–5 ml per litre of water."
  },
  {
    id: 6,
    slug: "root-plus",
    name: "ROOT PLUS",
    subtitle: "Root Growth Promoter",
    category: "Bio Fertilizers",
    brand: "Janani Agro Products",
    price: 390,
    oldPrice: 460,
    discount: 15,
    unit: "1 L",
    rating: 4.4,
    reviews: 53,
    inStock: true,
    stockCount: 85,
    image: "/products/dharani.jpg",
    description: "ROOT PLUS is a specialised rooting stimulant formulation containing natural auxin precursors, seaweed biostimulants, and phosphonate carriers to develop dense lateral feeder roots and white roots for superior water and nutrient uptake.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Root Initiator", "White Root Development", "Vigorous Establishment", "Nutrient Uptake"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality"],
    popularity: 93,
    isNew: false,
    crops: ["Vegetables", "Cereals", "Pulses", "Cotton", "Sugarcane"],
    benefits: ["Root Growth", "Plant Growth", "Crop Yield"],
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 390, oldPrice: 460, inStock: true }
    ],
    specifications: {
      "Root Inducing Factors": "15.00%",
      "Seaweed Ascophyllum Nodosum": "10.00%",
      "Fulvic Carrier": "5.00%",
      "Net Content": "1 Ltr.",
      "MRP": "Rs. 460/- (Inclusive of all taxes)"
    },
    recommendedCrops: "Paddy, Cotton, Tomato, Chilli, Onion, Sugarcane, Banana, Papaya, Mango, Potato.",
    dosage: "Seedling Dip: 5 ml/L | Drip: 1 Litre per acre within 15–30 days of sowing/transplanting."
  },
  {
    id: 7,
    slug: "crop-shield",
    name: "CROP SHIELD",
    subtitle: "Botanical Pesticide",
    category: "Insecticides",
    brand: "Janani Agro Products",
    price: 480,
    oldPrice: 560,
    discount: 14,
    unit: "1 L",
    rating: 4.5,
    reviews: 61,
    inStock: true,
    stockCount: 90,
    image: "/products/balavan.jpg",
    description: "CROP SHIELD is a multi-action botanical crop protector synthesized from herbal extracts including Pongamia, Karanj and Castor oils with natural botanical alkaloids that repel chewing and sucking pests and inhibit fungal spore germination.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Botanical Pesticide", "Pest Repellent", "Zero Chemical Residue", "Eco-friendly"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality"],
    popularity: 92,
    isNew: false,
    crops: ["Fruits", "Vegetables", "Cotton", "Pulses", "Oilseeds"],
    benefits: ["Fungal Disease Control", "Organic Farming"],
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 480, oldPrice: 560, inStock: true }
    ],
    specifications: {
      "Karanj Oil Extract": "20.00%",
      "Botanical Alkaloids": "5.00%",
      "Natural Emulsifier": "10.00%",
      "Net Content": "1 Ltr.",
      "MRP": "Rs. 560/-"
    },
    recommendedCrops: "Vegetables, Cotton, Pomegranate, Citrus, Mango, Paddy, Pulses.",
    dosage: "Foliar Spray: 2–3 ml per litre of water at first symptom of pest arrival."
  },
  {
    id: 8,
    slug: "foliar-nutri",
    name: "FOLIAR NUTRI",
    subtitle: "Micronutrient Mixture",
    category: "Water Solubles",
    brand: "Janani Agro Products",
    price: 520,
    oldPrice: 600,
    discount: 13,
    unit: "1 L",
    rating: 4.3,
    reviews: 49,
    inStock: true,
    stockCount: 75,
    image: "/products/dhanya.jpg",
    description: "FOLIAR NUTRI is an EDTA-chelated balanced liquid micronutrient formulation containing Zinc, Iron, Manganese, Copper, Boron and Molybdenum to remedy hidden hunger and deficiency chlorosis in demanding crops.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Chelated Micronutrients", "Foliar Spray", "Chlorosis Remedy", "Yield Booster"],
    certifications: ["For Agriculture Use Only", "Fertilizer Grade Standards"],
    popularity: 90,
    isNew: false,
    crops: ["Fruits", "Vegetables", "Cereals", "Cotton", "Sugarcane"],
    benefits: ["Plant Growth", "Crop Yield"],
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 520, oldPrice: 600, inStock: true }
    ],
    specifications: {
      "Chelated Zinc (Zn)": "3.00%",
      "Chelated Iron (Fe)": "2.00%",
      "Boron (B)": "0.50%",
      "Manganese (Mn)": "1.00%",
      "Net Content": "1 Ltr.",
      "MRP": "Rs. 600/-"
    },
    recommendedCrops: "Cotton, Paddy, Sugarcane, Vegetables, Citrus, Apple, Banana, Grapes.",
    dosage: "Foliar spray: 2 ml per litre of water during vegetative and flowering flush."
  },
  {
    id: 9,
    slug: "bio-care",
    name: "BIO CARE",
    subtitle: "Biofungicide",
    category: "Fungicides",
    brand: "Janani Agro Products",
    price: 410,
    oldPrice: 480,
    discount: 15,
    unit: "1 L",
    rating: 4.4,
    reviews: 58,
    inStock: true,
    stockCount: 130,
    image: "/products/suraksha.jpg",
    description: "BIO CARE is a broad-spectrum biological fungicide powered by beneficial antagonistic microorganisms that effectively protect roots and aerial plant foliage from blight, leaf spots, downy mildew and anthracnose.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Biofungicide", "Blight Defence", "Anthracnose Control", "Natural Microbial"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality"],
    popularity: 91,
    isNew: false,
    crops: ["Vegetables", "Fruits", "Cereals", "Pulses", "Oilseeds"],
    benefits: ["Fungal Disease Control", "Damping Off Control", "Soil Health"],
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 410, oldPrice: 480, inStock: true }
    ],
    specifications: {
      "Bio-Active Antagonists": "Minimum 2 × 10⁸ CFU/ml",
      "Formulation": "Aqueous Suspension",
      "Net Content": "1 Ltr.",
      "MRP": "Rs. 480/-"
    },
    recommendedCrops: "Tomato, Chilli, Potato, Groundnut, Ginger, Turmeric, Cumin, Mustard, Grapes.",
    dosage: "Foliar spray: 2.5–3 ml per litre of water | Soil Drench: 1 Litre per acre."
  },
  {
    id: 10,
    slug: "plant-vigor",
    name: "PLANT VIGOR",
    subtitle: "Plant Growth Promoter",
    category: "Bio Stimulants",
    brand: "Janani Agro Products",
    price: 495,
    oldPrice: 580,
    discount: 15,
    unit: "1 L",
    rating: 4.5,
    reviews: 72,
    inStock: true,
    stockCount: 95,
    image: "/products/pushkal-bottle.jpg",
    description: "PLANT VIGOR is an innovative speciality physiological activator designed to combat stress from drought, salinity, and heat. It enhances branching, vegetative shoots and overall vigour in critical development windows.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Stress Resilience", "Speciality Stimulant", "Vegetative Vigour", "Crop Activator"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality"],
    popularity: 96,
    isNew: false,
    crops: ["Fruits", "Vegetables", "Cotton", "Sugarcane", "All Crops"],
    benefits: ["Plant Growth", "Crop Yield", "Root Growth"],
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 495, oldPrice: 580, inStock: true }
    ],
    specifications: {
      "Speciality Osmolytes": "12.00%",
      "Fulvic Matrix": "8.00%",
      "Micronutrient Traces": "3.00%",
      "Net Content": "1 Ltr.",
      "MRP": "Rs. 580/-"
    },
    recommendedCrops: "Cotton, Sugarcane, Vegetables, Orchards, Cereals and Cash Crops.",
    dosage: "Foliar spray: 2 ml per litre of water during stress conditions or active growth."
  },
  {
    id: 11,
    slug: "soil-sure",
    name: "SOIL SURE",
    subtitle: "Soil Conditioner",
    category: "Agri Inputs",
    brand: "Janani Agro Products",
    price: 460,
    oldPrice: 530,
    discount: 13,
    unit: "1 L",
    rating: 4.3,
    reviews: 40,
    inStock: true,
    stockCount: 80,
    image: "/products/balavan-bottle.jpg",
    description: "SOIL SURE is a natural soil buffering conditioner that corrects soil pH, reduces compaction, improves water holding capacity, and restores depleted beneficial soil microflora in intensive agricultural soils.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Soil Conditioner", "pH Buffer", "Water Retention", "Microflora Revival"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality"],
    popularity: 88,
    isNew: false,
    crops: ["Cereals", "Pulses", "Cotton", "Sugarcane", "All Crops"],
    benefits: ["Soil Health", "Organic Farming", "Root Growth"],
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 460, oldPrice: 530, inStock: true }
    ],
    specifications: {
      "Organic Buffering Agents": "25.00%",
      "Biological Activators": "5.00%",
      "Net Content": "1 Ltr.",
      "MRP": "Rs. 530/-"
    },
    recommendedCrops: "Sugarcane, Cotton, Banana, Paddy, Maize, Wheat, Horticultural Soils.",
    dosage: "Drip Irrigation / Flood: 1 to 2 Litres per acre with first basal irrigation."
  },
  {
    id: 12,
    slug: "green-power",
    name: "GREEN POWER",
    subtitle: "Organic Crop Booster",
    category: "Micro Nutrients",
    brand: "Janani Agro Products",
    price: 575,
    oldPrice: 670,
    discount: 14,
    unit: "1 L",
    rating: 4.6,
    reviews: 83,
    inStock: true,
    stockCount: 115,
    image: "/products/annada-bottle.jpg",
    description: "GREEN POWER is a powerful organic crop booster and bioprotectant formulated with sea-kelp minerals, organic plant extracts and microbial metabolites to provide deep green foliage and rapid recovery from fungal stress.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Crop Booster", "Deep Green Foliage", "Biological Immunity", "Organic Yield"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality"],
    popularity: 97,
    isNew: false,
    crops: ["Vegetables", "Fruits", "Cotton", "Cereals", "All Crops"],
    benefits: ["Plant Growth", "Crop Yield", "Fungal Disease Control"],
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 575, oldPrice: 670, inStock: true }
    ],
    specifications: {
      "Organic Plant Extracts": "22.00%",
      "Soluble Seaweed Kelp": "10.00%",
      "Organic Nitrogen": "3.50%",
      "Net Content": "1 Ltr.",
      "MRP": "Rs. 670/-"
    },
    recommendedCrops: "Vegetables, Fruit Orchards, Cotton, Spices, Floriculture, Tea and Coffee.",
    dosage: "Foliar Spray: 2–3 ml per litre of water at intervals of 15 days."
  },
  {
    id: 13,
    slug: "balavan-bacillus-subtilis-5l",
    name: "BALAVAN",
    subtitle: "Bacillus Subtilis Liquid Biofungicide",
    category: "Bio Fungicides",
    brand: "Janani Agro Products",
    price: 5600,
    oldPrice: 6200,
    discount: 10,
    unit: "5 L",
    rating: 5.0,
    reviews: 52,
    inStock: true,
    stockCount: 120,
    badge: "Bio Defense",
    image: "/products/balavan.jpg",
    description: "BALAVAN contains high-potency Bacillus subtilis bacteria that actively colonize plant surfaces and rhizosphere, producing lipopeptide antibiotics that prevent bacterial blights and fungal blast.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Bacillus Subtilis", "Bio Fungicide", "Bacterial Blight", "Blast Protection"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality"],
    popularity: 98,
    isNew: false,
    crops: ["Paddy", "Cotton", "Chilli", "Tomato", "Pomegranate", "All Crops"],
    benefits: ["Fungal Disease Control", "Soil Health", "Organic Farming"],
    variants: [
      { id: "5l", label: "5 Litre Can", unit: "5 L", price: 5600, oldPrice: 6200, inStock: true },
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 1250, oldPrice: 1400, inStock: true }
    ],
    recommendedCrops: "Paddy, Cotton, Chilli, Tomato, Pomegranate, Groundnut, Sugarcane.",
    dosage: "Foliar Spray: 2–3 ml/L | Drip / Fertigation: 1–2 Litres per acre."
  },
  {
    id: 14,
    slug: "suraksha-pseudomonas-fluorescens-5l",
    name: "SURAKSHA",
    subtitle: "Pseudomonas Fluorescens Bio Formulation",
    category: "Bio Pesticides",
    brand: "Janani Agro Products",
    price: 4900,
    oldPrice: 5500,
    discount: 11,
    unit: "5 L",
    rating: 4.9,
    reviews: 63,
    badge: "Root Defender",
    image: "/products/suraksha.jpg",
    inStock: true,
    stockCount: 110,
    description: "SURAKSHA is a potent liquid bio-pesticide and bio-protective formulation containing Pseudomonas fluorescens. It induces systemic resistance in crops and produces siderophores to suppress soil pathogens.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Pseudomonas", "Bio Pesticide", "Induced Resistance", "Eco-safe"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality"],
    popularity: 97,
    isNew: false,
    crops: ["Paddy", "Vegetables", "Ginger", "Turmeric", "Banana", "All Crops"],
    benefits: ["Fungal Disease Control", "Soil Health", "Plant Growth"],
    variants: [
      { id: "5l", label: "5 Litre Can", unit: "5 L", price: 4900, oldPrice: 5500, inStock: true },
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 1100, oldPrice: 1250, inStock: true }
    ],
    recommendedCrops: "Rice, Chilli, Cotton, Banana, Vegetables, Ginger, Turmeric.",
    dosage: "Seed Treatment: 10 ml/kg | Drip: 1–2 Litres per acre | Foliar: 2.5 ml/L."
  },
  {
    id: 15,
    slug: "dharani-kmb-potassium-mobilizing-biofertilizer-5l",
    name: "DHARANI KMB",
    subtitle: "Potassium Mobilizing Biofertilizer",
    category: "Bio Fertilizers",
    brand: "Janani Agro Products",
    price: 5300,
    oldPrice: 5800,
    discount: 9,
    unit: "5 L",
    rating: 5.0,
    reviews: 48,
    badge: "Potassium Mobilizer",
    image: "/products/dharani.jpg",
    inStock: true,
    stockCount: 100,
    description: "DHARANI KMB contains living cultures of Potassium Mobilizing Bacteria that solubilize and convert insoluble soil potassium into readily plant-absorbable ionic forms, maximizing crop size and sugar content.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Potassium Mobilizer", "Bio Fertilizer", "KMB Culture", "Bumper Yield"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality"],
    popularity: 99,
    isNew: false,
    crops: ["Sugarcane", "Cotton", "Banana", "Potato", "Paddy", "Grapes", "All Crops"],
    benefits: ["Plant Growth", "Crop Yield", "Soil Health"],
    variants: [
      { id: "5l", label: "5 Litre Can", unit: "5 L", price: 5300, oldPrice: 5800, inStock: true },
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 1150, oldPrice: 1300, inStock: true }
    ],
    recommendedCrops: "Sugarcane, Banana, Potato, Cotton, Vegetables, Paddy, Fruit Orchards.",
    dosage: "Drip Fertigation: 1–2 Litres per acre at vegetative and fruit development stages."
  },
  {
    id: 16,
    slug: "pushkal-flowering-fruit-set-biostimulant-1l",
    name: "PUSHKAL",
    subtitle: "Flowering & Fruit Set Biostimulant",
    category: "Bio Stimulants",
    brand: "Janani Agro Products",
    price: 999,
    oldPrice: 1199,
    discount: 17,
    unit: "1 L",
    rating: 5.0,
    reviews: 42,
    badge: "Flowering Booster",
    image: "/products/pushkal.jpg",
    inStock: true,
    stockCount: 150,
    description: "PUSHKAL is a premium crop biostimulant formulated with 10% Free L-Amino Acids, 10% Seaweed Ascophyllum Nodosum extract, Fulvic Acid, Zinc and Boron for dramatic flower retention and fruit enlargement.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Biostimulant", "Flower Retention", "Fruit Enlargement", "Seaweed & Boron"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality"],
    popularity: 100,
    isNew: true,
    crops: ["Chilli", "Cotton", "Tomato", "Pomegranate", "Mango", "All Crops"],
    benefits: ["Plant Growth", "Crop Yield"],
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 999, oldPrice: 1199, inStock: true },
      { id: "500ml", label: "500 ml Bottle", unit: "500 ml", price: 550, oldPrice: 650, inStock: true }
    ],
    recommendedCrops: "Chilli, Cotton, Tomato, Brinjal, Pomegranate, Citrus, Grapes, Mango.",
    dosage: "Foliar Spray: 2 ml per litre of water at pre-flowering and fruit set."
  },
  {
    id: 17,
    slug: "annada-fish-amino-acid-5l",
    name: "ANNADA",
    subtitle: "Fish Amino Acid & Micro Nutrients",
    category: "Micro Nutrients",
    brand: "Janani Agro Products",
    price: 3600,
    oldPrice: 3999,
    discount: 10,
    unit: "5 L",
    rating: 5.0,
    reviews: 64,
    badge: "Flagship Nutrient",
    image: "/products/annada.jpg",
    inStock: true,
    stockCount: 150,
    description: "ANNADA is a cold-fermented Fish Amino Acid formulation rich in natural organic peptides, macro and micro minerals that rapidly stimulate chlorophyll formation, crop canopy development, and stress relief.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Fish Amino Acid", "Micro Nutrients", "Protein Hydrolysate", "Vigorous Canopy"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality"],
    popularity: 99,
    isNew: false,
    crops: ["Paddy", "Cotton", "Chilli", "Vegetables", "Horticulture", "All Crops"],
    benefits: ["Plant Growth", "Crop Yield", "Organic Farming"],
    variants: [
      { id: "5l", label: "5 Litre Can", unit: "5 L", price: 3600, oldPrice: 3999, inStock: true },
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 850, oldPrice: 950, inStock: true }
    ],
    recommendedCrops: "Paddy, Cotton, Chilli, Sugarcane, Vegetables, Banana, Orchards.",
    dosage: "Foliar Spray: 3 ml/L | Drip Irrigation: 2 Litres per acre."
  },
  {
    id: 18,
    slug: "agri-stick-silicone-spreader-activator",
    name: "AGRI STICK",
    subtitle: "Silicone Spreader, Sticker & Penetrator",
    category: "Others",
    brand: "Janani Agro Products",
    price: 350,
    oldPrice: 420,
    discount: 17,
    unit: "250 ml",
    rating: 4.8,
    reviews: 38,
    badge: "Specialty Aid",
    image: "/products/balavan-bottle.jpg",
    inStock: true,
    stockCount: 120,
    description: "AGRI STICK is a premium non-ionic organosilicone super-spreader and adjuvant that significantly lowers the surface tension of spray solutions, ensuring uniform droplet spreading, rainfastness and rapid cuticle penetration.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Organosilicone", "Super Spreader", "Rainfast Activator", "Spray Adjuvant"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality"],
    popularity: 94,
    isNew: false,
    crops: ["All Crops", "Vegetables", "Cotton", "Paddy", "Orchards"],
    benefits: ["Crop Yield", "Organic Farming"],
    variants: [
      { id: "250ml", label: "250 ml Bottle", unit: "250 ml", price: 350, oldPrice: 420, inStock: true },
      { id: "500ml", label: "500 ml Bottle", unit: "500 ml", price: 650, oldPrice: 780, inStock: true }
    ],
    recommendedCrops: "Suitable for tank mixing with all agricultural foliar sprays across all crops.",
    dosage: "Tank Mix: 0.3 ml to 0.5 ml per litre of spray water (50 ml per 150–200 L drum)."
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