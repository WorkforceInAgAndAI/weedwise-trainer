-- Fix PIN RPC to resolve pgcrypto functions in Supabase's extensions schema.

-- Backfill any missing credential rows from legacy class PINs using qualified crypto funcs.
INSERT INTO public.instructor_credentials (instructor_name, pin_hash)
SELECT source.instructor_name, extensions.crypt(source.instructor_pin, extensions.gen_salt('bf'))
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
WHERE NOT EXISTS (
  SELECT 1
  FROM public.instructor_credentials creds
  WHERE creds.instructor_name = source.instructor_name
);

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
    VALUES (normalized_name, extensions.crypt(normalized_pin, extensions.gen_salt('bf')));
    RETURN jsonb_build_object('ok', true, 'created', true, 'message', 'Instructor PIN created.');
  END IF;

  IF extensions.crypt(normalized_pin, stored_hash) = stored_hash THEN
    RETURN jsonb_build_object('ok', true, 'created', false, 'message', 'PIN verified.');
  END IF;

  RETURN jsonb_build_object('ok', false, 'created', false, 'message', 'Incorrect PIN for that instructor name.');
END;
$$;
