# UI/UX Audit — findings & fixes

Every item below was found, fixed, and re-verified with a production build and a
running server. No redesign was done: layout, palette and typography are the same
site, corrected where it was actually failing.

## Accessibility

| Issue | Fix |
|---|---|
| Small text at 40–55% opacity failed WCAG AA (some as low as **2.5:1**) | Swept every page: minimum body-text contrast now **4.5:1+** |
| Copper eyebrow labels on cream were **3.7:1** | Added `copper-deep` (#8A4E28, **5.7:1**) for small text; original copper kept for large display type, icons and fills |
| White text on WhatsApp green was **2.0:1** | Text buttons now use a darkened WhatsApp green (**5.8:1**). The floating icon button keeps brand green (logo exemption) |
| Primary buttons hovered to a copper that dropped text contrast below AA | Hover states re-paired: dark backgrounds invert to copper-light + deep text; light backgrounds go to copper-deep |
| No visible keyboard focus anywhere; form inputs used `focus:outline-none` | Global `:focus-visible` ring (copper on light, copper-light on dark); removed the outline suppression |
| No skip link | "Skip to content" link added, jumping to `#main` |
| Mobile menu: no `aria-expanded`/`aria-controls`, no Escape key, page scrolled behind it | All three added, plus scroll lock and a scrollable, capped menu height |
| No `aria-current` on the active nav item | Added (desktop + mobile) |
| Gallery lightbox: close button had **no click handler**, no Escape, no dialog role, focus lost on close | Now a proper `role="dialog"` with Escape, working close button, scroll lock, and focus returned to the thumbnail you opened |
| Gallery filters gave no state to screen readers; 40px tall | `aria-pressed` added; raised to a 44px touch target |
| Form status messages weren't announced | Wrapped in `aria-live="polite"` |
| Animations ignored the OS "reduce motion" setting | `MotionConfig reducedMotion="user"` + a CSS fallback |
| Heading jump h1 → h3 on the destinations index | Added a screen-reader heading for the grid |
| Nav text could sit on bright hero imagery | Added a top scrim while the header is transparent |

## SEO

- **No social share image** on any page → default 1200×630 OG image site-wide, and per-page images for tours, destinations and posts (auto-cropped to the right ratio).
- **No canonical URLs** → added to every page, including dynamic ones.
- **No favicon** (browsers showed a blank tab) → SVG icon, Apple touch icon, web manifest, theme colour.
- **Thin structured data** (site-level only) → added `TouristTrip` + `Offer` + `BreadcrumbList` on tour pages and `Article` on journal posts, so Google can show price and breadcrumb rich results.
- Added `max-image-preview:large` for larger thumbnails in search results.

## Performance

- AVIF/WebP enabled for all images (typically 30–50% smaller than JPEG) with a 31-day cache.
- Corrected `sizes` on tour and destination cards — they were requesting ~33% more pixels than the grid uses at desktop widths.
- Security headers (`nosniff`, `Referrer-Policy`, `X-Frame-Options`) and `poweredByHeader: false`.

## Layout, responsive & forms

- Hero headline used `13vw`, which overshot on large phones → fluid `clamp()` with a safe floor and ceiling; hero padding and the stats row tightened so nothing crowds on a 375px screen.
- Fleet cards could collapse at `md` where the image switched to `aspect-auto` → minimum height added.
- Long words/emails could overflow their container → global `overflow-wrap`, and the contact email now wraps on word boundaries rather than mid-character.
- Headlines now use `text-wrap: balance` for even line breaks.
- Booking form: added `autocomplete` (name/email/tel), correct mobile keyboards, and a minimum travel date of today — you can no longer request a trip in the past.
- Contact page: WhatsApp link opens in a new tab with a prefilled message, the map has a descriptive title, a heading, and an "Open in Google Maps" fallback for anyone whose browser blocks the embed.
- Menu button and gallery filters raised to 44px minimum touch targets.
- Related-tour and related-destination sections used styled paragraphs as headings → now real `<h2>`s.

## Verified

Production build passes with zero type errors. All 37 public routes plus the admin
routes return 200; `/admin` still redirects to login; unknown URLs return the styled
404. Automated checks confirm: one `<h1>` per page, no heading-level jumps, no image
without `alt`, no control without an accessible name, no form field without a label,
zoom not disabled, and `rel="noopener"` on every external link.

**Not verifiable here:** the sandbox blocks headless browsers and direct image
requests, so this audit is structural and code-level — it can't confirm that each
Unsplash photo still resolves, or catch a purely visual glitch. Worth one pass with
your own eyes on a phone and a laptop. Any image that ever fails to load degrades to
a warm gradient panel rather than a broken-image icon.
