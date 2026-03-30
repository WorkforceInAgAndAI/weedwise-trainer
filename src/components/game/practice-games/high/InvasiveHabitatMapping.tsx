import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const ZONES = [
 { id: 'temperate', label: 'Temperate', icon: '', keywords: ['temperate', 'cool', 'corn', 'soybean', 'field', 'crop'] },
 { id: 'arid', label: 'Arid', icon: '', keywords: ['dry', 'arid', 'desert', 'sand', 'hot'] },
 { id: 'tropical', label: 'Tropical', icon: '', keywords: ['tropic', 'warm', 'humid', 'cotton'] },
 { id: 'wetland', label: 'Wetland', icon: 'W', keywords: ['water', 'flood', 'aquatic', 'moist', 'river', 'ditch'] },
];

function getZone(w: typeof weeds[0]) {
 const h = (w.habitat + ' ' + w.primaryHabitat).toLowerCase();
 for (const z of ZONES) if (z.keywords.some(k => h.includes(k))) return z.id;
 return 'temperate';
}

export default function InvasiveHabitatMapping({ onBack }: { onBack: () => void }) {
 const invasive = useMemo(() => shuffle(weeds.filter(w => w.origin === 'Introduced')).slice(0, 8), []);
 const items = useMemo(() => invasive.map(w => ({ weed: w, correct: getZone(w) })), []);
 const [placements, setPlacements] = useState<Record<string, string>>({});
 const [selected, setSelected] = useState<string | null>(null);
 const [checked, setChecked] = useState(false);

 const place = (zoneId: string) => { if (!selected || checked) return; setPlacements(p => ({ ...p, [selected]: zoneId })); setSelected(null); };
 const remove = (wId: string) => { if (checked) return; setPlacements(p => { const n = { ...p }; delete n[wId]; return n; }); };
 const correctCount = items.filter(it => placements[it.weed.id] === it.correct).length;
 const restart = () => { setPlacements({}); setSelected(null); setChecked(false); };

 return (
 <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
 <div className="max-w-2xl mx-auto p-4">
 <div className="flex items-center gap-3 mb-4">
 <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
 <h1 className="font-display font-bold text-lg text-foreground">Invasive Habitat Mapping</h1>
 </div>
 <p className="text-sm text-muted-foreground text-center mb-4">Place each <strong>invasive</strong> weed into the habitat it has invaded</p>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
 {ZONES.map(z => (
 <button key={z.id} onClick={() => place(z.id)}
 className={`p-3 rounded-xl border-2 text-center transition-all ${selected ? 'border-primary hover:bg-primary/10' : 'border-border'}`}>
 <p className="text-2xl">{z.icon}</p>
 <p className="text-xs font-bold text-foreground">{z.label}</p>
 <div className="mt-1 flex flex-wrap gap-1 justify-center">
 {items.filter(it => placements[it.weed.id] === z.id).map(it => (
 <span key={it.weed.id} onClick={e => { e.stopPropagation(); remove(it.weed.id); }}
 className={`text-[10px] px-1.5 py-0.5 rounded-full cursor-pointer ${checked ? (it.correct === z.id ? 'bg-green-500/20 text-green-700' : 'bg-destructive/20 text-destructive') : 'bg-secondary text-foreground'}`}>
 {it.weed.commonName} ×
 </span>
 ))}
 </div>
 </button>
 ))}
 </div>
 <div className="flex flex-wrap gap-2 mb-4">
 {items.filter(it => !placements[it.weed.id]).map(it => (
 <button key={it.weed.id} onClick={() => setSelected(selected === it.weed.id ? null : it.weed.id)}
 className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 ${selected === it.weed.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
 <div className="w-8 h-8 rounded-lg overflow-hidden"><WeedImage weedId={it.weed.id} stage="plant" className="w-full h-full object-cover" /></div>
 <span className="text-xs font-medium text-foreground">{it.weed.commonName}</span>
 </button>
 ))}
 </div>
 {!checked && Object.keys(placements).length === items.length && (
 <button onClick={() => setChecked(true)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Check Answers</button>
 )}
 {checked && (
 <div className="text-center">
 <p className="text-foreground font-bold mb-3">{correctCount}/{items.length} correct</p>
 <div className="flex gap-3 justify-center">
 <button onClick={restart} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Play Again</button>
 <button onClick={onBack} className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold">Back to Games</button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
