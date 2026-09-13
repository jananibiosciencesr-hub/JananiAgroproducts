export interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: "home" | "work" | "farm";
}

export interface SavedCard {
  id: string;
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  brand: "visa" | "mastercard" | "rupay" | "amex";
  isDefault: boolean;
}

export interface SavedUpi {
  id: string;
  upiId: string;
  provider: string;
  isDefault: boolean;
}

export type SupportedLanguage = "en" | "gu" | "hi" | "mr";
export type SupportedCurrency = "INR" | "USD" | "EUR" | "GBP" | "AED";

export interface ProfilePreferences {
  language: SupportedLanguage;
  currency: SupportedCurrency;
  whatsappAlerts: boolean;
  smsAlerts: boolean;
  emailDigest: boolean;
  dietaryInterests: string[];
}
