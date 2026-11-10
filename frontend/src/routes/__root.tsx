import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
  ScrollRestoration,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: any; reset?: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              if (reset) reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "google-site-verification", content: "googlef54c20f96caff23a" },
      { name: "author", content: "JANANI AGRO PRODUCTS" },
      { name: "publisher", content: "JANANI AGRO PRODUCTS" },
      { name: "theme-color", content: "#15803d" },
      { name: "geo.region", content: "IN-GJ" },
      { name: "geo.placename", content: "Rajkot, Gujarat, India" },
      { name: "geo.position", content: "22.2587;70.7833" },
      { name: "ICBM", content: "22.2587, 70.7833" },
      { property: "og:site_name", content: "JANANI AGRO PRODUCTS" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/logo.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://www.googletagmanager.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const jsonLdOrgWebSite = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://jananiagroproducts.com/#organization",
        "name": "JANANI AGRO PRODUCTS",
        "legalName": "Janani Agro Products Private Limited",
        "url": "https://jananiagroproducts.com",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://jananiagroproducts.com/#logo",
          "url": "https://jananiagroproducts.com/logo.png",
          "caption": "Janani Agro Products - Manufacturer of Agricultural Inputs"
        },
        "description": "Leading Indian manufacturer of agricultural bio-fertilizers, bio-pesticides, bio-fungicides, humic biostimulants and crop protection formulations.",
        "telephone": "+91-93114-16225",
        "email": "contact@jananiagroproducts.com",
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+91-93114-16225",
            "contactType": "Customer Service & Agronomy Support",
            "areaServed": "IN",
            "availableLanguage": ["English", "Hindi", "Gujarati", "Telugu"]
          }
        ],
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Plot No. 24, Survey No. 47, Lodhika GIDC, Metoda",
          "addressLocality": "Rajkot",
          "addressRegion": "Gujarat",
          "postalCode": "360021",
          "addressCountry": "IN"
        },
        "sameAs": [
          "https://www.facebook.com/jananiagroproducts",
          "https://www.instagram.com/jananiagroproducts",
          "https://wa.me/919311416225"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://jananiagroproducts.com/#website",
        "url": "https://jananiagroproducts.com",
        "name": "JANANI AGRO PRODUCTS",
        "publisher": {
          "@id": "https://jananiagroproducts.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://jananiagroproducts.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Google Analytics 4 (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-3PP2EML8T7"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              var gaId = (typeof window !== 'undefined' && window.JANANI_CONFIG && window.JANANI_CONFIG.gaMeasurementId) || 'G-3PP2EML8T7';
              gtag('config', gaId, {
                send_page_view: true
              });
            `,
          }}
        />
        {/* Global Structured Data: Organization & WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrgWebSite) }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();

  // Send SPA pageview to Google Analytics on route transition
  useEffect(() => {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      const search = location.searchStr ? `?${location.searchStr}` : "";
      const path = location.pathname + search;
      const gaId = (window as any).JANANI_CONFIG?.gaMeasurementId || "G-3PP2EML8T7";
      (window as any).gtag("config", gaId, {
        page_path: path,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [location.pathname, location.searchStr]);

  return (
    <QueryClientProvider client={queryClient}>
      <SiteShell><Outlet /></SiteShell>
    </QueryClientProvider>
  );
}
