# Island Route Sri Lanka — Design & Architecture Audit + Redesign Proposal

**Date:** 8 August 2026
**Status:** Inspection only. **No application file has been modified.** No packages installed, no schema touched, nothing deleted, renamed or moved.
**Repo state at audit:** `d96c56a` — *"Checkpoint before homepage redesign"*, working tree clean.

---

## Note on scope

Much of this ground is covered by `ARCHITECTURE-PROPOSAL.md` from earlier in this project, which you approved with seven revisions. **This document supersedes it.** I have re-inspected the codebase from scratch rather than restating the old audit, because the current state has changed (Phase 0 is now committed) and because your brief has moved in three specific ways that materially affect the plan:

1. **The homepage section list is now 9 sections, not the 14 you previously approved.** Journey Planner, Featured Chauffeur-Guide, Luxury Fleet, Traveller Stories and FAQ are no longer enumerated. I have not assumed they are cancelled — see Question 1 in §Q.
2. **The experience taxonomy has changed** from 21 flat activities to 12 broader categories. This is an improvement, and §E proposes how to reconcile the two.
3. **A new content rule:** do not invent Sri Lankan destination facts. This one has real consequences for content that already ships — see §A.9.

Where the earlier proposal still holds, I say so briefly rather than repeating it at length.

---

# A. CURRENT STATE

## A.1 What the site is today

A well-built, honest brochure site for a private chauffeur service — roughly 7,000 lines across 56 files. It is **not** a travel discovery platform, and the gap between those two things is a **content-model gap, not a design gap**. That distinction drives this entire proposal.

The engineering quality is genuinely good. Server components throughout, real Row Level Security, a config-driven admin CMS, a graceful seed-data fallback when Supabase is absent, and a documented accessibility pass (`AUDIT.md`) that fixed contrast, focus, ARIA and reduced-motion issues most agencies never address. Phase 0 added self-hosted fonts, prebuilt dynamic routes, memoised data reads, query timeouts and a single authoritative site URL.

None of that needs rebuilding. What needs building is the layer above it.

## A.2 Routing — 22 routes

| Public (13) | Admin (9) |
|---|---|
| `/` · `/tours` · `/tours/[slug]` | `/admin` · `/admin/login` |
| `/destinations` · `/destinations/[slug]` | `/admin/bookings` · `/admin/bookings/[id]` |
| `/blog` · `/blog/[slug]` | `/admin/calendar` · `/admin/content/[entity]` |
| `/services` · `/fleet` · `/gallery` · `/reviews` | `/admin/inquiries` · `/admin/settings` |
| `/about` · `/contact` · `/book` | |

**`/experiences` does not exist in any form.** There is no route, no table, no type, no component. This is the single largest structural gap against your brief. `services` is a different concept entirely — airport transfers, driver hire, taxi runs — and cannot be repurposed without losing what it does.

Also absent: `loading.tsx`, `error.tsx`, `opengraph-image.tsx` anywhere in the tree.

## A.3 Homepage structure today

Eight sections, all markup inline in a single 352-line file, with four bespoke section layouts that exist nowhere else:

1. Hero — **static image**, full-bleed, headline "One island. / A thousand routes.", two CTAs, four-item proof strip
2. Editorial intro — two columns, text + offset image pair
3. Services — 6 numbered cards in a hairline grid
4. Featured tours — 4 `TourCard`s
5. Destinations — 8 `DestinationCard`s on dark ground
6. Why book direct — 4 icon features
7. Reviews — *currently renders nothing; hidden when empty (Phase 0)*
8. Journal — 3 posts
9. `CTABand`

Against your target order, what is missing: the cinematic video opening, "Explore Sri Lanka" (map/discovery), and Experiences. What exists but isn't in your list: Services, Editorial intro, Why book direct.

## A.4 Destination model — the weakest link

```ts
type Destination = {
  slug, name, region, headline, description,
  bestFor: string[], bestTime, highlights: string[], image
}
```

Nine destinations. Three problems:

**Region is free text, not an entity.** Actual values in the data: `Cultural Triangle`, `Hill Capital`, `Hill Country`, `Tea Country`, `Deep South`, `South Coast`, `East Coast`, `Western Capital`. Several of those are descriptors, not regions — "Hill Capital" and "Western Capital" describe a city's role. You cannot build region hub pages from this, which forfeits the largest SEO opportunity on the site.

**Relationships are inferred by string matching.** `app/destinations/[slug]/page.tsx` finds related tours like this:

```ts
tours.filter(t =>
  t.title.toLowerCase().includes(d.name.toLowerCase()) ||
  t.excerpt.toLowerCase().includes(d.name.toLowerCase()) ||
  t.highlights.some(h => h.toLowerCase().includes(d.name.toLowerCase()))
)
```

This works today by luck. It will produce wrong or empty results as soon as content grows, and it silently fails — no error, just a missing section.

**Missing fields your brief requires:** suggested duration, related experiences, per-destination SEO metadata, coordinates, multiple images.

## A.5 Tour model

```ts
type Tour = {
  slug, title, category: "Day Tour" | "Multi-Day" | "Safari",
  duration: string, priceFrom, image, excerpt,
  highlights[], includes[], itinerary?: {day,title,detail}[], featured?
}
```

Twelve tours. The itinerary structure is good and reusable. Two problems:

- **`category` is a 3-value enum** doing the work of two independent axes (how long, what kind).
- **`duration` is a display string** — `"7 days · 6 nights"`, `"Full day · from Colombo/Kandy/Negombo"`. Not filterable, not sortable, not machine-readable.

**Missing:** route, destinations included, experiences included, gallery, map, what's excluded, FAQs, per-tour SEO.

## A.6 Experience model

**Does not exist.** Net-new build. The upside: nothing to migrate and nothing to break.

## A.7 CMS / admin

Genuinely good, and the best-engineered part of the codebase. `lib/admin-entities.ts` is a declarative config — 8 entities described as field lists — driving a single generic `EntityManager.tsx` (340 lines) that renders list, create, edit and delete for any of them. Field types: `text`, `textarea`, `number`, `checkbox`, `date`, `select`, `lines`, `json`, `image`.

**Adding new content types is a config change, not a code change.** That is a significant head start and the plan below leans on it heavily.

Also present: bookings pipeline (`new → quoted → confirmed → completed → cancelled`) with vehicle/driver assignment and quote amounts, an inquiries inbox, an availability calendar backed by `availability_blocks`, and a site-settings editor that feeds SEO metadata.

**Gaps:** no media/upload field (the `image` type is a plain URL text input), no relation field, no rich text, no per-entity SEO fields, no preview.

## A.8 Supabase schema

13 tables: `profiles`, `tours`, `destinations`, `services`, `vehicles`, `drivers`, `reviews`, `posts`, `gallery`, `site_settings`, `bookings`, `inquiries`, `availability_blocks`. Phase 0 added `updated_at` + triggers via `0001_updated_at.sql`.

Security is correctly done — and I want to be specific, because it is easy to get wrong and this project didn't:

- RLS enabled on all 13 tables.
- `is_admin()` as a `security definer` function; public read gated on `published = true`.
- **The admin dashboard uses the anon key with RLS, not the service-role key.** Most projects reach for service-role and quietly create a privilege-escalation hole. This one didn't.
- `bookings`/`inquiries`: insert-open, admin-only read.
- `middleware.ts` scoped to `/admin/:path*` only.

**No join tables of any kind.** No `updated_at` before Phase 0. No full-text search.

## A.9 Content integrity — findings

**Placeholder business claims — already removed in Phase 0** (8 fabricated testimonials from named individuals in 8 countries, "2,400+ journeys", "10+ years", "5.0 ★", "30+ countries", "a decade of experience"). Removed from both `lib/content.ts` and `supabase/seed.sql`. ⚠ If `seed.sql` was ever run against your live database, those reviews are still in your `reviews` table — see `VERIFY-PHASE-0.md`.

**Business claims still live, which you asked me not to invent — and I did not remove, because they are certification claims that are probably true of your business:**

| Claim | Location |
|---|---|
| "Registered tour operator, insured modern fleet, and drivers vetted over years" | `app/page.tsx:253` |
| "Licensed Sri Lankan tour operator · Fully insured fleet" | `components/Footer.tsx:87` |
| "fully insured, air-conditioned fleet" / "late-model, meticulously maintained, fully insured" | `app/fleet/page.tsx:15,26` |

These need your confirmation, not my judgement.

**Sri Lankan destination facts — this is new, and it matters.** Your brief now says do not invent destination facts. The existing seed content is dense with specific factual and superlative claims that I did not write and cannot verify:

