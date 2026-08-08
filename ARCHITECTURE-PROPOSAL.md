# Island Route Sri Lanka — Architectural Proposal

**Status:** Approved 8 August 2026 with revisions (see §17). Phase 0 in progress.
**Date:** 8 August 2026
**Scope:** Transform the existing Next.js 14 / TypeScript / Tailwind / Supabase project into a world-class luxury travel platform, preserving current architecture wherever it is sound.

---

## 0. Executive summary

The foundation is better than expected. This is not a rescue job.

What is already right: App Router with server components throughout, a coherent and genuinely tasteful colour and type system, Supabase with real Row Level Security, a working CMS-driven admin dashboard, a graceful seed-data fallback when the backend is absent, and an accessibility pass (documented in `AUDIT.md`) that has already fixed contrast, focus, ARIA and reduced-motion issues most agencies never touch.

What holds it back from "world's finest" is **not the code quality — it is the content model**. The site is currently a well-built brochure for a chauffeur service. The brief describes a destination-led, experience-led editorial platform. The gap between those two is a data model gap, not a CSS gap.

Five things block the target outcome:

| # | Blocker | Severity |
|---|---|---|
| 1 | **No Experiences entity at all.** The brief specifies 21 experience categories with full page templates. Nothing exists. `services` is a different concept (transfers, chauffeur hire) and cannot be repurposed. | Critical |
| 2 | **Regions are free-text strings, not entities.** `destinations.region` holds values like "Hill Capital" and "Western Capital" — descriptors, not regions. No region hub pages are possible, which forfeits the single largest SEO opportunity. | Critical |
| 3 | **All relationships are inferred by string matching.** `destinations/[slug]` finds related tours by checking whether the destination *name appears in the tour's title, excerpt or highlights*. This is fragile today and will produce wrong results the moment content grows. | Critical |
| 4 | **All imagery is external Unsplash stock, and some of it is not Sri Lanka.** `mountainLake`, `forest`, `cityLights`, `sedanNight` are generic. A luxury travel brand's entire credibility rests on photography. There is also no upload path — the admin image field is a plain URL text input. | Critical |
| 5 | **Unverified statistics and testimonials are hard-coded in source.** See §13. This conflicts with the project's own content rules and carries real legal risk. | Must resolve before launch |

Everything else is refinement.

---

## 1. Full project audit

### 1.1 Inventory

7,113 lines of TypeScript/CSS/SQL across 56 files. 3 commits. No tests, no CI.

```
app/            17 routes  (11 public, 6 admin + login)
components/      7 files   (ui.tsx is a 237-line grab-bag)
lib/            14 files   (data layer, seed content, SEO, email, validation)
supabase/        2 files   (schema.sql 273 lines, seed.sql)
public/          3 files   (icon.svg, apple-icon.png, manifest — no photography)
```

**Missing folders mandated by the project's own rules:** `types/`, `hooks/`, `utils/`, `styles/`. Everything currently lives flat in `lib/` and `components/`.

**Junk:** 55 `.fuse_hidden*` files scattered through `app/` and `components/` — filesystem artefacts from a mount, not gitignored, not tracked. Safe to delete; recommend adding to `.gitignore`.

**Config drift:** git history shows `Enable static export` → `Fix static export build`, but `next.config.mjs` no longer sets `output: 'export'`. The file also has a stray blank line and inconsistent indentation at the top. Worth confirming the intended deployment target is server-rendered Vercel (it should be — ISR, `revalidate` and middleware all depend on it).

### 1.2 Routing & layouts

| Route | Type | Notes |
|---|---|---|
| `/` | Server, ISR 60s | 352 lines, 8 sections, all inline |
| `/tours`, `/tours/[slug]` | Server, ISR 60s | Best page on the site. Has `TouristTrip` + `Offer` + `BreadcrumbList` JSON-LD |
| `/destinations`, `/destinations/[slug]` | Server, ISR 60s | No JSON-LD, no breadcrumbs |
| `/services`, `/fleet`, `/gallery`, `/reviews`, `/blog`, `/blog/[slug]`, `/about`, `/contact`, `/book` | Server, ISR 60s | `/blog/[slug]` has `Article` JSON-LD |
| `/admin/*` | Server + client | Correctly gated by `middleware.ts` matcher, anon key + RLS |

Single root layout. No route groups for the public site. No `loading.tsx`, no `error.tsx`, no `opengraph-image.tsx` anywhere.

**No `generateStaticParams` on any dynamic route.** Every tour and destination page is rendered on demand on first hit rather than prebuilt at deploy. With ~12 tours and 9 destinations this is pure waste — these should all be static.

### 1.3 Design system

`tailwind.config.ts` is the strongest part of the codebase.

- Palette: `deep #0B1F19`, `palm`, `moss`, `mist`, `sand #F6F1E6`, `dune`, `copper #B26A3B`, `copper-light`, `copper-deep #8A4E28`, `ink`. Correctly restrained, no neon, on-brief.
- `copper-deep` exists specifically because the original copper failed WCAG AA at small sizes. That is a genuinely sophisticated decision and should be preserved and extended, not overwritten.
- Type: Fraunces (display serif) + Archivo (body sans). Good pairing, correct luxury register.
- `globals.css` carries `.h-display`, `.eyebrow`, `.hairline`, `.grain`, `.img-frame`, `.link-line`, skip-link and a reduced-motion block.

**Gaps:** no spacing scale tokens (every section repeats `py-20 md:py-28` by hand), no shadow scale, no radius scale (the brief calls for rounded cards; the current design is entirely square-cornered — a deliberate editorial choice that conflicts with the brief and needs a decision), no motion-duration tokens, no z-index scale, no semantic colour aliases (`--surface`, `--surface-raised`, `--border-subtle`).

### 1.4 Component architecture

| File | Lines | Assessment |
|---|---|---|
| `components/ui.tsx` | 237 | `SectionHeading`, `TourCard`, `DestinationCard`, `ReviewCard`, `CTABand`, `PageHeader`. Good components, wrong container — a single barrel file will not scale |
| `components/Navbar.tsx` | 178 | Flat 8-item nav, no mega-menu, no dropdown. Client component |
| `components/BookingForm.tsx` | 337 | Largest component. Honeypot present, server-action driven |
| `components/motion.tsx` | 90 | `Reveal` + `HeroLine` + `MotionProvider`, `reducedMotion="user"` |
| `components/admin/EntityManager.tsx` | 340 | Generic CRUD driven by `lib/admin-entities.ts`. Genuinely good design |
| `Footer`, `GalleryGrid`, `WhatsAppFloat`, `AdminShell` | 30–139 | Fine |

**Missing from the brief:** Timeline/Itinerary, FAQ/Accordion, PriceCard, Map, Gallery lightbox as a reusable primitive, Breadcrumbs, ExperienceCard, HotelCard, Button, Input, Badge, Tabs, Carousel.

Every page currently rebuilds its own section headers, grids and CTAs inline. `app/page.tsx` alone contains four bespoke section layouts that exist nowhere else.

