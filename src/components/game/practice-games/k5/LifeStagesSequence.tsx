import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const STAGES = ['seed', 'seedling', 'vegetative', 'flower'];
const STAGE_LABELS: Record<string, string> = { seed: 'Seed', seedling: 'Seedling', vegetative: 'Vegetative', flower: 'Reproductive' };

const seedWeeds = weeds.filter(w => w.id !== 'Field_Horsetail');

function getWeedsForLevel(level: number): typeof weeds {
  const offset = ((level - 1) * 4) % seedWeeds.length;
  const rotated = [...seedWeeds.slice(offset), ...seedWeeds.slice(0, offset)];
  return shuffle(rotated).slice(0, 4);
}

export default function LifeStagesSequence({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const targets = useMemo(() => getWeedsForLevel(level), [level]);
  const [targetIdx, setTargetIdx] = useState(0);
  const [order, setOrder] = useState<string[]>(() => shuffle([...STAGES]));
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const target = targets[targetIdx];
  const done = targetIdx >= targets.length;

  const restart = () => { setTargetIdx(0); setOrder(shuffle([...STAGES])); setChecked(false); setScore(0); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

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

  if (done) return <LevelComplete level={level} score={score} total={targets.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Life Stages Sequence</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{targetIdx + 1}/{targets.length}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <p className="text-foreground font-bold text-lg">Put <span className="text-primary">{target.commonName}</span> in order</p>
        <div className="flex gap-4 flex-wrap justify-center">
          {order.map((stage, i) => (
            <div key={stage} className={`flex flex-col items-center gap-2 ${checked ? (stage === STAGES[i] ? '' : 'opacity-50') : ''}`}>
              <div className="flex gap-1 mb-1">
                {i > 0 && !checked && (
                  <button onClick={() => swap(i, i - 1)} className="text-sm px-3 py-1 rounded bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground">←</button>
                )}
                {i < order.length - 1 && !checked && (
                  <button onClick={() => swap(i, i + 1)} className="text-sm px-3 py-1 rounded bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground">→</button>
                )}
              </div>
              <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden border-3 ${checked ? (stage === STAGES[i] ? 'border-green-500' : 'border-destructive') : 'border-border'}`}>
                <WeedImage weedId={target.id} stage={stage} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-bold text-foreground">{i + 1}</span>
            </div>
          ))}
        </div>
        {!checked ? (
          <button onClick={check} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold mt-2">Check Order</button>
        ) : (
          <div className="text-center">
            <p className={`text-lg font-bold mb-3 ${isCorrect ? 'text-green-500' : 'text-destructive'}`}>
              {isCorrect ? 'Perfect order!' : `Not quite — correct: ${STAGES.map(s => STAGE_LABELS[s]).join(' → ')}`}
            </p>
            <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
