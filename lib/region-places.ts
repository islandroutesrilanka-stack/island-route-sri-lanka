import type { Region } from "./regions";

/**
 * Copy for every place named in `regions[].places`.
 *
 * `lib/regions.ts` owns the mapping — which places belong to which region — and
 * is deliberately left alone. This file owns only the words: one or two lines
 * per place, written to say something true and specific rather than to fill a
 * card. Nothing here is generated; each note names a thing you can actually go
 * and see, and where a place is seasonal or oversold, it says so.
 *
 * `destinationSlug` is set only where a published guide exists at
 * /destinations/<slug>. The other twenty-two places are real stops we run and
 * have no page for yet, so their cards carry the copy without a link — which is
 * the correct behaviour until the guide is written, not a gap to paper over.
 *
 * Images follow the site rule: a place card shows a photograph only when the
 * asset's location is verified, and otherwise takes the gradient treatment. No
 * generic tropical stock stands in for a named place.
 */
export type RegionPlace = {
  name: string;
  /** The premium one-or-two-liner shown on the card. */
  note: string;
  /** Set only when /destinations/<slug> exists. */
  destinationSlug?: string;
  /** Short season note, where the place genuinely has one. */
  season?: string;
};

export const regionPlaces: Record<string, RegionPlace> = {
  /* ------------------------------ Cultural Triangle ------------------------ */
  Sigiriya: {
    name: "Sigiriya",
    destinationSlug: "sigiriya",
    note: "A fifth-century sky palace on a granite plug, reached past frescoed maidens and a mirror wall still glossy after fifteen hundred years. Climb it at opening, before the heat and the crowds find the staircase.",
  },
  Dambulla: {
    name: "Dambulla",
    note: "Five caves under an overhanging rock, painted end to end and holding some 150 Buddha images — the finest surviving temple murals on the island. The golden temple below is modern; everything worth the walk is above it.",
  },
  Polonnaruwa: {
    name: "Polonnaruwa",
    note: "The medieval capital, compact enough to see by bicycle: audience halls, a man-made sea, and the serene colossi of Gal Vihara cut straight from the granite face.",
  },
  Anuradhapura: {
    name: "Anuradhapura",
    note: "The island's first great capital and still a living pilgrimage city, where the Sri Maha Bodhi has been tended by hand for more than two thousand years. Come at dusk, when white-clad pilgrims outnumber visitors.",
  },
  Habarana: {
    name: "Habarana",
    note: "A crossroads village of tanks and scrub jungle that makes the most comfortable base in the Triangle — Sigiriya, Polonnaruwa and the elephant parks all inside an hour.",
  },

  /* -------------------------------- Hill Country --------------------------- */
  Kandy: {
    name: "Kandy",
    destinationSlug: "kandy",
    note: "The last kingdom to fall, wrapped around a lake and built around the Temple of the Sacred Tooth Relic. Arrive for the evening puja, when the drummers announce the opening of the shrine.",
  },
  Ella: {
    name: "Ella",
    destinationSlug: "ella",
    note: "A mountain village held between two peaks, with cloud forest on the doorstep and the Nine Arch Bridge a short walk down through the tea. Mornings are for the ridge; afternoons for a long lunch.",
  },
  "Nuwara Eliya": {
    name: "Nuwara Eliya",
    destinationSlug: "nuwara-eliya",
    note: "Ceylon tea's cool capital at just under 1,900 metres — clipped hedges, a hill-station hangover and working estates you can walk straight into. Nights are cold enough to want a fire.",
  },
  Haputale: {
    name: "Haputale",
    note: "A ridge town balanced on the escarpment, where the land drops away to the southern plains and the sea shows on a clear evening. Above it sits Lipton's Seat, the bench the tea baron surveyed his estates from.",
    season: "Clearest Jan–Mar",
  },
  "Horton Plains": {
    name: "Horton Plains",
    note: "High montane grassland and cloud forest at 2,100 metres, walked as one loop past Baker's Falls to World's End, where the plateau falls some nine hundred metres without warning. Be there before nine, or the mist takes it.",
    season: "Dry Jan–Mar",
  },

  /* --------------------------------- South Coast --------------------------- */
  Galle: {
    name: "Galle",
    destinationSlug: "galle",
    note: "A Dutch-walled port turned the island's most graceful small town — ramparts to walk at sunset, and a grid of cinnamon-scented lanes holding galleries, jewellers and long lunches.",
  },
  Mirissa: {
    name: "Mirissa",
    destinationSlug: "mirissa",
    note: "A crescent bay where the continental shelf runs close enough for blue whales to pass within an hour of the harbour. Small, golden, and busier than it once was — which is why we go early.",
    season: "Whales Nov–Apr",
  },
  Unawatuna: {
    name: "Unawatuna",
    note: "A sheltered horseshoe of sand, calm enough to swim all season, with Jungle Beach and the peace pagoda a short climb over the headland.",
  },
  Weligama: {
    name: "Weligama",
    note: "The long, shallow bay that teaches half the island to surf, with the stilt fishermen of the Koggala coast just along the road — these days as much performance as livelihood, and worth knowing that before you go.",
    season: "Surf Nov–Apr",
  },
  Tangalle: {
    name: "Tangalle",
    note: "Where the south coast finally empties out: a string of coves, one long wild beach, and green turtles coming ashore at Rekawa after dark.",
    season: "Turtles year-round, peak Apr–Sep",
  },

  /* -------------------------------- The Wild South ------------------------- */
  Yala: {
    name: "Yala",
    destinationSlug: "yala",
    note: "Scrub, granite outcrops and coastal lagoons holding one of the densest recorded leopard populations anywhere. Block One delivers the sightings; a private jeep and a dawn start deliver the morning.",
    season: "Best Feb–Jul",
  },
  Udawalawe: {
    name: "Udawalawe",
    note: "Open grassland around a great reservoir where elephants are all but guaranteed, in numbers and in any month — the surest big-game morning on the island.",
    season: "Year-round",
  },
  Tissamaharama: {
    name: "Tissamaharama",
    note: "The safari town: an ancient stupa, a tank thick with birdlife at first light, and ten minutes between your bed and the Yala gate.",
  },
  Bundala: {
    name: "Bundala",
    note: "A RAMSAR wetland of lagoons, dunes and salt pans that reads as quiet after Yala — until you start counting. Greater flamingos arrive with the northern winter.",
    season: "Flamingos Dec–Mar",
  },

  /* --------------------------------- East Coast ---------------------------- */
  "Arugam Bay": {
    name: "Arugam Bay",
    destinationSlug: "arugam-bay",
    note: "One of the world's great right-hand point breaks, with a barefoot village to match — wide awake from May to September, while the south coast sits under rain.",
    season: "May–Sep",
  },
  Trincomalee: {
    name: "Trincomalee",
    note: "One of the finest natural deep-water harbours on earth, with Koneswaram temple on the cliff at Swami Rock and Pigeon Island's reef a short boat ride off Nilaveli.",
    season: "May–Sep",
  },
  Pasikuda: {
    name: "Pasikuda",
    note: "A shallow, glass-flat bay you can wade a hundred metres into and still stand up — the east's most effortless swimming, and its most resort-shaped stretch of sand.",
    season: "May–Sep",
  },
  Batticaloa: {
    name: "Batticaloa",
    note: "A lagoon city of bridges, Dutch fort walls and Tamil kovils, known for the singing fish said to hum beneath Kallady bridge on still full-moon nights.",
  },

  /* ---------------------------- West Coast & Colombo ----------------------- */
  Colombo: {
    name: "Colombo",
    destinationSlug: "colombo",
    note: "Not a stopover if you give it an evening — Pettah's bazaars, Gangaramaya's magpie hoard of treasures, sea air on Galle Face Green, and a dining scene that has quietly become the region's most interesting.",
  },
  Negombo: {
    name: "Negombo",
    note: "Twenty minutes from the airport and a world softer than it: a Dutch canal, a beach of fishing catamarans, and the morning auction held on the sand.",
  },
  Bentota: {
    name: "Bentota",
    note: "Where a river meets the sea and the mangroves start. A few minutes inland sits Lunuganga, Geoffrey Bawa's country estate and the place tropical modernism was worked out over fifty years.",
    season: "Nov–Apr",
  },
  Kalpitiya: {
    name: "Kalpitiya",
    note: "A sand spit between lagoon and open ocean: flat-water kitesurfing in season, and spinner dolphins offshore in pods that run to the hundreds.",
    season: "Kite May–Oct & Dec–Mar",
  },

  /* --------------------------------- The North ----------------------------- */
  Jaffna: {
    name: "Jaffna",
    note: "A peninsula with its own language, temple architecture and palate — Nallur's gopuram, palmyra on every horizon, and a crab curry worth the drive north on its own.",
  },
  Mannar: {
    name: "Mannar",
    note: "Baobabs brought centuries ago by Arab traders, a Portuguese-Dutch fort on the water, and the sandbank chain of Adam's Bridge reaching toward India. Winter fills the salt pans with flamingos.",
    season: "Birds Nov–Mar",
  },
  Delft: {
    name: "Delft",
    note: "An hour out by ferry: coral-block walls, a Dutch colonial ruin, a solitary baobab, and herds of wild ponies descended from Portuguese stock grazing the flats.",
  },
  Wilpattu: {
    name: "Wilpattu",
    note: "The oldest and largest of the national parks, named for the villus — natural rain-fed lakes — scattered through its dry forest. Fewer jeeps than Yala, and leopards that feel found rather than delivered.",
    season: "Best Feb–Oct",
  },
};

/**
 * Resolve a region's place names to their copy, in the order regions.ts lists
 * them. A name with no entry falls through with an empty note rather than
 * throwing — a missing paragraph should not take a page down — but it will look
 * obviously unfinished in the UI, which is the intended signal.
 */
export function placesForRegion(region: Region): RegionPlace[] {
  return region.places.map(
    (name) => regionPlaces[name] ?? { name, note: "" }
  );
}
