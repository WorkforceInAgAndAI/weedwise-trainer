import { useState, useMemo, useCallback } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from './WeedImage';

interface Props {
  onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
  onNext: () => void;
}

export default function NativeOrIntroduced({ onComplete, onNext }: Props) {
  const queue = useMemo(() => {
    return [...weeds].sort(() => Math.random() - 0.5).slice(0, 8).map(w => ({
      weedId: w.id, name: w.commonName, correct: w.origin,
    }));
  }, []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<Array<{ weedId: string; correct: boolean }>>([]);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [done, setDone] = useState(false);

  const current = queue[currentIdx];

  const handleStamp = useCallback((stamp: 'Native' | 'Introduced') => {
    if (flash || done) return;
    const isCorrect = stamp === current.correct;
    const newResults = [...results, { weedId: current.weedId, correct: isCorrect }];
    setResults(newResults);
    setFlash(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setFlash(null);
      if (currentIdx + 1 >= queue.length) {
        setDone(true);
        onComplete(newResults);
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 800);
  }, [current, currentIdx, done, flash, onComplete, queue.length, results]);

  const correctCount = results.filter(r => r.correct).length;

  if (done) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
        <h2 className="font-display font-bold text-lg text-foreground">🛂 Classification Complete!</h2>
        <div className="text-3xl font-bold text-center text-foreground py-4">{correctCount}/{queue.length}</div>
        <div className="space-y-1">
          {queue.map((q, i) => (
            <div key={q.weedId} className="flex items-center gap-2 text-sm">
              <span>{results[i]?.correct ? '✅' : '❌'}</span>
              <span className="text-foreground font-semibold">{q.name}</span>
              <span className="text-muted-foreground">— {q.correct}</span>
            </div>
          ))}
        </div>
        <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">NEXT →</button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-foreground">🛂 Native or Introduced?</h2>
        <span className="text-sm text-muted-foreground">{currentIdx + 1}/{queue.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(currentIdx / queue.length) * 100}%` }} />
      </div>

      {/* Weed card with flash effect */}
      <div className={`rounded-xl border-2 p-4 transition-all duration-300 ${
        flash === 'correct' ? 'border-accent bg-accent/10' : flash === 'wrong' ? 'border-destructive bg-destructive/10' : 'border-border'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 rounded-lg overflow-hidden shrink-0">
            <WeedImage weedId={current.weedId} stage="whole" className="w-full h-full" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-foreground">{current.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">Where does this species originate?</p>
            {flash && (
              <div className={`mt-2 text-sm font-bold animate-scale-in ${flash === 'correct' ? 'text-accent' : 'text-destructive'}`}>
                {flash === 'correct' ? '✅ Correct!' : `❌ It's ${current.correct}`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stamp buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => handleStamp('Native')} disabled={!!flash}
          className="p-4 rounded-xl border-2 border-green-600/40 bg-green-900/10 hover:bg-green-900/20 transition-all text-center disabled:opacity-50">
          <span className="text-3xl block mb-1">🌿</span>
          <span className="font-bold text-foreground">NATIVE</span>
          <span className="text-[10px] text-muted-foreground block">Originally from N. America</span>
        </button>
        <button onClick={() => handleStamp('Introduced')} disabled={!!flash}
          className="p-4 rounded-xl border-2 border-amber-600/40 bg-amber-900/10 hover:bg-amber-900/20 transition-all text-center disabled:opacity-50">
          <span className="text-3xl block mb-1">🚢</span>
          <span className="font-bold text-foreground">INTRODUCED</span>
          <span className="text-[10px] text-muted-foreground block">Brought from elsewhere</span>
        </button>
      </div>
    </div>
  );
}
