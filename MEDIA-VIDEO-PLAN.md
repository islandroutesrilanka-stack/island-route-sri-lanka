# Media & Hero Video — Implementation Plan

**Status:** Plan only. No code written. Awaiting approval before Phase 2.
**Scope:** The media architecture and cinematic hero. Backend, auth and booking logic are untouched.
**Answers:** Q4 (C + D — stock now, original later, no rewrite when it changes).
**Updated 8 Aug** with the five approved decisions — see §12.

---

## 0. The one thing that makes this work

Your requirement is that stock assets can be replaced with original assets **without redesigning or rewriting components**. There is exactly one architectural decision that delivers that, and it is not a database table:

> **Components must never receive a bare URL string. They receive a media object.**

Today `app/page.tsx` contains `src={img.heroTrain}` — a component reaching directly for a specific hard-coded asset. Every such reference is a place a future swap has to touch.

After this change the hero receives a `MediaAsset` — `{ src, mobileSrc?, alt, focal, credit, license, provenance }` — resolved at the data layer. Swapping stock for original becomes a **data change**, never a code change. That contract is the whole plan. Everything below is machinery serving it.

---

## 1. Do we need a new database table? — No, and here is why

You asked me to propose rather than assume. My recommendation: **no schema change at all in Phase 2. Zero migrations.**

| Option | Verdict |
|---|---|
| **A. Full `media` table + Storage + MediaPicker now** | Correct destination, wrong timing. Needs a new admin field type, an upload UI, RLS policies, and a Storage bucket — a phase of work in itself, to manage ~30 assets that currently live fine in a typed file. |
| **B. Add `image_alt`, `image_mobile`, `image_focal`, `image_credit` columns to every content table** | 4 columns × 8 tables = 32 columns of duplicated shape. Genuinely worse than either alternative. |
| **C. Typed asset registry in code + `site_settings` keys for hero media** ← **recommended** | Zero migrations. Registry is version-controlled, reviewable in a PR, and typed — so a missing `alt` is a build error. Hero media is CMS-editable today via the settings page that already exists. |

**Why the registry is the right call for stock assets specifically:** these are temporary production assets with licences and provenance to track. Git is a better home for that than a database — you get history, diffs, and code review on every asset change. When assets become *original* and *numerous* and are managed by non-developers, that calculus flips, and Phase 6 introduces the `media` table.

**The registry entry shape is deliberately identical to the future table's columns.** Phase 6 is then a data migration and a field-type addition — not a rewrite, and not a component change.

---

## 2. The media contract

```ts
// lib/media/types.ts

export type MediaProvenance =
  | { kind: "stock";    source: string; url: string; license: string; verifiedLocation: boolean }
  | { kind: "original"; photographer?: string; shotAt?: string }
  | { kind: "cms" };

export type MediaAsset = {
  src: string;
  mobileSrc?: string;          // only where a different crop genuinely helps
  alt: string;                 // required — not optional, by design
  focal?: `${number}% ${number}%`;  // → CSS object-position. Default "50% 50%"
  width?: number;
  height?: number;
  blurDataURL?: string;
  depicts?: string;            // "Sigiriya, Cultural Triangle" — the authenticity field
  provenance: MediaProvenance;
};

export type VideoAsset = {
  posterAsset: MediaAsset;     // ALWAYS present — the video is optional, this is not
  sources: { src: string; type: "video/webm" | "video/mp4" }[];
  mobileSources?: { src: string; type: string }[];
  provenance: MediaProvenance;
};
```

`alt` being required rather than optional means an asset without alt text **fails typecheck**. That is a deliberate accessibility guardrail — it cannot be forgotten, only deliberately filled in.

`depicts` is the authenticity field. It exists so that "which image claims to be Sigiriya?" is a greppable question with a machine-readable answer, rather than something buried in JSX.

---

## 3. Hero video architecture

### 3.1 Layer model

