import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from './WeedImage';

const HABITATS = [
  { id: 'warm', label: 'Warm-Season / Full Sun', icon: '☀️' },
  { id: 'cool', label: 'Cool-Season / Early Spring', icon: '❄️' },
  { id: 'wet', label: 'Wet / Poorly Drained', icon: '💧' },
  { id: 'dry', label: 'Dry / Disturbed', icon: '🏜️' },
];

const HABITAT_KEY: Record<string, string> = {
  'Warm-Season / Full Sun': 'warm',
  'Cool-Season / Early Spring': 'cool',
  'Wet / Poorly Drained': 'wet',
  'Dry / Disturbed': 'dry',
};

interface Props {
  onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
  onNext: () => void;
}

export default function HabitatDragDrop({ onComplete, onNext }: Props) {
  const items = useMemo(() => {
    const shuffled = [...weeds].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(w => ({
      weedId: w.id,
      name: w.commonName,
      correctZone: HABITAT_KEY[w.primaryHabitat],
    }));
  }, []);

  const [remaining, setRemaining] = useState<string[]>(() => items.map(i => i.weedId));
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongZone, setWrongZone] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleZoneClick = (zoneId: string) => {
    if (!selected || completed) return;
    const item = items.find(i => i.weedId === selected);
    if (!item) return;

    if (item.correctZone === zoneId) {
      const newRemaining = remaining.filter(id => id !== selected);
      setRemaining(newRemaining);
      setSelected(null);
      if (newRemaining.length === 0) {
        setCompleted(true);
        onComplete(items.map(i => ({ weedId: i.weedId, correct: true })));
      }
    } else {
      setWrongZone(zoneId);
      setSelected(null);
      setTimeout(() => setWrongZone(null), 600);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">🗺️ Habitat Sort</h2>
        <p className="text-sm text-muted-foreground">
          {completed ? 'All weeds sorted correctly!' : 'Tap a weed, then tap the habitat where it thrives.'}
        </p>
      </div>

      {/* Habitat drop zones */}
      <div className="grid grid-cols-2 gap-3">
        {HABITATS.map(h => (
          <button
            key={h.id}
            onClick={() => handleZoneClick(h.id)}
            disabled={!selected || completed}
            className={`p-4 rounded-xl border-2 text-center transition-all min-h-[80px] flex flex-col items-center justify-center gap-1
              ${wrongZone === h.id
                ? 'border-destructive bg-destructive/10'
                : 'border-border bg-muted/20'
              }
              ${selected && !completed ? 'cursor-pointer hover:bg-muted/40 hover:border-primary/50' : 'cursor-default'}
            `}
          >
            <span className="text-2xl">{h.icon}</span>
            <span className="text-xs font-bold text-foreground">{h.label}</span>
          </button>
        ))}
      </div>

      {/* Weed cards */}
      {remaining.length > 0 && !completed && (
        <div className="grid grid-cols-3 gap-3">
          {remaining.map(weedId => {
            const item = items.find(i => i.weedId === weedId)!;
            return (
              <button
                key={weedId}
                onClick={() => setSelected(selected === weedId ? null : weedId)}
                className={`p-2 rounded-lg border-2 transition-all text-center
                  ${selected === weedId ? 'border-primary bg-primary/10 scale-105' : 'border-border bg-secondary/50 hover:border-primary/50'}
                `}
              >
                <div className="w-full h-16 mb-1 overflow-hidden rounded">
                  <WeedImage weedId={weedId} stage="vegetative" className="w-full h-full" />
                </div>
                <span className="text-[10px] font-semibold text-foreground leading-tight block">{item.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {completed && (
        <div className="space-y-3 animate-scale-in">
          <div className="text-lg font-bold text-accent">✅ 3/3 Correct!</div>
          {items.map(i => {
            const habitat = HABITATS.find(h => h.id === i.correctZone);
            const weed = weeds.find(w => w.id === i.weedId);
            return (
              <div key={i.weedId} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <div className="w-14 h-14 rounded overflow-hidden shrink-0">
                  <WeedImage weedId={i.weedId} stage="vegetative" className="w-full h-full" />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm">{i.name}</span>
                  <span className="text-xs text-primary ml-2">{habitat?.icon} {habitat?.label}</span>
                  {weed && <p className="text-xs text-muted-foreground mt-0.5">{weed.habitat}</p>}
                </div>
              </div>
            );
          })}
          <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            NEXT →
          </button>
        </div>
      )}
    </div>
  );
}
