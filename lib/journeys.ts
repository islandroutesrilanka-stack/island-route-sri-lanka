import type { Tour } from "./tours";
import { commonsPlaces } from "./media/commons";

/**
 * The premium journey collection.
 *
 * Seven signature routes written to sit alongside the existing catalogue rather
 * than replace it overnight. They satisfy the same `Tour` contract, so every
 * surface already built — /tours, /tours/[slug], /experiences/[slug], the
 * homepage rails, the planner's filters — renders them without a single change.
 *
 * Field mapping, since the brief used slightly different names:
 *   brief_description  → `excerpt`     (the card and meta-description line)
 *   destinations       → `destinationSlugs` for places with a published guide,
 *                        plus the full route in `itinerary`. The slugs are not
 *                        a summary of the route: they are the subset that has a
 *                        page to link to. Anuradhapura, Jaffna and Mannar are
 *                        real stops with no guide yet, so they live in the
 *                        itinerary only — a link to a 404 is worse than no link.
 *
 * Between them these seven cover all twelve experience categories, which is the
 * point: `publishedExperiences()` derives /experiences from `themeSlugs`, so
 * adopting this collection publishes the five categories currently sitting
 * empty (food, wellness, adventure, local-life, luxury).
 *
 * THESE ROUTES CARRY NO PRICE, by design. They used to hold an indicative
 * per-person figure at twin share, which bundled accommodation and therefore
 * could not stay true: hotel tariffs move by season and by lead time, so a
 * shelf price is stale the week it is published. Cost is now composed from the
 * transport day rate in lib/pricing.ts — vehicle × days — and the stays are the
 * guest's own, or ours to recommend when they ask. Do not reintroduce a
 * `priceFrom` field here; `Tour` no longer has one.
 *
 * The `includes` lines below therefore describe what is genuinely in the
 * transport service plus what the route delivers — not accommodation. They
 * used to open with a hotel line ("Boutique and heritage accommodation,
 * breakfast daily") which was the one promise here we could not keep: we do
 * not hold the rooms, take the money for them, or own the cancellation terms.
 * Hotels are an opt-in service the booking form asks about, and the enquiry
 * says so in plain words. Do not put accommodation back into `includes`.
 *
 * Seasonality is stated inside the copy, never implied. The east and the north
 * run May–September; the south and west run November–April. Selling an east
 * coast week in January is how a good operator loses a review.
 */
