import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CYCLES = ['Annual', 'Biennial', 'Perennial'] as const;

function getCycleType(w: typeof weeds[0]): string {
 const lc = w.lifeCycle.toLowerCase();
 if (lc.includes('biennial')) return 'Biennial';
 if (lc.includes('perennial')) return 'Perennial';
 return 'Annual';
}

export default function LifeCycleMatching({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
 const items = useMemo(() => {
 const byType: Record<string, typeof weeds[0][]> = { Annual: [], Biennial: [], Perennial: [] };
 weeds.forEach(w => byType[getCycleType(w)].push(w));
 const picks: { weed: typeof weeds[0]; correct: string }[] = [];
 for (const type of CYCLES) {
 shuffle(byType[type]).slice(0, 3).forEach(w => picks.push({ weed: w, correct: type }));
 }
 return shuffle(picks).slice(0, 9);
 }, []);

 const [placements, setPlacements] = useState<Record<string, string>>({});
 const [selected, setSelected] = useState<string | null>(null);
 const [checked, setChecked] = useState(false);

 const unplaced = items.filter(i => !placements[i.weed.id]);
 const allPlaced = Object.keys(placements).length === items.length;

 const handleDrop = (cycle: string) => {
 if (!selected || checked) return;
 setPlacements(p => ({ ...p, [selected]: cycle }));
 setSelected(null);
 };

 const handleRemove = (weedId: string) => {
 if (checked) return;
 setPlacements(p => { const n = { ...p }; delete n[weedId]; return n; });
 };

 const correctCount = checked ? items.filter(i => placements[i.weed.id] === i.correct).length : 0;
 const restart = () => { setPlacements({}); setSelected(null); setChecked(false); };

 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col">
 <div className="flex items-center gap-3 p-4 border-b border-border">
 <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
 <h1 className="font-bold text-foreground text-lg flex-1">Life Cycle Sort</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
 </div>
 <div className="flex-1 overflow-y-auto p-4">
 <p className="text-sm text-muted-foreground mb-3 text-center">Drag each weed into its life cycle category</p>

 {/* Three columns for Annual, Biennial, Perennial */}
 <div className="grid grid-cols-3 gap-3 mb-4">
 {CYCLES.map(cycle => {
 const placed = items.filter(i => placements[i.weed.id] === cycle);
 return (
 <button key={cycle} onClick={() => handleDrop(cycle)}
 className={`rounded-xl border-2 p-3 min-h-[160px] transition-all text-left ${
 selected ? 'border-primary bg-primary/5 cursor-pointer hover:bg-primary/10' : 'border-border bg-card'
 }`}>
 <p className="text-sm font-bold text-foreground text-center mb-2">{cycle}</p>
 <div className="space-y-2">
 {placed.map(i => (
 <div key={i.weed.id} className={`flex items-center gap-1 p-1.5 rounded-lg ${
 checked ? (i.correct === cycle ? 'bg-green-500/20 border border-green-500' : 'bg-destructive/20 border border-destructive') : 'bg-secondary'
 }`}>
 <div className="w-8 h-8 rounded overflow-hidden bg-secondary flex-shrink-0">
 <WeedImage weedId={i.weed.id} stage="vegetative" className="w-full h-full object-cover" />
 </div>
 <span className="text-[10px] font-medium text-foreground flex-1 truncate">{i.weed.commonName}</span>
 {!checked && (
 <button onClick={e => { e.stopPropagation(); handleRemove(i.weed.id); }} className="text-muted-foreground hover:text-foreground text-xs"></button>
 )}
 </div>
 ))}
 </div>
 </button>
 );
 })}
 </div>

 {/* Unplaced weeds */}
 {unplaced.length > 0 && (
 <div className="flex flex-wrap gap-2 justify-center mb-4">
 {unplaced.map(i => (
 <button key={i.weed.id} onClick={() => setSelected(selected === i.weed.id ? null : i.weed.id)}
 className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
 selected === i.weed.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'
 }`}>
 <div className="w-8 h-8 rounded overflow-hidden bg-secondary">
 <WeedImage weedId={i.weed.id} stage="vegetative" className="w-full h-full object-cover" />
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
 <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
 </div>
 )}
 </div>
 </div>
 );
}
