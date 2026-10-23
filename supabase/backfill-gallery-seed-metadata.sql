-- Backfill the twelve seeded gallery rows with the metadata the seed already has.
--
-- Safe to re-run. Safe to run before or after scripts/upload-photography.mjs.
--
-- WHY THIS EXISTS
--
-- The gallery table predates the alt, width, height and place columns. The
-- uploader writes all four for every photograph it adds, so the thirty-eight
-- uploaded frames are complete. The twelve rows that were already in the table
-- came instead from add-gallery-metadata.sql, whose backfill could only copy
-- the caption into alt and had no dimensions to copy at all.
--
-- Two visible consequences, both confined to those twelve rows:
--
--   1. GalleryGrid gives a cell the photograph's own aspect ratio when it
--      knows the dimensions and falls back to 4:5 when it does not. Eleven of
--      these twelve are landscape, so they were being rendered in an upright
--      cell and cropped top and bottom.
--
--   2. alt = caption means a screen reader is read the sentence the sighted
--      visitor has already read, which is noise rather than access.
--
-- Every value below is copied from lib/content.ts, which composes them from
-- the typed media registry. The place claims are the registry's own, and all
-- twelve pass isLocationVerified() -- so this puts no unchecked location into
-- the ImageObject schema that /gallery emits.
--
-- WHAT IT WILL NOT OVERWRITE
--
-- width, height and place are COALESCEd, so anything already set wins. alt is
-- replaced only where it is still null or still identical to the caption,
-- which is exactly the state add-gallery-metadata.sql left behind -- so an alt
-- someone has since written by hand survives a re-run.

update public.gallery as g
set
  alt = case
          when g.alt is null or g.alt = g.caption then s.alt
          else g.alt
        end,
  width = coalesce(g.width, s.width),
  height = coalesce(g.height, s.height),
  place = coalesce(g.place, s.place)
from (
  values
    ('/photography/nine-arch-bridge-demodara.jpg', 'A blue train crossing the Nine Arch Bridge above jungle', 2000, 1333, 'Nine Arch Bridge, Demodara, near Ella'),
    ('/commons/goyambokka-beach-tangalle-sri-lanka.jpg', 'Goyambokka beach near Tangalle', 1920, 1080, 'Goyambokka, Tangalle'),
    ('/photography/yala-leopard.jpg', 'A leopard resting at the edge of a waterhole', 2000, 1132, 'Yala National Park'),
    ('/commons/lipton-seat-sri-lanka.jpg', 'The view over tea country from Lipton''s Seat above Haputale', 1920, 1279, 'Lipton''s Seat, Haputale'),
    ('/photography/sigiriya-rock.jpg', 'Sigiriya rock fortress rising above the surrounding forest', 2560, 1707, 'Sigiriya, Cultural Triangle'),
    ('/photography/surf-right-hander.jpg', 'A surfer riding a clean right-hand wave', 1600, 1066, NULL),
    ('/commons/elephas-maximus-maximus-hurulu-eco-park-sri-lanka-20260201-1018-7843.jpg', 'A Sri Lankan elephant in Hurulu Eco Park near Habarana', 1920, 1277, 'Hurulu Eco Park, Habarana'),
    ('/photography/mirissa-coconut-tree-hill.jpg', 'Coconut palms leaning over a rocky headland above turquoise water', 2000, 1500, 'Coconut Tree Hill, Mirissa'),
    ('/photography/kandy-tooth-relic-temple.jpg', 'The Temple of the Sacred Tooth Relic reflected in its moat', 1600, 2400, 'Temple of the Sacred Tooth Relic, Kandy'),
    ('/commons/nuwaraeliya-from-top.jpg', 'Nuwara Eliya and the surrounding hills seen from above', 1920, 1440, 'Nuwara Eliya, Hill Country'),
    ('/commons/hikkaduwa-under-water.jpg', 'Reef fish over the coral at Hikkaduwa', 1920, 1080, 'Hikkaduwa coral sanctuary, South Coast'),
    ('/commons/negambo-lagoon-sri-lanka-where-boats-come-to-rest.jpg', 'Fishing boats moored in Negombo lagoon', 1920, 1440, 'Negombo Lagoon, West Coast')
) as s(src, alt, width, height, place)
where g.src = s.src;

-- Expect: UPDATE 12. Fewer means a src in the table no longer matches the
-- seed, most likely because that row was re-pointed at a different file.
