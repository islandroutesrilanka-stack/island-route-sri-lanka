# Island Route — Platform Setup Guide

The site works out of the box with built-in content. Connecting the backend
unlocks: the admin dashboard, booking management, availability calendars,
email notifications, and editing all content without code.

## 1. Create the Supabase project (~5 minutes, free)

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is fine).
2. Once created, open **SQL Editor** → **New query**:
   - Paste the contents of `supabase/schema.sql` → **Run**.
   - Paste the contents of `supabase/seed.sql` → **Run** (imports all current site content so the admin starts fully populated).
3. Create your admin login: **Authentication → Users → Add user** →
   email `islandroutesrilanka@gmail.com` + a strong password (tick "auto confirm").
4. Promote it to admin — back in **SQL Editor**, run:
   ```sql
   update public.profiles set role = 'admin'
   where email = 'islandroutesrilanka@gmail.com';
   ```

## 2. Connect the website

1. Copy `.env.example` to `.env.local`.
2. In Supabase: **Project Settings → API** → copy **Project URL** and **anon public key** into:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Restart `npm run dev`. Log in at **`/admin/login`**.

## 3. Email notifications (Gmail)

Booking requests and enquiries are always saved to the dashboard; email is an
extra alert layer.

1. On the Google account **islandroutesrilanka@gmail.com**: enable 2-Step
   Verification, then create an **App password**
   (Google Account → Security → 2-Step Verification → App passwords).
2. Add to `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=islandroutesrilanka@gmail.com
   SMTP_PASS=<16-character app password>
   ADMIN_EMAIL=islandroutesrilanka@gmail.com
   ```
You'll now receive an email for every new booking/enquiry, and guests get an
automatic confirmation.

## 4. Telegram alerts (optional, ~3 minutes)

Email is the record; Telegram is the alert. Every new **booking request**
arrives as a push notification with the guest, the vehicle, the day count,
the transport quote and — highlighted — whether they asked for hotel booking
assistance.

1. In Telegram, open a chat with **@BotFather** and send `/newbot`. Give it a
   display name (e.g. *Island Route Bookings*) and a username ending in `bot`
   (e.g. `islandroute_bookings_bot`). BotFather replies with an **HTTP API
   token** — that is `TELEGRAM_BOT_TOKEN`.
2. Open a chat with your new bot and press **Start** (or send any message).
   A bot cannot message you until you have messaged it first.
3. Visit `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and
   read `result[0].message.chat.id` — that is `TELEGRAM_CHAT_ID`.
4. Add to `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=<the token from BotFather>
   TELEGRAM_CHAT_ID=<the numeric chat id>
   ```

Leave either blank and the send is skipped silently. A Telegram failure of any
kind — wrong token, blocked bot, API down — never affects the booking: the row
is written to the database before the notification is attempted.

To alert more than one person, add the bot to a **group** instead and use the
group's id (negative, e.g. `-1001234567890`) as `TELEGRAM_CHAT_ID`.

## 5. Deploy (Vercel, free)

1. Push the project to GitHub, import it at [vercel.com](https://vercel.com).
2. Add the same environment variables in **Project → Settings → Environment Variables**.
3. Set `NEXT_PUBLIC_SITE_URL` to your live domain.

## How the pieces work

- **Content fallback** — public pages read Supabase first; any table that's
  empty (or no backend configured) falls back to the built-in starter content
  in `lib/`. After running `seed.sql`, the database is the single source of truth.
- **Admin dashboard** (`/admin`) — manage tours, destinations, services,
  fleet, drivers, reviews, blog posts, gallery, bookings, inquiries and
  site/SEO settings. Changes go live within 60 seconds.
- **Bookings** — the website's forms save straight to the dashboard
  (WhatsApp remains a one-tap option for guests). Manage status
  (new → quoted → confirmed → completed), assign a vehicle & driver, set the
  quoted price, and keep internal notes. Conflicts with other confirmed trips
  or blocked dates are flagged automatically.
- **Availability** — the calendar shows every vehicle's and driver's month at
  a glance (confirmed bookings + manual blocks for maintenance/leave).
- **Security** — Postgres Row-Level Security everywhere: visitors can only
  read published content and create requests; only admin accounts can read
  or change anything else.
