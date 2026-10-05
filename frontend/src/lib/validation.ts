/**
 * Validation utilities for Janani Agro Products
 * Standardized phone number and email/gmail validation
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
  cleanValue?: string;
}

/**
 * Calculate Levenshtein edit distance between two strings
 */
function getLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) dp[i] = [i];
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] = 1 + Math.min(
          dp[i - 1]![j]!,
          dp[i]![j - 1]!,
          dp[i - 1]![j - 1]!
        );
      }
    }
  }
  return dp[m]![n]!;
}

// Known common typos for Gmail
const KNOWN_GMAIL_TYPOS = new Set([
  "gmil.com", "gamil.com", "gmial.com", "gmai.com", "gmaill.com", "gmeil.com",
  "gmaul.com", "gmal.com", "gmaik.com", "gmakl.com", "gmaii.com", "gmaio.com",
  "gmail.con", "gmail.co", "gmail.cm", "gmail.cpm", "gmail.om", "gmail.comm",
  "gmil.co", "gamil.co", "gmai.co", "gmil.in", "gamil.in", "gmai.in",
  "gmail.in", "gmail.cim", "gmail.cok", "gmail.col", "gmail.vom", "g-mail.com",
  "gemail.com", "gmaill.co", "gmaill.con", "gmali.com", "gmaild.com", "gmaol.com",
  "gmaile.com", "gmila.com", "gmaiil.com", "gmiil.com",
  "emil.com", "email.com", "e-mail.com", "emil.co", "emai.com", "emial.com"
]);

// Known common typos for Yahoo
const KNOWN_YAHOO_TYPOS = new Set([
  "yaho.com", "yahooo.com", "yhaoo.com", "yhoo.com", "yaho.co", "yahoo.co",
  "yahoo.con", "ymail.con", "yaho.in", "yahooo.in"
]);

// Known common typos for Outlook / Hotmail
const KNOWN_MICROSOFT_TYPOS = new Set([
  "outlok.com", "outloo.com", "outlock.com", "outllok.com",
  "hotmial.com", "hotmai.com", "hotmaill.com", "hotamil.com"
]);

/**
 * Validates Indian mobile phone numbers.
 * Rules:
 * 1. Must be strictly 10 digits (non-digits stripped, +91/91/0 prefix normalized).
 * 2. Indian mobile numbers NEVER start with 0, 1, 2, 3, 4, 5.
 * 3. Must strictly start with 6, 7, 8, or 9.
 */
export function validatePhone(phone: string): ValidationResult {
  const trimmed = (phone || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "Phone number is required." };
  }

  // Extract all digit characters
  const digits = trimmed.replace(/\D/g, "");

  // Normalize: handle +91 / 91 prefix or 0 prefix if user pastes
  let localDigits = digits;
  if (digits.length === 12 && digits.startsWith("91")) {
    localDigits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    localDigits = digits.slice(1);
  }

  // 1. Strict starting digit check: Indian mobile numbers CANNOT start with 0, 1, 2, 3, 4, 5
  if (localDigits.length > 0 && !/^[6-9]/.test(localDigits)) {
    return {
      isValid: false,
      error: `Indian mobile number cannot start with '${localDigits[0]}'. It must start with 6, 7, 8, or 9.`,
      cleanValue: localDigits.slice(0, 10),
    };
  }

  // 2. Length check: Exactly 10 digits
  if (localDigits.length < 10) {
    return {
      isValid: false,
      error: `Please enter a complete 10-digit mobile number (${localDigits.length}/10 digits).`,
      cleanValue: localDigits,
    };
  }

  if (localDigits.length > 10) {
    return {
      isValid: false,
      error: `Phone number cannot exceed 10 digits (${localDigits.length}/10 digits).`,
      cleanValue: localDigits.slice(0, 10),
    };
  }

  return {
    isValid: true,
    cleanValue: `+91 ${localDigits.slice(0, 5)} ${localDigits.slice(5)}`,
  };
}

