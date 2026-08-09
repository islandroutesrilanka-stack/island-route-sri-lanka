# Phase 3 — Destinations content & data audit

**Date:** 9 August 2026 · **No code modified.**
**Scope:** `lib/destinations.ts`, `app/destinations/page.tsx`, `app/destinations/[slug]/page.tsx` and their data dependencies.

---

## Note on the "VERIFIED" category

**Nothing in this project can currently be marked VERIFIED.** There is no sources file, no citations, no provenance record for any factual statement — the media registry tracks image provenance, but no equivalent exists for copy. So the honest result is that every factual claim below is **UNVERIFIED** or **NEEDS REVIEW**, and none is *disproven*. Most are probably accurate. I have not guessed at which.

I have not rewritten a single word.

---

# A. Destination content audit table

### 1. Sigiriya — *Cultural Triangle* — `/destinations/sigiriya`

> "Rising two hundred metres above jungle canopy, the Lion Rock is Sri Lanka's single most extraordinary sight — a 5th-century royal citadel of frescoes, mirror walls and water gardens. Base yourself here for Dambulla's cave temples, Minneriya's elephants and slow village life among the paddies."

| Claim | Type | Status |
|---|---|---|
| "Rising two hundred metres" | Geographic measurement | **UNVERIFIED** |
| "5th-century royal citadel" | Historical date | **UNVERIFIED** |
| "painted fifteen centuries ago" (headline) | Historical date | **UNVERIFIED** |
| "Sri Lanka's single most extraordinary sight" | Superlative | **NEEDS REVIEW** — reads as fact |
| "frescoes, mirror walls and water gardens" | Descriptive/factual | **UNVERIFIED** |
| "Dambulla's cave temples", "Minneriya's elephants", "Pidurangala sunrise viewpoint" | Geographic | **UNVERIFIED** |
| "Year-round · driest Jan–Sep" | Climate | **UNVERIFIED** |

### 2. Kandy — *Hill Capital* — `/destinations/kandy`

> "Home to the Temple of the Sacred Tooth Relic and gateway to the highlands, Kandy blends devotion, colonial architecture and misty hills. Time your visit for evening puja at the temple, then lose an afternoon in the Peradeniya Royal Botanical Gardens."

| Claim | Type | Status |
|---|---|---|
| "the last royal city" (headline) | Historical | **UNVERIFIED** |
| "Home to the Temple of the Sacred Tooth Relic" | Cultural/geographic | **UNVERIFIED** |
| "Peradeniya Royal Botanical Gardens" | Geographic | **UNVERIFIED** |
| "evening puja" | Cultural practice + timing | **UNVERIFIED** |
| "Esala Perahera in Jul/Aug" | Festival timing | **UNVERIFIED** |
| "Highland railway departure point" | Practical | **UNVERIFIED** |
| "gateway to the highlands" | Positioning | **NEEDS REVIEW** |
| **Region "Hill Capital"** | — | ⚠ **INCONSISTENT** — see §C1 |

### 3. Ella — *Hill Country* — `/destinations/ella`

> "A laid-back mountain village strung between two peaks, Ella is hiking trails at dawn, café culture by noon and train-spotting at the Nine Arch Bridge in between. The Kandy–Ella railway finale is the most beautiful stretch of track in Asia."

| Claim | Type | Status |
|---|---|---|
| **"the world's prettiest railway"** (headline) | Global superlative | **NEEDS REVIEW — high risk** |
| **"the most beautiful stretch of track in Asia"** | Continental superlative | **NEEDS REVIEW — high risk** |
| "strung between two peaks" | Geographic | **UNVERIFIED** |
| "Nine Arch Bridge", "Little Adam's Peak", "Ella Rock", "Rawana Falls" | Geographic | **UNVERIFIED** |
| "Jan–Sep" | Climate | **UNVERIFIED** |

### 4. Nuwara Eliya — *Tea Country* — `/destinations/nuwara-eliya`

> "Rose gardens, Tudor cottages and lake mists — Sri Lanka's highest town is the heart of Ceylon tea country. Tour a working factory, sip single-estate brews where they're grown, and hike the otherworldly Horton Plains plateau to World's End."