| Claim | File |
|---|---|
| "Rising two hundred metres above jungle canopy" (Sigiriya) | `lib/destinations.ts:22` |
| "5th-century royal citadel" | `lib/destinations.ts:22` |
| "17th-century ramparts" (Galle) | `destinations.ts:80`, `tours.ts:225`, `blog.ts:28` |
| "the world's prettiest railway" / "most beautiful stretch of track in Asia" | `lib/destinations.ts:44,46` |
| "one of the world's great right-hand point breaks" (Arugam Bay) | `lib/destinations.ts:104` |
| "the world's densest leopard population" (Yala) | `lib/tours.ts:245` |
| "the world's best odds of a wild leopard sighting" | `lib/blog.ts:27` |
| "Nuwara Eliya evenings are properly cool at 1,900 metres" | `lib/blog.ts:44` |
| "Yala often closes for several weeks around September–October" | `lib/blog.ts` |

Most are probably broadly accurate. Several are marketing superlatives dressed as facts — "world's densest leopard population" and "world's best odds" are the kind of claim a competitor or a regulator can challenge, and "1,900 metres" is a rounding of a real figure.

**I am not going to quietly rewrite these, and I am not going to assert which are wrong without checking.** My recommendation is a dedicated content-verification pass (Phase 7 below) where every factual claim is either sourced, softened to a defensible form, or cut. Your local knowledge makes you far better placed to do this than me. What I can do is produce the complete extracted list for you to work through.

## A.10 Image strategy — the biggest credibility risk

Every image on the site is an external Unsplash URL, centralised in `lib/images.ts` (28 images). `public/` contains **no photography at all** — only `icon.svg`, `apple-icon.png` and `site.webmanifest`.

Several images are not Sri Lanka: `mountainLake`, `forest`, `cityLights`, `sedanNight`, `lakeCanoe`, `greenMountains` are generic stock landscapes.

**No amount of design work will make a luxury travel brand credible on generic stock photography.** This is the highest-leverage input you can supply, and it will change how ambitious the redesign can be.

There is also no upload path — the admin's `image` field is a URL text box — and `next.config.mjs` `remotePatterns` allows **only** `images.unsplash.com`. See §M for why that last detail is a deployment breaker if handled carelessly.

## A.11 SEO — current

Present: `metadataBase`, title template, per-page canonicals, OG + Twitter cards, `TravelAgency` JSON-LD with `sameAs`, `TouristTrip` + `Offer` + `BreadcrumbList` on tours, `Article` on posts, `robots.ts` disallowing `/admin`, dynamic `sitemap.ts` with real `updated_at` timestamps, `clampDesc`/`clampTitle` helpers.

Missing: `BreadcrumbList` anywhere except tours · no `FAQPage` (no FAQs exist) · no per-entity SEO override fields · no generated OG images · no region/experience/collection hub pages · no `LocalBusiness` geo data.

## A.12 Responsiveness

Mobile-first Tailwind throughout, and the breakpoint coverage is uneven rather than broken:

```
app/page.tsx                sm:7  md:29  lg:3
app/tours/page.tsx          sm:1  md:2   lg:1     ← thin
app/destinations/page.tsx   sm:0  md:4   lg:0     ← thin
app/services/page.tsx       sm:0  md:11  lg:0
app/contact/page.tsx        sm:0  md:2   lg:3
```

No horizontal-overflow risks on public pages (the only `min-w-[760px]` is an admin table, correctly wrapped in `overflow-x-auto`). The index pages jump straight from 1 column to 3 with nothing considered in between — they will look sparse on tablets and on large phones in landscape.

## A.13 Accessibility — a real asset

Already strong, per `AUDIT.md` and confirmed in code: 4.5:1+ contrast throughout (with a dedicated `copper-deep` token created specifically because the brand copper failed AA at small sizes), global `:focus-visible`, skip link, mobile menu with `aria-expanded`/`aria-controls`/Escape/scroll-lock, `aria-current`, a proper `role="dialog"` lightbox with focus return, `aria-pressed` filters, 44px touch targets, `aria-live` form status, and `MotionConfig reducedMotion="user"`.

**Every new component must meet this bar.** The plan below treats it as a build constraint, not a later cleanup.

## A.14 Performance — current

Good: AVIF/WebP with 31-day cache, immutable static asset headers, security headers, server components by default, self-hosted fonts, prebuilt dynamic routes, memoised data layer, 6-second query timeouts.

Remaining: Framer Motion ships to nearly every page via `Reveal` (~35 KB gzip for a fade-and-rise); `revalidate = 60` on all 11 public pages regenerates far more often than weekly content warrants; `fromTable` does `select("*")` with no pagination and `getTourBySlug` fetches every tour then `.find()`s in JS.

Current shared JS baseline: **87.3 kB**; typical public page **~138 kB** first load.

## A.15 Forms, enquiry flow, auth

`/book` and `/contact` → `BookingForm` (337 lines, client) → `submitBooking` / `submitInquiry` server actions → `validateEnquiry` → Supabase insert → fire-and-forget nodemailer notification.

`lib/validation.ts` is better than most production code I see: control-character stripping, length caps, email regex, honeypot, URL-count spam heuristic, past-date rejection. Server-side, correctly treated as the real defence rather than trusting the browser.

Nice touch worth preserving: if Supabase is unconfigured, the form **falls back to opening a prefilled WhatsApp message** rather than failing.

Auth: Supabase Auth, email/password, `profiles.role` checked via `is_admin()`, enforced in middleware. Admin-only; no customer accounts.

**Gaps:** single-step form, no guest confirmation email (only the operator is notified), no booking reference shown, no rate limiting beyond the honeypot, no multi-destination trip builder.

---

# B. PROPOSED INFORMATION ARCHITECTURE

## B.1 Sitemap

```
/                                     Home
/destinations                         Region hub index
  /regions/[slug]                     7 region hubs                        ★ NEW
  /destinations/[slug]                Place pages          ← URLs PRESERVED
/experiences                          Experience index, by category        ★ NEW
  /experiences/[slug]                 12 category pages                    ★ NEW
/tours                                Tour discovery       ← URLs PRESERVED
  /tours/[slug]                       Tour detail          ← URLs PRESERVED
  /tours/collections/[slug]           Curated editorial collections        ★ NEW
/journal                              Journal              ← 301 from /blog
  /journal/[slug]
/plan                                 Plan your journey hub                ★ NEW
  /plan/how-it-works                  ← absorbs /services
  /plan/best-time-to-visit            month-by-month guide                 ★ NEW
  /plan/faq                           practical FAQ                        ★ NEW
  /plan/enquire                       ← 301 from /book
/fleet                                ← URL PRESERVED
/team                                 Your chauffeur-guides                ★ NEW
/about  /contact  /gallery  /reviews  ← URLs PRESERVED
/admin/*                              unchanged, noindex, auth-gated
```

**URL policy, per your earlier instruction:** `/tours` and `/tours/[slug]` are preserved. "Signature Journeys" is marketing copy in headings and nav labels; the routing stays on `/tours`. Same for `/destinations/[slug]` — all 9 existing place URLs survive untouched, so no link equity is lost anywhere on the destination side.

Only three redirects, and each fixes an existing inconsistency rather than creating churn:

| From | To | Why |
|---|---|---|
| `/blog`, `/blog/[slug]` | `/journal`, `/journal/[slug]` | The nav already says "Journal" while the URL says `/blog` |
| `/book` | `/plan/enquire` | |
| `/services` | `/plan/how-it-works` | Content splits naturally between process and `/fleet` |

⚠ `app/page.tsx` currently links to `/services#${slug}` — those anchors must be updated with the redirect, not left to bounce.

## B.2 Navigation

Desktop mega-menu, hover with a ~150 ms intent delay, Escape to close, fully keyboard-navigable:

```
DESTINATIONS ▾   7 regions, each listing its 3–5 headline places
                 [feature: interactive island map preview]

EXPERIENCES  ▾   12 categories in 3 columns, each with a one-line description
                 [feature: one seasonal experience]

TOURS        ▾   By length:  Half day · Full day · 3–4 · 5–7 · 8–10 · 11–14 · 15+
                 By theme:   Wildlife · Beach & Surf · Culture · Honeymoon
                             Family · Adventure · Photography · Luxury
                 Collections: 4 curated links
                 [feature: one signature journey]

PLAN         ▾   How it works · Best time to visit · The fleet
                 Your chauffeur-guides · FAQ

JOURNAL          ABOUT          [ PLAN YOUR JOURNEY ]  ← persistent primary CTA
```

Mobile: full-screen overlay, one accordion level, WhatsApp + Enquire pinned to the bottom. **Reuse the existing `Navbar` mobile logic** — its Escape handling, scroll lock and ARIA are already correct and should be extended, not rewritten.

Utility bar (desktop, thin, above nav): phone · WhatsApp · currency indicator.

## B.3 Internal linking model

Every relationship becomes a real database join. No string matching anywhere.