```
┌─────────────────────────────────────────────────┐
│  z-30   Text, CTAs, scroll cue                  │
├─────────────────────────────────────────────────┤
│  z-20   Gradient scrim (3-stop)                 │
├─────────────────────────────────────────────────┤
│  z-10   <video>  opacity 0 → 1 over 1.2s        │
│         Mounted ONLY when all gates pass        │
├─────────────────────────────────────────────────┤
│  z-0    <Image priority>  ← THE LCP ELEMENT     │
│         Always rendered. Never removed.         │
└─────────────────────────────────────────────────┘
```

The poster is a `next/image` with `priority` and `fetchpriority="high"` — AVIF/WebP, responsive `sizes`, served through the existing image pipeline. It paints, the page is measured, LCP is recorded. The video is decoration layered on top and is **never** the LCP candidate.

**Deliberate detail:** the `<video>` carries **no `poster` attribute**. If it did, the browser would download the poster twice — once for `next/image`, once for the video element. The image layer beneath is the poster.

### 3.2 Load gates — all must pass

```
✓ hydration complete            (never blocks first render)
✓ requestIdleCallback fired     (never competes with critical work)
✓ viewport ≥ 768px              → else mobile path, §3.3
✓ prefers-reduced-motion ≠ reduce
✓ navigator.connection.saveData ≠ true
✓ effectiveType === "4g"        (absent API → treated as pass)
✓ document.visibilityState === "visible"
✓ a video source is configured  → else poster stays, permanently
```

Any gate fails → the poster remains, with **no layout shift and no bytes spent**. This satisfies "do not make the video required" and "do not block initial render" structurally, not by convention.

### 3.3 Mobile — support built, default off

You asked for separate mobile video support. Built, with a considered default:

| `hero_video_mobile_url` | Behaviour |
|---|---|
| **Empty (recommended default)** | Mobile gets the poster image only. Zero video bytes. |
| Populated | Mobile loads it, under the same gates plus a stricter size budget (< 1.5 MB) |

My recommendation is to leave it empty at launch. On a phone, a well-chosen full-bleed still is frequently the stronger image, and you avoid spending a traveller's data before they have read a word. **The capability exists the moment you want it** — populate one CMS field, no deploy.

### 3.4 Encoding targets

| | Desktop | Mobile (optional) |
|---|---|---|
| Primary | AV1 / WebM | H.264 / MP4 |
| Fallback | H.264 / MP4 | — |
| Resolution | 1920×1080 | 900×1600 (portrait crop) |
| Duration | 20–30s, seamless loop | 12–20s |
| Audio | **No audio track at all** | same |
| Budget | < 3 MB webm, < 5 MB mp4 | < 1.5 MB |

No audio *track* — not merely muted. Smaller file, and it sidesteps browser autoplay-policy edge cases entirely.

### 3.5 Markup

```html
<video autoplay muted loop playsinline preload="none"
       aria-hidden="true" tabindex="-1">
  <source src="…webm" type="video/webm" />
  <source src="…mp4"  type="video/mp4" />
</video>
```

`aria-hidden` + `tabindex="-1"` because it is decorative — it carries no information not also present in the text layer.

### 3.6 Accessibility

- Auto-playing motion beyond 5 seconds **requires** a visible pause control (WCAG 2.2.2). Bottom-right, 44px, persists the choice in `localStorage`.
- `prefers-reduced-motion: reduce` → the video is never requested. Not paused — never fetched.
- Paused on `visibilitychange` (a background tab decoding video drains battery).
- Unmounted entirely when scrolled fully out of view.
- **Text contrast must hold against every frame, not just the poster.** This is why the scrim is a three-stop gradient rather than a flat tint — bright frames (sky, beach, white architecture) are the failure case, and a video that passes contrast on frame 1 can fail on frame 200.

---

## 4. Where the configuration lives

Ten new `site_settings` keys — **an existing key/value table, so no schema change** — surfaced as a new "Homepage hero" group on the existing `/admin/settings` page.

