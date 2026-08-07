export const site = {
  name: "Island Route Sri Lanka",
  shortName: "Island Route",
  tagline: "Private journeys across the pearl of the Indian Ocean",
  description:
    "Island Route Sri Lanka crafts private, chauffeur-driven journeys across Sri Lanka — airport transfers, day tours, safaris, surf trips and tailor-made multi-day itineraries with trusted English-speaking drivers.",
  url: "https://www.islandroutesrilanka.com",
  email: "islandroutesrilanka@gmail.com",
  phoneDisplay: "+94 77 801 0391",
  phoneE164: "+94778010391",
  whatsappNumber: "94778010391",
  address: "Colombo, Sri Lanka",
  instagram: "https://instagram.com/islandroutesrilanka",
  facebook: "https://facebook.com/islandroutesrilanka",
};

/** Build a WhatsApp deep link with a prefilled message. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const defaultWaMessage =
  "Hello Island Route! I'd like to plan a trip in Sri Lanka.";
