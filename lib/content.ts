import { media } from "./media/registry";
import { commonsPlaces, commonsSubjects } from "./media/commons";

/*
  Every image below is a file this repository serves itself, from either the
  owner's own photography (/photography) or a licensed Wikimedia Commons
  original (/commons). None of them is a remote URL any more.

  That is not a tidiness preference. The previous set hotlinked
  images.unsplash.com, and a page that asks for a dozen of them at once earns
  429s from the CDN: Next's image optimizer then logs `upstream image response
  failed`, returns 400, and <Image> renders nothing at all — a blank tile with
  no error anywhere the visitor can see. Measured on /tours it was ten broken
  images on one load and five on the next, varying run to run. The identical
  failure had already been diagnosed and fixed for Wikimedia hotlinks by
  self-hosting them; this applies the same fix to the rest of the site.

  The second reason is that the old set was generic world stock. `verifiedLocation`
  exists in lib/media/registry.ts because this project once shipped a tropical
  beach captioned "Sigiriya". Sourcing from the same verified pool as the region
  and experience photography means every caption below is true of its picture.
*/

/* ---------------------------------- Services ---------------------------------- */

export type Service = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  icon:
    | "plane"
    | "steering"
    | "car"
    | "sun"
    | "map"
    | "binoculars"
    | "waves"
    | "hotel"
    | "route";
};

export const services: Service[] = [
  {
    slug: "airport-transfers",
    name: "Airport Transfers",
    tagline: "Land softly. We're already waiting.",
    description:
      "Meet-and-greet at Bandaranaike International with a name board, cold water and air-conditioned comfort. Fixed prices, flight tracking, and a driver who knows exactly where your hotel is — day or night.",
    /* The lagoon at Negombo, which is the town the airport actually sits in —
       Katunayake is on its northern edge, and this is the first Sri Lanka most
       arrivals see on the drive out. Replaces an empty slot left behind when a
       generic night cityscape was retired from the media audit. */
    image: commonsPlaces.Negombo.src,
    icon: "plane",
  },
  {
    slug: "private-driver-hire",
    name: "Private Driver Hire",
    tagline: "Your own chauffeur-guide, for as long as you need.",
    description:
      "Hire a professional English-speaking chauffeur for a day, a week or your entire holiday. Your driver handles routes, tickets, restaurants and local knowledge while you simply enjoy the island.",
    image: commonsPlaces["Horton Plains"].src,
    icon: "steering",
  },
  {
    slug: "taxi-services",
    name: "Taxi Services",
    tagline: "Point to point, without the haggling.",
    description:
      "Reliable, fairly-priced private taxis between any two points in Sri Lanka. Transparent quotes upfront, clean modern vehicles, and drivers who arrive on time, every time.",
    image: media.colomboLotusTower.src,
    icon: "car",
  },
  /*
    Day Tours, Multi-Day Tours and Safari Tours were removed here.

    They were not services — they were the journey catalogue described a second
    time, in different words, with their own CTAs. A visitor comparing
    "Safari Tours" on /services against the actual safari journeys on /tours had
    no way to tell which was the real product, and the duplicate copy competed
    with /tours for the same search terms.

    /services is now one thing only: how you move around the island. The
    journeys themselves live at /tours and /experiences, and this page links
    there. Booking a safari or a multi-day trip is still fully supported — those
    remain enquiry types in BookingForm and are reachable from /tours.

    Retired slugs are also filtered in getServices (lib/data.ts) so rows left
    behind in the Supabase services table cannot bring them back.
  */
  {
    slug: "surf-transfers",
    name: "Surf Transfers",
    tagline: "Boards on the roof, swell on the horizon.",
    description:
      "Board-friendly vehicles and drivers who understand dawn patrol. Airport to Arugam Bay, Weligama to Hiriketiya — we move surfers and their quivers safely, all season long.",
    image: media.surfRightHander.src,
    icon: "waves",
  },
  {
    slug: "hotel-transfers",
    name: "Hotel Transfers",
    tagline: "Seamless links between every stay.",
    description:
      "Comfortable private transfers between hotels, villas and boutique stays anywhere on the island — with scenic stops, luggage handled, and zero stress between check-outs and check-ins.",
    image: commonsPlaces.Bentota.src,
    icon: "hotel",
  },
  {
    slug: "custom-itineraries",
    name: "Custom Travel Itineraries",
    tagline: "Designed around you, down to the last sunset.",
    description:
      "Tell us your dates, pace and dreams — honeymoon, family adventure, photography trip — and we'll design a bespoke route with hand-picked stays, experiences and a dedicated driver.",
    image: commonsPlaces.Delft.src,
    icon: "route",
  },
];

/* ----------------------------------- Fleet ------------------------------------ */

/**
 * How many people a vehicle takes, in words rather than a number.
 *
 * `passengers` is an integer and stays one: it sorts, it seeds the CMS field,
 * and the admin form edits it. What it cannot express is that three seats is
 * three adults *or* two adults and three children — the same bench, a very
 * different trip, and the question every family asks before anything else.
 *
 * Keyed by slug and resolved in code, so a vehicle says the same thing whether
 * it came from the seed below or from the `vehicles` table. Adding a column
 * would mean a migration and two places to keep in step; this needs neither.
 * Anything absent falls back to the plain count.
 */
const seatingNotes: Record<string, string> = {
  "executive-sedan": "Up to 3 adults, or 2 adults with up to 3 children",
};

export const seating = (v: Pick<Vehicle, "slug" | "passengers">): string =>
  seatingNotes[v.slug] ?? `Up to ${v.passengers} guests`;

