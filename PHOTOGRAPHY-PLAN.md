# Integrating the photograph collection

Ninety-two files at `C:\Users\whisk\OneDrive\Documents\island route\Images`, into
the live site. This is the plan, what was built, and the three places where
looking at the actual photographs changed the answer.

---

## Read this part first

**1. Eighty-four of the eighty-seven frames are published. Three are not.**

Eighty-seven of the ninety-two files are unique frames (five are duplicates).
Forty-nine were held back for consent on the first pass; you cleared all
forty-nine, and forty-six of them are now live with captions and alt text
written the same way as every other row — by looking at the frame.

**Three are held again, for a reason that was never in a hold line, because it
only shows up at full size.** Frames **22**, **33** and **64** show the same
guest in a shirt carrying a censored expletive across the chest — white and
green on black, filling about a third of the frame. At grid size it reads as a
graphic. In the lightbox, at 1100px, it reads as the word. Your clearance was
given against holds recorded as `guests`, `person` and `quality`, so it cannot
have covered this one; publishing it is outward-facing and hard to take back,
while holding three frames is a small edit to reverse. They carry a new hold
reason, `wardrobe`, with the reason written next to them in the catalogue.

If you want them published anyway, say so and they go up — or crop them: the
shirt is in the lower third of all three, and a tighter frame on the elephant
would keep the picture.

**The three elephant-contact frames went up on your clearance, against my
recommendation.** Frames **6** and **31** (riding) and **24** (bathing) are
published, as are **5**, **12** and **14** (standing with, trunk overhead). My
note from the first pass stands: a signed release makes them legal to publish,
not good for the brand, and they are the frames most likely to be quoted back at
you in a review. Frames **26** and **80** (a raptor through wire mesh, a bird
against blown-out sky) and **27** (a stilt fisherman, an identifiable stranger
with nobody to ask) are published on the same clearance.

**2. There is no fleet photography in the collection.**

The request asked for a Fleet showcase. There are no photographs of your vehicles
in these files — no vans, no cars, no sedans. The closest things are a safari jeep
with another company's name painted on the door and a bullock cart. So the fleet
section still runs on the illustrated treatment it has now, and it will keep
running on that until there are photographs of the actual vehicles.

That is the single highest-value shoot you could do next: five vehicles, parked,
three-quarter front, shot in open shade, upright for the cards and wide for the
headers. It is an hour's work and it fills a gap nothing else can.

**3. Most of the collection is upright, which decided where it could go.**

| Shape | Frames |
|---|---|
| Upright 3:4 (phone, held vertically) | 63 |
| Landscape 4:3 | 23 |
| Square | 1 |

The site has eight page headers that want roughly 16:9. The collection contains
**exactly two** true 16:9 frames, both shot in a mask workshop. So "place them
across the page headers" is mostly not available, and the frames went instead to
the slots that are upright by design: the closing band (2:3), the experience
tiles (4:5) and the gallery, which takes any shape at all.

---

## 1. Strategic placement

### What is placed, and why each one

Seven frames are wired into page sections. Each replaces a stock photograph on a
specific count — it is yours, or it is the right shape, or both.

| Where | Frame | Replaces | Why this one |
|---|---|---|---|
| Closing band, every page | The blue train on the Nine Arch Bridge | Kandy temple moat (stock) | The best upright frame in the collection, at a place the frame itself proves. The band is the last thing a visitor sees and the thing asking for the enquiry. |
| `/gallery` header | Devil masks drying in rows | Lagoon heron (stock) | One of the only two genuine 16:9 frames, so it lands uncropped. A gallery page should open with your own photography. |
| Cultural Triangle region tile, `/tours` | Dambulla's colonnaded verandah | Dambulla (Wikimedia Commons) | 4160×3120 is exactly the 4:3 the tile asks for, and it is the same place as the file it replaces — a like-for-like upgrade from Commons to yours. |
| Food tile, `/experiences` | Rice and curry in a dozen clay pots | Commons restaurant plate | The Commons plate is a good photograph of a restaurant. This is a tour's lunch. That difference is the whole argument for a food tile on an operator's site. |
| Tea Country tile | Pluckers walking up the estate path | Haputale (Commons) | Backs only, nobody identifiable — which is exactly why it survived the consent pass while forty-six others did not. |
| Culture & Heritage tile | The standing figure at Gal Vihara | Sigiriya (stock) | Yours, and verifiable: the crossed-arm posture is unique to that carving in Sri Lanka. Sigiriya has not left the site — it still fronts the tours header. |
| Local Life tile | A spice garden's tasting table | Negombo street (Commons) | A thing a guest is handed and asked to smell beats a stranger's street as an illustration of local life. |

