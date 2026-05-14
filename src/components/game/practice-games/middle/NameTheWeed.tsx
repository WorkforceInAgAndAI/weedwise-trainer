import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

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

  // Answer response screen with facts and memory hook
  if (showFeedback && r) {
    const isCorrect = selected === r.weed.commonName;
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Name the Weed</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
          <span className="text-sm font-bold text-primary ml-2">{score} pts</span>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 gap-4 max-w-md mx-auto">
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-xl overflow-hidden border-2 border-border bg-secondary">
            <WeedImage weedId={r.weed.id} stage="vegetative" className="w-full h-full object-cover" />
          </div>
          <p className={`text-xl font-bold ${isCorrect ? 'text-green-500' : 'text-destructive'}`}>
            {isCorrect ? 'Correct!' : 'Not quite!'}
          </p>
          <h2 className="text-lg font-bold text-foreground">{r.weed.commonName}</h2>
          <p className="text-sm italic text-muted-foreground">{r.weed.scientificName}</p>
          <div className="bg-card border border-border rounded-xl p-4 w-full space-y-2">
            <p className="text-sm text-foreground"><span className="font-bold">Family:</span> {r.weed.family}</p>
            <p className="text-sm text-foreground"><span className="font-bold">Type:</span> {r.weed.plantType} - {r.weed.lifeCycle}</p>
            <p className="text-sm text-foreground"><span className="font-bold">Key trait:</span> {r.weed.traits[0]}</p>
            {r.weed.traits[1] && <p className="text-sm text-muted-foreground">{r.weed.traits[1]}</p>}
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 w-full">
            <p className="text-sm font-bold text-primary mb-1">Memory Hook</p>
            <p className="text-sm text-foreground">{r.weed.memoryHook}</p>
          </div>
          <button onClick={next} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold mt-2">
            {round + 1 < rounds.length ? 'Next' : 'See Results'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Name the Weed</h1>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm font-bold text-primary ml-2">{score} pts</span>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4 p-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-xl overflow-hidden border-2 border-border bg-secondary">
            <WeedImage weedId={r!.weed.id} stage="vegetative" className="w-full h-full object-cover" />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-xs">{r!.weed.traits[0]}</p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {r!.options.map(opt => (
              <button key={opt} onClick={() => !submitted && submit(opt)}
                className={`py-4 px-4 rounded-lg text-base font-bold transition-all border-2 ${
                  submitted
                    ? opt === r!.weed.commonName ? 'bg-green-500/20 border-green-500 text-green-500' : opt === selected ? 'bg-destructive/20 border-destructive text-destructive' : 'border-border text-muted-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary'
                }`}>{opt}</button>
            ))}
          </div>
          {submitted && (
            <button onClick={showAnswer} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold mt-2">See Details</button>
          )}
        </div>
        {/* Side collection */}
        <div className="rounded-xl border-2 border-border bg-card p-3 h-fit md:sticky md:top-4">
          <p className="text-xs font-bold uppercase text-foreground mb-3">Identified ({history.length})</p>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {history.length === 0 && <p className="text-xs text-muted-foreground italic">Your guesses will collect here.</p>}
            {history.map((h, i) => (
              <div key={i} className={`flex items-center gap-2 p-1.5 rounded-lg border ${h.correct ? 'border-green-500/40 bg-green-500/5' : 'border-destructive/40 bg-destructive/5'}`}>
                <div className="w-10 h-10 rounded overflow-hidden bg-secondary shrink-0">
                  <WeedImage weedId={h.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{h.weed.commonName}</p>
                  <p className={`text-[10px] ${h.correct ? 'text-green-600' : 'text-destructive'}`}>{h.correct ? 'Correct' : 'Wrong'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
          <FloatingCoach grade="6-8" tip={`Use 2–3 traits at once: leaf shape, venation, stem features, and growth habit.`} />
</div>
  );
}
