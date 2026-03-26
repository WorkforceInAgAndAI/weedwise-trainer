import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);
const STAGES = ['seedling', 'vegetative', 'reproductive', 'mature'];
const STAGE_LABELS: Record<string, string> = { seedling: 'Seedling', vegetative: 'Vegetative', reproductive: 'Reproductive', mature: 'Mature Plant' };

export default function LifeStagesSequence({ onBack }: { onBack: () => void }) {
  const targets = useMemo(() => shuffle(weeds).slice(0, 4), []);
  const [targetIdx, setTargetIdx] = useState(0);
  const [order, setOrder] = useState<string[]>(() => shuffle([...STAGES]));
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const target = targets[targetIdx];
  const done = targetIdx >= targets.length;

  const swap = (i: number, j: number) => {
    if (checked) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };

  const check = () => {
    setChecked(true);
    const correct = order.every((s, i) => s === STAGES[i]);
    if (correct) setScore(sc => sc + 1);
  };

  const next = () => {
    setTargetIdx(i => i + 1);
    setOrder(shuffle([...STAGES]));
    setChecked(false);
  };

  const isCorrect = checked && order.every((s, i) => s === STAGES[i]);

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🔄</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">All Done!</h2>
        <p className="text-muted-foreground mb-6">You got {score} / {targets.length} correct!</p>
        <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Life Stages Sequence</h1>
        <span className="text-sm text-muted-foreground">{targetIdx + 1}/{targets.length}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        <p className="text-foreground font-bold">Put <span className="text-primary">{target.commonName}</span> in order: Seedling → Mature</p>
        <div className="flex gap-3 flex-wrap justify-center">
          {order.map((stage, i) => (
            <div key={stage} className={`flex flex-col items-center gap-1 ${checked ? (stage === STAGES[i] ? '' : 'opacity-50') : ''}`}>
              <div className="flex gap-1 mb-1">
                {i > 0 && <button onClick={() => swap(i, i - 1)} className="text-xs px-2 py-1 rounded bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground">←</button>}
                {i < order.length - 1 && <button onClick={() => swap(i, i + 1)} className="text-xs px-2 py-1 rounded bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground">→</button>}
              </div>
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 ${checked ? (stage === STAGES[i] ? 'border-primary' : 'border-destructive') : 'border-border'}`}>
                <WeedImage weedId={target.id} stage={stage} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{STAGE_LABELS[stage]}</span>
              <span className="text-xs font-bold text-foreground">{i + 1}</span>
            </div>
          ))}
        </div>
        {!checked ? (
          <button onClick={check} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold mt-2">Check Order</button>
        ) : (
          <div className="text-center">
            <p className={`text-lg font-bold mb-3 ${isCorrect ? 'text-primary' : 'text-destructive'}`}>
              {isCorrect ? 'Perfect order!' : `Not quite — correct: ${STAGES.map(s => STAGE_LABELS[s]).join(' → ')}`}
            </p>
            <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