Everything else publishable — seventy-seven frames — goes to the gallery and
nowhere else. **That is the design, not an omission.** A section carries a
photograph because that photograph is the best available answer for that
section, not because the photograph exists. Filling every slot from one
collection would swap a set of considered frames for a set of adequate ones, and
the first thing a visitor notices about a site built that way is that nobody
chose anything.

### Where the place names come from

Eleven frames name a place. Every one of them names it because the place is
identifiable **in the frame** — the nine arches on the Demodara curve, Dambulla's
arcade under the overhang, the crossed-arm Buddha at Gal Vihara, the Nuwara
Eliya post office clock, Coconut Tree Hill's palms. The evidence is recorded
next to each one in `scripts/build-photography-manifest.mjs`.

The other twenty-seven publishable frames describe what they show and name no
place. A generic elephant is an elephant; it is not Udawalawe just because
Udawalawe has elephants. This matters more than it sounds: the destination
cards, region tiles and experience tiles all refuse to display a photograph
whose location claim has not been checked, and `/gallery` emits a Schema.org
`contentLocation` that Google treats as a factual claim. Guessing would have
turned a genuine photo library into misleading structured data.

### Bucket structure

```
media/                                   (existing public bucket)
└── photography/
    ├── heritage/      temples, carvings, masks, stupas
    ├── wildlife/      elephants, langurs, birds, crocodile
    ├── hill-country/  tea, ridges, the valley swing
    ├── journeys/      trains, the bridge, the road
    ├── coast/         Mirissa, the palms
    └── table/         rice and curry, spices
```

The request proposed folders by context — Destinations, Experiences, Fleet,
Journeys. These group by **subject** instead, for one concrete reason: moving a
photograph from an experience tile to a region tile is then an edit to one line
of `lib/media/photography.ts`, not a re-upload. Filing by page would mean the
storage path lies the moment the photograph moves, and it will move.

Paths are deterministic: `photography/<folder>/<slug>.jpg`. The slug *is* the
photograph's identity, so re-running the uploader replaces rather than
duplicates. This deliberately differs from the admin picker in
`components/admin/ImageField.tsx`, which timestamps its filenames because there
a collision means two different images with the same name.

Nothing goes into `public/`. Fifty-five megabytes of originals in the repository
would be carried by every clone and every deployment, and `*.supabase.co` is
already allowed in `next.config.mjs`.

---

## 2. The upload script

```bash
# 1. the columns the gallery needs
#    run supabase/add-gallery-metadata.sql in the Supabase SQL editor

# 2. the key the script needs (see the note below)
#    add SUPABASE_SERVICE_ROLE_KEY=... to .env.local

# 3. see exactly what will happen, touching nothing
node scripts/upload-photography.mjs --dry-run

# 4. do it
node scripts/upload-photography.mjs
```

It uploads the publishable frames to Storage and writes one `gallery` row per
frame — slug, caption, alt text, category, dimensions, blur placeholder, and a
place only where there is one. Both halves are idempotent: Storage upserts on
the path, the table upserts on the slug, so running it twice changes nothing and
running it after releasing more frames adds only those.

**Releasing a held frame is an edit, not a flag.** In
`scripts/build-photography-manifest.mjs`, the frame's row says:

```js
{ n: 2, slug: "guests-leaning-from-the-train", hold: "guests",
  subject: "Guests leaning out of the hill-country train" },
```

Clearing it means replacing `hold` with the caption, alt text and category it
should ship with, then re-running the manifest builder and the uploader. That is
more typing than a `--include-guests` switch, and it is the right amount: the
decision lands in version control next to its reason, where the next person can
see that somebody decided rather than that somebody passed a flag.

### What was released, and what is still held

All forty-nine were cleared. Forty-six went up; three were held again.

| Reason | Frames | What unblocks them |
|---|---|---|
| released | 46 | Nothing — live now, captioned and alt-texted. |
| `wardrobe` | 3 | Frames 22, 33, 64. A censored expletive on a guest's shirt, legible at lightbox size. Your call, or a crop. |

The forty-six landed in the folders by subject, not by page:

| Folder | Released | Total published |
|---|---|---|
| journeys | 15 | 20 |
| heritage | 12 | 25 |
| hill-country | 12 | 15 |
| table | 4 | 6 |
| wildlife | 2 | 15 |
| coast | 1 | 3 |

