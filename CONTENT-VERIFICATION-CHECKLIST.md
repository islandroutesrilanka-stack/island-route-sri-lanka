# Content Verification Checklist

**Baseline:** commit `6aedb1d`, branch `main`. Build 47/47, typecheck clean.
**Status:** checklist only. **No files modified. No web research performed. No copy rewritten.**

---

## Before you start — two things this pass changed

**1. The earlier audits under-counted.** `PHASE-3-DESTINATIONS-AUDIT.md` scoped only `lib/destinations.ts` and the destinations pages. Sweeping the whole content layer for this checklist surfaced **9 further superlative claims** in `lib/tours.ts`, `lib/blog.ts` and `lib/content.ts` that were never catalogued — including "Asia's largest elephant gathering" and a second copy of the Yala leopard claim. They are marked **★ NEW** below.

**2. The Nuwara Eliya discrepancy is three-way, not two-way.** A third figure exists in `lib/experiences.ts`.

**Verification legend:** ⛔ blocks Phase 4 · ⚠️ should precede public launch · ○ can follow Phase 4

---

# 1. Tier-1 destination claims

*Superlatives and comparatives stated as fact. Each needs a citable source, or softening to a defensible form, or removal. I am not proposing which — that is your call.*

### 1.1 "the densest leopard population on Earth"
- **Where:** `lib/destinations.ts:70` (Yala) — **and a second copy** at `lib/tours.ts:265` ("The world's densest leopard population") ★ NEW
- **Why:** A global scientific ranking, stated flatly. The most challengeable sentence on the site, and the most likely to be noticed by a wildlife-literate customer.
- **Evidence that would count:** A peer-reviewed density study or a Department of Wildlife Conservation publication giving leopards/km² for Yala Block 1 *and* a comparative figure for other ranges. A tourism-board page repeating the claim is **not** evidence.
- **Note:** Whatever you decide must be applied to **both** locations, or the site will contradict itself.
- **Blocks Phase 4:** ⚠️

### 1.2 "the world's prettiest railway" / "the most beautiful stretch of track in Asia"
- **Where:** `lib/destinations.ts:44` (headline) and `:46` (description). Related: `lib/tours.ts:60` "the world's most beautiful train ride" ★ NEW, `lib/tours.ts:111` "the island's most famous train ride" ★ NEW
- **Why:** Aesthetic superlatives, unfalsifiable. Lower legal risk than a scientific claim but they read as fact and there are now **four variants** of the same idea across the codebase.
- **Evidence:** Attribution to a named publication ("*rated by X as…*") converts opinion into a citable fact. Otherwise reframe as the brand's own view.
- **Blocks Phase 4:** ○

### 1.3 "One of the world's great right-hand point breaks"
- **Where:** `lib/destinations.ts:104` (Arugam Bay headline)
- **Why:** Global ranking. Hedged by "one of", which materially lowers the risk.
- **Evidence:** Surf-media ranking or a competition listing (e.g. a recognised world-tour or qualifying-series event held there).
- **Blocks Phase 4:** ○

### 1.4 "Few places on Earth pack this much variety into a drivable week"
- **Where:** `app/destinations/page.tsx:47`
- **Why:** The broadest claim on the site — a comparison against the whole planet, in the destinations hero.
- **Evidence:** Realistically none. This is a brand assertion. The practical options are to keep it as evident opinion, or reframe.
- **Blocks Phase 4:** ○

### 1.5 "a dinner scene that now rivals any city in South Asia"
- **Where:** `lib/destinations.ts:118` (Colombo)
- **Why:** Regional comparative naming a peer group that includes Mumbai, Delhi and Bangkok-adjacent markets.
- **Evidence:** Awards, a Michelin/50 Best presence, or credible food-media coverage.
- **Blocks Phase 4:** ○

