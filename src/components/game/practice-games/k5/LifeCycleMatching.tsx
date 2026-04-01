import { useState, useMemo, useCallback } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CYCLES = ['Annual', 'Biennial', 'Perennial'] as const;

function getCycleType(w: typeof weeds[0]): string {
  if (w.lifeCycle.includes('Biennial')) return 'Biennial';
  if (w.lifeCycle.includes('Perennial')) return 'Perennial';
  return 'Annual';
}

function pickRoundWeeds(): { weed: typeof weeds[0]; correct: string }[] {
  const byType: Record<string, typeof weeds[0][]> = { Annual: [], Biennial: [], Perennial: [] };
  weeds.forEach(w => byType[getCycleType(w)].push(w));
  const picks: { weed: typeof weeds[0]; correct: string }[] = [];
  for (const type of CYCLES) {
    shuffle(byType[type]).slice(0, 2).forEach(w => picks.push({ weed: w, correct: type }));
  }
  return shuffle(picks).slice(0, 6);
}

const TOTAL_ROUNDS = 4;

export default function LifeCycleMatching({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const items = useMemo(() => pickRoundWeeds(), [round]);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const unplaced = items.filter(i => !placements[i.weed.id]);
  const allPlaced = Object.keys(placements).length === items.length;
  const correctCount = checked ? items.filter(i => placements[i.weed.id] === i.correct).length : 0;
  const done = round >= TOTAL_ROUNDS;

  const handleDrop = (cycle: string) => {
    const id = draggedId || selected;
    if (!id || checked) return;
    setPlacements(p => ({ ...p, [id]: cycle }));
    setSelected(null);
    setDraggedId(null);
  };

  const handleRemove = (weedId: string) => {
    if (checked) return;
    setPlacements(p => { const n = { ...p }; delete n[weedId]; return n; });
  };

  const nextRound = () => {
    setTotalScore(s => s + correctCount);
    setRound(r => r + 1);
    setPlacements({});
    setSelected(null);
    setChecked(false);
    setDraggedId(null);
  };

  const restart = () => {
    setRound(0);
    setTotalScore(0);
    setPlacements({});
    setSelected(null);
    setChecked(false);
    setDraggedId(null);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

    const total = TOTAL_ROUNDS * 6;
    addBadge({ gameId: 'lifecycle-matching-k5', gameName: 'Life Cycle Matching', level: 'K-5', score: totalScore, total });
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">All Rounds Complete!</h2>
          <p className="text-muted-foreground mb-6">You sorted {totalScore} / {total} weeds correctly across {TOTAL_ROUNDS} rounds!</p>
          <LevelComplete level={level} score={correctCount} total={items.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
        </div>
      </div>
    );
  }

  // Round complete screen
  if (checked) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Life Cycle Matching</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">Round {round + 1}/{TOTAL_ROUNDS}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {CYCLES.map(cycle => {
              const placed = items.filter(i => placements[i.weed.id] === cycle);
              return (
                <div key={cycle} className="rounded-xl border-2 border-border bg-card p-3 min-h-[120px]">
                  <p className="text-sm font-bold text-foreground text-center mb-2">{cycle}</p>
                  <div className="space-y-2">
                    {placed.map(i => (
                      <div key={i.weed.id} className={`flex items-center gap-1 p-1.5 rounded-lg ${
                        i.correct === cycle ? 'bg-green-500/20 border border-green-500' : 'bg-destructive/20 border border-destructive'
                      }`}>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary flex-shrink-0">
                          <WeedImage weedId={i.weed.id} stage="plant" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-medium text-foreground flex-1 truncate">{i.weed.commonName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold mb-3 ${correctCount === items.length ? 'text-green-500' : 'text-foreground'}`}>
              {correctCount}/{items.length} correct!
            </p>
            <button onClick={nextRound} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
              {round + 1 < TOTAL_ROUNDS ? `Round ${round + 2} →` : 'See Results'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Life Cycle Matching</h1>
        <span className="text-sm text-muted-foreground">Round {round + 1}/{TOTAL_ROUNDS}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-3 text-center">Drag each weed into its life cycle category</p>

        {/* Drop zones */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {CYCLES.map(cycle => {
            const placed = items.filter(i => placements[i.weed.id] === cycle);
            return (
              <div key={cycle}
                onClick={() => handleDrop(cycle)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(cycle)}
                className={`rounded-xl border-2 p-3 min-h-[140px] transition-all text-left ${
                  (selected || draggedId) ? 'border-primary bg-primary/5 cursor-pointer hover:bg-primary/10' : 'border-border bg-card'
                }`}>
                <p className="text-sm font-bold text-foreground text-center mb-2">{cycle}</p>
                <div className="space-y-2">
                  {placed.map(i => (
                    <div key={i.weed.id} className="flex items-center gap-1 p-1.5 rounded-lg bg-secondary">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary flex-shrink-0">
                        <WeedImage weedId={i.weed.id} stage="plant" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-medium text-foreground flex-1 truncate">{i.weed.commonName}</span>
                      <button onClick={e => { e.stopPropagation(); handleRemove(i.weed.id); }} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Draggable weed cards */}
        {unplaced.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {unplaced.map(i => (
              <button key={i.weed.id}
                draggable
                onDragStart={() => setDraggedId(i.weed.id)}
                onDragEnd={() => setDraggedId(null)}
                onClick={() => setSelected(selected === i.weed.id ? null : i.weed.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all cursor-grab active:cursor-grabbing ${
                  selected === i.weed.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary">
                  <WeedImage weedId={i.weed.id} stage="plant" className="w-full h-full object-cover" />
                </div>
                {i.weed.commonName}
              </button>
            ))}
          </div>
        )}

        {allPlaced && (
          <button onClick={() => setChecked(true)} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
        )}
      </div>
    </div>
  );
}
