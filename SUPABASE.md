# LIAMS — Supabase setup

Follow these steps once per environment (local + Vercel production).

## 1. Create project

1. [Supabase Dashboard](https://app.supabase.com) → New project (region closest to India).
2. **Project Settings → API** → copy **Project URL** and **anon public** key.

## 2. Environment variables

Copy `.env.example` to `.env` in `liams-website/`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Restart `npm run dev` after changing `.env`.

On **Vercel**, add the same variables under Project → Settings → Environment Variables.

## 3. Database

**SQL Editor → New query** → paste and run `supabase/schema.sql`.

This creates tables and RLS policies (public read, authenticated admin write).

If the project already exists, run migrations in `supabase/migrations/`:

- `add_venue_to_upcoming_events.sql` — venue column on events
- `add_site_settings.sql` — **required** for dynamic section titles (fixes `site_settings` schema cache error)

**If you see:** `Could not find the table 'public.site_settings' in the schema cache`  
→ Open [Supabase SQL Editor](https://app.supabase.com), paste the full contents of `supabase/migrations/add_site_settings.sql`, and click **Run**. Wait a few seconds, then refresh the site.

### Certifications section title

In **Admin → Certifications**, set the public Events page section heading (default: `Certifications`). Stored in `site_settings` key `certifications_section_title`. A floating button on the Home page links to this section.

## 4. Storage

**Storage → New bucket**

- Name: `event-images`
- **Public bucket**: ON

Add storage policies in the dashboard (or uncomment the SQL block at the bottom of `schema.sql`):

- Public: `SELECT` on `event-images`
- Authenticated: `INSERT`, `UPDATE`, `DELETE` on `event-images`

## 5. Admin user

**Authentication → Providers** → enable **Email**.

**Authentication → Users → Add user** (e.g. admin email + password).

## 6. Admin panel

| URL | Purpose |
|-----|---------|
| `/admin/login` | Sign in |
| `/admin` | Dashboard |
| `/admin/announcements` | Homepage ticker |
| `/admin/upcoming-events` | Events page + home ticker |
| `/admin/previous-events` | Gallery uploads |
| `/admin/certifications` | Extra certificate Drive links |

## 7. Deploy

- **Frontend**: Vercel (connect GitHub repo, set env vars, deploy).
- **Backend**: Supabase (no separate server).

Without `.env`, dynamic sections show empty states. Static pages (About, Training, etc.) still use `src/data/siteData.js`.
