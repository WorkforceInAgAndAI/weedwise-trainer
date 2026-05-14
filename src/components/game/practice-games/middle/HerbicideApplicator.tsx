import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import soybeanBg from '@/assets/images/soybean_field_1.jpg';
import { Droplets, AlertTriangle, TrendingUp } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import { resolveInjuryImage } from '@/lib/imageMap';
import {
  HERBICIDE_MOA,
  getMiddleSchoolMOAs,
  pickDistinctDistractors,
  getBestMOAForWeed,
  type HerbicideMOA,
} from '@/data/herbicides';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const RATE_LEVELS = [
  { id: 'low', label: 'Low (0.5x)', factor: 0.5, desc: 'Cheaper but higher resistance risk' },
  { id: 'standard', label: 'Standard (1x)', factor: 1.0, desc: 'Label rate' },
  { id: 'high', label: 'High (1.5x)', factor: 1.5, desc: 'Max control but expensive' },
];

function resistanceRate(moa: HerbicideMOA): number {
  const map: Record<string, number> = { 'Very high': 0.5, 'High': 0.4, 'Moderate': 0.25, 'Low-moderate': 0.15, 'Low': 0.1, 'None reported': 0.02 };
  return map[moa.resistanceLevel] ?? 0.2;
}

interface SprayRound {
  weed: typeof weeds[0];
  x: number;
  y: number;
  resistanceLevel: number;
}