export type Vehicle = {
  slug: string;
  name: string;
  category: string;
  passengers: number;
  luggage: string;
  features: string[];
  idealFor: string;
  image: string;
};

export const fleet: Vehicle[] = [
  {
    slug: "executive-sedan",
    name: "Executive Sedan",
    category: "Comfort · 3 adults, or a family with children",
    passengers: 3,
    luggage: "2 large + 2 cabin",
    features: [
      "Full air-conditioning",
      "Reclining leather seats",
      "USB charging & Wi-Fi hotspot",
      "Complimentary bottled water",
    ],
    idealFor:
      "Couples, business travellers, and families travelling with young children.",
    image: media.colomboLotusTower.src,
  },
  {
    slug: "premium-suv",
    name: "Premium SUV",
    category: "Luxury · up to 4 guests",
    passengers: 4,
    luggage: "3 large + 2 cabin",
    features: [
      "Elevated seating & panoramic views",
      "Dual-zone climate control",
      "Extra legroom for long routes",
      "Child seats on request",
    ],
    idealFor: "Families and hill-country roads in complete comfort.",
    image: commonsPlaces["Nuwara Eliya"].src,
  },
  {
    slug: "high-roof-van",
    name: "High-Roof Van (KDH)",
    category: "Group · up to 8 guests",
    passengers: 8,
    luggage: "6 large + surfboards",
    features: [
      "Captain-style seating",
      "Powerful rear A/C",
      "Roof racks for boards & gear",
      "Cooler box on request",
    ],
    idealFor: "Small groups, surf trips and multi-day circuits.",
    image: media.whiskyPoint.src,
  },
  {
    slug: "mini-coach",
    name: "Mini Coach",
    category: "Groups · up to 22 guests",
    passengers: 22,
    luggage: "Full luggage hold",
    features: [
      "Reclining coach seats",
      "PA system for guides",
      "Large windows for sightseeing",
      "Experienced long-route drivers",
    ],
    idealFor: "Wedding parties, retreats and larger tour groups.",
    image: commonsPlaces.Pasikuda.src,
  },
  {
    slug: "safari-jeep",
    name: "Safari Jeep 4×4",
    category: "Wild · up to 6 guests",
    passengers: 6,
    luggage: "Day packs & camera gear",
    features: [
      "Open-top game-viewing design",
      "Experienced tracker-drivers",
      "Park permits arranged",
      "Binoculars provided",
    ],
    idealFor: "Yala, Udawalawe, Wilpattu and Minneriya safaris.",
    image: commonsSubjects.yalaSafariJeeps.src,
  },
];

/* ---------------------------------- Reviews ----------------------------------- */

export type Review = {
  name: string;
  country: string;
  trip: string;
  rating: number;
  text: string;
};

/**
 * Guest reviews.
 *
 * INTENTIONALLY EMPTY. This array previously held eight invented testimonials
 * attributed to named individuals in the UK, Sweden, Germany, Japan, Australia,
 * France, the US and the Netherlands. They were removed in Phase 0 because:
 *
 *   1. The project's own content rules forbid fabricated reviews.
 *   2. Attributing invented praise to named consumers is a regulatory problem
 *      in exactly the markets those names came from (UK CPUTR / EU UCPD).
 *   3. Any `aggregateRating` structured data built on them would breach
 *      Google's review-snippet policy and risk a manual action.
 *
 * To populate: add real reviews through the admin dashboard (Reviews), ideally
 * with a link back to the original Google, TripAdvisor or written source. One
 * verifiable review is worth more here than eight invented ones.
 *
 * Every component that consumes this handles the empty case by hiding its
 * section entirely — see ReviewCard call sites.
 */
export const reviews: Review[] = [];

/* ---------------------------------- Gallery ----------------------------------- */

export type GalleryItem = {
  src: string;
  caption: string;
  category: "Beaches" | "Wildlife" | "Hills" | "Culture" | "Surf" | "Journeys";
};

export const gallery: GalleryItem[] = [
  { src: media.nineArchBridge.src, caption: "The Nine Arch Bridge, Demodara", category: "Journeys" },
  { src: commonsPlaces.Tangalle.src, caption: "Goyambokka Beach, Tangalle", category: "Beaches" },
  { src: media.yalaLeopard.src, caption: "Leopard, Yala National Park", category: "Wildlife" },
  { src: commonsPlaces.Haputale.src, caption: "Tea country from Lipton's Seat, Haputale", category: "Hills" },
  { src: media.sigiriyaRock.src, caption: "Sigiriya — the Lion Rock", category: "Culture" },
  { src: media.surfRightHander.src, caption: "A clean right-hander, east coast", category: "Surf" },
  { src: commonsPlaces.Habarana.src, caption: "Wild elephant, Hurulu Eco Park", category: "Wildlife" },
  { src: media.mirissaCoconutHill.src, caption: "Coconut Tree Hill, Mirissa", category: "Beaches" },
  { src: media.kandyTempleMoat.src, caption: "The Temple of the Tooth, Kandy", category: "Culture" },
  { src: commonsPlaces["Nuwara Eliya"].src, caption: "Nuwara Eliya from the ridge", category: "Hills" },
  { src: commonsSubjects.hikkaduwaReef.src, caption: "The coral sanctuary at Hikkaduwa", category: "Wildlife" },
  { src: commonsPlaces.Negombo.src, caption: "Fishing boats at rest, Negombo", category: "Beaches" },
];
