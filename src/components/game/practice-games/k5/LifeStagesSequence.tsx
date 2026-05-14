import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const STAGES = ['seed', 'seedling', 'vegetative', 'flower'];
const STAGE_LABELS: Record<string, string> = { seed: 'Seed', seedling: 'Seedling', vegetative: 'Vegetative', flower: 'Reproductive' };

const seedWeeds = weeds.filter(w => w.id !== 'Field_Horsetail');

function getWeedsForLevel(level: number): typeof weeds {
  const offset = ((level - 1) * 4) % seedWeeds.length;
  const rotated = [...seedWeeds.slice(offset), ...seedWeeds.slice(0, offset)];
  return shuffle(rotated).slice(0, 4);
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function LifeStagesSequence({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const targets = useMemo(() => getWeedsForLevel(level), [level]);
  const [targetIdx, setTargetIdx] = useState(0);
  const [order, setOrder] = useState<string[]>(() => shuffle([...STAGES]));
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ weedId: string; name: string; correct: boolean }[]>([]);

  const target = targets[targetIdx];
  const done = targetIdx >= targets.length;

  const restart = () => { setTargetIdx(0); setOrder(shuffle([...STAGES])); setChecked(false); setScore(0); setHistory([]); };
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
    setHistory(h => [...h, { weedId: target.id, name: target.commonName, correct }]);
  };

  const next = () => {
    setTargetIdx(i => i + 1);
    setOrder(shuffle([...STAGES]));
    setChecked(false);
  };

  const isCorrect = checked && order.every((s, i) => s === STAGES[i]);

  if (done) return <LevelComplete level={level} score={score} total={targets.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} gameId={gameId} gameName={gameName} gradeLabel={gradeLabel} />;

  // Circle positions for 4 stages: top, right, bottom, left
  const positions = [
    { top: '0%', left: '50%', tx: '-50%', ty: '0' },
    { top: '50%', left: '100%', tx: '-100%', ty: '-50%' },
    { top: '100%', left: '50%', tx: '-50%', ty: '-100%' },
    { top: '50%', left: '0%', tx: '0', ty: '-50%' },
  ];
  // Arrow midpoints between consecutive positions, rotated to point clockwise
  const arrows = [
    { top: '15%', left: '85%', rot: 45 },
    { top: '85%', left: '85%', rot: 135 },
    { top: '85%', left: '15%', rot: 225 },
    { top: '15%', left: '15%', rot: 315 },
  ];

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Life Stages Sequence</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{targetIdx + 1}/{targets.length}</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 p-4 overflow-y-auto">
        {/* Main: circle layout */}
        <div className="flex flex-col items-center justify-center gap-6">
          <FarmerGuide
            gradeLabel={gradeLabel}
            tone={checked ? (isCorrect ? 'correct' : 'wrong') : 'hint'}
            message={
              checked
                ? isCorrect
                  ? `Yee-haw! You walked the ${target.commonName} all the way around its cycle. That's how a real agronomist thinks!`
                  : `Close, partner — every weed starts as a seed, sprouts into a seedling, grows tall (vegetative), then flowers (reproductive). Follow the arrows clockwise.`
                : `Alright, let's trace the ${target.commonName} life cycle. Start at the top with the seed and follow the arrows clockwise. Use the ← → buttons to swap stages.`
            }
            className="max-w-xl w-full"
          />
          <p className="text-foreground font-bold text-lg text-center">Put <span className="text-primary">{target.commonName}</span> in cycle order, starting at the top.</p>

          <div className="relative w-[360px] h-[360px] sm:w-[440px] sm:h-[440px]">
            {/* Center label */}
            <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary/5 border-2 border-dashed border-primary/30 flex items-center justify-center text-center">
              <span className="text-xs font-bold text-primary leading-tight px-2">Life Cycle<br/>(seed → seed)</span>
            </div>
            {/* Arrows between stages — show clockwise cycle direction */}
            {arrows.map((a, i) => (
              <div
                key={`arrow-${i}`}
                className="absolute text-primary/70 text-2xl font-bold pointer-events-none select-none"
                style={{ top: a.top, left: a.left, transform: `translate(-50%, -50%) rotate(${a.rot}deg)` }}
              >
                →
              </div>
            ))}
            {/* Stage cards — keyed by stage so the image stays attached to its card while reordering */}
            {STAGES.map((stage) => {
              const i = order.indexOf(stage);
              const pos = positions[i];
              return (
                <div
                  key={stage}
                  className="absolute transition-all duration-300"
                  style={{ top: pos.top, left: pos.left, transform: `translate(${pos.tx}, ${pos.ty})` }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-[10px] font-bold text-muted-foreground">#{i + 1}</div>
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-3 ${
                      checked ? (stage === STAGES[i] ? 'border-green-500' : 'border-destructive') : 'border-border'
                    }`}>
                      <WeedImage weedId={target.id} stage={stage} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[10px] font-semibold text-foreground">{STAGE_LABELS[stage]}</div>
                    {!checked && (
                      <div className="flex gap-1">
                        <button onClick={() => swap(i, (i + order.length - 1) % order.length)} className="text-xs px-2 py-0.5 rounded bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground">←</button>
                        <button onClick={() => swap(i, (i + 1) % order.length)} className="text-xs px-2 py-0.5 rounded bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground">→</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!checked ? (
            <button onClick={check} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Order</button>
          ) : (
            <div className="text-center">
              <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
            </div>
          )}
        </div>

        {/* Side history */}
        <div className="rounded-xl border-2 border-border bg-card p-3 overflow-y-auto">
          <p className="text-xs font-bold uppercase text-foreground mb-2">Completed ({history.length})</p>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className={`p-2 rounded-md border-2 ${h.correct ? 'border-green-500/50 bg-green-500/5' : 'border-destructive/50 bg-destructive/5'}`}>
                <p className="text-[10px] font-bold text-foreground mb-1 truncate">{h.name}</p>
                <div className="grid grid-cols-4 gap-1">
                  {STAGES.map(s => (
                    <div key={s} className="aspect-square rounded overflow-hidden">
                      <WeedImage weedId={h.weedId} stage={s} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
