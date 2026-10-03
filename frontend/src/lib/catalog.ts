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
  if (s.includes("harit") || s.includes("trichoderma") || s.includes("viride")) {
    return "/products/harit.jpg";
  }
  if (s.includes("neem") || s.includes("azadirachtin") || s.includes("neem-oil")) {
    return "/products/neem-oil.jpg";
  }
  if (s.includes("suraksha") || s.includes("pseudomonas") || s.includes("biofungal")) {
    return "/products/suraksha.jpg";
  }
  if (s.includes("bhumi") || s.includes("shakti") || s.includes("humic") || s.includes("fulvic") || s.includes("soil-conditioner") || s.includes("biostimulant") || s.includes("soil")) {
    return "/products/bhumi-shakti.jpg";
  }
  if (s.includes("balavan") || s.includes("bacillus") || s.includes("crop-protection") || s.includes("fungicide") || s.includes("protection") || s.includes("biological")) {
    return "/products/balavan.jpg";
  }
  if (s.includes("pushkal") || s.includes("flowering") || s.includes("fruit-set")) {
    return "/products/pushkal.jpg";
  }
  if (s.includes("dhanya") || s.includes("dharani") || s.includes("kmb") || s.includes("potassium")) {
    return "/products/dharani.jpg";
  }
  if (s.includes("nutrient") || s.includes("amino") || s.includes("fertilizer") || s.includes("bio") || s.includes("annada") || s.includes("plant nutrients")) {
    return "/products/annada.jpg";
  }
  if (s.includes("oil") || s.includes("mustard") || s.includes("groundnut") || s.includes("sesame") || s.includes("coconut")) {
    return "/products/category-oils.jpg";
  }
  if (s.includes("rice") || s.includes("basmati") || s.includes("sonamasuri") || s.includes("paddy")) {
    return "/products/category-rice.jpg";
  }
  if (s.includes("pulse") || s.includes("dal") || s.includes("toor") || s.includes("gram") || s.includes("moong") || s.includes("urad")) {
    return "/products/category-pulses.jpg";
  }
  if (s.includes("spice") || s.includes("turmeric") || s.includes("chilli") || s.includes("pepper") || s.includes("cumin") || s.includes("masala")) {
    return "/products/category-spices.jpg";
  }
  if (s.includes("ghee") || s.includes("bilona") || s.includes("dairy") || s.includes("cow")) {
    return "/products/category-ghee.jpg";
  }
  if (s.includes("wheat") || s.includes("flour") || s.includes("grain") || s.includes("atta") || s.includes("besan") || s.includes("khapli")) {
    return "/products/category-rice.jpg";
  }
  if (s.includes("millet") || s.includes("ragi") || s.includes("jowar") || s.includes("foxtail") || s.includes("bajra") || s.includes("kodo")) {
    return "/products/category-pulses.jpg";
  }
  if (s.includes("seed") || s.includes("fruit") || s.includes("dry") || s.includes("honey") || s.includes("jaggery") || s.includes("sweet")) {
    return "/products/category-spices.jpg";
  }
  return "/products/category-oils.jpg";
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

export const categories: { id: number; name: string; slug: string; count: number; image: string; description?: string }[] = [
  { id: 1, name: "Biological Crop Protection", slug: "biological-crop-protection", count: 4, image: "/products/balavan.jpg", description: "Beneficial Trichoderma viride, Bacillus subtilis, Pseudomonas fluorescens, and cold-pressed Azadirachtin botanical formulations for disease management, pest control, root protection, and pathogen suppression." },
  { id: 2, name: "Organic Plant Nutrients", slug: "organic-plant-nutrients", count: 2, image: "/products/annada.jpg", description: "Naturally derived fish amino acids, seaweed biostimulants, and organic crop nutrition for healthy vegetative and reproductive growth." },
  { id: 3, name: "Soil Conditioners & Biostimulants", slug: "soil-conditioners-biostimulants", count: 2, image: "/products/bhumi-shakti.jpg", description: "Humic & fulvic organic acid formulations and potassium mobilizing biofertilizers designed to enrich soil fertility, unlock nutrient uptake, and develop healthy root zones." }
];

