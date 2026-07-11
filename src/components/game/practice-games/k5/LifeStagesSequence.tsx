import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import { ArrowRight } from 'lucide-react';

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
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const target = targets[targetIdx];
  const done = targetIdx >= targets.length;

  const restart = () => { setTargetIdx(0); setOrder(shuffle([...STAGES])); setChecked(false); setScore(0); setHistory([]); setSelectedIdx(null); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  const swap = (i: number, j: number) => {
    if (checked || i === j) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };

  // Click-to-swap: first tap selects a card, second tap swaps them.
  const handleCardClick = (i: number) => {
    if (checked) return;
    if (selectedIdx === null) { setSelectedIdx(i); return; }
    if (selectedIdx === i) { setSelectedIdx(null); return; }
    swap(selectedIdx, i);
    setSelectedIdx(null);
  };

  const handleDrop = (i: number) => {
    if (draggedIdx === null || checked) return;
    swap(draggedIdx, i);
    setDraggedIdx(null);
    setSelectedIdx(null);
  };

  const check = () => {
    setChecked(true);
    const correct = order.every((s, i) => s === STAGES[i]);
    if (correct) setScore(sc => sc + 1);
    setHistory(h => [...h, { weedId: target.id, name: target.commonName, correct }]);
    setSelectedIdx(null);
  };

  const next = () => {
    setTargetIdx(i => i + 1);
    setOrder(shuffle([...STAGES]));
    setChecked(false);
    setSelectedIdx(null);
  };

  const isCorrect = checked && order.every((s, i) => s === STAGES[i]);

  if (done) return <LevelComplete level={level} score={score} total={targets.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} gameId={gameId} gameName={gameName} gradeLabel={gradeLabel} />;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Life Stages Sequence</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{targetIdx + 1}/{targets.length}</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 p-4 overflow-y-auto">
        <div className="flex flex-col items-center justify-center gap-6">
          <FarmerGuide
            gradeLabel={gradeLabel}
            tone={checked ? (isCorrect ? 'correct' : 'wrong') : 'hint'}
            message={
              checked
                ? isCorrect
                  ? `Yee-haw! You put the ${target.commonName} stages in the right order.`
                  : `Close, partner — every weed starts as a seed, sprouts into a seedling, grows tall (vegetative), then flowers (reproductive).`
                : `Put the ${target.commonName} stages in order from left to right. Drag a card onto another to swap them — or tap one card, then tap another to switch them.`
            }
            className="max-w-xl w-full"
          />
          <p className="text-foreground font-bold text-lg text-center">Put <span className="text-primary">{target.commonName}</span> in order from <span className="text-primary">left</span> to <span className="text-primary">right</span>.</p>

          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {order.map((stage, i) => {
              const isSelected = selectedIdx === i;
              const isCorrectSlot = checked && stage === STAGES[i];
              const isWrongSlot = checked && stage !== STAGES[i];
              return (
                <div key={i} className="flex items-center gap-1 sm:gap-2">
                  <button
                    draggable={!checked}
                    onDragStart={() => !checked && setDraggedIdx(i)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDrop(i)}
                    onDragEnd={() => setDraggedIdx(null)}
                    onClick={() => handleCardClick(i)}
                    disabled={checked}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-4 bg-card transition-all cursor-grab active:cursor-grabbing hover:scale-105 ${
                      isCorrectSlot ? 'border-green-500 bg-green-500/10'
                      : isWrongSlot ? 'border-destructive bg-destructive/10'
                      : isSelected ? 'border-primary bg-primary/10 ring-4 ring-primary/30 scale-105'
                      : 'border-border'
                    }`}
                  >
                    <div className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center">{i + 1}</div>
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-muted">
                      <WeedImage weedId={target.id} stage={stage} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs font-semibold text-foreground">{STAGE_LABELS[stage]}</div>
                  </button>
                  {i < order.length - 1 && <ArrowRight className="w-5 h-5 text-primary/60 shrink-0" />}
                </div>
              );
            })}
          </div>

          {selectedIdx !== null && !checked && (
            <p className="text-sm text-primary font-medium">Now tap another card to swap it with the highlighted one.</p>
          )}

          {!checked ? (
            <button onClick={check} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Order</button>
          ) : (
            <div className="text-center">
              <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
            </div>
          )}
        </div>

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