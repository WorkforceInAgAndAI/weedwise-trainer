-- Per-class instructor PIN.
-- Replaces the single shared VITE_INSTRUCTOR_PIN env var. Each class now
-- carries its own PIN that the instructor sets when creating the class,
-- and that PIN gates access to the dashboard view of that class.
--
-- Existing classes are backfilled with the previous shared PIN ('1234')
-- so that legacy classes still open with the old PIN until instructors
-- recreate them. The column is left nullable to avoid breaking any
-- inserts that happen before the client code is updated; the client
-- code requires a non-empty PIN at create time.

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS instructor_pin TEXT;

UPDATE public.classes
  SET instructor_pin = '1234'
  WHERE instructor_pin IS NULL;
