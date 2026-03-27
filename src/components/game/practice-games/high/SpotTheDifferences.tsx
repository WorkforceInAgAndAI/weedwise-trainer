import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const DIOECIOUS = [
  { id: 'waterhemp', name: 'Waterhemp', differences: ['Male plants have pollen-producing tassels', 'Female plants have compact seed heads', 'Male flowers are drooping clusters', 'Female stems are thicker at maturity', 'Female plants produce thousands of tiny seeds'] },
  { id: 'palmer-amaranth', name: 'Palmer Amaranth', differences: ['Male seed heads are softer and droop', 'Female seed heads are long, spiny, and rigid', 'Male plants shed pollen in wind', 'Female plants have tightly packed seeds', 'Female seed heads feel prickly to touch'] },
  { id: 'giant-ragweed', name: 'Giant Ragweed', differences: ['Male flowers are in terminal racemes', 'Female flowers are in leaf axils', 'Male flowers release abundant pollen', 'Female flowers develop into bur-like fruits', 'Male racemes are longer and more visible'] },
];

export default function SpotTheDifferences({ onBack }: { onBack: () => void }) {
  const rounds = useMemo(() => shuffle(DIOECIOUS).slice(0, 3).map(sp => {
    const spots = shuffle(sp.differences).slice(0, 5);
    return { ...sp, spots };
  }), []);

  const [rIdx, setRIdx] = useState(0);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const done = rIdx >= rounds.length;

  const current = rounds[rIdx];
  const allFound = !done && found.size >= current.spots.length;

  const clickSpot = (i: number) => {
    if (found.has(i) || allFound) return;
    const next = new Set(found);
    next.add(i);
    setFound(next);
    if (next.size >= current.spots.length) setScore(s => s + 1);
  };

  const next = () => { setRIdx(r => r + 1); setFound(new Set()); };
  const restart = () => { setRIdx(0); setFound(new Set()); setScore(0); };

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
      <p className="text-4xl mb-2">🔍</p>
      <h2 className="font-display font-bold text-2xl text-foreground mb-2">Great Eye!</h2>
      <p className="text-foreground mb-6">You completed {score} / {rounds.length} species</p>
      <div className="flex gap-3">
        <button onClick={restart} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Play Again</button>
        <button onClick={onBack} className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold">Back to Games</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Spot the Differences</h1>
          <span className="ml-auto text-sm text-muted-foreground">{rIdx + 1}/{rounds.length}</span>
        </div>

        <p className="text-center font-bold text-foreground mb-1">{current.name}</p>
        <p className="text-center text-sm text-muted-foreground mb-4">Find the differences between male ♂ and female ♀ plants</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-blue-400 bg-secondary mb-1">
              <WeedImage weedId={current.id} stage="plant" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-medium text-blue-500">♂ Male</span>
          </div>
          <div className="text-center">
            <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-pink-400 bg-secondary mb-1">
              <WeedImage weedId={current.id} stage="repro" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-medium text-pink-500">♀ Female</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-2 text-center">Tap each difference you can spot ({found.size}/{current.spots.length})</p>
        <div className="grid gap-2">
          {current.spots.map((diff, i) => (
            <button key={i} onClick={() => clickSpot(i)}
              className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${found.has(i) ? 'border-green-500 bg-green-500/20 text-green-700' : 'border-border bg-card hover:border-primary text-foreground'}`}>
              {found.has(i) ? `✓ ${diff}` : `🔍 Difference #${i + 1}`}
            </button>
          ))}
        </div>

        {allFound && <button onClick={next} className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Next Species</button>}
      </div>
    </div>
  );
}
