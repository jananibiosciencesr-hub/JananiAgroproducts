import { isProductInCategory, type Product } from "./catalog";

export const CATEGORY_SEARCH_INTENTS = [
  {
    category: "Bio Fertilizers",
    keywords: ["bio fertilizer", "bio fertilizers", "biofertilizer", "biofertilizers", "fertilizer", "fertilizers", "kmb", "potassium mobilizer"],
  },
  {
    category: "Bio Pesticides",
    keywords: ["bio pesticide", "bio pesticides", "biopesticide", "biopesticides", "pesticide", "pesticides"],
  },
  {
    category: "Bio Fungicides",
    keywords: ["bio fungicide", "bio fungicides", "biofungicide", "biofungicides", "fungicide", "fungicides"],
  },
  {
    category: "Bio Stimulants",
    keywords: ["bio stimulant", "bio stimulants", "biostimulant", "biostimulants", "stimulant", "stimulants"],
  },
  {
    category: "Botanical Extracts",
    keywords: ["botanical extract", "botanical extracts", "botanical", "botanicals"],
  },
  {
    category: "Micro Nutrients",
    keywords: ["micro nutrient", "micro nutrients", "micronutrient", "micronutrients"],
  },
  {
    category: "Insecticides",
    keywords: ["insecticide", "insecticides"],
  },
  {
    category: "Water Solubles",
    keywords: ["water soluble", "water solubles"],
  },
  {
    category: "Agri Inputs",
    keywords: ["agri input", "agri inputs"],
  },
];

export function detectCategoryIntent(query: string) {
  const q = (query || "").toLowerCase().trim().replace(/[-_]/g, " ");
  if (!q) return null;
  for (const intent of CATEGORY_SEARCH_INTENTS) {
    for (const kw of intent.keywords) {
      if (q === kw || q === kw.replace(/\s+/g, "")) {
        return intent;
      }
    }
  }
  return null;
}

/**
 * Returns variants for a word token (singular, plural, stripped punctuation)
 * to ensure:
 * - "roots" matches "root"
 * - "fungicides" matches "fungicide"
 * - "fertilizers" matches "fertilizer"
 * - "pesticides" matches "pesticide"
 * - "stimulants" matches "stimulant"
 * - "nutrients" matches "nutrient"
 * - "tomatoes" matches "tomato"
 */
export function getWordVariants(token: string): string[] {
  const t = token.toLowerCase().trim();
  if (!t) return [];
  const variants = new Set<string>([t]);

  // Clean alphanumeric
  const clean = t.replace(/[^a-z0-9]/g, "");
  if (clean) {
    variants.add(clean);
  }

  // Common English plural / singular conversions
  if (t.endsWith("ies") && t.length > 4) {
    variants.add(t.slice(0, -3) + "y"); // berries -> berry
  } else if (t.endsWith("es") && t.length > 3) {
    variants.add(t.slice(0, -2)); // tomatoes -> tomato
    variants.add(t.slice(0, -1)); // categories -> categorie
  } else if (t.endsWith("s") && !t.endsWith("ss") && t.length > 2) {
    variants.add(t.slice(0, -1)); // roots -> root, fertilizers -> fertilizer
  } else if (t.length > 2) {
    // Singular -> also match plurals
    variants.add(t + "s");
    variants.add(t + "es");
  }

  return Array.from(variants).filter((v) => v.length > 0);
}

/**
 * Builds a searchable text blob containing all product attributes
 */
