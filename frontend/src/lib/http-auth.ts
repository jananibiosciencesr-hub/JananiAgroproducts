/**
 * Authenticated API transport for the Janani Agro storefront and admin portal.
 *
 * - Attaches the signed session token (issued by api.php) to every same-origin API request:
 *     storefront pages  -> customer token (janani_auth_token)
 *     /admin pages      -> admin token    (janani_admin_token)
 * - A 401 from the API means the session is invalid/expired: the matching local session is
 *   cleared and an event is dispatched so the UI can ask the user to sign in again.
 * - Compatibility: much of the existing client code reads `res.ok` before looking at the JSON
 *   `success` / `message` fields. JSON error responses (4xx/5xx) are therefore surfaced as readable
 *   bodies (status 200 + header "X-Janani-Status" with the real status) so callers show the server's
 *   message instead of treating the request as "unreachable".
 */

const TOKEN_PREFIX = "jat1.";

const CUSTOMER_SESSION_KEYS = [
  "janani_token",
  "janani_auth_token",
  "janani_user",
  "janani_auth_user",
  "janani_user_auth_time",
  "janani_auth_time",
];

const ADMIN_SESSION_KEYS = ["janani_admin_session", "janani_admin_token", "janani_admin_user", "janani_admin_auth_time"];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function isAdminContext(): boolean {
  return isBrowser() && window.location.pathname.startsWith("/admin");
}

function validToken(value: string | null): string | null {
  return value && value.startsWith(TOKEN_PREFIX) ? value : null;
}

/** Customer session token issued by the server (null for legacy / missing sessions). */
export function getCustomerToken(): string | null {
  if (!isBrowser()) return null;
  return validToken(localStorage.getItem("janani_auth_token") || localStorage.getItem("janani_token"));
}

/** Admin session token issued by the server. */
export function getAdminToken(): string | null {
  if (!isBrowser()) return null;
  return validToken(localStorage.getItem("janani_admin_token"));
}

/** Token for the current page: admin portal uses the admin session, everything else the customer session. */
export function getRequestToken(): string | null {
  return isAdminContext() ? getAdminToken() : getCustomerToken();
}

export function clearCustomerSession(): void {
  if (!isBrowser()) return;
  CUSTOMER_SESSION_KEYS.forEach((k) => {
    try {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
}

export function clearAdminSession(): void {
  if (!isBrowser()) return;
  ADMIN_SESSION_KEYS.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
}

function isApiUrl(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl, window.location.origin);
    const sameOrigin = u.origin === window.location.origin;
    const localDevApi = /^(localhost|127\.0\.0\.1)$/.test(u.hostname) && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    if (!sameOrigin && !localDevApi) return false;
    return u.pathname === "/api.php" || u.pathname.startsWith("/api/");
  } catch {
    return false;
  }
}

let lastExpiryNotice = 0;

function handleUnauthorized(): void {
  const now = Date.now();
  if (now - lastExpiryNotice < 3000) return;
  lastExpiryNotice = now;
  if (isAdminContext()) {
    if (localStorage.getItem("janani_admin_session") || localStorage.getItem("janani_admin_token")) {
      clearAdminSession();
      window.dispatchEvent(new CustomEvent("janani-admin-session-expired"));
    }
    return;
  }
  if (localStorage.getItem("janani_user") || localStorage.getItem("janani_auth_user") || localStorage.getItem("janani_auth_token")) {
    clearCustomerSession();
    window.dispatchEvent(new CustomEvent("janani-customer-session-expired"));
  }
}

// ---------------------------------------------------------------------------
// Shared hosting protection: Hostinger limits simultaneous PHP processes and MySQL connections.
// Pages like the admin dashboard start ~15-30 API calls at once, which made the server answer 503.
// API calls are therefore queued (a few at a time) and a 503 "server busy" answer is retried.
// ---------------------------------------------------------------------------
const MAX_CONCURRENT_API_REQUESTS = 4;
/** Extra slots reserved for what the user is actively waiting for (save buttons, sign-in, payment, delivery charge). */
const PRIORITY_EXTRA_SLOTS = 3;
const MAX_BUSY_RETRIES = 2;
/** A background read that hangs must not block the queue for ever. */
const READ_TIMEOUT_MS = 25000;
let activeApiRequests = 0;
const waitingApiRequests: Array<() => void> = [];

function acquireApiSlot(priority: boolean): Promise<void> {
  const limit = priority ? MAX_CONCURRENT_API_REQUESTS + PRIORITY_EXTRA_SLOTS : MAX_CONCURRENT_API_REQUESTS;
  if (activeApiRequests < limit) {
    activeApiRequests++;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    const start = () => {
      activeApiRequests++;
      resolve();
    };
    // user-initiated requests go to the front of the line, background loading waits
    if (priority) waitingApiRequests.unshift(start);
    else waitingApiRequests.push(start);
  });
}

function releaseApiSlot(): void {
  activeApiRequests = Math.max(0, activeApiRequests - 1);
  const next = waitingApiRequests.shift();
  if (next) next();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A 503 that means "server busy / database connection refused" - nothing was executed, safe to retry. */
async function isRetryableBusy(response: Response): Promise<boolean> {
  if (response.status !== 503) return false;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return true; // web-server level 503 (process limit)
  try {
    const data = await response.clone().json();
    return !!data?.serviceUnavailable;
  } catch {
    return true;
  }
}

let installed = false;

export function installAuthFetch(): void {
  if (installed || !isBrowser() || typeof window.fetch !== "function") return;
  installed = true;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!isApiUrl(url)) {
      return nativeFetch(input as RequestInfo, init);
    }

    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    const token = getRequestToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
      headers.set("X-Janani-Auth", token);
    }

    let response: Response;
    const method = String(init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    const isRead = method === "GET" || method === "HEAD";
    const callerSignal = init?.signal ?? undefined;
    await acquireApiSlot(!isRead || url.includes("mode=quote"));
    try {
      let attempt = 0;
      for (;;) {
        // the caller cancelled (for example a newer delivery quote replaced this one): stop at once
        if (callerSignal?.aborted) throw new DOMException("Request cancelled", "AbortError");
        const timeout = isRead && !callerSignal ? new AbortController() : null;
        const timer = timeout ? setTimeout(() => timeout.abort(), READ_TIMEOUT_MS) : null;
        try {
          response = await nativeFetch(input as RequestInfo, { ...init, headers, ...(timeout ? { signal: timeout.signal } : {}) });
        } catch (networkError) {
          // never repeat a cancelled or timed-out request, nor a write that may already have reached the server
          if (!isRead || callerSignal?.aborted || timeout?.signal.aborted || attempt >= MAX_BUSY_RETRIES) throw networkError;
          attempt++;
          await sleep(700 * attempt + Math.random() * 400);
          continue;
        } finally {
          if (timer) clearTimeout(timer);
        }
        if (attempt < MAX_BUSY_RETRIES && (await isRetryableBusy(response))) {
          attempt++;
          await sleep(700 * attempt + Math.random() * 400);
          continue;
        }
        break;
      }
    } finally {
      releaseApiSlot();
    }

    if (response.status === 401) {
      handleUnauthorized();
    }
    if (response.ok) return response;

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await response.text();
      const passHeaders = new Headers(response.headers);
      passHeaders.set("X-Janani-Status", String(response.status));
      return new Response(body, { status: 200, statusText: "OK", headers: passHeaders });
    }
    return response;
  };
}

