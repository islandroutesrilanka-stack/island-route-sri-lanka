import { img } from "./images";

export type ItineraryDay = { day: string; title: string; detail: string };

export type Tour = {
  slug: string;
  title: string;
  category: "Day Tour" | "Multi-Day" | "Safari";
  duration: string;
  priceFrom: number; // USD per person, indicative
  image: string;
  excerpt: string;
  highlights: string[];
  includes: string[];
  itinerary?: ItineraryDay[];
  featured?: boolean;
  /**
   * Destinations this journey actually visits, by slug.
   *
   * Explicit because the previous approach — substring-matching the destination
   * name against title/excerpt/highlights — produced real false positives:
   * "Dalawella" matched Ella, "Tangalle" matched Galle. Each entry below is
   * taken from the tour's own itinerary or highlights, never from an incidental
   * mention in prose.
   */
  destinationSlugs?: string[];
  /**
   * Experience categories this journey genuinely covers, by slug from
   * lib/experiences.ts. Populated only from the tour's own itinerary and
   * highlights — never from an incidental word in the excerpt, for the same
   * reason destinationSlugs is explicit.
   */
  themeSlugs?: string[];
};

export const tours: Tour[] = [
  /* --------------------------------- Multi-day -------------------------------- */
  {
    slug: "essential-sri-lanka-7-days",
    destinationSlugs: ["sigiriya", "kandy", "ella", "yala", "galle"],
    themeSlugs: ["culture-heritage", "wildlife", "slow-travel"],
    title: "Essential Sri Lanka",
    category: "Multi-Day",
    duration: "7 days · 6 nights",
    priceFrom: 690,
    image: "/photography/nine-arch-bridge-demodara.jpg",
    featured: true,
    excerpt:
      "The island's greatest hits in one graceful week — ancient rock fortresses, sacred Kandy, the famous highland train, a Yala safari and a golden south-coast finale.",
    highlights: [
      "Sunrise climb of Sigiriya Rock Fortress",
      "Temple of the Sacred Tooth Relic, Kandy",
      "First-class seats on the Kandy–Ella railway",
      "Private leopard safari in Yala",
      "Galle Fort at golden hour",
    ],
    includes: [
      "Private A/C vehicle & chauffeur-guide throughout",
      "All fuel, parking, and driver accommodation",
      "Airport pickup & drop-off",
      "Bottled water daily",
      "24/7 WhatsApp support",
    ],
    itinerary: [
      { day: "Day 1", title: "Arrival → Sigiriya", detail: "Meet at Bandaranaike Airport and glide into the Cultural Triangle. Evening village walk and welcome dinner beneath the rock." },
      { day: "Day 2", title: "Sigiriya & Dambulla", detail: "Beat the heat with a sunrise ascent of the Lion Rock, then the painted cave temples of Dambulla. Optional Minneriya elephant safari at dusk." },
      { day: "Day 3", title: "Kandy", detail: "Spice gardens and a temple ceremony at the Sacred Tooth Relic, with an evening stroll around Kandy Lake." },
      { day: "Day 4", title: "The Highland Railway → Ella", detail: "Reserved seats on the world's most beautiful train ride while your driver carries the luggage ahead. Sunset at Little Adam's Peak." },
      { day: "Day 5", title: "Ella → Yala", detail: "Nine Arch Bridge at first light, Rawana Falls, then south to the safari gates. Evening at leisure." },
      { day: "Day 6", title: "Yala Safari → Galle", detail: "Dawn game drive in leopard country, then the coastal road west to the ramparts of Galle Fort." },
      { day: "Day 7", title: "Beach morning → Departure", detail: "A final swim on the south coast before a comfortable transfer to the airport or your next stay." },
    ],
  },
  {
    slug: "grand-island-circuit-14-days",
    destinationSlugs: ["sigiriya", "kandy", "nuwara-eliya", "ella", "yala", "mirissa", "galle"],
    themeSlugs: ["culture-heritage", "wildlife", "tea-country", "beaches"],
    title: "Grand Island Circuit",
    category: "Multi-Day",
    duration: "14 days · 13 nights",
    priceFrom: 1390,
    image: img.beachAerial,
    featured: true,
    excerpt:
      "The complete Sri Lanka — ancient kingdoms, misty tea estates, two contrasting safaris, whale-rich seas and slow days on the island's finest beaches.",
    highlights: [
      "Anuradhapura & Polonnaruwa ancient cities",
      "Sigiriya and the Cultural Triangle",
      "Tea-estate stay in Nuwara Eliya",
      "Yala + Udawalawe twin safaris",
      "Whale watching in Mirissa (in season)",
      "Galle Fort, Unawatuna & hidden south-coast bays",
    ],
    includes: [
      "Private A/C vehicle & chauffeur-guide throughout",
      "All fuel, parking, and driver accommodation",
      "Airport pickup & drop-off",
      "Highland railway reservations",
      "24/7 WhatsApp support",
    ],
    itinerary: [
      { day: "Days 1–3", title: "Negombo → Ancient Cities", detail: "Ease in on the lagoon coast, then journey through Anuradhapura's sacred stupas and Polonnaruwa's stone gardens by bicycle." },
      { day: "Days 4–5", title: "Sigiriya & Knuckles foothills", detail: "The Lion Rock at dawn, cave temples at Dambulla and an elephant safari at Minneriya." },
      { day: "Days 6–7", title: "Kandy → Tea Country", detail: "The sacred city, then climbing roads through emerald estates to a colonial-era tea bungalow in Nuwara Eliya." },
      { day: "Days 8–9", title: "The Railway → Ella", detail: "The celebrated blue train through cloud forest, Nine Arch Bridge and highland hikes." },
      { day: "Days 10–11", title: "Safari Country", detail: "Udawalawe's elephant herds and Yala's elusive leopards, with a night between the parks." },
      { day: "Days 12–13", title: "The South Coast", detail: "Whales at Mirissa, snorkelling coves, and lazy afternoons behind Galle's Dutch ramparts." },
      { day: "Day 14", title: "Departure", detail: "A scenic expressway transfer back to the airport — or extend with extra beach days." },
    ],
  },
  {
    slug: "hill-country-tea-trails-5-days",
    destinationSlugs: ["colombo", "kandy", "nuwara-eliya", "ella"],
    themeSlugs: ["tea-country", "nature", "slow-travel"],
    title: "Hill Country & Tea Trails",
    category: "Multi-Day",
    duration: "5 days · 4 nights",
    priceFrom: 490,
    image: img.mistyHills,
    excerpt:
      "A slow, cool-climate escape through Sri Lanka's tea heartland — waterfalls, colonial hill stations, cloud-forest hikes and the island's most famous train ride.",
    highlights: [
      "Private tea-factory tour & tasting",
      "Horton Plains & World's End (optional)",
      "Kandy–Ella railway in reserved seats",
      "Little Adam's Peak & Nine Arch Bridge",
    ],
    includes: [
      "Private A/C vehicle & chauffeur-guide throughout",
      "All fuel, parking, and driver accommodation",
      "Railway reservations",
      "24/7 WhatsApp support",
    ],
    itinerary: [
      { day: "Day 1", title: "Colombo → Kandy", detail: "Riverside lunch en route, spice garden stop and an evening lakeside walk in the last royal capital." },
      { day: "Day 2", title: "Kandy → Nuwara Eliya", detail: "Ramboda Falls and a working tea factory, arriving into 'Little England' for a fireside evening." },
      { day: "Day 3", title: "Horton Plains", detail: "An early start across the misty plateau to World's End's kilometre-high cliff, afternoon at leisure." },
      { day: "Day 4", title: "The Railway → Ella", detail: "The most scenic stretch of track on the island, then sunset from Little Adam's Peak." },
      { day: "Day 5", title: "Ella → Onward", detail: "Nine Arch Bridge at dawn before we deliver you to the coast, the airport or your next adventure." },
    ],
  },
  {
    slug: "wild-coast-safari-beaches-10-days",
    destinationSlugs: ["yala", "mirissa"],
    themeSlugs: ["wildlife", "beaches"],
    title: "Wild Coast — Safari & Beaches",
    category: "Multi-Day",
    duration: "10 days · 9 nights",
    priceFrom: 980,
    image: img.leopard,
    excerpt:
      "For wildlife lovers and beach dreamers: three national parks, river safaris, and a slow drift down the south coast's most beautiful bays.",
    highlights: [
      "Yala, Udawalawe & Bundala parks",
      "Elephant Transit Home visit",
      "Whale watching in Mirissa (Nov–Apr)",
      "Hiriketiya, Tangalle & Unawatuna beaches",
    ],
    includes: [
      "Private A/C vehicle & chauffeur-guide throughout",
      "All fuel, parking, and driver accommodation",
      "Safari jeep coordination",
      "24/7 WhatsApp support",
    ],
  },
  {
    slug: "surf-soul-east-coast-8-days",
    destinationSlugs: ["arugam-bay"],
    themeSlugs: ["surf-ocean", "wildlife"],
    title: "Surf & Soul — East Coast",
    category: "Multi-Day",
    duration: "8 days · 7 nights",
    priceFrom: 720,
    image: img.surfWave,
    excerpt:
      "Arugam Bay season done properly — dawn patrol transfers to Main Point, Whiskey Point and Peanut Farm, with a lagoon safari and Kumana wildlife on rest days.",
    highlights: [
      "Board-friendly vehicle all week",
      "Dawn transfers to the day's best break",
      "Kumana National Park safari",
      "Pottuvil lagoon mangrove tour",
    ],
    includes: [
      "Private board-racked vehicle & driver",
      "All fuel and parking",
      "Flexible daily scheduling around swell",
      "24/7 WhatsApp support",
    ],
  },

  /* ---------------------------------- Day tours -------------------------------- */
  {
    slug: "sigiriya-dambulla-day-tour",
    destinationSlugs: ["sigiriya"],
    themeSlugs: ["culture-heritage"],
    title: "Sigiriya & Dambulla in a Day",
    category: "Day Tour",
    duration: "Full day · from Colombo/Kandy/Negombo",
    priceFrom: 95,
    image: img.sigiriya,
    featured: true,
    excerpt:
      "Climb the 1,600-year-old Lion Rock and wander the golden cave temples of Dambulla on a perfectly-paced private day trip.",
    highlights: [
      "Sigiriya Rock Fortress climb",
      "Dambulla cave temple complex",
      "Traditional Sri Lankan lunch stop",
      "Optional village catamaran ride",
    ],
    includes: ["Private car & driver", "Fuel & parking", "Bottled water", "Flexible pickup time"],
  },
  {
    slug: "kandy-cultural-day-tour",
    destinationSlugs: ["kandy"],
    themeSlugs: ["culture-heritage", "tea-country"],
    title: "Kandy — The Sacred City",
    category: "Day Tour",
    duration: "Full day · from Colombo/Negombo",
    priceFrom: 85,
    image: img.templeKandy,
    excerpt:
      "Temples, royal gardens and highland air: the Temple of the Sacred Tooth, Peradeniya Botanical Gardens and a scenic hill-road return.",
    highlights: [
      "Temple of the Sacred Tooth Relic",
      "Royal Botanical Gardens, Peradeniya",
      "Kandy Lake & city viewpoint",
      "Tea factory visit en route",
    ],
    includes: ["Private car & driver", "Fuel & parking", "Bottled water", "Flexible pickup time"],
  },
  {
    slug: "ella-nine-arch-day-tour",
    destinationSlugs: ["ella"],
    themeSlugs: ["nature", "slow-travel"],
    title: "Ella & the Nine Arch Bridge",
    category: "Day Tour",
    duration: "Full day · from south coast/hill country",
    priceFrom: 80,
    image: img.heroTrain,
    excerpt:
      "Watch the blue train cross the jungle-wrapped Nine Arch Bridge, hike Little Adam's Peak, and cool off at Rawana Falls.",
    highlights: [
      "Nine Arch Bridge train crossing",
      "Little Adam's Peak sunrise hike",
      "Rawana waterfall",
      "Ella town café stop",
    ],
    includes: ["Private car & driver", "Fuel & parking", "Bottled water", "Flexible pickup time"],
  },
  {
    slug: "galle-south-coast-day-tour",
    destinationSlugs: ["galle"],
    themeSlugs: ["culture-heritage", "beaches"],
    title: "Galle Fort & the South Coast",
    category: "Day Tour",
    duration: "Full day · from Colombo/south coast",
    priceFrom: 75,
    image: img.beachChairs,
    excerpt:
      "Cinnamon-scented lanes inside a 17th-century Dutch fort, stilt-fishermen coastline, a turtle hatchery and the day's best beach.",
    highlights: [
      "Galle Fort ramparts walk",
      "Koggala stilt fishermen",
      "Sea turtle hatchery visit",
      "Sunset at Unawatuna or Dalawella",
    ],
    includes: ["Private car & driver", "Fuel & parking", "Bottled water", "Flexible pickup time"],
  },

  /* ----------------------------------- Safari ---------------------------------- */
  {
    slug: "yala-leopard-safari",
    destinationSlugs: ["yala"],
    themeSlugs: ["wildlife"],
    title: "Yala Leopard Safari",
    category: "Safari",
    duration: "Half or full day · dawn & dusk drives",
    priceFrom: 110,
    image: img.leopard,
    featured: true,
    excerpt:
      "One of the highest leopard densities anywhere, plus elephants, sloth bears and crocodile-lined lagoons — tracked from a private 4×4 with an experienced driver.",
    highlights: [
      "Private jeep — never shared",
      "Experienced tracker-driver",
      "Park permits arranged",
      "Best-light dawn or dusk timing",
    ],
    includes: ["Private 4×4 jeep", "Park entrance coordination", "Hotel pickup nearby", "Binoculars & water"],
  },
  {
    slug: "minneriya-elephant-gathering",
    destinationSlugs: ["sigiriya"],
    themeSlugs: ["wildlife"],
    title: "Minneriya — The Gathering",
    category: "Safari",
    duration: "Half day · afternoon drive",
    priceFrom: 90,
    image: img.elephants,
    excerpt:
      "In season, hundreds of wild elephants converge on Minneriya's ancient reservoir — one of Asia's greatest wildlife spectacles, minutes from Sigiriya.",
    highlights: [
      "Asia's largest elephant gathering (Aug–Oct)",
      "Private jeep with viewing roof",
      "Combines perfectly with Sigiriya",
      "Expert naturalist drivers",
    ],
    includes: ["Private 4×4 jeep", "Park entrance coordination", "Hotel pickup nearby", "Binoculars & water"],
  },
  {
    slug: "udawalawe-elephant-safari",
    destinationSlugs: [],
    themeSlugs: ["wildlife"],
    title: "Udawalawe Elephant Safari",
    category: "Safari",
    duration: "Half day · dawn or dusk",
    priceFrom: 85,
    image: img.elephantHerd,
    excerpt:
      "Almost guaranteed elephant encounters on open grassland beneath the highland escarpment, with a visit to the famous orphan Elephant Transit Home.",
    highlights: [
      "Reliable year-round elephant herds",
      "Elephant Transit Home feeding time",
      "Open savannah photography",
      "En-route stop between hills & coast",
    ],
    includes: ["Private 4×4 jeep", "Park entrance coordination", "Hotel pickup nearby", "Binoculars & water"],
  },
];

export const featuredTours = tours.filter((t) => t.featured);
export const getTour = (slug: string) => tours.find((t) => t.slug === slug);
