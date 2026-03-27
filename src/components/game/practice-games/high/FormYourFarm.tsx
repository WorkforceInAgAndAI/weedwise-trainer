import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CROPS = [
  { id: 'corn', name: 'Corn', icon: '🌽', competitiveness: 0.7 },
  { id: 'soybean', name: 'Soybean', icon: '🫘', competitiveness: 0.4 },
  { id: 'wheat', name: 'Wheat', icon: '🌾', competitiveness: 0.6 },
];
const SEASONS = [
  { id: 'early-spring', name: 'Early Spring', factor: 0.3 },
  { id: 'late-spring', name: 'Late Spring', factor: 0.6 },
  { id: 'summer', name: 'Summer', factor: 0.9 },
];

export default function FormYourFarm({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<'design' | 'attack' | 'result'>('design');
  const [crop, setCrop] = useState(CROPS[0]);
  const [season, setSeason] = useState(SEASONS[0]);
  const [threshold, setThreshold] = useState(10);
  const [decisions, setDecisions] = useState<Record<string, 'treat' | 'wait'>>({});

  const attackWeeds = useMemo(() => shuffle(weeds).slice(0, 12).map(w => {
    const severity = Math.floor(Math.random() * 20) + 1;
    return { weed: w, severity };
  }), []);

  const startAttack = () => setPhase('attack');

  const decide = (wId: string, d: 'treat' | 'wait') => {
    setDecisions(prev => ({ ...prev, [wId]: d }));
  };

  const allDecided = Object.keys(decisions).length === attackWeeds.length;

  const evaluate = () => setPhase('result');

  const score = useMemo(() => {
    if (phase !== 'result') return 0;
    let pts = 0;
    attackWeeds.forEach(aw => {
      const shouldTreat = aw.severity > threshold;
      const canCropCompete = crop.competitiveness * (1 - season.factor) > 0.3;
      const ideal = shouldTreat && !canCropCompete ? 'treat' : aw.severity <= threshold ? 'wait' : 'treat';
      if (decisions[aw.weed.id] === ideal) pts++;
    });
    return pts;
  }, [phase, decisions]);

  const restart = () => { setPhase('design'); setDecisions({}); };

  if (phase === 'design') return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Form Your Farm</h1>
        </div>
        <p className="text-sm text-muted-foreground text-center mb-4">Design your farm, then defend it against weeds!</p>
        <div className="mb-4">
          <p className="text-sm font-bold text-foreground mb-2">Choose your crop:</p>
          <div className="flex gap-2">
            {CROPS.map(c => (
              <button key={c.id} onClick={() => setCrop(c)}
                className={`flex-1 p-3 rounded-xl border-2 text-center ${crop.id === c.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <p className="text-2xl">{c.icon}</p>
                <p className="text-xs font-bold text-foreground">{c.name}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm font-bold text-foreground mb-2">Season of weed pressure:</p>
          <div className="flex gap-2">
            {SEASONS.map(s => (
              <button key={s.id} onClick={() => setSeason(s)}
                className={`flex-1 p-3 rounded-xl border-2 text-center ${season.id === s.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <p className="text-xs font-bold text-foreground">{s.name}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <p className="text-sm font-bold text-foreground mb-2">Economic Threshold: {threshold} weeds/acre</p>
          <input type="range" min={3} max={20} value={threshold} onChange={e => setThreshold(+e.target.value)} className="w-full" />
        </div>
        <button onClick={startAttack} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Start Season!</button>
      </div>
    </div>
  );

  if (phase === 'result') return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
      <p className="text-4xl mb-2">🌾</p>
      <h2 className="font-display font-bold text-2xl text-foreground mb-2">Season Over!</h2>
      <p className="text-foreground mb-2">Correct decisions: {score} / {attackWeeds.length}</p>
      <p className="text-sm text-muted-foreground mb-6">Crop: {crop.name} · Season: {season.name} · Threshold: {threshold}/acre</p>
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
          <h1 className="font-display font-bold text-lg text-foreground">Weed Attack!</h1>
          <span className="ml-auto text-xs text-muted-foreground">Threshold: {threshold}/acre</span>
        </div>
        <p className="text-sm text-muted-foreground text-center mb-3">For each weed: treat or wait based on severity vs. your threshold of {threshold}/acre</p>
        <div className="grid gap-2">
          {attackWeeds.map(aw => (
            <div key={aw.weed.id} className="flex items-center gap-3 p-3 rounded-xl border-2 border-border bg-card">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <WeedImage weedId={aw.weed.id} stage="plant" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-foreground">{aw.weed.commonName}</p>
                <p className="text-[10px] text-muted-foreground">Density: {aw.severity}/acre</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => decide(aw.weed.id, 'treat')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${decisions[aw.weed.id] === 'treat' ? 'bg-destructive text-white' : 'bg-secondary text-foreground'}`}>Treat</button>
                <button onClick={() => decide(aw.weed.id, 'wait')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${decisions[aw.weed.id] === 'wait' ? 'bg-green-500 text-white' : 'bg-secondary text-foreground'}`}>Wait</button>
              </div>
            </div>
          ))}
        </div>
        {allDecided && <button onClick={evaluate} className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Evaluate Season</button>}
      </div>
    </div>
  );
}
