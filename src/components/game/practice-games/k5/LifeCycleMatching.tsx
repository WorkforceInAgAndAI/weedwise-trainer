import { useState, useMemo, useEffect } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import { getDifficulty } from '@/lib/difficulty';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CYCLES = ['Annual', 'Biennial', 'Perennial'] as const;

function getCycleType(w: typeof weeds[0]): string {
  if (w.lifeCycle.includes('Biennial')) return 'Biennial';
  if (w.lifeCycle.includes('Perennial')) return 'Perennial';
  return 'Annual';
}

function pickRoundWeeds(level: number, roundNum: number, perType: number): { weed: typeof weeds[0]; correct: string }[] {
  const byType: Record<string, typeof weeds[0][]> = { Annual: [], Biennial: [], Perennial: [] };
  weeds.forEach(w => byType[getCycleType(w)].push(w));
  const offset = ((level - 1) * 24 + roundNum * 6);
  const picks: { weed: typeof weeds[0]; correct: string }[] = [];
  for (const type of CYCLES) {
    const pool = byType[type];
    const start = offset % Math.max(pool.length, 1);
    const rotated = [...pool.slice(start), ...pool.slice(0, start)];
    shuffle(rotated).slice(0, perType).forEach(w => picks.push({ weed: w, correct: type }));
  }
  return shuffle(picks);
}

const TOTAL_ROUNDS = 4;

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function LifeCycleMatching({ onBack, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const d = useMemo(() => getDifficulty(level, 'k5'), [level]);
  const perType = Math.max(1, Math.round(d.rounds / 3));
  const { addBadge } = useGameProgress();
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const items = useMemo(() => pickRoundWeeds(level, round, perType), [level, round, perType]);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [bouncedIds, setBouncedIds] = useState<string[]>([]);
  const [farmerMsg, setFarmerMsg] = useState<{ tone: 'intro' | 'correct' | 'wrong' | 'cheer'; text: string }>(
    { tone: 'intro', text: `Howdy! Let's sort these weeds by life cycle. Annuals finish in one year, biennials take two, and perennials come back year after year. Drag each weed into the right bin!` }
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
    setPlacements({});
    setSelected(null);
    setChecked(false);
    setDraggedId(null);
    setBouncedIds([]);
    setFarmerMsg({ tone: 'intro', text: `New round! Same rules — annual, biennial, or perennial?` });
  };

  const restart = () => {
    setRound(0); setTotalScore(0); setPlacements({}); setSelected(null); setChecked(false); setDraggedId(null); setBouncedIds([]);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  // After bounce animation, remove wrong placements so user can re-try only those
  useEffect(() => {
    if (bouncedIds.length === 0) return;
    const t = setTimeout(() => {
      setPlacements(p => {
        const n = { ...p };
        bouncedIds.forEach(id => delete n[id]);
        return n;
      });
      setChecked(false);
      setBouncedIds([]);
    }, 700);
    return () => clearTimeout(t);
  }, [bouncedIds]);

  const handleCheck = () => {
    const wrong = items.filter(i => placements[i.weed.id] !== i.correct).map(i => i.weed.id);
    setChecked(true);
    if (wrong.length === 0) {
      setFarmerMsg({ tone: 'correct', text: `Bullseye! All ${items.length} weeds sorted correctly. Movin' on!` });
    } else {
      const example = items.find(i => i.weed.id === wrong[0]);
      setFarmerMsg({
        tone: 'wrong',
        text: `${wrong.length} weed${wrong.length === 1 ? '' : 's'} popped back out — they were in the wrong bin. Hint: ${example?.weed.commonName} is a ${example?.correct.toLowerCase()} (${example?.weed.lifeCycle}). Try those again!`,
      });
      setBouncedIds(wrong);
    }
  };

  if (done) {
    const total = TOTAL_ROUNDS * items.length;
    addBadge({ gameId: 'lifecycle-matching-k5', gameName: 'Life Cycle Matching', level: 'K-5', score: totalScore, total });
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
        <h1 className="font-bold text-foreground text-lg flex-1">Life Cycle Matching</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Round {round + 1}/{TOTAL_ROUNDS}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <FarmerGuide gradeLabel={gradeLabel} tone={farmerMsg.tone} message={farmerMsg.text} className="mb-4 max-w-3xl mx-auto" />

        <div className="max-w-5xl mx-auto space-y-3">
          {/* Cycle bins side by side across the top */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CYCLES.map(cycle => {
              const placed = items.filter(i => placements[i.weed.id] === cycle);
              return (
                <div
                  key={cycle}
                  onClick={() => handleDrop(cycle)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(cycle)}
                  className={`rounded-xl border-2 p-2.5 min-h-[110px] transition-all ${
                    (selected || draggedId) ? 'border-primary bg-primary/5 cursor-pointer hover:bg-primary/10' : 'border-border bg-card'
                  }`}
                >
                  <p className="text-sm font-bold text-foreground mb-2">{cycle}</p>
                  <div className="flex flex-wrap gap-2">
                    {placed.map(i => {
                      const isWrong = checked && i.correct !== cycle;
                      const isRight = checked && i.correct === cycle;
                      const isBouncing = bouncedIds.includes(i.weed.id);
                      return (
                        <div
                          key={i.weed.id}
                          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border-2 transition-all duration-500 ${
                            isBouncing ? 'opacity-0 -translate-y-12 scale-50 border-destructive' :
                            isWrong ? 'border-destructive bg-destructive/10' :
                            isRight ? 'border-green-500 bg-green-500/10' :
                            'border-border bg-secondary'
                          }`}
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted">
                            <WeedImage weedId={i.weed.id} stage="flower" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] font-medium text-foreground max-w-[60px] text-center leading-tight">{i.weed.commonName}</span>
                          {!checked && (
                            <button onClick={e => { e.stopPropagation(); handleRemove(i.weed.id); }} className="text-[9px] text-muted-foreground hover:text-destructive">remove</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weeds still to sort — below the bins, laid out across */}
          <div className="rounded-xl border-2 border-border bg-card p-3">
            <p className="text-xs font-bold uppercase text-foreground mb-2">Weeds to Sort ({unplaced.length})</p>
            <div className="flex flex-wrap gap-2">
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
                  className={`flex items-center gap-2 p-1.5 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing ${
                    selected === i.weed.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-foreground hover:border-primary/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                    <WeedImage weedId={i.weed.id} stage="flower" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-left text-[11px] leading-tight max-w-[110px]">{i.weed.commonName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {allPlaced && !checked && (
              <button onClick={handleCheck} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
            )}
            {allCorrect && (
              <button onClick={nextRound} className="w-full py-2.5 rounded-lg bg-success text-success-foreground font-bold">
                {round + 1 < TOTAL_ROUNDS ? `Round ${round + 2} →` : 'See Results'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
