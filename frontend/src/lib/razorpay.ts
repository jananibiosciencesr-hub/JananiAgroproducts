/**
 * JANANI AGRO PRODUCTS - Razorpay Standard Checkout integration
 *
 * Flow (all money decisions happen on the server):
 *  1. createRazorpayOrder()  -> api.php prices the cart from the database and creates the Razorpay order
 *  2. Razorpay popup         -> customer pays
 *  3. onSuccess(response)    -> caller sends razorpay_order_id / payment_id / signature to createOrder(),
 *                               the server verifies the signature and records the order exactly once.
 * A Razorpay webhook (payment.captured) also records the order if the browser closes after paying.
 *
 * There is no simulated / offline payment path: if Razorpay cannot be loaded or the server cannot
 * create a payment, the customer is told so and can retry.
 */
import { installAuthFetch } from "./http-auth";

installAuthFetch();

export interface RazorpayCartItem {
  productId: number | string;
  slug?: string;
  cartKey?: string;
  variantKey?: string;
  variantId?: string;
  name?: string;
  quantity: number;
}

export interface RazorpayOrderRequest {
  items: RazorpayCartItem[];
  couponCode?: string;
  address: Record<string, any>;
  expectedTotal: number;
  deliverySlot?: string;
  orderNotes?: string;
  useWalletCredit?: boolean;
}

export interface RazorpayOrderResult {
  success: boolean;
  message?: string;
  orderId?: string;
  keyId?: string;
  amount?: number; // paise
  mode?: "live" | "test";
  quote?: any;
  priceChanged?: boolean;
  couponInvalid?: boolean;
  onlinePaymentUnavailable?: boolean;
  reason?: string;
}

/**
 * Dynamically loads the official Razorpay Checkout SDK.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Asks the server to create a Razorpay order for the current cart. The amount is calculated by the
 * server from database prices; the browser total is only used to detect an outdated cart.
 */
export async function createRazorpayOrder(payload: RazorpayOrderRequest): Promise<RazorpayOrderResult> {
  try {
    const res = await fetch("/api.php?action=create-razorpay-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (data && typeof data === "object") {
      if (data.success && data.orderId && data.keyId) return data as RazorpayOrderResult;
      return { success: false, ...data, message: data.message || "Could not start the payment." };
    }
  } catch {
    /* network error */
  }
  return { success: false, message: "We couldn't reach the payment server. Please check your connection and try again." };
}

/**
 * Server-side signature check (optional - createOrder() verifies again before recording the order).
 */
export async function verifyRazorpayPayment(payload: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}): Promise<{ success: boolean; verified: boolean }> {
  try {
    const res = await fetch("/api.php?action=verify-razorpay-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (data && typeof data === "object") {
      return { success: !!data.success, verified: !!data.verified };
    }
  } catch {
    /* network error */
  }
  return { success: false, verified: false };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  order: RazorpayOrderResult; // result of createRazorpayOrder()
  orderLabel?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onFailure: (error: { description: string; code?: string }) => void;
  onDismiss?: () => void;
}

export type OpenCheckoutResult = { opened: true } | { opened: false; reason: string };

/**
 * Opens the Razorpay Standard Checkout popup for a server-created Razorpay order.
 */
export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<OpenCheckoutResult> {
  if (!options.order?.success || !options.order.orderId || !options.order.keyId || !options.order.amount) {
    return { opened: false, reason: options.order?.message || "Payment could not be started." };
  }
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || typeof (window as any).Razorpay === "undefined") {
    return {
      opened: false,
      reason: "The Razorpay payment window could not be loaded. Please disable any ad-blocker / check your internet connection and try again.",
    };
  }

  const rzpOptions = {
    key: options.order.keyId,
    amount: options.order.amount,
    currency: "INR",
    name: "Janani Agro Products",
    description: options.orderLabel || "Janani Agro order",
    image: "/favicon.svg",
    order_id: options.order.orderId,
    handler: function (response: any) {
      if (!response?.razorpay_payment_id || !response?.razorpay_order_id || !response?.razorpay_signature) {
        options.onFailure({ description: "Payment response was incomplete. If money was debited, please contact support." });
        return;
      }
      options.onSuccess({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      });
    },
    prefill: {
      name: options.customerName || "",
      email: options.customerEmail || "",
      contact: options.customerPhone ? options.customerPhone.replace(/\D/g, "").slice(-10) : "",
    },
    notes: {
      merchant_name: "Janani Agro Products",
    },
    theme: {
      color: "#1b4332",
      backdrop_color: "rgba(10, 25, 18, 0.75)",
    },
    modal: {
      ondismiss: function () {
        options.onDismiss?.();
      },
    },
  };

  try {
    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.on("payment.failed", function (response: any) {
      options.onFailure({
        description: response?.error?.description || "Payment failed or was cancelled.",
        code: response?.error?.code,
      });
    });
    rzp.open();
    return { opened: true };
  } catch (err) {
    console.error("Error opening Razorpay checkout:", err);
    return { opened: false, reason: "The payment window could not be opened. Please try again." };
  }
}
