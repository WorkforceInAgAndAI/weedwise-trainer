import { useState, useMemo } from 'react';
import { Droplets, TreePine, Link } from 'lucide-react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface NeedItem { id: string; label: string; category: string; }

const ALL_NEEDS: NeedItem[] = [
 { id: 'standing-water', label: 'Standing water', category: 'aquatic' },
 { id: 'dissolved-nutrients', label: 'Dissolved nutrients', category: 'aquatic' },
 { id: 'underwater-light', label: 'Underwater sunlight', category: 'aquatic' },
 { id: 'soil', label: 'Soil to root in', category: 'terrestrial' },
 { id: 'rain', label: 'Rainfall', category: 'terrestrial' },
 { id: 'air-space', label: 'Open air space', category: 'terrestrial' },
 { id: 'host-plant', label: 'Host plant to attach to', category: 'parasitic' },
 { id: 'steal-nutrients', label: 'Steal nutrients from host', category: 'parasitic' },
 { id: 'special-roots', label: 'Special attachment roots', category: 'parasitic' },
];

const CATEGORIES = [
 { id: 'aquatic', label: 'Aquatic Plants', Icon: Droplets, borderColor: 'border-info/50' },
 { id: 'terrestrial', label: 'Terrestrial Plants', Icon: TreePine, borderColor: 'border-success/50' },
 { id: 'parasitic', label: 'Parasitic Plants', Icon: Link, borderColor: 'border-accent/50' },
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
 <h1 className="font-display font-bold text-foreground text-lg flex-1">Ecology Scramble</h1>
 </div>
 <div className="flex-1 overflow-y-auto p-4">
 <p className="text-sm text-muted-foreground mb-4 text-center">Sort each survival need into the correct plant type</p>

 {/* Three columns layout */}
 <div className="grid grid-cols-3 gap-3 mb-4">
 {CATEGORIES.map(cat => {
 const CatIcon = cat.Icon;
 return (
 <button key={cat.id} onClick={() => handleCatClick(cat.id)}
 className={`rounded-xl border-2 ${cat.borderColor} p-3 text-center transition-all flex flex-col items-center ${selected ? 'hover:bg-secondary cursor-pointer' : ''}`}>
 <CatIcon className="w-5 h-5 text-foreground mb-1" />
 <span className="font-bold text-foreground text-xs">{cat.label}</span>
 <div className="mt-2 space-y-1 min-h-[60px] w-full">
 {items.filter(i => placements[i.id] === cat.id).map(i => (
 <div key={i.id} className={`flex items-center justify-between gap-1 px-2 py-1 rounded text-[11px] font-medium ${
 checked ? (i.category === cat.id ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive') : 'bg-secondary text-foreground'
 }`}>
 <span className="truncate">{i.label}</span>
 {!checked && (
 <button onClick={(e) => { e.stopPropagation(); handleRemove(i.id); }} className="text-muted-foreground hover:text-foreground shrink-0"></button>
 )}
 </div>
 ))}
 </div>
 </button>
 );
 })}
 </div>

 {/* Unsorted items */}
 {unplaced.length > 0 && (
 <div className="flex flex-wrap gap-2 justify-center mb-4">
 {unplaced.map(i => (
 <button key={i.id} onClick={() => setSelected(selected === i.id ? null : i.id)}
 className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
 selected === i.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'
 }`}>
 {i.label}
 </button>
 ))}
 </div>
 )}

 {allPlaced && !checked && (
 <button onClick={() => setChecked(true)} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
 )}
 {checked && (
 <div className="text-center mt-4">
 <p className={`text-lg font-bold mb-3 ${correctCount === items.length ? 'text-success' : 'text-foreground'}`}>
 {correctCount} / {items.length} correct!
 </p>
 <div className="flex gap-3 justify-center">
 <button onClick={() => { setChecked(false); setPlacements({}); setSelected(null); }} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
 <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