export function getProductSearchCorpus(p: Product | any): string {
  const parts: string[] = [
    p.name || "",
    p.subtitle || "",
    p.category || "",
    p.brand || "",
    p.description || "",
    p.badge || "",
    p.origin || "",
    p.targetDiseases || "",
    p.recommendedCrops || "",
    p.dosage || "",
    p.methodOfApplication || "",
    p.compatibility || "",
    p.sku || "",
    p.slug || "",
  ];

  if (Array.isArray(p.aliases)) parts.push(...p.aliases);
  if (Array.isArray(p.dietaryTags)) parts.push(...p.dietaryTags);
  if (Array.isArray(p.benefits)) parts.push(...p.benefits);
  if (Array.isArray(p.crops)) parts.push(...p.crops);
  if (Array.isArray(p.certifications)) parts.push(...p.certifications);

  if (p.specifications && typeof p.specifications === "object") {
    parts.push(...Object.keys(p.specifications));
    parts.push(...Object.values(p.specifications).map(String));
  }

  if (Array.isArray(p.variants)) {
    p.variants.forEach((v: any) => {
      if (v.label) parts.push(v.label);
      if (v.unit) parts.push(v.unit);
      if (v.name) parts.push(v.name);
      if (v.sku) parts.push(v.sku);
    });
  }

  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Calculates search relevance score.
 * Returns 0 if the product does NOT match query terms or category constraints.
 * Returns > 0 if matching, with higher scores for matches in name, subtitle, category, etc.
 */
export function calculateProductRelevance(p: Product | any, query: string): number {
  const q = (query || "").trim().toLowerCase();
  if (!q) return 1;

  // 1. Strict Category Intent Check:
  // If query is specifically a category phrase (e.g. "bio fertilizers", "bio pesticides"),
  // only products belonging to that category or bearing that category term in their title/subtitle are allowed.
  const intent = detectCategoryIntent(q);
  if (intent) {
    const isCatMatch = isProductInCategory(p, intent.category);
    const pName = (p.name || "").toLowerCase();
    const pSub = (p.subtitle || "").toLowerCase();
    const hasDirectTitle = intent.keywords.some((kw) => pName.includes(kw) || pSub.includes(kw));

    if (!isCatMatch && !hasDirectTitle) {
      return 0; // Exclude products from other categories
    }
  }

  const rawTokens = q.split(/\s+/).filter(Boolean);
  if (rawTokens.length === 0) return 1;

  const corpus = getProductSearchCorpus(p);
  const normalizedCorpus = corpus.replace(/[^a-z0-9\s]/g, " ");
  const compactCorpus = corpus.replace(/[-\s]/g, "");

  // Every token must match somewhere in the product (via at least one of its variants)
  for (const token of rawTokens) {
    const variants = getWordVariants(token);
    const tokenMatched = variants.some((v) => {
      const vClean = v.replace(/[-\s]/g, "");
      return (
        corpus.includes(v) ||
        normalizedCorpus.includes(v) ||
        (vClean.length > 0 && compactCorpus.includes(vClean))
      );
    });

    if (!tokenMatched) {
      return 0; // Token not found anywhere
    }
  }

  // Base score for matching all tokens
  let score = 10;

  // Strong bonus for direct category match
  if (intent && isProductInCategory(p, intent.category)) {
    score += 120;
  }

  const nameLower = (p.name || "").toLowerCase();
  const subLower = (p.subtitle || "").toLowerCase();
  const catLower = (p.category || "").toLowerCase();
  const aliases = (p.aliases || []).map((a: string) => String(a).toLowerCase());
  const badgeLower = (p.badge || "").toLowerCase();
  const nameWords = nameLower.split(/[\s-]+/).filter(Boolean);
  const catWords = catLower.split(/[\s-]+/).filter(Boolean);

  // Exact phrase and word-start bonuses
  if (nameLower === q) score += 150;
  else if (nameLower.startsWith(q)) score += 100;
  else if (nameWords.some((w: string) => w.startsWith(q))) score += 80;
  else if (catWords.some((w: string) => w.startsWith(q))) score += 50;
  else if (nameLower.includes(q)) score += 40;

  if (subLower.includes(q)) score += 40;
  if (catLower.includes(q)) score += 30;
  if (aliases.some((a: string) => a.includes(q))) score += 45;
  if (badgeLower.includes(q)) score += 25;

  // Token-level bonuses across priority fields
  for (const token of rawTokens) {
    const variants = getWordVariants(token);
    for (const v of variants) {
      if (nameLower.includes(v)) score += 25;
      if (subLower.includes(v)) score += 15;
      if (catLower.includes(v)) score += 12;
      if (aliases.some((a: string) => a.includes(v))) score += 20;
      if (badgeLower.includes(v)) score += 15;

      if (Array.isArray(p.dietaryTags) && p.dietaryTags.some((t: string) => String(t).toLowerCase().includes(v))) {
        score += 10;
      }
      if (Array.isArray(p.benefits) && p.benefits.some((b: string) => String(b).toLowerCase().includes(v))) {
        score += 8;
      }
      if (p.targetDiseases && String(p.targetDiseases).toLowerCase().includes(v)) {
        score += 6;
      }
    }
  }

  return score;
}

/**
 * Simple boolean matcher for search query
 */
export function matchesProductSearch(p: Product | any, query: string): boolean {
  if (!query || !query.trim()) return true;
  return calculateProductRelevance(p, query) > 0;
}
