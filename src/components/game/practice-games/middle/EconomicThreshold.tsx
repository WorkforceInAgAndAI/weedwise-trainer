import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface FieldWeed {
  weed: typeof weeds[0];
  x: number;
  y: number;
}

export default function EconomicThreshold({ onBack }: { onBack: () => void }) {
  const fieldWeeds = useMemo(() => {
    const pool = shuffle(weeds).slice(0, 15);
    return pool.map(w => ({
      weed: w,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    }));
  }, []);

  const threshold = useMemo(() => Math.floor(Math.random() * 5) + 6, []); // 6-10

  const [phase, setPhase] = useState<'count' | 'graph' | 'decide' | 'result'>('count');
  const [counted, setCounted] = useState<Set<string>>(new Set());
  const [decision, setDecision] = useState<'above' | 'below' | null>(null);

  const totalWeeds = fieldWeeds.length;
  const isAbove = totalWeeds > threshold;

  const toggleCount = (id: string) => {
    if (phase !== 'count') return;
    setCounted(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const submitCount = () => {
    setPhase('graph');
  };

  const submitDecision = (d: 'above' | 'below') => {
    setDecision(d);
    setPhase('result');
  };

  const restart = () => {
    setCounted(new Set());
    setPhase('count');
    setDecision(null);
  };

  // Graph bars
  const barData = [
    { label: 'Your Count', value: counted.size, color: 'bg-primary' },
    { label: 'Threshold', value: threshold, color: 'bg-amber-500' },
  ];
  const maxVal = Math.max(counted.size, threshold, 1);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Economic Threshold</h1>
        {phase === 'count' && <span className="text-sm text-primary font-bold">{counted.size} counted</span>}
      </div>

      {phase === 'count' && (
        <div className="flex-1 flex flex-col">
          <p className="text-sm text-muted-foreground p-3 text-center">Scout the field! Tap each weed you find to count them.</p>
          <div className="flex-1 relative bg-gradient-to-b from-green-800/40 to-green-900/60 mx-4 mb-2 rounded-xl overflow-hidden border-2 border-border">
            {/* Field background texture */}
            <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-green-700/30 to-green-900/50" />
            {fieldWeeds.map(fw => (
              <button key={fw.weed.id} onClick={() => toggleCount(fw.weed.id)}
                className={`absolute transition-all ${counted.has(fw.weed.id) ? 'scale-110' : ''}`}
                style={{ left: `${fw.x}%`, top: `${fw.y}%`, transform: 'translate(-50%, -50%)' }}>
                <div className={`w-12 h-12 rounded-full overflow-hidden border-[3px] shadow-lg ${
                  counted.has(fw.weed.id) ? 'border-green-500 ring-2 ring-green-500/50' : 'border-white/80'
                }`}>
                  <WeedImage weedId={fw.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                </div>
              </button>
            ))}
          </div>
          <div className="p-4">
            <button onClick={submitCount} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">
              Done Counting ({counted.size} weeds found)
            </button>
          </div>
        </div>
      )}

      {phase === 'graph' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <h2 className="text-xl font-bold text-foreground">Your Field Survey</h2>
          <p className="text-sm text-muted-foreground text-center">You counted {counted.size} weeds. The economic threshold for this field is {threshold} weeds.</p>

          {/* Bar chart */}
          <div className="w-full max-w-sm flex items-end gap-8 justify-center h-48">
            {barData.map(bar => (
              <div key={bar.label} className="flex flex-col items-center gap-2">
                <span className="text-sm font-bold text-foreground">{bar.value}</span>
                <div className={`w-20 rounded-t-lg ${bar.color} transition-all`} style={{ height: `${(bar.value / maxVal) * 160}px` }} />
                <span className="text-xs text-muted-foreground font-medium text-center">{bar.label}</span>
              </div>
            ))}
          </div>

          {/* Threshold line visualization */}
          <div className="w-full max-w-sm bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-foreground font-bold mb-2">Is the weed population above or below the economic threshold?</p>
            <div className="flex gap-3">
              <button onClick={() => submitDecision('above')} className="flex-1 py-3 rounded-lg bg-destructive/20 text-destructive font-bold border-2 border-destructive/30 hover:bg-destructive/30">
                Above Threshold
              </button>
              <button onClick={() => submitDecision('below')} className="flex-1 py-3 rounded-lg bg-green-500/20 text-green-700 font-bold border-2 border-green-500/30 hover:bg-green-500/30">
                Below Threshold
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <div className={`text-lg font-bold ${decision === (isAbove ? 'above' : 'below') ? 'text-green-500' : 'text-destructive'}`}>
            {decision === (isAbove ? 'above' : 'below') ? 'Correct!' : 'Not quite!'}
          </div>
          <div className="bg-card border border-border rounded-xl p-4 max-w-md text-center">
            <p className="text-foreground mb-2">
              You counted <strong>{counted.size}</strong> weeds. The threshold was <strong>{threshold}</strong>.
            </p>
            <p className="text-foreground mb-2">
              The population is <strong>{isAbove ? 'above' : 'below'}</strong> the economic threshold.
            </p>
            <p className="text-sm text-muted-foreground">
              {isAbove
                ? 'When the weed population exceeds the economic threshold, the cost of damage is greater than the cost of control — action is recommended.'
                : 'When the weed population is below the threshold, the cost of control may exceed the damage — monitoring is sufficient.'}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
            <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
          </div>
        </div>
      )}
    </div>
  );
}
