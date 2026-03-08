CREATE POLICY "Students can update own record"
ON public.students
FOR UPDATE
USING (true)
WITH CHECK (true);