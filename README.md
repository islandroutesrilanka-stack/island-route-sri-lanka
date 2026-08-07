# Island Route Sri Lanka — Booking Platform

Premium travel & tour booking platform: **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Supabase**.

- Public website with tours, destinations, fleet, gallery, reviews, blog, WhatsApp booking
- **Admin dashboard** at `/admin` — manage all content, bookings, inquiries, pricing, SEO
- **Availability calendars** for vehicles & drivers, with conflict warnings
- **Email notifications** (Gmail SMTP) + auto-confirmation to guests
- Works with zero config using built-in content; connect Supabase to unlock the backend → **see SETUP.md**

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000  (admin at /admin/login)
npm run build    # production build
```

Deploy free on [Vercel](https://vercel.com): import the repo/folder, add the env vars from `.env.example`.

## Where to edit things

| What | File |
|---|---|
| Phone, WhatsApp, email, address, socials | `lib/site.ts` |
| All photos (swap Unsplash URLs for your own) | `lib/images.ts` |
| Services & fleet & reviews & gallery | `lib/content.ts` |
| Tour packages & itineraries & prices | `lib/tours.ts` |
| Destinations | `lib/destinations.ts` |
| Blog posts | `lib/blog.ts` |
| Colors & fonts | `tailwind.config.ts`, `app/layout.tsx` |
| Google Maps location (contact page) | `app/contact/page.tsx` (the iframe `src`) |

## Notes

- **WhatsApp booking**: every "quote" button and the booking form open WhatsApp with a prefilled message to the number in `lib/site.ts`.
- **Domain**: update `url` in `lib/site.ts` to your live domain for correct SEO/sitemap links.
- **Images**: currently hot-linked from Unsplash (free license). If any image ever looks wrong, replace its URL in `lib/images.ts` — for production, uploading your own photos to `/public` and referencing them (e.g. `/photos/hero.jpg`) is recommended.
- **SEO**: per-page metadata, OpenGraph, JSON-LD (TravelAgency), `sitemap.xml` and `robots.txt` are generated automatically.
