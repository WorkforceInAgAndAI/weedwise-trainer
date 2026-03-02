import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from './WeedImage';

const HABITATS = [
  { id: 'warm', label: 'Warm-Season / Full Sun', icon: '☀️', desc: 'Summer annuals thriving in hot, sunny conditions' },
  { id: 'cool', label: 'Cool-Season / Early Spring', icon: '❄️', desc: 'Winter annuals & biennials active early or late in the season' },
  { id: 'wet', label: 'Wet / Poorly Drained', icon: '💧', desc: 'Floodplains, ditches, stream banks & saturated soils' },
  { id: 'dry', label: 'Dry / Disturbed', icon: '🏜️', desc: 'Compacted, drought-tolerant, roadsides & waste areas' },
];

const HABITAT_KEY: Record<string, string> = {
  'Warm-Season / Full Sun': 'warm',
  'Cool-Season / Early Spring': 'cool',
  'Wet / Poorly Drained': 'wet',
  'Dry / Disturbed': 'dry',
};

const ZONE_STYLES: Record<string, string> = {
  warm: 'bg-orange-900/20 border-orange-600/60 hover:bg-orange-900/30',
  cool: 'bg-sky-900/20 border-sky-600/60 hover:bg-sky-900/30',
  wet: 'bg-blue-900/20 border-blue-600/60 hover:bg-blue-900/30',
  dry: 'bg-amber-900/20 border-amber-600/60 hover:bg-amber-900/30',
};

interface Props {
  onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
  onNext: () => void;
}

export default function HabitatDragDrop({ onComplete, onNext }: Props) {
  const items = useMemo(() => {
    const shuffled = [...weeds].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8).map(w => ({
      weedId: w.id, name: w.commonName,
      correctZone: HABITAT_KEY[w.primaryHabitat],
    }));
  }, []);

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
    setPlacements(prev => { const n = { ...prev }; delete n[weedId]; return n; });
  };

  const handleCheck = () => {
    setChecked(true);
    onComplete(items.map(i => ({ weedId: i.weedId, correct: placements[i.weedId] === i.correctZone })));
  };

  const correctCount = checked ? items.filter(i => placements[i.weedId] === i.correctZone).length : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">🗺️ Habitat Sort</h2>
        <p className="text-sm text-muted-foreground">Tap a weed below, then tap the climate/ecosystem zone where it thrives.</p>
      </div>

      {/* Habitat zones */}
      <div className="grid grid-cols-2 gap-3">
        {HABITATS.map(h => {
          const zoneWeeds = items.filter(i => placements[i.weedId] === h.id);
          return (
            <button key={h.id} onClick={() => handleZoneClick(h.id)}
              disabled={checked || !selected}
              className={`p-3 rounded-xl border-2 text-left transition-all min-h-[110px] ${ZONE_STYLES[h.id]} ${selected ? 'cursor-pointer ring-1 ring-primary/30' : 'cursor-default'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{h.icon}</span>
                <span className="text-xs font-bold text-foreground">{h.label}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mb-2">{h.desc}</div>
              <div className="flex flex-wrap gap-1">
                {zoneWeeds.map(w => (
                  <span key={w.weedId} onClick={e => { e.stopPropagation(); handleRemove(w.weedId); }}
                    className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${checked
                      ? (w.correctZone === h.id ? 'bg-accent/30 text-accent' : 'bg-destructive/30 text-destructive line-through')
                      : 'bg-foreground/10 text-foreground hover:bg-destructive/20'}`}>
                    {w.name} {!checked && '✕'}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Weed cards to place */}
      {unplaced.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {unplaced.map(item => (
            <button key={item.weedId} onClick={() => setSelected(selected === item.weedId ? null : item.weedId)}
              className={`p-2 rounded-lg border-2 transition-all text-center ${selected === item.weedId ? 'border-primary bg-primary/10 scale-105' : 'border-border bg-secondary/50 hover:border-primary/50'}`}>
              <div className="w-full h-14 mb-1 overflow-hidden rounded">
                <WeedImage weedId={item.weedId} stage="vegetative" className="w-full h-full" />
              </div>
              <span className="text-[10px] font-semibold text-foreground leading-tight block">{item.name}</span>
            </button>
          ))}
        </div>
      )}

      {!checked && allPlaced && (
        <button onClick={handleCheck} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          ✅ Check Answers
        </button>
      )}

      {checked && (
        <div className="rounded-lg p-4 space-y-3 animate-scale-in border border-border bg-muted/30">
          <div className="text-lg font-bold text-foreground">{correctCount}/{items.length} Correct!</div>
          {items.filter(i => placements[i.weedId] !== i.correctZone).map(i => {
            const correct = HABITATS.find(h => h.id === i.correctZone);
            return <p key={i.weedId} className="text-sm text-muted-foreground"><span className="text-foreground font-semibold">{i.name}</span> → {correct?.label}</p>;
          })}
          <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">NEXT →</button>
        </div>
      )}
    </div>
  );
}