export const products: Product[] = [
  {
    id: 1,
    slug: "annada-fish-amino-acid-5l",
    name: "ANNADA - Fish Amino Acid (5L)",
    category: "Organic Plant Nutrients",
    brand: "Janani Agro Products",
    price: 3600,
    oldPrice: 3999,
    discount: 10,
    unit: "5 L",
    rating: 5.0,
    reviews: 64,
    inStock: true,
    stockCount: 150,
    badge: "Flagship Nutrient",
    image: "/products/annada.jpg",
    description: "ANNADA is a naturally derived Fish Amino Acid formulation prepared from fish-based raw materials through controlled processing. It contains naturally occurring amino acids, peptides and organic nutrients that support plant growth and development. ANNADA helps supplement crop nutrition and supports healthy vegetative growth, plant vigour and overall crop performance.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Fish Amino Acid", "100% Organic", "Bio-Stimulant", "Plant Vigour", "Natural Nutrition"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality", "Gujarat State Reg. 24"],
    popularity: 100,
    isNew: true,
    variants: [
      { id: "5l", label: "5 Litre Canister", unit: "5 L", price: 3600, oldPrice: 3999, inStock: true },
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 850, oldPrice: 950, inStock: true }
    ],
    specifications: {
      "Fish Amino Acid": "40.0% w/v (Min.)",
      "Amino Nitrogen": "12.0% w/v (Min.)",
      "Total Nitrogen": "4.0% w/v (Min.)",
      "Organic Matter": "15.0% w/v (Min.)",
      "Formulation": "Liquid",
      "Colour": "Brown to Dark Brown",
      "pH": "4.0 - 6.0",
      "Expiry Date": "3 years from date of Mfg.",
      "MRP": "Rs. 3600/- (Inclusive of all taxes)"
    },
    recommendedCrops: "Suitable for vegetables, fruits, paddy, cereals, pulses, oilseeds, cotton, sugarcane, plantation crops, flowers and horticultural crops.",
    dosage: "Foliar Spray: 2–3 ml per litre of water | Drip / Fertigation: 500 ml – 1 litre per acre | Soil Application: 1–2 litres per acre diluted appropriately.",
    methodOfApplication: "Apply through foliar spray, drip/fertigation or soil application according to crop requirement. For best results, use during active vegetative growth and important crop development stages.",
    compatibility: "Generally compatible with organic inputs and many agricultural biostimulants. Conduct a compatibility test before mixing with other products. Avoid mixing with highly alkaline or strongly reactive products.",
    storageNotice: "Store in a cool, dry place away from direct sunlight. Keep container tightly closed. FOR AGRICULTURE USE ONLY."
  },
  {
    id: 2,
    slug: "balavan-bacillus-subtilis-5l",
    name: "BALAVAN - Bacillus Subtilis (5L)",
    category: "Biological Crop Protection",
    brand: "Janani Agro Products",
    price: 5600,
    oldPrice: 6200,
    discount: 10,
    unit: "5 L",
    rating: 5.0,
    reviews: 52,
    inStock: true,
    stockCount: 100,
    badge: "Biological Defense",
    image: "/products/balavan.jpg",
    description: "BALAVAN contains beneficial Bacillus subtilis, a naturally occurring bacterium used in agricultural and horticultural production. It supports biological management of blight-related diseases by colonizing plant surfaces and the rhizosphere and helping reduce disease pressure as part of an integrated crop-protection program. BALAVAN supports the plant's natural defence response, helps improve crop resilience during environmental and biological stress, and promotes healthy plant growth and recovery.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Bacillus Subtilis", "Bio-Fungicide", "Blight Control", "Soil-Borne Disease Control", "Residue Free"],
    certifications: ["For Agriculture Use Only", "Biological Formulation", "State: 24-Gujarat"],
    popularity: 99,
    isNew: true,
    variants: [
      { id: "5l", label: "5 Litre Jerry Can", unit: "5 L", price: 5600, oldPrice: 6200, inStock: true },
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 1350, oldPrice: 1500, inStock: true }
    ],
    specifications: {
      "Bacillus subtilis": "Minimum 5 × 10⁷ CFU/ml",
      "Base": "Liquid",
      "Contamination Level": "Nil at 10⁵ dilution",
      "pH": "6.5 – 7.5",
      "Net Content": "5 Ltr.",
      "MRP": "Rs. 5600/- (Inclusive of all taxes)",
      "Expiry Date": "18 Months from date of Mfg."
    },
    recommendedCrops: "Suitable for all Agricultural, Horticultural, Vegetable, Fruit, Plantation, Spice, Flower and Ornamental Crops.",
    dosage: "Seed Treatment: 10 ml/kg seed | Seedling Root Dip: 5–10 ml/L water (20–30 mins) | Soil Application: 1–2 L/Acre with 50–100 kg FYM/compost | Drip Irrigation: 1–2 L/Acre | Foliar Spray: 2–3 ml/L water.",
    targetDiseases: "Damping-off, Root Rot, Collar Rot, Wilt, Leaf Spot, Early Blight, Anthracnose, Fruit Rot, Powdery Mildew, Bacterial disease suppression.",
    methodOfApplication: "Apply as seed treatment, seedling root dip, soil application, drip irrigation, or uniform foliar spray according to crop stage.",
    compatibility: "Compatible with most biofertilizers, organic manures, and biostimulants. Avoid mixing with chemical fungicides or bactericides during application.",
    storageNotice: "Store in a cool, dry place away from direct sunlight. Keep container tightly closed. FOR AGRICULTURE USE ONLY. Caution: Not to be used on crops other than specified on this label / leaflet."
  },
  {
    id: 3,
    slug: "bhumi-shakti-humic-fulvic-biostimulant-5l",
    name: "BHUMI SHAKTI - Humic & Fulvic Soil Conditioner Biostimulant (5L)",
    category: "Soil Conditioners & Biostimulants",
    brand: "Janani Agro Products",
    price: 3900,
    oldPrice: 4400,
    discount: 11,
    unit: "5 L",
    rating: 4.9,
    reviews: 58,
    inStock: true,
    stockCount: 120,
    badge: "Soil Rejuvenator",
    image: "/products/bhumi-shakti.jpg",
    description: "BHUMI SHAKTI is a humic and fulvic based formulation designed to support soil health, improve nutrient availability and promote efficient nutrient utilization by plants. Its organic carbon-rich components help support favourable soil conditions and contribute to better root-zone development, plant vigour and overall crop performance. Enriches the soil, strengthens the crop, and unlocks maximum nutrient potential.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Humic Acid 12%", "Fulvic Acid 5%", "Soil Conditioner", "Organic Carbon 8%", "Biostimulant"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality", "State: 24-Gujarat"],
    popularity: 98,
    isNew: true,
    variants: [
      { id: "5l", label: "5 Litre Canister", unit: "5 L", price: 3900, oldPrice: 4400, inStock: true },
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 950, oldPrice: 1100, inStock: true }
    ],
    specifications: {
      "Humic Acid": "12.00%",
      "Fulvic Acid": "5.00%",
      "Total Organic Carbon": "8.00%",
      "Potassium (K₂O)": "3.00%",
      "Amino Acids": "5.00%",
      "Organic Matter": "20.00%",
      "Net Content": "5 Ltr.",
      "MRP": "Rs. 3900/- (Inclusive of all taxes)",
      "Expiry Date": "3 years from date of Mfg."
    },
    recommendedCrops: "Suitable for vegetables, fruits, paddy, cereals, pulses, oilseeds, cotton, sugarcane, flowers, plantation crops and horticultural crops.",
    dosage: "Foliar Spray: 2–3 ml per litre of water | Drip / Fertigation: 500 ml–1 litre per acre | Soil Application: 1–2 litres per acre. Dose may be adjusted according to formulation strength, crop and stage of application.",
    methodOfApplication: "Apply through foliar spray, drip/fertigation or soil application according to crop requirement. For best results, apply during active crop growth and important nutrient-demand stages.",
    compatibility: "Compatible with many organic fertilizers, biofertilizers and biostimulants. Conduct a compatibility test before tank mixing with other agricultural inputs.",
    storageNotice: "Store in a cool, dry place away from direct sunlight. Keep container tightly closed. FOR AGRICULTURE USE ONLY. Caution: Not to be used on crops other than specified on this label / leaflet."
  },
  {
    id: 4,
    slug: "suraksha-pseudomonas-fluorescens-5l",
    name: "SURAKSHA - Pseudomonas Fluorescens Biofungal Formulation (5L)",
    category: "Biological Crop Protection",
    brand: "Janani Agro Products",
    price: 4900,
    oldPrice: 5500,
    discount: 11,
    unit: "5 L",
    rating: 4.9,
    reviews: 63,
    inStock: true,
    stockCount: 110,
    badge: "Root Defender",
    image: "/products/suraksha.jpg",
    description: "SURAKSHA contains beneficial Pseudomonas fluorescens, a naturally occurring beneficial bacterium used in agricultural and horticultural production. It supports biological management of soil-borne disease-causing organisms in the rhizosphere and helps maintain a healthy root-zone environment. SURAKSHA also supports the plant's natural defence mechanisms and helps improve its resistance power against stress and disease pressure. Controls soil-borne diseases, boosts plant resistance, and strengthens crops.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Pseudomonas Fluorescens", "Biofungal Formulation", "Root Zone Protection", "Residue Free", "Disease Control"],
    certifications: ["For Agriculture Use Only", "Microbial Bio-Fungicide", "State: 24-Gujarat"],
    popularity: 99,
    isNew: true,
    variants: [
      { id: "5l", label: "5 Litre Jerry Can", unit: "5 L", price: 4900, oldPrice: 5500, inStock: true },
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 1150, oldPrice: 1300, inStock: true }
    ],
    specifications: {
      "Technical Composition": "Pseudomonas fluorescens",
      "Potency": "Minimum 5 × 10⁹ CFU/ml",
      "Formulation": "Liquid Biofungal Formulation",
      "Carrier / Base": "Suitable Microbial Carrier",
      "Contamination Level": "Nil at 10⁸ dilution",
      "pH": "6.5 – 7.5",
      "Net Content": "5 Ltr.",
      "MRP": "Rs. 4900/- (Inclusive of all taxes)",
      "Expiry Date": "18 Months from date of Mfg."
    },
    recommendedCrops: "Suitable for vegetables, fruits, paddy, cereals, pulses, oilseeds, cotton, sugarcane, plantation crops, nursery plants and horticultural crops.",
    dosage: "Soil Application: 500 ml–1 litre per acre | Drip / Fertigation: 500 ml–1 litre per acre | Seed Treatment: 5–10 ml per kg seed | Nursery Application: 2–5 ml per litre of water or as recommended.",
    targetDiseases: "Soil-borne disease-causing organisms, Root Rot, Wilt, Damping-off, Collar Rot, Seedling Blight, Rhizosphere fungal pathogens.",
    methodOfApplication: "Apply through seed treatment, nursery application, soil application or drip/fertigation as appropriate for the crop. For best results, apply under suitable soil-moisture conditions as part of an integrated crop-protection program.",
    compatibility: "Compatible with many organic inputs and biological products. Avoid direct mixing with strong chemical bactericides, disinfectants or other products that may adversely affect Pseudomonas fluorescens viability.",
    storageNotice: "Store in a cool, dry place away from direct sunlight. Keep container tightly closed. FOR AGRICULTURE USE ONLY. Caution: Not to be used on crops other than specified on this label / leaflet."
  },
  {
    id: 5,
    slug: "dharani-kmb-potassium-mobilizing-biofertilizer-5l",
    name: "DHARANI KMB - Potassium Mobilizing Biofertilizer (5L)",
    category: "Soil Conditioners & Biostimulants",
    brand: "Janani Agro Products",
    price: 5300,
    oldPrice: 5800,
    discount: 9,
    unit: "5 L",
    rating: 5.0,
    reviews: 48,
    inStock: true,
    stockCount: 100,
    badge: "Potassium Mobilizer",
    image: "/products/dharani.jpg",
    description: "DHARANI KMB is a high-grade microbial biofertilizer containing beneficial Potassium Mobilizing Bacteria (KMB). It helps mobilize fixed and unavailable forms of potassium present in the soil and makes potassium readily accessible to crops. Regular application supports efficient nutrient utilization, healthy and vigorous root development, plant vigour, balanced crop nutrition, and superior yield quality.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Potassium Mobilizer", "KMB Biofertilizer", "Liquid Inoculant", "Nutrient Availability", "100% Organic"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality", "State: 24-Gujarat"],
    popularity: 99,
    isNew: true,
    variants: [
      { id: "5l", label: "5 Litre Canister", unit: "5 L", price: 5300, oldPrice: 5800, inStock: true },
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 1250, oldPrice: 1400, inStock: true }
    ],
    specifications: {
      "Potassium Mobilizing Bacteria (KMB)": "Minimum 5 × 10⁷ CFU/ml",
      "Formulation": "Liquid",
      "Carrier / Base": "Suitable Microbial Carrier",
      "Contamination Level": "Nil at 10⁻⁵ dilution",
      "pH": "6.5 – 7.5",
      "Net Content": "5 Litre (5 Ltr.)",
      "MRP": "Rs. 5300/- (Inclusive of all taxes)",
      "Expiry Date": "18 Months from date of Mfg."
    },
    recommendedCrops: "Suitable for Paddy, Wheat, Maize, Millets, Pulses, Oilseeds, Cotton, Sugarcane, Vegetables, Fruits, Plantation Crops and Horticultural Crops.",
    dosage: "Soil Application: 500 ml – 1 Litre per acre | Drip / Fertigation: 500 ml – 1 Litre per acre | Seed Treatment: Use as recommended by agricultural experts.",
    methodOfApplication: "Apply through soil application, drip/fertigation or seed treatment according to crop requirement and recommended agricultural practices. For best results, apply during active crop growth and root development stages.",
    compatibility: "Compatible with most biofertilizers and organic inputs. Avoid direct mixing with strong chemical disinfectants or products that may adversely affect beneficial microorganisms.",
    storageNotice: "Store in a cool, dry place away from direct sunlight. Keep container tightly closed. FOR AGRICULTURE USE ONLY. Caution: Not to be used on crops other than specified on this label / leaflet."
  },
  {
    id: 6,
    slug: "pushkal-flowering-fruit-set-biostimulant-1l",
    name: "PUSHKAL - Flowering & Fruit Set Biostimulant (1L)",
    category: "Organic Plant Nutrients",
    brand: "Janani Agro Products",
    price: 999,
    oldPrice: 1199,
    discount: 17,
    unit: "1 L",
    rating: 5.0,
    reviews: 42,
    inStock: true,
    stockCount: 150,
    badge: "Flowering & Fruit Set",
    image: "/products/pushkal.jpg",
    description: "PUSHKAL is a concentrated crop biostimulant formulated with 10% Free Amino Acids, 10% Seaweed Extract, 5% Fulvic Acid, Boron, Zinc and Potassium to support important reproductive stages of crop development. It provides balanced plant-supporting nutrition designed to maximize flower initiation, prevent flower drop, enhance fruit set, and ensure uniform fruit sizing.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Amino Acids 10%", "Seaweed Extract 10%", "Fulvic Acid 5%", "Flowering Stimulant", "Fruit Set"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality", "State: 24-Gujarat"],
    popularity: 99,
    isNew: true,
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 999, oldPrice: 1199, inStock: true },
      { id: "500ml", label: "500 ml Bottle", unit: "500 ml", price: 550, oldPrice: 650, inStock: true },
      { id: "5l", label: "5 Litre Canister", unit: "5 L", price: 4400, oldPrice: 5200, inStock: true }
    ],
    specifications: {
      "Free Amino Acids": "10.00%",
      "Seaweed Extract": "10.00%",
      "Fulvic Acid": "5.00%",
      "Potassium (K₂O)": "3.00%",
      "Boron (B)": "0.50%",
      "Zinc (Zn)": "1.00%",
      "Total Organic Carbon": "5.00%",
      "Total Organic Matter": "15.00%",
      "Net Content": "1 Ltr. (1 Litre)",
      "MRP": "Rs. 999/- (Inclusive of all taxes)",
      "Expiry Date": "3 years from date of Mfg."
    },
    recommendedCrops: "Fruit Crops (Mango, Pomegranate, Grapes, Citrus, Guava, Papaya, Banana, Apple), Vegetables (Tomato, Chilli, Brinjal, Okra, Cucumber, Gourds, Beans), Field Crops (Cotton, Pulses, Oilseeds, Maize, Paddy), Flowers (Rose, Marigold, Jasmine, Chrysanthemum).",
    dosage: "Foliar Spray: Vegetative: 1.5–2 ml/L | Pre-flowering: 2–3 ml/L | Flowering: 2–3 ml/L | Fruit set / early development: 2–3 ml/L | Drip / Fertigation: 500 ml–1 Litre per acre.",
    methodOfApplication: "Apply as foliar spray or drip/fertigation during reproductive stages (flower initiation, active blooming, fruit set). Repeat 10–15 days after first application where required.",
    compatibility: "Compatible with most fertilizers, micronutrients, biostimulants, and biological inputs. Conduct a jar test before tank mixing. Avoid mixing directly with strongly acidic or alkaline products.",
    storageNotice: "Store in a cool, dry place away from direct sunlight. Keep container tightly closed. FOR AGRICULTURE USE ONLY. Caution: Not to be used on crops other than specified on this label / leaflet."
  },
  {
    id: 7,
    slug: "harit-trichoderma-viride-liquid-biofungal-formulation-1l",
    name: "HARIT - Trichoderma Viride Liquid Biofungal Formulation (1L)",
    category: "Biological Crop Protection",
    brand: "Janani Agro Products",
    price: 950,
    oldPrice: 1100,
    discount: 14,
    unit: "1 L",
    rating: 5.0,
    reviews: 49,
    inStock: true,
    stockCount: 120,
    badge: "Bio-Fungal Shield",
    image: "/products/harit.jpg",
    description: "HARIT contains beneficial Trichoderma viride, a naturally occurring beneficial fungus used in agricultural and horticultural production. It helps establish a healthy rhizosphere and supports favourable soil and root-zone conditions. HARIT helps suppress harmful soil-borne fungal pathogens associated with wilt, damping-off, root rot, collar rot and other root-zone diseases. It supports healthy root development, crop establishment and plant vigour as part of an integrated crop-management program. HARIT is suitable for integration with organic inputs, biofertilizers and sustainable crop-management practices.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Trichoderma Viride", "Biofungal Formulation", "Wilt Protection", "Root Rot Control", "Rhizosphere Health"],
    certifications: ["For Agriculture Use Only", "Janani Certified Quality", "State: 24-Gujarat"],
    popularity: 99,
    isNew: true,
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 950, oldPrice: 1100, inStock: true },
      { id: "500ml", label: "500 ml Bottle", unit: "500 ml", price: 520, oldPrice: 600, inStock: true },
      { id: "5l", label: "5 Litre Canister", unit: "5 L", price: 4200, oldPrice: 4800, inStock: true }
    ],
    specifications: {
      "Trichoderma viride": "Minimum 5 × 10⁸ CFU/ml",
      "Formulation": "Liquid",
      "Carrier / Base": "Suitable Microbial Carrier",
      "Contamination Level": "Nil at 10⁶ dilution",
      "pH": "6.5 – 7.5",
      "Net Content": "1 Litre (1 Ltr.)",
      "MRP": "Rs. 1100/- (Inclusive of all taxes)",
      "Expiry Date": "18 Months from date of Mfg."
    },
    recommendedCrops: "Suitable for vegetables, fruits, paddy, cereals, pulses, oilseeds, cotton, sugarcane, plantation crops, nursery plants and horticultural crops.",
    dosage: "Soil Application: 500 ml–1 litre per acre | Drip / Fertigation: 500 ml–1 litre per acre | Seed Treatment: 5–10 ml per kg seed | Nursery Application: 2–5 ml per litre of water or as recommended | Root-Dip Treatment: 5–10 ml per litre of water; dip seedling roots before transplanting. Dose may be adjusted according to formulation strength, crop stage and disease pressure.",
    targetDiseases: "Wilt, Damping-off, Root rot, Collar rot, Seedling rot, Rhizoctonia-related root-zone problems, Fusarium-related soil-borne disease pressure, Pythium-related damping-off and root problems, and other harmful soil-borne fungal pathogens.",
    methodOfApplication: "Apply as seed treatment, nursery seedling root-dip, soil application, or drip/fertigation according to crop stage. Best used preventively as part of an integrated crop-protection program.",
    compatibility: "Compatible with many organic inputs and biological products. Avoid direct mixing with strong chemical fungicides, disinfectants, bactericidal products or other products that may adversely affect Trichoderma viride viability. If chemical fungicides are required, maintain a suitable interval between applications as recommended by an agricultural expert or product label. Conduct a small compatibility test before tank mixing with any other product.",
    storageNotice: "Store in a cool, dry place away from direct sunlight. Keep container tightly closed. FOR AGRICULTURE USE ONLY. Caution: Not to be used on crops other than specified on this label / leaflet. Empty packages/containers should be destroyed after use."
  },
  {
    id: 8,
    slug: "neem-oil-1000-ppm-azadirachtin-1l",
    name: "NEEM OIL 1000 PPM - Botanical Insecticide & Mite Control (1L)",
    category: "Biological Crop Protection",
    brand: "Janani Agro Products",
    price: 599,
    oldPrice: 699,
    discount: 14,
    unit: "1 L",
    rating: 4.9,
    reviews: 44,
    inStock: true,
    stockCount: 140,
    badge: "Botanical IPM",
    image: "/products/neem-oil.jpg",
    description: "NEEM OIL 1000 PPM is a neem-oil-based botanical formulation containing standardized azadirachtin (0.10% w/w minimum / 1000 ppm). It is intended for use as part of an Integrated Pest Management (IPM) programme for management of susceptible insect pests. Azadirachtin exhibits botanical pest-management activity through effects including antifeedant, repellent and insect-growth-regulating properties against susceptible insect pests.",
    origin: "Tal. Lodhika GIDC, Gujarat",
    dietaryTags: ["Neem Oil", "Azadirachtin 1000 PPM", "Insect Control", "Mite Control", "Fungal Suppression", "Plant Protection"],
    certifications: ["For Agriculture Use Only", "Botanical Formulation", "State: 24-Gujarat"],
    popularity: 99,
    isNew: true,
    variants: [
      { id: "1l", label: "1 Litre Bottle", unit: "1 L", price: 599, oldPrice: 699, inStock: true },
      { id: "500ml", label: "500 ml Bottle", unit: "500 ml", price: 349, oldPrice: 399, inStock: true },
      { id: "5l", label: "5 Litre Jerry Can", unit: "5 L", price: 2650, oldPrice: 3100, inStock: true }
    ],
    specifications: {
      "Active Ingredient": "Azadirachtin - 0.10% w/w minimum (1000 ppm)",
      "Technical Source": "Azadirachta indica (Neem)",
      "Formulation": "Botanical Emulsifiable Formulation",
      "Net Content": "1 Litre (1 Ltr.)",
      "MRP": "Rs. 699/- (Inclusive of all taxes)",
      "Expiry Date": "2 Years from date of Mfg."
    },
    recommendedCrops: "Suitable for vegetables, fruits, cotton, pulses, cereals, tea, spices, floriculture and greenhouse horticultural crops.",
    dosage: "Suggested dosage: 1–3 ml per litre of water. Ensure uniform coverage of foliage.",
    targetDiseases: "Aphids, Whiteflies, Thrips, Jassids, Mealybugs, Caterpillars, Leaf Miners, Mites, and other susceptible insect pests.",
    methodOfApplication: "Foliar spray: 1–3 ml per litre of water. Spray during early morning or evening. Avoid spraying during intense sunlight or extreme temperatures. Ensure uniform coverage of foliage. Do not exceed the recommended dose. Conduct a small-area compatibility/phytotoxicity test where crop sensitivity is unknown. Avoid mixing with incompatible products. Shake well before use.",
    compatibility: "Compatibility with other pesticides, fertilizers, adjuvants or biological products should be established before tank mixing.",
    storageNotice: "Keep in cool, dry place away from heat & open flame. Store in a cool, dry place away from direct sunlight. WARNING: Do not use near water sources. Keep out of reach of children. FOR AGRICULTURE USE ONLY. Caution: Not to be used on crops other than specified on this label / leaflet. Empty packages/containers should be destroyed after use."
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