| Claim | Type | Status |
|---|---|---|
| **"two thousand metres up"** (headline) | Elevation | ⚠ **CONTRADICTS OWN CONTENT — §C2** |
| **"Sri Lanka's highest town"** | National superlative | **NEEDS REVIEW** |
| "Little England" (headline) | Nickname | **NEEDS REVIEW** |
| "heart of Ceylon tea country" | Positioning | **NEEDS REVIEW** |
| "Tudor cottages", "Rose gardens" | Descriptive | **UNVERIFIED** |
| "Horton Plains plateau to World's End", "Ramboda & Devon Falls", "Gregory Lake" | Geographic | **UNVERIFIED** |
| "Feb–May · Apr 'season' festivities" | Seasonal/cultural | **UNVERIFIED** |

### 5. Yala — *Deep South* — `/destinations/yala`

> "Yala National Park holds the densest leopard population on Earth, sharing its lagoons and rock outcrops with elephants, sloth bears, crocodiles and painted storks. Dawn drives give the best light and sightings; we arrange private jeeps only."

| Claim | Type | Status |
|---|---|---|
| **"the densest leopard population on Earth"** | Global scientific claim | **NEEDS REVIEW — highest risk on the site** |
| "elephants, sloth bears, crocodiles and painted storks" | Wildlife | **UNVERIFIED** |
| "park may close Sep–Oct" | Operational | **UNVERIFIED** — practical consequence if wrong |
| "Dawn drives give the best light and sightings" | Comparative | **NEEDS REVIEW** |
| **"we arrange private jeeps only"** | **Business claim** | ⚠ **Needs your confirmation** |
| "Bundala birdlife nearby" | Geographic | **UNVERIFIED** |
| **Region "Deep South"** | — | ⚠ **INCONSISTENT** — §C1 |

### 6. Galle — *South Coast* — `/destinations/galle`

> "Inside Galle Fort's ramparts, cinnamon-scented lanes hide boutique hotels, galleries and rooftop bars. Beyond the walls: stilt fishermen, turtle beaches, and jungle-backed bays like Unawatuna and Dalawella with its famous palm swing."

| Claim | Type | Status |
|---|---|---|
| "A 17th-century Dutch fort" (headline) | Historical date + attribution | **UNVERIFIED** |
| "stilt fishermen", "turtle beaches" | Cultural/wildlife | **UNVERIFIED** |
| "Dalawella with its famous palm swing" | Geographic + "famous" | **NEEDS REVIEW** |
| "cinnamon-scented lanes" | Evocative | **NEEDS REVIEW** — sensory, reads as descriptive |
| "Koggala stilt fishermen", "Unawatuna & Jungle Beach" | Geographic | **UNVERIFIED** |
| "Nov–Apr" | Climate | **UNVERIFIED** |

### 7. Mirissa — *South Coast* — `/destinations/mirissa`

> "A crescent of golden sand famous for the biggest animals that have ever lived — blue whales cruise offshore from November to April. Add Coconut Tree Hill at sunrise, snorkelling with turtles, and some of the island's best seafood."

| Claim | Type | Status |
|---|---|---|
| **"the biggest animals that have ever lived"** | Scientific superlative | **UNVERIFIED** |
| "blue whales cruise offshore from November to April" | Wildlife seasonality | **UNVERIFIED** |
| "some of the island's best seafood" | Comparative | **NEEDS REVIEW** |
| "Coconut Tree Hill", "Secret Beach coves" | Geographic | **UNVERIFIED** |
| "snorkelling with turtles" | Wildlife | **UNVERIFIED** |

### 8. Arugam Bay — *East Coast* — `/destinations/arugam-bay`

> "From May to September the east coast wakes up: Main Point peels for hundreds of metres, and a barefoot village of surf camps and juice bars hums beneath the palms. Rest days mean lagoon safaris, Kumana's wild elephants and empty golden beaches."

| Claim | Type | Status |
|---|---|---|
| **"One of the world's great right-hand point breaks"** (headline) | Global superlative | **NEEDS REVIEW — high risk** |
| "Main Point peels for hundreds of metres" | Measurable | **UNVERIFIED** |
| "From May to September the east coast wakes up" | Seasonal | **UNVERIFIED** |
| "Kumana's wild elephants" | Wildlife | **UNVERIFIED** |
| "Main Point & Whiskey Point", "Peanut Farm & Elephant Rock", "Pottuvil lagoon safari" | Geographic | **UNVERIFIED** |

### 9. Colombo — *Western Capital* — `/destinations/colombo`

> "Most journeys begin or end in the capital — give it a day. Colonial-era Fort and Pettah's bazaars, Gangaramaya Temple, Galle Face Green at sunset, and a dinner scene that now rivals any city in South Asia."

