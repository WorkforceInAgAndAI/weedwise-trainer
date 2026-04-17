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

 // Logs a completed Farm Mode season as its own game_sessions row.
 // Separate from createSession/updateSession so it doesn't interfere with the
 // live ID-game row tracked via sessionIdRef.
 const logFarmSeason = useCallback(async (data: {
  grade: GradeLevel;
  yieldBuAcre: number;
  costPerAcre: number;
  hoursWorked: number;
  weedsControlled: number;
  totalWeeds: number;
  eventsCorrect: number;
  eventsAnswered: number;
  seasonsCompleted: number;
 }) => {
  if (!studentId) return;
  const totalCorrect = data.eventsCorrect;
  const totalWrong = Math.max(0, data.eventsAnswered - data.eventsCorrect);
  const totalXp = Math.max(
   0,
   Math.round(data.yieldBuAcre * 10 + data.weedsControlled * 5 + data.eventsCorrect * 20)
  );
  await supabase.from('game_sessions').insert({
   student_id: studentId,
   grade_level: data.grade,
   total_xp: totalXp,
   total_correct: totalCorrect,
   total_wrong: totalWrong,
   species_mastered: data.weedsControlled,
   streak_best: 0,
   phases_completed: data.seasonsCompleted,
   session_data: {
    mode: 'farm',
    yield_bu_acre: data.yieldBuAcre,
    cost_per_acre: data.costPerAcre,
    hours_worked: data.hoursWorked,
    weeds_controlled: data.weedsControlled,
    total_weeds: data.totalWeeds,
   } as any,
  });
 }, [studentId]);

 return { createSession, updateSession, logFarmSeason, sessionIdRef };
}
