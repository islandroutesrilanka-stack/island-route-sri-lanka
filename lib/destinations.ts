import { img } from "./images";

export type Destination = {
  slug: string;
  name: string;
  region: string;
  headline: string;
  description: string;
  bestFor: string[];
  bestTime: string;
  highlights: string[];
  image: string;
};

export const destinations: Destination[] = [
  {
    slug: "sigiriya",
    name: "Sigiriya",
    region: "Cultural Triangle",
    headline: "A palace in the sky, painted fifteen centuries ago",
    description:
      "Rising two hundred metres above jungle canopy, the Lion Rock is Sri Lanka's single most extraordinary sight — a 5th-century royal citadel of frescoes, mirror walls and water gardens. Base yourself here for Dambulla's cave temples, Minneriya's elephants and slow village life among the paddies.",
    bestFor: ["History", "Sunrise climbs", "Wildlife nearby"],
    bestTime: "Year-round · driest Jan–Sep",
    highlights: ["Sigiriya Rock Fortress", "Pidurangala sunrise viewpoint", "Dambulla cave temples", "Minneriya elephant gathering"],
    image: img.sigiriya,
  },
  {
    slug: "kandy",
    name: "Kandy",
    region: "Hill Capital",
    headline: "The last royal city, wrapped around a sacred lake",
    description:
      "Home to the Temple of the Sacred Tooth Relic and gateway to the highlands, Kandy blends devotion, colonial architecture and misty hills. Time your visit for evening puja at the temple, then lose an afternoon in the Peradeniya Royal Botanical Gardens.",
    bestFor: ["Culture", "Temples", "Gardens"],
    bestTime: "Dec–Apr · Esala Perahera in Jul/Aug",
    highlights: ["Temple of the Sacred Tooth", "Peradeniya Botanical Gardens", "Kandy Lake loop", "Highland railway departure point"],
    image: img.templeKandy,
  },
  {
    slug: "ella",
    name: "Ella",
    region: "Hill Country",
    headline: "Cloud forests, waterfalls and the world's prettiest railway",
    description:
      "A laid-back mountain village strung between two peaks, Ella is hiking trails at dawn, café culture by noon and train-spotting at the Nine Arch Bridge in between. The Kandy–Ella railway finale is the most beautiful stretch of track in Asia.",
    bestFor: ["Hiking", "Train rides", "Café culture"],
    bestTime: "Jan–Sep",
    highlights: ["Nine Arch Bridge", "Little Adam's Peak", "Ella Rock hike", "Rawana Falls"],
    image: img.heroTrain,
  },
  {
    slug: "nuwara-eliya",
    name: "Nuwara Eliya",
    region: "Tea Country",
    headline: "Little England, two thousand metres up",
    description:
      "Rose gardens, Tudor cottages and lake mists — Sri Lanka's highest town is the heart of Ceylon tea country. Tour a working factory, sip single-estate brews where they're grown, and hike the otherworldly Horton Plains plateau to World's End.",
    bestFor: ["Tea estates", "Cool climate", "Colonial charm"],
    bestTime: "Feb–May · Apr 'season' festivities",
    highlights: ["Tea factory tours & tastings", "Horton Plains & World's End", "Gregory Lake", "Ramboda & Devon Falls"],
    image: img.mistyHills,
  },
  {
    slug: "yala",
    name: "Yala",
    region: "Deep South",
    headline: "Leopard country — the island at its wildest",
    description:
      "Yala National Park holds the densest leopard population on Earth, sharing its lagoons and rock outcrops with elephants, sloth bears, crocodiles and painted storks. Dawn drives give the best light and sightings; we arrange private jeeps only.",
    bestFor: ["Leopards", "Photography", "Big wildlife"],
    bestTime: "Feb–Jul · park may close Sep–Oct",
    highlights: ["Private dawn game drives", "Leopard & sloth bear tracking", "Coastal dunes & lagoons", "Bundala birdlife nearby"],
    image: img.leopard,
  },
  {
    slug: "galle",
    name: "Galle",
    region: "South Coast",
    headline: "A 17th-century Dutch fort, alive with cafés and craft",
    description:
      "Inside Galle Fort's ramparts, cinnamon-scented lanes hide boutique hotels, galleries and rooftop bars. Beyond the walls: stilt fishermen, turtle beaches, and jungle-backed bays like Unawatuna and Dalawella with its famous palm swing.",
    bestFor: ["Boutique stays", "History", "Beaches nearby"],
    bestTime: "Nov–Apr",
    highlights: ["Rampart sunset walk", "Dutch-era architecture", "Unawatuna & Jungle Beach", "Koggala stilt fishermen"],
    image: img.beachChairs,
  },
  {
    slug: "mirissa",
    name: "Mirissa",
    region: "South Coast",
    headline: "Blue whales at breakfast, beach bonfires by night",
    description:
      "A crescent of golden sand famous for the biggest animals that have ever lived — blue whales cruise offshore from November to April. Add Coconut Tree Hill at sunrise, snorkelling with turtles, and some of the island's best seafood.",
    bestFor: ["Whale watching", "Beach life", "Seafood"],
    bestTime: "Nov–Apr",
    highlights: ["Blue whale excursions", "Coconut Tree Hill", "Turtle snorkelling", "Secret Beach coves"],
    image: img.beachPalms,
  },
  {
    slug: "arugam-bay",
    name: "Arugam Bay",
    region: "East Coast",
    headline: "One of the world's great right-hand point breaks",
    description:
      "From May to September the east coast wakes up: Main Point peels for hundreds of metres, and a barefoot village of surf camps and juice bars hums beneath the palms. Rest days mean lagoon safaris, Kumana's wild elephants and empty golden beaches.",
    bestFor: ["Surfing", "Beach village vibes", "East-coast season"],
    bestTime: "May–Sep",
    highlights: ["Main Point & Whiskey Point", "Peanut Farm & Elephant Rock", "Kumana National Park", "Pottuvil lagoon safari"],
    image: img.surfWave,
  },
  {
    slug: "colombo",
    name: "Colombo",
    region: "Western Capital",
    headline: "Temples, tuk-tuks and a fast-rising food scene",
    description:
      "Most journeys begin or end in the capital — give it a day. Colonial-era Fort and Pettah's bazaars, Gangaramaya Temple, Galle Face Green at sunset, and a dinner scene that now rivals any city in South Asia.",
    bestFor: ["City culture", "Food", "First/last nights"],
    bestTime: "Year-round",
    highlights: ["Gangaramaya Temple", "Pettah markets", "Galle Face sunset", "Independence Square"],
    image: img.cityLights,
  },
];

export const getDestination = (slug: string) =>
  destinations.find((d) => d.slug === slug);
