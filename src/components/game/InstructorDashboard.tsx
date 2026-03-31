import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BADGES } from '@/data/badges';
import { PHASES } from '@/data/phases';
import { weeds, weedMap } from '@/data/weeds';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';
import Glossary from './Glossary';
import { QRCodeSVG } from 'qrcode.react';
import type { Json } from '@/integrations/supabase/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/* Types */
interface ClassInfo {
 id: string; name: string; join_code: string;
 instructor_name: string; instructor_id: string | null;
 created_at: string; year?: string | null; description?: string | null;
}
interface StudentRow { id: string; nickname: string; class_id: string; user_id?: string | null; }
interface SessionRow {
 id: string; student_id: string; grade_level: string; total_xp: number;
 total_correct: number; total_wrong: number; species_mastered: number;
 streak_best: number; phases_completed: number; session_data: Json | null; updated_at: string;
}
interface BadgeRow { id: string; student_id: string; badge_id: string; earned_at: string; }
interface Props { onClose: () => void; }

type Tab = 'overview' | 'students' | 'glossary';

/* Create-Class Modal */
function CreateClassModal({ instructorId, instructorName, onCreated, onClose }: {
 instructorId: string; instructorName: string;
 onCreated: (c: ClassInfo) => void; onClose: () => void;
}) {
 const [name, setName] = useState('');
 const [year, setYear] = useState(new Date().getFullYear().toString());
 const [description, setDescription] = useState('');
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState('');
 const [generatedCode, setGeneratedCode] = useState('');

 // Generate a passkey on mount
 useEffect(() => {
 supabase.rpc('generate_join_code').then(({ data }) => {
 if (data) setGeneratedCode(data as string);
 });
 }, []);

 const regenerate = async () => {
 const { data } = await supabase.rpc('generate_join_code');
 if (data) setGeneratedCode(data as string);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!name.trim()) { setError('Class name is required'); return; }
 if (!generatedCode) { setError('Passkey not ready yet'); return; }
 setSaving(true); setError('');
 const { data, error: dbErr } = await supabase.from('classes').insert({
 name: name.trim(),
 year: year.trim() || null,
 description: description.trim() || null,
 join_code: generatedCode,
 instructor_id: instructorId,
 instructor_name: instructorName,
 } as any).select().single();
 setSaving(false);
 if (dbErr) { setError(dbErr.message); return; }
 onCreated(data as unknown as ClassInfo);
 };

 return (
 <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
 <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scale-in">
 <div className="flex items-center justify-between">
 <h2 className="text-xl font-display font-bold text-foreground"> Create New Class</h2>
 <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none"></button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 {/* Class Name */}
 <div className="space-y-1">
 <label className="text-sm font-medium text-foreground">Class Name *</label>
 <input value={name} onChange={e => setName(e.target.value)}
 placeholder="e.g. Agronomy 101, Period 3"
 className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
 </div>

 {/* Year */}
 <div className="space-y-1">
 <label className="text-sm font-medium text-foreground">School Year</label>
 <input value={year} onChange={e => setYear(e.target.value)}
 placeholder="e.g. 2025-2026"
 className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
 </div>

 {/* Description */}
 <div className="space-y-1">
 <label className="text-sm font-medium text-foreground">Description / Notes</label>
 <textarea value={description} onChange={e => setDescription(e.target.value)}
 placeholder="Optional: section notes, topics covered, grading period…"
 rows={3}
 className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
 </div>

 {/* Passkey */}
 <div className="space-y-1">
 <label className="text-sm font-medium text-foreground">Student Join Passkey</label>
 <div className="flex gap-2">
 <div className="flex-1 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 font-mono font-bold text-primary text-center text-lg tracking-[0.25em]">
 {generatedCode || '…'}
 </div>
 <button type="button" onClick={regenerate}
 className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-secondary transition-colors">
 New
 </button>
 </div>
 <p className="text-xs text-muted-foreground">Share this code with students so they can join the class. You can regenerate it before creating.</p>
 </div>

 {error && <p className="text-sm text-destructive">{error}</p>}

 <div className="flex gap-2 justify-end pt-1">
 <button type="button" onClick={onClose}
 className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary transition-colors">
 Cancel
 </button>
 <button type="submit" disabled={saving}
 className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
 {saving ? 'Creating…' : ' Create Class'}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}

