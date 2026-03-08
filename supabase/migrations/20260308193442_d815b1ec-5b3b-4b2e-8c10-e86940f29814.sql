
CREATE TABLE public.competition_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  mode text NOT NULL DEFAULT 'ffa',
  grade_level text NOT NULL,
  question_count integer NOT NULL DEFAULT 10,
  time_limit_seconds integer NOT NULL DEFAULT 120,
  status text NOT NULL DEFAULT 'waiting',
  question_seed text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz
);

CREATE TABLE public.competition_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competition_sessions(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  team_name text,
  score integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  total_count integer NOT NULL DEFAULT 0,
  time_taken_ms integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(competition_id, student_id)
);

ALTER TABLE public.competition_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read competitions" ON public.competition_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create competitions" ON public.competition_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update competitions" ON public.competition_sessions FOR UPDATE USING (true);

CREATE POLICY "Anyone can read scores" ON public.competition_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can submit scores" ON public.competition_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own scores" ON public.competition_scores FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_scores;
