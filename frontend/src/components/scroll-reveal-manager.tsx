import React, { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * ScrollRevealManager
 * 
 * Provides smooth, GPU-accelerated scroll-triggered transitions
 * (left-to-right & top-to-bottom) for all cards and content sections
 * while scrolling both UP and DOWN.
 * 
 * Engineered with hysteresis to eliminate flickering and preserves
 * 100% interactivity, SSR safety, and existing functionalities.
 */
export function ScrollRevealManager() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // Check accessibility setting
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Mark document as scroll-animation enabled
    document.documentElement.classList.add("scroll-animate-ready");

    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    const trackedElements = new Set<Element>();

    const scanAndObserve = () => {
      if (!observer) return;

      // Targets: All cards, content containers, section headers, and grid children
      const selectors = [
        "article",
        ".product-card",
        "[data-card]",
        ".card",
        ".feature-card",
        ".stat-card",
        ".testimonial-card",
        ".pantry-card",
        // Category cards and grid items
        ".grid > div",
        ".grid > article",
        // Section headers, badges and titles
        "section > div > h1",
        "section > div > h2",
        "section > div > h3",
        "section h2",
        "section .section-header",
        // Content blocks
        "section .prose",
        "main section > div.max-w-7xl",
        "main section > div.responsive-shell-container"
      ];

      const elements = Array.from(document.querySelectorAll(selectors.join(",")));

      elements.forEach((el, index) => {
        if (trackedElements.has(el)) return;

        // Strictly exclude navigation, sticky elements, modals, drawers, toasts, hero carousel
        if (
          el.closest("header") ||
          el.closest("nav") ||
          el.closest("[role='dialog']") ||
          el.closest("[role='menu']") ||
          el.closest("[aria-modal='true']") ||
          el.closest(".toaster") ||
          el.closest(".modal") ||
          el.closest(".cart-drawer") ||
          el.closest(".hero-carousel-container") ||
          el.closest("[data-no-scroll-reveal]") ||
          el.classList.contains("fixed") ||
          el.classList.contains("sticky") ||
          el.hasAttribute("data-no-scroll-reveal")
        ) {
          return;
        }

        // Avoid double-animating child elements inside an already tracked card
        if (el.closest("article") && el !== el.closest("article")) {
          return;
        }

        // Inside horizontal scroll containers, observe the carousel as a whole, not inner individual swipe pills
        const horizontalParent = el.closest(".overflow-x-auto, .overflow-x-scroll, [data-horizontal-scroll]");
        if (horizontalParent && el !== horizontalParent) {
          return;
        }

        trackedElements.add(el);

        // Determine transition direction:
        // Headers and titles -> Top to Bottom
        // Cards and content -> Alternating Left-to-Right & Top-to-Bottom
        const isHeader =
          el.tagName === "H1" ||
          el.tagName === "H2" ||
          el.tagName === "H3" ||
          el.classList.contains("section-header") ||
          el.parentElement?.tagName === "HEADER";

        if (!el.classList.contains("scroll-reveal-left") && !el.classList.contains("scroll-reveal-top")) {
          if (isHeader) {
            el.classList.add("scroll-reveal-top");
          } else {
            const parent = el.parentElement;
            const childIndex = parent ? Array.from(parent.children).indexOf(el) : index;
            // Alternating pattern:
            // Even child index -> Left to Right
            // Odd child index -> Top to Bottom
            if (childIndex % 2 === 0) {
              el.classList.add("scroll-reveal-left");
            } else {
              el.classList.add("scroll-reveal-top");
            }

            // Stagger delay within multi-column grid rows for elegant cascading entrance
            const staggerDelay = (childIndex % 4) * 0.08;
            (el as HTMLElement).style.transitionDelay = `${staggerDelay}s`;
          }
        }

        // If element is already in the viewport on initial mount, reveal immediately (no blank flash)
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("is-revealed");
        }

        observer?.observe(el);
      });
    };

    // Shared IntersectionObserver with hysteresis buffer for bi-directional scroll triggers
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add("is-revealed");
          } else {
            // While scrolling up and down:
            // Only un-reveal once the element is completely outside the viewport by at least 80px
            const rect = entry.boundingClientRect;
            if (rect.bottom < -80 || rect.top > window.innerHeight + 80) {
              el.classList.remove("is-revealed");
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -40px 0px",
        threshold: [0, 0.1],
      }
    );

    // Initial scan with brief tick to allow layout to settle
    const initialTimer = setTimeout(scanAndObserve, 60);

    // Watch for dynamic DOM additions (e.g. search filter results, category switching)
    mutationObserver = new MutationObserver(() => {
      scanAndObserve();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(initialTimer);
      if (observer) {
        observer.disconnect();
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
  }, [pathname]);

  return null;
}

