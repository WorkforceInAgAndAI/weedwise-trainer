import { useState, useMemo, useEffect } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CYCLES = ['Annual', 'Biennial', 'Perennial'] as const;

function getCycleType(w: typeof weeds[0]): string {
  const lc = w.lifeCycle.toLowerCase();
  if (lc.includes('biennial')) return 'Biennial';
  if (lc.includes('perennial')) return 'Perennial';
  return 'Annual';
}

const TOTAL_ROUNDS = 4;
const PER_ROUND = 9;

function pickRoundWeeds(level: number, roundNum: number) {
  const byType: Record<string, typeof weeds[0][]> = { Annual: [], Biennial: [], Perennial: [] };
  weeds.forEach(w => byType[getCycleType(w)].push(w));
  const offset = (level - 1) * 12 + roundNum * 3;
  const picks: { weed: typeof weeds[0]; correct: string }[] = [];
  for (const type of CYCLES) {
    const pool = byType[type];
    if (pool.length === 0) continue;
    const start = offset % pool.length;
    const rotated = [...pool.slice(start), ...pool.slice(0, start)];
    shuffle(rotated).slice(0, 3).forEach(w => picks.push({ weed: w, correct: type }));
  }
  return shuffle(picks).slice(0, PER_ROUND);
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function LifeCycleMatching({ onBack, gradeLabel = '6-8' }: Props) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const items = useMemo(() => pickRoundWeeds(level, round), [level, round]);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [bouncedIds, setBouncedIds] = useState<string[]>([]);
  const [farmerMsg, setFarmerMsg] = useState<{ tone: 'intro' | 'correct' | 'wrong' | 'cheer'; text: string }>(
    { tone: 'intro', text: `Sort each weed by life cycle. Annuals finish in one year, biennials take two, perennials persist for three or more. Use scientific names and reproductive traits as your clues.` }
  );

  const unplaced = items.filter(i => !placements[i.weed.id]);
  const allPlaced = Object.keys(placements).length === items.length;
  const correctCount = items.filter(i => placements[i.weed.id] === i.correct).length;
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
    setTotalScore(s => s + items.length);
    setRound(r => r + 1);
    setPlacements({}); setSelected(null); setChecked(false); setDraggedId(null); setBouncedIds([]);
    setFarmerMsg({ tone: 'intro', text: `New round, harder set — keep watching for biennials. They look like annuals year one, then bolt year two.` });
  };

  const restart = () => {
    setRound(0); setTotalScore(0); setPlacements({}); setSelected(null); setChecked(false); setDraggedId(null); setBouncedIds([]);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  useEffect(() => {
    if (bouncedIds.length === 0) return;
    const t = setTimeout(() => {
      setPlacements(p => { const n = { ...p }; bouncedIds.forEach(id => delete n[id]); return n; });
      setChecked(false);
      setBouncedIds([]);
    }, 700);
    return () => clearTimeout(t);
  }, [bouncedIds]);

  const handleCheck = () => {
    const wrong = items.filter(i => placements[i.weed.id] !== i.correct).map(i => i.weed.id);
    setChecked(true);
    if (wrong.length === 0) {
      setFarmerMsg({ tone: 'correct', text: `All ${items.length} sorted correctly. Onto the next round.` });
    } else {
      const example = items.find(i => i.weed.id === wrong[0]);
      setFarmerMsg({
        tone: 'wrong',
        text: `${wrong.length} popped back out — wrong bin. Hint: ${example?.weed.commonName} (${example?.weed.scientificName}) is a ${example?.correct.toLowerCase()} (${example?.weed.lifeCycle}). Re-sort the highlighted ones.`,
      });
      setBouncedIds(wrong);
    }
  };

  if (done) {
    const total = TOTAL_ROUNDS * PER_ROUND;
    addBadge({ gameId: 'lifecycle-matching-68', gameName: 'Life Cycle Sort', level: '6-8', score: totalScore, total });
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">All Rounds Complete!</h2>
          <p className="text-muted-foreground mb-6">You sorted {totalScore} / {total} weeds correctly across {TOTAL_ROUNDS} rounds!</p>
          <LevelComplete level={level} score={totalScore} total={total} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
        </div>
      </div>
    );
  }

  const allCorrect = checked && bouncedIds.length === 0 && correctCount === items.length;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Life Cycle Sort</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Round {round + 1}/{TOTAL_ROUNDS}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <FarmerGuide gradeLabel={gradeLabel} tone={farmerMsg.tone} message={farmerMsg.text} className="mb-4 max-w-3xl mx-auto" />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 max-w-5xl mx-auto">
          <div className="space-y-3">
            {CYCLES.map(cycle => {
              const placed = items.filter(i => placements[i.weed.id] === cycle);
              return (
                <div
                  key={cycle}
                  onClick={() => handleDrop(cycle)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(cycle)}
                  className={`rounded-xl border-2 p-4 min-h-[140px] transition-all ${
                    (selected || draggedId) ? 'border-primary bg-primary/5 cursor-pointer hover:bg-primary/10' : 'border-border bg-card'
                  }`}
                >
                  <p className="text-base font-bold text-foreground mb-1">{cycle}</p>
                  <p className="text-[11px] text-muted-foreground mb-3">
                    {cycle === 'Annual' && 'Germinates, flowers, sets seed, dies in 1 year'}
                    {cycle === 'Biennial' && 'Vegetative year 1 → bolts and flowers year 2'}
                    {cycle === 'Perennial' && 'Lives 3+ years from rhizomes, tubers, or crowns'}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {placed.map(i => {
                      const isWrong = checked && i.correct !== cycle;
                      const isRight = checked && i.correct === cycle;
                      const isBouncing = bouncedIds.includes(i.weed.id);
                      return (
                        <div
                          key={i.weed.id}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all duration-500 ${
                            isBouncing ? 'opacity-0 -translate-y-12 scale-50 border-destructive' :
                            isWrong ? 'border-destructive bg-destructive/10' :
                            isRight ? 'border-green-500 bg-green-500/10' :
                            'border-border bg-secondary'
                          }`}
                        >
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                            <WeedImage weedId={i.weed.id} stage="flower" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs font-medium text-foreground max-w-[80px] text-center leading-tight">{i.weed.commonName}</span>
                          <span className="text-[9px] italic text-muted-foreground max-w-[80px] text-center leading-tight">{i.weed.scientificName}</span>
                          {!checked && (
                            <button onClick={e => { e.stopPropagation(); handleRemove(i.weed.id); }} className="text-[10px] text-muted-foreground hover:text-destructive">remove</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {allPlaced && !checked && (
              <button onClick={handleCheck} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
            )}
            {allCorrect && (
              <button onClick={nextRound} className="w-full py-3 rounded-lg bg-success text-success-foreground font-bold">
                {round + 1 < TOTAL_ROUNDS ? `Round ${round + 2} →` : 'See Results'}
              </button>
            )}
          </div>

          <div className="rounded-xl border-2 border-border bg-card p-3 h-fit md:sticky md:top-4">
            <p className="text-xs font-bold uppercase text-foreground mb-3">Weeds to Sort ({unplaced.length})</p>
            <div className="space-y-2">
              {unplaced.length === 0 && (
                <p className="text-xs text-muted-foreground italic">All placed! Hit "Check Answers".</p>
              )}
              {unplaced.map(i => (
                <button
                  key={i.weed.id}
                  draggable
                  onDragStart={() => setDraggedId(i.weed.id)}
                  onDragEnd={() => setDraggedId(null)}
                  onClick={() => setSelected(selected === i.weed.id ? null : i.weed.id)}
                  className={`flex items-center gap-2 w-full p-2 rounded-lg border-2 text-sm font-medium transition-all cursor-grab active:cursor-grabbing ${
                    selected === i.weed.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-foreground hover:border-primary/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    <WeedImage weedId={i.weed.id} stage="flower" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-xs font-semibold">{i.weed.commonName}</div>
                    <div className="text-[10px] italic text-muted-foreground">{i.weed.scientificName}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
