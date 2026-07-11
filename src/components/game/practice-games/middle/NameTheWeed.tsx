import { useState, useMemo } from 'react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';
import { Sprout, Leaf, Flower2, Check, X, Trophy, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

/** Stages we cycle through so students see multiple looks of the same species. */
const STAGES: Array<{ key: string; label: string; icon: typeof Sprout }> = [
  { key: 'seedling', label: 'Seedling', icon: Sprout },
  { key: 'vegetative', label: 'Leaves', icon: Leaf },
  { key: 'flower', label: 'Flower / Seedhead', icon: Flower2 },
];

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const FAMILY_GROUPS = [...new Set(weeds.map(w => w.family))];
const THEMES = [
  ...FAMILY_GROUPS.map(f => ({ label: f, filter: (w: typeof weeds[0]) => w.family === f })),
  { label: 'Monocots', filter: (w: typeof weeds[0]) => w.plantType === 'Monocot' },
  { label: 'Dicots', filter: (w: typeof weeds[0]) => w.plantType === 'Dicot' },
  { label: 'Mixed', filter: () => true },
];

function getWeedsForLevel(level: number): typeof weeds {
  const themeIdx = (level - 1) % THEMES.length;
  const theme = THEMES[themeIdx];
  const pool = weeds.filter(theme.filter);
  if (pool.length < 10) {
    const extra = weeds.filter(w => !pool.find(p => p.id === w.id));
    return shuffle([...pool, ...shuffle(extra)]).slice(0, 10);
  }
  const offset = Math.floor((level - 1) / THEMES.length) * 5;
  const shifted = [...pool.slice(offset % pool.length), ...pool.slice(0, offset % pool.length)];
  return shuffle(shifted).slice(0, 10);
}

/** Small multi-stage viewer used both in the round and in the review sidebar. */
function StageViewer({ weedId, size = 'lg' }: { weedId: string; size?: 'lg' | 'sm' }) {
  const [idx, setIdx] = useState(2); // default to flower — most distinctive
  const stage = STAGES[idx];
  const dims = size === 'lg' ? 'w-56 h-56 sm:w-72 sm:h-72' : 'w-10 h-10';

  if (size === 'sm') {
    return (
      <div className={`${dims} rounded overflow-hidden bg-secondary shrink-0`}>
        <WeedImage weedId={weedId} stage={stage.key} className="w-full h-full object-cover" />
      </div>
    );
  }

  const prev = () => setIdx((i) => (i - 1 + STAGES.length) % STAGES.length);
  const next = () => setIdx((i) => (i + 1) % STAGES.length);
  const StageIcon = stage.icon;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="relative w-full flex items-center justify-center">
        <button
          type="button"
          onClick={prev}
          className="absolute left-0 z-10 p-2 rounded-full bg-background/80 border border-border hover:bg-primary hover:text-primary-foreground transition"
          aria-label="Previous life stage"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className={`${dims} rounded-2xl overflow-hidden border-4 border-primary/30 bg-secondary shadow-lg ring-2 ring-background`}>
          <WeedImage weedId={weedId} stage={stage.key} className="w-full h-full object-cover" />
        </div>
        <button
          type="button"
          onClick={next}
          className="absolute right-0 z-10 p-2 rounded-full bg-background/80 border border-border hover:bg-primary hover:text-primary-foreground transition"
          aria-label="Next life stage"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {/* Stage tabs */}
      <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const active = i === idx;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setIdx(i)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3 h-3" />
              {s.label}
            </button>
          );
        })}
      </div>
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground italic">
        <StageIcon className="w-3 h-3" /> Compare stages — most weeds change dramatically as they grow.
      </p>
    </div>
  );
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string }