### 1.5 Data layer

`lib/data.ts` implements a clean pattern: try Supabase, fall back to `lib/*.ts` seed content if the table is empty or the backend is unconfigured. This makes the site demoable with zero setup. Keep it.

Problems:

- `fromTable` does `select("*")` with no pagination. `getTourBySlug` fetches **every tour** then `.find()`s in JS. Correct at 12 rows, a real problem at 300.
- `getSettings()` runs twice per request in `app/layout.tsx` — once in `generateMetadata`, once in `RootLayout`. Two Supabase round trips on every single page load. `React.cache()` fixes this in one line.
- Row types (`TourRow`, `DestRow`…) are hand-written and duplicate the SQL schema. They will drift. Supabase can generate these.
- No `updated_at` column on any content table (verified: 0 occurrences in `schema.sql`). This blocks accurate sitemap `lastModified` and any "recently updated" logic.

### 1.6 Supabase & security

Genuinely well done:

- RLS enabled on all 13 tables.
- `is_admin()` as a `security definer` function; public read gated on `published = true`.
- Admin dashboard uses the **anon key with RLS**, not the service role. This is the right call and many projects get it wrong.
- `bookings`/`inquiries`: insert-open, admin-only read. Correct.
- `middleware.ts` scoped to `/admin/:path*` only.
- `.env*.local` gitignored; only `.env.example` is tracked.

Two risks:

1. `bookings_insert` and `inquiries_insert` are `with check (true)` with no rate limiting. The form honeypot stops naive bots; a targeted script will fill the table. Recommend Supabase Edge rate limiting or Cloudflare Turnstile.
2. `profiles` has no insert/update policy for self-service — fine now, will matter if you ever add customer accounts.

### 1.7 Booking flow

`/book` → `BookingForm` → `submitBooking` server action → validate → insert → fire-and-forget nodemailer notification. Admin sees it in `/admin/bookings`, can assign vehicle + driver, set quote amount and status (`new → quoted → confirmed → completed → cancelled`), and there is an availability calendar with `availability_blocks`.

This is a solid enquiry-to-quote pipeline. For a private-touring business it is arguably the *correct* model — luxury operators quote, they do not sell off-the-shelf. Audley makes this explicit: *"We create trips as individual as you, so you won't find any set prices on our website."*

Gaps: single-step form (no progressive disclosure), no file upload, no multi-destination trip builder, no saved-favourites, no email to the *guest* (only to the operator), no booking reference number shown on success.

### 1.8 SEO — current state

Present and correct: `metadataBase`, title template, per-page canonicals, OG + Twitter cards, `TravelAgency` JSON-LD site-wide, `TouristTrip`/`Offer`/`BreadcrumbList` on tours, `Article` on posts, `robots.ts` disallowing `/admin`, dynamic `sitemap.ts`, `clampDesc`/`clampTitle` helpers, `max-image-preview:large`.

Defects:

- `sitemap.ts` hardcodes `site.url` while `layout.tsx` prefers `NEXT_PUBLIC_SITE_URL`. If the env var is ever set to a different host, the sitemap and canonicals disagree — a serious indexing bug.
- Every sitemap entry uses `lastModified: new Date()`. This tells Google the entire site changed on every crawl, which devalues the signal.
- No `BreadcrumbList` on destinations, blog, or index pages.
- No `FAQPage` schema (and no FAQs at all).
- No `sameAs` social links in the `TravelAgency` node.
- No per-entity SEO override fields in the CMS — meta descriptions are derived from `excerpt`, so they cannot be tuned per page without changing visible copy.
- No generated OG images; social cards are re-cropped Unsplash photos.

### 1.9 Performance

Good: AVIF/WebP with 31-day cache, immutable `_next/static` headers, security headers, `poweredByHeader: false`, corrected `sizes` on cards, server components by default.

Problems:

- **Fonts.** `layout.tsx` loads Google Fonts via a `<link media="print" onLoad="this.media='all'">` trick with a TypeScript cast (`as unknown as undefined`) inside a server component. This is fragile and costs a cross-origin round trip. `next/font/google` self-hosts, eliminates the round trip and the layout shift, and removes both `preconnect`s. Straight win.
- **No prebuilt dynamic pages** (no `generateStaticParams`).
- **Framer Motion on nearly every page** via `Reveal` — ~35 KB gzip of client JS for what is a fade-and-rise. CSS `animation-timeline: view()` with an IntersectionObserver fallback does this at zero JS cost.
- **`revalidate = 60` on all 11 public pages.** For content that changes weekly, 60s ISR means constant needless regeneration. On-demand revalidation from the admin save action is strictly better.
- **The video hero the brief requests is the single biggest Core Web Vitals risk in this whole plan.** Handled wrong it will cost you LCP, CLS and mobile data. Handled right (§14) it costs nothing.

### 1.10 Accessibility

Already strong. `AUDIT.md` documents fixes for contrast (now 4.5:1+), visible focus rings, skip link, mobile menu ARIA + Escape + scroll lock, `aria-current`, a proper dialog role on the gallery lightbox, `aria-live` form status, `prefers-reduced-motion`, 44px touch targets, and heading hierarchy.

This is a real asset. Every new component must meet the same bar; the plan below treats accessibility as a build constraint, not a later pass.

---

## 2. Competitive analysis — information architecture

Analysis of structure and user journey only. No text, imagery, layout, branding or code from any of these sites will be reproduced.

### Jetwing Travels — observed IA

```
About Us → Leadership · Vision & Mission · Transfers
Destinations → /destination/{slug}   (Anuradhapura, Arugam Bay, Bentota, Colombo, Ella, Galle…)
Experiences  → /experiences/
Tours        → /tour/{slug}
               themed collections: Authentic Ceylon · Adventurous Spirit · Barefoot Luxury
                                   Following the Wild · Romantic Serendipity · Join a Group
Hotels       → /hotel/{slug}
Sustainability · Offers · Gallery · Blog · FAQ · Plan Your Trip · Contact
```

**The lesson:** Jetwing's tours are organised by *emotional theme*, not by duration. "Barefoot Luxury" and "Following the Wild" sell a self-image. "7 Days" sells a logistics constraint. Both are needed — theme to inspire, duration to filter — but theme should lead.

### Audley Travel — observed IA

```
Destinations (by region, then country)
Holiday types  → Safari · Family · Beach · Honeymoon · Luxury · Cultural · Adventure · Rail · Wildlife · Off-the-beaten-track
Inspiration    → by month · trip finder · where's hot when · magazine · videos
About us       → specialists · concierge · responsible travel · reviews · history

Country page (/sri-lanka) sub-nav:
  Tours · Travel guides · Places to visit · Hotels · Things to do · Best time to visit
```

**The lessons:**

