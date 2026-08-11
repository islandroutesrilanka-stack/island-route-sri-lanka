import { img } from "./images";

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
    /* Retired: previously `cityLights`, a generic night cityscape identified
       in the media audit as not Sri Lanka. Left empty rather than swapped for
       another unverified image — the slot renders the gradient treatment. */
    image: "",
    icon: "plane",
  },
  {
    slug: "private-driver-hire",
    name: "Private Driver Hire",
    tagline: "Your own chauffeur-guide, for as long as you need.",
    description:
      "Hire a professional English-speaking chauffeur for a day, a week or your entire holiday. Your driver handles routes, tickets, restaurants and local knowledge while you simply enjoy the island.",
    image: img.drivingWheel,
    icon: "steering",
  },
  {
    slug: "taxi-services",
    name: "Taxi Services",
    tagline: "Point to point, without the haggling.",
    description:
      "Reliable, fairly-priced private taxis between any two points in Sri Lanka. Transparent quotes upfront, clean modern vehicles, and drivers who arrive on time, every time.",
    image: img.coastalDrive,
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
    image: img.surfWave,
    icon: "waves",
  },
  {
    slug: "hotel-transfers",
    name: "Hotel Transfers",
    tagline: "Seamless links between every stay.",
    description:
      "Comfortable private transfers between hotels, villas and boutique stays anywhere on the island — with scenic stops, luggage handled, and zero stress between check-outs and check-ins.",
    image: img.beachChairs,
    icon: "hotel",
  },
  {
    slug: "custom-itineraries",
    name: "Custom Travel Itineraries",
    tagline: "Designed around you, down to the last sunset.",
    description:
      "Tell us your dates, pace and dreams — honeymoon, family adventure, photography trip — and we'll design a bespoke route with hand-picked stays, experiences and a dedicated driver.",
    image: img.beachAerial,
    icon: "route",
  },
];

/* ----------------------------------- Fleet ------------------------------------ */

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
    category: "Comfort · up to 3 guests",
    passengers: 3,
    luggage: "2 large + 2 cabin",
    features: [
      "Full air-conditioning",
      "Reclining leather seats",
      "USB charging & Wi-Fi hotspot",
      "Complimentary bottled water",
    ],
    idealFor: "Couples, business travellers and airport transfers.",
    image: img.sedanNight,
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
    image: img.coastalDrive,
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
    image: img.drivingWheel,
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
    /* Retired: previously `cityLights`, a generic night cityscape identified
       in the media audit as not Sri Lanka. Left empty rather than swapped for
       another unverified image — the slot renders the gradient treatment. */
    image: "",
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
    image: img.safariJeep,
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
  { src: img.heroTrain, caption: "The iconic highland railway, Ella", category: "Journeys" },
  { src: img.beachPanorama, caption: "South coast, early morning", category: "Beaches" },
  { src: img.leopard, caption: "Leopard, Yala National Park", category: "Wildlife" },
  { src: img.mistyHills, caption: "Dawn mist over tea country", category: "Hills" },
  { src: img.sigiriya, caption: "Sigiriya — the Lion Rock", category: "Culture" },
  { src: img.surfWave, caption: "Reef break, east coast season", category: "Surf" },
  { src: img.elephants, caption: "The Gathering, Minneriya", category: "Wildlife" },
  { src: img.beachPalms, caption: "Palm-fringed shoreline, Mirissa", category: "Beaches" },
  { src: img.templeKandy, caption: "Sacred city of Kandy", category: "Culture" },
  { src: img.greenMountains, caption: "The road to Nuwara Eliya", category: "Hills" },
  { src: img.seaTurtle, caption: "Sea turtle, Hikkaduwa reef", category: "Wildlife" },
  { src: img.beachSunset, caption: "Last light, west coast", category: "Beaches" },
];