export const journeys: Tour[] = [
  /* ------------------------------------------------------------------ 01 ---
     The one most first-time visitors are describing when they write to us.
     It leads the collection deliberately: /tours renders in array order and
     the homepage takes featuredTours[0] as its hero, so position here is the
     whole of the decision. Five beds in nine days, each stop earning its
     nights — the Cultural Triangle, the last kingdom, the tea, a park, and
     the sea. Nothing on this route is a detour from it. */
  {
    slug: "classic-all-island-route",
    title: "The Classic All-Island Route",
    category: "Multi-Day",
    duration: "9 days · 8 nights",
    image: "/photography/nine-arch-bridge-demodara.jpg",
    featured: true,
    destinationSlugs: ["sigiriya", "kandy", "ella", "mirissa", "galle"],
    /* Days 2 and 6 — two real stops with no guide page to link to yet. */
    storyImages: [commonsPlaces.Dambulla.src, commonsPlaces.Udawalawe.src],
    themeSlugs: [
      "culture-heritage",
      "tea-country",
      "wildlife",
      "beaches",
      "surf-ocean",
    ],
    excerpt:
      "The island as most people first picture it, in the order that actually drives well: a palace on a granite plug, a temple that keeps a relic, the ridge road through working tea, elephants at dusk in Udawalawe, and two nights where the road finally runs out at the sea. Five beds, nine days, nothing doubled back on.",
    highlights: [
      "Sigiriya at opening, on the stairs before the rock face warms",
      "Dambulla's five painted caves in the low light of late afternoon",
      "Evening puja at the Temple of the Sacred Tooth Relic, when the drums open the shrine",
      "The climb to Ella through working tea, with a factory floor on the way",
      "Little Adam's Peak at first light, and Nine Arch Bridge from the tea path",
      "A private jeep at Udawalawe for the last two hours of light",
      "Hiriketiya's horseshoe bay, and Galle Fort's ramparts an hour up the coast",
    ],
    includes: [
      "Private A/C vehicle & chauffeur-guide throughout",
      "All fuel, tolls, parking and the driver's own costs",
      "Private 4x4 jeep and tracker for the Udawalawe game drive",
      "Udawalawe national park entry and permits",
      "Sigiriya and Dambulla site tickets, and temple donations",
      "A shortlist of stays at each of the five stops, on request",
      "Airport pickup & drop-off, bottled water daily",
      "24/7 WhatsApp support",
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Airport → Sigiriya",
        detail:
          "Met in the arrivals hall and north-east through coconut country and paddy — three and a half hours on good road, which puts you at the foot of the rock with the evening still in hand. Nothing is asked of you tonight.",
      },
      {
        day: "Day 2",
        title: "Sigiriya & Dambulla",
        detail:
          "At the gate for opening, up past the frescoed maidens and the mirror wall to a palace built on the summit of a granite plug. Pidurangala across the valley instead, if you would rather photograph Sigiriya than stand on it. Dambulla's five cave temples later, when the light comes in low and the murals do what they were painted to do.",
      },
      {
        day: "Day 3",
        title: "Sigiriya → Kandy",
        detail:
          "South through Matale, where the spice gardens are a genuine stop rather than a shopping one. Into the last kingdom to fall by mid-afternoon, and at the Temple of the Sacred Tooth Relic for the evening puja — the reason to be in Kandy at half past six rather than any other hour.",
      },
      {
        day: "Day 4",
        title: "Kandy → Ella",
        detail:
          "The great climb: the Ramboda road gaining a thousand metres in ninety minutes, waterfalls, and then tea in every direction. A working factory floor on the way — withering loft, roller, tasting table. Take the Nanu Oya–Ella train in observation class for the last stretch if you would rather, and your driver runs the luggage ahead by road.",
      },
      {
        day: "Day 5",
        title: "Ella",
        detail:
          "Little Adam's Peak at first light — forty minutes up, and the ridge to yourself before anyone else is on it. Nine Arch Bridge from the tea path rather than the tripods, Ravana Falls on the way back, and the rest of the day at whatever pace the altitude suggests.",
      },
      {
        day: "Day 6",
        title: "Ella → Udawalawe",
        detail:
          "Down through Ella Gap and Wellawaya, with Diyaluma's cascade an easy detour if you want it. At the park's edge by early afternoon, and a private jeep at the gate for the last two hours of light — which is when the elephants come down to the water. They are here in numbers in any month, which is why this park and not another.",
      },
      {
        day: "Day 7",
        title: "Udawalawe → the south coast",
        detail:
          "The Elephant Transit Home's morning feed, where orphans are reared for release rather than display, then two hours south to where the road runs out at the sea. Hiriketiya is a horseshoe of sand with a forgiving right in one corner and very little asked of you in the other.",
      },
      {
        day: "Day 8",
        title: "Hiriketiya, Mirissa & Galle",
        detail:
          "A full day on the coast, taken in whatever order suits: the bay in the morning, Mirissa's headland and Coconut Tree Hill before the queue forms, or an hour up to Galle to walk the fort ramparts as the light goes. Blue whales pass beyond the shelf off Mirissa between November and April, if you would rather start with a dawn boat.",
      },
      {
        day: "Day 9",
        title: "South coast → Airport",
        detail:
          "The southern expressway north — roughly three hours from Galle, four from Hiriketiya, and the only morning of the trip with a clock on it. Add a Negombo night if your flight is late.",
      },
    ],
  },

  /* ------------------------------------------------------------------ 02 --- */
  {
    slug: "cultural-odyssey",
    title: "The Cultural Odyssey",
    category: "Multi-Day",
    duration: "8 days · 7 nights",
    image: "/photography/sigiriya-rock.jpg",
    featured: true,
    destinationSlugs: ["sigiriya", "kandy"],
    /* Days 2, 4 and 5. The three ancient capitals the excerpt names but that
       `destinationSlugs` cannot carry, because none of them has a guide page. */
    storyImages: [
      commonsPlaces.Anuradhapura.src,
      commonsPlaces.Polonnaruwa.src,
      commonsPlaces.Dambulla.src,
    ],
    themeSlugs: ["culture-heritage", "local-life", "slow-travel"],
    excerpt:
      "Two thousand years of kingship in a single arc — from the tended bo tree at Anuradhapura to a sky palace on bare granite, ending with the drums of the evening puja in Kandy. Three ancient capitals, unhurried, in the right order.",
    highlights: [
      "Sri Maha Bodhi at dusk, tended by hand since the third century BC",
      "Mihintale's 1,840 steps before the stone warms",
      "Polonnaruwa by bicycle, finishing at the colossi of Gal Vihara",
      "Sigiriya at opening, past the frescoes and the mirror wall",
      "Dambulla's five painted caves in the cool of late afternoon",
      "Evening puja at the Temple of the Sacred Tooth Relic",
    ],
    includes: [
      "Private A/C vehicle & chauffeur-guide throughout",
      "Chartered licensed site guide at Anuradhapura and Polonnaruwa",
      "Cultural Triangle site tickets and temple donations",
      "All fuel, tolls, parking and the driver's own costs",
      "A shortlist of heritage stays near each night's stop, on request",
      "Airport pickup & drop-off, bottled water daily",
      "24/7 WhatsApp support",
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Arrival → Negombo",
        detail:
          "Met in the arrivals hall and driven twenty minutes to the coast rather than two hours to a city. A canal, a fishing beach, and a first night that costs you nothing in road time.",
      },
      {
        day: "Day 2",
        title: "Negombo → Anuradhapura",
        detail:
          "North through coconut country to the island's first capital. The great stupas in the afternoon, then Sri Maha Bodhi at dusk, when white-clad pilgrims outnumber visitors and the place stops being a ruin.",
      },
      {
        day: "Day 3",
        title: "Mihintale → Habarana",
        detail:
          "An early climb up the granite stairway where Buddhism arrived on the island in 247 BC, done before the heat. Afternoon transfer to Habarana and nothing asked of you after it.",
      },
      {
        day: "Day 4",
        title: "Polonnaruwa",
        detail:
          "The medieval capital, compact enough to ride: audience hall, the Quadrangle, and the reclining Buddha at Gal Vihara cut straight from the rock face. Evening game drive at Minneriya or Kaudulla, where the herds gather as the tank recedes between July and September.",
      },
      {
        day: "Day 5",
        title: "Sigiriya & Dambulla",
        detail:
          "At the gate for opening, up past the frescoed maidens and the mirror wall to the summit palace. Dambulla's cave temples later, when the light comes in low and the murals do what they were painted to do.",
      },
      {
        day: "Day 6",
        title: "Habarana → Kandy",
        detail:
          "South through Matale to the last kingdom to fall. Arrive for the evening puja, when the drummers announce the opening of the shrine — the reason to be in Kandy at 6.30pm rather than any other hour.",
      },
      {
        day: "Day 7",
        title: "Kandy",
        detail:
          "The Royal Botanical Gardens at Peradeniya in the morning, the forest of Udawattakele or the lake at your own pace after. A Kandyan dance performance in the evening if you want one.",
      },
      {
        day: "Day 8",
        title: "Kandy → Airport",
        detail:
          "Down the expressway with time in hand. Add a night in Colombo if your flight is late — the city rewards an evening.",
      },
    ],
  },

  /* ------------------------------------------------------------------ 03 --- */
  {
    slug: "sun-kissed-horizons-southern-escape",
    title: "Sun-Kissed Horizons: The Southern Escape",
    category: "Multi-Day",
    duration: "9 days · 8 nights",
    image: "/photography/mirissa-coconut-tree-hill.jpg",
    featured: true,
    destinationSlugs: ["galle", "mirissa"],
    /* Days 1, 5, 6 and 8 — the coast either side of the two towns that have
       guides. */
    storyImages: [
      commonsPlaces.Bentota.src,
      commonsPlaces.Unawatuna.src,
      commonsPlaces.Weligama.src,
      commonsPlaces.Tangalle.src,
    ],
    themeSlugs: ["beaches", "food", "wellness"],
    excerpt:
      "The south taken slowly: Bawa's gardens above the Bentota river, a Dutch fort with the sea on three sides, blue whales beyond the shelf, and a last stretch of coast at Tangalle where the crowds simply stop.",
    highlights: [
      "Lunuganga — Geoffrey Bawa's country estate, the birthplace of tropical modernism",
      "Galle Fort ramparts at sunset, and the lanes behind them at breakfast",
      "A cook's morning: market, coconut scraper, seven curries",
      "Blue and sperm whales off Mirissa, November to April",
      "Handunugoda's virgin white tea, picked without a hand touching the leaf",
      "Green turtles coming ashore at Rekawa after dark",
    ],
    includes: [
      "Private A/C vehicle & chauffeur-guide throughout",
      "All fuel, tolls, parking and the driver's own costs",
      "Private half-day cookery session with a local family",
      "Small-boat whale excursion with a licensed skipper (in season)",
      "Ayurvedic consultation and treatment at a certified centre",
      "Rekawa turtle watch with the conservation project's ranger",
      "Airport pickup & drop-off, bottled water daily",
      "24/7 WhatsApp support",
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Arrival → Bentota",
        detail:
          "Straight onto the southern expressway and out of the traffic within the hour. An afternoon on the river where it meets the sea.",
      },
      {
        day: "Day 2",
        title: "Lunuganga",
        detail:
          "A private morning at Geoffrey Bawa's country estate — the garden he worked on for fifty years and the clearest statement of what tropical modernism means. Mangrove boat on the Madu Ganga after, or nothing at all.",
      },
      {
        day: "Day 3",
        title: "Bentota → Galle",
        detail:
          "The coast road south to the fort. Check in inside the walls, then walk the ramparts as the light goes — the one hour of the Galle day that no photograph prepares you for.",
      },
      {
        day: "Day 4",
        title: "Galle",
        detail:
          "The fort on foot in the cool: Dutch Reformed Church, the lighthouse, the jewellers and the bookbinders. Afternoon at Handunugoda, where white tea is cut with gold scissors and never touched by hand.",
      },
      {
        day: "Day 5",
        title: "Unawatuna & Dalawella",
        detail:
          "A sheltered horseshoe of sand calm enough to swim all season, Jungle Beach over the headland, and turtles grazing the shallows at Dalawella. A cook's morning first: the market, then seven curries in someone's kitchen.",
      },
      {
        day: "Day 6",
        title: "Weligama → Mirissa",
        detail:
          "The bay that teaches the whole island to surf — a lesson if you want one, a long breakfast if you don't. Coconut Tree Hill in the late afternoon, before the queue forms.",
      },
      {
        day: "Day 7",
        title: "Mirissa: whales at dawn",
        detail:
          "Out before six with a licensed skipper. The continental shelf runs close to shore here, which is why blue whales pass within an hour of the harbour between November and April. Afternoon horizontal.",
      },
      {
        day: "Day 8",
        title: "→ Tangalle",
        detail:
          "East to where the coast empties out: a string of coves, one long wild beach, and Mulkirigala's rock temple inland. After dark, the Rekawa turtle watch — green turtles nesting on an unlit beach, with the project's ranger.",
      },
      {
        day: "Day 9",
        title: "Tangalle → Airport",
        detail:
          "An Ayurvedic treatment to start, then the expressway north. Roughly four hours door to terminal.",
      },
    ],
  },

  /* ------------------------------------------------------------------ 04 --- */
  {
    slug: "luxe-serenity-in-the-hills",
    title: "Luxe Serenity in the Hills",
    category: "Multi-Day",
    duration: "7 days · 6 nights",
    image: "/photography/hill-country-train.jpg",
    featured: true,
    destinationSlugs: ["kandy", "nuwara-eliya", "ella"],
    /* Days 3 and 4 — the plateau walk and the estate above Haputale. */
    storyImages: [
      commonsPlaces["Horton Plains"].src,
      commonsPlaces.Haputale.src,
    ],
    themeSlugs: ["tea-country", "nature", "luxury"],
    excerpt:
      "Six nights above fifteen hundred metres, in planters' bungalows with fires lit at dusk. Horton Plains before the mist, Lipton's Seat at sunrise, and the slow blue train down the escarpment to Ella.",
    highlights: [
      "Colonial planters' bungalows, staffed as they always were",
      "Horton Plains at first light — Baker's Falls, then World's End before nine",
      "Lipton's Seat at sunrise, above the Dambatenne estate",
      "A working factory floor: withering loft, roller, sorting room, tasting table",
      "Reserved observation-class seats on the Haputale–Ella line",
      "Nine Arch Bridge from the tea, not the tripods",
    ],
    includes: [
      "Private A/C vehicle & chauffeur-guide throughout",
      "All fuel, tolls, parking and the driver's own costs",
      "Reserved first-class observation seats, Haputale–Ella",
      "Private tea factory tour and a guided tasting with the estate's taster",
      "Horton Plains park entry and a licensed nature guide",
      "Airport pickup & drop-off, bottled water daily",
      "24/7 WhatsApp support",
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Arrival → Kandy",
        detail:
          "Expressway to the edge of the hills, then the climb. Kandy Lake in the late afternoon and an early night — the altitude does that.",
      },
      {
        day: "Day 2",
        title: "Kandy → Nuwara Eliya",
        detail:
          "The Ramboda road, gaining a thousand metres in ninety minutes: waterfalls, then the first tea. Into the estates at Labookellie, and into a bungalow with a fire by six.",
      },
      {
        day: "Day 3",
        title: "Horton Plains",
        detail:
          "Away before dawn to be at the gate when it opens. The loop takes three unhurried hours — montane grassland, Baker's Falls, and World's End, where the plateau drops some nine hundred metres. Be there before nine, when the mist closes it for the day.",
      },
      {
        day: "Day 4",
        title: "Nuwara Eliya → Haputale",
        detail:
          "A morning on a working factory floor, from withering loft to tasting table, then west along the ridge to Haputale, where the land falls away to the southern plains and the sea is visible on a clear evening.",
      },
      {
        day: "Day 5",
        title: "Lipton's Seat → Ella by rail",
        detail:
          "Up to the bench where Thomas Lipton surveyed everything he owned, at the hour it is worth doing. Then the Haputale–Ella train in observation class while your driver takes the luggage ahead by road.",
      },
      {
        day: "Day 6",
        title: "Ella",
        detail:
          "Little Adam's Peak at first light — forty minutes up, and the ridge to yourself. Nine Arch Bridge from the tea path, Ravana Falls, and Diyaluma's cascade an hour east if you want the drive.",
      },
      {
        day: "Day 7",
        title: "Ella → Airport",
        detail:
          "The long descent through Wellawaya and onto the expressway, roughly six hours with stops. Fly out in the evening, or break it with a night on the coast.",
      },
    ],
  },

  /* ------------------------------------------------------------------ 05 --- */
  {
    slug: "leopard-light-safari-journey",
    title: "Leopard Light: A Safari Journey",
    category: "Safari",
    duration: "8 days · 7 nights",
    image: "/photography/yala-leopard.jpg",
    featured: true,
    destinationSlugs: ["yala"],
    /* Days 1–6. Yala is the only park on this route with a guide page, so
       without these the one journey that visits four parks would be
       illustrated entirely by the fourth. */
    storyImages: [
      commonsPlaces.Wilpattu.src,
      commonsPlaces.Udawalawe.src,
      commonsPlaces.Bundala.src,
      commonsPlaces.Tissamaharama.src,
    ],
    themeSlugs: ["wildlife", "nature", "adventure"],
    excerpt:
      "Four parks, four different animals, and a private jeep at every gate. Wilpattu's villus for leopards found rather than delivered, Minneriya for the gathering, Udawalawe for elephants at any time of year, and Yala's Block One at dawn.",
    highlights: [
      "Wilpattu — the oldest and largest park, and the fewest jeeps",
      "The Gathering at Minneriya or Kaudulla, July to September",
      "Udawalawe, where elephants are effectively guaranteed year-round",
      "Yala Block One at opening, with the first vehicle's advantage",
      "Bundala's lagoons — greater flamingos with the northern winter",
      "A private jeep and your own tracker throughout, never a shared seat",
    ],
    includes: [
      "Private A/C vehicle & chauffeur-guide between parks",
      "Private 4x4 jeep and tracker for every game drive",
      "All national park entry fees and permits",
      "All fuel, tolls, parking and the driver's own costs",
      "Dawn departures timed to the park gates, water and a cool box in the jeep",
      "Airport pickup & drop-off, bottled water daily",
      "24/7 WhatsApp support",
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Arrival → Wilpattu",
        detail:
          "North-west from the airport, under three hours, into the buffer of the island's oldest national park. Settle in; the first drive is tomorrow, properly rested.",
      },
      {
        day: "Day 2",
        title: "Wilpattu, full day",
        detail:
          "In at opening with a packed breakfast. The park is named for its villus — natural rain-fed lakes scattered through dry forest — and it is large enough that a sighting still feels like your own.",
      },
      {
        day: "Day 3",
        title: "Wilpattu → Habarana",
        detail:
          "East to the Cultural Triangle in the morning. Evening drive at Minneriya or Kaudulla, chosen on the day by where the herds actually are; between July and September that is one of the largest gatherings of wild Asian elephants anywhere.",
      },
      {
        day: "Day 4",
        title: "Habarana → Udawalawe",
        detail:
          "A long transfer south through the hills, broken where it makes sense. Arrive for the late afternoon and the light that comes with it.",
      },
      {
        day: "Day 5",
        title: "Udawalawe",
        detail:
          "Open grassland around a great reservoir — the surest big-game morning on the island, with elephants in numbers in any month. The Elephant Transit Home's feeding in the afternoon, where orphans are reared for release rather than display.",
      },
      {
        day: "Day 6",
        title: "→ Tissamaharama & Bundala",
        detail:
          "South-east to the safari town, ten minutes from the Yala gate. Afternoon at Bundala, a RAMSAR wetland of lagoons and dunes that reads as quiet after the big parks — until you start counting birds.",
      },
      {
        day: "Day 7",
        title: "Yala, Block One at dawn",
        detail:
          "First in the queue at the gate. Block One holds one of the densest recorded leopard populations anywhere, and the difference between a good morning and a great one is being ahead of the other vehicles, not luckier than them.",
      },
      {
        day: "Day 8",
        title: "Tissamaharama → Airport",
        detail:
          "West along the coast and onto the expressway. Around five hours, or add a night at Tangalle and arrive at the terminal unhurried.",
      },
    ],
  },

  /* ------------------------------------------------------------------ 06 --- */
  {
    slug: "salt-and-season-east-coast",
    title: "Salt & Season: The East Coast Awakening",
    category: "Multi-Day",
    duration: "8 days · 7 nights",
    image: "/photography/whisky-point-lineup.jpg",
    destinationSlugs: ["arugam-bay"],
    /* Days 2–5. The whole east coast north of Arugam Bay, none of it with a
       guide page yet. */
    storyImages: [
      commonsPlaces.Trincomalee.src,
      commonsPlaces.Pasikuda.src,
      commonsPlaces.Batticaloa.src,
    ],
    themeSlugs: ["surf-ocean", "beaches", "local-life"],
    excerpt:
      "The island in reverse. From May to September, while the south sits under monsoon, the east is glass — Pigeon Island's reef, a lagoon city of bridges, and a right-hand point break that runs for two hundred metres.",
    highlights: [
      "Koneswaram temple on Swami Rock, above a thousand-foot drop to the sea",
      "Pigeon Island's reef, a short boat ride off Nilaveli",
      "Pasikuda — wade a hundred metres and still stand up",
      "Batticaloa's lagoon, Dutch walls and the singing fish of Kallady bridge",
      "Arugam Bay's Main Point at dawn, and the beach breaks when it's flat",
      "Pottuvil lagoon by paddleboard, past elephants at the treeline",
    ],
    includes: [
      "Private A/C vehicle & chauffeur-guide throughout",
      "All fuel, tolls, parking and the driver's own costs",
      "Snorkelling boat and equipment at Pigeon Island",
      "Guided lagoon paddle at Pottuvil",
      "Surf guiding and board hire at Arugam Bay",
      "Airport pickup & drop-off, bottled water daily",
      "24/7 WhatsApp support",
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Arrival → Negombo",
        detail:
          "Twenty minutes from the terminal to the coast. The east is a long drive and there is no sense starting it at midnight.",
      },
      {
        day: "Day 2",
        title: "→ Trincomalee",
        detail:
          "Across the dry zone via Habarana, roughly five hours with a stop. Trincomalee is one of the finest natural deep-water harbours on earth, and you can see why from the first ridge.",
      },
      {
        day: "Day 3",
        title: "Trincomalee",
        detail:
          "Koneswaram at Swami Rock early, then the reef at Pigeon Island — the best accessible snorkelling on the island in season. Blue whales pass offshore between May and August.",
      },
      {
        day: "Day 4",
        title: "→ Pasikuda",
        detail:
          "Two hours south to a shallow, glass-flat bay you can wade out into for a hundred metres. The most effortless swimming on the east coast, and the most resort-shaped stretch of it.",
      },
      {
        day: "Day 5",
        title: "Batticaloa",
        detail:
          "A lagoon city of bridges, Dutch fort walls and Tamil kovils — and the singing fish said to hum beneath Kallady bridge on still full-moon nights. Best heard from a boat with the engine off.",
      },
      {
        day: "Day 6",
        title: "→ Arugam Bay",
        detail:
          "South past paddy and lagoon to the surf village. Check the tide, then a first paddle out at Baby Point or Whisky Point depending on the size.",
      },
      {
        day: "Day 7",
        title: "Arugam Bay",
        detail:
          "Main Point at dawn, when the right-hander runs long and the crowd is still small. Pottuvil lagoon by paddleboard in the afternoon — mangrove channels, birds, and elephants at the treeline more often than not.",
      },
      {
        day: "Day 8",
        title: "Arugam Bay → Airport",
        detail:
          "Inland through Wellawaya and onto the expressway, six to seven hours. Break it at Ella or Udawalawe if your flight allows.",
      },
    ],
  },

  /* ------------------------------------------------------------------ 07 --- */
  {
    slug: "palmyra-and-pearl-northern-passage",
    title: "Palmyra & Pearl: The Northern Passage",
    category: "Multi-Day",
    duration: "9 days · 8 nights",
    /* This shipped empty, so the card rendered a gradient — the one journey in
       the collection with no photograph was the one selling the half of the
       island nobody has pictured. Nallur's gopuram is the image the copy already
       promises. Referenced through the Commons collection rather than as a bare
       path because that is where the CC BY-SA attribution lives. */
    image: commonsPlaces.Jaffna.src,
    /* Days 2–9. This journey has no `destinationSlugs` at all — not an
       oversight: every stop on it is somewhere the site has yet to publish a
       guide for, which is precisely what makes it the northern passage. So
       these four are the only photography it has beyond its own card. */
    storyImages: [
      commonsPlaces.Mannar.src,
      commonsPlaces.Delft.src,
      commonsPlaces.Anuradhapura.src,
      commonsPlaces.Wilpattu.src,
    ],
    themeSlugs: ["culture-heritage", "local-life", "slow-travel"],
    excerpt:
      "The half of the island most itineraries still skip: baobabs on Mannar brought by Arab traders, wild ponies on Delft, Nallur's gopuram at festival pitch, and a Jaffna table that tastes like nowhere else in the country.",
    highlights: [
      "Wilpattu on the way north, with the villus to yourself",
      "Mannar's baobabs, Dutch fort, and the sandbanks of Adam's Bridge",
      "Nallur Kandaswamy Kovil, and the rebuilt Jaffna Public Library",
      "Delft Island by ferry — coral-block walls and wild ponies",
      "Nagadeepa, reached by causeway and a short crossing",
      "Jaffna crab curry, palmyra toddy, and odiyal kool at the source",
    ],
    includes: [
      "Private A/C vehicle & chauffeur-guide throughout",
      "All fuel, tolls, parking and the driver's own costs",
      "Tamil-speaking guide for the peninsula",
      "Delft and Nagadeepa ferry crossings, arranged and timed",
      "Private jeep and tracker for the Wilpattu game drive",
      "Airport pickup & drop-off, bottled water daily",
      "24/7 WhatsApp support",
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Arrival → Negombo",
        detail:
          "A short first hop from the terminal to the coast, and an early start banked for tomorrow.",
      },
      {
        day: "Day 2",
        title: "→ Wilpattu",
        detail:
          "North along the Puttalam road into the island's oldest national park. An afternoon drive among the villus, where leopards feel genuinely found rather than delivered.",
      },
      {
        day: "Day 3",
        title: "Wilpattu → Mannar",
        detail:
          "Onto the island by causeway. Baobabs that arrived with Arab traders centuries ago, a Portuguese-Dutch fort on the water, and the salt pans — flamingos in numbers from November to March.",
      },
      {
        day: "Day 4",
        title: "Mannar → Jaffna",
        detail:
          "Talaimannar first, where the sandbank chain of Adam's Bridge reaches toward India and the rail line simply stops. North to the peninsula in the afternoon.",
      },
      {
        day: "Day 5",
        title: "Jaffna",
        detail:
          "Nallur Kandaswamy Kovil at puja, the rebuilt public library, the Dutch fort, and Point Pedro at the island's northern tip. Dinner is the point of the day: crab curry, odiyal kool, palmyra.",
      },
      {
        day: "Day 6",
        title: "Delft Island",
        detail:
          "The ferry from Kurikadduwan, an hour out. Coral-block walls, a Dutch colonial ruin, a baobab, and herds of ponies descended from Portuguese stock grazing the flats. Back by late afternoon.",
      },
      {
        day: "Day 7",
        title: "Nagadeepa & the islands",
        detail:
          "Kayts and Karainagar by causeway, then the short crossing to Nagadeepa — a Buddhist temple and a Hindu kovil sharing one small island. Casuarina Beach after, which is as quiet as a good beach gets here.",
      },
      {
        day: "Day 8",
        title: "Jaffna → Anuradhapura",
        detail:
          "South down the A9 through the Vanni, three and a half hours. An afternoon among the great stupas, and Sri Maha Bodhi at dusk to close the journey where the island's written history starts.",
      },
      {
        day: "Day 9",
        title: "Anuradhapura → Airport",
        detail:
          "Four hours south-west, mostly on good road. Add a Negombo night if you would rather not watch the clock.",
      },
    ],
  },
];

/** Convenience for pages that want the premium collection ahead of the rest. */
export const featuredJourneys = journeys.filter((j) => j.featured);

export const getJourney = (slug: string) => journeys.find((j) => j.slug === slug);
