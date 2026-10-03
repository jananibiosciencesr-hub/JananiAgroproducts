const names = [
  ["ANNADA - Fish Amino Acid (5L)", "Organic Plant Nutrients", 3600, "5 L"],
  ["BALAVAN - Bacillus Subtilis (5L)", "Biological Crop Protection", 5600, "5 L"],
  ["BHUMI SHAKTI - Humic & Fulvic Biostimulant (5L)", "Soil Conditioners & Biostimulants", 3900, "5 L"],
  ["SURAKSHA - Pseudomonas Fluorescens (5L)", "Biological Crop Protection", 4900, "5 L"],
  ["DHARANI KMB - Potassium Mobilizing Biofertilizer (5L)", "Soil Conditioners & Biostimulants", 5300, "5 L"],
  ["PUSHKAL - Flowering & Fruit Set Biostimulant (1L)", "Organic Plant Nutrients", 999, "1 L"],
  ["HARIT - Trichoderma Viride Liquid Biofungal Formulation (1L)", "Biological Crop Protection", 950, "1 L"],
  ["NEEM OIL 1000 PPM - Botanical Insecticide & Mite Control (1L)", "Biological Crop Protection", 599, "1 L"],
];

const slugs = (val) => val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const products = names.map(([name, category, price, unit], index) => {
  const isAnnada = name.includes("ANNADA");
  const isBalavan = name.includes("BALAVAN");
  const isBhumi = name.includes("BHUMI");
  const isSuraksha = name.includes("SURAKSHA");
  const isDharani = name.includes("DHARANI") || name.includes("DHANYA");
  const isPushkal = name.includes("PUSHKAL");
  const isHarit = name.includes("HARIT") || name.includes("Trichoderma");
  const isNeem = name.includes("NEEM");
  const image = isAnnada
    ? "/products/annada.jpg"
    : isBalavan
    ? "/products/balavan.jpg"
    : isBhumi
    ? "/products/bhumi-shakti.jpg"
    : isSuraksha
    ? "/products/suraksha.jpg"
    : isDharani
    ? "/products/dharani.jpg"
    : isPushkal
    ? "/products/pushkal.jpg"
    : isHarit
    ? "/products/harit.jpg"
    : isNeem
    ? "/products/neem-oil.jpg"
    : "/products/balavan.jpg";
  const sku = isAnnada
    ? "JAP-SKU-ANNADA"
    : isBalavan
    ? "JAP-SKU-BALAVAN"
    : isBhumi
    ? "JAP-SKU-BHUMISHAKTI"
    : isSuraksha
    ? "JAP-SKU-SURAKSHA"
    : isDharani
    ? "JAP-SKU-DHARANI"
    : isPushkal
    ? "JAP-SKU-PUSHKAL"
    : isHarit
    ? "JAP-SKU-HARIT"
    : isNeem
    ? "JAP-SKU-NEEM1000"
    : `JAP-SKU-${String(index + 1).padStart(3, "0")}`;
  const brand = "Janani Agro Products";

  return {
    id: index + 1,
    slug: isHarit
      ? "harit-trichoderma-viride-liquid-biofungal-formulation-1l"
      : isNeem
      ? "neem-oil-1000-ppm-azadirachtin-1l"
      : slugs(name),
    name,
    category,
    brand,
    sku,
    price,
    oldPrice: Math.round(price * 1.2),
    unit,
    stock: 50 + index * 10,
    rating: Number((4.6 + (index % 4) * 0.1).toFixed(1)),
    reviews: 34 + index * 7,
    badge: index < 4 ? "Bestseller" : "Bio-Certified",
    image,
    description: isAnnada
      ? "ANNADA contains Fish Amino Acid, a natural organic bio-nutrient formulation rich in essential amino acids, proteins, and macro-micronutrients. Enhances chlorophyll synthesis, boosts vegetative growth, and increases crop yields."
      : isBalavan
      ? "BALAVAN contains beneficial Bacillus subtilis liquid biological formulation. It supports biological management of blight-related diseases, suppresses harmful fungal pathogens, and boosts crop resilience."
      : isBhumi
      ? "BHUMI SHAKTI is a humic and fulvic based soil conditioner biostimulant. Enriches soil fertility, unlocks nutrient availability, stimulates deep root development, and boosts organic carbon."
      : isSuraksha
      ? "SURAKSHA contains beneficial Pseudomonas fluorescens liquid biofungal formulation. Controls soil-borne diseases, protects the rhizosphere root-zone, and boosts natural crop resistance."
      : isDharani
      ? "DHARANI contains beneficial Potassium Mobilizing Bacteria (KMB). It helps mobilize fixed and unavailable forms of potassium present in the soil and makes potassium readily accessible to crops, supporting root vigour, efficient nutrient utilization, and overall yield."
      : isPushkal
      ? "PUSHKAL is a concentrated crop biostimulant formulated with 10% Free Amino Acids, 10% Seaweed Extract, 5% Fulvic Acid, Boron, Zinc and Potassium to maximize flower initiation, prevent flower drop, enhance fruit set, and ensure uniform fruit sizing."
      : isHarit
      ? "HARIT contains beneficial Trichoderma viride liquid biofungal formulation (Minimum 5 × 10⁸ CFU/ml). Helps suppress harmful soil-borne fungal pathogens associated with wilt, damping-off, root rot, collar rot and other root-zone diseases."
      : isNeem
      ? "NEEM OIL 1000 PPM is a neem-oil-based botanical formulation containing standardized Azadirachtin (1000 ppm) for organic management of aphids, whiteflies, thrips, caterpillars, leaf miners and mites."
      : `High-efficacy agricultural bio-input from Janani Agro Products.`,
    origin: "Lodhika GIDC, Gujarat",
    certification: "Certified Organic & NPOP Verified",
    status: "In Stock",
    active: true
  };
});

export const categoryImages = {
  "Biological Crop Protection": "/products/balavan.jpg",
  "Organic Plant Nutrients": "/products/annada.jpg",
  "Soil Conditioners & Biostimulants": "/products/bhumi-shakti.jpg",
};

export const categories = [
  "Biological Crop Protection",
  "Organic Plant Nutrients",
  "Soil Conditioners & Biostimulants",
].map((name, index) => ({
  id: index + 1,
  name,
  slug: slugs(name),
  image: categoryImages[name] || "/products/balavan.jpg",
  count: products.filter((p) => {
    const pCat = p.category.toLowerCase();
    const cName = name.toLowerCase();
    return pCat === cName || cName.includes(pCat) || pCat.includes(cName);
  }).length || 2,
  description: name === "Biological Crop Protection"
    ? "Beneficial Trichoderma viride, Bacillus subtilis, Pseudomonas fluorescens, and cold-pressed Azadirachtin botanical formulations for disease management, pest control, root protection, and pathogen suppression."
    : name === "Organic Plant Nutrients"
    ? "Naturally derived fish amino acids, seaweed biostimulants, and organic crop nutrition for healthy vegetative and reproductive growth."
    : "Humic & fulvic organic acid formulations and potassium mobilizing biofertilizers designed to enrich soil fertility, unlock nutrient uptake, and develop healthy root zones.",
}));

export let orders = [];

export let inquiries = [];
export let dealerApplications = [];
export let contactMessages = [];
export let newsletterSubscribers = [];