Nineteen frames now carry a `place`, up from eleven. The eight added are the
ones where the frame itself proves where it was taken: the Polonnaruwa Vatadage
by its circular terrace and moonstone, the Lankatilaka image house by its two
standing brick walls, Parakramabahu's palace by the beam sockets in its walls,
the Dambulla verandah by its whitewashed colonnade under the overhang, Sigiriya
three times over by the monolith and its water gardens, and the Bluefield
estate by its own timber sign at the edge of its tea field.

Two were deliberately left unplaced despite a strong guess, because the rule is
in-frame proof and not inference: frame **58**, a white spiral stair around a
tower that is almost certainly Ambuluwawa, and frame **30**, a staged waterfall
that may be Ravana. A caption that names the wrong waterfall is worse than one
that names none.

Captions for the released frames say **travellers**, never names. A consent
release of this kind covers the likeness; it does not hand over an identity to
print under it.

**About the service role key.** The script needs it because both the Storage
insert and the `gallery` insert are gated on `is_admin()`, and a script has no
session. The key bypasses every row-level security policy in the project, so:
`.env.local` only, never Vercel, never a commit, never a log line. The script
never prints it. If you would rather not hold it at all, the alternative is to
run the uploads from the admin picker by hand, eighty-four times.

### Supporting scripts

| Script | What it does |
|---|---|
| `scripts/build-photography-manifest.mjs` | The catalogue. Hand-authored, because every source file is a UUID and the only way to know what is in a frame is to look at it. Everything else derives from this. |
| `scripts/review-photography.mjs` | The consent review sheet: renders every held frame full size with the reason it is held. Three frames left in it. |
| `scripts/lib/photo-blur.mjs` | Generates the blur placeholders. Cached in `scripts/photography.blur.json`, so it runs once per new frame. |

The blur generation is worth one note. This machine has no `sharp`, no
ImageMagick and no ffmpeg, so the placeholders are made by drawing each
photograph into a 10-pixel-wide canvas in headless Chromium and reading it back
as JPEG — about 1.1 KB each. The one trap: Chromium gives every local file its
own opaque origin, so a `file://` image taints a canvas on a `file://` page and
the read-back is refused. The fix is to pass the bytes as a `data:` URI, which
has no origin to cross. Not a browser flag.

---

## 3. Components and performance

`components/GalleryGrid.tsx` was rewritten rather than extended, because three
of its problems were in the same few lines.

**Cells now take each photograph's own aspect ratio.** The old code assigned a
ratio from the item's *index*, which meant the same photograph changed shape
when a filter was clicked, and every upright frame that landed on a 4:3 cell
lost its top and bottom. With sixty-three upright frames arriving, that was no
longer survivable.

**The lightbox holds an index instead of an item**, which is what makes
previous/next possible at all — and makes navigation stay inside the active
filter instead of wandering into frames the grid is hiding. Keyboard support is
Escape, both arrows, and a Tab trap, because `aria-modal="true"` is a promise
that Tab cannot leave the dialog.

**The enlarged image is sized intrinsically.** The old fixed 3:2 frame
letterboxed every landscape photograph and shrank every upright one to a third
of the screen.

It also reserves its box up front, which the first version did not. An `<img>`
with CSS width and height both `auto` has no box at all until its file decodes,
so on a phone the lightbox measured 0 × 0 for the whole time the optimizer spent
transcoding the original — the dialog opened onto nothing and the caption jumped
when the photograph arrived. Worse, the blur placeholder exists for exactly that
gap and had nowhere to paint. The frame now takes its width and aspect ratio
from the stored dimensions.

Only from *stored* dimensions, though. Reserving a box from the 4:5 default
would be worse than not reserving one: `object-contain` would letterbox the
photograph inside a permanently wrong frame, where `auto` at least recovers the
true shape once the file lands. Every one of the 96 rows now carries measured
dimensions, so every frame gets the reservation.

**And the reservation has to have something to resolve against, which took a
second pass to get right.** The reserved width is `min(100%, …)`, and the
figure around it was shrink-to-fit. Before a file decodes, an `<img>`
contributes no intrinsic width, so the figure sized itself to its widest
definite child instead — the caption, at `max-w-prose`. Measured on a 1440px
viewport, the enlarged frame reserved **453 × 302** and then jumped to 912 ×
608 when the file arrived. Reserving the wrong box is the same bug one step
quieter. One `w-full` on the figure gives the percentage a definite containing
block; with animation disabled so the entry spring cannot be mistaken for a
shift, the frame now reserves 912 × 608 and lands at 912 × 608 — no drift at
all, on three ratios at desktop width and three at 375px.