```
Region      → Destinations · Tours crossing it · Experiences available · Stays
Destination → Region · Nearby (with real drive times) · Tours including it
              · Experiences here · Stays · Restaurants · Journal posts
Experience  → Destinations offering it · Tours featuring it · best months · Journal
Tour        → every Destination on the itinerary · Experiences included
              · Stays used · related Tours
Journal     → primary Destination · primary Experience · one suggested Tour
```

Result: every page reachable within three clicks of home, no orphans, and a genuine topical cluster around "Sri Lanka" rather than a flat list of pages.

---

# C. PROPOSED HOMEPAGE WIREFRAME

Following your 9-section order. **Revised 8 Aug per your Q1 answer:** the five previously-approved elements are integrated rather than dropped or appended — Chauffeur-Guide folds into *Why Island Route*, Traveller Stories folds into *Featured Journeys*, Fleet becomes a slim supporting strip, FAQ becomes a 3-question preview at the point of conversion, and the Journey Planner becomes an entry point rather than a section. **The count stays at 9.** Nothing was bolted on.

```
┌──────────────────────────────────────────────────────────────┐
│ 01  CINEMATIC HERO — THE SRI LANKA STORY          100svh     │
│                                                              │
│     Poster image paints first and is the LCP element,        │
│     always. Video fades in over it only when conditions      │
│     allow (full logic in §J).                                │
│                                                              │
│     Sequence: arrival → landscape → culture → mountains →    │
│     tea country → wildlife → ocean → people → sunset         │
│     ~20–30s, 9 cuts, no audio track at all.                  │
│                                                              │
│     Scrim: deep/75 → transparent → deep/60 (protects type    │
│     over every frame, not just the first)                    │
│                                                              │
│     [eyebrow]  PRIVATE JOURNEYS · SRI LANKA                  │
│                                                              │
│     [display-xl, two lines, staggered entrance]              │
│         Sri Lanka,                                           │
│         Unscripted.                                          │
│                                                              │
│     [body-lg, max 46ch, two lines held by <br> at ≥768px,    │
│      allowed to reflow naturally below that]                 │
│         Private journeys through an island of wild           │
│         landscapes, living culture and extraordinary         │
│         encounters.                                          │
│                                                              │
│     [ PLAN YOUR JOURNEY ]      [ EXPLORE SRI LANKA ]         │
│       → /plan/enquire            → smooth-scrolls to §02     │
│                                    (see C.5b)                │
│                                                              │
│     ⚠ Proof strip: currently four non-numeric claims         │
│       (Locally owned · Private · Direct · WhatsApp).         │
│       Numbers return only when verified.                     │
│                                          ↓ scroll cue        │
├──────────────────────────────────────────────────────────────┤
│ 02  EXPLORE SRI LANKA — INTERACTIVE MAP                      │
│     Full-width, dark ground.                                 │
│     Inline SVG island (~12 KB, no map library, no tiles).    │
│     7 region shapes, independently hoverable.                │
│       hover/focus → region tints copper; side panel shows    │
│                     name, character line, 3 headline places, │
│                     tour count, thumbnail                    │
│       click/Enter → /regions/[slug]                          │
│       mobile     → tap to select, panel slides up, ≥44px     │
│       keyboard   → each region a focusable <a>, arrows cycle │
│       no-JS/SR   → same 7 regions as a plain linked list;    │
│                    SVG aria-hidden. Nothing is map-only.     │
├──────────────────────────────────────────────────────────────┤
│ 03  DESTINATIONS                                             │
│     7 region cards, editorial asymmetric grid:               │
│       [══ tall ══][ sq ][ sq ]                               │
│       [ sq ][══════ wide ══════]                             │
│     Each: region name · place count · one-line character.    │
│     → /destinations                                          │
├──────────────────────────────────────────────────────────────┤
│ 04  EXPERIENCES                                              │
│     Horizontal snap rail, 4.5 cards visible at 1440px.       │
│     Below 640px becomes a 2-col grid — no hidden content     │
│     on mobile, ever.                                         │
│     Keyboard arrows, visible focus, scroll-snap.             │
│     → /experiences                                           │
├──────────────────────────────────────────────────────────────┤
│ 05  SIGNATURE TOURS                     [bg: deep + grain]   │
│     4 featured tours. Existing TourCard, restyled.           │
│     Duration · regions · from-price · theme badge.           │
│     → /tours                                                 │
│                                                              │
│     ── LUXURY FLEET STRIP ──────────────  ★ integrated       │
│     Slim band closing the section, ~140px tall. Not a        │
│     section — a footnote to the tours above, which is        │
│     exactly its logical relationship: this is what you       │
│     travel in.                                               │
│       3 vehicle silhouettes in a row, hairline-separated     │
│       "Executive sedan · Premium SUV · High-roof van"        │
│       one line: air-conditioned, insured, chauffeur-driven   │
│       [ See the fleet → /fleet ]                             │
│     Mobile: horizontal scroll, or stacks to 3 rows.          │
├──────────────────────────────────────────────────────────────┤
│ 06  WHY ISLAND ROUTE — WITH YOUR GUIDE   ★ merged            │
│     One editorial section, not two. The argument and the     │
│     proof of it in the same breath.                          │
│                                                              │
│     Two-column, asymmetric:                                  │
│     LEFT (5 cols) — full-bleed portrait of a real            │
│       chauffeur-guide, shot on location, not in a studio     │
│     RIGHT (7 cols) — generous whitespace                     │
│       [eyebrow] YOUR GUIDE, NOT A TOUR GUIDE                 │
│       [display-md] Why Island Route                          │
│       3 pillars, tight editorial prose (no icon row):        │
│         Locally owned & driven                               │
│         One team, start to finish                            │
│         Your pace, never a coach's                           │
│       ── hairline ──                                         │
│       Name · years driving · languages · home region         │
│       2 sentences in the guide's own voice — the road        │
│       they'd drive on a day off, the stall they'd stop at    │
│       [ Meet the team → /team ]                              │
│                                                              │
│     ⚠ CURATED, not rotating — see C.4. One chosen guide,     │
│       set in the CMS, same as 07.                            │
│     Why merged: the three pillars are abstract claims;       │
│     a named face with a real voice is the evidence.          │
│     Separated, they are a boast and a bio. Together they     │
│     are an argument. This is the differentiator no           │
│     international competitor can copy.                       │
│     Backed by the new public `team` table (§H).              │
├──────────────────────────────────────────────────────────────┤
│ 07  FEATURED JOURNEY — IN THEIR WORDS    ★ merged            │
│     ONE journey. Manually curated, CMS-editable.             │
│     NOT a carousel. Nothing auto-rotates. Deliberately       │
│     unlike 05's grid — this is an editorial feature, and     │
│     editorial features are chosen, not cycled.               │
│                                                              │
│     ┌─ required ─────────────────────────────────────┐       │
│     │ ONE specific tour                              │       │
│     │ 3 supporting images, offset editorial layout   │       │
│     │   — one large, two smaller, unequal gutters    │       │
│     │ Simple route line across a fragment of the     │       │
│     │   island, day markers with place names         │       │
│     │   (inline SVG, same technique as §02, ~4KB)    │       │
│     │ [ See the full itinerary → /tours/[slug] ]     │       │
│     └────────────────────────────────────────────────┘       │
│     ┌─ conditional — rendered only when present ────┐        │
│     │ TRAVELLER QUOTE                                │       │
│     │   pull-quote scale, serif, attributed, with    │       │
│     │   source (Google / TripAdvisor / direct)       │       │
│     │   Shown ONLY when a verified review exists.    │       │
│     │   Absent → the block is omitted entirely.      │       │
│     │   No placeholder. No invented content. No      │       │
│     │   empty quote marks, no skeleton, no gap.      │       │
│     ├────────────────────────────────────────────────┤       │
│     │ GUIDE PERSPECTIVE (optional)                   │       │
│     │   2 sentences from the guide who drives this   │       │
│     │   route + small portrait. Same omit-if-absent  │       │
│     │   rule.                                        │       │
│     └────────────────────────────────────────────────┘       │
│                                                              │
│     Layout holds at any combination: journey only ·          │
│     journey + quote · journey + guide · all three.           │
│     Four valid states, each designed — not one design        │
│     with holes in it.                                        │
│                                                              │
│     Why merged: a testimonial floating free is decoration;   │
│     the same words attached to the journey they describe     │
│     are evidence.                                            │
│                                                              │
│     ⚠ LAUNCH STATE: zero verified reviews exist (Phase 0     │
│       removed 8 fabricated ones), so this ships as           │
│       "journey only" until you add a real one.               │
├──────────────────────────────────────────────────────────────┤
│ 08  SRI LANKA STORIES / JOURNAL                              │
│     3 posts. Image, date, read-time, title, one line.        │
├──────────────────────────────────────────────────────────────┤
│ 09  PLAN YOUR JOURNEY                   [bg: deep + grain]   │
│     Two paths, because visitors arrive at this point in      │
│     two different states of readiness.                       │
│                                                              │
│     LEFT — ready to talk                                     │
│       Named human + photograph, not a faceless form.         │
│       WhatsApp · response-time promise                       │
│       [ PLAN YOUR JOURNEY → /plan/enquire ]                  │
│                                                              │
│     RIGHT — not ready yet          ★ Journey Planner entry   │
│       "Not sure where to start?"                             │
│       Three chips, tap to prefill: WHAT MOVES YOU ·          │
│       HOW LONG · TRAVELLING AS                               │
│       [ Start with the Journey Planner → /plan ]             │
│       Selections pass through as searchParams, so the        │
│       planner opens already answering them. Small, low       │
│       commitment, and it captures the visitor who would      │
│       otherwise bounce at a contact form.                    │
│                                                              │
│     ── FAQ PREVIEW ──────────────────────  ★ integrated      │
│     3 questions only, accordion, directly above the footer.  │
│     Placed here deliberately: this is where last objections  │
│     surface, immediately before the conversion decision.     │
│     Likely three: How does pricing work? · How far ahead     │
│     should I book? · What if my plans change?                │
│     [ All questions → /plan/faq ]                            │
│     Carries FAQPage schema (§K.3).                           │
│                                                              │
│     ⚠ Depends on the `faqs` table (Phase 7). In Phase 2      │
│       this renders only if you supply three real answers;    │
│       otherwise it is omitted and lands in Phase 7.          │
├──────────────────────────────────────────────────────────────┤
│     PREMIUM FOOTER                                           │
│     5 columns · newsletter · socials · trust marks · legal   │
│     · full sitemap links for crawl depth                     │
└──────────────────────────────────────────────────────────────┘
```