| Claim | Type | Status |
|---|---|---|
| **"a dinner scene that now rivals any city in South Asia"** | Regional comparative | **NEEDS REVIEW — high risk** |
| "fast-rising food scene" (headline) | Trend claim | **NEEDS REVIEW** |
| "Colonial-era Fort and Pettah's bazaars" | Historical/geographic | **UNVERIFIED** |
| "Gangaramaya Temple", "Galle Face Green", "Independence Square" | Geographic | **UNVERIFIED** |
| **Region "Western Capital"** | — | ⚠ **INCONSISTENT** — §C1 |
| **Image** | — | ✅ Now empty; renders contour treatment |

### Index page copy — `app/destinations/page.tsx`

| Claim | Location | Status |
|---|---|---|
| **"Few places on Earth pack this much variety into a drivable week"** | `intro`, line 23 | **NEEDS REVIEW — flagged as you asked.** A global comparative about the whole planet, stated as fact. It is the single broadest claim on the page. **Not changed.** |
| "Nine islands in one" | `title` | Metaphor — acceptable, but **hard-coupled to the count of 9**; goes stale the moment a destination is added |
| Meta description names all nine destinations | line 11 | Same staleness coupling |
| "Most of our routes link four or five of these destinations" | `CTABand` | **Business claim** — needs your confirmation |

---

# B. Unverified claims — priority order

**Tier 1 — global/scientific superlatives stated as fact.** These are the ones a competitor, regulator or knowledgeable customer could challenge:

1. "the densest leopard population on Earth" (Yala)
2. "the world's prettiest railway" + "most beautiful stretch of track in Asia" (Ella)
3. "One of the world's great right-hand point breaks" (Arugam Bay)
4. "Few places on Earth pack this much variety into a drivable week" (index hero)
5. "a dinner scene that now rivals any city in South Asia" (Colombo)
6. "the biggest animals that have ever lived" (Mirissa)
7. "Sri Lanka's single most extraordinary sight" (Sigiriya)
8. "Sri Lanka's highest town" (Nuwara Eliya)

**Tier 2 — specific measurements and dates.** Wrong numbers are the easiest thing to catch: "two hundred metres", "two thousand metres", "5th-century", "fifteen centuries", "17th-century", "hundreds of metres".

**Tier 3 — operational/seasonal claims** that cost a traveller money if wrong: "park may close Sep–Oct", every `bestTime`, "blue whales… November to April", "Esala Perahera in Jul/Aug".

**Tier 4 — business claims** needing only your yes/no: "we arrange private jeeps only" (Yala), "Most of our routes link four or five of these destinations" (index).

---

# C. Broken / inconsistent data

### C1 — Region values contradict the region model · **HIGH**
`lib/destinations.ts` vs `lib/regions.ts`:

| Destination | `destinations.ts` | `regions.ts` | |
|---|---|---|---|
| sigiriya | Cultural Triangle | Cultural Triangle | ✅ |
| kandy | **Hill Capital** | Hill Country | ❌ |
| ella | Hill Country | Hill Country | ✅ |
| nuwara-eliya | **Tea Country** | Hill Country | ❌ |
| yala | **Deep South** | The Wild South | ❌ |
| galle / mirissa | South Coast | South Coast | ✅ |
| arugam-bay | East Coast | East Coast | ✅ |
| colombo | **Western Capital** | West Coast & Colombo | ❌ |

**Four of nine disagree.** A visitor clicks "The Wild South" on the homepage map, lands on Yala, and the page says "Deep South". "Hill Capital" and "Western Capital" aren't regions at all — they describe a city's role.

### C2 — Nuwara Eliya elevation contradicts itself · **MEDIUM**
- `lib/destinations.ts`: *"two thousand metres up"*
- `lib/blog.ts`: *"Nuwara Eliya evenings are properly cool at 1,900 metres"*

Two figures for the same town in the same codebase. I am not asserting which is right — flagging that they cannot both be.

### C3 — Related-tours matching produces wrong results · **HIGH**
`app/destinations/[slug]/page.tsx:53-60` matches by substring against tour title/excerpt/highlights. Two confirmed live false positives:

| Destination | Falsely matches | Because |
|---|---|---|
| **Ella** (hill country) | `galle-south-coast-day-tour` | that tour mentions **Dala·wella** |
| **Galle** (south coast) | `wild-coast-safari-beaches-10-days` | that tour mentions **Tan·galle** |

