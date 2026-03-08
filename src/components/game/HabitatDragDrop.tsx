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
    return shuffled.slice(0, 6).map(w => ({
      weedId: w.id,
      name: w.commonName,
      correctZone: HABITAT_KEY[w.primaryHabitat],
    }));
  }, []);

  // placements: weedId -> zoneId
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const unplaced = items.filter(i => !placements[i.weedId]);
  const allPlaced = unplaced.length === 0;

  const handleZoneClick = (zoneId: string) => {
    if (checked || !selected) return;
    setPlacements(prev => ({ ...prev, [selected]: zoneId }));
    setSelected(null);
  };

  const handleRemove = (weedId: string) => {
    if (checked) return;
    setPlacements(prev => {
      const next = { ...prev };
      delete next[weedId];
      return next;
    });
  };

  const handleCheck = () => {
    setChecked(true);
    const results = items.map(i => ({
      weedId: i.weedId,
      correct: placements[i.weedId] === i.correctZone,
    }));
    onComplete(results);
  };

  const correctCount = checked
    ? items.filter(i => placements[i.weedId] === i.correctZone).length
    : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">🗺️ Habitat Sort</h2>
        <p className="text-sm text-muted-foreground">
          {checked
            ? `${correctCount}/${items.length} correct!`
            : 'Tap a weed, then tap the habitat. Place all weeds, then check answers. You can move weeds between zones before checking.'}
        </p>
      </div>

      {/* Habitat drop zones */}
      <div className="grid grid-cols-2 gap-3">
        {HABITATS.map(h => {
          const zoneWeeds = items.filter(i => placements[i.weedId] === h.id);
          return (
            <button
              key={h.id}
              onClick={() => handleZoneClick(h.id)}
              disabled={!selected || checked}
              className={`p-3 rounded-xl border-2 text-center transition-all min-h-[90px] flex flex-col items-center gap-1
                ${selected && !checked ? 'cursor-pointer hover:bg-muted/40 hover:border-primary/50' : 'cursor-default'}
                ${checked ? 'border-border' : 'border-border bg-muted/20'}
              `}
            >
              <span className="text-2xl">{h.icon}</span>
              <span className="text-xs font-bold text-foreground">{h.label}</span>
              {/* Show placed weeds in this zone */}
              <div className="flex flex-wrap gap-1 mt-1 justify-center">
                {zoneWeeds.map(w => {
                  const isCorrect = checked && w.correctZone === h.id;
                  const isWrong = checked && w.correctZone !== h.id;
                  return (
                    <div
                      key={w.weedId}
                      onClick={(e) => { e.stopPropagation(); if (!checked) handleRemove(w.weedId); }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer
                        ${isCorrect ? 'bg-accent/20 text-accent border border-accent/30' : ''}
                        ${isWrong ? 'bg-destructive/20 text-destructive border border-destructive/30' : ''}
                        ${!checked ? 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25' : ''}
                      `}
                    >
                      <div className="w-6 h-6 rounded overflow-hidden shrink-0">
                        <WeedImage weedId={w.weedId} stage="vegetative" className="w-full h-full" />
                      </div>
                      {w.name}
                      {!checked && <span className="text-muted-foreground ml-0.5">✕</span>}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Unplaced weed cards */}
      {unplaced.length > 0 && !checked && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Tap a weed to select, then tap a habitat:</p>
          <div className="grid grid-cols-3 gap-3">
            {unplaced.map(item => (
              <button
                key={item.weedId}
                onClick={() => setSelected(selected === item.weedId ? null : item.weedId)}
                className={`p-2 rounded-lg border-2 transition-all text-center
                  ${selected === item.weedId ? 'border-primary bg-primary/10 scale-105' : 'border-border bg-secondary/50 hover:border-primary/50'}
                `}
              >
                <div className="w-full h-16 mb-1 overflow-hidden rounded">
                  <WeedImage weedId={item.weedId} stage="vegetative" className="w-full h-full" />
                </div>
                <span className="text-[10px] font-semibold text-foreground leading-tight block">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Check button */}
      {allPlaced && !checked && (
        <button onClick={handleCheck} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity animate-fade-in">
          Check Answers ✓
        </button>
      )}

      {/* Results */}
      {checked && (
        <div className="space-y-3 animate-scale-in">
          <div className={`text-lg font-bold ${correctCount === items.length ? 'text-accent' : 'text-foreground'}`}>
            {correctCount === items.length ? '✅' : '📊'} {correctCount}/{items.length} Correct
          </div>
          {items.filter(i => placements[i.weedId] !== i.correctZone).map(i => {
            const correctHabitat = HABITATS.find(h => h.id === i.correctZone);
            const weed = weeds.find(w => w.id === i.weedId);
            return (
              <div key={i.weedId} className="flex gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="w-10 h-10 rounded overflow-hidden shrink-0">
                  <WeedImage weedId={i.weedId} stage="vegetative" className="w-full h-full" />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm">{i.name}</span>
                  <span className="text-xs text-accent ml-2">→ {correctHabitat?.icon} {correctHabitat?.label}</span>
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