## C.1 Where the five integrated elements landed

| Element | Treatment | Section | Cost to page length |
|---|---|---|---|
| Featured Chauffeur-Guide | **Merged** into *Why Island Route* as the evidence for its three claims | 06 | Zero — replaces the icon row |
| Traveller Stories | **Merged** into *Featured Journeys* as a pull-quote attached to the journey it describes | 07 | Zero — replaces a card row |
| Luxury Fleet | **Slim strip** closing the Tours section, ~140px | 05 | ~140px |
| FAQ | **3-question preview** immediately above the footer, full set at `/plan/faq` | 09 | ~200px |
| Journey Planner | **Entry point**, right-hand path of the final CTA | 09 | Zero — uses existing whitespace |

Net effect: **two icon/card rows removed, two small bands added.** The page is roughly the same length as the 9-section version, and stronger for it — merging turned two decorative elements (a bio, a floating testimonial) into two pieces of evidence.

## C.2 Section 07 — how curation works

A singleton `homepage_feature` row, edited through the existing admin CMS. You choose the journey; the page composes itself.

| Field | Type | Required | Behaviour when empty |
|---|---|---|---|
| `tour_id` | relation → `tours` | **Yes** | Whole section hidden |
| `image_1/2/3` | media | **Yes** | Falls back to the tour's own cover image |
| `route_note` | text | No | Route line renders without a caption |
| `review_id` | relation → `reviews` | No | **Quote block omitted entirely** |
| `guide_id` | relation → `team` | No | **Guide block omitted entirely** |
| `guide_note` | textarea | No | Guide shown as name + portrait only |
| `featured_guide_id` | relation → `team` | No | Drives section **06** (see C.4). Empty → 06 renders as *Why Island Route* alone |
| `published` | boolean | — | Unpublished → section hidden |

**Three fail-safes**, because a homepage section driven by a foreign key is exactly the kind of thing that breaks quietly at 2am:

1. No row, or `published = false` → section renders nothing. Not an empty band — nothing.
2. Referenced tour unpublished or deleted → section renders nothing rather than a broken link.
3. Referenced review unpublished → quote omitted, rest of the section unaffected.

Changing the feature is a two-field edit in the admin (pick a tour, pick three images) with no deploy. That is the point of putting it in the CMS rather than in code.

## C.5 Hero copy — CMS-editable, with hard-coded defaults

**Approved copy (locked):**

| Element | Value |
|---|---|
| Headline | **Sri Lanka, Unscripted.** |
| Supporting | *Private journeys through an island of wild landscapes, living culture and extraordinary encounters.* |
| Primary CTA | **Plan Your Journey** |
| Secondary CTA | **Explore Sri Lanka** |

### C.5a Where it lives

New `site_settings` keys — the existing table, editable through the existing `/admin/settings` page. No new table, no new admin screen, and it sits naturally beside the SEO fields already managed there.

```
hero_headline            "Sri Lanka, Unscripted."
hero_subcopy             "Private journeys through an island of wild
                          landscapes, living culture and extraordinary
                          encounters."
hero_cta_primary_label   "Plan Your Journey"
hero_cta_primary_href    "/plan/enquire"
hero_cta_secondary_label "Explore Sri Lanka"
hero_cta_secondary_href  "#explore"
```

**Every one of these has a hard-coded default in `lib/data.ts`**, following the existing `defaultSettings` pattern. If the row is missing, the key is blank, or Supabase is unreachable, the hero renders the approved copy above rather than an empty band. The CMS refines the message; it can never delete it.

This means brand messaging can be tuned without touching `HeroSection.tsx` — which is what you asked for, and also the difference between a copy tweak being a five-minute admin edit and a deploy.

**Typographic note:** the headline is rendered as two lines with the break after the comma, not as a `text-wrap: balance` single line. "Sri Lanka," / "Unscripted." reads as a deliberate two-beat statement; auto-balanced it can break in the wrong place at some viewport widths. The break is authored, not left to the browser.

### C.5b The secondary CTA now points somewhere different

"Explore Sri Lanka" is the same label as homepage section **02**, the interactive island map. Sending it to `/experiences` would be confusing — the visitor clicks a label and lands somewhere that doesn't carry it.

**Proposal:** the secondary CTA smooth-scrolls to `#explore` (section 02) rather than navigating away. It keeps the visitor on the page at the exact moment they've signalled curiosity rather than intent, and hands them the map — the most engaging thing on the homepage.

`scroll-behavior: smooth` is already set globally in `globals.css`, and already correctly disabled under `prefers-reduced-motion`. So this costs nothing and inherits the existing accessibility handling. The `href="#explore"` remains a real anchor, so it works with JavaScript disabled and is keyboard-operable by default.

Because the href is a CMS field, you can repoint it to `/destinations` later without a deploy if you'd rather it navigate.

## C.6 A note on brand rationale

Point taken on unverified claims — my "Serendib" suggestion rested on an etymological assertion I hadn't verified, which is precisely the standard you've set for destination facts. It should not have been offered as a rationale.

Applying that standard going forward: **no brand or marketing copy in this project will lean on a historical, linguistic or factual claim unless it is independently verified and sourced.** "Sri Lanka, Unscripted." needs no such support — it makes a promise about how you travel, not an assertion about the world, which is why it's the stronger line.

This also folds into the Phase 8 content-verification pass (§A.9), which now covers marketing rationale as well as destination facts.

## C.4 A correction I'm making off the back of your answer

My earlier draft had section **06** *"rotate per visit across published team members."* Your ruling on 07 was about that section, but I think it should apply to 06 too — for two reasons, one editorial and one technical.

**Editorially:** the same argument you made. A rotating face is a widget; a chosen face is a decision. If the chauffeur-guide is the differentiator, the person representing it should be picked deliberately, not drawn at random.

**Technically — this is the part that actually forces the issue.** Per-visit rotation is incompatible with a statically prerendered homepage. There are only three ways to build it and none is good:

| Approach | Consequence |
|---|---|
| Randomise server-side per request | Homepage becomes dynamic — loses SSG, slower TTFB on every visit |
| Randomise client-side | **Hydration mismatch.** Server renders guide A, client renders guide B, React throws. Fixing it means rendering nothing until hydration, which visibly flashes |
| Randomise at build time | Not "per visit" at all — it's per deploy, which is just a worse version of curating it |

So I'm proposing **06 uses `homepage_feature.guide_id`** — the same singleton row as 07, one extra field. One place to edit, no rotation logic, homepage stays fully static, and the guide in 06 can be the same person quoted in 07 or a different one, your choice.

Flagging rather than just doing it, since it's a change to something I'd already written down. Say the word if you'd rather it rotate and I'll take the dynamic-rendering cost.

## C.3 One consequence worth stating plainly

Sections 06 and 07 both depend on content that does not yet exist:

- **06** needs at least one real chauffeur-guide — photograph, name, years driving, languages, two sentences in their own voice.
- **07** needs one chosen tour and three images to render at all; the quote and guide blocks are genuinely optional.

