import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const STAGES = ['seedling', 'vegetative', 'reproductive'] as const;
const STAGE_LABELS: Record<string, string> = { seedling: 'Seedling', vegetative: 'Vegetative', reproductive: 'Reproductive' };

const CONTROLS = [
  { id: 'pre', label: 'Pre-Plant Herbicide', best: 'seedling' },
  { id: 'post', label: 'Post-Plant Herbicide', best: 'vegetative' },
  { id: 'mow', label: 'Mow / Cut', best: 'reproductive' },
  { id: 'pull', label: 'Hand Pull', best: 'seedling' },
  { id: 'cultivate', label: 'Cultivation / Tillage', best: 'seedling' },
];

export default function LifeStageControl({ onBack }: { onBack: () => void }) {
  const items = useMemo(() => {
    const pool = shuffle(weeds).slice(0, 12);
    return STAGES.flatMap(stage =>
      pool.splice(0, 4).map(w => ({ weed: w, stage }))
    );
  }, []);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const done = idx >= items.length;
  const current = !done ? items[idx] : null;
  const currentStage = current?.stage || 'seedling';
  const bestControls = CONTROLS.filter(c => c.best === currentStage).map(c => c.id);

  const submit = (cId: string) => {
    if (answered) return;
    setSelected(cId);
    setAnswered(true);
    if (bestControls.includes(cId)) setScore(s => s + 1);
  };

  const next = () => { setIdx(i => i + 1); setSelected(null); setAnswered(false); };
  const restart = () => { setIdx(0); setScore(0); setSelected(null); setAnswered(false); };

  if (done) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
        <p className="text-lg text-foreground mb-6">{score}/{items.length} correct</p>
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
        <h1 className="font-bold text-foreground text-lg flex-1">Life Stage Control</h1>
        <span className="text-sm text-muted-foreground">{idx + 1}/{items.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1">
          {STAGES.map(s => (
            <span key={s} className={`px-3 py-1 rounded-full text-xs font-bold ${s === currentStage ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {STAGE_LABELS[s]}
            </span>
          ))}
        </div>
        <div className="w-40 h-40 rounded-xl overflow-hidden bg-secondary my-3">
          <WeedImage weedId={current!.weed.id} stage={currentStage} className="w-full h-full object-cover" />
        </div>
        <p className="font-bold text-foreground mb-1">{current!.weed.commonName}</p>
        <p className="text-xs text-muted-foreground mb-4">How should you manage this weed at this stage?</p>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {CONTROLS.map(c => {
            const isBest = bestControls.includes(c.id);
            const bg = !answered ? 'border-border bg-card hover:border-primary' :
              c.id === selected ? (isBest ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
              isBest ? 'border-green-500 bg-green-500/10' : 'border-border bg-card';
            return (
              <button key={c.id} onClick={() => submit(c.id)}
                className={`p-3 rounded-lg border-2 text-sm font-medium text-foreground transition-all ${bg}`}>
                {c.label}
              </button>
            );
          })}
        </div>
        {answered && (
          <button onClick={next} className="mt-4 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
        )}
      </div>
    </div>
  );
}