The one shift left is 10px wide, happens once, and is not the reservation:
opening the lightbox sets `body { overflow: hidden }`, which removes the
scrollbar and widens the viewport, so the very first frame on a narrow screen
lays out 245px wide and settles at 255px. Fixing it properly means a permanent
`scrollbar-gutter` on every page of the site, which is a worse trade than a
10px nudge inside a modal. Cumulative layout shift on `/gallery`, measured over
six seconds from navigation, is **0.019** against the 0.1 "good" threshold.

Placeholders, sizes and priority: `placeholder="blur"` wherever a frame has one,
`sizes="(max-width:768px) 50vw, 33vw"` on the grid so phones fetch half-width
files, and `priority` on the first three cells only — the first row is the
largest-contentful candidate and everything below it can wait for the viewport.

Tap targets, against the WCAG 2.5.8 floor of 24 CSS pixels:

| Control | Measured |
|---|---|
| Filter chips | 44 px tall |
| Previous / Next / Close | 48 × 48 px |
| Release buttons on the review sheet | 44 px tall |

### Re-verified after the upload

Fifteen routes, every non-GET request aborted so the sweep could not write an
enquiry into the live database:

| | |
|---|---|
| Routes returning 200 | 15 / 15 |
| Image responses | 97 on `/gallery`, all 200 |
| Broken `<img>` after scrolling the whole page | 0 |
| Contour fallbacks rendered instead of a photograph | 0 |
| `<img>` with no `alt` attribute | 0 |
| `alt=""` images | 14, all decorative — page headers and 68px thumbnails beside their own text label |
| Gallery rows | 96, all published, all with measured dimensions and alt text |
| Filter counts | Beaches 6, Wildlife 18, Hills 17, Culture 33, Surf 1, Journeys 21 — summing to 96 |
| Lightbox counter | "1 of 96"; ArrowLeft from the first wraps to "96 of 96" |
| Six Tabs inside the dialog | stayed inside |
| Escape | detaches the dialog, restores `body` overflow, returns focus to the cell that opened it |
| JSON-LD `ImageGallery` | 96 items, 96 absolute `contentUrl`, 96 with width and height, 96 with a description distinct from the caption, 30 with `contentLocation` |
| Horizontal overflow at 375px | none on `/`, `/gallery`, `/destinations`, `/experiences`, `/tours`, `/about` |
| Console errors | 0 |

**What the gallery costs now that it is 96 frames.** On a warm ISR cache the
document arrives in 509ms and the first cell paints at 694ms; the frames above
the fold are decoded at 770ms. Scrolling the full 18,462px page pulls all 97
images in 31.6 seconds, with nothing broken and nothing left pending. That is
the honest worst case, and it is a worst case almost nobody pays: the filter
chips cut the set to between 1 and 33 frames, and everything below the first
row is lazy.

Local figures are pessimistic in one specific way — `next start` here has no
`sharp`, so it transcodes through the WASM fallback. Vercel supplies `sharp` on
the platform, so the optimizer is faster in production than in any measurement
above. Nothing needs installing for that.

---

## 4. SEO and accessibility

