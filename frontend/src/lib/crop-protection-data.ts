export interface CropData {
  id: string;
  name: string;
  subName?: string;
  scientificName?: string;
  image: string;
  tagline: string;
  description: string;
  majorPestsAndDiseases: string[];
  recommendedProductIds: string[];
}

export interface DiseaseData {
  id: string;
  name: string;
  category: "Insect Pest" | "Fungal Disease" | "Bacterial Disease";
  scientificName?: string;
  image: string;
  tagline: string;
  symptoms: string;
  controlMeasure: string;
  susceptibleCrops: string[];
  recommendedProductIds: string[];
}

export interface CropProtectionProduct {
  id: string;
  catalogId: number;
  slug: string;
  title: string;
  brand: string;
  price: number;
  oldPrice: number;
  discount: number;
  image: string;
  badge?: string;
  category: "Biological Crop Protection" | "Organic Plant Nutrients" | "Soil Conditioners & Biostimulants";
  technicalName: string;
  dosage: string;
  description: string;
  crops: string[];
  diseases: string[];
  inStock: boolean;
  rating: number;
  reviewsCount: number;
}

// 100% Genuine Janani Agro Products
export const ALL_PESTICIDES: CropProtectionProduct[] = [
  {
    id: "balavan-bacillus",
    catalogId: 2,
    slug: "balavan-bacillus-subtilis-5l",
    title: "BALAVAN - Bacillus Subtilis (5L)",
    brand: "Janani Agro Products",
    price: 5600,
    oldPrice: 6200,
    discount: 10,
    image: "/products/balavan.jpg",
    badge: "Biological Defense",
    category: "Biological Crop Protection",
    technicalName: "Bacillus subtilis 5 × 10⁷ CFU/ml",
    dosage: "Foliar: 2–3 ml/L | Drip/Soil: 1–2 L/Acre | Seed Treatment: 10 ml/kg",
    description: "BALAVAN is a certified liquid microbial bio-fungicide that actively colonizes plant surfaces and root zones, suppressing Sheath Blight, Blast lesions, and bacterial pathogens with zero chemical residue.",
    crops: ["rice", "cotton", "wheat", "groundnut", "soyabean", "chilli", "maize"],
    diseases: ["paddy-sheath-blight", "rice-blast", "bacterial-leaf-blight", "gram-pod-borers"],
    inStock: true,
    rating: 5.0,
    reviewsCount: 52
  },
  {
    id: "suraksha-pseudomonas",
    catalogId: 4,
    slug: "suraksha-pseudomonas-fluorescens-5l",
    title: "SURAKSHA - Pseudomonas Fluorescens (5L)",
    brand: "Janani Agro Products",
    price: 4900,
    oldPrice: 5500,
    discount: 11,
    image: "/products/suraksha.jpg",
    badge: "Root Defender",
    category: "Biological Crop Protection",
    technicalName: "Pseudomonas fluorescens 5 × 10⁹ CFU/ml",
    dosage: "Soil/Drip: 500 ml–1 L/Acre | Nursery/Foliar: 2–5 ml/L",
    description: "SURAKSHA provides formidable biological control of Bacterial Leaf Blight, sheath rot, and root pathogens by secreting phenazine antibiotics and inducing systemic plant defense mechanisms.",
    crops: ["rice", "cotton", "soyabean", "sugarcane", "groundnut", "chilli"],
    diseases: ["bacterial-leaf-blight", "paddy-sheath-blight", "rice-blast", "mustard-aphid"],
    inStock: true,
    rating: 4.9,
    reviewsCount: 63
  },
  {
    id: "harit-trichoderma",
    catalogId: 7,
    slug: "harit-trichoderma-viride-liquid-biofungal-formulation-1l",
    title: "HARIT - Trichoderma Viride (1L)",
    brand: "Janani Agro Products",
    price: 950,
    oldPrice: 1100,
    discount: 14,
    image: "/products/harit.jpg",
    badge: "Bio-Fungal Shield",
    category: "Biological Crop Protection",
    technicalName: "Trichoderma viride 5 × 10⁸ CFU/ml",
    dosage: "Soil/Drip: 500 ml–1 L/Acre | Seed: 5–10 ml/kg | Root Dip: 5–10 ml/L",
    description: "HARIT is a highly active biological hyperparasite that feeds on and breaks down fungal hyphae of Rhizoctonia solani (Sheath Blight) and Pyricularia (Blast), protecting roots and stems.",
    crops: ["rice", "cotton", "soyabean", "sugarcane", "wheat", "groundnut", "chilli"],
    diseases: ["paddy-sheath-blight", "rice-blast"],
    inStock: true,
    rating: 5.0,
    reviewsCount: 49
  },
  {
    id: "neem-oil-1000",
    catalogId: 8,
    slug: "neem-oil-1000-ppm-azadirachtin-1l",
    title: "NEEM OIL 1000 PPM - Botanical Insecticide (1L)",
    brand: "Janani Agro Products",
    price: 599,
    oldPrice: 699,
    discount: 14,
    image: "/products/neem-oil.jpg",
    badge: "Botanical IPM",
    category: "Biological Crop Protection",
    technicalName: "Azadirachtin 0.10% w/w (1000 PPM)",
    dosage: "Foliar Spray: 3–5 ml per litre of water",
    description: "Cold-pressed botanical neem extract exhibiting antifeedant, insect growth regulating (IGR), and repellent properties against Mustard Aphids, Helicoverpa caterpillars, and whiteflies.",
    crops: ["cotton", "rice", "soyabean", "wheat", "maize", "chilli", "groundnut"],
    diseases: ["mustard-aphid", "helicoverpa-armigera", "gram-pod-borers"],
    inStock: true,
    rating: 4.9,
    reviewsCount: 44
  },
  {
    id: "annada-amino",
    catalogId: 1,
    slug: "annada-fish-amino-acid-5l",
    title: "ANNADA - Fish Amino Acid (5L)",
    brand: "Janani Agro Products",
    price: 3600,
    oldPrice: 3999,
    discount: 10,
    image: "/products/annada.jpg",
    badge: "Flagship Nutrient",
    category: "Organic Plant Nutrients",
    technicalName: "Fish Amino Acid 40% w/v + Organic N 4%",
    dosage: "Foliar: 2–3 ml/L | Drip/Soil: 1–2 L per acre",
    description: "Organic bio-peptide liquid that promotes vegetative resurgence, chlorophyll density, and rapid crop recovery following severe pest or disease infestations.",
    crops: ["cotton", "rice", "maize", "sugarcane", "soyabean", "groundnut", "wheat"],
    diseases: ["bacterial-leaf-blight", "mustard-aphid"],
    inStock: true,
    rating: 5.0,
    reviewsCount: 64
  },
  {
    id: "pushkal-biostimulant",
    catalogId: 6,
    slug: "pushkal-flowering-fruit-set-biostimulant-1l",
    title: "PUSHKAL - Flowering & Fruit Set Biostimulant (1L)",
    brand: "Janani Agro Products",
    price: 999,
    oldPrice: 1199,
    discount: 17,
    image: "/products/pushkal.jpg",
    badge: "Flowering & Fruit Set",
    category: "Organic Plant Nutrients",
    technicalName: "Free Amino Acids 10% + Seaweed Extract 10% + Fulvic 5%",
    dosage: "Foliar Spray: 2–3 ml/L | Drip: 500 ml–1 L/Acre",
    description: "Specialized flowering biostimulant designed to arrest square and boll drop in cotton, induce prolific flowering, and support fruit set across commercial crops.",
    crops: ["cotton", "chilli", "groundnut", "soyabean", "maize"],
    diseases: ["gram-pod-borers", "helicoverpa-armigera"],
    inStock: true,
    rating: 5.0,
    reviewsCount: 42
  },
  {
    id: "bhumi-shakti",
    catalogId: 3,
    slug: "bhumi-shakti-humic-fulvic-biostimulant-5l",
    title: "BHUMI SHAKTI - Humic & Fulvic Biostimulant (5L)",
    brand: "Janani Agro Products",
    price: 3900,
    oldPrice: 4400,
    discount: 11,
    image: "/products/bhumi-shakti.jpg",
    badge: "Soil Rejuvenator",
    category: "Soil Conditioners & Biostimulants",
    technicalName: "Humic Acid 12% + Fulvic Acid 5% + Organic Carbon 8%",
    dosage: "Foliar: 2–3 ml/L | Drip/Soil: 1–2 L per acre",
    description: "Enriches the rhizosphere with active organic carbon, stimulative humic fractions, and micronutrient chelators, building disease-suppressive living soils.",
    crops: ["cotton", "rice", "maize", "sugarcane", "soyabean", "groundnut", "wheat", "chilli"],
    diseases: ["paddy-sheath-blight", "bacterial-leaf-blight"],
    inStock: true,
    rating: 4.9,
    reviewsCount: 58
  },
  {
    id: "dharani-kmb",
    catalogId: 5,
    slug: "dharani-kmb-potassium-mobilizing-biofertilizer-5l",
    title: "DHARANI KMB - Potassium Mobilizing Biofertilizer (5L)",
    brand: "Janani Agro Products",
    price: 5300,
    oldPrice: 5800,
    discount: 9,
    image: "/products/dharani.jpg",
    badge: "Potassium Mobilizer",
    category: "Soil Conditioners & Biostimulants",
    technicalName: "Potassium Mobilizing Bacteria 5 × 10⁷ CFU/ml",
    dosage: "Soil/Drip: 500 ml–1 L per acre",
    description: "Solubilizes locked soil potassium into bioavailable form, thickening stem cell walls and conferring natural resistance to stem borers and fungal lodging.",
    crops: ["sugarcane", "wheat", "maize", "rice", "cotton"],
    diseases: ["rice-blast", "paddy-sheath-blight"],
    inStock: true,
    rating: 5.0,
    reviewsCount: 48
  }
];

