import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const EFFECTS: Record<string, string> = {
  'waterhemp': 'Overtakes crop fields and resists many herbicides',
  'palmer-amaranth': 'Grows over 2 inches per day, blocking sunlight from crops',
  'kochia': 'Spreads rapidly as a tumbleweed across dry farmland',
  'johnsongrass': 'Takes over pastures and is toxic to livestock when stressed',
  'canada-thistle': 'Spreads by underground roots across meadows and fields',
  'giant-ragweed': 'Causes severe allergies and shades out crops completely',
  'marestail': 'One of the first weeds to resist glyphosate herbicide',
  'morningglory': 'Wraps around crops and pulls them down at harvest',
  'barnyardgrass': 'Steals water and nutrients from rice and corn fields',
  'large-crabgrass': 'Invades lawns and gardens, crowding out desired plants',
};

export default function InvasiveMatch({ onBack }: { onBack: () => void }) {
  const items = useMemo(() => {
    const invasive = weeds.filter(w => w.origin === 'Introduced' && EFFECTS[w.id]);
    return shuffle(invasive).slice(0, 5).map(w => ({ weed: w, effect: EFFECTS[w.id] }));
  }, []);

  const shuffledEffects = useMemo(() => shuffle(items.map(i => ({ weedId: i.weed.id, effect: i.effect }))), [items]);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedWeed, setSelectedWeed] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const handleEffectClick = (weedId: string) => {
    if (!selectedWeed || checked) return;
    setMatches(m => ({ ...m, [selectedWeed]: weedId }));
    setSelectedWeed(null);
  };

  const allMatched = Object.keys(matches).length === items.length;
  const correctCount = checked ? items.filter(i => matches[i.weed.id] === i.weed.id).length : 0;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Invasive Match</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-4 text-center">Match each invasive weed to the damage it causes</p>
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          <div className="space-y-2">
            <p className="text-xs font-bold text-foreground text-center">Invasive Weeds</p>
            {items.map(i => (
              <button key={i.weed.id} onClick={() => !checked && setSelectedWeed(i.weed.id)}
                className={`w-full py-2 px-3 rounded-lg border-2 text-sm font-medium text-left transition-all ${
                  selectedWeed === i.weed.id ? 'border-primary bg-primary/10 text-primary' :
                  matches[i.weed.id] ? 'border-primary/30 bg-primary/5 text-foreground' : 'border-border text-foreground hover:border-primary/50'
                }`}>
                {i.weed.commonName}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-foreground text-center">Negative Effects</p>
            {shuffledEffects.map(e => {
              const matchedBy = Object.entries(matches).find(([, v]) => v === e.weedId)?.[0];
              return (
                <button key={e.weedId} onClick={() => handleEffectClick(e.weedId)}
                  className={`w-full py-2 px-3 rounded-lg border-2 text-xs text-left transition-all ${
                    matchedBy ? (checked ? (matchedBy === e.weedId ? 'border-primary bg-primary/10' : 'border-destructive bg-destructive/10') : 'border-primary/30 bg-primary/5') : 
                    selectedWeed ? 'border-border hover:border-primary cursor-pointer' : 'border-border'
                  } text-foreground`}>
                  {e.effect}
                </button>
              );
            })}
          </div>
        </div>
        {allMatched && !checked && (
          <button onClick={() => setChecked(true)} className="w-full max-w-lg mx-auto block mt-4 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Matches</button>
        )}
        {checked && (
          <div className="text-center mt-4">
            <p className="text-lg font-bold text-foreground mb-3">{correctCount}/{items.length} correct!</p>
            <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
          </div>
        )}
      </div>
    </div>
  );
}