**Caption and alt text are two different jobs, and now two different fields.**
They were one. A screen reader was being read the sentence the sighted visitor
had already read, which is noise, not access. Every frame now carries both: the
caption is what you would say pointing at it ("Baskets on, heading up to the
field"), the alt text describes what is in it for someone who cannot see it
("Three people walking away up a shaded estate path with woven tea baskets
strapped to their backs").

`/gallery` emits `ImageGallery` structured data with one `ImageObject` per
published frame — `contentUrl`, `name`, `caption`, `description` from the alt
text, real `width` and `height`, and `contentLocation` **only** where the place
was confirmed. Verified on the built page: twelve items, twelve with dimensions,
eleven with a location, all URLs absolute, and `description` different from
`caption` on all twelve.

The database migration, `supabase/add-gallery-metadata.sql`, adds `slug`, `alt`,
`width`, `height`, `blur_data_url` and `place` to the `gallery` table,
backfills slugs from existing filenames, de-duplicates them, adds a unique index
so the uploader can upsert, and backfills `alt` from `caption` for rows that
predate the split. Existing policies are untouched. It is safe to re-run.

---

## Run order

```
1. supabase/add-gallery-metadata.sql          in the Supabase SQL editor
2. supabase/media-bucket-policies.sql         if not already run — the admin picker needs it
3. SUPABASE_SERVICE_ROLE_KEY in .env.local
4. node scripts/upload-photography.mjs --dry-run
5. node scripts/upload-photography.mjs
6. deploy
```

**Steps 4–5 come before step 6, and that ordering is not a preference.** The
seven placed frames point at Storage objects the uploader creates. Deploying
before it has run leaves six broken images on the live site, one of them in the
closing band of every page. Measured on the verification build, where the
uploader has deliberately not been run: six image requests returning 400, all of
them the owner frames, everything else loading.

After the upload, `/gallery` serves from the database rather than the seed, and
the seventy-seven unplaced frames appear there.

---

## Verified

On a production build served locally with the Supabase environment blanked, so
the pages render from the committed seed data rather than the live database:

- `npx tsc --noEmit` clean; `next build` clean.
- Gallery: 12 cells, 10 distinct aspect ratios across 12 frames, 12/12 decoded.
- Filters: Beaches 3, Wildlife 3, Hills 2, Culture 2, Surf 1, Journeys 1, All 12.
- Lightbox: opens on the clicked frame, counter reads "1 OF 12"; the enlarged
  image reports 2000×1333 intrinsic and lays out at 877×585, so it fills the
  width with no letterbox; next and ArrowLeft return to the start; ArrowLeft from
  the first frame wraps to "12 OF 12"; five Tab presses stay inside the dialog;
  background scroll locks and restores; Escape closes and returns focus to the
  thumbnail that opened it.
- Inside a filter: the counter reads "1 OF 3", and a full cycle of arrow presses
  never leaves the category.
- All seven placements reach the page with **zero** contour fallback panels,
  which is the check that the location-verification gate passes for each one.
- Zero console errors other than the six expected 400s for the not-yet-uploaded
  frames.

### Against the live database and Storage

Queried directly, not through a page. The browser-side numbers are in the
table under section 3; what follows is what the database and the bucket
actually contain.

- The `gallery` table holds 96 published rows: 84 served from Storage, 12 still
  served from `public/`. No duplicate slug, no duplicate `src`, and all 12
  older files still present on disk.
- All 84 Storage objects answer a byte-range request — 84 × 206 with a
  `content-range` header, nothing else, no exceptions. That matters because
  it is what the image optimizer does on a cold variant.
- Every one of the 96 rows carries measured `width` and `height` and an `alt`
  distinct from its `caption`. Thirty carry a `place`.
- `ImageGallery` JSON-LD: 96 items, 96 absolute `contentUrl`, 96 with width and
  height, 30 with `contentLocation`.

The two gaps this file used to list here are closed.
`supabase/backfill-gallery-seed-metadata.sql` has been run: the 12 older rows
had no stored dimensions, no `place`, and `alt` set equal to `caption`, so
eleven landscape frames and one portrait frame were drawn in the 4:5 default
cell and cropped, and a screen reader heard each of those captions twice.
Re-queried now, zero rows are missing dimensions and zero have `alt` equal to
`caption`. Every one of the twelve place claims was checked against
`isLocationVerified()` before it went in, so the backfill added no unverified
location to the schema. There is nothing left to run.

One cost worth stating plainly: on a cold deployment `/gallery` asks the
optimizer for 96 variants, each a 0.5–2.5 MB original fetched from Storage and
transcoded on demand. `minimumCacheTTL` is 31 days, so it is a one-time cost
per variant — but the first visitor after a deploy pays it, and the measured
full-scroll figure above is what that costs.

One code change outside the photography modules: `isLocationVerified()` in
`lib/media/types.ts` returned `true` for anything marked `kind: "original"`,
and the type made `verifiedLocation: false` inexpressible for originals. An
operator's own photograph is original whether or not anyone wrote down where it
was taken, so an unplaced frame dropped into a destination slot would have
claimed whatever name sat beside it. The guard now respects an explicit
`false`, and every existing asset is unaffected.

---

## Known quality notes

- `valley-swing` is 1000×1500 at 0.1 MB — soft if enlarged in the lightbox. It
  is in the gallery, not in a slot, for that reason.
- `nine-arch-bridge-viewpoint` and `mongoose-in-the-green` are 1600×738
  letterboxed crops rather than full frames; they read as stills from a video.
- `tea-baskets-up-the-path` at 1500×2000 is the smallest file placed anywhere on
  the site. Adequate for a 4:5 tile at every breakpoint; it would not be
  adequate for a header.