Neither will be invented. If they aren't ready for Phase 2, section 06 renders as *Why Island Route* alone (still good, just less persuasive) and section 07 renders journey-only. Both upgrade themselves the moment the content exists — **no code change required.**

---

# D. DESTINATIONS STRUCTURE

## D.1 Hierarchy — three levels

```
Sri Lanka
 └── Region (7)              /regions/[slug]
      └── Destination (9→25+) /destinations/[slug]   ← existing URLs preserved
           └── Attractions, Stays, Restaurants  (components of the page, not routes)
```

## D.2 The 7 regions

Your earlier list contained "Wildlife" and "Central Highlands". I propose correcting both: **Wildlife is an experience, not a place**, and Central Highlands is the UNESCO designation for what the site already calls Hill Country. Seven true geographic regions:

| Region | Slug | Places | Existing destinations |
|---|---|---|---|
| West Coast & Colombo | `west-coast` | Colombo, Negombo, Bentota, Kalpitiya | Colombo |
| South Coast | `south-coast` | Galle, Mirissa, Unawatuna, Weligama, Tangalle | Galle, Mirissa |
| The Wild South | `wild-south` | Yala, Udawalawe, Tissamaharama, Bundala | Yala |
| Hill Country | `hill-country` | Kandy, Ella, Nuwara Eliya, Haputale, Horton Plains | Kandy, Ella, Nuwara Eliya |
| Cultural Triangle | `cultural-triangle` | Sigiriya, Dambulla, Polonnaruwa, Anuradhapura | Sigiriya |
| East Coast | `east-coast` | Arugam Bay, Trincomalee, Pasikuda, Batticaloa | Arugam Bay |
| The North | `north` | Jaffna, Mannar, Delft, Wilpattu | — |

**All 9 existing destinations map cleanly. No URL changes, no redirects, no data loss.**

## D.3 Region hub template

Hero · Character (2–3 editorial paragraphs) · Places in this region · When to come (month strip) · Experiences here · Tours crossing this region · Region map · FAQs · CTA

## D.4 Destination page template

```
Breadcrumb        Home › Destinations › {Region} › {Place}
Hero              full-bleed · name · region · one line
Quick facts       best months · drive time from CMB · suggested duration ·
                  pairs well with                    ← "suggested duration" per your brief
Introduction      short intro (existing `headline` + `description` map here)
Highlights        numbered editorial list        ← existing `highlights[]` reused
Best experiences  → destination_experiences      ← your brief; new join
Attractions       → destination_activities · hours, fee, time needed, honest
                    "worth it / skip if short on time" note
Related tours     → journey_destinations join    ← replaces string matching
Related experiences
Nearby            real road drive times, not straight-line distance
Gallery           multiple images                ← existing lightbox reused
Map
Journal           related posts
FAQs              FAQPage schema
CTA               "Include {Place} in your journey" → prefills enquiry
```

Every field in your brief's DESTINATIONS list is covered. `bestFor[]` and `bestTime` from the current model carry straight over.

---

# E. EXPERIENCES STRUCTURE

## E.1 Reconciling your two lists

Your earlier brief listed 21 activities (surfing, safari, whale watching, hiking, cycling, yoga, meditation, camping, snorkelling, diving, fishing, bird watching, photography, train journeys, tea country, ayurveda, food, adventure, village experiences, culture, luxury escapes). Your current brief lists 12 broader categories.

**These are two levels of the same tree, and both are useful.** 12 flat categories is right for navigation; 21 activities is right for depth and for long-tail search. Proposal:

```
CATEGORY (12) — top-level, navigable, /experiences/[slug]
  └── ACTIVITY — a section within the category page, and a filter facet
```

| # | Category | Activities within |
|---|---|---|
| 1 | Wildlife | Safari · Bird watching · Whale watching (cross-ref) |
| 2 | Surf & Ocean | Surfing · Snorkelling · Scuba diving · Whale watching · Fishing |
| 3 | Beaches | Beach stays · Island hopping · Coastal walks |
| 4 | Culture & Heritage | Ancient cities · Temples · Festivals · Crafts |
| 5 | Food | Cooking classes · Market tours · Street food · Spice gardens |
| 6 | Wellness | Ayurveda · Yoga · Meditation · Spa retreats |
| 7 | Adventure | Hiking · Cycling · Camping · Rafting · Canyoning |
| 8 | Nature | Rainforest · Waterfalls · National parks · Botanical gardens |
| 9 | Tea Country | Estate visits · Tea tasting · Plantation stays · Factory tours |
| 10 | Local Life | Village experiences · Homestays · Markets · Artisans |
| 11 | Slow Travel | Train journeys · Long stays · Walking · Cycling routes |
| 12 | Luxury Experiences | Private dining · Helicopter transfers · Exclusive stays |

Every one of your 21 earlier activities has a home. Nothing is lost, nothing is duplicated as a separate URL, and cross-referencing (whale watching under both Wildlife and Surf & Ocean) means one canonical page appears in two navigational contexts.

## E.2 Index page (`/experiences`)

Editorial hero → 12 category cards (large imagery, one-line character, activity count) → "by season" strip (what's good right now — a genuinely useful entry point given Sri Lanka's two opposing monsoons) → CTA.

## E.3 Card anatomy

Image (4:5) · category name · one-line description · activity count · best-months chip. Square corners, hairline border, image scales gently on hover — consistent with the existing `TourCard`/`DestinationCard` language.

## E.4 Filters

On the index: category, region, best month, duration. Server-rendered via `searchParams` so every filter state is a shareable, crawlable URL that works with JS disabled. Filtered views carry `rel=canonical` to `/experiences` to avoid index bloat.

## E.5 Detail page template

```
Breadcrumb · Hero
Overview            editorial — what it is actually like, not a brochure blurb
Best time           12-month strip, Ideal / Good / Avoid, with the reason
Duration            half day · full day · multi-day
Where               destinations offering it, on a mini-map
What to expect      honest practical detail — difficulty, fitness, what to bring
Activities          the sub-activities within this category
Gallery
Related tours       tours featuring this experience
Journal
FAQs                FAQPage schema
CTA
```

## E.6 Why this is the highest-ROI work in the proposal

"Sri Lanka whale watching best time", "Yala safari private jeep", "Arugam Bay surf season" are high-intent searches with far less competition than "Sri Lanka tours". Twelve well-built category pages, each with real depth, will out-earn any amount of homepage polish.

---

# F. TOURS STRUCTURE

## F.1 Fixing the taxonomy

Replace the 3-value `category` enum with two independent axes plus curated collections:

```
AXIS 1 — Duration    derived from a new numeric duration_days, not hand-typed
  Half day · Full day · 2–3 · 4–5 · 6–7 · 8–10 · 11–14 · 15+

AXIS 2 — Theme       many-to-many; a tour can hold several
  Signature · Luxury · Wildlife · Beach & Surf · Culture & Heritage
  Honeymoon · Family · Adventure · Photography · Wellness
  Private Chauffeur · Custom

COLLECTIONS          hand-curated, editorial, separately indexable
  /tours/collections/first-time-sri-lanka
                    /the-slow-south
                    /leopards-and-elephants
                    /tea-trails-and-train-lines
                    /honeymoon-in-serendib
```

`category` is retained on the table and auto-populated, so nothing that reads it breaks.

## F.2 Discovery (`/tours`)

Editorial hero → theme rail (visual, the primary entry point) → filter bar (duration, theme, region, price band — `searchParams`-driven, server-rendered, works without JS) → results grid → "nothing fits? design your own" CTA.

## F.3 Detail page template

```
Breadcrumb · Hero (title · duration · regions · from-price · theme badges)
Sticky rail       duration · guests · from-price · [Enquire] [WhatsApp]
                  desktop side rail; bottom bar on mobile
Overview          editorial + at-a-glance facts
Highlights        numbered, image-paired          ← existing highlights[] reused
Route             the destinations, in order      ← your brief
Itinerary         day-by-day Timeline — the centrepiece.
                  Expandable days, each linking its destination, overnight
                  stay, meals, drive time         ← existing itinerary[] reused
Map               route drawn across the island, day markers
Destinations      → journey_destinations join     ← your brief
Experiences       → journey_experiences join      ← your brief
Gallery
Included / Excluded   clear two-column            ← existing includes[] reused
Practical         fitness · best months · min/max guests · pace
FAQs              FAQPage schema
Pricing           honest guide pricing + explanation of why it varies
Related tours     by shared theme and region
CTA / enquiry     prefilled with the tour title   ← existing behaviour preserved
```

## F.4 Pricing stance

Keep the enquiry-and-quote model. It is the correct model for private touring, and the best operators say so explicitly rather than apologising for it — a short, confident explanation of why a bespoke itinerary has a bespoke price converts better than a fake "from" price.

