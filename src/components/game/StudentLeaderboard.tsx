import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStudent } from '@/contexts/StudentContext';

interface LeaderboardEntry {
  nickname: string;
  studentId: string;
  totalXp: number;
  speciesMastered: number;
  accuracy: string;
}

interface Props {
  onClose: () => void;
}

export default function StudentLeaderboard({ onClose }: Props) {
  const { session } = useStudent();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { setLoading(false); return; }

    const load = async () => {
      // Get classmates
      const { data: studs } = await supabase.from('students').select('id, nickname').eq('class_id', session.classId);
      if (!studs || studs.length === 0) { setLoading(false); return; }

      const ids = studs.map(s => s.id);
      const { data: sess } = await supabase.from('game_sessions').select('student_id, total_xp, total_correct, total_wrong, species_mastered').in('student_id', ids);

      const map = new Map<string, LeaderboardEntry>();
      studs.forEach(s => map.set(s.id, { nickname: s.nickname, studentId: s.id, totalXp: 0, speciesMastered: 0, accuracy: '—' }));

      (sess || []).forEach((s: any) => {
        const entry = map.get(s.student_id);
        if (entry) {
          entry.totalXp += s.total_xp;
          entry.speciesMastered = Math.max(entry.speciesMastered, s.species_mastered);
        }
      });

      // Calculate accuracy
      const correctMap = new Map<string, number>();
      const wrongMap = new Map<string, number>();
      (sess || []).forEach((s: any) => {
        correctMap.set(s.student_id, (correctMap.get(s.student_id) || 0) + s.total_correct);
        wrongMap.set(s.student_id, (wrongMap.get(s.student_id) || 0) + s.total_wrong);
      });
      map.forEach((entry, id) => {
        const c = correctMap.get(id) || 0;
        const w = wrongMap.get(id) || 0;
        const total = c + w;
        entry.accuracy = total > 0 ? `${((c / total) * 100).toFixed(1)}%` : '—';
      });

      setEntries(Array.from(map.values()).sort((a, b) => b.totalXp - a.totalXp));
      setLoading(false);
    };
    load();
  }, [session]);

  if (!session) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full text-center space-y-3">
          <p className="text-muted-foreground">Join a class to see the leaderboard!</p>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-y-auto">
      <div className="max-w-lg mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-primary">🏆 Class Rankings</h1>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm">✕ Close</button>
        </div>
        <div className="text-sm text-muted-foreground mb-4">{session.className}</div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading…</p>
        ) : (
          <div className="space-y-3">
            {entries.map((e, i) => {
              const isMe = e.studentId === session.studentId;
              return (
                <div key={e.studentId} className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${isMe ? 'border-primary bg-primary/10 ring-2 ring-primary/30' : i === 0 ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg ${i === 0 ? 'bg-primary text-primary-foreground' : i === 1 ? 'bg-accent text-accent-foreground' : i === 2 ? 'bg-orange-400 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-foreground">{e.nickname} {isMe && <span className="text-xs text-primary">(you)</span>}</div>
                    <div className="text-xs text-muted-foreground">{e.speciesMastered} mastered • {e.accuracy} accuracy</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-primary text-lg">{e.totalXp}</div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
