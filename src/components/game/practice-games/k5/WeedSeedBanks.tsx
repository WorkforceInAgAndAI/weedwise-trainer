import { useState, useMemo, useEffect, useCallback } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import seedBankBg from '@/assets/images/seed-bank-bg.jpg';
import LevelComplete from '@/components/game/LevelComplete';
import { X } from 'lucide-react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const TOTAL_ROUNDS = 3;
const NUM_WEED_TYPES = 6;
const MIN_PER_TYPE = 2;
const MAX_PER_TYPE = 7;
const MAX_SEEDS = 30;

function generateRound(level: number, roundIdx: number) {
  const offset = ((level - 1) * TOTAL_ROUNDS + roundIdx) * NUM_WEED_TYPES;
  const rotated = [...weeds.slice(offset % weeds.length), ...weeds.slice(0, offset % weeds.length)];
  const chosen = shuffle(rotated).slice(0, NUM_WEED_TYPES);
  const seeds: { id: number; weed: typeof weeds[0]; x: number; y: number }[] = [];
  let id = 0;

  let counts: number[] = chosen.map(() => MIN_PER_TYPE + Math.floor(Math.random() * (MAX_PER_TYPE - MIN_PER_TYPE + 1)));
  let total = counts.reduce((a, b) => a + b, 0);
  while (total > MAX_SEEDS) {
    const idx = Math.floor(Math.random() * counts.length);
    if (counts[idx] > MIN_PER_TYPE) { counts[idx]--; total--; }
  }

  const positions: { x: number; y: number }[] = [];
  chosen.forEach((w, wi) => {
    for (let c = 0; c < counts[wi]; c++) {
      let x: number, y: number, attempts = 0;
      do {
        x = 8 + Math.random() * 80;
        y = 12 + Math.random() * 76;
        attempts++;
      } while (attempts < 50 && positions.some(p => Math.abs(p.x - x) < 8 && Math.abs(p.y - y) < 8));
      positions.push({ x, y });
      seeds.push({ id: id++, weed: w, x, y });
    }
  });

  return { seeds: shuffle(seeds), weedTypes: chosen, counts };
}