### 1.6 "the biggest animals that have ever lived"
- **Where:** `lib/destinations.ts:94` (Mirissa, of blue whales)
- **Why:** A palaeontological claim. Almost certainly correct and trivially sourceable — but currently unsourced like everything else.
- **Evidence:** Any major natural-history reference.
- **Blocks Phase 4:** ○ *(lowest risk in this group)*

### 1.7 "Sri Lanka's single most extraordinary sight"
- **Where:** `lib/destinations.ts:22` (Sigiriya)
- **Why:** National superlative, subjective. Also sits next to two datable facts — see 6.1.
- **Evidence:** Opinion; reframe or attribute.
- **Blocks Phase 4:** ○

### 1.8 "Sri Lanka's highest town"
- **Where:** `lib/destinations.ts:58` (Nuwara Eliya)
- **Why:** A checkable national fact, unlike the rest of this group. Either right or wrong.
- **Evidence:** Survey Department of Sri Lanka, or a gazetteer listing settlement elevations. **Verify alongside item 3** — same source likely settles both.
- **Blocks Phase 4:** ○

### 1.9 ★ NEW — "Asia's largest elephant gathering" / "one of Asia's greatest wildlife spectacles"
- **Where:** `lib/tours.ts:285` and `lib/tours.ts:283` (Minneriya)
- **Why:** **Not in any previous audit.** A continental superlative of the same class as 1.1, stated twice in one tour. Also carries a seasonal window ("Aug–Oct") that is an operational claim in its own right.
- **Evidence:** Wildlife authority or peer-reviewed counts of the Minneriya congregation, plus a comparative figure for other Asian gatherings.
- **Blocks Phase 4:** ⚠️

### 1.10 ★ NEW — Journal superlatives
- **Where:** `lib/blog.ts:27` "the world's best odds of a wild leopard sighting" · `lib/blog.ts:58` "Wilpattu, Sri Lanka's largest park" · `lib/blog.ts:73` "the island's best place to learn to surf" · `lib/tours.ts:41` "The island's greatest hits"
- **Why:** Same class as Tier 1 but in journal and tour copy, so never audited. `blog.ts:58` is a **checkable fact** (largest national park); the others are opinion.
- **Evidence:** For Wilpattu — Department of Wildlife Conservation park areas. Others — attribution or reframing.
- **Blocks Phase 4:** ○

---

# 2. Business / service claims

*These need your yes/no, not research. You are the source.*

| # | Claim | Where | Why it matters | Evidence | Blocks |
|---|---|---|---|---|---|
| 2.1 | "we arrange private jeeps **only**" | `lib/destinations.ts:70` | Absolute operational promise. If any booking ever uses a shared jeep, this is a misdescription a customer can act on. | Your confirmation of current practice | ⛔ |
| 2.2 | "Private jeep — never shared" ★ NEW | `lib/tours.ts:267` | Same promise, second location. Must match 2.1. | Same | ⛔ |
| 2.3 | "Most of our routes link four or five of these destinations" | `app/destinations/page.tsx:62` | Quantified claim about your own itineraries. | Your itinerary records | ⚠️ |
| 2.4 | "Routes we've **refined over years**" | `app/page.tsx:237` | Implies operating history. Same class as the "10+ years" figure already removed in Phase 0. | Company registration date / trading history | ⚠️ |
| 2.5 | "Our chauffeur-guides are **licensed guides** who drive" | `components/patterns/GuideFeature.tsx:35` | **Credential claim about named individuals.** SLTDA guide licensing is a real, checkable qualification. | Licence numbers for the guides you actually deploy | ⛔ |
| 2.6 | "**Licensed** Sri Lankan tour operator · **Fully insured** fleet" | `components/Footer.tsx:87` | Regulatory + insurance claim, sitewide on every page. Outstanding since Phase 0. | SLTDA operator registration number; fleet insurance certificate | ⛔ |
| 2.7 | "fully insured, air-conditioned fleet" / "late-model, **meticulously maintained**, fully insured" | `app/fleet/page.tsx:16` and `:27` | Repeats the insurance claim; "late-model" is checkable against your actual vehicles. | Insurance certificate + vehicle registration years | ⚠️ |