And one silent gap: **Colombo matches 0 tours**, so its "Journeys featuring Colombo" section never renders — no error, just absent.

Match counts: Sigiriya 4, Kandy 3, Ella 4 *(1 wrong)*, Nuwara Eliya 1, Yala 4, Galle 4 *(1 wrong)*, Mirissa 2, Arugam Bay 1, **Colombo 0**.

### C4 — Open Graph bypasses the verification guard · **HIGH**
`app/destinations/[slug]/page.tsx:39` — `images: [{ url: toOgImage(d.image), alt: d.name }]`.

The rendering guard added in the QA pass does **not** cover metadata. Every destination still emits an unverified photograph as its social share image, captioned with the place name in `alt` and the OG title. **And for Colombo — whose image is now empty — `toOgImage("")` falls back to `heroTrain`**, so sharing the Colombo page posts a photo of a train labelled "Colombo".

### C5 — Index page metadata will go stale · **LOW**
Title "Nine islands in one" and a meta description listing all nine names are hard-coded against a 9-item dataset.

---

# D. Retired / generic media references

| Where | Asset | Status |
|---|---|---|
| `lib/destinations.ts` — Colombo | `cityLights` | ✅ **Removed** in the QA pass |
| `lib/content.ts:30` — Airport Transfers service | `cityLights` | ❌ **Still live** on `/services` |
| `lib/content.ts:179` — Mini Coach vehicle | `cityLights` | ❌ **Still live** on `/fleet` |
| `app/destinations/page.tsx:24` — index hero | `mistyHills` | ⚠ Decorative (`alt=""`, `aria-hidden`) — makes no place claim, so acceptable, but it is unverified stock |
| All 8 remaining destination images | Unverified stock | ⚠ Present in data, **blocked from rendering** |

**Confirmation for your item 8:** no unverified destination image can render. Both `DestinationCard` and the detail hero go through `<Img requireVerifiedLocation>`; `grep "src={d.image}"` returns nothing. **The one exception is metadata — see C4.**

---

# E. Recommended fixes, by severity

| # | Fix | Severity | Files |
|---|---|---|---|
| 1 | Decide the Tier-1 superlatives (§B) — verify, soften, or cut. **Your call, not mine.** | **Critical** | `lib/destinations.ts`, `app/destinations/page.tsx` |
| 2 | Close the OG metadata gap (C4) — gate the OG image on verification, or fall back to a neutral brand image rather than `heroTrain` | **High** | `app/destinations/[slug]/page.tsx`, `lib/media/registry.ts` |
| 3 | Align region values to the 7-region model (C1) | **High** | `lib/destinations.ts`, `lib/regions.ts` |
| 4 | Replace substring matching with an explicit destination↔tour mapping (C3) | **High** | `app/destinations/[slug]/page.tsx`, `lib/tours.ts` |
| 5 | Resolve the Nuwara Eliya elevation contradiction (C2) | **Medium** | `lib/destinations.ts`, `lib/blog.ts` |
| 6 | Confirm or remove the two business claims (Tier 4) | **Medium** | `lib/destinations.ts`, `app/destinations/page.tsx` |
| 7 | Remove `cityLights` from services and fleet (D) | **Medium** | `lib/content.ts` |
| 8 | Decouple index metadata from the count of nine (C5) | **Low** | `app/destinations/page.tsx` |
| 9 | Consider a `sources` field on `Destination` so claims can ever reach VERIFIED | **Low** | `lib/destinations.ts` |

---

# F. Files that would need modification

```
lib/destinations.ts                  copy, regions, elevation, business claim
lib/regions.ts                       region naming alignment
lib/tours.ts                         explicit destination links (fix #4)
lib/content.ts                       retired cityLights on services + fleet
lib/blog.ts                          elevation contradiction
app/destinations/page.tsx            hero copy, metadata, CTA claim
app/destinations/[slug]/page.tsx     OG image gate, related-tours matching
lib/media/registry.ts                OG fallback helper (fix #2)
```

**Detail page checks that PASSED:** heading hierarchy is clean (single `h1` = destination name, `h2` for "Don't miss" and "Journeys featuring…"); canonical URLs correct; `generateStaticParams` prebuilds all nine; the CTA `/book?service=…&tour=…` **is** read by `app/book/page.tsx` and prefills the form correctly; WhatsApp deep link builds a per-destination message; sticky aside and internal links resolve.

---

**No code modified. Awaiting your decisions — particularly on §B Tier 1, which is a content judgement I should not make for you.**
