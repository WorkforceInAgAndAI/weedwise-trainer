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

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

type Phase = 'timing' | 'moa' | 'feedback';

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
      const bestTiming = getBestTimingForWeed(w);
      // Build 4 MOA options ensuring no two share a symptom type
      const distractors = pickDistinctDistractors(bestMOA, msPool, 3);
      const options = shuffle([bestMOA, ...distractors]);
      return { weed: w, bestId, bestMOA, bestTiming, options };
    });
  }, [level, msPool]);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('timing');
  const [timingPick, setTimingPick] = useState<string | null>(null);
  const [moaPick, setMoaPick] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const done = idx >= items.length;
  const current = !done ? items[idx] : null;

  const submitTiming = (t: 'PRE' | 'POST') => {
    setTimingPick(t);
    setPhase('moa');
  };

  const submitMOA = (moaId: string) => {
    if (moaPick) return;
    setMoaPick(moaId);
    const timingCorrect = timingPick === current!.bestTiming;
    const moaCorrect = moaId === current!.bestId;
    if (timingCorrect && moaCorrect) setScore(s => s + 1);
    else if (moaCorrect) setScore(s => s + 0.5);
    setPhase('feedback');
  };

  const next = () => {
    setIdx(i => i + 1);
    setPhase('timing');
    setTimingPick(null);
    setMoaPick(null);
  };
  const restart = () => { setIdx(0); setScore(0); setPhase('timing'); setTimingPick(null); setMoaPick(null); };
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

  const timingCorrect = timingPick === current!.bestTiming;
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
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-36 h-36 rounded-xl overflow-hidden bg-secondary mb-3">
          <WeedImage weedId={current!.weed.id} stage="vegetative" className="w-full h-full object-cover" />
        </div>
        <p className="font-bold text-foreground mb-1">{current!.weed.commonName}</p>
        <p className="text-xs text-muted-foreground mb-1">Type: {current!.weed.plantType} ({current!.weed.plantType === 'Monocot' ? 'grass' : 'broadleaf'})</p>

        {/* Step 1: Timing */}
        {phase === 'timing' && (
          <>
            <p className="text-xs text-muted-foreground mb-4">Step 1: Is a pre-emergent or post-emergent herbicide best for this weed?</p>
            <div className="flex gap-3 w-full max-w-sm">
              {(['PRE', 'POST'] as const).map(t => (
                <button key={t} onClick={() => submitTiming(t)}
                  className="flex-1 p-4 rounded-lg border-2 border-border bg-card hover:border-primary text-center">
                  <p className="font-bold text-foreground">{t === 'PRE' ? 'Pre-Emergent' : 'Post-Emergent'}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {t === 'PRE' ? 'Applied before weeds emerge' : 'Applied after weeds are growing'}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: MOA */}
        {phase === 'moa' && (
          <>
            <div className={`text-xs mb-3 px-3 py-1.5 rounded-full font-medium ${timingCorrect ? 'bg-green-500/20 text-green-700' : 'bg-destructive/20 text-destructive'}`}>
              {timingCorrect
                ? `Correct! ${timingPick === 'PRE' ? 'Pre-emergent' : 'Post-emergent'} is the right timing.`
                : `The best timing is ${current!.bestTiming === 'PRE' ? 'Pre-emergent' : 'Post-emergent'}.`}
            </div>
            <p className="text-xs text-muted-foreground mb-3">Step 2: Which mode of action targets this weed?</p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {current!.options.map(g => (
                <button key={g.id} onClick={() => submitMOA(g.id)}
                  className="p-3 rounded-lg border-2 border-border bg-card hover:border-primary text-left text-sm">
                  <span className="font-bold text-foreground">{g.moa} (Group {g.group})</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">e.g. {g.brands[0]}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Feedback */}
        {phase === 'feedback' && (
          <div className="mt-3 bg-card border border-border rounded-xl p-4 max-w-sm w-full">
            <p className={`font-bold mb-2 ${moaCorrect ? 'text-green-500' : 'text-destructive'}`}>
              {moaCorrect ? 'Correct!' : 'Not quite!'}
            </p>
            <p className="text-xs text-foreground mb-1">
              <span className="font-semibold">Best MOA:</span> {current!.bestMOA.moa} (Group {current!.bestMOA.group})
            </p>
            <p className="text-xs text-muted-foreground mb-1">
              <span className="font-semibold">Brand example:</span> {current!.bestMOA.brands[0]}
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
    </div>
  );
}