**The three ⛔ items (2.1, 2.2, 2.5, 2.6) are the only things on this entire checklist that I would genuinely hold Phase 4 for** — not because they are hard, but because they are one-line answers from you and they carry consumer-protection weight if wrong.

---

# 3. Nuwara Eliya / hill-country elevation — **three-way conflict**

| Figure | Where | Refers to |
|---|---|---|
| **"two thousand metres up"** | `lib/destinations.ts:56` | Nuwara Eliya |
| **"1,900 metres"** | `lib/blog.ts:44` | Nuwara Eliya |
| **"fifteen hundred metres"** ★ NEW | `lib/experiences.ts:75` | "Tea country" (broader area) |

- **Why:** The first two describe the same town and cannot both be right. The third may be legitimately different — tea country spans a range of elevations — but it should be confirmed rather than assumed compatible.
- **Evidence:** Survey Department of Sri Lanka elevation, or a standard gazetteer. One authoritative source resolves this **and** item 1.8.
- **Instruction honoured:** I have not chosen between them and have not altered the wording.
- **Blocks Phase 4:** ○ — but it is the cheapest item here to close, and it currently makes the site visibly contradict itself.

---

# 4. Destination photography verification

- **Current state:** **0 of 9 verified.** All carry `verifiedLocation: false`.
- **Where:** `lib/media/registry.ts`; sign-off sheet in `MEDIA-ASSETS.md` §1.
- **Rendering:** ✅ Already safe. `DestinationCard` and the detail hero gate on `requireVerifiedLocation`; OG metadata gates via `toVerifiedOgImage`. **No unverified image can display or be shared as a place.** Every destination currently renders the contour treatment.
- **Why it still matters:** The site has **no destination photography at all** until this is done. That is honest but visually thin, and it is the main thing standing between the current build and a finished luxury site.
- **Evidence that would count:** You open each Pexels/Unsplash source page and confirm the image shows the place claimed. **I cannot do this** — image hosts are unreachable from my environment and I have never seen these files.
- **Highest-risk slots:** Sigiriya (commonly mislabelled — Pidurangala is the rock people climb *to photograph* Sigiriya), Yala leopard (African leopards dominate stock), elephants (African vs Asian species are visibly different), Arugam Bay (no specific candidate found).
- **Blocks Phase 4:** ○ technically — ⚠️ practically, if Phase 4 involves visual work.

---

# 5. Hero poster / video decision

| Field | Value | Decision |
|---|---|---|
| `hero_poster_url` | *empty* | ⏳ 8 candidates shortlisted in `MEDIA-ASSETS.md` §0; **none selected, none verified** |
| `hero_video_url` | *empty* | ✅ Settled — no stock video ships |
| `hero_video_mobile_url` | *empty* | ✅ Settled — mobile uses poster |

- **Why:** The homepage hero is the primary brand impression and is currently an abstract gradient. Architecture is video-ready; only the asset decision is outstanding.
- **Evidence:** Confirm one candidate depicts Sri Lanka **and** works compositionally — landscape, ≥2400px, a quiet lower-left for the headline, and tolerant of the dark green scrim. An image can be authentic and still unusable.
- **My recommendation on file:** H1, Meemure paddy fields — names a specific real place, so verification is tractable.
- **Blocks Phase 4:** ○

---

# 6. Other unresolved content issues

### 6.1 Undated historical and measurement claims
`lib/destinations.ts:22` "two hundred metres" + "5th-century" + "fifteen centuries ago" (Sigiriya) · `:80` "17th-century Dutch fort" (Galle) · also `lib/blog.ts:28` and `lib/tours.ts:244` ★ NEW — the 17th-century claim appears **three times**. · `lib/blog.ts:71` "80 kilometres of coastline east of Galle" ★ NEW · `lib/destinations.ts:106` "Main Point peels for hundreds of metres".
**Why:** Wrong numbers are the easiest error for a knowledgeable reader to catch, and the 17th-century figure must be consistent across all three locations. **Evidence:** UNESCO/Department of Archaeology for dates; map measurement for distances. **Blocks:** ○

