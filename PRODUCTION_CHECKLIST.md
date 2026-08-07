# Production Checklist — Island Route Sri Lanka

Everything that could be fixed in code **has been**. What follows is the work only
you can do: things needing your accounts, your credentials, your photos, or a real
browser. Work top to bottom — the blockers come first.

---

## 🔴 Blockers — the site should not go live without these

### 1. Replace the stock photography
Every image is currently hot-linked from Unsplash. This is legal (Unsplash licence)
but wrong for a real travel brand — your competitors' guests can tell, and you're
depending on someone else's CDN staying up.

- [ ] Shoot or gather your own photos: your vehicles, your drivers, your guests, your routes
- [ ] Upload to Supabase Storage (or `/public/photos/`)
- [ ] Replace the URLs in `lib/images.ts` — every page pulls from that one file
- [ ] Add your image host to `next.config.mjs` → `images.remotePatterns` (there's a commented example)
- [ ] **Verify each image actually loads.** I could not check this from my sandbox — the environment blocks outbound image requests. If any Unsplash ID has been removed since, that image shows a warm gradient panel instead of a photo. Click through every page once.

### 2. Verify the marketing claims
These numbers are in the code as placeholders and are currently presented as fact
on your homepage and About page. Publishing figures you can't support is a real
risk — both reputational and, in some jurisdictions, legal.

- [ ] `app/page.tsx` — "10+ years", "2,400+ journeys", "5.0 ★ guest rating", "24/7"
- [ ] `app/about/page.tsx` — "10+ years", "2,400+ journeys", "30+ nationalities"
- [ ] `components/Footer.tsx` — "Licensed Sri Lankan tour operator · Fully insured fleet"
- [ ] The eight guest reviews in `lib/content.ts` are **written examples, not real customers**. Replace them with real reviews before launch, or delete them. Fake testimonials breach consumer-protection law in the UK, EU, US and Australia — most of your target markets.

### 3. Tour prices
- [ ] Confirm every `priceFrom` in `lib/tours.ts` (or in the admin, once seeded) is a price you'll actually honour
- [ ] Decide whether USD is right, and whether "per person" matches how you quote

### 4. Connect the backend
Without this, form submissions fall back to WhatsApp only — nothing is stored.
- [ ] Follow `SETUP.md`: create the Supabase project, run `schema.sql` then `seed.sql`
- [ ] Create your admin user and promote it to `admin`
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
- [ ] Submit one test booking and confirm it appears in `/admin/bookings`

### 5. Email
- [ ] Create the Gmail app password, add `SMTP_*` and `ADMIN_EMAIL` to Vercel
- [ ] Send a test enquiry; confirm **both** the admin alert and the guest auto-reply arrive
- [ ] Check the guest copy doesn't land in spam (see SPF/DKIM below)

---

## 🟠 Before you announce the site

### Domain & deployment
- [ ] Point your domain at Vercel; confirm HTTPS and auto-renewing certificate
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the live domain — **canonicals, sitemap and social images all read from it**, so getting this wrong silently breaks SEO
- [ ] Pick one canonical host and 301 the other (`www` → apex, or the reverse)
- [ ] Update `url` in `lib/site.ts` to match

### Email deliverability
- [ ] Add SPF and DKIM records for whatever sends your mail
- [ ] Consider a transactional provider (Resend, Postmark) over Gmail SMTP — Gmail app passwords are rate-limited and guest confirmations often land in spam

### Search & analytics
- [ ] Verify the domain in **Google Search Console**, submit `/sitemap.xml`
- [ ] Same in **Bing Webmaster Tools**
- [ ] Test 3–4 tour pages in the [Rich Results Test](https://search.google.com/test/rich-results) — the `TouristTrip`, `Offer` and `BreadcrumbList` markup is in place and valid JSON, but only Google can confirm it earns rich results
- [ ] Create a **Google Business Profile** — for a local tour operator this drives more bookings than the website's own SEO
- [ ] Add analytics (Vercel Analytics is one line; GA4 needs a cookie banner in the EU/UK)

### Run Lighthouse yourself
I could not run it — the sandbox blocks headless Chrome downloads, so **no Lighthouse
score in this project has been measured.** Everything Lighthouse scores that can be
checked without a browser has been verified (see "Already done" below), but the
Performance number depends on your hosting, images and network.

- [ ] Deploy to Vercel, then run Lighthouse in Chrome DevTools on **the live URL**, mobile preset, incognito
- [ ] Test at minimum: `/`, `/tours`, a tour detail page, `/contact`
- [ ] If Performance is below 95, the cause is almost certainly image weight — see the `next/font` upgrade below and compress your photos to ~200KB each

### The one performance upgrade left in code
Fonts currently load from Google's CDN without blocking render. Self-hosting them is
better still (one less DNS lookup and connection, zero layout shift), but it needs
network access at build time, which I couldn't verify here. Once deployed, try:

```ts
// app/layout.tsx
import { Fraunces, Archivo } from "next/font/google";
const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Archivo({ subsets: ["latin"], variable: "--font-body", display: "swap" });
// <html lang="en" className={`${display.variable} ${body.variable}`}>
// then in tailwind.config.ts: fontFamily.display = ["var(--font-display)", "Georgia", "serif"]
```
Then delete the three `<link>` tags and the `<noscript>` block. Build locally first —
if it builds, it's strictly better.

### Real-device testing
Automated checks can't see a layout. Open the live site and look at it:
- [ ] iPhone (small — SE/13 mini) and a large Android
- [ ] iPad portrait **and** landscape
- [ ] Laptop 1440px and a 27" monitor (2560px)
- [ ] Safari specifically — it's the one that breaks things
- [ ] Tab through the whole site with a keyboard: focus ring always visible, mobile menu closes on Escape, gallery lightbox traps and restores focus
- [ ] Test with the phone's "Reduce Motion" setting on

---

## 🟡 Legal & operational

- [ ] **Privacy policy** — required. The forms collect names, emails and phone numbers; GDPR applies to your UK/EU guests
- [ ] **Terms & conditions** — cancellations, refunds, luggage, liability
- [ ] **Cookie banner** — only if you add analytics/marketing cookies. The site itself sets none today, so if you skip analytics you can skip the banner
- [ ] Add both to the footer once written
- [ ] Confirm your tour operator licence number and insurance details, then put them in the footer (the current line is a placeholder claim)
- [ ] Decide who monitors `/admin/bookings` and how fast you promise to reply — the site says "within a few hours" in several places

---

## 🟢 Nice to have

- [ ] Replace the generated favicon (`public/icon.svg`, `public/apple-icon.png`) with your real logo
- [ ] Set up a `/blog` publishing rhythm — the four posts are strong SEO seeds but need company
- [ ] Add real driver photos and bios to the About page
- [ ] Uptime monitoring (UptimeRobot, free)
- [ ] Back up the Supabase database on a schedule
- [ ] Rate-limit the enquiry form at the edge if spam appears (the honeypot and content filters catch bots, but not a determined human)

---

## ✅ Already done and verified in code

Checked by an automated crawl of all 38 routes plus a production build:

| Area | Status |
|---|---|
| Build | Compiles clean, zero TypeScript errors |
| Routes | All 38 public routes return 200; `/admin` redirects to login; unknown URLs return a styled 404 |
| Broken links | None. Every internal link and every `#anchor` resolves |
| Sitemap | Valid XML, 36 URLs, covers every public page, absolute URLs |
| Robots.txt | Valid, references sitemap, disallows `/admin` |
| Canonicals | On every page including dynamic ones; all absolute HTTPS |
| Titles | All within Google's ~60-character display limit; all unique |
| Descriptions | All 70–170 characters; all unique; auto-trimmed on word boundaries |
| Open Graph | Complete on every page (`title`, `description`, `image`, `url`, `type`, `site_name`, `locale`) + Twitter cards; images cropped to 1200×630 |
| Structured data | Valid JSON on every page. `TravelAgency` site-wide, `TouristTrip` + `Offer` + `BreadcrumbList` on tours, `Article` on posts |
| Accessibility | One `<h1>` per page, no heading-level jumps, no image without `alt`, no control without an accessible name, no form field without a label, no duplicate element IDs, zoom not disabled, `rel="noopener"` on all external links |
| Contrast | All text meets WCAG AA (4.5:1); scrims over photography deepened so overlaid text holds contrast |
| Keyboard | Visible focus ring site-wide; Escape closes menu and lightbox; focus returns to the element that opened the lightbox |
| Motion | Respects the OS "reduce motion" setting |
| Images | 100% `next/image` — no raw `<img>`; every image has `alt` and a correct `sizes`; AVIF/WebP enabled; 31-day cache |
| Form validation | Server-side validation on every submission — 12 unit tests passing (email format, name length, past dates, honeypot, spam patterns, 4000-char cap, control-character stripping). Client-side gives instant feedback; the server never trusts it |
| Security headers | `HSTS`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`; `X-Powered-By` removed |
| Caching | Build assets `immutable` for a year; pages ISR-revalidate every 60s |
| Database security | Row-Level Security on all 12 tables — the public can read published content and create enquiries, nothing more |

**Not verified here, by honest admission:** Lighthouse scores, real-browser rendering,
visual layout at any breakpoint, and whether each Unsplash image still resolves. The
sandbox blocks headless browsers and outbound image requests. Those four are the
first things to check on the deployed site.