export default function HerbicideApplicator({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();

  const msPool = useMemo(() => getMiddleSchoolMOAs(), []);

  const fieldItems = useMemo(() => {
    const pool = shuffle(weeds);
    const offset = ((level - 1) * 6) % pool.length;
    return pool.slice(offset).concat(pool).slice(0, 6).map((w, i) => ({
      weed: w,
      x: 12 + (i % 3) * 30 + Math.random() * 10,
      y: 15 + Math.floor(i / 3) * 40 + Math.random() * 15,
      resistanceLevel: 0,
    }));
  }, [level]);

  const [sprayRound, setSprayRound] = useState(1);
  const [items, setItems] = useState<SprayRound[]>(fieldItems);
  const [selectedWeed, setSelectedWeed] = useState<number | null>(null);
  const [selectedHerb, setSelectedHerb] = useState<string | null>(null);
  const [selectedRate, setSelectedRate] = useState<string | null>(null);
  const [roundResults, setRoundResults] = useState<{ weedName: string; killed: boolean; resistanceGain: number; moaLabel: string; group: number; plantType: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  useMemo(() => setItems(fieldItems), [fieldItems]);

  const MAX_ROUNDS = 3;
  const done = sprayRound > MAX_ROUNDS;

  // Build MOA options for selected weed (no two share symptom type)
  const herbOptions = useMemo(() => {
    if (selectedWeed === null) return msPool;
    const bestId = getBestMOAForWeed(items[selectedWeed].weed);
    const bestMOA = HERBICIDE_MOA.find(h => h.id === bestId) ?? msPool[0];
    const distractors = pickDistinctDistractors(bestMOA, msPool, 3);
    return shuffle([bestMOA, ...distractors]);
  }, [selectedWeed, items, msPool]);

  const applyHerbicide = () => {
    if (selectedWeed === null || !selectedHerb || !selectedRate) return;
    const weed = items[selectedWeed];
    const herb = HERBICIDE_MOA.find(h => h.id === selectedHerb)!;
    const rate = RATE_LEVELS.find(r => r.id === selectedRate)!;
    const rr = resistanceRate(herb);

    const baseKill = rate.factor * (1 - weed.resistanceLevel * 0.3);
    const killed = baseKill > 0.6 + Math.random() * 0.3;
    const resistanceGain = rr * (1 / rate.factor) * 0.3;

    setRoundResults(prev => [...prev, {
      weedName: weed.weed.commonName,
      killed,
      resistanceGain,
      moaLabel: `${herb.moa} (Group ${herb.group}) — e.g. ${herb.brands[0]}`,
      group: herb.group,
      plantType: weed.weed.plantType,
    }]);
    if (killed) setTotalScore(s => s + 1);

    setItems(prev => prev.map((it, i) => i === selectedWeed ? {
      ...it, resistanceLevel: Math.min(1, it.resistanceLevel + resistanceGain),
    } : it));

    setSelectedWeed(null);
    setSelectedHerb(null);
    setSelectedRate(null);
  };

  const finishRound = () => setShowResults(true);

  const nextRound = () => {
    setShowResults(false);
    setRoundResults([]);
    setItems(prev => prev.map(it => ({
      ...it,
      x: 12 + Math.random() * 70,
      y: 15 + Math.random() * 70,
    })));
    setSprayRound(r => r + 1);
  };

  const restart = () => {
    setSprayRound(1);
    setItems(fieldItems);
    setSelectedWeed(null);
    setSelectedHerb(null);
    setSelectedRate(null);
    setRoundResults([]);
    setShowResults(false);
    setTotalScore(0);
  };
  const nextLevelFn = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    addBadge({ gameId: 'herbicide-applicator', gameName: 'Herbicide Resistance', level: 'MS', score: totalScore, total: items.length * MAX_ROUNDS });
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <Droplets className="w-10 h-10 text-primary mb-3" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Season Complete!</h2>
        <p className="text-lg text-foreground mb-2">{totalScore} weeds controlled over {MAX_ROUNDS} spray rounds</p>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">
          {totalScore >= items.length * MAX_ROUNDS * 0.7
            ? 'Excellent resistance management! Rotating modes of action and using proper rates kept resistance low.'
            : 'Some weeds developed resistance. Try rotating herbicide modes of action and using label rates next time.'}
        </p>
        <LevelComplete level={level} score={totalScore} total={items.length * MAX_ROUNDS} onNextLevel={nextLevelFn} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="font-bold text-xl text-foreground mb-4">Spray Round {sprayRound} Results</h2>
        <div className="w-full max-w-md space-y-2 mb-4">
          {roundResults.map((r, i) => (
            <div key={i} className={`p-3 rounded-lg border-2 ${r.killed ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10'}`}>
              <div className="flex gap-3">
                {(() => {
                  const type: 'br' | 'gr' = r.plantType === 'Monocot' ? 'gr' : 'br';
                  const url = resolveInjuryImage(r.group, type);
                  return url ? (
                    <img src={url} alt={`Group ${r.group} injury`} className="w-16 h-16 object-cover rounded-md border border-border flex-shrink-0" />
                  ) : null;
                })()}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{r.weedName}</span>
                    <span className={`text-xs font-bold ${r.killed ? 'text-green-600' : 'text-destructive'}`}>{r.killed ? 'Controlled' : 'Survived'}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{r.moaLabel}</p>
                </div>
              </div>
              {r.resistanceGain > 0.1 && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] text-amber-600">Resistance building ({Math.round(r.resistanceGain * 100)}% increase)</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-xl p-4 max-w-md w-full mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">Resistance Status</span>
          </div>
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-1">
              <span className="flex-1">{it.weed.commonName}</span>
              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-destructive rounded-full transition-all" style={{ width: `${it.resistanceLevel * 100}%` }} />
              </div>
              <span className="w-8 text-right">{Math.round(it.resistanceLevel * 100)}%</span>
            </div>
          ))}
        </div>
        <button onClick={nextRound} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
          {sprayRound < MAX_ROUNDS ? `Spray Round ${sprayRound + 1}` : 'See Final Results'}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Herbicide Resistance</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Round {sprayRound}/{MAX_ROUNDS}</span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          <img src={soybeanBg} alt="Soybean Field" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
          {items.map((item, i) => (
            <button key={i} onClick={() => setSelectedWeed(i)}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${selectedWeed === i ? 'scale-125' : 'animate-pulse'}`}>
              <div className={`w-14 h-14 rounded-full overflow-hidden border-[3px] shadow-lg ${
                item.resistanceLevel > 0.5 ? 'border-destructive' : item.resistanceLevel > 0.2 ? 'border-amber-400' : 'border-white/80'
              }`}>
                <WeedImage weedId={item.weed.id} stage="vegetative" className="w-full h-full object-cover" />
              </div>
            </button>
          ))}
        </div>
        <div className="w-64 bg-card border-l border-border overflow-y-auto p-3 flex flex-col gap-3">
          {selectedWeed !== null ? (
            <>
              <p className="font-bold text-foreground text-sm">{items[selectedWeed].weed.commonName}</p>
              <p className="text-xs text-muted-foreground">Resistance: {Math.round(items[selectedWeed].resistanceLevel * 100)}%</p>
              <p className="text-xs font-bold text-foreground">Mode of Action:</p>
              <div className="flex flex-col gap-1">
                {herbOptions.map(h => (
                  <button key={h.id} onClick={() => setSelectedHerb(h.id)}
                    className={`p-2 rounded-lg border-2 text-xs text-left ${selectedHerb === h.id ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}>
                    <span className="font-bold block">{h.moa} (Group {h.group})</span>
                    <span className="text-[10px] text-muted-foreground">e.g. {h.brands[0]}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-foreground">Rate:</p>
              <div className="flex flex-col gap-1">
                {RATE_LEVELS.map(r => (
                  <button key={r.id} onClick={() => setSelectedRate(r.id)}
                    className={`p-2 rounded-lg border-2 text-xs text-left ${selectedRate === r.id ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}>
                    <span className="font-bold block">{r.label}</span>
                    <span className="text-[10px] text-muted-foreground">{r.desc}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2 mt-auto">
                <button onClick={applyHerbicide} disabled={!selectedHerb || !selectedRate}
                  className="py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50">Apply</button>
                <button onClick={finishRound} className="py-2 rounded-lg bg-secondary text-foreground font-bold text-sm">End Round</button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
              <p className="text-sm text-muted-foreground">Tap a weed in the field to select a mode of action and rate.</p>
              <button onClick={finishRound} className="mt-4 w-full py-2 rounded-lg bg-secondary text-foreground font-bold text-sm">End Spray Round</button>
            </div>
          )}
        </div>
      </div>
          <FloatingCoach grade="6-8" tip={`Pick a herbicide whose mode of action matches the weed's life cycle and growth stage.`} />
</div>
  );
}
