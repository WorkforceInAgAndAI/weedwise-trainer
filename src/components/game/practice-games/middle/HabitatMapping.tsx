import { useState, useMemo, useEffect } from 'react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import { Sun, Snowflake, Droplets, Wind } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// Mirrors the four habitat categories used in the 6-8 Learning Module
const ZONES = [
  { id: 'warm', label: 'Warm-Season / Full Sun', Icon: Sun },
  { id: 'cool', label: 'Cool-Season / Early Spring', Icon: Snowflake },
  { id: 'wet', label: 'Wet / Poorly Drained', Icon: Droplets },
  { id: 'dry', label: 'Dry / Disturbed', Icon: Wind },
];

function getZone(w: typeof weeds[0]): string {
  const h = (w.primaryHabitat || '').trim().toLowerCase();
  if (h.startsWith('wet')) return 'wet';
  if (h.startsWith('dry')) return 'dry';
  if (h.startsWith('cool')) return 'cool';
  return 'warm'; // both "Warm-Season / Full Sun" variants land here
}

function reasonFor(w: typeof weeds[0], zone: string): string {
  const name = w.commonName;
  switch (zone) {
    case 'wet': return `${name} thrives in saturated, poorly drained soils — its roots tolerate low oxygen, so it dominates ditches, low spots, and tile-drained fields with compaction.`;
    case 'dry': return `${name} survives on sandy, dry, disturbed ground using deep roots, waxy or hairy leaves, and tough seed coats that conserve moisture.`;
    case 'cool': return `${name} germinates in fall or early spring when soils are 40–60 °F. Cool-season C3 species like this often overwinter as a low rosette.`;
    case 'warm':
    default: return `${name} is a warm-season grower that waits for soils above ~60 °F and uses the C4 pathway to explode in mid-summer heat and full sun.`;
  }
}

const ROUNDS_PER_LEVEL = 3;
const WEEDS_PER_ROUND = 8;

function getItemsForRound(level: number, roundNum: number) {
  const byZone: Record<string, typeof weeds> = { warm: [], cool: [], wet: [], dry: [] };
  weeds.forEach(w => byZone[getZone(w)].push(w));
  const offset = ((level - 1) * ROUNDS_PER_LEVEL + roundNum) * 2;
  const picks: { weed: typeof weeds[0]; zone: string }[] = [];
  for (const z of ZONES) {
    const pool = byZone[z.id];
    if (pool.length === 0) continue;
    const idx = offset % pool.length;
    const rotated = shuffle([...pool.slice(idx), ...pool.slice(0, idx)]);
    rotated.slice(0, 2).forEach(w => picks.push({ weed: w, zone: z.id }));
  }
  return shuffle(picks);
}

