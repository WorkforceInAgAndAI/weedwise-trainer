import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { Sun, Thermometer, Droplets, Wind } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const ZONES = [
  { id: 'hot', label: 'Hot & Sunny', Icon: Sun },
  { id: 'cold', label: 'Cool & Temperate', Icon: Thermometer },
  { id: 'wet', label: 'Wet & Moist', Icon: Droplets },
  { id: 'dry', label: 'Dry & Arid', Icon: Wind },
];

function getZone(w: typeof weeds[0]): string {
 const text = `${w.habitat} ${w.primaryHabitat}`.toLowerCase();
 if (text.match(/wet|moist|water|flood|river|aquatic|bottom/)) return 'wet';
 if (text.match(/dry|arid|drought|sandy/)) return 'dry';
 if (text.match(/cool|cold|temperate|winter/)) return 'cold';
 return 'hot';
}

export default function HabitatMapping({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
 const items = useMemo(() => {
 const byZone: Record<string, typeof weeds> = { hot: [], cold: [], wet: [], dry: [] };
 weeds.forEach(w => byZone[getZone(w)].push(w));
 const picks: { weed: typeof weeds[0]; zone: string }[] = [];
 for (const z of ZONES) {
 const zw = shuffle(byZone[z.id]).slice(0, 2);
 zw.forEach(w => picks.push({ weed: w, zone: z.id }));
 }
 return shuffle(picks).slice(0, 8);
 }, []);

 const [placements, setPlacements] = useState<Record<string, string>>({});
 const [selected, setSelected] = useState<string | null>(null);
 const [checked, setChecked] = useState(false);

 const unplaced = items.filter(i => !placements[i.weed.id]);
 const allPlaced = Object.keys(placements).length === items.length;

 const handleZone = (zoneId: string) => {
 if (!selected || checked) return;
 setPlacements(p => ({ ...p, [selected]: zoneId }));
 setSelected(null);
 };

 const handleRemove = (weedId: string) => {
 if (checked) return;
 setPlacements(p => { const n = { ...p }; delete n[weedId]; return n; });
 };

 const correctCount = checked ? items.filter(i => placements[i.weed.id] === i.zone).length : 0;

 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col">
 <div className="flex items-center gap-3 p-4 border-b border-border">
 <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
 <h1 className="font-bold text-foreground text-lg flex-1">Habitat Mapping</h1>
 </div>
 <div className="flex-1 overflow-y-auto p-4">
 <p className="text-sm text-muted-foreground mb-3 text-center">Place each weed in the habitat where it grows best</p>
 <div className="grid grid-cols-2 gap-3 mb-4">
 {ZONES.map(z => {
 const ZoneIcon = z.Icon;
 return (
 <button key={z.id} onClick={() => handleZone(z.id)}
 className={`rounded-xl border-2 border-border p-3 bg-card text-left transition-all ${selected ? 'hover:scale-[1.02] cursor-pointer' : ''}`}>
 <div className="flex items-center gap-2 mb-2">
 <ZoneIcon className="w-5 h-5 text-foreground" />
 <span className="font-bold text-foreground text-sm">{z.label}</span>
 </div>
 <div className="space-y-1 min-h-[40px]">
 {items.filter(i => placements[i.weed.id] === z.id).map(i => (
 <div key={i.weed.id} className={`flex items-center gap-1 px-2 py-1 rounded bg-background/80 text-xs font-medium ${
 checked ? (i.zone === z.id ? 'text-green-500' : 'text-destructive') : 'text-foreground'
 }`}>
 <span className="truncate flex-1">{i.weed.commonName}</span>
 {!checked && <button onClick={e => { e.stopPropagation(); handleRemove(i.weed.id); }} className="text-muted-foreground hover:text-foreground"></button>}
 </div>
 ))}
 </div>
 </button>
 );
 })}
 </div>
 {unplaced.length > 0 && (
 <div className="flex flex-wrap gap-2 justify-center mb-4">
 {unplaced.map(i => (
 <button key={i.weed.id} onClick={() => setSelected(selected === i.weed.id ? null : i.weed.id)}
 className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
 selected === i.weed.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'
 }`}>
 <div className="w-8 h-8 rounded overflow-hidden bg-secondary">
 <WeedImage weedId={i.weed.id} stage="plant" className="w-full h-full object-cover" />
 </div>
 {i.weed.commonName}
 </button>
 ))}
 </div>
 )}
 {allPlaced && !checked && (
 <button onClick={() => setChecked(true)} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
 )}
 {checked && (
 <div className="text-center mt-4">
 <p className={`text-lg font-bold mb-3 ${correctCount === items.length ? 'text-green-500' : 'text-foreground'}`}>{correctCount}/{items.length} correct!</p>
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