export const CROP_LIST: CropData[] = [
  {
    id: "cotton",
    name: "Cotton",
    subName: "Gossypium hirsutum",
    scientificName: "Gossypium spp.",
    image: "/images/crops/cotton.jpg",
    tagline: "Biological bollworm deterrence, square drop prevention & bio-fungicide root defense for cotton.",
    description: "Cotton crops require robust biological management against sucking pests (whiteflies, thrips, aphids) and bollworms (Helicoverpa armigera), along with organic biostimulants to maximize square and boll retention.",
    majorPestsAndDiseases: ["Helicoverpa armigera", "Whiteflies & Aphids", "Square & Boll Drop", "Root Rot & Wilt"],
    recommendedProductIds: [
      "neem-oil-1000",
      "pushkal-biostimulant",
      "balavan-bacillus",
      "suraksha-pseudomonas",
      "annada-amino",
      "bhumi-shakti"
    ]
  },
  {
    id: "rice",
    name: "Rice (Paddy)",
    subName: "Oryza sativa",
    scientificName: "Oryza sativa",
    image: "/images/crops/rice.jpg",
    tagline: "Comprehensive blast bio-fungicides, sheath blight shields & stalk strengthening for paddy.",
    description: "Paddy requires targeted preventive bio-fungicides against Rice Blast, Sheath Blight, and Bacterial Leaf Blight, together with potassium mobilizing biofertilizers to prevent lodging.",
    majorPestsAndDiseases: ["Paddy Sheath Blight", "Rice Blast", "Bacterial Leaf Blight", "Stem Lodging"],
    recommendedProductIds: [
      "balavan-bacillus",
      "suraksha-pseudomonas",
      "harit-trichoderma",
      "dharani-kmb",
      "neem-oil-1000",
      "annada-amino"
    ]
  },
  {
    id: "soyabean",
    name: "Soya Bean",
    subName: "Glycine max",
    scientificName: "Glycine max",
    image: "/images/crops/soyabean.jpg",
    tagline: "Defoliator caterpillar deterrence, pod borer protection & collar rot bio-defense for soya bean.",
    description: "Soya bean faces severe threats from defoliating semiloopers, Spodoptera caterpillars, and pod-boring larvae during flowering, along with collar rot in humid soil.",
    majorPestsAndDiseases: ["Gram pod borers", "Helicoverpa armigera", "Collar Rot", "Flower & Pod Drop"],
    recommendedProductIds: [
      "neem-oil-1000",
      "harit-trichoderma",
      "pushkal-biostimulant",
      "balavan-bacillus",
      "bhumi-shakti"
    ]
  },
  {
    id: "maize",
    name: "Maize (Corn)",
    subName: "Zea mays",
    scientificName: "Zea mays",
    image: "/images/crops/maize.jpg",
    tagline: "Fall Armyworm (FAW) botanical management, leaf blight bio-controls & cob filling nutrients.",
    description: "Protect maize from destructive Fall Armyworm (FAW) and stem borers with whorl-applied botanical bio-insecticides, alongside preventive bio-fungicides for leaf blight.",
    majorPestsAndDiseases: ["Fall Armyworm", "Stem Borer", "Maydis Leaf Blight", "Stem Weakness"],
    recommendedProductIds: [
      "neem-oil-1000",
      "balavan-bacillus",
      "dharani-kmb",
      "annada-amino",
      "bhumi-shakti"
    ]
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    subName: "Saccharum officinarum",
    scientificName: "Saccharum officinarum",
    image: "/images/crops/sugarcane.jpg",
    tagline: "Sett treatment bio-fungicides, red rot suppression & cane stalk potassium mobilizers.",
    description: "Protect standing stalks from soil-borne red rot pathogen, while mobilizing potassium for thicker stalks, higher sugar recovery, and vigorous ratoon crop growth.",
    majorPestsAndDiseases: ["Red Rot & Sett Rot", "Rhizosphere Pathogens", "Stem Borers", "Stalk Weakness"],
    recommendedProductIds: [
      "harit-trichoderma",
      "suraksha-pseudomonas",
      "dharani-kmb",
      "bhumi-shakti",
      "annada-amino"
    ]
  },
  {
    id: "groundnut",
    name: "Groundnut",
    subName: "Arachis hypogaea",
    scientificName: "Arachis hypogaea",
    image: "/images/crops/groundnut.jpg",
    tagline: "Tikka leaf spot bio-fungicides, aphid vector controls & peg penetration stimulants.",
    description: "Groundnut crops are highly susceptible to Tikka (Cercospora) leaf spot and collar rot, alongside sucking aphids that transmit viral rosette disease.",
    majorPestsAndDiseases: ["Tikka Leaf Spot", "Collar Rot & Root Rot", "Aphids & Thrips", "Poor Pod Filling"],
    recommendedProductIds: [
      "balavan-bacillus",
      "harit-trichoderma",
      "neem-oil-1000",
      "pushkal-biostimulant",
      "bhumi-shakti"
    ]
  },
  {
    id: "wheat",
    name: "Wheat",
    subName: "Triticum aestivum",
    scientificName: "Triticum aestivum",
    image: "/products/category-rice.jpg",
    tagline: "Rust bio-fungicides, loose smut seed treatments & aphid controls for high wheat yields.",
    description: "Wheat management demands preventive bio-fungicides against yellow and brown rust, seed treatments for loose smut, and potassium mobilizing biofertilizers.",
    majorPestsAndDiseases: ["Yellow & Brown Rust", "Loose Smut", "Wheat Aphid", "Stem Lodging"],
    recommendedProductIds: [
      "balavan-bacillus",
      "harit-trichoderma",
      "dharani-kmb",
      "neem-oil-1000",
      "annada-amino"
    ]
  },
  {
    id: "chilli",
    name: "Chilli & Spices",
    subName: "Capsicum annuum",
    scientificName: "Capsicum annuum",
    image: "/products/category-spices.jpg",
    tagline: "Black thrips & mite repellents, fruit rot bio-fungicides & flower drop arresters.",
    description: "Chilli crops face high pressure from invasive black thrips and mites causing leaf curl (Murda disease), along with Anthracnose fruit rot during fruit ripening.",
    majorPestsAndDiseases: ["Black Thrips & Mites", "Fruit Rot & Anthracnose", "Flower & Fruit Drop", "Fusarium Wilt"],
    recommendedProductIds: [
      "pushkal-biostimulant",
      "neem-oil-1000",
      "balavan-bacillus",
      "suraksha-pseudomonas",
      "harit-trichoderma"
    ]
  }
];

