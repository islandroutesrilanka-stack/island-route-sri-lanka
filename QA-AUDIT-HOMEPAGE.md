# Homepage QA Audit — pre-Phase 3

**Date:** 9 August 2026
**Repo state:** working tree as of the refinement pass. **No files modified by this audit.**

---

## ⚠ Scope limit — read this first

**I could not test the running site.** Three independent blockers, all environmental:

| Check | Status |
|---|---|
| Browser at 320–1440px | ❌ No Chrome browser is connected (`list_connected_browsers` → empty) |
| `http://localhost:3000` | ❌ Unreachable — your dev server runs on your machine, not in my sandbox (`curl` → `000`) |
| `npm run build` / `npm run start` | ❌ `node_modules/@next/` contains only `swc-win32-x64-msvc`. No Linux compiler; registry blocked |

So **sections 1, 2, 3, 8, 9 and 10 of your brief — desktop/tablet/mobile visual, console, network, production parity — were not empirically tested.** Anything below marked **[STATIC]** is analysis of source, not observation of behaviour. I have not guessed at what a screenshot would show.

What I *did* do rigorously: full source audit, route/link resolution, heading hierarchy, client/server boundaries, computed colour contrast, touch-target measurement, media provenance. Those findings are solid.

---

## A. PASS

**Routing and links [VERIFIED]**
- Every href rendered anywhere in the homepage tree resolves to a route that exists: `/`, `/about`, `/blog`, `/book`, `/contact`, `/destinations`, `/fleet`, `/tours`. **No dead links.**
- Dynamic hrefs also resolve: `/tours/[slug]`, `/destinations/[slug]`, `/blog/[slug]`.
- Query-param links (`/tours?theme=…`, `/destinations?region=…`) point at pages that exist and ignore unknown params — forward-compatible, not broken.
- `#explore` and `#experiences` anchors both exist as real `id`s with `scroll-mt-20`.

**Navigation [VERIFIED]**
- Exactly one `links` array, one `Navbar.tsx`. Labels are static constants — no pathname, state or browser logic touches text, so the previous hydration mismatch cannot recur from source.
- Primary labels are exactly as approved: Journeys → `/tours`, Destinations, Experiences → `/#experiences`, Journal → `/blog`, About. CTA "Plan your journey" → `/book`.
- Desktop and mobile menus render from the **same** array — labels cannot diverge.
- `aria-current` correctly excluded for the anchor link.

**Structure [VERIFIED]**
- Exactly one `<h1>` (hero). Sections use `h2`, sub-items `h3`. No level skips — one exception in §B5.
- Client/server boundary is clean: only three client modules in the homepage tree (`VideoHero`, `IslandMap`, `motion`). Everything else is server-rendered, including the FAQ.
- No duplicate components, no stale references to the old homepage.
- All three `<Image>` usages carry `alt`.

**Motion [VERIFIED]** — `prefers-reduced-motion` honoured in three independent places: `MotionConfig reducedMotion="user"`, the CSS block in `globals.css`, and `VideoHero`'s load gate (video is never *requested*, not merely paused).

**Contrast on dark sections [COMPUTED]** — every `text-sand/*` on `bg-deep` passes AA. Lowest is `text-sand/50` at **4.70:1**.

**Media discipline [VERIFIED]** — the components I wrote render no registry asset that makes a place claim; they use CMS URLs or `GradientPanel`. `hero_poster_url`, `hero_video_url` and guide fields are all empty, so nothing unverified ships through them.

---

## B. ISSUES

### B1 — Unverified location imagery captioned with place names
**Severity: HIGH** · `components/ui.tsx` (`DestinationCard`) + `lib/destinations.ts`

**Observed.** Homepage §03 renders 8 `DestinationCard`s. Each overlays `{d.name}` — "Sigiriya", "Kandy", "Yala", "Arugam Bay", "Colombo" — on an image from `lib/destinations.ts`, all of which are unverified stock (`verifiedLocation: false` throughout the registry). `DestinationCard` uses raw `next/image`, so it **bypasses the `Img` / `requireVerifiedLocation` guard entirely**.

