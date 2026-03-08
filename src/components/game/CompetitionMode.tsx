import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStudent } from '@/contexts/StudentContext';
import { weeds, weedMap } from '@/data/weeds';
import { PHASES, GRADE_NAMES, GRADE_RANGES } from '@/data/phases';
import type { GradeLevel, Weed } from '@/types/game';
import WeedImage from './WeedImage';

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const a = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  for (let i = a.length - 1; i > 0; i--) {
    h = (h * 16807 + 12345) & 0x7fffffff;
    const j = h % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface CompetitionData {
  id: string;
  class_id: string;
  mode: string;
  grade_level: string;
  question_count: number;
  time_limit_seconds: number;
  status: string;
  question_seed: string;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

interface ScoreData {
  id: string;
  competition_id: string;
  student_id: string;
  team_name: string | null;
  score: number;
  correct_count: number;
  total_count: number;
  time_taken_ms: number;
  completed: boolean;
}

interface Props {
  onClose: () => void;
}

function generateQuestions(seed: string, grade: GradeLevel, count: number) {
  const shuffled = seededShuffle(weeds, seed);
  const picked = shuffled.slice(0, count);
  return picked.map(weed => {
    const others = weeds.filter(w => w.id !== weed.id);
    const wrongOptions = seededShuffle(others, seed + weed.id).slice(0, 3).map(w => w.commonName);
    const options = seededShuffle([weed.commonName, ...wrongOptions], seed + weed.id + 'opts');
    return { weedId: weed.id, weed, options, correct: weed.commonName };
  });
}

export default function CompetitionMode({ onClose }: Props) {
  const { session } = useStudent();
  const [screen, setScreen] = useState<'lobby' | 'waiting' | 'playing' | 'results'>('lobby');
  const [grade, setGrade] = useState<GradeLevel>('middle');
  const [mode, setMode] = useState<'ffa' | 'teams'>('ffa');
  const [teamName, setTeamName] = useState('');
  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [scores, setScores] = useState<(ScoreData & { nickname?: string })[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const startTimeRef = useRef(0);
  const [joinCode, setJoinCode] = useState('');
  const [activeComps, setActiveComps] = useState<CompetitionData[]>([]);

  const questions = useMemo(() => {
    if (!competition) return [];
    return generateQuestions(competition.question_seed, competition.grade_level as GradeLevel, competition.question_count);
  }, [competition]);

  // Load active competitions for the class
  useEffect(() => {
    if (!session) return;
    const load = async () => {
      const { data } = await supabase
        .from('competition_sessions')
        .select('*')
        .eq('class_id', session.classId)
        .in('status', ['waiting', 'active'])
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setActiveComps(data as unknown as CompetitionData[]);
    };
    load();
  }, [session]);

  // Realtime subscription for scores
  useEffect(() => {
    if (!competition) return;
    const channel = supabase
      .channel(`comp-${competition.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competition_scores', filter: `competition_id=eq.${competition.id}` },
        () => loadScores())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competition_sessions', filter: `id=eq.${competition.id}` },
        (payload: any) => {
          const updated = payload.new as CompetitionData;
          setCompetition(updated);
          if (updated.status === 'active' && screen === 'waiting') {
            startTimeRef.current = Date.now();
            setScreen('playing');
            setTimeLeft(updated.time_limit_seconds);
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [competition?.id]);

  // Timer countdown
  useEffect(() => {
    if (screen !== 'playing' || !competition) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = competition.time_limit_seconds - elapsed;
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) finishCompetition();
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, competition]);

  const loadScores = async () => {
    if (!competition) return;
    const { data } = await supabase
      .from('competition_scores')
      .select('*')
      .eq('competition_id', competition.id)
      .order('score', { ascending: false });
    if (data) {
      // Load nicknames
      const studentIds = data.map((s: any) => s.student_id);
      const { data: students } = await supabase.from('students').select('id, nickname').in('id', studentIds);
      const nickMap: Record<string, string> = {};
      students?.forEach((s: any) => { nickMap[s.id] = s.nickname; });
      setScores(data.map((s: any) => ({ ...s, nickname: nickMap[s.student_id] || 'Unknown' })) as any);
    }
  };

  const createCompetition = async () => {
    if (!session) return;
    const seed = Math.random().toString(36).slice(2, 10);
    const { data, error } = await supabase.from('competition_sessions').insert({
      class_id: session.classId,
      created_by: session.studentId,
      mode,
      grade_level: grade,
      question_count: 10,
      time_limit_seconds: 120,
      status: 'waiting',
      question_seed: seed,
    }).select().single();
    if (data) {
      setCompetition(data as unknown as CompetitionData);
      await supabase.from('competition_scores').insert({
        competition_id: data.id,
        student_id: session.studentId,
        team_name: mode === 'teams' ? teamName : null,
      });
      setScreen('waiting');
      loadScores();
    }
  };

  const joinCompetition = async (compId: string) => {
    if (!session) return;
    const { data } = await supabase.from('competition_sessions').select('*').eq('id', compId).single();
    if (data) {
      setCompetition(data as unknown as CompetitionData);
      await supabase.from('competition_scores').upsert({
        competition_id: compId,
        student_id: session.studentId,
        team_name: mode === 'teams' ? teamName : null,
      }, { onConflict: 'competition_id,student_id' });
      if ((data as any).status === 'active') {
        startTimeRef.current = new Date((data as any).started_at || Date.now()).getTime();
        setScreen('playing');
        setTimeLeft((data as any).time_limit_seconds);
      } else {
        setScreen('waiting');
      }
      loadScores();
    }
  };

  const startCompetition = async () => {
    if (!competition) return;
    await supabase.from('competition_sessions').update({
      status: 'active',
      started_at: new Date().toISOString(),
    }).eq('id', competition.id);
    startTimeRef.current = Date.now();
    setScreen('playing');
    setTimeLeft(competition.time_limit_seconds);
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const q = questions[questionIndex];
    const isCorrect = answer === q.correct;
    if (isCorrect) setCorrectCount(c => c + 1);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      if (questionIndex + 1 >= questions.length) {
        finishCompetition();
      } else {
        setQuestionIndex(i => i + 1);
      }
    }, 1000);
  };

  const finishCompetition = async () => {
    if (!session || !competition) return;
    const timeTaken = Date.now() - startTimeRef.current;
    const finalCorrect = correctCount;
    const score = finalCorrect * 100 + Math.max(0, competition.time_limit_seconds * 1000 - timeTaken) / 100;
    
    await supabase.from('competition_scores').update({
      score: Math.round(score),
      correct_count: finalCorrect,
      total_count: questions.length,
      time_taken_ms: timeTaken,
      completed: true,
    }).eq('competition_id', competition.id).eq('student_id', session.studentId);

    await loadScores();
    setScreen('results');
  };

  if (!session) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⚔️</div>
          <h2 className="font-display font-bold text-xl text-foreground mb-2">Join a Class First</h2>
          <p className="text-sm text-muted-foreground mb-4">You need to join a class to compete with other students.</p>
          <button onClick={onClose} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-primary">⚔️ Competition Mode</h1>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm">✕ Close</button>
        </div>

        {/* Lobby */}
        {screen === 'lobby' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-foreground">Create New Competition</h2>
              
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Grade Level</label>
                <div className="flex gap-2">
                  {(['elementary', 'middle', 'high'] as GradeLevel[]).map(g => (
                    <button key={g} onClick={() => setGrade(g)}
                      className={`flex-1 py-2.5 rounded-lg border-2 text-center text-sm font-semibold transition-all ${
                        grade === g ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}>
                      {GRADE_NAMES[g]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Mode</label>
                <div className="flex gap-2">
                  <button onClick={() => setMode('ffa')}
                    className={`flex-1 py-3 rounded-lg border-2 text-center transition-all ${
                      mode === 'ffa' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                    }`}>
                    <div className="text-2xl mb-1">👤</div>
                    <div className="text-sm font-bold text-foreground">Free For All</div>
                    <div className="text-[10px] text-muted-foreground">Every student for themselves</div>
                  </button>
                  <button onClick={() => setMode('teams')}
                    className={`flex-1 py-3 rounded-lg border-2 text-center transition-all ${
                      mode === 'teams' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                    }`}>
                    <div className="text-2xl mb-1">👥</div>
                    <div className="text-sm font-bold text-foreground">Teams</div>
                    <div className="text-[10px] text-muted-foreground">Compete as groups</div>
                  </button>
                </div>
              </div>

              {mode === 'teams' && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Your Team Name</label>
                  <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Team Alpha"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
              )}

              <button onClick={createCompetition}
                className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-lg">
                🏁 Create Competition
              </button>
            </div>

            {/* Active competitions to join */}
            {activeComps.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-3">
                <h2 className="font-display font-bold text-lg text-foreground">Join Active Competition</h2>
                {activeComps.map(comp => (
                  <button key={comp.id} onClick={() => joinCompetition(comp.id)}
                    className="w-full p-4 rounded-lg border border-border bg-secondary/50 hover:border-primary/50 transition-all text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-foreground">{comp.mode === 'teams' ? '👥 Teams' : '👤 FFA'} • {GRADE_NAMES[comp.grade_level as GradeLevel]}</span>
                        <p className="text-xs text-muted-foreground">{comp.question_count} questions • {comp.time_limit_seconds}s limit</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${comp.status === 'waiting' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                        {comp.status === 'waiting' ? '⏳ Waiting' : '🔴 Live'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Waiting room */}
        {screen === 'waiting' && competition && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4 text-center">
            <div className="text-5xl animate-pulse">⏳</div>
            <h2 className="font-display font-bold text-xl text-foreground">Waiting for players...</h2>
            <p className="text-sm text-muted-foreground">
              {competition.mode === 'teams' ? '👥 Teams' : '👤 Free For All'} • {GRADE_NAMES[competition.grade_level as GradeLevel]} • {competition.question_count} questions
            </p>

            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase">Players Joined:</p>
              {scores.map(s => (
                <div key={s.id} className="px-3 py-2 rounded-lg bg-secondary/50 text-sm text-foreground">
                  {s.nickname} {s.team_name ? `(${s.team_name})` : ''}
                </div>
              ))}
            </div>

            <button onClick={startCompetition}
              className="w-full px-4 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity text-lg animate-pulse">
              🚀 Start Competition!
            </button>
          </div>
        )}

        {/* Playing */}
        {screen === 'playing' && competition && questions.length > 0 && questionIndex < questions.length && (
          <div className="space-y-4">
            {/* Timer bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-destructive animate-pulse' : 'bg-primary'}`}
                  style={{ width: `${(timeLeft / competition.time_limit_seconds) * 100}%` }} />
              </div>
              <span className={`text-lg font-bold font-mono ${timeLeft <= 10 ? 'text-destructive' : 'text-foreground'}`}>{timeLeft}s</span>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Question {questionIndex + 1}/{questions.length}</span>
              <span className="text-accent font-bold">{correctCount} correct</span>
            </div>

            {/* Question */}
            {(() => {
              const q = questions[questionIndex];
              return (
                <div className="bg-card border border-border rounded-xl p-6 space-y-4 animate-scale-in">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                      <WeedImage weedId={q.weedId} stage="whole" className="w-full h-full" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-lg text-foreground">Which weed is this?</p>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        {q.weed.traits.slice(0, 2).map((t, i) => <li key={i}>• {t}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {q.options.map((opt, i) => {
                      const isSelected = selectedAnswer === opt;
                      const isCorrectOpt = showFeedback && opt === q.correct;
                      const isWrongSelected = showFeedback && isSelected && opt !== q.correct;
                      return (
                        <button key={i} onClick={() => !showFeedback && handleAnswer(opt)}
                          disabled={showFeedback}
                          className={`px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                            isCorrectOpt ? 'border-accent bg-accent/20 text-accent' :
                            isWrongSelected ? 'border-destructive bg-destructive/20 text-destructive' :
                            'border-border hover:border-primary/50 text-foreground'
                          }`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Results */}
        {screen === 'results' && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6 text-center space-y-3">
              <div className="text-5xl">🏆</div>
              <h2 className="font-display font-bold text-2xl text-foreground">Competition Complete!</h2>
              <p className="text-lg text-primary font-bold">{correctCount}/{questions.length} correct</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h3 className="font-display font-bold text-lg text-foreground">Leaderboard</h3>
              {scores.filter(s => s.completed).sort((a, b) => b.score - a.score).map((s, i) => {
                const isMe = s.student_id === session?.studentId;
                return (
                  <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg ${isMe ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/50'}`}>
                    <span className="text-2xl font-bold text-muted-foreground w-8 text-center">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <div className="flex-1">
                      <span className="font-bold text-foreground">{s.nickname} {isMe ? '(You)' : ''}</span>
                      {s.team_name && <span className="text-xs text-muted-foreground ml-2">({s.team_name})</span>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary">{s.correct_count}/{s.total_count}</div>
                      <div className="text-[10px] text-muted-foreground">{(s.time_taken_ms / 1000).toFixed(1)}s</div>
                    </div>
                  </div>
                );
              })}
              {scores.filter(s => !s.completed).length > 0 && (
                <p className="text-xs text-muted-foreground text-center animate-pulse">
                  ⏳ Waiting for {scores.filter(s => !s.completed).length} more player(s)...
                </p>
              )}
            </div>

            <button onClick={onClose} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