### 6.2 Seasonal and operational claims
Every `bestTime` field · "park may close Sep–Oct" (Yala) · "blue whales… November to April" · "Esala Perahera in Jul/Aug" · "Asia's largest elephant gathering (Aug–Oct)".
**Why:** These are the claims that **cost a traveller money if wrong** — someone books a whale trip in June on your say-so. Lower reputational risk than a superlative, higher practical risk. **Evidence:** Your operational experience is a legitimate source here. **Blocks:** ⚠️

### 6.3 Reviews — still zero
No verified reviews exist. Homepage §07 quote block and the `/reviews` page correctly render empty states. Phase 0 removed 8 fabricated testimonials. **Outstanding:** ⚠ confirm whether those 8 were ever seeded into your **live Supabase** — if `seed.sql` was run, they may still be in the `reviews` table and rendering, regardless of the source change. Check: `select name, country from public.reviews;`
**Blocks:** ⛔ *if they are live* — fabricated named consumer reviews are the highest-liability item in this document.

### 6.4 Guide content absent
`featured_guide_*` settings empty, so §06 renders its no-guide fallback. Correct behaviour, but the strongest differentiator on the site is invisible. **Needs:** one real guide — photo, name, years driving, languages, two sentences in their own voice. **Blocks:** ○

### 6.5 `mistyHills` on the destinations index hero
`app/destinations/page.tsx:50` — unverified stock, but `alt=""` and `aria-hidden`, so it makes no place claim. **Blocks:** ○

### 6.6 "Nine islands in one" coupled to a count of nine
`app/destinations/page.tsx` — authored metaphor, deliberately not array-driven. Goes stale if the destination count changes. **Blocks:** ○

---

# Recommended verification order

**Step 1 — Check your database first (10 minutes, potentially the highest-stakes item).**
Run `select name, country from public.reviews;` against live Supabase (§6.3). If the eight fabricated names are there, everything else waits. This is the only item with real legal exposure.

**Step 2 — Answer the four ⛔ business claims from your own knowledge (30 minutes, no research).**
2.1 + 2.2 (private jeeps — must agree), 2.5 (guide licensing), 2.6 (operator licence + insurance). You are the source; no external lookup needed. These are the only genuine Phase 4 blockers.

**Step 3 — Settle the elevation figures (one lookup, closes three items).**
§3 plus 1.8. A single authoritative source resolves the two-way contradiction, the third figure, and "Sri Lanka's highest town". Best effort-to-value ratio on the list.

**Step 4 — Decide the two hardest superlatives (1.1 and 1.9).**
Yala leopard density and Minneriya elephant gathering. Both appear **twice** in the codebase, both are scientific rankings, and both need the same decision applied consistently. Do these together.

**Step 5 — Verify the hero poster (§5).**
Unlocks the biggest visible improvement available. Check composition, not just authenticity.

**Step 6 — Work through the 9 destination images (§4).**
Longest task. Start with Sigiriya, Yala and the elephants — the three where a wrong image would be most obvious to a Sri Lankan customer.

**Step 7 — Sweep the remaining superlatives and dates (1.2–1.7, 1.10, 6.1) in one editorial pass.**
Once you have decided your general stance in step 4 — cite, attribute, soften, or cut — the rest follow the same rule and can be handled in one sitting rather than argued individually.

**Step 8 — Confirm seasonal claims from operating experience (§6.2), then supply guide content (§6.4).**

---

**Summary: 4 items block Phase 4 outright (2.1, 2.2, 2.5, 2.6), 1 conditionally (6.3 if reviews are live in the database). Everything else can proceed in parallel with Phase 4 work.**

*No files modified. No web research performed. No copy rewritten. Phase 4 not started.*
