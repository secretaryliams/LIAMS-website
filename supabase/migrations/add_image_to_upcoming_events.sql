-- Add optional cover image for upcoming events (home ticker & events page).
alter table upcoming_events
  add column if not exists image_url text;
