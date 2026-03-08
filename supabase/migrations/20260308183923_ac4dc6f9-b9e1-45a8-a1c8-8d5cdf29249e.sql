
-- Instructors table linked to auth.users
CREATE TABLE public.instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can read own profile"
  ON public.instructors FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Instructors can insert own profile"
  ON public.instructors FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Instructors can update own profile"
  ON public.instructors FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Add instructor_id to classes (nullable for backward compat)
ALTER TABLE public.classes ADD COLUMN instructor_id UUID REFERENCES public.instructors(id);

-- Policy: instructors can update/delete their own classes
CREATE POLICY "Instructors can update own classes"
  ON public.classes FOR UPDATE TO authenticated
  USING (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

CREATE POLICY "Instructors can delete own classes"
  ON public.classes FOR DELETE TO authenticated
  USING (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

-- Optional: link students to auth.users for optional login
ALTER TABLE public.students ADD COLUMN user_id UUID REFERENCES auth.users(id);