---

# G. COMPONENT ARCHITECTURE

## G.1 Reuse as-is (no changes)

| Component | Why |
|---|---|
| `components/motion.tsx` | `Reveal`, `HeroLine`, `KenBurns`, `MotionProvider` with `reducedMotion="user"` — correct, keep |
| `components/admin/EntityManager.tsx` | Config-driven CRUD. Extend config, not code |
| `components/admin/AdminShell.tsx` | Fine |
| `components/WhatsAppFloat.tsx` | Fine |
| `lib/validation.ts` | Better than most production validation. Do not touch |
| `lib/seo.ts` | `clampDesc` / `clampTitle` — reuse |
| `utils/format.ts` | Phase 0. Extend with duration/distance formatters |

## G.2 Extend (keep the API, restyle and add props)

| Component | Change |
|---|---|
| `TourCard` | + duration_days, regions, theme badges |
| `DestinationCard` | + region link, suggested duration |
| `SectionHeading` | + `as` prop for heading level control |
| `PageHeader` | + breadcrumbs slot |
| `CTABand` | + variant prop |
| `ReviewCard` | + source attribution field (Google / TripAdvisor / direct) · + `tour_id` so a quote can attach to the journey it describes (homepage §07) |
| `GalleryGrid` | Generalise: currently hardcodes 6 category names — drive from data |
| `Navbar` | Add mega-menu; **keep the existing mobile logic**, which is already accessible |
| `BookingForm` | Progressive disclosure; keep validation and the WhatsApp fallback exactly as-is |

## G.3 Create

```
primitives/   Button · Input · Select · Textarea · Checkbox · Badge · Chip
              Divider · Skeleton · VisuallyHidden
layout/       Container · Section · Grid · Stack · PageShell
              (Section owns ALL vertical rhythm — no page defines its own again)
media/        Img (blur placeholder + frame) · VideoHero ★ · Lightbox
              ImageMarquee · BeforeAfter
content/      Prose · Eyebrow · StatRow · PullQuote · MonthStrip ★
cards/        ExperienceCard ★ · RegionCard ★ · StayCard · JournalCard
              TeamCard · ActivityCard · PriceCard
patterns/     Hero · FAQ ★ · Timeline ★ · IslandMap ★ · Breadcrumbs ★
              FilterBar ★ · RelatedGrid · Highlights · IncludedList
              HorizontalRail ★ · FleetStrip ★ · GuideFeature ★
              JourneyStory ★ · PlannerEntry ★
navigation/   MegaMenu ★ · UtilityBar · Footer (extend)
admin/        MediaPicker ★ · RelationPicker ★ · RichTextField ★
```

★ = required by this brief specifically.

## G.4 Structural rule

`components/ui.tsx` is a 237-line barrel holding six unrelated components. It should become `components/ui/*` with one component per file. This is a **move, not a rewrite** — every existing export keeps its name and signature, and a re-export barrel keeps existing imports working during the transition so nothing breaks mid-phase.

---

# H. DATA MODEL

## H.1 Reuse unchanged

`profiles` · `bookings` · `inquiries` · `availability_blocks` · `drivers` · `vehicles` · `services` · `site_settings` · `gallery`

All auth, booking-pipeline and operations tables are sound and **out of scope for this redesign**.

## H.2 Extend (additive columns only — no drops, no renames)

| Table | Add |
|---|---|
| `destinations` | `region_id` FK · `lat` · `lng` · `suggested_duration` · `intro` · `best_months[]` · SEO block |
| `tours` | `duration_days` · `duration_nights` · `route_summary` · `map_geojson` · `excluded[]` · SEO block |
| `posts` | `primary_destination_id` · `primary_experience_id` · SEO block |
| `reviews` | `source` (Google / TripAdvisor / direct) · `source_url` · `tour_id` FK — lets a quote attach to the journey it describes (homepage §07) and makes every review verifiable |
| `vehicles` | `silhouette` image for the homepage fleet strip (§C 05) |
| `site_settings` | 6 new keys for CMS-editable hero copy (§C.5a) — additive rows in an existing key/value table, no schema change at all |
| all content tables | shared SEO block: `seo_title` · `seo_description` · `og_image` · `noindex` |

`tours.category` stays and is auto-populated from `duration_days` — nothing reading it breaks.

## H.3 New tables

`regions` · `experiences` · `experience_categories` · `activities` · `tour_themes` · `faqs` · `media` · `team` · `stays` · `restaurants` · `destination_climate` · `travel_tips`

**Plus one singleton:** `homepage_feature` — the manually curated Featured Journey (§C.2). One row, edited in the admin, `check` constraint or a fixed primary key to enforce singleton-ness. Deliberately a table rather than `site_settings` keys, because it carries real relations (`tour_id`, `review_id`, `guide_id`) and the existing `EntityManager` handles relations far better than it handles a bag of loose string settings.

## H.4 Join tables — replacing all string matching

```
tour_destinations     (tour_id, destination_id, day_from, day_to, sort)
tour_experiences      (tour_id, experience_id)
tour_themes_map       (tour_id, theme_id)
destination_experiences (destination_id, experience_id)
destination_activities  (destination_id, activity_id)
destination_nearby    (destination_id, nearby_id, drive_minutes, road_km)
entity_faqs           (entity_type, entity_id, faq_id, sort)
entity_media          (entity_type, entity_id, media_id, role, sort)
```

`destination_nearby` stores **real road drive times entered by you**, not distances computed from coordinates. Sri Lankan road distance bears almost no relationship to map distance, and getting this right signals genuine local operation more convincingly than any amount of copy.

## H.5 Migration principles

Every migration additive and idempotent, in the style of `0001_updated_at.sql`. `create table if not exists`, `add column if not exists`, guarded with `to_regclass`. Safe to run repeatedly against live data. **Nothing dropped, nothing renamed.** Backfill scripts separate from schema changes, and reversible.

---

# I. DESIGN SYSTEM

## I.1 Principle: extend, don't replace

The existing palette and type pairing are correct, and the contrast work is a real asset. What's missing is **tokenisation** — the values are right but hand-typed in every file (`py-20 md:py-28` appears in almost every section).

## I.2 Typography

Keep **Fraunces** (display serif) + **Archivo** (body sans) — a strong, correct luxury pairing, now self-hosted via `next/font` with the variable optical-size axis available.

| Token | Size | Use |
|---|---|---|
| `display-xl` | clamp(2.75rem, 9vw, 7rem) | Homepage hero only |
| `display-lg` | clamp(2.25rem, 6vw, 4.5rem) | Page H1 |
| `display-md` | clamp(1.875rem, 4vw, 3rem) | Section H2 |
| `display-sm` | clamp(1.5rem, 2.5vw, 2rem) | Card titles |
| `body-lg / body / body-sm` | 1.125 / 1 / 0.875rem | 1.7 line-height |
| `eyebrow` | 0.6875rem, 0.28em tracking | Existing |

## I.3 Colour — unchanged, plus semantic aliases

```
deep #0B1F19 · palm #16332B · moss #2C5247 · mist #93ABA1
sand #F6F1E6 · dune #ECE3D0 · ink #101D18
copper #B26A3B · copper-light #D08A55 · copper-deep #8A4E28 (AA-safe small text)
+ ocean #1F4E5F (accent only, sparing)

New aliases: surface · surface-raised · surface-inverse
             border-subtle · border-strong
             text-primary · text-secondary · text-muted (+ on-dark counterparts)
```

`copper-deep` exists specifically because brand copper failed WCAG AA at small sizes. **Preserve and extend that distinction** — it is the kind of detail that quietly separates a professional build from an amateur one.

## I.4 Spacing, radius, shadow, motion

```
SPACE    section-sm 5rem · section 7rem · section-lg 9rem
RADIUS   none (default) · sm 2px (form inputs, chips only)
SHADOW   two values, overlay surfaces only. Warm-tinted rgba(11,31,25,·), never grey
MOTION   quick 200ms · base 400ms · slow 700ms · cinematic 1400ms
         ease-out cubic-bezier(.22,1,.36,1)   ← already in use, formalised
Z-INDEX  base 0 · sticky 10 · nav 50 · overlay 80 · modal 90 · toast 100
```

**Corners stay square, per your instruction.** Cards, images, buttons and bands are square with hairline borders. Depth comes from photography, whitespace and type scale — not elevation. Glass/backdrop-blur appears in exactly two places: the scrolled navbar (already there) and the video hero control cluster. Nowhere else — overused blur is the fastest way to make a premium site look cheap, and it is expensive to composite on mobile.

## I.5 Image treatment

4:5 and 3:4 portrait crops for cards, 16:9 and 21:9 for bands. Gentle scale on hover (1.4s, existing pattern). Warm gradient placeholder (`.img-frame`, already built) so slow loads still look designed. Blur-up placeholders from a `blurhash` column once the media library lands. Duotone deep-green overlay for dark-ground sections. **Every image requires alt text, validated at CMS save time rather than at render.**