Worse: `lib/destinations.ts:122` gives Colombo `img.cityLights` — an asset I documented in `MEDIA-ASSETS.md` §4 as generic and non-Sri-Lankan, slated for retirement. It is currently on your homepage labelled "Colombo · Western Capital".

**Why it matters.** This is precisely the rule you set — *"Do not use generic images falsely labelled as Sri Lankan."* The guard was built for exactly this and isn't wired to the one component that needs it.

**Recommended fix.** Route `DestinationCard` through `Img` with `requireVerifiedLocation`, so unverified destinations render `GradientPanel` with the place name in type instead of a possibly-wrong photograph. Separately, drop `cityLights` from `lib/destinations.ts`.

### B2 — Colour contrast regressions below WCAG AA
**Severity: HIGH** · `ExperienceRail.tsx`, `TrustBand.tsx`, `JourneyStory.tsx`, `app/page.tsx`

**Observed [COMPUTED, sRGB, WCAG 2.1 formula]:**

| Token | On sand | On dune | Verdict | Where |
|---|---|---|---|---|
| `text-ink/50` | **3.25:1** | 3.15:1 | ✗ fail | `ExperienceRail` — 12px activities line |
| `text-ink/55` | **3.77:1** | 3.63:1 | ✗ fail | `TrustBand` WhatsApp line; `JourneyStory` route note |
| `text-ink/60` | **4.39:1** | 4.20:1 | ✗ marginal fail | `app/page.tsx` ×2 (journal date, region character) |
| `text-ink/35` | **2.16:1** | — | ✗ fail (non-text 3:1) | `ExperienceRail` arrow affordance |

**Why it matters.** `AUDIT.md` records that this project deliberately swept every page to a 4.5:1 minimum and created the `copper-deep` token specifically to hold that line. **My refinement pass regressed it.** All four are in code I wrote.

**Recommended fix.** Raise to `text-ink/65` (5.15:1) or `text-ink/70` (6.07:1); arrow to `text-ink/45`+ or mark it purely decorative alongside a text affordance.

### B3 — Touch target below the project's own standard
**Severity: MEDIUM** · `components/patterns/PlannerEntry.tsx:62`

Journey Planner chips are `min-h-[38px]`. `AUDIT.md` records gallery filters being raised *to 44px* as a fix. This reintroduces the same defect. **Fix:** `min-h-[44px]`.

### B4 — Unverifiable business claims in homepage copy
**Severity: MEDIUM — flagging, not fixing, per your rule**

| Claim | Location |
|---|---|
| "Routes we've **refined over years**" | `app/page.tsx:238` — implies operating history |
| "Our chauffeur-guides are **licensed guides** who drive" | `GuideFeature.tsx:35` — a credential claim |

Both are plausible and probably true, but neither is verified. The licensing one is the same class as the footer's "Licensed Sri Lankan tour operator", still outstanding from Phase 0.

### B5 — Fleet strip has no heading element
**Severity: LOW** · `components/patterns/FleetStrip.tsx:25`

"The fleet" is a `<p class="eyebrow">`. A distinct content region with no heading is invisible to heading-based navigation. **Fix:** make it an `h3`, keeping the eyebrow styling.

### B6 — Unused import
**Severity: LOW** · `app/page.tsx:2` — `ArrowRight` imported, never used. Harmless (tree-shaken) but dead code.

### B7 — Untested arbitrary Tailwind value
**Severity: MEDIUM — needs your eyes, not a fix**

`app/page.tsx:85`: `lg:h-[max(42rem,min(94svh,calc(100vw*9/21)))]`. Valid CSS and valid Tailwind arbitrary syntax, but I could not render it. **This is the single highest-value thing for you to check at 1280px and 1440px** — it controls the entire hero composition, and it's the one refinement I'm least able to vouch for.

### B8 — Hard-coded section copy
**Severity: LOW** · `app/page.tsx` lines 160, 161, 176, 224, 238, 239

Section titles and intros are literals. Hero copy is CMS-driven; section copy is not. Reasonable for now — flagging as a consistency gap, not a defect.

---

## C. MOBILE ISSUES

**Not tested.** [STATIC] risk assessment only:

| Risk | Assessment |
|---|---|
| Headline at 320px | `clamp(2.75rem,10vw,7rem)` floors at 44px. "Unscripted." ≈ 250px against ~280px available. **Tight — verify at 320px.** |
| Hero height | `min-h-[100svh]` with `pt-32 pb-14`; content is `items-end`. At 320×568 the stack may crowd. **Verify.** |
| `ExperienceRail` features | Content is absolutely positioned in `aspect-[4/5]`; blurb + activities list could overflow the tile at 320px. **Highest mobile risk — verify first.** |
| Chips | 38px — see B3 |
| Horizontal overflow | No `w-screen`, no `100vw` widths, no fixed px widths in the homepage tree. Low risk. |
| `TourCard` feature | Excerpt correctly hidden below `md`. Good. |

---

## D. CONSOLE / NETWORK

**Not inspected** — no browser access. I can offer only two source-level observations:

- `next.config.mjs` `remotePatterns` allows `images.unsplash.com`, `images.pexels.com`, `*.supabase.co`. All current image URLs are Unsplash, so **no 400s from unlisted hosts are expected.**
- Fonts are self-hosted via `next/font`, so **no `fonts.googleapis.com` requests should appear** — worth confirming in the Network tab, as it verifies the Phase 0 change end-to-end.

---

## E. ACCESSIBILITY

**Findings:** B2 (contrast, HIGH), B3 (touch targets, MEDIUM), B5 (missing heading, LOW).

**Verified good:**
- `IslandMap` — every region is a real focusable `<a>`; the SVG is `aria-hidden`; a full region list renders alongside, not as a JS fallback. **Nothing is pointer-only.**
- `FaqPreview` — native `<details>/<summary>`, keyboard-operable with no ARIA to get wrong, and now server-rendered.
- Mobile menu retains `aria-expanded`, `aria-controls`, Escape and scroll-lock.
- `:focus-visible` ring intact globally; skip link intact.
- Reduced motion honoured in three layers.

**Not verified:** actual focus-ring visibility against the new dark hero, and screen-reader traversal. Both need a real browser.

---

## F. CONTENT / MEDIA

| Item | State | Correct? |
|---|---|---|
| Hero poster | Empty → contour treatment | ✅ As approved |
| Hero video (desktop/mobile) | Empty | ✅ As approved |
| Featured guide | Empty → fallback renders, no person invented | ✅ Correct |
| Traveller quote §07 | No reviews exist → block omitted | ✅ Correct |
| Statistics / ratings | None present | ✅ Correct |
| **Destination images** | **8 unverified, captioned with place names** | ❌ **See B1** |
| Tour card images | Unverified stock; tour titles name places (e.g. "Essential Sri Lanka") | ⚠ Weaker claim than B1, same class |
| Location verification | **0 of 9 verified** in `MEDIA-ASSETS.md` | ⏳ Awaiting you |

---

## G. PRODUCTION CHECK

**Could not run.** `npm run build` and `npm run start` are impossible in my sandbox (Windows-only SWC binary, no registry access). You report both pass locally; I have no contradicting evidence, but I have not verified production parity myself.

`package-lock.json` is now the only lockfile — the earlier npm/pnpm ambiguity is resolved. ✅

---

## H. PHASE 3 READINESS

### READY WITH FIXES

Nothing here is architectural. The structure, routing, boundaries and media contracts are sound. Four things I'd want closed first:

| Priority | Issue | Effort |
|---|---|---|
| 1 | **B1** — destination cards bypass the verification guard, and one is a known non-Sri-Lankan image | ~30 min |
| 2 | **B2** — four AA contrast regressions I introduced | ~10 min |
| 3 | **B3** — 38px touch targets | ~2 min |
| 4 | **B7** — you visually confirm the hero at 1280/1440 and 320px | your eyes only |

B4 needs your ruling on two claims. B5, B6, B8 are cosmetic.

**My honest read:** B1 is the one that matters. Everything else is tidying, but shipping a homepage that captions unverified stock with Sri Lankan place names — including one image already identified as not Sri Lanka — undercuts the exact standard this project has been built around.

---

**No files were modified. Awaiting your approval before any changes, and not starting Phase 3.**