/* Student Detail Modal */
/* Helper: extract per-weed and per-phase stats from session_data */
function extractSessionStats(sessions: SessionRow[]) {
 const weedAgg: Record<string, { shown: number; correct: number; wrong: number; totalTimeMs: number; mastered: boolean }> = {};
 const phaseAgg: Record<string, { correct: number; wrong: number }> = {};

 for (const sess of sessions) {
 const data = sess.session_data as any;
 if (!data) continue;
 const ws = data.weedStats as Record<string, any> | undefined;
 const ps = data.phaseStats as Record<string, any> | undefined;
 if (ws) {
 for (const [wid, stat] of Object.entries(ws)) {
 const s = stat as any;
 if (!weedAgg[wid]) weedAgg[wid] = { shown: 0, correct: 0, wrong: 0, totalTimeMs: 0, mastered: false };
 weedAgg[wid].shown += s.timesShown || 0;
 weedAgg[wid].correct += s.timesCorrect || 0;
 weedAgg[wid].wrong += s.timesWrong || 0;
 weedAgg[wid].totalTimeMs += s.totalTimeMs || 0;
 if (s.mastered) weedAgg[wid].mastered = true;
 }
 }
 if (ps) {
 for (const [pid, stat] of Object.entries(ps)) {
 const s = stat as any;
 if (!phaseAgg[pid]) phaseAgg[pid] = { correct: 0, wrong: 0 };
 phaseAgg[pid].correct += s.correct || 0;
 phaseAgg[pid].wrong += s.wrong || 0;
 }
 }
 }
 return { weedAgg, phaseAgg };
}

