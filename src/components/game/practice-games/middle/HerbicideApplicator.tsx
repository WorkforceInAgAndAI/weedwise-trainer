import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import fieldBg from '@/assets/images/field-bg-1.jpg';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const HERBICIDE_TYPES = [
  { id: 'pre', label: 'Pre-emergent', desc: 'Applied before weeds emerge from soil', best: 'seedling' },
  { id: 'post-early', label: 'Post-emergent (Early)', desc: 'Applied to small actively growing weeds', best: 'vegetative' },
  { id: 'post-late', label: 'Post-emergent (Late)', desc: 'Applied to larger established weeds', best: 'reproductive' },
  { id: 'burndown', label: 'Burndown', desc: 'Non-selective; kills all vegetation before planting', best: 'any' },
];

function getBest(w: typeof weeds[0]): string {
  const m = w.management.toLowerCase();
  if (m.includes('pre')) return 'pre';
  if (m.includes('post')) return w.actImmediately ? 'post-early' : 'post-late';
  return 'post-early';
}

export default function HerbicideApplicator({ onBack }: { onBack: () => void }) {
  const items = useMemo(() => shuffle(weeds).slice(0, 8).map((w, i) => ({
    weed: w, best: getBest(w),
    x: 12 + (i % 4) * 22 + Math.random() * 8,
    y: 15 + Math.floor(i / 4) * 40 + Math.random() * 15,
  })), []);

  const [current, setCurrent] = useState<number | null>(null);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const done = answered.size === items.length;

  const pick = (hId: string) => {
    if (current === null || selected) return;
    setSelected(hId);
    if (hId === items[current].best) setScore(s => s + 1);
    setTimeout(() => {
      setAnswered(prev => new Set([...prev, current]));
      setCurrent(null);
      setSelected(null);
    }, 1200);
  };

  const restart = () => { setCurrent(null); setAnswered(new Set()); setSelected(null); setScore(0); };

  if (done) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Application Complete!</h2>
        <p className="text-lg text-foreground mb-6">{score}/{items.length} correct applications</p>
        <div className="flex gap-3">
          <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Herbicide Applicator</h1>
        <span className="text-sm text-muted-foreground">{answered.size}/{items.length}</span>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <img src={fieldBg} alt="Field" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        {items.map((item, i) => (
          <button key={i} onClick={() => !answered.has(i) && setCurrent(i)}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${answered.has(i) ? 'opacity-30 pointer-events-none' : current === i ? 'scale-125' : 'animate-pulse'}`}>
            <div className="w-12 h-12 rounded-full border-3 border-amber-400 bg-background/80 overflow-hidden">
              <WeedImage weedId={item.weed.id} stage="vegetative" className="w-full h-full object-cover" />
            </div>
          </button>
        ))}
      </div>
      {current !== null && (
        <div className="bg-card border-t-2 border-border p-4">
          <p className="font-bold text-foreground mb-3">{items[current].weed.commonName} — What herbicide type?</p>
          <div className="grid grid-cols-2 gap-2">
            {HERBICIDE_TYPES.map(h => {
              const isCorrect = h.id === items[current].best;
              const bg = selected === null ? 'border-border bg-background hover:border-primary' :
                h.id === selected ? (isCorrect ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
                isCorrect ? 'border-green-500 bg-green-500/10' : 'border-border bg-background';
              return (
                <button key={h.id} onClick={() => pick(h.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${bg}`}>
                  <span className="font-bold text-xs text-foreground">{h.label}</span>
                  <p className="text-[10px] text-muted-foreground">{h.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