```
hero_headline              "Sri Lanka, Unscripted."
hero_subcopy               "Private journeys through an island of wild
                            landscapes, living culture and extraordinary
                            encounters."
hero_cta_primary_label     "Plan Your Journey"
hero_cta_primary_href      "/plan/enquire"
hero_cta_secondary_label   "Explore Sri Lanka"
hero_cta_secondary_href    "#explore"
hero_poster_url            "/media/hero/hero-poster.jpg"
hero_poster_alt            "…"
hero_video_url             "/media/hero/hero-desktop.webm"
hero_video_mobile_url      ""          ← empty = poster only on mobile
```

**Every key has a hard-coded default in `lib/data.ts`**, following the existing `defaultSettings` pattern. Missing row, blank value, or unreachable Supabase → the hero renders approved copy over the bundled poster. The CMS refines; it can never empty the hero.

**This is the swap mechanism.** When original footage arrives, you change `hero_video_url`, `hero_video_mobile_url` and `hero_poster_url` in the admin. No deploy, no code change, no redesign. Exactly the workflow you described.

### 4.1 Where the video files are hosted

**Phase 2: `public/media/hero/`.** Served by Vercel's CDN with immutable caching, no egress billing, no extra service. Simplest thing that works.

⚠ Caveat worth knowing: this commits ~4–6 MB of binary into git. Acceptable once; **not** something to repeat every time footage is re-cut. When original footage arrives, move to Supabase Storage or a video CDN and repoint the CMS field — which costs nothing, because the URL was always configurable. That is the point of doing it this way.

---

## 5. Replacing `lib/images.ts` without breaking 19 files

`lib/images.ts` is imported by **19 files** — every public page plus all four seed-content modules. Removing it is not an option mid-redesign.

**Approach: build the new registry alongside it, and turn `images.ts` into a thin re-export shim.**

```ts
// lib/images.ts  — after
/** @deprecated Import from @/lib/media/registry. Kept so 19 call sites keep working. */
export { legacyImg as img } from "./media/registry";
export { toOgImage, ogDefault } from "./media/registry";
```

Every existing `img.heroTrain` keeps resolving. Nothing breaks. Pages migrate to the typed registry as each phase touches them, and the shim is deleted in Phase 9 when the last importer is gone.

### 5.1 Assets being retired

These are in `lib/images.ts` today and are generic or not Sri Lanka. They will not appear in the new registry:

| Key | Used | Problem |
|---|---|---|
| `cityLights` | 3× | Generic night cityscape |
| `mountainLake` | — | Generic alpine lake |
| `forest` | — | Generic woodland |
| `greenMountains` | 1× | Generic |
| `lakeCanoe` | 1× | Generic |
| `sedanNight` | 1× | Generic car at night |

Each gets a verified Sri Lankan replacement, or the component gets a non-photographic treatment.

---

## 6. Authenticity — and a limitation I need to be straight about

You asked that an image labelled Sigiriya actually shows Sigiriya. I agree entirely, and I cannot verify it myself.

**I cannot see or fetch any of these images.** `images.unsplash.com`, `unsplash.com` and `images.pexels.com` are all network-blocked from my environment — I tested all three, and every one fails. The current URLs are opaque IDs like `photo-1546708973-b339540b5162`; nothing in that string tells me what it depicts, and I have no way to look.

So I will not claim to have verified any image. What I propose instead:

**A verification manifest — `MEDIA-ASSETS.md`** — one row per asset:

| Key | Claims to depict | Source URL | Licence | Verified |
|---|---|---|---|---|
| `sigiriya` | Sigiriya Rock, Cultural Triangle | unsplash.com/photos/… | Unsplash | ☐ |
| `templeKandy` | Temple of the Sacred Tooth, Kandy | … | Unsplash | ☐ |

**The workflow:** I select candidates and record what each claims to depict with its source link. **You tick the box.** You know Sri Lanka; I have never seen these photographs. An unticked row means the asset is not used in a location-specific context — it can still serve as atmospheric background where no place is claimed.

