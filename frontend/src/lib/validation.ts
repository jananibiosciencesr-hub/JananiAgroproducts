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
 * Validates Indian and standard mobile phone numbers.
 * Accepts:
 * - 10-digit standard Indian mobile numbers (starting with 6, 7, 8, 9)
 * - Numbers with +91 or 91 country code prefix
 * - Numbers with 0 prefix
 * Examples: 9311416225, +91 93114 16225, +91-93114-16225, 09311416225
 */
export function validatePhone(phone: string): ValidationResult {
  const trimmed = (phone || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "Phone number is required." };
  }

  // Extract all digit characters
  const digits = trimmed.replace(/\D/g, "");

  // Normalize: handle +91 / 91 prefix or 0 prefix
  let localDigits = digits;
  if (digits.length === 12 && digits.startsWith("91")) {
    localDigits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    localDigits = digits.slice(1);
  }

  if (localDigits.length < 10) {
    return {
      isValid: false,
      error: `Phone number is too short (${localDigits.length}/10 digits).`,
      cleanValue: localDigits,
    };
  }

  if (localDigits.length > 10) {
    return {
      isValid: false,
      error: `Phone number is too long (${localDigits.length}/10 digits).`,
      cleanValue: localDigits,
    };
  }

  // Standard Indian mobile number prefix check (6, 7, 8, or 9)
  if (!/^[6-9]/.test(localDigits)) {
    return {
      isValid: false,
      error: "Indian mobile numbers must begin with 6, 7, 8, or 9.",
      cleanValue: localDigits,
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
 * Detects common Gmail typos: @gamil.com, @gmai.com, @gmial.com, missing .com
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = (email || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "Email address is required." };
  }

  const lower = trimmed.toLowerCase();

  // Check for common domain typos
  if (
    lower.includes("@gamil.") ||
    lower.includes("@gmai.") ||
    lower.includes("@gmial.") ||
    lower.includes("@gmaill.")
  ) {
    return {
      isValid: false,
      error: "Typo detected in Gmail domain.",
      suggestion: "Did you mean @gmail.com?",
    };
  }

  // Check for incomplete Gmail domain
  if (lower.endsWith("@gmail") || lower.endsWith("@gmail.")) {
    return {
      isValid: false,
      error: "Please complete your Gmail address (e.g. name@gmail.com).",
      suggestion: "Add .com to the end of your Gmail address.",
    };
  }

  // Check for missing '@'
  if (!trimmed.includes("@")) {
    return {
      isValid: false,
      error: "Email is missing '@' symbol (e.g. name@gmail.com).",
    };
  }

  // Check for missing domain extension
  const parts = trimmed.split("@");
  if (parts.length === 2 && !parts[1].includes(".")) {
    return {
      isValid: false,
      error: "Email domain must include an extension (e.g. .com, .in).",
    };
  }

  // Standard RFC-compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "Please enter a valid email address (e.g. priyesh@gmail.com).",
    };
  }

  return { isValid: true, cleanValue: trimmed.toLowerCase() };
}
