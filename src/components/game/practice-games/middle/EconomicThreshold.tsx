import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

function getPriority(w: typeof weeds[0]): number {
  let score = 0;
  if (w.actImmediately) score += 3;
  if (w.origin === 'Introduced') score += 2;
  if (w.lifeCycle === 'Perennial') score += 1;
  if (w.safetyNote) score += 2;
  return score;
}

export default function EconomicThreshold({ onBack }: { onBack: () => void }) {
  const pool = useMemo(() => shuffle(weeds).slice(0, 20).map(w => ({ weed: w, priority: getPriority(w) })), []);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);

  const threshold = 10;
  const toggle = (id: string) => {
    if (checked) return;
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else if (n.size < threshold) n.add(id);
      return n;
    });
  };

  const sorted = [...pool].sort((a, b) => b.priority - a.priority);
  const topTen = new Set(sorted.slice(0, threshold).map(i => i.weed.id));
  const correctCount = checked ? [...selected].filter(id => topTen.has(id)).length : 0;

  const restart = () => { setSelected(new Set()); setChecked(false); };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Economic Threshold</h1>
        <span className="text-sm text-muted-foreground">{selected.size}/{threshold} selected</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-3 text-center">You have 20 weeds but can only control 10. Select the most important ones to manage.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {pool.map(({ weed }) => {
            const isSelected = selected.has(weed.id);
            const isTop = topTen.has(weed.id);
            const border = !checked ? (isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card') :
              isSelected ? (isTop ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10') :
              isTop ? 'border-amber-500 bg-amber-500/10' : 'border-border bg-card';
            return (
              <button key={weed.id} onClick={() => toggle(weed.id)}
                className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${border}`}>
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary mb-1">
                  <WeedImage weedId={weed.id} stage="vegetative" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-medium text-foreground text-center leading-tight">{weed.commonName}</span>
                {checked && isTop && !isSelected && <span className="text-[9px] text-amber-500 font-bold mt-1">Should control</span>}
              </button>
            );
          })}
        </div>
        {!checked && selected.size === threshold && (
          <button onClick={() => setChecked(true)} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Decisions</button>
        )}
        {checked && (
          <div className="text-center mt-2">
            <p className={`text-lg font-bold mb-2 ${correctCount >= 7 ? 'text-green-500' : 'text-foreground'}`}>{correctCount}/{threshold} high-priority weeds identified</p>
            <p className="text-xs text-muted-foreground mb-4">Priority is based on aggressiveness, origin, safety concerns, and persistence.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
              <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
