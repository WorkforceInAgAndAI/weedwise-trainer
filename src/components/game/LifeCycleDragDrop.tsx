import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from './WeedImage';

const CATEGORIES = [
  { id: 'Annual', label: 'Annual', icon: '🌱', desc: 'Complete life cycle in one season' },
  { id: 'Perennial', label: 'Perennial', icon: '🔄', desc: 'Live for multiple years' },
  { id: 'Biennial', label: 'Biennial', icon: '📅', desc: 'Two-year life cycle' },
  { id: 'Annual/Winter Annual', label: 'Winter Annual', icon: '❄️', desc: 'Germinate fall, mature spring' },
];

interface Props {
  onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
  onNext: () => void;
}

export default function LifeCycleDragDrop({ onComplete, onNext }: Props) {
  const items = useMemo(() => {
    const shuffled = [...weeds].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8).map(w => ({ weedId: w.id, name: w.commonName, correctCat: w.lifeCycle }));
  }, []);

  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const unplaced = items.filter(i => !placements[i.weedId]);

  const handleCatClick = (catId: string) => {
    if (checked || !selected) return;
    setPlacements(prev => ({ ...prev, [selected]: catId }));
    setSelected(null);
  };

  const handleRemove = (weedId: string) => {
    if (checked) return;
    setPlacements(prev => { const n = { ...prev }; delete n[weedId]; return n; });
  };

  const handleCheck = () => {
    setChecked(true);
    onComplete(items.map(i => ({ weedId: i.weedId, correct: placements[i.weedId] === i.correctCat })));
  };

  const correctCount = checked ? items.filter(i => placements[i.weedId] === i.correctCat).length : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">🔄 Life Cycle Sort</h2>
        <p className="text-sm text-muted-foreground">Tap a weed, then tap the life cycle category it belongs to.</p>
      </div>

      {/* Category bins */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORIES.map(cat => {
          const catWeeds = items.filter(i => placements[i.weedId] === cat.id);
          return (
            <button key={cat.id} onClick={() => handleCatClick(cat.id)}
              disabled={checked || !selected}
              className={`p-3 rounded-xl border-2 border-border text-left transition-all min-h-[90px] bg-secondary/30 ${selected ? 'hover:border-primary/50 cursor-pointer' : 'cursor-default'}`}>
              <div className="flex items-center gap-1 mb-1">
                <span>{cat.icon}</span>
                <span className="text-xs font-bold text-foreground">{cat.label}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mb-2">{cat.desc}</div>
              <div className="flex flex-wrap gap-1">
                {catWeeds.map(w => (
                  <span key={w.weedId} onClick={e => { e.stopPropagation(); handleRemove(w.weedId); }}
                    className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${checked
                      ? (w.correctCat === cat.id ? 'bg-accent/30 text-accent' : 'bg-destructive/30 text-destructive line-through')
                      : 'bg-foreground/10 text-foreground hover:bg-destructive/20'}`}>
                    {w.name} {!checked && '✕'}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Weed cards */}
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

      {!checked && unplaced.length === 0 && (
        <button onClick={handleCheck} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          ✅ Check Answers
        </button>
      )}

      {checked && (
        <div className="rounded-lg p-4 space-y-2 animate-scale-in border border-border bg-muted/30">
          <div className="text-lg font-bold text-foreground">{correctCount}/{items.length} Correct!</div>
          {items.filter(i => placements[i.weedId] !== i.correctCat).map(i => (
            <p key={i.weedId} className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{i.name}</span> → {i.correctCat}</p>
          ))}
          <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mt-2">NEXT →</button>
        </div>
      )}
    </div>
  );
}