The `depicts` field on `MediaAsset` and the `verifiedLocation` boolean on provenance make this enforceable in code, not just documentation. A destination page can be made to **refuse** an asset whose `verifiedLocation` is false — a build-time guarantee rather than a promise.

**Highest-risk assets** — the ones making a specific place claim: `sigiriya`, `templeKandy`, `surfWave` (Arugam Bay), `beachPalms`, `beachAerial`, `leopard` (Yala), `elephants`, `mistyHills` (tea country), `heroTrain` (highland railway). These nine need your eyes before Phase 2 ships.

---

## 7. Licensing

Recorded per asset in the registry and mirrored in `MEDIA-ASSETS.md`:

- **Unsplash** — free commercial use, no attribution required. Attribution recorded anyway, because you will want to know what to replace.
- **Pexels** — same terms; the likeliest source for stock *video*.
- **Never hotlink stock video.** Self-host it. CDN hotlinking is fragile, frequently against terms, and gives you no control over caching.
- Every asset carries `provenance.kind: "stock"`, so a single grep answers "what is still temporary?"

---

## 8. The stock → original migration, concretely

```
TODAY          registry entry:  { kind: "stock", source: "Unsplash", verifiedLocation: true }
               hero settings:   /media/hero/hero-desktop.webm   (bundled)

LATER          upload originals → Supabase Storage
               change 3 CMS fields: hero_poster_url, hero_video_url, hero_video_mobile_url
               → hero updated, no deploy

               registry entries flip to { kind: "original", photographer, shotAt }
               → one file changed, no component touched

PHASE 6        `media` table + MediaPicker; registry rows migrate into it
               → component props unchanged, because they were always MediaAsset
```

At no point does a homepage component change. That is the requirement, and this is the mechanism that meets it.

---

## 9. EXACT files

### 9.1 New files (8)

| File | Purpose |
|---|---|
| `lib/media/types.ts` | `MediaAsset`, `VideoAsset`, `MediaProvenance` |
| `lib/media/registry.ts` | Typed asset registry with provenance + `legacyImg` shim export |
| `lib/media/hero.ts` | Resolves hero media: settings → registry → hard-coded defaults |
| `components/media/Img.tsx` | `next/image` wrapper consuming `MediaAsset`; focal point, blur, frame |
| `components/media/VideoHero.tsx` | The hero video client component — gates, pause control, fade-in |
| `public/media/hero/*` | Poster (AVIF + JPG) and video encodes |
| `MEDIA-ASSETS.md` | Verification manifest + licensing record |

### 9.2 Modified files (5)

| File | Change | Risk |
|---|---|---|
| `lib/images.ts` | Becomes a deprecated re-export shim. **All 19 importers keep working.** | Low |
| `lib/data.ts` | +10 hero keys in `defaultSettings` and `settingsKeyMap`. Additive only. | Low |
| `app/admin/(dashboard)/settings/page.tsx` | One new entry in the existing `groups` array. No logic change — `save()` already upserts `allKeys`. | Low |
| `next.config.mjs` | `remotePatterns`: keep Unsplash, add Pexels if used, **add the Supabase Storage hostname now** so Phase 6 can't break images | Low |
| `app/page.tsx` | Hero section uses `<VideoHero>` (part of the wider Phase 2 homepage work) | Medium |

**No database migration. No new table. No RLS change.**

### 9.3 Explicitly NOT touched

```
middleware.ts                      lib/actions.ts
lib/supabase/server.ts             lib/validation.ts
lib/supabase/client.ts             lib/email.ts
supabase/schema.sql                supabase/migrations/0001_updated_at.sql
app/admin/(dashboard)/bookings/*   app/admin/(dashboard)/inquiries/*
app/admin/(dashboard)/calendar/*   app/admin/login/page.tsx
lib/booking-ui.ts                  components/BookingForm.tsx
```

No authentication, booking, enquiry, email or database logic is modified.

---

