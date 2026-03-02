import { useCallback, useRef } from 'react';
import { weeds } from '@/data/weeds';
import { BADGES } from '@/data/badges';
import { PHASES } from '@/data/phases';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { WeedStat } from '@/types/game';
import type { GradeLevel } from '@/types/game';

export function useBadgeChecker(studentId: string | null) {
  const earnedRef = useRef<Set<string>>(new Set());

  const checkBadges = useCallback(async (ctx: {
    weedStats: Record<string, WeedStat>;
    streak: number;
    totalCorrect: number;
    totalWrong: number;
    grade: GradeLevel | null;
    xp: number;
  }) => {
    if (!studentId) return;

    const { weedStats, streak, totalCorrect, totalWrong, grade, xp } = ctx;
    const masteredCount = Object.values(weedStats).filter(s => s.mastered).length;
    const totalQ = totalCorrect + totalWrong;
    const accuracy = totalQ > 0 ? (totalCorrect / totalQ) * 100 : 0;

    const masteredIds = new Set(Object.entries(weedStats).filter(([, s]) => s.mastered).map(([id]) => id));

    const newBadges: string[] = [];

    for (const badge of BADGES) {
      if (earnedRef.current.has(badge.id)) continue;

      let earned = false;
      const req = badge.requirement;

      switch (req.type) {
        case 'species_mastered':
          earned = masteredCount >= (req.count || 0);
          break;
        case 'topic_complete': {
          let subset: string[] = [];
          if (req.topic === 'monocot') subset = weeds.filter(w => w.plantType === 'Monocot').map(w => w.id);
          else if (req.topic === 'dicot') subset = weeds.filter(w => w.plantType === 'Dicot').map(w => w.id);
          else if (req.topic === 'native') subset = weeds.filter(w => w.origin === 'Native').map(w => w.id);
          else if (req.topic === 'introduced') subset = weeds.filter(w => w.origin === 'Introduced').map(w => w.id);
          else if (req.topic === 'warm') subset = weeds.filter(w => w.primaryHabitat.startsWith('Warm')).map(w => w.id);
          else if (req.topic === 'cool') subset = weeds.filter(w => w.primaryHabitat.startsWith('Cool')).map(w => w.id);
          else if (req.topic === 'wet') subset = weeds.filter(w => w.primaryHabitat.startsWith('Wet')).map(w => w.id);
          else if (req.topic === 'dry') subset = weeds.filter(w => w.primaryHabitat.startsWith('Dry')).map(w => w.id);
          earned = subset.length > 0 && subset.every(id => masteredIds.has(id));
          break;
        }
        case 'streak':
          earned = streak >= (req.count || 0);
          break;
        case 'accuracy':
          earned = totalQ >= 20 && accuracy >= (req.count || 0);
          break;
        case 'questions_answered':
          earned = totalQ >= (req.count || 0);
          break;
        case 'phases_complete': {
          if (!grade || grade !== req.grade) break;
          const phases = PHASES[grade];
          earned = phases.every(p => xp >= p.xpRequired);
          break;
        }
      }

      if (earned) {
        earnedRef.current.add(badge.id);
        newBadges.push(badge.id);
      }
    }

    // Persist new badges
    if (newBadges.length > 0) {
      const inserts = newBadges.map(bid => ({ student_id: studentId, badge_id: bid }));
      await supabase.from('student_badges').insert(inserts);

      for (const bid of newBadges) {
        const badge = BADGES.find(b => b.id === bid);
        if (badge) {
          toast(`${badge.icon} Badge Earned!`, { description: badge.name });
        }
      }
    }
  }, [studentId]);

  // Load already-earned badges on mount
  const loadEarned = useCallback(async () => {
    if (!studentId) return;
    const { data } = await supabase.from('student_badges').select('badge_id').eq('student_id', studentId);
    if (data) {
      data.forEach(r => earnedRef.current.add(r.badge_id));
    }
  }, [studentId]);

  return { checkBadges, loadEarned };
}