1. **The country page sub-nav is the template to beat.** Six tabs, each a real content hub: Tours, Guides, Places, Hotels, Things to do, Best time to visit. Island Route currently has Tours, a thin Places, and nothing else.
2. **Named human specialists with photographs.** Audley shows Alison, Matt, Victoria — with faces, titles and their own pages. This is the highest-trust element on the page and Island Route's equivalent (your chauffeur-guides) is currently invisible: `drivers` is an admin-only table with `hasPublished: false`.
3. **"Best time to visit" is a first-class page**, not a sentence on a destination page. It is a top-of-funnel search magnet.
4. **No fixed prices; guide pricing with an explicit explanation** of why. Audley's disclaimer is a model of turning a limitation into a signal of bespoke service.
5. **A long, honest FAQ block** covering currency, food, tipping, clothing, vaccinations, flight time, getting around. Pure organic search capture, and it directly answers the questions a first-time Sri Lanka traveller actually types.
6. **Editorial guides written by named people, with read-times.** "Sri Lanka's wildlife: safaris, jungles and plains — 10 min read, by Seamus."

### Black Tomato / Scott Dunn / Jacada / A&K / Aman — principles observed

- **Black Tomato:** inspiration-first entry points ("Get Lost", "See You in the Morning"). The user is not asked *where* but *how they want to feel*. Concept-led collections outperform catalogue-led ones.
- **Scott Dunn / Jacada:** the enquiry is the product. Every page terminates in a conversation with a named human, not a cart.
- **Abercrombie & Kent:** proof density — decades, awards, offices, guide credentials — presented calmly rather than shouted.
- **Aman:** radical restraint. One image, one line of type, enormous whitespace, no visible chrome. Luxury signalled by what is *removed*.

### Synthesis — what Island Route should do differently

Island Route's genuine advantage over all of these is that it is **local, direct and owner-operated**. Audley's chauffeur-guide is a line item; for Island Route the chauffeur-guide *is* the product. The brand position that follows:

> The international operators sell you Sri Lanka. We live here, we drive it, and you talk to us directly — before, during and after.

This should shape the IA: make the people visible, make the WhatsApp directness a feature rather than a widget in the corner, and let the destination/experience content prove the local knowledge rather than assert it.

---

## 3. Information architecture & sitemap

### 3.1 Proposed structure

```
/                                    Home
/tours                               Tours index — theme-led, filterable   ← URL PRESERVED
  /tours/[slug]                      Individual journey                    ← URL PRESERVED
  /tours/collections/[slug]          SEO collection hubs (see §12)
/destinations                        Region hub index
  /regions/[slug]                    Region hub  (7 regions)
  /destinations/[slug]               Place page  ← EXISTING URLs PRESERVED
/experiences                         Experience index, grouped by pillar
  /experiences/[slug]                Experience page
/stays                               Handpicked places to stay        [Phase 5]
  /stays/[slug]
/plan                                Plan your journey (hub)
  /plan/best-time-to-visit           Month-by-month guide
  /plan/how-it-works                 The Island Route process
  /plan/faq                          Practical FAQ (FAQPage schema)
  /plan/enquire                      Enquiry form  ← /book redirects here
/fleet                               The fleet
/team                                Your chauffeur-guides            [NEW — high trust value]
/journal                             Journal  ← /blog redirects here
  /journal/[slug]
/gallery
/reviews
/about
/contact
/admin/*                             Dashboard (noindex, auth-gated)
```

### 3.2 URL migration policy — **REVISED, approved**

**`/tours` and `/tours/[slug]` are preserved.** No rename. "Signature Journeys" is used as marketing copy in headings, nav labels and body text; the URLs, canonicals and internal links stay on `/tours`. This keeps the literal keyword match on the highest-volume query ("sri lanka tours") and forfeits no link equity.

**Preserved unchanged** (zero redirects): `/`, `/tours`, `/tours/[slug]`, `/destinations`, `/destinations/[slug]`, `/fleet`, `/gallery`, `/reviews`, `/about`, `/contact`.

**301 redirected** (only where the existing URL is genuinely inconsistent with the nav):

| From | To | Why |
|---|---|---|
| `/blog` | `/journal` | The nav already labels this "Journal" while the URL says `/blog` — an existing inconsistency, not a rebrand |
| `/blog/[slug]` | `/journal/[slug]` | |
| `/book` | `/plan/enquire` | |
| `/services` | `/plan/how-it-works` + `/fleet` | `services` content splits naturally between process and fleet |

All redirects via `next.config.mjs` `redirects()`, permanent, with the old slugs kept in the sitemap for one crawl cycle.

### 3.3 Navigation

Desktop — a restrained mega-menu, opening on hover with a 150ms intent delay, closing on Escape, fully keyboard-navigable:

```
JOURNEYS ▾     By theme:    Signature · Wildlife · Beach & Surf · Culture · Honeymoon
                            Family · Adventure · Photography · Wellness
               By length:   Half day · Full day · 3–4 days · 5–7 days · 10 days · 14 days+
               [feature card: one hero journey, image + one line]

DESTINATIONS ▾ 7 regions, each with its 3–5 headline places listed beneath
               [feature card: interactive island map preview]

EXPERIENCES ▾  4 pillars × 5 experiences  (see §11)

STAYS          (Phase 5)

PLAN ▾         How it works · Best time to visit · The fleet · Your chauffeur-guides · FAQ

ABOUT          JOURNAL          [ PLAN YOUR JOURNEY ]  ← persistent primary CTA
```

Mobile — full-screen overlay, one accordion level deep, WhatsApp and Enquire pinned to the bottom. The existing implementation already handles Escape, scroll-lock, `aria-expanded` and `aria-controls`; that logic is reused, not rewritten.

Utility bar (thin, above nav, desktop only): phone · WhatsApp · currency indicator · language (future).

### 3.4 Internal linking model

Every content page links outward through structured relationships, never string matching:

```
Region      → its Destinations, Journeys crossing it, Experiences available, Stays
Destination → its Region, nearby Destinations, Journeys including it, Experiences here, Stays, Journal posts
Experience  → Destinations offering it, Journeys featuring it, best months, Journal posts
Journey     → every Destination on the itinerary, every Experience included, Stays used, related Journeys
Journal     → primary Destination, primary Experience, one suggested Journey
```

This produces a dense, non-orphaned graph where every page is reachable within three clicks of the homepage, and gives Google a genuine topical cluster for "Sri Lanka" rather than a flat list of pages.

---

## 4. Design system

### 4.1 Principle

Extend, do not replace. The existing palette and type pairing are correct and the contrast work already done is valuable. What is missing is *tokenisation* — the values are right but they are typed by hand in every file.

### 4.2 Token layer

```
COLOUR — existing, unchanged
  deep #0B1F19 · palm #16332B · moss #2C5247 · mist #93ABA1
  sand #F6F1E6 · dune #ECE3D0 · ink #101D18
  copper #B26A3B · copper-light #D08A55 · copper-deep #8A4E28 (AA-safe small text)

COLOUR — new semantic aliases
  surface / surface-raised / surface-inverse
  border-subtle (ink/10) · border-strong (ink/20)
  text-primary / text-secondary / text-muted  — each with an on-dark counterpart
  Two additions from the brief: ocean #1F4E5F (accent only), bronze reuses copper

SPACE     section-sm 5rem · section 7rem · section-lg 9rem   (replaces hand-typed py-20 md:py-28)
RADIUS    none · sm 2px · md 4px · lg 8px · xl 16px · full
SHADOW    lift-sm · lift · lift-lg — warm-tinted (rgba(11,31,25,·)), never neutral grey
MOTION    quick 200ms · base 400ms · slow 700ms · cinematic 1400ms
          ease-out cubic-bezier(.22,1,.36,1) — already in use, formalised
Z-INDEX   base 0 · sticky 10 · nav 50 · overlay 80 · modal 90 · toast 100
```

