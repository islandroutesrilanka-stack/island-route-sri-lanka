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
    image: img.cityLights,
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
  {
    slug: "day-tours",
    name: "Day Tours",
    tagline: "One perfect day, expertly arranged.",
    description:
      "Sigiriya at sunrise, Galle Fort at golden hour, Kandy's temples, Ella's bridges. Private day tours from wherever you're staying, paced entirely around you.",
    image: img.sigiriya,
    icon: "sun",
  },
  {
    slug: "multi-day-tours",
    name: "Multi-Day Tours",
    tagline: "The whole island, woven into one journey.",
    description:
      "From five-day highlights to grand three-week circuits — beaches, tea country, ancient cities and safaris connected by one trusted driver and a route built around your interests.",
    image: img.heroTrain,
    icon: "map",
  },
  {
    slug: "safari-tours",
    name: "Safari Tours",
    tagline: "Leopards, elephants and wild dawns.",
    description:
      "Private jeep safaris in Yala, Udawalawe, Wilpattu and Minneriya with experienced trackers. We arrange park permits, the right jeep, and the timing that gives you the best sightings.",
    image: img.safariJeep,
    icon: "binoculars",
  },
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
    image: img.cityLights,
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

export const reviews: Review[] = [
  {
    name: "Charlotte & James",
    country: "United Kingdom",
    trip: "14-day Grand Island Circuit",
    rating: 5,
    text: "From the moment we landed to our final sunset in Galle, everything was flawless. Our driver felt like a friend who happened to know every hidden corner of Sri Lanka. The best travel decision we've ever made.",
  },
  {
    name: "Mia Lindqvist",
    country: "Sweden",
    trip: "Surf transfers, Arugam Bay season",
    rating: 5,
    text: "Boards handled with care, 4 a.m. starts with a smile, and always on time. Island Route moved our whole crew across the island twice. Wouldn't trust anyone else with a quiver.",
  },
  {
    name: "The Fischer Family",
    country: "Germany",
    trip: "10-day family tour with safari",
    rating: 5,
    text: "Travelling with two young kids, we needed patience and flexibility — we got both, plus child seats, snack stops and a leopard sighting in Yala the children will never forget.",
  },
  {
    name: "Aiko & Kenji",
    country: "Japan",
    trip: "Honeymoon — custom itinerary",
    rating: 5,
    text: "They designed our honeymoon around tea country sunrises and quiet beaches. Every hotel pickup was seamless and the private candlelit dinner surprise in Ella made the trip.",
  },
  {
    name: "Daniel O'Connor",
    country: "Australia",
    trip: "Airport transfer + Kandy day tour",
    rating: 5,
    text: "Flight landed three hours late — driver was still there, name board up, zero fuss. The next day's Kandy tour was superb. Professional outfit from start to finish.",
  },
  {
    name: "Sophie Moreau",
    country: "France",
    trip: "7-day Essential Sri Lanka",
    rating: 5,
    text: "Impeccable vehicle, thoughtful pacing, and a driver-guide whose knowledge of history and food elevated everything. Sri Lanka is stunning; Island Route made it effortless.",
  },
  {
    name: "Ravi & Priya Patel",
    country: "United States",
    trip: "Hill Country & Tea Trails",
    rating: 5,
    text: "The train-and-car combination through the highlands was genius — we rode the famous blue train while our luggage travelled ahead. Five stars isn't enough.",
  },
  {
    name: "Emma Verhoeven",
    country: "Netherlands",
    trip: "Solo traveller — 12 days",
    rating: 5,
    text: "As a solo female traveller, safety was my priority. I felt completely looked after the entire trip, with total freedom to change plans. Absolutely recommend.",
  },
];

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
