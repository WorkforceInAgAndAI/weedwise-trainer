import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

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

const QUESTIONS_PER_LEVEL = 5;

function getPairsForLevel(level: number, allPairs: Pair[]): Pair[] {
  const offset = (level - 1) * QUESTIONS_PER_LEVEL;
  const rotated = [...allPairs.slice(offset % allPairs.length), ...allPairs.slice(0, offset % allPairs.length)];
  return shuffle(rotated).slice(0, QUESTIONS_PER_LEVEL);
}

export default function NativeLookAlike({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const allPairs = useMemo(() => shuffle(buildPairPool()), []);
  const levelPairs = useMemo(() => getPairsForLevel(level, allPairs), [level, allPairs]);

  const [round, setRound] = useState(0);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [placements, setPlacements] = useState<Record<string, 'native' | 'introduced'>>({});
  const [selectedWeed, setSelectedWeed] = useState<string | null>(null);

  const done = round >= levelPairs.length;
  const currentPair = !done ? levelPairs[round] : null;
  const pairWeeds = useMemo(() =>
    currentPair ? shuffle([currentPair.native, currentPair.introduced]) : [],
    [round, done]
  );
  const totalInRound = 2;
  const allPlaced = Object.keys(placements).length === totalInRound;

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
    if (currentPair && placements[currentPair.native.id] === 'native' && placements[currentPair.introduced.id] === 'introduced') {
      setScore(s => s + 1);
    }
  };

  const next = () => {
    setRound(r => r + 1);
    setChecked(false);
    setPlacements({});
    setSelectedWeed(null);
  };

  const restart = () => { setRound(0); setScore(0); setChecked(false); setPlacements({}); setSelectedWeed(null); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    return <LevelComplete level={level} score={score} total={QUESTIONS_PER_LEVEL} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} title={`Native or Introduced? Lv.${level}`} />;
  }

  const isCorrectZone = (weed: typeof weeds[0], zone: 'native' | 'introduced') =>
    zone === 'native' ? weed.origin === 'Native' : weed.origin === 'Introduced';

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Native or Introduced?</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{round + 1}/{levelPairs.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <p className="text-sm text-muted-foreground text-center">Sort this pair into Native or Introduced</p>

        {currentPair && (
          <div className="border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-2 font-medium">{currentPair.native.family} family</p>
            <div className="flex gap-3">
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
              <div className="flex gap-2 flex-1">
                {(['native', 'introduced'] as const).map(zone => {
                  const placed = pairWeeds.filter(w => placements[w.id] === zone);
                  return (
                    <button key={zone} onClick={() => handleDrop(zone)}
                      className={`flex-1 rounded-lg border-2 p-2 min-h-[60px] transition-all ${
                        selectedWeed ? 'border-primary bg-primary/5 cursor-pointer' : 'border-border bg-card'
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
        )}

        {allPlaced && !checked && (
          <button onClick={checkAnswers} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold mx-auto">Check Answers</button>
        )}

        {checked && currentPair && (
          <div className="text-center">
            <p className={`text-sm mb-3 ${placements[currentPair.native.id] === 'native' && placements[currentPair.introduced.id] === 'introduced' ? 'text-green-500 font-bold' : 'text-destructive font-bold'}`}>
              {placements[currentPair.native.id] === 'native' && placements[currentPair.introduced.id] === 'introduced'
                ? 'Correct!' : `${currentPair.native.commonName} is Native, ${currentPair.introduced.commonName} is Introduced`}
            </p>
            <button onClick={next} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
