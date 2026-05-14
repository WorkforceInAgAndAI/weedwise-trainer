import { useState, useMemo, useEffect } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { Sun, Thermometer, Droplets, Wind } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const ZONES = [
  { id: 'hot', label: 'Hot & Sunny', Icon: Sun },
  { id: 'cold', label: 'Cool & Temperate', Icon: Thermometer },
  { id: 'wet', label: 'Wet & Moist', Icon: Droplets },
  { id: 'dry', label: 'Dry & Arid', Icon: Wind },
];

function getZone(w: typeof weeds[0]): string {
  const text = `${w.habitat} ${w.primaryHabitat}`.toLowerCase();
  if (text.match(/wet|moist|water|flood|river|aquatic|bottom/)) return 'wet';
  if (text.match(/dry|arid|drought|sandy/)) return 'dry';
  if (text.match(/cool|cold|temperate|winter/)) return 'cold';
  return 'hot';
}

function reasonFor(w: typeof weeds[0], zone: string): string {
  const name = w.commonName;
  switch (zone) {
    case 'wet':
      return `${name} thrives in soggy soil because its roots can survive standing water and low oxygen — it often grows in flooded fields, ditches, and riverbanks.`;
    case 'dry':
      return `${name} survives where water is scarce thanks to deep roots, waxy leaves, or tough seed coats that hold moisture in.`;
    case 'cold':
      return `${name} handles cooler temperatures because it can germinate in early spring or fall and tolerates frost better than most weeds.`;
    case 'hot':
    default:
      return `${name} loves heat and full sun — it grows fastest during warm summer months in open fields and disturbed soils.`;
  }
}

const ROUNDS_PER_LEVEL = 3;
const WEEDS_PER_ROUND = 8;

function getItemsForRound(level: number, roundNum: number) {
  const byZone: Record<string, typeof weeds> = { hot: [], cold: [], wet: [], dry: [] };
  weeds.forEach(w => byZone[getZone(w)].push(w));
  const offset = ((level - 1) * ROUNDS_PER_LEVEL + roundNum) * 2;
  const picks: { weed: typeof weeds[0]; zone: string }[] = [];
  // 2 from each zone => 8 species per round
  for (const z of ZONES) {
    const pool = byZone[z.id];
    if (pool.length === 0) continue;
    const idx = offset % pool.length;
    const rotated = shuffle([...pool.slice(idx), ...pool.slice(0, idx)]);
    rotated.slice(0, 2).forEach(w => picks.push({ weed: w, zone: z.id }));
  }
  return shuffle(picks);
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function HabitatMapping({ onBack, gradeLabel }: Props) {
  const { addBadge } = useGameProgress();
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
  const [farmerMsg, setFarmerMsg] = useState<{ tone: 'intro'|'correct'|'wrong'|'hint'; text: string }>({
    tone: 'intro',
    text: `Howdy! Drag each weed to the habitat where it grows best — Hot, Cool, Wet, or Dry. If a weed pops back out, that means it's in the wrong spot!`,
  });

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
    if (wrong.length === 0) {
      setFarmerMsg({ tone: 'correct', text: `All ${items.length} weeds in the right habitat! Tap "Why?" to see why each plant lives where it does.` });
    } else {
      const ex = items.find(i => i.weed.id === wrong[0])!;
      setFarmerMsg({
        tone: 'wrong',
        text: `${wrong.length} weed${wrong.length === 1 ? '' : 's'} popped back out — wrong habitat! Hint: ${ex.weed.commonName} grows best in ${ZONES.find(z => z.id === ex.zone)?.label.toLowerCase()} places.`,
      });
      setBouncedIds(wrong);
    }
  };

  // Bounce wrong placements back to the unplaced panel.
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
    setFarmerMsg({ tone: 'intro', text: `New round, new weeds! Same idea — pick the habitat each one likes best.` });
  };

  const restart = () => {
    setRoundNum(0); setTotalScore(0); setPlacements({}); setSelected(null); setChecked(false); setShowReasons(false); setBouncedIds([]);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    const total = ROUNDS_PER_LEVEL * WEEDS_PER_ROUND;
    addBadge({ gameId: 'habitat-mapping-k5', gameName: 'Habitat Mapping', level: 'K-5', score: totalScore, total });
    return <LevelComplete level={level} score={totalScore} total={total} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;
  }

  // Reasons screen — explains WHY each weed lives where it does.
  if (showReasons) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Why these habitats?</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
          <FarmerGuide gradeLabel={gradeLabel} tone="cheer" message="Here's the reason each weed grows best in its habitat — these traits are why!" className="mb-4" />
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
        <FarmerGuide gradeLabel={gradeLabel} tone={farmerMsg.tone} message={farmerMsg.text} className="mb-4 max-w-3xl mx-auto" />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-4 max-w-5xl mx-auto">
          {/* Habitat bins */}
          <div className="grid grid-cols-2 gap-3">
            {ZONES.map(z => {
              const ZoneIcon = z.Icon;
              const placed = items.filter(i => placements[i.weed.id] === z.id);
              return (
                <div key={z.id}
                  onClick={() => handleDrop(z.id)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(z.id)}
                  className={`rounded-xl border-2 p-3 min-h-[180px] transition-all ${
                    (selected || draggedId) ? 'border-primary bg-primary/5 cursor-pointer hover:bg-primary/10' : 'border-border bg-card'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <ZoneIcon className="w-5 h-5 text-foreground" />
                    <span className="font-bold text-foreground text-sm">{z.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {placed.map(i => {
                      const isWrong = checked && i.zone !== z.id;
                      const isRight = checked && i.zone === z.id;
                      const isBouncing = bouncedIds.includes(i.weed.id);
                      return (
                        <div key={i.weed.id}
                          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border-2 transition-all duration-500 ${
                            isBouncing ? 'opacity-0 -translate-y-12 scale-50 border-destructive' :
                            isWrong ? 'border-destructive bg-destructive/10' :
                            isRight ? 'border-green-500 bg-green-500/10' :
                            'border-border bg-secondary'
                          }`}>
                          <div className="w-14 h-14 rounded overflow-hidden bg-muted">
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

          {/* Right side panel */}
          <div className="rounded-xl border-2 border-border bg-card p-3 h-fit md:sticky md:top-4">
            <p className="text-xs font-bold uppercase text-foreground mb-3">Weeds to Sort ({unplaced.length})</p>
            <div className="space-y-2">
              {unplaced.length === 0 && (
                <p className="text-xs text-muted-foreground italic">All placed! Hit "Check Answers".</p>
              )}
              {unplaced.map(i => (
                <button key={i.weed.id}
                  draggable
                  onDragStart={() => setDraggedId(i.weed.id)}
                  onDragEnd={() => setDraggedId(null)}
                  onClick={() => setSelected(selected === i.weed.id ? null : i.weed.id)}
                  className={`flex items-center gap-2 w-full p-2 rounded-lg border-2 text-sm font-medium transition-all cursor-grab active:cursor-grabbing ${
                    selected === i.weed.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-foreground hover:border-primary/50'
                  }`}>
                  <div className="w-12 h-12 rounded overflow-hidden bg-muted shrink-0">
                    <WeedImage weedId={i.weed.id} stage="flower" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-left text-xs leading-tight">{i.weed.commonName}</span>
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
    </div>
  );
}