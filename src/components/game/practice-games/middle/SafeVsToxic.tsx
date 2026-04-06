import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const REMOVAL = ['Wear gloves and pull carefully', 'Use a herbicide spray', 'Mow the area', 'Dig out the root system'];
const QUESTIONS_PER_LEVEL = 8;

export default function SafeVsToxic({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const rounds = useMemo(() => {
    const toxic = weeds.filter(w => w.safetyNote);
    const safe = weeds.filter(w => !w.safetyNote);
    const offset = ((level - 1) * QUESTIONS_PER_LEVEL) % toxic.length;
    const rotated = [...toxic.slice(offset), ...toxic.slice(0, offset)];
    return shuffle(rotated).slice(0, QUESTIONS_PER_LEVEL).map(t => {
      const others = shuffle(safe).slice(0, 3);
      const all = shuffle([t, ...others]);
      return { toxic: t, options: all };
    });
  }, [level]);

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<'identify' | 'review' | 'remove' | 'done'>('identify');
  const [removalPick, setRemovalPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ weed: string; identified: boolean; safeRemoval: boolean }[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const finished = round >= rounds.length;
  const current = !finished ? rounds[round] : null;

  const identify = (id: string) => {
    if (phase !== 'identify') return;
    setSelected(id);
    setPhase('review');
  };

  const continueFromReview = () => {
    if (selected === current!.toxic.id) {
      setScore(s => s + 1);
      setPhase('remove');
    } else {
      setResults(r => [...r, { weed: current!.toxic.commonName, identified: false, safeRemoval: false }]);
      setPhase('done');
    }
  };

  const remove = (idx: number) => {
    setRemovalPick(idx);
    const safeRemoval = idx === 0;
    if (safeRemoval) setScore(s => s + 1);
    setResults(r => [...r, { weed: current!.toxic.commonName, identified: true, safeRemoval }]);
    setPhase('done');
  };

  const next = () => {
    setRound(r => r + 1);
    setSelected(null);
    setPhase('identify');
    setRemovalPick(null);
  };

  const restart = () => {
    setRound(0); setScore(0); setSelected(null); setPhase('identify');
    setRemovalPick(null); setResults([]); setShowSummary(false);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  // Summary screen after all rounds
  if (finished && !showSummary) {
    setShowSummary(true);
  }

  if (showSummary) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-start p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-foreground mb-2">Round Summary</h2>
        <p className="text-lg text-foreground mb-4">{score}/{rounds.length * 2} points</p>
        <div className="w-full max-w-md space-y-2 mb-6">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <span className={`text-lg font-bold ${r.identified ? 'text-green-500' : 'text-destructive'}`}>
                {r.identified ? (r.safeRemoval ? 'Perfect' : 'Partial') : 'Missed'}
              </span>
              <span className="text-sm text-foreground flex-1">{r.weed}</span>
              <span className="text-xs text-muted-foreground">
                {r.identified && r.safeRemoval ? '2/2' : r.identified ? '1/2' : '0/2'}
              </span>
            </div>
          ))}
        </div>
        <LevelComplete level={level} score={score} total={rounds.length * 2} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Safe or Toxic?</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {phase === 'identify' && (
          <>
            <p className="text-sm text-muted-foreground mb-3 text-center">Find the toxic weed!</p>
            <div className="grid grid-cols-2 gap-3">
              {current!.options.map(w => (
                <button key={w.id} onClick={() => identify(w.id)}
                  className="flex flex-col items-center p-3 rounded-xl border-2 border-border bg-card hover:border-primary transition-all">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary mb-2">
                    <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{w.commonName}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {phase === 'review' && (
          <div className="text-center flex flex-col items-center">
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-secondary mb-3">
              <WeedImage weedId={current!.toxic.id} stage="vegetative" className="w-full h-full object-cover" />
            </div>
            {selected === current!.toxic.id ? (
              <>
                <p className="text-green-500 font-bold text-lg mb-2">Correct! You found the toxic weed.</p>
                <p className="font-bold text-foreground mb-1">{current!.toxic.commonName}</p>
              </>
            ) : (
              <>
                <p className="text-destructive font-bold text-lg mb-2">Not quite!</p>
                <p className="text-sm text-foreground mb-1">The toxic weed was <span className="font-bold">{current!.toxic.commonName}</span></p>
              </>
            )}
            <p className="text-sm text-muted-foreground max-w-sm mb-1 italic">{current!.toxic.scientificName}</p>
            {current!.toxic.safetyNote && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 max-w-sm mt-2 mb-4">
                <p className="text-sm text-foreground font-medium">Why is it toxic?</p>
                <p className="text-sm text-muted-foreground mt-1">{current!.toxic.safetyNote}</p>
              </div>
            )}
            <button onClick={continueFromReview} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
              {selected === current!.toxic.id ? 'Now Remove It Safely' : 'Next'}
            </button>
          </div>
        )}

        {phase === 'remove' && (
          <div className="text-center">
            <p className="text-green-500 font-bold mb-2">How should you safely remove {current!.toxic.commonName}?</p>
            <div className="flex flex-col gap-2 max-w-sm mx-auto">
              {REMOVAL.map((r, i) => (
                <button key={i} onClick={() => remove(i)}
                  className="p-3 rounded-lg border-2 border-border bg-card text-sm text-foreground font-medium hover:border-primary transition-all">
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center mt-8">
            <p className={`font-bold text-lg mb-2 ${selected === current!.toxic.id ? 'text-green-500' : 'text-destructive'}`}>
              {selected === current!.toxic.id ? (removalPick === 0 ? 'Perfect! Gloves are the safest option.' : 'Good find! But gloves are the safest removal method.') : `The toxic weed was ${current!.toxic.commonName}`}
            </p>
            {current!.toxic.safetyNote && <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">{current!.toxic.safetyNote}</p>}
            <button onClick={next} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
