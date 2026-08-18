export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "date"
  | "select"
  | "lines" // string[] stored as jsonb, edited one-per-line
  | "json" // arbitrary jsonb, edited as JSON
  | "image"; // text URL with preview

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  help?: string;
};

export type EntityConfig = {
  table: string;
  title: string;
  singular: string;
  description: string;
  /** column used as the row's display name in the list */
  labelKey: string;
  /** small secondary text in the list */
  subKey?: string;
  orderBy: string;
  hasPublished: boolean;
  fields: FieldDef[];
};

export const entities: Record<string, EntityConfig> = {
  tours: {
    table: "tours",
    title: "Tours & Packages",
    singular: "tour",
    description: "Day tours, multi-day journeys and safaris shown on the site.",
    labelKey: "title",
    subKey: "category",
    orderBy: "sort",
    hasPublished: true,
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "URL slug", type: "text", required: true, help: "lowercase-with-dashes, unique" },
      { key: "category", label: "Category", type: "select", options: ["Day Tour", "Multi-Day", "Safari"], required: true },
      { key: "duration", label: "Duration", type: "text", help: "e.g. 7 days · 6 nights" },
      { key: "image", label: "Cover image URL", type: "image" },
      { key: "excerpt", label: "Short description", type: "textarea" },
      { key: "highlights", label: "Highlights (one per line)", type: "lines" },
      { key: "includes", label: "What's included (one per line)", type: "lines" },
      { key: "itinerary", label: "Itinerary (JSON)", type: "json", help: '[{"day":"Day 1","title":"…","detail":"…"}] — leave empty for day tours' },
      { key: "featured", label: "Featured on homepage", type: "checkbox" },
      { key: "sort", label: "Sort order", type: "number" },
    ],
  },
  destinations: {
    table: "destinations",
    title: "Destinations",
    singular: "destination",
    description: "The places you take guests — each gets its own SEO page.",
    labelKey: "name",
    subKey: "region",
    orderBy: "sort",
    hasPublished: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "URL slug", type: "text", required: true },
      { key: "region", label: "Region", type: "text" },
      { key: "headline", label: "Headline", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "best_for", label: "Best for (one per line)", type: "lines" },
      { key: "best_time", label: "Best time to visit", type: "text" },
      { key: "highlights", label: "Highlights (one per line)", type: "lines" },
      { key: "image", label: "Image URL", type: "image" },
      { key: "sort", label: "Sort order", type: "number" },
    ],
  },
  services: {
    table: "services",
    title: "Services",
    singular: "service",
    description: "The nine core services listed on the Services page.",
    labelKey: "name",
    subKey: "tagline",
    orderBy: "sort",
    hasPublished: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "URL slug", type: "text", required: true },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image URL", type: "image" },
      { key: "icon", label: "Icon", type: "select", options: ["plane", "steering", "car", "sun", "map", "binoculars", "waves", "hotel", "route"] },
      { key: "sort", label: "Sort order", type: "number" },
    ],
  },
  vehicles: {
    table: "vehicles",
    title: "Fleet / Vehicles",
    singular: "vehicle",
    description: "Vehicles shown on the Fleet page and assignable to bookings.",
    labelKey: "name",
    subKey: "category",
    orderBy: "sort",
    hasPublished: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "URL slug", type: "text", required: true },
      { key: "category", label: "Category line", type: "text", help: "e.g. Comfort · up to 3 guests" },
      { key: "passengers", label: "Max passengers", type: "number" },
      { key: "luggage", label: "Luggage", type: "text" },
      { key: "features", label: "Features (one per line)", type: "lines" },
      { key: "ideal_for", label: "Ideal for", type: "text" },
      { key: "image", label: "Image URL", type: "image" },
      { key: "sort", label: "Sort order", type: "number" },
    ],
  },
  drivers: {
    table: "drivers",
    title: "Drivers",
    singular: "driver",
    description: "Your chauffeur-guides — assignable to bookings, with availability tracking. Not shown publicly.",
    labelKey: "name",
    subKey: "phone",
    orderBy: "name",
    hasPublished: false,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "phone", label: "Phone / WhatsApp", type: "text" },
      { key: "languages", label: "Languages (one per line)", type: "lines" },
      { key: "notes", label: "Notes", type: "textarea" },
      { key: "active", label: "Active", type: "checkbox" },
    ],
  },
  reviews: {
    table: "reviews",
    title: "Reviews",
    singular: "review",
    description: "Guest reviews shown on the site.",
    labelKey: "name",
    subKey: "trip",
    orderBy: "sort",
    hasPublished: true,
    fields: [
      { key: "name", label: "Guest name", type: "text", required: true },
      { key: "country", label: "Country", type: "text" },
      { key: "trip", label: "Trip", type: "text" },
      { key: "rating", label: "Rating (1–5)", type: "number" },
      { key: "text", label: "Review text", type: "textarea", required: true },
      { key: "sort", label: "Sort order", type: "number" },
    ],
  },
  posts: {
    table: "posts",
    title: "Blog / Journal",
    singular: "post",
    description: "Travel guides and stories — great for SEO.",
    labelKey: "title",
    subKey: "date",
    orderBy: "date",
    hasPublished: true,
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "URL slug", type: "text", required: true },
      { key: "excerpt", label: "Excerpt", type: "textarea" },
      { key: "date", label: "Date", type: "date" },
      { key: "read_time", label: "Read time", type: "text", help: "e.g. 6 min read" },
      { key: "image", label: "Cover image URL", type: "image" },
      { key: "sections", label: "Content sections (JSON)", type: "json", help: '[{"heading":"Optional heading","body":"Paragraph text"}]' },
    ],
  },
  gallery: {
    table: "gallery",
    title: "Gallery",
    singular: "image",
    description: "Photos shown in the gallery page, filterable by category.",
    labelKey: "caption",
    subKey: "category",
    orderBy: "sort",
    hasPublished: true,
    fields: [
      { key: "src", label: "Image URL", type: "image", required: true },
      { key: "caption", label: "Caption", type: "text" },
      { key: "category", label: "Category", type: "select", options: ["Beaches", "Wildlife", "Hills", "Culture", "Surf", "Journeys"] },
      { key: "sort", label: "Sort order", type: "number" },
    ],
  },
};
