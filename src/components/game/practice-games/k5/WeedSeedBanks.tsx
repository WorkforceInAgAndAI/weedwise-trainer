import { useState, useMemo, useEffect } from 'react';
import seedBankBg from '@/assets/images/seed-bank-bg.jpg';

const SEED_TYPES = [
  { id: 'round', label: 'Round seeds' },
  { id: 'bean', label: 'Bean-shaped seeds' },
  { id: 'dark', label: 'Dark seeds' },
  { id: 'small', label: 'Tiny seeds' },
  { id: 'brown', label: 'Brown seeds' },
];

const SEED_COLORS: Record<string, string> = {
  round: 'bg-amber-700',
  bean: 'bg-amber-800',
  dark: 'bg-stone-800',
  small: 'bg-stone-600',
  brown: 'bg-amber-900',
};

export default function WeedSeedBanks({ onBack }: { onBack: () => void }) {
  const totalSeeds = 15;
  const seeds = useMemo(() =>
    Array.from({ length: totalSeeds }, (_, i) => {
      const type = SEED_TYPES[Math.floor(Math.random() * SEED_TYPES.length)];
      return {
        id: i,
        x: 8 + Math.random() * 84,
        y: 8 + Math.random() * 84,
        size: 10 + Math.random() * 8,
        type: type.id,
        label: type.label,
      };
    }), []);

  const [found, setFound] = useState<Set<number>>(new Set());
  const [timer, setTimer] = useState(30);
  const [findingDone, setFindingDone] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [sortPlacements, setSortPlacements] = useState<Record<number, string>>({});
  const [sortChecked, setSortChecked] = useState(false);
  const [done, setDone] = useState(false);

  const restart = () => {
    setFound(new Set()); setTimer(30); setFindingDone(false); setSorting(false);
    setSortPlacements({}); setSortChecked(false); setDone(false);
  };

  useEffect(() => {
    if (findingDone || done) return;
    if (timer <= 0) { setFindingDone(true); return; }
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, findingDone, done]);

  const clickSeed = (id: number) => {
    if (findingDone) return;
    const next = new Set(found);
    next.add(id);
    setFound(next);
    if (next.size === totalSeeds) setFindingDone(true);
  };

  const startSorting = () => setSorting(true);

  const foundSeeds = seeds.filter(s => found.has(s.id));
  const [selectedSeed, setSelectedSeed] = useState<number | null>(null);

  const handleBinClick = (binId: string) => {
    if (selectedSeed === null || sortChecked) return;
    setSortPlacements(p => ({ ...p, [selectedSeed]: binId }));
    setSelectedSeed(null);
  };

  const checkSort = () => setSortChecked(true);
  const sortCorrectCount = sortChecked ? foundSeeds.filter(s => sortPlacements[s.id] === s.type).length : 0;

  const foundTypes = [...new Set(foundSeeds.map(s => s.type))];
  const bins = SEED_TYPES.filter(t => foundTypes.includes(t.id));
  const allSorted = Object.keys(sortPlacements).length === foundSeeds.length;

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Complete!</h2>
        <p className="text-muted-foreground mb-2">Found {found.size} of {totalSeeds} seeds.</p>
        <p className="text-muted-foreground mb-2">Sorted {sortCorrectCount}/{foundSeeds.length} correctly.</p>
        <p className="text-sm text-muted-foreground mb-6">Weed seed banks can hold thousands of seeds in the soil, waiting years to sprout!</p>
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
        </div>
      </div>
    </div>
  );

  // Sorting phase
  if (sorting) return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Sort Your Seeds</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-4 text-center">Sort the seeds you found into similar types</p>
        <div className="grid gap-3 mb-4">
          {bins.map(bin => (
            <button key={bin.id} onClick={() => handleBinClick(bin.id)}
              className={`rounded-xl border-2 border-border p-3 text-left transition-all ${selectedSeed !== null ? 'hover:bg-secondary cursor-pointer' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full ${SEED_COLORS[bin.id]}`} />
                <span className="font-bold text-foreground text-sm">{bin.label}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {foundSeeds.filter(s => sortPlacements[s.id] === bin.id).map(s => (
                  <span key={s.id} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    sortChecked ? (s.type === bin.id ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive') : 'bg-secondary text-foreground'
                  }`}>
                    Seed #{s.id + 1}
                    {!sortChecked && <button onClick={(e) => { e.stopPropagation(); setSortPlacements(p => { const n = { ...p }; delete n[s.id]; return n; }); }} className="ml-1 text-muted-foreground hover:text-foreground">✕</button>}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
        {foundSeeds.filter(s => sortPlacements[s.id] === undefined).length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {foundSeeds.filter(s => sortPlacements[s.id] === undefined).map(s => (
              <button key={s.id} onClick={() => setSelectedSeed(selectedSeed === s.id ? null : s.id)}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedSeed === s.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}>
                <span className={`inline-block w-3 h-3 rounded-full ${SEED_COLORS[s.type]} mr-1`} />
                Seed #{s.id + 1}
              </button>
            ))}
          </div>
        )}
        {allSorted && !sortChecked && (
          <button onClick={checkSort} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Sorting</button>
        )}
        {sortChecked && (
          <div className="text-center mt-4">
            <p className={`text-lg font-bold mb-3 ${sortCorrectCount === foundSeeds.length ? 'text-success' : 'text-foreground'}`}>
              {sortCorrectCount}/{foundSeeds.length} sorted correctly!
            </p>
            <button onClick={() => setDone(true)} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">See Results</button>
          </div>
        )}
      </div>
    </div>
  );

  // Finding phase
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Weed Seed Banks</h1>
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
                {found.has(s.id) ? (
                  <div className="w-5 h-5 rounded-full bg-success/50 border-2 border-success flex items-center justify-center">
                    <span className="text-white text-[10px]">✓</span>
                  </div>
                ) : (
                  <div className={`rounded-full ${SEED_COLORS[s.type]} border border-white/30 shadow-sm`}
                    style={{ width: `${s.size}px`, height: `${s.size * 0.7}px` }} />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">{found.size === totalSeeds ? 'All Seeds Found!' : "Time's Up!"}</h2>
            <p className="text-muted-foreground mb-6">You found {found.size} of {totalSeeds} seeds. Now sort them!</p>
            <button onClick={startSorting} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Sort Seeds →</button>
          </div>
        )}
      </div>
    </div>
  );
}