export default function HabitatMapping({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const [roundNum, setRoundNum] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const items = useMemo(() => getItemsForRound(level, roundNum), [level, roundNum]);

  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [bouncedIds, setBouncedIds] = useState<string[]>([]);
  const [showReasons, setShowReasons] = useState(false);

  const unplaced = items.filter(i => !placements[i.weed.id]);
  const allPlaced = Object.keys(placements).length === items.length;
  const correctCount = items.filter(i => placements[i.weed.id] === i.zone).length;
  const done = roundNum >= ROUNDS_PER_LEVEL;

  const handleDrop = (zoneId: string) => {
    const id = draggedId || selected;
    if (!id || checked) return;
    setPlacements(p => ({ ...p, [id]: zoneId }));
    setSelected(null);
    setDraggedId(null);
  };

  const handleRemove = (weedId: string) => {
    if (checked) return;
    setPlacements(p => { const n = { ...p }; delete n[weedId]; return n; });
  };

  const checkAnswers = () => {
    const wrong = items.filter(i => placements[i.weed.id] !== i.zone).map(i => i.weed.id);
    setChecked(true);
    if (wrong.length > 0) setBouncedIds(wrong);
  };

  useEffect(() => {
    if (bouncedIds.length === 0) return;
    const t = setTimeout(() => {
      setPlacements(p => { const n = { ...p }; bouncedIds.forEach(id => delete n[id]); return n; });
      setChecked(false);
      setBouncedIds([]);
    }, 700);
    return () => clearTimeout(t);
  }, [bouncedIds]);

  const nextRound = () => {
    setTotalScore(s => s + correctCount);
    setRoundNum(r => r + 1);
    setPlacements({}); setSelected(null); setChecked(false); setShowReasons(false); setBouncedIds([]); setDraggedId(null);
  };

  const restart = () => {
    setRoundNum(0); setTotalScore(0); setPlacements({}); setSelected(null); setChecked(false); setShowReasons(false); setBouncedIds([]);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    const total = ROUNDS_PER_LEVEL * WEEDS_PER_ROUND;
    return <LevelComplete level={level} score={totalScore} total={total} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;
  }

  if (showReasons) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Why these habitats?</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
          <p className="text-sm text-muted-foreground mb-4 text-center">Each weed's traits make it dominant in its habitat. Review the reasons:</p>
          <div className="space-y-3">
            {items.map(i => {
              const zoneLabel = ZONES.find(z => z.id === i.zone)?.label;
              return (
                <div key={i.weed.id} className="flex gap-3 items-start p-3 rounded-xl border-2 border-border bg-card">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-secondary shrink-0">
                    <WeedImage weedId={i.weed.id} stage="flower" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm">{i.weed.commonName} <span className="text-xs text-primary">— {zoneLabel}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">{reasonFor(i.weed, i.zone)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={nextRound} className="w-full mt-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            {roundNum + 1 < ROUNDS_PER_LEVEL ? `Round ${roundNum + 2} →` : 'See Results'}
          </button>
        </div>
      </div>
    );
  }

  const allCorrect = checked && bouncedIds.length === 0 && correctCount === items.length;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Habitat Mapping</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Round {roundNum + 1}/{ROUNDS_PER_LEVEL}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-3 text-center">Drag each weed into the habitat it dominates. Wrong placements pop back out.</p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-3">
            {ZONES.map(z => {
              const ZoneIcon = z.Icon;
              const placed = items.filter(i => placements[i.weed.id] === z.id);
              return (
                <div key={z.id}
                  onClick={() => handleDrop(z.id)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(z.id)}
                  className={`rounded-xl border-2 p-4 min-h-[240px] transition-all ${
                    (selected || draggedId) ? 'border-primary bg-primary/5 cursor-pointer hover:bg-primary/10' : 'border-border bg-card'
                  }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <ZoneIcon className="w-6 h-6 text-foreground" />
                    <span className="font-bold text-foreground text-base">{z.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {placed.map(i => {
                      const isWrong = checked && i.zone !== z.id;
                      const isRight = checked && i.zone === z.id;
                      const isBouncing = bouncedIds.includes(i.weed.id);
                      return (
                        <div key={i.weed.id}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all duration-500 ${
                            isBouncing ? 'opacity-0 -translate-y-12 scale-50 border-destructive' :
                            isWrong ? 'border-destructive bg-destructive/10' :
                            isRight ? 'border-green-500 bg-green-500/10' :
                            'border-border bg-secondary'
                          }`}>
                          <div className="w-20 h-20 rounded overflow-hidden bg-muted">
                            <WeedImage weedId={i.weed.id} stage="flower" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs font-medium text-foreground max-w-[88px] text-center leading-tight">{i.weed.commonName}</span>
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
          </div>

          <div className="rounded-xl border-2 border-border bg-card p-3 h-fit md:sticky md:top-4">
            <p className="text-sm font-bold uppercase text-foreground mb-3">Weeds to Sort ({unplaced.length})</p>
            <div className="space-y-2">
              {unplaced.length === 0 && <p className="text-xs text-muted-foreground italic">All placed! Hit "Check Answers".</p>}
              {unplaced.map(i => (
                <button key={i.weed.id}
                  draggable
                  onDragStart={() => setDraggedId(i.weed.id)}
                  onDragEnd={() => setDraggedId(null)}
                  onClick={() => setSelected(selected === i.weed.id ? null : i.weed.id)}
                  className={`flex items-center gap-3 w-full p-2.5 rounded-lg border-2 text-sm font-medium transition-all cursor-grab active:cursor-grabbing ${
                    selected === i.weed.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-foreground hover:border-primary/50'
                  }`}>
                  <div className="w-16 h-16 rounded overflow-hidden bg-muted shrink-0">
                    <WeedImage weedId={i.weed.id} stage="flower" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-left text-sm leading-tight">{i.weed.commonName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-4">
          {allPlaced && !checked && (
            <button onClick={checkAnswers} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
          )}
          {allCorrect && (
            <button onClick={() => setShowReasons(true)} className="w-full py-3 rounded-lg bg-success text-success-foreground font-bold">
              Why? Show me the reasons →
            </button>
          )}
        </div>
      </div>
      <FloatingCoach grade="6-8" tip={`Match each weed to the habitat where its life cycle and seed dispersal succeed best.`} />
    </div>
  );
}
