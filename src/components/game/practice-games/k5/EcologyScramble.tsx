import { useState, useMemo } from 'react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface NeedItem { id: string; icon: string; label: string; category: string; }

const ALL_NEEDS: NeedItem[] = [
  { id: 'standing-water', icon: '🌊', label: 'Standing water', category: 'aquatic' },
  { id: 'dissolved-nutrients', icon: '🧪', label: 'Dissolved nutrients', category: 'aquatic' },
  { id: 'underwater-light', icon: '💡', label: 'Underwater sunlight', category: 'aquatic' },
  { id: 'soil', icon: '🌍', label: 'Soil to root in', category: 'terrestrial' },
  { id: 'rain', icon: '🌧️', label: 'Rainfall', category: 'terrestrial' },
  { id: 'air-space', icon: '💨', label: 'Open air space', category: 'terrestrial' },
  { id: 'host-plant', icon: '🌱', label: 'Host plant to attach to', category: 'parasitic' },
  { id: 'steal-nutrients', icon: '🔗', label: 'Steal nutrients from host', category: 'parasitic' },
  { id: 'special-roots', icon: '🦠', label: 'Special attachment roots', category: 'parasitic' },
];

const CATEGORIES = [
  { id: 'aquatic', label: 'Aquatic Plants', icon: '💧', color: 'border-blue-400' },
  { id: 'terrestrial', label: 'Terrestrial Plants', icon: '🌿', color: 'border-green-400' },
  { id: 'parasitic', label: 'Parasitic Plants', icon: '🕸️', color: 'border-purple-400' },
];

export default function EcologyScramble({ onBack }: { onBack: () => void }) {
  const items = useMemo(() => shuffle([...ALL_NEEDS]), []);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const unplaced = items.filter(i => !placements[i.id]);
  const allPlaced = Object.keys(placements).length === items.length;

  const handleCatClick = (catId: string) => {
    if (!selected || checked) return;
    setPlacements(p => ({ ...p, [selected]: catId }));
    setSelected(null);
  };

  const handleRemove = (itemId: string) => {
    if (checked) return;
    setPlacements(p => { const n = { ...p }; delete n[itemId]; return n; });
  };

  const correctCount = checked ? items.filter(i => placements[i.id] === i.category).length : 0;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Ecology Scramble</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-4 text-center">Sort each survival need into the correct plant type</p>
        <div className="grid gap-3 mb-4">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => handleCatClick(cat.id)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${cat.color} ${selected ? 'hover:bg-secondary cursor-pointer' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{cat.icon}</span>
                <span className="font-bold text-foreground text-sm">{cat.label}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {items.filter(i => placements[i.id] === cat.id).map(i => (
                  <span key={i.id} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    checked ? (i.category === cat.id ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive') : 'bg-secondary text-foreground'
                  }`}>
                    {i.icon} {i.label}
                    {!checked && <button onClick={(e) => { e.stopPropagation(); handleRemove(i.id); }} className="ml-1 text-muted-foreground hover:text-foreground">✕</button>}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
        {unplaced.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {unplaced.map(i => (
              <button key={i.id} onClick={() => setSelected(selected === i.id ? null : i.id)}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selected === i.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}>
                {i.icon} {i.label}
              </button>
            ))}
          </div>
        )}
        {allPlaced && !checked && (
          <button onClick={() => setChecked(true)} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
        )}
        {checked && (
          <div className="text-center mt-4">
            <p className={`text-lg font-bold mb-3 ${correctCount === items.length ? 'text-primary' : 'text-foreground'}`}>
              {correctCount} / {items.length} correct!
            </p>
            <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
          </div>
        )}
      </div>
    </div>
  );
}
