import { useState, useMemo } from 'react';
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

  const [placements, setPlacements] = useState<Record<string, 'Native' | 'Introduced'>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const unplaced = queue.filter(q => !placements[q.weedId]);
  const allPlaced = unplaced.length === 0;

  const handleZoneDrop = (zone: 'Native' | 'Introduced') => {
    if (checked || !selected) return;
    setPlacements(prev => ({ ...prev, [selected]: zone }));
    setSelected(null);
  };

  const handleRemove = (weedId: string) => {
    if (checked) return;
    setPlacements(prev => {
      const n = { ...prev };
      delete n[weedId];
      return n;
    });
  };

  const handleCheck = () => {
    setChecked(true);
    onComplete(queue.map(q => ({
      weedId: q.weedId,
      correct: placements[q.weedId] === q.correct,
    })));
  };

  const correctCount = checked ? queue.filter(q => placements[q.weedId] === q.correct).length : 0;
  const nativeWeeds = queue.filter(q => placements[q.weedId] === 'Native');
  const introducedWeeds = queue.filter(q => placements[q.weedId] === 'Introduced');

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">🛂 Native or Introduced?</h2>
        <p className="text-sm text-muted-foreground">Tap a weed, then drop it into the correct origin zone.</p>
      </div>

      {/* Two drop zones side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Native zone */}
        <button
          onClick={() => handleZoneDrop('Native')}
          className={`p-3 rounded-xl border-2 text-left transition-all min-h-[140px] bg-green-900/15 border-green-600/50 ${
            selected && !checked ? 'cursor-pointer ring-1 ring-green-500/40 hover:bg-green-900/25' : 'cursor-default'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🌿</span>
            <div>
              <span className="text-sm font-bold text-foreground block">Native</span>
              <span className="text-[10px] text-muted-foreground">Originally from N. America</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {nativeWeeds.map(w => (
              <span
                key={w.weedId}
                onClick={e => { e.stopPropagation(); handleRemove(w.weedId); }}
                className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-1 ${
                  checked
                    ? w.correct === 'Native' ? 'bg-accent/30 text-accent' : 'bg-destructive/30 text-destructive line-through'
                    : 'bg-foreground/10 text-foreground hover:bg-destructive/20'
                }`}
              >
                {w.name} {!checked && '✕'}
              </span>
            ))}
          </div>
        </button>

        {/* Introduced zone */}
        <button
          onClick={() => handleZoneDrop('Introduced')}
          className={`p-3 rounded-xl border-2 text-left transition-all min-h-[140px] bg-amber-900/15 border-amber-600/50 ${
            selected && !checked ? 'cursor-pointer ring-1 ring-amber-500/40 hover:bg-amber-900/25' : 'cursor-default'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🚢</span>
            <div>
              <span className="text-sm font-bold text-foreground block">Introduced</span>
              <span className="text-[10px] text-muted-foreground">Brought from elsewhere</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {introducedWeeds.map(w => (
              <span
                key={w.weedId}
                onClick={e => { e.stopPropagation(); handleRemove(w.weedId); }}
                className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-1 ${
                  checked
                    ? w.correct === 'Introduced' ? 'bg-accent/30 text-accent' : 'bg-destructive/30 text-destructive line-through'
                    : 'bg-foreground/10 text-foreground hover:bg-destructive/20'
                }`}
              >
                {w.name} {!checked && '✕'}
              </span>
            ))}
          </div>
        </button>
      </div>

      {/* Weed cards to drag */}
      {unplaced.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {unplaced.map(item => (
            <button
              key={item.weedId}
              onClick={() => setSelected(selected === item.weedId ? null : item.weedId)}
              className={`p-2 rounded-lg border-2 transition-all text-center ${
                selected === item.weedId
                  ? 'border-primary bg-primary/10 scale-105'
                  : 'border-border bg-secondary/50 hover:border-primary/50'
              }`}
            >
              <div className="w-full h-14 mb-1 overflow-hidden rounded">
                <WeedImage weedId={item.weedId} stage="whole" className="w-full h-full" />
              </div>
              <span className="text-[10px] font-semibold text-foreground leading-tight block">{item.name}</span>
            </button>
          ))}
        </div>
      )}

      {!checked && allPlaced && (
        <button onClick={handleCheck} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          ✅ Check Answers
        </button>
      )}

      {checked && (
        <div className="rounded-lg p-4 space-y-3 animate-scale-in border border-border bg-muted/30">
          <div className="text-lg font-bold text-foreground">{correctCount}/{queue.length} Correct!</div>
          {queue.filter(q => placements[q.weedId] !== q.correct).map(q => (
            <p key={q.weedId} className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">{q.name}</span> → actually <span className="font-bold">{q.correct}</span>
            </p>
          ))}
          <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">NEXT →</button>
        </div>
      )}
    </div>
  );
}