export const DISEASE_LIST: DiseaseData[] = [
  {
    id: "mustard-aphid",
    name: "Mustard Aphid",
    category: "Insect Pest",
    scientificName: "Lipaphis erysimi",
    image: "/images/diseases/mustard-aphid.png",
    tagline: "Standardized Azadirachtin botanical IPM & stress-recovery amino biostimulants.",
    symptoms: "Nymphs and adults colonize tender shoots, inflorescence, and pods, sucking sap and causing plant curling, stunted growth, honeydew secretion, and sooty mold.",
    controlMeasure: "Foliar spray of NEEM OIL 1000 PPM (Azadirachtin botanical IPM) at 3-5 ml/L at first pest sighting, supplemented with ANNADA fish amino acid for rapid foliage rejuvenation.",
    susceptibleCrops: ["Mustard & Rapeseed", "Cotton", "Wheat", "Vegetables", "Soya Bean"],
    recommendedProductIds: [
      "neem-oil-1000",
      "annada-amino",
      "suraksha-pseudomonas"
    ]
  },
  {
    id: "paddy-sheath-blight",
    name: "Paddy Sheath Blight",
    category: "Fungal Disease",
    scientificName: "Rhizoctonia solani",
    image: "/images/diseases/paddy-sheath-blight.png",
    tagline: "Biological antagonistic bio-fungicides & microbial rhizosphere defenders.",
    symptoms: "Oval or greenish-grey water-soaked lesions appear on leaf sheaths near the water level, enlarging into irregular snake-skin patterns with distinct brownish margins.",
    controlMeasure: "Preventive application of BALAVAN (Bacillus subtilis) and HARIT (Trichoderma viride) supplemented with SURAKSHA (Pseudomonas fluorescens) at active tillering.",
    susceptibleCrops: ["Rice (Paddy)", "Maize", "Sugarcane"],
    recommendedProductIds: [
      "balavan-bacillus",
      "harit-trichoderma",
      "suraksha-pseudomonas",
      "dharani-kmb"
    ]
  },
  {
    id: "gram-pod-borers",
    name: "Gram pod borers",
    category: "Insect Pest",
    scientificName: "Helicoverpa armigera",
    image: "/images/diseases/gram-pod-borers.png",
    tagline: "Botanical oviposition deterrents & wound-protective bio-fungicides.",
    symptoms: "Larvae bore round holes into chickpea, pigeonpea, and soya bean pods, feeding on developing seeds with their body half inside and half outside the pod.",
    controlMeasure: "Apply NEEM OIL 1000 PPM to disrupt caterpillar feeding and deter egg-laying, combined with BALAVAN to protect punctured pods against secondary fungal rotting, and PUSHKAL to replace aborted flowers.",
    susceptibleCrops: ["Gram & Chickpea", "Soya Bean", "Cotton", "Tomato", "Pigeonpea"],
    recommendedProductIds: [
      "neem-oil-1000",
      "balavan-bacillus",
      "pushkal-biostimulant"
    ]
  },
  {
    id: "rice-blast",
    name: "Rice Blast",
    category: "Fungal Disease",
    scientificName: "Pyricularia oryzae / Magnaporthe oryzae",
    image: "/images/diseases/rice-blast.png",
    tagline: "Systemic microbial bio-fungicides targeting foliar, nodal, and neck blast.",
    symptoms: "Spindle-shaped, diamond-like lesions with brownish margins and greyish centers on leaves, rotting of panicle nodes, and broken neck blast causing chaffy grains.",
    controlMeasure: "Foliar spray of BALAVAN (Bacillus subtilis) at active tillering and panicle emergence, integrated with seed treatment of HARIT (Trichoderma viride) and DHARANI KMB to strengthen stem silica walls.",
    susceptibleCrops: ["Rice (Paddy)", "Millets", "Wheat"],
    recommendedProductIds: [
      "balavan-bacillus",
      "harit-trichoderma",
      "dharani-kmb",
      "suraksha-pseudomonas"
    ]
  },
  {
    id: "bacterial-leaf-blight",
    name: "Bacterial Leaf Blight",
    category: "Bacterial Disease",
    scientificName: "Xanthomonas oryzae pv. oryzae",
    image: "/images/diseases/bacterial-leaf-blight.png",
    tagline: "Beneficial Pseudomonas & Bacillus bio-bactericide defense shields.",
    symptoms: "Water-soaked stripes starting from leaf tips and margins, progressing into wavy yellowish-white lesions with milky bacterial ooze droplets in morning dew.",
    controlMeasure: "Foliar and root application of SURAKSHA (Pseudomonas fluorescens) combined with BALAVAN (Bacillus subtilis) to activate systemic plant defense mechanisms.",
    susceptibleCrops: ["Rice (Paddy)", "Cotton (Blackarm)", "Pulses"],
    recommendedProductIds: [
      "suraksha-pseudomonas",
      "balavan-bacillus",
      "annada-amino",
      "bhumi-shakti"
    ]
  },
  {
    id: "helicoverpa-armigera",
    name: "Helicoverpa armigera",
    category: "Insect Pest",
    scientificName: "Helicoverpa armigera (American Bollworm)",
    image: "/images/diseases/helicoverpa-armigera.png",
    tagline: "Botanical bio-deterrents & reproductive square retention biostimulants.",
    symptoms: "Caterpillars feed voraciously on leaves, tender shoots, flower buds, cotton bolls, and tomato fruits, causing heavy boll drop and punctured crops.",
    controlMeasure: "Targeted foliar spray of NEEM OIL 1000 PPM (3-5 ml/L) to prevent larval development and deter moth egg-laying, combined with PUSHKAL to retain cotton bolls and accelerate emergency flower set.",
    susceptibleCrops: ["Cotton", "Soya Bean", "Gram / Chickpea", "Tomato & Chilli", "Maize"],
    recommendedProductIds: [
      "neem-oil-1000",
      "pushkal-biostimulant",
      "balavan-bacillus"
    ]
  }
];

