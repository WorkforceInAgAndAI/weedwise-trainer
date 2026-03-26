import { useState, useMemo, useEffect } from 'react';

export default function WeedSeedBanks({ onBack }: { onBack: () => void }) {
  const totalSeeds = 15;
  const seeds = useMemo(() =>
    Array.from({ length: totalSeeds }, (_, i) => ({
      id: i,
      x: 8 + Math.random() * 84,
      y: 8 + Math.random() * 84,
      size: 8 + Math.random() * 12,
      emoji: ['🌰', '🫘', '🟤', '⚫', '🔵'][Math.floor(Math.random() * 5)],
    })), []);

  const [found, setFound] = useState<Set<number>>(new Set());
  const [timer, setTimer] = useState(30);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (timer <= 0) { setDone(true); return; }
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, done]);

  const clickSeed = (id: number) => {
    if (done) return;
    const next = new Set(found);
    next.add(id);
    setFound(next);
    if (next.size === totalSeeds) setDone(true);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Weed Seed Banks</h1>
        <span className={`text-sm font-bold ${timer <= 5 ? 'text-destructive' : 'text-foreground'}`}>{timer}s</span>
        <span className="text-sm text-primary font-bold ml-2">{found.size}/{totalSeeds}</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        {!done ? (
          <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border-2 border-border" style={{ background: 'linear-gradient(135deg, #8B7355 0%, #A0926B 30%, #6B5B45 60%, #8B7355 100%)' }}>
            {/* Soil texture */}
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #5c4a32 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
            <p className="absolute top-2 left-0 right-0 text-center text-xs text-white/80 font-medium">Tap the seeds you find!</p>
            {seeds.map(s => (
              <button key={s.id} onClick={() => clickSeed(s.id)}
                className={`absolute transition-all duration-300 ${found.has(s.id) ? 'scale-150 opacity-50' : 'hover:scale-125'}`}
                style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: `${s.size}px`, transform: 'translate(-50%,-50%)' }}>
                {found.has(s.id) ? '✅' : s.emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{found.size === totalSeeds ? 'All Seeds Found!' : 'Time\'s Up!'}</h2>
            <p className="text-muted-foreground mb-2">You found {found.size} of {totalSeeds} seeds.</p>
            <p className="text-sm text-muted-foreground mb-6">Weed seed banks can hold thousands of seeds in the soil, waiting years to sprout!</p>
            <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
          </div>
        )}
      </div>
    </div>
  );
}