## 10. Risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | **`remotePatterns` blocks a new host** → `next/image` returns 400 and the image silently vanishes | Add every host in the same commit as its first use. Add the Supabase hostname now, before it's needed. |
| 2 | Video hurts LCP | Poster is `next/image priority` and always the LCP element. Lighthouse run with video both enabled and disabled. |
| 3 | Double poster download | No `poster` attribute on `<video>`. The image layer *is* the poster. |
| 4 | Hydration mismatch — `VideoHero` is a client component making device decisions | Server renders poster only, always. Video mounts strictly post-hydration in an effect. Server and client agree on first paint by construction. |
| 5 | 4–6 MB of binary in git | Accept once for stock; move to Storage when originals land. URL was always configurable. |
| 6 | **A stock image misrepresents a location** | §6 manifest + your sign-off. `verifiedLocation` enforced in code for location-specific contexts. |
| 7 | Autoplay blocked by a browser | Gates + no audio track make this unlikely; if it happens the poster is already showing, so the failure is invisible. |
| 8 | Stock video looks like a tourism advert | §11 Q3 — a selection standard is needed before I choose anything. |

---

## 11. Before I write Phase 2 code, I need

**Q1 — Location verification.** Will you tick off the nine location-specific assets in `MEDIA-ASSETS.md`? I'll produce the manifest with candidates and source links first. **I cannot do this part; I have never seen these images and cannot fetch them.**

**Q2 — Hero video source.** Options, in the order I'd recommend:
- **(a)** I propose 3–5 candidate stock clips with links; you pick. *Recommended — you verify authenticity before anything ships.*
- **(b)** You supply a clip you've already chosen.
- **(c)** Ship poster-only in Phase 2; add video when you have originals. The architecture is identical either way — this only changes whether a `hero_video_url` value exists on day one.

**Q3 — Video selection standard.** You said originals should feel "documentary rather than generic tourism advertising." Should I apply that standard to the stock choice too — favouring observational footage (a real train, real light, unposed people) over polished drone-and-sunset reels? It narrows the pool considerably but keeps the brand register consistent. My view: yes, and accept a less "perfect" clip for it.

**Q4 — Mobile video.** Confirm: leave `hero_video_mobile_url` empty at launch (poster-only on phones), capability built and ready? Recommended.

**Q5 — The six retired assets** (§5.1). Replace each with verified Sri Lankan stock, or let me propose non-photographic treatments for those slots where a specific place isn't being claimed?

---

# 12. Approved decisions — 8 August 2026

| # | Decision | Applied |
|---|---|---|
| **1** | Location verification: manifest created; **I never mark an asset verified — you do** | `MEDIA-ASSETS.md` §1, §6 |
| **2** | Hero video: candidates proposed only. **I do not select or ship one.** You review the actual clips | `MEDIA-ASSETS.md` §2 |
| **3** | Documentary standard applies to stock too. Observational over drone spectacle | `MEDIA-ASSETS.md` §2 — ~60 aerial clips rejected as a category |
| **4** | `hero_video_mobile_url` empty at launch; capability fully built | §3.3 — unchanged, now confirmed |
| **5** | Retired assets: verified Sri Lankan stock only where genuinely needed; elegant non-photographic treatment otherwise; never generic filler | `MEDIA-ASSETS.md` §4 |

## 12.1 What the research changed

Two findings from actually searching the libraries, rather than assuming:

**The stock video library is ~95% drone footage.** Across ~80 results on two full search pages, I found five non-aerial candidates. Your Q3 standard disqualifies most of the free library as a category. This is not a sourcing effort problem — it is what exists.

**Pexels keyword matching barely filters by country.** "Sri Lanka train" returns 29,143 videos; "Arugam Bay beach" returns 80,000+ photos. Sri Lanka does not have 29,143 stock train videos. These searches return *any* train, *any* beach — meaning an asset can appear under "Arugam Bay" having been shot in Bali. **This is exactly the misrepresentation risk you asked me to prevent**, and it means only individually-checked assets can be trusted. Browsing by search term is actively unsafe here.

