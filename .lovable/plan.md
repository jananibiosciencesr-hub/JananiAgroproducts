# JANANI AGRO PRODUCTS Ecommerce Build

## Goal
Build a polished, responsive, frontend-only organic agriculture ecommerce experience with complete navigation, realistic sample data, and working client-side interactions.

## Visual System
- Apply the supplied JANANI green, wheat-gold, cream, white, and forest palette as semantic design tokens.
- Load Playfair Display for headings, Poppins for body copy, and Montserrat for controls.
- Use a luxury editorial direction: immersive farm photography, translucent navigation, organic section contours, restrained glass effects, 24px product cards, soft shadows, and botanical motion.
- Support desktop, laptop, tablet, and mobile layouts, including a compact mobile drawer and bottom navigation.

## Storefront
- Build the home experience with announcement bar, navigation and product mega-menu, immersive farming hero, trust metrics, certification bar, story preview, 10 categories, featured products, services, premium collections, farm-to-home timeline, testimonials, gallery, articles, FAQs, contact banner, and full footer.
- Add search, quick view, wishlist, cart, quantity changes, filters, sorting, grid/list modes, pagination, accordions, dialogs, carousels, cookie banner, newsletter popup, help controls, and back-to-top interactions.
- Populate 24 products, 10 categories, 6 services, 8 testimonials, 8 articles, FAQs, offers, coupons, orders, addresses, and notifications with realistic sample content.

## Connected Pages
- Catalog: products, product details, categories, category details, search, cart, checkout, wishlist.
- Brand and sales: about, services, blog, blog details, contact, dealer enquiry, distributor registration.
- Account: login, signup, forgot/reset password flow, dashboard, profile, orders, notifications, order tracking.
- Information: FAQ, privacy, terms, returns, shipping, plus a branded 404 experience.
- Give each content page its own title and social metadata; all navigation targets will be real routes.

## Technical Approach
- Use TanStack Start’s existing routing and React 19 structure, while delivering the requested React/Tailwind/Shadcn-style experience.
- Centralize sample commerce data and reusable product, category, article, navigation, footer, form, and account-layout components.
- Keep cart, wishlist, search, filters, checkout steps, forms, and order tracking interactive in browser state; no database, real authentication, payment processing, shipment API, or form delivery will be added because this is frontend-only.
- Generate and bundle cohesive agricultural imagery rather than shipping placeholders or hotlinked assets.
- Add accessible labels, keyboard-friendly controls, reduced-motion support, image alt text, stable responsive dimensions, and page-level SEO metadata.

## Validation
- Verify the current build diagnostics after implementation.
- Exercise key flows in the live preview: navigation, product browse/detail, wishlist/cart, checkout steps, account pages, mobile menu, and responsive layouts at desktop and mobile sizes.
