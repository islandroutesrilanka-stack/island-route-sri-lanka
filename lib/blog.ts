import { img } from "./images";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  sections: { heading?: string; body: string }[];
};

export const posts: Post[] = [
  {
    slug: "ultimate-10-day-sri-lanka-itinerary",
    title: "The Ultimate 10-Day Sri Lanka Itinerary",
    excerpt:
      "Ancient rocks, the famous blue train, leopards and a beach finale — how to see the best of the island in ten unhurried days.",
    date: "2026-06-12",
    readTime: "8 min read",
    image: img.heroTrain,
    sections: [
      { body: "Ten days is the sweet spot for a first visit to Sri Lanka: enough time to link the Cultural Triangle, the tea highlands and the southern coast without ever feeling rushed. Here's the route we recommend to most first-time guests, refined over hundreds of journeys." },
      { heading: "Days 1–3: The Cultural Triangle", body: "Land, recover, and head straight for Sigiriya. Climb the Lion Rock at dawn before the heat and the crowds, explore Dambulla's painted caves, and if you're travelling between August and October, don't miss the elephant gathering at Minneriya — hundreds of wild elephants around a single ancient reservoir." },
      { heading: "Days 4–5: Kandy and the climb to tea country", body: "Kandy deserves a slow afternoon: the Temple of the Sacred Tooth at evening puja, then the lakeside as the town lights come on. The next morning, wind upward through waterfalls and tea terraces to Nuwara Eliya, stopping at a working factory to taste estate tea at its source." },
      { heading: "Days 6–7: The railway and Ella", body: "The Nanu Oya to Ella stretch is the most beautiful train ride in Asia — reserve seats and let your driver carry the luggage ahead. In Ella, hike Little Adam's Peak for sunrise and watch the train cross the Nine Arch Bridge from a jungle café." },
      { heading: "Days 8–9: Safari and the south", body: "Drop out of the hills to Yala for a dawn game drive — some of the best odds anywhere of a wild leopard sighting — then follow the coast west through Tangalle and Mirissa. In season, a blue whale excursion is unforgettable." },
      { heading: "Day 10: Galle and departure", body: "End inside Galle Fort's 17th-century ramparts with breakfast on a rooftop, a last swim at Unawatuna, and an easy expressway run to the airport. Ten days, one island, zero regrets." },
    ],
  },
  {
    slug: "when-to-visit-sri-lanka",
    title: "When to Visit Sri Lanka: A Season-by-Season Guide",
    excerpt:
      "Two monsoons mean there's always a sunny coast somewhere. Here's how to time beaches, safaris, surf and the highlands perfectly.",
    date: "2026-05-02",
    readTime: "6 min read",
    image: img.beachPanorama,
    sections: [
      { body: "The most common question we get is 'when is the best time to visit Sri Lanka?' The honest answer: almost any month — if you pick the right coast. The island sits between two monsoon systems, so while one shore takes rain, the opposite one is at its best." },
      { heading: "December to April: the classic season", body: "The west and south coasts — Bentota, Galle, Mirissa, Tangalle — enjoy blue skies and calm seas. This is peak whale-watching season in Mirissa and the ideal window for the classic Cultural Triangle plus southern beaches route. Book early for Christmas and New Year." },
      { heading: "May to September: the east awakens", body: "As the southwest monsoon arrives, the action shifts east. Arugam Bay's famous right-handers fire, Trincomalee and Pasikudah offer glassy seas, and Kumana's lagoons teem with birdlife. This is our favourite 'secret season' — fewer crowds, golden light." },
      { heading: "Safari timing", body: "Yala is at its best February through July as water sources shrink and wildlife concentrates; note the park often closes for several weeks around September–October. Minneriya's great elephant gathering peaks August to October. Udawalawe delivers elephants reliably all year." },
      { heading: "The highlands", body: "Tea country is gorgeous year-round, with January to March offering the clearest mountain views. Pack a warm layer whatever the month — Nuwara Eliya evenings are properly cool at 1,900 metres." },
    ],
  },
  {
    slug: "yala-vs-wilpattu-safari",
    title: "Yala vs Wilpattu: Which Safari Should You Choose?",
    excerpt:
      "Sri Lanka's two great national parks offer very different wild experiences. Our drivers' honest guide to choosing between them.",
    date: "2026-03-18",
    readTime: "5 min read",
    image: img.leopard,
    sections: [
      { body: "Both parks hold healthy leopard populations and both can deliver the safari of a lifetime — but they feel completely different. After a thousand game drives between them, here's how we advise our guests." },
      { heading: "Choose Yala for density", body: "Yala Block 1 has the highest leopard density on the planet, plus elephants, sloth bears and spectacular coastal scenery where dunes meet jungle. The trade-off is popularity: in high season, a big sighting can draw a queue of jeeps. Going at dawn with an experienced tracker-driver — and avoiding weekends — makes all the difference." },
      { heading: "Choose Wilpattu for wilderness", body: "Wilpattu, Sri Lanka's largest park, is a maze of forest and natural lakes called villus. Sightings take more patience, but you'll often have a leopard entirely to yourself, framed by ancient trees rather than other vehicles. For photographers and second-time visitors, it's magic." },
      { heading: "Or do what we do", body: "Combine one with Udawalawe. Elephants are near-guaranteed there year-round, which takes the pressure off, letting you enjoy Yala or Wilpattu as a pure leopard hunt. Many of our 10–14 day routes thread exactly this pairing." },
    ],
  },
  {
    slug: "south-coast-beach-guide",
    title: "Sri Lanka's South Coast: The Insider Beach Guide",
    excerpt:
      "From boutique bays to barefoot surf coves — where to swim, stay and watch the sunset between Galle and Tangalle.",
    date: "2026-01-25",
    readTime: "7 min read",
    image: img.beachPalms,
    sections: [
      { body: "The 80 kilometres of coastline east of Galle hold an absurd concentration of beautiful beaches, each with its own personality. Here's how our drivers describe them to guests on the coastal road." },
      { heading: "Unawatuna & Dalawella", body: "Closest to Galle Fort and great for families: calm, reef-protected swimming, the famous Dalawella palm swing and jungle-backed 'Jungle Beach' a short scramble away. Sunset from the pagoda viewpoint is superb." },
      { heading: "Weligama & Mirissa", body: "Weligama's long, forgiving beach break is the island's best place to learn to surf. Next door, Mirissa pairs whale watching with a proper beach-bar evening scene. Come early to Coconut Tree Hill for photos without the crowds." },
      { heading: "Hiriketiya & Dickwella", body: "'Hiri' is the south's darling — a tiny horseshoe bay of jungle, longboard peelers and specialty coffee. It gets busy in season; nearby Dickwella carries the overflow with a broader sweep of sand." },
      { heading: "Tangalle and beyond", body: "Keep driving east and the crowds fall away. Tangalle's wild, golden beaches front some of the island's loveliest boutique hotels, and by Rekawa, you're sharing the sand mainly with nesting sea turtles. This is where we send honeymooners." },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
