import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { WeedStat } from '@/types/game';
import type { GradeLevel } from '@/types/game';

export function useSessionPersistence(studentId: string | null) {
 const sessionIdRef = useRef<string | null>(null);
 const gradeRef = useRef<GradeLevel | null>(null);

 const createSession = useCallback(async (grade: GradeLevel) => {
  if (!studentId) return;
  gradeRef.current = grade;
  const { data } = await supabase
   .from('game_sessions')
   .insert({ student_id: studentId, grade_level: grade })
   .select('id')
   .single();
  if (data) sessionIdRef.current = data.id;
 }, [studentId]);

 const ensureSession = useCallback(async (grade?: GradeLevel): Promise<string | null> => {
  if (sessionIdRef.current) return sessionIdRef.current;
  if (!studentId) return null;
  const g = grade || gradeRef.current || 'elementary';
  gradeRef.current = g;
  const { data } = await supabase
   .from('game_sessions')
   .insert({ student_id: studentId, grade_level: g })
   .select('id')
   .single();
  if (data) {
   sessionIdRef.current = data.id;
   return data.id;
  }
  return null;
 }, [studentId]);

 const updateSession = useCallback(async (stats: {
  xp: number;
  totalCorrect: number;
  totalWrong: number;
  masteredCount: number;
  streak: number;
  phasesCompleted: number;
  weedStats: Record<string, WeedStat>;
  phaseStats?: Record<string, { correct: number; wrong: number }>;
  grade?: GradeLevel;
 }) => {
  if (!studentId) return;
  // Lazily create a session if one doesn't exist yet
  const sid = await ensureSession(stats.grade);
  if (!sid) return;
  await supabase
   .from('game_sessions')
   .update({
    total_xp: stats.xp,
    total_correct: stats.totalCorrect,
    total_wrong: stats.totalWrong,
    species_mastered: stats.masteredCount,
    streak_best: stats.streak,
    phases_completed: stats.phasesCompleted,
    session_data: {
     weedStats: stats.weedStats,
     phaseStats: stats.phaseStats || {},
    } as any,
   })
   .eq('id', sid);
 }, [studentId, ensureSession]);

 return { createSession, updateSession, sessionIdRef };
}
