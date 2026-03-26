import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const HERBICIDE_GROUPS = [
  { id: 'group2', label: 'ALS Inhibitors (Group 2)', targets: 'broadleaf' },
  { id: 'group4', label: 'Synthetic Auxins (Group 4)', targets: 'broadleaf' },
  { id: 'group9', label: 'Glyphosate (Group 9)', targets: 'both' },
  { id: 'group15', label: 'Long-chain FA Inhibitors (Group 15)', targets: 'grass' },
  { id: 'group1', label: 'ACCase Inhibitors (Group 1)', targets: 'grass' },
  { id: 'group5', label: 'Photosystem II Inhibitors (Group 5)', targets: 'broadleaf' },
];

function getTargetType(w: typeof weeds[0]): string {
  return w.plantType === 'Monocot' ? 'grass' : 'broadleaf';
}

export default function ControlMethodMatching({ onBack }: { onBack: () => void }) {
  const items = useMemo(() => shuffle(weeds).slice(0, 8).map(w => ({
    weed: w,
    type: getTargetType(w),
    correctGroups: HERBICIDE_GROUPS.filter(g => g.targets === getTargetType(w) || g.targets === 'both').map(g => g.id),
  })), []);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const done = idx >= items.length;
  const current = !done ? items[idx] : null;

  const submit = (gId: string) => {
    if (answered) return;
    setSelected(gId);
    setAnswered(true);
    if (current!.correctGroups.includes(gId)) setScore(s => s + 1);
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
        <h1 className="font-bold text-foreground text-lg flex-1">Control Method Matching</h1>
        <span className="text-sm text-muted-foreground">{idx + 1}/{items.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-36 h-36 rounded-xl overflow-hidden bg-secondary mb-3">
          <WeedImage weedId={current!.weed.id} stage="vegetative" className="w-full h-full object-cover" />
        </div>
        <p className="font-bold text-foreground mb-1">{current!.weed.commonName}</p>
        <p className="text-xs text-muted-foreground mb-1">Type: {current!.weed.plantType} ({current!.type})</p>
        <p className="text-xs text-muted-foreground mb-4">Which herbicide group targets this weed?</p>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {HERBICIDE_GROUPS.map(g => {
            const isCorrect = current!.correctGroups.includes(g.id);
            const bg = !answered ? 'border-border bg-card hover:border-primary' :
              g.id === selected ? (isCorrect ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
              isCorrect ? 'border-green-500 bg-green-500/10' : 'border-border bg-card';
            return (
              <button key={g.id} onClick={() => submit(g.id)}
                className={`p-3 rounded-lg border-2 text-left text-sm font-medium text-foreground transition-all ${bg}`}>
                {g.label}
                {answered && <span className="text-xs text-muted-foreground ml-2">({g.targets})</span>}
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