export default function WeedSeedBanks({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();

  const rounds = useMemo(() => Array.from({ length: TOTAL_ROUNDS }, (_, i) => generateRound(level, i)), [level]);

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'find' | 'sort' | 'summary' | 'predictMost' | 'predictLeast' | 'roundResult' | 'done'>('find');
  const [found, setFound] = useState<Set<number>>(new Set());
  const [timer, setTimer] = useState(30);
  const [findingDone, setFindingDone] = useState(false);
  const [sortPlacements, setSortPlacements] = useState<Record<number, string>>({});
  const [sortChecked, setSortChecked] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState<number | null>(null);
  const [inspectSeed, setInspectSeed] = useState<number | null>(null);
  const [predictMostAnswer, setPredictMostAnswer] = useState<string | null>(null);
  const [predictLeastAnswer, setPredictLeastAnswer] = useState<string | null>(null);
  const [predictMostChecked, setPredictMostChecked] = useState(false);
  const [predictLeastChecked, setPredictLeastChecked] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const currentRound = rounds[round];
  const seeds = currentRound.seeds;
  const totalSeeds = seeds.length;
  const foundSeeds = seeds.filter(s => found.has(s.id));

  const foundCounts = useMemo(() => {
    const map: Record<string, { weed: typeof weeds[0]; count: number }> = {};
    foundSeeds.forEach(s => {
      if (!map[s.weed.id]) map[s.weed.id] = { weed: s.weed, count: 0 };
      map[s.weed.id].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [foundSeeds.length, round]);

  const shuffledPredictionChoices = useMemo(() => shuffle([...foundCounts]), [foundCounts]);

  const weedTypeNames = useMemo(() => {
    return [...new Set(foundSeeds.map(s => s.weed.commonName))].sort();
  }, [foundSeeds.length, round]);

  const mostPrevalent = foundCounts.length > 0 ? foundCounts[0].weed.commonName : '';
  const leastPrevalent = foundCounts.length > 0 ? foundCounts[foundCounts.length - 1].weed.commonName : '';

  const resetRound = useCallback(() => {
    setFound(new Set()); setTimer(30); setFindingDone(false); setPhase('find');
    setSortPlacements({}); setSortChecked(false); setSelectedSeed(null); setInspectSeed(null);
    setPredictMostAnswer(null); setPredictLeastAnswer(null);
    setPredictMostChecked(false); setPredictLeastChecked(false);
  }, []);

  useEffect(() => {
    if (phase !== 'find' || findingDone) return;
    if (timer <= 0) { setFindingDone(true); return; }
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, findingDone, phase]);

  const clickSeed = (id: number) => {
    if (findingDone) return;
    const next = new Set(found);
    next.add(id);
    setFound(next);
    if (next.size === totalSeeds) setFindingDone(true);
  };

  const handleSeedClick = (seedId: number) => {
    if (sortChecked) return;
    // If already selected, open inspect
    if (selectedSeed === seedId) {
      setInspectSeed(seedId);
      return;
    }
    setSelectedSeed(seedId);
  };

  const handleBinClick = (weedName: string) => {
    if (selectedSeed === null || sortChecked) return;
    setSortPlacements(p => ({ ...p, [selectedSeed]: weedName }));
    setSelectedSeed(null);
  };

  const allSorted = Object.keys(sortPlacements).length === foundSeeds.length;
  const sortCorrectCount = sortChecked ? foundSeeds.filter(s => sortPlacements[s.id] === s.weed.commonName).length : 0;

  const handleCheckSort = () => {
    setSortChecked(true);
    const correct = foundSeeds.filter(s => sortPlacements[s.id] === s.weed.commonName).length;
    setTotalScore(s => s + correct);
  };

  const handleCheckMost = () => {
    setPredictMostChecked(true);
    if (predictMostAnswer === mostPrevalent) setTotalScore(s => s + 1);
  };

  const handleCheckLeast = () => {
    setPredictLeastChecked(true);
    if (predictLeastAnswer === leastPrevalent) setTotalScore(s => s + 1);
  };

  const nextRound = () => {
    if (round + 1 >= TOTAL_ROUNDS) setPhase('done');
    else { setRound(r => r + 1); resetRound(); }
  };

  const inspectedSeedData = inspectSeed !== null ? foundSeeds.find(s => s.id === inspectSeed) : null;

  if (phase === 'done') {
    addBadge({ gameId: 'weed-seed-banks', gameName: 'Weed Seed Banks', level: 'K-5', score: totalScore, total: totalScore + 10 });
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">All Rounds Complete!</h2>
          <p className="text-muted-foreground mb-2">Total Score: {totalScore}</p>
          <p className="text-sm text-muted-foreground mb-6">Weed seed banks can hold thousands of seeds in the soil, waiting years to sprout!</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setLevel(l => l + 1); setRound(0); resetRound(); setTotalScore(0); }} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Level</button>
            <button onClick={() => { setLevel(1); setRound(0); resetRound(); setTotalScore(0); }} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Start Over</button>
            <button onClick={onBack} className="px-6 py-3 rounded-lg border border-border text-foreground font-bold">Back to Games</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'roundResult') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Round {round + 1} Complete!</h2>
          <p className="text-muted-foreground mb-1">Most Prevalent: <span className="font-bold text-foreground">{mostPrevalent}</span></p>
          <p className="text-muted-foreground mb-1">Least Prevalent: <span className="font-bold text-foreground">{leastPrevalent}</span></p>
          <p className="text-sm text-muted-foreground mt-3 mb-6">
            {predictMostAnswer === mostPrevalent && predictLeastAnswer === leastPrevalent
              ? 'Great predictions!' : 'Keep observing — seed counts tell us about future weed pressure!'}
          </p>
          <button onClick={nextRound} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            {round + 1 < TOTAL_ROUNDS ? 'Next Round' : 'See Final Results'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'predictLeast') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Predict: Least Prevalent</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">Round {round + 1}/{TOTAL_ROUNDS}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-muted-foreground mb-4 text-center">Which weed will be <span className="font-bold">least</span> prevalent next year?</p>
          <div className="grid gap-2 max-w-sm mx-auto mb-4">
            {shuffledPredictionChoices.map(fc => {
              let cls = 'border-border bg-card text-foreground';
              if (predictLeastChecked && fc.weed.commonName === leastPrevalent) cls = 'border-green-500 bg-green-500/20 text-foreground';
              else if (predictLeastChecked && predictLeastAnswer === fc.weed.commonName && fc.weed.commonName !== leastPrevalent) cls = 'border-destructive bg-destructive/20 text-foreground';
              else if (predictLeastAnswer === fc.weed.commonName) cls = 'border-primary bg-primary/10 text-primary';
              return (
                <button key={fc.weed.id} onClick={() => !predictLeastChecked && setPredictLeastAnswer(fc.weed.commonName)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${cls}`}>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border shadow-sm shrink-0">
                    <WeedImage weedId={fc.weed.id} stage="seed" className="w-full h-full object-cover" />
                  </div>
                  <span className="flex-1 text-left">{fc.weed.commonName}</span>
                </button>
              );
            })}
          </div>
          {predictLeastAnswer && !predictLeastChecked && (
            <button onClick={handleCheckLeast} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Prediction</button>
          )}
          {predictLeastChecked && (
            <div className="text-center mt-3">
              <p className={`font-bold mb-3 ${predictLeastAnswer === leastPrevalent ? 'text-green-500' : 'text-foreground'}`}>
                {predictLeastAnswer === leastPrevalent ? 'Correct!' : `The answer was ${leastPrevalent}`}
              </p>
              <button onClick={() => setPhase('roundResult')} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Continue</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'predictMost') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Predict: Most Prevalent</h1>
          <span className="text-sm text-muted-foreground">Round {round + 1}/{TOTAL_ROUNDS}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-muted-foreground mb-4 text-center">Which weed will be <span className="font-bold">most</span> prevalent next year?</p>
          <div className="grid gap-2 max-w-sm mx-auto mb-4">
            {shuffledPredictionChoices.map(fc => {
              let cls = 'border-border bg-card text-foreground';
              if (predictMostChecked && fc.weed.commonName === mostPrevalent) cls = 'border-green-500 bg-green-500/20 text-foreground';
              else if (predictMostChecked && predictMostAnswer === fc.weed.commonName && fc.weed.commonName !== mostPrevalent) cls = 'border-destructive bg-destructive/20 text-foreground';
              else if (predictMostAnswer === fc.weed.commonName) cls = 'border-primary bg-primary/10 text-primary';
              return (
                <button key={fc.weed.id} onClick={() => !predictMostChecked && setPredictMostAnswer(fc.weed.commonName)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${cls}`}>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border shadow-sm shrink-0">
                    <WeedImage weedId={fc.weed.id} stage="seed" className="w-full h-full object-cover" />
                  </div>
                  <span className="flex-1 text-left">{fc.weed.commonName}</span>
                </button>
              );
            })}
          </div>
          {predictMostAnswer && !predictMostChecked && (
            <button onClick={handleCheckMost} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Prediction</button>
          )}
          {predictMostChecked && (
            <div className="text-center mt-3">
              <p className={`font-bold mb-3 ${predictMostAnswer === mostPrevalent ? 'text-green-500' : 'text-foreground'}`}>
                {predictMostAnswer === mostPrevalent ? 'Correct!' : `The answer was ${mostPrevalent}`}
              </p>
              <button onClick={() => setPhase('predictLeast')} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next: Predict Least Prevalent</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'summary') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Seed Bank Summary</h1>
          <span className="text-sm text-muted-foreground">Round {round + 1}/{TOTAL_ROUNDS}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-muted-foreground mb-4 text-center">Here's what you found:</p>
          <div className="grid gap-2 max-w-sm mx-auto mb-6">
            {foundCounts.map(fc => (
              <div key={fc.weed.id} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border shadow-sm shrink-0">
                  <WeedImage weedId={fc.weed.id} stage="seed" className="w-full h-full object-cover" />
                </div>
                <span className="flex-1 font-medium text-foreground text-sm">{fc.weed.commonName}</span>
                <span className="text-primary font-bold">{fc.count} seeds</span>
              </div>
            ))}
          </div>
          <button onClick={() => setPhase('predictMost')} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            Make Predictions
          </button>
        </div>
      </div>
    );
  }

  // Sorting phase — COLUMN layout
  if (phase === 'sort') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Sort Your Seeds</h1>
          <span className="text-sm text-muted-foreground">Round {round + 1}/{TOTAL_ROUNDS}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-muted-foreground mb-4 text-center">Sort the seeds you found by weed type. Need a hint? Click on the seed image.</p>

          {/* Seed inspect popup */}
          {inspectedSeedData && (
            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setInspectSeed(null)}>
              <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-foreground">Seed Hint</h3>
                  <button onClick={() => setInspectSeed(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden border-2 border-border bg-secondary mb-3">
                  <WeedImage weedId={inspectedSeedData.weed.id} stage="seed" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-foreground text-center mb-1 font-medium">
                  {inspectedSeedData.weed.plantType} — {inspectedSeedData.weed.lifeCycle}
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  {inspectedSeedData.weed.traits[0]}
                </p>
              </div>
            </div>
          )}

          {/* Column layout for weed bins */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {weedTypeNames.map(name => (
              <button key={name} onClick={() => handleBinClick(name)}
                className={`rounded-xl border-2 border-border p-3 text-center transition-all flex flex-col items-center min-h-[100px] ${selectedSeed !== null ? 'hover:bg-secondary cursor-pointer' : ''}`}>
                <span className="font-bold text-foreground text-xs mb-2">{name}</span>
                <div className="flex flex-col gap-1 w-full">
                  {foundSeeds.filter(s => sortPlacements[s.id] === name).map(s => (
                    <span key={s.id} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      sortChecked ? (s.weed.commonName === name ? 'bg-green-500/20 text-green-700' : 'bg-destructive/20 text-destructive') : 'bg-secondary text-foreground'
                    }`}>
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-border shadow-sm">
                        <WeedImage weedId={s.weed.id} stage="seed" className="w-full h-full object-cover" />
                      </div>
                      Seed
                      {!sortChecked && <button onClick={(e) => { e.stopPropagation(); setSortPlacements(p => { const n = { ...p }; delete n[s.id]; return n; }); }} className="ml-1 text-muted-foreground hover:text-foreground">×</button>}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
          {foundSeeds.filter(s => sortPlacements[s.id] === undefined).length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {foundSeeds.filter(s => sortPlacements[s.id] === undefined).map(s => (
                <button key={s.id} onClick={() => handleSeedClick(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedSeed === s.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'
                  }`}>
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-border shadow-sm">
                    <WeedImage weedId={s.weed.id} stage="seed" className="w-full h-full object-cover" />
                  </div>
                  Seed #{s.id + 1}
                </button>
              ))}
            </div>
          )}
          {allSorted && !sortChecked && (
            <button onClick={handleCheckSort} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Sorting</button>
          )}
          {sortChecked && (
            <div className="text-center mt-4">
              <p className={`text-lg font-bold mb-3 ${sortCorrectCount === foundSeeds.length ? 'text-green-500' : 'text-foreground'}`}>
                {sortCorrectCount}/{foundSeeds.length} sorted correctly!
              </p>
              <button onClick={() => setPhase('summary')} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">See Summary</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Finding phase
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Weed Seed Banks</h1>
        <span className="text-sm text-muted-foreground">Round {round + 1}/{TOTAL_ROUNDS}</span>
        <span className={`text-sm font-bold ${timer <= 5 ? 'text-destructive' : 'text-foreground'}`}>{timer}s</span>
        <span className="text-sm text-primary font-bold ml-2">{found.size}/{totalSeeds}</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        {!findingDone ? (
          <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border-2 border-border">
            <img src={seedBankBg} alt="Soil with seeds" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10" />
            <p className="absolute top-2 left-0 right-0 text-center text-xs text-white/90 font-medium z-10 drop-shadow">Tap the seeds you find!</p>
            {seeds.map(s => (
              <button key={s.id} onClick={() => clickSeed(s.id)}
                className={`absolute transition-all duration-300 z-10 ${found.has(s.id) ? 'scale-75 opacity-40' : 'hover:scale-125'}`}
                style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%,-50%)' }}>
                <div className={`w-12 h-12 rounded-full overflow-hidden shadow-lg ${found.has(s.id) ? 'border-2 border-green-500 opacity-60' : 'border-2 border-border'}`}>
                  <WeedImage weedId={s.weed.id} stage="seed" className="w-full h-full object-cover" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">{found.size === totalSeeds ? 'All Seeds Found!' : "Time's Up!"}</h2>
            <p className="text-muted-foreground mb-6">You found {found.size} of {totalSeeds} seeds. Now sort them by weed type!</p>
            <button onClick={() => setPhase('sort')} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Sort Seeds</button>
          </div>
        )}
      </div>
    </div>
  );
}