### 4.3 Type scale (fluid, `clamp()`)

| Token | Size | Use |
|---|---|---|
| `display-xl` | clamp(2.75rem, 9vw, 7rem) | Homepage hero only |
| `display-lg` | clamp(2.25rem, 6vw, 4.5rem) | Page H1 |
| `display-md` | clamp(1.875rem, 4vw, 3rem) | Section H2 |
| `display-sm` | clamp(1.5rem, 2.5vw, 2rem) | Card titles |
| `body-lg` / `body` / `body-sm` | 1.125 / 1 / 0.875rem | 1.7 line-height |
| `eyebrow` | 0.6875rem, 0.28em tracking | Existing |

### 4.4 Corners and shadows — **DECIDED: square, editorial**

The editorial square-cornered language is retained. This overrides the "rounded cards" line in the original brief.

- **Image frames, cards, buttons, bands: square.** Hairline borders (`border-subtle`) do the separating work, not radius.
- **`radius-sm` (2px) only on form inputs and small interactive chips**, where a hard corner reads as unfinished rather than deliberate.
- **Shadows are near-absent.** No card sits on a drop shadow. The only elevation in the system is the scrolled navbar and the modal/lightbox scrim. Where lift is genuinely needed, it is a warm-tinted `rgba(11,31,25,·)` at very low opacity — never neutral grey, never more than one layer.

The `SHADOW` token scale in §4.2 is accordingly reduced to two values (`lift`, `lift-lg`) reserved for overlay surfaces only. Depth in this design comes from photography, whitespace and type scale — not from elevation.

### 4.5 Glass effects

The brief permits glass "only where appropriate". Proposed: **exactly two places** — the scrolled navbar (already `bg-sand/95 backdrop-blur`, keep) and the video-hero control cluster. Nowhere else. Overused backdrop blur is the fastest way to make a premium site look cheap, and it is expensive to composite on mobile.

---

## 5. Component architecture

`components/ui.tsx` splits into a real library. Every existing component is **moved and extended, never deleted**.

```
components/
  primitives/     Button · Link · Input · Select · Textarea · Checkbox
                  Badge · Chip · Divider · Skeleton · VisuallyHidden
  layout/         Container · Section · Grid · Stack · PageShell
  media/          Img (next/image wrapper w/ blur placeholder + frame)
                  VideoHero · Gallery · Lightbox · ImageMarquee
  content/        SectionHeading† · Prose · Eyebrow · StatRow · Quote
  cards/          TourCard† · DestinationCard† · ExperienceCard*
                  StayCard* · JournalCard* · TeamCard* · PriceCard*
  patterns/       Hero · PageHeader† · CTABand† · Testimonials(ReviewCard†)
                  FAQ* · Timeline* · Map* · Breadcrumbs* · RelatedGrid*
                  FilterBar* · Highlights* · IncludedList* · BestTime*
  navigation/     Navbar† · MegaMenu* · MobileNav · Footer† · WhatsAppFloat†
  forms/          EnquiryForm (from BookingForm†) · NewsletterForm* · FieldGroup*
  admin/          AdminShell† · EntityManager† · MediaPicker* · RelationPicker*

† existing, moved/extended    * new
```

Rules enforced: every component typed, no `any`, props interfaces exported, server component by default with `"use client"` only where interactivity demands it, a single `Section` component owning all vertical rhythm, and no page allowed to define a bespoke section layout inline.

---

## 6. CMS structure

### 6.1 New and changed entities

| Entity | Status | Purpose |
|---|---|---|
| `regions` | **NEW** | 7 geographic regions — the missing hub layer |
| `destinations` | Extend | + `region_id` FK, `lat`/`lng`, `best_months[]`, `gallery_ids[]`, SEO fields |
| `experiences` | **NEW** | The 21 categories. Full page template |
| `experience_pillars` | **NEW** | 4 groupings for navigation |
| `tours` → `journeys` | Extend | + `duration_days`, `duration_nights`, `theme_ids[]`, `price_currency`, `map_geojson`, SEO fields. `category` retained for back-compat, deprecated |
| `journey_themes` | **NEW** | Luxury · Wildlife · Beach & Surf · Culture · Honeymoon · Family · Adventure · Photography · Wellness · Private Chauffeur · Custom |
| `stays` | **NEW** | Handpicked partner hotels — *pulled forward to Phase 2b* |
| `restaurants` | **NEW** | Where to eat, per destination — the strongest local-knowledge signal on the site |
| `destination_climate` | **NEW** | 12-month normals: avg high/low, rainfall, sea temp |
| `travel_tips` | **NEW** | Polymorphic practical notes, attachable to a place or a region |
| `faqs` | **NEW** | Polymorphic: attachable to any entity or global |
| `media` | **NEW** | Supabase Storage-backed asset library with alt text, credit, focal point |
| `team` | **NEW** | Public-facing chauffeur-guides (distinct from admin-only `drivers`) |
| `activities` | **NEW** | Granular things-to-do, attachable to destinations |
| `services`, `vehicles`, `drivers`, `reviews`, `posts`, `gallery`, `site_settings` | Keep | Unchanged except `updated_at` + SEO fields |

### 6.2 Join tables (replacing all string matching)

```
journey_destinations   (journey_id, destination_id, day_from, day_to, sort)
journey_experiences    (journey_id, experience_id)
journey_stays          (journey_id, stay_id, nights)
journey_themes_map     (journey_id, theme_id)
destination_experiences(destination_id, experience_id)
destination_activities (destination_id, activity_id)
destination_stays      (destination_id, stay_id, sort)
destination_restaurants(destination_id, restaurant_id, sort)
destination_nearby     (destination_id, nearby_id, drive_minutes, road_km)
entity_faqs            (entity_type, entity_id, faq_id, sort)
entity_media           (entity_type, entity_id, media_id, role, sort)
entity_tips            (entity_type, entity_id, tip_id, sort)
```

`destination_nearby` stores **real road drive times**, entered by you, not computed from coordinates. Sri Lankan road distance bears almost no relationship to map distance, and getting this right is a small detail that signals genuine local operation more clearly than any amount of copy.

### 6.3 Shared SEO block

Added to every content table so meta can be tuned from the admin without touching visible copy:

```sql
seo_title text, seo_description text, og_image text,
noindex boolean not null default false,
updated_at timestamptz not null default now()   -- with an auto-update trigger
```

### 6.4 Admin dashboard

`lib/admin-entities.ts` is a strong, config-driven design and needs **no rewrite** — only new entity configs and three new field types:

- `relation` — multi-select against another table (powers all join tables)
- `media` — opens the asset library, uploads to Supabase Storage, captures alt text (replaces today's URL text input)
- `richtext` — structured blocks for journal and story fields

Plus: a Media Library page, a Regions page, an Experiences page, an FAQ page, and an on-demand-revalidate call on every save so edits appear instantly rather than after 60 seconds.

---

## 7. Database improvements

Delivered as **additive, idempotent migrations**. No existing table is dropped; no existing column is removed. Every migration is `create table if not exists` / `add column if not exists`, so it is safe to run against live data.

1. New tables and join tables per §6.
2. `updated_at` + trigger on all content tables (currently: zero).
3. Indexes: `destinations(region_id)`, `journeys(published, sort)`, every join-table FK pair, `slug` on all sluggable tables (unique, already partly present).
4. Full-text search: a generated `tsvector` column across title/excerpt/description on journeys, destinations, experiences and posts, with a GIN index — enables real site search.
5. Supabase Storage bucket `media`, public read, admin-only write, mirrored in the `media` table.
6. RLS on every new table following the existing, correct `published = true or is_admin()` pattern.
7. `supabase gen types typescript` wired into a `pnpm db:types` script, output to `types/database.ts`, replacing the hand-written row types in `lib/data.ts`.
8. Rate limiting on `bookings`/`inquiries` inserts.

---

## 8. Homepage wireframe

Following the brief's section order exactly. The current homepage is 352 lines of inline markup; the rebuilt one is a composition of reusable components in roughly a third of that.

```
┌────────────────────────────────────────────────────────────┐
│ 01  CINEMATIC HERO                          100svh          │
│     Poster image paints instantly (LCP target).            │
│     Video fades in only after: canplaythrough + not         │
│     save-data + not prefers-reduced-motion + viewport≥768.  │
│     Muted, loop, playsinline, no controls.                  │
│                                                             │
│     Gradient scrim: deep/75 → transparent → deep/60         │
│                                                             │
│     [eyebrow]  PRIVATE JOURNEYS · SRI LANKA                 │
│     [display-xl, staggered lines]                           │
│         The island                                          │
│         remembers you.                        ← see §8.1    │
│     [body-lg, max 34ch]                                     │
│     [ PLAN YOUR JOURNEY ]  [ EXPLORE EXPERIENCES ]          │
│                                                             │
│     ─────────────────────────────────────────────           │
│     [proof strip OMITTED until verified figures exist —     │
│      the component ships, renders nothing when empty, §13]  │
│                                          ↓ scroll cue       │
├────────────────────────────────────────────────────────────┤
│ 02  WHY TRAVEL WITH ISLAND ROUTE                            │
│     Editorial two-column. Left: 3 pillars, generous type.   │
│     Right: portrait image pair, offset, one credit line.    │
│     Pillars: Locally owned & driven · One team, start to    │
│     finish · Your pace, never a coach's                     │
├────────────────────────────────────────────────────────────┤
│ 03  FEATURED DESTINATIONS                                   │
│     Seven region cards. Editorial asymmetric grid:          │
│     [══ tall ══][ sq ][ sq ]                                │
│     [ sq ][══ wide ══════ ]                                 │
│     Each: region name, place count, one-line character.     │
├────────────────────────────────────────────────────────────┤
│ 04  SIGNATURE EXPERIENCES                                   │
│     Horizontal scroll rail, 4.5 cards visible at 1440px.    │
│     Snap points, keyboard arrows, no hidden content on      │
│     mobile (rail becomes a 2-col grid below 640px).         │
├────────────────────────────────────────────────────────────┤
│ 05  LUXURY PRIVATE JOURNEYS            [bg: deep + grain]   │
│     4 featured journeys. Existing TourCard, restyled.       │
│     Duration · region · from-price · theme badge.           │
├────────────────────────────────────────────────────────────┤
│ 06  EXPLORE SRI LANKA — INTERACTIVE MAP        ★ REVISION 4 │
│     Full-width, dark ground. Lightweight inline SVG island  │
│     (no map library, no tile requests, ~12KB).              │
│     7 region shapes, each independently hoverable.          │
│     Hover / focus  → region tints copper, side panel shows  │
│                      name, character line, 3 headline       │
│                      places, journey count, hero thumbnail  │
│     Click / Enter  → routes to /regions/[slug]              │
│     Mobile         → tap to select, panel slides up;        │
│                      pinch-zoom disabled, targets ≥44px     │
│     Keyboard       → each region is a focusable <a>, arrow  │
│                      keys cycle, Escape clears              │
│     No-JS / SR     → the same 7 regions render as a plain   │
│                      linked list beneath; the SVG is        │
│                      aria-hidden. Nothing is map-only.      │
├────────────────────────────────────────────────────────────┤
│ 07  JOURNEY PLANNER                            ★ REVISION 5 │
│     "Not sure where to start? Answer three questions."      │
│     Three-step inline selector, no page change:             │
│       1. What moves you?   wildlife · beaches & surf ·      │
│                            culture · tea country & trains · │
│                            wellness · food · adventure      │
│                            (multi-select, 2 max encouraged) │
│       2. How long?         3–4 · 5–7 · 8–10 · 11–14 · 15+   │
│       3. Travelling as?    couple · family · friends · solo │
│     → Live-filters against journey_themes + duration_days   │
│       and reveals 3 matched journeys with a match reason    │
│       ("Wildlife + 7 days + family").                       │
│       Zero results is a designed state, not an empty grid:  │
│       it becomes the strongest CTA on the page —            │
│       "Nothing off-the-shelf fits. That's what we do best." │
│     Server-rendered via searchParams so it works with JS    │
│     off and every result state is a shareable URL.          │
│     Selections prefill the enquiry form on continue.        │
├────────────────────────────────────────────────────────────┤
│ 08  YOUR CHAUFFEUR-GUIDE                       ★ REVISION 6 │
│     THE differentiator. Audley sells a "specialist" in an   │
│     office in Oxfordshire; Island Route's expert is the     │
│     person in the driver's seat for two weeks. Nobody on    │
│     the reference list can match that, and right now the    │
│     site hides it in an admin-only table.                   │
│                                                             │
│     Full-bleed portrait, left. Right, generous whitespace:  │
│       [eyebrow] YOUR GUIDE, NOT A TOUR GUIDE                │
│       Name · years driving · languages · home region        │
│       2–3 sentences in their own voice — the road they'd    │
│       drive on a day off, the stall they'd stop at          │
│       [ Meet the team → /team ]                             │
│     Rotates per visit across published team members.        │
│     Backed by a new public `team` table (§6), distinct      │
│     from the admin-only `drivers` operational record.       │
├────────────────────────────────────────────────────────────┤
│ 09  THE FLEET                                               │
│     Wide cinematic strip. 3 vehicle classes, spec on hover. │
├────────────────────────────────────────────────────────────┤
│ 10  TRAVELLER STORIES                                       │
│     One large pull-quote + 2 supporting. Serif, generous.   │
│     ⚠ SECTION HIDDEN AT LAUNCH — renders only when real,    │
│     sourced reviews exist in the CMS. See §13.              │
├────────────────────────────────────────────────────────────┤
│ 11  THE JOURNAL                                             │
│     3 posts. Image, date, read-time, title, one line.       │
├────────────────────────────────────────────────────────────┤
│ 12  FAQ — 6 questions, accordion, FAQPage schema            │
├────────────────────────────────────────────────────────────┤
│ 13  BOOKING CTA                        [bg: deep + grain]   │
│     Named human + photograph, not a faceless form.          │
│     "Talk to us" · WhatsApp · response-time promise.        │
├────────────────────────────────────────────────────────────┤
│ 14  PREMIUM FOOTER                                          │
│     5 columns · newsletter · socials · trust marks ·        │
│     legal · full sitemap links for crawl depth              │
└────────────────────────────────────────────────────────────┘
```

**On section 07 (Journey Planner):** the reason to build this server-side rather than as a client widget is that every answer combination becomes a real, shareable, crawlable URL (`/tours?theme=wildlife&duration=7&party=family`). Those filtered views carry `rel=canonical` to `/tours` so they do not bloat the index, but they are linkable from the journal, from experience pages and from your own WhatsApp replies — which is where they will actually earn their keep.

### 8.1 Headline direction

Original candidates — the brief's examples are explicitly excluded, and none of these echo any competitor's language:

1. **The island remembers you.** / *Private journeys, shaped by people who never left.*
2. **Ten thousand roads. One that's yours.**
3. **Slow down. You've arrived.**
4. **Serendib, unhurried.** — Serendib is Sri Lanka's oldest name and the root of "serendipity". Deeply local, quietly literary. *(My recommendation.)*
5. **We don't show you Sri Lanka. We take you home to it.**

Your call — I would like a decision on this before Phase 1 begins.

---

## 9. Destination system

### 9.1 Regions (7)

The brief listed eight items, two of which are not geographic. My proposal corrects this: **"Wildlife" becomes an Experience pillar**, and **"Central Highlands" merges into Hill Country** (they are the same place; Central Highlands is the UNESCO designation).

| Region | Slug | Places |
|---|---|---|
| West Coast & Colombo | `west-coast` | Colombo, Negombo, Bentota, Kalpitiya |
| South Coast | `south-coast` | Galle, Mirissa, Unawatuna, Weligama, Tangalle |
| The Wild South | `wild-south` | Yala, Udawalawe, Tissamaharama, Bundala |
| Hill Country | `hill-country` | Kandy, Ella, Nuwara Eliya, Haputale, Horton Plains |
| Cultural Triangle | `cultural-triangle` | Sigiriya, Dambulla, Polonnaruwa, Anuradhapura, Habarana |
| East Coast | `east-coast` | Arugam Bay, Trincomalee, Pasikuda, Batticaloa |
| The North | `north` | Jaffna, Mannar, Delft, Wilpattu |

All 9 existing destinations map cleanly into this: Sigiriya → Cultural Triangle, Kandy/Ella/Nuwara Eliya → Hill Country, Yala → Wild South, Galle/Mirissa → South Coast, Arugam Bay → East Coast, Colombo → West Coast. **No existing URL changes.**

### 9.2 Region hub template (`/regions/[slug]`)

Hero · Character (editorial 2–3 paragraphs) · Places in this region · When to come (month strip) · Experiences here · Journeys crossing this region · Where to stay · Region map · FAQs · CTA

### 9.3 Destination template (`/destinations/[slug]`) — **REVISED: full ecosystem**

The complete stack you specified. This makes each destination page a genuine standalone guide rather than a stub — which is exactly what outranks the aggregators.

```
Breadcrumb        Home › Destinations › {Region} › {Place}
Hero              full-bleed, name + region + one line
Quick facts       best months · drive time from Colombo/CMB · ideal stay length ·
                  altitude · pairs well with
Story             2–4 editorial paragraphs — the local knowledge that proves the brand
Highlights        numbered editorial list, not icon soup

── the ecosystem ──────────────────────────────────────────────
EXPERIENCES       what you can do here            → destination_experiences
ATTRACTIONS       what to see                     → destination_activities
                  each with hours, entry fee, time needed, and an honest
                  "worth it / skip it if short on time" note
HOTELS / STAYS    where to sleep                  → destination_stays        ★ NEW
                  3–5 handpicked, banded (Boutique · Luxury · Villa · Eco)
RESTAURANTS       where to eat                    → destination_restaurants  ★ NEW
                  the single highest-value local-knowledge signal on the page.
                  Cuisine, price band, and why your guides send people there.
                  Include the roadside places — that is the whole point.
TOURS             journeys including this place   → journey_destinations
                  (real join, never string matching)
NEARBY            other destinations with genuine drive times, not straight-line
                  distance — road distance in Sri Lanka is nothing like map distance
── practical ──────────────────────────────────────────────────
WEATHER           live current conditions + a 12-month climate strip:       ★ NEW
                  avg high/low, rainfall mm, sea temp where coastal.
                  Static climate normals stored in the CMS (they do not change);
                  live conditions fetched client-side, cached 1h, and the page
                  renders perfectly without it — never a blocking dependency.
BEST TIME         month-by-month Ideal / Good / Avoid strip, with the reason.
                  Sri Lanka's two opposing monsoons make this genuinely useful
                  rather than filler — the south-west and north-east coasts have
                  inverted seasons and almost no visitor knows this.
TRAVEL TIPS       operator-voice practical notes:                          ★ NEW
                  what to wear (temple dress codes), local etiquette, scams to
                  sidestep, tipping, connectivity, accessibility, safety
INTERACTIVE MAP   the place + its attractions, restaurants and stays plotted;
                  same inline-SVG approach as the homepage, no tile library
── close ──────────────────────────────────────────────────────
GALLERY           masonry, lightbox (existing accessible lightbox reused)
JOURNAL           related posts
FAQs              destination-specific, FAQPage schema
CTA               "Include {Place} in your journey" — prefills the enquiry form
```

**Two new entities** this requires, added to §6: `restaurants` and `stays` (the latter was already planned for Phase 5, now pulled forward to Phase 2 because the destination template depends on it). Plus `destination_climate` for the 12-month normals, and `travel_tips` as a polymorphic table so tips can attach to a region as well as a place.

**Sequencing note:** this makes Phase 2 substantially larger than originally scoped. Rather than delay it, Phase 2 splits — **2a** builds regions, the destination template shell and the Experiences/Attractions/Tours/Nearby blocks; **2b** adds Hotels, Restaurants, Weather, Travel Tips and the destination map. Each gets its own review checkpoint.

---

## 10. Experience system

### 10.1 Structure — 4 pillars, 21 experiences

All 21 from the brief, grouped so that navigation stays navigable:

| Pillar | Experiences |
|---|---|
| **Wild** | Safari · Whale Watching · Bird Watching · Snorkelling · Scuba Diving · Fishing |
| **Land** | Hiking · Cycling · Camping · Train Journeys · Tea Country · Photography |
| **Water** | Surfing · *(shares Snorkelling, Diving, Whale Watching by cross-reference)* |
| **Soul** | Ayurveda · Yoga · Meditation · Wellness Escapes |
| **Culture** | Culture & Heritage · Food & Cuisine · Village Experiences · Adventure · Luxury Escapes |

*Cross-referencing rather than duplicating means an experience appears under multiple pillars without duplicate content or duplicate URLs.*

### 10.2 Experience template (`/experiences/[slug]`)

```
Breadcrumb · Hero (full-bleed, single image or short loop)
Overview            editorial — why this, here, and what it is actually like
Best time           12-month strip, colour-coded Ideal / Good / Avoid
Duration            half day · full day · multi-day options
Where               destinations offering it, on a mini-map
What to expect      honest practical detail — difficulty, fitness, what to bring
Gallery
Related journeys    journeys featuring this experience
Journal
FAQs
CTA
```

### 10.3 Why this matters commercially

"Sri Lanka whale watching best time", "Yala safari private jeep", "Sri Lanka surf season Arugam Bay" are high-intent, mid-funnel searches with far less competition than "Sri Lanka tours". Twenty-one well-built experience pages are, in my assessment, the highest-ROI SEO work in this entire proposal.

---

## 11. Tour (Journey) system

### 11.1 Fixing the taxonomy

Today: `category` is a 3-value enum — `Day Tour | Multi-Day | Safari`. The brief asks for 17 categories that mix two entirely different axes.

Proposed: **two independent axes plus curated collections.**

*(URLs stay on `/tours`. "Journeys" is copy, not routing — see §3.2.)*

```
AXIS 1 — Duration (derived from duration_days, not hand-entered)
  Half day · Full day · 2–3 days · 4–5 days · 6–7 days · 8–10 days · 11–14 days · 15+ days

AXIS 2 — Theme (many-to-many, a journey can hold several)
  Signature · Luxury · Wildlife · Beach & Surf · Culture & Heritage
  Honeymoon · Family · Adventure · Photography · Wellness
  Private Chauffeur · Custom

COLLECTIONS — hand-curated, editorial, indexable
  /tours/collections/{slug}
  e.g. first-time-sri-lanka · the-slow-south · leopards-and-elephants
       tea-trails-and-train-lines · honeymoon-in-serendib · sri-lanka-with-children
```

`category` is retained on the table for back-compatibility and populated automatically; nothing breaks.

### 11.2 Journey index (`/tours`)

Editorial hero → theme rail (visual, the primary entry point) → filter bar (duration, theme, region, price band; URL-synced via `searchParams`, server-rendered, works without JS) → results grid → "nothing fits? design your own" CTA.

The homepage Journey Planner (§8, section 07) writes into these same `searchParams`, so the two share one filtering implementation rather than duplicating logic.

Filtered views carry `rel=canonical` to `/tours` to avoid index bloat; collection pages are separately indexable because they carry unique editorial copy.

### 11.3 Journey template (`/tours/[slug]`)

Every element the brief specifies:

```
Breadcrumb · Hero (title, duration, regions, from-price, theme badges)
Sticky rail        duration · guests · from-price · [Enquire] [WhatsApp]  (desktop; bottom bar on mobile)
Overview           editorial, plus at-a-glance facts
Highlights         numbered, image-paired
Itinerary          day-by-day Timeline — the centrepiece. Expandable days, each with
                   destination link, overnight stay, meals, drive time
Map                the route drawn across the island, day markers
Gallery
Where you'll stay  stays used on this journey                            [Phase 5]
Included           clear two-column Included / Not included
Practical          fitness level · best months · min/max guests · pace
FAQs               FAQPage schema
Pricing            honest guide pricing + Audley-style explanation of why it varies
Related journeys   by shared theme and region — from join tables
```

### 11.4 Structured data

Extend the existing (already good) `TouristTrip` + `Offer` + `BreadcrumbList` with `itinerary` as a proper `ItemList` of `TouristDestination` nodes, `FAQPage`, and `aggregateRating` **only if real, verifiable review data exists** (see §13).

---

## 12. SEO plan

### 12.1 Fix first (defects found in the audit)

1. Single source of truth for the site URL — `lib/site.ts` reads `NEXT_PUBLIC_SITE_URL` once; `sitemap.ts`, `robots.ts` and `layout.tsx` all consume it.
2. `sitemap.ts` uses real `updated_at`, not `new Date()`.
3. `BreadcrumbList` on every page type, not just journeys.
4. `sameAs` (Instagram, Facebook) added to the `TravelAgency` node.
5. `TravelAgency` → `LocalBusiness` with `geo`, `openingHours` and `areaServed` as a proper `Country`.

### 12.2 Per-page requirements (enforced by a shared helper, not by discipline)

A single `buildMetadata()` utility guarantees every route has: title (≤60ch), description (≤155ch), canonical, OG (type, image 1200×630, locale, siteName), Twitter card, and structured data. Pages that fail to supply these fail typecheck rather than shipping silently.

### 12.3 Content architecture for search

```
Head    /                             "Sri Lanka private tours"
Hub     /regions/[7]                  "Cultural Triangle Sri Lanka"
        /experiences/[21]             "Sri Lanka whale watching"  ← highest ROI
        /journeys/collections/[~10]   "7 day Sri Lanka itinerary"
Spoke   /destinations/[n]             "Sigiriya guide"
        /journal/[n]                  long-tail informational
Support /plan/best-time-to-visit      "best time to visit Sri Lanka"  ← very high volume
        /plan/faq                     practical long-tail
```

That is roughly 40 substantial pages at launch versus 11 today, each with a genuine reason to exist and each interlinked through real relationships.

### 12.4 Technical

Dynamic OG images via `opengraph-image.tsx` at the route level (title + image + brand lockup, generated at the edge) · `generateStaticParams` on all dynamic routes · IndexNow / sitemap ping on publish · self-referencing canonicals · `noindex` on filtered and paginated views · image alt text mandatory in the CMS (validated at save, not at render) · `hreflang` deferred until a second locale genuinely exists.

---

## 13. Content integrity — must be resolved before launch

The project rules state: *never create fake reviews, never invent statistics, never fabricate awards, never invent certifications.* The current codebase contains material that may breach this. I am not able to verify any of it, so I am raising it rather than shipping it.

**Statistics hard-coded in `app/page.tsx` and `app/about/page.tsx`:**

- "10+ years on the road"
- "2,400+ journeys completed"
- "5.0 ★ guest rating"
- "24/7 WhatsApp support"
- "Rated 5.0 by travellers from 30+ countries"
- "a decade of experience on the island's roads"
- "Registered tour operator, insured modern fleet"

**Eight testimonials in `lib/content.ts`** — Charlotte & James (UK), Mia Lindqvist (Sweden), the Fischer Family (Germany), Aiko & Kenji (Japan), Daniel O'Connor (Australia), Sophie Moreau (France), Ravi & Priya Patel (US), Emma Verhoeven (Netherlands) — all 5 stars, all with specific trip details.

I need you to tell me, for each: **real, or placeholder?**

- **Real** → move to the CMS, add a source field (Google, TripAdvisor, WhatsApp, email) and, where possible, link to the original. This makes them stronger, not weaker.
- **Placeholder** → they must come out before launch. Fabricated testimonials expose you to consumer-protection liability in the UK and EU, which is exactly where these named reviewers are said to be from. And any `aggregateRating` structured data built on invented reviews is a direct Google policy violation with manual-action risk.

If you have fewer real reviews than the design calls for, the design changes — one real, verifiable review outperforms eight invented ones, and every operator on the reference list would rather show three than fake thirty.

**Photography** is the same problem in a different form. The site currently runs entirely on Unsplash stock, and several images are not Sri Lanka at all (`mountainLake`, `forest`, `cityLights`, `sedanNight`). No amount of design work will make a luxury travel brand credible on generic stock. The Phase 5 media library exists to solve this, but it needs your photographs. **This is the single highest-leverage thing you can supply.**

---

## 14. Performance plan

Targets: **LCP < 2.0s, INP < 200ms, CLS < 0.05** on a mid-range Android over 4G. Lighthouse ≥ 95 across all four categories on every template.

### 14.1 The video hero, done correctly

The brief's cinematic video hero is the biggest risk to those numbers. The mitigation:

1. **The poster image is the LCP element, always.** A single optimised AVIF, `priority`, `fetchpriority="high"`, correct `sizes`. It paints and the page is measured. The video is never the LCP candidate.
2. **The video loads only after the page is interactive**, and only when *all* of: viewport ≥ 768px · `navigator.connection.saveData` is false · `effectiveType` is `4g` · `prefers-reduced-motion` is not `reduce` · the tab is visible.
3. **Two encodes**: AV1/WebM (primary) and H.264/MP4 (fallback). 8–12 seconds, seamless loop, no audio track at all — target under 2 MB.
4. **`muted playsinline loop preload="none"`**, fading in over the poster at `opacity` only — zero layout shift.
5. **Mobile gets the poster image.** Not a compromise; on a phone a still photograph at full bleed is often the stronger image anyway.
6. A visible, accessible pause control (the brief's own accessibility standard requires it for auto-playing motion over 5 seconds).

### 14.2 Everything else

| Change | Effect |
|---|---|
| `next/font/google` replaces the manual `<link>` + `onLoad` cast | Removes a cross-origin round trip and the FOUT; self-hosted, zero CLS |
| `generateStaticParams` on all dynamic routes | Every journey, destination, experience and post prebuilt at deploy |
| On-demand revalidation from the admin save action; `revalidate` raised to 3600 | Edits appear instantly *and* the site stops regenerating pointlessly |
| `React.cache()` on `getSettings` and all `get*` helpers | Halves the Supabase round trips on every page load |
| `.eq("slug", slug).single()` instead of fetch-all-then-`.find()` | Correct at any table size |
| CSS scroll-driven `Reveal` with an IntersectionObserver fallback; Framer Motion retained only where genuinely needed | ~35 KB less client JS on most routes |
| Inline SVG island map instead of a mapping library | Saves ~150 KB and all tile requests |
| Blur placeholders from a `media` table `blurhash` column | Removes the perceived pop-in |
| Route-level `loading.tsx` with real skeletons | Meaningful first paint on navigation |
| `@next/bundle-analyzer` + a CI budget that fails the build on regression | Keeps it fast after launch, not just at launch |

---

## 15. Proposed phasing

Each phase ends with: a summary of what changed, the list of modified files, a passing production build — and **a stop, for your approval, before the next phase begins.**

| Phase | Scope | Risk | Visible change |
|---|---|---|---|
| **0 · Foundations** | Delete 55 junk files · `next/font` · `React.cache` · `generateStaticParams` · sitemap/URL single-source fix · `updated_at` migration · `types/` + `utils/` · bundle analyzer · **remove placeholder testimonials and statistics** | Very low | Only the removal of unverified content |
| **1 · Design system + Homepage** | Token layer · component library split · cinematic video-ready hero · **interactive island map** · **Journey Planner** · **Featured Chauffeur-Guide** · full 14-section homepage | Medium | Total, on the homepage |
| **2a · Regions + Destinations** | `regions` table · 7 hubs · destination template shell · Experiences / Attractions / Tours / Nearby blocks · join tables replace string matching | Medium | Large |
| **2b · Destination ecosystem** | `stays` · `restaurants` · `destination_climate` · `travel_tips` · weather strip · best-time strip · destination map | Medium | Large |
| **3 · Experiences** | New entity · 4 pillars · 21 pages · index | Low (additive) | New section |
| **4 · Tours** | Taxonomy migration (duration + theme axes) · rebuilt index + detail · itinerary timeline · route map · collections | Medium | Large |
| **5 · Media, Team, Journal** | Media library + Supabase Storage · `/team` page · journal upgrade · photography migration off stock | Medium | Large |
| **6 · Plan & enquiry** | `/plan` hub · best-time-to-visit · FAQ · multi-step enquiry · guest confirmation email | Medium | Large |
| **7 · Final pass** | SEO sweep · a11y audit · Lighthouse · launch checklist | Low | Polish |

**Phase 0 is deliberately first and almost entirely invisible.** It cannot break anything visually, and it makes every subsequent phase faster to build and easier to verify. The one visible change in it is the removal of unverified content, which you have approved and which should not wait behind seven phases of design work.

---

## 17. Approved revisions — 8 August 2026

| # | Revision | Where applied |
|---|---|---|
| 1 | **Keep `/tours` and `/tours/[slug]`.** No rename to `/journeys`. "Signature Journeys" used as marketing copy only. | §3.1, §3.2, §11 |
| 2 | **Keep the editorial square design language.** No rounded cards, no excessive shadows. Elegant, minimal, timeless. | §4.2, §4.4 |
| 3 | **Build the complete destination ecosystem** — Experiences, Hotels, Restaurants, Attractions, Tours, Nearby, Travel Tips, Weather, Best Time to Visit, Interactive Map. | §6.1, §6.2, §9.3 |
| 4 | **Interactive Sri Lanka map on the homepage**, region-explorable. | §8 §06 |
| 5 | **Journey Planner section** — interest-based tour discovery. | §8 §07, §11.2 |
| 6 | **Featured Local Guide / Chauffeur section** as a core USP. | §8 §08, §6.1 (`team`) |
| 7 | **Hero fully supports cinematic video**, ships initially with an optimised poster image. | §8, §14.1 |
| 8 | **Remove all placeholder testimonials and statistics** until real verified content exists. | §13, Phase 0 |

**Still open (not blocking Phase 0):**

- Homepage headline direction (§8.1) — needed before Phase 1.
- Original photography and video assets (§13) — needed before Phase 5, and it will raise the ceiling on Phase 1 if available sooner.

---

**Phase 0 is authorised and in progress. Phases 1+ remain unstarted pending review.**
