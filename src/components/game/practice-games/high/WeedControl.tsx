import { useState, useEffect, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import fieldBg from '@/assets/images/field-background.jpg';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const METHODS = [
  { id: 'cultivate', label: 'Cultivation' },
  { id: 'tillage', label: 'Tillage' },
  { id: 'hoe', label: 'Hoeing' },
  { id: 'pull', label: 'Hand Pull' },
  { id: 'pre', label: 'Pre-emergent Herbicide' },
  { id: 'post', label: 'Post-emergent Herbicide' },
];

function getBestMethod(w: typeof weeds[0]): string {
  const m = w.management.toLowerCase();
  if (m.includes('pre')) return 'pre';
  if (m.includes('post')) return 'post';
  if (m.includes('cultivat')) return 'cultivate';
  if (m.includes('till')) return 'tillage';
  if (m.includes('pull') || m.includes('roguing')) return 'pull';
  return 'hoe';
}

function getMethodExplanation(weed: typeof weeds[0], chosen: string, best: string): string {
  const bestLabel = METHODS.find(m => m.id === best)?.label || best;
  if (chosen === best) {
    return `Correct! ${bestLabel} is the best method for ${weed.commonName}. ${weed.management}`;
  }
  const chosenLabel = METHODS.find(m => m.id === chosen)?.label || chosen;
  return `${chosenLabel} isn't ideal here. ${bestLabel} works best for ${weed.commonName} because: ${weed.management}`;
}

export default function WeedControl({ onBack }: { onBack: () => void }) {
  const fieldWeeds = useMemo(() => shuffle(weeds).slice(0, 8).map((w, i) => ({
    weed: w, x: 15 + (i % 4) * 20 + Math.random() * 10, y: 20 + Math.floor(i / 4) * 35 + Math.random() * 15,
    best: getBestMethod(w),
  })), []);

  const [items, setItems] = useState(fieldWeeds.map(w => ({ ...w, found: false, managed: false })));
  const [active, setActive] = useState<number | null>(null);
  const [enlarged, setEnlarged] = useState(false);
  const [methodPick, setMethodPick] = useState<string | null>(null);
  const [explanation, setExplanation] = useState('');
  const [time, setTime] = useState(120);
  const [score, setScore] = useState(0);
  const done = time <= 0 || items.every(i => i.managed);

  useEffect(() => { if (done) return; const t = setInterval(() => setTime(s => s - 1), 1000); return () => clearInterval(t); }, [done]);

  const clickWeed = (idx: number) => {
    if (done || items[idx].managed) return;
    setActive(idx);
    setEnlarged(true);
    setMethodPick(null);
    setExplanation('');
  };

  const manage = (mId: string) => {
    if (active === null) return;
    const correct = mId === items[active].best;
    if (correct) setScore(s => s + 1);
    setMethodPick(mId);
    setExplanation(getMethodExplanation(items[active].weed, mId, items[active].best));
  };

  const dismissExplanation = () => {
    if (active === null) return;
    setItems(it => it.map((w, i) => i === active ? { ...w, managed: true } : w));
    setActive(null);
    setEnlarged(false);
    setMethodPick(null);
    setExplanation('');
  };

  const restart = () => { setItems(fieldWeeds.map(w => ({ ...w, found: false, managed: false }))); setActive(null); setEnlarged(false); setMethodPick(null); setExplanation(''); setTime(120); setScore(0); };

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
      <p className="text-4xl mb-2">🧑‍🌾</p>
      <h2 className="font-display font-bold text-2xl text-foreground mb-2">Field Managed!</h2>
      <p className="text-foreground mb-6">Score: {score} / {items.length}</p>
      <div className="flex gap-3">
        <button onClick={restart} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Play Again</button>
        <button onClick={onBack} className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold">Back to Games</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
        <h1 className="font-display font-bold text-lg text-foreground">Weed Control</h1>
        <span className="ml-auto text-sm font-mono text-foreground">{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <img src={fieldBg} alt="Field" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        {items.map((w, i) => !w.managed && (
          <button key={i} onClick={() => clickWeed(i)}
            className={`absolute w-14 h-14 rounded-full transition-all ${active === i ? 'scale-125 z-10' : 'animate-pulse'}`}
            style={{ left: `${w.x}%`, top: `${w.y}%` }}>
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/70 bg-secondary shadow-lg">
              <WeedImage weedId={w.weed.id} stage="plant" className="w-full h-full object-cover" />
            </div>
          </button>
        ))}
      </div>
      {active !== null && (
        <div className="bg-card border-t-2 border-border p-4">
          <div className="flex items-start gap-3 mb-3">
            {/* Enlarged weed image */}
            <div className={`rounded-xl overflow-hidden bg-secondary flex-shrink-0 transition-all ${enlarged ? 'w-24 h-24' : 'w-16 h-16'}`}>
              <WeedImage weedId={items[active].weed.id} stage="plant" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground text-lg">{items[active].weed.commonName}</p>
              <p className="text-xs italic text-muted-foreground">{items[active].weed.scientificName}</p>
            </div>
          </div>
          {!methodPick ? (
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(m => (
                <button key={m.id} onClick={() => manage(m.id)} className="px-3 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors">{m.label}</button>
              ))}
            </div>
          ) : (
            <div>
              <p className={`font-bold mb-2 ${methodPick === items[active].best ? 'text-green-500' : 'text-destructive'}`}>
                {methodPick === items[active].best ? '✓ Correct!' : '✗ Not the best choice'}
              </p>
              <p className="text-sm text-muted-foreground mb-3">{explanation}</p>
              <button onClick={dismissExplanation} className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm">Continue</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
