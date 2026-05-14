import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { Sun, Thermometer, Droplets, Wind, X } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const ZONES = [
  { id: 'temperate', label: 'Temperate', Icon: Sun },
  { id: 'arid', label: 'Arid / Dry', Icon: Wind },
  { id: 'tropical', label: 'Tropical / Warm', Icon: Thermometer },
  { id: 'wetland', label: 'Wetland / Riparian', Icon: Droplets },
];

function getZone(w: typeof weeds[0]): string {
  const t = `${w.habitat} ${w.primaryHabitat}`.toLowerCase();
  if (t.match(/wet|moist|water|flood|river|aquatic|bottom|marsh/)) return 'wetland';
  if (t.match(/dry|arid|drought|sandy|desert/)) return 'arid';
  if (t.match(/warm|trop|hot|summer|full sun/)) return 'tropical';
  return 'temperate';
}

function getZoneLabel(zoneId: string): string {
  return ZONES.find(z => z.id === zoneId)?.label ?? zoneId;
}

const ROUNDS_PER_LEVEL = 3;
const WEEDS_PER_ROUND = 4;

function getItemsForRound(level: number, roundNum: number) {
  const byZone: Record<string, typeof weeds> = { temperate: [], arid: [], tropical: [], wetland: [] };
  weeds.forEach(w => byZone[getZone(w)].push(w));
  const offset = ((level - 1) * ROUNDS_PER_LEVEL + roundNum) * WEEDS_PER_ROUND;
  const picks: { weed: typeof weeds[0]; zone: string }[] = [];
  for (const z of ZONES) {
    const pool = byZone[z.id];
    if (pool.length === 0) continue;
    const idx = offset % pool.length;
    const rotated = shuffle([...pool.slice(idx), ...pool.slice(0, idx)]);
    picks.push({ weed: rotated[0], zone: z.id });
  }
  return shuffle(picks);
}

export default function HabitatMapping({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const [roundNum, setRoundNum] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showReview, setShowReview] = useState(false);

  const items = useMemo(() => getItemsForRound(level, roundNum), [level, roundNum]);

  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const unplaced = items.filter(i => !placements[i.weed.id]);
  const allPlaced = Object.keys(placements).length === items.length;
  const correctCount = checked ? items.filter(i => placements[i.weed.id] === i.zone).length : 0;
  const done = roundNum >= ROUNDS_PER_LEVEL;

  const handleZone = (zoneId: string) => {
    if (!selected || checked) return;
    setPlacements(p => ({ ...p, [selected]: zoneId }));
    setSelected(null);
  };

  const handleRemove = (weedId: string) => {
    if (checked) return;
    setPlacements(p => { const n = { ...p }; delete n[weedId]; return n; });
  };

  const checkAnswers = () => {
    setChecked(true);
    const correct = items.filter(i => placements[i.weed.id] === i.zone).length;
    setRoundScore(correct);
    if (correct < items.length) setShowReview(true);
  };

  const nextRound = () => {
    setTotalScore(s => s + roundScore);
    setRoundNum(r => r + 1);
    setPlacements({});
    setSelected(null);
    setChecked(false);
    setRoundScore(0);
    setShowReview(false);
  };

  const restart = () => {
    setRoundNum(0); setPlacements({}); setSelected(null); setChecked(false); setRoundScore(0); setTotalScore(0); setShowReview(false);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    const total = ROUNDS_PER_LEVEL * WEEDS_PER_ROUND;
    return <LevelComplete level={level} score={totalScore} total={total} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;
  }

  if (showReview && checked) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Habitat Mapping — Review</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-lg font-bold text-center mb-1 text-foreground">{correctCount}/{items.length} correct</p>
          <p className="text-sm text-muted-foreground text-center mb-4">Here are the correct habitats:</p>
          <div className="grid gap-3 max-w-md mx-auto mb-6">
            {items.map(i => {
              const userZone = placements[i.weed.id];
              const isCorrect = userZone === i.zone;
              return (
                <div key={i.weed.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10'}`}>
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-secondary shrink-0">
                    <WeedImage weedId={i.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm">{i.weed.commonName}</p>
                    {!isCorrect && <p className="text-xs text-destructive">Your answer: {getZoneLabel(userZone)}</p>}
                    <p className={`text-xs ${isCorrect ? 'text-green-600' : 'text-foreground'}`}>Correct: {getZoneLabel(i.zone)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <button onClick={nextRound} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
              {roundNum + 1 < ROUNDS_PER_LEVEL ? `Round ${roundNum + 2}` : 'See Results'}
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
        <h1 className="font-bold text-foreground text-lg flex-1">Habitat Mapping</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Round {roundNum + 1}/{ROUNDS_PER_LEVEL}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-3 text-center">Place each weed in its correct habitat region</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {ZONES.map(z => {
            const ZoneIcon = z.Icon;
            return (
              <button key={z.id} onClick={() => handleZone(z.id)}
                className={`rounded-xl border-2 border-border p-3 bg-card text-left transition-all ${selected ? 'hover:scale-[1.02] cursor-pointer hover:border-primary' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <ZoneIcon className="w-5 h-5 text-foreground" />
                  <span className="font-bold text-foreground text-sm">{z.label}</span>
                </div>
                <div className="space-y-1 min-h-[40px]">
                  {items.filter(i => placements[i.weed.id] === z.id).map(i => (
                    <div key={i.weed.id} className={`flex items-center gap-1 px-2 py-1 rounded bg-background/80 text-xs font-medium ${
                      checked ? (i.zone === z.id ? 'text-green-500' : 'text-destructive') : 'text-foreground'
                    }`}>
                      <span className="truncate flex-1">{i.weed.commonName}</span>
                      {!checked && (
                        <button onClick={e => { e.stopPropagation(); handleRemove(i.weed.id); }} className="text-muted-foreground hover:text-foreground">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
        {unplaced.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {unplaced.map(i => (
              <button key={i.weed.id} onClick={() => setSelected(selected === i.weed.id ? null : i.weed.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selected === i.weed.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}>
                <div className="w-8 h-8 rounded overflow-hidden bg-secondary">
                  <WeedImage weedId={i.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                </div>
                {i.weed.commonName}
              </button>
            ))}
          </div>
        )}
        {allPlaced && !checked && (
          <button onClick={checkAnswers} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
        )}
        {checked && !showReview && (
          <div className="text-center mt-4">
            <p className="text-lg font-bold mb-3 text-green-500">{correctCount}/{items.length} correct!</p>
            <button onClick={nextRound} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
              {roundNum + 1 < ROUNDS_PER_LEVEL ? `Round ${roundNum + 2}` : 'See Results'}
            </button>
          </div>
        )}
      </div>
          <FloatingCoach grade="6-8" tip={`Match each weed to the habitat where its life cycle and seed dispersal succeed best.`} />
</div>
  );
}