/**
 * Validates email addresses and Gmail accounts with intelligent typo detection.
 * Accepts standard email format: username@domain.tld
 * Detects common typos like @gmil.com, @emil.com, @gamil.com, @gmai.com, @gmial.com, @gmail.con
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = (email || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "Email address is required." };
  }

  const lower = trimmed.toLowerCase();

  // Must contain '@'
  if (!lower.includes("@")) {
    return {
      isValid: false,
      error: "Email must include '@' symbol (e.g. name@gmail.com).",
    };
  }

  const parts = lower.split("@");
  if (parts.length !== 2) {
    return {
      isValid: false,
      error: "Email must contain exactly one '@' symbol.",
    };
  }

  const [username, domain] = parts;

  if (!username) {
    return {
      isValid: false,
      error: "Email username is missing before '@' (e.g. yourname@gmail.com).",
    };
  }

  if (!domain) {
    return {
      isValid: false,
      error: "Email domain is missing after '@' (e.g. gmail.com).",
      suggestion: "Did you mean @gmail.com?",
    };
  }

  // Incomplete domain check like @gmail, @gmil, @emil
  const incompleteDomains = ["gmail", "gmil", "emil", "email", "gamil", "yahoo", "yaho", "outlook", "hotmail"];
  if (incompleteDomains.includes(domain) || domain === "gmail." || domain === "gmil." || domain === "emil.") {
    const isYaho = domain.includes("yaho");
    const isOut = domain.includes("out") || domain.includes("hot");
    return {
      isValid: false,
      error: `Please complete your email address (e.g. name@${isYaho ? "yahoo.com" : isOut ? "outlook.com" : "gmail.com"}).`,
      suggestion: isYaho ? "Did you mean @yahoo.com?" : isOut ? "Did you mean @outlook.com?" : "Did you mean @gmail.com?",
    };
  }

  if (!domain.includes(".")) {
    const isGmailLike = domain.startsWith("gm") || domain.startsWith("em") || getLevenshteinDistance(domain, "gmail") <= 2;
    return {
      isValid: false,
      error: `Domain "@${domain}" is missing extension like .com or .in.`,
      suggestion: isGmailLike ? "Did you mean @gmail.com?" : undefined,
    };
  }

  // 1. Gmail typo detection (catches @gmil.com, @emil.com, @gamil.com, @gmai.com, etc.)
  if (
    domain !== "gmail.com" &&
    (KNOWN_GMAIL_TYPOS.has(domain) ||
      (domain.endsWith(".com") && getLevenshteinDistance(domain, "gmail.com") <= 2) ||
      (domain.startsWith("g") && getLevenshteinDistance(domain, "gmail.com") <= 2) ||
      domain === "emil.com" ||
      domain === "email.com")
  ) {
    return {
      isValid: false,
      error: `Typo detected in Gmail domain ("@${domain}").`,
      suggestion: "Did you mean @gmail.com?",
    };
  }

  // 2. Yahoo typo detection
  if (
    domain !== "yahoo.com" &&
    domain !== "ymail.com" &&
    domain !== "yahoo.co.in" &&
    (KNOWN_YAHOO_TYPOS.has(domain) ||
      (domain.startsWith("y") && getLevenshteinDistance(domain, "yahoo.com") <= 2))
  ) {
    return {
      isValid: false,
      error: `Typo detected in Yahoo domain ("@${domain}").`,
      suggestion: "Did you mean @yahoo.com?",
    };
  }

  // 3. Outlook / Hotmail typo detection
  if (
    (domain !== "outlook.com" && domain !== "hotmail.com") &&
    (KNOWN_MICROSOFT_TYPOS.has(domain) ||
      getLevenshteinDistance(domain, "outlook.com") <= 2 ||
      getLevenshteinDistance(domain, "hotmail.com") <= 2)
  ) {
    const isHotmail = domain.startsWith("hot");
    return {
      isValid: false,
      error: `Typo detected in domain ("@${domain}").`,
      suggestion: isHotmail ? "Did you mean @hotmail.com?" : "Did you mean @outlook.com?",
    };
  }

  // 4. Invalid generic extensions (.con, .cpm, .comm, .cim, .col)
  const ext = domain.split(".").pop();
  if (["con", "cpm", "comm", "cim", "col", "cmm"].includes(ext || "")) {
    return {
      isValid: false,
      error: `Invalid email domain extension ".${ext}".`,
      suggestion: "Did you mean .com?",
    };
  }

  // 5. Standard RFC-compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "Please enter a valid email address (e.g. priyesh@gmail.com).",
    };
  }

  return { isValid: true, cleanValue: lower };
}