Consequence: I recommend **shipping Phase 2 with a poster-only hero** (`hero_video_url` left empty). The architecture is identical, video-ready from day one, and adding footage later is one CMS field. A single outstanding still at full bleed is a legitimate luxury choice — and it beats a drone clip that undercuts the standard you just set. Your call; §3 of `MEDIA-ASSETS.md` lays out all three options.

## 12.2 Also worth knowing

Pexels now mixes **AI-generated clips** into search results (`content.pexels.com/aigc-bundle/`, promoted via Canva). None are in my candidate list and none ever should be — an AI-generated "Sri Lanka" is a fabricated place, which fails your authenticity rule at the most basic level. I'll add a lint rule blocking that hostname if useful.

---

# 13. Final Phase 2 file-change list — media & hero only

The wider Phase 2 homepage work (sections 02–09) is specified in `REDESIGN-PROPOSAL.md` §C. This list covers **only** the media architecture and hero.

## 13.1 New files (7)

| File | Purpose | Depends on your input? |
|---|---|---|
| `lib/media/types.ts` | `MediaAsset`, `VideoAsset`, `MediaProvenance` | No |
| `lib/media/registry.ts` | Typed asset registry + `legacyImg` compatibility export | **Yes** — only verified assets enter it |
| `lib/media/hero.ts` | Resolves hero media: settings → registry → hard-coded defaults | No |
| `components/media/Img.tsx` | `next/image` wrapper taking `MediaAsset`; focal point, blur, frame | No |
| `components/media/VideoHero.tsx` | Hero client component — load gates, pause control, opacity fade | No |
| `public/media/hero/hero-poster.{avif,jpg}` | Poster image | **Yes** — needs a verified photo |
| `public/media/hero/hero-desktop.{webm,mp4}` | Video encodes — **only if you choose option B or C** | **Yes** |

## 13.2 Modified files (5)

| File | Change | Risk |
|---|---|---|
| `lib/images.ts` | Becomes a deprecated re-export shim. **All 19 importers keep working untouched** | Low |
| `lib/data.ts` | +10 hero keys in `defaultSettings` and `settingsKeyMap`. Purely additive | Low |
| `app/admin/(dashboard)/settings/page.tsx` | One new group in the existing `groups` array. No logic change — `save()` already upserts `allKeys` | Low |
| `next.config.mjs` | `remotePatterns`: keep Unsplash, add Pexels, **add the Supabase Storage hostname now** so Phase 6 cannot break images | Low |
| `app/page.tsx` | Hero uses `<VideoHero>` (part of the wider Phase 2 homepage rebuild) | Medium |

**No database migration. No new table. No RLS change. No package installs.**

## 13.3 Not touched — confirmed

```
middleware.ts                      lib/actions.ts
lib/supabase/server.ts             lib/validation.ts
lib/supabase/client.ts             lib/email.ts
supabase/schema.sql                supabase/migrations/0001_updated_at.sql
app/admin/(dashboard)/bookings/*   app/admin/(dashboard)/inquiries/*
app/admin/(dashboard)/calendar/*   app/admin/login/page.tsx
lib/booking-ui.ts                  components/BookingForm.tsx
```

No authentication, booking, enquiry, email or database logic is modified.

---

# 14. Remaining blockers

| # | Blocker | Blocks | Needs |
|---|---|---|---|
| **B1** | **Zero of 9 location images verified** | Any location-specific imagery in Phase 2 | You tick `MEDIA-ASSETS.md` §1 |
| **B2** | **5 of 14 image slots have no candidate** — Arugam Bay, Yala leopard, tea country, elephants, highland train | Those slots specifically | Another research pass, or you supply candidates |
| **B3** | **Hero video approach undecided (A / B / C)** | Whether `hero_video_url` ships populated | Your choice. I recommend **A** |
| **B4** | **No hero poster image chosen** | The hero itself — the poster is required, the video is not | One verified full-bleed photo |

