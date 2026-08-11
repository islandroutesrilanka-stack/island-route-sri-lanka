# Media Assets — Candidate Manifest & Verification Record

**Created:** 8 August 2026
**Status:** Candidates proposed. **Nothing verified. Nothing selected. Nothing downloaded.**
**Purpose:** Every image and video used on Island Route is recorded here with its source, licence, what it claims to depict, and whether that claim has been checked by a human.

---

## ⚠ Read this before anything else

**I have not seen a single one of these assets.**

I can reach Pexels search pages and read titles, slugs and photographer names. I **cannot** view the images or watch the videos — image and video hosts are network-blocked from my environment, and a URL slug is a claim by an uploader, not evidence.

So every row below says **UNVERIFIED**, and will keep saying that until you tick it. A row that stays unticked does not get used for a location-specific claim. That rule is enforced in code via `provenance.verifiedLocation` (see `MEDIA-VIDEO-PLAN.md` §2), not left to memory.

---

## ⚠ Two findings that change the plan

### 1. Pexels keyword matching is extremely loose — this is the authenticity trap

The result counts are not what they appear:

| Search | Claimed results |
|---|---|
| "Sri Lanka train" videos | **29,143** |
| "Sri Lanka train" photos | **81,100** |
| "Arugam Bay beach" photos | **80,000+** |
| "Nine Arches Bridge" photos | **100,000+** |

Sri Lanka does not have 29,143 stock train videos. These searches are returning *any* train, *any* beach, *any* bridge — the country name is barely filtering. A photo can sit in an "Arugam Bay" search having been shot in Bali.

**This is precisely the failure mode you asked me to prevent**, and it means browsing by search term is actively dangerous. Only individually-titled, individually-checked assets can be trusted.

Notably: my Arugam Bay search returned **no specific Arugam Bay photograph at all** — only a generic "Person Surfing" with no country attached. That slot is the highest-risk of the nine.

### 2. The Sri Lanka stock *video* library is dominated by drone footage

I read two complete search pages (~80 video results across "sri lanka" and "sri lanka train"). Near enough everything is aerial: *"aerial view of…", "drone view of…", "4k aerial…", "breathtaking aerial…"*.

Under your Q3 standard — observational, documentary, real human moments over drone spectacle — **most of the free library is disqualified.** I found roughly five non-aerial candidates in eighty results. See §2 and the recommendation at the end.

---

## 0. HERO POSTER SHORTLIST — 8 candidates

**Decision applied:** no stock hero video in Phase 2. `hero_video_url` stays empty; architecture stays fully video-ready.

**Selection brief:** authentic Sri Lankan scene, cinematic and understated, *no unverified landmark claim*. Documentary over tourism advertising.

### 0.1 Composition requirements the hero imposes

Beyond authenticity, the poster must survive being a full-bleed background:

- **Landscape, minimum 2400px wide.** It is cropped to roughly 21:9 on desktop and near-square on mobile — so the subject cannot sit at the extreme edge.
- **Quiet area for type.** "Sri Lanka, Unscripted." plus subcopy and two CTAs occupy the lower-left third. A busy or high-contrast lower-left kills legibility, and no scrim fully rescues it.
- **Tolerates a dark green scrim.** Already-dark images go muddy; blown-out skies fight the scrim.
- **Not a portrait.** A single face at hero scale reads as advertising, which is the register you're avoiding.

I have weighted the shortlist toward images whose *described* composition suggests depth and negative space. I cannot confirm this — I have not seen them.

### 0.2 The shortlist

All are **Pexels License** (free commercial use, no attribution required, modification permitted). Photographer names are shown on each source page; the search listing does not expose them and I have not invented any.

