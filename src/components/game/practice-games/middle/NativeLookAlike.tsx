import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

type Pair = { native: typeof weeds[0]; introduced: typeof weeds[0] };

function buildPairPool(): Pair[] {
  const result: Pair[] = [];
  const usedIds = new Set<string>();
  const natives = shuffle(weeds.filter(w => w.origin === 'Native' && w.lookAlike));
  for (const n of natives) {
    const match = weeds.find(w => w.id === n.lookAlike.id && w.origin === 'Introduced');
    if (match && !usedIds.has(n.id) && !usedIds.has(match.id)) {
      result.push({ native: n, introduced: match });
      usedIds.add(n.id);
      usedIds.add(match.id);
    }
  }
  // fill from same-family matches
  const families = shuffle([...new Set(weeds.map(w => w.family))]);
  for (const fam of families) {
    const nats = weeds.filter(w => w.family === fam && w.origin === 'Native' && !usedIds.has(w.id));
    const intros = weeds.filter(w => w.family === fam && w.origin === 'Introduced' && !usedIds.has(w.id));
    for (let i = 0; i < Math.min(nats.length, intros.length); i++) {
      result.push({ native: nats[i], introduced: intros[i] });
      usedIds.add(nats[i].id);
      usedIds.add(intros[i].id);
    }
  }
  return result;
}

const PAIRS_PER_ROUND = 3;
const TOTAL_ROUNDS = 10;

export default function NativeLookAlike({ onBack }: { onBack: () => void }) {
  const allPairs = useMemo(() => shuffle(buildPairPool()), []);

  // Build rounds of 3 pairs each, cycling if needed
  const rounds = useMemo(() => {
    const r: Pair[][] = [];
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const start = (i * PAIRS_PER_ROUND) % allPairs.length;
      const roundPairs: Pair[] = [];
      for (let j = 0; j < PAIRS_PER_ROUND; j++) {
        roundPairs.push(allPairs[(start + j) % allPairs.length]);
      }
      r.push(roundPairs);
    }
    return r;
  }, [allPairs]);

  const [round, setRound] = useState(0);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [placements, setPlacements] = useState<Record<string, 'native' | 'introduced'>>({});
  const [selectedWeed, setSelectedWeed] = useState<string | null>(null);

  const done = round >= TOTAL_ROUNDS;
  const currentPairs = !done ? rounds[round] : [];
  const allWeedsInRound = useMemo(() =>
    currentPairs.flatMap(p => shuffle([p.native, p.introduced])),
    [round, done]
  );
  const totalInRound = currentPairs.length * 2;
  const allPlaced = Object.keys(placements).length === totalInRound;
  const unplaced = allWeedsInRound.filter(w => !placements[w.id]);

  const handleDrop = (zone: 'native' | 'introduced') => {
    if (!selectedWeed || checked) return;
    setPlacements(p => ({ ...p, [selectedWeed]: zone }));
    setSelectedWeed(null);
  };

  const handleRemove = (weedId: string) => {
    if (checked) return;
    setPlacements(p => { const n = { ...p }; delete n[weedId]; return n; });
  };

  const checkAnswers = () => {
    setChecked(true);
    let correct = 0;
    for (const pair of currentPairs) {
      if (placements[pair.native.id] === 'native' && placements[pair.introduced.id] === 'introduced') {
        correct++;
      }
    }
    setScore(s => s + correct);
  };

  const next = () => {
    setRound(r => r + 1);
    setChecked(false);
    setPlacements({});
    setSelectedWeed(null);
  };

  const restart = () => { setRound(0); setScore(0); setChecked(false); setPlacements({}); setSelectedWeed(null); };

  const totalPossible = TOTAL_ROUNDS * PAIRS_PER_ROUND;

  if (done) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Challenge Complete!</h2>
        <p className="text-lg text-foreground mb-6">{score}/{totalPossible} pairs correct</p>
        <div className="flex gap-3">
          <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Native vs. Introduced</h1>
        <span className="text-sm text-muted-foreground">Round {round + 1}/{TOTAL_ROUNDS}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <p className="text-sm text-muted-foreground text-center">Sort each look-alike pair into Native or Introduced</p>

        {/* Show each pair in its own row */}
        {currentPairs.map((pair, pairIdx) => {
          const pairWeeds = allWeedsInRound.filter(w => w.id === pair.native.id || w.id === pair.introduced.id);
          const isCorrectZone = (weed: typeof weeds[0], zone: 'native' | 'introduced') =>
            zone === 'native' ? weed.origin === 'Native' : weed.origin === 'Introduced';
          return (
            <div key={pairIdx} className="border border-border rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Pair {pairIdx + 1}: {pair.native.family} family</p>
              <div className="flex gap-3">
                {/* Unplaced from this pair */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {pairWeeds.filter(w => !placements[w.id]).map(w => (
                    <button key={w.id} onClick={() => setSelectedWeed(selectedWeed === w.id ? null : w.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                        selectedWeed === w.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
                      }`}>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{w.commonName}</span>
                    </button>
                  ))}
                </div>
                {/* Drop zones for this pair */}
                <div className="flex gap-2 flex-1">
                  {(['native', 'introduced'] as const).map(zone => {
                    const placed = pairWeeds.filter(w => placements[w.id] === zone);
                    return (
                      <button key={zone} onClick={() => handleDrop(zone)}
                        className={`flex-1 rounded-lg border-2 p-2 min-h-[60px] transition-all ${
                          selectedWeed && pairWeeds.some(w => w.id === selectedWeed) ? 'border-primary bg-primary/5 cursor-pointer' : 'border-border bg-card'
                        }`}>
                        <p className="text-xs font-bold text-foreground text-center mb-1 capitalize">{zone}</p>
                        {placed.map(w => (
                          <div key={w.id} className={`flex items-center gap-1 p-1 rounded ${
                            checked ? (isCorrectZone(w, zone) ? 'bg-green-500/20' : 'bg-destructive/20') : 'bg-secondary'
                          }`}>
                            <div className="w-8 h-8 rounded overflow-hidden bg-secondary flex-shrink-0">
                              <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-medium text-foreground flex-1 truncate">{w.commonName}</span>
                            {!checked && (
                              <button onClick={e => { e.stopPropagation(); handleRemove(w.id); }} className="text-muted-foreground text-xs">x</button>
                            )}
                          </div>
                        ))}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {allPlaced && !checked && (
          <button onClick={checkAnswers} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold mx-auto">Check Answers</button>
        )}

        {checked && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {currentPairs.map((p, i) => {
                const ok = placements[p.native.id] === 'native' && placements[p.introduced.id] === 'introduced';
                return <span key={i} className={`block ${ok ? 'text-green-500' : 'text-destructive'}`}>
                  {p.native.commonName} (Native) / {p.introduced.commonName} (Introduced) — {ok ? 'Correct' : 'Incorrect'}
                </span>;
              })}
            </p>
            <button onClick={next} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Round →</button>
          </div>
        )}
      </div>
    </div>
  );
}