/* Student Detail Modal */
function StudentDetailModal({ student, sessions, badges, onClose }: {
 student: { id: string; nickname: string; totalXp: number; totalCorrect: number; totalWrong: number; bestStreak: number; speciesMastered: number; accuracy: string; badgeCount: number; sessions: number; lastPlayed: string | null; };
 sessions: SessionRow[];
 badges: BadgeRow[];
 onClose: () => void;
}) {
 const [detailTab, setDetailTab] = useState<'overview' | 'weeds'>('overview');
 const earnedBadges = badges.filter(b => b.student_id === student.id)
 .map(b => BADGES.find(badge => badge.id === b.badge_id))
 .filter(Boolean);

 const { weedAgg, phaseAgg } = useMemo(() => extractSessionStats(sessions), [sessions]);

 // Per-grade breakdown
 const gradeBreakdown = useMemo(() => {
 const map: Record<string, { correct: number; wrong: number; xp: number; count: number }> = {};
 sessions.forEach(s => {
 if (!map[s.grade_level]) map[s.grade_level] = { correct: 0, wrong: 0, xp: 0, count: 0 };
 map[s.grade_level].correct += s.total_correct;
 map[s.grade_level].wrong += s.total_wrong;
 map[s.grade_level].xp += s.total_xp;
 map[s.grade_level].count += 1;
 });
 return Object.entries(map).map(([grade, d]) => ({ grade, ...d }));
 }, [sessions]);

 const totalPhases = sessions.reduce((sum, s) => sum + s.phases_completed, 0);
 const totalQuestions = student.totalCorrect + student.totalWrong;
 const estimatedMinutes = Math.round((totalQuestions * 30) / 60);

 // Weed rows for table
 const weedRows = useMemo(() => {
 return weeds.map(w => {
 const stat = weedAgg[w.id];
 const shown = stat?.shown ?? 0;
 const correct = stat?.correct ?? 0;
 const wrong = stat?.wrong ?? 0;
 const acc = shown > 0 ? (correct / shown) * 100 : -1;
 const mastered = stat?.mastered ?? false;
 const status = mastered ? 'Mastered' : (shown >= 3 && acc < 50) ? 'Struggling' : shown > 0 ? 'In Progress' : 'Not Seen';
 return { id: w.id, name: w.commonName, shown, correct, wrong, acc, mastered, status };
 }).filter(r => r.shown > 0).sort((a, b) => b.shown - a.shown);
 }, [weedAgg]);

 const masteredWeeds = weedRows.filter(r => r.mastered);
 const strugglingWeeds = weedRows.filter(r => r.status === 'Struggling');

 // Phase rows
 const phaseRows = useMemo(() => {
 const allPhases = [...PHASES.elementary, ...PHASES.middle, ...PHASES.high];
 const seen = new Set<string>();
 return allPhases.filter(p => {
 if (seen.has(p.id)) return false;
 seen.add(p.id);
 return !!phaseAgg[p.id];
 }).map(p => {
 const stat = phaseAgg[p.id];
 const total = stat.correct + stat.wrong;
 const acc = total > 0 ? (stat.correct / total) * 100 : 0;
 return { id: p.id, name: p.name, correct: stat.correct, wrong: stat.wrong, total, acc };
 });
 }, [phaseAgg]);

 return (
 <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
 <div className="bg-card border border-border rounded-2xl shadow-xl max-w-3xl w-full p-6 space-y-5 animate-scale-in my-4 max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-display font-bold text-foreground">{student.nickname}</h2>
 <p className="text-xs text-muted-foreground">
 Last active: {student.lastPlayed ? new Date(student.lastPlayed).toLocaleDateString() : 'Never'}
 </p>
 </div>
  <button onClick={onClose} className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-secondary transition-colors">Exit</button>
  <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">x</button>
 </div>

  <div className="flex gap-1 bg-muted rounded-lg p-1">
   {(['overview', 'weeds'] as const).map(t => (
    <button key={t} onClick={() => setDetailTab(t)}
     className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${detailTab === t ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
     {t === 'weeds' ? 'Per-Weed' : 'Overview'}
    </button>
   ))}
  </div>

 {detailTab === 'overview' && (
 <div className="space-y-4">
 {/* Key Stats Grid */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[
 { label: 'Total XP', value: student.totalXp, color: 'text-primary' },
 { label: 'Accuracy', value: `${student.accuracy}%`, color: 'text-accent' },
 { label: 'Best Streak', value: student.bestStreak, color: 'text-foreground' },
 { label: 'Time Spent', value: `${estimatedMinutes} min`, color: 'text-foreground' },
 ].map(s => (
 <div key={s.label} className="bg-muted rounded-lg p-3 text-center">
 <div className={`text-lg font-display font-bold ${s.color}`}>{s.value}</div>
 <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
 </div>
 ))}
 </div>

 {/* Species Mastered vs Struggling */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
 <h4 className="text-sm font-semibold text-accent mb-1">Excels At ({masteredWeeds.length})</h4>
 {masteredWeeds.length > 0 ? (
 <div className="flex flex-wrap gap-1">
 {masteredWeeds.map(w => (
 <span key={w.id} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent">{w.name}</span>
 ))}
 </div>
 ) : <p className="text-xs text-muted-foreground">No species mastered yet</p>}
 </div>
 <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
 <h4 className="text-sm font-semibold text-destructive mb-1">Struggling With ({strugglingWeeds.length})</h4>
 {strugglingWeeds.length > 0 ? (
 <div className="flex flex-wrap gap-1">
 {strugglingWeeds.map(w => (
 <span key={w.id} className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive">{w.name}</span>
 ))}
 </div>
 ) : <p className="text-xs text-muted-foreground">No struggling species</p>}
 </div>
 </div>

 {/* Grade breakdown chart */}
 {gradeBreakdown.length > 0 && (
 <div>
 <h3 className="text-sm font-semibold text-foreground mb-2">Questions by Grade Level</h3>
 <ResponsiveContainer width="100%" height={140}>
 <BarChart data={gradeBreakdown} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
 <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
 <YAxis tick={{ fontSize: 11 }} />
 <Tooltip />
 <Legend />
 <Bar dataKey="correct" name="Correct" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
 <Bar dataKey="wrong" name="Wrong" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 )}

 {/* Badges */}
 <div>
 <h3 className="text-sm font-semibold text-foreground mb-2">Badges Earned ({earnedBadges.length})</h3>
 {earnedBadges.length > 0 ? (
 <div className="flex flex-wrap gap-2">
 {earnedBadges.map(badge => badge && (
 <div key={badge.id} title={badge.description}
 className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 rounded-full px-3 py-1 text-xs font-medium text-primary">
 <span>{badge.icon}</span><span>{badge.name}</span>
 </div>
 ))}
 </div>
 ) : <p className="text-sm text-muted-foreground">No badges earned yet</p>}
 </div>

 {/* Session Log */}
 <div>
 <h3 className="text-sm font-semibold text-foreground mb-2">Session History ({sessions.length})</h3>
 <div className="overflow-x-auto rounded-lg border border-border max-h-44 overflow-y-auto">
 <table className="w-full text-xs">
 <thead className="sticky top-0 bg-muted">
 <tr>
 {['Date', 'Grade', 'XP', 'Correct', 'Wrong', 'Mastered', 'Phases'].map(h => (
 <th key={h} className="px-2 py-1.5 text-left text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {sessions.length === 0 && (
 <tr><td colSpan={7} className="px-2 py-4 text-center text-muted-foreground">No sessions yet</td></tr>
 )}
 {[...sessions].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).map(s => (
 <tr key={s.id} className="border-t border-border hover:bg-muted/50">
 <td className="px-2 py-1.5">{new Date(s.updated_at).toLocaleDateString()}</td>
 <td className="px-2 py-1.5 capitalize">{s.grade_level}</td>
 <td className="px-2 py-1.5 text-primary font-semibold">{s.total_xp}</td>
 <td className="px-2 py-1.5 text-accent">{s.total_correct}</td>
 <td className="px-2 py-1.5 text-destructive">{s.total_wrong}</td>
 <td className="px-2 py-1.5">{s.species_mastered}</td>
 <td className="px-2 py-1.5">{s.phases_completed}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* Per-Weed Tab */}
 {detailTab === 'weeds' && (
 <div className="space-y-3">
 {weedRows.length === 0 ? (
 <p className="text-center text-muted-foreground py-6">No per-weed data available yet. Data appears after the student answers questions.</p>
 ) : (
 <div className="overflow-x-auto rounded-lg border border-border max-h-[60vh] overflow-y-auto">
 <table className="w-full text-sm">
 <thead className="sticky top-0 bg-muted">
 <tr>
 {['Weed', 'Shown', 'Correct', 'Wrong', 'Accuracy', 'Status'].map(h => (
 <th key={h} className="px-3 py-2 text-left text-muted-foreground font-medium text-xs">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {weedRows.map(r => (
 <tr key={r.id} className={`border-t border-border ${r.status === 'Struggling' ? 'bg-destructive/10' : r.status === 'Mastered' ? 'bg-accent/10' : ''}`}>
 <td className="px-3 py-2 font-medium text-foreground">{r.name}</td>
 <td className="px-3 py-2">{r.shown}</td>
 <td className="px-3 py-2 text-accent">{r.correct}</td>
 <td className="px-3 py-2 text-destructive">{r.wrong}</td>
 <td className="px-3 py-2">{r.acc >= 0 ? `${r.acc.toFixed(0)}%` : '—'}</td>
 <td className={`px-3 py-2 font-semibold text-xs ${r.status === 'Mastered' ? 'text-accent' : r.status === 'Struggling' ? 'text-destructive' : 'text-muted-foreground'}`}>{r.status}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 )}

 {/* Per-Phase Tab */}
 {detailTab === 'phases' && (
 <div className="space-y-3">
 {phaseRows.length === 0 ? (
 <p className="text-center text-muted-foreground py-6">No per-phase data available yet. Data appears after the student answers questions.</p>
 ) : (
 <div className="space-y-2">
 {phaseRows.map(p => {
 const pct = p.total > 0 ? (p.correct / p.total) * 100 : 0;
 return (
 <div key={p.id} className="bg-muted/30 rounded-lg p-3">
 <div className="flex items-center justify-between mb-1">
 <span className="text-sm font-medium text-foreground">{p.name}</span>
 <span className={`text-xs font-bold ${pct >= 70 ? 'text-accent' : pct >= 40 ? 'text-foreground' : 'text-destructive'}`}>{pct.toFixed(0)}%</span>
 </div>
 <div className="h-2 bg-muted rounded-full overflow-hidden">
 <div className={`h-full rounded-full transition-all ${pct >= 70 ? 'bg-accent' : pct >= 40 ? 'bg-primary' : 'bg-destructive'}`} style={{ width: `${pct}%` }} />
 </div>
 <div className="text-[10px] text-muted-foreground mt-1">{p.correct} correct, {p.wrong} wrong ({p.total} total)</div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 );
}

/* Main Dashboard */
export default function InstructorDashboard({ onClose }: Props) {
 const { user, instructor, role, loading: authLoading, logout, isAuthenticated } = useAuth();
 const [showAuth, setShowAuth] = useState(false);
 const [showCreateClass, setShowCreateClass] = useState(false);
 const [showGlossary, setShowGlossary] = useState(false);
 const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

 const [classes, setClasses] = useState<ClassInfo[]>([]);
 const [selectedClass, setSelectedClass] = useState<string | null>(null);
 const [students, setStudents] = useState<StudentRow[]>([]);
 const [sessions, setSessions] = useState<SessionRow[]>([]);
 const [badges, setBadges] = useState<BadgeRow[]>([]);
 const [tab, setTab] = useState<Tab>('overview');
 const [loading, setLoading] = useState(true);
 const [showQR, setShowQR] = useState(false);

 /* Auth guard */
 useEffect(() => {
 if (!authLoading && !isAuthenticated) setShowAuth(true);
 else if (!authLoading && isAuthenticated) setShowAuth(false);
 }, [authLoading, isAuthenticated]);

 /* Load instructor's classes */
 useEffect(() => {
 if (!instructor) return;
 supabase.from('classes').select('*')
 .eq('instructor_id', instructor.id)
 .order('created_at', { ascending: false })
 .then(({ data }) => {
 setClasses((data as unknown as ClassInfo[]) || []);
 if (data && data.length > 0) setSelectedClass(data[0].id);
 setLoading(false);
 });
 }, [instructor]);

 /* Load class data */
 useEffect(() => {
 if (!selectedClass) { setLoading(false); return; }
 const load = async () => {
 const { data: studs } = await supabase.from('students').select('*').eq('class_id', selectedClass);
 const list = (studs as StudentRow[]) || [];
 setStudents(list);
 if (list.length > 0) {
 const ids = list.map(s => s.id);
 const [{ data: sess }, { data: bdg }] = await Promise.all([
 supabase.from('game_sessions').select('*').in('student_id', ids),
 supabase.from('student_badges').select('*').in('student_id', ids),
 ]);
 setSessions((sess as SessionRow[]) || []);
 setBadges((bdg as BadgeRow[]) || []);
 } else { setSessions([]); setBadges([]); }
 };
 load();
 }, [selectedClass]);

 const selectedClassInfo = classes.find(c => c.id === selectedClass);
 const joinUrl = selectedClassInfo ? `${window.location.origin}?join=${selectedClassInfo.join_code}` : '';

 /* Aggregated student stats */
 const studentStats = useMemo(() => students.map(s => {
 const stuSess = sessions.filter(sess => sess.student_id === s.id);
 const totalXp = stuSess.reduce((sum, sess) => sum + sess.total_xp, 0);
 const totalCorrect = stuSess.reduce((sum, sess) => sum + sess.total_correct, 0);
 const totalWrong = stuSess.reduce((sum, sess) => sum + sess.total_wrong, 0);
 const bestStreak = Math.max(0, ...stuSess.map(sess => sess.streak_best));
 const speciesMastered = Math.max(0, ...stuSess.map(sess => sess.species_mastered), 0);
 const total = totalCorrect + totalWrong;
 const accuracy = total > 0 ? ((totalCorrect / total) * 100).toFixed(1) : '0';
 const badgeCount = badges.filter(b => b.student_id === s.id).length;
 const lastPlayed = stuSess.length > 0 ? [...stuSess].sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0].updated_at : null;
 const totalQuestions = totalCorrect + totalWrong;
 const estimatedMinutes = Math.round((totalQuestions * 30) / 60);
 return { ...s, totalXp, totalCorrect, totalWrong, bestStreak, speciesMastered, accuracy, badgeCount, lastPlayed, sessions: stuSess.length, estimatedMinutes };
 }).sort((a, b) => b.totalXp - a.totalXp), [students, sessions, badges]);

 const classStats = useMemo(() => {
 const totalXp = sessions.reduce((s, sess) => s + sess.total_xp, 0);
 const totalCorrect = sessions.reduce((s, sess) => s + sess.total_correct, 0);
 const totalWrong = sessions.reduce((s, sess) => s + sess.total_wrong, 0);
 const total = totalCorrect + totalWrong;
 const accuracy = total > 0 ? ((totalCorrect / total) * 100).toFixed(1) : '—';
 const totalPhases = sessions.reduce((s, sess) => s + sess.phases_completed, 0);
 const totalBadges = badges.length;
 const totalMinutes = Math.round((total * 30) / 60);
 return { totalSessions: sessions.length, totalXp, totalCorrect, totalWrong, accuracy, studentCount: students.length, totalPhases, totalBadges, totalMinutes };
 }, [sessions, students, badges]);

 /* Chart data: top 8 students by XP */
 const chartData = useMemo(() =>
 studentStats.slice(0, 8).map(s => ({
 name: s.nickname.length > 8 ? s.nickname.slice(0, 8) + '…' : s.nickname,
 XP: s.totalXp,
 Correct: s.totalCorrect,
 })), [studentStats]);

 /* Class-level per-weed and per-phase aggregation */
 const classWeedStats = useMemo(() => {
 const { weedAgg } = extractSessionStats(sessions);
 return weeds.map(w => {
 const stat = weedAgg[w.id];
 const shown = stat?.shown ?? 0;
 const correct = stat?.correct ?? 0;
 const wrong = stat?.wrong ?? 0;
 const acc = shown > 0 ? (correct / shown) * 100 : -1;
 const mastered = stat?.mastered ?? false;
 const status = mastered ? 'Mastered' : (shown >= 3 && acc < 50) ? 'Struggling' : shown > 0 ? 'In Progress' : 'Not Seen';
 return { id: w.id, name: w.commonName, shown, correct, wrong, acc, mastered, status };
 }).filter(r => r.shown > 0).sort((a, b) => b.shown - a.shown);
 }, [sessions]);

 const classPhaseStats = useMemo(() => {
 const { phaseAgg } = extractSessionStats(sessions);
 const allPhases = [...PHASES.elementary, ...PHASES.middle, ...PHASES.high];
 const seen = new Set<string>();
 return allPhases.filter(p => {
 if (seen.has(p.id)) return false;
 seen.add(p.id);
 return !!phaseAgg[p.id];
 }).map(p => {
 const stat = phaseAgg[p.id];
 const total = stat.correct + stat.wrong;
 const acc = total > 0 ? (stat.correct / total) * 100 : 0;
 return { id: p.id, name: p.name, correct: stat.correct, wrong: stat.wrong, total, acc };
 });
 }, [sessions]);

 const tabs: { key: Tab; label: string }[] = [
 { key: 'overview', label: ' Overview' },
 { key: 'students', label: ' Students' },
 { key: 'leaderboard', label: ' Leaderboard' },
 { key: 'badges', label: ' Badges' },
 { key: 'glossary', label: ' Glossary' },
 ];

 /* Loading / Auth guards */
 if (authLoading) return (
 <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex items-center justify-center">
 <div className="text-lg text-muted-foreground">Loading…</div>
 </div>
 );
 if (!isAuthenticated || showAuth) return (
 <AuthModal onAuthenticated={(r) => { setShowAuth(false); if (r === 'student') onClose(); }} onClose={onClose} defaultMode="login" />
 );
 if (role !== 'instructor' || !instructor) return (
 <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex items-center justify-center p-4">
 <div className="bg-card border border-border rounded-xl shadow-lg max-w-md w-full p-6 space-y-4 text-center animate-scale-in">
 <div className="text-4xl"></div>
 <h2 className="text-xl font-display font-bold text-foreground">Instructor Access Required</h2>
 <p className="text-sm text-muted-foreground">You're logged in as a student. Sign out and use an instructor account.</p>
 <div className="flex gap-2 justify-center">
 <button onClick={logout} className="px-4 py-2 rounded-lg border border-destructive/50 text-destructive hover:bg-destructive/10 text-sm">Sign Out</button>
 <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm">Close</button>
 </div>
 </div>
 </div>
 );

 return (
 <>
 {/* Overlays */}
 {showCreateClass && instructor && (
 <CreateClassModal
 instructorId={instructor.id}
 instructorName={instructor.display_name}
 onCreated={(c) => {
 setClasses(prev => [c, ...prev]);
 setSelectedClass(c.id);
 setStudents([]); setSessions([]); setBadges([]);
 setShowCreateClass(false);
 }}
 onClose={() => setShowCreateClass(false)}
 />
 )}
 {showGlossary && <Glossary onClose={() => setShowGlossary(false)} />}
 {selectedStudentId && (() => {
 const s = studentStats.find(s => s.id === selectedStudentId);
 if (!s) return null;
 return (
 <StudentDetailModal
 student={s}
 sessions={sessions.filter(sess => sess.student_id === s.id)}
 badges={badges}
 onClose={() => setSelectedStudentId(null)}
 />
 );
 })()}

 {/* Main Dashboard */}
 <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-y-auto">
 <div className="max-w-6xl mx-auto p-4 sm:p-6">

 {/* Header */}
 <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
 <div>
 <h1 className="text-2xl font-display font-bold text-primary"> Instructor Dashboard</h1>
 <p className="text-sm text-muted-foreground">Welcome, {instructor.display_name}</p>
 </div>
 <div className="flex flex-wrap gap-2">
 <button onClick={() => setShowGlossary(true)}
 className="px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm">
 Glossary
 </button>
 <button onClick={() => setShowCreateClass(true)}
 className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-semibold">
 New Class
 </button>
 <button onClick={logout} className="px-3 py-2 rounded-lg border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors text-sm">Sign Out</button>
 <button onClick={onClose} className="px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm"> Close</button>
 </div>
 </div>

 {/* No classes */}
 {classes.length === 0 ? (
 <div className="text-center py-16 space-y-4">
 <div className="text-5xl"></div>
 <p className="text-lg font-display font-semibold text-foreground">No classes yet</p>
 <p className="text-sm text-muted-foreground">Create your first class to start tracking student progress.</p>
 <button onClick={() => setShowCreateClass(true)}
 className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
 Create My First Class
 </button>
 </div>
 ) : (
 <>
 {/* Class Selector */}
 <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-card border border-border rounded-xl">
 <label className="text-sm font-medium text-muted-foreground">Class:</label>
 <select value={selectedClass || ''} onChange={e => setSelectedClass(e.target.value)}
 className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
 {classes.map(c => <option key={c.id} value={c.id}>{c.name}{c.year ? ` (${c.year})` : ''}</option>)}
 </select>
 {selectedClassInfo && (
 <>
 <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-sm">
 Passkey: <span className="font-mono font-bold text-primary tracking-wider">{selectedClassInfo.join_code}</span>
 </div>
 <button onClick={() => setShowQR(!showQR)}
 className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-secondary transition-colors">
 {showQR ? 'Hide QR' : ' QR Code'}
 </button>
 </>
 )}
 <button onClick={() => setShowCreateClass(true)}
 className="ml-auto px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
 New Class
 </button>
 </div>

 {/* Class description/year */}
 {selectedClassInfo?.description && (
 <div className="mb-4 px-4 py-3 bg-muted rounded-lg text-sm text-muted-foreground italic">
 {selectedClassInfo.description}
 </div>
 )}

 {/* QR Code */}
 {showQR && selectedClassInfo && (
 <div className="mb-4 p-6 bg-card border border-border rounded-xl text-center space-y-3">
 <p className="text-sm text-muted-foreground">Students scan to join — <strong>{selectedClassInfo.name}</strong></p>
 <div className="inline-block bg-white p-4 rounded-lg">
 <QRCodeSVG value={joinUrl} size={200} />
 </div>
 <p className="text-xs text-muted-foreground font-mono break-all">{joinUrl}</p>
 </div>
 )}

 {/* Tabs */}
 <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 overflow-x-auto">
 {tabs.map(t => (
 <button key={t.key} onClick={() => setTab(t.key)}
 className={`flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
 {t.label}
 </button>
 ))}
 </div>

 {/* OVERVIEW TAB */}
 {tab === 'overview' && (
 <div className="space-y-6">
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
 {[
 { label: 'Students', value: classStats.studentCount, icon: '' },
 { label: 'Total XP', value: classStats.totalXp.toLocaleString(), icon: '' },
 { label: 'Accuracy', value: `${classStats.accuracy}%`, icon: '' },
 { label: 'Time Spent', value: `${classStats.totalMinutes} min`, icon: '' },
 { label: 'Badges Earned', value: classStats.totalBadges, icon: '' },
 ].map(s => (
 <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
 <div className="text-2xl mb-1">{s.icon}</div>
 <div className="text-xl font-display font-bold text-foreground">{s.value}</div>
 <div className="text-xs text-muted-foreground">{s.label}</div>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[
 { label: 'Sessions', value: classStats.totalSessions },
 { label: 'Correct Answers', value: classStats.totalCorrect },
 { label: 'Wrong Answers', value: classStats.totalWrong },
 { label: 'Phases Completed', value: classStats.totalPhases },
 ].map(s => (
 <div key={s.label} className="bg-card border border-border rounded-lg p-3">
 <div className="text-xs text-muted-foreground">{s.label}</div>
 <div className="text-lg font-bold text-foreground">{s.value}</div>
 </div>
 ))}
 </div>

 {chartData.length > 0 && (
 <div className="bg-card border border-border rounded-xl p-4">
 <h3 className="text-sm font-semibold text-foreground mb-3"> Top Students — XP & Correct Answers</h3>
 <ResponsiveContainer width="100%" height={180}>
 <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
 <XAxis dataKey="name" tick={{ fontSize: 11 }} />
 <YAxis tick={{ fontSize: 11 }} />
 <Tooltip />
 <Legend />
 <Bar dataKey="XP" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
 <Bar dataKey="Correct" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 )}

 {/* Class-level Per-Phase Accuracy */}
 {classPhaseStats.length > 0 && (
 <div className="bg-card border border-border rounded-xl p-4">
 <h3 className="text-sm font-semibold text-foreground mb-3">Class Per-Phase Accuracy</h3>
 <div className="space-y-2">
 {classPhaseStats.map(p => {
 const pct = p.total > 0 ? (p.correct / p.total) * 100 : 0;
 return (
 <div key={p.id}>
 <div className="flex items-center justify-between mb-1">
 <span className="text-xs font-medium text-foreground">{p.name}</span>
 <span className={`text-xs font-bold ${pct >= 70 ? 'text-accent' : pct >= 40 ? 'text-foreground' : 'text-destructive'}`}>{pct.toFixed(0)}% ({p.correct}/{p.total})</span>
 </div>
 <div className="h-1.5 bg-muted rounded-full overflow-hidden">
 <div className={`h-full rounded-full ${pct >= 70 ? 'bg-accent' : pct >= 40 ? 'bg-primary' : 'bg-destructive'}`} style={{ width: `${pct}%` }} />
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* Class-level Per-Weed Performance */}
 {classWeedStats.length > 0 && (
 <div className="bg-card border border-border rounded-xl p-4">
 <h3 className="text-sm font-semibold text-foreground mb-3">Class Per-Weed Performance (Top 15)</h3>
 <div className="overflow-x-auto rounded-lg border border-border max-h-64 overflow-y-auto">
 <table className="w-full text-xs">
 <thead className="sticky top-0 bg-muted">
 <tr>
 {['Weed', 'Shown', 'Correct', 'Wrong', 'Accuracy', 'Status'].map(h => (
 <th key={h} className="px-2 py-1.5 text-left text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {classWeedStats.slice(0, 15).map(r => (
 <tr key={r.id} className={`border-t border-border ${r.status === 'Struggling' ? 'bg-destructive/10' : r.status === 'Mastered' ? 'bg-accent/10' : ''}`}>
 <td className="px-2 py-1.5 font-medium">{r.name}</td>
 <td className="px-2 py-1.5">{r.shown}</td>
 <td className="px-2 py-1.5 text-accent">{r.correct}</td>
 <td className="px-2 py-1.5 text-destructive">{r.wrong}</td>
 <td className="px-2 py-1.5">{r.acc >= 0 ? `${r.acc.toFixed(0)}%` : '—'}</td>
 <td className={`px-2 py-1.5 font-semibold ${r.status === 'Mastered' ? 'text-accent' : r.status === 'Struggling' ? 'text-destructive' : 'text-muted-foreground'}`}>{r.status}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {students.length === 0 && (
 <div className="text-center py-10 space-y-2">
 <p className="text-muted-foreground">No students have joined yet.</p>
 <p className="text-sm text-muted-foreground">Share the passkey <span className="font-mono font-bold text-primary">{selectedClassInfo?.join_code}</span> or show the QR code.</p>
 </div>
 )}
 </div>
 )}

 {/* STUDENTS TAB */}
 {tab === 'students' && (
 <div className="overflow-x-auto rounded-xl border border-border">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-muted">
 {['Nickname', 'Sessions', 'XP', 'Correct', 'Wrong', 'Accuracy', 'Streak', 'Mastered', 'Badges', 'Time', 'Last Played', ''].map(h => (
 <th key={h} className="px-3 py-2.5 text-left text-muted-foreground font-medium text-xs whitespace-nowrap">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {studentStats.map(s => (
 <tr key={s.id} className="border-t border-border hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedStudentId(s.id)}>
 <td className="px-3 py-2 font-medium text-foreground">{s.nickname}</td>
 <td className="px-3 py-2">{s.sessions}</td>
 <td className="px-3 py-2 text-primary font-semibold">{s.totalXp}</td>
 <td className="px-3 py-2 text-accent">{s.totalCorrect}</td>
 <td className="px-3 py-2 text-destructive">{s.totalWrong}</td>
 <td className="px-3 py-2">{s.accuracy}%</td>
 <td className="px-3 py-2">{s.bestStreak} </td>
 <td className="px-3 py-2">{s.speciesMastered}/25</td>
 <td className="px-3 py-2">{s.badgeCount} </td>
 <td className="px-3 py-2 text-xs">{s.estimatedMinutes} min</td>
 <td className="px-3 py-2 text-xs text-muted-foreground">{s.lastPlayed ? new Date(s.lastPlayed).toLocaleDateString() : '—'}</td>
 <td className="px-3 py-2">
 <span className="text-primary text-xs hover:underline">Details →</span>
 </td>
 </tr>
 ))}
 {studentStats.length === 0 && (
 <tr><td colSpan={12} className="px-3 py-8 text-center text-muted-foreground">No students yet</td></tr>
 )}
 </tbody>
 </table>
 </div>
 )}

 {/* LEADERBOARD TAB */}
 {tab === 'leaderboard' && (
 <div className="max-w-lg mx-auto space-y-3">
 {studentStats.length === 0 && <p className="text-center text-muted-foreground py-8">No data yet</p>}
 {studentStats.map((s, i) => (
 <div key={s.id} onClick={() => setSelectedStudentId(s.id)} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${i === 0 ? 'border-primary bg-primary/5' : i === 1 ? 'border-accent/50 bg-accent/5' : i === 2 ? 'border-orange-400/50 bg-orange-400/5' : 'border-border bg-card hover:bg-muted/50'}`}>
 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg flex-shrink-0 ${i === 0 ? 'bg-primary text-primary-foreground' : i === 1 ? 'bg-accent text-accent-foreground' : i === 2 ? 'bg-orange-400 text-white' : 'bg-muted text-muted-foreground'}`}>
 {i + 1}
 </div>
 <div className="flex-1 min-w-0">
 <div className="font-display font-bold text-foreground truncate">{s.nickname}</div>
 <div className="text-xs text-muted-foreground">{s.speciesMastered} mastered · {s.accuracy}% accuracy · {s.badgeCount} badges</div>
 </div>
 <div className="text-right flex-shrink-0">
 <div className="font-display font-bold text-primary text-lg">{s.totalXp}</div>
 <div className="text-xs text-muted-foreground">XP</div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* BADGES TAB */}
 {tab === 'badges' && (
 <div className="space-y-4">
 <p className="text-sm text-muted-foreground">Badges earned by students in <strong>{selectedClassInfo?.name}</strong></p>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {BADGES.map(badge => {
 const earnedBy = badges.filter(b => b.badge_id === badge.id);
 const earners = earnedBy.map(e => students.find(s => s.id === e.student_id)?.nickname).filter(Boolean);
 return (
 <div key={badge.id} className={`bg-card border rounded-xl p-4 ${earners.length > 0 ? 'border-primary/30' : 'border-border opacity-50'}`}>
 <div className="flex items-center gap-3">
 <span className="text-3xl">{badge.icon}</span>
 <div>
 <div className="font-display font-bold text-foreground text-sm">{badge.name}</div>
 <div className="text-xs text-muted-foreground">{badge.description}</div>
 </div>
 </div>
 {earners.length > 0 ? (
 <div className="mt-2 text-xs text-primary"> Earned by: {earners.join(', ')}</div>
 ) : (
 <div className="mt-2 text-xs text-muted-foreground">Not yet earned</div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* GLOSSARY TAB */}
 {tab === 'glossary' && (
 <div className="rounded-xl border border-border overflow-hidden" style={{ height: '70vh' }}>
 <Glossary onClose={() => setTab('overview')} />
 </div>
 )}
 </>
 )}
 </div>
 </div>
 </>
 );
}
