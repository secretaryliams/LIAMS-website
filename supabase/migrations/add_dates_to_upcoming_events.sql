-- Migration: Add start date, end date, and registration end date to upcoming_events.
-- Preserves existing data by copying event_date into start_date for backward compatibility.

ALTER TABLE upcoming_events
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS registration_end_date DATE,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Migrate existing event_date values into start_date
UPDATE upcoming_events
  SET start_date = event_date
  WHERE start_date IS NULL AND event_date IS NOT NULL;