| # | Candidate | What the title claims it depicts | Country in title? | Why it fits "Sri Lanka, Unscripted." | Verified |
|---|---|---|---|---|---|
| **H1** | [Scenic view of paddy fields in Meemure, Sri Lanka](https://www.pexels.com/photo/scenic-view-of-paddy-fields-in-meemure-sri-lanka-32746347/) | Paddy fields at Meemure — a real, remote village in the Knuckles range | ✅ **Yes, and specific** | **My first pick.** Meemure is genuinely off-route — a village reachable only by rough track. Paddy terraces read unmistakably Sri Lankan without leaning on a monument. This *is* "unscripted": the island as lived in, not as photographed | ☐ |
| **H2** | [Joyful ride on rural Sri Lankan road](https://www.pexels.com/photo/joyful-ride-on-rural-sri-lankan-road-35577995/) | People on a rural road, described as joyful | ✅ Yes | A genuine human moment on a road — and Island Route's entire product is the road. The most on-brand *subject* in the shortlist. Risk: "joyful" may mean posed | ☐ |
| **H3** | [Motorcyclist waiting at a railroad crossing, road through tropical forest](https://www.pexels.com/photo/motorcyclist-waiting-in-front-of-a-railroad-crossing-on-the-road-through-a-tropical-forest-18463822/) | A motorcyclist stopped at a level crossing in forest | ⚠️ No — see §0.3 | Beautifully undramatic. A person waiting is the opposite of tourism advertising, and level crossings on forest roads are a real texture of travelling the island. Strong negative space likely | ☐ |
| **H4** | [Hut on slope of green mountain in Sri Lanka](https://www.pexels.com/photo/hut-on-slope-of-green-mountain-in-sri-lanka-21081147/) | A hut on a green mountainside | ✅ Yes | Hill country without the drone. A single human structure against scale gives the depth a hero needs, and a natural quiet zone for type | ☐ |
| **H5** | [Farmer carrying harvested rice on his head](https://www.pexels.com/photo/farmer-carrying-harvested-rice-on-his-head-14987238/) | A farmer carrying rice | ⚠️ No | The strongest *documentary* image here — work, not leisure. Editorial in the best sense. Risk: could crop as a portrait, which is the wrong register at hero scale | ☐ |
| **H6** | [Scenic view of mountains during dawn](https://www.pexels.com/photo/scenic-view-of-mountains-during-dawn-10913652/) | Mountains at dawn | ⚠️ No | Dawn light is the honest version of "golden hour" — cool, quiet, un-saturated. Almost certainly the best type-legibility of the eight. Weakest on specificity: mountains at dawn could be anywhere, which cuts both ways given your rule | ☐ |
| **H7** | [Small hut on a tea plantation](https://www.pexels.com/photo/small-hut-on-a-tea-plantation-11865887/) | A hut among tea bushes | ⚠️ No | Tea country is core Island Route territory. A working hut rather than a manicured estate view keeps it documentary | ☐ |
| **H8** | [Street food stall on a scenic roadside](https://www.pexels.com/photo/street-food-stall-on-a-scenic-roadside-31001466/) | A roadside food stall | ⚠️ No | Local life, roadside — exactly the "lunch where locals actually eat" promise already in your About copy. Likely too busy for hero type; strong candidate for section 06 instead | ☐ |

### 0.3 An observation worth acting on

Four candidates carry near-consecutive Pexels IDs: **18463819** (countryside), **18463822** (H3, level crossing), **18463837** (farm and palms), **18463840** (shop at a railroad crossing).

Consecutive IDs almost always mean a single photographer uploading one shoot in one session. They surfaced together in a "rural Sri Lanka" search and are thematically consistent.

**Practical consequence:** if you verify *any one* of these as Sri Lanka, the others are very likely from the same trip — which would give you a coherent, single-photographer set with consistent colour and light. That is worth more to a luxury brand than four unrelated images that happen to be pretty. Worth checking the photographer's profile while you're there.

### 0.4 What I did not shortlist, and why

- **`aerial-view-of-rice-paddies-in-sri-lanka-35970549`** — explicitly Sri Lanka, but aerial. Rejected on your Q3 standard.
- **`woman-in-white-skirt-walking-along-road-holding-teal-umbrella-321539`** — a very low Pexels ID (an early upload), no country in the title, and a styled-looking description. Reads as staged, and provenance is weak.
- **`a-grassy-field-8692691` / `countryside-in-summer-18463819`** — too generic to carry a hero.
- Anything from `content.pexels.com/aigc-bundle/` — AI-generated. Never.

### 0.5 My recommendation

**H1 (Meemure paddy fields) as the hero, with H3 (level crossing) as the alternate.**

H1 names a specific real place, so verification is tractable — you either recognise Meemure's terraces or you don't. It is landscape-shaped, likely to have depth and a quiet upper register for type, and it makes the argument your headline makes: an island lived in rather than performed.

H6 is the safest technically and the weakest strategically — "mountains at dawn" is beautiful and could be Wales.

**If none survive verification, ship the hero with a duotone gradient and grain treatment** (the `.grain` utility already exists) rather than an unverified photograph. An abstract hero is a defensible design choice; a wrong one is not.

---

## 1. Location-specific images — the nine that make a place claim

Verification legend: ☐ unverified · ☑ verified by Gayan · ✗ rejected

### 1.1 Candidates found

| # | Slot | Claims to depict | Candidate | Photographer | Verified |
|---|---|---|---|---|---|
| 1 | `sigiriya` | Sigiriya Rock Fortress, Cultural Triangle | [Sigiriya Rock Sri Lanka — stone steps ascending the fortress](https://www.pexels.com/photo/sigiriya-rock-sri-lanka-12142143/) | Rivindhu Geeneth | ☐ |
| 1b | `sigiriya` alt | Sigiriya, ground-level, greenery + sky | [Sigiriya in Sri Lanka](https://www.pexels.com/photo/sigiriya-in-sri-lanka-19808398/) | Andreas Schnabl | ☐ |
| 1c | `sigiriya` alt | Sigiriya Rock, forest surround | [Sigiraya Rock on Sri Lanka](https://www.pexels.com/photo/sigiraya-rock-on-sri-lanka-19710787/) | Bilakis | ☐ |
| 2 | `pidurangala` | Pidurangala Rock (the *viewpoint* for Sigiriya) | [View of the Pidurangala Rock, Sigiriya](https://www.pexels.com/photo/view-of-the-pidurangala-rock-sigiriya-sri-lanka-19808528/) | — | ☐ |
| 3 | `templeKandy` | Sri Dalada Maligawa, Temple of the Sacred Tooth Relic, Kandy | [Sri Dalada Maligawa, Kandy](https://www.pexels.com/photo/sri-dalada-maligawa-kandy-sri-lanka-temple-of-the-sacred-tooth-relic-14041994/) | Chathura Anuradha Subasinghe | ☐ |
| 4 | `ellaBridge` | Nine Arch Bridge, Demodara / Ella | [Nine Arch Bridge in Demodara, Sri Lanka](https://www.pexels.com/photo/nine-arch-bridge-in-demodara-sri-lanka-4769075/) | — | ☐ |
| 4b | `ellaBridge` alt | Nine Arch Bridge with train crossing | [Scenic View of Nine Arch Bridge in Ella](https://www.pexels.com/photo/scenic-view-of-nine-arch-bridge-in-ella-sri-lanka-31555892/) | — | ☐ |
| 5 | `galleFort` | Galle Fort — street level, colonial architecture | [Charming Street View in Galle Fort](https://www.pexels.com/photo/charming-street-view-in-galle-fort-sri-lanka-31194790/) | — | ☐ |
| 5b | `galleFort` alt | Galle Fort Clock Tower / ramparts | [Galle Fort Clock Tower, Southern Sri Lanka](https://www.pexels.com/photo/galle-fort-clock-tower-in-southern-sri-lanka-31032908/) | Thilina Alagiyawanna | ☐ |

**Note on #1 vs #2** — this is exactly the kind of error your rule exists to catch. Pidurangala is the rock people climb *to photograph* Sigiriya. A Pidurangala photo labelled "Sigiriya" is wrong, and it is an extremely common mislabelling in stock libraries. Worth your particular attention on rows 1–2.

**Note on #5** — I would favour the street view over the clock tower. Under the documentary standard, a lived-in street says more about Galle than a monument does.

### 1.2 Slots I could not source — need a research pass or your input

| # | Slot | Claims to depict | Risk | Curated search |
|---|---|---|---|---|
| 6 | `arugamBay` | Arugam Bay surf break, East Coast | **Highest.** No specific Arugam Bay photo surfaced; the search is full of unrelated beaches | [arugambay sri lanka](https://www.pexels.com/search/arugambay%20sri%20lanka/) |
| 7 | `yalaLeopard` | Sri Lankan leopard, Yala NP | **High.** Leopard photos are overwhelmingly African or Indian. A *Sri Lankan* leopard (`P. p. kotiya`) labelled as such is rare | [sri lanka leopard](https://www.pexels.com/search/sri%20lanka%20leopard/) |
| 8 | `teaCountry` | Tea estate, Hill Country — ideally with pickers working | Medium. Plentiful, but most are drone shots of hillsides | [sri lankan tea plantations](https://www.pexels.com/search/sri%20lankan%20tea%20plantations/) |
| 9 | `elephants` | Sri Lankan elephants — Minneriya / Udawalawe / Yala | Medium-high. African elephants dominate stock; the species differ visibly | [sri lanka elephants](https://www.pexels.com/search/videos/sri%20lanka%20elephants/) |
| 10 | `heroTrain` | Highland railway, Kandy–Ella line | Medium. Many "Sri Lanka train" results are not Sri Lanka | [sri lanka train](https://www.pexels.com/search/sri%20lanka%20train/) |

**On #7 and #9 specifically:** these are the two where a wrong image is not just inaccurate but embarrassing for a Sri Lankan operator. An African elephant on a Sri Lankan safari page, or an African leopard captioned Yala, is the kind of detail your actual customers will notice immediately. I would rather ship these slots with no photograph than with a plausible-looking wrong one.

---

## 2. Hero video candidates — ARCHIVED, not for Phase 2

**Decision 8 Aug: no stock hero video ships in Phase 2.** `hero_video_url` stays empty; the poster carries the hero; the architecture stays fully video-ready for original footage later.

Kept below only as a record of what was assessed and rejected, so the ground isn't re-covered later.

**All five URLs confirmed to exist on Pexels. None viewed by me. None downloaded. None selected. None will be used.**

Scored against your Q3 standard: observational and documentary over drone spectacle.

| # | Candidate | Why it's here | Concern |
|---|---|---|---|
| **1** | [Elephant and mahout in a tropical river](https://www.pexels.com/video/elephant-and-mahout-in-a-tropical-river-35813843/) | **My pick to review first.** A working animal *and the person who works with it* — a human relationship, not a wildlife postcard. Ground level. This is the register you described | Is it Sri Lanka? Mahouts work across South and Southeast Asia. **Needs verification** |
| **2** | [Sunset view from ancient rock fortress](https://www.pexels.com/video/sunset-view-from-ancient-rock-fortress-36212601/) | Shot *from* the rock, not *of* it — a traveller's point of view rather than a drone's. Likely Sigiriya or Pidurangala | "Sunset" risks the exaggerated-sunset trap you flagged. Which fortress is unconfirmed |
| **3** | [Kandy town, Sri Lanka](https://www.pexels.com/video/kandy-town-sri-lanaka-28097223/) | Named location, town rather than landscape. Real place, real life | Unknown whether ground-level or aerial |
| **4** | [Kadugannawa, Sri Lanka](https://www.pexels.com/video/kadugannawa-sri-lanka-20001619/) | Kadugannawa is a real town on the Colombo–Kandy railway. Specific, unglamorous, promising | Content entirely unknown |
| **5** | [Busy commuter train station platform](https://www.pexels.com/video/busy-commuter-train-station-platform-scene-37711360/) | The strongest *documentary* premise in the whole library — a real platform, real people, no drone | ⚠ **The title does not say Sri Lanka.** It surfaced in a search that returns 29,143 loose matches. Could be anywhere. Verify before considering |

### Rejected on your Q3 standard (a representative sample)

Drone/aerial — disqualified as a category: `drone-view-of-demodara-nine-arches-bridge-34100511` · `scenic-aerial-view-of-sigiriya-rock-fortress-36175878` · `aerial-view-of-lush-sri-lankan-tea-plantations-29979273` · `breathtaking-aerial-view-of-lush-sri-lankan-landscape-32689590` · `drone-video-of-the-nine-arch-bridge-in-ella-13234027` · `stunning-aerial-view-of-sri-lankan-waterfall-32718796` · and roughly sixty more.

Also rejected: `sri-lankan-national-flag-at-sunset-silhouette-29330747` — flag-at-sunset is tourism-board visual language, not documentary.

⚠ Also noted: Pexels now mixes **AI-generated clips** into results (the `content.pexels.com/aigc-bundle/` entries, promoted via Canva). None are in the list above and none should ever be used — an AI-generated "Sri Lanka" is a fabricated place, which fails your authenticity rule at the most basic level.

---

## 3. My honest recommendation on the hero video

The free stock library does not really contain what you want.

Your standard is documentary — real light, real people, unposed. The free Sri Lanka video library is ~95% drone cinematography, because that is what gets uploaded. Of five candidates above, one has an unconfirmed country, one has an unconfirmed location, and two have entirely unknown content.

Three honest options:

| Option | Assessment |
|---|---|
| **A. Ship poster-only in Phase 2** ← *my recommendation* | The architecture is video-ready from day one; `hero_video_url` simply stays empty. A single outstanding still photograph at full bleed is a legitimate luxury-brand choice — several of the reference brands do exactly this. Add video when you have footage worth showing. No compromise, no rewrite |
| **B. Licence 2–3 paid clips** | Paid libraries have far better documentary Sri Lanka coverage. Perhaps $150–400. Buys a real hero now |
| **C. Use one of the five above** | Fastest, but you would be accepting a clip that is probably drone-ish or of uncertain provenance — which undercuts the standard you just set |

Option A costs nothing, breaks nothing, and delays no part of the redesign. **A poster-only hero built on video-ready architecture is not a downgrade — it is the same build with one CMS field left empty.**

---

## 4. Non-photographic slots (Q5)

Per your instruction — never force stock into a slot that does not need a photograph. These four currently hold generic non-Sri-Lankan images and will get design treatments instead:

| Retired asset | Used | Replacement approach |
|---|---|---|
| `cityLights` | 3× | Deep-green surface + hairline rule + type. No image |
| `sedanNight` | 1× | Vehicle silhouette line-art for the fleet strip |
| `forest` / `greenMountains` | 1× | Duotone gradient panel with grain (`.grain` already exists) |
| `mountainLake` / `lakeCanoe` | 1× | Retired outright; layout reflows |

---

## 5. Licensing record

All candidates above are **Pexels License** — free for commercial use, no attribution required, no modelling or property release needed for editorial-style use.

Recorded anyway, per asset: source URL · photographer · licence · date retrieved. Two reasons: you will want to know what is still temporary when originals arrive, and it makes the eventual swap a checklist rather than an archaeology exercise.

**Rules that hold regardless of licence:**

- Never hotlink stock video. Self-host it.
- Never use AI-generated media (§2).
- Never crop or caption an asset so that it implies a location it does not show.

---

## 6. Verification workflow

```
1. I propose candidates here, with source links          ← done for 9 of 14 slots
2. You open each link and confirm it shows the place claimed
3. Ticked → provenance.verifiedLocation = true → usable for that location
   Unticked → usable only as non-location-specific background, or not at all
4. Rejected → I source a replacement
5. Only then does the asset enter lib/media/registry.ts
```

**No asset enters the registry as "verified" on my say-so.** I have not seen any of them.

---

## 7. Sign-off

| Item | Status |
|---|---|
| **Hero poster chosen and verified** | ☐ **0 of 8 — hero still renders the contour treatment** |
| Location images verified | ☑ **Signed off by the owner, 9 Aug 2026 — see below** |
| Hero video approach | ☑ **Decided: none in Phase 2. Architecture video-ready.** |
| Non-photographic treatments approved | ☐ |

### Destination imagery sign-off — 9 August 2026

`verifiedLocation` was set to `true` across the registry on the owner's
instruction, releasing all destination photography to render.

**Basis of the sign-off, recorded so it isn't misread later:** a blanket
instruction from the site owner, who knows these locations. It was **not** a
per-asset inspection, and no assistant or automated check confirmed any
individual photograph — the image hosts were never reachable from the build
environment, so the eight files have never been viewed here.

**Two entries carry a known mislabelling risk** and are annotated in
`lib/media/registry.ts` for a future second look:

| Asset | Risk |
|---|---|
| `sigiriya` | Stock libraries routinely caption Pidurangala — the rock people climb *to photograph* Sigiriya — as Sigiriya itself |
| `leopard` | African leopards dominate stock; the Sri Lankan subspecies (*Panthera pardus kotiya*) is visibly different |

**To withdraw sign-off** for any asset, set its `verifiedLocation` back to
`false`. It reverts to the gradient treatment automatically wherever a place is
claimed — no other change required.

### 7.1 Rule in force

> **No unverified image ships as production content.**
> During development a placeholder may be used locally, marked `provenance.kind: "placeholder"`, which **fails the production build** if still present. That is a build-time guarantee, not a reminder.

---

**Sources consulted:** [Pexels — Sri Lanka videos](https://www.pexels.com/search/videos/sri%20lanka/) · [Pexels — Sri Lanka train videos](https://www.pexels.com/search/videos/sri%20lanka%20train/) · [Pexels License](https://www.pexels.com/license/)