export default function NameTheWeed({ onBack }: Props) {
  const [level, setLevel] = useState(1);
  const rounds = useMemo(() => {
    const levelWeeds = getWeedsForLevel(level);
    return levelWeeds.map(w => {
      const wrongs = shuffle(weeds.filter(x => x.id !== w.id)).slice(0, 3).map(x => x.commonName);
      return { weed: w, options: shuffle([w.commonName, ...wrongs]) };
    });
  }, [level]);

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ weed: typeof weeds[0]; correct: boolean }[]>([]);

  const done = round >= rounds.length;
  const r = !done ? rounds[round] : null;

  const submit = (opt: string) => {
    setSelected(opt);
    setSubmitted(true);
    const isCorrect = opt === r?.weed.commonName;
    if (isCorrect) setScore(s => s + 1);
    if (r) setHistory(h => [...h, { weed: r.weed, correct: isCorrect }]);
  };

  const showAnswer = () => setShowFeedback(true);

  const next = () => {
    setRound(i => i + 1);
    setSelected(null);
    setSubmitted(false);
    setShowFeedback(false);
  };

  const restart = () => { setRound(0); setSelected(null); setSubmitted(false); setShowFeedback(false); setScore(0); setHistory([]); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) return <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;

  const progressPct = Math.round(((round + (submitted ? 1 : 0)) / rounds.length) * 100);
  const confidentIds = new Set(history.filter((h) => h.correct).map((h) => h.weed.id));

  // Answer response screen with facts and memory hook
  if (showFeedback && r) {
    const isCorrect = selected === r.weed.commonName;
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-emerald-50 via-background to-sky-50 dark:from-emerald-950/40 dark:via-background dark:to-sky-950/40">
        <GameHeader onBack={onBack} level={level} score={score} round={round} total={rounds.length} progressPct={100} />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className={`rounded-2xl border-2 p-5 shadow-lg ${isCorrect ? 'border-emerald-500 bg-emerald-500/5' : 'border-destructive/60 bg-destructive/5'}`}>
              <div className="flex items-center gap-2 mb-3">
                {isCorrect ? <Check className="w-6 h-6 text-emerald-600" /> : <X className="w-6 h-6 text-destructive" />}
                <p className={`text-xl font-bold ${isCorrect ? 'text-emerald-600' : 'text-destructive'}`}>
                  {isCorrect ? 'Correct — nice ID!' : 'Not quite — here\'s the real answer.'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 items-start">
                <StageViewer weedId={r.weed.id} />
                <div className="space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground leading-tight">{r.weed.commonName}</h2>
                    <p className="text-sm italic text-muted-foreground">{r.weed.scientificName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FactChip label="Family" value={r.weed.family} />
                    <FactChip label="Type" value={r.weed.plantType} />
                    <FactChip label="Life cycle" value={r.weed.lifeCycle} />
                    <FactChip label="Origin" value={r.weed.origin} />
                  </div>
                  <div className="bg-card border border-border rounded-xl p-3 space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">Key trait</p>
                    <p className="text-sm text-foreground">{r.weed.traits[0]}</p>
                    {r.weed.traits[1] && <p className="text-xs text-muted-foreground">{r.weed.traits[1]}</p>}
                  </div>
                  <div className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950/50 dark:to-amber-900/30 border-l-4 border-amber-500 rounded-r-xl p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-0.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Memory Hook
                    </p>
                    <p className="text-sm text-foreground italic">{r.weed.memoryHook}</p>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={next} className="w-full sm:w-auto sm:mx-auto sm:flex px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold justify-center items-center gap-2 hover:bg-primary/90 transition shadow">
              {round + 1 < rounds.length ? 'Next Weed →' : 'See Results'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-emerald-50 via-background to-sky-50 dark:from-emerald-950/40 dark:via-background dark:to-sky-950/40">
      <GameHeader onBack={onBack} level={level} score={score} round={round} total={rounds.length} progressPct={progressPct} />
      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 h-full max-w-6xl mx-auto">
          {/* MAIN */}
          <div className="flex flex-col items-center gap-4 min-h-0 overflow-y-auto">
            <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Field Photo Set</p>
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Round {round + 1} of {rounds.length}</span>
              </div>
              <StageViewer weedId={r!.weed.id} />
              <p className="text-xs text-muted-foreground text-center mt-2 max-w-md mx-auto">
                <span className="font-semibold text-foreground">Field clue:</span> {r!.weed.traits[0]}
              </p>
            </div>

            <div className="w-full max-w-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 text-center">What weed is this?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {r!.options.map((opt) => {
                  const isRight = submitted && opt === r!.weed.commonName;
                  const isWrongPick = submitted && opt === selected && opt !== r!.weed.commonName;
                  return (
                    <button
                      key={opt}
                      onClick={() => !submitted && submit(opt)}
                      className={`py-3.5 px-4 rounded-xl text-sm font-bold text-left transition-all border-2 flex items-center gap-2 shadow-sm ${
                        submitted
                          ? isRight
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                            : isWrongPick
                              ? 'bg-destructive/15 border-destructive text-destructive'
                              : 'border-border bg-card text-muted-foreground opacity-60'
                          : 'border-border bg-card text-foreground hover:border-primary hover:bg-primary/5 hover:scale-[1.02]'
                      }`}
                    >
                      {submitted && isRight && <Check className="w-4 h-4 shrink-0" />}
                      {submitted && isWrongPick && <X className="w-4 h-4 shrink-0" />}
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {submitted && (
              <button onClick={showAnswer} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold shadow hover:bg-primary/90 transition">
                See Weed Profile →
              </button>
            )}
          </div>

          {/* SIDE: confident weeds */}
          <aside className="rounded-2xl border border-border bg-card/80 backdrop-blur p-4 h-fit lg:sticky lg:top-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-bold text-foreground">Weeds You Nailed</p>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">Correct IDs land in your scout log.</p>
            <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-2xl font-extrabold text-emerald-600 tabular-nums">{confidentIds.size}</span>
              <span className="text-xs text-muted-foreground leading-tight">confident<br />/ {weeds.length} in dataset</span>
            </div>
            <div className="space-y-1.5 max-h-[46vh] overflow-y-auto pr-1">
              {history.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Your identified weeds will collect here as you play.</p>
              )}
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border transition ${
                    h.correct
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-destructive/40 bg-destructive/5'
                  }`}
                >
                  <StageViewer weedId={h.weed.id} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate leading-tight">{h.weed.commonName}</p>
                    <p className={`text-[10px] font-semibold flex items-center gap-1 ${h.correct ? 'text-emerald-600' : 'text-destructive'}`}>
                      {h.correct ? <><Check className="w-2.5 h-2.5" /> Confident</> : <><X className="w-2.5 h-2.5" /> Review</>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
      <FloatingCoach grade="6-8" tip={`Compare 2–3 stages before you guess: seedling shape, mature leaves, and the flower/seedhead all give different clues.`} />
    </div>
  );
}

/* ─────────── Small presentational helpers ─────────── */

function GameHeader({
  onBack,
  level,
  score,
  round,
  total,
  progressPct,
}: {
  onBack: () => void;
  level: number;
  score: number;
  round: number;
  total: number;
  progressPct: number;
}) {
  return (
    <div className="border-b border-border bg-card/80 backdrop-blur">
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl leading-none px-1">←</button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-foreground text-base sm:text-lg leading-tight truncate">Name the Weed</h1>
          <p className="text-[11px] text-muted-foreground">Field Scout · 6-8</p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{Math.min(round + 1, total)}/{total}</span>
        <span className="hidden sm:flex items-center gap-1 text-sm font-bold text-amber-600">
          <Trophy className="w-4 h-4" /> {score}
        </span>
      </div>
      <div className="h-1 bg-secondary overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-primary to-sky-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}

function FactChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary/60 rounded-lg px-2.5 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
      <p className="text-xs font-semibold text-foreground truncate">{value}</p>
    </div>
  );
}
