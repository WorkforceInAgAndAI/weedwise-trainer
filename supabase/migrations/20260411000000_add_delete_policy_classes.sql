-- Allow anonymous users to delete classes (required for instructor End Session feature)
-- Deleting a class cascades to: students, game_sessions, student_badges,
-- competition_sessions, competition_scores via ON DELETE CASCADE foreign keys.
-- NOTE: This policy was manually applied via the Lovable SQL editor on 2026-04-11.
CREATE POLICY "Anyone can delete classes"
  ON public.classes FOR DELETE USING (true);
