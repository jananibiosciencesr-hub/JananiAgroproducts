import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Delivery charges. The amount is always computed by the server (api.php?action=delivery-charges&mode=quote) from the
 * admin-configured pincode rules, the cart weight and the products subtotal - the browser only displays it.
 */

export interface DeliveryQuote {
  success: boolean;
  /** false when the pincode is invalid or we do not deliver there (see message) */
  ok: boolean;
  /** true once a valid pincode was priced */
  known: boolean;
  charge: number;
  /** the charge that applies when delivery is not free */
  baseCharge: number;
  free: boolean;
  freeAbove: number;
  amountToFree: number;
  weightKg: number;
  subtotal: number;
  pincode: string;
  city: string;
  ruleName: string;
  message?: string;
}

/** Shown after "Add to cart" (like Amazon): the delivery charge depends on pincode + weight. */
export const DELIVERY_NOTICE = "Delivery charges applicable - enter your pincode in the cart to see the exact amount.";

const PIN_KEY = "janani_delivery_pincode";
const PIN_EVENT = "janani:delivery-pincode";

export function getSavedPincode(): string {
  if (typeof window === "undefined") return "";
  try {
    const v = (localStorage.getItem(PIN_KEY) || "").replace(/\D/g, "");
    return v.length === 6 ? v : "";
  } catch {
    return "";
  }
}

export function saveDeliveryPincode(pin: string) {
  if (typeof window === "undefined") return;
  const clean = String(pin || "").replace(/\D/g, "");
  try {
    if (clean.length === 6) localStorage.setItem(PIN_KEY, clean);
    else if (clean === "") localStorage.removeItem(PIN_KEY);
    window.dispatchEvent(new CustomEvent(PIN_EVENT, { detail: clean }));
  } catch {
    /* storage unavailable */
  }
}

/** Keeps every page's pincode box in sync (cart, product page, checkout). */
export function useDeliveryPincode(): [string, (pin: string) => void] {
  const [pin, setPin] = useState("");
  useEffect(() => {
    setPin(getSavedPincode());
    const onChange = (e: Event) => setPin(String((e as CustomEvent).detail || ""));
    window.addEventListener(PIN_EVENT, onChange);
    return () => window.removeEventListener(PIN_EVENT, onChange);
  }, []);
  return [pin, (p: string) => saveDeliveryPincode(p)];
}

/** Cart / product rows -> the minimal item shape the server prices (same shape as the order request). */
export interface QuoteItem {
  productId: unknown;
  slug: unknown;
  cartKey: unknown;
  variantKey: unknown;
  variantId: unknown;
  name: unknown;
  quantity: number;
}

export function toQuoteItems(items: any[]): QuoteItem[] {
  return (items || []).map((i: any) => ({
    productId: i.product?.id ?? i.productId ?? i.id,
    slug: i.product?.slug ?? i.slug,
    cartKey: i.cartKey,
    variantKey: i.variant?.id ?? i.variantKey,
    variantId: i.variantId,
    name: i.product?.name || i.name,
    quantity: i.qty || i.quantity || 1,
  }));
}

export async function fetchDeliveryQuote(pincode: string, items: any[], signal?: AbortSignal): Promise<DeliveryQuote | null> {
  const clean = String(pincode || "").replace(/\D/g, "");
  try {
    const res = await fetch("/api.php?action=delivery-charges&mode=quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pincode: clean, items: toQuoteItems(items) }),
      ...(signal ? { signal } : {}),
    });
    const data = await res.json().catch(() => null);
    if (!data || data.success !== true) return null;
    return {
      success: true,
      ok: data.ok !== false,
      known: !!data.known,
      charge: Number(data.charge) || 0,
      baseCharge: Number(data.baseCharge) || 0,
      free: !!data.free,
      freeAbove: Number(data.freeAbove) || 0,
      amountToFree: Number(data.amountToFree) || 0,
      weightKg: Number(data.weightKg) || 0,
      subtotal: Number(data.subtotal) || 0,
      pincode: String(data.pincode || clean),
      city: String(data.city || ""),
      ruleName: String(data.ruleName || ""),
      message: data.message ? String(data.message) : "",
    };
  } catch {
    return null;
  }
}

/**
 * Prices delivery for the given pincode + cart. Re-runs (debounced) whenever the pincode, the items or the quantities change.
 * `error` is true when the server could not be reached, so callers never show a made-up charge.
 */
export function useDeliveryQuote(pincode: string, items: any[]) {
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const key = useMemo(
    () =>
      JSON.stringify([
        String(pincode || "").replace(/\D/g, ""),
        toQuoteItems(items).map((i) => [i.productId, i.cartKey, i.variantId, i.quantity]),
      ]),
    [pincode, items]
  );
  const latest = useRef({ pincode, items });
  latest.current = { pincode, items };

  useEffect(() => {
    const pin = String(latest.current.pincode || "").replace(/\D/g, "");
    if (pin.length !== 6 || latest.current.items.length === 0) {
      setQuote(null);
      setLoading(false);
      setError(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      const q = await fetchDeliveryQuote(pin, latest.current.items, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setQuote(q);
      setError(!q);
      setLoading(false);
    }, 250);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [key]);

  return { quote, loading, error };
}