export function getCropById(id: string): CropData | undefined {
  const norm = id.toLowerCase().trim();
  return CROP_LIST.find((c) => c.id.toLowerCase() === norm || c.name.toLowerCase().includes(norm));
}

export function getDiseaseById(id: string): DiseaseData | undefined {
  const norm = id.toLowerCase().trim();
  return DISEASE_LIST.find((d) => d.id.toLowerCase() === norm || d.name.toLowerCase().includes(norm));
}

export function getPesticidesForCrop(cropId: string): CropProtectionProduct[] {
  const crop = getCropById(cropId);
  if (!crop) return ALL_PESTICIDES.slice(0, 4);

  const matched = ALL_PESTICIDES.filter((p) =>
    crop.recommendedProductIds.includes(p.id) ||
    p.crops.includes(crop.id)
  );

  return matched.length > 0 ? matched : ALL_PESTICIDES.slice(0, 4);
}

export function getPesticidesForDisease(diseaseId: string): CropProtectionProduct[] {
  const disease = getDiseaseById(diseaseId);
  if (!disease) return ALL_PESTICIDES.slice(0, 4);

  const matched = ALL_PESTICIDES.filter((p) =>
    disease.recommendedProductIds.includes(p.id) ||
    p.diseases.includes(disease.id)
  );

  return matched.length > 0 ? matched : ALL_PESTICIDES.slice(0, 4);
}
