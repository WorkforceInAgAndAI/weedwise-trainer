-- Add recoverable session lifecycle fields to classes.
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS purge_after TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS exported_at TIMESTAMPTZ;

-- Keep lifecycle queries fast as classes grow.
CREATE INDEX IF NOT EXISTS idx_classes_purge_after
  ON public.classes (purge_after)
  WHERE ended_at IS NOT NULL;

-- Guard against malformed lifecycle state.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'classes_purge_after_requires_ended_at'
  ) THEN
    ALTER TABLE public.classes
      ADD CONSTRAINT classes_purge_after_requires_ended_at
      CHECK (purge_after IS NULL OR ended_at IS NOT NULL);
  END IF;
END $$;

-- No-auth mode still needs update/delete capability for lifecycle transitions.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'classes'
      AND policyname = 'Anyone can update classes'
  ) THEN
    CREATE POLICY "Anyone can update classes"
      ON public.classes
      FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'classes'
      AND policyname = 'Anyone can delete classes'
  ) THEN
    CREATE POLICY "Anyone can delete classes"
      ON public.classes
      FOR DELETE
      USING (true);
  END IF;
END $$;
