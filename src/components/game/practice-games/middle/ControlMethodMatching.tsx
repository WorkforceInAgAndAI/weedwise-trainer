import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { FlaskConical } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import {
  HERBICIDE_MOA,
  SYMPTOM_TYPES,
  getMiddleSchoolMOAs,
  getBestMOAForWeed,
  getBestTimingForWeed,
  pickDistinctDistractors,
} from '@/data/herbicides';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

type Phase = 'moa' | 'feedback';

export default function ControlMethodMatching({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();

  const msPool = useMemo(() => getMiddleSchoolMOAs(), []);

  const items = useMemo(() => {
    const pool = shuffle(weeds);
    const offset = ((level - 1) * 10) % pool.length;
    const selected = pool.slice(offset).concat(pool).slice(0, 10);
    return selected.map(w => {
      const bestId = getBestMOAForWeed(w);
      const bestMOA = HERBICIDE_MOA.find(h => h.id === bestId)!;
      // Build 4 MOA options ensuring no two share a symptom type
      const distractors = pickDistinctDistractors(bestMOA, msPool, 3);
      const options = shuffle([bestMOA, ...distractors]);
      return { weed: w, bestId, bestMOA, options };
    });
  }, [level, msPool]);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('moa');
  const [moaPick, setMoaPick] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<Array<{ weed: typeof items[0]['weed']; correct: boolean; pickedMOA: string }>>([]);

  const done = idx >= items.length;
  const current = !done ? items[idx] : null;

  const submitMOA = (moaId: string) => {
    if (moaPick) return;
    setMoaPick(moaId);
    const moaCorrect = moaId === current!.bestId;
    if (moaCorrect) setScore(s => s + 1);
    const pickedLabel = current!.options.find(o => o.id === moaId)?.moa || '';
    setHistory(h => [...h, { weed: current!.weed, correct: moaCorrect, pickedMOA: pickedLabel }]);
    setPhase('feedback');
  };

  const next = () => {
    setIdx(i => i + 1);
    setPhase('moa');
    setMoaPick(null);
  };
  const restart = () => { setIdx(0); setScore(0); setPhase('moa'); setMoaPick(null); setHistory([]); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    const finalScore = Math.round(score);
    addBadge({ gameId: 'control-matching', gameName: 'Control Method Matching', level: 'MS', score: finalScore, total: items.length });
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <FlaskConical className="w-10 h-10 text-primary mb-3" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
        <p className="text-lg text-foreground mb-6">{finalScore}/{items.length} correct</p>
        <LevelComplete level={level} score={finalScore} total={items.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  const moaCorrect = moaPick === current!.bestId;
  const symptomInfo = SYMPTOM_TYPES[current!.bestMOA.symptomType];

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Control Method Matching</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{idx + 1}/{items.length}</span>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 h-full max-w-5xl mx-auto">
          <div className="overflow-y-auto flex flex-col items-center">
            <div className="w-44 h-44 rounded-xl overflow-hidden bg-secondary mb-3">
              <WeedImage weedId={current!.weed.id} stage="flower" className="w-full h-full object-cover" />
            </div>
            <p className="font-bold text-foreground mb-1">{current!.weed.commonName}</p>
            <p className="text-xs text-muted-foreground mb-3">Type: {current!.weed.plantType} ({current!.weed.plantType === 'Monocot' ? 'grass' : 'broadleaf'})</p>

            {phase === 'moa' && (
              <>
                <p className="text-xs text-muted-foreground mb-3">Which mode of action best targets this weed?</p>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {current!.options.map(g => (
                    <button key={g.id} onClick={() => submitMOA(g.id)}
                      className="p-3 rounded-lg border-2 border-border bg-card hover:border-primary text-left text-sm">
                      <span className="font-bold text-foreground">{g.moa} (Group {g.group})</span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">Chemical: {g.brands[0]}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {phase === 'feedback' && (
              <div className="mt-3 bg-card border border-border rounded-xl p-4 max-w-sm w-full">
                <p className={`font-bold mb-2 ${moaCorrect ? 'text-green-500' : 'text-destructive'}`}>
                  {moaCorrect ? 'Correct!' : 'Not quite!'}
                </p>
                <p className="text-xs text-foreground mb-1">
                  <span className="font-semibold">Best MOA:</span> {current!.bestMOA.moa} (Group {current!.bestMOA.group})
                </p>
                <p className="text-xs text-muted-foreground mb-1">
                  <span className="font-semibold">Chemical:</span> {current!.bestMOA.brands[0]}
                </p>
                {symptomInfo && (
                  <p className="text-xs text-muted-foreground mb-1">
                    <span className="font-semibold">Symptom type:</span> {symptomInfo.label} — {symptomInfo.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mb-1">
                  <span className="font-semibold">Resistance risk:</span> {current!.bestMOA.resistanceLevel}
                </p>
                <button onClick={next} className="mt-3 w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
              </div>
            )}
          </div>

          {/* RIGHT: Collection sidebar */}
          <div className="bg-card border border-border rounded-xl p-3 overflow-y-auto">
            <p className="text-xs uppercase font-bold text-muted-foreground mb-2">Your Matches ({history.length})</p>
            {history.length === 0 && <p className="text-xs text-muted-foreground italic">Matched weeds appear here.</p>}
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className={`flex items-center gap-2 p-2 rounded border ${h.correct ? 'border-green-500/40 bg-green-500/10' : 'border-destructive/40 bg-destructive/10'}`}>
                  <div className="w-10 h-10 rounded overflow-hidden bg-secondary flex-shrink-0">
                    <WeedImage weedId={h.weed.id} stage="flower" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate">{h.weed.commonName}</p>
                    <p className={`text-[10px] truncate ${h.correct ? 'text-green-600' : 'text-destructive'}`}>{h.pickedMOA}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
          <FloatingCoach grade="6-8" tip={`Match each control method to its mode of action — chemical, mechanical, cultural, or biological.`} />
</div>
  );
}