## I.6 Buttons

Three variants, all square: primary (solid ink or copper-deep), secondary (hairline border), text (the existing `.link-line` underline animation). Minimum 44px touch target. Hover states must preserve AA contrast — the existing code already pairs these carefully and that logic should be lifted into the Button primitive rather than re-derived.

## I.7 Mobile behaviour

- Single column below 640px; **fill the 640–1024px gap the current index pages skip.**
- Horizontal rails become grids on mobile — no content hidden behind a swipe.
- Sticky bottom enquiry bar on tour and destination pages.
- Full-screen nav overlay, one accordion level.
- Video hero → poster image (see §J).
- Tap targets ≥44px; no hover-only affordances anywhere.

---

# J. VIDEO STRATEGY

The cinematic opening is the single biggest Core Web Vitals risk in this proposal. Handled carelessly it costs you LCP, CLS and mobile data. Handled as below, it costs approximately nothing.

## J.1 The governing rule

**The poster image is the LCP element. Always.** A single optimised AVIF, `priority`, `fetchpriority="high"`, correct `sizes`. It paints, the page is measured, and Lighthouse never sees the video. The video is a progressive enhancement layered on top — never a dependency.

## J.2 Load conditions — all must be true

```js
viewport width      ≥ 768px
prefers-reduced-motion  ≠ reduce
navigator.connection.saveData  ≠ true
effectiveType       === '4g'
document.visibilityState === 'visible'
page                is interactive (after hydration, requestIdleCallback)
```

Fail any one → the poster image stays, permanently, with no layout shift and no wasted bytes.

## J.3 Encoding

| | |
|---|---|
| Primary | AV1 / WebM |
| Fallback | H.264 / MP4 (Safari, older devices) |
| Duration | 20–30s, ~9 cuts, seamless loop |
| Audio | **No audio track at all** — not muted, absent. Smaller file, no autoplay-policy edge cases |
| Target size | < 3 MB primary, < 5 MB fallback |
| Resolution | 1920×1080 desktop; a separate 1280×720 encode for tablets |
| Poster | Extracted from frame 1 so the transition is invisible |

## J.4 Markup

```html
<video muted playsinline loop preload="none"
       poster="/hero-poster.avif" aria-hidden="true" tabindex="-1">
  <source src="/hero.webm" type="video/webm" />
  <source src="/hero.mp4"  type="video/mp4" />
</video>
```

`aria-hidden` + `tabindex="-1"` because it is decorative — it carries no information not also in the text. Fades in on `canplaythrough` via opacity only, so CLS stays at zero.

## J.5 Mobile

**Mobile gets the poster image.** This is not a compromise. On a phone, a single full-bleed photograph at the right crop is frequently the stronger image, and you avoid burning 3 MB of a traveller's data plan before they have read a word.

## J.6 Accessibility

- Auto-playing motion over 5 seconds **requires** a visible pause control (WCAG 2.2.2). Bottom-right, always reachable, persists the user's choice in `localStorage`.
- `prefers-reduced-motion: reduce` → video never loads. Not paused — never requested.
- Video is decorative and `aria-hidden`; all meaning lives in the text layer.
- Text contrast must hold against **every frame**, not just the poster. This is why the scrim is a three-stop gradient rather than a flat tint — bright frames (beach, sky) are the failure case.

## J.7 Performance guardrails

`preload="none"` · never in the critical path · one `<video>` element only, unmounted when scrolled out of view · pause on `visibilitychange` (a background tab decoding video drains battery) · Lighthouse checked with video both enabled and disabled.

## J.8 Content direction

Your sequence — arrival → landscapes → culture → mountains → tea country → wildlife → ocean → people → sunset — is a good narrative arc. Two production notes: **people should appear more than once** (a story about a place with humans only at the end reads as a landscape reel), and **the first frame is the poster**, so it must work as a still photograph on its own. Choose it accordingly.

---

# K. SEO STRUCTURE

## K.1 Content architecture for search

```
Head     /                            "Sri Lanka private tours"
Hub      /regions/[7]                 "Cultural Triangle Sri Lanka"
         /experiences/[12]            "Sri Lanka whale watching"  ← highest ROI
         /tours/collections/[~6]      "7 day Sri Lanka itinerary"
Spoke    /destinations/[25]           "Sigiriya guide"
         /journal/[n]                 long-tail informational
Support  /plan/best-time-to-visit     very high volume
         /plan/faq                    practical long-tail
```

~55 substantial pages at launch versus 13 today, each with a genuine reason to exist and each interlinked through real database relationships.

## K.2 Enforced per-page metadata

A single `buildMetadata()` helper guarantees every route emits title (≤60ch), description (≤155ch), canonical, OG (type, image 1200×630, locale, siteName), Twitter card and structured data. Routes that fail to supply these should **fail typecheck**, not ship silently.

## K.3 Structured data by page type

| Page | Schema |
|---|---|
| Home | `TravelAgency` + `LocalBusiness` w/ `geo`, `sameAs` |
| Region | `TouristDestination` + `BreadcrumbList` |
| Destination | `TouristDestination` + `BreadcrumbList` + `FAQPage` |
| Experience | `TouristAttraction` + `BreadcrumbList` + `FAQPage` |
| Tour | `TouristTrip` + `Offer` + itinerary as `ItemList` of `TouristDestination` + `BreadcrumbList` + `FAQPage` |
| Journal | `Article` + `BreadcrumbList` |

⚠ `aggregateRating` **only** if real, verifiable reviews exist. Rating schema on invented reviews is a direct Google policy violation with manual-action risk.

## K.4 Canonicals and indexing

Self-referencing canonicals everywhere · filtered/paginated views canonical to their parent · collections separately indexable (unique editorial copy) · `noindex` on `/admin` (already) · redirects permanent, old slugs kept in the sitemap for one crawl cycle · `hreflang` deferred until a second locale genuinely exists.

## K.5 Technical

Dynamic OG images via route-level `opengraph-image.tsx` (title + image + brand lockup, generated at the edge) · `generateStaticParams` on all new dynamic routes (the Phase 0 pattern) · real `updated_at` in the sitemap (already) · sitemap ping on publish · alt text mandatory in the CMS.

---

# L. IMPLEMENTATION PLAN

Each phase ends with: a summary, the list of modified files, a passing production build — **and a stop for your approval.**

| Phase | Scope | Risk | Depends on |
|---|---|---|---|
| **1 · Design system + component library** | Token layer · `ui.tsx` → `ui/*` with a compatibility barrel · primitives · `Section` owning vertical rhythm. **No visual change to any page.** | Low | — |
| **2 · Homepage** | Video-ready hero · island map · all 9 sections · mega-menu · `homepage_feature` singleton + admin config · `team` table (§C 06–07) | Medium | 1 |
| **3a · Regions + destinations** | `regions` table · 7 hubs · rebuilt destination template · join tables replace string matching | Medium | 1 |
| **3b · Destination depth** | Activities · stays · restaurants · climate · travel tips · destination map | Medium | 3a |
| **4 · Experiences** | 12 categories · index · detail template · filters. Fully additive — nothing existing changes | Low | 1 |
| **5 · Tours** | Duration/theme taxonomy · rebuilt discovery + detail · itinerary timeline · route map · collections | Medium-high | 1, 3a, 4 |
| **6 · Media, team, journal** | Media library + Supabase Storage · `/team` · journal upgrade · **migrate off stock photography** | Medium | 1 |
| **7 · Plan hub + enquiry** | `/plan` · best-time-to-visit · FAQ · multi-step enquiry · guest confirmation email | Medium | 1 |
| **8 · Content verification** | **Every factual and business claim sourced, softened or cut** (§A.9) | Low | all |
| **9 · Final pass** | SEO sweep · a11y audit · Lighthouse · redirects · launch checklist | Low | all |

**Phase 1 first, deliberately.** It changes no pixel on any page but makes every subsequent phase faster to build and easier to review. Phase 4 (Experiences) is the lowest-risk high-value work — purely additive, nothing existing can break — and could be pulled forward if you want visible progress sooner.

---

# M. RISKS

## M.1 Deployment breakers — highest priority