**B4 is the true blocker.** The video is optional by design; the poster is not. Everything else in Phase 2 — component library, layout, all nine sections — can proceed while images are being verified, because components take `MediaAsset` objects and are indifferent to what's inside them.

## 14.1 Risks arising from the research

| # | Risk | Mitigation |
|---|---|---|
| R1 | An asset is used for a location it doesn't show | Human verification + `verifiedLocation` enforced in code |
| R2 | Sigiriya / Pidurangala confusion — Pidurangala is the rock people climb *to photograph* Sigiriya, and it's a very common stock mislabelling | Called out explicitly in the manifest; both rows flagged for your attention |
| R3 | African leopard or African elephant used for Yala / Minneriya | Flagged as the two highest-embarrassment slots. **Ship with no photo rather than a plausible wrong one** |
| R4 | AI-generated clip enters the site | Never sourced; optional lint rule on the `aigc-bundle` hostname |
| R5 | Drone-heavy hero contradicts the brand standard just set | Option A avoids it entirely |

---

---

# 15. FINAL DECISIONS — 8 August 2026

| # | Decision | Effect |
|---|---|---|
| **1** | **No stock hero video in Phase 2.** `hero_video_url` empty | Video-ready architecture built in full; the field is simply unset |
| **2** | **Still-image hero, verified before use.** No unverified image ships | 8 candidates shortlisted (`MEDIA-ASSETS.md` §0); none selected by me |
| **3** | **Location images stay UNVERIFIED until you approve each** | Unverified assets cannot render on destination pages — enforced in code |
| **4** | **A missing poster must not change the architecture** | Placeholder allowed in local dev only; **fails the production build** |
| **5** | No application code until approval | Nothing modified; repo still at `d96c56a` |

## 15.1 How "no unverified content in production" is enforced

Not by discipline — by the type system and the build.

```ts
// lib/media/types.ts
export type MediaProvenance =
  | { kind: "stock";       source: string; url: string; license: string;
                           verifiedLocation: boolean }
  | { kind: "original";    photographer?: string; shotAt?: string }
  | { kind: "cms" }
  | { kind: "placeholder"; note: string };   // dev only
```

Three guarantees:

1. **`alt` is required, not optional.** An asset without alt text fails typecheck.
2. **`lib/media/registry.ts` throws at module load** if any `placeholder` asset is present while `NODE_ENV === "production"`. A forgotten placeholder breaks the build rather than reaching a visitor.
3. **Location-specific slots require `verifiedLocation: true`.** A destination page cannot render an unverified asset — it renders the non-photographic treatment instead.

You asked that unverified images never ship. This makes that structurally true rather than a promise I have to keep remembering.

---

# 16. FINAL PHASE 2 SCOPE

Two workstreams. The media one is fully specified; the homepage one is specified in `REDESIGN-PROPOSAL.md` §C.

## 16.1 Media architecture — no blockers, can start immediately

| Item | Blocked by content? |
|---|---|
| `MediaAsset` / `VideoAsset` / `MediaProvenance` types | No |
| `<Img>` component — focal point, blur, frame | No |
| `<VideoHero>` — gates, pause control, fade, mobile path | No |
| Hero resolution chain: settings → registry → defaults | No |
| 10 `site_settings` keys + admin group | No |
| `lib/images.ts` → compatibility shim | No |
| `remotePatterns` update | No |
| Registry **structure** | No |
| Registry **contents** | **Yes — needs your verification** |

**The entire architecture can be built and tested before a single image is approved.** That is the point of the `MediaAsset` contract: components are indifferent to what's inside the object.

## 16.2 Homepage — sections 01–09

Buildable now with placeholder or non-photographic treatment in every image slot; each upgrades to a real photograph as you verify one, with no code change.

## 16.3 Explicitly out of scope for Phase 2

`media` database table · Supabase Storage · admin MediaPicker (all Phase 6) · destination, experience and tour pages (Phases 3–5) · any auth, booking, enquiry, email or schema change.

---

# 17. EXACT FILES — Phase 2

