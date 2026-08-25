-- Secure instructor PIN credentials table and verification function.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.instructor_credentials (
  instructor_name TEXT PRIMARY KEY,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.instructor_credentials ENABLE ROW LEVEL SECURITY;

-- No direct table access for anon/authenticated clients; access only via RPC.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'instructor_credentials_name_not_blank'
  ) THEN
    ALTER TABLE public.instructor_credentials
      ADD CONSTRAINT instructor_credentials_name_not_blank
      CHECK (length(trim(instructor_name)) > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'instructor_credentials_pin_hash_not_blank'
  ) THEN
    ALTER TABLE public.instructor_credentials
      ADD CONSTRAINT instructor_credentials_pin_hash_not_blank
      CHECK (length(trim(pin_hash)) > 0);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.touch_instructor_credentials_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_instructor_credentials_updated_at ON public.instructor_credentials;
CREATE TRIGGER trg_instructor_credentials_updated_at
BEFORE UPDATE ON public.instructor_credentials
FOR EACH ROW
EXECUTE FUNCTION public.touch_instructor_credentials_updated_at();

-- Backfill from existing plaintext class PINs (latest class per instructor name).
INSERT INTO public.instructor_credentials (instructor_name, pin_hash)
SELECT source.instructor_name, crypt(source.instructor_pin, gen_salt('bf'))
FROM (
  SELECT DISTINCT ON (instructor_name)
    instructor_name,
    instructor_pin,
    created_at
  FROM public.classes
  WHERE instructor_pin IS NOT NULL
    AND length(trim(instructor_pin)) >= 4
  ORDER BY instructor_name, created_at DESC
) AS source
ON CONFLICT (instructor_name) DO NOTHING;

-- Verify existing instructor PIN or register first-time PIN.
CREATE OR REPLACE FUNCTION public.verify_or_register_instructor(
  p_instructor_name TEXT,
  p_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_name TEXT := trim(coalesce(p_instructor_name, ''));
  normalized_pin TEXT := trim(coalesce(p_pin, ''));
  stored_hash TEXT;
BEGIN
  IF normalized_name = '' THEN
    RETURN jsonb_build_object('ok', false, 'created', false, 'message', 'Instructor name is required.');
  END IF;
  IF length(normalized_pin) < 4 THEN
    RETURN jsonb_build_object('ok', false, 'created', false, 'message', 'PIN must be at least 4 characters.');
  END IF;

  SELECT pin_hash
  INTO stored_hash
  FROM public.instructor_credentials
  WHERE instructor_name = normalized_name;

  IF stored_hash IS NULL THEN
    INSERT INTO public.instructor_credentials (instructor_name, pin_hash)
    VALUES (normalized_name, crypt(normalized_pin, gen_salt('bf')));
    RETURN jsonb_build_object('ok', true, 'created', true, 'message', 'Instructor PIN created.');
  END IF;

  IF crypt(normalized_pin, stored_hash) = stored_hash THEN
    RETURN jsonb_build_object('ok', true, 'created', false, 'message', 'PIN verified.');
  END IF;

  RETURN jsonb_build_object('ok', false, 'created', false, 'message', 'Incorrect PIN for that instructor name.');
END;
$$;

REVOKE ALL ON FUNCTION public.verify_or_register_instructor(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_or_register_instructor(TEXT, TEXT) TO anon, authenticated;