| # | Risk | Detail | Mitigation |
|---|---|---|---|
| 1 | **`remotePatterns` blocks Supabase Storage** | `next.config.mjs` allows **only** `images.unsplash.com`. The moment a CMS image points at Supabase Storage, `next/image` returns a 400 and the image is simply gone. The commented-out line for it is already in the file, unused. | Add the hostname **in the same commit** as the media library. Test with a real uploaded asset before merge. |
| 2 | **RLS policies do not cover new tables** | `schema.sql` creates public-read/admin-write policies by looping over a **hardcoded array** of 7 table names. A new table gets `alter table … enable row level security` but **no policy** — so it denies everything and returns zero rows *silently*. No error. Pages just render empty. | Every new-table migration must add its policies explicitly. Verify with an anon-key query before considering the migration done. |
| 3 | **`npm ci` fails on lockfile drift** | Vercel runs `npm ci`, which fails outright if `package.json` and `package-lock.json` disagree. | Never hand-edit `package.json`. Commit both together. (This is why the Phase 0 ESLint addition was reverted.) |

## M.2 Silent-failure risks

| # | Risk | Detail | Mitigation |
|---|---|---|---|
| 4 | **String-matched relations break quietly** | Destination→tour matching returns wrong or empty results with no error. Already fragile at 9 destinations. | Replace with joins in Phase 3a. Until then, do not add destinations whose names are substrings of others. |
| 5 | **Seed fallback masks a broken backend** | If Supabase returns zero rows, `fromTable` falls back to seed content. A migration that breaks a policy looks like "the old content is showing" rather than an error. | Add a build-time warning when a fallback fires in production. |
| 6 | **Homepage `/services#slug` anchors** | The homepage links to `/services#${s.slug}`. Redirecting `/services` without updating these leaves anchors bouncing through a redirect. | Update links in the same commit as the redirect. |

## M.3 Performance and quality risks

| # | Risk | Mitigation |
|---|---|---|
| 7 | Video hero destroys LCP | §J in full. Poster is always the LCP element. |
| 8 | Framer Motion bundle grows with more animated sections | Move `Reveal` to CSS scroll-driven animation with an IntersectionObserver fallback; keep Framer only where genuinely needed. |
| 9 | `select("*")` + fetch-all-then-`.find()` degrades as content grows | Move to `.eq("slug", slug).single()` and add pagination in Phase 3a. |
| 10 | Island map is inaccessible if built naively | Focusable `<a>` per region, arrow-key cycling, plain linked-list fallback, SVG `aria-hidden`. |
| 11 | New components regress the existing a11y standard | Treat `AUDIT.md` as an acceptance checklist for every new component. |

## M.4 Content and legal risks

| # | Risk | Mitigation |
|---|---|---|
| 12 | **Fabricated reviews may be live in Supabase** | Phase 0 removed them from source, but if `seed.sql` was ever run they persist in the database. See `VERIFY-PHASE-0.md`. **Check before launch.** |
| 13 | Unverified superlatives ("world's densest leopard population") | Phase 8 verification pass. |
| 14 | Unconfirmed licensing/insurance claims | Your confirmation required. |
| 15 | `aggregateRating` schema on unverified reviews | Do not emit rating schema until real reviews exist. |

## M.5 Explicitly out of scope — will not be touched

Supabase auth · `middleware.ts` · `profiles` / `is_admin()` / RLS on existing tables · bookings and inquiries pipeline · `lib/actions.ts` · `lib/validation.ts` · `lib/email.ts` · the admin dashboard's operational pages.

---

# 1. FILES THAT SHOULD EVENTUALLY BE MODIFIED

**Phase 1 — design system**
`tailwind.config.ts` · `app/globals.css` · `components/ui.tsx` → `components/ui/*` (move + compatibility barrel) · `utils/format.ts` · `types/content.ts`

**Phase 2 — homepage**
`app/page.tsx` (substantial rewrite) · `components/Navbar.tsx` (mega-menu; keep mobile logic) · `components/Footer.tsx` (expand) · `app/layout.tsx` (minor)

**Phase 3 — destinations**
`app/destinations/page.tsx` · `app/destinations/[slug]/page.tsx` · `lib/destinations.ts` · `lib/data.ts` · `lib/admin-entities.ts` · new `app/regions/[slug]/page.tsx`

**Phase 4 — experiences** *(all new files; nothing existing modified except nav, data layer and admin config)*
`app/experiences/page.tsx` · `app/experiences/[slug]/page.tsx` · `lib/experiences.ts`

**Phase 5 — tours**
`app/tours/page.tsx` · `app/tours/[slug]/page.tsx` · `lib/tours.ts` · new `app/tours/collections/[slug]/page.tsx`

**Phase 6–7**
`components/BookingForm.tsx` (progressive disclosure only — **validation and the WhatsApp fallback stay exactly as they are**) · `lib/images.ts` (→ media library) · `next.config.mjs` (remotePatterns + redirects) · `app/sitemap.ts` (new routes) · `app/blog/*` → `app/journal/*`

**Migrations (new files only, never edits to existing ones)**
`supabase/migrations/0002_regions.sql` … `0009_*.sql`

# 2. FILES THAT SHOULD NOT BE TOUCHED

**Never, without a separate explicit conversation:**

```
middleware.ts                     auth gate — works, scoped correctly
lib/supabase/server.ts            anon/cookie client split is correct
lib/supabase/client.ts
lib/actions.ts                    server actions — booking/inquiry pipeline
lib/validation.ts                 better than most production validation
lib/email.ts                      notification transport
supabase/schema.sql               historical record — add migrations instead
supabase/migrations/0001_*.sql    already applied
app/admin/(dashboard)/bookings/*  operational — live business data
app/admin/(dashboard)/inquiries/*
app/admin/(dashboard)/calendar/*
app/admin/login/page.tsx
lib/booking-ui.ts
```

**Modify only via config, never by editing the component:**
`components/admin/EntityManager.tsx` — add entities through `lib/admin-entities.ts`. New field types (`relation`, `media`, `richtext`) are the one exception, and they are additive.

**Leave alone unless a phase specifically requires it:**
`app/about/page.tsx` · `app/contact/page.tsx` · `app/gallery/page.tsx` · `app/fleet/page.tsx` · `app/reviews/page.tsx` · `app/not-found.tsx` · `app/robots.ts` · `public/*`

# 3. RECOMMENDED IMPLEMENTATION ORDER

```
1 · Design system + component library     invisible, unblocks everything
2 · Homepage                              the thing you most want to see
3a · Regions + destinations               kills string matching
4 · Experiences                           lowest risk, highest SEO return
3b · Destination depth
5 · Tours
6 · Media library + real photography
7 · Plan hub + enquiry flow
8 · Content verification pass
9 · SEO + a11y + performance final pass
```

**If you want visible progress fastest:** 1 → 2 → 4 → 3a. Phase 4 is entirely additive and cannot break anything that currently works.
**If you want maximum SEO return fastest:** 1 → 4 → 3a → 2.

# 4. QUESTIONS THAT MUST BE ANSWERED BEFORE CODING

**Q1 — Homepage sections. ✅ ANSWERED 8 Aug.** Keep all five, integrated rather than appended, page stays at 9 sections. Applied in §C: Chauffeur-Guide merged into *Why Island Route* (06), Traveller Stories merged into *Featured Journeys* (07), Fleet as a slim strip closing Tours (05), FAQ as a 3-question preview above the footer (09), Journey Planner as the right-hand path of the final CTA (09).

**Q2 — Sections 05 and 07. ✅ FULLY ANSWERED 8 Aug.** 05 is a scannable card grid for comparing options; 07 is **one** journey, manually curated and CMS-editable — no carousel, no auto-rotation. Required: one tour, three images, a route line. Optional and omitted-if-absent: a verified traveller quote, a short guide perspective. Backed by the `homepage_feature` singleton (§C.2, §H.3).

**Q3 — Homepage headline. ✅ ANSWERED 8 Aug.** **"Sri Lanka, Unscripted."** with the approved supporting copy and CTAs, all editable via `site_settings` with hard-coded fallbacks (§C.5). My "Serendib" suggestion is withdrawn — it rested on an unverified etymological claim, and no brand rationale in this project will lean on historical or linguistic assertions unless independently sourced (§C.6).

**Q4 — Photography and video *(shapes Phases 2 and 6)*.** Do you have original photography? Any video footage, or a budget to shoot it? This is the highest-leverage input you can supply and it determines how ambitious Phase 2 can be. Everything currently runs on stock, some of which is not Sri Lanka.

**Q5 — Content verification *(blocks launch)*.** Who verifies the destination facts in §A.9 — you, or do I soften every unverifiable claim to a defensible form? And are the licensing/insurance claims accurate?

**Q6 — The fabricated reviews in Supabase.** Were they ever seeded into your live database? If yes they are still rendering, regardless of the source-code change.

**Q7 — Destination scope.** Expand from 9 to ~25 destinations? That is the difference between a brochure and a genuine guide, but it is a significant content-writing commitment — roughly 400–600 words of original, factually-verified copy per destination.

**Q8 — Restaurants and stays.** These add real local-knowledge credibility, but they are commercially sensitive (partner relationships) and a maintenance burden. In or out?

---

**No files modified. Nothing installed. Awaiting your answers before any code is written.**