## 17.1 New (11)

| File | Purpose |
|---|---|
| `lib/media/types.ts` | Media contracts |
| `lib/media/registry.ts` | Typed registry + production placeholder guard + `legacyImg` shim |
| `lib/media/hero.ts` | Hero resolution chain |
| `components/media/Img.tsx` | `MediaAsset`-aware image |
| `components/media/VideoHero.tsx` | Video-ready hero (ships poster-only) |
| `components/media/GradientPanel.tsx` | Non-photographic treatment for unverified slots |
| `components/patterns/IslandMap.tsx` | Homepage §02 |
| `components/patterns/FleetStrip.tsx` | Homepage §05 |
| `components/patterns/GuideFeature.tsx` | Homepage §06 |
| `components/patterns/JourneyStory.tsx` | Homepage §07 |
| `components/patterns/PlannerEntry.tsx` | Homepage §09 |

*(The wider design-system files land in Phase 1; this list is Phase 2 only.)*

## 17.2 Modified (5)

| File | Change | Risk |
|---|---|---|
| `lib/images.ts` | Deprecated re-export shim. **All 19 importers keep working untouched** | Low |
| `lib/data.ts` | +10 hero keys in `defaultSettings` / `settingsKeyMap`. Additive only | Low |
| `app/admin/(dashboard)/settings/page.tsx` | One new group in the existing `groups` array. `save()` already upserts `allKeys` — no logic change | Low |
| `next.config.mjs` | `remotePatterns`: keep Unsplash, add Pexels, add Supabase Storage hostname now | Low |
| `app/page.tsx` | Full homepage rebuild, sections 01–09 | Medium |

## 17.3 Not touched — confirmed again

```
middleware.ts                      lib/actions.ts
lib/supabase/server.ts             lib/validation.ts
lib/supabase/client.ts             lib/email.ts
supabase/schema.sql                supabase/migrations/0001_updated_at.sql
app/admin/(dashboard)/bookings/*   app/admin/(dashboard)/inquiries/*
app/admin/(dashboard)/calendar/*   app/admin/login/page.tsx
lib/booking-ui.ts                  components/BookingForm.tsx
```

**No migration. No new table. No RLS change. No package installs. No auth, booking, enquiry, email or database logic touched.**

---

# 18. REMAINING BLOCKERS

| # | Blocker | Blocks | Resolution |
|---|---|---|---|
| **B1** | **Hero poster not chosen or verified** | Production hero *only* | Verify one of `MEDIA-ASSETS.md` §0. **Does not block architecture** |
| **B2** | 0 of 9 location images verified | Destination imagery (Phase 3, not 2) | Your verification pass |
| **B3** | 5 image slots have no candidate — Arugam Bay, Yala leopard, tea country, elephants, highland train | Those slots | Another research pass, or you supply |
| ~~B4~~ | ~~Hero video approach~~ | — | ✅ **Resolved: none in Phase 2** |

**Nothing blocks the start of Phase 2.** B1 blocks only the final production hero image, and §15.1 guarantees an unverified one cannot ship by accident.

## 18.1 Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | Placeholder reaches production | Build fails on `kind: "placeholder"` in production |
| R2 | Unverified image used for a location claim | `verifiedLocation` required; falls back to `GradientPanel` |
| R3 | Chosen poster is technically unusable — wrong aspect, no quiet zone for type, too dark under the scrim | Verify against §0.1 composition requirements, not just authenticity. **Check the crop before approving** |
| R4 | Sigiriya / Pidurangala mislabelling | Flagged explicitly in the manifest |
| R5 | African leopard or elephant on a Sri Lankan page | Ship no photo rather than a plausible wrong one |
| R6 | AI-generated asset | Never sourced; optional lint on the `aigc-bundle` hostname |

---

**No code written. No files modified. Repo at `d96c56a`, working tree clean.**

**Awaiting: your approval to begin Phase 2, and — separately, not blocking — your verification pass on the hero poster shortlist.**
