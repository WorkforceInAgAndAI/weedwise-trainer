import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { weeds } from '@/data/weeds';
import { BADGES, BADGE_MAP } from '@/data/badges';
import type { Json } from '@/integrations/supabase/types';

interface ClassInfo {
  id: string;
  name: string;
  join_code: string;
  instructor_name: string;
  created_at: string;
}

interface StudentRow {
  id: string;
  nickname: string;
  class_id: string;
}

interface SessionRow {
  id: string;
  student_id: string;
  grade_level: string;
  total_xp: number;
  total_correct: number;
  total_wrong: number;
  species_mastered: number;
  streak_best: number;
  phases_completed: number;
  session_data: Json | null;
  updated_at: string;
}

interface BadgeRow {
  id: string;
  student_id: string;
  badge_id: string;
  earned_at: string;
}

type TopicFilter = 'all' | 'monocot' | 'dicot' | 'native' | 'introduced' | 'warm' | 'cool' | 'wet' | 'dry';

interface Props {
  onClose: () => void;
}

export default function InstructorDashboard({ onClose }: Props) {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [topicFilter, setTopicFilter] = useState<TopicFilter>('all');
  const [tab, setTab] = useState<'overview' | 'students' | 'leaderboard' | 'badges'>('overview');
  const [loading, setLoading] = useState(true);

  // Load classes
  useEffect(() => {
    supabase.from('classes').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setClasses((data as ClassInfo[]) || []);
      if (data && data.length > 0) setSelectedClass(data[0].id);
      setLoading(false);
    });
  }, []);

  // Load students, sessions, badges when class selected
  useEffect(() => {
    if (!selectedClass) return;

    const loadData = async () => {
      const { data: studs } = await supabase.from('students').select('*').eq('class_id', selectedClass);
      const studentList = (studs as StudentRow[]) || [];
      setStudents(studentList);

      if (studentList.length > 0) {
        const ids = studentList.map(s => s.id);
        const { data: sess } = await supabase.from('game_sessions').select('*').in('student_id', ids);
        setSessions((sess as SessionRow[]) || []);
        const { data: bdg } = await supabase.from('student_badges').select('*').in('student_id', ids);
        setBadges((bdg as BadgeRow[]) || []);
      } else {
        setSessions([]);
        setBadges([]);
      }
    };
    loadData();
  }, [selectedClass]);

  const selectedClassInfo = classes.find(c => c.id === selectedClass);

  // Aggregate per-student stats
  const studentStats = useMemo(() => {
    return students.map(s => {
      const stuSessions = sessions.filter(sess => sess.student_id === s.id);
      const totalXp = stuSessions.reduce((sum, sess) => sum + sess.total_xp, 0);
      const totalCorrect = stuSessions.reduce((sum, sess) => sum + sess.total_correct, 0);
      const totalWrong = stuSessions.reduce((sum, sess) => sum + sess.total_wrong, 0);
      const bestStreak = Math.max(0, ...stuSessions.map(sess => sess.streak_best));
      const speciesMastered = Math.max(0, ...stuSessions.map(sess => sess.species_mastered), 0);
      const total = totalCorrect + totalWrong;
      const accuracy = total > 0 ? ((totalCorrect / total) * 100).toFixed(1) : '—';
      const badgeCount = badges.filter(b => b.student_id === s.id).length;
      const lastPlayed = stuSessions.length > 0 ? stuSessions.sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0].updated_at : null;
      return { ...s, totalXp, totalCorrect, totalWrong, bestStreak, speciesMastered, accuracy, badgeCount, lastPlayed, sessions: stuSessions.length };
    }).sort((a, b) => b.totalXp - a.totalXp);
  }, [students, sessions, badges]);

  // Class-wide stats
  const classStats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalXp = sessions.reduce((s, sess) => s + sess.total_xp, 0);
    const totalCorrect = sessions.reduce((s, sess) => s + sess.total_correct, 0);
    const totalWrong = sessions.reduce((s, sess) => s + sess.total_wrong, 0);
    const total = totalCorrect + totalWrong;
    const accuracy = total > 0 ? ((totalCorrect / total) * 100).toFixed(1) : '—';
    return { totalSessions, totalXp, totalCorrect, totalWrong, accuracy, studentCount: students.length };
  }, [sessions, students]);

  const topicFilters: { key: TopicFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: '🌿' },
    { key: 'monocot', label: 'Monocots', icon: '🌾' },
    { key: 'dicot', label: 'Dicots', icon: '🍀' },
    { key: 'native', label: 'Native', icon: '🏡' },
    { key: 'introduced', label: 'Introduced', icon: '🚢' },
    { key: 'warm', label: 'Warm-Season', icon: '☀️' },
    { key: 'cool', label: 'Cool-Season', icon: '❄️' },
    { key: 'wet', label: 'Wet', icon: '💧' },
    { key: 'dry', label: 'Dry', icon: '🏜️' },
  ];

  const tabs = [
    { key: 'overview' as const, label: '📊 Overview' },
    { key: 'students' as const, label: '👨‍🎓 Students' },
    { key: 'leaderboard' as const, label: '🏆 Leaderboard' },
    { key: 'badges' as const, label: '🏅 Badges' },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold text-primary">📊 Instructor Dashboard</h1>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm">✕ Close</button>
        </div>

        {/* Class selector */}
        {classes.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-4xl">📋</div>
            <p className="text-muted-foreground">No classes created yet.</p>
            <p className="text-sm text-muted-foreground">Create a class from the landing page to start tracking students.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <label className="text-sm font-medium text-muted-foreground">Class:</label>
              <select value={selectedClass || ''} onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.instructor_name}</option>
                ))}
              </select>
              {selectedClassInfo && (
                <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-sm">
                  Join Code: <span className="font-mono font-bold text-primary tracking-wider">{selectedClassInfo.join_code}</span>
                </div>
              )}
            </div>

            {/* Topic filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {topicFilters.map(f => (
                <button key={f.key} onClick={() => setTopicFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${topicFilter === f.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/50'}`}>
                  {f.icon} {f.label}
                </button>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Students', value: classStats.studentCount },
                    { label: 'Sessions', value: classStats.totalSessions },
                    { label: 'Total XP', value: classStats.totalXp },
                    { label: 'Correct', value: classStats.totalCorrect },
                    { label: 'Wrong', value: classStats.totalWrong },
                    { label: 'Accuracy', value: `${classStats.accuracy}%` },
                  ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                      <div className="text-xl font-bold text-foreground">{s.value}</div>
                    </div>
                  ))}
                </div>

                {students.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No students have joined yet. Share the join code with your class!</p>
                )}
              </div>
            )}

            {/* Students Tab */}
            {tab === 'students' && (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Nickname</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Sessions</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">XP</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Correct</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Wrong</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Accuracy</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Streak</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Mastered</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Badges</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Last Played</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentStats.map(s => (
                      <tr key={s.id} className="border-t border-border hover:bg-muted/50">
                        <td className="px-3 py-2 font-medium text-foreground">{s.nickname}</td>
                        <td className="px-3 py-2">{s.sessions}</td>
                        <td className="px-3 py-2 text-primary font-semibold">{s.totalXp}</td>
                        <td className="px-3 py-2 text-accent">{s.totalCorrect}</td>
                        <td className="px-3 py-2 text-destructive">{s.totalWrong}</td>
                        <td className="px-3 py-2">{s.accuracy}%</td>
                        <td className="px-3 py-2">{s.bestStreak} 🔥</td>
                        <td className="px-3 py-2">{s.speciesMastered}/25</td>
                        <td className="px-3 py-2">{s.badgeCount} 🏅</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{s.lastPlayed ? new Date(s.lastPlayed).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                    {studentStats.length === 0 && (
                      <tr><td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">No students yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Leaderboard Tab */}
            {tab === 'leaderboard' && (
              <div className="max-w-lg mx-auto space-y-3">
                {studentStats.length === 0 && <p className="text-center text-muted-foreground py-8">No data yet</p>}
                {studentStats.map((s, i) => (
                  <div key={s.id} className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${i === 0 ? 'border-primary bg-primary/5' : i === 1 ? 'border-accent/50 bg-accent/5' : i === 2 ? 'border-orange-400/50 bg-orange-400/5' : 'border-border bg-card'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg ${i === 0 ? 'bg-primary text-primary-foreground' : i === 1 ? 'bg-accent text-accent-foreground' : i === 2 ? 'bg-orange-400 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-foreground">{s.nickname}</div>
                      <div className="text-xs text-muted-foreground">{s.speciesMastered} mastered • {s.accuracy}% accuracy</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-primary text-lg">{s.totalXp}</div>
                      <div className="text-xs text-muted-foreground">XP</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Badges Tab */}
            {tab === 'badges' && (
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground">Badges earned by students in this class</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BADGES.map(badge => {
                    const earnedBy = badges.filter(b => b.badge_id === badge.id);
                    const earners = earnedBy.map(e => students.find(s => s.id === e.student_id)?.nickname).filter(Boolean);
                    return (
                      <div key={badge.id} className={`bg-card border rounded-lg p-4 ${earners.length > 0 ? 'border-primary/30' : 'border-border opacity-60'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{badge.icon}</span>
                          <div>
                            <div className="font-display font-bold text-foreground text-sm">{badge.name}</div>
                            <div className="text-xs text-muted-foreground">{badge.description}</div>
                          </div>
                        </div>
                        {earners.length > 0 && (
                          <div className="mt-2 text-xs text-primary">
                            Earned by: {earners.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
